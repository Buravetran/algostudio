import type { SortEvent } from './types'

const KINDS = ['CMP', 'SWAP', 'SET', 'PIVOT'] as const
type Kind = (typeof KINDS)[number]

export interface Question {
  kind: Kind
  prompt: string
  options: string[]
  correct: number
  /** Index in the event list of the event the question asks about. */
  eventIndex: number
}

const PROMPT: Record<Kind, string> = {
  CMP: 'Which two positions will be compared next?',
  SWAP: 'Which two positions will be swapped next?',
  SET: 'Which position will be written next?',
  PIVOT: 'Which position becomes the pivot next?',
}

function shuffle<T>(a: T[], rnd: () => number): T[] {
  const b = [...a]
  for (let i = b.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1))
    ;[b[i], b[j]] = [b[j], b[i]]
  }
  return b
}

/**
 * Builds a question about the next event of a random kind, starting at event index `pos`.
 * The answer comes straight from the event list, so grading needs no extra algorithm code.
 */
export function makeQuestion(events: SortEvent[], pos: number, n: number, rnd: () => number): Question | null {
  const found: { kind: Kind; index: number }[] = []
  for (const kind of KINDS) {
    const index = events.findIndex((e, i) => i >= pos && e.type === kind)
    if (index >= 0) found.push({ kind, index })
  }
  if (found.length === 0) return null
  const { kind, index } = found[Math.floor(rnd() * found.length)]
  const e = events[index]

  const options = new Map<string, true>()
  let truth: string
  if (e.type === 'CMP' || e.type === 'SWAP') {
    const a = e.i
    const b = e.j
    const label = (x: number, y: number) => `positions ${x} and ${y}`
    truth = label(a, b)
    const near: [number, number][] = [[a - 1, b], [a, b + 1], [a + 1, b + 1], [a - 1, b - 1], [a, b - 1], [a + 1, b]]
    const valid = ([x, y]: [number, number]) => x >= 0 && x < y && y < n && label(x, y) !== truth
    for (const [x, y] of shuffle(near.filter(valid), rnd)) if (options.size < 2) options.set(label(x, y), true)
    for (let t = 0; t < 40 && options.size < 2; t++) {
      const x = Math.floor(rnd() * n)
      const y = Math.floor(rnd() * n)
      if (valid([x, y])) options.set(label(x, y), true)
    }
  } else {
    const p = e.type === 'SET' ? e.i : e.type === 'PIVOT' ? e.index : -1
    const label = (x: number) => `position ${x}`
    truth = label(p)
    const valid = (x: number) => x >= 0 && x < n && label(x) !== truth
    for (const x of shuffle([p - 2, p - 1, p + 1, p + 2].filter(valid), rnd)) if (options.size < 2) options.set(label(x), true)
    for (let t = 0; t < 40 && options.size < 2; t++) {
      const x = Math.floor(rnd() * n)
      if (valid(x)) options.set(label(x), true)
    }
  }
  if (options.size < 1) return null
  const all = shuffle([truth, ...options.keys()], rnd)
  return { kind, prompt: PROMPT[kind], options: all, correct: all.indexOf(truth), eventIndex: index }
}
