import { describe, expect, it } from 'vitest'
import { mulberry32 } from '../../lib/rng'
import { PRESETS, makeArray, parseArray } from './arrays'

describe('makeArray', () => {
  it('produces the requested length for every preset', () => {
    for (const p of PRESETS) expect(makeArray(p, 30, mulberry32(1))).toHaveLength(30)
  })
  it('Reversed is non-increasing and Few unique has at most 3 distinct values', () => {
    const r = makeArray('Reversed', 30, mulberry32(2))
    for (let i = 1; i < r.length; i++) expect(r[i - 1]).toBeGreaterThanOrEqual(r[i])
    expect(new Set(makeArray('Few unique', 40, mulberry32(3))).size).toBeLessThanOrEqual(3)
  })
})

describe('parseArray', () => {
  it('accepts brackets, commas and spaces', () => {
    expect(parseArray('[8, 3, 5, 1, 9, 2]')).toEqual({ ok: true, values: [8, 3, 5, 1, 9, 2] })
    expect(parseArray('4 2 9')).toEqual({ ok: true, values: [4, 2, 9] })
  })
  it('explains each kind of invalid input', () => {
    const msg = (s: string) => {
      const r = parseArray(s)
      return r.ok ? '' : r.error
    }
    expect(msg('')).toContain('at least two')
    expect(msg('7')).toContain('at least two')
    expect(msg('3, x, 5')).toContain('"x"')
    expect(msg('3, 2.5')).toContain('"2.5"')
    expect(msg('0, 5')).toContain('between 1 and 999')
    expect(msg(Array(81).fill(5).join(','))).toContain('at most 80')
  })
})
