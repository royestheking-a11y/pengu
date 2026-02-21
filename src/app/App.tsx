// Final refresh to confirm CareerBoost module resolution
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { StoreProvider, useStore } from './store';
import { Toaster } from './components/ui/sonner';

// Pages
import LandingPage from './LandingPage';
import LoginPage from './LoginPage';
import SignupPage from './SignupPage';
import Services from './Services';
import ServiceDetails from './ServiceDetails';
import HowItWorks from './HowItWorks';
import Reviews from './Reviews';
import About from './About';
import Contact from './Contact';
import Legal from './Legal';

import StudentDashboard from './StudentDashboard';
import StudentOrders from './StudentOrders';
import NewRequest from './NewRequest';
import RequestDetails from './RequestDetails';
import OrderDetails from './OrderDetails';
import AdminDashboard from './AdminDashboard';
import AdminRequests from './AdminRequests';
import AdminRequest from './AdminRequest';
import AdminQuality from './AdminQuality';
import AdminExpertManagement from './AdminExpertManagement';
import SkillTwin from './SkillTwin';
import Settings from './Settings';
import SyllabusSync from './SyllabusSync';
import CareerVault from './CareerVault';
import CareerBoost from './CareerBoost';
import Messages from './Messages';
import StudyTools from './StudyTools';
import ProblemSolver from './ProblemSolver';
import AdminUniversalSolutions from './AdminUniversalSolutions';

import AdminOrders from './AdminOrders';
import AdminOrderDetails from './AdminOrderDetails';
import AdminStudents from './AdminStudents';
import AdminReviews from './AdminReviews';
import AdminReports from './AdminReports';
import AdminLiveStats from './AdminLiveStats';
import AdminWithdrawals from './AdminWithdrawals';
import AdminPayments from './AdminPayments';
import ExpertDashboard from './ExpertDashboard';
import ExpertOrderDetails from './ExpertOrderDetails';
import ExpertPayouts from './ExpertPayouts';
import ExpertOrders from './ExpertOrders';
import ExpertFeedback from './ExpertFeedback';
import InvitationPage from './InvitationPage';
import AdminCarousel from './AdminCarousel';
import AdminContacts from './AdminContacts';
import ExpertOnboarding from './ExpertOnboarding';
import { ScrollToTop } from './components/ScrollToTop';
import { DashboardSkeleton } from './components/DashboardSkeleton';

// Guard Component
const ExpertRouteGuard = ({ children }: { children: React.ReactNode }) => {
  const { experts, currentUser, isInitialized } = useStore();

  // 1. Wait for store initialization
  if (!isInitialized) {
    return <DashboardSkeleton />;
  }

  const currentExpert = experts.find(e => e.email.toLowerCase() === currentUser?.email?.toLowerCase());

  if (!currentExpert) {
    // If user is an expert but profile not found yet, show loading instead of children
    // This happens during initial reload while fetchData is running
    if (currentUser?.role === 'expert') {
      return <DashboardSkeleton />;
    }
    // If not logged in or not expert, redirect
    return <Navigate to="/login" replace />;
  }

  if (currentExpert.status === 'Pending' && !currentExpert.onboardingCompleted && !currentUser.onboardingCompleted) {
    return <Navigate to="/expert/onboarding" replace />;
  }

  return <>{children}</>;
};

