import React, { useState, useEffect } from 'react';
import { DashboardLayout } from './components/Layout';
import { Card } from './components/ui/card';
import { Button } from './components/ui/button';
import { Input } from './components/ui/input';
import { Label } from './components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './components/ui/select';
import { Target, Search, MoreVertical, Coins, CheckCircle, Mail, Phone, Loader2, Rocket, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import api from '../lib/api';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from './components/ui/dialog';

interface Lead {
    _id: string;
    user: {
        _id: string;
        name: string;
        email: string;
        phone: string;
        role: string;
    };
    clientName: string;
    clientPhone: string;
    projectType: string;
    estimatedBudget: string;
    status: 'Pending' | 'Contacted' | 'Negotiating' | 'Won' | 'Lost';
    finalProjectValue: number;
    commissionEarned: number;
    createdAt: string;
}

export default function AdminLeadManager() {
    const [leads, setLeads] = useState<Lead[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');

    // Close Deal Modal State
    const [isCloseModalOpen, setIsCloseModalOpen] = useState(false);
    const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
    const [finalValue, setFinalValue] = useState('');
    const [closing, setClosing] = useState(false);

    const fetchLeads = async () => {
        try {
            const { data } = await api.get('/leads');
            setLeads(data);
        } catch (error) {
            console.error('Failed to fetch leads:', error);
            toast.error('Could not load Partner Leads');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLeads();
    }, []);

    const handleStatusChange = async (leadId: string, newStatus: string) => {
        if (newStatus === 'Won') {
            const leadToClose = leads.find(l => l._id === leadId);
            if (leadToClose) {
                setSelectedLead(leadToClose);
                setIsCloseModalOpen(true);
            }
            return;
        }

        try {
            await api.put(`/leads/${leadId}/status`, { status: newStatus });
            toast.success('Status updated successfully');
            fetchLeads(); // Refresh data
        } catch (error) {
            toast.error('Failed to update status');
        }
    };

    const handleCloseDeal = async () => {
        if (!selectedLead || !finalValue) {
            toast.error('Please enter the final project value');
            return;
        }

        setClosing(true);
        try {
            const numValue = parseFloat(finalValue);
            const { data } = await api.put(`/leads/${selectedLead._id}/close`, {
                finalProjectValue: numValue
            });

            toast.success(`Deal closed! ৳${data.lead.commissionEarned} awarded to ${selectedLead.user?.name || 'partner'}.`);
            setIsCloseModalOpen(false);
            setFinalValue('');
            fetchLeads();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to close the deal');
        } finally {
            setClosing(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Pending': return 'bg-amber-100 text-amber-800 border-amber-200';
            case 'Contacted': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'Negotiating': return 'bg-purple-100 text-purple-800 border-purple-200';
            case 'Won': return 'bg-green-100 text-green-800 border-green-200 shadow-sm';
            case 'Lost': return 'bg-red-100 text-red-800 border-red-200';
            default: return 'bg-stone-100 text-stone-800 border-stone-200';
        }
    };

    const filteredLeads = leads.filter(lead => {
        const matchesSearch =
            lead.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            lead.user?.name?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'All' ? true : lead.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const potentialValue = (val: string) => parseFloat(finalValue) * 0.30 || 0;

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-black text-stone-900 tracking-tight flex items-center gap-3">
                            Partner Leads <Rocket className="size-6 text-amber-500" />
                        </h1>
                        <p className="text-stone-500">Manage student referrals and close deals to grow the agency.</p>
                    </div>

                    {/* Stats */}
                    <div className="flex bg-white px-4 py-2 rounded-2xl shadow-sm border border-stone-100 divide-x divide-stone-100">
                        <div className="pr-4 flex flex-col items-center">
                            <span className="text-xl font-black text-stone-900">{leads.filter(l => l.status === 'Pending').length}</span>
                            <span className="text-[10px] text-stone-500 uppercase font-bold tracking-wider">Pending</span>
                        </div>
                        <div className="px-4 flex flex-col items-center">
                            <span className="text-xl font-black text-blue-600">{leads.filter(l => l.status === 'Negotiating').length}</span>
                            <span className="text-[10px] text-stone-500 uppercase font-bold tracking-wider">Negotiating</span>
                        </div>
                        <div className="pl-4 flex flex-col items-center">
                            <span className="text-xl font-black text-green-600">{leads.filter(l => l.status === 'Won').length}</span>
                            <span className="text-[10px] text-stone-500 uppercase font-bold tracking-wider">Won</span>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 size-5" />
                        <Input
                            placeholder="Search by client or referrer name..."
                            className="pl-10 h-12 rounded-xl bg-white border-none shadow-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-full sm:w-[180px] h-12 rounded-xl bg-white border-none shadow-sm">
                            <SelectValue placeholder="Filter Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="All">All Leads</SelectItem>
                            <SelectItem value="Pending">Pending</SelectItem>
                            <SelectItem value="Contacted">Contacted</SelectItem>
                            <SelectItem value="Negotiating">Negotiating</SelectItem>
                            <SelectItem value="Won">Won</SelectItem>
                            <SelectItem value="Lost">Lost</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Master Leads Table */}
                <Card className="bg-white border-none shadow-xl rounded-3xl overflow-hidden">
                    <div className="overflow-x-auto min-h-[500px]">
                        {loading ? (
                            <div className="flex h-64 items-center justify-center">
                                <Loader2 className="animate-spin size-8 text-[#5D4037]" />
                            </div>
                        ) : filteredLeads.length === 0 ? (
                            <div className="flex flex-col h-64 items-center justify-center text-stone-400 gap-3">
                                <Target size={48} className="opacity-50" />
                                <p className="font-medium text-stone-500">No leads found.</p>
                            </div>
                        ) : (
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-stone-50/80 border-b border-stone-100 text-xs text-stone-500 uppercase tracking-wider font-bold">
                                        <th className="p-4 pl-6">Client Details</th>
                                        <th className="p-4">Service Required</th>
                                        <th className="p-4">Referrer</th>
                                        <th className="p-4">Status & Action</th>
                                        <th className="p-4 pr-6 text-right">Value (BDT)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredLeads.map((lead) => (
                                        <tr key={lead._id} className="border-b border-stone-50 hover:bg-stone-50 transition-colors">
                                            <td className="p-4 pl-6 align-top">
                                                <div className="font-bold text-sm text-stone-900">{lead.clientName}</div>
                                                <div className="flex items-center gap-1.5 text-xs text-stone-500 mt-1">
                                                    <Phone className="size-3" /> {lead.clientPhone}
                                                </div>
                                                <div className="text-[10px] text-stone-400 mt-2 font-medium">Est. Budget: {lead.estimatedBudget || 'Not provided'}</div>
                                            </td>
                                            <td className="p-4 align-top">
                                                <div className="inline-flex items-center px-2 py-1 bg-stone-100 text-stone-600 rounded text-xs font-bold shadow-sm">
                                                    {lead.projectType}
                                                </div>
                                                <div className="text-xs text-stone-400 mt-2">
                                                    {new Date(lead.createdAt).toLocaleDateString()}
                                                </div>
                                            </td>
                                            <td className="p-4 align-top">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <div className="font-bold text-sm text-stone-800">{lead.user?.name || 'Unknown User'}</div>
                                                    {lead.user?.role && (
                                                        <span className={`text-[9px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded ${lead.user.role === 'expert'
                                                                ? 'bg-purple-100 text-purple-700 border border-purple-200'
                                                                : 'bg-blue-100 text-blue-700 border border-blue-200'
                                                            }`}>
                                                            {lead.user.role}
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="flex flex-col gap-0.5 mt-1">
                                                    <a href={`mailto:${lead.user?.email}`} className="text-xs text-stone-500 hover:text-[#5D4037] flex items-center gap-1">
                                                        <Mail className="size-3" /> {lead.user?.email}
                                                    </a>
                                                    {lead.user?.phone && (
                                                        <a href={`tel:${lead.user?.phone}`} className="text-xs text-stone-500 hover:text-[#5D4037] flex items-center gap-1">
                                                            <Phone className="size-3" /> {lead.user?.phone}
                                                        </a>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="p-4 align-top">
                                                {lead.status === 'Won' ? (
                                                    <div className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold border ${getStatusColor(lead.status)}`}>
                                                        <CheckCircle className="size-3.5 mr-1.5" /> Won!
                                                    </div>
                                                ) : lead.status === 'Lost' ? (
                                                    <div className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold border ${getStatusColor(lead.status)}`}>
                                                        Lost
                                                    </div>
                                                ) : (
                                                    <Select onValueChange={(val) => handleStatusChange(lead._id, val)} value={lead.status}>
                                                        <SelectTrigger className={`w-[130px] rounded-full h-8 px-3 text-xs font-bold border ${getStatusColor(lead.status)}`}>
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="Pending">Pending</SelectItem>
                                                            <SelectItem value="Contacted">Contacted</SelectItem>
                                                            <SelectItem value="Negotiating">Negotiating</SelectItem>
                                                            <SelectItem value="Won" className="text-green-600 font-bold flex items-center">
                                                                <Coins className="size-4 mr-2" /> Mark as Won
                                                            </SelectItem>
                                                            <SelectItem value="Lost" className="text-red-600 font-bold">Mark as Lost</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                )}
                                            </td>
                                            <td className="p-4 pr-6 align-top text-right">
                                                {lead.status === 'Won' ? (
                                                    <div>
                                                        <div className="font-black text-stone-900 text-lg">৳{lead.finalProjectValue?.toLocaleString()}</div>
                                                        <div className="text-xs text-green-600 font-bold mt-1 bg-green-50 px-2 py-0.5 rounded inline-block border border-green-100">
                                                            Paid to Student: +{lead.commissionEarned?.toLocaleString()}
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="text-stone-300 font-medium italic text-sm">Awaiting Close</div>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </Card>

                {/* Close Deal Modal */}
                <Dialog open={isCloseModalOpen} onOpenChange={setIsCloseModalOpen}>
                    <DialogContent className="sm:max-w-md bg-white border-none shadow-2xl rounded-3xl overflow-hidden p-0">
                        <div className="bg-gradient-to-br from-green-500 to-green-600 p-6 text-white flex flex-col items-center text-center relative overflow-hidden">
                            <div className="absolute top-0 right-0 -mt-10 -mr-10 opacity-20">
                                <Target size={150} />
                            </div>
                            <div className="size-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-4 border border-white/30 relative z-10">
                                <Coins className="size-8 text-white" />
                            </div>
                            <h2 className="text-2xl font-black relative z-10 leading-tight">Closing the Deal!</h2>
                            <p className="text-green-100 font-medium relative z-10 text-sm mt-2">
                                Client: <span className="text-white font-bold">{selectedLead?.clientName}</span>
                            </p>
                        </div>

                        <div className="p-6 space-y-6">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label className="text-stone-900 font-bold">Final Project Value (in BDT)</Label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-500 font-bold">৳</span>
                                        <Input
                                            type="number"
                                            placeholder="50000"
                                            className="pl-8 h-12 text-lg font-bold"
                                            value={finalValue}
                                            onChange={(e) => setFinalValue(e.target.value)}
                                        />
                                    </div>
                                    <p className="text-xs text-stone-500">Enter the total amount agreed upon with the client.</p>
                                </div>

                                {finalValue && (
                                    <div className="bg-amber-50 rounded-xl p-4 border border-amber-200">
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="text-sm font-medium text-amber-800">Partner Commission (30%)</span>
                                            <span className="text-lg font-black text-amber-600 flex items-center gap-1">
                                                +{potentialValue(finalValue).toLocaleString()} <Sparkles className="size-4" />
                                            </span>
                                        </div>
                                        <p className="text-xs text-amber-700 leading-tight">
                                            Clicking confirm will permanently close this deal and instantly deposit this payout into <span className="font-bold">{selectedLead?.user?.name}'s</span> wallet.
                                        </p>
                                    </div>
                                )}
                            </div>

                            <div className="flex flex-col-reverse sm:flex-row gap-3 pt-2">
                                <Button
                                    variant="outline"
                                    onClick={() => { setIsCloseModalOpen(false); setFinalValue(''); }}
                                    className="w-full sm:w-1/3"
                                    disabled={closing}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleCloseDeal}
                                    className="w-full sm:w-2/3 bg-green-600 hover:bg-green-700 text-white font-bold h-auto py-3 whitespace-normal"
                                    disabled={closing || !finalValue}
                                >
                                    {closing ? <Loader2 className="animate-spin size-4 flex-shrink-0 mr-2" /> : <CheckCircle className="size-4 flex-shrink-0 mr-2" />}
                                    <span>Confirm Payout</span>
                                </Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
        </DashboardLayout>
    );
}
