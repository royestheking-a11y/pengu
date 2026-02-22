import asyncHandler from 'express-async-handler';
import Transaction from '../models/transactionModel.js';
import User from '../models/userModel.js';
import crypto from 'crypto';
import { getIO } from '../socket.js';

// @desc    Handle CPX Research Webhook
// @route   GET /api/transactions/cpx
// @access  Public
const handleCPXWebhook = asyncHandler(async (req, res) => {
    const { user_id, trans_id, amount_local, amount_usd, secure_hash, status } = req.query;

    console.log(`[CPX Webhook] Received: User: ${user_id}, Trans: ${trans_id}, Amount: ${amount_local}, Status: ${status}`);

    // 1. Verify Secure Hash
    const APP_SECURE_HASH = process.env.CPX_SECURE_HASH || 'YOUR_CPX_SECURE_HASH';
    const computedHash = crypto.createHash('md5').update(trans_id + '-' + APP_SECURE_HASH).digest('hex');

    if (secure_hash !== computedHash) {
        console.error('[CPX Webhook] Hash mismatch');
        return res.status(200).send('Hash mismatch');
    }

    // 2. Find User
    const user = await User.findById(user_id);
    if (!user) {
        console.error('[CPX Webhook] User not found:', user_id);
        return res.status(200).send('User not found');
    }

    const amount = parseFloat(amount_local);
    console.log(`[CPX Webhook] Parsed Amount: ${amount}, Current User Credits: ${user.pengu_credits}`);

    // 3. Handle Status
    if (status === '2') {
        // REVERSAL / CHARGEBACK
        const existingTx = await Transaction.findOne({ trans_id });

        if (existingTx && existingTx.status !== 'chargeback') {
            const oldBalance = user.pengu_credits;
            user.pengu_credits = Math.max(0, user.pengu_credits - amount);
            await user.save();

            // Update transaction
            existingTx.status = 'chargeback';
            existingTx.description = `[REVERSED] ${existingTx.description}`;
            await existingTx.save();

            console.log(`[CPX Webhook] Reversal: ${oldBalance} -> ${user.pengu_credits} (Deducted ${amount})`);

            // Notify User via Socket
            const io = getIO();
            io.to(user._id.toString()).emit('user_updated', user);
            io.emit('transaction_created', { type: 'STUDENT_EARNING', status: 'chargeback' });

            return res.status(200).send('OK'); // CPX expects OK or 200
        }

        return res.status(200).send('OK');
    } else if (status === '1') {
        // COMPLETED / PENDING
        const existingTx = await Transaction.findOne({ trans_id });
        if (existingTx) {
            console.log(`[CPX Webhook] Duplicate detected for Trans: ${trans_id}`);
            return res.status(200).send('OK'); // Return OK to CPX so it stops retrying
        }

        const oldBalance = user.pengu_credits;
        // Update Credits
        user.pengu_credits = (user.pengu_credits || 0) + amount;
        user.total_earned = (user.total_earned || 0) + amount;

        console.log(`[CPX Webhook] Updating Credits for ${user.email}: ${oldBalance} -> ${user.pengu_credits}`);

        try {
            await user.save();
            console.log(`[CPX Webhook] User saved successfully`);

            // Create Transaction Record
            await Transaction.create({
                studentId: user._id,
                type: 'STUDENT_EARNING',
                amount: amount,
                description: `CPX Survey Earning (Ref: ${trans_id})`,
                trans_id,
                status: 'completed'
            });
            console.log(`[CPX Webhook] Transaction record created`);

            // Notify User via Socket
            const io = getIO();
            io.to(user._id.toString()).emit('user_updated', user);
            io.emit('transaction_created', { amount, type: 'STUDENT_EARNING' });

            return res.status(200).send('OK');
        } catch (saveError) {
            console.error('[CPX Webhook] Save Error:', saveError);
            return res.status(500).send('Error saving user');
        }
    }

    res.status(200).send('OK');
});

export { handleCPXWebhook };
