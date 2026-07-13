class ScoringService {
  constructor() {
    this.jobRoles = {
      software_engineer: ['python', 'java', 'sql', 'git', 'agile', 'javascript'],
      data_scientist:    ['python', 'sql', 'machine learning', 'statistics', 'pandas', 'tensorflow'],
      devops_engineer:   ['docker', 'kubernetes', 'aws', 'ci/cd', 'linux', 'terraform'],
      frontend_dev:      ['react', 'javascript', 'html', 'css', 'angular', 'vue.js'],
    };
  }

  /**
   * Calculate weighted overall resume score (0-100).
   * @param {string[]} skills
   * @param {string}   experience
   * @param {string}   education
   * @param {number}   atsScore
   * @param {number}   keywordScore
   * @returns {number}
   */
  calculateResumeScore(skills, experience, education, atsScore, keywordScore) {
    const skillScore = this._calculateSkillScore(skills);
    const expScore   = this._calculateExperienceScore(experience);
    const eduScore   = this._calculateEducationScore(education);

    const total =
      skillScore * 0.35 +
      expScore   * 0.30 +
      eduScore   * 0.20 +
      atsScore   * 0.15;

    return Math.round(total * 100) / 100;
  }

  _calculateSkillScore(skills) {
    if (!skills || skills.length === 0) return 0;
    return Math.min(skills.length * 10, 100);
  }

  _calculateExperienceScore(experience) {
    if (!experience) return 0;

    const match = experience.match(/(\d+)\+?\s*years?/i);
    if (match) {
      return Math.min(parseInt(match[1], 10) * 10, 100);
    }

    return experience.length > 50 ? 50 : 25;
  }

  _calculateEducationScore(education) {
    if (!education) return 0;

    const levels = { phd: 100, master: 90, bachelor: 80, diploma: 60, certification: 50 };
    const lower = education.toLowerCase();
    for (const [level, score] of Object.entries(levels)) {
      if (lower.includes(level)) return score;
    }
    return 40;
  }

  /**
   * Generate personalised improvement suggestions.
   * @param {object} resumeData
   * @returns {string[]}
   */
  generateImprovementSuggestions(resumeData) {
    const suggestions = [];

    if ((resumeData.skills || []).length < 5) {
      suggestions.push('Add more relevant technical skills to improve your profile visibility');
    }

    if (!resumeData.experience) {
      suggestions.push('Include detailed work experience with specific achievements and metrics');
    }

    if ((resumeData.ats_score || 0) < 60) {
      suggestions.push('Optimize your resume for ATS by including standard section headings and relevant keywords');
    }

    if ((resumeData.formatting_score || 0) < 50) {
      suggestions.push('Use bullet points and consistent formatting to improve readability');
    }

    if ((resumeData.keyword_score || 0) < 50) {
      suggestions.push('Include more industry-specific keywords relevant to your target role');
    }

    suggestions.push('Use strong action verbs to describe your accomplishments (e.g., \'achieved\', \'implemented\', \'developed\')');
    suggestions.push('Include quantifiable achievements with numbers and percentages to demonstrate impact');

    return suggestions;
  }
}

module.exports = new ScoringService();
