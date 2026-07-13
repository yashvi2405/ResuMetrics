const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');

// Stop-words (replaces NLTK)
const STOP_WORDS = new Set([
  'a','an','and','are','as','at','be','by','for','from','has','he','in','is',
  'it','its','of','on','that','the','to','was','were','will','with','i','you',
  'we','they','them','their','our','your','his','her','she','do','did','have',
  'had','this','these','those','but','or','not','so','if','about','which',
  'when','who','what','where','how','all','been','there','can','could','would',
  'should','may','might','also','than','then','into','over','after','before',
  'between','through','during','up','down','out','off','again','further',
  'once','any','each','few','more','most','other','some','such','no','nor',
  'only','own','same','too','very','just','because','while','although','however',
]);

const SKILL_KEYWORDS = [
  'python', 'java', 'javascript', 'sql', 'aws', 'docker', 'kubernetes',
  'react', 'angular', 'node.js', 'django', 'flask', 'machine learning',
  'ai', 'data science', 'agile', 'scrum', 'git', 'rest api', 'html', 'css',
];

class ResumeParser {
  /**
   * Extract raw text from a PDF or DOCX file.
   * @param {string} filePath  - Absolute path on disk
   * @param {string} fileFormat - ".pdf" | ".docx"
   * @returns {Promise<string>}
   */
  async extractText(filePath, fileFormat) {
    const fmt = fileFormat.toLowerCase();
    if (fmt === '.pdf') {
      return this._extractFromPdf(filePath);
    } else if (fmt === '.docx') {
      return this._extractFromDocx(filePath);
    }
    throw new Error(`Unsupported file format: ${fileFormat}`);
  }

  async _extractFromPdf(filePath) {
    const buffer = fs.readFileSync(filePath);
    const data = await pdfParse(buffer);
    return data.text || '';
  }

  async _extractFromDocx(filePath) {
    const result = await mammoth.extractRawText({ path: filePath });
    return result.value || '';
  }

  /**
   * Extract skills found in the resume text.
   * @param {string} text
   * @returns {string[]}
   */
  extractSkills(text) {
    const lower = text.toLowerCase();
    return SKILL_KEYWORDS.filter((skill) => lower.includes(skill));
  }

  /**
   * Extract education information.
   * @param {string} text
   * @returns {string}
   */
  extractEducation(text) {
    const patterns = [
      /(?:b\.?e\.?|bachelor|b\.?tech|b\s?e\s?|b\s?tech)[^\n]*/gi,
      /(?:m\.?e\.?|master|m\.?tech|m\s?e\s?|m\s?tech)[^\n]*/gi,
      /(?:ph\.?d|doctorate)[^\n]*/gi,
      /(?:bca|mca|bsc|msc|bcom|mcom)[^\n]*/gi,
    ];

    const found = new Set();
    for (const pattern of patterns) {
      const matches = text.match(pattern) || [];
      matches.forEach((m) => found.add(m.trim()));
    }
    return [...found].join('; ').slice(0, 500);
  }

  /**
   * Extract work experience snippets.
   * @param {string} text
   * @returns {string}
   */
  extractExperience(text) {
    const patterns = [
      /\d+\+?\s*years?\s+of\s+experience[^\n]*/gi,
      /worked\s+as\s+[^\n]+/gi,
      /experience[:\s]+[^\n]+/gi,
      /\d{4}\s*[-–]\s*(?:present|\d{4})[^\n]*/gi,
    ];

    const found = [];
    for (const pattern of patterns) {
      const matches = text.match(pattern) || [];
      found.push(...matches.map((m) => m.trim()));
    }
    return found.join('; ').slice(0, 500);
  }

  /**
   * Extract top-frequency keywords (pure JS — no NLTK).
   * @param {string} text
   * @param {number} topN
   * @returns {string[]}
   */
  extractKeywords(text, topN = 20) {
    const words = text.toLowerCase().match(/\b[a-z]{3,}\b/g) || [];
    const filtered = words.filter((w) => !STOP_WORDS.has(w));

    const freq = {};
    for (const w of filtered) freq[w] = (freq[w] || 0) + 1;

    return Object.entries(freq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, topN)
      .map(([word]) => word);
  }
}

module.exports = new ResumeParser();
