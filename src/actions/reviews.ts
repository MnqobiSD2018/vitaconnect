'use server';

import { createClient } from '@/lib/supabase/server';

export async function getEventReviews(eventId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('reviews')
    .select('id, rating, comment, created_at, user_id, profiles(full_name, avatar_url)')
    .eq('event_id', eventId)
    .eq('is_visible', true)
    .order('created_at', { ascending: false });

  if (error) return [];
  return data || [];
}

export async function submitReview(eventId: string, rating: number, comment: string) {
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) throw new Error('You must be logged in to leave a review');
  if (rating < 1 || rating > 5) throw new Error('Rating must be between 1 and 5');
  if (!comment.trim()) throw new Error('Comment is required');

  const { error } = await supabase.from('reviews').upsert({
    event_id: eventId,
    user_id: user.id,
    rating,
    comment: comment.trim(),
    is_visible: true,
  }, { onConflict: 'event_id, user_id' });

  if (error) throw new Error(error.message);
}

export async function getAvgRating(eventId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from('reviews')
    .select('rating')
    .eq('event_id', eventId)
    .eq('is_visible', true);

  if (!data || data.length === 0) return { avg: 0, count: 0 };
  return {
    avg: data.reduce((s, r) => s + r.rating, 0) / data.length,
    count: data.length,
  };
}