import { MAX_VALUES } from './arrays'
import type { SortAlgoId } from './types'

export interface SortExperiment {
  algo: SortAlgoId
  arr: number[]
}

const ALGO_IDS: SortAlgoId[] = ['bubble', 'selection', 'insertion', 'merge', 'quick']

/** "s1,algo,v.v.v": the configuration only. Replaying the algorithm reproduces the run. */
export function encodeSort({ algo, arr }: SortExperiment): string {
  return ['s1', algo, arr.join('.')].join(',')
}

/** Returns null for anything malformed instead of throwing. */
export function decodeSort(s: string): SortExperiment | null {
  const [v, algo, vals, ...extra] = s.split(',')
  if (v !== 's1' || !vals || extra.length > 0) return null
  if (!ALGO_IDS.includes(algo as SortAlgoId)) return null
  const parts = vals.split('.')
  if (parts.length < 2 || parts.length > MAX_VALUES) return null
  if (parts.some((p) => !/^\d+$/.test(p))) return null
  const arr = parts.map(Number)
  if (arr.some((x) => x < 1 || x > 999)) return null
  return { algo: algo as SortAlgoId, arr }
}
