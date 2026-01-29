import { useState, useCallback, useEffect } from 'react';
import { Challenge, Practice } from '../types/meditation';
import {
  getDayReplacements,
  setReplacement,
  getReplacementShownIds,
} from '../utils/practiceReplacementsStorage';
import { generateReplacementChallenge } from '../utils/challengeGenerator';
import { getShownIds as getBonusShownIds } from '../utils/bonusChallengesStorage';

interface UsePracticeReplacementsReturn {
  replacements: { [practiceId: string]: Challenge };
  replaceWithChallenge: (practice: Practice) => Challenge | null;
  getReplacement: (practiceId: string) => Challenge | null;
}

/**
 * Parse duration string like "5 минут" or "10 мин" to number
 */
function parseDuration(durationStr: string): number {
  const match = durationStr.match(/(\d+)/);
  return match ? parseInt(match[1], 10) : 5;
}

export function usePracticeReplacements(dayId: string): UsePracticeReplacementsReturn {
  const [replacements, setReplacements] = useState<{ [practiceId: string]: Challenge }>({});

  // Load replacements on mount and when dayId changes
  useEffect(() => {
    const dayReplacements = getDayReplacements(dayId);
    setReplacements(dayReplacements);
  }, [dayId]);

  // Get all exclude IDs (from replacements history and bonus challenges)
  const getExcludeIds = useCallback((): string[] => {
    const replacementIds = getReplacementShownIds();
    const bonusIds = getBonusShownIds(dayId);
    return [...replacementIds, ...bonusIds];
  }, [dayId]);

  const replaceWithChallenge = useCallback(
    (practice: Practice): Challenge | null => {
      const duration = parseDuration(practice.duration);
      const excludeIds = getExcludeIds();

      // If already replaced, add current replacement to exclude list
      const currentReplacement = replacements[practice.id];
      if (currentReplacement) {
        excludeIds.push(currentReplacement.id);
      }

      const newChallenge = generateReplacementChallenge(
        { id: practice.id, duration },
        excludeIds
      );

      if (newChallenge) {
        setReplacement(dayId, practice.id, newChallenge);
        setReplacements((prev) => ({
          ...prev,
          [practice.id]: newChallenge,
        }));
      }

      return newChallenge;
    },
    [dayId, replacements, getExcludeIds]
  );

  const getReplacement = useCallback(
    (practiceId: string): Challenge | null => {
      return replacements[practiceId] || null;
    },
    [replacements]
  );

  return {
    replacements,
    replaceWithChallenge,
    getReplacement,
  };
}
