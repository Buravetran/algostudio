import { describe, expect, it } from 'vitest'
import { generateMaze } from './maze'
import { decode, encode } from './share'

describe('share encoding', () => {
  it('round-trips a maze with weighted cells', () => {
    const problem = generateMaze(14, 24, 3)
    problem.cost[1] = 5
    problem.cost[2] = 5
    const back = decode(encode({ algo: 'dijkstra', problem }))!
    expect(back.algo).toBe('dijkstra')
    expect(back.problem.start).toBe(problem.start)
    expect(back.problem.target).toBe(problem.target)
    expect(Array.from(back.problem.walls)).toEqual(Array.from(problem.walls))
    expect(Array.from(back.problem.cost)).toEqual(Array.from(problem.cost))
  })

  it('rejects malformed input instead of throwing', () => {
    const good = encode({ algo: 'bfs', problem: generateMaze(6, 6, 1) })
    const bad = [
      '',
      'nonsense',
      good.replace('v1', 'v2'),
      good.replace('bfs', 'magic'),
      good + ',extra',
      good.replace(/,[^,]*$/, ',3o'), // wrong cell count
      'v1,4,4,0,0,bfs,16o', // start equals target
      'v1,4,4,0,5,bfs,1w15o', // start on a wall
    ]
    for (const s of bad) expect(decode(s)).toBeNull()
  })
})
