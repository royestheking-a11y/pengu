import React, { useEffect, useState } from 'react';
import Slider from 'react-slick';
import {
  Star,
  Quote,
} from 'lucide-react';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import './CarouselStyles.css'; // Import the CSS
import api from '../lib/api';
import { ReviewSkeleton } from './components/ReviewSkeleton';

export function ReviewsSection() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const { data } = await api.get('/reviews/public');
        setReviews(data);
      } catch (error) {
        console.error("Failed to fetch reviews", error);
      } finally {
        setLoading(false);
      }
    };
    fetchReviews();
  }, []);

  const settings = {
    dots: true,
    infinite: reviews.length > 1,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 4000,
    arrows: false,
    pauseOnHover: true,
    pauseOnFocus: true,
    mobileFirst: true, // Crucial for reliable breakpoint detection
    responsive: [
      {
        breakpoint: 768, // min-width: 768px (Tablet)
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
          infinite: reviews.length > 2
        }
      },
      {
        breakpoint: 1024, // min-width: 1024px (Desktop)
        settings: {
          slidesToShow: 3,
          slidesToScroll: 1,
          infinite: reviews.length > 3
        }
      }
    ]
  };

  if (!loading && reviews.length === 0) return null;

  return (
    <div className="bg-[#FAFAFA] py-24 border-t border-stone-100 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-16">
          <span className="text-[#5D4037] font-bold tracking-wider text-sm uppercase mb-4 block">Testimonials</span>
          <h2 className="text-3xl md:text-4xl font-bold text-[#3E2723] mb-6">Success Stories</h2>
          <p className="text-stone-500 text-lg max-w-2xl mx-auto">
            Join thousands of students who have achieved academic excellence with Pengu.
          </p>
        </div>

        <div className="mx-auto max-w-7xl">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <ReviewSkeleton key={i} variant="homepage" />
              ))}
            </div>
          ) : (
            <Slider {...settings} className="pb-8">
              {reviews.map((review) => (
                <div key={review._id} className="py-4">
                  <div className="bg-white p-8 rounded-2xl shadow-sm border border-stone-100 flex flex-col min-h-[320px] h-full relative group hover:shadow-md transition-all hover:-translate-y-1 mx-2 sm:mx-4">

                    <div className="flex justify-between items-start mb-6">
                      <div className="flex gap-1 text-amber-400">
                        {[...Array(review.rating)].map((_, i) => (
                          <Star key={i} className="size-4 fill-current" />
                        ))}
                      </div>
                      <Quote className="size-8 text-stone-100 fill-current group-hover:text-[#5D4037]/10 transition-colors" />
                    </div>

                    <p className="text-stone-600 leading-relaxed mb-6 italic text-lg line-clamp-4 flex-grow">
                      "{review.text}"
                    </p>

                    <div className="flex items-center gap-4 pt-6 border-t border-stone-50 mt-auto">
                      <div className={`size-10 rounded-full flex items-center justify-center font-bold text-xs bg-stone-100 text-stone-600`}>
                        {review.studentId?.name ? review.studentId.name.substring(0, 2).toUpperCase() : 'ST'}
                      </div>
                      <div>
                        <h4 className="font-bold text-stone-900 text-sm">{review.studentId?.name || 'Student'}</h4>
                        <p className="text-[10px] text-stone-500 uppercase tracking-wide font-medium">Student</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </Slider>
          )}
        </div>
      </div>
    </div>
  );
}
