# Grafly

**Free, browser-based diagramming tool.** Create flowcharts, AWS and GCP architecture diagrams, and anything in between — no account required, everything saves locally.

🌐 [grafly.io](https://grafly.io)

![License: AGPL-3.0](https://img.shields.io/badge/License-AGPL--3.0-blueviolet.svg)
![Built with React](https://img.shields.io/badge/Built%20with-React-61DAFB?logo=react&logoColor=white)
![Powered by React Flow](https://img.shields.io/badge/Powered%20by-React%20Flow-FF0072)

---

## Features

**Shapes & Libraries**
- 11 basic shapes — rectangle, circle, diamond, cylinder, callout, and more
- AWS icon library (EC2, Lambda, S3, RDS, CloudFront, …)
- GCP icon library (Compute Engine, Cloud Run, BigQuery, Pub/Sub, …)
- Drag shapes from the palette onto the canvas

**Canvas**
- Pan with middle-click or Shift+drag · Zoom with scroll wheel
- Selection box with left-drag
- Optional dot grid, snap-to-grid, and minimap

**Edges**
- Three path types: Curved, Bezier, Straight
- Drag the midpoint to bend any edge · Double-click to reset
- Solid, dashed, and dotted styles · Filled or open arrowheads · Animated flow

**Editing**
- Resize shapes with drag handles
- Fill, stroke, opacity, font size/weight/color/alignment per shape
- Multi-select with bulk property editing and alignment tools
- Layer order controls (Bring to Front, Send to Back, …)
- Full undo/redo (50 steps)

**Projects**
- Multiple diagrams stored in `localStorage`
- Projects panel to switch, rename, and delete diagrams
- Export / import as JSON · Download as PNG

**Quality of life**
- Dark / light / auto theme
- Tooltips on every control
- Custom color picker
- AI format reference — paste the schema into any LLM to generate diagrams from text
- Right-click context menu

---

## Getting Started

```bash
git clone https://github.com/your-username/grafly.git
cd grafly
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

### Build for production

```bash
npm run build
```

Output goes to `dist/`. See `infra/` for Terraform to deploy on AWS S3 + CloudFront.

---

## Keyboard Shortcuts

| Action | Shortcut |
|--------|----------|
| Undo | `Ctrl+Z` |
| Redo | `Ctrl+Y` or `Ctrl+Shift+Z` |
| Copy | `Ctrl+C` |
| Paste | `Ctrl+V` |
| Delete selected | `Delete` / `Backspace` |
| Pan canvas | `Middle-click drag` or `Shift+drag` |

---

## Tech Stack

- **React** + **Vite**
- **@xyflow/react** v12 — canvas and node/edge rendering
- **Zustand** — global state management with undo/redo history
- **Tailwind CSS** — styling with dark mode support
- **Lucide React** — icons
- **react-colorful** — color picker

---

## Infrastructure

The `infra/` directory contains Terraform for deploying to AWS:
- S3 (private bucket) + CloudFront with Origin Access Control
- ACM TLS certificate with Route 53 DNS validation
- SPA routing handled via CloudFront custom error responses

---

## Contributing

Contributions are welcome. For significant changes please open an issue first to discuss direction.

For internal architecture notes, known gotchas, and conventions see [`AGENTS.md`](./AGENTS.md).

---

## License

Grafly is open source under the [GNU Affero General Public License v3.0](./LICENSE) (AGPL-3.0).

If you want to use Grafly in a commercial product without open-sourcing your application, a commercial license is available — contact [license@grafly.io](mailto:license@grafly.io).
