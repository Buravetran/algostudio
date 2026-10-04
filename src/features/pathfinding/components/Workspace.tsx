import { useEffect, useMemo, useState } from 'react'
import { search } from '../algorithms/search'
import { ALGOS, INFO, LINE, PSEUDO } from '../content'
import { applyEvent, freshState } from '../engine/reducer'
import { explain } from '../engine/explain'
import { usePlayback } from '../../../lib/usePlayback'
import { createProblem, idOf, label } from '../grid'
import { generateMaze } from '../maze'
import { decode, encode } from '../share'
import type { Experiment } from '../share'
import type { AlgoId, Problem } from '../types'
import { PlaybackBar } from '../../../components/PlaybackBar'
import { ComparePanel } from './ComparePanel'
import { Grid } from './Grid'
import type { DragMode } from './Grid'

type Tool = 'wall' | 'weight' | 'erase'
const STORE = 'algostudio:pathfinding:v1'

function defaultProblem(): Problem {
  const p = createProblem(14, 24)
  for (let r = 3; r < 11; r++) p.walls[idOf(p.cols, r, 12)] = 1
  for (const r of [3, 7, 10]) p.walls[idOf(p.cols, r, 12)] = 0
  return p
}

/** Shared link wins, then the last local session, then the default grid. */
function loadInitial(): { exp: Experiment; notice: string } {
  const fallback: Experiment = { algo: 'astar', problem: defaultProblem() }
  try {
    const m = location.hash.match(/^#x=(.+)$/)
    if (m) {
      const exp = decode(decodeURIComponent(m[1]))
      return exp
        ? { exp, notice: 'Loaded the shared experiment.' }
        : { exp: fallback, notice: 'That shared link could not be loaded because its data is invalid. Showing the default grid.' }
    }
    const saved = localStorage.getItem(STORE)
    const exp = saved ? decode(saved) : null
    if (exp) return { exp, notice: '' }
  } catch {
    /* storage unavailable: fall through to the default */
  }
  return { exp: fallback, notice: '' }
}

export function Workspace({ initialAlgo }: { initialAlgo?: AlgoId }) {
  const [init] = useState(loadInitial)
  const [problem, setProblem] = useState(init.exp.problem)
  const [algo, setAlgo] = useState<AlgoId>(initialAlgo ?? init.exp.algo)
  const [tool, setTool] = useState<Tool>('wall')
  const [notice, setNotice] = useState(init.notice)
  const [predict, setPredict] = useState(false)
  const [score, setScore] = useState({ right: 0, total: 0 })
  const [verdict, setVerdict] = useState('')

  const events = useMemo(() => search(algo, problem), [algo, problem])
  const size = problem.rows * problem.cols
  const pb = usePlayback(events, () => freshState(size), applyEvent)
  const e = pb.pos > 0 ? events[pb.pos - 1] : undefined
  const viz = pb.state
  const line = e ? LINE[e.type] : 0

  useEffect(() => {
    try {
      localStorage.setItem(STORE, encode({ algo, problem }))
    } catch {
      /* ignore */
    }
  }, [algo, problem])

  useEffect(() => setVerdict(''), [events])

  const edit = (n: number, mode: DragMode) =>
    setProblem((prev) => {
      const next: Problem = { ...prev, walls: prev.walls.slice(), cost: prev.cost.slice() }
      if (mode === 'start' && n !== prev.target) {
        next.start = n
        next.walls[n] = 0
      } else if (mode === 'target' && n !== prev.start) {
        next.target = n
        next.walls[n] = 0
      } else if (mode === 'paint' && n !== prev.start && n !== prev.target) {
        const wall = tool === 'wall' ? 1 : 0
        const cost = tool === 'weight' ? 5 : 1
        if (prev.walls[n] === wall && prev.cost[n] === cost) return prev
        next.walls[n] = wall
        next.cost[n] = cost
      } else return prev
      return next
    })

  const randomize = () =>
    setProblem((prev) => {
      const next = { ...prev, walls: new Uint8Array(size), cost: new Uint8Array(size).fill(1) }
      for (let n = 0; n < size; n++) if (n !== prev.start && n !== prev.target && Math.random() < 0.25) next.walls[n] = 1
      return next
    })

  const share = async () => {
    const url = `${location.origin}${location.pathname}#x=${encodeURIComponent(encode({ algo, problem }))}`
    history.replaceState(null, '', url)
    try {
      await navigator.clipboard.writeText(url)
      setNotice('Share link copied. Anyone who opens it sees this grid and algorithm.')
    } catch {
      setNotice('Could not copy automatically. The link is now in the address bar, so copy it from there.')
    }
  }

  // Predict mode: the answer is already in the event list, so grading needs no extra algorithm code.
  const nextPop = useMemo(() => events.findIndex((ev, i) => i >= pb.pos && ev.type === 'POP'), [events, pb.pos])
  const pick = (n: number) => {
    const ev = events[nextPop]
    if (!ev || ev.type !== 'POP') {
      setVerdict('No more steps to predict. Press Restart to try again.')
      return
    }
    const ok = n === ev.node
    setScore((s) => ({ right: s.right + (ok ? 1 : 0), total: s.total + 1 }))
    setVerdict((ok ? 'Correct. ' : `Not quite. You picked ${label(problem, n)}; the algorithm took ${label(problem, ev.node)}. `) + explain(ev, algo, problem))
    pb.seek(nextPop + 1)
  }

  useEffect(() => {
    const onKey = (ev: KeyboardEvent) => {
      const t = ev.target as HTMLElement
      if (/^(INPUT|SELECT|BUTTON|TEXTAREA)$/.test(t.tagName)) return
      if (ev.key === 'ArrowRight') pb.seek(pb.pos + 1)
      else if (ev.key === 'ArrowLeft') pb.seek(pb.pos - 1)
      else if (ev.key === ' ') {
        ev.preventDefault()
        pb.toggle()
      }
    }
    addEventListener('keydown', onKey)
    return () => removeEventListener('keydown', onKey)
  })

  const status = pb.pos === 0 ? 'Ready' : viz.done ? (viz.found ? 'Completed' : 'No solution') : pb.playing ? 'Running' : 'Paused'
  const info = INFO[algo]

  return (
    <>
      <header>
        <span className="muted">Algorithms / Pathfinding / {ALGOS.find((a) => a.id === algo)!.name}</span>
        <span className="status mono">{status}</span>
      </header>
      <main className="lab">
        <div className="col">
          <section className="panel">
            <h2>Controls</h2>
            <div className="stack">
              <select value={algo} onChange={(ev) => setAlgo(ev.target.value as AlgoId)} aria-label="Algorithm">
                {ALGOS.map((a) => (
                  <option key={a.id} value={a.id}>{a.name}</option>
                ))}
              </select>
              <select value={tool} onChange={(ev) => setTool(ev.target.value as Tool)} aria-label="Drawing tool">
                <option value="wall">Draw walls</option>
                <option value="weight">Draw weight (cost 5)</option>
                <option value="erase">Erase</option>
              </select>
              <button onClick={() => setProblem(generateMaze(problem.rows, problem.cols, Math.floor(Math.random() * 2 ** 31)))}>Generate maze</button>
              <button onClick={randomize}>Random walls</button>
              <button onClick={() => setProblem(createProblem(problem.rows, problem.cols))}>Clear grid</button>
              <button onClick={share}>Copy share link</button>
            </div>
            <p className="note" role="status">{notice || 'Drag to draw. Drag S or T to move them. Any edit resets the run. BFS and DFS ignore weights. Your last grid is saved in this browser.'}</p>
          </section>
          <section className="panel">
            <h2>Challenge</h2>
            <button aria-pressed={predict} onClick={() => { setPredict((p) => !p); setVerdict('') }}>
              {predict ? 'Predict mode: on' : 'Predict mode: off'}
            </button>
            {predict && <p className="note">Click the cell you think the algorithm takes next. Score: {score.right} / {score.total}</p>}
          </section>
        </div>

        <div className="col">
          <section className="panel">
            <Grid problem={problem} viz={viz} onPaint={edit} onPick={predict ? pick : undefined} />
            <div className="legend">
              <span><i className="sw start" />S start</span>
              <span><i className="sw target" />T target</span>
              <span><i className="sw frontier" />discovered</span>
              <span><i className="sw visited" />visited</span>
              <span><i className="sw current" />current</span>
              <span><i className="sw path" />• path</span>
              <span><i className="sw wall" />wall</span>
              <span>5 = weight</span>
            </div>
          </section>
          <ComparePanel problem={problem} />
        </div>

        <div className="col">
          <section className="panel">
            <h2>What is happening</h2>
            <div className="explain" aria-live={predict ? 'polite' : 'off'}>{predict && verdict ? verdict : explain(e, algo, problem)}</div>
          </section>
          <section className="panel mono small">
            <h2>About</h2>
            Time: {info.time}<br />Space: {info.space}<br />{info.note}
          </section>
          <section className="panel">
            <h2>Pseudocode</h2>
            <div className="code mono">
              {PSEUDO[algo].map((l, i) => (
                <div key={i} className={i + 1 === line ? 'on' : ''}>{String(i + 1).padStart(2, '0')} {l}</div>
              ))}
            </div>
          </section>
          <section className="panel">
            <h2>Statistics</h2>
            <dl className="mono">
              <dt>Nodes expanded</dt><dd>{viz.expanded}</dd>
              <dt>Nodes discovered</dt><dd>{viz.discoveredCount}</dd>
              <dt>Cost updates</dt><dd>{viz.updates}</dd>
              <dt>Path cost</dt><dd>{viz.cost ?? '–'}</dd>
              <dt>Events (total)</dt><dd>{events.length}</dd>
            </dl>
            <p className="note">These are algorithmic counts. They depend on the grid, weights and heuristic.</p>
          </section>
          <section className="panel">
            <h2>Current event</h2>
            <pre className="mono small event">{e ? JSON.stringify(e.type === 'PATH' ? { ...e, path: `[${e.path.length} nodes]` } : e) : '(no event yet)'}</pre>
          </section>
        </div>
      </main>

      <PlaybackBar pb={pb} />
      <div className="sr" aria-live="polite">
        {viz.done ? (viz.found ? `Algorithm completed. Path found. Cost ${viz.cost}.` : 'Algorithm completed. No path.') : ''}
      </div>
    </>
  )
}
