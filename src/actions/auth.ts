'use server';

import { createClient } from '@/lib/supabase/server';

export async function signUp({
  email,
  password,
  fullName,
  role,
}: {
  email: string;
  password: string;
  fullName: string;
  role: 'attendee' | 'organizer';
}) {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        role,
      },
    },
  });

  if (error) {
    return { data: null, error: error.message };
  }

  return { data, error: null };
}

export async function signIn({
  email,
  password,
}: {
  email: string;
  password: string;
}) {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { data: null, error: error.message };
  }

  // Fetch the user's profile to determine redirect destination
  let role = 'attendee';
  let hasOrganizerProfile = false;
  if (data.user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', data.user.id)
      .single();
    if (profile?.role) {
      role = profile.role;
    }

    // Check if user has an organizer profile (completed onboarding)
    const { data: orgProfile } = await supabase
      .from('organizer_profiles')
      .select('id')
      .eq('user_id', data.user.id)
      .maybeSingle();
    hasOrganizerProfile = !!orgProfile;

    // If user selected organizer during signup (stored in raw_user_meta_data)
    // but hasn't completed onboarding yet, redirect to onboarding
    const intendedRole = data.user.user_metadata?.role;
    if (intendedRole === 'organizer' && !hasOrganizerProfile && role !== 'organizer') {
      role = 'needs_onboarding';
    }
  }

  return { data, error: null, role, hasOrganizerProfile };
}

export async function signOut() {
  const supabase = await createClient();
  const { error } = await supabase.auth.signOut();
  if (error) {
    return { error: error.message };
  }
  return { error: null };
}

export async function resetPassword(email: string) {
  const supabase = await createClient();

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/callback?next=/dashboard/settings`,
  });

  if (error) {
    return { error: error.message };
  }
  return { error: null };
}

export async function updatePassword(newPassword: string) {
  const supabase = await createClient();

  const { error } = await supabase.auth.updateUser({ password: newPassword });

  if (error) {
    return { error: error.message };
  }
  return { error: null };
}
