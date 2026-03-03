import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    FileText,
    Upload,
    MapPin,
    GraduationCap,
    CheckCircle2,
    Clock,
    Lock,
    Wallet,
    ShieldCheck,
    ChevronRight,
    Download,
    Activity,
    Award
} from 'lucide-react';
import { Button } from './components/ui/button';
import { Card } from './components/ui/card';
import { Badge } from './components/ui/badge';
import { toast } from 'sonner';
import api from '../lib/api';
import { useStore } from './store';
import { Skeleton } from './components/ui/skeleton';
import { DashboardLayout } from './components/Layout';
import SEO from './components/SEO';
import PaymentModal from './components/PaymentModal';

interface Document {
    _id: string;
    name: string;
    url: string;
    type: string;
    uploadedAt: string;
}

interface Application {
    _id: string;
    scholarshipId: {
        title: string;
        country: string;
        deadline: string;
    };
    expertId?: {
        name: string;
        avatar: string;
    };
    status: 'REQUEST_SENT' | 'QUOTE_PROVIDED' | 'PENDING_VERIFICATION' | 'QUOTE_ACCEPTED' | 'EXPERT_ASSIGNED' | 'FINAL_REVIEW' | 'COMPLETED';
    customQuoteAmount?: number;
    documentVault: Document[];
    finalReceipts: Document[];
    updatedAt: string;
}

const STATUS_STEPS = [
    { id: 'REQUEST_SENT', label: 'Request Sent', desc: 'Evaluating your profile' },
    { id: 'QUOTE_PROVIDED', label: 'Quote Ready', desc: 'Awaiting your approval' },
    { id: 'PENDING_VERIFICATION', label: 'Verifying Payment', desc: 'Admin checking txn' },
    { id: 'QUOTE_ACCEPTED', label: 'Payment Verified', desc: 'Funds secured' },
    { id: 'EXPERT_ASSIGNED', label: 'Expert Assigned', desc: 'Drafting in progress' },
    { id: 'FINAL_REVIEW', label: 'Final Review', desc: 'Admin checking quality' },
    { id: 'COMPLETED', label: 'Submitted!', desc: 'Receipts available' },
];

import { ScholarshipApplication as StoreApplication } from './store';

