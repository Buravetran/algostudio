import { describe, expect, it } from 'vitest'
import { ALGOS } from '../pathfinding/content'
import { SORT_ALGOS } from '../sorting/content'
import { LESSONS } from './lessons'

describe('lessons', () => {
  it('cover every algorithm exactly once, in the right laboratory', () => {
    const path = LESSONS.filter((l) => l.lab === 'pathfinding').map((l) => l.id).sort()
    const sort = LESSONS.filter((l) => l.lab === 'sorting').map((l) => l.id).sort()
    expect(path).toEqual(ALGOS.map((a) => a.id).sort())
    expect(sort).toEqual(SORT_ALGOS.map((a) => a.id).sort())
  })

  it('are complete: every section filled, at least two questions', () => {
    for (const l of LESSONS) {
      for (const text of [l.name, l.intuition, l.problem, l.structures, l.assumptions]) expect(text.length).toBeGreaterThan(5)
      expect(l.how.length).toBeGreaterThanOrEqual(3)
      expect(l.mistakes.length).toBeGreaterThanOrEqual(2)
      expect(l.questions.length).toBeGreaterThanOrEqual(2)
      for (const q of l.questions) {
        expect(q.q.endsWith('?')).toBe(true)
        expect(q.a.length).toBeGreaterThan(10)
      }
    }
  })
})
