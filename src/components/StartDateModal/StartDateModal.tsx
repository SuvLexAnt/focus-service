import { useState } from 'react';
import styles from './StartDateModal.module.css';

interface StartDateModalProps {
  onStart: (date: string) => void;
}

export function StartDateModal({ onStart }: StartDateModalProps) {
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });

  const handleStart = () => {
    onStart(selectedDate);
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <h1 className={styles.title}>Добро пожаловать</h1>
        <p className={styles.description}>
          Вы начинаете 10-дневный путь к устойчивому вниманию и осознанности.
          Выберите дату начала вашей практики:
        </p>

        <div className={styles.dateInput}>
          <label htmlFor="start-date" className={styles.label}>
            Дата начала
          </label>
          <input
            id="start-date"
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className={styles.input}
          />
        </div>

        <button onClick={handleStart} className={styles.button}>
          Начать путь
        </button>

        <p className={styles.note}>
          Программа адаптируется под ваш темп. Каждый день открывается после
          завершения предыдущего.
        </p>
      </div>
    </div>
  );
}
