import React, { useState } from 'react';
import { useStore } from './store';
import { DashboardLayout } from './components/Layout';
import { OrderList } from './components/OrderList';
import { Button } from './components/ui/button';
import { Plus } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function StudentOrders() {
  const { requests, orders, currentUser } = useStore();
  const [activeTab, setActiveTab] = useState<'requests' | 'orders'>('orders');

  const myRequests = requests
    .filter(r => r.studentId === currentUser?.id)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  const myOrders = orders
    .filter(o => o.studentId === currentUser?.id)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#3E2723]">My Orders & Requests</h1>
            <p className="text-stone-500">Track your progress and manage ongoing projects.</p>
          </div>
          <Link to="/student/new-request">
            <Button>
              <Plus className="mr-2 size-4" /> New Request
            </Button>
          </Link>
        </div>

        {/* Tabs */}
        <div className="border-b border-stone-200">
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('orders')}
              className={`
                whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
                ${activeTab === 'orders'
                  ? 'border-[#5D4037] text-[#5D4037]'
                  : 'border-transparent text-stone-500 hover:text-stone-700 hover:border-stone-300'}
              `}
            >
              Active Orders ({myOrders.length})
            </button>
            <button
              onClick={() => setActiveTab('requests')}
              className={`
                whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
                ${activeTab === 'requests'
                  ? 'border-[#5D4037] text-[#5D4037]'
                  : 'border-transparent text-stone-500 hover:text-stone-700 hover:border-stone-300'}
              `}
            >
              Requests ({myRequests.length})
            </button>
          </nav>
        </div>

        {/* List Content */}
        {activeTab === 'orders' ? (
          <OrderList
            items={myOrders}
            type="order"
            basePath="/student/order"
          />
        ) : (
          <OrderList
            items={myRequests}
            type="request"
            basePath="/student/request"
          />
        )}
      </div>
    </DashboardLayout>
  );
}
