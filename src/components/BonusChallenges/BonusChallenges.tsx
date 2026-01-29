import { useState } from 'react';
import { Challenge, ChallengeDuration } from '../../types/meditation';
import { Checkbox } from '../Checkbox/Checkbox';
import { getCategoryInfo, getAvailableDurations } from '../../utils/challengeGenerator';
import styles from './BonusChallenges.module.css';

interface BonusChallengesProps {
  challenges: Challenge[];
  canAddMore: boolean;
  maxChallenges: number;
  onAdd: (duration?: ChallengeDuration) => Challenge | null;
  onReplace: (challengeId: string) => Challenge | null;
  onRemove: (challengeId: string) => void;
  onToggle: (challengeId: string) => boolean;
  isChallengeCompleted: (challengeId: string) => boolean;
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

  const handleDurationSelect = (duration?: ChallengeDuration) => {
    onAdd(duration);
    setShowDurationPicker(false);
  };

  const handleReplace = (challengeId: string) => {
    onReplace(challengeId);
  };

  const handleRemove = (challengeId: string) => {
    onRemove(challengeId);
    setExpandedCards((prev) => {
      const next = new Set(prev);
      next.delete(challengeId);
      return next;
    });
  };

  const toggleExpanded = (challengeId: string) => {
    setExpandedCards((prev) => {
      const next = new Set(prev);
      if (next.has(challengeId)) {
        next.delete(challengeId);
      } else {
        next.add(challengeId);
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
        {challenges.map((challenge) => {
          const isCompleted = isChallengeCompleted(challenge.id);
          const isExpanded = expandedCards.has(challenge.id);
          const categoryInfo = getCategoryInfo(challenge.category);

          return (
            <div
              key={challenge.id}
              className={`${styles.card} ${isCompleted ? styles.completed : ''}`}
            >
              <div className={styles.cardHeader}>
                <div className={styles.cardHeaderLeft}>
                  <Checkbox
                    checked={isCompleted}
                    onChange={() => onToggle(challenge.id)}
                    id={`bonus-${challenge.id}`}
                  />
                  <div className={styles.cardTitleContainer}>
                    <div className={styles.cardTitleRow}>
                      <h4 className={styles.cardTitle}>{challenge.title}</h4>
                      {categoryInfo && (
                        <span className={styles.categoryBadge}>{categoryInfo.name}</span>
                      )}
                    </div>
                    <div className={styles.cardMeta}>
                      <span className={styles.duration}>{challenge.duration} мин</span>
                    </div>
                  </div>
                </div>
                <div className={styles.cardActions}>
                  {!isCompleted && (
                    <button
                      onClick={() => handleReplace(challenge.id)}
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
                    onClick={() => handleRemove(challenge.id)}
                    className={`${styles.actionButton} ${styles.removeButton}`}
                    title="Удалить практику"
                    aria-label="Удалить практику"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M18 6L6 18M6 6l12 12" />
                    </svg>
                  </button>
                  <button
                    onClick={() => toggleExpanded(challenge.id)}
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
              <p className={styles.purpose}>{challenge.purpose}</p>

              {isExpanded && (
                <div className={styles.cardContent}>
                  {challenge.instructions.whatToDo && (
                    <div className={styles.section}>
                      <h5 className={styles.sectionTitle}>Что делать</h5>
                      <p className={styles.sectionText}>{challenge.instructions.whatToDo}</p>
                    </div>
                  )}
                  {challenge.instructions.focusOn && (
                    <div className={styles.section}>
                      <h5 className={styles.sectionTitle}>На чём фокусироваться</h5>
                      <p className={styles.sectionText}>{challenge.instructions.focusOn}</p>
                    </div>
                  )}
                  {challenge.instructions.dontFocusOn && (
                    <div className={styles.section}>
                      <h5 className={styles.sectionTitle}>На чём НЕ фокусироваться</h5>
                      <p className={styles.sectionText}>{challenge.instructions.dontFocusOn}</p>
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
