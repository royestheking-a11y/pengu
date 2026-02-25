import React from 'react';
import { useStore } from './store';
import { DashboardLayout } from './components/Layout';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ProjectReferral } from './components/ProjectReferral';

export default function EarnPage() {
    const { currentUser, isInitialized } = useStore();

    if (!isInitialized || !currentUser) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center min-h-[400px]">
                    <Loader2 className="animate-spin size-8 text-[#5D4037]" />
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="space-y-8 max-w-6xl mx-auto">
                {/* Header */}
                <Link to={currentUser.role === 'expert' ? '/expert/dashboard' : '/student/dashboard'} className="flex items-center gap-4">
                    <button className="p-2 hover:bg-stone-100 rounded-full transition-colors">
                        <ArrowLeft className="size-6 text-stone-600" />
                    </button>
                    <div>
                        <h1 className="text-3xl font-black text-stone-900 tracking-tight">Partner Program</h1>
                        <p className="text-stone-500">Refer businesses requiring IT services and earn massive payouts instantly.</p>
                    </div>
                </Link>

                <ProjectReferral />
            </div>
        </DashboardLayout>
    );
}
