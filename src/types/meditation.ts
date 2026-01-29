export interface Practice {
  id: string;
  title: string;
  duration: string;
  whatToDo: string;
  focusOn: string;
  dontFocusOn: string;
  isMain?: boolean;
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

// Bonus Challenges types
export type ChallengeDuration = '1' | '2' | '3' | '5' | '7' | '10';

export interface ChallengeInstructions {
  whatToDo: string;
  focusOn: string;
  dontFocusOn: string;
}

export interface Challenge {
  id: string;
  title: string;
  category: string;
  purpose: string;
  duration: number;
  instructions: ChallengeInstructions;
}

export interface BonusChallengesDayData {
  challenges: Challenge[];
  progress: { [challengeId: string]: boolean };
  shownIds: string[];
}

export interface BonusChallengesData {
  [dayId: string]: BonusChallengesDayData;
}

export interface ChallengesPoolEntry {
  id: string;
  title: string;
  category: string;
  purpose: string;
  instructions: ChallengeInstructions;
}

export interface ChallengesPool {
  meta: {
    version: string;
    description: string;
    lastUpdated: string;
    sources: string[];
  };
  challenges: {
    [key in ChallengeDuration]: ChallengePoolEntry[];
  };
  categories: {
    [key: string]: {
      name: string;
      description: string;
      icon: string;
    };
  };
}

export type ChallengePoolEntry = ChallengesPoolEntry;
