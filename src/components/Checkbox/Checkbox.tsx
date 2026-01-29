import { useState } from 'react';
import styles from './Checkbox.module.css';
import { SuccessAnimation } from '../SuccessAnimation/SuccessAnimation';

interface CheckboxProps {
  checked: boolean;
  onChange: () => void;
  id: string;
}

export function Checkbox({ checked, onChange, id }: CheckboxProps) {
  const [showAnimation, setShowAnimation] = useState(false);

  const handleChange = () => {
    const newValue = !checked;
    onChange();

    if (newValue) {
      setShowAnimation(true);
      setTimeout(() => setShowAnimation(false), 1500);
    }
  };

  return (
    <div className={styles.container}>
      <input
        type="checkbox"
        id={id}
        checked={checked}
        onChange={handleChange}
        className={styles.input}
      />
      <label htmlFor={id} className={styles.label}>
        <div className={styles.checkbox}>
          {checked && (
            <svg className={styles.checkIcon} viewBox="0 0 12 10" fill="none">
              <path
                d="M1 5L4.5 8.5L11 1"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </div>
      </label>
      {showAnimation && <SuccessAnimation />}
    </div>
  );
}
