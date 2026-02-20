import React, { useState } from 'react';
import { useStore } from './store';
import { DashboardLayout } from './components/Layout';
import { Card } from './components/ui/card';
import { Button } from './components/ui/button';
import { Input } from './components/ui/input';
import { Label } from './components/ui/label';
import {
  CreditCard,
  DollarSign,
  Download,
  ExternalLink,
  Plus,
  ArrowUpRight,
  ArrowDownLeft,
  Wallet,
  Building,
  History,
  AlertCircle,
  CheckCircle,
  Clock,
  ArrowLeftRight,
  XCircle,
  Settings
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { EmptyState } from './components/ui/EmptyState';

export default function ExpertPayouts() {
  const { currentUser, experts, financialTransactions, withdrawalRequests, requestWithdrawal } = useStore();
  // Use userId (if populated) or map from store correctly
  // Assuming experts store holds full expert objects with userId expanded or as string
  // Robust expert matching (handle string or populated object)
  const expert = experts.find(e => ((e.userId as any)?._id || e.userId) === currentUser?.id);


  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState<number>(0);
  const [selectedMethodId, setSelectedMethodId] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);

  if (!expert) return null;

  // 1. Get My Withdrawals with safe ID comparison
  const myWithdrawals = withdrawalRequests.filter(r => {
    const withdrawalExpertId = (r.expertId as any)?._id || r.expertId;
    return withdrawalExpertId === (expert.id || (expert as any)._id);
  });

  // 2. Calculate Pending Amount
  const pendingAmount = myWithdrawals
    .filter(r => ['PENDING', 'CONFIRMED'].includes(r.status))
    .reduce((acc, curr) => acc + curr.amount, 0);

  // 3. Effective/Available Balance
  const availableBalance = Math.max(0, expert.balance - pendingAmount);

  // 4. Merge Transactions & Withdrawals
  const combinedTransactions = [
    ...financialTransactions.filter(t => t.expertId === currentUser?.id || t.expertId === expert.id),
    ...myWithdrawals.map(w => ({
      id: w.id || (w as any)._id,
      expertId: w.expertId,
      type: 'WITHDRAWAL',
      amount: -w.amount,
      description: `Withdrawal Request (${w.status})`,
      status: w.status.toLowerCase(), // PENDING -> pending
      createdAt: w.createdAt,
      updatedAt: w.updatedAt
    }))
  ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const handleExportCSV = () => {
    const headers = ['Date', 'Type', 'Description', 'Amount', 'Status'];
    const rows = combinedTransactions.map(tx => [
      format(new Date(tx.createdAt), 'yyyy-MM-dd HH:mm:ss'),
      tx.type,
      tx.description,
      tx.amount,
      tx.status
    ]);

    const csvContent = "data:text/csv;charset=utf-8,"
      + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `transactions_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    if (withdrawAmount <= 0 || withdrawAmount > availableBalance) {
      toast.error("Invalid amount or insufficient available balance");
      return;
    }
    if (!selectedMethodId) {
      toast.error("Please select a payout method");
      return;
    }

    setIsProcessing(true);
    try {
      await requestWithdrawal(expert.id, withdrawAmount, selectedMethodId);
      setIsWithdrawModalOpen(false);
      setWithdrawAmount(0);
    } catch (error) {
      console.error(error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-[#3E2723]">Financial Overview</h1>
            <p className="text-stone-500">Manage your earnings and payouts.</p>
          </div>
          <Link to="/expert/settings?tab=billing">
            <Button variant="outline" className="gap-2">
              <Settings className="size-4" /> Settings
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Balance Card */}
          <Card className="md:col-span-2 p-8 bg-[#3E2723] text-white relative overflow-hidden flex flex-col justify-between min-h-[200px]">
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-white/10 rounded-full">
                  <Wallet className="size-5 text-amber-300" />
                </div>
                <p className="text-stone-300 font-medium">Available Balance</p>
              </div>
              <h2 className="text-5xl font-bold mb-2">TK {availableBalance.toLocaleString()}</h2>
              {pendingAmount > 0 && (
                <p className="text-sm text-stone-300 mb-4">
                  (TK {expert.balance.toLocaleString()} total - TK {pendingAmount.toLocaleString()} pending)
                </p>
              )}

              <div className="flex gap-4">
                <Button
                  onClick={() => {
                    setWithdrawAmount(availableBalance);
                    if (expert.payoutMethods.length > 0) {
                      const firstMethod = expert.payoutMethods[0];
                      setSelectedMethodId(firstMethod.id || firstMethod._id || '');
                    }
                    setIsWithdrawModalOpen(true);
                  }}
                  disabled={availableBalance <= 0}
                  className="bg-white text-[#5D4037] hover:bg-stone-100 border-none disabled:opacity-50"
                >
                  Withdraw Funds
                </Button>
                <Link to="/expert/settings?tab=billing">
                  <Button variant="outline" className="bg-white/10 hover:bg-white text-white hover:text-[#5D4037] border-white/30 transition-all shadow-lg active:scale-95">
                    <CreditCard className="mr-2 size-4" /> Payout Settings
                  </Button>
                </Link>
              </div>
            </div>

            <div className="absolute right-0 top-0 bottom-0 w-1/2 bg-gradient-to-l from-white/5 to-transparent pointer-events-none" />
            <ArrowUpRight className="absolute -right-6 -bottom-6 size-48 text-white/5 rotate-12" />
          </Card>

          {/* Stats Card */}
          <Card className="p-6 flex flex-col justify-center space-y-6">
            <div>
              <p className="text-stone-500 text-sm font-medium mb-1">Total Earnings</p>
              <p className="text-2xl font-bold text-[#3E2723]">TK {(expert.earnings || 0).toLocaleString()}</p>
            </div>
            <div className="h-px bg-stone-100" />
            <div>
              <p className="text-stone-500 text-sm font-medium mb-1">Current Balance</p>
              <p className="text-2xl font-bold text-stone-900">TK {expert.balance.toLocaleString()}</p>
            </div>
          </Card>
        </div>

        {/* Transaction History */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-lg text-stone-900">Transaction History</h3>
            <Button variant="ghost" size="sm" onClick={handleExportCSV}>
              <Download className="mr-2 size-4" /> Export CSV
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-stone-50 text-stone-500 font-medium">
                <tr>
                  <th className="px-4 py-3 rounded-l-lg">Date</th>
                  <th className="px-4 py-3">Description</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right rounded-r-lg">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {combinedTransactions.map((tx, i) => (
                  <motion.tr
                    key={tx.id || i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="hover:bg-stone-50/50 transition-colors"
                  >
                    <td className="px-4 py-4 text-stone-500">
                      {format(new Date(tx.createdAt), 'MMM d, yyyy')}
                      <div className="text-xs text-stone-400">{format(new Date(tx.createdAt), 'h:mm a')}</div>
                    </td>
                    <td className="px-4 py-4 font-medium text-stone-900">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full ${tx.type === 'INCOME' || tx.type === 'EXPERT_CREDIT' ? 'bg-green-100 text-green-600' : 'bg-stone-100 text-stone-500'}`}>
                          {tx.type === 'INCOME' || tx.type === 'EXPERT_CREDIT' ? <ArrowUpRight className="size-4" /> : <ArrowLeftRight className="size-4" />}
                        </div>
                        {tx.description}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`
                        inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                        ${['completed', 'processed', 'paid'].includes(tx.status?.toLowerCase()) ? 'bg-green-100 text-green-800' :
                          ['pending', 'confirmed'].includes(tx.status?.toLowerCase()) ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'}
                      `}>
                        {['completed', 'processed', 'paid'].includes(tx.status?.toLowerCase()) ? <CheckCircle className="mr-1 size-3" /> : <Clock className="mr-1 size-3" />}
                        {tx.status || 'completed'}
                      </span>
                    </td>
                    <td className={`px-4 py-4 text-right font-bold ${tx.type === 'INCOME' ? 'text-green-600' : 'text-stone-900'}`}>
                      {tx.type === 'INCOME' ? '+' : ''}TK {Math.abs(tx.amount).toLocaleString()}
                    </td>
                  </motion.tr>
                ))}
                {combinedTransactions.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-stone-500">
                      <EmptyState
                        icon={ArrowLeftRight}
                        title="No transactions found"
                        subtitle="Your financial history is currently empty. Complete orders to start seeing transactions here."
                        compact
                        className="my-4 border-none shadow-none bg-transparent"
                      />
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Withdraw Modal */}
      <AnimatePresence>
        {isWithdrawModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-[#3E2723]">Withdraw Funds</h3>
                <button onClick={() => setIsWithdrawModalOpen(false)} className="text-stone-400 hover:text-stone-600">
                  <AlertCircle className="size-6 rotate-45" />
                </button>
              </div>

              <form onSubmit={handleWithdraw} className="space-y-6">
                <div className="space-y-2">
                  <Label>Available Balance</Label>
                  <p className="text-2xl font-bold text-[#3E2723]">TK {expert.balance.toLocaleString()}</p>
                </div>

                <div className="space-y-2">
                  <Label>Withdraw Amount (TK)</Label>
                  <Input
                    type="number"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(Number(e.target.value))}
                    max={expert.balance}
                    min={100}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Payout Method</Label>
                  {expert.payoutMethods.length === 0 ? (
                    <div className="p-4 bg-amber-50 rounded-lg border border-amber-100 text-amber-800 text-sm">
                      No payout methods found. Please <Link to="/expert/settings" className="font-bold underline">add one</Link> first.
                    </div>
                  ) : (
                    <select
                      className="w-full h-10 px-3 rounded-md border border-stone-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#5D4037]"
                      value={selectedMethodId}
                      onChange={(e) => {
                        setSelectedMethodId(e.target.value);
                      }}
                    >
                      {expert.payoutMethods.map((method, idx) => {
                        const val = method.id || method._id;
                        return (
                          <option key={val || idx} value={val}>
                            {method.type} - {method.accountNumber}
                          </option>
                        );
                      })}
                    </select>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full py-6"
                  disabled={isProcessing || expert.payoutMethods.length === 0 || withdrawAmount <= 0}
                >
                  {isProcessing ? 'Processing Withdrawal...' : 'Confirm Withdrawal'}
                </Button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
}
