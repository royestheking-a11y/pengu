"use client";

import React, { useState, useEffect, useCallback } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from './ui/dialog';
import {
    InputOTP,
    InputOTPGroup,
    InputOTPSlot,
} from './ui/input-otp';
import { Button } from './ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { Timer, RefreshCw, ShieldCheck, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface OTPVerificationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onVerify: (otp: string) => Promise<void>;
    onResend: () => Promise<void>;
    email: string;
    isLoading?: boolean;
}

export function OTPVerificationModal({
    isOpen,
    onClose,
    onVerify,
    onResend,
    email,
    isLoading: externalLoading
}: OTPVerificationModalProps) {
    const [otp, setOtp] = useState('');
    const [timeLeft, setTimeLeft] = useState(120); // 2 minutes
    const [canResend, setCanResend] = useState(false);
    const [isVerifying, setIsVerifying] = useState(false);
    const [isResending, setIsResending] = useState(false);

    // Timer logic
    useEffect(() => {
        if (!isOpen) return;

        if (timeLeft <= 0) {
            setCanResend(true);
            return;
        }

        const timer = setInterval(() => {
            setTimeLeft((prev) => prev - 1);
        }, 1000);

        return () => clearInterval(timer);
    }, [isOpen, timeLeft]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const handleResend = async () => {
        setIsResending(true);
        try {
            await onResend();
            setTimeLeft(120);
            setCanResend(false);
            setOtp('');
            toast.success('Verification code resent');
        } catch (error) {
            toast.error('Failed to resend code');
        } finally {
            setIsResending(false);
        }
    };

    const handleComplete = async (value: string) => {
        if (value.length !== 6) return;
        setIsVerifying(true);
        try {
            await onVerify(value);
        } catch (error) {
            // Error is usually handled by parent or toast
        } finally {
            setIsVerifying(false);
        }
    };

    const loading = externalLoading || isVerifying;

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !loading && !open && onClose()}>
            <DialogContent className="sm:max-w-md border-none p-0 overflow-hidden bg-white rounded-[2rem] shadow-2xl">
                <div className="relative p-6 md:p-10 flex flex-col items-center">
                    {/* Header Visual */}
                    <div className="flex justify-center mb-8">
                        <div className="size-20 md:size-24 rounded-[2rem] bg-[#5D4037]/5 flex items-center justify-center relative">
                            <motion.div
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className="absolute inset-0 rounded-[2rem] bg-[#5D4037]/10"
                            />
                            <div className="size-12 md:size-14 rounded-2xl bg-white shadow-sm flex items-center justify-center relative z-10">
                                <ShieldCheck className="size-6 md:size-8 text-[#5D4037]" />
                            </div>
                        </div>
                    </div>

                    <DialogHeader className="w-full flex flex-col items-center text-center space-y-3 mb-8">
                        <DialogTitle className="text-2xl md:text-3xl font-bold text-[#3E2723] tracking-tight leading-tight w-full text-center">
                            Verify Your Account
                        </DialogTitle>
                        <DialogDescription className="text-stone-500 text-sm md:text-base leading-relaxed max-w-[280px] mx-auto text-center">
                            We've sent a 6-digit secure code to <br className="hidden md:block" />
                            <span className="font-semibold text-[#5D4037] truncate block px-2">{email}</span>
                        </DialogDescription>
                    </DialogHeader>

                    <div className="w-full space-y-8 flex flex-col items-center">
                        {/* OTP Input Container */}
                        <div className="flex flex-col items-center gap-6 w-full overflow-hidden">
                            <InputOTP
                                maxLength={6}
                                value={otp}
                                onChange={setOtp}
                                onComplete={handleComplete}
                                disabled={loading}
                            >
                                <InputOTPGroup className="flex justify-center gap-2 md:gap-3">
                                    {[0, 1, 2, 3, 4, 5].map((index) => (
                                        <InputOTPSlot
                                            key={index}
                                            index={index}
                                            className="size-10 md:size-12 text-lg md:text-xl font-bold rounded-xl md:rounded-2xl border-stone-200 bg-stone-50 focus:bg-white focus:border-[#5D4037] focus:ring-4 focus:ring-[#5D4037]/5 transition-all"
                                        />
                                    ))}
                                </InputOTPGroup>
                            </InputOTP>

                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="flex items-center gap-2 px-4 py-2 rounded-full bg-stone-100/80 text-stone-600 text-xs md:text-sm font-semibold whitespace-nowrap"
                            >
                                <Timer className="size-4 text-[#5D4037]" />
                                <span>Expires in {formatTime(timeLeft)}</span>
                            </motion.div>
                        </div>

                        {/* Action Buttons */}
                        <div className="w-full space-y-5 pt-2">
                            <Button
                                onClick={() => handleComplete(otp)}
                                disabled={loading || otp.length !== 6}
                                className="w-full h-14 md:h-16 text-base md:text-lg font-bold bg-[#3E2723] hover:bg-[#2D1B18] text-white rounded-2xl shadow-xl shadow-[#3E2723]/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                            >
                                {loading ? <Loader2 className="size-5 animate-spin" /> : null}
                                {loading ? 'Verifying...' : 'Complete Registration'}
                            </Button>

                            <div className="flex flex-col items-center gap-2">
                                <p className="text-stone-400 text-xs md:text-sm font-medium">Didn't receive the email?</p>
                                <button
                                    onClick={handleResend}
                                    disabled={!canResend || isResending || loading}
                                    className="group flex items-center gap-2 text-[#5D4037] font-bold hover:text-[#3E2723] disabled:opacity-30 transition-all py-1"
                                >
                                    {isResending ? <RefreshCw className="size-4 animate-spin" /> : <RefreshCw className="size-4 group-hover:rotate-180 transition-transform duration-500" />}
                                    <span className="text-sm md:text-base">{canResend ? 'Resend New Code' : `Wait ${timeLeft}s to Resend`}</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Top Gradient Bar */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#5D4037]/20 to-transparent" />
            </DialogContent>
        </Dialog>
    );
}
