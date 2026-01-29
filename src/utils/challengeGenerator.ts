import challengesPool from '../../challenges-pool.json';
import { Challenge, ChallengeDuration, ChallengePoolEntry } from '../types/meditation';

const DURATION_ORDER: ChallengeDuration[] = ['1', '2', '3', '5', '7', '10'];

/**
 * Get available durations from the challenges pool
 */
export function getAvailableDurations(): ChallengeDuration[] {
  return DURATION_ORDER.filter(
    (dur) => (challengesPool.challenges as Record<string, ChallengePoolEntry[]>)[dur]?.length > 0
  );
}

/**
 * Get nearby durations (±1 step in the order)
 */
export function getNearbyDurations(duration: ChallengeDuration): ChallengeDuration[] {
  const idx = DURATION_ORDER.indexOf(duration);
  const nearby: ChallengeDuration[] = [];
  if (idx > 0) nearby.push(DURATION_ORDER[idx - 1]);
  if (idx < DURATION_ORDER.length - 1) nearby.push(DURATION_ORDER[idx + 1]);
  return nearby;
}

/**
 * Convert pool entry to Challenge with duration
 */
function toChallenge(entry: ChallengePoolEntry, duration: number): Challenge {
  return {
    id: entry.id,
    title: entry.title,
    category: entry.category,
    purpose: entry.purpose,
    duration,
    instructions: entry.instructions,
  };
}

/**
 * Get category info by key
 */
export function getCategoryInfo(categoryKey: string): { name: string; description: string; icon: string } | undefined {
  return (challengesPool.categories as Record<string, { name: string; description: string; icon: string }>)[categoryKey];
}

export interface GenerateOptions {
  duration?: ChallengeDuration;
  excludeIds?: string[];
  category?: string;
}

/**
 * Generate a random challenge from the pool
 */
export function generateRandomChallenge(options?: GenerateOptions): Challenge | null {
  const { duration, excludeIds = [], category } = options || {};

  // Collect candidates
  const candidates: Challenge[] = [];
  const pool = challengesPool.challenges as Record<string, ChallengePoolEntry[]>;

  const durations = duration ? [duration] : DURATION_ORDER;

  for (const dur of durations) {
    const practices = pool[dur] || [];
    for (const practice of practices) {
      if (excludeIds.includes(practice.id)) continue;
      if (category && practice.category !== category) continue;
      candidates.push(toChallenge(practice, parseInt(dur)));
    }
  }

  if (candidates.length === 0) return null;

  // Random selection
  return candidates[Math.floor(Math.random() * candidates.length)];
}

/**
 * Generate a replacement challenge with the same or similar duration
 */
export function generateReplacementChallenge(
  currentChallenge: { id: string; duration: number },
  excludeIds: string[]
): Challenge | null {
  const duration = currentChallenge.duration.toString() as ChallengeDuration;

  // First, try exact duration match
  let replacement = generateRandomChallenge({
    duration,
    excludeIds: [...excludeIds, currentChallenge.id],
  });

  if (replacement) return replacement;

  // If not found, try nearby durations
  const nearbyDurations = getNearbyDurations(duration);
  for (const nearDur of nearbyDurations) {
    replacement = generateRandomChallenge({
      duration: nearDur,
      excludeIds: [...excludeIds, currentChallenge.id],
    });
    if (replacement) return replacement;
  }

  return null;
}

/**
 * Get all available categories
 */
export function getAllCategories(): { key: string; name: string; description: string; icon: string }[] {
  const categories = challengesPool.categories as Record<string, { name: string; description: string; icon: string }>;
  return Object.entries(categories).map(([key, value]) => ({
    key,
    ...value,
  }));
}

/**
 * Get challenge count by duration
 */
export function getChallengeCountByDuration(duration: ChallengeDuration): number {
  const pool = challengesPool.challenges as Record<string, ChallengePoolEntry[]>;
  return pool[duration]?.length || 0;
}
