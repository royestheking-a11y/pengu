import React, { useState } from 'react';
import { useStore } from './store';
import { DashboardLayout } from './components/Layout';
import { OrderList } from './components/OrderList';
import { FileText, CheckCircle, Clock } from 'lucide-react';

export default function ExpertOrders() {
    const { orders, currentUser } = useStore();

    // Filter orders assigned to current expert
    const expertOrders = orders
        .filter(o => o.expertId === currentUser?.id)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const activeOrders = expertOrders.filter(o => o.status !== 'COMPLETED');
    const completedOrders = expertOrders.filter(o => o.status === 'COMPLETED');

    return (
        <DashboardLayout>
            <div className="space-y-8">
                <div>
                    <h1 className="text-2xl font-bold text-[#3E2723]">My Assignments</h1>
                    <p className="text-stone-500">Track and manage your active orders and history.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-6 bg-white rounded-2xl border border-stone-100 shadow-sm flex items-center gap-4">
                        <div className="p-3 bg-amber-50 rounded-xl text-amber-600">
                            <Clock className="size-6" />
                        </div>
                        <div>
                            <p className="text-stone-500 text-sm font-medium">Active Assignments</p>
                            <h3 className="text-2xl font-bold text-stone-900">{activeOrders.length}</h3>
                        </div>
                    </div>
                    <div className="p-6 bg-white rounded-2xl border border-stone-100 shadow-sm flex items-center gap-4">
                        <div className="p-3 bg-green-50 rounded-xl text-green-600">
                            <CheckCircle className="size-6" />
                        </div>
                        <div>
                            <p className="text-stone-500 text-sm font-medium">Completed Total</p>
                            <h3 className="text-2xl font-bold text-stone-900">{completedOrders.length}</h3>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden">
                    <div className="p-6 border-b border-stone-100 bg-stone-50/50">
                        <h3 className="font-bold text-stone-900">Order Management</h3>
                    </div>
                    <div className="p-6">
                        <OrderList
                            items={expertOrders}
                            type="order"
                            basePath="/expert/order"
                        />
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
