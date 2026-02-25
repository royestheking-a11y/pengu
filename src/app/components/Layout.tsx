import React, { useEffect } from 'react';
import { useStore } from '../store';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  Settings,
  MessageSquare,
  CreditCard,
  Briefcase,
  LogOut,
  User,
  Menu,
  X,
  PlusCircle,
  Clock,
  CheckCircle,
  GraduationCap,
  Users,
  Star,
  GalleryHorizontal,
  Mail,
  Rocket,
  Brain,
  Sparkles,
  Target
} from 'lucide-react';
import { format } from 'date-fns';
import { clsx } from 'clsx';
import { motion, AnimatePresence } from 'motion/react';
import { PenguLogoDark } from './PenguLogoDark';
import { NotificationCenter } from './NotificationCenter';
import { Footer } from './Footer';

const MENU_ITEMS = {
  student: [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/student/dashboard' },
    { icon: PlusCircle, label: 'New Request', path: '/student/new-request' },
    { icon: FileText, label: 'My Orders', path: '/student/orders' },
    { icon: GraduationCap, label: 'Syllabus Sync', path: '/student/syllabus-sync' },
    { icon: Briefcase, label: 'Career Vault', path: '/student/career-vault' },
    { icon: Rocket, label: 'Career Acceleration', path: '/student/career-acceleration' },
    { icon: Brain, label: 'AI Study Tools', path: '/student/study-tools' },
    { icon: Sparkles, label: 'Pengu Arcade', path: '/student/earn' },
    { icon: MessageSquare, label: 'Messages', path: '/student/messages' },
    { icon: Settings, label: 'Settings', path: '/student/settings' },
  ],
  expert: [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/expert/dashboard' },
    { icon: FileText, label: 'Active Orders', path: '/expert/orders' },
    { icon: Sparkles, label: 'Partner Program', path: '/expert/earn' },
    { icon: Star, label: 'Client Feedback', path: '/expert/feedback' },
    { icon: MessageSquare, label: 'Messages', path: '/expert/messages' },
    { icon: CreditCard, label: 'Payouts', path: '/expert/payouts' },
    { icon: Settings, label: 'Profile & Settings', path: '/expert/settings' },
  ],
  admin: [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/admin/dashboard' },
    { icon: Target, label: 'Partner Leads', path: '/admin/leads' },
    { icon: FileText, label: 'Quote Requests', path: '/admin/requests' },
    { icon: Briefcase, label: 'Active Operations', path: '/admin/orders' },
    { icon: Users, label: 'Students', path: '/admin/students' },
    { icon: Star, label: 'Reviews', path: '/admin/reviews' },
    { icon: Sparkles, label: 'Universal Solutions', path: '/admin/universal-solutions' },
    { icon: MessageSquare, label: 'Messages', path: '/admin/messages' },
    { icon: User, label: 'Experts', path: '/admin/experts' },
    { icon: CheckCircle, label: 'Quality Control', path: '/admin/quality' },
    { icon: GalleryHorizontal, label: 'Hero Carousel', path: '/admin/carousel' },
    { icon: Mail, label: 'Contact Inquiries', path: '/admin/contacts' },
    { icon: CreditCard, label: 'Payout Requests', path: '/admin/withdrawals' },
    { icon: Settings, label: 'System Settings', path: '/admin/settings' },
  ]
};

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { currentUser, logout, orders, requests, isInitialized } = useStore();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  // Lock scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [isMobileMenuOpen]);

  // The redirection is now handled by route guards in App.tsx 
  // with synchronous session hydration, preventing the "flash" to /login.


  // If not initialized yet, show nothing or a spinner
  if (!isInitialized) {
    return null; // Or a loading spinner
  }

  // If initialized but no user (and redirect hasn't happened yet), don't render layout content
  if (!currentUser) {
    return null;
  }

  const role = currentUser.role || 'student';
  const menu = MENU_ITEMS[role];

  // Calculate Badges
  const getBadgeCount = (label: string) => {
    if (role === 'admin') {
      if (label === 'Quote Requests') return requests.filter(r => r.status === 'SUBMITTED').length;
      if (label === 'Active Operations') return orders.filter(o => o.status === 'PAID_CONFIRMED').length;
      if (label === 'Quality Control') return orders.flatMap(o => o.milestones).filter(m => m.status === 'DELIVERED').length;
    }
    if (role === 'expert') {
      // Use currentUser.id for expert badges
      if (label === 'Active Orders') return orders.filter(o => o.expertId === currentUser?.id && o.status !== 'COMPLETED').length;
    }
    if (role === 'student') {
      if (label === 'My Orders') return orders.filter(o => o.studentId === currentUser.id && o.status === 'IN_PROGRESS').length;
    }
    return 0;
  };

  return (
    <div className="flex min-h-screen bg-[#FAFAFA]">
      {/* Sidebar for Desktop */}
      <aside className="hidden md:flex w-64 flex-col bg-white border-r border-stone-200 fixed h-full z-10">
        <Link to="/" className="p-6 flex items-center gap-3 hover:opacity-80 transition-opacity">
          <PenguLogoDark className="h-8 w-auto" />
        </Link>

        <nav className="flex-1 px-4 space-y-1 py-4">
          {menu.map((item) => {
            const isActive = location.pathname.startsWith(item.path);
            const badgeCount = getBadgeCount(item.label);

            return (
              <Link
                key={item.path}
                to={item.path}
                className={clsx(
                  "flex items-center justify-between px-4 py-3 rounded-xl transition-colors text-sm font-medium",
                  isActive
                    ? "bg-[#5D4037]/10 text-[#5D4037]"
                    : "text-stone-500 hover:bg-stone-50 hover:text-stone-900"
                )}
              >
                <div className="flex items-center gap-3">
                  <item.icon className="size-5" />
                  {item.label}
                </div>
                {badgeCount > 0 && (
                  <span className={clsx(
                    "text-xs font-bold px-2 py-0.5 rounded-full",
                    isActive ? "bg-[#5D4037] text-white" : "bg-stone-100 text-stone-600"
                  )}>
                    {badgeCount}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-stone-100">
          <div className="flex items-center gap-3 px-4 py-3">
            <div className="size-8 rounded-full overflow-hidden bg-stone-200 flex items-center justify-center text-stone-600 font-bold border border-stone-100">
              {currentUser.avatar ? (
                <img src={currentUser.avatar} alt={currentUser.name} className="w-full h-full object-cover" />
              ) : (
                currentUser.name.charAt(0)
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-stone-900 truncate">{currentUser.name}</p>
              <p className="text-xs text-stone-500 truncate capitalize">{role}</p>
            </div>
            <button onClick={logout} className="text-stone-400 hover:text-red-500 transition-colors">
              <LogOut className="size-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 w-full bg-white border-b border-stone-200 z-20 flex items-center justify-between p-4">
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 -ml-2 text-stone-600">
          {isMobileMenuOpen ? <X /> : <Menu />}
        </button>
        <Link to="/" className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2 hover:opacity-80 transition-opacity">
          <PenguLogoDark className="h-8 w-auto" />
        </Link>
        <NotificationCenter />
      </div>

      {/* Main Content */}
      <main className="flex-1 md:ml-64 min-h-screen flex flex-col w-full max-w-[100vw] overflow-x-hidden">
        {/* Desktop Header */}
        <header className="hidden md:flex justify-end items-center px-8 py-4 bg-white/50 backdrop-blur-sm sticky top-0 z-30 border-b border-stone-100">
          <div className="flex items-center gap-4">
            <div className="text-sm text-stone-500 mr-2">
              {format(new Date(), 'EEEE, MMMM do')}
            </div>
            <div className="h-6 w-px bg-stone-200" />
            <NotificationCenter />
          </div>
        </header>

        <div className="p-4 md:p-8 pt-24 md:pt-8 w-full max-w-7xl mx-auto flex-1 overflow-x-hidden">
          {children}
        </div>
      </main>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-[45] md:hidden"
            />

            {/* Sidebar Drawer */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 right-0 w-[280px] bg-white z-50 md:hidden flex flex-col shadow-2xl border-l border-stone-200"
            >
              <div className="p-4 flex justify-between items-center border-b border-stone-100 bg-stone-50/50">
                <PenguLogoDark className="h-7 w-auto" />
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-1 rounded-lg hover:bg-stone-200 transition-colors"
                >
                  <X className="size-5 text-stone-500" />
                </button>
              </div>

              <motion.nav
                initial="hidden"
                animate="show"
                variants={{
                  hidden: { opacity: 0 },
                  show: {
                    opacity: 1,
                    transition: {
                      staggerChildren: 0.05,
                      delayChildren: 0.1
                    }
                  }
                }}
                className="flex-1 p-4 space-y-1.5 overflow-y-auto"
              >
                {menu.map((item) => {
                  const isActive = location.pathname.startsWith(item.path);
                  return (
                    <motion.div
                      key={item.path}
                      variants={{
                        hidden: { x: 20, opacity: 0 },
                        show: { x: 0, opacity: 1 }
                      }}
                    >
                      <Link
                        to={item.path}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={clsx(
                          "flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all font-medium text-base",
                          isActive
                            ? "bg-[#5D4037]/10 text-[#5D4037] shadow-sm"
                            : "text-stone-600 hover:bg-stone-50 hover:text-stone-900"
                        )}
                      >
                        <item.icon className={clsx("size-5", isActive ? "text-[#5D4037]" : "text-stone-400")} />
                        {item.label}
                      </Link>
                    </motion.div>
                  );
                })}

                <motion.div
                  variants={{
                    hidden: { x: 20, opacity: 0 },
                    show: { x: 0, opacity: 1 }
                  }}
                  className="pt-6 mt-6 border-t border-stone-100"
                >
                  <button
                    onClick={() => { logout(); setIsMobileMenuOpen(false); }}
                    className="flex w-full items-center gap-3 px-4 py-3.5 rounded-xl text-red-600 hover:bg-red-50 transition-colors font-medium text-base mb-12"
                  >
                    <LogOut className="size-5" />
                    Sign Out
                  </button>
                </motion.div>
              </motion.nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

export function PublicLayout({ children }: { children: React.ReactNode }) {
  const { currentUser, logout } = useStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const location = useLocation();

  useEffect(() => {
    if (isMobileMenuOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [isMobileMenuOpen]);

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans text-stone-900">
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-stone-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between relative">
          {/* Mobile Menu Toggle (Left on Mobile) */}
          <div className="md:hidden flex-1">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-1.5 text-stone-600 rounded-lg hover:bg-stone-100 transition-colors"
            >
              <Menu className="size-6" />
            </button>
          </div>

          <Link to="/" className="md:static absolute left-1/2 -translate-x-1/2 md:translate-x-0 flex items-center gap-2">
            <PenguLogoDark className="h-7 w-auto" />
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            <Link
              to="/"
              className={clsx(
                "text-sm transition-all",
                location.pathname === '/'
                  ? "text-[#3E2723] font-bold"
                  : "text-stone-600 hover:text-[#3E2723]"
              )}
            >
              Home
            </Link>
            <Link
              to="/services"
              className={clsx(
                "text-sm transition-all",
                location.pathname.startsWith('/services')
                  ? "text-[#3E2723] font-bold"
                  : "text-stone-600 hover:text-[#3E2723]"
              )}
            >
              Services
            </Link>
            <Link
              to="/how-it-works"
              className={clsx(
                "text-sm transition-all",
                location.pathname === '/how-it-works'
                  ? "text-[#3E2723] font-bold"
                  : "text-stone-600 hover:text-[#3E2723]"
              )}
            >
              How it works
            </Link>
            <Link
              to="/reviews"
              className={clsx(
                "text-sm transition-all",
                location.pathname === '/reviews'
                  ? "text-[#3E2723] font-bold"
                  : "text-stone-600 hover:text-[#3E2723]"
              )}
            >
              Reviews
            </Link>
            <Link
              to="/contact"
              className={clsx(
                "text-sm transition-all",
                location.pathname === '/contact'
                  ? "text-[#3E2723] font-bold"
                  : "text-stone-600 hover:text-[#3E2723]"
              )}
            >
              Contact
            </Link>
          </nav>

          {/* Desktop Right Side Actions */}
          <div className="hidden md:flex items-center gap-4">
            {currentUser ? (
              <div className="flex items-center gap-4">
                <NotificationCenter />
                <div className="h-6 w-px bg-stone-200" />
                <div className="flex items-center gap-3">
                  <Link to={`/${currentUser.role}/dashboard`} className="flex items-center gap-2 hover:bg-stone-50 p-1.5 rounded-lg transition-colors">
                    <div className="size-8 rounded-full overflow-hidden bg-stone-100 flex items-center justify-center text-[#5D4037] font-bold border border-stone-200">
                      {currentUser.avatar ? (
                        <img src={currentUser.avatar} alt={currentUser.name} className="w-full h-full object-cover" />
                      ) : (
                        currentUser.name.charAt(0)
                      )}
                    </div>
                    <div className="text-sm">
                      <p className="font-bold text-stone-900 leading-none">{currentUser.name}</p>
                      <p className="text-xs text-stone-500 capitalize leading-none mt-1">{currentUser.role}</p>
                    </div>
                  </Link>
                </div>
              </div>
            ) : (
              <>
                <Link to="/login" className="inline-flex h-9 items-center justify-center rounded-lg border border-stone-200 bg-white px-5 py-2 text-sm font-bold text-stone-700 shadow-sm transition-all hover:bg-stone-50 hover:border-stone-300">Log in</Link>
                <Link to="/signup" className="hidden sm:inline-flex h-9 items-center justify-center rounded-lg bg-[#5D4037] px-4 py-2 text-sm font-medium text-white shadow transition-colors hover:bg-[#4E342E] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-stone-950 disabled:pointer-events-none disabled:opacity-50">
                  Start Request
                </Link>
              </>
            )}
          </div>

          {/* Mobile Profile Action (Right on Mobile) */}
          <div className="flex md:hidden items-center justify-end flex-1">
            {currentUser && (
              <Link
                to={`/${currentUser.role}/dashboard`}
                className="size-9 rounded-full overflow-hidden bg-[#5D4037]/10 flex items-center justify-center text-[#5D4037] font-bold border-2 border-[#5D4037]/30 shadow-sm hover:border-[#5D4037]/60 transition-all shrink-0"
              >
                {currentUser.avatar ? (
                  <img src={currentUser.avatar} alt={currentUser.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-sm font-black">{currentUser.name.charAt(0).toUpperCase()}</span>
                )}
              </Link>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1">
        {children}
      </main>

      <Footer />

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-[70] md:hidden"
            />

            {/* Sidebar Drawer */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 right-0 w-[300px] bg-white z-[80] md:hidden flex flex-col shadow-2xl"
            >
              <div className="p-4 flex justify-between items-center border-b border-stone-100 bg-stone-50/50">
                <PenguLogoDark className="h-7 w-auto" />
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-1 rounded-lg hover:bg-stone-200 transition-colors"
                >
                  <X className="size-5 text-stone-500" />
                </button>
              </div>

              <motion.nav
                initial="hidden"
                animate="show"
                variants={{
                  hidden: { opacity: 0 },
                  show: {
                    opacity: 1,
                    transition: {
                      staggerChildren: 0.05,
                      delayChildren: 0.1
                    }
                  }
                }}
                className="flex-1 overflow-y-auto p-4 space-y-6"
              >
                {currentUser && (
                  <motion.div
                    variants={{
                      hidden: { y: 10, opacity: 0 },
                      show: { y: 0, opacity: 1 }
                    }}
                    className="pb-6 border-b border-stone-100"
                  >
                    <div className="flex items-center gap-4 mb-4">
                      <div className="size-12 rounded-full overflow-hidden bg-stone-100 flex items-center justify-center text-[#5D4037] font-bold text-xl border border-stone-200">
                        {currentUser.avatar ? (
                          <img src={currentUser.avatar} alt={currentUser.name} className="w-full h-full object-cover" />
                        ) : (
                          currentUser.name.charAt(0)
                        )}
                      </div>
                      <div>
                        <p className="font-bold text-stone-900 text-lg">{currentUser.name}</p>
                        <p className="text-stone-500 capitalize">{currentUser.role}</p>
                      </div>
                    </div>
                    <Link
                      to={`/${currentUser.role}/dashboard`}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 bg-[#5D4037]/5 text-[#5D4037] rounded-xl font-bold"
                    >
                      <LayoutDashboard className="size-5" />
                      Go to Dashboard
                    </Link>
                  </motion.div>
                )}

                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-stone-400 uppercase tracking-wider px-4 mb-3">Menu</p>
                  {[
                    { label: 'Home', path: '/' },
                    { label: 'Services', path: '/services' },
                    { label: 'How it Works', path: '/how-it-works' },
                    { label: 'Reviews', path: '/reviews' },
                    { label: 'Contact Support', path: '/contact' }
                  ].map((item) => {
                    const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
                    return (
                      <motion.div
                        key={item.path}
                        variants={{
                          hidden: { x: 20, opacity: 0 },
                          show: { x: 0, opacity: 1 }
                        }}
                      >
                        <Link
                          to={item.path}
                          onClick={() => setIsMobileMenuOpen(false)}
                          className={clsx(
                            "block px-4 py-3 rounded-xl text-base transition-colors font-medium",
                            isActive ? "text-[#3E2723] bg-[#3E2723]/5 font-bold" : "text-stone-900 hover:bg-stone-50"
                          )}
                        >
                          {item.label}
                        </Link>
                      </motion.div>
                    );
                  })}
                </div>

                {!currentUser && (
                  <motion.div
                    variants={{
                      hidden: { y: 10, opacity: 0 },
                      show: { y: 0, opacity: 1 }
                    }}
                    className="pt-6 border-t border-stone-100 space-y-3"
                  >
                    <Link
                      to="/signup"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex w-full items-center justify-center gap-2 bg-[#5D4037] text-white px-4 py-3.5 rounded-xl font-bold text-base shadow-sm active:scale-95 transition-all"
                    >
                      Start Request
                    </Link>
                    <Link
                      to="/login"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex w-full items-center justify-center gap-2 border border-stone-200 text-stone-700 px-4 py-3.5 rounded-xl font-bold text-base hover:bg-stone-50 transition-all"
                    >
                      Log In
                    </Link>
                  </motion.div>
                )}

                {currentUser && (
                  <motion.div
                    variants={{
                      hidden: { y: 10, opacity: 0 },
                      show: { y: 0, opacity: 1 }
                    }}
                    className="pt-6 border-t border-stone-100"
                  >
                    <button
                      onClick={() => { logout(); setIsMobileMenuOpen(false); }}
                      className="flex w-full items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl font-medium transition-colors"
                    >
                      <LogOut className="size-5" />
                      Sign Out
                    </button>
                  </motion.div>
                )}
              </motion.nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
