import React from 'react';
import { PublicLayout } from './components/Layout';
import { Star, User, Quote } from 'lucide-react';
import api from '../lib/api';
import { ReviewSkeleton } from './components/ReviewSkeleton';

export default function Reviews() {
  const [reviews, setReviews] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [averageRating, setAverageRating] = React.useState(0);

  React.useEffect(() => {
    const fetchReviews = async () => {
      try {
        const { data } = await api.get('/reviews/public');

        // Calculate Average
        if (data.length > 0) {
          const total = data.reduce((acc: number, curr: any) => acc + curr.rating, 0);
          setAverageRating(Number((total / data.length).toFixed(1)));
        }

        const formatted = data.map((r: any) => ({
          id: r._id,
          name: r.studentId?.name || "Anonymous",
          role: "Student",
          rating: r.rating,
          date: new Date(r.createdAt).toLocaleDateString(),
          text: r.text,
          subject: r.expertId?.specialty || "General",
          avatar: r.studentId?.avatar
        }));
        setReviews(formatted);
      } catch (err) {
        console.error("Failed to fetch reviews", err);
      } finally {
        setLoading(false);
      }
    };
    fetchReviews();
  }, []);

  return (
    <PublicLayout>
      <div className="bg-[#FAFAFA] min-h-screen pb-20">
        <div className="bg-white border-b border-stone-100 py-16 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl font-bold mb-4 text-[#3E2723]">Student Reviews</h1>
            <p className="text-stone-500 text-lg">See what real students are saying about their experience with Pengu.</p>

            <div className="flex items-center justify-center gap-2 mt-8">
              <div className="flex text-amber-400">
                {[1, 2, 3, 4, 5].map(i => (
                  <Star
                    key={i}
                    className={`size-6 ${i <= Math.round(averageRating) ? 'fill-current' : 'text-stone-200 fill-stone-200'}`}
                  />
                ))}
              </div>
              <span className="font-bold text-lg ml-2">{averageRating > 0 ? `${averageRating}/5` : 'No ratings yet'} Average Rating</span>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-16">
          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <ReviewSkeleton key={i} variant="fullPage" />
              ))}
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {reviews.map((review) => (
                <div key={review.id} className="bg-white p-6 rounded-2xl shadow-sm border border-stone-100 flex flex-col h-full">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className="size-10 rounded-full overflow-hidden bg-stone-100 flex items-center justify-center text-stone-400 border border-stone-100">
                        {review.avatar ? (
                          <img src={review.avatar} alt={review.name} className="w-full h-full object-cover" />
                        ) : (
                          <User className="size-5" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-bold text-sm text-stone-900">{review.name}</h3>
                        <p className="text-xs text-stone-500">{review.role}</p>
                      </div>
                    </div>
                    <div className="flex text-amber-400">
                      {[...Array(review.rating)].map((_, i) => (
                        <Star key={i} className="fill-current size-3" />
                      ))}
                    </div>
                  </div>

                  <div className="flex-1">
                    <Quote className="size-8 text-[#5D4037]/10 mb-2" />
                    <p className="text-stone-600 text-sm leading-relaxed mb-4">
                      "{review.text}"
                    </p>
                  </div>

                  <div className="pt-4 border-t border-stone-50 flex justify-between items-center text-xs">
                    <span className="font-medium px-2 py-1 bg-stone-100 rounded text-stone-600">{review.subject}</span>
                    <span className="text-stone-400">{review.date}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </PublicLayout>
  );
}
