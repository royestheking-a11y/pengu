import React from 'react';
import { useStore } from './store';
import { Link } from 'react-router-dom';
import { DashboardLayout } from './components/Layout';
import { DashboardSkeleton } from './components/DashboardSkeleton';
import { Card } from './components/ui/card';
import { Button } from './components/ui/button';
import {
  FileText,
  Clock,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Plus,
  ArrowRight,
  Coins,
  Wallet,
  ArrowUpRight
} from 'lucide-react';
import WithdrawModal from './components/WithdrawModal';
import { motion } from 'motion/react';
import { format } from 'date-fns';

export default function StudentDashboard() {
  const { requests, orders, currentUser, skills, isInitialized, withdrawalRequests } = useStore();
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = React.useState(false);

  const credits = currentUser?.pengu_credits || 0;
  const bdtValue = (credits / 100) * 120;

  const totalWithdrawn = withdrawalRequests
    .filter(r => r.studentId === currentUser?.id && (r.status === 'PAID' || r.status === 'APPROVED'))
    .reduce((acc, curr) => acc + (curr.amount_credits || 0), 0);


  const activeRequests = requests
    .filter(r => r.studentId === currentUser?.id && r.status !== 'CONVERTED')
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const activeOrders = orders
    .filter(o => o.studentId === currentUser?.id && o.status !== 'COMPLETED')
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  // Filter skills for current user
  const userSkills = skills
    .filter(s => s.userId === currentUser?.id)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 3);
  const totalSkillsCount = skills.filter(s => s.userId === currentUser?.id).length;

  const handleExportCV = () => {
    const userAllSkills = skills.filter(s => s.userId === currentUser?.id);
    if (userAllSkills.length === 0) {
      alert("No skills to export! Add some skills first.");
      return;
    }
    const content = userAllSkills.map(s => `- ${s.name} (${s.level}): Mastered through ${s.source} with a score of ${s.score}/150`).join('\n');
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `CV_Skills_${currentUser?.name.replace(/\s+/g, '_')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!isInitialized) return <DashboardSkeleton />;

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Welcome Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-stone-900">Welcome back, {currentUser?.name.split(' ')[0]}</h1>
            <p className="text-stone-500">Here's what's happening with your academic career.</p>
          </div>
          <div className="flex gap-3">
            <Link to="/student/messages">
              <Button variant="outline" size="lg">
                Support
              </Button>
            </Link>
            <Link to="/student/new-request">
              <Button size="lg" className="shadow-lg hover:shadow-xl transition-all">
                <Plus className="mr-2 size-5" />
                New Request
              </Button>
            </Link>
          </div>
        </div>

        {/* Status Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Wallet Card */}
          <Card className="p-6 bg-gradient-to-br from-[#5D4037] to-[#3E2723] text-white overflow-hidden relative group hover:shadow-2xl transition-all border-none">
            <div className="relative z-10 flex flex-col h-full justify-between">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-white/10 rounded-lg backdrop-blur-md">
                  <Wallet className="size-5 text-amber-300" />
                </div>
                <Link to="/student/earn">
                  <Button size="sm" className="h-8 text-[10px] uppercase font-bold bg-white text-[#3E2723] hover:bg-stone-50 border-none shadow-xl px-4 rounded-full transition-all">
                    <Plus className="size-3 mr-1" /> Earn Now
                  </Button>
                </Link>
              </div>
              <div>
                <p className="text-[10px] font-bold text-stone-300 uppercase tracking-widest mb-1">Current Pool</p>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-3xl font-black">{credits.toLocaleString()}</h3>
                  <span className="text-sm font-medium text-stone-300">Credits</span>
                </div>
                <p className="text-xs text-stone-400 mt-1 font-medium italic">≈ ৳{bdtValue.toLocaleString()} BDT</p>
              </div>
              <Button
                onClick={() => setIsWithdrawModalOpen(true)}
                disabled={credits < 500}
                className="mt-4 w-full bg-white text-[#3E2723] hover:bg-stone-100 border-none font-bold rounded-xl shadow-lg active:scale-95 transition-all text-xs h-10 disabled:opacity-50"
              >
                Withdraw Funds
              </Button>
            </div>
            {/* Decor */}
            <div className="absolute -right-6 -bottom-6 opacity-10 group-hover:scale-110 transition-transform duration-500">
              <Coins size={140} />
            </div>
          </Card>

          <Link to="/student/requests">
            <Card className="p-6 border-l-4 border-l-[#5D4037] hover:shadow-lg transition-all cursor-pointer group h-full flex flex-col justify-between">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-stone-700 group-hover:text-[#5D4037]">Active Requests</h3>
                <FileText className="text-[#5D4037] size-5" />
              </div>
              <div>
                <div className="text-3xl font-bold text-[#3E2723]">{activeRequests.length}</div>
                <p className="text-sm text-stone-500 mt-1">
                  {activeRequests.filter(r => r.status === 'QUOTED').length} awaiting approval
                </p>
              </div>
            </Card>
          </Link>

          <Link to="/student/orders">
            <Card className="p-6 border-l-4 border-l-amber-500 hover:shadow-lg transition-all cursor-pointer group h-full flex flex-col justify-between">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-stone-700 group-hover:text-amber-600">Orders in Progress</h3>
                <Clock className="text-amber-500 size-5" />
              </div>
              <div>
                <div className="text-3xl font-bold text-[#3E2723]">{activeOrders.length}</div>
                <p className="text-sm text-stone-500 mt-1">
                  {activeOrders.length > 0 ? 'Managing your deadlines' : 'No active orders'}
                </p>
              </div>
            </Card>
          </Link>

          <Link to="/student/skills">
            <Card className="p-6 border-l-4 border-l-green-600 hover:shadow-lg transition-all cursor-pointer group h-full flex flex-col justify-between">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-stone-700 group-hover:text-green-700">Earnings & Skills</h3>
                <TrendingUp className="text-green-600 size-5" />
              </div>
              <div>
                <div className="text-3xl font-bold text-[#3E2723]">{totalSkillsCount}</div>
                <p className="text-sm text-stone-500 mt-1 flex justify-between items-center">
                  <span>{totalSkillsCount > 0 ? `+${userSkills.length} recent` : 'No skills indexed'}</span>
                  <span className="text-[10px] font-bold bg-green-50 text-green-700 px-2 py-0.5 rounded-full">৳{((currentUser?.total_earned || 0) / 100 * 120).toLocaleString()} Total Earned</span>
                </p>
              </div>
            </Card>
          </Link>
        </div>


        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Tasks & Orders */}
          <div className="lg:col-span-2 space-y-8">

            {/* Recent Requests */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-stone-900">Recent Requests</h2>
                <Link to="/student/requests" className="text-sm text-[#5D4037] font-medium hover:underline">View All</Link>
              </div>

              {activeRequests.length === 0 ? (
                <Card className="p-8 text-center text-stone-500 bg-stone-50 border-dashed border-2">
                  <p>No active requests. Start one now!</p>
                </Card>
              ) : (
                activeRequests.slice(0, 3).map((req, i) => (
                  <Card key={req.id || i} className="p-4 hover:shadow-md transition-shadow">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex flex-1 items-center gap-4">
                        <div className="hidden xs:flex p-3 bg-stone-100 rounded-lg shrink-0">
                          <FileText className="text-stone-600 size-6" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="font-semibold text-stone-900 truncate">{req.topic}</h3>
                          <p className="text-xs sm:text-sm text-stone-500 truncate">{req.serviceType} • {format(new Date(req.createdAt), 'MMM d, yyyy')}</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-stone-50">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-medium border whitespace-nowrap ${req.status === 'QUOTED' ? 'bg-green-50 text-green-700 border-green-200' :
                          req.status === 'SUBMITTED' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                            'bg-stone-100 text-stone-600 border-stone-200'
                          }`}>
                          {req.status}
                        </span>
                        <Link to={`/student/request/${req.id}`} className="shrink-0">
                          <Button size="sm" variant="outline" className="h-8">View</Button>
                        </Link>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>

            {/* Syllabus Sync Teaser */}
            <Card className="bg-gradient-to-br from-[#5D4037] to-[#3E2723] text-white p-6 relative overflow-hidden">
              <div className="relative z-10">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-bold mb-2">Upcoming Pressure Week</h3>
                    <p className="text-stone-300 mb-4 max-w-md">
                      Stay ahead of your academic schedule with real-time syllabus monitoring.
                    </p>
                    <Link to="/student/syllabus-sync">
                      <Button variant="secondary" size="sm">
                        View Schedule
                      </Button>
                    </Link>
                  </div>
                  <div className="p-3 bg-white/10 rounded-full backdrop-blur-sm">
                    <AlertCircle className="size-6 text-amber-300" />
                  </div>
                </div>
              </div>
              {/* Decor */}
              <div className="absolute right-0 bottom-0 opacity-10">
                <Clock size={120} />
              </div>
            </Card>

          </div>

          {/* Right Column: Skills & Vault */}
          <div className="space-y-8">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-stone-900">Skill Twin</h2>
                <Link to="/student/skills" className="text-sm text-[#5D4037] hover:underline">View Vault</Link>
              </div>

              <div className="space-y-4">
                {userSkills.length === 0 ? (
                  <div className="text-sm text-stone-500 text-center py-4">
                    Your skills will appear here as you complete projects.
                  </div>
                ) : (
                  userSkills.map((skill, i) => (
                    <div key={i} className="group flex items-center justify-between p-3 rounded-lg hover:bg-stone-50 transition-colors cursor-pointer">
                      <div className="flex items-center gap-3">
                        <div className="size-2 rounded-full bg-[#5D4037]" />
                        <div>
                          <p className="font-medium text-stone-900">{skill.name}</p>
                          <p className="text-xs text-stone-500">{skill.category}</p>
                        </div>
                      </div>
                      <span className="text-xs font-medium text-stone-400 group-hover:text-[#5D4037]">
                        {skill.level}
                      </span>
                    </div>
                  ))
                )}
              </div>

              <div className="mt-6 pt-6 border-t border-stone-100">
                <Button
                  variant="outline"
                  className="w-full text-xs"
                  onClick={handleExportCV}
                  disabled={userSkills.length === 0}
                >
                  Download CV-Ready Bullets
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
      <WithdrawModal
        isOpen={isWithdrawModalOpen}
        onClose={() => setIsWithdrawModalOpen(false)}
      />
    </DashboardLayout>
  );
}

