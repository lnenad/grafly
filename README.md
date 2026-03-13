# Charty

A browser-based diagramming tool built with React and React Flow. Supports drag-and-drop shape libraries, customizable edges, multi-select, alignment, layering, copy/paste, and persistent local storage.

## Tech Stack

- **React** + **Vite**
- **@xyflow/react** v12.3.0 (React Flow) — controlled mode
- **Zustand** — global state + undo/redo history
- **Tailwind CSS** + **Lucide React** icons
- `localStorage` for diagram persistence

## Project Structure

```
src/
  App.jsx                    # Root layout, global keyboard shortcuts, context menu state
  index.css                  # Global overrides (React Flow cursor fixes)
  components/
    Canvas.jsx               # ReactFlow wrapper, drag-drop, context menu wiring
    Toolbar.jsx              # Top bar: file ops, undo/redo, copy/paste, view toggles
    ShapeLibrary.jsx         # Left panel: shape palette (drag source)
    PropertiesPanel.jsx      # Right panel: node/edge properties, layer controls, alignment
    ContextMenu.jsx          # Right-click context menu
    edges/
      CustomEdge.jsx         # Bendable edges with waypoint dot
    nodes/
      ShapeNode.jsx          # Resizable shape node renderer
      WaypointNode.jsx       # (internal) waypoint helper
  store/
    diagramStore.js          # Zustand store: nodes, edges, history, clipboard, settings
  data/
    basicShapes.js           # Rectangle, ellipse, diamond, etc.
    awsShapes.js             # AWS icon set
    gcpShapes.js             # GCP icon set
  utils/
    storage.js               # localStorage read/write helpers
    fileUtils.js             # Import/export (JSON, PNG)
    styleConstants.js        # Shared styling tokens (colors, font weights, dash patterns)
```

## Style Constants

All shared styling values live in `src/utils/styleConstants.js`. **New components and shape definitions must import from here instead of hardcoding values.**

```js
import {
  COLOR_PRIMARY,          // #7B61FF — brand accent (selection, handles, active states)
  COLOR_TEXT_DEFAULT,     // #111827 — default node label color
  COLOR_BORDER_DEFAULT,   // #E5E7EB — default border/stroke for cloud shapes & labels
  COLOR_EDGE_DEFAULT,     // #6B7280 — default edge stroke color
  DEFAULT_FONT_WEIGHT,    // '600'   — semibold, the standard label weight
  DEFAULT_FONT_WEIGHT_BOLD, // '700' — bold, toggled via the Bold button
  DEFAULT_FONT_SIZE,      // 13      — fallback label font size (px)
  DEFAULT_TEXT_ALIGN,     // 'center'
  DEFAULT_STROKE_WIDTH,   // 2
  DEFAULT_STROKE_STYLE,   // 'solid'
  DEFAULT_OPACITY,        // 1
  STROKE_DASH_DASHED,     // '6 3'  — dashed SVG shapes
  STROKE_DASH_DOTTED,     // '2 3'  — dotted SVG shapes & edges
  EDGE_DASH_DASHED,       // '6 4'  — dashed edges (slightly wider gap than shapes)
} from '../utils/styleConstants'
```

## Features

### Canvas
- Drag shapes from the left library onto the canvas
- Connect shapes by dragging between node handles
- Pan and zoom (scroll wheel / trackpad)
- Snap to grid (optional, 16px grid)
- Minimap (toggleable)
- Dot grid background (toggleable)

### Shapes
- Resize via drag handles
- Fill color, border color/width/style, opacity
- Text label with font size, weight, alignment, and color
- Three shape libraries: Basic, AWS, GCP

### Edges
- Three path types: **Smoothstep**, **Bezier**, **Straight**
- Bendable: drag the midpoint dot to reshape the curve
- Double-click the dot to reset to default path
- Label text on edges
- Configurable color, width, style (solid/dashed/dotted), and arrowhead
- Waypoint is constrained to the source-target bounding box for smoothstep

### Multi-select
- Hold **Shift** to add to selection, or drag a selection box
- Properties panel shows shared properties when multiple nodes are selected
- Changes apply to all selected nodes simultaneously

### Alignment (2+ nodes selected)
- Align Left / Center (H) / Right
- Align Top / Center (V) / Bottom

### Layer / Stacking Order
- Bring to Front / Bring Forward
- Send Backward / Send to Back
- Available for any selection (single or multi)

