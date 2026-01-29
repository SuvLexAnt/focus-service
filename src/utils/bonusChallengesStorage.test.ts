import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  loadBonusChallenges,
  saveBonusChallenges,
  addBonusChallenge,
  removeBonusChallenge,
  replaceBonusChallenge,
  toggleBonusChallenge,
  isBonusChallengeCompleted,
  getShownIds,
  getDayChallenges,
  getBonusDayProgress,
  canAddMoreChallenges,
  MAX_BONUS_CHALLENGES,
} from './bonusChallengesStorage';
import { Challenge } from '../types/meditation';

const mockChallenge: Challenge = {
  id: 'test-challenge-1',
  title: 'Test Challenge',
  category: 'breathing',
  purpose: 'Test purpose',
  duration: 5,
  instructions: {
    whatToDo: 'Test what to do',
    focusOn: 'Test focus',
    dontFocusOn: 'Test dont focus',
  },
};

const createChallenge = (id: string): Challenge => ({
  ...mockChallenge,
  id,
});

describe('bonusChallengesStorage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('loadBonusChallenges', () => {
    it('returns empty object when no data', () => {
      const data = loadBonusChallenges();
      expect(data).toEqual({});
    });

    it('returns stored data', () => {
      const testData = {
        'day-1': {
          challenges: [mockChallenge],
          progress: { [mockChallenge.id]: true },
          shownIds: [mockChallenge.id],
        },
      };
      localStorage.setItem('meditation-bonus-challenges', JSON.stringify(testData));

      const data = loadBonusChallenges();
      expect(data).toEqual(testData);
    });

    it('handles corrupted data gracefully', () => {
      localStorage.setItem('meditation-bonus-challenges', 'invalid json');
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const data = loadBonusChallenges();
      expect(data).toEqual({});
      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });
  });

  describe('saveBonusChallenges', () => {
    it('saves data to localStorage', () => {
      const testData = {
        'day-1': {
          challenges: [mockChallenge],
          progress: {},
          shownIds: [],
        },
      };

      saveBonusChallenges(testData);

      const stored = localStorage.getItem('meditation-bonus-challenges');
      expect(stored).toBe(JSON.stringify(testData));
    });
  });

  describe('addBonusChallenge', () => {
    it('adds a challenge to empty day', () => {
      const result = addBonusChallenge('day-1', mockChallenge);

      expect(result).toBe(true);

      const data = loadBonusChallenges();
      expect(data['day-1'].challenges).toHaveLength(1);
      expect(data['day-1'].challenges[0].id).toBe(mockChallenge.id);
      expect(data['day-1'].progress[mockChallenge.id]).toBe(false);
      expect(data['day-1'].shownIds).toContain(mockChallenge.id);
    });

    it('respects max challenges limit', () => {
      // Add max challenges
      for (let i = 0; i < MAX_BONUS_CHALLENGES; i++) {
        addBonusChallenge('day-1', createChallenge(`challenge-${i}`));
      }

      // Try to add one more
      const result = addBonusChallenge('day-1', createChallenge('extra'));
      expect(result).toBe(false);

      const data = loadBonusChallenges();
      expect(data['day-1'].challenges).toHaveLength(MAX_BONUS_CHALLENGES);
    });
  });

  describe('removeBonusChallenge', () => {
    it('removes challenge from day', () => {
      addBonusChallenge('day-1', mockChallenge);
      removeBonusChallenge('day-1', mockChallenge.id);

      const data = loadBonusChallenges();
      expect(data['day-1'].challenges).toHaveLength(0);
      expect(data['day-1'].progress[mockChallenge.id]).toBeUndefined();
      // shownIds should still contain the id
      expect(data['day-1'].shownIds).toContain(mockChallenge.id);
    });

    it('handles non-existent day gracefully', () => {
      expect(() => {
        removeBonusChallenge('day-99', 'nonexistent');
      }).not.toThrow();
    });
  });

  describe('replaceBonusChallenge', () => {
    it('replaces challenge and resets progress', () => {
      addBonusChallenge('day-1', mockChallenge);
      toggleBonusChallenge('day-1', mockChallenge.id); // Mark as completed

      const newChallenge = createChallenge('new-challenge');
      replaceBonusChallenge('day-1', mockChallenge.id, newChallenge);

      const data = loadBonusChallenges();
      expect(data['day-1'].challenges[0].id).toBe(newChallenge.id);
      expect(data['day-1'].progress[mockChallenge.id]).toBeUndefined();
      expect(data['day-1'].progress[newChallenge.id]).toBe(false);
      expect(data['day-1'].shownIds).toContain(newChallenge.id);
    });
  });

  describe('toggleBonusChallenge', () => {
    it('toggles challenge completion', () => {
      addBonusChallenge('day-1', mockChallenge);

      let result = toggleBonusChallenge('day-1', mockChallenge.id);
      expect(result).toBe(true);
      expect(isBonusChallengeCompleted('day-1', mockChallenge.id)).toBe(true);

      result = toggleBonusChallenge('day-1', mockChallenge.id);
      expect(result).toBe(false);
      expect(isBonusChallengeCompleted('day-1', mockChallenge.id)).toBe(false);
    });
  });

  describe('getShownIds', () => {
    it('returns shown IDs for day', () => {
      addBonusChallenge('day-1', mockChallenge);
      const shownIds = getShownIds('day-1');
      expect(shownIds).toContain(mockChallenge.id);
    });

    it('returns empty array for non-existent day', () => {
      const shownIds = getShownIds('day-99');
      expect(shownIds).toEqual([]);
    });
  });

  describe('getDayChallenges', () => {
    it('returns challenges for day', () => {
      addBonusChallenge('day-1', mockChallenge);
      const challenges = getDayChallenges('day-1');
      expect(challenges).toHaveLength(1);
    });

    it('returns empty array for non-existent day', () => {
      const challenges = getDayChallenges('day-99');
      expect(challenges).toEqual([]);
    });
  });

  describe('getBonusDayProgress', () => {
    it('returns correct progress', () => {
      addBonusChallenge('day-1', mockChallenge);
      addBonusChallenge('day-1', createChallenge('challenge-2'));
      toggleBonusChallenge('day-1', mockChallenge.id);

      const progress = getBonusDayProgress('day-1');
      expect(progress).toEqual({ completed: 1, total: 2 });
    });

    it('returns zeros for non-existent day', () => {
      const progress = getBonusDayProgress('day-99');
      expect(progress).toEqual({ completed: 0, total: 0 });
    });
  });

  describe('canAddMoreChallenges', () => {
    it('returns true when under limit', () => {
      expect(canAddMoreChallenges('day-1')).toBe(true);

      addBonusChallenge('day-1', mockChallenge);
      expect(canAddMoreChallenges('day-1')).toBe(true);
    });

    it('returns false when at limit', () => {
      for (let i = 0; i < MAX_BONUS_CHALLENGES; i++) {
        addBonusChallenge('day-1', createChallenge(`challenge-${i}`));
      }

      expect(canAddMoreChallenges('day-1')).toBe(false);
    });
  });
});
