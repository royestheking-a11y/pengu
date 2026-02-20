import mongoose from 'mongoose';

const systemSchema = new mongoose.Schema({
    commissionRate: { type: Number, default: 15 },
    maintenanceMode: { type: Boolean, default: false },
    bannerMessage: { type: String, default: '' }
}, {
    timestamps: true
});

const SystemSettings = mongoose.model('SystemSettings', systemSchema);
export default SystemSettings;
