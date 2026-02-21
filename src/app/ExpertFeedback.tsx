import React from 'react';
import { useStore } from './store';
import { DashboardLayout } from './components/Layout';
import { Card } from './components/ui/card';
import { Star, MessageSquare, Award, TrendingUp, User } from 'lucide-react';
import { format } from 'date-fns';
import { EmptyState } from './components/ui/EmptyState';

export default function ExpertFeedback() {
    const { reviews, currentUser, experts } = useStore();

    const currentExpertId = currentUser?.id || '';
    const currentExpert = experts.find(e => ((e.userId as any)?._id || e.userId) === currentExpertId);

    const expertReviews = reviews
        .filter(r => ((r.expertId as any)?._id || r.expertId) === currentExpertId)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const averageRating = expertReviews.length > 0
        ? (expertReviews.reduce((acc, r) => acc + r.rating, 0) / expertReviews.length).toFixed(1)
        : 'N/A';

    const ratingCounts = [5, 4, 3, 2, 1].map(stars => ({
        stars,
        count: expertReviews.filter(r => r.rating === stars).length,
        percentage: expertReviews.length > 0
            ? (expertReviews.filter(r => r.rating === stars).length / expertReviews.length) * 100
            : 0
    }));

    const safeFormatDate = (dateStr: string | undefined | null) => {
        if (!dateStr) return 'N/A';
        try {
            const d = new Date(dateStr);
            if (isNaN(d.getTime())) return 'N/A';
            return format(d, 'PPP');
        } catch (e) {
            return 'N/A';
        }
    };

    return (
        <DashboardLayout>
            <div className="space-y-8">
                <div>
                    <h1 className="text-2xl font-bold text-[#3E2723]">Client Feedback</h1>
                    <p className="text-stone-500">Reviews and ratings from your completed projects.</p>
                </div>

                {/* Stats Summary */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <Card className="p-6 flex flex-col items-center justify-center text-center">
                        <div className="size-20 rounded-full bg-amber-50 flex items-center justify-center mb-4">
                            <Star className="size-10 text-amber-500 fill-current" />
                        </div>
                        <div className="text-4xl font-bold text-stone-900 mb-1">{averageRating}</div>
                        <div className="flex text-amber-500 mb-2">
                            {Array.from({ length: 5 }).map((_, i) => (
                                <Star key={i} className={`size-5 ${i < Math.round(Number(averageRating)) ? "fill-current" : "text-stone-200"}`} />
                            ))}
                        </div>
                        <p className="text-sm text-stone-500 font-medium">{expertReviews.length} Total Reviews</p>
                    </Card>

                    <Card className="p-6 lg:col-span-2">
                        <h3 className="font-bold text-stone-800 mb-6 flex items-center gap-2">
                            <TrendingUp className="size-5 text-[#5D4037]" /> Rating Distribution
                        </h3>
                        <div className="space-y-3">
                            {ratingCounts.map(({ stars, count, percentage }) => (
                                <div key={stars} className="flex items-center gap-4">
                                    <div className="flex items-center gap-1 w-12 shrink-0">
                                        <span className="text-sm font-bold text-stone-600">{stars}</span>
                                        <Star className="size-3 text-amber-400 fill-current" />
                                    </div>
                                    <div className="flex-1 h-2 bg-stone-100 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-amber-400 rounded-full transition-all duration-1000"
                                            style={{ width: `${percentage}%` }}
                                        />
                                    </div>
                                    <span className="text-xs font-medium text-stone-400 w-8">{count}</span>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>

                {/* Reviews List */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-bold text-stone-900 flex items-center gap-2">
                            <MessageSquare className="size-5 text-[#5D4037]" /> All Reviews
                        </h2>
                    </div>

                    {expertReviews.length === 0 ? (
                        <EmptyState
                            icon={Award}
                            title="No reviews yet"
                            subtitle="Complete your first order to receive feedback from students."
                        />
                    ) : (
                        <div className="grid grid-cols-1 gap-4">
                            {expertReviews.map((review) => (
                                <Card key={review.id} className="p-6 hover:shadow-md transition-shadow border-stone-100">
                                    <div className="flex flex-col md:flex-row gap-6">
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between mb-3">
                                                <div className="flex text-amber-500 gap-0.5">
                                                    {Array.from({ length: 5 }).map((_, i) => (
                                                        <Star key={i} className={`size-4 ${i < review.rating ? "fill-current" : "text-stone-200"}`} />
                                                    ))}
                                                </div>
                                                <span className="text-xs font-medium text-stone-400">
                                                    {safeFormatDate(review.createdAt)}
                                                </span>
                                            </div>
                                            <blockquote className="text-stone-700 italic text-base leading-relaxed mb-4">
                                                "{review.text}"
                                            </blockquote>
                                            <div className="flex items-center gap-3 pt-4 border-t border-stone-50">
                                                <div className="size-8 rounded-full bg-[#5D4037]/10 flex items-center justify-center text-[#5D4037]">
                                                    <User className="size-4" />
                                                </div>
                                                <div className="text-xs">
                                                    <p className="font-bold text-stone-900">Student</p>
                                                    <p className="text-stone-500">Order ID: #{review.orderId.substring(0, 8)}...</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}
