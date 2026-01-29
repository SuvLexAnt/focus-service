import { useState, useCallback, useEffect } from 'react';
import { Challenge, ChallengeDuration } from '../types/meditation';
import {
  loadBonusChallenges,
  addBonusChallenge as addBonusChallengeStorage,
  removeBonusChallenge as removeBonusChallengeStorage,
  replaceBonusChallenge as replaceBonusChallengeStorage,
  toggleBonusChallenge as toggleBonusChallengeStorage,
  getShownIds,
  canAddMoreChallenges,
  MAX_BONUS_CHALLENGES,
} from '../utils/bonusChallengesStorage';
import { generateRandomChallenge, generateReplacementChallenge } from '../utils/challengeGenerator';

export function useBonusChallenges(dayId: string) {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [progress, setProgress] = useState<{ [id: string]: boolean }>({});
  const [canAddMore, setCanAddMore] = useState(true);

  // Load data on mount and dayId change
  useEffect(() => {
    const data = loadBonusChallenges();
    const dayData = data[dayId] || { challenges: [], progress: {}, shownIds: [] };
    setChallenges(dayData.challenges);
    setProgress(dayData.progress);
    setCanAddMore(canAddMoreChallenges(dayId));
  }, [dayId]);

  // Refresh state from storage
  const refreshState = useCallback(() => {
    const data = loadBonusChallenges();
    const dayData = data[dayId] || { challenges: [], progress: {}, shownIds: [] };
    setChallenges(dayData.challenges);
    setProgress(dayData.progress);
    setCanAddMore(canAddMoreChallenges(dayId));
  }, [dayId]);

  // Add a new random challenge
  const addChallenge = useCallback(
    (duration?: ChallengeDuration) => {
      const shownIds = getShownIds(dayId);
      const challenge = generateRandomChallenge({
        duration,
        excludeIds: shownIds,
      });

      if (challenge) {
        const success = addBonusChallengeStorage(dayId, challenge);
        if (success) {
          refreshState();
          return challenge;
        }
      }
      return null;
    },
    [dayId, refreshState]
  );

  // Replace an existing challenge
  const replaceChallenge = useCallback(
    (challengeId: string) => {
      const currentChallenge = challenges.find((c) => c.id === challengeId);
      if (!currentChallenge) return null;

      // Don't replace completed challenges
      if (progress[challengeId]) return null;

      const shownIds = getShownIds(dayId);
      const replacement = generateReplacementChallenge(currentChallenge, shownIds);

      if (replacement) {
        replaceBonusChallengeStorage(dayId, challengeId, replacement);
        refreshState();
        return replacement;
      }
      return null;
    },
    [dayId, challenges, progress, refreshState]
  );

  // Remove a challenge
  const removeChallenge = useCallback(
    (challengeId: string) => {
      removeBonusChallengeStorage(dayId, challengeId);
      refreshState();
    },
    [dayId, refreshState]
  );

  // Toggle challenge completion
  const toggleChallenge = useCallback(
    (challengeId: string) => {
      const newValue = toggleBonusChallengeStorage(dayId, challengeId);
      refreshState();
      return newValue;
    },
    [dayId, refreshState]
  );

  // Check if a specific challenge is completed
  const isChallengeCompleted = useCallback(
    (challengeId: string) => {
      return progress[challengeId] || false;
    },
    [progress]
  );

  // Get progress stats
  const getProgress = useCallback(() => {
    const completed = Object.values(progress).filter(Boolean).length;
    return { completed, total: challenges.length };
  }, [progress, challenges]);

  return {
    challenges,
    progress,
    canAddMore,
    maxChallenges: MAX_BONUS_CHALLENGES,
    addChallenge,
    replaceChallenge,
    removeChallenge,
    toggleChallenge,
    isChallengeCompleted,
    getProgress,
  };
}
