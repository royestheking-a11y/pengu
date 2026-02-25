import React, { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Briefcase, Coins, Send, Loader2, Target, HelpCircle, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useStore } from '../store';
import api from '../../lib/api';

interface Lead {
    _id: string;
    clientName: string;
    projectType: string;
    estimatedBudget: string;
    status: 'Pending' | 'Contacted' | 'Negotiating' | 'Won' | 'Lost';
    finalProjectValue: number;
    commissionEarned: number;
    createdAt: string;
}

export function ProjectReferral() {
    const { currentUser } = useStore();
    const [leads, setLeads] = useState<Lead[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        clientName: '',
        clientPhone: '',
        projectType: '',
        estimatedBudget: ''
    });

    const fetchLeads = async () => {
        try {
            const { data } = await api.get('/leads/my-leads');
            setLeads(data);
        } catch (error) {
            console.error('Failed to fetch leads:', error);
            toast.error('Could not load your referrals');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (currentUser) {
            fetchLeads();
        }
    }, [currentUser]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.clientName || !formData.clientPhone || !formData.projectType || !formData.estimatedBudget) {
            toast.error('Please fill in all fields');
            return;
        }

        setSubmitting(true);
        try {
            await api.post('/leads', formData);
            toast.success('Lead submitted successfully! We will review it shortly.');
            setFormData({ clientName: '', clientPhone: '', projectType: '', estimatedBudget: '' });
            fetchLeads();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to submit lead');
        } finally {
            setSubmitting(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Pending': return 'bg-amber-100 text-amber-800 border-amber-200';
            case 'Contacted': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'Negotiating': return 'bg-purple-100 text-purple-800 border-purple-200';
            case 'Won': return 'bg-green-100 text-green-800 border-green-200';
            case 'Lost': return 'bg-red-100 text-red-800 border-red-200';
            default: return 'bg-stone-100 text-stone-800 border-stone-200';
        }
    };

    return (
        <div className="space-y-6">
            {/* The Pitch Banner */}
            <Card className="p-6 md:p-8 bg-[#3E2723] text-white border-none shadow-xl rounded-3xl overflow-hidden relative">
                <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                    <Target size={120} />
                </div>
                <div className="relative z-10 max-w-2xl">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold uppercase tracking-wider mb-4 border border-amber-500/30">
                        <Coins className="size-4" /> Partner Program
                    </div>
                    <h2 className="text-2xl md:text-3xl font-black mb-3">Find Clients. Earn 30%.</h2>
                    <p className="text-stone-300 leading-relaxed text-sm md:text-base mb-6">
                        Know a business that needs a website, mobile app, or SEO? Submit their details below.
                        If Pengu's Tech Agency closes the deal, you <span className="text-amber-400 font-bold">instantly get 30% of the total project value</span> deposited directly into your Pengu Wallet.
                    </p>
                    <div className="flex flex-wrap gap-4 text-xs font-medium text-stone-400">
                        <span className="flex items-center gap-1"><CheckCircle className="size-3.5 text-green-400" /> High Ticket Payouts</span>
                        <span className="flex items-center gap-1"><CheckCircle className="size-3.5 text-green-400" /> Transparent Tracking</span>
                        <span className="flex items-center gap-1"><CheckCircle className="size-3.5 text-green-400" /> No Cold Calling Required</span>
                    </div>
                </div>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Lead Submission Form */}
                <Card className="p-6 border-stone-200 shadow-sm rounded-3xl lg:col-span-1 border-t-4 border-t-[#5D4037] h-fit">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2.5 bg-[#5D4037]/10 text-[#5D4037] rounded-xl">
                            <Send className="size-5" />
                        </div>
                        <h3 className="font-bold text-lg text-stone-900">Submit a Lead</h3>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-1.5">
                            <Label htmlFor="clientName">Client/Business Name <span className="text-red-500">*</span></Label>
                            <Input
                                id="clientName"
                                placeholder="e.g. Dhaka Sweets & Co."
                                value={formData.clientName}
                                onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                                disabled={submitting}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="clientPhone">Client Phone Number <span className="text-red-500">*</span></Label>
                            <Input
                                id="clientPhone"
                                placeholder="e.g. 017..."
                                value={formData.clientPhone}
                                onChange={(e) => setFormData({ ...formData, clientPhone: e.target.value })}
                                disabled={submitting}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label>Project Type <span className="text-red-500">*</span></Label>
                            <Select
                                value={formData.projectType}
                                onValueChange={(val) => setFormData({ ...formData, projectType: val })}
                                disabled={submitting}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a service" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Web App">Web Application / Website</SelectItem>
                                    <SelectItem value="Mobile App">Mobile App (iOS/Android)</SelectItem>
                                    <SelectItem value="UI/UX Design">UI/UX Design</SelectItem>
                                    <SelectItem value="SEO">SEO Optimization</SelectItem>
                                    <SelectItem value="Digital Marketing">Digital Marketing</SelectItem>
                                    <SelectItem value="Graphic Design">Graphic & Brand Design</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="estimatedBudget">Estimated Budget (Optional)</Label>
                            <Input
                                id="estimatedBudget"
                                placeholder="e.g. 50,000 BDT or Unsure"
                                value={formData.estimatedBudget}
                                onChange={(e) => setFormData({ ...formData, estimatedBudget: e.target.value })}
                                disabled={submitting}
                            />
                            <p className="text-[10px] text-stone-500 mt-1">We will negotiate the final price with the client.</p>
                        </div>

                        <Button
                            type="submit"
                            className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold h-12 rounded-xl mt-4 shadow-md active:scale-95 transition-all text-base"
                            disabled={submitting}
                        >
                            {submitting ? (
                                <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Submitting...</>
                            ) : 'Submit Lead'}
                        </Button>
                    </form>
                </Card>

                {/* My Referrals Tracking Board */}
                <Card className="p-0 border-stone-200 shadow-sm rounded-3xl lg:col-span-2 overflow-hidden flex flex-col">
                    <div className="p-6 border-b border-stone-100 bg-stone-50/50 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-blue-100 text-blue-600 rounded-xl">
                                <Briefcase className="size-5" />
                            </div>
                            <h3 className="font-bold text-lg text-stone-900">My Pipeline</h3>
                        </div>
                    </div>

                    <div className="p-0 flex-1 overflow-x-auto min-h-[300px]">
                        {loading ? (
                            <div className="h-full flex items-center justify-center min-h-[300px]">
                                <Loader2 className="animate-spin size-8 text-stone-400" />
                            </div>
                        ) : leads.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center min-h-[300px] text-center px-6">
                                <div className="size-16 bg-stone-100 rounded-full flex items-center justify-center mb-4 text-stone-400">
                                    <Target className="size-8" />
                                </div>
                                <h4 className="font-bold text-stone-700">No leads submitted yet</h4>
                                <p className="text-sm text-stone-500 max-w-sm mt-1">Your submitted leads will appear here so you can track our progress negotiating with them.</p>
                            </div>
                        ) : (
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-stone-50/80 border-b border-stone-100 text-xs uppercase tracking-wider text-stone-500 font-bold">
                                        <th className="p-4 pl-6 font-medium">Client</th>
                                        <th className="p-4 font-medium">Service</th>
                                        <th className="p-4 font-medium hidden sm:table-cell">Date</th>
                                        <th className="p-4 font-medium">Status</th>
                                        <th className="p-4 pr-6 text-right font-medium">Payout</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {leads.map((lead) => (
                                        <tr key={lead._id} className="border-b border-stone-50 hover:bg-stone-50/50 transition-colors group">
                                            <td className="p-4 pl-6">
                                                <div className="font-bold text-sm text-stone-800">{lead.clientName}</div>
                                            </td>
                                            <td className="p-4">
                                                <div className="inline-flex items-center px-2 py-1 rounded-md bg-stone-100 text-stone-600 text-xs font-medium">
                                                    {lead.projectType}
                                                </div>
                                            </td>
                                            <td className="p-4 hidden sm:table-cell text-sm text-stone-500">
                                                {new Date(lead.createdAt).toLocaleDateString()}
                                            </td>
                                            <td className="p-4">
                                                <div className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${getStatusColor(lead.status)}`}>
                                                    {lead.status === 'Won' && <CheckCircle className="size-3 mr-1" />}
                                                    {lead.status}
                                                </div>
                                            </td>
                                            <td className="p-4 pr-6 text-right">
                                                {lead.status === 'Won' ? (
                                                    <div className="font-bold text-green-600 text-sm flex items-center justify-end gap-1">
                                                        +{lead.commissionEarned.toLocaleString()} <Coins className="size-3" />
                                                    </div>
                                                ) : lead.status === 'Lost' ? (
                                                    <div className="text-stone-400 text-sm font-medium">--</div>
                                                ) : (
                                                    <div className="text-stone-400 text-xs font-medium flex items-center justify-end gap-1" title="Pending deal closure">
                                                        <HelpCircle className="size-3" /> TBD
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </Card>
            </div>
        </div>
    );
}