export function ScholarshipApplication() {
    const { currentUser, scholarshipApplications, acceptScholarshipQuote, isInitialized } = useStore();
    // Example upload state
    const [isUploading, setIsUploading] = useState(false);

    const [paymentModal, setPaymentModal] = useState<{ open: boolean, applicationId: string | null, amount: number }>({ open: false, applicationId: null, amount: 0 });

    const handlePaymentSuccess = async (transactionId?: string, method?: string) => {
        if (!paymentModal.applicationId) return;

        const success = await acceptScholarshipQuote(paymentModal.applicationId, paymentModal.amount, {
            transactionId,
            method,
            phoneNumber: '' // We can capture this if needed, for now standard manual payment
        });

        if (success) {
            toast.success(`Payment proof submitted for ৳${paymentModal.amount}. Awaiting admin verification.`);
        }
    };

    const handleFileUpload = async (applicationId: string, type: string, e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        // Simulate upload delay
        setTimeout(() => {
            setIsUploading(false);
            toast.success(`${file.name} securely uploaded to vault.`);
            // In real implementation, we'd upload to Cloudinary/S3, get URL, and PUT to application docVault
        }, 1500);
    };

    const getStepIndex = (status: string) => {
        return STATUS_STEPS.findIndex(s => s.id === status);
    };

    return (
        <DashboardLayout>
            <SEO
                title="Scholarship Application Tracker"
                description="Track your scholarship applications, manage documents, and coordinate with experts."
                url="https://pengu.work.gd/student/scholarships"
            />
            <div className="space-y-6">
                <div className="bg-[#3E2723] text-white p-8 rounded-2xl relative overflow-hidden shadow-lg border border-[#3E2723]/80">
                    <div className="absolute right-0 top-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
                    <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div>
                            <span className="flex items-center gap-2 text-amber-400 font-bold text-sm tracking-widest uppercase mb-3">
                                <Activity className="size-4" /> Application Tracker
                            </span>
                            <h1 className="text-3xl font-bold mb-2">Your Scholarship Journey</h1>
                            <p className="text-stone-300 max-w-xl">
                                Track your pending applications, pay securely via escrow, and upload documents to your encrypted vault.
                            </p>
                        </div>
                        <div className="bg-white/10 p-4 rounded-xl backdrop-blur-sm border border-white/20 shrink-0">
                            <div className="text-xs text-stone-300 uppercase tracking-widest font-bold mb-1">Active Applications</div>
                            <div className="flex items-center gap-2">
                                <Activity className="size-5 text-amber-400" />
                                <span className="text-2xl font-bold text-white">{scholarshipApplications.length}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {!isInitialized ? (
                    <div className="space-y-6">
                        <Skeleton className="h-64 rounded-2xl" />
                        <Skeleton className="h-64 rounded-2xl" />
                    </div>
                ) : scholarshipApplications.length === 0 ? (
                    <Card className="text-center py-20 border-dashed">
                        <GraduationCap className="size-16 text-stone-200 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-stone-900 mb-2">No Active Applications</h3>
                        <p className="text-stone-500 mb-6 max-w-sm mx-auto">
                            You haven't requested any expert assistance yet. Head over to the Discovery Board to find matches!
                        </p>
                        <Button className="bg-[#5D4037] hover:bg-[#3E2723] text-white" onClick={() => window.location.href = '/scholarships'}>
                            Browse Scholarships
                        </Button>
                    </Card>
                ) : (
                    <div className="space-y-8">
                        {scholarshipApplications.map((app) => {
                            const currentStepIdx = getStepIndex(app.status);
                            const scholarship = typeof app.scholarshipId === 'object' ? app.scholarshipId : null;
                            const expert = typeof app.expertId === 'object' ? app.expertId : null;

                            if (!scholarship) return null;

                            return (
                                <Card key={app.id} className="overflow-hidden border border-stone-200 shadow-sm">
                                    {/* Header Info */}
                                    <div className="p-6 border-b border-stone-100 bg-stone-50 border-l-4 border-l-amber-500">
                                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                            <div>
                                                <h3 className="text-xl font-bold text-stone-900 mb-1">{scholarship.title}</h3>
                                                <div className="flex items-center gap-4 text-sm text-stone-500">
                                                    <span className="flex items-center gap-1"><MapPin className="size-3.5" /> {scholarship.country}</span>
                                                    <span className="flex items-center gap-1"><Clock className="size-3.5" /> Deadline: {new Date(scholarship.deadline).toLocaleDateString()}</span>
                                                </div>
                                            </div>

                                            {/* Quote Action Block if Quote Provided */}
                                            {app.status === 'QUOTE_PROVIDED' && app.customQuoteAmount && (
                                                <div className="shrink-0 bg-white p-4 rounded-xl border border-amber-200 shadow-sm flex items-center gap-4 animate-in fade-in slide-in-from-right-4">
                                                    <div className="text-right">
                                                        <div className="text-xs text-stone-500 font-bold uppercase tracking-wider mb-0.5">Custom Quote</div>
                                                        <div className="text-xl font-bold text-[#3E2723]">৳ {app.customQuoteAmount.toLocaleString()}</div>
                                                    </div>
                                                    <Button
                                                        onClick={() => setPaymentModal({ open: true, applicationId: app.id, amount: app.customQuoteAmount! })}
                                                        className="bg-amber-500 hover:bg-amber-400 text-white font-bold"
                                                    >
                                                        <ShieldCheck className="size-4 mr-2" /> Pay now
                                                    </Button>
                                                </div>
                                            )}

                                            {/* Pending Verification Notice */}
                                            {app.status === 'PENDING_VERIFICATION' && (
                                                <div className="shrink-0 bg-blue-50 p-4 rounded-xl border border-blue-200 shadow-sm flex items-center gap-4 animate-in fade-in slide-in-from-right-4">
                                                    <div className="text-right">
                                                        <div className="text-xs text-blue-500 font-bold uppercase tracking-wider mb-0.5">Status</div>
                                                        <div className="text-sm font-bold text-blue-900">Payment Under Review</div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="p-6 md:p-8">
                                        {/* Pizza Tracker Timeline */}
                                        <div className="mb-12">
                                            <h4 className="font-bold text-stone-900 mb-6 flex items-center gap-2">
                                                Live Status Tracker <span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span></span>
                                            </h4>
                                            <div className="relative overflow-x-auto pb-6 -mx-4 px-4 md:mx-0 md:px-0 scrollbar-hide">
                                                <div className="relative min-w-[600px] md:min-w-0">
                                                    {/* Progress Bar Background */}
                                                    <div className="absolute top-5 left-0 w-full h-1 bg-stone-100 rounded-full"></div>
                                                    {/* Progress Fill */}
                                                    <div
                                                        className="absolute top-5 left-0 h-1 bg-gradient-to-r from-amber-400 to-emerald-500 rounded-full transition-all duration-1000"
                                                        style={{ width: `${(currentStepIdx / (STATUS_STEPS.length - 1)) * 100}%` }}
                                                    ></div>

                                                    <div className="relative flex justify-between">
                                                        {STATUS_STEPS.map((step, idx) => {
                                                            const isCompleted = idx < currentStepIdx;
                                                            const isCurrent = idx === currentStepIdx;

                                                            return (
                                                                <div key={step.id} className="flex flex-col items-center w-24 text-center">
                                                                    <div className={`size-10 rounded-full flex items-center justify-center font-bold text-sm mb-3 shadow-md transition-all z-10 
                                        ${isCompleted ? 'bg-emerald-500 text-white border-none' :
                                                                            isCurrent ? 'bg-amber-400 text-[#3E2723] border-4 border-white scale-110 shadow-lg' :
                                                                                'bg-white text-stone-400 border-2 border-stone-200'}`}
                                                                    >
                                                                        {isCompleted ? <CheckCircle2 className="size-5" /> : idx + 1}
                                                                    </div>
                                                                    <div className={`text-xs font-bold leading-tight ${isCurrent ? 'text-stone-900' : 'text-stone-500'}`}>{step.label}</div>
                                                                    <div className="text-[10px] text-stone-400 mt-1 leading-tight">{step.desc}</div>
                                                                </div>
                                                            )
                                                        })}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid md:grid-cols-2 gap-8">
                                            {/* Secure Document Vault */}
                                            <div className="bg-stone-50 rounded-xl p-6 border border-stone-200">
                                                <div className="flex items-center gap-2 mb-4 border-b border-stone-200 pb-4">
                                                    <Lock className="size-5 text-stone-400" />
                                                    <h4 className="font-bold text-stone-900">Secure Document Vault</h4>
                                                </div>
                                                <p className="text-xs text-stone-500 mb-4 leading-relaxed">
                                                    Only your assigned expert can view these files. Upload raw CVs, passports, or transcripts safely.
                                                </p>

                                                {/* Upload Grid */}
                                                <div className="space-y-3 mb-6">
                                                    {['CV/Resume', 'Transcript', 'Passport / ID'].map((type) => {
                                                        const alreadyUploaded = app.documentVault.find(d => d.type === type);

                                                        return (
                                                            <div key={type} className="flex justify-between items-center p-3 bg-white rounded-lg border border-stone-100 shadow-sm">
                                                                <div className="flex items-center gap-3">
                                                                    <FileText className={`size-5 ${alreadyUploaded ? 'text-emerald-500' : 'text-stone-400'}`} />
                                                                    <div>
                                                                        <div className="text-sm font-bold text-stone-900">{type}</div>
                                                                        <div className="text-xs text-stone-500">{alreadyUploaded ? 'Verified' : 'Required'}</div>
                                                                    </div>
                                                                </div>
                                                                {alreadyUploaded ? (
                                                                    <Badge className="bg-emerald-50 text-emerald-600 hover:bg-emerald-50 border-none">
                                                                        <CheckCircle2 className="size-3 mr-1" /> Uploaded
                                                                    </Badge>
                                                                ) : (
                                                                    <div className="relative">
                                                                        <Button variant="outline" size="sm" className="h-8 text-xs cursor-pointer" disabled={app.status === 'REQUEST_SENT' || isUploading}>
                                                                            <Upload className="size-3 mr-2" /> {isUploading ? 'Encrypting...' : 'Upload'}
                                                                        </Button>
                                                                        <input
                                                                            type="file"
                                                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                                                                            disabled={app.status === 'REQUEST_SENT'} // Only allow upload after quote is provided
                                                                            onChange={(e) => handleFileUpload(app.id, type, e)}
                                                                        />
                                                                    </div>
                                                                )}
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>

                                            {/* Expert Assignment & Final Receipts */}
                                            <div className="space-y-6">
                                                {/* Assigned Expert Panel */}
                                                {expert ? (
                                                    <div className="bg-white rounded-xl p-4 border border-indigo-100 shadow-sm flex items-center gap-4">
                                                        <img src={expert.avatar || '/assets/avatars/default.png'} alt="Expert" className="size-12 rounded-full border border-stone-200" />
                                                        <div>
                                                            <div className="text-xs font-bold text-indigo-500 tracking-wider uppercase mb-0.5">Assigned Expert</div>
                                                            <div className="font-bold text-stone-900">{expert.name}</div>
                                                            <div className="text-xs text-stone-500">Currently managing your application</div>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="bg-stone-50 rounded-xl p-6 border border-stone-200 text-center border-dashed">
                                                        <ShieldCheck className="size-8 text-stone-300 mx-auto mb-2" />
                                                        <div className="text-sm font-bold text-stone-900">Awaiting Assignment</div>
                                                        <div className="text-xs text-stone-500">Once escrow is funded, a verified expert will be assigned to your case immediately.</div>
                                                    </div>
                                                )}

                                                {/* Final Receipts Card (Locked until Complete) */}
                                                <div className={`rounded-xl p-6 border transition-all ${currentStepIdx >= 5 ? 'bg-emerald-50 border-emerald-200' : 'bg-stone-50 border-stone-200 opacity-60'}`}>
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <Award className={`size-5 ${currentStepIdx >= 5 ? 'text-emerald-500' : 'text-stone-400'}`} />
                                                        <h4 className={`font-bold ${currentStepIdx >= 5 ? 'text-emerald-900' : 'text-stone-900'}`}>Official Submission Receipts</h4>
                                                    </div>
                                                    <p className="text-xs text-stone-500 mb-4 leading-relaxed">
                                                        Download the final redacted PDFs and confirmation emails submitted to the university portal.
                                                    </p>

                                                    {currentStepIdx >= 5 && app.finalReceipts.length > 0 ? (
                                                        <div className="space-y-2">
                                                            {app.finalReceipts.map((receipt, idx) => (
                                                                <Button key={idx} variant="outline" className="w-full justify-start text-xs bg-white border-emerald-200 text-emerald-700 hover:bg-emerald-100 h-9">
                                                                    <Download className="size-3.5 mr-2" /> {receipt.name}
                                                                </Button>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <div className="text-xs text-stone-400 font-medium flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-stone-200">
                                                            <Lock className="size-3" /> Locked until final review
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                        </div>
                                    </div>
                                </Card>
                            );
                        })}
                    </div>
                )}
            </div>

            <PaymentModal
                isOpen={paymentModal.open}
                amount={paymentModal.amount}
                onClose={() => setPaymentModal({ open: false, applicationId: null, amount: 0 })}
                onSuccess={handlePaymentSuccess}
                hideBalanceOption={true}
            />
        </DashboardLayout>
    );
}