const StudentRouteGuard = ({ children }: { children: React.ReactNode }) => {
  const { currentUser, isInitialized } = useStore();

  if (!isInitialized) {
    return <DashboardSkeleton />;
  }

  if (!currentUser) return <Navigate to="/login" replace />;

  if (currentUser.role === 'expert') {
    return <Navigate to="/expert/dashboard" replace />;
  }

  if (currentUser.role === 'admin') {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return <>{children}</>;
};

const AdminRouteGuard = ({ children }: { children: React.ReactNode }) => {
  const { currentUser, isInitialized } = useStore();

  if (!isInitialized) {
    return <DashboardSkeleton />;
  }

  if (!currentUser) return <Navigate to="/login" replace />;

  if (currentUser.role !== 'admin') {
    // Redirect unauthorized users to their respective dashboards
    return <Navigate to={`/${currentUser.role}/dashboard`} replace />;
  }

  return <>{children}</>;
};

// Placeholder Pages
const Placeholder = ({ title }: { title: string }) => (
  <div className="flex h-screen items-center justify-center bg-stone-50">
    <div className="text-center">
      <h1 className="text-2xl font-bold text-[#3E2723]">{title}</h1>
      <p className="text-stone-500">Coming Soon</p>
    </div>
  </div>
);

import { GoogleOAuthProvider } from '@react-oauth/google';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "506229543851-c8i37j7p5ic786lff3b05ids8rffql9g.apps.googleusercontent.com";

export default function App() {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <StoreProvider>
        <Toaster position="top-center" richColors />
        <Router>
          <ScrollToTop />
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/services" element={<Services />} />
            <Route path="/services/:id" element={<ServiceDetails />} />
            <Route path="/how-it-works" element={<HowItWorks />} />
            <Route path="/reviews" element={<Reviews />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/legal/:type" element={<Legal />} />
            <Route path="/join/:type" element={<InvitationPage />} />
            <Route path="/problem-solver" element={<ProblemSolver />} />

            {/* Student Routes */}
            <Route path="/student/dashboard" element={<StudentRouteGuard><StudentDashboard /></StudentRouteGuard>} />
            <Route path="/student/new-request" element={<StudentRouteGuard><NewRequest /></StudentRouteGuard>} />
            <Route path="/student/request/:id" element={<StudentRouteGuard><RequestDetails /></StudentRouteGuard>} />
            <Route path="/student/requests" element={<StudentRouteGuard><StudentOrders /></StudentRouteGuard>} />
            <Route path="/student/orders" element={<StudentRouteGuard><StudentOrders /></StudentRouteGuard>} />
            <Route path="/student/order/:id" element={<StudentRouteGuard><OrderDetails /></StudentRouteGuard>} />
            <Route path="/student/syllabus-sync" element={<StudentRouteGuard><SyllabusSync /></StudentRouteGuard>} />
            <Route path="/student/career-vault" element={<StudentRouteGuard><CareerVault /></StudentRouteGuard>} />
            <Route path="/student/career-acceleration" element={<StudentRouteGuard><CareerBoost /></StudentRouteGuard>} />
            <Route path="/student/skills" element={<StudentRouteGuard><SkillTwin /></StudentRouteGuard>} />
            <Route path="/student/messages" element={<StudentRouteGuard><Messages /></StudentRouteGuard>} />
            <Route path="/student/study-tools" element={<StudentRouteGuard><StudyTools /></StudentRouteGuard>} />
            <Route path="/student/settings" element={<StudentRouteGuard><Settings /></StudentRouteGuard>} />

            {/* Admin Routes */}
            <Route path="/admin/dashboard" element={<AdminRouteGuard><AdminDashboard /></AdminRouteGuard>} />
            <Route path="/admin/requests" element={<AdminRouteGuard><AdminRequests /></AdminRouteGuard>} />
            <Route path="/admin/request/:id" element={<AdminRouteGuard><AdminRequest /></AdminRouteGuard>} />
            <Route path="/admin/orders" element={<AdminRouteGuard><AdminOrders /></AdminRouteGuard>} />
            <Route path="/admin/order/:id" element={<AdminRouteGuard><AdminOrderDetails /></AdminRouteGuard>} />
            <Route path="/admin/students" element={<AdminRouteGuard><AdminStudents /></AdminRouteGuard>} />
            <Route path="/admin/reviews" element={<AdminRouteGuard><AdminReviews /></AdminRouteGuard>} />
            <Route path="/admin/reports" element={<AdminRouteGuard><AdminReports /></AdminRouteGuard>} />
            <Route path="/admin/live-stats" element={<AdminRouteGuard><AdminLiveStats /></AdminRouteGuard>} />
            <Route path="/admin/withdrawals" element={<AdminRouteGuard><AdminWithdrawals /></AdminRouteGuard>} />
            <Route path="/admin/quality" element={<AdminRouteGuard><AdminQuality /></AdminRouteGuard>} />
            <Route path="/admin/experts" element={<AdminRouteGuard><AdminExpertManagement /></AdminRouteGuard>} />
            <Route path="/admin/payments" element={<AdminRouteGuard><AdminPayments /></AdminRouteGuard>} />
            <Route path="/admin/messages" element={<AdminRouteGuard><Messages /></AdminRouteGuard>} />
            <Route path="/admin/settings" element={<AdminRouteGuard><Settings /></AdminRouteGuard>} />
            <Route path="/admin/carousel" element={<AdminRouteGuard><AdminCarousel /></AdminRouteGuard>} />
            <Route path="/admin/contacts" element={<AdminRouteGuard><AdminContacts /></AdminRouteGuard>} />
            <Route path="/admin/universal-solutions" element={<AdminRouteGuard><AdminUniversalSolutions /></AdminRouteGuard>} />

            {/* Expert Routes */}
            <Route path="/expert/onboarding" element={<ExpertOnboarding />} />
            <Route path="/expert/dashboard" element={<ExpertRouteGuard><ExpertDashboard /></ExpertRouteGuard>} />
            <Route path="/expert/orders" element={<ExpertRouteGuard><ExpertOrders /></ExpertRouteGuard>} />
            <Route path="/expert/order/:id" element={<ExpertRouteGuard><ExpertOrderDetails /></ExpertRouteGuard>} />
            <Route path="/expert/feedback" element={<ExpertRouteGuard><ExpertFeedback /></ExpertRouteGuard>} />
            <Route path="/expert/payouts" element={<ExpertRouteGuard><ExpertPayouts /></ExpertRouteGuard>} />
            <Route path="/expert/messages" element={<ExpertRouteGuard><Messages /></ExpertRouteGuard>} />
            <Route path="/expert/settings" element={<ExpertRouteGuard><Settings /></ExpertRouteGuard>} />


            {/* Catch All */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </StoreProvider>
    </GoogleOAuthProvider>
  );
}
