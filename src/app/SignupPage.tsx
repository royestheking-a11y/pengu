import React, { useState } from 'react';
import { useStore } from './store';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from './components/ui/button';
import { PenguLogoWhite } from './components/PenguLogoWhite';
import { motion } from 'motion/react';
import { Eye, EyeOff, Check, Loader2, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { Footer } from './components/Footer';
import { useGoogleLogin } from '@react-oauth/google';
import emailjs from '@emailjs/browser';
import { OTPVerificationModal } from './components/OTPVerificationModal';

// EmailJS Credentials
// EmailJS Credentials
const EMAILJS_SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID || 'service_o9kw16f';
const EMAILJS_PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY || 'BYaBtA83FxfLxh4Er';
const EMAILJS_STUDENT_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_STUDENT_TEMPLATE_ID || 'template_tiw4geg';
const EMAILJS_EXPERT_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_EXPERT_TEMPLATE_ID || 'template_q0alotc';

export default function SignupPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'student' as 'student' | 'expert'
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isOTPModalOpen, setIsOTPModalOpen] = useState(false);
  const [generatedOTP, setGeneratedOTP] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  const { login, loginWithGoogle, addUser, currentUser, isInitialized } = useStore();
  const navigate = useNavigate();

  // Initialize EmailJS
  React.useEffect(() => {
    emailjs.init(EMAILJS_PUBLIC_KEY);
  }, []);

  const handleGoogleSuccess = async (tokenResponse: any) => {
    setIsLoading(true);
    const success = await loginWithGoogle(undefined, formData.role, tokenResponse.access_token);
    if (success) {
      toast.success('Welcome to Pengu!');
    }
    setIsLoading(false);
  };

  const googleLogin = useGoogleLogin({
    onSuccess: handleGoogleSuccess,
    onError: () => toast.error('Google Signup failed'),
  });

  // Redirect if already logged in
  React.useEffect(() => {
    if (isInitialized && currentUser) {
      const role = currentUser.role?.toLowerCase();
      if (role === 'admin') {
        navigate('/admin/dashboard', { replace: true });
      } else if (role === 'expert') {
        navigate('/expert/dashboard', { replace: true });
      } else {
        navigate('/student/dashboard', { replace: true });
      }
    }
  }, [currentUser, isInitialized, navigate]);

  const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  const sendOTP = async (otp: string) => {
    const templateId = formData.role === 'expert' ? EMAILJS_EXPERT_TEMPLATE_ID : EMAILJS_STUDENT_TEMPLATE_ID;
    const templateParams = {
      student_name: formData.name || 'Student',
      expert_name: formData.name || 'Expert',
      otp_code: otp,
      to_email: formData.email,
      user_email: formData.email,
      email: formData.email,
      to_name: formData.name,
    };

    return emailjs.send(
      EMAILJS_SERVICE_ID,
      templateId,
      templateParams,
      EMAILJS_PUBLIC_KEY
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const otp = generateOTP();
    setGeneratedOTP(otp);

    try {
      await sendOTP(otp);
      toast.info('Verification code sent to your email');
      setIsOTPModalOpen(true);
    } catch (error) {
      console.error('EmailJS Error:', error);
      toast.error('Failed to send verification email. Please check your connection.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async (enteredOtp: string) => {
    if (enteredOtp !== generatedOTP) {
      toast.error('Invalid verification code');
      throw new Error('Invalid OTP');
    }

    setIsVerifying(true);
    try {
      const success = await addUser({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role
      });

      if (success) {
        toast.success('Account verified and created successfully!');
        setIsOTPModalOpen(false);
        navigate('/login', { state: { email: formData.email } });
      } else {
        throw new Error('User creation failed');
      }
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendOTP = async () => {
    const otp = generateOTP();
    setGeneratedOTP(otp);
    await sendOTP(otp);
  };

  // Loading Guard to prevent "Flash Jump" before redirect
  if (!isInitialized || currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="size-10 animate-spin text-[#5D4037]" />
          <p className="text-stone-400 font-medium animate-pulse">Initializing Pengu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <div className="flex flex-1 flex-col lg:flex-row min-h-[800px]">
        {/* Left Side - Brand / Visual */}
        <div className="hidden lg:flex lg:w-1/2 bg-[#5D4037] text-white p-12 flex-col justify-between relative overflow-hidden">
          {/* Brand Background Image */}
          <div className="absolute inset-0">
            <img
              src="/pengu.png"
              alt=""
              className="w-full h-full object-cover opacity-70"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-[#5D4037]/80 to-[#5D4037]"></div>
          </div>

          <div className="relative z-10">
            <Link to="/" className="flex items-center gap-2 text-white/90 hover:text-white transition-colors w-fit">
              <PenguLogoWhite className="h-10 w-auto" />
            </Link>
          </div>

          <div className="relative z-10 max-w-lg">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h1 className="text-4xl font-serif font-medium mb-6 leading-tight">
                Join a community of ambitious students and world-class experts.
              </h1>
              <ul className="space-y-4 text-stone-200">
                <li className="flex items-center gap-3">
                  <div className="size-6 rounded-full bg-white/20 flex items-center justify-center">
                    <Check className="size-3" />
                  </div>
                  <span>Direct access to PhD-level experts</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="size-6 rounded-full bg-white/20 flex items-center justify-center">
                    <Check className="size-3" />
                  </div>
                  <span>Secure payments & confidentiality</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="size-6 rounded-full bg-white/20 flex items-center justify-center">
                    <Check className="size-3" />
                  </div>
                  <span>24/7 Support for urgent requests</span>
                </li>
              </ul>
            </motion.div>
          </div>

          <div className="relative z-10 flex gap-4 text-sm text-stone-400">
            <span>© 2026 Pengu Inc.</span>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="flex-1 flex flex-col relative bg-stone-50">
          {/* Back Button */}
          <div className="absolute top-8 left-8 z-10">
            <Link to="/" className="flex items-center gap-2 text-stone-500 hover:text-[#5D4037] transition-colors font-medium">
              <ArrowLeft className="size-4" /> Back to Home
            </Link>
          </div>

          <div className="flex-1 flex items-center justify-center p-8 mt-16 lg:mt-0">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="w-full max-w-md bg-white p-8 md:p-12 rounded-3xl shadow-xl shadow-stone-200/50"
            >
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-[#3E2723] mb-2">Create Account</h2>
                <p className="text-stone-500">Start your journey with Pengu today</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-2">Full Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:border-[#5D4037] focus:ring-1 focus:ring-[#5D4037] outline-none transition-all bg-stone-50 focus:bg-white"
                    placeholder="John Doe"
                    autoComplete="name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-2">Email Address</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:border-[#5D4037] focus:ring-1 focus:ring-[#5D4037] outline-none transition-all bg-stone-50 focus:bg-white"
                    placeholder="name@example.com"
                    autoComplete="email"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-2">Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:border-[#5D4037] focus:ring-1 focus:ring-[#5D4037] outline-none transition-all bg-stone-50 focus:bg-white pr-10"
                      placeholder="Create a strong password"
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                    >
                      {showPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
                    </button>
                  </div>
                </div>

                {/* Role Selection (Simplified) */}
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-2">I am a...</label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, role: 'student' })}
                      className={`py-3 px-4 rounded-xl text-sm font-medium transition-all ${formData.role === 'student'
                        ? 'bg-[#5D4037]/10 text-[#5D4037] ring-2 ring-[#5D4037]'
                        : 'bg-stone-50 text-stone-600 hover:bg-stone-100'
                        }`}
                    >
                      Student
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, role: 'expert' })} // Note: This doesn't actually change functionality in this mock but updates UI state
                      className={`py-3 px-4 rounded-xl text-sm font-medium transition-all ${formData.role === 'expert'
                        ? 'bg-[#5D4037]/10 text-[#5D4037] ring-2 ring-[#5D4037]'
                        : 'bg-stone-50 text-stone-600 hover:bg-stone-100'
                        }`}
                    >
                      Expert
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full py-6 text-base font-bold bg-[#3E2723] hover:bg-[#2D1B18] text-white shadow-lg shadow-[#3E2723]/20 mt-2 rounded-xl"
                  disabled={isLoading}
                >
                  {isLoading ? <Loader2 className="animate-spin mr-2" /> : null}
                  Create Account
                </Button>

                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-stone-200"></span>
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-2 text-stone-400 font-medium">Or continue with</span>
                  </div>
                </div>

                <div className="flex justify-center">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => googleLogin()}
                    className="w-full py-6 text-base font-bold border-stone-200 bg-white text-stone-700 hover:bg-stone-50 hover:border-stone-300 shadow-sm rounded-xl gap-3"
                    disabled={isLoading}
                  >
                    <svg className="size-5 shrink-0" viewBox="0 0 24 24">
                      <path
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        fill="#4285F4"
                      />
                      <path
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-1.01.68-2.31 1.09-3.71 1.09-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        fill="#34A853"
                      />
                      <path
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                        fill="#FBBC05"
                      />
                      <path
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        fill="#EA4335"
                      />
                    </svg>
                    <span>Sign up with Google</span>
                  </Button>
                </div>
              </form>

              <div className="mt-8 text-center">
                <p className="text-stone-500 text-sm">
                  Already have an account?{' '}
                  <Link to="/login" className="font-bold text-[#5D4037] hover:underline">
                    Sign in
                  </Link>
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
      <Footer />

      <OTPVerificationModal
        isOpen={isOTPModalOpen}
        onClose={() => setIsOTPModalOpen(false)}
        onVerify={handleVerifyOTP}
        onResend={handleResendOTP}
        email={formData.email}
        isLoading={isVerifying}
      />
    </div>
  );
}
