import { useEffect, useState } from 'react';
import { Analytics } from '@vercel/analytics/react';
import { Day } from './types/meditation';
import { loadMeditationProgram } from './utils/parser';
import { useProgress } from './hooks/useProgress';
import { useBonusChallenges } from './hooks/useBonusChallenges';
import { getMaxAvailableDay } from './utils/storage';
import { StartDateModal } from './components/StartDateModal/StartDateModal';
import { DaySelector } from './components/DaySelector/DaySelector';
import { PracticeCard } from './components/PracticeCard/PracticeCard';
import { BonusChallenges } from './components/BonusChallenges/BonusChallenges';
import styles from './App.module.css';

function App() {
  const [days, setDays] = useState<Day[]>([]);
  const [selectedDay, setSelectedDay] = useState(1);
  const [loading, setLoading] = useState(true);
  const { data, setStartDate, togglePractice, isPracticeCompleted, getDayProgress } = useProgress();

  const dayId = `day-${selectedDay}`;
  const bonusChallenges = useBonusChallenges(dayId);

  useEffect(() => {
    loadMeditationProgram().then((loadedDays) => {
      setDays(loadedDays);
      setLoading(false);

      // Установить текущий доступный день
      if (data.startDate) {
        const maxDay = getMaxAvailableDay(loadedDays);
        setSelectedDay(maxDay);
      }
    });
  }, [data.startDate]);

  const handleStartDateSet = (date: string) => {
    setStartDate(date);
  };

  const handleTogglePractice = (dayId: string, practiceId: string) => {
    togglePractice(dayId, practiceId);
  };

  const handleSelectDay = (dayNumber: number) => {
    setSelectedDay(dayNumber);
  };

  if (loading) {
    return (
      <>
        <div className={styles.loading}>
          <div className={styles.spinner} />
          <p>Загрузка...</p>
        </div>
        <Analytics debug={import.meta.env.DEV} />
      </>
    );
  }

  if (!data.startDate) {
    return (
      <>
        <StartDateModal onStart={handleStartDateSet} />
        <Analytics debug={import.meta.env.DEV} />
      </>
    );
  }

  const currentDay = days.find(d => d.number === selectedDay);
  const maxAvailableDay = getMaxAvailableDay(days);

  return (
    <div className={styles.app}>
      <header className={styles.header}>
        <h1 className={styles.mainTitle}>Медитация для фокуса</h1>
        <p className={styles.subtitle}>10-дневный путь к устойчивому вниманию</p>
      </header>

      <div className={styles.container}>
        <DaySelector
          days={days}
          selectedDay={selectedDay}
          onSelectDay={handleSelectDay}
          getDayProgress={getDayProgress}
          maxAvailableDay={maxAvailableDay}
        />

        {currentDay && (
          <div className={styles.dayContent}>
            <div className={styles.dayHeader}>
              <h2 className={styles.dayTitle}>
                День {currentDay.number}: {currentDay.title}
              </h2>
              {currentDay.goal && (
                <p className={styles.dayGoal}>{currentDay.goal}</p>
              )}
            </div>

            <div className={styles.practices}>
              {currentDay.practices.map((practice) => {
                const currentDayId = `day-${currentDay.number}`;
                const isCompleted = isPracticeCompleted(currentDayId, practice.id);

                return (
                  <PracticeCard
                    key={practice.id}
                    practice={practice}
                    isCompleted={isCompleted}
                    onToggle={() => handleTogglePractice(currentDayId, practice.id)}
                  />
                );
              })}
            </div>

            <BonusChallenges
              challenges={bonusChallenges.challenges}
              canAddMore={bonusChallenges.canAddMore}
              maxChallenges={bonusChallenges.maxChallenges}
              onAdd={bonusChallenges.addChallenge}
              onReplace={bonusChallenges.replaceChallenge}
              onRemove={bonusChallenges.removeChallenge}
              onToggle={bonusChallenges.toggleChallenge}
              isChallengeCompleted={bonusChallenges.isChallengeCompleted}
            />
          </div>
        )}
      </div>

      <footer className={styles.footer}>
        <p>Ваша способность к фокусировке тренируется с каждым днём 🌱</p>
      </footer>

      <Analytics debug={import.meta.env.DEV} />
    </div>
  );
}

export default App;
