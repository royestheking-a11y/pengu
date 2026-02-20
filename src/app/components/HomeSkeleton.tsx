import React from 'react';
import { Skeleton } from './ui/skeleton';

export function HomeSkeleton() {
    return (
        <div className="min-h-screen bg-white">
            {/* Navbar Placeholder */}
            <div className="h-20 border-b border-stone-100 bg-white px-4 md:px-8 flex items-center justify-between sticky top-0 z-50">
                <Skeleton className="h-8 w-32" />
                <div className="hidden md:flex gap-8">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-20" />
                </div>
                <div className="flex gap-4">
                    <Skeleton className="h-10 w-24 rounded-full" />
                    <Skeleton className="h-10 w-24 rounded-full" />
                </div>
            </div>

            {/* Hero Section Placeholder - Matches #3E2723 (Dark Brown) */}
            <div className="bg-[#3E2723] p-4 md:p-8 pt-6 pb-24 relative overflow-hidden">
                <div className="max-w-[1400px] mx-auto space-y-8">
                    {/* Carousel Skeleton */}
                    <Skeleton className="w-full aspect-[16/9] md:h-[600px] rounded-[32px] bg-white/5" />

                    {/* Smart Actions Placeholder - Overlapping */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-5xl mx-auto -mb-32 relative z-20 translate-y-16">
                        {[1, 2, 3].map((i) => (
                            <Skeleton key={i} className="h-32 rounded-2xl bg-white shadow-lg" />
                        ))}
                    </div>
                </div>
            </div>

            {/* Services Section Placeholder - Abstracted matched height & bg-stone-50 */}
            <div className="bg-stone-50 pt-48 pb-24 border-b border-stone-100">
                <div className="max-w-7xl mx-auto px-4 space-y-12">
                    <div className="space-y-4 text-center max-w-2xl mx-auto">
                        <Skeleton className="h-4 w-32 mx-auto bg-stone-200" />
                        <Skeleton className="h-10 w-3/4 mx-auto bg-stone-200" />
                        <Skeleton className="h-6 w-1/2 mx-auto bg-stone-200" />
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="p-6 border border-stone-100 rounded-2xl bg-white h-64 space-y-4">
                                <Skeleton className="h-12 w-12 rounded-xl bg-stone-100" />
                                <Skeleton className="h-6 w-3/4 bg-stone-100" />
                                <Skeleton className="h-20 w-full bg-stone-100" />
                                <Skeleton className="h-4 w-24 bg-stone-100" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Value Proposition & Reviews Placeholder */}
            <div className="bg-white py-24">
                <div className="max-w-7xl mx-auto px-4 space-y-24">
                    {/* Value Prop Grid */}
                    <div className="grid md:grid-cols-3 gap-8">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="p-8 rounded-2xl border border-stone-100 space-y-4">
                                <Skeleton className="h-14 w-14 rounded-xl bg-stone-100" />
                                <Skeleton className="h-6 w-1/2 bg-stone-100" />
                                <Skeleton className="h-16 w-full bg-stone-100" />
                            </div>
                        ))}
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="bg-stone-50 p-6 rounded-2xl h-40 flex flex-col items-center justify-center space-y-3">
                                <Skeleton className="h-10 w-10 rounded-lg bg-stone-200" />
                                <Skeleton className="h-8 w-16 bg-stone-200" />
                                <Skeleton className="h-4 w-24 bg-stone-200" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* FAQ Sections Placeholder */}
            <div className="bg-white py-24 border-t border-stone-100">
                <div className="max-w-3xl mx-auto px-4 space-y-8">
                    <div className="text-center space-y-4">
                        <Skeleton className="h-8 w-64 mx-auto bg-stone-100" />
                        <Skeleton className="h-4 w-96 mx-auto bg-stone-100" />
                    </div>
                    {[1, 2, 3, 4].map((i) => (
                        <Skeleton key={i} className="h-20 w-full rounded-xl bg-stone-50" />
                    ))}
                </div>
            </div>

            {/* CTA Footer Placeholder */}
            <div className="py-12 bg-white">
                <div className="max-w-7xl mx-auto px-4">
                    <Skeleton className="h-80 w-full rounded-3xl bg-[#3E2723] opacity-10" />
                </div>
            </div>
        </div>
    );
}
