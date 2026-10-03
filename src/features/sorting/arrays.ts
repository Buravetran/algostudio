export const PRESETS = ['Random', 'Nearly sorted', 'Reversed', 'Few unique', 'Many duplicates'] as const
export type Preset = (typeof PRESETS)[number]
export const MAX_VALUES = 80

export function makeArray(preset: Preset, n: number, rnd: () => number): number[] {
  const value = () => 5 + Math.floor(rnd() * 95)
  const a = Array.from({ length: n }, value)
  switch (preset) {
    case 'Nearly sorted': {
      a.sort((x, y) => x - y)
      for (let k = 0; k < Math.max(1, Math.floor(n / 10)); k++) {
        const i = Math.floor(rnd() * n)
        const j = Math.floor(rnd() * n)
        ;[a[i], a[j]] = [a[j], a[i]]
      }
      return a
    }
    case 'Reversed':
      return a.sort((x, y) => y - x)
    case 'Few unique':
      return a.map(() => [20, 50, 80][Math.floor(rnd() * 3)])
    case 'Many duplicates': {
      const levels = Math.max(2, Math.floor(n / 5))
      return a.map(() => 10 + 10 * Math.floor(rnd() * levels))
    }
    default:
      return a
  }
}

export type ParseResult = { ok: true; values: number[] } | { ok: false; error: string }

/** Validates custom input and explains what is wrong instead of silently fixing it. */
export function parseArray(text: string): ParseResult {
  const parts = text.trim().replace(/^\[|\]$/g, '').split(/[\s,]+/).filter(Boolean)
  if (parts.length < 2) return { ok: false, error: 'Please enter at least two values, separated by commas. Example: 8, 3, 5, 1.' }
  if (parts.length > MAX_VALUES) return { ok: false, error: `Please use at most ${MAX_VALUES} values so the bars stay readable.` }
  const bad = parts.find((p) => !/^-?\d+$/.test(p))
  if (bad !== undefined) return { ok: false, error: `"${bad}" is not a whole number. Use whole numbers like 8, 3, 5.` }
  const values = parts.map(Number)
  if (values.some((v) => v < 1 || v > 999)) return { ok: false, error: 'Values must be between 1 and 999.' }
  return { ok: true, values }
}
