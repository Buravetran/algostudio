import type { AlgoId } from './types'

export const ALGOS: { id: AlgoId; name: string }[] = [
  { id: 'bfs', name: 'Breadth-First Search' },
  { id: 'dfs', name: 'Depth-First Search' },
  { id: 'dijkstra', name: 'Dijkstra' },
  { id: 'astar', name: 'A* (Manhattan)' },
]

export const INFO: Record<AlgoId, { time: string; space: string; note: string }> = {
  bfs: { time: 'O(V+E)', space: 'O(V)', note: 'Fewest steps on an unweighted grid. Uses a queue. Ignores terrain cost.' },
  dfs: { time: 'O(V+E)', space: 'O(V)', note: 'Goes deep first using a stack. The path it finds is usually not the shortest.' },
  dijkstra: { time: 'O((V+E) log V)', space: 'O(V)', note: 'Always expands the cheapest known node. Optimal for non-negative weights.' },
  astar: { time: 'O((V+E) log V) worst case', space: 'O(V)', note: 'Expands lowest f = g + h. Manhattan h never overestimates on a 4-direction grid, so the path is optimal.' },
}

const common = (take: string, add: string) => [
  'add start to the frontier',
  'while the frontier is not empty',
  `  ${take}`,
  '  if it is the target: stop',
  `  ${add}`,
]

export const PSEUDO: Record<AlgoId, string[]> = {
  bfs: common('take the oldest node (queue)', 'add each unseen neighbour'),
  dfs: common('pop the newest node (stack)', 'push each unvisited neighbour'),
  dijkstra: common('take the node with lowest g', 'if g(node) + cost < g(neighbour): update, add'),
  astar: common('take the node with lowest f = g + h', 'if g(node) + cost < g(neighbour): update, add'),
}

/** Which pseudocode line (1-based) each event belongs to. */
export const LINE: Record<string, number> = { PUSH: 5, RELAX: 5, POP: 3, REACH: 4, PATH: 4, DONE: 2 }
