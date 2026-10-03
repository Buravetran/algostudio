import { describe, expect, it } from 'vitest'
import { MinHeap } from './heap'

describe('MinHeap', () => {
  it('returns undefined when empty', () => {
    expect(new MinHeap<number>().pop()).toBeUndefined()
  })

  it('extracts in priority order', () => {
    const h = new MinHeap<string>()
    h.push(5, 'e')
    h.push(1, 'a')
    h.push(3, 'c')
    h.push(2, 'b')
    h.push(4, 'd')
    const out: string[] = []
    while (h.size) out.push(h.pop()!)
    expect(out).toEqual(['a', 'b', 'c', 'd', 'e'])
  })

  it('keeps insertion order for equal priorities', () => {
    const h = new MinHeap<string>()
    ;['x', 'y', 'z'].forEach((v) => h.push(1, v))
    expect([h.pop(), h.pop(), h.pop()]).toEqual(['x', 'y', 'z'])
  })

  it('handles interleaved push and pop', () => {
    const h = new MinHeap<number>()
    h.push(5, 5)
    h.push(2, 2)
    expect(h.pop()).toBe(2)
    h.push(1, 1)
    expect(h.pop()).toBe(1)
    expect(h.pop()).toBe(5)
    expect(h.size).toBe(0)
  })

  it('sorts 500 pseudo-random values', () => {
    const h = new MinHeap<number>()
    let s = 12345
    const vals = Array.from({ length: 500 }, () => {
      s = (s * 1103515245 + 12345) & 0x7fffffff
      return s % 1000
    })
    vals.forEach((v) => h.push(v, v))
    const out: number[] = []
    while (h.size) out.push(h.pop()!)
    expect(out).toEqual([...vals].sort((a, b) => a - b))
  })
})
