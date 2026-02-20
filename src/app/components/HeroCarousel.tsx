import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useStore } from '../store';

export function HeroCarousel() {
    const { carouselSlides } = useStore();
    const activeSlides = carouselSlides
        .filter(slide => slide.isActive)
        .sort((a, b) => a.order - b.order);

    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        if (currentIndex >= activeSlides.length) {
            setCurrentIndex(0);
        }
    }, [activeSlides.length, currentIndex]);

    useEffect(() => {
        if (activeSlides.length <= 1) return;
        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % activeSlides.length);
        }, 5000);
        return () => clearInterval(interval);
    }, [activeSlides.length]);

    const nextSlide = () => {
        setCurrentIndex((prev) => (prev + 1) % activeSlides.length);
    };

    const prevSlide = () => {
        setCurrentIndex((prev) => (prev - 1 + activeSlides.length) % activeSlides.length);
    };

    if (activeSlides.length === 0) {
        return (
            <div className="relative w-full">
                <div className="relative overflow-hidden rounded-[32px] shadow-2xl border border-stone-200 aspect-[16/9] md:aspect-auto md:h-[600px] bg-stone-100 flex items-center justify-center">
                    <div className="text-center p-8">
                        <div className="w-24 h-24 bg-stone-200 rounded-full mx-auto mb-4 animate-pulse flex items-center justify-center text-stone-300">
                            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2" /><circle cx="9" cy="9" r="2" /><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" /></svg>
                        </div>
                        <h3 className="text-xl font-bold text-stone-400 mb-2">No active slides</h3>
                        <p className="text-stone-400">Add banners in Admin to display here.</p>
                    </div>
                </div>
            </div>
        );
    }

    const currentSlide = activeSlides[currentIndex];

    return (
        <div className="relative w-full">
            <div className="relative overflow-hidden rounded-[32px] shadow-2xl border border-stone-200 aspect-[16/9] md:aspect-auto md:h-[600px] group bg-stone-100">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentSlide.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.7 }}
                        className="absolute inset-0"
                    >
                        <Link to={currentSlide.linkUrl} className="block w-full h-full">
                            <img
                                src={currentSlide.imageUrl}
                                alt="Carousel Slide"
                                className="w-full h-full object-cover"
                            />
                            {/* Overlay for hover effect */}
                            <div className="absolute inset-0 bg-black/0 transition-colors duration-300 group-hover:bg-black/5" />
                        </Link>
                    </motion.div>
                </AnimatePresence>

                {/* Dots (Bottom of Image) */}
                {activeSlides.length > 1 && (
                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-20">
                        {activeSlides.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => setCurrentIndex(index)}
                                className={`h-2 rounded-full transition-all duration-300 shadow-sm backdrop-blur-sm ${index === currentIndex ? 'w-8 bg-white' : 'w-2 bg-white/60 hover:bg-white/80'
                                    }`}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
