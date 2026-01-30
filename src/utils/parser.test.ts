import { describe, it, expect } from 'vitest'
import { parseMeditationProgram } from './parser'

describe('parseMeditationProgram', () => {
  it('should parse empty string to empty array', () => {
    const result = parseMeditationProgram('')
    expect(result).toEqual([])
  })

  it('should parse a single day with one practice', () => {
    const markdown = `
## День 1: Основы внимания

**Цель дня:** Научиться концентрации

### Практика 1: Дыхание (5 минут)

**Что делать:** Сядьте удобно
**На чём фокусироваться:** На дыхании
**На чём НЕ фокусироваться:** На мыслях
`
    const result = parseMeditationProgram(markdown)

    expect(result).toHaveLength(1)
    expect(result[0].number).toBe(1)
    expect(result[0].title).toBe('Основы внимания')
    expect(result[0].goal).toBe('Научиться концентрации')
    expect(result[0].practices).toHaveLength(1)
    expect(result[0].practices[0].id).toBe('day-1-practice-1')
    expect(result[0].practices[0].title).toBe('Дыхание')
    expect(result[0].practices[0].duration).toBe(5)
    expect(result[0].practices[0].category).toBe('program')
    expect(result[0].practices[0].instructions.whatToDo).toBe('Сядьте удобно')
    expect(result[0].practices[0].instructions.focusOn).toBe('На дыхании')
    expect(result[0].practices[0].instructions.dontFocusOn).toBe('На мыслях')
    expect(result[0].practices[0].isMain).toBe(false)
    expect(result[0].practices[0].isFromProgram).toBe(true)
  })

  it('should mark main practice correctly', () => {
    const markdown = `
## День 1: Тест

**Цель дня:** Тестовая цель

### Практика 1: Главная практика (10 минут) — основная практика

**Что делать:** Делать
**На чём фокусироваться:** Фокус
**На чём НЕ фокусироваться:** Нет
`
    const result = parseMeditationProgram(markdown)

    expect(result[0].practices[0].isMain).toBe(true)
  })

  it('should parse multiple days in correct order', () => {
    const markdown = `
## День 2: Второй день

**Цель дня:** Цель 2

### Практика 1: П1 (5 минут)

**Что делать:** Д1
**На чём фокусироваться:** Ф1
**На чём НЕ фокусироваться:** Н1

## День 1: Первый день

**Цель дня:** Цель 1

### Практика 1: П2 (5 минут)

**Что делать:** Д2
**На чём фокусироваться:** Ф2
**На чём НЕ фокусироваться:** Н2
`
    const result = parseMeditationProgram(markdown)

    expect(result).toHaveLength(2)
    expect(result[0].number).toBe(1)
    expect(result[1].number).toBe(2)
  })

  it('should parse multiple practices in one day', () => {
    const markdown = `
## День 1: Много практик

**Цель дня:** Много целей

### Практика 1: Первая (5 минут)

**Что делать:** Делать 1
**На чём фокусироваться:** Фокус 1
**На чём НЕ фокусироваться:** Нет 1

### Практика 2: Вторая (10 минут) — основная практика

**Что делать:** Делать 2
**На чём фокусироваться:** Фокус 2
**На чём НЕ фокусироваться:** Нет 2

### Практика 3: Третья (3 минуты)

**Что делать:** Делать 3
**На чём фокусироваться:** Фокус 3
**На чём НЕ фокусироваться:** Нет 3
`
    const result = parseMeditationProgram(markdown)

    expect(result[0].practices).toHaveLength(3)
    expect(result[0].practices[0].title).toBe('Первая')
    expect(result[0].practices[1].title).toBe('Вторая')
    expect(result[0].practices[1].isMain).toBe(true)
    expect(result[0].practices[2].title).toBe('Третья')
  })

  it('should parse duration with multiplication format as first number', () => {
    const markdown = `
## День 1: Тест

**Цель дня:** Цель

### Практика 1: С умножением (3 x 5 минут)

**Что делать:** Делать
**На чём фокусироваться:** Фокус
**На чём НЕ фокусироваться:** Нет
`
    const result = parseMeditationProgram(markdown)

    // Parser extracts first number from duration string
    expect(result[0].practices[0].duration).toBe(3)
  })

  it('should handle missing goal gracefully', () => {
    const markdown = `
## День 1: Без цели

### Практика 1: Практика (5 минут)

**Что делать:** Делать
**На чём фокусироваться:** Фокус
**На чём НЕ фокусироваться:** Нет
`
    const result = parseMeditationProgram(markdown)

    expect(result[0].goal).toBe('')
  })

  it('should clean text from source references', () => {
    const markdown = `
## День 1: Тест

**Цель дня:** Цель

### Практика 1: Практика (5 минут)

**Что делать:** Делать что-то[1] с ссылками[2]
**На чём фокусироваться:** Фокус
**На чём НЕ фокусироваться:** Нет
`
    const result = parseMeditationProgram(markdown)

    expect(result[0].practices[0].instructions.whatToDo).toBe('Делать что-то с ссылками')
  })

  it('should skip sections without practices', () => {
    const markdown = `
## День 1: Только заголовок

**Цель дня:** Цель
`
    const result = parseMeditationProgram(markdown)

    expect(result).toHaveLength(0)
  })

  it('should default duration to 5 when not specified', () => {
    const markdown = `
## День 1: Тест

**Цель дня:** Цель

### Практика 1: Без длительности

**Что делать:** Делать
**На чём фокусироваться:** Фокус
**На чём НЕ фокусироваться:** Нет
`
    const result = parseMeditationProgram(markdown)

    expect(result[0].practices[0].duration).toBe(5)
  })
})
