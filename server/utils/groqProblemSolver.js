import Groq from 'groq-sdk';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const MODEL = 'llama-3.3-70b-versatile';

// ─── Chat Reply ───────────────────────────────────────────────────────────────
// Takes full conversation history and returns next assistant message
export const getProblemSolverReply = async (messages) => {
    const systemPrompt = `You are Pengu's AI Problem Intake Assistant — warm, professional, and highly intelligent.
Your job is to help users describe their problem clearly before packaging it for a human Pengu expert to solve.

Guidelines:
- Greet new users warmly on their first message
- Ask clarifying questions: What type of problem? What's the deadline? What files do they have?
- Be concise — keep replies to 2-3 sentences max
- If they've explained their problem well, encourage them to upload files and fill in their contact details to send to the admin
- Use a friendly, professional tone — like a smart assistant at a premium service desk
- Do NOT try to solve the problem yourself — your job is intake, not solving`;

    const groqMessages = [
        { role: 'system', content: systemPrompt },
        ...messages.map(m => ({ role: m.role, content: m.content }))
    ];

    const r = await groq.chat.completions.create({
        model: MODEL,
        messages: groqMessages,
        max_tokens: 300,
        temperature: 0.6
    });

    return r.choices[0].message.content.trim();
};

// ─── AI Ticket Summarizer ─────────────────────────────────────────────────────
// Reads the chat log and file list, produces an admin summary
export const summarizeTicket = async (messages, files, name, whatsapp) => {
    const chatLog = messages.map(m => `${m.role === 'user' ? 'User' : 'AI'}: ${m.content}`).join('\n');
    const fileList = files.length > 0
        ? files.map(f => `- ${f.name} (${f.format})`).join('\n')
        : 'No files uploaded.';

    const prompt = `You are an expert admin assistant. Read this Problem Solver ticket and write a concise admin summary.

User: ${name}
WhatsApp: ${whatsapp}

Chat Log:
${chatLog}

Uploaded Files:
${fileList}

Write a 3-5 sentence admin summary covering:
1. What does the user need?
2. What files did they upload?
3. What action is required from the admin?
4. Any deadlines or urgency mentioned?

Be direct and factual. No fluff.`;

    const r = await groq.chat.completions.create({
        model: MODEL,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 400,
        temperature: 0.3
    });

    return r.choices[0].message.content.trim();
};
