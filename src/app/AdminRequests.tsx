import React from 'react';
import { useStore } from './store';
import { Link } from 'react-router-dom';
import { DashboardLayout } from './components/Layout';
import { Card } from './components/ui/card';
import { Button } from './components/ui/button';
import {
  FileText,
  Search,
  Filter,
  MoreHorizontal,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { format } from 'date-fns';
import { EmptyState } from './components/ui/EmptyState';

export default function AdminRequests() {
  const { requests } = useStore();
  const [filter, setFilter] = React.useState('ALL');

  const filteredRequests = requests.filter(req => {
    if (filter === 'ALL') return true;
    return req.status === filter;
  }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SUBMITTED': return 'bg-amber-100 text-amber-800';
      case 'QUOTED': return 'bg-blue-100 text-blue-800';
      case 'ACCEPTED': return 'bg-green-100 text-green-800';
      case 'CONVERTED': return 'bg-emerald-100 text-emerald-800';
      case 'EXPIRED': return 'bg-stone-100 text-stone-500';
      case 'NEGOTIATION': return 'bg-purple-100 text-purple-800';
      default: return 'bg-stone-100 text-stone-800';
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#3E2723]">Quote Requests</h1>
            <p className="text-stone-500">Manage incoming requests and send quotes to students.</p>
          </div>
          <Link to="/student/new-request"> {/* Admin might want to create one manually? Or just visual balance */}
            <Button>
              <FileText className="mr-2 size-4" /> Create Request
            </Button>
          </Link>
        </div>

        <Card className="p-6">
          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-6 justify-between">
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-stone-400" />
              <input
                type="text"
                placeholder="Search requests..."
                className="w-full pl-10 pr-4 py-2 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5D4037]"
              />
            </div>

            <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
              {['ALL', 'SUBMITTED', 'QUOTED', 'ACCEPTED', 'EXPIRED'].map((status) => (
                <button
                  key={status}
                  onClick={() => setFilter(status)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${filter === status
                    ? 'bg-[#5D4037] text-white'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                    }`}
                >
                  {status === 'ALL' ? 'All Requests' : status.charAt(0) + status.slice(1).toLowerCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Table Header */}
          <div className="hidden md:grid grid-cols-12 gap-4 px-4 py-3 bg-stone-50 rounded-lg text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">
            <div className="col-span-4">Topic / Service</div>
            <div className="col-span-3">Student</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-2">Submitted</div>
            <div className="col-span-1 text-right">Action</div>
          </div>

          {/* List */}
          <div className="space-y-2">
            {filteredRequests.length === 0 ? (
              <EmptyState
                icon={FileText}
                title="No inquiries found"
                subtitle="There are currently no requests matching your criteria. New student inquiries will appear here automatically."
                className="my-8"
              />
            ) : (
              filteredRequests.map((req) => (
                <div key={req.id} className="flex flex-col md:grid md:grid-cols-12 gap-4 px-4 py-4 border border-stone-100 rounded-xl items-start md:items-center hover:shadow-sm transition-shadow bg-white">

                  {/* Topic & Service */}
                  <div className="md:col-span-4 flex items-center gap-3 w-full">
                    <div className="p-2 bg-stone-100 rounded-lg text-stone-500 shrink-0">
                      <FileText className="size-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-mono text-stone-400 md:hidden">#{req.id}</span>
                        <h3 className="font-bold text-stone-900 truncate">{req.topic}</h3>
                      </div>
                      <p className="text-xs text-stone-500 truncate">{req.serviceType}</p>
                    </div>
                  </div>

                  {/* Student Info */}
                  <div className="md:col-span-3 flex items-center gap-2 w-full">
                    <div className="size-6 rounded-full overflow-hidden bg-stone-200 flex items-center justify-center text-[10px] font-bold text-stone-600 shrink-0 border border-stone-100">
                      {typeof req.studentId === 'object' && (req.studentId as any).avatar ? (
                        <img src={(req.studentId as any).avatar} alt="Student" className="w-full h-full object-cover" />
                      ) : (
                        'S'
                      )}
                    </div>
                    <span className="text-xs sm:text-sm text-stone-700 truncate">
                      {typeof req.studentId === 'object' ? (req.studentId as any).name || 'Unknown' : 'Student: ' + req.studentId}
                    </span>
                  </div>

                  {/* Status, Date & Actions (Grouped for mobile) */}
                  <div className="md:col-span-5 flex flex-wrap items-center justify-between gap-4 w-full pt-3 md:pt-0 border-t md:border-t-0 border-stone-50">
                    <div className="flex items-center gap-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-medium whitespace-nowrap ${getStatusColor(req.status)}`}>
                        {req.status}
                      </span>
                      <div className="flex items-center gap-2 text-[10px] sm:text-xs text-stone-500">
                        <Clock className="size-3 sm:size-4" />
                        <span>{format(new Date(req.createdAt), 'MMM d')}</span>
                      </div>
                    </div>

                    <div className="flex justify-end shrink-0">
                      <Link to={`/admin/request/${req.id}`}>
                        <Button size="sm" variant="outline" className="h-8 text-[10px] sm:text-xs">
                          Review
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
