import { useEffect, useMemo, useState } from 'react'
import { PlaybackBar } from '../../../components/PlaybackBar'
import { usePlayback } from '../../../lib/usePlayback'
import { PRESETS, makeArray, parseArray } from '../arrays'
import { makeQuestion } from '../challenge'
import type { Question } from '../challenge'
import type { Preset } from '../arrays'
import { sortEvents } from '../algorithms/sort'
import { SORT_ALGOS, SORT_INFO, SORT_PSEUDO, sortLine } from '../content'
import { clearHash } from '../../../lib/hash'
import { decodeSort, encodeSort } from '../share'
import { explainSort } from '../engine/explain'
import { applySortEvent, cloneSortViz, freshSortState } from '../engine/reducer'
import type { SortAlgoId } from '../types'
import { Bars } from './Bars'
import { SortComparePanel } from './SortComparePanel'

const STORE = 'algostudio:sorting:v1'

/** Shared link wins, then the last local session, then a fresh random array. */
function loadInitial(): { algo: SortAlgoId; arr: number[]; notice: string } {
  const fallback = { algo: 'merge' as SortAlgoId, arr: makeArray('Random', 20, Math.random), notice: '' }
  try {
    const m = location.hash.match(/^#s=(.+)$/)
    if (m) {
      const exp = decodeSort(decodeURIComponent(m[1]))
      return exp
        ? { ...exp, notice: 'Loaded the shared experiment.' }
        : { ...fallback, notice: 'That shared link could not be loaded because its data is invalid. Showing a new random array.' }
    }
    const saved = localStorage.getItem(STORE)
    const exp = saved ? decodeSort(saved) : null
    if (exp) return { ...exp, notice: '' }
  } catch {
    /* storage unavailable: fall through */
  }
  return fallback
}

export function SortWorkspace({ initialAlgo }: { initialAlgo?: SortAlgoId }) {
  const [init] = useState(loadInitial)
  const [algo, setAlgo] = useState<SortAlgoId>(initialAlgo ?? init.algo)
  const [preset, setPreset] = useState<Preset>('Random')
  const [size, setSize] = useState(init.arr.length)
  const [arr, setArr] = useState(init.arr)
  const [notice, setNotice] = useState(init.notice)
  const [text, setText] = useState('')
  const [error, setError] = useState('')
  const [challenge, setChallenge] = useState(false)
  const [question, setQuestion] = useState<Question | null>(null)
  const [picked, setPicked] = useState<number | null>(null)
  const [feedback, setFeedback] = useState('')
  const [score, setScore] = useState({ right: 0, total: 0 })

  const events = useMemo(() => sortEvents(algo, arr), [algo, arr])
  const pb = usePlayback(events, () => freshSortState(arr), applySortEvent, cloneSortViz)
  const viz = pb.state
  const e = pb.pos > 0 ? events[pb.pos - 1] : undefined
  const line = sortLine(algo, e)
  const info = SORT_INFO[algo]
  const name = SORT_ALGOS.find((a) => a.id === algo)!.name

  useEffect(() => {
    try {
      localStorage.setItem(STORE, encodeSort({ algo, arr }))
    } catch {
      /* ignore */
    }
    clearHash()
  }, [algo, arr])

  const share = async () => {
    const url = `${location.origin}${location.pathname}#s=${encodeURIComponent(encodeSort({ algo, arr }))}`
    history.replaceState(null, '', url)
    try {
      await navigator.clipboard.writeText(url)
      setNotice('Share link copied. Anyone who opens it sees this array and algorithm.')
    } catch {
      setNotice('Could not copy automatically. The link is now in the address bar, so copy it from there.')
    }
  }

  const ask = (pos: number) => {
    setQuestion(makeQuestion(events, pos, arr.length, Math.random))
    setPicked(null)
    setFeedback('')
  }
  useEffect(() => {
    if (challenge) ask(0)
    else setQuestion(null)
  }, [events, challenge])

  // The answer is already in the event list: replay up to that event to explain it.
  const answer = (k: number) => {
    if (!question || picked !== null) return
    const after = freshSortState(arr)
    for (let i = 0; i <= question.eventIndex; i++) applySortEvent(after, events[i])
    const ok = k === question.correct
    setPicked(k)
    setScore((sc) => ({ right: sc.right + (ok ? 1 : 0), total: sc.total + 1 }))
    setFeedback((ok ? 'Correct. ' : `Not quite. The answer was ${question.options[question.correct]}. `) + explainSort(events[question.eventIndex], after))
    pb.seek(question.eventIndex + 1)
  }
  const stale = question !== null && picked === null && pb.pos > question.eventIndex

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
              <button onClick={share}>Copy share link</button>
            </div>
            <p className="note error" role="alert">{error}</p>
            <p className="note" role="status">{notice || 'Your last array is saved in this browser.'}</p>
          </section>
          <section className="panel quiz">
            <h2>Challenge</h2>
            <button aria-pressed={challenge} onClick={() => setChallenge((c) => !c)}>
              {challenge ? 'Challenge mode: on' : 'Challenge mode: off'}
            </button>
            {challenge && (
              <>
                <p className="note">Score: {score.right} / {score.total}</p>
                {question ? (
                  <>
                    <p><b>{question.prompt}</b></p>
                    <div className="stack" role="group" aria-label="Answers">
                      {question.options.map((o, k) => (
                        <button key={k} disabled={picked !== null} onClick={() => answer(k)}>{o}</button>
                      ))}
                    </div>
                    {stale && <p className="note">You stepped past this question. Press New question.</p>}
                    {feedback && <p className="note" role="status">{feedback}</p>}
                    {(picked !== null || stale) && <button onClick={() => ask(pb.pos)}>New question</button>}
                  </>
                ) : (
                  <p className="note">No more questions here. Press Restart on the playback bar or change the array.</p>
                )}
              </>
            )}
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
            <div className="explain">{explainSort(e, viz)}</div>
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
            <pre className="mono small event">{e ? JSON.stringify(e) : '(no event yet)'}</pre>
          </section>
        </div>
      </main>
      <PlaybackBar pb={pb} />
      <div className="sr" aria-live="polite">{viz.done ? 'Algorithm completed. Array sorted.' : ''}</div>
    </>
  )
}
