/**
 * Replays an event list to any position. Moving forward applies events one by one.
 * While moving forward it stores a snapshot of the state every `interval` events, so moving
 * backward restores the nearest earlier snapshot and replays at most `interval - 1` events
 * instead of replaying from the start. Without a `clone` function it falls back to a full replay.
 */
export class Replayer<E, S> {
  private pos = 0
  private state: S
  private snaps = new Map<number, S>()
  /** Number of apply() calls so far. Exposed so tests can check the rewind cost. */
  applied = 0

  constructor(
    private events: E[],
    private fresh: () => S,
    private apply: (s: S, e: E) => void,
    private clone?: (s: S) => S,
    private interval = 50,
  ) {
    this.state = fresh()
  }

  get snapshotCount(): number {
    return this.snaps.size
  }

  /** Returns the state after the first `target` events. The returned object is reused: don't mutate it. */
  seek(target: number): S {
    const t = Math.max(0, Math.min(this.events.length, target))
    if (t < this.pos) this.restore(t)
    while (this.pos < t) {
      this.apply(this.state, this.events[this.pos++])
      this.applied++
      if (this.clone && this.pos % this.interval === 0 && !this.snaps.has(this.pos)) {
        this.snaps.set(this.pos, this.clone(this.state))
      }
    }
    return this.state
  }

  private restore(t: number): void {
    let s = Math.floor(t / this.interval) * this.interval
    while (s > 0 && !this.snaps.has(s)) s -= this.interval
    if (s > 0 && this.clone) {
      this.state = this.clone(this.snaps.get(s)!) // copy, so the stored snapshot is never mutated
      this.pos = s
    } else {
      this.state = this.fresh()
      this.pos = 0
    }
  }
}
