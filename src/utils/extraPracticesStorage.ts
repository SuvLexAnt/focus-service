import { ExtraPracticesData, DayExtraPracticesData, Practice, BonusChallengesData } from '../types/meditation';

const STORAGE_KEY = 'meditation-extra-practices';
const LEGACY_BONUS_KEY = 'meditation-bonus-challenges';
const LEGACY_REPLACEMENTS_KEY = 'meditation-replacements';
const MAX_BONUS_PRACTICES_PER_DAY = 5;

/**
 * Get empty day data structure
 */
function getEmptyDayData(): DayExtraPracticesData {
  return {
    bonusPractices: [],
    replacements: {},
    progress: {},
    shownIds: [],
  };
}

/**
 * Migrate legacy data to new unified format
 */
function migrateLegacyData(): ExtraPracticesData | null {
  try {
    const legacyBonus = localStorage.getItem(LEGACY_BONUS_KEY);
    const legacyReplacements = localStorage.getItem(LEGACY_REPLACEMENTS_KEY);

    if (!legacyBonus && !legacyReplacements) {
      return null;
    }

    const migrated: ExtraPracticesData = {};

    // Migrate bonus challenges
    if (legacyBonus) {
      const bonusData: BonusChallengesData = JSON.parse(legacyBonus);
      for (const [dayId, dayData] of Object.entries(bonusData)) {
        if (!migrated[dayId]) {
          migrated[dayId] = getEmptyDayData();
        }
        migrated[dayId].bonusPractices = dayData.challenges || [];
        migrated[dayId].shownIds = [...(migrated[dayId].shownIds || []), ...(dayData.shownIds || [])];
        // Migrate progress for bonus practices
        for (const [practiceId, completed] of Object.entries(dayData.progress || {})) {
          migrated[dayId].progress[practiceId] = completed;
        }
      }
    }

    // Migrate replacements
    if (legacyReplacements) {
      const replacementsData = JSON.parse(legacyReplacements);
      if (replacementsData.days) {
        for (const [dayId, dayReplacements] of Object.entries(replacementsData.days)) {
          if (!migrated[dayId]) {
            migrated[dayId] = getEmptyDayData();
          }
          migrated[dayId].replacements = dayReplacements as { [key: string]: Practice };
        }
        // Add replacement shown IDs
        if (replacementsData.shownIds) {
          for (const dayId of Object.keys(migrated)) {
            migrated[dayId].shownIds = [
              ...new Set([...(migrated[dayId].shownIds || []), ...replacementsData.shownIds])
            ];
          }
        }
      }
    }

    // Clean up legacy storage
    localStorage.removeItem(LEGACY_BONUS_KEY);
    localStorage.removeItem(LEGACY_REPLACEMENTS_KEY);

    return migrated;
  } catch (error) {
    console.error('Failed to migrate legacy data:', error);
    return null;
  }
}

/**
 * Load extra practices data from localStorage
 */
export function loadExtraPractices(): ExtraPracticesData {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      return JSON.parse(data);
    }

    // Try migrating legacy data
    const migrated = migrateLegacyData();
    if (migrated) {
      saveExtraPractices(migrated);
      return migrated;
    }
  } catch (error) {
    console.error('Failed to load extra practices:', error);
  }
  return {};
}

/**
 * Save extra practices data to localStorage
 */
export function saveExtraPractices(data: ExtraPracticesData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Failed to save extra practices:', error);
  }
}

/**
 * Get day data, initializing if needed
 */
function getDayData(data: ExtraPracticesData, dayId: string): DayExtraPracticesData {
  if (!data[dayId]) {
    data[dayId] = getEmptyDayData();
  }
  return data[dayId];
}

// ============ Bonus Practices ============

/**
 * Add a new bonus practice to a day
 */
export function addBonusPractice(dayId: string, practice: Practice): boolean {
  const data = loadExtraPractices();
  const dayData = getDayData(data, dayId);

  if (dayData.bonusPractices.length >= MAX_BONUS_PRACTICES_PER_DAY) {
    return false;
  }

  dayData.bonusPractices.push(practice);
  dayData.shownIds.push(practice.id);
  dayData.progress[practice.id] = false;

  saveExtraPractices(data);
  return true;
}

/**
 * Remove a bonus practice from a day
 */
