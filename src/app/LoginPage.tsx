import React, { useState, useEffect } from 'react';
import { useStore } from './store';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Button } from './components/ui/button';
import { PenguLogoWhite } from './components/PenguLogoWhite';
import { motion } from 'motion/react';
import { Eye, EyeOff, ArrowRight, Loader2, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { Footer } from './components/Footer';

import { useGoogleLogin, useGoogleOneTapLogin } from '@react-oauth/google';

export default function LoginPage() {
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login, loginWithGoogle, experts, currentUser, isInitialized } = useStore();
  const navigate = useNavigate();

  const handleGoogleSuccess = async (response: any) => {
    setIsLoading(true);
    // credential is only present in One Tap, for custom button we get an access_token 
    // but the backend expects an idToken. Actually useGoogleLogin can return a code 
    // or we can use the 'implicit' flow to get an access_token. 
    // BETTER: Use GoogleLogin (hidden) or just keep the backend as is and find a way 
    // to get the idToken from custom button.
    // Actually @react-oauth/google's useGoogleLogin doesn't easily return an idToken.
    // BUT we can use the 'onSuccess' of the custom button.

    // Correction: useGoogleOneTapLogin returns a credential (idToken).
    // For the custom button, let's use the default useGoogleLogin which gives an access token,
    // OR we change the backend to support access tokens.
    // OR, even better, we use the `google.accounts.id.renderButton` approach? No, custom is best.

    // Wait, the backend uses `client.verifyIdToken`.
    // I will use useGoogleOneTapLogin for the credential.
    // For the button, I'll use `login` from `useGoogleLogin` and fetch user info? 
    // No, I want to keep it simple.

    // Official way to get idToken with custom button:
    // Actually, @react-oauth/google doesn't provide a hook that returns idToken easily for custom buttons.
    // But we can use the `google.accounts.id` API directly or just keep the hidden GoogleLogin for One Tap.

    if (response.credential) {
      const success = await loginWithGoogle(response.credential);
      if (success) toast.success('Welcome back!');
    }
    setIsLoading(false);
  };

  /* One Tap hook
  useGoogleOneTapLogin({
    onSuccess: handleGoogleSuccess,
    onError: () => toast.error('One Tap login failed'),
  }); */

  // Custom Button Login handler
  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setIsLoading(true);
      const success = await loginWithGoogle(undefined, undefined, tokenResponse.access_token);
      if (success) toast.success('Welcome back!');
      setIsLoading(false);
    },
    onError: () => toast.error('Google Login failed'),
  });

  // Redirect if already logged in (Fix for reload race condition)
  useEffect(() => {
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

  useEffect(() => {
    // Check for redirected state from Signup
    if (location.state && location.state.email) {
      setEmail(location.state.email);
      if (location.state.password) {
        setPassword(location.state.password);
      }
    } else {
      // Check for remembered user
      const rememberedEmail = localStorage.getItem('pengu_remember_email');
      if (rememberedEmail) {
        setEmail(rememberedEmail);
        setRememberMe(true);
      }
    }
  }, [location]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // handle Remember Me
    if (rememberMe) {
      localStorage.setItem('pengu_remember_email', email);
    } else {
      localStorage.removeItem('pengu_remember_email');
    }

    // Simulate network delay for effect
    setTimeout(async () => {
      const success = await login(email, password);

      if (success) {
        toast.success('Welcome back!');
        // Redirection will be handled by the useEffect watching currentUser
      } else {
        toast.error('Invalid email or password', {
          description: 'Please check your credentials and try again.'
        });
      }

      setIsLoading(false);
    }, 800);
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
        <div className="hidden lg:flex lg:w-1/2 bg-[#3E2723] text-white p-12 flex-col justify-between relative overflow-hidden">
          {/* Abstract Pattern Background */}
          <div className="absolute inset-0">
            <img
              src="/pengu.png"
              alt=""
              className="w-full h-full object-cover opacity-70"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-[#3E2723]/80 to-[#3E2723]"></div>
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
                "The only way to do great work is to love what you do."
              </h1>
              <p className="text-stone-400 text-lg">— Steve Jobs</p>
            </motion.div>
          </div>

          <div className="relative z-10 flex gap-4 text-sm text-stone-400">
            <span>© 2026 Pengu Inc.</span>
            <Link to="/legal/privacy" className="hover:text-white transition-colors">Privacy</Link>
            <Link to="/legal/terms" className="hover:text-white transition-colors">Terms</Link>
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
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="w-full max-w-md bg-white p-8 md:p-12 rounded-3xl shadow-xl shadow-stone-200/50"
            >
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-[#3E2723] mb-2">Welcome Back</h2>
                <p className="text-stone-500">Sign in to access your dashboard</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-2">Email Address</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:border-[#5D4037] focus:ring-1 focus:ring-[#5D4037] outline-none transition-all bg-stone-50 focus:bg-white"
                    placeholder="name@example.com"
                    autoComplete="username"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-2">Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:border-[#5D4037] focus:ring-1 focus:ring-[#5D4037] outline-none transition-all bg-stone-50 focus:bg-white pr-10"
                      placeholder="••••••••"
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                    >
                      {showPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
                    </button>
                  </div>
                  <div className="flex items-center justify-between mt-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="rounded border-stone-300 text-[#5D4037] focus:ring-[#5D4037]"
                      />
                      <span className="text-sm text-stone-600">Remember me</span>
                    </label>
                    <a href="#" className="text-xs font-medium text-[#5D4037] hover:underline">Forgot password?</a>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full py-6 text-base font-bold bg-[#3E2723] hover:bg-[#2D1B18] text-white shadow-lg shadow-[#3E2723]/20 rounded-xl"
                  disabled={isLoading}
                >
                  {isLoading ? <Loader2 className="animate-spin mr-2" /> : null}
                  Sign In
                </Button>

                <div className="relative my-8">
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
                    <span>Continue with Google</span>
                  </Button>
                </div>
              </form>

              <div className="mt-8 text-center">
                <p className="text-stone-500 text-sm">
                  Don't have an account?{' '}
                  <Link to="/signup" className="font-bold text-[#5D4037] hover:underline inline-flex items-center">
                    Sign up <ArrowRight className="ml-1 size-3" />
                  </Link>
                </p>
              </div>

            </motion.div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
