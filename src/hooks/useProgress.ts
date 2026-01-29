import { useState, useCallback } from 'react';
import { MeditationData } from '../types/meditation';
import { loadMeditationData, saveMeditationData, togglePractice as togglePracticeStorage } from '../utils/storage';

export function useProgress() {
  const [data, setData] = useState<MeditationData>(loadMeditationData);

  const setStartDate = useCallback((date: string) => {
    const newData = { ...data, startDate: date };
    setData(newData);
    saveMeditationData(newData);
  }, [data]);

  const togglePractice = useCallback((dayId: string, practiceId: string) => {
    const newValue = togglePracticeStorage(dayId, practiceId);
    setData(loadMeditationData());
    return newValue;
  }, []);

  const isPracticeCompleted = useCallback((dayId: string, practiceId: string): boolean => {
    return data.progress[dayId]?.[practiceId] || false;
  }, [data]);

  const getDayProgress = useCallback((dayId: string, totalPractices: number) => {
    const dayProgress = data.progress[dayId] || {};
    const completed = Object.values(dayProgress).filter(Boolean).length;

    return {
      completed,
      total: totalPractices,
      isCompleted: completed === totalPractices && totalPractices > 0,
    };
  }, [data]);

  return {
    data,
    setStartDate,
    togglePractice,
    isPracticeCompleted,
    getDayProgress,
  };
}
