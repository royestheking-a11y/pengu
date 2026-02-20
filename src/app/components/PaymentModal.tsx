import React, { useState } from 'react';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import {
  CreditCard,
  Lock,
  X,
  CheckCircle,
  Apple
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface PaymentModalProps {
  amount: number;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (transactionId?: string, method?: string) => void;
}

export default function PaymentModal({ amount, isOpen, onClose, onSuccess }: PaymentModalProps) {
  const [step, setStep] = useState<'details' | 'processing' | 'success'>('details');
  const [selectedMethod, setSelectedMethod] = useState<'bkash' | 'card'>('bkash');
  const [transactionId, setTransactionId] = useState('');

  if (!isOpen) return null;

  const handlePay = () => {
    if (selectedMethod === 'bkash' && !transactionId.trim()) {
      // Simple validation visualization (could be a toast or border red)
      alert("Please enter a Transaction ID");
      return;
    }

    setStep('processing');
    setTimeout(() => {
      setStep('success');
      setTimeout(() => {
        onSuccess(transactionId, selectedMethod);
        onClose();
        setStep('details'); // Reset for next time
        setTransactionId('');
      }, 1500);
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 backdrop-blur-sm p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-md"
      >
        <Card className="overflow-hidden relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-stone-400 hover:text-stone-600 transition-colors"
          >
            <X className="size-5" />
          </button>

          {step === 'details' && (
            <div className="p-6 space-y-6">
              <div className="text-center">
                <h2 className="text-xl font-bold text-[#3E2723]">Secure Checkout</h2>
                <p className="text-stone-500 text-sm">Complete your payment to start the order</p>
              </div>

              <div className="bg-stone-50 p-4 rounded-xl border border-stone-100 flex justify-between items-center">
                <span className="text-stone-600 font-medium">Total Amount</span>
                <span className="text-2xl font-bold text-[#3E2723]">TK {amount.toLocaleString()}</span>
              </div>

              <div className="space-y-3">
                <p className="text-xs font-bold text-stone-500 uppercase tracking-wide">Payment Method</p>

                <button
                  onClick={() => setSelectedMethod('bkash')}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-all ${selectedMethod === 'bkash' ? 'border-[#5D4037] bg-[#5D4037]/5 ring-1 ring-[#5D4037]' : 'border-stone-200 hover:border-stone-300'}`}
                >
                  <img src="/Bkash.jpg" alt="Bkash" className="h-8 w-auto object-contain" />
                  <span className="font-medium text-stone-900">Bkash</span>
                  {selectedMethod === 'bkash' && <CheckCircle className="ml-auto size-5 text-[#5D4037]" />}
                </button>

                {/* Card Option */}
                <button
                  onClick={() => setSelectedMethod('card')}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-all ${selectedMethod === 'card' ? 'border-[#5D4037] bg-[#5D4037]/5 ring-1 ring-[#5D4037]' : 'border-stone-200 hover:border-stone-300'}`}
                >
                  <CreditCard className="size-5 text-stone-700" />
                  <span className="font-medium text-stone-900">Credit / Debit Card</span>
                  {selectedMethod === 'card' && <CheckCircle className="ml-auto size-5 text-[#5D4037]" />}
                </button>
              </div>

              {selectedMethod === 'bkash' && (
                <div className="space-y-4 animate-in fade-in slide-in-from-top-2 p-4 bg-stone-50 rounded-lg border border-stone-200">
                  <div>
                    <p className="text-sm font-medium text-stone-700 mb-1">1. Send Money to this Number:</p>
                    <div className="flex items-center justify-between bg-white p-3 rounded border border-stone-200">
                      <span className="font-mono text-lg font-bold text-[#5D4037]">01923053702</span>
                      <span className="text-xs text-stone-400">Personal</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-stone-700 mb-1">2. Enter Transaction ID:</p>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="e.g. 9H76T..."
                        value={transactionId}
                        onChange={(e) => setTransactionId(e.target.value)}
                        className="w-full p-3 pl-10 rounded-lg border border-stone-300 text-sm focus:ring-2 focus:ring-[#5D4037] focus:border-[#5D4037] focus:outline-none uppercase"
                      />
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-stone-400" />
                    </div>
                    <p className="text-xs text-stone-500 mt-1">Transaction ID is found in the confirmation SMS.</p>
                  </div>
                </div>
              )}

              {selectedMethod === 'card' && (
                <div className="space-y-3 animate-in fade-in slide-in-from-top-2">
                  <input
                    type="text"
                    placeholder="Card Number"
                    className="w-full p-3 rounded-lg border border-stone-200 text-sm focus:ring-2 focus:ring-[#5D4037] focus:outline-none"
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="MM/YY"
                      className="w-full p-3 rounded-lg border border-stone-200 text-sm focus:ring-2 focus:ring-[#5D4037] focus:outline-none"
                    />
                    <input
                      type="text"
                      placeholder="CVC"
                      className="w-full p-3 rounded-lg border border-stone-200 text-sm focus:ring-2 focus:ring-[#5D4037] focus:outline-none"
                    />
                  </div>
                </div>
              )}

              <Button onClick={handlePay} className="w-full h-12 text-lg shadow-lg text-white bg-[#3E2723] hover:bg-[#2D1B18]">
                Pay TK {amount.toLocaleString()}
              </Button>

              <div className="flex items-center justify-center gap-2 text-xs text-stone-400">
                <Lock className="size-3" />
                Payments are secure and encrypted
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
