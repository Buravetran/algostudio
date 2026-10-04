import { useEffect, useMemo, useState } from 'react'
import { Replayer } from './replayer'

/**
 * Generic playback over an event list. Time is controlled here only:
 * algorithms never see speed. Rewinding uses periodic snapshots (see Replayer).
 */
export function usePlayback<E, S>(events: E[], fresh: () => S, apply: (s: S, e: E) => void, clone?: (s: S) => S) {
  const [raw, setRaw] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [speed, setSpeed] = useState(4)
  const pos = Math.min(raw, events.length)

  // A new Replayer per event list. `fresh` is read when the events change, which is when its inputs change too.
  const replayer = useMemo(() => new Replayer(events, fresh, apply, clone), [events, apply, clone]) // eslint-disable-line react-hooks/exhaustive-deps
  const state = useMemo(() => replayer.seek(pos), [replayer, pos])

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
