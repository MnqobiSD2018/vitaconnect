'use client';

import React, { useEffect, useState } from 'react';
import { Star, Loader2, MessageSquare } from 'lucide-react';
import { useNotification } from '@/components/ui/notifications';
import { getEventReviews, submitReview, getAvgRating } from '@/actions/reviews';
import { useAuth } from '@/hooks/use-auth';
import Link from 'next/link';

interface Review {
  id: string;
  rating: number;
  comment: string;
  created_at: string;
  user_id: string;
  profiles: { full_name: string | null; avatar_url: string | null }[] | null;
}

export default function ReviewsSection({ eventId }: { eventId: string }) {
  const { user } = useAuth();
  const notify = useNotification();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [avgRating, setAvgRating] = useState(0);
  const [reviewCount, setReviewCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    Promise.all([
      getEventReviews(eventId),
      getAvgRating(eventId),
    ]).then(([revs, avg]) => {
      setReviews(revs as Review[]);
      setAvgRating(avg.avg);
      setReviewCount(avg.count);
    }).finally(() => setLoading(false));
  }, [eventId]);

  const handleSubmit = async () => {
    if (rating === 0) { notify.error('Please select a rating'); return; }
    if (!comment.trim()) { notify.error('Please write a review'); return; }
    setSubmitting(true);
    try {
      await submitReview(eventId, rating, comment);
      notify.success('Review submitted!');
      setRating(0);
      setComment('');
      const [revs, avg] = await Promise.all([
        getEventReviews(eventId),
        getAvgRating(eventId),
      ]);
      setReviews(revs as Review[]);
      setAvgRating(avg.avg);
      setReviewCount(avg.count);
    } catch (err: any) {
      notify.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const StarInput = ({ n }: { n: number }) => (
    <button
      type="button"
      onClick={() => setRating(n)}
      onMouseEnter={() => setHoverRating(n)}
      onMouseLeave={() => setHoverRating(0)}
      className="p-0.5"
    >
      <Star
        className={`h-6 w-6 transition-colors ${
          n <= (hoverRating || rating) ? 'fill-amber-400 text-amber-400' : 'text-slate-300'
        }`}
      />
    </button>
  );

  const formatDate = (d: string) => new Date(d).toLocaleDateString('en-ZW', { month: 'short', day: 'numeric', year: 'numeric' });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 text-slate-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="mt-16 border-t border-slate-200 pt-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Reviews</h2>
          {reviewCount > 0 && (
            <p className="text-sm text-slate-500 mt-1">
              {avgRating.toFixed(1)} avg &middot; {reviewCount} review{reviewCount !== 1 ? 's' : ''}
            </p>
          )}
        </div>
      </div>

      {/* Submit Review */}
      {user ? (
        <div className="bg-slate-50 rounded-2xl border border-slate-200 p-6 mb-8">
          <h3 className="text-sm font-semibold text-slate-900 mb-3">Write a Review</h3>
          <div className="flex items-center gap-1 mb-3">
            {[1, 2, 3, 4, 5].map((n) => <StarInput key={n} n={n} />)}
          </div>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white py-3 px-4 text-sm min-h-[80px] resize-y focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
            placeholder="Share your experience..."
          />
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="mt-3 inline-flex h-10 items-center justify-center rounded-xl bg-teal-600 hover:bg-teal-700 text-white px-5 text-sm font-semibold transition-colors disabled:opacity-50"
          >
            {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Submit Review
          </button>
        </div>
      ) : (
        <div className="bg-slate-50 rounded-2xl border border-slate-200 p-6 mb-8 text-center">
          <p className="text-sm text-slate-600">
            <Link href={`/login?redirect=/events/${eventId}`} className="text-teal-600 font-semibold hover:underline">Sign in</Link> to leave a review.
          </p>
        </div>
      )}

      {/* Review list */}
      {reviews.length === 0 ? (
        <div className="text-center py-12 text-slate-500">
          <MessageSquare className="mx-auto h-8 w-8 text-slate-300 mb-2" />
          <p className="text-sm">No reviews yet. Be the first!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review.id} className="rounded-2xl border border-slate-200 p-5">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-teal-50 text-teal-600 text-xs font-bold">
                    {review.profiles?.[0]?.full_name?.charAt(0) || '?'}
                  </div>
                  <span className="text-sm font-medium text-slate-900">{review.profiles?.[0]?.full_name || 'Anonymous'}</span>
                </div>
                <span className="text-xs text-slate-400">{formatDate(review.created_at)}</span>
              </div>
              <div className="flex items-center gap-0.5 mb-2">
                {[1, 2, 3, 4, 5].map((n) => (
                  <Star key={n} className={`h-4 w-4 ${n <= review.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`} />
                ))}
              </div>
              <p className="text-sm text-slate-600">{review.comment}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}