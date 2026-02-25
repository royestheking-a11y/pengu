import React, { useState } from 'react';
import { useStore } from './store';
import { DashboardLayout } from './components/Layout';
import { Card } from './components/ui/card';
import { Button } from './components/ui/button';
import { Input } from './components/ui/input';
import { Label } from './components/ui/label';
import {
    DollarSign,
    TrendingUp,
    ArrowUpRight,
    ArrowDownRight,
    History,
    Settings,
    Percent,
    Download,
    Filter,
    Sparkles,
    Users as UsersIcon,
    User as UserIcon,
    ArrowLeft
} from 'lucide-react';
import { format } from 'date-fns';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar
} from 'recharts';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { EmptyState } from './components/ui/EmptyState';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "./components/ui/alert-dialog";

export default function AdminPayments() {
    const {
        financialTransactions, commissionRate, setCommissionRate, experts, orders,
        verifyOrderPayment, rejectOrderPayment, withdrawalRequests,
        approveStudentWithdrawal, rejectStudentWithdrawal, users
    } = useStore();
    const [iseditingRate, setIsEditingRate] = useState(false);
    const [newRate, setNewRate] = useState(commissionRate);
    const [filterType, setFilterType] = useState('ALL');

    // Modal states
    const [confirmModal, setConfirmModal] = useState<{
        open: boolean;
        type: 'verify' | 'reject' | null;
        orderId: string | null;
        orderTopic: string | null;
        amount: number | null;
    }>({
        open: false,
        type: null,
        orderId: null,
        orderTopic: null,
        amount: null
    });

    const [studentWithdrawModal, setStudentWithdrawModal] = useState<{
        open: boolean;
        type: 'approve' | 'reject' | null;
        withdrawalId: string | null;
        studentName: string | null;
        amount: number | null;
    }>({
        open: false,
        type: null,
        withdrawalId: null,
        studentName: null,
        amount: null
    });


    // Services Revenue
    const servicesRevenue = financialTransactions
        .filter(tx => tx.type === 'INCOME')
        .reduce((sum, tx) => sum + tx.amount, 0);

    // Arcade Revenue (All STUDENT_EARNING)
    const arcadeRevenue = financialTransactions
        .filter(tx => tx.type === 'STUDENT_EARNING')
        .reduce((sum, tx) => sum + tx.amount, 0);

    const totalRevenue = servicesRevenue + arcadeRevenue;

    const servicesProfit = financialTransactions
        .filter(tx => tx.type === 'COMMISSION')
        .reduce((sum, tx) => sum + tx.amount, 0);

    // Arcade Profit (Assuming CPX takes their cut before hitting our webhook, so we consider STUDENT_EARNING as platform traffic growth, but if we have a margin there we'd add it. For now, Arcade revenue is treated as gross but it doesn't have a 1:1 profit unless we define a margin. User requested profit section show details.)
    // Let's assume Arcade Profit = Arcade Revenue (if we are the provider) or a margin.
    // The user said "mention earn from arcade amount and it also added the profit section".
    const arcadeProfit = arcadeRevenue; // For now treating Arcade income as profit-contributing

    const totalProfit = servicesProfit + arcadeProfit;

    const totalPayouts = financialTransactions
        .filter(tx => tx.type === 'PAYOUT')
        .reduce((sum, tx) => sum + tx.amount, 0);

    const pendingPayoutAmount = withdrawalRequests
        .filter(r => r.status === 'PENDING' || r.status === 'CONFIRMED')
        .reduce((sum, r) => sum + r.amount, 0);

    const totalStudentArcadeBalance = users.filter(u => u.role === 'student').reduce((sum, u) => sum + (u.balance || 0), 0);

    // netPlatformLiquidity = Verified Income - Processed Payouts
    const netPlatformLiquidity = totalRevenue - totalPayouts;


    // chart data grouping by date
    const chartData = financialTransactions.reduce((acc: any[], tx) => {
        const date = format(new Date(tx.createdAt), 'MMM d');
        let day = acc.find(d => d.date === date);
        if (!day) {
            day = { date, revenue: 0, profit: 0 };
            acc.push(day);
        }
        if (tx.type === 'INCOME') day.revenue += tx.amount;
        if (tx.type === 'COMMISSION') day.profit += tx.amount;
        return acc;
    }, []).slice(-7); // Last 7 days

    const handleUpdateRate = () => {
        setCommissionRate(newRate);
        setIsEditingRate(false);
        toast.success(`Commission rate updated to ${newRate}%`);
    };

    const handleConfirmAction = () => {
        if (!confirmModal.orderId) return;

        if (confirmModal.type === 'verify') {
            verifyOrderPayment(confirmModal.orderId);
            toast.success("Payment verified successfully");
        } else if (confirmModal.type === 'reject') {
            rejectOrderPayment(confirmModal.orderId);
            toast.success("Payment rejected");
        }

        setConfirmModal({ open: false, type: null, orderId: null, orderTopic: null, amount: null });
    };

    const handleConfirmStudentWithdrawal = () => {
        if (!studentWithdrawModal.withdrawalId) return;

        if (studentWithdrawModal.type === 'approve') {
            approveStudentWithdrawal(studentWithdrawModal.withdrawalId);
            toast.success("Withdrawal approved and paid");
        } else if (studentWithdrawModal.type === 'reject') {
            rejectStudentWithdrawal(studentWithdrawModal.withdrawalId);
            toast.success("Withdrawal rejected and funds refunded");
        }

        setStudentWithdrawModal({ open: false, type: null, withdrawalId: null, studentName: null, amount: null });
    };


    return (
        <DashboardLayout>
            <div className="space-y-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-[#3E2723]">Financial Management</h1>
                        <p className="text-stone-500">Track revenue, commissions, and expert payouts.</p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                            <Download className="mr-2 size-4" /> Export Report
                        </Button>
                        <Button size="sm" onClick={() => setIsEditingRate(true)}>
                            <Settings className="mr-2 size-4" /> Commission Settings
                        </Button>
                    </div>
                </div>



                {/* Top Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <Card className="p-5 flex flex-row items-center gap-4 hover:shadow-md transition-all border-stone-200/60">
                        <div className="p-3.5 rounded-2xl bg-green-100 text-green-700 shrink-0">
                            <DollarSign className="size-6" />
                        </div>
                        <div className="flex-1">
                            <p className="text-[10px] text-stone-400 font-bold uppercase tracking-wider mb-0.5">Gross Revenue</p>
                            <p className="text-2xl font-bold text-stone-900 leading-tight">TK {totalRevenue.toLocaleString()}</p>
                            <div className="mt-1 flex flex-col gap-0.5">
                                <span className="text-[10px] text-stone-400 font-medium">Services: <span className="text-stone-600 font-bold">TK {servicesRevenue.toLocaleString()}</span></span>
                                <span className="text-[10px] text-stone-400 font-medium">Arcade: <span className="text-indigo-600 font-bold">TK {arcadeRevenue.toLocaleString()}</span></span>
                            </div>
                        </div>
                    </Card>

                    <Card className="p-5 flex flex-row items-center gap-4 hover:shadow-md transition-all border-stone-200/60">
                        <div className="p-3.5 rounded-2xl bg-blue-100 text-blue-700 shrink-0">
                            <Percent className="size-6" />
                        </div>
                        <div className="flex-1">
                            <p className="text-[10px] text-stone-400 font-bold uppercase tracking-wider mb-0.5">Platform Profit</p>
                            <p className="text-2xl font-bold text-stone-900 leading-tight">TK {totalProfit.toLocaleString()}</p>
                            <div className="mt-1 flex flex-col gap-0.5">
                                <span className="text-[10px] text-stone-400 font-medium font-medium">Comm: <span className="text-blue-600 font-bold">TK {servicesProfit.toLocaleString()}</span></span>
                                <span className="text-[10px] text-stone-400 font-medium font-medium">Arcade: <span className="text-indigo-600 font-bold">TK {arcadeProfit.toLocaleString()}</span></span>
                            </div>
                        </div>
                    </Card>

                    <Card className="p-5 flex flex-row items-center gap-4 hover:shadow-md transition-all border-stone-200/60">
                        <div className="p-3.5 rounded-2xl bg-purple-100 text-purple-700 shrink-0">
                            <Sparkles className="size-6" />
                        </div>
                        <div>
                            <p className="text-[10px] text-stone-400 font-bold uppercase tracking-wider mb-0.5">Arcade Liability</p>
                            <p className="text-2xl font-bold text-stone-900 leading-tight">TK {totalStudentArcadeBalance.toLocaleString()}</p>
                            <div className="mt-1 text-[10px] text-stone-400 font-bold">
                                Total Student Balances
                            </div>
                        </div>
                    </Card>

                    <Card className={`p-5 flex flex-row items-center gap-4 hover:shadow-md transition-all border-none shadow-lg ${netPlatformLiquidity >= 0 ? 'bg-[#5D4037] text-white' : 'bg-rose-600 text-white'}`}>
                        <div className="p-3.5 rounded-2xl bg-white/20 shrink-0">
                            <History className="size-6" />
                        </div>
                        <div>
                            <p className="text-[10px] text-stone-200 font-bold uppercase tracking-wider mb-0.5">Net Liquidity</p>
                            <p className="text-1xl font-bold leading-tight">TK {netPlatformLiquidity.toLocaleString()}</p>
                            <div className="mt-1 text-[10px] text-stone-300/80 font-bold leading-tight">
                                {netPlatformLiquidity < 0 ? '⚠️ Check Payouts' : 'Gross - Payouts'}
                            </div>
                        </div>
                    </Card>
                </div>


                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Revenue Chart */}
                    <Card className="p-6 lg:col-span-2">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="font-bold text-stone-900">Revenue & Profit Trends</h3>
                            <select className="text-sm border-none bg-stone-50 rounded-lg p-1 text-stone-600">
                                <option>Last 7 Days</option>
                                <option>Last 30 Days</option>
                            </select>
                        </div>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={chartData}>
                                    <defs>
                                        <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#5D4037" stopOpacity={0.1} />
                                            <stop offset="95%" stopColor="#5D4037" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E7E5E4" />
                                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#78716C', fontSize: 12 }} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#78716C', fontSize: 12 }} />
                                    <Tooltip />
                                    <Area type="monotone" dataKey="revenue" stroke="#5D4037" fillOpacity={1} fill="url(#colorRev)" strokeWidth={2} name="Gross Revenue" />
                                    <Area type="monotone" dataKey="profit" stroke="#22c55e" fillOpacity={0} strokeWidth={2} name="Commission Profit" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>

                    {/* Quick Settings */}
                    <Card className="p-6">
                        <h3 className="font-bold text-stone-900 mb-6 flex items-center gap-2">
                            <Settings className="size-4" /> Financial Settings
                        </h3>

                        <div className="space-y-6">
                            <div className="space-y-2">
                                <Label>Commission Rate (%)</Label>
                                <div className="flex gap-2">
                                    <Input
                                        type="number"
                                        value={newRate}
                                        onChange={(e) => setNewRate(Number(e.target.value))}
                                        disabled={!iseditingRate}
                                        className="flex-1"
                                    />
                                    {iseditingRate ? (
                                        <Button onClick={handleUpdateRate}>Save</Button>
                                    ) : (
                                        <Button variant="outline" onClick={() => setIsEditingRate(true)}>Edit</Button>
                                    )}
                                </div>
                                <p className="text-[10px] text-stone-500">
                                    New rate applies to all future completed orders.
                                </p>
                                <div className="mt-4 p-3 bg-amber-50 rounded-lg border border-amber-100">
                                    <p className="text-[11px] text-amber-800 leading-relaxed">
                                        <span className="font-bold">Note:</span> Platform Profit is officially recorded as a <span className="font-bold uppercase">Commission</span> transaction only when an order is marked as <span className="font-bold">COMPLETED</span> by the expert.
                                    </p>
                                </div>
                            </div>

                            <div className="pt-6 border-t border-stone-100">
                                <h4 className="text-sm font-bold text-stone-800 mb-4">Payout Overview</h4>
                                <div className="space-y-3">
                                    {[...experts]
                                        .sort((a, b) => (b.balance || 0) - (a.balance || 0))
                                        .slice(0, 5)
                                        .map(expert => (
                                            <div key={expert.id} className="flex items-center justify-between text-sm">
                                                <span className="text-stone-600 truncate mr-2" title={expert.name}>{expert.name}</span>
                                                <span className="font-bold text-stone-900 whitespace-nowrap">TK {(expert.balance || 0).toLocaleString()}</span>
                                            </div>
                                        ))}
                                    {experts.length === 0 && (
                                        <EmptyState
                                            icon={DollarSign}
                                            title="No experts"
                                            subtitle="There are currently no expert accounts to display."
                                            compact
                                            className="bg-transparent border-none shadow-none py-2"
                                        />
                                    )}
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Pending Verifications */}
                {orders.some(o => o.paymentStatus === 'PENDING') && (
                    <Card className="overflow-hidden border-stone-200">
                        <div className="p-6 border-b border-stone-100 flex items-center justify-between">
                            <h3 className="font-bold text-stone-900 flex items-center gap-2">
                                <DollarSign className="size-4" /> Pending Payment Verifications
                            </h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-stone-50 text-stone-500 font-medium">
                                    <tr>
                                        <th className="px-6 py-4">Order ID</th>
                                        <th className="px-6 py-4">Topic</th>
                                        <th className="px-6 py-4">Amount</th>
                                        <th className="px-6 py-4">Method</th>
                                        <th className="px-6 py-4">Transaction ID</th>
                                        <th className="px-6 py-4">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-stone-100">
                                    {orders
                                        .filter(o => o.paymentStatus === 'PENDING')
                                        .sort((a, b) => b.id.localeCompare(a.id))
                                        .map(order => (
                                            <tr key={order.id} className="hover:bg-stone-50/50 transition-colors">
                                                <td className="px-6 py-4 font-mono text-xs text-stone-400">#{order.id.slice(-6)}</td>
                                                <td className="px-6 py-4 font-medium text-stone-900">{order.topic}</td>
                                                <td className="px-6 py-4 font-bold text-stone-900">TK {(order.amount || 0).toLocaleString()}</td>
                                                <td className="px-6 py-4 text-stone-600">{order.paymentMethod || 'N/A'}</td>
                                                <td className="px-6 py-4 font-mono text-stone-600 select-all">
                                                    {order.transactionId || '---'}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex gap-2">
                                                        <Button
                                                            size="sm"
                                                            className="bg-green-600 hover:bg-green-700 text-white border-none shadow-sm h-8"
                                                            onClick={() => setConfirmModal({
                                                                open: true,
                                                                type: 'verify',
                                                                orderId: order.id,
                                                                orderTopic: order.topic,
                                                                amount: order.amount
                                                            })}
                                                        >
                                                            Verify
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            className="border-red-200 text-red-700 hover:bg-red-50 hover:text-red-800 hover:border-red-300 h-8"
                                                            onClick={() => setConfirmModal({
                                                                open: true,
                                                                type: 'reject',
                                                                orderId: order.id,
                                                                orderTopic: order.topic,
                                                                amount: order.amount
                                                            })}
                                                        >
                                                            Reject
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                )}

                {/* Payout Management - Split Expert vs Student */}
                <div className="grid grid-cols-1 gap-8">
                    {/* Expert Payouts */}
                    {withdrawalRequests.filter(r => r.status === 'PENDING').some(r => r.expertId) && (
                        <Card className="overflow-hidden border-stone-200">
                            <div className="p-6 border-b border-stone-100 flex items-center justify-between bg-amber-50/30">
                                <h3 className="font-bold text-stone-900 flex items-center gap-2">
                                    <UserIcon className="size-4 text-amber-600" /> Pending Expert Payouts
                                </h3>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-stone-50 text-stone-500 font-medium">
                                        <tr>
                                            <th className="px-6 py-4">Expert</th>
                                            <th className="px-6 py-4">Amount</th>
                                            <th className="px-6 py-4">Method Details</th>
                                            <th className="px-6 py-4">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-stone-100">
                                        {withdrawalRequests
                                            .filter(r => r.status === 'PENDING' && r.expertId)
                                            .map(req => {
                                                const expert = experts.find(e => e.id === req.expertId);
                                                return (
                                                    <tr key={req.id} className="hover:bg-stone-50/50 transition-colors">
                                                        <td className="px-6 py-4 font-medium text-stone-900">{expert?.name || req.expertId}</td>
                                                        <td className="px-6 py-4 font-bold text-stone-900 font-mono">TK {req.amount.toLocaleString()}</td>
                                                        <td className="px-6 py-4 text-stone-600 text-xs">
                                                            {req.methodDetails?.type} - {req.methodDetails?.accountNumber}
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            {/* Reuse standard payout verification if it exists or implement buttons */}
                                                            <Link to="/admin/withdrawals">
                                                                <Button size="sm" variant="outline">Manage in Records</Button>
                                                            </Link>
                                                        </td>
                                                    </tr>
                                                );
                                            })
                                        }
                                    </tbody>
                                </table>
                            </div>
                        </Card>
                    )}

                    {/* Student Withdrawals */}
                    {withdrawalRequests.filter(r => r.status === 'PENDING').some(r => r.studentId) && (
                        <Card className="overflow-hidden border-stone-200">
                            <div className="p-6 border-b border-stone-100 flex items-center justify-between bg-indigo-50/30">
                                <h3 className="font-bold text-stone-900 flex items-center gap-2">
                                    <Sparkles className="size-4 text-indigo-600" /> Pending Withdrawals (Students)
                                </h3>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-stone-50 text-stone-500 font-medium">
                                        <tr>
                                            <th className="px-6 py-4">Date</th>
                                            <th className="px-6 py-4">Student</th>
                                            <th className="px-6 py-4">Amount</th>
                                            <th className="px-6 py-4">Method</th>
                                            <th className="px-6 py-4">Phone Number</th>
                                            <th className="px-6 py-4">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-stone-100">
                                        {withdrawalRequests
                                            .filter(r => r.status === 'PENDING' && r.studentId)
                                            .map(req => (
                                                <tr key={req.id} className="hover:bg-stone-50/50 transition-colors">
                                                    <td className="px-6 py-4 text-stone-600">{format(new Date(req.createdAt), 'MMM d, HH:mm')}</td>
                                                    <td className="px-6 py-4 font-medium text-stone-900">Student ID: {req.studentId?.slice(-6)}</td>
                                                    <td className="px-6 py-4 text-stone-900 font-bold">
                                                        TK {(req.amount || 0).toLocaleString()}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${req.method === 'bKash' ? 'bg-[#D12053]/10 text-[#D12053]' : 'bg-[#FAAB1A]/10 text-[#FAAB1A]'
                                                            }`}>
                                                            {req.method}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 font-mono text-stone-600 select-all">{req.phone_number}</td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex gap-2">
                                                            <button
                                                                className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded-md text-xs font-bold transition-all"
                                                                onClick={() => setStudentWithdrawModal({
                                                                    open: true,
                                                                    type: 'approve',
                                                                    withdrawalId: req.id,
                                                                    studentName: `Student (${req.studentId?.slice(-6)})`,
                                                                    amount: req.amount
                                                                })}
                                                            >
                                                                Paid
                                                            </button>
                                                            <button
                                                                className="px-3 py-1 bg-white border border-red-200 text-red-600 hover:bg-red-50 rounded-md text-xs font-bold transition-all"
                                                                onClick={() => setStudentWithdrawModal({
                                                                    open: true,
                                                                    type: 'reject',
                                                                    withdrawalId: req.id,
                                                                    studentName: `Student (${req.studentId?.slice(-6)})`,
                                                                    amount: req.amount
                                                                })}
                                                            >
                                                                Reject
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                    </tbody>
                                </table>
                            </div>
                        </Card>
                    )}
                </div>



                {/* Transaction Table */}
                <Card className="overflow-hidden border-stone-200">
                    <div className="p-6 border-b border-stone-100 flex items-center justify-between">
                        <h3 className="font-bold text-stone-900 flex items-center gap-2">
                            <History className="size-4" /> Transaction Registry
                        </h3>
                        <div className="flex gap-2 items-center">
                            <Filter className="size-4 text-stone-400" />
                            <select
                                className="text-sm border-stone-200 rounded-md p-1.5 bg-white text-stone-700 focus:ring-2 focus:ring-[#5D4037] focus:outline-none"
                                value={filterType}
                                onChange={(e) => setFilterType(e.target.value)}
                            >
                                <option value="ALL">All Transactions</option>
                                <option value="INCOME">Income (Payments)</option>
                                <option value="PAYOUT">Payouts (Withdrawals)</option>
                                <option value="COMMISSION">Commissions</option>
                            </select>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-stone-50 text-stone-500 font-medium">
                                <tr>
                                    <th className="px-6 py-4">Transaction ID</th>
                                    <th className="px-6 py-4">Date</th>
                                    <th className="px-6 py-4">Type</th>
                                    <th className="px-6 py-4">Amount</th>
                                    <th className="px-6 py-4">Description</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-stone-100">
                                {financialTransactions
                                    .filter(tx => filterType === 'ALL' || tx.type === filterType)
                                    .length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center text-stone-400">
                                            <EmptyState
                                                icon={History}
                                                title="No transactions found"
                                                subtitle="The financial registry is currently empty for the selected filter."
                                                compact
                                                className="my-4 border-none shadow-none bg-transparent"
                                            />
                                        </td>
                                    </tr>
                                ) : (
                                    financialTransactions
                                        .filter(tx => filterType === 'ALL' || tx.type === filterType)
                                        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                                        .map(tx => (
                                            <tr key={tx.id} className="hover:bg-stone-50/50 transition-colors">
                                                <td className="px-6 py-4 font-mono text-xs text-stone-400">#{tx.id.slice(-8)}</td>
                                                <td className="px-6 py-4 text-stone-600">{format(new Date(tx.createdAt), 'MMM d, HH:mm')}</td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${tx.type === 'INCOME' ? 'bg-green-100 text-green-700' :
                                                        tx.type === 'COMMISSION' ? 'bg-blue-100 text-blue-700' :
                                                            tx.type === 'PAYOUT' ? 'bg-amber-100 text-amber-700' :
                                                                tx.type === 'EXPERT_CREDIT' ? 'bg-purple-100 text-purple-700' :
                                                                    tx.type === 'STUDENT_EARNING' ? 'bg-indigo-100 text-indigo-700' :
                                                                        'bg-stone-100 text-stone-700'
                                                        }`}>

                                                        {tx.type}
                                                    </span>
                                                </td>
                                                <td className={`px-6 py-4 font-bold ${tx.type === 'INCOME' ? 'text-green-600' :
                                                    tx.type === 'PAYOUT' ? 'text-red-600' :
                                                        'text-stone-900'
                                                    }`}>
                                                    {tx.type === 'PAYOUT' ? '-' : '+'}TK {tx.amount.toLocaleString()}
                                                </td>
                                                <td className="px-6 py-4 text-stone-500 max-w-xs truncate">
                                                    <span className={`text-[10px] font-bold mr-2 uppercase px-1.5 py-0.5 rounded ${tx.type === 'STUDENT_EARNING' ? 'bg-indigo-100 text-indigo-700' :
                                                        tx.type === 'COMMISSION' ? 'bg-blue-100 text-blue-700' :
                                                            tx.type === 'INCOME' ? 'bg-green-100 text-green-700' :
                                                                'bg-stone-100 text-stone-600'
                                                        }`}>
                                                        {tx.type === 'STUDENT_EARNING' ? 'Arcade' : 'Service'}
                                                    </span>
                                                    {tx.description}
                                                </td>
                                            </tr>
                                        ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </div>

            <AlertDialog open={confirmModal.open} onOpenChange={(open) => !open && setConfirmModal(prev => ({ ...prev, open: false }))}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            {confirmModal.type === 'verify' ? 'Confirm Payment Verification' : 'Reject Payment'}
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            {confirmModal.type === 'verify' ? (
                                <>
                                    Are you sure you want to verify the payment of <span className="font-bold text-stone-900 font-mono">TK {confirmModal.amount?.toLocaleString()}</span> for <span className="font-medium text-stone-900">"{confirmModal.orderTopic}"</span>? This action will record the transaction and update the order status.
                                </>
                            ) : (
                                <>
                                    Are you sure you want to reject this payment? The student will be notified and may need to re-submit payment details.
                                </>
                            )}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleConfirmAction}
                            className={confirmModal.type === 'verify' ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"}
                        >
                            {confirmModal.type === 'verify' ? 'Confirm Verification' : 'Confirm Rejection'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <AlertDialog open={studentWithdrawModal.open} onOpenChange={(open) => !open && setStudentWithdrawModal(prev => ({ ...prev, open: false }))}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            {studentWithdrawModal.type === 'approve' ? 'Confirm Student Payout' : 'Reject Withdrawal Request'}
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            {studentWithdrawModal.type === 'approve' ? (
                                <>
                                    Are you sure you want to mark this withdrawal of <span className="font-bold text-stone-900 font-mono">TK {studentWithdrawModal.amount?.toLocaleString()}</span> for <span className="font-medium text-stone-900">{studentWithdrawModal.studentName}</span> as <span className="font-bold text-green-600">PAID</span>? This will record the payout transaction.
                                </>
                            ) : (
                                <>
                                    Are you sure you want to reject this withdrawal request? The funds will be <strong>refunded</strong> to the student's balance.
                                </>
                            )}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleConfirmStudentWithdrawal}
                            className={studentWithdrawModal.type === 'approve' ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"}
                        >
                            {studentWithdrawModal.type === 'approve' ? 'Confirm Payout' : 'Reject & Refund'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </DashboardLayout >

    );
}
