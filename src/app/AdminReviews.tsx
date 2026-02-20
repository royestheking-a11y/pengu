import React, { useState } from 'react';
import { DashboardLayout } from './components/Layout';
import { Card } from './components/ui/card';
import { Button } from './components/ui/button';
import {
  MessageSquare,
  Search,
  Trash2,
  Check,
  X,
  Star,
  Clock
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

import api from '../lib/api';

export default function AdminReviews() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [filter, setFilter] = useState('all'); // all, PENDING, APPROVED, REJECTED
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const { data } = await api.get('/reviews');
      // Backend uses 'PENDING', 'APPROVED', etc. match case
      setReviews(data.map((r: any) => ({
        id: r._id,
        reviewer: r.studentId?.name || 'Unknown',
        avatar: r.studentId?.avatar,
        rating: r.rating,
        comment: r.text,
        status: r.status, // Uppercase from backend
        date: r.createdAt
      })));
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch reviews");
    } finally {
      setLoading(false);
    }
  };

  const filteredReviews = reviews
    .filter(review => {
      if (filter === 'all') return true;
      return review.status === filter.toUpperCase();
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const handleApprove = async (id: string) => {
    try {
      await api.put(`/reviews/${id}`, { status: 'APPROVED' });
      setReviews(reviews.map(r => r.id === id ? { ...r, status: 'APPROVED' } : r));
      toast.success('Review approved');
    } catch (e) { toast.error("Failed to approve"); }
  };

  const handleReject = async (id: string) => {
    try {
      await api.put(`/reviews/${id}`, { status: 'REJECTED' });
      setReviews(reviews.map(r => r.id === id ? { ...r, status: 'REJECTED' } : r));
      toast.error('Review rejected');
    } catch (e) { toast.error("Failed to reject"); }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this review?')) {
      try {
        await api.delete(`/reviews/${id}`);
        setReviews(reviews.filter(r => r.id !== id));
        toast.success('Review deleted');
      } catch (e) { toast.error("Failed to delete"); }
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#3E2723]">Review Management</h1>
            <p className="text-stone-500">Moderate student reviews and feedback.</p>
          </div>
          <div className="flex gap-2">
            <Button variant={filter === 'all' ? 'default' : 'outline'} onClick={() => setFilter('all')}>
              All Reviews
            </Button>
            <Button variant={filter === 'pending' ? 'default' : 'outline'} onClick={() => setFilter('pending')}>
              Pending
            </Button>
            <Button variant={filter === 'approved' ? 'default' : 'outline'} onClick={() => setFilter('approved')}>
              Approved
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredReviews.map((review) => (
            <Card key={review.id} className="p-6 flex flex-col justify-between hover:shadow-md transition-shadow">
              <div>
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-2">
                    <div className="size-8 rounded-full overflow-hidden bg-stone-100 flex items-center justify-center text-[#5D4037] font-bold text-xs border border-stone-200">
                      {review.avatar ? (
                        <img src={review.avatar} alt={review.reviewer} className="w-full h-full object-cover" />
                      ) : (
                        review.reviewer.charAt(0)
                      )}
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-stone-900">{review.reviewer}</h3>
                      <p className="text-xs text-stone-500">{format(new Date(review.date), 'MMM d, yyyy')}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${review.status === 'APPROVED' ? 'bg-green-100 text-green-700' :
                    review.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                      'bg-amber-100 text-amber-700'
                    }`}>
                    {review.status}
                  </span>
                </div>

                <div className="flex items-center mb-3 text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`size-4 ${i < review.rating ? 'fill-current' : 'text-stone-200 fill-stone-200'}`}
                    />
                  ))}
                </div>

                <p className="text-stone-600 text-sm mb-6 line-clamp-3">"{review.comment}"</p>
              </div>

              <div className="flex gap-2 pt-4 border-t border-stone-100">
                {(review.status === 'PENDING' || !review.status) && (
                  <>
                    <Button
                      size="sm"
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                      onClick={() => handleApprove(review.id)}
                    >
                      <Check className="size-4 mr-1" /> Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 text-red-600 border-red-200 hover:bg-red-50"
                      onClick={() => handleReject(review.id)}
                    >
                      <X className="size-4 mr-1" /> Reject
                    </Button>
                  </>
                )}
                {review.status === 'APPROVED' && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 text-red-600 border-red-200 hover:bg-red-50"
                    onClick={() => handleReject(review.id)}
                  >
                    <X className="size-4 mr-1" /> Reject
                  </Button>
                )}
                {review.status === 'REJECTED' && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 text-green-600 border-green-200 hover:bg-green-50"
                    onClick={() => handleApprove(review.id)}
                  >
                    <Check className="size-4 mr-1" /> Approve
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-stone-400 hover:text-red-500"
                  onClick={() => handleDelete(review.id)}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
