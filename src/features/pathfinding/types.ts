export type AlgoId = 'bfs' | 'dfs' | 'dijkstra' | 'astar'

/** A grid problem. Cells are graph nodes identified by row * cols + col. */
export interface Problem {
  rows: number
  cols: number
  walls: Uint8Array // 1 = blocked
  cost: Uint8Array // terrain cost of entering a cell (>= 1)
  start: number
  target: number
}

/** Structured execution events. The algorithm emits these; nothing else. */
export type PathEvent =
  | { type: 'PUSH'; node: number; from: number; g: number; f: number | null }
  | { type: 'RELAX'; node: number; from: number; old: number | null; g: number; f: number | null }
  | { type: 'POP'; node: number; g: number; f: number | null }
  | { type: 'REACH'; node: number }
  | { type: 'PATH'; path: number[]; cost: number }
  | { type: 'DONE'; found: boolean }
