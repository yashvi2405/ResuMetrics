from typing import Dict, List
import numpy as np

class ScoringService:
    def __init__(self):
        self.job_roles = {
            'software_engineer': ['python', 'java', 'sql', 'git', 'agile', 'javascript'],
            'data_scientist': ['python', 'sql', 'machine learning', 'statistics', 'pandas', 'tensorflow'],
            'devops_engineer': ['docker', 'kubernetes', 'aws', 'ci/cd', 'linux', 'terraform'],
            'frontend_dev': ['react', 'javascript', 'html', 'css', 'angular', 'vue.js']
        }
    
    def calculate_resume_score(self, skills: List[str], experience: str, education: str, 
                               ats_score: float, keyword_score: float) -> float:
        """Calculate overall resume score"""
        skill_score = self._calculate_skill_score(skills)
        exp_score = self._calculate_experience_score(experience)
        edu_score = self._calculate_education_score(education)
        
        # Weighted average
        total_score = (skill_score * 0.35 + exp_score * 0.30 + 
                      edu_score * 0.20 + ats_score * 0.15)
        
        return round(total_score, 2)
    
    def _calculate_skill_score(self, skills: List[str]) -> float:
        """Calculate skill relevance score"""
        if not skills:
            return 0
        # Assuming 10+ skills is perfect score
        base_score = min(len(skills) * 10, 100)
        return base_score
    
    def _calculate_experience_score(self, experience: str) -> float:
        """Calculate experience score"""
        if not experience:
            return 0
        
        # Extract years of experience
        import re
        years_pattern = r'(\d+)\+?\s*years?'
        matches = re.findall(years_pattern, experience, re.IGNORECASE)
        
        if matches:
            years = int(matches[0])
            return min(years * 10, 100)
        
        # If no years mentioned, give partial score
        return 50 if len(experience) > 50 else 25
    
    def _calculate_education_score(self, education: str) -> float:
        """Calculate education score"""
        if not education:
            return 0
        
        education_levels = {
            'phd': 100,
            'master': 90,
            'bachelor': 80,
            'diploma': 60,
            'certification': 50
        }
        
        edu_lower = education.lower()
        for level, score in education_levels.items():
            if level in edu_lower:
                return score
        
        return 40
    
    def generate_improvement_suggestions(self, resume_data: Dict) -> List[str]:
        """Generate personalized improvement suggestions"""
        suggestions = []
        
        # Skill-based suggestions
        if len(resume_data.get('skills', [])) < 5:
            suggestions.append("Add more relevant technical skills to improve your profile visibility")
        
        # Experience suggestions
        if not resume_data.get('experience'):
            suggestions.append("Include detailed work experience with specific achievements and metrics")
        
        # ATS suggestions
        if resume_data.get('ats_score', 0) < 60:
            suggestions.append("Optimize your resume for ATS by including standard section headings and relevant keywords")
        
        # Formatting suggestions
        if resume_data.get('formatting_score', 0) < 50:
            suggestions.append("Use bullet points and consistent formatting to improve readability")
        
        # Keyword suggestions
        if resume_data.get('keyword_score', 0) < 50:
            suggestions.append("Include more industry-specific keywords relevant to your target role")
        
        # Action verbs
        suggestions.append("Use strong action verbs to describe your accomplishments (e.g., 'achieved', 'implemented', 'developed')")
        
        # Quantifiable achievements
        suggestions.append("Include quantifiable achievements with numbers and percentages to demonstrate impact")
        
        return suggestions