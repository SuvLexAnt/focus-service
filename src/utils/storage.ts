import { MeditationData } from '../types/meditation';

const STORAGE_KEY = 'meditation-data';

export function loadMeditationData(): MeditationData {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Failed to load meditation data:', error);
  }

  return {
    startDate: null,
    currentDay: 1,
    progress: {},
  };
}

export function saveMeditationData(data: MeditationData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Failed to save meditation data:', error);
  }
}

export function setStartDate(date: string): void {
  const data = loadMeditationData();
  data.startDate = date;
  saveMeditationData(data);
}

export function togglePractice(dayId: string, practiceId: string): boolean {
  const data = loadMeditationData();

  if (!data.progress[dayId]) {
    data.progress[dayId] = {};
  }

  const newValue = !data.progress[dayId][practiceId];
  data.progress[dayId][practiceId] = newValue;

  saveMeditationData(data);
  return newValue;
}

export function isPracticeCompleted(dayId: string, practiceId: string): boolean {
  const data = loadMeditationData();
  return data.progress[dayId]?.[practiceId] || false;
}

export function isDayCompleted(dayId: string, totalPractices: number): boolean {
  const data = loadMeditationData();
  const dayProgress = data.progress[dayId] || {};

  const completedCount = Object.values(dayProgress).filter(Boolean).length;
  return completedCount === totalPractices;
}

export function getDayProgress(dayId: string): { completed: number; total: number } {
  const data = loadMeditationData();
  const dayProgress = data.progress[dayId] || {};

  const completed = Object.values(dayProgress).filter(Boolean).length;

  return { completed, total: Object.keys(dayProgress).length };
}

export function getMaxAvailableDay(days: { number: number; practices: { id: string }[] }[]): number {
  const data = loadMeditationData();

  for (const day of days) {
    const dayId = `day-${day.number}`;
    const dayProgress = data.progress[dayId] || {};
    const totalPractices = day.practices.length;

    // Считаем только завершённые практики (true)
    const completedCount = Object.values(dayProgress).filter(Boolean).length;

    if (completedCount < totalPractices) {
      // День не завершён - это текущий доступный день
      return day.number;
    }
  }

  // Все дни завершены - доступен последний день
  return days.length;
}
