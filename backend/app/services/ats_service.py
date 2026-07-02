import re
from typing import Dict, List

class ATSService:
    def __init__(self):
        self.common_keywords = [
            'leadership', 'communication', 'teamwork', 'problem solving',
            'project management', 'analytical', 'organization', 'time management',
            'creative', 'adaptability', 'critical thinking', 'collaboration'
        ]
        
    def calculate_ats_score(self, text: str, extracted_keywords: List[str]) -> float:
        """Calculate ATS compatibility score"""
        score = 0.0
        text_lower = text.lower()
        
        # Check for standard sections (30% weight)
        required_sections = ['education', 'experience', 'skills']
        section_score = 0
        for section in required_sections:
            if section in text_lower:
                section_score += 33.33
        score += section_score * 0.3
        
        # Check for keyword density (40% weight)
        total_words = len(text_lower.split())
        if total_words > 0:
            keyword_count = sum(1 for keyword in extracted_keywords if keyword.lower() in text_lower)
            keyword_density = (keyword_count / len(extracted_keywords)) * 100 if extracted_keywords else 0
            score += min(keyword_density, 100) * 0.4
        
        # Check for formatting and structure (30% weight)
        formatting_score = self._check_formatting(text)
        score += formatting_score * 0.3
        
        return round(min(score, 100), 2)
    
    def _check_formatting(self, text: str) -> float:
        """Check for good formatting practices"""
        score = 0
        
        # Check for bullet points
        if re.search(r'[•·▪‣●○◆◘◦➢➣➤]', text):
            score += 25
        
        # Check for consistent date formatting
        date_patterns = r'\d{4}\s*[-–]\s*(?:present|\d{4})'
        if re.search(date_patterns, text, re.IGNORECASE):
            score += 25
        
        # Check for action verbs
        action_verbs = ['achieved', 'implemented', 'developed', 'managed', 'created', 'led', 'improved']
        if any(verb in text.lower() for verb in action_verbs):
            score += 25
        
        # Check for quantifiable achievements
        if re.search(r'\d+%|\d+\s*(?:years?|months?)', text):
            score += 25
        
        return score