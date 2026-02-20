import React, { useState } from 'react';
import { useStore, Order } from './store';
import { DashboardLayout } from './components/Layout';
import { Link } from 'react-router-dom';
import { Card } from './components/ui/card';
import { Button } from './components/ui/button';
import {
  FileText,
  Search,
  Filter,
  User,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { format } from 'date-fns';
import { toast } from 'sonner';

export default function AdminOrders() {
  const { orders, experts, assignExpert, requests } = useStore();
  const [filterStatus, setFilterStatus] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [assigningOrderId, setAssigningOrderId] = useState<string | null>(null);

  // Helper to get request details for an order
  const getRequest = (requestId: string) => requests.find(r => r.id === requestId);

  const filteredOrders = orders.filter(order => {
    const request = getRequest(order.requestId);
    const matchesStatus = filterStatus === 'All' || order.status === filterStatus;
    const matchesSearch = (request?.topic?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
      order.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const handleAssign = (expertId: string) => {
    if (assigningOrderId) {
      assignExpert(assigningOrderId, expertId);
      setAssigningOrderId(null);
      toast.success('Expert assigned successfully');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PAID_CONFIRMED': return 'bg-blue-100 text-blue-700';
      case 'ASSIGNED': return 'bg-purple-100 text-purple-700';
      case 'IN_PROGRESS': return 'bg-amber-100 text-amber-700';
      case 'Review': return 'bg-pink-100 text-pink-700';
      case 'COMPLETED': return 'bg-green-100 text-green-700';
      default: return 'bg-stone-100 text-stone-700';
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-[#3E2723]">Active Operations</h1>
          <p className="text-stone-500">Manage orders and assign experts.</p>
        </div>

        {/* Filters */}
        <Card className="p-4">
          <div className="flex flex-col md:flex-row gap-4 justify-between">
            <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
              {['All', 'PAID_CONFIRMED', 'ASSIGNED', 'IN_PROGRESS', 'Review', 'COMPLETED'].map(status => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={`
                    whitespace-nowrap px-3 py-1.5 rounded-md text-sm font-medium transition-colors
                    ${filterStatus === status
                      ? 'bg-[#5D4037] text-white'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200'}
                  `}
                >
                  {status === 'PAID_CONFIRMED' ? 'Needs Assignment' : status.replace('_', ' ')}
                </button>
              ))}
            </div>
            <div className="relative min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-stone-400" />
              <input
                type="text"
                placeholder="Search orders..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-1.5 rounded-md border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#5D4037]/20 focus:border-[#5D4037]"
              />
            </div>
          </div>
        </Card>

        {/* Orders List */}
        <div className="space-y-4">
          {filteredOrders.length === 0 ? (
            <Card className="p-12 text-center border-dashed">
              <FileText className="mx-auto size-12 text-stone-300 mb-4" />
              <h3 className="font-bold text-stone-900">No Orders Found</h3>
              <p className="text-stone-500">Try adjusting your filters.</p>
            </Card>
          ) : (
            filteredOrders.map(order => {
              const request = getRequest(order.requestId);
              const expertId = (order.expertId && typeof order.expertId === 'object') ? (order.expertId as any)._id || (order.expertId as any).id : order.expertId;
              const assignedExpert = experts.find(e => e.userId === expertId || e.id === expertId);

              return (
                <Card key={order.id} className="p-6 hover:shadow-md transition-shadow">
                  <div className="flex flex-col md:flex-row gap-6 justify-between">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="font-mono text-xs text-stone-400">#{order.id}</span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold uppercase ${getStatusColor(order.status)}`}>
                          {order.status.replace('_', ' ')}
                        </span>
                        <span className="text-xs text-stone-500 flex items-center gap-1">
                          <Calendar className="size-3" />
                          {request && request.deadline ? (() => {
                            const d = new Date(request.deadline);
                            return isNaN(d.getTime()) ? 'TBD' : format(d, 'MMM d, yyyy');
                          })() : 'No Date'}
                        </span>
                      </div>

                      <h3 className="font-bold text-lg text-stone-900">
                        {request?.topic || 'Untitled Order'}
                      </h3>

                      <div className="flex items-center gap-6 text-sm text-stone-600">
                        <span className="flex items-center gap-2">
                          <User className="size-4 text-stone-400" />
                          Student: {typeof order.studentId === 'object' ? (order.studentId as any).name : (order.studentId || 'Unknown')}
                        </span>
                        {assignedExpert && (
                          <span className="flex items-center gap-2">
                            <CheckCircle className="size-4 text-green-600" />
                            Expert: {assignedExpert.name}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-4 border-t md:border-t-0 md:border-l border-stone-100 pt-4 md:pt-0 md:pl-6">
                      {(order.status === 'PAID_CONFIRMED' || (order.status === 'ASSIGNED' && !assignedExpert)) ? (
                        <Button onClick={() => setAssigningOrderId(order.id)} className="w-full md:w-auto">
                          {order.status === 'ASSIGNED' ? 'Re-assign Expert' : 'Assign Expert'}
                        </Button>
                      ) : (
                        <Link to={`/admin/order/${order.id}`} className="w-full md:w-auto">
                          <Button variant="outline" className="w-full">
                            Manage Order
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })
          )}
        </div>
      </div>

      {/* Assignment Modal */}
      <AnimatePresence>
        {assigningOrderId && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setAssigningOrderId(null)}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
            />
            <motion.div
              initial={{ opacity: 0, x: '100%' }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: '100%' }}
              className="fixed right-0 top-0 bottom-0 w-full md:w-[500px] bg-white shadow-2xl z-50 p-6 overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-[#3E2723]">Assign Expert</h2>
                <Button variant="ghost" size="sm" onClick={() => setAssigningOrderId(null)}>
                  <X className="size-5" />
                </Button>
              </div>

              <div className="space-y-4">
                <p className="text-sm text-stone-500 mb-4">
                  Select an available expert for Order #{assigningOrderId}.
                  Experts currently online are highlighted.
                </p>

                {experts.map(expert => (
                  <button
                    key={expert.id}
                    onClick={() => handleAssign(expert.userId || expert.id)}
                    disabled={expert.status !== 'Active' || !expert.online}
                    className={`
                      w-full text-left p-4 rounded-xl border transition-all flex items-center gap-4 group
                      ${expert.status !== 'Active' || !expert.online ? 'opacity-50 bg-stone-50 cursor-not-allowed border-stone-100 grayscale-[0.5]' : 'hover:border-[#5D4037] hover:shadow-md bg-white border-stone-200'}
                    `}
                  >
                    <div className="relative">
                      <div className="size-12 rounded-full overflow-hidden bg-[#3E2723] text-white flex items-center justify-center font-bold border border-stone-200">
                        {expert.avatar ? (
                          <img src={expert.avatar} alt={expert.name} className="w-full h-full object-cover" />
                        ) : (
                          expert.name.charAt(0)
                        )}
                      </div>
                      {expert.online && (
                        <div className="absolute -bottom-1 -right-1 size-4 bg-green-500 rounded-full border-2 border-white animate-pulse" />
                      )}
                    </div>

                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <h3 className="font-bold text-stone-900 group-hover:text-[#5D4037] transition-colors">
                          {expert.name}
                        </h3>
                        {expert.online ? (
                          <span className="text-[10px] uppercase font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                            Online
                          </span>
                        ) : (
                          <span className="text-[10px] uppercase font-bold text-stone-500 bg-stone-100 px-2 py-0.5 rounded-full">
                            Offline - Unavailable
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-stone-500 mb-1">{expert.specialty}</p>
                      <div className="flex items-center gap-3 text-xs text-stone-400">
                        <span className="flex items-center gap-1">
                          <CheckCircle className="size-3" /> {expert.completedOrders} Orders
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1 text-amber-500 font-bold">
                          ★ {expert.rating}
                        </span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
}
