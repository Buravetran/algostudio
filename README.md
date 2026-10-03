# AlgoStudio

Interactive algorithm laboratory. Algorithms emit structured execution events; a playback engine
replays them; the UI, pseudocode, inspector and statistics are all derived from those events.

## Run

```bash
npm install
npm test          # heap + pathfinding correctness tests
npm run dev       # http://localhost:5173
npm run build     # type-check + production build into dist/
```

## Features

- BFS, DFS, Dijkstra, A* with step-by-step playback, pseudocode highlighting and plain-language explanations
- Weighted terrain, random walls, seeded maze generator (always solvable)
- Predict mode: guess which node is taken next; graded from the event list
- Compare all four algorithms on the same grid
- Share links (`#x=...`) and local autosave. Only the configuration is stored, never animation frames

## Architecture

```
Problem (grid) -> search() -> PathEvent[] -> usePlayback -> applyEvent -> VizState -> React
                                                           -> explain()  -> inspector text
```

- `features/pathfinding/algorithms`: pure BFS, DFS, Dijkstra, A* and the `MinHeap` priority queue. No UI imports.
- `features/pathfinding/engine`: event reducer, playback hook, explanation generator.
- `features/pathfinding/components`: grid and workspace. Rendering only.

## Deploy (GitHub Pages)

1. Push this repo to GitHub on the `main` branch.
2. Repo Settings > Pages > Source: **GitHub Actions**.
3. Every push to `main` runs type-check, tests and build, then deploys `dist/`.

## Roadmap

Sorting laboratory on the same playback engine, comparison, learning pages, challenges, saved experiments.
