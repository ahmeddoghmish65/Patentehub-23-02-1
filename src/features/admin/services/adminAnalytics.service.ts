/**
 * Admin Analytics Service — page visit stats.
 */
import * as api from '@/infrastructure/database/api';
import type { VisitStats } from '../types/admin.types';

export async function fetchPageVisitStats(): Promise<VisitStats | null> {
  try {
    const result = await api.apiGetPageVisitStats();
    return result as VisitStats;
  } catch {
    return null;
  }
}
