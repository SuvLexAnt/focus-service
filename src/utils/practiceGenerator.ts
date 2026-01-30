import practicesPool from '../../challenges-pool.json';
import { Practice, PracticeDuration, PracticePoolEntry, PracticeCategory } from '../types/meditation';

const DURATION_ORDER: PracticeDuration[] = ['1', '2', '3', '5', '7', '10'];

/**
 * Get available durations from the practices pool
 */
export function getAvailableDurations(): PracticeDuration[] {
  return DURATION_ORDER.filter(
    (dur) => (practicesPool.challenges as Record<string, PracticePoolEntry[]>)[dur]?.length > 0
  );
}

/**
 * Get nearby durations (±1 step in the order)
 */
export function getNearbyDurations(duration: PracticeDuration): PracticeDuration[] {
  const idx = DURATION_ORDER.indexOf(duration);
  const nearby: PracticeDuration[] = [];
  if (idx > 0) nearby.push(DURATION_ORDER[idx - 1]);
  if (idx < DURATION_ORDER.length - 1) nearby.push(DURATION_ORDER[idx + 1]);
  return nearby;
}

/**
 * Convert pool entry to Practice with duration
 */
function toPractice(entry: PracticePoolEntry, duration: number): Practice {
  return {
    id: entry.id,
    title: entry.title,
    category: entry.category as PracticeCategory,
    purpose: entry.purpose,
    duration,
    instructions: entry.instructions,
    isFromProgram: false,
  };
}

/**
 * Get category info by key
 */
export function getCategoryInfo(categoryKey: string): { name: string; description: string; icon: string } | undefined {
  return (practicesPool.categories as Record<string, { name: string; description: string; icon: string }>)[categoryKey];
}

export interface GenerateOptions {
  duration?: PracticeDuration;
  excludeIds?: string[];
  category?: string;
}

/**
 * Generate a random practice from the pool
 */
export function generateRandomPractice(options?: GenerateOptions): Practice | null {
  const { duration, excludeIds = [], category } = options || {};

  // Collect candidates
  const candidates: Practice[] = [];
  const pool = practicesPool.challenges as Record<string, PracticePoolEntry[]>;

  const durations = duration ? [duration] : DURATION_ORDER;

  for (const dur of durations) {
    const practices = pool[dur] || [];
    for (const practice of practices) {
      if (excludeIds.includes(practice.id)) continue;
      if (category && practice.category !== category) continue;
      candidates.push(toPractice(practice, parseInt(dur)));
    }
  }

  if (candidates.length === 0) return null;

  // Random selection
  return candidates[Math.floor(Math.random() * candidates.length)];
}

/**
 * Generate a replacement practice with the same or similar duration
 */
export function generateReplacementPractice(
  currentPractice: { id: string; duration: number },
  excludeIds: string[]
): Practice | null {
  const duration = currentPractice.duration.toString() as PracticeDuration;

  // First, try exact duration match
  let replacement = generateRandomPractice({
    duration,
    excludeIds: [...excludeIds, currentPractice.id],
  });

  if (replacement) return replacement;

  // If not found, try nearby durations
  const nearbyDurations = getNearbyDurations(duration);
  for (const nearDur of nearbyDurations) {
    replacement = generateRandomPractice({
      duration: nearDur,
      excludeIds: [...excludeIds, currentPractice.id],
    });
    if (replacement) return replacement;
  }

  return null;
}

/**
 * Get all available categories
 */
export function getAllCategories(): { key: string; name: string; description: string; icon: string }[] {
  const categories = practicesPool.categories as Record<string, { name: string; description: string; icon: string }>;
  return Object.entries(categories).map(([key, value]) => ({
    key,
    ...value,
  }));
}

/**
 * Get practice count by duration
 */
export function getPracticeCountByDuration(duration: PracticeDuration): number {
  const pool = practicesPool.challenges as Record<string, PracticePoolEntry[]>;
  return pool[duration]?.length || 0;
}

// Legacy exports for backward compatibility
/** @deprecated Use generateRandomPractice instead */
export const generateRandomChallenge = generateRandomPractice;
/** @deprecated Use generateReplacementPractice instead */
export const generateReplacementChallenge = generateReplacementPractice;
/** @deprecated Use getPracticeCountByDuration instead */
export const getChallengeCountByDuration = getPracticeCountByDuration;
