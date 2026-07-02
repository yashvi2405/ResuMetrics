from fastapi import APIRouter, Depends, HTTPException
from datetime import datetime, timedelta
from app.database.db_manager import get_db
from app.models.user import User
from app.models.resume import Resume
from app.models.analysis_result import AnalysisResult
from app.models.extracted_data import ExtractedData
from app.routes.auth import get_current_user
from typing import Dict, List, Any

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])

@router.get("/stats")
async def get_dashboard_stats(
    current_user: User = Depends(get_current_user),
    db = Depends(get_db)
):
    """Get dashboard statistics for the current user"""
    
    # Get all user resumes
    resumes_cursor = db["resumes"].find({"user_id": current_user.user_id})
    user_resumes = await resumes_cursor.to_list(None)
    total_resumes = len(user_resumes)
    
    resume_ids = [r["resume_id"] for r in user_resumes]
    
    if not resume_ids:
        avg_score = 0
        recent_analyses = 0
        best_resume = None
        score_trends = []
        all_skills = []
    else:
        # Average score
        pipeline = [
            {"$match": {"resume_id": {"$in": resume_ids}}},
            {"$group": {"_id": None, "avg_score": {"$avg": "$resume_score"}}}
        ]
        cursor = db["analysis_results"].aggregate(pipeline)
        agg_result = await cursor.to_list(1)
        avg_score = agg_result[0]["avg_score"] if agg_result else 0
        
        # Recent analyses (last 30 days)
        thirty_days_ago = datetime.utcnow() - timedelta(days=30)
        recent_analyses = await db["analysis_results"].count_documents({
            "resume_id": {"$in": resume_ids},
            "analysis_timestamp": {"$gte": thirty_days_ago}
        })
        
        # Best performing resume
        best_analysis_list = await db["analysis_results"].find(
            {"resume_id": {"$in": resume_ids}}
        ).sort("resume_score", -1).to_list(1)
        
        if best_analysis_list:
            best_analysis = best_analysis_list[0]
            best_res = next((r for r in user_resumes if r["resume_id"] == best_analysis["resume_id"]), None)
            best_resume = (best_analysis["resume_id"], best_res["resume_file_name"] if best_res else "Unknown", best_analysis["resume_score"])
        else:
            best_resume = None
            
        # Score trends over time
        trends = await db["analysis_results"].find(
            {"resume_id": {"$in": resume_ids}}
        ).sort("analysis_timestamp", 1).to_list(None)
        
        score_trends = []
        for t in trends:
            res = next((r for r in user_resumes if r["resume_id"] == t["resume_id"]), None)
            if res:
                score_trends.append((t["analysis_timestamp"], t["resume_score"], res["resume_file_name"]))
                
        # Skill distribution
        extracted_docs = await db["extracted_data"].find(
            {"resume_id": {"$in": resume_ids}}
        ).to_list(None)
        all_skills = [e["skills"] for e in extracted_docs if e.get("skills")]
        
    # Process skills
    skill_counts = {}
    for skills_str in all_skills:
        if skills_str:
            skills_list = skills_str.split(', ')
            for skill in skills_list:
                skill_counts[skill] = skill_counts.get(skill, 0) + 1
                
    # Sort skills by frequency
    top_skills = sorted(skill_counts.items(), key=lambda x: x[1], reverse=True)[:10]
    
    return {
        "total_resumes": total_resumes,
        "average_score": round(avg_score, 2) if avg_score else 0,
        "recent_analyses": recent_analyses,
        "best_resume": {
            "id": best_resume[0],
            "name": best_resume[1],
            "score": round(best_resume[2], 2)
        } if best_resume else None,
        "score_trends": [
            {
                "date": trend[0].isoformat(),
                "score": round(trend[1], 2),
                "resume_name": trend[2]
            }
            for trend in score_trends
        ],
        "top_skills": [
            {"skill": skill, "count": count}
            for skill, count in top_skills
        ]
    }

