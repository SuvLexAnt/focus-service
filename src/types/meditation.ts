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
