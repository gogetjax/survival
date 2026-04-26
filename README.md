# Survivor: Of the Forgotten Isle

A 3D single-player survival game. You wake on a beach. There is no rescue coming. Build, forage, hunt, hide. Survive 1,000 days. They come out of the dark.

> Built by Arthur & Chris, with Claude as the design assistant and Claude Code as the implementation partner.

## Status

🟡 **Build 001 — Foundation.** Vite + TypeScript + Three.js scaffold. Prototype migrated to modules. No crafting, no save/load, no combat yet — those land in subsequent builds.

## Stack

- [Vite](https://vitejs.dev/) — dev server & bundler
- [TypeScript](https://www.typescriptlang.org/) — strict mode
- [Three.js](https://threejs.org/) — 3D rendering
- [Vitest](https://vitest.dev/) — unit tests
- Vanilla HTML/CSS for the HUD

## Develop

```bash
npm install
npm run dev          # http://localhost:5173
```

## Other scripts

```bash
npm run build        # production build to dist/
npm run preview      # serve the production build
npm run test         # vitest
npm run typecheck    # tsc --noEmit
npm run lint         # eslint
npm run format       # prettier --write
```

## Repo layout

```
survival/
├── CLAUDE.md                    # design bible — read this first
├── prototype/
│   └── v0-survivor-island.html  # working HTML prototype, design source of truth
├── prompts/                     # one Claude Code prompt per build
│   ├── build-001-foundation.md
│   └── build-NNN-*.md
├── src/                         # game source
└── tests/                       # vitest specs
```

## How we build

Each build is one PR. Design discussion happens in Claude.ai; the resulting prompt is committed under `prompts/` and run through Claude Code in a dedicated git worktree. See [`CLAUDE.md`](./CLAUDE.md) for the full workflow.

## License

TBD.
