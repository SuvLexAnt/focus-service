import { useState } from 'react';
import { Practice } from '../../types/meditation';
import { Checkbox } from '../Checkbox/Checkbox';
import styles from './PracticeCard.module.css';

interface PracticeCardProps {
  practice: Practice;
  isCompleted: boolean;
  onToggle: () => void;
}

export function PracticeCard({ practice, isCompleted, onToggle }: PracticeCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

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
              {practice.title}
              {practice.isMain && <span className={styles.badge}>Основная</span>}
            </h3>
            {practice.duration && (
              <span className={styles.duration}>{practice.duration}</span>
            )}
          </div>
        </div>
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

      {isExpanded && (
        <div className={styles.content}>
          {practice.whatToDo && (
            <div className={styles.section}>
              <h4 className={styles.sectionTitle}>Что делать</h4>
              <p className={styles.sectionText}>{practice.whatToDo}</p>
            </div>
          )}

          {practice.focusOn && (
            <div className={styles.section}>
              <h4 className={styles.sectionTitle}>На чём фокусироваться</h4>
              <p className={styles.sectionText}>{practice.focusOn}</p>
            </div>
          )}

          {practice.dontFocusOn && (
            <div className={styles.section}>
              <h4 className={styles.sectionTitle}>На чём НЕ фокусироваться</h4>
              <p className={styles.sectionText}>{practice.dontFocusOn}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
