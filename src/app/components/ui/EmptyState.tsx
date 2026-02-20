import React from 'react';
import { LucideIcon } from 'lucide-react';
import { motion } from 'motion/react';
import { Button } from './button';

interface EmptyStateProps {
    icon: LucideIcon;
    title: string;
    subtitle: string;
    action?: {
        label: string;
        onClick?: () => void;
        link?: string;
    };
    compact?: boolean;
    className?: string;
}

export function EmptyState({
    icon: Icon,
    title,
    subtitle,
    action,
    compact = false,
    className = ""
}: EmptyStateProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className={`flex flex-col items-center justify-center text-center ${compact ? 'py-8 px-4' : 'py-16 px-6'} glassmorphism rounded-2xl border border-stone-200/50 shadow-sm ${className}`}
        >
            <div className={`relative mb-6 ${compact ? 'p-3' : 'p-6'} rounded-full bg-stone-100/80 group`}>
                <div className="absolute inset-0 rounded-full bg-[#5D4037]/5 animate-pulse group-hover:bg-[#5D4037]/10 transition-colors" />
                <Icon className={`${compact ? 'size-8' : 'size-12'} text-[#5D4037] relative z-10`} />
            </div>

            <h3 className={`${compact ? 'text-lg' : 'text-xl'} font-bold text-stone-900 mb-2`}>
                {title}
            </h3>

            <p className={`text-stone-500 max-w-sm ${compact ? 'text-xs' : 'text-sm'} leading-relaxed mb-6`}>
                {subtitle}
            </p>

            {action && (
                <Button
                    variant="outline"
                    size={compact ? "sm" : "default"}
                    onClick={action.onClick}
                    className="border-[#5D4037]/20 text-[#5D4037] hover:bg-[#5D4037]/5 transition-all"
                >
                    {action.label}
                </Button>
            )}
        </motion.div>
    );
}
