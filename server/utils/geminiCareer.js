import Groq from 'groq-sdk';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const MODEL = 'llama-3.1-8b-instant';

// Helper: call Groq and get text response
const ask = async (prompt, maxTokens = 2000) => {
  const r = await groq.chat.completions.create({
    model: MODEL,
    messages: [{ role: 'user', content: prompt }],
    max_tokens: maxTokens,
    temperature: 0.4
  });
  return r.choices[0].message.content.trim();
};

// Helper: parse JSON from Groq (strips markdown fences + fixes literal control chars in strings)
const parseJSON = (text) => {
  const cleaned = text.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```$/g, '').trim();

  try {
    return JSON.parse(cleaned);
  } catch (e) {
    if (e.message.includes('control character') || e.message.includes('Bad control') || e.message.includes('Unexpected token')) {
      // Replace literal newlines/tabs inside JSON string values only
      // The /gs flag lets . match newlines, so we can find multi-line strings
      const sanitized = cleaned.replace(/"((?:[^"\\]|\\.)*)"/gs, (match) => {
        return match
          .replace(/\n/g, '\\n')
          .replace(/\r/g, '\\r')
          .replace(/\t/g, '\\t');
      });
      return JSON.parse(sanitized);
    }
    throw e;
  }
};

// ─── CV Analysis via Groq ────────────────────────────────────────────────────
export const groqAnalyzeMatch = async (cvText, jdText) => {
  const prompt = `You are an expert ATS career coach. Analyze the following CV against the Job Description.
Return ONLY valid JSON. No markdown, no explanation.

CV:
${cvText.slice(0, 3000)}

Job Description:
${jdText.slice(0, 2000)}

Return this exact JSON:
{
  "overallScore": <number 0-100>,
  "breakdown": {
    "skillsMatch": <number 0-100>,
    "experienceLevel": <number 0-100>,
    "toolsMatch": <number 0-100>,
    "keywordsCoverage": <number 0-100>,
    "atsCompatibility": <number 0-100>
  },
  "highlights": {
    "missing": [<up to 6 missing keywords as strings>],
    "weak": [<passive phrases found in the CV as strings>],
    "overused": [<overused phrases as strings>],
    "lowImpact": [<low-impact phrases as strings>],
    "atsIssues": [<ATS compliance issues as strings>]
  },
  "shortlistChance": <number 0-100>,
  "riskAreas": [<up to 3 specific risk areas as strings>],
  "suggestions": [<4 specific actionable suggestions as strings>]
}`;

  const text = await ask(prompt, 1500);
  return parseJSON(text);
};

// ─── CV Optimization via Groq ─────────────────────────────────────────────────
export const groqOptimizeCV = async (cvText) => {
  const prompt = `You are an expert career coach. Rewrite the CV text below.

CRITICAL RULES:
- Replace passive/weak phrases ONLY: "Worked on", "Helped with", "Responsible for", "Assisted in", "Familiar with", "Duties included"
- Use strong action verbs: Spearheaded, Engineered, Delivered, Grew, Reduced, Optimized, Designed
- Add realistic metrics where appropriate (%, time saved, team size, outcomes)
- Keep ALL original sections, dates, roles, and company names exactly as-is
- Do NOT fabricate any information

IMPORTANT OUTPUT FORMAT:
Return ONLY this JSON. The "optimized" value MUST be a single plain text string (use \\n for line breaks). Do NOT nest objects inside "optimized".

{
  "optimized": "<the full rewritten CV as plain text with \\n for line breaks>",
  "improvements": [
    { "from": "<original weak phrase>", "to": "<improved version>" }
  ]
}

CV to optimize:
${cvText.slice(0, 4000)}`;

  const text = await ask(prompt, 2500);
  const result = parseJSON(text);

  // Safety: if Groq still returns an object, flatten it to plain text
  if (typeof result.optimized !== 'string') {
    result.optimized = JSON.stringify(result.optimized, null, 2);
  }

  return result;
};


// ─── Email Generation via Groq ────────────────────────────────────────────────
export const groqGenerateEmail = async (cvText, jdText, tone = 'Confident', length = 'Medium') => {
  const lengthGuide = {
    Short: '3 short paragraphs',
    Medium: '4-5 paragraphs',
    Detailed: '5-6 paragraphs with deep role connection'
  };
  const toneGuide = {
    Formal: 'professional and formal',
    Confident: 'direct, results-driven, assertive',
    Friendly: 'warm, enthusiastic, approachable',
    Startup: 'casual, energetic, builder mindset'
  };

  const prompt = `Write a compelling job application email.

Tone: ${toneGuide[tone] || toneGuide.Confident}
Length: ${lengthGuide[length] || lengthGuide.Medium}

CV (summary):
${cvText.slice(0, 2000)}

Job Description:
${jdText.slice(0, 1500)}

Include:
- Subject line starting with "Subject: "
- Personalised greeting
- Strong opening hook connecting CV to the role
- Specific skills/achievements from the CV that match the JD
- Confident call-to-action
- Appropriate sign-off

Return ONLY the email text. No JSON. No markdown.`;

  return await ask(prompt, 800);
};
