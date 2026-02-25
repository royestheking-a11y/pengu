import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['student', 'expert', 'admin'], default: 'student' },
    status: { type: String, enum: ['active', 'banned', 'suspended'], default: 'active' },
    avatar: { type: String },
    bio: { type: String },
    phone: { type: String },
    balance: { type: Number, default: 0 },
    total_earned: { type: Number, default: 0 },
    joinedAt: { type: Date, default: Date.now },
    onboardingCompleted: { type: Boolean, default: false },
}, {
    timestamps: true
});

userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.pre('save', async function () {
    if (!this.isModified('password')) {
        return;
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

const User = mongoose.model('User', userSchema);
export default User;
