# Grafly — Agent & Contributor Reference

This file is aimed at AI coding agents and human contributors. It covers architecture, conventions, known gotchas, and decisions that aren't obvious from reading the code alone.

---

## Project overview

Grafly is a React SPA with no backend. All state lives in:
- **Zustand store** (`src/store/diagramStore.js`) — nodes, edges, viewport, undo/redo history, clipboard, theme, UI flags
- **localStorage** — diagram persistence keyed by `grafly_diagrams` / `grafly_active_diagram`

There is no routing — the app is a single view.

---

## File structure

```
src/
  App.jsx                    # Root layout, theme, keyboard shortcuts, ?d= URL param detection
  index.css                  # Tailwind base + React Flow overrides + tooltip CSS + react-colorful overrides
  components/
    Canvas.jsx               # ReactFlow wrapper, drag-drop, grid, minimap, context menu wiring
    Toolbar.jsx              # Top bar: file ops, undo/redo, copy/paste, view toggles, JSON import, AI docs modal, share modal
    ShapeLibrary.jsx         # Left panel: shape palette (drag source + tap-to-insert on mobile), search, collapsible
    ProjectsPanel.jsx        # Collapsible left sidebar: create/rename/delete/switch diagrams
    PropertiesPanel.jsx      # Right panel: node/edge properties, layer controls, alignment, collapsible
    ContextMenu.jsx          # Right-click context menu (portal-rendered)
    GraflyLogo.jsx           # SVG logo component using currentColor for dark mode
    edges/
      CustomEdge.jsx         # Bendable edges with waypoint drag, label editing, arrow markers
    nodes/
      ShapeNode.jsx          # Resizable shape node: SVG renderer, label editing, handles
  store/
    diagramStore.js          # Zustand store — see Store patterns below
  data/
    basicShapes.js           # Basic shape definitions (rect, circle, diamond, …)
    awsShapes.js             # AWS shape definitions + SVG icon functions
    gcpShapes.js             # GCP shape definitions + SVG icon functions
  utils/
    storage.js               # localStorage helpers: saveDiagram, loadDiagram, getAllDiagrams, …
    fileUtils.js             # downloadDiagram (JSON), uploadDiagram (JSON parse), exportPng
    styleConstants.js        # All shared styling tokens — always import from here
    urlCodec.js              # encodeDiagram / decodeDiagram — URL-safe diagram compression
    urlCodec.test.js         # Vitest tests for the codec (35 tests)
```

---

## Style constants

**Every new component and shape definition must import shared values from `src/utils/styleConstants.js`.** Never hardcode these values.

```js
import {
  COLOR_PRIMARY,            // #7B61FF — brand accent (selection rings, active states, handles)
  COLOR_TEXT_DEFAULT,       // #111827 — default node label color
  COLOR_BORDER_DEFAULT,     // #E5E7EB — default border for cloud shapes
  COLOR_EDGE_DEFAULT,       // #6B7280 — default edge stroke color
  DEFAULT_FONT_WEIGHT,      // '600'   — semibold, standard label weight
  DEFAULT_FONT_WEIGHT_BOLD, // '700'   — bold, toggled via Bold button
  DEFAULT_FONT_SIZE,        // 13      — fallback label font size (px)
  DEFAULT_TEXT_ALIGN,       // 'center'
  DEFAULT_STROKE_WIDTH,     // 2
  DEFAULT_STROKE_STYLE,     // 'solid'
  DEFAULT_OPACITY,          // 1
  STROKE_DASH_DASHED,       // '6 3'  — SVG strokeDasharray for dashed shapes
  STROKE_DASH_DOTTED,       // '2 3'  — SVG strokeDasharray for dotted shapes/edges
  EDGE_DASH_DASHED,         // '6 4'  — slightly wider gap used for dashed edges
} from '../utils/styleConstants'
```

---

## Store patterns

### History
`_pushHistory()` snapshots `{ nodes, edges }` and appends to `history[]` (capped at 50). Call it after any user action that should be undoable. Actions that fire continuously (e.g. waypoint drag on `mousemove`) pass `{ skipHistory: true }` to `updateEdgeData` and push a single entry on `mouseup`.

### Saving
All mutations call `debouncedSave(id, { name, nodes, edges, viewport })` which writes to localStorage after a 400ms debounce. Never call `saveDiagram` directly from components — go through store actions.

