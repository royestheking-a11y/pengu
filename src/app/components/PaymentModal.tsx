import React, { useState } from 'react';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import {
  CreditCard,
  Lock,
  X,
  CheckCircle,
  Apple,
  Coins,
  Wallet
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useStore } from '../store';

interface PaymentModalProps {
  amount: number;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (transactionId?: string, method?: string) => void;
  hideBalanceOption?: boolean;
}

export default function PaymentModal({ amount, isOpen, onClose, onSuccess, hideBalanceOption = false }: PaymentModalProps) {
  const { currentUser } = useStore();
  const [step, setStep] = useState<'details' | 'processing' | 'success'>('details');
  const [selectedMethod, setSelectedMethod] = useState<'bkash' | 'card' | 'balance'>('bkash');
  const [transactionId, setTransactionId] = useState('');

  if (!isOpen) return null;

  const handlePay = () => {
    if (selectedMethod === 'bkash' && !transactionId.trim()) {
      alert("Please enter a Transaction ID");
      return;
    }

    if (selectedMethod === 'balance') {
      const balance = currentUser?.balance || 0;
      if (balance < amount) {
        alert("Insufficient Pengu Balance! Play more games to earn coins.");
        return;
      }
    }

    setStep('processing');
    setTimeout(() => {
      setStep('success');
      setTimeout(() => {
        onSuccess(selectedMethod === 'balance' ? `BAL-TX-${Date.now()}` : transactionId, selectedMethod.toUpperCase());
        onClose();
        setStep('details');
        setTransactionId('');
      }, 1500);
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 backdrop-blur-sm p-4 md:p-8">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="w-full max-w-4xl"
      >
        <Card className="overflow-hidden relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-stone-400 hover:text-stone-600 transition-colors"
          >
            <X className="size-5" />
          </button>

          {step === 'details' && (
            <div className="flex flex-col md:flex-row min-h-[500px]">
              {/* Left Column: Methods */}
              <div className="md:w-5/12 bg-stone-50 border-r border-stone-200 p-6 md:p-8 flex flex-col">
                <div className="mb-8">
                  <h2 className="text-2xl font-black text-[#3E2723] uppercase tracking-tight">Checkout</h2>
                  <p className="text-stone-500 text-sm mt-1">Select payment method</p>
                </div>

                <div className="space-y-3 flex-1">
                  <button
                    onClick={() => setSelectedMethod('bkash')}
                    className={`w-full flex items-center gap-3 p-4 rounded-xl border transition-all ${selectedMethod === 'bkash' ? 'border-[#5D4037] bg-white ring-2 ring-[#5D4037]/20 shadow-sm' : 'border-stone-200 bg-white hover:border-stone-300'}`}
                  >
                    <div className="h-8 w-12 bg-stone-100 rounded flex items-center justify-center overflow-hidden shrink-0">
                      <img src="/Bkash.jpg" alt="Bkash" className="h-full w-full object-cover" />
                    </div>
                    <span className="font-bold text-stone-900">bKash</span>
                    {selectedMethod === 'bkash' && <CheckCircle className="ml-auto size-5 text-[#5D4037]" />}
                  </button>

                  <button
                    onClick={() => setSelectedMethod('card')}
                    className={`w-full flex items-center gap-3 p-4 rounded-xl border transition-all ${selectedMethod === 'card' ? 'border-[#5D4037] bg-white ring-2 ring-[#5D4037]/20 shadow-sm' : 'border-stone-200 bg-white hover:border-stone-300'}`}
                  >
                    <div className="h-8 w-12 bg-stone-100 rounded flex items-center justify-center shrink-0">
                      <CreditCard className="size-5 text-stone-500" />
                    </div>
                    <span className="font-bold text-stone-900">Credit Card</span>
                    {selectedMethod === 'card' && <CheckCircle className="ml-auto size-5 text-[#5D4037]" />}
                  </button>

                  {!hideBalanceOption && (
                    <button
                      onClick={() => setSelectedMethod('balance')}
                      className={`w-full flex flex-col p-4 rounded-xl border transition-all ${selectedMethod === 'balance' ? 'border-amber-500 bg-amber-50 ring-2 ring-amber-500/20 shadow-sm' : 'border-stone-200 bg-white hover:border-amber-300'}`}
                    >
                      <div className="flex items-center gap-3 w-full">
                        <div className={`h-8 w-12 rounded flex items-center justify-center shrink-0 ${selectedMethod === 'balance' ? 'bg-amber-500 text-white' : 'bg-stone-100 text-stone-500'}`}>
                          <Coins className="size-4" />
                        </div>
                        <div className="text-left flex-1">
                          <span className="block font-bold text-stone-900 leading-none mb-1">Pengu Balance</span>
                          <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider">Available: ৳{currentUser?.balance || 0}</span>
                        </div>
                        {selectedMethod === 'balance' && <CheckCircle className="size-5 text-amber-500" />}
                      </div>
                    </button>
                  )}
                </div>

                <div className="mt-6 flex items-center gap-2 text-xs text-stone-400 font-medium">
                  <Lock className="size-3.5" /> Secure & Encrypted Connection
                </div>
              </div>

              {/* Right Column: Details & Pay */}
              <div className="md:w-7/12 p-6 md:p-8 bg-white flex flex-col">
                <div className="flex-1">
                  <div className="flex justify-between items-end mb-8 border-b border-stone-100 pb-6">
                    <div>
                      <p className="text-sm font-bold text-stone-400 uppercase tracking-wider mb-1">Order Total</p>
                      <h3 className="text-4xl font-black text-[#3E2723] tracking-tighter">TK {amount.toLocaleString()}</h3>
                    </div>
                    <div className="text-right">
                      {selectedMethod === 'bkash' && <Badge variant="outline" className="border-[#E2136E] text-[#E2136E] bg-[#E2136E]/5">Manual Verification</Badge>}
                      {selectedMethod === 'card' && <Badge variant="outline" className="border-blue-500 text-blue-600 bg-blue-50">Instant Process</Badge>}
                      {selectedMethod === 'balance' && <Badge variant="outline" className="border-amber-500 text-amber-600 bg-amber-50">Wallet Deduction</Badge>}
                    </div>
                  </div>

                  <AnimatePresence mode="wait">
                    <motion.div
                      key={selectedMethod}
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      className="space-y-6"
                    >
                      {selectedMethod === 'bkash' && (
                        <div className="space-y-5">
                          <div className="bg-[#E2136E]/5 border border-[#E2136E]/20 p-5 rounded-2xl">
                            <p className="text-xs font-bold text-[#E2136E] uppercase tracking-wider mb-2">Step 1: Send Money</p>
                            <p className="text-sm text-stone-600 mb-3">Send the exact amount via bKash App or USSD to our merchant number:</p>
                            <div className="flex items-center justify-between bg-white border border-[#E2136E]/20 p-3 rounded-lg shadow-sm">
                              <span className="font-mono text-xl font-bold text-[#E2136E] tracking-wider">01923053702</span>
                              <Badge className="bg-[#E2136E] text-white hover:bg-[#E2136E]">Personal</Badge>
                            </div>
                          </div>

                          <div className="bg-stone-50 border border-stone-200 p-5 rounded-2xl">
                            <p className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">Step 2: Verify Payment</p>
                            <p className="text-sm text-stone-600 mb-3">Enter the 10-character TrxID found in the SMS confirmation:</p>
                            <div className="relative">
                              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-stone-400" />
                              <input
                                type="text"
                                placeholder="e.g. 9H76..."
                                value={transactionId}
                                onChange={(e) => setTransactionId(e.target.value.toUpperCase())}
                                className="w-full pl-10 pr-4 py-3 rounded-xl border border-stone-300 focus:ring-2 focus:ring-[#5D4037] focus:border-[#5D4037] font-mono font-bold tracking-widest uppercase shadow-sm outline-none transition-shadow"
                                maxLength={15}
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      {selectedMethod === 'card' && (
                        <div className="space-y-4 pt-4">
                          <div className="space-y-1.5">
                            <label className="text-xs font-bold text-stone-500 uppercase">Card Number</label>
                            <input
                              type="text"
                              placeholder="0000 0000 0000 0000"
                              className="w-full p-4 rounded-xl border border-stone-200 font-mono focus:ring-2 focus:ring-[#5D4037] outline-none"
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                              <label className="text-xs font-bold text-stone-500 uppercase">Expiry (MM/YY)</label>
                              <input
                                type="text"
                                placeholder="12/26"
                                className="w-full p-4 rounded-xl border border-stone-200 font-mono focus:ring-2 focus:ring-[#5D4037] outline-none"
                              />
                            </div>
                            <div className="space-y-1.5">
                              <label className="text-xs font-bold text-stone-500 uppercase">CVC</label>
                              <input
                                type="text"
                                placeholder="123"
                                className="w-full p-4 rounded-xl border border-stone-200 font-mono focus:ring-2 focus:ring-[#5D4037] outline-none"
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      {selectedMethod === 'balance' && (
                        <div className="pt-8 text-center space-y-4">
                          <div className="size-20 bg-amber-100 text-amber-500 rounded-full flex items-center justify-center mx-auto">
                            <Wallet className="size-10" />
                          </div>
                          <div>
                            <p className="text-stone-500">You are about to pay using your Pengu Escrow Balance.</p>
                            {(currentUser?.balance || 0) < amount && (
                              <p className="text-red-500 font-bold mt-2">Insufficient Balance! You need TK {(amount - (currentUser?.balance || 0)).toLocaleString()} more.</p>
                            )}
                          </div>
                        </div>
                      )}
                    </motion.div>
                  </AnimatePresence>
                </div>

                <div className="mt-8 pt-6 border-t border-stone-100">
                  <Button
                    onClick={handlePay}
                    className="w-full h-14 text-lg font-black tracking-wide text-white bg-[#3E2723] hover:bg-[#2D1B18] shadow-xl hover:shadow-2xl transition-all rounded-xl"
                  >
                    Confirm
                  </Button>
                </div>
              </div>
            </div>
          )}

          {step === 'processing' && (
            <div className="p-12 text-center space-y-4">
              <div className="size-16 border-4 border-[#5D4037]/20 border-t-[#5D4037] rounded-full animate-spin mx-auto" />
              <h3 className="font-bold text-stone-900">Processing Payment...</h3>
              <p className="text-stone-500 text-sm">Please do not close this window.</p>
            </div>
          )}

          {step === 'success' && (
            <div className="p-12 text-center space-y-4 bg-green-50">
              <div className="size-16 bg-green-500 rounded-full flex items-center justify-center mx-auto shadow-lg animate-in zoom-in">
                <CheckCircle className="size-8 text-white" />
              </div>
              <h3 className="font-bold text-green-900 text-xl">Payment Successful!</h3>
              <p className="text-green-700 text-sm">Redirecting to your order...</p>
            </div>
          )}
        </Card>
      </motion.div>
    </div>
  );
}
