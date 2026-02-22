import asyncHandler from 'express-async-handler';
import Transaction from '../models/transactionModel.js';
import User from '../models/userModel.js';
import crypto from 'crypto';

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

    // 3. Handle Status
    if (status === '2') {
        // REVERSAL / CHARGEBACK
        const existingTx = await Transaction.findOne({ trans_id });

        if (existingTx && existingTx.status !== 'chargeback') {
            // Deduct credits
            user.pengu_credits = Math.max(0, user.pengu_credits - amount);
            await user.save();

            // Update transaction
            existingTx.status = 'chargeback';
            existingTx.description = `[REVERSED] ${existingTx.description}`;
            await existingTx.save();

            console.log(`[CPX Webhook] Reversal processed for Trans: ${trans_id}, User: ${user_id}`);
            return res.status(200).send('Reversal processed');
        }

        return res.status(200).send('Reversal already processed or tx not found');
    } else if (status === '1') {
        // COMPLETED / PENDING (CPX calls it 1 for successful credit)
        const existingTx = await Transaction.findOne({ trans_id });
        if (existingTx) {
            return res.status(200).send('Duplicate transaction');
        }

        // Update Credits
        user.pengu_credits += amount;
        user.total_earned += amount;
        await user.save();

        // Create Transaction Record
        await Transaction.create({
            studentId: user._id,
            type: 'STUDENT_EARNING',
            amount: amount,
            description: `CPX Survey Earning (Ref: ${trans_id})`,
            trans_id,
            status: 'completed'
        });

        console.log(`[CPX Webhook] Credit added: ${amount} to User: ${user_id}`);
        return res.status(200).send('OK');
    }

    res.status(200).send('Unknown status');
});

export { handleCPXWebhook };