export function removeBonusPractice(dayId: string, practiceId: string): void {
  const data = loadExtraPractices();
  const dayData = data[dayId];

  if (!dayData) return;

  dayData.bonusPractices = dayData.bonusPractices.filter((p) => p.id !== practiceId);
  delete dayData.progress[practiceId];

  saveExtraPractices(data);
}

/**
 * Replace a bonus practice with a new one
 */
export function replaceBonusPractice(dayId: string, oldPracticeId: string, newPractice: Practice): void {
  const data = loadExtraPractices();
  const dayData = data[dayId];

  if (!dayData) return;

  const index = dayData.bonusPractices.findIndex((p) => p.id === oldPracticeId);
  if (index === -1) return;

  dayData.bonusPractices[index] = newPractice;
  delete dayData.progress[oldPracticeId];
  dayData.progress[newPractice.id] = false;

  if (!dayData.shownIds.includes(newPractice.id)) {
    dayData.shownIds.push(newPractice.id);
  }

  saveExtraPractices(data);
}

/**
 * Get bonus practices for a day
 */
export function getDayBonusPractices(dayId: string): Practice[] {
  const data = loadExtraPractices();
  return data[dayId]?.bonusPractices || [];
}

/**
 * Check if can add more bonus practices to a day
 */
export function canAddMoreBonusPractices(dayId: string): boolean {
  const data = loadExtraPractices();
  const dayData = data[dayId];
  if (!dayData) return true;
  return dayData.bonusPractices.length < MAX_BONUS_PRACTICES_PER_DAY;
}

// ============ Replacements ============

/**
 * Set replacement for a program practice
 */
export function setReplacement(dayId: string, originalPracticeId: string, replacement: Practice): void {
  const data = loadExtraPractices();
  const dayData = getDayData(data, dayId);

  dayData.replacements[originalPracticeId] = replacement;

  if (!dayData.shownIds.includes(replacement.id)) {
    dayData.shownIds.push(replacement.id);
  }

  saveExtraPractices(data);
}

/**
 * Get replacement for a practice
 */
export function getReplacement(dayId: string, practiceId: string): Practice | null {
  const data = loadExtraPractices();
  return data[dayId]?.replacements[practiceId] || null;
}

/**
 * Get all replacements for a day
 */
export function getDayReplacements(dayId: string): { [practiceId: string]: Practice } {
  const data = loadExtraPractices();
  return data[dayId]?.replacements || {};
}

/**
 * Remove replacement (restore original practice)
 */
export function removeReplacement(dayId: string, practiceId: string): void {
  const data = loadExtraPractices();
  const dayData = data[dayId];

  if (dayData?.replacements) {
    delete dayData.replacements[practiceId];
    saveExtraPractices(data);
  }
}

// ============ Progress ============

/**
 * Toggle completion status of a bonus practice
 */
export function toggleBonusPractice(dayId: string, practiceId: string): boolean {
  const data = loadExtraPractices();
  const dayData = data[dayId];

  if (!dayData) return false;

  const newValue = !dayData.progress[practiceId];
  dayData.progress[practiceId] = newValue;

  saveExtraPractices(data);
  return newValue;
}

/**
 * Check if a bonus practice is completed
 */
export function isBonusPracticeCompleted(dayId: string, practiceId: string): boolean {
  const data = loadExtraPractices();
  return data[dayId]?.progress[practiceId] || false;
}

/**
 * Get bonus practices progress for a day
 */
export function getBonusPracticesProgress(dayId: string): { completed: number; total: number } {
  const data = loadExtraPractices();
  const dayData = data[dayId];

  if (!dayData) {
    return { completed: 0, total: 0 };
  }

  const completed = Object.values(dayData.progress).filter(Boolean).length;
  return { completed, total: dayData.bonusPractices.length };
}

// ============ Shown IDs ============

/**
 * Get all shown practice IDs for a day (to exclude from new practice generation)
 */
export function getShownIds(dayId: string): string[] {
  const data = loadExtraPractices();
  return data[dayId]?.shownIds || [];
}

/**
 * Get all shown IDs across all days
 */
export function getAllShownIds(): string[] {
  const data = loadExtraPractices();
  const allIds: Set<string> = new Set();

  for (const dayData of Object.values(data)) {
    for (const id of dayData.shownIds) {
      allIds.add(id);
    }
  }

  return [...allIds];
}

// Export constants
export const MAX_BONUS_PRACTICES = MAX_BONUS_PRACTICES_PER_DAY;
