import React from 'react';
import { useStore } from './store';
import { Link } from 'react-router-dom';
import { DashboardLayout } from './components/Layout';
import { DashboardSkeleton } from './components/DashboardSkeleton';
import { Card } from './components/ui/card';
import { Button } from './components/ui/button';
import {
  TrendingUp,
  Users,
  ShoppingBag,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle,
  FileText
} from 'lucide-react';
import { format } from 'date-fns';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';

export default function AdminDashboard() {
  const { requests, orders, experts, financialTransactions, isInitialized } = useStore();

  if (!isInitialized) return <DashboardSkeleton />;

  const pendingRequests = requests
    .filter(r => r.status === 'SUBMITTED')
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  const activeOrders = orders.filter(o => o.status !== 'COMPLETED' && o.status !== 'DISPUTE');

  // Calculate Revenue
  const currentRevenue = financialTransactions
    .filter(t => t.type === 'INCOME')
    .reduce((sum, t) => sum + t.amount, 0);

  // Revenue growth calculation (Placeholder: requires historical data)
  const lastMonthRevenue = 0;
  const revenueGrowth = lastMonthRevenue > 0 ? ((currentRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 : 0;

  // Active Experts
  const activeExpertsCount = experts.filter(e => e.status === 'Active').length;

  // Chart Data Preparation
  const revenueData = financialTransactions
    .filter(t => t.type === 'INCOME')
    .slice(-6) // Last 6 transactions for now, ideally group by month
    .map((t, i) => ({ name: `Tx ${i + 1}`, revenue: t.amount }));

  // Fallback for empty chart
  const displayRevenueData = revenueData.length > 0 ? revenueData : [{ name: 'No Data', revenue: 0 }];

  // Fixed color palette for chart consistency
  const COLORS = ['#5D4037', '#2E7D32', '#F9A825', '#C62828', '#1565C0', '#6A1B9A', '#00838F', '#EF6C00'];

  const serviceDistribution = orders.reduce((acc, order) => {
    const existing = acc.find(a => a.name === order.serviceType);
    if (existing) {
      existing.value += 1;
    } else {
      acc.push({
        name: order.serviceType,
        value: 1,
        color: COLORS[acc.length % COLORS.length]
      });
    }
    return acc;
  }, [] as { name: string; value: number; color: string }[]);

  const displayServiceData = serviceDistribution.length > 0 ? serviceDistribution : [{ name: 'No Orders', value: 1, color: '#E0E0E0' }];

  const expertPerformance = experts
    .sort((a, b) => b.completedOrders - a.completedOrders)
    .slice(0, 5)
    .map(e => ({ name: e.name.split(' ')[0], orders: e.completedOrders }));

  const displayExpertPerformance = expertPerformance.length > 0 ? expertPerformance : [{ name: 'No Data', orders: 0 }];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#3E2723]">Admin Dashboard</h1>
            <p className="text-stone-500">Overview of platform performance and active tasks.</p>
          </div>
          <div className="flex gap-2">
            <Link to="/admin/payments">
              <Button variant="outline">
                <DollarSign className="mr-2 size-4" /> Payments
              </Button>
            </Link>
            <Link to="/admin/live-stats">
              <Button>
                <TrendingUp className="mr-2 size-4" /> View Live Stats
              </Button>
            </Link>
          </div>
        </div>

        {/* Top Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="p-6 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-green-100 rounded-xl text-green-700">
                <DollarSign className="size-6" />
              </div>
              <span className={`flex items-center text-xs font-bold ${revenueGrowth >= 0 ? 'text-green-600' : 'text-stone-400'}`}>
                {revenueGrowth > 0 && <ArrowUpRight className="size-3 mr-1" />}
                {revenueGrowth > 0 ? `${revenueGrowth.toFixed(1)}%` : '-'}
              </span>
            </div>
            <h3 className="text-stone-500 text-sm font-medium">Total Revenue</h3>
            <p className="text-2xl font-bold text-[#3E2723]">TK {currentRevenue.toLocaleString()}</p>
          </Card>

          <Card className="p-6 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-blue-100 rounded-xl text-blue-700">
                <ShoppingBag className="size-6" />
              </div>
              <span className="flex items-center text-xs font-bold text-stone-400">
                -
              </span>
            </div>
            <h3 className="text-stone-500 text-sm font-medium">Active Orders</h3>
            <p className="text-2xl font-bold text-[#3E2723]">{activeOrders.length}</p>
          </Card>

          <Card className="p-6 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-amber-100 rounded-xl text-amber-700">
                <TrendingUp className="size-6" />
              </div>
              <span className="flex items-center text-xs font-bold text-stone-400">
                New
              </span>
            </div>
            <h3 className="text-stone-500 text-sm font-medium">Pending Quotes</h3>
            <p className="text-2xl font-bold text-[#3E2723]">{pendingRequests.length}</p>
          </Card>

          <Card className="p-6 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-[#5D4037]/10 rounded-xl text-[#5D4037]">
                <Users className="size-6" />
              </div>
              <span className="flex items-center text-xs font-bold text-green-600">
                {activeExpertsCount > 0 ? 'Active' : '-'}
              </span>
            </div>
            <h3 className="text-stone-500 text-sm font-medium">Active Experts</h3>
            <p className="text-2xl font-bold text-[#3E2723]">{activeExpertsCount}</p>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Revenue Trend */}
          <Card className="p-6 lg:col-span-2">
            <h3 className="font-bold text-lg text-[#3E2723] mb-6">Revenue Overview</h3>
            <div className="h-[300px] w-full min-w-0">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={displayRevenueData}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#5D4037" stopOpacity={0.1} />
                      <stop offset="95%" stopColor="#5D4037" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E7E5E4" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#78716C', fontSize: 12 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#78716C', fontSize: 12 }} tickFormatter={(value) => `TK ${value}`} />
                  <Tooltip
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                    itemStyle={{ color: '#3E2723', fontWeight: 'bold' }}
                    formatter={(value: number) => [`TK ${value}`, 'Revenue']}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#5D4037"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorRevenue)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Service Distribution */}
          <Card className="p-6">
            <h3 className="font-bold text-lg text-[#3E2723] mb-6">Order Distribution</h3>
            <div className="h-[300px] w-full min-w-0 relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={displayServiceData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {displayServiceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color || '#ccc'} strokeWidth={0} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                    itemStyle={{ color: '#3E2723', fontWeight: 'bold' }}
                  />
                  <Legend
                    content={({ payload }) => (
                      <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 mt-4 px-2">
                        {payload?.map((entry: any, index: number) => (
                          <div key={`item-${index}`} className="flex items-center text-xs font-medium text-stone-600">
                            <div className="size-2 rounded-full mr-1.5" style={{ backgroundColor: entry.color }} />
                            {entry.value}
                          </div>
                        ))}
                      </div>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none pb-12">
                <div className="text-center">
                  <span className="block text-2xl font-bold text-[#3E2723]">{orders.length > 0 ? '100%' : '0%'}</span>
                  <span className="text-xs text-stone-500">Total Volume</span>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Activity & Lists */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Pending Quotes */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-bold text-lg text-stone-900">Pending Quotes</h2>
              <Link to="/admin/requests" className="text-sm text-[#5D4037] hover:underline font-medium">View All</Link>
            </div>

            <div className="space-y-4">
              {pendingRequests.length === 0 ? (
                <div className="text-center py-12 text-stone-400 bg-stone-50 rounded-xl border-dashed border border-stone-200">
                  <CheckCircle className="mx-auto size-8 mb-2 opacity-50" />
                  <p>All caught up!</p>
                </div>
              ) : (
                pendingRequests.slice(0, 4).map(req => (
                  <div key={req.id} className="flex items-center justify-between p-4 bg-white border border-stone-100 rounded-xl hover:shadow-sm transition-all group">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-stone-100 rounded-lg text-stone-500 group-hover:bg-[#5D4037] group-hover:text-white transition-colors">
                        <FileText className="size-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-stone-900 text-sm line-clamp-1">{req.topic}</h4>
                        <p className="text-xs text-stone-500">{req.serviceType} • {format(new Date(req.createdAt), 'MMM d')}</p>
                      </div>
                    </div>
                    <Link to={`/admin/request/${req.id}`}>
                      <Button size="sm" variant="outline" className="text-xs h-8 border-stone-200 hover:border-[#5D4037] hover:text-[#5D4037]">
                        Review
                      </Button>
                    </Link>
                  </div>
                ))
              )}
            </div>
          </Card>

          {/* Expert Performance */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-bold text-lg text-stone-900">Top Experts</h2>
              <Link to="/admin/experts" className="text-sm text-[#5D4037] hover:underline font-medium">Manage Team</Link>
            </div>

            <div className="h-[300px] w-full min-w-0">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  layout="vertical"
                  data={displayExpertPerformance}
                  margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#E7E5E4" />
                  <XAxis type="number" hide />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 12, fill: '#57534E' }} width={80} axisLine={false} tickLine={false} />
                  <Tooltip
                    cursor={{ fill: '#F5F5F4' }}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  />
                  <Bar dataKey="orders" fill="#5D4037" radius={[0, 4, 4, 0]} barSize={20} name="Completed Orders" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
