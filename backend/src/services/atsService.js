class ATSService {
  constructor() {
    this.commonKeywords = [
      'leadership', 'communication', 'teamwork', 'problem solving',
      'project management', 'analytical', 'organization', 'time management',
      'creative', 'adaptability', 'critical thinking', 'collaboration',
    ];
  }

  /**
   * Calculate ATS compatibility score (0-100).
   * @param {string}   text              - Full resume text
   * @param {string[]} extractedKeywords - Keywords returned by resumeParser
   * @returns {number}
   */
  calculateAtsScore(text, extractedKeywords) {
    let score = 0;
    const lower = text.toLowerCase();

    // 30% weight — standard section headings
    const requiredSections = ['education', 'experience', 'skills'];
    let sectionScore = 0;
    for (const section of requiredSections) {
      if (lower.includes(section)) sectionScore += 33.33;
    }
    score += sectionScore * 0.3;

    // 40% weight — keyword density
    if (extractedKeywords.length > 0) {
      const keywordCount = extractedKeywords.filter((kw) =>
        lower.includes(kw.toLowerCase())
      ).length;
      const keywordDensity = (keywordCount / extractedKeywords.length) * 100;
      score += Math.min(keywordDensity, 100) * 0.4;
    }

    // 30% weight — formatting quality
    const formattingScore = this.checkFormatting(text);
    score += formattingScore * 0.3;

    return Math.round(Math.min(score, 100) * 100) / 100;
  }

  /**
   * Check for formatting best-practices (returns 0-100).
   * @param {string} text
   * @returns {number}
   */
  checkFormatting(text) {
    let score = 0;

    // Bullet points
    if (/[•·▪‣●○◆◘◦➢➣➤]/.test(text)) score += 25;

    // Consistent date formatting
    if (/\d{4}\s*[-–]\s*(?:present|\d{4})/i.test(text)) score += 25;

    // Action verbs
    const actionVerbs = ['achieved', 'implemented', 'developed', 'managed', 'created', 'led', 'improved'];
    if (actionVerbs.some((v) => text.toLowerCase().includes(v))) score += 25;

    // Quantifiable achievements
    if (/\d+%|\d+\s*(?:years?|months?)/.test(text)) score += 25;

    return score;
  }
}

module.exports = new ATSService();
