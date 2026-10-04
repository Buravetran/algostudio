import { describe, expect, it } from 'vitest'
import { decodeSort, encodeSort } from './share'

describe('sorting share encoding', () => {
  it('round-trips algorithm and array', () => {
    const exp = { algo: 'quick' as const, arr: [8, 3, 5, 1, 9, 2, 999, 1] }
    expect(decodeSort(encodeSort(exp))).toEqual(exp)
  })

  it('rejects malformed input instead of throwing', () => {
    const bad = [
      '',
      'nonsense',
      's2,quick,1.2.3',
      's1,magic,1.2.3',
      's1,quick,5',
      's1,quick,1.x.3',
      's1,quick,1.2.0',
      's1,quick,1.2.1000',
      's1,quick,1..3',
      's1,quick,1.2.3,extra',
      `s1,quick,${Array(81).fill(5).join('.')}`,
    ]
    for (const s of bad) expect(decodeSort(s)).toBeNull()
  })
})
