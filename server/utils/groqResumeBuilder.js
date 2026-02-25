import Groq from 'groq-sdk';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export const parseResumeText = async (rawText) => {
  const prompt = `You are a professional Executive Resume Writer and Parser.
Your job is to read the messy, unstructured text provided by the user and extract it into a highly premium, perfectly structured JSON object.

Format your response STRICTLY as JSON matching this exact structure:
{
  "personal": {
    "name": "Full Name",
    "title": "Professional Title (e.g., Graphics Designer)",
    "phone": "Phone Number",
    "email": "Email Address",
    "website": "Personal Website or Portfolio Link"
  },
  "education": [
    {
      "degree": "Degree Name",
      "institution": "University/School Name",
      "year": "YYYY - YYYY"
    }
  ],
  "expertise": ["Skill 1", "Skill 2"],
  "languages": ["Language 1", "Language 2"],
  "profileSummary": "A premium, well-written 3-4 sentence professional summary of the candidate.",
  "workExperience": [
    {
      "company": "Company Name",
      "role": "Job Title",
      "year": "YYYY - YYYY",
      "achievements": ["Bullet point 1", "Bullet point 2"]
    }
  ],
  "references": [
    {
      "name": "Reference Name",
      "company": "Company Name",
      "role": "Job Title",
      "phone": "Phone Number",
      "email": "Email Address"
    }
  ]
}

If any information is missing from the text (e.g., no references, no phone, no email), infer professional placeholders like "Available upon request" (CRITICAL: ensure you include the spaces between words). If dates are missing for education or work experience, use "YYYY - YYYY" as a placeholder so the user can easily edit it. Ensure the "achievements" under work experience are robust and professional.

User Text:
${rawText}`;

  const r = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.1, // Keep it deterministic for JSON extraction
    response_format: { type: 'json_object' }
  });

  try {
    return JSON.parse(r.choices[0].message.content.trim());
  } catch (error) {
    console.error("Failed to parse Groq response as JSON:", r.choices[0].message.content);
    throw new Error("AI returned invalid JSON structure.");
  }
};
