import asyncHandler from 'express-async-handler';
import Contact from '../models/contactModel.js';

// @desc    Submit a contact form
// @route   POST /api/contact
// @access  Public
const submitContact = asyncHandler(async (req, res) => {
    const { firstName, lastName, email, subject, message } = req.body;

    const contact = await Contact.create({
        firstName,
        lastName,
        email,
        subject,
        message
    });

    res.status(201).json(contact);
});

// @desc    Get all contact submissions
// @route   GET /api/contact
// @access  Private/Admin
const getContacts = asyncHandler(async (req, res) => {
    const contacts = await Contact.find({}).sort({ createdAt: -1 });
    res.json(contacts);
});

// @desc    Delete a contact submission
// @route   DELETE /api/contact/:id
// @access  Private/Admin
const deleteContact = asyncHandler(async (req, res) => {
    const contact = await Contact.findById(req.params.id);

    if (!contact) {
        res.status(404);
        throw new Error('Contact not found');
    }

    await contact.deleteOne();
    res.json({ message: 'Contact deleted' });
});

export { submitContact, getContacts, deleteContact };
