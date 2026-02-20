import React, { useEffect, useState } from 'react';
import { DashboardLayout } from './components/Layout';
import { Card } from './components/ui/card';
import {
  Users,
  ShoppingCart,
  Activity,
  MapPin,
  ArrowUp,
  ArrowDown,
  DollarSign
} from 'lucide-react';
import { useStore } from './store';
import api from '../lib/api';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

export default function AdminLiveStats() {
  const { financialTransactions } = useStore();

  const [stats, setStats] = useState({
    activeSession: 0,
    activeOrders: 0,
    pendingRequests: 0,
    dbStatus: 'Good',
    latency: '...',
    memory: '...'
  });

  const [data, setData] = useState<{ time: string; users: number }[]>([]);

  // Platform Profit (Calculated from Store as it's financial data)
  const platformProfit = financialTransactions
    .filter(tx => tx.type === 'COMMISSION')
    .reduce((sum, tx) => sum + tx.amount, 0);

  const fetchStats = async () => {
    try {
      const start = Date.now();
      const { data: sysData } = await api.get('/system/stats');
      const latency = Date.now() - start;

      setStats({
        activeSession: sysData.counts.users, // Using total users as proxy for now, ideally persistent socket count
        activeOrders: sysData.counts.activeOrders,
        pendingRequests: sysData.counts.requests, // Total requests or pending specific if backend provides
        dbStatus: sysData.database,
        latency: latency + 'ms',
        memory: sysData.memory.systemUsagePercent + '%'
      });

      // Update Chart Data
      setData(prev => {
        const now = new Date();
        const timeString = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
        const newData = [...prev, { time: timeString, users: sysData.counts.activeOrders + 5 }]; // Demo logic for visual
        if (newData.length > 20) newData.shift();
        return newData;
      });

    } catch (e) {
      console.error("Failed to fetch system stats", e);
    }
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 5000); // Poll every 5 seconds
    return () => clearInterval(interval);
  }, []);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#3E2723]">Live System Status</h1>
            <p className="text-stone-500 flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
              </span>
              System Operational • Real-time Monitoring
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="p-6 border-green-200 bg-green-50">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium text-stone-600">Total Users</h3>
              <Users className="size-5 text-green-600" />
            </div>
            <p className="text-3xl font-bold text-stone-900">{stats.activeSession}</p>
            <p className="text-xs text-green-700 mt-2 flex items-center">
              <ArrowUp className="size-3 mr-1" /> Registered Accounts
            </p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium text-stone-600">Active Orders</h3>
              <ShoppingCart className="size-5 text-[#5D4037]" />
            </div>
            <p className="text-3xl font-bold text-stone-900">{stats.activeOrders}</p>
            <p className="text-xs text-stone-500 mt-2">Currently processing</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium text-stone-600">Requests</h3>
              <Activity className="size-5 text-amber-500" />
            </div>
            <p className="text-3xl font-bold text-stone-900">{stats.pendingRequests}</p>
            <p className="text-xs text-stone-500 mt-2">Total Inquiries</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium text-stone-600">Platform Revenue</h3>
              <DollarSign className="size-5 text-blue-500" />
            </div>
            <p className="text-3xl font-bold text-stone-900">TK {platformProfit.toLocaleString()}</p>
            <p className="text-xs text-stone-500 mt-2">Commission earnings</p>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="p-6 lg:col-span-2">
            <h3 className="font-bold text-lg text-[#3E2723] mb-6">Real-time Traffic</h3>
            <div className="h-[300px] w-full min-w-0">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data}>
                  <defs>
                    <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22c55e" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E7E5E4" />
                  <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fill: '#78716C', fontSize: 12 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#78716C', fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  />
                  <Area type="monotone" dataKey="users" stroke="#22c55e" fillOpacity={1} fill="url(#colorUsers)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="font-bold text-lg text-[#3E2723] mb-6">System Health</h3>
            <div className="space-y-6">
              <div>
                <div className="flex justify-between mb-2 text-sm">
                  <span className="font-medium text-stone-700">Database</span>
                  <span className={`font-bold ${stats.dbStatus === 'Healthy' ? 'text-green-600' : 'text-red-600'}`}>
                    {stats.dbStatus}
                  </span>
                </div>
                <div className="w-full bg-stone-100 rounded-full h-2">
                  <div className={`h-2 rounded-full ${stats.dbStatus === 'Healthy' ? 'bg-green-500' : 'bg-red-500'}`} style={{ width: '100%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-2 text-sm">
                  <span className="font-medium text-stone-700">API Latency</span>
                  <span className="text-green-600 font-bold">{stats.latency}</span>
                </div>
                <div className="w-full bg-stone-100 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: '100%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-2 text-sm">
                  <span className="font-medium text-stone-700">System Memory</span>
                  <span className="text-amber-600 font-bold">{stats.memory}</span>
                </div>
                <div className="w-full bg-stone-100 rounded-full h-2">
                  <div className="bg-amber-500 h-2 rounded-full" style={{ width: stats.memory }}></div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
