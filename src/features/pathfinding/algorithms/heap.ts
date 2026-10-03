interface Entry<T> {
  priority: number
  seq: number
  value: T
}

/**
 * Binary min-heap. Equal priorities come out in insertion order (FIFO),
 * which keeps every algorithm run deterministic.
 */
export class MinHeap<T> {
  private a: Entry<T>[] = []
  private seq = 0

  get size(): number {
    return this.a.length
  }

  private less(i: number, j: number): boolean {
    const x = this.a[i]
    const y = this.a[j]
    return x.priority < y.priority || (x.priority === y.priority && x.seq < y.seq)
  }

  private swap(i: number, j: number): void {
    ;[this.a[i], this.a[j]] = [this.a[j], this.a[i]]
  }

  push(priority: number, value: T): void {
    this.a.push({ priority, seq: this.seq++, value })
    let i = this.a.length - 1
    while (i > 0) {
      const parent = (i - 1) >> 1
      if (!this.less(i, parent)) break
      this.swap(i, parent)
      i = parent
    }
  }

  pop(): T | undefined {
    if (this.a.length === 0) return undefined
    const top = this.a[0]
    const last = this.a.pop()!
    if (this.a.length > 0) {
      this.a[0] = last
      let i = 0
      for (;;) {
        const l = 2 * i + 1
        const r = l + 1
        let m = i
        if (l < this.a.length && this.less(l, m)) m = l
        if (r < this.a.length && this.less(r, m)) m = r
        if (m === i) break
        this.swap(i, m)
        i = m
      }
    }
    return top.value
  }
}