@router.get("/recent-activities")
async def get_recent_activities(
    limit: int = 10,
    current_user: User = Depends(get_current_user),
    db = Depends(get_db)
):
    """Get recent user activities"""
    
    activities = []
    
    # Recent resume uploads
    recent_uploads_cursor = db["resumes"].find({"user_id": current_user.user_id}).sort("upload_date", -1).limit(limit)
    recent_uploads = await recent_uploads_cursor.to_list(None)
    
    for upload in recent_uploads:
        activities.append({
            "type": "upload",
            "resume_id": upload["resume_id"],
            "resume_name": upload["resume_file_name"],
            "timestamp": upload["upload_date"].isoformat(),
            "message": f"Uploaded resume: {upload['resume_file_name']}"
        })
    
    # Recent analyses
    all_user_resumes = await db["resumes"].find({"user_id": current_user.user_id}).to_list(None)
    all_resume_ids = [r["resume_id"] for r in all_user_resumes]
    
    if all_resume_ids:
        recent_analyses_cursor = db["analysis_results"].find(
            {"resume_id": {"$in": all_resume_ids}}
        ).sort("analysis_timestamp", -1).limit(limit)
        recent_analyses = await recent_analyses_cursor.to_list(None)
        
        for analysis in recent_analyses:
            resume = next((r for r in all_user_resumes if r["resume_id"] == analysis["resume_id"]), None)
            if resume:
                activities.append({
                    "type": "analysis",
                    "resume_id": analysis["resume_id"],
                    "resume_name": resume["resume_file_name"],
                    "score": round(analysis["resume_score"], 2),
                    "timestamp": analysis["analysis_timestamp"].isoformat(),
                    "message": f"Analyzed resume: {resume['resume_file_name']} (Score: {round(analysis['resume_score'], 2)})"
                })
                
    # Sort by timestamp and limit
    activities.sort(key=lambda x: x["timestamp"], reverse=True)
    return activities[:limit]

@router.get("/performance-metrics")
async def get_performance_metrics(
    current_user: User = Depends(get_current_user),
    db = Depends(get_db)
):
    """Get detailed performance metrics"""
    
    # Get all user resumes
    user_resumes = await db["resumes"].find({"user_id": current_user.user_id}).to_list(None)
    resume_ids = [r["resume_id"] for r in user_resumes]
    
    if not resume_ids:
        return {
            "average_scores": {
                "overall": 0,
                "ats": 0,
                "skill_match": 0,
                "keyword": 0
            },
            "best_score": 0,
            "worst_score": 0,
            "improvement_rate": 0,
            "total_analyses": 0
        }
        
    analyses = await db["analysis_results"].find({"resume_id": {"$in": resume_ids}}).to_list(None)
    
    if not analyses:
        return {
            "average_scores": {
                "overall": 0,
                "ats": 0,
                "skill_match": 0,
                "keyword": 0
            },
            "best_score": 0,
            "worst_score": 0,
            "improvement_rate": 0,
            "total_analyses": 0
        }
        
    # Calculate averages
    avg_overall = sum(a["resume_score"] for a in analyses) / len(analyses)
    avg_ats = sum(a["ats_compatibility_score"] for a in analyses) / len(analyses)
    avg_skill = sum(a["skill_match_percentage"] for a in analyses) / len(analyses)
    avg_keyword = sum(a["keyword_relevance_score"] for a in analyses) / len(analyses)
    
    # Best and worst scores
    best_score = max(a["resume_score"] for a in analyses)
    worst_score = min(a["resume_score"] for a in analyses)
    
    # Calculate improvement rate (if multiple analyses)
    improvement_rate = 0
    if len(analyses) > 1:
        # Sort analyses by analysis_timestamp
        sorted_analyses = sorted(analyses, key=lambda x: x["analysis_timestamp"])
        first_score = sorted_analyses[0]["resume_score"]
        last_score = sorted_analyses[-1]["resume_score"]
        if first_score > 0:
            improvement_rate = ((last_score - first_score) / first_score) * 100
            
    return {
        "average_scores": {
            "overall": round(avg_overall, 2),
            "ats": round(avg_ats, 2),
            "skill_match": round(avg_skill, 2),
            "keyword": round(avg_keyword, 2)
        },
        "best_score": round(best_score, 2),
        "worst_score": round(worst_score, 2),
        "improvement_rate": round(improvement_rate, 2),
        "total_analyses": len(analyses)
    }