### `const nodes` redeclaration trap
Inside store actions that destructure `const { nodes } = get()` and also write `set((state) => { const nodes = ... })`, rename the destructured variable to `currentNodes` to avoid the redeclaration. This already applies in `alignNodes`, `bringToFront`, and `sendToBack`.

### `selectNode` / `selectEdge`
These synchronously update both the `nodes`/`edges` arrays (setting the `selected` flag) and `selectedNodes`/`selectedEdges` in the same `set()` call. Use these from the context menu to guarantee the selection is up to date before the menu renders.

---

## Dark mode

Dark mode uses Tailwind's `class` strategy. `App.jsx` toggles the `dark` class on `document.documentElement` based on `theme` (`'light'` | `'dark'` | `'auto'`). Auto mode uses a `prefers-color-scheme` media query listener.

The `isDark` boolean in the store is kept in sync so components (e.g. `Canvas.jsx` for grid color) can react without duplicating the media query logic.

React Flow's internal elements (controls, minimap, edges) are styled via CSS custom property overrides in `index.css` under `.dark`.

---

## Tooltip system

Tooltips are CSS-only via `[data-tooltip]:hover::after` in `index.css`. Add `data-tooltip="text"` to any element to get a tooltip below it.

Inside the properties panel (which has `overflow-y: auto`), the panel wrapper has the class `tooltip-up`, which triggers `.tooltip-up [data-tooltip]:hover::after` to flip tooltips upward so they aren't clipped by the scroll container.

---

## Portals

Several components render into `document.body` via `ReactDOM.createPortal` to escape `overflow` clipping:
- `ColorInput` dropdown (PropertiesPanel) — positioned with `useLayoutEffect` + `getBoundingClientRect`
- Context menu (Canvas → App)
- JSON import modal (Toolbar)
- AI format reference modal (Toolbar)

Z-index layers used:
| Layer | z-index |
|-------|---------|
| Context menu | 9999 |
| About modal | 9997 |
| AI modal | 9996 |
| JSON import modal | 9995 |
| Share modal | 9994 |
| Edit-mode warning modal | 9993 |
| Color picker dropdown | 9990 |
| Tooltip | 1000 |

---

## Adding a new basic shape

1. Add a renderer function in `ShapeNode.jsx` (e.g. `function StarShape(...)`) following the same `{ w, h, fill, stroke, sw, dash }` prop signature.
2. Add a `case 'star':` entry in the `ShapeRenderer` switch.
3. Add a `BasicShapePreview` case in `ShapeLibrary.jsx` for the palette thumbnail.
4. Add the shape definition object to `src/data/basicShapes.js`, importing all defaults from `styleConstants.js`.

## Adding a new cloud (AWS/GCP) shape

1. Add an entry to `AWS_SHAPES` / `GCP_SHAPES` in the relevant data file, using `makeDefaults(shapeType, label, accentColor)`.
2. Add an icon render function to `AWS_ICONS` / `GCP_ICONS` — a function `(color) => svgString` drawing on a 32×32 viewBox.
3. The shape will automatically appear in the library, the properties panel, and the AI format reference document.
4. Update `GRAFLY_DIAGRAM_FORMAT.md` to include the new shape in the reference table.

---

## Canvas interaction model

| Gesture | Action |
|---------|--------|
| Left drag on empty canvas | Selection box |
| Middle-click drag | Pan |
| Shift + left drag | Pan |
| Scroll wheel | Zoom |
| Double-click node | Edit label |
| Double-click edge midpoint dot | Reset waypoint |

Implemented via React Flow props: `selectionOnDrag={true}`, `panOnDrag={[1]}` (middle button), `panActivationKeyCode="Shift"`, `selectionKeyCode={null}`.

---

## Edge waypoint math

For **bezier** edges: the waypoint is stored as the point on the curve at `t=0.5`. The actual SVG quadratic bezier control point is back-calculated:
```
B(0.5) = 0.25·P0 + 0.5·P1 + 0.25·P2
→ P1 = 2·wp − 0.5·(P0 + P2)
```

For **smoothstep** edges: the waypoint is clamped to the axis-aligned bounding box of source and target during drag to prevent it escaping the visible path.

---

## Known issues & resolutions

### Edge hit area not capturing pointer events
**Problem:** `stroke="transparent"` on an SVG `<path>` does not respond to pointer events even with `pointer-events: stroke`.
**Fix:** Use `stroke="rgba(0,0,0,0)"` (a real color at zero opacity) and set `pointerEvents="stroke"` as a JSX prop — not inside a `style` object, since CSS does not accept `stroke` as a value for `pointer-events`.

