import React, { useState } from 'react';
import { useStore } from '../store';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { DashboardLayout } from '../components/Layout';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import {
    GraduationCap,
    MapPin,
    User,
    Clock,
    ArrowLeft,
    ShieldCheck,
    FileText,
    CheckCircle2,
    ExternalLink,
    Award,
    Users
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

export default function AdminScholarshipRequest() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { scholarshipApplications, experts, provideScholarshipQuote, assignScholarshipExpert, completeScholarshipApplication, verifyScholarshipPayment } = useStore();

    const application = scholarshipApplications.find(a => a.id === id);
    // ... same logic for scholarship, student, expert ...
    const scholarship = application && typeof application.scholarshipId === 'object' ? application.scholarshipId : null;
    const student = application && typeof application.studentId === 'object' ? application.studentId : null;
    const assignedExpert = application && typeof application.expertId === 'object' ? application.expertId : null;

    const [quoteAmount, setQuoteAmount] = useState(application?.customQuoteAmount || 0);
    const [selectedExpertId, setSelectedExpertId] = useState(typeof application?.expertId === 'string' ? application.expertId : (assignedExpert as any)?.id || '');

    if (!application) {
        return (
            <DashboardLayout>
                <div className="p-8 text-center">
                    <p className="text-stone-500">Application not found.</p>
                    <Button variant="link" onClick={() => navigate('/admin/scholarship-requests')}>Go Back</Button>
                </div>
            </DashboardLayout>
        );
    }

    const handleProvideQuote = () => {
        if (quoteAmount <= 0) {
            toast.error("Please enter a valid quote amount");
            return;
        }
        provideScholarshipQuote(application.id, quoteAmount);
    };

    const handleAssignExpert = () => {
        if (!selectedExpertId) {
            toast.error("Please select an expert");
            return;
        }
        assignScholarshipExpert(application.id, selectedExpertId);
    };

    const handleVerifyPayment = () => {
        verifyScholarshipPayment(application.id);
    };

    const handleComplete = () => {
        if (window.confirm("Are you sure you want to mark this application as completed? This will release funds and notify the student.")) {
            completeScholarshipApplication(application.id);
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'REQUEST_SENT': return <Badge className="bg-amber-100 text-amber-800 border-amber-200">New Request</Badge>;
            case 'QUOTE_PROVIDED': return <Badge className="bg-blue-100 text-blue-800 border-blue-200">Quoted</Badge>;
            case 'PENDING_VERIFICATION': return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Verification Pending</Badge>;
            case 'QUOTE_ACCEPTED': return <Badge className="bg-indigo-100 text-indigo-800 border-indigo-200">Paid (Verified)</Badge>;
            case 'EXPERT_ASSIGNED': return <Badge className="bg-purple-100 text-purple-800 border-purple-200">Working</Badge>;
            case 'FINAL_REVIEW': return <Badge className="bg-orange-100 text-orange-800 border-orange-200">In Review</Badge>;
            case 'COMPLETED': return <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">Completed</Badge>;
            default: return <Badge variant="outline">{status}</Badge>;
        }
    };

    return (
        <DashboardLayout>
            <div className="max-w-5xl mx-auto space-y-6">
                <Link to="/admin/scholarship-requests" className="flex items-center gap-2 text-stone-500 hover:text-stone-800 transition-colors mb-4">
                    <ArrowLeft className="size-4" /> Back to Applications
                </Link>

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-[#3E2723] rounded-2xl text-white shadow-lg">
                            <GraduationCap className="size-8" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-stone-900">Application Review</h1>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="text-sm text-stone-500">ID: {application.id.slice(-8).toUpperCase()}</span>
                                {getStatusBadge(application.status)}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    <div className="md:col-span-2 space-y-6">
                        {/* Student & Scholarship Info */}
                        <Card className="p-6 border-stone-200">
                            <h3 className="font-bold text-stone-900 mb-6 flex items-center gap-2">
                                <FileText className="size-5 text-stone-400" /> Intake Details
                            </h3>

                            <div className="grid md:grid-cols-2 gap-8 mb-8">
                                <div className="space-y-4">
                                    <div>
                                        <Label className="text-stone-400 text-[10px] uppercase font-bold tracking-wider">Scholarship</Label>
                                        <p className="font-bold text-stone-900">{(scholarship as any)?.title || 'Unknown'}</p>
                                        <p className="text-xs text-stone-500 flex items-center gap-1 mt-0.5">
                                            <MapPin className="size-3" /> {(scholarship as any)?.country}
                                        </p>
                                    </div>
                                    <div>
                                        <Label className="text-stone-400 text-[10px] uppercase font-bold tracking-wider">Target Major</Label>
                                        <p className="font-bold text-stone-900">{application.major}</p>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <Label className="text-stone-400 text-[10px] uppercase font-bold tracking-wider">Student</Label>
                                        <div className="flex items-center gap-3 mt-1">
                                            <div className="size-10 rounded-full bg-stone-100 flex items-center justify-center border border-stone-200 overflow-hidden">
                                                {(student as any)?.avatar ? (
                                                    <img src={(student as any)?.avatar} alt="Student" className="w-full h-full object-cover" />
                                                ) : (
                                                    <User className="size-5 text-stone-400" />
                                                )}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="font-bold text-stone-900 truncate">{(student as any)?.name || 'Unknown'}</p>
                                                <p className="text-xs text-stone-500 truncate">{(student as any)?.email}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex gap-8">
                                        <div>
                                            <Label className="text-stone-400 text-[10px] uppercase font-bold tracking-wider">CGPA</Label>
                                            <p className="font-bold text-stone-900">{application.cgpa.toFixed(2)}</p>
                                        </div>
                                        <div>
                                            <Label className="text-stone-400 text-[10px] uppercase font-bold tracking-wider">IELTS</Label>
                                            <p className="font-bold text-stone-900">{application.ielts || 'N/A'}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-6 border-t border-stone-100">
                                <h4 className="font-bold text-stone-900 mb-4 text-sm">Document Vault</h4>
                                {application.documentVault.length === 0 ? (
                                    <p className="text-sm text-stone-500 italic">No documents uploaded yet.</p>
                                ) : (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {application.documentVault.map((doc, idx) => (
                                            <a key={idx} href={doc.url} target="_blank" rel="noopener noreferrer"
                                                className="flex items-center justify-between p-3 bg-stone-50 rounded-xl border border-stone-200 hover:bg-stone-100 transition-colors group">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 bg-white rounded-lg text-stone-400 group-hover:text-[#3E2723]">
                                                        <FileText className="size-4" />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="text-xs font-bold text-stone-900 truncate">{doc.name || doc.type}</p>
                                                        <p className="text-[10px] text-stone-500 uppercase">{doc.type}</p>
                                                    </div>
                                                </div>
                                                <ExternalLink className="size-3 text-stone-300 group-hover:text-stone-500" />
                                            </a>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </Card>

                        {/* Workflow Timeline */}
                        <Card className="p-6 border-stone-200">
                            <h3 className="font-bold text-stone-900 mb-6 flex items-center gap-2">
                                <Clock className="size-5 text-stone-400" /> Application Journey
                            </h3>
                            <div className="space-y-6 relative ml-3 border-l-2 border-stone-100 pb-2">
                                <div className="relative pl-8">
                                    <div className="absolute left-[-9px] top-0 size-4 rounded-full bg-emerald-500 border-4 border-white shadow-sm" />
                                    <p className="text-xs font-bold text-stone-900 uppercase tracking-wider mb-1">Intake Submitted</p>
                                    <p className="text-xs text-stone-500">{format(new Date(application.createdAt), 'PPpp')}</p>
                                </div>

                                {application.customQuoteAmount && (
                                    <div className="relative pl-8">
                                        <div className="absolute left-[-9px] top-0 size-4 rounded-full bg-blue-500 border-4 border-white shadow-sm" />
                                        <p className="text-xs font-bold text-stone-900 uppercase tracking-wider mb-1">Quote Provided</p>
                                        <p className="text-xs text-stone-500">TK {application.customQuoteAmount.toLocaleString()}</p>
                                    </div>
                                )}

                                {application.status === 'PENDING_VERIFICATION' && (
                                    <div className="relative pl-8">
                                        <div className="absolute left-[-9px] top-0 size-4 rounded-full bg-amber-500 border-4 border-white shadow-sm" />
                                        <p className="text-xs font-bold text-stone-900 uppercase tracking-wider mb-1">Verifying Payment</p>
                                        <p className="text-xs text-amber-600">Admin verifying manual transaction</p>
                                    </div>
                                )}

                                {application.status === 'QUOTE_ACCEPTED' && (
                                    <div className="relative pl-8">
                                        <div className="absolute left-[-9px] top-0 size-4 rounded-full bg-indigo-500 border-4 border-white shadow-sm" />
                                        <p className="text-xs font-bold text-stone-900 uppercase tracking-wider mb-1">Escrow Funded</p>
                                        <p className="text-xs text-stone-500">Awaiting expert assignment</p>
                                    </div>
                                )}

                                {assignedExpert && (
                                    <div className="relative pl-8">
                                        <div className="absolute left-[-9px] top-0 size-4 rounded-full bg-purple-500 border-4 border-white shadow-sm" />
                                        <p className="text-xs font-bold text-stone-900 uppercase tracking-wider mb-1">Expert Assigned</p>
                                        <p className="text-xs text-stone-500">{assignedExpert.name} is now handling the case.</p>
                                    </div>
                                )}

                                {application.status === 'FINAL_REVIEW' && (
                                    <div className="relative pl-8">
                                        <div className="absolute left-[-9px] top-0 size-4 rounded-full bg-orange-500 border-4 border-white shadow-sm" />
                                        <p className="text-xs font-bold text-stone-900 uppercase tracking-wider mb-1">Final Review</p>
                                        <p className="text-xs text-stone-500">Expert has uploaded final receipts.</p>
                                    </div>
                                )}

                                {application.status === 'COMPLETED' && (
                                    <div className="relative pl-8">
                                        <div className="absolute left-[-9px] top-0 size-4 rounded-full bg-emerald-500 border-4 border-white shadow-sm" />
                                        <p className="text-xs font-bold text-stone-900 uppercase tracking-wider mb-1">Process Completed</p>
                                        <p className="text-xs text-stone-500">All documents delivered and verified.</p>
                                    </div>
                                )}
                            </div>
                        </Card>
                    </div>

                    <div className="space-y-6">
                        {/* Action Panel 1: Quoting */}
                        <Card className="p-6 border-stone-200 shadow-sm">
                            <h3 className="font-bold text-stone-900 mb-4 flex items-center gap-2">
                                <Award className="size-5 text-amber-500" /> Pricing Management
                            </h3>
                            <div className="space-y-4">
                                <div>
                                    <Label>Custom Quote Amount (TK)</Label>
                                    <Input
                                        type="number"
                                        value={quoteAmount}
                                        onChange={(e) => setQuoteAmount(Number(e.target.value))}
                                        placeholder="e.g. 15000"
                                        disabled={application.status !== 'REQUEST_SENT' && application.status !== 'QUOTE_PROVIDED'}
                                    />
                                    <p className="text-[10px] text-stone-400 mt-2">Setting this will notify the student and allow them to pay via escrow.</p>
                                </div>
                                {(application.status === 'REQUEST_SENT' || application.status === 'QUOTE_PROVIDED') && (
                                    <Button className="w-full bg-[#3E2723] hover:bg-[#2D1B17]" onClick={handleProvideQuote}>
                                        {application.status === 'QUOTE_PROVIDED' ? 'Update Quote' : 'Send Quote'}
                                    </Button>
                                )}
                                {application.customQuoteAmount && (
                                    <div className="p-3 bg-stone-50 rounded-lg border border-stone-200 text-center">
                                        <p className="text-[10px] text-stone-400 uppercase font-bold tracking-widest mb-1">Current Price</p>
                                        <p className="text-xl font-bold text-stone-900">TK {application.customQuoteAmount.toLocaleString()}</p>
                                    </div>
                                )}
                            </div>
                        </Card>

                        {/* Action Panel: Verification (if applicable) */}
                        {application.status === 'PENDING_VERIFICATION' && (
                            <Card className="p-6 border-blue-200 shadow-sm bg-blue-50">
                                <h3 className="font-bold text-blue-900 mb-4 flex items-center gap-2">
                                    <ShieldCheck className="size-5 text-blue-500" /> Payment Verification
                                </h3>
                                <div className="space-y-4">
                                    <div className="bg-white p-4 rounded-lg border border-blue-100 shadow-sm space-y-2 text-sm">
                                        <div className="flex justify-between border-b pb-2">
                                            <span className="text-stone-500">Method:</span>
                                            <span className="font-bold text-stone-900 uppercase">{(application as any).paymentInfo?.method || 'MANUAL'}</span>
                                        </div>
                                        <div className="flex justify-between border-b pb-2">
                                            <span className="text-stone-500">Transaction ID:</span>
                                            <span className="font-mono font-bold text-blue-800">{(application as any).paymentInfo?.transactionId || '---'}</span>
                                        </div>
                                        <div className="flex justify-between border-b pb-2">
                                            <span className="text-stone-500">Amount Paid:</span>
                                            <span className="font-bold text-emerald-600">TK {application.customQuoteAmount?.toLocaleString()}</span>
                                        </div>
                                    </div>
                                    <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white" onClick={handleVerifyPayment}>
                                        Verify & Accept Payment
                                    </Button>
                                </div>
                            </Card>
                        )}

                        {/* Action Panel 2: Expert Assignment */}
                        <Card className="p-6 border-stone-200 shadow-sm">
                            <h3 className="font-bold text-stone-900 mb-4 flex items-center gap-2">
                                <Users className="size-5 text-indigo-500" /> Expert Orchestration
                            </h3>
                            <div className="space-y-4">
                                {assignedExpert ? (
                                    <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-xl flex items-center gap-3">
                                        <div className="size-10 rounded-full border-2 border-white shadow-sm overflow-hidden shrink-0">
                                            <img src={assignedExpert.avatar || '/assets/avatars/default.png'} alt="Expert" className="w-full h-full object-cover" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-indigo-500 font-bold uppercase tracking-wider mb-0.5">Assigned Expert</p>
                                            <p className="text-sm font-bold text-stone-900">{assignedExpert.name}</p>
                                        </div>
                                    </div>
                                ) : (
                                    <div>
                                        <Label>Assign verified Expert</Label>
                                        <select
                                            className="w-full bg-stone-50 border border-stone-300 p-2 rounded-lg text-sm mt-1 focus:ring-[#5D4037] outline-none"
                                            value={selectedExpertId}
                                            onChange={(e) => setSelectedExpertId(e.target.value)}
                                        >
                                            <option value="">Select an expert...</option>
                                            {experts.map(ex => (
                                                <option key={ex.id} value={ex.userId}>{ex.name} ({ex.specialty || 'Consultant'})</option>
                                            ))}
                                        </select>
                                        <p className="text-[10px] text-stone-400 mt-2">Assign an expert once the student has funded the escrow.</p>
                                    </div>
                                )}

                                {application.status === 'QUOTE_ACCEPTED' && !assignedExpert && (
                                    <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white" onClick={handleAssignExpert}>
                                        Assign & Start Workflow
                                    </Button>
                                )}

                                {application.status === 'EXPERT_ASSIGNED' && (
                                    <div className="bg-emerald-50 border border-emerald-100 p-3 rounded-lg flex items-center gap-2">
                                        <ShieldCheck className="size-4 text-emerald-600" />
                                        <span className="text-xs font-bold text-emerald-800 uppercase tracking-tight">Active Operation</span>
                                    </div>
                                )}
                            </div>
                        </Card>

                        {/* Action Panel 3: Finalization */}
                        {(application.status === 'FINAL_REVIEW' || application.status === 'COMPLETED') && (
                            <Card className="p-6 border-stone-200 shadow-sm border-l-4 border-l-emerald-500">
                                <h3 className="font-bold text-stone-900 mb-4 flex items-center gap-2">
                                    <CheckCircle2 className="size-5 text-emerald-500" /> Finalization & Payout
                                </h3>
                                <div className="space-y-4">
                                    <p className="text-xs text-stone-500 leading-relaxed">
                                        The expert has uploaded the final receipts. Review the documents in the vault. If everything is correct, mark as completed to notify the student.
                                    </p>
                                    {application.status === 'FINAL_REVIEW' && (
                                        <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold" onClick={handleComplete}>
                                            Complete Process
                                        </Button>
                                    )}
                                    {application.status === 'COMPLETED' && (
                                        <div className="p-3 bg-emerald-50 rounded-lg text-center border border-emerald-100">
                                            <p className="text-xs font-bold text-emerald-700 uppercase">Process Successfully Closed</p>
                                        </div>
                                    )}
                                </div>
                            </Card>
                        )}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