@router.get("/skill-gaps")
async def get_skill_gaps(
    current_user: User = Depends(get_current_user),
    db = Depends(get_db)
):
    """Identify skill gaps across all resumes"""
    
    # Get all user resumes
    user_resumes = await db["resumes"].find({"user_id": current_user.user_id}).to_list(None)
    resume_ids = [r["resume_id"] for r in user_resumes]
    
    if not resume_ids:
        return {
            "user_skills": [],
            "missing_skills": {
                "technical": [],
                "soft": [],
                "data": []
            },
            "recommendations": [],
            "skill_coverage": {
                "technical": 0,
                "soft": 0,
                "data": 0
            }
        }
        
    # Get all skills from user's resumes
    extracted_docs = await db["extracted_data"].find({"resume_id": {"$in": resume_ids}}).to_list(None)
    
    # Common industry skills (can be customized)
    industry_skills = {
        "technical": ["python", "java", "sql", "javascript", "react", "node.js", "aws", "docker"],
        "soft": ["leadership", "communication", "teamwork", "problem solving", "project management"],
        "data": ["machine learning", "data analysis", "statistics", "pandas", "tensorflow"]
    }
    
    # Extract user skills
    user_skills = set()
    for doc in extracted_docs:
        if doc.get("skills"):
            skills_list = [s.lower().strip() for s in doc["skills"].split(', ')]
            user_skills.update(skills_list)
            
    # Find missing skills
    missing_skills = {
        "technical": [skill for skill in industry_skills["technical"] if skill not in user_skills],
        "soft": [skill for skill in industry_skills["soft"] if skill not in user_skills],
        "data": [skill for skill in industry_skills["data"] if skill not in user_skills]
    }
    
    # Recommendations based on missing skills
    recommendations = []
    if missing_skills["technical"]:
        recommendations.append(f"Add technical skills: {', '.join(missing_skills['technical'][:5])}")
    if missing_skills["soft"]:
        recommendations.append(f"Highlight soft skills: {', '.join(missing_skills['soft'][:3])}")
    if missing_skills["data"]:
        recommendations.append(f"Include data skills: {', '.join(missing_skills['data'][:3])}")
        
    return {
        "user_skills": list(user_skills)[:20],
        "missing_skills": missing_skills,
        "recommendations": recommendations,
        "skill_coverage": {
            "technical": len([s for s in industry_skills["technical"] if s in user_skills]) / len(industry_skills["technical"]) * 100,
            "soft": len([s for s in industry_skills["soft"] if s in user_skills]) / len(industry_skills["soft"]) * 100,
            "data": len([s for s in industry_skills["data"] if s in user_skills]) / len(industry_skills["data"]) * 100
        }
    }

@router.delete("/resume/{resume_id}")
async def delete_resume(
    resume_id: int,
    current_user: User = Depends(get_current_user),
    db = Depends(get_db)
):
    """Delete a resume and all associated data"""
    
    # Check if resume exists and belongs to user
    resume = await db["resumes"].find_one({
        "resume_id": resume_id,
        "user_id": current_user.user_id
    })
    
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")
        
    # Delete associated data
    await db["extracted_data"].delete_many({"resume_id": resume_id})
    await db["analysis_results"].delete_many({"resume_id": resume_id})
    await db["feedbacks"].delete_many({"resume_id": resume_id})
    await db["resumes"].delete_one({"resume_id": resume_id})
    
    return {"message": "Resume deleted successfully"}