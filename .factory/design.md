# Worktree Agent Pulse — visual thesis

## Direction

**Generative geometry: a living commit lattice.** The interface treats every worktree as a rail in a precise branching instrument. Agent state appears as a pulse moving through the rail, while risk interrupts the geometry with an amber or coral marker. This fits the product because the picture explains the job: several parallel branches, one place to spot the branch that needs attention.

The layout is an asymmetric instrument panel, not a centered SaaS hero. A narrow numbered rail establishes sequence. Wide status rows carry the work. Fine grid lines and cropped geometric junctions make the board recognisable in a thumbnail without competing with repository data.

## Palette

The product is deliberately single-mode: a dark control surface reduces glare beside terminals and lets state markers read quickly.

| Token | Value | Use |
| --- | --- | --- |
| `--ink-0` | `#080d0d` | page background |
| `--ink-1` | `#101817` | raised surface |
| `--ink-2` | `#182321` | selected surface |
| `--paper` | `#f2f5e9` | primary text |
| `--mist` | `#aebbb4` | secondary text |
| `--line` | `#34413d` | rules and inactive geometry |
| `--pulse` | `#7cf7c4` | current activity and focus |
| `--amber` | `#ffc857` | dirty or ahead state |
| `--coral` | `#ff6b5f` | blocked and error state |
| `--blue` | `#6bb8ff` | links and neutral information |

All body text/background pairs meet 4.5:1. State is always paired with a word and shape, never shown by color alone.

## Typography

- Display and labels: **Space Grotesk**, self-hosted WOFF2, 520–700 weight. Its open geometry echoes branch rails without reading like terminal cosplay.
- Data and paths: **IBM Plex Mono**, self-hosted WOFF2, 400–600 weight. Tabular figures keep ahead/behind counts stable.
- Body remains at least 16 px on the site and 17 px inside the app. Long copy is capped at 68 characters.

## Spacing and shape

- Base unit: 8 px. Main rhythm: 8, 16, 24, 32, 48, 72, 96.
- Corners are clipped with an 8 px diagonal rather than rounded pills.
- Rules are 1 px; state nodes are 10–14 px; touch targets are at least 44 px.
- On phones, the product board becomes a one-column scan list. Secondary Git counts move below the branch name. The art crop moves behind the live board.

## Interaction grammar

- A selection lights one branch rail from its origin to the selected worktree.
- Status filters work as a roving tab list and keep a visible count.
- Worktree rows open a detail drawer. The primary desktop action opens that exact directory in the configured terminal.
- Loading uses a static lattice with a single opacity pulse. Errors break the rail with a coral cross and one recovery action.

## Motion policy

The signature motion is a **single travelling pulse**: on first reveal, a mint node moves once along a branch rail over 700 ms. Row changes cross-fade and translate no more than 8 px over 180 ms. Nothing loops. Under `prefers-reduced-motion: reduce`, the node appears in its final position and all transforms become instant.

## Asset plan and provenance

- `hero-lattice.webp`: an original 3D geometric commit lattice used behind the landing preview.
- `social-card.webp`: a 1200×630 crop composed from the same art with product UI geometry and no required text embedded in the generated image.
- Logo, status marks, favicon, and UI icons are hand-authored SVG geometry.

Prompt sheet:

> Use case: stylized-concept. Asset type: landing hero illustration. A precise isometric sculpture of five branching Git worktree rails, made from matte graphite and translucent mint acrylic, with one amber warning node and one coral blocked node. Deep near-black architectural backdrop, fine drafting grid, controlled studio rim light, orthographic 35mm view, generous dark negative space, crisp geometric edges, subtle recycled paper grain. Palette: #080d0d, #7cf7c4, #ffc857, #ff6b5f, #6bb8ff. No screens, no people, no terminal text, no letters, no logos, no watermark, no generic gradient blobs.

Generation: Azure AI Foundry factory image deployment through `/opt/fleet/lib/gen-image.sh`, 2026-08-28. Assets are original for this product and contain no people, brands, or copyrighted characters. Source PNG and prompt sidecar are retained under `assets/src/`.

The three walkthrough images under `public/assets/` are lossless captures of the product UI at 960×600: the native first-run screen, the bundled sample board, and its selected-worktree drawer. They are self-hosted product documentation, not generated imagery.

## Voice

Short, operational, and concrete. “Blocked” stays “blocked.” “Worktree” stays “worktree.” Buttons name their result. Errors say what failed and what to do next.
