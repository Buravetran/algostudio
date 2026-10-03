import type { SortAlgoId, SortEvent } from '../types'

/**
 * Pure sorting algorithms that emit events instead of touching any UI.
 * Replaying the SWAP and SET events on a copy of the input yields the sorted array.
 */
export function sortEvents(algo: SortAlgoId, input: readonly number[]): SortEvent[] {
  const a = [...input]
  const n = a.length
  const ev: SortEvent[] = []
  if (n === 0) return [{ type: 'END' }]

  const cmp = (i: number, j: number) => {
    ev.push({ type: 'CMP', i, j })
    return a[i] > a[j]
  }
  const swap = (i: number, j: number) => {
    ;[a[i], a[j]] = [a[j], a[i]]
    ev.push({ type: 'SWAP', i, j })
  }
  const set = (i: number, value: number) => {
    a[i] = value
    ev.push({ type: 'SET', i, value })
  }
  const ok = (index: number) => ev.push({ type: 'OK', index })

  switch (algo) {
    case 'bubble':
      for (let end = n - 1; end > 0; end--) {
        for (let i = 0; i < end; i++) if (cmp(i, i + 1)) swap(i, i + 1)
        ok(end)
      }
      ok(0)
      break
    case 'selection':
      for (let i = 0; i < n - 1; i++) {
        let min = i
        for (let j = i + 1; j < n; j++) if (cmp(min, j)) min = j
        if (min !== i) swap(i, min)
        ok(i)
      }
      ok(n - 1)
      break
    case 'insertion':
      for (let i = 1; i < n; i++) for (let j = i; j > 0 && cmp(j - 1, j); j--) swap(j - 1, j)
      for (let i = 0; i < n; i++) ok(i)
      break
    case 'merge': {
      const sort = (lo: number, hi: number) => {
        if (lo >= hi) return
        const mid = (lo + hi) >> 1
        sort(lo, mid)
        sort(mid + 1, hi)
        const left = a.slice(lo, mid + 1)
        const right = a.slice(mid + 1, hi + 1)
        let i = 0
        let j = 0
        let k = lo
        while (i < left.length && j < right.length) {
          ev.push({ type: 'CMP', i: lo + i, j: mid + 1 + j })
          set(k++, left[i] <= right[j] ? left[i++] : right[j++])
        }
        while (i < left.length) set(k++, left[i++])
        while (j < right.length) set(k++, right[j++])
      }
      sort(0, n - 1)
      for (let i = 0; i < n; i++) ok(i)
      break
    }
    case 'quick': {
      // Lomuto partition, last element as pivot: one clear deterministic strategy.
      const sort = (lo: number, hi: number) => {
        if (lo > hi) return
        if (lo === hi) {
          ok(lo)
          return
        }
        ev.push({ type: 'PIVOT', index: hi })
        let p = lo
        for (let j = lo; j < hi; j++) {
          if (!cmp(j, hi)) {
            if (p !== j) swap(p, j)
            p++
          }
        }
        if (p !== hi) swap(p, hi)
        ok(p)
        sort(lo, p - 1)
        sort(p + 1, hi)
      }
      sort(0, n - 1)
      break
    }
  }
  ev.push({ type: 'END' })
  return ev
}
