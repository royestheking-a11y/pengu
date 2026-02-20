import express from 'express';
import { chat, createTicket, getAllTickets, updateTicket, deleteTicket } from '../controllers/universalTicketController.js';

const router = express.Router();

// Public (no auth required — anyone can submit a problem)
router.post('/chat', chat);
router.post('/', createTicket);

// Admin
router.get('/', getAllTickets);
router.patch('/:id', updateTicket);
router.delete('/:id', deleteTicket);

export default router;
