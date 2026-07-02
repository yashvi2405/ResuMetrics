from fastapi import APIRouter, Depends, HTTPException
from datetime import datetime
from app.database.db_manager import get_db, get_next_sequence_value
from app.models.user import User
from app.models.resume import Resume
from app.models.extracted_data import ExtractedData
from app.models.analysis_result import AnalysisResult
from app.models.feedback import Feedback
from app.routes.auth import get_current_user
from app.services.resume_parser import ResumeParser
from app.services.scoring_service import ScoringService
from app.services.ats_service import ATSService

router = APIRouter(prefix="/api/analysis", tags=["resume analysis"])
parser = ResumeParser()
scoring_service = ScoringService()
ats_service = ATSService()

@router.post("/analyze/{resume_id}")
async def analyze_resume(
    resume_id: int,
    current_user: User = Depends(get_current_user),
    db = Depends(get_db)
):
    # Get resume
    resume_doc = await db["resumes"].find_one({
        "resume_id": resume_id,
        "user_id": current_user.user_id
    })
    
    if not resume_doc:
        raise HTTPException(status_code=404, detail="Resume not found")
    
    resume = Resume(**resume_doc)
    
    # Extract text from resume
    resume_text = parser.extract_text(resume.resume_path, resume.file_format)
    
    # Extract data
    skills = parser.extract_skills(resume_text)
    education = parser.extract_education(resume_text)
    experience = parser.extract_experience(resume_text)
    keywords = parser.extract_keywords(resume_text)
    
    # Save extracted data
    data_id = await get_next_sequence_value("data_id")
    extracted_data_doc = {
        "data_id": data_id,
        "resume_id": resume_id,
        "skills": ", ".join(skills),
        "education_details": education,
        "work_experience": experience,
        "certifications": "",
        "projects": "",
        "extracted_keywords": ", ".join(keywords[:15])
    }
    await db["extracted_data"].insert_one(extracted_data_doc)
    
    # Calculate scores
    keyword_relevance_score = min(len(keywords) * 5, 100)
    ats_score = ats_service.calculate_ats_score(resume_text, keywords)
    
    # Calculate skill match percentage
    skill_match = min(len(skills) * 10, 100)
    
    # Calculate overall resume score
    resume_score = scoring_service.calculate_resume_score(
        skills, experience, education, ats_score, keyword_relevance_score
    )
    
    # Save analysis results
    result_id = await get_next_sequence_value("result_id")
    analysis_result_doc = {
        "result_id": result_id,
        "resume_id": resume_id,
        "resume_score": resume_score,
        "skill_match_percentage": skill_match,
        "ats_compatibility_score": ats_score,
        "keyword_relevance_score": keyword_relevance_score,
        "analysis_timestamp": datetime.utcnow()
    }
    await db["analysis_results"].insert_one(analysis_result_doc)
    
    # Generate feedback
    resume_data = {
        "skills": skills,
        "experience": experience,
        "education": education,
        "ats_score": ats_score,
        "formatting_score": ats_service._check_formatting(resume_text),
        "keyword_score": keyword_relevance_score
    }
    
    suggestions = scoring_service.generate_improvement_suggestions(resume_data)
    
    # Save feedback
    feedback_id = await get_next_sequence_value("feedback_id")
    feedback_doc = {
        "feedback_id": feedback_id,
        "resume_id": resume_id,
        "improvement_suggestions": "; ".join(suggestions[:5]),
        "formatting_suggestions": "; ".join(suggestions[5:7]) if len(suggestions) > 5 else "",
        "skill_gap_details": "Focus on adding in-demand skills relevant to your target role",
        "recommendation_level": "High Priority" if resume_score < 70 else "Medium Priority" if resume_score < 85 else "Low Priority"
    }
    await db["feedbacks"].insert_one(feedback_doc)
    
    return {
        "resume_score": resume_score,
        "skill_match_percentage": skill_match,
        "ats_compatibility_score": ats_score,
        "keyword_relevance_score": keyword_relevance_score,
        "skills_found": skills,
        "improvement_suggestions": suggestions[:5]
    }

@router.get("/results/{resume_id}")
async def get_analysis_results(
    resume_id: int,
    current_user: User = Depends(get_current_user),
    db = Depends(get_db)
):
    # Verify resume ownership
    resume_doc = await db["resumes"].find_one({
        "resume_id": resume_id,
        "user_id": current_user.user_id
    })
    
    if not resume_doc:
        raise HTTPException(status_code=404, detail="Resume not found")
    
    # Get analysis results
    analysis_doc = await db["analysis_results"].find_one({"resume_id": resume_id})
    extracted_doc = await db["extracted_data"].find_one({"resume_id": resume_id})
    feedback_doc = await db["feedbacks"].find_one({"resume_id": resume_id})
    
    if not analysis_doc:
        raise HTTPException(status_code=404, detail="Analysis not found")
    
    return {
        "analysis": {
            "resume_score": analysis_doc["resume_score"],
            "skill_match_percentage": analysis_doc["skill_match_percentage"],
            "ats_compatibility_score": analysis_doc["ats_compatibility_score"],
            "keyword_relevance_score": analysis_doc["keyword_relevance_score"]
        },
        "extracted_data": {
            "skills": extracted_doc["skills"] if extracted_doc else "",
            "education": extracted_doc["education_details"] if extracted_doc else "",
            "experience": extracted_doc["work_experience"] if extracted_doc else "",
            "keywords": extracted_doc["extracted_keywords"] if extracted_doc else ""
        },
        "feedback": {
            "improvement_suggestions": feedback_doc["improvement_suggestions"] if feedback_doc else "",
            "formatting_suggestions": feedback_doc["formatting_suggestions"] if feedback_doc else "",
            "recommendation_level": feedback_doc["recommendation_level"] if feedback_doc else ""
        }
    }