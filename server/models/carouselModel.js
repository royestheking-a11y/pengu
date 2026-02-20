import mongoose from 'mongoose';

const carouselSchema = new mongoose.Schema({
    imageUrl: { type: String, required: true },
    linkUrl: { type: String, default: '#' },
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    title: { type: String },
    description: { type: String },
    buttonText: { type: String },
    badge: { type: String }
}, {
    timestamps: true
});

const Carousel = mongoose.model('Carousel', carouselSchema);
export default Carousel;
