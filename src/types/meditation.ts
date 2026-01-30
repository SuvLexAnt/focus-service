// Unified Practice type - combines old Practice and Challenge into a single entity
export interface PracticeInstructions {
  whatToDo: string;
  focusOn: string;
  dontFocusOn: string;
}

// Category types for practices
export type PracticeCategory =
  | 'breathing'
  | 'grounding'
  | 'body'
  | 'mindfulness'
  | 'compassion'
  | 'concentration'
  | 'emotional'
  | 'gratitude'
  | 'visualization'
  | 'movement'
  | 'sensory'
  | 'energy'
  | 'program'; // for practices from meditation-program.md

export interface Practice {
  id: string;
  title: string;
  duration: number; // in minutes
  category: PracticeCategory;
  purpose?: string;
  instructions: PracticeInstructions;
  isMain?: boolean;
  isFromProgram?: boolean; // true for practices from meditation-program.md
}

export interface Day {
  number: number;
  title: string;
  goal: string;
  practices: Practice[];
}

export interface ProgressState {
  [dayId: string]: {
    [practiceId: string]: boolean;
  };
}

export interface MeditationData {
  startDate: string | null;
  currentDay: number;
  progress: ProgressState;
}

// Duration options for practice generation
export type PracticeDuration = '1' | '2' | '3' | '5' | '7' | '10';

// Extra practices per day (bonus + replacements)
export interface DayExtraPracticesData {
  bonusPractices: Practice[];
  replacements: { [originalPracticeId: string]: Practice };
  progress: { [practiceId: string]: boolean };
  shownIds: string[]; // history of shown practice IDs to avoid repetition
}

export interface ExtraPracticesData {
  [dayId: string]: DayExtraPracticesData;
}

// Pool entry (from challenges-pool.json)
export interface PracticePoolEntry {
  id: string;
  title: string;
  category: PracticeCategory;
  purpose: string;
  instructions: PracticeInstructions;
}

export interface PracticesPool {
  meta: {
    version: string;
    description: string;
    lastUpdated: string;
    sources: string[];
  };
  challenges: {
    [key in PracticeDuration]: PracticePoolEntry[];
  };
  categories: {
    [key: string]: {
      name: string;
      description: string;
      icon: string;
    };
  };
}

// Legacy type aliases for backward compatibility during migration
/** @deprecated Use Practice instead */
export type Challenge = Practice;
/** @deprecated Use PracticeDuration instead */
export type ChallengeDuration = PracticeDuration;
/** @deprecated Use PracticePoolEntry instead */
export type ChallengePoolEntry = PracticePoolEntry;
/** @deprecated Use PracticeInstructions instead */
export type ChallengeInstructions = PracticeInstructions;
/** @deprecated Use PracticesPool instead */
export type ChallengesPool = PracticesPool;

// Legacy bonus challenges types for migration
/** @deprecated Will be removed after migration */
export interface BonusChallengesDayData {
  challenges: Practice[];
  progress: { [challengeId: string]: boolean };
  shownIds: string[];
}

/** @deprecated Will be removed after migration */
export interface BonusChallengesData {
  [dayId: string]: BonusChallengesDayData;
}
