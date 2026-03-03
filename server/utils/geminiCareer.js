import groqManager from './groqClient.js';

const MODEL = 'llama-3.1-8b-instant';

// Helper: call Groq and get text response
const ask = async (prompt, maxTokens = 2000) => {
  return await groqManager.ask(prompt, { model: MODEL, maxTokens, temperature: 0.4 });
};

// Helper: parse JSON from Groq (strips markdown fences + fixes literal control chars in strings)
const parseJSON = (text) => {
  // Try to find a JSON block in the text
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  const cleaned = jsonMatch ? jsonMatch[0] : text;

  try {
    return JSON.parse(cleaned);
  } catch (e) {
    if (e.message.includes('control character') || e.message.includes('Bad control') || e.message.includes('Unexpected token')) {
      const sanitized = cleaned.replace(/"((?:[^"\\]|\\.)*)"/gs, (match) => {
        return match
          .replace(/\n/g, '\\n')
          .replace(/\r/g, '\\r')
          .replace(/\t/g, '\\t');
      });
      try {
        return JSON.parse(sanitized);
      } catch (innerError) {
        console.error('[Groq Utility] JSON Parse Error after sanitization:', innerError.message);
        console.error('[Groq Utility] Raw text that failed:', text);
        throw innerError;
      }
    }
    console.error('[Groq Utility] JSON Parse Error:', e.message);
    console.error('[Groq Utility] Raw text that failed:', text);
    throw e;
  }
};

// ─── CV Analysis via Groq ────────────────────────────────────────────────────
export const groqAnalyzeMatch = async (cvText, jdText) => {
  const prompt = `You are an elite executive recruiter and personal branding expert. Analyze the following CV against the Job Description specifically for high-stakes roles.
  
  Focus on:
  1. EVIDENCE OF IMPACT: Does the CV show *what* they did or just *tasks*?
  2. ROLE SIGNALS: Does the CV use the "vocabulary of the future" for this specific industry?
  3. ATS DOMINANCE: Identify keywords that are technically present but contextually weak.

CV:
${cvText.slice(0, 3000)}

Job Description:
${jdText.slice(0, 2000)}

Return ONLY valid JSON in this exact structure:
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
    "weak": [<passive/low-authority phrases as strings>],
    "overused": [<clichés liked "team player" found in the CV>],
    "lowImpact": [<sentences that lack quantifiable results>],
    "atsIssues": [<Technical ATS parsing risks>]
  },
  "shortlistChance": <number 0-100>,
  "riskAreas": [<3 specific high-level risks like "Domain Gap" or "Seniority Mismatch">],
  "suggestions": [<4 ELITE strategies to immediately increase interview odds>]
}`;

  const text = await ask(prompt, 1500);
  return parseJSON(text);
};

