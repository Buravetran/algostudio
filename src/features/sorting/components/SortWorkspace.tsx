import { useEffect, useMemo, useState } from 'react'
import { PlaybackBar } from '../../../components/PlaybackBar'
import { usePlayback } from '../../../lib/usePlayback'
import { PRESETS, makeArray, parseArray } from '../arrays'
import type { Preset } from '../arrays'
import { sortEvents } from '../algorithms/sort'
import { SORT_ALGOS, SORT_INFO, SORT_PSEUDO, sortLine } from '../content'
import { explainSort } from '../engine/explain'
import { applySortEvent, freshSortState } from '../engine/reducer'
import type { SortAlgoId } from '../types'
import { Bars } from './Bars'
import { SortComparePanel } from './SortComparePanel'

export function SortWorkspace() {
  const [algo, setAlgo] = useState<SortAlgoId>('merge')
  const [preset, setPreset] = useState<Preset>('Random')
  const [size, setSize] = useState(20)
  const [arr, setArr] = useState(() => makeArray('Random', 20, Math.random))
  const [text, setText] = useState('')
  const [error, setError] = useState('')

  const events = useMemo(() => sortEvents(algo, arr), [algo, arr])
  const pb = usePlayback(events, () => freshSortState(arr), applySortEvent)
  const viz = pb.state
  const e = pb.pos > 0 ? events[pb.pos - 1] : undefined
  const line = sortLine(algo, e)
  const info = SORT_INFO[algo]
  const name = SORT_ALGOS.find((a) => a.id === algo)!.name

  const regen = (p: Preset, n: number) => {
    setArr(makeArray(p, n, Math.random))
    setError('')
  }

  const applyCustom = () => {
    const r = parseArray(text)
    if (!r.ok) return setError(r.error)
    setError('')
    setArr(r.values)
    setSize(r.values.length)
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

  const status = pb.pos === 0 ? 'Ready' : viz.done ? 'Completed' : pb.playing ? 'Running' : 'Paused'

  return (
    <>
      <header>
        <span className="muted">Algorithms / Sorting / {name}</span>
        <span className="status mono">{status}</span>
      </header>
      <main className="lab">
        <div className="col">
          <section className="panel">
            <h2>Controls</h2>
            <div className="stack">
              <select value={algo} onChange={(ev) => setAlgo(ev.target.value as SortAlgoId)} aria-label="Algorithm">
                {SORT_ALGOS.map((a) => (
                  <option key={a.id} value={a.id}>{a.name}</option>
                ))}
              </select>
              <select value={preset} aria-label="Initial order" onChange={(ev) => { const p = ev.target.value as Preset; setPreset(p); regen(p, size) }}>
                {PRESETS.map((p) => (
                  <option key={p}>{p}</option>
                ))}
              </select>
              <label>
                Size <span className="mono">{size}</span>
                <input type="range" min={6} max={60} value={size} style={{ width: '100%' }} onChange={(ev) => { const n = Number(ev.target.value); setSize(n); regen(preset, n) }} />
              </label>
              <button onClick={() => regen(preset, size)}>New array</button>
              <input type="text" className="text" value={text} placeholder="8, 3, 5, 1, 9, 2" aria-label="Custom array" onChange={(ev) => setText(ev.target.value)} />
              <button onClick={applyCustom}>Use custom array</button>
            </div>
            <p className="note error" role="alert">{error}</p>
          </section>
        </div>

        <div className="col">
          <section className="panel">
            <Bars viz={viz} />
            <div className="legend">
              <span><i className="sw visited" />unsorted</span>
              <span><i className="sw current" />◆ comparing</span>
              <span><i className="sw path" />swapped or written</span>
              <span><i className="sw target" />▼ pivot</span>
              <span><i className="sw start" />sorted</span>
            </div>
          </section>
          <SortComparePanel arr={arr} />
        </div>

        <div className="col">
          <section className="panel">
            <h2>What is happening</h2>
            <div>{explainSort(e, viz)}</div>
          </section>
          <section className="panel mono small">
            <h2>About</h2>
            Time: {info.time}<br />Space: {info.space}<br />{info.note}
          </section>
          <section className="panel">
            <h2>Pseudocode</h2>
            <div className="code mono">
              {SORT_PSEUDO[algo].lines.map((l, i) => (
                <div key={i} className={i + 1 === line ? 'on' : ''}>{String(i + 1).padStart(2, '0')} {l}</div>
              ))}
            </div>
          </section>
          <section className="panel">
            <h2>Statistics</h2>
            <dl className="mono">
              <dt>Comparisons</dt><dd>{viz.comparisons}</dd>
              <dt>Swaps</dt><dd>{viz.swaps}</dd>
              <dt>Writes</dt><dd>{viz.writes}</dd>
              <dt>Array size</dt><dd>{arr.length}</dd>
              <dt>Events (total)</dt><dd>{events.length}</dd>
            </dl>
            <p className="note">These are algorithmic counts for this exact array.</p>
          </section>
          <section className="panel">
            <h2>Current event</h2>
            <pre className="mono small">{e ? JSON.stringify(e) : '(no event yet)'}</pre>
          </section>
        </div>
      </main>
      <PlaybackBar pb={pb} />
      <div className="sr" aria-live="polite">{viz.done ? 'Algorithm completed. Array sorted.' : ''}</div>
    </>
  )
}
