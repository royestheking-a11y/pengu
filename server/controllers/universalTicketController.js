import UniversalTicket from '../models/universalTicketModel.js';
import { getProblemSolverReply, summarizeTicket } from '../utils/groqProblemSolver.js';

// ─── Send a chat message (Groq replies) ───────────────────────────────────────
export const chat = async (req, res) => {
    try {
        const { messages } = req.body;
        if (!messages || !Array.isArray(messages)) {
            return res.status(400).json({ message: 'messages array required' });
        }
        const reply = await getProblemSolverReply(messages);
        res.json({ reply });
    } catch (error) {
        console.error('[Problem Solver] Chat error:', error.message);
        res.status(500).json({ message: 'AI is temporarily unavailable. Please try again.' });
    }
};

// ─── Submit ticket (create) ───────────────────────────────────────────────────
export const createTicket = async (req, res) => {
    try {
        const { name, whatsapp, messages, files } = req.body;
        if (!name || !whatsapp) {
            return res.status(400).json({ message: 'Name and WhatsApp number are required' });
        }
        if (!messages || messages.length === 0) {
            return res.status(400).json({ message: 'Please describe your problem in the chat first' });
        }

        // Generate AI summary for admin
        let aiSummary = '';
        try {
            aiSummary = await summarizeTicket(messages, files || [], name, whatsapp);
        } catch (e) {
            console.warn('[Problem Solver] Summary failed, continuing without:', e.message);
        }

        const ticket = await UniversalTicket.create({
            name,
            whatsapp,
            messages,
            files: files || [],
            aiSummary
        });

        console.log(`[Problem Solver] ✅ Ticket created: ${ticket._id} for ${name}`);
        res.status(201).json({ ticketId: ticket._id, message: 'Ticket submitted successfully' });
    } catch (error) {
        console.error('[Problem Solver] Create ticket error:', error.message);
        res.status(500).json({ message: 'Failed to submit ticket. Please try again.' });
    }
};

// ─── Admin: Get all tickets ───────────────────────────────────────────────────
export const getAllTickets = async (req, res) => {
    try {
        const tickets = await UniversalTicket.find().sort({ createdAt: -1 });
        res.json(tickets);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch tickets' });
    }
};

// ─── Admin: Update ticket status / note ──────────────────────────────────────
export const updateTicket = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, adminNote } = req.body;
        const ticket = await UniversalTicket.findByIdAndUpdate(
            id, { status, adminNote }, { new: true }
        );
        if (!ticket) return res.status(404).json({ message: 'Ticket not found' });
        res.json(ticket);
    } catch (error) {
        res.status(500).json({ message: 'Failed to update ticket' });
    }
};

// ─── Admin: Delete ticket ─────────────────────────────────────────────────────
export const deleteTicket = async (req, res) => {
    try {
        await UniversalTicket.findByIdAndDelete(req.params.id);
        res.json({ message: 'Ticket deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to delete ticket' });
    }
};
