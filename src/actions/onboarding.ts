'use server';

import { createClient } from '@/lib/supabase/server';
import { slugify } from '@/lib/utils/slug';

export async function saveBusinessInfo(data: {
  organizerId: string | null;
  businessName: string;
  tradingName?: string;
  businessEmail: string;
  phone: string;
  businessType: string;
  organizerCategory: string;
  yearsInBusiness: string;
  country: string;
  city: string;
  physicalAddress: string;
  website?: string;
  companyDescription: string;
  logoUrl?: string;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const payload = {
    user_id: user.id,
    organization_name: data.businessName,
    bio: data.companyDescription,
    website: data.website || null,
    logo_url: data.logoUrl || null,
    paynow_email: data.businessEmail,
    phone: data.phone || null,
    business_type: data.businessType || null,
    organizer_category: data.organizerCategory || null,
    years_in_business: data.yearsInBusiness || null,
    country: data.country || null,
    city: data.city || null,
    physical_address: data.physicalAddress || null,
    trading_name: data.tradingName || null,
    is_approved: false,
  };

  if (data.organizerId) {
    const { error } = await supabase
      .from('organizer_profiles')
      .update(payload)
      .eq('id', data.organizerId);
    if (error) return { error: error.message };
    return { id: data.organizerId, error: null };
  }

  const { data: inserted, error } = await supabase
    .from('organizer_profiles')
    .insert(payload)
    .select('id')
    .single();
  if (error) return { error: error.message };
  return { id: inserted.id, error: null };
}

export async function saveBankingDetails(
  organizerId: string,
  data: {
    bankName?: string;
    accountName?: string;
    accountNumber?: string;
    branch?: string;
    mobileMoney?: string;
    ecocash?: string;
    paynowMerchantId?: string;
    stripeAccount?: string;
    paypalEmail?: string;
  }
) {
  const supabase = await createClient();
  const { error } = await supabase
    .from('organizer_profiles')
    .update({
      bank_name: data.bankName || null,
      bank_account: data.accountNumber || null,
      account_name: data.accountName || null,
      branch: data.branch || null,
      mobile_money: data.mobileMoney || null,
      ecocash: data.ecocash || null,
      paynow_integration_key: data.paynowMerchantId || null,
      stripe_account: data.stripeAccount || null,
      paypal_email: data.paypalEmail || null,
    })
    .eq('id', organizerId);
  if (error) return { error: error.message };
  return { error: null };
}

export async function completeOnboarding(organizerId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const { error: profileError } = await supabase
    .from('profiles')
    .update({ role: 'organizer' })
    .eq('id', user.id);
  if (profileError) return { error: profileError.message };

  const { error: orgError } = await supabase
    .from('organizer_profiles')
    .update({ is_approved: true })
    .eq('id', organizerId);
  if (orgError) return { error: orgError.message };

  return { error: null };
}

export async function createInitialEvent(
  organizerId: string,
  data: {
    eventName: string;
    category: string;
    venue: string;
    eventDate: string;
    startTime: string;
    endTime: string;
    capacity: string;
    bannerUrl?: string;
    description: string;
  }
) {
  const supabase = await createClient();

  const startsAt = new Date(`${data.eventDate}T${data.startTime}:00`);
  const endsAt = new Date(`${data.eventDate}T${data.endTime}:00`);

  // Map form category value to categories table slug
  const categorySlugMap: Record<string, string> = {
    conference: 'business',
    workshop: 'education',
    concert: 'music',
    sports: 'sports',
    festival: 'music',
    networking: 'business',
    charity: 'charity',
    other: 'other',
  };

  let categoryId: number | null = null;
  const categorySlug = categorySlugMap[data.category] || 'other';
  const { data: category } = await supabase
    .from('categories')
    .select('id')
    .eq('slug', categorySlug)
    .single();
  if (category) categoryId = category.id;

  const { error } = await supabase.from('events').insert({
    title: data.eventName,
    slug: slugify(data.eventName),
    description: data.description,
    category_id: categoryId,
    starts_at: startsAt.toISOString(),
    ends_at: endsAt.toISOString(),
    venue_address: data.venue,
    max_attendees: parseInt(data.capacity) || 0,
    cover_image_url: data.bannerUrl || null,
    organizer_id: organizerId,
    status: 'draft',
  });
  if (error) return { error: error.message };
  return { error: null };
}
