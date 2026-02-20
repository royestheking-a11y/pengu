import mongoose from 'mongoose';

const syllabusSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    date: { type: Date, required: true },
    type: { type: String },
    course: { type: String }, // Storing name reference for simplicity as per store
    weight: { type: String }
});

const SyllabusEvent = mongoose.model('SyllabusEvent', syllabusSchema);
export default SyllabusEvent;
