import { Day } from '../../types/meditation';
import styles from './DaySelector.module.css';

interface DaySelectorProps {
  days: Day[];
  selectedDay: number;
  onSelectDay: (dayNumber: number) => void;
  getDayProgress: (dayId: string, totalPractices: number) => { completed: number; total: number; isCompleted: boolean };
  maxAvailableDay: number;
}

export function DaySelector({ days, selectedDay, onSelectDay, getDayProgress, maxAvailableDay }: DaySelectorProps) {
  return (
    <div className={styles.container}>
      <h2 className={styles.title}>10 дней к фокусу</h2>
      <div className={styles.days}>
        {days.map((day) => {
          const dayId = `day-${day.number}`;
          const progress = getDayProgress(dayId, day.practices.length);
          const isAvailable = day.number <= maxAvailableDay;
          const isSelected = day.number === selectedDay;

          return (
            <button
              key={day.number}
              onClick={() => isAvailable && onSelectDay(day.number)}
              className={`${styles.day} ${isSelected ? styles.selected : ''} ${!isAvailable ? styles.locked : ''} ${progress.isCompleted ? styles.completed : ''}`}
              disabled={!isAvailable}
            >
              <div className={styles.dayNumber}>{day.number}</div>
              <div className={styles.dayTitle}>{day.title}</div>
              <div className={styles.progressBar}>
                <div
                  className={styles.progressFill}
                  style={{ width: `${(progress.completed / progress.total) * 100 || 0}%` }}
                />
              </div>
              <div className={styles.progressText}>
                {progress.completed} / {progress.total}
              </div>
              {!isAvailable && <div className={styles.lockIcon}>🔒</div>}
              {progress.isCompleted && <div className={styles.checkIcon}>✓</div>}
            </button>
          );
        })}
      </div>
    </div>
  );
}
