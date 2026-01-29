import { useState, useEffect, useRef, useCallback } from 'react';
import { Day } from '../../types/meditation';
import styles from './DaySelector.module.css';

interface DaySelectorProps {
  days: Day[];
  selectedDay: number;
  onSelectDay: (dayNumber: number) => void;
  getDayProgress: (dayId: string, totalPractices: number) => { completed: number; total: number; isCompleted: boolean };
  maxAvailableDay: number;
}

const MOBILE_BREAKPOINT = 768;
const MOBILE_VISIBLE_DAYS = 2;
const DAY_CARD_MIN_WIDTH = 140;
const DAY_CARD_GAP = 16;

export function DaySelector({ days, selectedDay, onSelectDay, getDayProgress, maxAvailableDay }: DaySelectorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [startIndex, setStartIndex] = useState(0);
  const [visibleCount, setVisibleCount] = useState(days.length);
  const [isMobile, setIsMobile] = useState(false);

  // Touch handling state
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  // Calculate how many days fit in the container
  const calculateVisibleDays = useCallback(() => {
    if (typeof window === 'undefined') return;

    const windowWidth = window.innerWidth;
    const mobile = windowWidth <= MOBILE_BREAKPOINT;
    setIsMobile(mobile);

    if (mobile) {
      setVisibleCount(MOBILE_VISIBLE_DAYS);
    } else if (containerRef.current) {
      const containerWidth = containerRef.current.offsetWidth;
      // Account for padding (32px * 2)
      const availableWidth = containerWidth - 64;
      // Calculate how many cards fit
      const count = Math.floor((availableWidth + DAY_CARD_GAP) / (DAY_CARD_MIN_WIDTH + DAY_CARD_GAP));
      setVisibleCount(Math.min(Math.max(count, 2), days.length));
    }
  }, [days.length]);

  // Auto-scroll to show selected day when it changes
  const prevSelectedDay = useRef(selectedDay);
  useEffect(() => {
    // Only auto-scroll if selectedDay actually changed (user clicked a day)
    if (prevSelectedDay.current !== selectedDay) {
      prevSelectedDay.current = selectedDay;
      const selectedIndex = selectedDay - 1;
      if (selectedIndex < startIndex) {
        setStartIndex(selectedIndex);
      } else if (selectedIndex >= startIndex + visibleCount) {
        setStartIndex(Math.max(0, selectedIndex - visibleCount + 1));
      }
    }
  }, [selectedDay, startIndex, visibleCount]);

  // Recalculate on mount and resize
  useEffect(() => {
    calculateVisibleDays();

    const handleResize = () => {
      calculateVisibleDays();
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [calculateVisibleDays]);

  // Touch handlers for swipe navigation
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (touchStartX.current === null || touchEndX.current === null) return;

    const diff = touchStartX.current - touchEndX.current;
    const minSwipeDistance = 50;

    if (Math.abs(diff) > minSwipeDistance) {
      if (diff > 0) {
        // Swiped left - show next days
        handleNext();
      } else {
        // Swiped right - show previous days
        handlePrev();
      }
    }

    touchStartX.current = null;
    touchEndX.current = null;
  };

  const handlePrev = () => {
    setStartIndex(prev => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    setStartIndex(prev => Math.min(days.length - visibleCount, prev + 1));
  };

  const canGoPrev = startIndex > 0;
  const canGoNext = startIndex + visibleCount < days.length;
  const showNavigation = visibleCount < days.length;

  const visibleDays = days.slice(startIndex, startIndex + visibleCount);

  return (
    <div className={styles.container} ref={containerRef}>
      <h2 className={styles.title}>10 дней к фокусу</h2>

      <div className={styles.carousel}>
        {showNavigation && (
          <button
            className={`${styles.navButton} ${styles.navPrev}`}
            onClick={handlePrev}
            disabled={!canGoPrev}
            aria-label="Предыдущие дни"
          >
            ‹
          </button>
        )}

        <div
          className={styles.days}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          style={{
            gridTemplateColumns: isMobile
              ? `repeat(${visibleCount}, 1fr)`
              : `repeat(${visibleCount}, minmax(${DAY_CARD_MIN_WIDTH}px, 1fr))`
          }}
        >
          {visibleDays.map((day) => {
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

        {showNavigation && (
          <button
            className={`${styles.navButton} ${styles.navNext}`}
            onClick={handleNext}
            disabled={!canGoNext}
            aria-label="Следующие дни"
          >
            ›
          </button>
        )}
      </div>

      {showNavigation && (
        <div className={styles.pagination}>
          {Array.from({ length: Math.ceil(days.length / visibleCount) }).map((_, i) => {
            const pageStartIndex = i * visibleCount;
            const isActive = startIndex >= pageStartIndex && startIndex < pageStartIndex + visibleCount;
            return (
              <button
                key={i}
                className={`${styles.dot} ${isActive ? styles.dotActive : ''}`}
                onClick={() => setStartIndex(Math.min(pageStartIndex, days.length - visibleCount))}
                aria-label={`Страница ${i + 1}`}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
