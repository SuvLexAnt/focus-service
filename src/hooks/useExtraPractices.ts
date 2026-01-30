import { useState, useCallback, useEffect } from 'react';
import { Practice, PracticeDuration } from '../types/meditation';
import {
  loadExtraPractices,
  addBonusPractice as addBonusPracticeStorage,
  removeBonusPractice as removeBonusPracticeStorage,
  replaceBonusPractice as replaceBonusPracticeStorage,
  toggleBonusPractice as toggleBonusPracticeStorage,
  setReplacement as setReplacementStorage,
  getDayReplacements,
  getShownIds,
  canAddMoreBonusPractices,
  MAX_BONUS_PRACTICES,
} from '../utils/extraPracticesStorage';
import { generateRandomPractice, generateReplacementPractice } from '../utils/practiceGenerator';

export interface UseExtraPracticesReturn {
  // Bonus practices
  bonusPractices: Practice[];
  bonusProgress: { [id: string]: boolean };
  canAddMore: boolean;
  maxBonusPractices: number;
  addBonusPractice: (duration?: PracticeDuration) => Practice | null;
  replaceBonusPractice: (practiceId: string) => Practice | null;
  removeBonusPractice: (practiceId: string) => void;
  toggleBonusPractice: (practiceId: string) => boolean;
  isBonusPracticeCompleted: (practiceId: string) => boolean;
  getBonusProgress: () => { completed: number; total: number };

  // Replacements for program practices
  replacements: { [practiceId: string]: Practice };
  replaceWithPractice: (practice: Practice) => Practice | null;
  getReplacement: (practiceId: string) => Practice | null;
}

export function useExtraPractices(dayId: string): UseExtraPracticesReturn {
  const [bonusPractices, setBonusPractices] = useState<Practice[]>([]);
  const [bonusProgress, setBonusProgress] = useState<{ [id: string]: boolean }>({});
  const [replacements, setReplacements] = useState<{ [practiceId: string]: Practice }>({});
  const [canAddMore, setCanAddMore] = useState(true);

  // Load data on mount and dayId change
  useEffect(() => {
    const data = loadExtraPractices();
    const dayData = data[dayId] || { bonusPractices: [], replacements: {}, progress: {}, shownIds: [] };
    setBonusPractices(dayData.bonusPractices);
    setBonusProgress(dayData.progress);
    setReplacements(dayData.replacements);
    setCanAddMore(canAddMoreBonusPractices(dayId));
  }, [dayId]);

  // Refresh state from storage
  const refreshState = useCallback(() => {
    const data = loadExtraPractices();
    const dayData = data[dayId] || { bonusPractices: [], replacements: {}, progress: {}, shownIds: [] };
    setBonusPractices(dayData.bonusPractices);
    setBonusProgress(dayData.progress);
    setReplacements(dayData.replacements);
    setCanAddMore(canAddMoreBonusPractices(dayId));
  }, [dayId]);

  // ============ Bonus Practices ============

  const addBonusPractice = useCallback(
    (duration?: PracticeDuration) => {
      const shownIds = getShownIds(dayId);
      const practice = generateRandomPractice({
        duration,
        excludeIds: shownIds,
      });

      if (practice) {
        const success = addBonusPracticeStorage(dayId, practice);
        if (success) {
          refreshState();
          return practice;
        }
      }
      return null;
    },
    [dayId, refreshState]
  );

  const replaceBonusPractice = useCallback(
    (practiceId: string) => {
      const currentPractice = bonusPractices.find((p) => p.id === practiceId);
      if (!currentPractice) return null;

      // Don't replace completed practices
      if (bonusProgress[practiceId]) return null;

      const shownIds = getShownIds(dayId);
      const replacement = generateReplacementPractice(currentPractice, shownIds);

      if (replacement) {
        replaceBonusPracticeStorage(dayId, practiceId, replacement);
        refreshState();
        return replacement;
      }
      return null;
    },
    [dayId, bonusPractices, bonusProgress, refreshState]
  );

  const removeBonusPractice = useCallback(
    (practiceId: string) => {
      removeBonusPracticeStorage(dayId, practiceId);
      refreshState();
    },
    [dayId, refreshState]
  );

  const toggleBonusPractice = useCallback(
    (practiceId: string) => {
      const newValue = toggleBonusPracticeStorage(dayId, practiceId);
      refreshState();
      return newValue;
    },
    [dayId, refreshState]
  );

  const isBonusPracticeCompleted = useCallback(
    (practiceId: string) => {
      return bonusProgress[practiceId] || false;
    },
    [bonusProgress]
  );

  const getBonusProgress = useCallback(() => {
    const completed = Object.values(bonusProgress).filter(Boolean).length;
    return { completed, total: bonusPractices.length };
  }, [bonusProgress, bonusPractices]);

  // ============ Replacements ============

  const getExcludeIds = useCallback((): string[] => {
    return getShownIds(dayId);
  }, [dayId]);

  const replaceWithPractice = useCallback(
    (practice: Practice): Practice | null => {
      const excludeIds = getExcludeIds();

      // If already replaced, add current replacement to exclude list
      const currentReplacement = replacements[practice.id];
      if (currentReplacement) {
        excludeIds.push(currentReplacement.id);
      }

      const newPractice = generateReplacementPractice(
        { id: practice.id, duration: practice.duration },
        excludeIds
      );

      if (newPractice) {
        setReplacementStorage(dayId, practice.id, newPractice);
        setReplacements((prev) => ({
          ...prev,
          [practice.id]: newPractice,
        }));
      }

      return newPractice;
    },
    [dayId, replacements, getExcludeIds]
  );

  const getReplacement = useCallback(
    (practiceId: string): Practice | null => {
      return replacements[practiceId] || null;
    },
    [replacements]
  );

  return {
    // Bonus practices
    bonusPractices,
    bonusProgress,
    canAddMore,
    maxBonusPractices: MAX_BONUS_PRACTICES,
    addBonusPractice,
    replaceBonusPractice,
    removeBonusPractice,
    toggleBonusPractice,
    isBonusPracticeCompleted,
    getBonusProgress,

    // Replacements
    replacements,
    replaceWithPractice,
    getReplacement,
  };
}
