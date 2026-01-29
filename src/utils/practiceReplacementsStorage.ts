import { Challenge } from '../types/meditation';

const STORAGE_KEY = 'meditation-replacements';

export interface DayReplacementsData {
  [originalPracticeId: string]: Challenge;
}

export interface ReplacementsData {
  days: {
    [dayId: string]: DayReplacementsData;
  };
  shownIds: string[];
}

function getEmptyData(): ReplacementsData {
  return { days: {}, shownIds: [] };
}

/**
 * Load replacements data from localStorage
 */
export function loadReplacements(): ReplacementsData {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      const parsed = JSON.parse(data);
      // Handle migration from old format
      if (!parsed.days) {
        return getEmptyData();
      }
      return parsed;
    }
  } catch (error) {
    console.error('Failed to load practice replacements:', error);
  }
  return getEmptyData();
}

/**
 * Save replacements data to localStorage
 */
export function saveReplacements(data: ReplacementsData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Failed to save practice replacements:', error);
  }
}

/**
 * Get all shown IDs (to exclude from new challenge generation)
 */
export function getReplacementShownIds(): string[] {
  const data = loadReplacements();
  return data.shownIds;
}

/**
 * Get replacement for a practice
 */
export function getReplacement(dayId: string, practiceId: string): Challenge | null {
  const data = loadReplacements();
  return data.days[dayId]?.[practiceId] || null;
}

/**
 * Set replacement for a practice
 */
export function setReplacement(dayId: string, practiceId: string, challenge: Challenge): void {
  const data = loadReplacements();

  if (!data.days[dayId]) {
    data.days[dayId] = {};
  }

  data.days[dayId][practiceId] = challenge;

  // Track shown IDs
  if (!data.shownIds.includes(challenge.id)) {
    data.shownIds.push(challenge.id);
  }

  saveReplacements(data);
}

/**
 * Remove replacement for a practice (restore original)
 */
export function removeReplacement(dayId: string, practiceId: string): void {
  const data = loadReplacements();

  if (data.days[dayId]) {
    delete data.days[dayId][practiceId];

    // Clean up empty day objects
    if (Object.keys(data.days[dayId]).length === 0) {
      delete data.days[dayId];
    }
  }

  saveReplacements(data);
}

/**
 * Get all replacements for a day
 */
export function getDayReplacements(dayId: string): DayReplacementsData {
  const data = loadReplacements();
  return data.days[dayId] || {};
}
