import React from 'react';
import { Skeleton } from './ui/skeleton';

interface ReviewSkeletonProps {
    variant?: 'homepage' | 'fullPage';
}

export function ReviewSkeleton({ variant = 'homepage' }: ReviewSkeletonProps) {
    if (variant === 'homepage') {
        return (
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-stone-100 flex flex-col min-h-[320px] h-full relative mx-2 sm:mx-4">
                <div className="flex justify-between items-start mb-6">
                    <div className="flex gap-1">
                        {[...Array(5)].map((_, i) => (
                            <Skeleton key={i} className="size-4 rounded-full" />
                        ))}
                    </div>
                    <Skeleton className="size-8 rounded-lg opacity-20" />
                </div>

                <div className="space-y-3 flex-grow">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-[90%]" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-[60%]" />
                </div>

                <div className="flex items-center gap-4 pt-6 border-t border-stone-50 mt-auto">
                    <Skeleton className="size-10 rounded-full" />
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-3 w-16" />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-100 flex flex-col h-full">
            <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                    <Skeleton className="size-10 rounded-full" />
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-3 w-24" />
                    </div>
                </div>
                <div className="flex gap-0.5">
                    {[...Array(5)].map((_, i) => (
                        <Skeleton key={i} className="size-3 rounded-full" />
                    ))}
                </div>
            </div>

            <div className="flex-1 space-y-3 mt-2">
                <Skeleton className="size-8 rounded-lg opacity-10 mb-2" />
                <Skeleton className="h-3.5 w-full" />
                <Skeleton className="h-3.5 w-[95%]" />
                <Skeleton className="h-3.5 w-[80%]" />
            </div>

            <div className="pt-4 border-t border-stone-50 flex justify-between items-center mt-4">
                <Skeleton className="h-6 w-20 rounded" />
            </div>
        </div>
    );
}
