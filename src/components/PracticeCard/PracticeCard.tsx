import { useState } from 'react';
import { Practice, Challenge } from '../../types/meditation';
import { Checkbox } from '../Checkbox/Checkbox';
import { getCategoryInfo } from '../../utils/challengeGenerator';
import styles from './PracticeCard.module.css';

interface PracticeCardProps {
  practice: Practice;
  isCompleted: boolean;
  onToggle: () => void;
  onReplace?: () => void;
  replacedWith?: Challenge | null;
}

export function PracticeCard({
  practice,
  isCompleted,
  onToggle,
  onReplace,
  replacedWith,
}: PracticeCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Determine what content to display
  const isReplaced = !!replacedWith;
  const displayTitle = isReplaced ? replacedWith.title : practice.title;
  const displayDuration = isReplaced ? `${replacedWith.duration} мин` : practice.duration;
  const displayWhatToDo = isReplaced ? replacedWith.instructions.whatToDo : practice.whatToDo;
  const displayFocusOn = isReplaced ? replacedWith.instructions.focusOn : practice.focusOn;
  const displayDontFocusOn = isReplaced ? replacedWith.instructions.dontFocusOn : practice.dontFocusOn;

  const categoryInfo = isReplaced ? getCategoryInfo(replacedWith.category) : null;

  return (
    <div className={`${styles.card} ${isCompleted ? styles.completed : ''}`}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <Checkbox
            checked={isCompleted}
            onChange={onToggle}
            id={practice.id}
          />
          <div className={styles.titleContainer}>
            <h3 className={styles.title}>
              {displayTitle}
              {practice.isMain && !isReplaced && <span className={styles.badge}>Основная</span>}
              {isReplaced && <span className={styles.replacedBadge}>Замена</span>}
              {isReplaced && categoryInfo && (
                <span className={styles.categoryBadge}>{categoryInfo.name}</span>
              )}
            </h3>
            {displayDuration && (
              <span className={styles.duration}>{displayDuration}</span>
            )}
          </div>
        </div>
        <div className={styles.headerActions}>
          {onReplace && !isCompleted && (
            <button
              onClick={onReplace}
              className={styles.replaceButton}
              title="Заменить практику"
              aria-label="Заменить практику"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 2v6h-6M3 12a9 9 0 0 1 15-6.7L21 8M3 22v-6h6M21 12a9 9 0 0 1-15 6.7L3 16" />
              </svg>
            </button>
          )}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className={styles.expandButton}
            aria-label={isExpanded ? 'Свернуть' : 'Развернуть'}
          >
            <svg
              className={`${styles.expandIcon} ${isExpanded ? styles.expanded : ''}`}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>
        </div>
      </div>

      {isReplaced && replacedWith.purpose && (
        <p className={styles.purpose}>{replacedWith.purpose}</p>
      )}

      {isExpanded && (
        <div className={styles.content}>
          {displayWhatToDo && (
            <div className={styles.section}>
              <h4 className={styles.sectionTitle}>Что делать</h4>
              <p className={styles.sectionText}>{displayWhatToDo}</p>
            </div>
          )}

          {displayFocusOn && (
            <div className={styles.section}>
              <h4 className={styles.sectionTitle}>На чём фокусироваться</h4>
              <p className={styles.sectionText}>{displayFocusOn}</p>
            </div>
          )}

          {displayDontFocusOn && (
            <div className={styles.section}>
              <h4 className={styles.sectionTitle}>На чём НЕ фокусироваться</h4>
              <p className={styles.sectionText}>{displayDontFocusOn}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
