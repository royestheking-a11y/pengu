import nodemailer from 'nodemailer';
import Job from '../models/jobModel.js';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Dispatch application email via Gmail
 * @param {Object} job - The job document
 * @param {string} cvUrl - Cloudinary URL for PDF CV
 * @param {string} clUrl - Cloudinary URL for PDF Cover Letter (optional)
 * @returns {Promise<Object>} - Dispatch result
 */
export const dispatchApplication = async (job, cvUrl, clUrl = null) => {
    console.log(`✉️ [CHAIRMAN DISPATCH] Preparing to send application for ${job.role} at ${job.company}`);

    if (!job.targetEmail) {
        throw new Error("Target email is missing. Please provide a recruiter email.");
    }

    if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
        throw new Error("Gmail credentials (GMAIL_USER/GMAIL_APP_PASSWORD) are not configured in .env");
    }

    // 1. Setup Transporter
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.GMAIL_USER,
            pass: process.env.GMAIL_APP_PASSWORD,
        },
    });

    // 2. Construct Mail Options
    const attachments = [
        {
            filename: `Aurangzeb_Sunny_CV.pdf`,
            path: cvUrl,
            contentType: 'application/pdf'
        }
    ];

    if (clUrl) {
        attachments.push({
            filename: `Aurangzeb_Sunny_Cover_Letter.pdf`,
            path: clUrl,
            contentType: 'application/pdf'
        });
    }

    const mailOptions = {
        from: `"Aurangzeb Sunny" <${process.env.GMAIL_USER}>`,
        to: job.targetEmail,
        subject: `Application for ${job.role} - Aurangzeb Sunny`,
        text: job.draftedEmail,
        attachments
    };

    try {
        // 3. Send Mail
        const info = await transporter.sendMail(mailOptions);
        console.log(`✅ [CHAIRMAN DISPATCH] Email sent: ${info.messageId}`);

        // 4. Update Job Status & Reset Agents
        job.status = 'sent';
        job.activeAgent = 'idle';
        job.progress = 100;
        job.sentDate = new Date();
        job.generatedCvUrl = cvUrl;
        job.generatedCoverLetterUrl = clUrl || '';
        await job.save();

        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error(`❌ [CHAIRMAN DISPATCH] Error sending email:`, error.message);
        throw error;
    }
};
