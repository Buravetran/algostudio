import type { AlgoId } from '../pathfinding/types'
import type { SortAlgoId } from '../sorting/types'

export type Lab = 'pathfinding' | 'sorting'

export interface Lesson {
  id: AlgoId | SortAlgoId
  lab: Lab
  name: string
  intuition: string
  problem: string
  how: string[]
  structures: string
  assumptions: string
  mistakes: string[]
  questions: { q: string; a: string }[]
}

export const LESSONS: Lesson[] = [
  {
    id: 'bfs', lab: 'pathfinding', name: 'Breadth-First Search',
    intuition: 'Explore outward in rings, nearest cells first.',
    problem: 'Find the path with the fewest steps between two nodes when every step costs the same.',
    how: ['Put the start in a queue.', 'Take the oldest node from the queue.', 'Add every unseen neighbour to the back of the queue and remember which node it came from.', 'When the target is taken, follow the remembered parents back to build the path.'],
    structures: 'Queue (first in, first out).',
    assumptions: 'Every step costs the same. BFS minimises the number of steps, not total cost.',
    mistakes: ['Using it on weighted terrain: it ignores cost.', 'Marking a node as seen when it is taken instead of when it is added, which lets duplicates fill the queue.', 'Forgetting to store parents, so the target is found but the path is not.'],
    questions: [
      { q: 'Why does BFS find the fewest-step path?', a: 'Nodes leave the queue in order of their distance in steps. The first time the target is taken, no shorter route can exist.' },
      { q: 'On a grid with a cost-5 cell, can BFS return a more expensive path than Dijkstra?', a: 'Yes. BFS counts steps and ignores cost, so it may walk through an expensive cell to save one step.' },
    ],
  },
  {
    id: 'dfs', lab: 'pathfinding', name: 'Depth-First Search',
    intuition: 'Go as deep as possible down one branch, then back up.',
    problem: 'Visit every reachable node, or find some path to a target. The path is not guaranteed to be the shortest.',
    how: ['Push the start on a stack.', 'Pop the newest node and skip it if already visited.', 'Push every unvisited neighbour.', 'Stop when the target is popped, or when the stack is empty.'],
    structures: 'Stack (last in, first out), or recursion.',
    assumptions: 'None about costs, but you must track visited nodes or cycles cause endless loops.',
    mistakes: ['Expecting the shortest path.', 'Skipping the visited check on graphs with cycles.', 'Using deep recursion on huge graphs, which can overflow the call stack.'],
    questions: [
      { q: 'Why can DFS return a long winding path?', a: 'It follows the most recently added neighbour and only backs up when stuck, so the first path it reaches can be far from the shortest.' },
      { q: 'Which change turns BFS into DFS?', a: 'Replace the queue with a stack.' },
    ],
  },
  {
    id: 'dijkstra', lab: 'pathfinding', name: 'Dijkstra',
    intuition: 'Always expand the cheapest known node next.',
    problem: 'Find the cheapest path in a graph whose edge costs are not negative.',
    how: ['Set the start cost g to 0 and add it to a priority queue.', 'Take the node with the lowest g.', 'For each neighbour, compute g(node) + edge cost. If it beats the neighbour\'s stored cost, update it (this is relaxation) and add it to the queue.', 'When the target is taken, its cost is the cheapest possible.'],
    structures: 'Priority queue, usually a binary min-heap.',
    assumptions: 'No negative edge costs.',
    mistakes: ['Using negative weights, which breaks the guarantee.', 'Stopping when the target is first discovered instead of when it is taken.', 'Scanning a plain array for the minimum each time instead of using a heap.'],
    questions: [
      { q: 'Why is the cost correct the first time the target is taken?', a: 'Every node still waiting has a cost at least as high as the one just taken, and edges are not negative, so no later route can be cheaper.' },
      { q: 'What does relaxation mean?', a: 'Checking whether going through the current node gives a neighbour a lower cost than its stored one, and updating it if so.' },
    ],
  },
  {
    id: 'astar', lab: 'pathfinding', name: 'A* Search',
    intuition: 'Dijkstra with a compass: it prefers nodes that look closer to the target.',
    problem: 'Find the cheapest path to one target when you can estimate the remaining distance.',
    how: ['Like Dijkstra, track g, the cost already travelled.', 'Estimate the remaining cost with a heuristic h.', 'Order the priority queue by f = g + h.', 'When the target is taken, the path is optimal if h never overestimates.'],
    structures: 'Priority queue (min-heap).',
    assumptions: 'The heuristic must be admissible: never larger than the true remaining cost. Manhattan distance is admissible for 4-direction movement when each step costs at least 1.',
    mistakes: ['Using a heuristic that overestimates, which can return a non-optimal path.', 'Using Manhattan distance when diagonal moves are allowed.', 'Mixing up g (cost so far) with h (estimated cost left).'],
    questions: [
      { q: 'Why is Manhattan distance admissible on this grid?', a: 'Each move changes the row or column by one and costs at least 1, so no route can be cheaper than |row difference| + |column difference|.' },
      { q: 'What happens if h is always 0?', a: 'f equals g, so A* behaves exactly like Dijkstra.' },
    ],
  },
  {
    id: 'bubble', lab: 'sorting', name: 'Bubble Sort',
    intuition: 'Swap neighbours that are out of order, so large values bubble to the end.',
    problem: 'Sort an array using only comparisons of adjacent values.',
    how: ['Compare each adjacent pair from the left.', 'Swap the pair if the left value is larger.', 'After each pass the largest remaining value is in its final place.', 'Repeat with a shorter range until everything is placed.'],
    structures: 'Only the array itself, sorted in place.',
    assumptions: 'Comparison-based. This visualization always runs every pass, with no early exit.',
    mistakes: ['Not shrinking the pass range after each pass.', 'Expecting O(n) on sorted input: that needs an early-exit check, which this version leaves out.'],
    questions: [
      { q: 'How many comparisons does this version make on n values?', a: 'n(n - 1) / 2, whatever the input order.' },
      { q: 'What is guaranteed after one full pass?', a: 'The largest value is at the end of the range.' },
    ],
  },
  {
    id: 'selection', lab: 'sorting', name: 'Selection Sort',
    intuition: 'Pick the smallest remaining value and put it next.',
    problem: 'Sort with as few swaps as possible.',
    how: ['Scan the unsorted part to find the minimum.', 'Swap it into the first unsorted position.', 'That position is now final.', 'Repeat for the next position.'],
    structures: 'Only the array itself, sorted in place.',
    assumptions: 'Comparison-based. Not stable.',
    mistakes: ['Swapping even when the minimum is already in place.', 'Assuming equal values keep their original order: they may not.'],
    questions: [
      { q: 'Why does selection sort make at most n - 1 swaps?', a: 'It makes at most one swap per position, and the last position needs none.' },
      { q: 'Is selection sort stable?', a: 'No. Swapping the minimum into place can jump an equal value over another equal value.' },
    ],
  },
  {
    id: 'insertion', lab: 'sorting', name: 'Insertion Sort',
    intuition: 'Grow a sorted prefix by inserting each new value where it belongs.',
    problem: 'Sort small or nearly sorted arrays efficiently.',
    how: ['Treat the first value as a sorted prefix.', 'Take the next value and compare it with its left neighbour.', 'Move it left while the neighbour is larger.', 'The prefix is sorted again. Repeat.'],
    structures: 'Only the array itself, sorted in place.',
    assumptions: 'Comparison-based and stable. This visualization draws the moves as adjacent swaps.',
    mistakes: ['Starting at index 0 instead of 1.', 'Forgetting that real implementations usually shift values instead of swapping them.'],
    questions: [
      { q: 'When is insertion sort fastest?', a: 'On nearly sorted input. Each value moves only a few places, so the work approaches O(n).' },
      { q: 'How many swaps does it make on a reversed array of 6 values?', a: '15, which is n(n - 1) / 2.' },
    ],
  },
  {
    id: 'merge', lab: 'sorting', name: 'Merge Sort',
    intuition: 'Split in half, sort each half, then merge the two sorted halves.',
    problem: 'Sort reliably in O(n log n) time.',
    how: ['Split the array in half until each piece has one value.', 'Merge two sorted pieces by repeatedly taking the smaller front value.', 'Write the merged result back into the array.', 'Continue merging up until the whole array is sorted.'],
    structures: 'Recursion plus temporary copies of the halves.',
    assumptions: 'Needs O(n) extra space. Stable if ties take the left value.',
    mistakes: ['Off-by-one errors at the midpoint.', 'Believing it uses O(1) extra space.'],
    questions: [
      { q: 'Why is merge sort O(n log n) even in the worst case?', a: 'The array is halved about log n times and each level merges n values in total.' },
      { q: 'Why does the visualizer show writes instead of swaps?', a: 'Merging overwrites positions from temporary copies. It does not swap elements.' },
    ],
  },
  {
    id: 'quick', lab: 'sorting', name: 'Quick Sort',
    intuition: 'Choose a pivot, move smaller values to its left, then recurse on both sides.',
    problem: 'Sort quickly on average with little extra memory.',
    how: ['Pick the last element as the pivot.', 'Scan left to right, moving values less than or equal to the pivot to the left part.', 'Place the pivot between the two parts: it is now final.', 'Repeat on the left and right parts.'],
    structures: 'Recursion (O(log n) stack on average).',
    assumptions: 'The pivot strategy matters. This version uses the last element.',
    mistakes: ['Already sorted or reversed input with a last-element pivot: each partition removes only one value, giving O(n²).', 'Not excluding the pivot from the recursive calls, which can recurse forever.'],
    questions: [
      { q: 'Which input is the worst case for a last-element pivot?', a: 'Already sorted or reversed input. Each partition splits off just one value.' },
      { q: 'After partitioning, is the pivot in its final position?', a: 'Yes. Everything to its left is less than or equal to it, and everything to its right is greater.' },
    ],
  },
]
