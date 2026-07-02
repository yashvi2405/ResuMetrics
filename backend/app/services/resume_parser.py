import PyPDF2
import docx
import re
from typing import Dict, List
import nltk
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize

nltk.download('punkt', quiet=True)
nltk.download('stopwords', quiet=True)

class ResumeParser:
    def __init__(self):
        self.stop_words = set(stopwords.words('english'))
        self.skill_keywords = [
            'python', 'java', 'javascript', 'sql', 'aws', 'docker', 'kubernetes',
            'react', 'angular', 'node.js', 'django', 'flask', 'machine learning',
            'ai', 'data science', 'agile', 'scrum', 'git', 'rest api', 'html', 'css'
        ]
        
    def extract_text(self, file_path: str, file_format: str) -> str:
        """Extract text from PDF or DOCX files"""
        if file_format.lower() == '.pdf':
            return self._extract_from_pdf(file_path)
        elif file_format.lower() == '.docx':
            return self._extract_from_docx(file_path)
        else:
            raise ValueError("Unsupported file format")
    
    def _extract_from_pdf(self, file_path: str) -> str:
        text = ""
        with open(file_path, 'rb') as file:
            pdf_reader = PyPDF2.PdfReader(file)
            for page in pdf_reader.pages:
                text += page.extract_text()
        return text
    
    def _extract_from_docx(self, file_path: str) -> str:
        doc = docx.Document(file_path)
        text = "\n".join([paragraph.text for paragraph in doc.paragraphs])
        return text
    
    def extract_skills(self, text: str) -> List[str]:
        """Extract skills from resume text"""
        text_lower = text.lower()
        found_skills = []
        for skill in self.skill_keywords:
            if skill in text_lower:
                found_skills.append(skill)
        return found_skills
    
    def extract_education(self, text: str) -> str:
        """Extract education information"""
        education_patterns = [
            r'(?i)(b\.?e\.?|bachelor|b\.?tech|b\s?e\s?|b\s?tech)[^\n]*',
            r'(?i)(m\.?e\.?|master|m\.?tech|m\s?e\s?|m\s?tech)[^\n]*',
            r'(?i)(ph\.?d|doctorate)[^\n]*',
            r'(?i)(bca|mca|bsc|msc|bcom|mcom)[^\n]*'
        ]
        education_info = []
        for pattern in education_patterns:
            matches = re.findall(pattern, text, re.IGNORECASE)
            education_info.extend(matches)
        return "; ".join(set(education_info))[:500]
    
    def extract_experience(self, text: str) -> str:
        """Extract work experience"""
        experience_patterns = [
            r'(?i)(\d+\+?\s*years?\s+of\s+experience)[^\n]*',
            r'(?i)(worked\s+as\s+[^\n]+)',
            r'(?i)(experience[:\s]+[^\n]+)',
            r'(?i)(\d{4}\s*[-–]\s*(?:present|\d{4})[^\n]*)'
        ]
        experience_info = []
        for pattern in experience_patterns:
            matches = re.findall(pattern, text, re.IGNORECASE)
            experience_info.extend(matches)
        return "; ".join(experience_info)[:500]
    
    def extract_keywords(self, text: str) -> List[str]:
        """Extract important keywords from text"""
        words = word_tokenize(text.lower())
        words = [word for word in words if word.isalnum() and word not in self.stop_words]
        from collections import Counter
        word_freq = Counter(words)
        return [word for word, _ in word_freq.most_common(20)]