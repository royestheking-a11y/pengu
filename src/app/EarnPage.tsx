import React from 'react';
import { useStore } from './store';
import { DashboardLayout } from './components/Layout';
import { Card } from './components/ui/card';
import { Button } from './components/ui/button';
import { Wallet, Info, ArrowLeft, Loader2, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

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
            <div className="space-y-8">
                {/* Header */}
                <Link to="/student/dashboard" className="flex items-center gap-4">
                    <button className="p-2 hover:bg-stone-100 rounded-full transition-colors">
                        <ArrowLeft className="size-6 text-stone-600" />
                    </button>
                    <div>
                        <h1 className="text-3xl font-black text-stone-900 tracking-tight">Pengu Arcade</h1>
                        <p className="text-stone-500">Complete surveys and tasks to earn credits instantly.</p>
                    </div>
                </Link>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="p-6 bg-gradient-to-br from-[#5D4037] to-[#3E2723] text-white overflow-hidden relative group shadow-xl border-none col-span-1 md:col-span-2">
                        <div className="relative z-10 flex items-center justify-between">
                            <div>
                                <p className="text-[10px] font-bold text-stone-300 uppercase tracking-widest mb-1">Your Balance</p>
                                <div className="flex items-baseline gap-2">
                                    <h3 className="text-4xl font-black">{(currentUser?.pengu_credits || 0).toLocaleString()}</h3>
                                    <span className="text-sm font-medium text-stone-300">Credits</span>
                                </div>
                                <p className="text-xs text-stone-400 mt-1 font-medium italic">≈ ৳{((currentUser?.pengu_credits || 0) * 1.2).toLocaleString()} BDT</p>
                            </div>
                            <div className="p-4 bg-white/10 rounded-2xl backdrop-blur-md">
                                <Wallet className="size-8 text-amber-300" />
                            </div>
                        </div>
                    </Card>

                    <div className="bg-[#5D4037] text-white p-6 rounded-3xl flex flex-col justify-center gap-2 shadow-xl relative overflow-hidden">
                        <div className="flex items-center gap-2 text-amber-300 mb-1">
                            <Info className="size-4" />
                            <span className="text-[10px] font-bold uppercase tracking-wider">Quick Note</span>
                        </div>
                        <p className="text-sm text-stone-200 leading-tight relative z-10">
                            100 Credits = ৳120 BDT. Withdrawals are processed within 24 hours.
                        </p>
                        <div className="absolute -right-4 -bottom-4 opacity-10">
                            <Sparkles size={80} />
                        </div>
                    </div>
                </div>


                {/* Offerwall Iframe */}
                <Card className="overflow-hidden border-none shadow-2xl rounded-3xl bg-white min-h-[700px]">
                    <iframe
                        src={`https://offers.cpx-research.com/index.php?app_id=31577&ext_user_id=${currentUser.id}`}
                        width="100%"
                        height="700px"
                        frameBorder="0"
                        className="w-full h-[700px] rounded-3xl"
                        title="CPX Research Offerwall"
                    ></iframe>
                </Card>
            </div>
        </DashboardLayout>
    );
}