### Edge not selectable after adding the hit-area path
**Problem:** Adding `onClick={(e) => e.stopPropagation()}` to the transparent hit-area path was blocking React Flow's internal edge selection handler.
**Fix:** Remove the `onClick` handler entirely from the hit-area path. React Flow handles selection through its own event delegation.

### Canvas cursor always showing grab hand
**Problem:** React Flow applies `cursor: grab` to `.react-flow__pane.draggable`, overriding any element-level cursor style.
**Fix:** Target the exact selector in `index.css` with `!important`:
```css
.react-flow__pane.draggable { cursor: default !important; }
.react-flow__pane.dragging  { cursor: grabbing !important; }
```

### Waypoint dot drifting off the edge line (bezier)
**Problem:** The waypoint was stored as the bezier control point (off the visible curve), so the dot appeared disconnected from the line.
**Fix:** Store the `t=0.5` midpoint instead and back-calculate the control point on render (see Edge waypoint math above).

### Waypoint escaping smoothstep path bounds
**Problem:** Dragging the waypoint freely could move it outside the visible smoothstep path.
**Fix:** Clamp the waypoint to the bounding box of source and target positions during `mousemove`.

### Context menu not closing on click outside
**Problem:** `document.addEventListener('mousedown', ...)` was swallowed by React Flow's internal event handling before reaching the document listener.
**Fix:** Render a transparent fixed-position backdrop `<div>` behind the menu at `zIndex: 9998`. Its `onClick` closes the menu reliably.

### `const nodes` redeclaration in store actions
**Problem:** `alignNodes`, `bringToFront`, and `sendToBack` destructured `const { nodes }` from `get()` and then re-declared `nodes` inside the `set()` callback.
**Fix:** Rename the destructured variable to `currentNodes`.

### Right-click not auto-selecting the target node
**Problem:** React Flow's `onNodeContextMenu` fires before selection state is updated.
**Fix:** Add `selectNode` / `selectEdge` to the store to synchronously update both the `nodes` array flags and `selectedNodes`/`selectedEdges` in one `set()` call.

### Multi-select background color update warning
**Problem:** React warned about mixing `background` shorthand with `backgroundSize` in the same style object on `ColorInput`'s swatch.
**Fix:** Replace `background:` with separate `backgroundColor:` + `backgroundImage:` longhand properties.

### localStorage JSON truncation
**Problem:** If the stored JSON is truncated (e.g. due to a previous bug or storage quota), `JSON.parse` throws and the app silently returns an empty diagram list.
**Mitigation:** `getAllDiagrams()` wraps the parse in a `try/catch` and returns `{}` on failure. If diagrams appear missing, inspect `localStorage.getItem('grafly_diagrams')` directly in DevTools.

### accentColor XSS via dangerouslySetInnerHTML (fixed)
**Problem:** Cloud shape icon functions embed the color string directly into SVG markup via template literals (e.g. `` `fill="${color}"` ``). `accentColor` flows from the URL codec's color palette into `dangerouslySetInnerHTML`, so a crafted URL with `accentColor = '"><script>...'` could inject arbitrary HTML.
**Fix:** `decodeDiagram` in `urlCodec.js` applies `sanitizeColor()` to every entry in the palette before any field is set. Only CSS hex colors matching `/^#[0-9A-Fa-f]{3,8}$/` are accepted — everything else is replaced with `#000000`. Since all colors are stored by palette index, a single check at decode time covers all color fields (`fillColor`, `strokeColor`, `textColor`, `accentColor`, `edgeColor`).

---

## Deployment

See `infra/` for Terraform (S3 + CloudFront + ACM + Route 53).

After `terraform apply`, deploy the built assets:
```bash
npm run build
aws s3 sync dist/ s3://grafly.io --delete
aws cloudfront create-invalidation \
  --distribution-id <CLOUDFRONT_DISTRIBUTION_ID> \
  --paths "/*"
```

The distribution ID is available via `terraform output cloudfront_distribution_id`.

---

## URL sharing

Diagrams can be shared via a `?d=` query parameter. The full diagram is compressed into the URL — no backend or storage required.

### Codec (`src/utils/urlCodec.js`)

Two-layer pipeline:

