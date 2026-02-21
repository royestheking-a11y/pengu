import React, { useState, useEffect } from 'react';
import { DashboardLayout } from './components/Layout';
import { Card } from './components/ui/card';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import {
    Sparkles, User, Phone, FileText, Clock, CheckCircle,
    Trash2, ChevronDown, ChevronUp, Loader2, X,
    AlertCircle, FileImage, File, Eye
} from 'lucide-react';
import api from '../lib/api';

type TicketStatus = 'pending' | 'reviewing' | 'resolved';

function FileIcon({ format }: { format: string }) {
    if (format?.includes('image')) return <FileImage className="size-3.5 text-blue-500" />;
    if (format?.includes('pdf')) return <FileText className="size-3.5 text-red-500" />;
    return <File className="size-3.5 text-stone-400" />;
}

const STATUS_STYLES: Record<TicketStatus, string> = {
    pending: 'bg-amber-100 text-amber-700 border-amber-200',
    reviewing: 'bg-blue-100 text-blue-700 border-blue-200',
    resolved: 'bg-green-100 text-green-700 border-green-200',
};

export default function AdminUniversalSolutions() {
    const [tickets, setTickets] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [statusFilter, setStatusFilter] = useState<'all' | TicketStatus>('all');

    const fetchTickets = async () => {
        setLoading(true);
        try {
            const res = await api.get('/universal-tickets');
            setTickets(res.data);
        } catch {
            toast.error('Failed to fetch tickets');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchTickets(); }, []);

    const updateStatus = async (id: string, status: TicketStatus) => {
        try {
            await api.patch(`/universal-tickets/${id}`, { status });
            setTickets(prev => prev.map(t => t._id === id ? { ...t, status } : t));
            toast.success(`Ticket marked as ${status}`);
        } catch {
            toast.error('Failed to update status');
        }
    };

    const deleteTicket = async (id: string) => {
        if (!window.confirm('Delete this ticket?')) return;
        try {
            await api.delete(`/universal-tickets/${id}`);
            setTickets(prev => prev.filter(t => t._id !== id));
            toast.success('Ticket deleted');
        } catch {
            toast.error('Failed to delete ticket');
        }
    };

    const filtered = statusFilter === 'all' ? tickets : tickets.filter(t => t.status === statusFilter);
    const counts = { all: tickets.length, pending: tickets.filter(t => t.status === 'pending').length, reviewing: tickets.filter(t => t.status === 'reviewing').length, resolved: tickets.filter(t => t.status === 'resolved').length };

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-black text-[#3E2723] flex items-center gap-2">
                            <Sparkles className="size-6 text-[#5D4037]" /> Universal Solutions
                        </h1>
                        <p className="text-stone-500 text-sm mt-1">Problem Solver tickets submitted by users</p>
                    </div>
                    <button onClick={fetchTickets} className="px-4 py-2 bg-stone-100 text-stone-600 rounded-xl text-sm font-bold hover:bg-stone-200 transition-all">
                        Refresh
                    </button>
                </div>

                {/* Status Filter Tabs */}
                <div className="flex gap-2">
                    {(['all', 'pending', 'reviewing', 'resolved'] as const).map(s => (
                        <button key={s} onClick={() => setStatusFilter(s)}
                            className={`px-4 py-2 rounded-xl text-xs font-bold capitalize transition-all border
                                ${statusFilter === s ? 'bg-[#5D4037] text-white border-[#5D4037]' : 'bg-white text-stone-600 border-stone-200 hover:border-stone-300'}`}>
                            {s} {counts[s] > 0 && <span className="ml-1 opacity-70">({counts[s]})</span>}
                        </button>
                    ))}
                </div>

                {/* Tickets List */}
                {loading ? (
                    <div className="flex items-center justify-center py-24">
                        <Loader2 className="size-8 text-[#5D4037] animate-spin" />
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 bg-stone-50 rounded-2xl border border-dashed border-stone-200">
                        <Sparkles className="size-10 text-stone-200 mb-3" />
                        <p className="text-stone-500 font-medium">No tickets yet</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filtered.map(ticket => (
                            <Card key={ticket._id} className="border-stone-200 overflow-hidden">
                                {/* Ticket Header */}
                                <div className="p-5 flex items-start gap-4">
                                    <div className="size-10 bg-[#5D4037]/10 rounded-xl flex items-center justify-center shrink-0">
                                        <User className="size-5 text-[#5D4037]" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap mb-1">
                                            <h3 className="font-bold text-stone-900">{ticket.name}</h3>
                                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border capitalize ${STATUS_STYLES[ticket.status as TicketStatus]}`}>
                                                {ticket.status}
                                            </span>
                                        </div>
                                        <div className="flex flex-wrap gap-3 text-xs text-stone-400">
                                            <span className="flex items-center gap-1">
                                                <Phone className="size-3" /> {ticket.whatsapp}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Clock className="size-3" /> {new Date(ticket.createdAt).toLocaleString()}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <FileText className="size-3" /> {ticket.files?.length || 0} files
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 shrink-0">
                                        <button onClick={() => setExpandedId(expandedId === ticket._id ? null : ticket._id)}
                                            className="p-2 text-stone-400 hover:text-stone-700 transition-colors">
                                            {expandedId === ticket._id ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
                                        </button>
                                        <button onClick={() => deleteTicket(ticket._id)}
                                            className="p-2 text-stone-300 hover:text-red-500 transition-colors">
                                            <Trash2 className="size-4" />
                                        </button>
                                    </div>
                                </div>

                                {/* AI Summary (always visible) */}
                                {ticket.aiSummary && (
                                    <div className="px-5 pb-4">
                                        <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-100">
                                            <p className="text-[10px] font-bold text-amber-600 uppercase tracking-widest mb-1.5 flex items-center gap-1">
                                                <Sparkles className="size-3" /> AI Summary
                                            </p>
                                            <p className="text-xs text-amber-900 leading-relaxed">{ticket.aiSummary}</p>
                                        </div>
                                    </div>
                                )}

                                {/* Expanded Details */}
                                <AnimatePresence>
                                    {expandedId === ticket._id && (
                                        <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
                                            <div className="px-5 pb-5 border-t border-stone-100 pt-4 space-y-4">
                                                {/* Chat Log */}
                                                <div>
                                                    <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-2">Chat Log</p>
                                                    <div className="space-y-2 max-h-64 overflow-y-auto bg-stone-50 rounded-xl p-3 border border-stone-100">
                                                        {ticket.messages?.map((m: any, i: number) => (
                                                            <div key={i} className={`flex gap-2 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                                                                <div className={`max-w-[80%] px-3 py-2 rounded-xl text-xs leading-relaxed
                                                                    ${m.role === 'user' ? 'bg-[#5D4037] text-white' : 'bg-white text-stone-700 border border-stone-200'}`}>
                                                                    {m.content}
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>

                                                {/* Uploaded Files */}
                                                {ticket.files?.length > 0 && (
                                                    <div>
                                                        <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-2">Uploaded Files</p>
                                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                            {ticket.files.map((f: any, i: number) => (
                                                                <a key={i} href={f.url} target="_blank" rel="noopener noreferrer"
                                                                    className="flex items-center gap-2 p-2.5 bg-stone-50 rounded-lg border border-stone-200 hover:border-[#5D4037]/30 transition-all group">
                                                                    <FileIcon format={f.format} />
                                                                    <span className="text-xs font-medium text-stone-600 truncate flex-1">{f.name}</span>
                                                                    <Eye className="size-3 text-stone-300 group-hover:text-[#5D4037] transition-colors shrink-0" />
                                                                </a>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Status Controls */}
                                                <div>
                                                    <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-2">Update Status</p>
                                                    <div className="flex gap-2">
                                                        {(['pending', 'reviewing', 'resolved'] as TicketStatus[]).map(s => (
                                                            <button key={s} onClick={() => updateStatus(ticket._id, s)}
                                                                className={`flex-1 py-2 rounded-lg text-xs font-bold capitalize transition-all border
                                                                    ${ticket.status === s ? STATUS_STYLES[s] : 'bg-white text-stone-500 border-stone-200 hover:border-stone-300'}`}>
                                                                {s === 'pending' && <AlertCircle className="size-3 inline mr-1" />}
                                                                {s === 'reviewing' && <Eye className="size-3 inline mr-1" />}
                                                                {s === 'resolved' && <CheckCircle className="size-3 inline mr-1" />}
                                                                {s}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
