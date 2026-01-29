import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BonusChallenges } from './BonusChallenges';
import { Challenge } from '../../types/meditation';

const mockChallenge: Challenge = {
  id: 'test-challenge-1',
  title: 'Test Challenge',
  category: 'breathing',
  purpose: 'Test purpose for the challenge',
  duration: 5,
  instructions: {
    whatToDo: 'Test what to do',
    focusOn: 'Test focus',
    dontFocusOn: 'Test dont focus',
  },
};

const defaultProps = {
  challenges: [] as Challenge[],
  canAddMore: true,
  maxChallenges: 5,
  onAdd: vi.fn(() => mockChallenge),
  onReplace: vi.fn(() => mockChallenge),
  onRemove: vi.fn(),
  onToggle: vi.fn(() => true),
  isChallengeCompleted: vi.fn(() => false),
};

describe('BonusChallenges', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('empty state', () => {
    it('renders empty state message', () => {
      render(<BonusChallenges {...defaultProps} />);

      expect(screen.getByText(/Добавьте дополнительные практики/i)).toBeInTheDocument();
    });

    it('shows add button when canAddMore is true', () => {
      render(<BonusChallenges {...defaultProps} />);

      expect(screen.getByText(/Добавить бонусную практику/i)).toBeInTheDocument();
    });

    it('shows counter', () => {
      render(<BonusChallenges {...defaultProps} />);

      expect(screen.getByText('0/5')).toBeInTheDocument();
    });
  });

  describe('with challenges', () => {
    it('renders challenge cards', () => {
      render(
        <BonusChallenges
          {...defaultProps}
          challenges={[mockChallenge]}
        />
      );

      expect(screen.getByText('Test Challenge')).toBeInTheDocument();
      expect(screen.getByText('5 мин')).toBeInTheDocument();
      expect(screen.getByText('Test purpose for the challenge')).toBeInTheDocument();
    });

    it('shows category badge', () => {
      render(
        <BonusChallenges
          {...defaultProps}
          challenges={[mockChallenge]}
        />
      );

      expect(screen.getByText('Дыхательные практики')).toBeInTheDocument();
    });

    it('updates counter with challenges', () => {
      render(
        <BonusChallenges
          {...defaultProps}
          challenges={[mockChallenge]}
        />
      );

      expect(screen.getByText('1/5')).toBeInTheDocument();
    });
  });

  describe('add challenge flow', () => {
    it('shows duration picker on add click', () => {
      render(<BonusChallenges {...defaultProps} />);

      fireEvent.click(screen.getByText(/Добавить бонусную практику/i));

      expect(screen.getByText(/Выберите длительность/i)).toBeInTheDocument();
      expect(screen.getByText('Случайная')).toBeInTheDocument();
    });

    it('calls onAdd with duration when selected', () => {
      render(<BonusChallenges {...defaultProps} />);

      fireEvent.click(screen.getByText(/Добавить бонусную практику/i));
      fireEvent.click(screen.getByText('5 мин'));

      expect(defaultProps.onAdd).toHaveBeenCalledWith('5');
    });

    it('calls onAdd with undefined for random', () => {
      render(<BonusChallenges {...defaultProps} />);

      fireEvent.click(screen.getByText(/Добавить бонусную практику/i));
      fireEvent.click(screen.getByText('Случайная'));

      expect(defaultProps.onAdd).toHaveBeenCalledWith(undefined);
    });

    it('closes duration picker on cancel', () => {
      render(<BonusChallenges {...defaultProps} />);

      fireEvent.click(screen.getByText(/Добавить бонусную практику/i));
      fireEvent.click(screen.getByText('Отмена'));

      expect(screen.queryByText(/Выберите длительность/i)).not.toBeInTheDocument();
    });
  });

  describe('challenge interactions', () => {
    it('calls onToggle when checkbox clicked', () => {
      render(
        <BonusChallenges
          {...defaultProps}
          challenges={[mockChallenge]}
        />
      );

      const checkbox = screen.getByRole('checkbox');
      fireEvent.click(checkbox);

      expect(defaultProps.onToggle).toHaveBeenCalledWith(mockChallenge.id);
    });

    it('calls onRemove when delete button clicked', () => {
      render(
        <BonusChallenges
          {...defaultProps}
          challenges={[mockChallenge]}
        />
      );

      const removeButton = screen.getByLabelText('Удалить практику');
      fireEvent.click(removeButton);

      expect(defaultProps.onRemove).toHaveBeenCalledWith(mockChallenge.id);
    });

    it('calls onReplace when replace button clicked', () => {
      render(
        <BonusChallenges
          {...defaultProps}
          challenges={[mockChallenge]}
        />
      );

      const replaceButton = screen.getByLabelText('Заменить практику');
      fireEvent.click(replaceButton);

      expect(defaultProps.onReplace).toHaveBeenCalledWith(mockChallenge.id);
    });

    it('hides replace button for completed challenges', () => {
      render(
        <BonusChallenges
          {...defaultProps}
          challenges={[mockChallenge]}
          isChallengeCompleted={() => true}
        />
      );

      expect(screen.queryByLabelText('Заменить практику')).not.toBeInTheDocument();
    });
  });

  describe('expandable content', () => {
    it('shows instructions when expanded', () => {
      render(
        <BonusChallenges
          {...defaultProps}
          challenges={[mockChallenge]}
        />
      );

      const expandButton = screen.getByLabelText('Развернуть');
      fireEvent.click(expandButton);

      expect(screen.getByText('Что делать')).toBeInTheDocument();
      expect(screen.getByText('Test what to do')).toBeInTheDocument();
      expect(screen.getByText('На чём фокусироваться')).toBeInTheDocument();
      expect(screen.getByText('На чём НЕ фокусироваться')).toBeInTheDocument();
    });

    it('hides instructions when collapsed', () => {
      render(
        <BonusChallenges
          {...defaultProps}
          challenges={[mockChallenge]}
        />
      );

      // Initially collapsed
      expect(screen.queryByText('Что делать')).not.toBeInTheDocument();
    });
  });

  describe('limit reached', () => {
    it('shows limit message when canAddMore is false', () => {
      render(
        <BonusChallenges
          {...defaultProps}
          challenges={[mockChallenge]}
          canAddMore={false}
        />
      );

      expect(screen.getByText(/Достигнут лимит/i)).toBeInTheDocument();
      expect(screen.queryByText(/Добавить бонусную практику/i)).not.toBeInTheDocument();
    });
  });
});