1. **Key compression** — all verbose keys replaced with 1–2 char aliases (`fillColor` → `f`, `strokeColor` → `k`, etc.), enum strings replaced with integers (`"solid"` → `0`, `"right"` → `1`), default values omitted entirely, node/edge IDs shortened to `n0`/`n1`/`e0`/`e1`, colors deduplicated into a shared palette array, positions stored as `[x, y]` arrays.
2. **LZ-string** — lossless compression tuned for repetitive JSON. Output is URL-safe with no base64 padding.

**Result:** 100 nodes + 100 edges compresses to ~5,050 bytes — well under the 8,192-byte CloudFront URI limit.

### API

```js
import { encodeDiagram, decodeDiagram } from './utils/urlCodec'

const encoded = encodeDiagram(diagram)   // → URL-safe string
const diagram = decodeDiagram(encoded)   // → full diagram object
```

### URL detection and view modes (`App.jsx`)

Two module-level flags are captured before params are stripped:
- `isSharedUrl` — URL contains `?d=`
- `isEditMode` — URL contains both `?d=` and `?edit=1`

On mount, if `?d=` is present:
- Decodes and loads the diagram via `loadFromData`
- Calls `triggerFitView()` so all nodes are centered in the viewport
- Strips `?d=` and `?edit=` from the URL via `history.replaceState` (so refresh doesn't re-import)
- Silently ignores malformed params

**View mode** (`isSharedUrl && !isEditMode`): hides all UI chrome (toolbar, sidebars, panels). Shows only the canvas and a single "Edit diagram" button.

**Edit diagram button**: encodes the current diagram and opens `?d=<encoded>&edit=1` in a **new tab** — the viewer's diagram is never modified.

**Edit link** (`isEditMode`): starts with full editing UI and immediately shows a dismissible modal explaining that this is a local copy and changes won't affect the original. Users are directed to the Share button to re-share.

### Share modal (`Toolbar.jsx`)

The `Share2` toolbar button opens a modal with:
- The full shareable URL (ready to copy)
- A pre-formatted `<iframe>` embed snippet

### Defaults omitted during compression

Node fields omitted when at their default value:

| Field | Default |
|-------|---------|
| `zIndex` | `0` |
| `strokeWidth` | `2` |
| `strokeStyle` | `"solid"` |
| `fontWeight` | `"600"` |
| `fontStyle` | `"normal"` |
| `textDecoration` | `"none"` |
| `textAlign` | `"center"` |
| `fontSize` | `13` |
| `opacity` | `1` |
| `label` | `""` |

Edge fields omitted when at their default value: `edgeStyle` (solid), `edgeWidth` (2), `animated` (false), `pathType` (smoothstep), `arrowType` (filled), `arrowStart` (false), `waypoint` (null), `label` ("").

---

## Testing

Tests use **Vitest**. The test file lives alongside the module it covers.

```bash
npm test          # run once
npm run test:watch  # watch mode
```

### `src/utils/urlCodec.test.js` (35 tests)

| Group | What is covered |
|-------|----------------|
| Round-trip basics | Single node, metadata (name, viewport, id) |
| All enum variants | Every value of `strokeStyle`, `pathType`, `arrowType`, `textAlign`, `sourceHandle`/`targetHandle`, `fontWeight`, `fontStyle`, `textDecoration` |
| Defaults omission | Verifies that compressed output contains no verbose key names |
| Color palette | Verifies repeated colors appear once in `cp` array, all nodes reference by index |
| Cloud shapes | `isCloudShape`, `accentColor`, non-default `strokeWidth`/`fontSize` |
| Waypoint | `{x, y}` round-trip and `null` |
| Numeric non-defaults | `zIndex`, `opacity`, `fontSize`, `strokeWidth` |
| Edge references | Source/target IDs remain consistent after ID shortening |
| Error handling | Corrupted input throws, wrong codec version throws with message |
| **100-node benchmark** | 100 nodes + 100 edges encodes to < 8,192 bytes; full round-trip verified |

When adding new fields to the diagram format, add a corresponding round-trip test and verify the benchmark still passes.

---

## AI diagram generation

`GRAFLY_DIAGRAM_FORMAT.md` in the project root is the complete schema reference for the diagram JSON format. It includes:
- Full node and edge schemas with all field types and allowed values
- Complete AWS and GCP shape ID tables
- Layout tips and three full JSON examples
- Generation guidelines for LLMs

This file is embedded into the app and accessible from the toolbar's **AI** button, so users can copy it directly into any LLM to generate diagrams by description.
