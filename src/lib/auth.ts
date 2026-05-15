import { SupabaseClient } from '@supabase/supabase-js';
import type { Profile, UserRole } from './types';

export async function getUserProfile(supabase: SupabaseClient): Promise<Profile | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  return profile as Profile | null;
}

export async function getAssignedCustomerIds(
  supabase: SupabaseClient,
  userId: string
): Promise<number[]> {
  const { data } = await supabase
    .from('user_customers')
    .select('customer_id')
    .eq('user_id', userId);

  return (data ?? []).map((r: { customer_id: number }) => r.customer_id);
}

export function canViewAllCustomers(role: UserRole): boolean {
  return role === 'Admin';
}

export function canViewByRegion(role: UserRole): boolean {
  return role === 'Manager' || role === 'Consultant';
}

export function canEditData(role: UserRole): boolean {
  return role === 'Admin' || role === 'Manager' || role === 'Farm User';
}

export function canAccessAdmin(role: UserRole): boolean {
  return role === 'Admin';
}

/**
 * Filter customer query based on user role:
 * - Admin: no filter (sees all)
 * - Manager/Consultant: filter by region
 * - Farm User: filter by assigned customer IDs
 */
export async function buildCustomerFilter(
  supabase: SupabaseClient,
  profile: Profile
): Promise<{ mode: 'all' } | { mode: 'region'; region: string } | { mode: 'ids'; ids: number[] }> {
  if (canViewAllCustomers(profile.role)) {
    return { mode: 'all' };
  }

  if (canViewByRegion(profile.role)) {
    return { mode: 'region', region: (profile as Profile & { region?: string }).region ?? '' };
  }

  // Farm User
  const ids = await getAssignedCustomerIds(supabase, profile.id);
  return { mode: 'ids', ids };
}
