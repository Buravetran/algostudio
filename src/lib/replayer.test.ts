import { describe, expect, it } from 'vitest'
import { mulberry32 } from './rng'
import { Replayer } from './replayer'

interface S { sum: number; list: number[] }
const fresh = (): S => ({ sum: 0, list: [] })
const apply = (s: S, e: number) => {
  s.sum += e
  s.list.push(e)
}
const clone = (s: S): S => ({ sum: s.sum, list: [...s.list] })
const reference = (events: number[], t: number): S => {
  const s = fresh()
  for (let i = 0; i < t; i++) apply(s, events[i])
  return s
}
const events = Array.from({ length: 1000 }, (_, i) => (i * 7) % 13)

describe('Replayer', () => {
  it('matches a full replay for 300 random seeks in both directions', () => {
    const rnd = mulberry32(3)
    const r = new Replayer(events, fresh, apply, clone)
    for (let k = 0; k < 300; k++) {
      const t = Math.floor(rnd() * (events.length + 1))
      expect(r.seek(t)).toEqual(reference(events, t))
    }
  })

  it('rewinds with bounded cost: at most interval - 1 events, not a full replay', () => {
    const r = new Replayer(events, fresh, apply, clone, 50)
    r.seek(500)
    const before = r.applied
    expect(r.seek(499)).toEqual(reference(events, 499))
    expect(r.applied - before).toBeLessThanOrEqual(49)
  })

  it('never corrupts its stored snapshots', () => {
    const r = new Replayer(events, fresh, apply, clone, 50)
    r.seek(120)
    r.seek(60) // restores the snapshot at 50 and replays forward
    r.seek(120)
    expect(r.seek(60)).toEqual(reference(events, 60))
    expect(r.seek(120)).toEqual(reference(events, 120))
  })

  it('stores one snapshot per interval passed', () => {
    const r = new Replayer(events, fresh, apply, clone, 50)
    r.seek(240)
    expect(r.snapshotCount).toBe(4)
  })

  it('falls back to a full replay when there is no clone function', () => {
    const r = new Replayer(events, fresh, apply)
    r.seek(300)
    expect(r.seek(120)).toEqual(reference(events, 120))
    expect(r.snapshotCount).toBe(0)
  })

  it('clamps out-of-range positions', () => {
    const r = new Replayer(events, fresh, apply, clone)
    expect(r.seek(-5)).toEqual(reference(events, 0))
    expect(r.seek(99999)).toEqual(reference(events, events.length))
  })
})
