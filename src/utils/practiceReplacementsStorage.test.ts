import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  loadReplacements,
  saveReplacements,
  getReplacementShownIds,
  getReplacement,
  setReplacement,
  removeReplacement,
  getDayReplacements,
} from './practiceReplacementsStorage';
import { Challenge } from '../types/meditation';

const mockChallenge: Challenge = {
  id: 'replacement-1',
  title: 'Replacement Practice',
  category: 'breathing',
  purpose: 'Replace the original practice',
  duration: 5,
  instructions: {
    whatToDo: 'Do this instead',
    focusOn: 'Focus on this',
    dontFocusOn: 'Dont focus on this',
  },
};

const createChallenge = (id: string): Challenge => ({
  ...mockChallenge,
  id,
});

describe('practiceReplacementsStorage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('loadReplacements', () => {
    it('returns empty structure when no data', () => {
      const data = loadReplacements();
      expect(data).toEqual({ days: {}, shownIds: [] });
    });

    it('returns stored data', () => {
      const testData = {
        days: {
          'day-1': {
            'practice-1': mockChallenge,
          },
        },
        shownIds: [mockChallenge.id],
      };
      localStorage.setItem('meditation-replacements', JSON.stringify(testData));

      const data = loadReplacements();
      expect(data).toEqual(testData);
    });

    it('handles corrupted data gracefully', () => {
      localStorage.setItem('meditation-replacements', 'invalid json');
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const data = loadReplacements();
      expect(data).toEqual({ days: {}, shownIds: [] });
      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });

    it('handles old format by returning empty structure', () => {
      // Old format without 'days' property
      const oldFormat = {
        'day-1': {
          'practice-1': mockChallenge,
        },
      };
      localStorage.setItem('meditation-replacements', JSON.stringify(oldFormat));

      const data = loadReplacements();
      expect(data).toEqual({ days: {}, shownIds: [] });
    });
  });

  describe('saveReplacements', () => {
    it('saves data to localStorage', () => {
      const testData = {
        days: {
          'day-1': {
            'practice-1': mockChallenge,
          },
        },
        shownIds: [mockChallenge.id],
      };

      saveReplacements(testData);

      const stored = localStorage.getItem('meditation-replacements');
      expect(stored).toBe(JSON.stringify(testData));
    });
  });

  describe('setReplacement', () => {
    it('adds replacement for a practice', () => {
      setReplacement('day-1', 'practice-1', mockChallenge);

      const data = loadReplacements();
      expect(data.days['day-1']['practice-1']).toEqual(mockChallenge);
      expect(data.shownIds).toContain(mockChallenge.id);
    });

    it('creates day structure if not exists', () => {
      setReplacement('day-5', 'practice-3', mockChallenge);

      const data = loadReplacements();
      expect(data.days['day-5']).toBeDefined();
      expect(data.days['day-5']['practice-3']).toEqual(mockChallenge);
    });

    it('tracks multiple shown IDs', () => {
      const challenge1 = createChallenge('challenge-1');
      const challenge2 = createChallenge('challenge-2');

      setReplacement('day-1', 'practice-1', challenge1);
      setReplacement('day-1', 'practice-2', challenge2);

      const data = loadReplacements();
      expect(data.shownIds).toContain('challenge-1');
      expect(data.shownIds).toContain('challenge-2');
    });

    it('does not duplicate shown IDs', () => {
      setReplacement('day-1', 'practice-1', mockChallenge);
      setReplacement('day-2', 'practice-1', mockChallenge);

      const data = loadReplacements();
      const count = data.shownIds.filter((id) => id === mockChallenge.id).length;
      expect(count).toBe(1);
    });
  });

  describe('getReplacement', () => {
    it('returns replacement if exists', () => {
      setReplacement('day-1', 'practice-1', mockChallenge);

      const replacement = getReplacement('day-1', 'practice-1');
      expect(replacement).toEqual(mockChallenge);
    });

    it('returns null if no replacement', () => {
      const replacement = getReplacement('day-1', 'practice-1');
      expect(replacement).toBeNull();
    });

    it('returns null for non-existent day', () => {
      const replacement = getReplacement('day-99', 'practice-1');
      expect(replacement).toBeNull();
    });
  });

  describe('removeReplacement', () => {
    it('removes replacement from day', () => {
      setReplacement('day-1', 'practice-1', mockChallenge);
      removeReplacement('day-1', 'practice-1');

      const replacement = getReplacement('day-1', 'practice-1');
      expect(replacement).toBeNull();
    });

    it('cleans up empty day objects', () => {
      setReplacement('day-1', 'practice-1', mockChallenge);
      removeReplacement('day-1', 'practice-1');

      const data = loadReplacements();
      expect(data.days['day-1']).toBeUndefined();
    });

    it('handles non-existent day gracefully', () => {
      expect(() => {
        removeReplacement('day-99', 'practice-1');
      }).not.toThrow();
    });

    it('handles non-existent practice gracefully', () => {
      setReplacement('day-1', 'practice-1', mockChallenge);

      expect(() => {
        removeReplacement('day-1', 'practice-99');
      }).not.toThrow();

      // Original replacement should still exist
      const replacement = getReplacement('day-1', 'practice-1');
      expect(replacement).toEqual(mockChallenge);
    });
  });

  describe('getDayReplacements', () => {
    it('returns all replacements for day', () => {
      const challenge1 = createChallenge('challenge-1');
      const challenge2 = createChallenge('challenge-2');

      setReplacement('day-1', 'practice-1', challenge1);
      setReplacement('day-1', 'practice-2', challenge2);

      const dayReplacements = getDayReplacements('day-1');
      expect(dayReplacements['practice-1']).toEqual(challenge1);
      expect(dayReplacements['practice-2']).toEqual(challenge2);
    });

    it('returns empty object for non-existent day', () => {
      const dayReplacements = getDayReplacements('day-99');
      expect(dayReplacements).toEqual({});
    });
  });

  describe('getReplacementShownIds', () => {
    it('returns all shown IDs', () => {
      const challenge1 = createChallenge('challenge-1');
      const challenge2 = createChallenge('challenge-2');

      setReplacement('day-1', 'practice-1', challenge1);
      setReplacement('day-2', 'practice-1', challenge2);

      const shownIds = getReplacementShownIds();
      expect(shownIds).toContain('challenge-1');
      expect(shownIds).toContain('challenge-2');
    });

    it('returns empty array when no replacements', () => {
      const shownIds = getReplacementShownIds();
      expect(shownIds).toEqual([]);
    });
  });
});
