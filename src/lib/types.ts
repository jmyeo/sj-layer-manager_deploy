export type UserRole = 'Admin' | 'Manager' | 'Consultant' | 'Farm User';
export type CustomerStatus = 'Active' | 'Inactive';
export type FlockStatus = 'Active' | 'Completed' | 'Culled';

export interface Profile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  region: string | null;
  created_at: string;
}

export interface UserCustomer {
  user_id: string;
  customer_id: number;
}

export interface AuditLog {
  id: number;
  user_id: string | null;
  user_email: string | null;
  table_name: string;
  record_id: number;
  action: 'INSERT' | 'UPDATE' | 'DELETE';
  old_data: Record<string, unknown> | null;
  new_data: Record<string, unknown> | null;
  created_at: string;
}

export interface Customer {
  id: number;
  customer_name: string;
  farm_name: string;
  region: string | null;
  contact_name: string | null;
  contact_phone: string | null;
  status: CustomerStatus;
  created_at: string;
}

export interface Flock {
  id: number;
  customer_id: number;
  flock_name: string | null;
  breed: string;
  placement_date: string;
  initial_birds: number;
  status: FlockStatus;
  created_at: string;
  customer?: Customer;
}

export interface DailyRecord {
  id: number;
  flock_id: number;
  record_date: string;
  previous_birds: number;
  mortality: number;
  current_birds: number;
  feed_kg: number;
  egg_count: number;
  hd_ratio: number | null;
  hh_ratio: number | null;
  avg_feed_g: number | null;
  memo: string | null;
  created_by: string | null;
  created_at: string;
}

export interface DailyRecordInput {
  flock_id: number;
  record_date: string;
  previous_birds: number;
  mortality: number;
  feed_kg: number;
  egg_count: number;
  memo: string;
}

export function calculateDailyMetrics(
  input: DailyRecordInput,
  initialBirds: number
) {
  const currentBirds = input.previous_birds - input.mortality;
  const hdRatio = currentBirds > 0
    ? (input.egg_count / currentBirds) * 100
    : 0;
  const hhRatio = initialBirds > 0
    ? (input.egg_count / initialBirds) * 100
    : 0;
  const avgFeedG = currentBirds > 0
    ? (input.feed_kg * 1000) / currentBirds
    : 0;

  return {
    current_birds: currentBirds,
    hd_ratio: Math.round(hdRatio * 100) / 100,
    hh_ratio: Math.round(hhRatio * 100) / 100,
    avg_feed_g: Math.round(avgFeedG * 100) / 100,
  };
}

export function getWeekAge(placementDate: string): number {
  const placed = new Date(placementDate);
  const now = new Date();
  const diffMs = now.getTime() - placed.getTime();
  return Math.floor(diffMs / (7 * 24 * 60 * 60 * 1000));
}
