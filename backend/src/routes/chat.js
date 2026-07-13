const express = require('express');
const { body, validationResult } = require('express-validator');
const Groq = require('groq-sdk');
const authenticate = require('../middleware/auth');
const config = require('../config');

const router = express.Router();

// ─── Lazy-init Groq client (only if key is configured) ───────────────────────
let groqClient = null;
function getGroqClient() {
  if (!config.GROQ_API_KEY) {
    throw new Error('GROQ_API_KEY is not configured on the server.');
  }
  if (!groqClient) {
    groqClient = new Groq({ apiKey: config.GROQ_API_KEY });
  }
  return groqClient;
}

// ─── POST /api/chat ───────────────────────────────────────────────────────────
// Proxies a chat request to Groq's LLaMA model.
// Body: {
//   system_prompt : string  — customised for counselor or interview mode
//   messages      : [{ role: 'user'|'assistant', content: string }]
//   temperature?  : number  (default 0.8)
// }
router.post(
  '/',
  authenticate,
  [
    body('system_prompt').notEmpty().withMessage('system_prompt is required'),
    body('messages').isArray({ min: 1 }).withMessage('messages must be a non-empty array'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ detail: errors.array()[0].msg });
    }

    try {
      const { system_prompt, messages, temperature = 0.8 } = req.body;
      const groq = getGroqClient();

      const completion = await groq.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        temperature,
        max_tokens: 1500,
        top_p: 0.95,
        messages: [
          { role: 'system', content: system_prompt },
          ...messages,
        ],
      });

      const reply = completion.choices[0]?.message?.content
        || "I'm here to help. Could you rephrase that?";

      return res.json({ reply });
    } catch (err) {
      console.error('Groq chat error:', err?.message || err);

      // Surface a useful message to the client
      if (err.message?.includes('GROQ_API_KEY')) {
        return res.status(503).json({ detail: 'AI service is not configured. Contact the site admin.' });
      }
      if (err.status === 401 || err.message?.includes('401')) {
        return res.status(503).json({ detail: 'Invalid Groq API key. Check the server configuration.' });
      }
      if (err.status === 429 || err.message?.includes('429')) {
        return res.status(429).json({ detail: 'AI rate limit reached. Please wait a moment and try again.' });
      }

      return res.status(500).json({ detail: `AI service error: ${err.message}` });
    }
  }
);

// ─── GET /api/chat/status ─────────────────────────────────────────────────────
// Lets the frontend check whether Groq is configured without making a real call.
router.get('/status', authenticate, (_req, res) => {
  return res.json({ available: Boolean(config.GROQ_API_KEY) });
});

module.exports = router;
