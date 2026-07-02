import re
from typing import List, Dict
from collections import Counter

class KeywordExtractor:
    def __init__(self):
        self.stop_words = {
            'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for', 'from', 'has', 'he',
            'in', 'is', 'it', 'its', 'of', 'on', 'that', 'the', 'to', 'was', 'were',
            'will', 'with', 'i', 'you', 'we', 'they', 'them', 'their', 'our', 'your'
        }
        
    def extract_keywords(self, text: str, top_n: int = 20) -> List[str]:
        """Extract important keywords from text"""
        
        # Convert to lowercase and split into words
        words = re.findall(r'\b[a-z]{3,}\b', text.lower())
        
        # Remove stop words
        words = [word for word in words if word not in self.stop_words]
        
        # Count frequencies
        word_freq = Counter(words)
        
        # Get top N keywords
        keywords = [word for word, _ in word_freq.most_common(top_n)]
        
        return keywords
    
    def extract_technical_keywords(self, text: str) -> List[str]:
        """Extract technical keywords specifically"""
        
        technical_patterns = [
            r'\b(python|java|javascript|react|angular|vue|node\.?js)\b',
            r'\b(sql|mongodb|postgresql|mysql|oracle|database)\b',
            r'\b(aws|azure|gcp|cloud|docker|kubernetes|jenkins)\b',
            r'\b(machine\s+learning|ai|artificial\s+intelligence|deep\s+learning)\b',
            r'\b(data\s+science|analytics|big\s+data|hadoop|spark)\b',
            r'\b(agile|scrum|kanban|jira|confluence)\b',
            r'\b(html|css|sass|less|bootstrap|tailwind)\b',
            r'\b(flask|django|fastapi|spring|express)\b'
        ]
        
        technical_skills = set()
        for pattern in technical_patterns:
            matches = re.findall(pattern, text.lower())
            technical_skills.update(matches)
        
        return list(technical_skills)
    
    def calculate_keyword_relevance(self, text: str, target_role: str = "software_engineer") -> float:
        """Calculate keyword relevance score based on target role"""
        
        role_keywords = {
            "software_engineer": ["python", "java", "javascript", "sql", "git", "agile", "react"],
            "data_scientist": ["python", "sql", "machine learning", "statistics", "pandas", "tensorflow"],
            "devops_engineer": ["docker", "kubernetes", "aws", "ci/cd", "linux", "terraform"],
            "frontend_dev": ["react", "javascript", "html", "css", "angular", "vue"],
            "backend_dev": ["python", "java", "node.js", "sql", "rest api", "microservices"]
        }
        
        keywords = role_keywords.get(target_role, role_keywords["software_engineer"])
        text_lower = text.lower()
        
        found_keywords = sum(1 for keyword in keywords if keyword in text_lower)
        relevance_score = (found_keywords / len(keywords)) * 100
        
        return round(relevance_score, 2)