// ─── CV Optimization via Groq ─────────────────────────────────────────────────
export const groqOptimizeCV = async (cvText) => {
  const prompt = `You are an elite executive resume writer. Rewrite the CV text below using the AMR (Action-Metric-Result) framework.

CRITICAL RULES:
- TRANSFORMATION: Move from "Responsible for X" to "Spearheaded X, resulting in Y% growth/improvement."
- VOCABULARY: Use high-authority verbs (Orchestrated, Engineered, Pioneered, Leveraged).
- QUANTIFICATION: Add realistic, industry-standard metrics (%, $, Time, Team Size) even if implied.
- PRESERVATION: Keep original contact info, dates, and company names exact.
- NO FLUFF: Remove generic adjectives (hardworking, passionate).

IMPORTANT OUTPUT FORMAT:
Return ONLY this JSON. The "optimized" value MUST be a single plain text string (use \\n for line breaks).

{
  "optimized": "<the full elite-level CV as plain text>",
  "improvements": [
    { "from": "<original weak bullet>", "to": "<elite AMR-based bullet>" }
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

  const prompt = `Write a high-conversion, elite job application email designed to beat 1000+ competitors.

Tone: ${toneGuide[tone] || toneGuide.Confident}
Length: ${lengthGuide[length] || lengthGuide.Medium}

STRATEGY:
- THE HOOK: Start with a powerful "Pain Point" or "Opportunity" statement based on the JD.
- THE VALUE: Connect 2-3 specific achievements from the CV directly to the job's biggest challenge.
- THE ASYMMETRY: Mention something unique from the CV that makes the candidate a "Category of One".

CV (summary):
${cvText.slice(0, 2000)}

Job Description:
${jdText.slice(0, 1500)}

Return ONLY the email text starting with "Subject: ". NO JSON, NO MARKDOWN.`;

  return await ask(prompt, 800);
};

// ─── CV Intelligent Review via Groq ───────────────────────────────────────────
export const groqReviewCV = async (cvText) => {
  const prompt = `You are an elite executive recruiter and personal branding expert. Analyze the following CV content based on 2026 industry standards.
  
  Focus on:
  1. ATS Compatibility (parsing-friendly structure)
  2. Header Impact (contact info, links)
  3. Metric-based Experience (quantifiable achievements)
  4. Skill Density (keywords vs fluff)
  
  CV Content:
  ${cvText.slice(0, 5000)}
  
  Return ONLY valid JSON in this exact structure. No markdown fences. Ensure ALL values (especially score) are STRINGS wrapped in double quotes.
  {
    "score": "8.5/10",
    "role": "TECH",
    "seniority": "MID",
    "foundKeywords": ["React", "Node.js"],
    "missingKeywords": ["AWS"],
    "analysis": {
      "header": { "pass": true, "note": "Header note here" },
      "summary": { "pass": true, "note": "Summary note here" },
      "skills": { "pass": true, "note": "Skills note here" },
      "experience": { "pass": true, "note": "Experience note here" },
      "projects": { "pass": true, "note": "Projects note here" },
      "whatToUpdate": ["Tip 1", "Tip 2", "Tip 3"]
    }
  }`;

  const text = await ask(prompt, 2000);
  const result = parseJSON(text);

  // Ensure date is added for UI compatibility
  result.date = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  return result;
};

// ─── Interview Preparation via Groq ──────────────────────────────────────────
export const groqPrepareInterview = async (cvText, jdText) => {
  const prompt = `You are an elite executive interviewer and career psychologist. Your goal is to prepare a candidate for a high-stakes, competitive interview.

OBJECTIVE: CRITICAL STRESS-TEST & STRATEGY.

CV Content:
${cvText.slice(0, 3000)}

Job Description:
${jdText.slice(0, 2000)}

Return ONLY a valid JSON object in this exact structure:
{
  "roleAnalysis": {
    "keyPriorities": ["The unstated business objective (the real 'why' for this hire)"],
    "hiddenChallenges": ["The structural or political problems typical for this role type"],
    "cultureFit": "Psychological profile of the ideal candidate for this specific company"
  },
  "technicalQuestions": [
    {
      "question": "An aggressive, situational technical question testing depth and trade-offs",
      "bestApproach": "The 'Master-Level' strategy to frame the answer",
      "expectedAnswer": "Technical precision points that prove 1% seniority"
    } // Provide EXACTLY 5 high-stakes questions
  ],
  "behavioralQuestions": [
    {
      "question": "A psychological scenario testing emotional intelligence and leadership",
      "bestApproach": "STAR method refined with executive presence",
      "expectedAnswer": "A narrative that turns a challenge into a massive win"
    } // Provide 3 questions
  ],
  "simulationScenarios": [
    {
      "title": "The 'Curveball' Simulation",
      "context": "A high-pressure business or technical crisis matching the role",
      "challenge": "An 'unwinnable' scenario or direct confrontation from an interviewer",
      "winningMove": "The asymmetrical move to regain authority and solve the problem"
    } // Provide 2 scenarios
  ],
  "insiderTips": ["3 'Insider-Only' tactics to instantly build rapport and authority"]
}

Rules:
- Generate EXACTLY 5 Technical, 3 Behavioral, and 2 Simulation cases.
- NO generic questions. Every question must be a specialized test of this specific CV vs this specific JD.
- Use high-authority terminology.
- Return ONLY JSON.`;

  const text = await ask(prompt, 3000);
  return parseJSON(text);
};
