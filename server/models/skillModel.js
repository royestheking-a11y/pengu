import mongoose from 'mongoose';

const skillSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    category: { type: String, enum: ['Research', 'Analysis', 'Writing', 'Presentation', 'Leadership', 'Technical'] },
    level: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced'] },
    source: { type: String }, // e.g. "Order #123"
    score: { type: Number, default: 0 }
}, {
    timestamps: true
});

const Skill = mongoose.model('Skill', skillSchema);
export default Skill;
