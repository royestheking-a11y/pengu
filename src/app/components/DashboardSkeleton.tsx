import React from 'react';
import { Skeleton } from './ui/skeleton';

export function DashboardSkeleton() {
    return (
        <div className="flex h-screen bg-[#FAFAFA]">
            {/* Sidebar Skeleton */}
            <div className="w-64 bg-white border-r border-stone-200 hidden md:block p-4 space-y-6">
                <div className="flex items-center gap-2 mb-8">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <Skeleton className="h-6 w-32" />
                </div>
                <div className="space-y-3">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <Skeleton key={i} className="h-10 w-full rounded-lg" />
                    ))}
                </div>
            </div>

            {/* Main Content Skeleton */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Header Skeleton */}
                <header className="h-16 bg-white border-b border-stone-200 flex items-center justify-between px-8">
                    <Skeleton className="h-8 w-48" />
                    <div className="flex items-center gap-4">
                        <Skeleton className="h-8 w-8 rounded-full" />
                        <Skeleton className="h-8 w-24 rounded-full" />
                    </div>
                </header>

                {/* Dashboard Content Skeleton */}
                <main className="flex-1 overflow-y-auto p-8 space-y-8">
                    {/* Welcome/Stats Skeleton */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[1, 2, 3].map((i) => (
                            <Skeleton key={i} className="h-32 rounded-xl" />
                        ))}
                    </div>

                    {/* Recent Activity/List Skeleton */}
                    <div className="bg-white rounded-xl border border-stone-200 p-6 space-y-4">
                        <Skeleton className="h-8 w-48 mb-4" />
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="flex items-center justify-between py-4 border-b border-stone-100 last:border-0 h-16">
                                <div className="space-y-2">
                                    <Skeleton className="h-4 w-64" />
                                    <Skeleton className="h-3 w-32" />
                                </div>
                                <Skeleton className="h-8 w-20 rounded-full" />
                            </div>
                        ))}
                    </div>
                </main>
            </div>
        </div>
    );
}
