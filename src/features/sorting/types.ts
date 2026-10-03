export type SortAlgoId = 'bubble' | 'selection' | 'insertion' | 'merge' | 'quick'

/** Structured execution events for sorting. Indices are array positions. */
export type SortEvent =
  | { type: 'CMP'; i: number; j: number }
  | { type: 'SWAP'; i: number; j: number }
  | { type: 'SET'; i: number; value: number }
  | { type: 'PIVOT'; index: number }
  | { type: 'OK'; index: number } // position is in its final place
  | { type: 'END' }
