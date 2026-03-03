import React from "react";
import { Skeleton } from "./ui/skeleton";
import { Card } from "./ui/card";

export function ScholarshipCardSkeleton() {
    return (
        <Card className="relative p-0 overflow-hidden border border-stone-100 shadow-md rounded-3xl bg-white flex flex-col md:flex-row h-auto md:h-64">
            {/* Image Skeleton */}
            <div className="relative w-full md:w-80 shrink-0 overflow-hidden h-48 md:h-full bg-stone-100">
                <Skeleton className="w-full h-full rounded-none" />
                <div className="absolute top-4 left-4">
                    <Skeleton className="h-8 w-8 rounded-full" />
                </div>
            </div>

            {/* Info Skeleton */}
            <div className="p-6 flex flex-col flex-1 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="space-y-2">
                        <Skeleton className="h-3 w-24" />
                        <Skeleton className="h-6 w-48" />
                    </div>
                    <Skeleton className="h-6 w-24 rounded-full" />
                </div>

                <div className="flex flex-wrap gap-2">
                    <Skeleton className="h-6 w-20 rounded-full" />
                    <Skeleton className="h-6 w-24 rounded-full" />
                    <Skeleton className="h-6 w-16 rounded-full" />
                </div>

                <div className="mt-auto flex items-end justify-between">
                    <div className="space-y-2">
                        <Skeleton className="h-3 w-20" />
                        <Skeleton className="h-6 w-32" />
                    </div>
                    <Skeleton className="h-10 w-32 rounded-xl" />
                </div>
            </div>
        </Card>
    );
}

export function ScholarshipDetailSkeleton() {
    return (
        <div className="min-h-screen bg-stone-50 pd-20 md:pd-24">
            {/* Hero Skeleton */}
            <div className="relative w-full h-[40vh] md:h-[55vh] bg-stone-200 mt-16 md:mt-20">
                <Skeleton className="w-full h-full rounded-none" />
                <div className="absolute inset-0 flex flex-col justify-end pb-12 px-6 md:px-12 max-w-7xl mx-auto space-y-4">
                    <Skeleton className="h-9 w-48 rounded-full" />
                    <div className="flex gap-2">
                        <Skeleton className="h-6 w-32 rounded-full" />
                        <Skeleton className="h-6 w-32 rounded-full" />
                    </div>
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-10 w-full md:w-2/3" />
                </div>
            </div>

            {/* Content Skeleton */}
            <div className="max-w-7xl mx-auto px-4 md:px-12 py-12 md:py-20 grid grid-cols-1 lg:grid-cols-3 gap-12">
                <div className="lg:col-span-2 space-y-10">
                    <div className="bg-white rounded-2xl p-8 border border-stone-200 shadow-sm flex flex-wrap gap-12">
                        <div className="space-y-2"><Skeleton className="h-3 w-16" /><Skeleton className="h-6 w-32" /></div>
                        <div className="space-y-2"><Skeleton className="h-3 w-16" /><Skeleton className="h-6 w-32" /></div>
                        <div className="space-y-2"><Skeleton className="h-3 w-16" /><Skeleton className="h-6 w-32" /></div>
                    </div>
                    <div className="bg-white rounded-2xl p-10 border border-stone-200 shadow-sm space-y-6">
                        <Skeleton className="h-8 w-48" />
                        <div className="space-y-3">
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-3/4" />
                        </div>
                        <div className="space-y-3">
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-5/6" />
                        </div>
                    </div>
                </div>
                <div className="lg:col-span-1">
                    <Card className="p-8 border border-stone-200 shadow-xl bg-white rounded-3xl space-y-6">
                        <Skeleton className="h-6 w-48" />
                        <Skeleton className="h-4 w-full" />
                        <div className="p-6 bg-stone-50 rounded-2xl border border-stone-100"><Skeleton className="h-10 w-full" /></div>
                        <div className="space-y-3">
                            <Skeleton className="h-4 w-full" /><Skeleton className="h-4 w-full" /><Skeleton className="h-4 w-full" />
                        </div>
                        <Skeleton className="h-12 w-full rounded-xl" />
                    </Card>
                </div>
            </div>
        </div>
    );
}
