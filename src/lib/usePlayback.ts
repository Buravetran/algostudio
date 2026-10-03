import { useEffect, useMemo, useRef, useState } from 'react'

/**
 * Generic playback over an event list. Time is controlled here only:
 * algorithms never see speed. Stepping back replays from the start;
 * add periodic snapshots here when event lists get long.
 */
export function usePlayback<E, S>(events: E[], fresh: () => S, apply: (s: S, e: E) => void) {
  const [raw, setRaw] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [speed, setSpeed] = useState(4)
  const freshRef = useRef(fresh)
  freshRef.current = fresh
  const cache = useRef<{ events: E[]; pos: number; state: S } | null>(null)
  const pos = Math.min(raw, events.length)

  const state = useMemo(() => {
    let c = cache.current
    if (!c || c.events !== events || pos < c.pos) c = { events, pos: 0, state: freshRef.current() }
    while (c.pos < pos) apply(c.state, events[c.pos++])
    cache.current = c
    return c.state
  }, [events, pos, apply])

  useEffect(() => {
    setRaw(0)
    setPlaying(false)
  }, [events])

  useEffect(() => {
    if (playing && pos >= events.length) setPlaying(false)
  }, [playing, pos, events])

  useEffect(() => {
    if (!playing) return
    const t = setInterval(() => setRaw((p) => Math.min(p + 1, events.length)), 240 / speed)
    return () => clearInterval(t)
  }, [playing, speed, events])

  return {
    state,
    pos,
    total: events.length,
    playing,
    speed,
    setSpeed,
    seek: (n: number) => {
      setPlaying(false)
      setRaw(Math.max(0, Math.min(events.length, n)))
    },
    toggle: () => {
      if (playing) return setPlaying(false)
      if (pos >= events.length) setRaw(0)
      setPlaying(true)
    },
  }
}
