import React, { useState } from 'react';
import { useStore } from '../store';
import { motion, AnimatePresence } from 'motion/react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { X, Smartphone, Wallet, CreditCard, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

export default function WithdrawModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
    const { currentUser, requestStudentWithdrawal, withdrawalRequests } = useStore();
    const [method, setMethod] = useState<'bKash' | 'Nagad'>('bKash');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [amount, setAmount] = useState<string>('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    // Calculate if already withdrawn this month
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const hasWithdrawnThisMonth = withdrawalRequests.some(r => {
        const reqDate = new Date(r.createdAt);
        return r.studentId === currentUser?.id &&
            r.status !== 'REJECTED' &&
            reqDate >= startOfMonth;
    });

    const credits = currentUser?.pengu_credits || 0;
    const bdtValue = amount ? (parseInt(amount) / 100) * 120 : 0;

    const nextCycleDate = new Date(now.getFullYear(), now.getMonth() + 1, 1).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (hasWithdrawnThisMonth) {
            toast.error("You have already withdrawn this month.");
            return;
        }

        const amountNum = parseInt(amount);

        if (!phoneNumber || phoneNumber.length < 11) {
            toast.error("Please enter a valid phone number");
            return;
        }

        if (!amountNum || amountNum < 500) {
            toast.error("Minimum withdrawal is 500 Credits");
            return;
        }

        if (amountNum > credits) {
            toast.error("Insufficient credits");
            return;
        }

        setIsProcessing(true);
        try {
            await requestStudentWithdrawal(amountNum, method, phoneNumber);
            setIsSuccess(true);
        } catch (error) {
            console.error(error);
        } finally {
            setIsProcessing(false);
        }
    };

    if (isSuccess) {
        return (
            <AnimatePresence>
                {isOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 text-center"
                        >
                            <div className="size-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <CheckCircle2 className="size-10 text-green-600" />
                            </div>
                            <h3 className="text-2xl font-bold text-stone-900 mb-2">Request Sent!</h3>
                            <p className="text-stone-500 mb-8 text-balance">
                                Your withdrawal request has been submitted. An admin will process your payment within 24 hours.
                            </p>
                            <Button onClick={() => { setIsSuccess(false); onClose(); }} className="w-full py-6 text-lg rounded-xl bg-[#5D4037] hover:bg-[#3E2723]">
                                Got it, thanks!
                            </Button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        );
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden"
                    >
                        <div className="p-6 border-b border-stone-100 flex justify-between items-center bg-stone-50/50">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-[#5D4037] rounded-lg text-white">
                                    <Wallet className="size-5" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-stone-900 leading-tight">Withdraw Funds</h3>
                                    <p className="text-xs text-stone-500">Fast & Secure Payouts</p>
                                </div>
                            </div>
                            <button onClick={onClose} className="p-2 hover:bg-stone-100 rounded-full transition-colors text-stone-400">
                                <X className="size-5" />
                            </button>
                        </div>

                        {hasWithdrawnThisMonth ? (
                            <div className="p-8 text-center space-y-6">
                                <div className="size-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-2">
                                    <X className="size-10 text-amber-600" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-stone-900 mb-2">Cycle Locked</h3>
                                    <p className="text-stone-500 text-sm leading-relaxed">
                                        Since CPX Research pays out on a monthly cycle, you can request one withdrawal per calendar month.
                                    </p>
                                </div>
                                <div className="bg-stone-50 rounded-2xl p-6 border border-stone-100">
                                    <p className="text-xs text-stone-400 font-bold uppercase tracking-wider mb-1">Next Cycle Opens</p>
                                    <p className="text-xl font-black text-[#5D4037]">{nextCycleDate}</p>
                                </div>
                                <Button
                                    onClick={onClose}
                                    className="w-full py-6 rounded-xl bg-stone-200 hover:bg-stone-300 text-stone-700 font-bold"
                                >
                                    Close
                                </Button>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="p-8 space-y-6">
                                <div className="bg-amber-50 rounded-2xl p-5 border border-amber-100 flex items-center justify-between">
                                    <div>
                                        <Label className="text-amber-800 font-bold mb-1 block">Current Pool</Label>
                                        <p className="text-3xl font-black text-amber-900">{credits.toLocaleString()} <span className="text-sm font-medium opacity-70">Credits</span></p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs text-amber-700/70 font-medium">Approx. BDT</p>
                                        <p className="text-lg font-bold text-amber-900">৳{((credits / 100) * 120).toLocaleString()}</p>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <Label className="text-stone-700 font-bold flex items-center gap-2">
                                        <CreditCard className="size-4" /> Select Provider
                                    </Label>
                                    <div className="grid grid-cols-2 gap-4">
                                        <button
                                            type="button"
                                            onClick={() => setMethod('bKash')}
                                            className={`flex items-center justify-center gap-3 p-4 rounded-xl border-2 transition-all ${method === 'bKash'
                                                ? 'border-[#D12053] bg-[#D12053]/5 text-[#D12053]'
                                                : 'border-stone-100 hover:border-stone-200 text-stone-500'
                                                }`}
                                        >
                                            <div className={`size-2 rounded-full ${method === 'bKash' ? 'bg-[#D12053]' : 'bg-stone-300'}`} />
                                            <span className="font-bold">bKash</span>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setMethod('Nagad')}
                                            className={`flex items-center justify-center gap-3 p-4 rounded-xl border-2 transition-all ${method === 'Nagad'
                                                ? 'border-[#FAAB1A] bg-[#FAAB1A]/5 text-[#FAAB1A]'
                                                : 'border-stone-100 hover:border-stone-200 text-stone-500'
                                                }`}
                                        >
                                            <div className={`size-2 rounded-full ${method === 'Nagad' ? 'bg-[#FAAB1A]' : 'bg-stone-300'}`} />
                                            <span className="font-bold">Nagad</span>
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-stone-700 font-bold flex items-center gap-2">
                                        <Smartphone className="size-4" /> Phone Number
                                    </Label>
                                    <Input
                                        placeholder="017XXXXXXXX"
                                        value={phoneNumber}
                                        onChange={(e) => setPhoneNumber(e.target.value)}
                                        className="rounded-xl border-stone-200 h-12 focus:ring-[#5D4037]"
                                    />
                                </div>

                                <div className="space-y-2 relative">
                                    <Label className="text-stone-700 font-bold flex items-center gap-2">
                                        Amount to Withdraw (Credits)
                                    </Label>
                                    <Input
                                        type="number"
                                        placeholder="Minimum 500"
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        className="rounded-xl border-stone-200 h-12 pr-20 focus:ring-[#5D4037]"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setAmount(credits.toString())}
                                        className="absolute right-3 top-[34px] text-xs font-bold text-[#5D4037] hover:underline"
                                    >
                                        MAX
                                    </button>
                                    {amount && (
                                        <p className="text-xs text-stone-500 mt-1 flex justify-between px-1">
                                            <span>Equivalent to: <span className="font-bold text-green-600">৳{bdtValue.toLocaleString()}</span></span>
                                            <span>Rate: 100c = ৳120</span>
                                        </p>
                                    )}
                                </div>

                                <Button
                                    type="submit"
                                    disabled={isProcessing || !amount || parseInt(amount) < 500}
                                    className="w-full h-14 text-lg rounded-2xl bg-[#5D4037] hover:bg-[#3E2723] shadow-lg shadow-[#5D4037]/20 disabled:opacity-50 transition-all font-bold"
                                >
                                    {isProcessing ? 'Processing...' : 'Request Withdrawal'}
                                </Button>
                            </form>
                        )}
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
