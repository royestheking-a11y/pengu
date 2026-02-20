import Groq from 'groq-sdk';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const MODEL = 'llama-3.3-70b-versatile'; // Smarter model for richer academic output

const ask = async (prompt, maxTokens = 2000) => {
    const r = await groq.chat.completions.create({
        model: MODEL,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: maxTokens,
        temperature: 0.5
    });
    return r.choices[0].message.content.trim();
};

const parseJSON = (text) => {
    const cleaned = text.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```$/g, '').trim();
    try {
        return JSON.parse(cleaned);
    } catch (e) {
        if (e.message.includes('control character') || e.message.includes('Bad control') || e.message.includes('Unexpected token')) {
            const sanitized = cleaned.replace(/"((?:[^"\\]|\\.)*)"/gs, (match) => {
                return match.replace(/\n/g, '\\n').replace(/\r/g, '\\r').replace(/\t/g, '\\t');
            });
            return JSON.parse(sanitized);
        }
        throw e;
    }
};

// ─── Quiz Generator ───────────────────────────────────────────────────────────
export const generateQuiz = async (topic, subject, difficulty, count) => {
    const prompt = `You are an expert academic tutor. Generate ${count} multiple-choice quiz questions on the topic: "${topic}" (Subject: ${subject}, Difficulty: ${difficulty}).

Return ONLY valid JSON in this exact format (no markdown, no extra text):
{
  "topic": "${topic}",
  "subject": "${subject}",
  "difficulty": "${difficulty}",
  "questions": [
    {
      "question": "<question text>",
      "options": ["A. <option>", "B. <option>", "C. <option>", "D. <option>"],
      "correctAnswer": "A",
      "explanation": "<brief explanation of why this is correct>"
    }
  ]
}

Make questions clear, academically accurate, and appropriate for the ${difficulty} level.`;

    const text = await ask(prompt, 3000);
    return parseJSON(text);
};

// ─── Concept Explainer ────────────────────────────────────────────────────────
export const explainConcept = async (topic, subject, level) => {
    const levelGuide = {
        beginner: 'a complete beginner with no prior knowledge. Use simple language, everyday analogies, and avoid jargon.',
        intermediate: 'a student with some background in the subject. Use proper terminology but explain it.',
        advanced: 'an advanced student who understands the fundamentals. Use technical precision and detail.'
    };

    const prompt = `You are a world-class university professor and expert tutor. Explain the following concept clearly and engagingly.

Concept: "${topic}"
Subject: ${subject}
Audience: Explain this to ${levelGuide[level] || levelGuide.beginner}

Return ONLY valid JSON (no markdown):
{
  "topic": "${topic}",
  "subject": "${subject}",
  "level": "${level}",
  "summary": "<1-2 sentence plain English summary>",
  "explanation": "<full detailed explanation, 3-5 paragraphs>",
  "keyPoints": ["<key point 1>", "<key point 2>", "<key point 3>", "<key point 4>", "<key point 5>"],
  "realWorldExample": "<a concrete real-world example or analogy>",
  "commonMistakes": ["<common misconception 1>", "<common misconception 2>"],
  "furtherReading": ["<related topic 1>", "<related topic 2>", "<related topic 3>"]
}`;

    const text = await ask(prompt, 2500);
    return parseJSON(text);
};

// ─── Exam Prep ────────────────────────────────────────────────────────────────
export const generateExamQuestions = async (topic, subject, examType, count) => {
    const typeGuide = {
        'past-paper': 'past paper style',
        'short-answer': 'short structured answer',
        'essay': 'long-form essay',
        'case-study': 'case study analysis'
    };

    const prompt = `You are an experienced university examiner. Generate ${count} exam-style questions on "${topic}" (Subject: ${subject}).

Style: ${typeGuide[examType] || 'past paper'} questions, as they would appear in a real ${subject} exam.

Return ONLY valid JSON (no markdown):
{
  "topic": "${topic}",
  "subject": "${subject}",
  "examType": "${examType}",
  "questions": [
    {
      "number": 1,
      "question": "<full exam question with any sub-parts>",
      "marks": <number of marks>,
      "guidance": "<examiner's guidance / what a strong answer should include>",
      "sampleAnswer": "<a model answer that would achieve full marks>"
    }
  ]
}

Make questions realistic, well-worded, and appropriately challenging for undergraduate/A-level/GCSE students.`;

    const text = await ask(prompt, 3500);
    return parseJSON(text);
};
