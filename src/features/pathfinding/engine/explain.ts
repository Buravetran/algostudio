import { label } from '../grid'
import type { AlgoId, PathEvent, Problem } from '../types'

/** Education layer: structured event in, plain-language explanation out. */
export function explain(e: PathEvent | undefined, algo: AlgoId, p: Problem): string {
  if (!e) return 'Press Play or Next. Each step is one logged decision by the algorithm.'
  const at = (n: number) => label(p, n)
  switch (e.type) {
    case 'PUSH':
      return e.from < 0
        ? `Start ${at(e.node)} is added with cost 0.`
        : `${at(e.node)} is reached from ${at(e.from)}. It joins the ${algo === 'dfs' ? 'stack' : 'queue'}.`
    case 'RELAX': {
      const base = `Neighbour ${at(e.node)} via ${at(e.from)} would cost ${e.g}. `
      const cmp =
        e.old === null
          ? 'It had no known cost, so this one is recorded.'
          : `It was ${e.old} before. ${e.g} < ${e.old}, so the cost is updated.`
      const f = algo === 'astar' && e.f !== null ? ` Priority f = g + h = ${e.g} + ${e.f - e.g} = ${e.f}.` : ''
      return base + cmp + f
    }
    case 'POP': {
      const why =
        algo === 'astar' && e.f !== null
          ? `It has the lowest f = g + h = ${e.g} + ${e.f - e.g} = ${e.f}.`
          : algo === 'dijkstra'
            ? 'It has the lowest known cost.'
            : algo === 'bfs'
              ? 'It has waited longest in the queue.'
              : 'It was added most recently, so the search goes deeper.'
      return `Taking ${at(e.node)} (g = ${e.g}). ${why}`
    }
    case 'REACH':
      return `Target ${at(e.node)} reached.`
    case 'PATH':
      return `Following parent links back gives a path of ${e.path.length - 1} steps and terrain cost ${e.cost}.`
    case 'DONE':
      return e.found ? 'Done: path found.' : 'Done: no route. Walls block every path to the target.'
  }
}
