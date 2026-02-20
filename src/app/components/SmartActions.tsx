import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { SERVICES } from '../data/services';
import { ChevronRight, ChevronLeft } from 'lucide-react';

export function SmartActions() {
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    const scroll = (direction: 'left' | 'right') => {
        if (scrollContainerRef.current) {
            const scrollAmount = 300;
            const newScrollLeft = scrollContainerRef.current.scrollLeft + (direction === 'left' ? -scrollAmount : scrollAmount);
            scrollContainerRef.current.scrollTo({
                left: newScrollLeft,
                behavior: 'smooth'
            });
        }
    };

    return (
        <section className="py-8 bg-stone-50 border-b border-stone-200">
            <div className="max-w-[1400px] mx-auto px-4 md:px-8 relative group">

                <div
                    ref={scrollContainerRef}
                    className="flex gap-4 overflow-x-auto pb-4 pt-2 -mx-4 px-4 md:mx-0 md:px-0 scrollbar-hide snap-x md:justify-center flex-nowrap md:flex-wrap"
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                    {SERVICES.map((service, index) => (
                        <Link
                            key={service.id}
                            to={`/services/${service.id}`}
                            className="flex flex-col items-center gap-3 min-w-[90px] md:min-w-[110px] snap-start group/item shrink-0"
                        >
                            <motion.div
                                whileHover={{ scale: 1.05, y: -5 }}
                                whileTap={{ scale: 0.95 }}
                                className={`size-14 md:size-16 rounded-full flex items-center justify-center shadow-sm border border-stone-100 bg-white group-hover/item:shadow-md group-hover/item:border-[#3E2723]/20 transition-all duration-300 relative overflow-hidden`}
                            >
                                <div className={`absolute inset-0 opacity-0 group-hover/item:opacity-10 transition-opacity duration-300 ${service.bg.replace('bg-', 'bg-')}`}></div>
                                <service.icon className={`size-6 md:size-7 text-stone-600 group-hover/item:text-[#3E2723] transition-colors duration-300`} />
                            </motion.div>
                            <span className="text-xs md:text-sm font-medium text-stone-600 group-hover/item:text-[#3E2723] text-center leading-tight max-w-[100px] transition-colors">
                                {service.title}
                            </span>
                        </Link>
                    ))}
                </div>
            </div>

            <style>{`
                .scrollbar-hide::-webkit-scrollbar {
                    display: none;
                }
            `}</style>
        </section>
    );
}
