import { BonusChallengesData, BonusChallengesDayData, Challenge } from '../types/meditation';

const STORAGE_KEY = 'meditation-bonus-challenges';
const MAX_CHALLENGES_PER_DAY = 5;

/**
 * Load bonus challenges data from localStorage
 */
export function loadBonusChallenges(): BonusChallengesData {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Failed to load bonus challenges:', error);
  }
  return {};
}

/**
 * Save bonus challenges data to localStorage
 */
export function saveBonusChallenges(data: BonusChallengesData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Failed to save bonus challenges:', error);
  }
}

/**
 * Get day data, initializing if needed
 */
function getDayData(data: BonusChallengesData, dayId: string): BonusChallengesDayData {
  if (!data[dayId]) {
    data[dayId] = {
      challenges: [],
      progress: {},
      shownIds: [],
    };
  }
  return data[dayId];
}

/**
 * Add a new bonus challenge to a day
 */
export function addBonusChallenge(dayId: string, challenge: Challenge): boolean {
  const data = loadBonusChallenges();
  const dayData = getDayData(data, dayId);

  // Check max limit
  if (dayData.challenges.length >= MAX_CHALLENGES_PER_DAY) {
    return false;
  }

  dayData.challenges.push(challenge);
  dayData.shownIds.push(challenge.id);
  dayData.progress[challenge.id] = false;

  saveBonusChallenges(data);
  return true;
}

/**
 * Remove a bonus challenge from a day
 */
export function removeBonusChallenge(dayId: string, challengeId: string): void {
  const data = loadBonusChallenges();
  const dayData = data[dayId];

  if (!dayData) return;

  dayData.challenges = dayData.challenges.filter((c) => c.id !== challengeId);
  delete dayData.progress[challengeId];
  // Note: we keep shownIds to avoid showing the same challenge again

  saveBonusChallenges(data);
}

/**
 * Replace a bonus challenge with a new one
 */
export function replaceBonusChallenge(dayId: string, oldChallengeId: string, newChallenge: Challenge): void {
  const data = loadBonusChallenges();
  const dayData = data[dayId];

  if (!dayData) return;

  const index = dayData.challenges.findIndex((c) => c.id === oldChallengeId);
  if (index === -1) return;

  // Replace the challenge
  dayData.challenges[index] = newChallenge;

  // Update progress (reset to uncompleted)
  delete dayData.progress[oldChallengeId];
  dayData.progress[newChallenge.id] = false;

  // Add to shown IDs
  if (!dayData.shownIds.includes(newChallenge.id)) {
    dayData.shownIds.push(newChallenge.id);
  }

  saveBonusChallenges(data);
}

/**
 * Toggle completion status of a bonus challenge
 */
export function toggleBonusChallenge(dayId: string, challengeId: string): boolean {
  const data = loadBonusChallenges();
  const dayData = data[dayId];

  if (!dayData) return false;

  const newValue = !dayData.progress[challengeId];
  dayData.progress[challengeId] = newValue;

  saveBonusChallenges(data);
  return newValue;
}

/**
 * Check if a bonus challenge is completed
 */
export function isBonusChallengeCompleted(dayId: string, challengeId: string): boolean {
  const data = loadBonusChallenges();
  return data[dayId]?.progress[challengeId] || false;
}

/**
 * Get all shown IDs for a day (to exclude from new challenge generation)
 */
export function getShownIds(dayId: string): string[] {
  const data = loadBonusChallenges();
  return data[dayId]?.shownIds || [];
}

/**
 * Get challenges for a day
 */
export function getDayChallenges(dayId: string): Challenge[] {
  const data = loadBonusChallenges();
  return data[dayId]?.challenges || [];
}

/**
 * Get day progress for bonus challenges
 */
export function getBonusDayProgress(dayId: string): { completed: number; total: number } {
  const data = loadBonusChallenges();
  const dayData = data[dayId];

  if (!dayData) {
    return { completed: 0, total: 0 };
  }

  const completed = Object.values(dayData.progress).filter(Boolean).length;
  return { completed, total: dayData.challenges.length };
}

/**
 * Check if can add more challenges to a day
 */
export function canAddMoreChallenges(dayId: string): boolean {
  const data = loadBonusChallenges();
  const dayData = data[dayId];
  if (!dayData) return true;
  return dayData.challenges.length < MAX_CHALLENGES_PER_DAY;
}

export const MAX_BONUS_CHALLENGES = MAX_CHALLENGES_PER_DAY;
