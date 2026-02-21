import React, { useState } from 'react';
import { useStore } from './store';
import { DashboardLayout } from './components/Layout';
import { DashboardSkeleton } from './components/DashboardSkeleton';
import { Card } from './components/ui/card';
import { Button } from './components/ui/button';
import { OrderList } from './components/OrderList';
import {
  FileText,
  CheckCircle,
  DollarSign,
  MessageSquare,
  AlertTriangle,
  Power
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { GuidelinesModal } from './components/GuidelinesModal';
import { EmptyState } from './components/ui/EmptyState';

export default function ExpertDashboard() {
  const { orders, experts, currentUser, toggleExpertOnline, reviews, isInitialized } = useStore();
  const [activeTab, setActiveTab] = useState<'active' | 'completed'>('active');
  const [isGuidelinesOpen, setIsGuidelinesOpen] = useState(false);

  if (!isInitialized) return <DashboardSkeleton />;

  // Find current expert profile
  const currentExpertId = currentUser?.id || '';
  const currentExpert = experts.find(e => ((e.userId as any)?._id || e.userId) === currentExpertId);
  const isOnline = currentExpert?.online || false;

  // Filter assigned orders with safety for populated or raw IDs
  const expertOrders = orders
    .filter(o => {
      const orderExpertId = (o.expertId as any)?._id || o.expertId;
      return orderExpertId === currentExpertId;
    })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  const activeOrders = expertOrders.filter(o => o.status !== 'COMPLETED');
  const completedOrders = expertOrders.filter(o => o.status === 'COMPLETED');

  const stats = [
    { label: 'Active Orders', value: activeOrders.length.toString(), icon: FileText, color: 'text-[#3E2723]', bg: 'bg-[#5D4037]/10' },
    { label: 'Total Earnings', value: currentExpert?.earnings !== undefined ? `TK ${currentExpert.earnings.toLocaleString()}` : 'TK 0', icon: DollarSign, color: 'text-emerald-700', bg: 'bg-emerald-100' },
    { label: 'Pending Payout', value: currentExpert?.balance !== undefined ? `TK ${currentExpert.balance.toLocaleString()}` : 'TK 0', icon: DollarSign, color: 'text-amber-600', bg: 'bg-amber-100' },
    { label: 'Quality Score', value: currentExpert?.rating ? `${currentExpert.rating}/5` : 'N/A', icon: CheckCircle, color: 'text-blue-600', bg: 'bg-blue-100' },
  ];

  const handleToggleOnline = () => {
    if (!currentExpertId) return;
    if (currentExpert?.status === 'Pending') {
      toast.error('Account is under review', {
        description: 'You cannot go online until your profile is approved by an admin.'
      });
      return;
    }
    toggleExpertOnline(currentExpertId);
    toast.success(!isOnline ? 'You are now online and available for new orders.' : 'You are now offline. New requests paused.');
  };

  const safeFormatDate = (dateStr: string | undefined | null) => {
    if (!dateStr) return 'N/A';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return 'N/A';
      return d.toLocaleDateString();
    } catch (e) {
      return 'N/A';
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* ... existing header ... */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#3E2723]">Expert Workspace</h1>
            <p className="text-stone-500">Manage your assignments and deadlines.</p>
            {currentExpert?.status === 'Pending' && (
              <div className="mt-2 text-sm bg-amber-50 text-amber-800 px-3 py-1 rounded-lg border border-amber-200 inline-block">
                ⚠️ Your profile is currently under review. Some features are restricted.
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            {/* Premium Online Toggle - Single Button */}
            <button
              onClick={() => currentExpert?.id && toggleExpertOnline(currentExpert.id)}
              className={`relative overflow-hidden group flex items-center gap-2 px-4 py-2 h-10 rounded-md font-medium transition-all duration-300 shadow-sm border ${isOnline
                ? 'bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-200 text-emerald-700 hover:border-emerald-300'
                : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-50 hover:text-stone-800'
                }`}
            >
              <div className="relative flex items-center justify-center">
                <div className={`size-2.5 rounded-full transition-colors duration-300 ${isOnline ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-stone-300'
                  }`}
                ></div>
                {isOnline && (
                  <div className="absolute inset-0 rounded-full bg-emerald-500 animate-ping opacity-75 duration-1000" />
                )}
              </div>
              <span className="text-sm">
                {isOnline ? 'Online' : 'Offline'}
              </span>
            </button>

            <Link to="/expert/messages">
              <Button variant="outline" className="border-stone-200 hover:bg-stone-50 h-10 px-4 py-2">
                <MessageSquare className="mr-2 size-4" /> Support
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat) => (
            <Card key={stat.label} className="p-5 flex flex-row items-center gap-4 hover:shadow-md transition-all border-stone-200/60">
              <div className={`p-4 rounded-2xl ${stat.bg} shrink-0`}>
                <stat.icon className={`size-6 ${stat.color}`} />
              </div>
              <div>
                <p className="text-[10px] text-stone-400 font-bold uppercase tracking-wider mb-0.5">{stat.label}</p>
                <h3 className="text-2xl font-bold text-stone-900 leading-tight">{stat.value}</h3>
              </div>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Task List */}
          <div className="lg:col-span-2 space-y-6">
            <div className="border-b border-stone-200 overflow-x-auto">
              <nav className="-mb-px flex space-x-8 min-w-max px-1" aria-label="Tabs">
                <button
                  onClick={() => setActiveTab('active')}
                  className={`
                    whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
                    ${activeTab === 'active'
                      ? 'border-[#5D4037] text-[#5D4037]'
                      : 'border-transparent text-stone-500 hover:text-stone-700 hover:border-stone-300'}
                  `}
                >
                  Priority Tasks ({activeOrders.length})
                </button>
                <button
                  onClick={() => setActiveTab('completed')}
                  className={`
                    whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
                    ${activeTab === 'completed'
                      ? 'border-[#5D4037] text-[#5D4037]'
                      : 'border-transparent text-stone-500 hover:text-stone-700 hover:border-stone-300'}
                  `}
                >
                  Completed History
                </button>
              </nav>
            </div>

            <OrderList
              items={activeTab === 'active' ? activeOrders : completedOrders}
              type="order"
              basePath="/expert/order"
              expertView={true}
              emptyState={
                <EmptyState
                  icon={FileText}
                  title={activeTab === 'active' ? "No active orders" : "No completed orders"}
                  subtitle={activeTab === 'active' ? "Your assigned projects will appear here. Stay online to receive new opportunities." : "Your history is clear. Complete orders to grow your portfolio."}
                  compact
                  className="bg-transparent border-dashed border-2 py-10"
                />
              }
            />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card className="p-6 bg-stone-900 text-white border-none shadow-xl">
              <h3 className="font-bold mb-4 flex items-center gap-2 text-lg">
                <AlertTriangle className="text-yellow-400 size-5" /> Quality Alerts
              </h3>
              <ul className="text-sm text-stone-300 mb-6 space-y-2 list-disc pl-4">
                <li>Strictly follow APA 7th edition formatting for Order #1234.</li>
                <li>Ensure all data points are cited correctly in results section.</li>
                <li>Plagiarism check must be below 5% for final submission.</li>
              </ul>
              <Button
                variant="secondary"
                size="sm"
                className="w-full bg-white text-stone-900 hover:bg-stone-100"
                onClick={() => setIsGuidelinesOpen(true)}
              >
                Review Guidelines
              </Button>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex flex-col">
                  <h3 className="font-bold text-stone-900">Recent Feedback</h3>
                  <span className="text-xs text-stone-400">Latest client reviews</span>
                </div>
                <Link to="/expert/feedback" className="text-xs font-bold text-[#5D4037] hover:underline">
                  View All
                </Link>
              </div>
              <div className="space-y-4">
                {(() => {
                  const expertReviews = reviews.filter(r => ((r.expertId as any)?._id || r.expertId) === currentUser?.id);
                  if (expertReviews.length === 0) {
                    return (
                      <EmptyState
                        icon={MessageSquare}
                        title="No feedback yet"
                        subtitle="Complete orders to earn ratings and build your expert reputation."
                        compact
                        className="bg-stone-50/50 border-none py-8 shadow-none"
                      />
                    );
                  }
                  return expertReviews
                    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                    .slice(0, 4)
                    .map((review) => (
                      <div key={review.id} className="pb-4 border-b border-stone-50 last:border-0 last:pb-0">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex text-amber-500 text-[10px] gap-0.5">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <span key={i} className={i < review.rating ? "fill-current" : "text-stone-300"}>★</span>
                            ))}
                          </div>
                          <span className="text-[10px] text-stone-400 font-medium">
                            {safeFormatDate(review.createdAt)}
                          </span>
                        </div>
                        <p className="text-sm text-stone-700 italic leading-snug line-clamp-2">
                          "{review.text}"
                        </p>
                      </div>
                    ));
                })()}
              </div>
            </Card>
          </div>
        </div>
      </div >

      <GuidelinesModal
        isOpen={isGuidelinesOpen}
        onOpenChange={setIsGuidelinesOpen}
      />
    </DashboardLayout >
  );
}
