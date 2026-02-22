import asyncHandler from 'express-async-handler';
import Transaction from '../models/transactionModel.js';
import User from '../models/userModel.js';
import crypto from 'crypto';

// @desc    Handle CPX Research Webhook
// @route   GET /api/transactions/cpx
// @access  Public
const handleCPXWebhook = asyncHandler(async (req, res) => {
    const { user_id, trans_id, amount_local, secure_hash, status } = req.query;

    // 1. Verify Secure Hash
    // Logic: MD5 of (trans_id + APP_SECURE_HASH)
    // For now using a placeholder hash or getting from env
    const APP_SECURE_HASH = process.env.CPX_SECURE_HASH || 'YOUR_CPX_SECURE_HASH';
    const computedHash = crypto.createHash('md5').update(trans_id + APP_SECURE_HASH).digest('hex');

    if (secure_hash !== computedHash) {
        console.error('[CPX Webhook] Hash mismatch');
        return res.status(200).send('Hash mismatch but OK'); // CPX recommends 200 even on error to prevent retry if logic is fine
    }

    // 2. Check if transaction already exists
    const existingTx = await Transaction.findOne({ trans_id });
    if (existingTx) {
        return res.status(200).send('Duplicate transaction');
    }

    // 3. Find User
    const user = await User.findById(user_id);
    if (!user) {
        return res.status(200).send('User not found');
    }

    // 4. Update Credits
    const amount = parseFloat(amount_local);
    user.pengu_credits += amount;
    user.total_earned += amount;
    await user.save();

    // 5. Create Transaction Record
    await Transaction.create({
        studentId: user._id,
        type: 'STUDENT_EARNING',
        amount: amount,
        description: `CPX Survey Earning (Ref: ${trans_id})`,
        trans_id,
        status: status === '1' ? 'completed' : 'chargeback'
    });

    res.status(200).send('OK');
});

export { handleCPXWebhook };
