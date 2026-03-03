import React from 'react';
import { DashboardLayout } from './components/Layout';
import { ProjectReferral } from './components/ProjectReferral';
import { Sparkles, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useStore } from './store';
import SEO from './components/SEO';

export default function Arcade() {
    const { currentUser } = useStore();

    return (
        <DashboardLayout>
            <SEO
                title="Pengu Arcade | Partnership"
                description="Partner with Pengu and earn 30% commission on referrals."
                url="https://pengu.work.gd/arcade"
            />

            <div className="max-w-6xl mx-auto space-y-8 pb-20">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <Link to={currentUser?.role === 'expert' ? '/expert/dashboard' : '/student/dashboard'}>
                            <button className="p-2.5 hover:bg-stone-100 rounded-full transition-all active:scale-90 bg-white shadow-sm border border-stone-100">
                                <ArrowLeft className="size-6 text-stone-600" />
                            </button>
                        </Link>
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <span className="size-1.5 bg-amber-500 rounded-full animate-pulse" />
                                <span className="text-[10px] font-black text-amber-600 uppercase tracking-widest">Exclusive Program</span>
                            </div>
                            <h1 className="text-3xl font-black text-[#3E2723] tracking-tight flex items-center gap-3">
                                <Sparkles className="size-8 text-amber-500" />
                                Pengu Arcade
                            </h1>
                            <p className="text-stone-500">The premium partnership engine. Refer clients, track deals, and earn massive payouts.</p>
                        </div>
                    </div>
                </div>

                {/* Restored Partnership System */}
                <ProjectReferral />

                {/* Info Section */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
                    <div className="bg-stone-50 p-6 rounded-3xl border border-stone-100">
                        <h4 className="font-bold text-stone-900 mb-2">How it works</h4>
                        <p className="text-xs text-stone-500 leading-relaxed">
                            Submit leads for businesses needing IT services (Web, Apps, SEO). Our sales team takes over and closes the deal.
                        </p>
                    </div>
                    <div className="bg-stone-50 p-6 rounded-3xl border border-stone-100">
                        <h4 className="font-bold text-stone-900 mb-2">30% Commission</h4>
                        <p className="text-xs text-stone-500 leading-relaxed">
                            Once the client pays, 30% of the total project value is credited to your wallet instantly. No caps, no limits.
                        </p>
                    </div>
                    <div className="bg-stone-50 p-6 rounded-3xl border border-stone-100">
                        <h4 className="font-bold text-stone-900 mb-2">Real-time Tracking</h4>
                        <p className="text-xs text-stone-500 leading-relaxed">
                            Monitor every stage of your lead from "Pending" to "Won" directly in your Pengu Pipeline above.
                        </p>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