### Copy / Paste
- **Ctrl+C** / **Ctrl+V** (or toolbar buttons)
- Paste offsets by 20px and preserves internal edges between copied nodes
- Clipboard persists within the session

### Undo / Redo
- **Ctrl+Z** / **Ctrl+Y** (or **Ctrl+Shift+Z**)
- History captured on: node drag end, resize end, data changes, edge changes, connect, delete, paste, align, layer order changes
- Up to 50 history states
- Edge waypoint dragging uses `skipHistory` during mousemove; a single history entry is pushed on mouseup

### Context Menu (Right-click)
- Right-clicking a node or edge auto-selects it
- Shows: Copy, Paste, Duplicate, Delete, Layer controls, Alignment (2+ nodes)
- Closes on click-outside, Escape, or scroll

### Persistence
- Diagrams auto-save to `localStorage` with 400ms debounce
- Active diagram ID is remembered across page reloads
- Import / Export as JSON or PNG via the toolbar

## Known Issues & Resolutions

### Edge hit area not capturing pointer events
**Problem:** `stroke="transparent"` on an SVG `<path>` does not respond to pointer events even with `pointer-events: stroke`.
**Fix:** Use `stroke="rgba(0,0,0,0)"` (a real color at zero opacity) and set `pointerEvents="stroke"` as a **JSX prop** (not inside a `style` object — CSS does not accept `stroke` as a value for `pointer-events`).

### Edge not selectable after adding the hit-area path
**Problem:** Adding `onClick={(e) => e.stopPropagation()}` to the transparent hit-area path was blocking React Flow's internal edge selection handler.
**Fix:** Remove the `onClick` handler entirely from the hit-area. React Flow handles selection through its own event delegation.

### Canvas cursor always showing grab hand
**Problem:** React Flow applies `cursor: grab` to `.react-flow__pane.draggable`, which overrides any element-level cursor style.
**Fix:** Target the exact selector in `index.css` with `!important`:
```css
.react-flow__pane.draggable { cursor: default !important; }
.react-flow__pane.dragging  { cursor: grabbing !important; }
```

### Waypoint dot drifting off the edge line
**Problem:** The waypoint was stored as the bezier control point (which lies off the visible curve), so the visual dot appeared off the line.
**Fix:** Treat the stored waypoint as the **t=0.5 point on the curve**, then back-calculate the actual control point using the quadratic bezier midpoint formula:
```
B(0.5) = 0.25*P0 + 0.5*P1 + 0.25*P2
→ P1 = 2*wp - 0.5*(P0 + P2)
```

### Waypoint escaping the smoothstep line bounds
**Problem:** For smoothstep edges, dragging the waypoint freely could move it outside the visible path.
**Fix:** Clamp the waypoint to the bounding box defined by source and target positions during mousemove.

### Context menu not closing on click outside
**Problem:** `document.addEventListener('mousedown', ...)` was being swallowed by React Flow's internal event handling before it could reach the document listener.
**Fix:** Render a transparent fixed-position backdrop `<div>` behind the menu at `zIndex: 9998`. Its `onClick` handler closes the menu reliably.

### Layer controls appearing below color properties
**Problem:** After a full file rewrite, Vite's Hot Module Replacement (HMR) did not re-evaluate the new component order correctly.
**Fix:** Make a trivial edit to the file to force HMR to re-trigger a full module reload.

### `const` redeclaration errors in store
**Problem:** `alignNodes`, `bringToFront`, and `sendToBack` destructured `const { nodes }` from `get()` and then also tried to assign to `nodes` inside `set()`, causing a redeclaration error.
**Fix:** Rename the first destructure to `currentNodes` so the `set()` callback can freely declare `nodes` as its own variable.

### Right-click not auto-selecting the target
**Problem:** React Flow's `onNodeContextMenu` fires before selection state is updated, so the context menu would open showing the previously selected item.
**Fix:** Add `selectNode` / `selectEdge` actions to the Zustand store that synchronously update both the `nodes` array (`selected` flag) and `selectedNodes`/`selectedEdges` state in the same `set()` call. Call these from the context menu handlers before opening the menu.

## Keyboard Shortcuts

| Action | Shortcut |
|---|---|
| Undo | Ctrl+Z |
| Redo | Ctrl+Y / Ctrl+Shift+Z |
| Copy | Ctrl+C |
| Paste | Ctrl+V |
| Delete selected | Delete / Backspace |

## Development

```bash
npm install
npm run dev
```
