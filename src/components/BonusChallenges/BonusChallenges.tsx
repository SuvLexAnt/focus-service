import { useState } from 'react';
import { Practice, PracticeDuration } from '../../types/meditation';
import { Checkbox } from '../Checkbox/Checkbox';
import { getCategoryInfo, getAvailableDurations } from '../../utils/practiceGenerator';
import styles from './BonusChallenges.module.css';

interface BonusChallengesProps {
  challenges: Practice[];
  canAddMore: boolean;
  maxChallenges: number;
  onAdd: (duration?: PracticeDuration) => Practice | null;
  onReplace: (practiceId: string) => Practice | null;
  onRemove: (practiceId: string) => void;
  onToggle: (practiceId: string) => boolean;
  isChallengeCompleted: (practiceId: string) => boolean;
}

export function BonusChallenges({
  challenges,
  canAddMore,
  maxChallenges,
  onAdd,
  onReplace,
  onRemove,
  onToggle,
  isChallengeCompleted,
}: BonusChallengesProps) {
  const [showDurationPicker, setShowDurationPicker] = useState(false);
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());

  const handleAddClick = () => {
    setShowDurationPicker(true);
  };

  const handleDurationSelect = (duration?: PracticeDuration) => {
    onAdd(duration);
    setShowDurationPicker(false);
  };

  const handleReplace = (practiceId: string) => {
    onReplace(practiceId);
  };

  const handleRemove = (practiceId: string) => {
    onRemove(practiceId);
    setExpandedCards((prev) => {
      const next = new Set(prev);
      next.delete(practiceId);
      return next;
    });
  };

  const toggleExpanded = (practiceId: string) => {
    setExpandedCards((prev) => {
      const next = new Set(prev);
      if (next.has(practiceId)) {
        next.delete(practiceId);
      } else {
        next.add(practiceId);
      }
      return next;
    });
  };

  const availableDurations = getAvailableDurations();

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3 className={styles.title}>Бонусные практики</h3>
        <span className={styles.counter}>
          {challenges.length}/{maxChallenges}
        </span>
      </div>

      {challenges.length === 0 && !showDurationPicker && (
        <p className={styles.emptyText}>
          Добавьте дополнительные практики для усиления эффекта тренировки
        </p>
      )}

      <div className={styles.challenges}>
        {challenges.map((practice) => {
          const isCompleted = isChallengeCompleted(practice.id);
          const isExpanded = expandedCards.has(practice.id);
          const categoryInfo = getCategoryInfo(practice.category);

          return (
            <div
              key={practice.id}
              className={`${styles.card} ${isCompleted ? styles.completed : ''}`}
            >
              <div className={styles.cardHeader}>
                <div className={styles.cardHeaderLeft}>
                  <Checkbox
                    checked={isCompleted}
                    onChange={() => onToggle(practice.id)}
                    id={`bonus-${practice.id}`}
                  />
                  <div className={styles.cardTitleContainer}>
                    <div className={styles.cardTitleRow}>
                      <h4 className={styles.cardTitle}>{practice.title}</h4>
                      {categoryInfo && (
                        <span className={styles.categoryBadge}>{categoryInfo.name}</span>
                      )}
                    </div>
                    <div className={styles.cardMeta}>
                      <span className={styles.duration}>{practice.duration} мин</span>
                    </div>
                  </div>
                </div>
                <div className={styles.cardActions}>
                  {!isCompleted && (
                    <button
                      onClick={() => handleReplace(practice.id)}
                      className={styles.actionButton}
                      title="Заменить практику"
                      aria-label="Заменить практику"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 2v6h-6M3 12a9 9 0 0 1 15-6.7L21 8M3 22v-6h6M21 12a9 9 0 0 1-15 6.7L3 16" />
                      </svg>
                    </button>
                  )}
                  <button
                    onClick={() => handleRemove(practice.id)}
                    className={`${styles.actionButton} ${styles.removeButton}`}
                    title="Удалить практику"
                    aria-label="Удалить практику"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M18 6L6 18M6 6l12 12" />
                    </svg>
                  </button>
                  <button
                    onClick={() => toggleExpanded(practice.id)}
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

              {/* Purpose - always visible */}
              {practice.purpose && <p className={styles.purpose}>{practice.purpose}</p>}

              {isExpanded && (
                <div className={styles.cardContent}>
                  {practice.instructions.whatToDo && (
                    <div className={styles.section}>
                      <h5 className={styles.sectionTitle}>Что делать</h5>
                      <p className={styles.sectionText}>{practice.instructions.whatToDo}</p>
                    </div>
                  )}
                  {practice.instructions.focusOn && (
                    <div className={styles.section}>
                      <h5 className={styles.sectionTitle}>На чём фокусироваться</h5>
                      <p className={styles.sectionText}>{practice.instructions.focusOn}</p>
                    </div>
                  )}
                  {practice.instructions.dontFocusOn && (
                    <div className={styles.section}>
                      <h5 className={styles.sectionTitle}>На чём НЕ фокусироваться</h5>
                      <p className={styles.sectionText}>{practice.instructions.dontFocusOn}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {showDurationPicker && (
        <div className={styles.durationPicker}>
          <p className={styles.pickerTitle}>Выберите длительность:</p>
          <div className={styles.durationButtons}>
            <button
              onClick={() => handleDurationSelect()}
              className={`${styles.durationButton} ${styles.randomButton}`}
            >
              Случайная
            </button>
            {availableDurations.map((dur) => (
              <button
                key={dur}
                onClick={() => handleDurationSelect(dur)}
                className={styles.durationButton}
              >
                {dur} мин
              </button>
            ))}
          </div>
          <button
            onClick={() => setShowDurationPicker(false)}
            className={styles.cancelButton}
          >
            Отмена
          </button>
        </div>
      )}

      {canAddMore && !showDurationPicker && (
        <button onClick={handleAddClick} className={styles.addButton}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 5v14M5 12h14" />
          </svg>
          Добавить бонусную практику
        </button>
      )}

      {!canAddMore && !showDurationPicker && (
        <p className={styles.limitText}>Достигнут лимит бонусных практик на день</p>
      )}
    </div>
  );
}
