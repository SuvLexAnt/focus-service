import { Day, Practice } from '../types/meditation';

export function parseMeditationProgram(markdown: string): Day[] {
  const days: Day[] = [];

  // Разделить на дни по заголовку "## День X:"
  const sections = markdown.split(/(?=## День \d+:)/);

  for (const section of sections) {
    if (!section.trim() || !section.includes('## День')) continue;

    const dayMatch = section.match(/## День (\d+):\s*(.+)/);
    if (!dayMatch) continue;

    const dayNumber = parseInt(dayMatch[1]);
    const dayTitle = dayMatch[2].trim();

    // Извлечь цель дня
    const goalMatch = section.match(/\*\*Цель дня:\*\*\s*(.+?)(?=\n\n|###)/s);
    const goal = goalMatch ? goalMatch[1].trim() : '';

    // Разделить на практики
    const practices: Practice[] = [];
    const practiceRegex = /### Практика (\d+):\s*(.+?)(?=\n\n|$)/;
    const practiceSections = section.split(/(?=### Практика \d+:)/);

    for (const practiceSection of practiceSections) {
      if (!practiceSection.includes('### Практика')) continue;

      const practiceMatch = practiceSection.match(practiceRegex);
      if (!practiceMatch) continue;

      const practiceNumber = practiceMatch[1];
      const practiceTitle = practiceMatch[2].trim();

      // Определить, основная ли практика
      const isMain = practiceSection.includes('— основная практика');

      // Извлечь продолжительность из заголовка (например, "(5 минут)")
      const durationMatch = practiceTitle.match(/\((\d+(?:\s*[хx×]\s*\d+)?\s*мину[тн].*?)\)/i);
      const duration = durationMatch ? durationMatch[1] : '';

      // Очистить название от дополнительной информации
      const cleanTitle = practiceTitle
        .replace(/\s*\(.*?\)/g, '')
        .replace(/\s*—.*$/g, '')
        .trim();

      // Извлечь "Что делать"
      const whatToDoMatch = practiceSection.match(/\*\*Что делать:\*\*\s*([\s\S]*?)(?=\*\*На чём фокусироваться:|$)/);
      const whatToDo = whatToDoMatch ? cleanText(whatToDoMatch[1]) : '';

      // Извлечь "На чём фокусироваться"
      const focusOnMatch = practiceSection.match(/\*\*На чём фокусироваться:\*\*\s*([\s\S]*?)(?=\*\*На чём НЕ фокусироваться:|$)/);
      const focusOn = focusOnMatch ? cleanText(focusOnMatch[1]) : '';

      // Извлечь "На чём НЕ фокусироваться"
      const dontFocusOnMatch = practiceSection.match(/\*\*На чём НЕ фокусироваться:\*\*\s*([\s\S]*?)(?=\*\*\*|###|$)/);
      const dontFocusOn = dontFocusOnMatch ? cleanText(dontFocusOnMatch[1]) : '';

      practices.push({
        id: `day-${dayNumber}-practice-${practiceNumber}`,
        title: cleanTitle,
        duration,
        whatToDo,
        focusOn,
        dontFocusOn,
        isMain,
      });
    }

    if (practices.length > 0) {
      days.push({
        number: dayNumber,
        title: dayTitle,
        goal,
        practices,
      });
    }
  }

  return days.sort((a, b) => a.number - b.number);
}

function cleanText(text: string): string {
  return text
    .replace(/\n{3,}/g, '\n\n')
    .replace(/\*\*\*/g, '')
    .replace(/\[\d+\]/g, '') // Удалить ссылки на источники
    .trim();
}

export async function loadMeditationProgram(): Promise<Day[]> {
  try {
    const response = await fetch('/meditation-program.md');
    const text = await response.text();
    return parseMeditationProgram(text);
  } catch (error) {
    console.error('Failed to load meditation program:', error);
    return [];
  }
}
