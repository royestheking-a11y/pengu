import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  Filter,
  ArrowUpDown,
  FileText,
  Clock,
  CheckCircle,
  AlertCircle,
  MoreVertical,
  ChevronRight
} from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { format } from 'date-fns';
import { Order, Request } from '../store';

interface OrderListProps {
  items: (Order | Request)[];
  type: 'order' | 'request';
  onItemClick?: (id: string) => void;
  basePath: string; // e.g., '/student/order' or '/admin/request'
  emptyState?: React.ReactNode;
}

export function OrderList({ items, type, basePath, emptyState }: OrderListProps) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Filter & Sort
  const filteredItems = items
    .filter(item => {
      const topic = item.topic || '';
      const serviceType = item.serviceType || '';
      const matchesSearch = topic.toLowerCase().includes(search.toLowerCase()) ||
        serviceType.toLowerCase().includes(search.toLowerCase()) ||
        item.id.includes(search);
      const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      const dateA = new Date(type === 'order' ? (a as Order).createdAt : (a as Request).createdAt).getTime();
      const dateB = new Date(type === 'order' ? (b as Order).createdAt : (b as Request).createdAt).getTime();
      return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
    });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'bg-green-100 text-green-700 border-green-200';
      case 'IN_PROGRESS': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'QUOTED': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'SUBMITTED': return 'bg-stone-100 text-stone-600 border-stone-200';
      default: return 'bg-stone-50 text-stone-500 border-stone-100';
    }
  };

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-col md:flex-row gap-4 justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-stone-400" />
          <input
            type="text"
            placeholder={`Search ${type}s by topic or ID...`}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-stone-200 focus:outline-none focus:ring-2 focus:ring-[#5D4037] text-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex gap-2">
          <select
            className="px-4 py-2 rounded-lg border border-stone-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#5D4037]"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="SUBMITTED">Submitted</option>
            <option value="QUOTED">Quoted</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="COMPLETED">Completed</option>
          </select>

          <Button
            variant="outline"
            onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
            className="flex items-center gap-2"
          >
            <ArrowUpDown className="size-4" />
            {sortOrder === 'asc' ? 'Oldest' : 'Newest'}
          </Button>
        </div>
      </div>

      {/* List */}
      <div className="space-y-3">
        {filteredItems.length === 0 ? (
          emptyState || (
            <div className="text-center py-12 bg-stone-50 rounded-xl border border-dashed border-stone-200">
              <div className="mx-auto size-12 bg-stone-100 rounded-full flex items-center justify-center mb-4">
                <Search className="size-6 text-stone-400" />
              </div>
              <h3 className="text-stone-900 font-medium">No {type}s found</h3>
              <p className="text-stone-500 text-sm">Try adjusting your filters or search terms.</p>
            </div>
          )
        ) : (
          filteredItems.map((item, index) => (
            <Link key={index} to={`${basePath}/${item.id}`}>
              <Card className="p-4 hover:shadow-md transition-all group border-stone-200 hover:border-[#5D4037]/30">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex flex-1 items-center gap-4">
                    <div className={`
                      hidden md:flex size-12 rounded-xl items-center justify-center transition-colors
                      ${type === 'order' ? 'bg-amber-50 text-amber-600 group-hover:bg-[#5D4037] group-hover:text-white' : 'bg-stone-100 text-stone-500 group-hover:bg-[#5D4037] group-hover:text-white'}
                    `}>
                      {type === 'order' ? <Clock className="size-6" /> : <FileText className="size-6" />}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="text-[10px] sm:text-xs font-mono text-stone-400">#{item.id}</span>
                        <h3 className="font-bold text-stone-900 group-hover:text-[#5D4037] transition-colors truncate">{item.topic}</h3>
                      </div>
                      <p className="text-xs sm:text-sm text-stone-500 truncate">
                        {item.serviceType} • {format(new Date(item.createdAt), 'MMM d, yyyy')}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-stone-50">
                    <span className={`px-3 py-1 rounded-full text-[10px] sm:text-xs font-bold border capitalize whitespace-nowrap ${getStatusColor(item.status)}`}>
                      {item.status.replace('_', ' ').toLowerCase()}
                    </span>
                    <ChevronRight className="size-5 text-stone-300 group-hover:text-[#5D4037] transition-colors shrink-0" />
                  </div>
                </div>
              </Card>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
