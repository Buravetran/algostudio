export interface PlaybackControls {
  pos: number
  total: number
  playing: boolean
  speed: number
  setSpeed: (n: number) => void
  seek: (n: number) => void
  toggle: () => void
}

/** Shared by every laboratory: restart, step, play, scrub, speed. */
export function PlaybackBar({ pb }: { pb: PlaybackControls }) {
  return (
    <div className="playback">
      <button aria-label="Restart" disabled={pb.pos === 0} onClick={() => pb.seek(0)}>⏮</button>
      <button aria-label="Previous step" disabled={pb.pos === 0} onClick={() => pb.seek(pb.pos - 1)}>◀</button>
      <button onClick={pb.toggle}>{pb.playing ? '⏸ Pause' : '▶ Play'}</button>
      <button aria-label="Next step" disabled={pb.pos >= pb.total} onClick={() => pb.seek(pb.pos + 1)}>▶|</button>
      <input type="range" min={0} max={pb.total} value={pb.pos} aria-label="Timeline" onChange={(ev) => pb.seek(Number(ev.target.value))} />
      <span className="mono">Step {pb.pos} / {pb.total}</span>
      <label>
        Speed{' '}
        <select value={pb.speed} onChange={(ev) => pb.setSpeed(Number(ev.target.value))}>
          {[1, 2, 4, 8, 16].map((s) => (
            <option key={s} value={s}>{s}x</option>
          ))}
        </select>
      </label>
    </div>
  )
}
