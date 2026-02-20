import React, { useState } from 'react';
import { useStore, WithdrawalRequest } from './store';
import { DashboardLayout } from './components/Layout';
import { Card } from './components/ui/card';
import { Button } from './components/ui/button';
import {
    CheckCircle,
    Clock,
    XCircle,
    ArrowUpRight,
    Search,
    CheckCircle2,
    AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { EmptyState } from './components/ui/EmptyState';

export default function AdminWithdrawals() {
    const { withdrawalRequests, updateWithdrawalStatus, experts } = useStore();
    const [filterStatus, setFilterStatus] = useState<string>('All');
    const [searchTerm, setSearchTerm] = useState('');

    const filteredRequests = withdrawalRequests.filter(req => {
        const expert = experts.find(e => e.id === req.expertId);
        const matchesStatus = filterStatus === 'All' || req.status === filterStatus;
        const matchesSearch = expert?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            req.id.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesStatus && matchesSearch;
    }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const handleUpdateStatus = (id: string, newStatus: WithdrawalRequest['status']) => {
        updateWithdrawalStatus(id, newStatus);
    };

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-[#3E2723]">Withdrawal Management</h1>
                    <p className="text-stone-500">Review and process expert withdrawal requests.</p>
                </div>

                {/* Stats Summary */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="p-6 bg-amber-50 border-amber-200">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-amber-100 rounded-full text-amber-600">
                                <Clock className="size-6" />
                            </div>
                            <div>
                                <p className="text-sm text-amber-700 font-medium">Pending Requests</p>
                                <p className="text-2xl font-bold text-amber-900">
                                    {withdrawalRequests.filter(r => r.status === 'PENDING').length}
                                </p>
                            </div>
                        </div>
                    </Card>
                    <Card className="p-6 bg-blue-50 border-blue-200">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-blue-100 rounded-full text-blue-600">
                                <CheckCircle className="size-6" />
                            </div>
                            <div>
                                <p className="text-sm text-blue-700 font-medium">Confirmed (Awaiting Payment)</p>
                                <p className="text-2xl font-bold text-blue-900">
                                    {withdrawalRequests.filter(r => r.status === 'CONFIRMED').length}
                                </p>
                            </div>
                        </div>
                    </Card>
                    <Card className="p-6 bg-green-50 border-green-200">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-green-100 rounded-full text-green-600">
                                <CheckCircle2 className="size-6" />
                            </div>
                            <div>
                                <p className="text-sm text-green-700 font-medium">Total Paid</p>
                                <p className="text-2xl font-bold text-green-900">
                                    TK {withdrawalRequests.filter(r => r.status === 'PAID').reduce((acc, curr) => acc + curr.amount, 0).toLocaleString()}
                                </p>
                            </div>
                        </div>
                    </Card>
                </div>

                <Card className="p-6">
                    <div className="flex flex-col md:flex-row gap-4 justify-between mb-8">
                        <div className="flex gap-2 bg-stone-100 p-1 rounded-lg">
                            {['All', 'PENDING', 'CONFIRMED', 'PAID', 'REJECTED'].map(status => (
                                <button
                                    key={status}
                                    onClick={() => setFilterStatus(status)}
                                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${filterStatus === status
                                        ? 'bg-white text-stone-900 shadow-sm'
                                        : 'text-stone-500 hover:text-stone-900'
                                        }`}
                                >
                                    {status.charAt(0) + status.slice(1).toLowerCase()}
                                </button>
                            ))}
                        </div>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-stone-400" />
                            <input
                                type="text"
                                placeholder="Search expert or ID..."
                                className="pl-9 pr-4 py-2 bg-stone-50 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#5D4037]"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-stone-50 text-stone-500 font-medium">
                                <tr>
                                    <th className="px-4 py-3 rounded-l-lg">Expert</th>
                                    <th className="px-4 py-3">Method</th>
                                    <th className="px-4 py-3">Amount</th>
                                    <th className="px-4 py-3">Status</th>
                                    <th className="px-4 py-3 text-right rounded-r-lg">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-stone-100">
                                {filteredRequests.map((req) => {
                                    const expert = experts.find(e => e.id === req.expertId);
                                    // Use snapshot or fallback
                                    const methodDetails = req.methodDetails;
                                    const fallbackMethod = expert?.payoutMethods.find(m => m.id === req.methodId || m._id === req.methodId);

                                    return (
                                        <tr key={req.id} className="border-b border-stone-100 hover:bg-stone-50 transition-colors">
                                            <td className="px-4 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="size-8 rounded-full bg-stone-200 overflow-hidden">
                                                        {expert?.avatar ? (
                                                            <img src={expert.avatar} alt="" className="w-full h-full object-cover" />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center text-stone-500 font-bold">
                                                                {expert?.name?.charAt(0)}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-stone-900">{expert?.name || 'Unknown Expert'}</p>
                                                        <p className="text-xs text-stone-500">{expert?.email}</p>
                                                        <div className="text-[10px] text-stone-400">
                                                            {format(new Date(req.createdAt), 'MMM d, yyyy • h:mm a')}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-4">
                                                <div className="flex flex-col">
                                                    {methodDetails ? (
                                                        <>
                                                            <span className="font-medium">{methodDetails.type}</span>
                                                            <span className="text-xs text-stone-500">
                                                                {methodDetails.bankName ? `${methodDetails.bankName} - ` : ''}
                                                                {methodDetails.accountNumber} ({methodDetails.accountName})
                                                            </span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <span className="font-medium">{fallbackMethod?.type || 'Unknown Method'}</span>
                                                            <span className="text-xs text-stone-500">
                                                                {fallbackMethod?.bankName ? `${fallbackMethod.bankName} - ` : ''}
                                                                {fallbackMethod?.accountNumber}
                                                            </span>
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-4 py-4 font-bold text-stone-900">
                                                TK {req.amount.toLocaleString()}
                                            </td>
                                            <td className="px-4 py-4">
                                                <span className={`
                                                    inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                                                    ${req.status === 'PAID' ? 'bg-green-100 text-green-800' :
                                                        req.status === 'CONFIRMED' ? 'bg-blue-100 text-blue-800' :
                                                            req.status === 'PENDING' ? 'bg-amber-100 text-amber-800' :
                                                                'bg-red-100 text-red-800'}
                                                `}>
                                                    {req.status === 'PAID' ? <CheckCircle2 className="mr-1 size-3" /> :
                                                        req.status === 'PENDING' ? <Clock className="mr-1 size-3" /> :
                                                            req.status === 'REJECTED' ? <XCircle className="mr-1 size-3" /> :
                                                                <CheckCircle className="mr-1 size-3" />}
                                                    {req.status.toLowerCase()}
                                                </span>
                                            </td>
                                            <td className="px-4 py-4 text-right">
                                                <div className="flex justify-end gap-2">
                                                    {req.status === 'PENDING' && (
                                                        <>
                                                            <Button size="sm" variant="outline" className="h-8 text-blue-600 border-blue-200 hover:bg-blue-50" onClick={() => handleUpdateStatus(req.id, 'CONFIRMED')}>
                                                                Confirm
                                                            </Button>
                                                            <Button size="sm" variant="ghost" className="h-8 text-red-500 hover:bg-red-50" onClick={() => handleUpdateStatus(req.id, 'REJECTED')}>
                                                                Reject
                                                            </Button>
                                                        </>
                                                    )}
                                                    {req.status === 'CONFIRMED' && (
                                                        <Button size="sm" className="h-8 bg-green-600 hover:bg-green-700" onClick={() => handleUpdateStatus(req.id, 'PAID')}>
                                                            Mark as Paid
                                                        </Button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                        {filteredRequests.length === 0 && (
                            <EmptyState
                                icon={Clock}
                                title="No withdrawal requests"
                                subtitle="There are currently no withdrawal requests matching your filters. Processed requests will appear in the history."
                                className="my-8 border-none shadow-none bg-transparent"
                            />
                        )}
                    </div>
                </Card>
            </div>
        </DashboardLayout>
    );
}
