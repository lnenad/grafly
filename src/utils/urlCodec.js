/**
 * urlCodec.js — Compress/decompress Grafly diagrams for URL embedding.
 *
 * Two-layer pipeline:
 *   1. Key compression  — short keys, enum integers, color palette, defaults
 *                         omitted, IDs shortened, positions as arrays.
 *   2. LZ-string        — lossless compression tuned for repetitive JSON,
 *                         output is URL-safe (no base64 padding overhead).
 *
 * Public API:
 *   encodeDiagram(diagram) → string   (paste into URL hash)
 *   decodeDiagram(string)  → diagram
 */

import LZString from 'lz-string'

// ─── Enum tables (index → value) ─────────────────────────────────────────────

const STROKE_STYLE  = ['solid', 'dashed', 'dotted']
const PATH_TYPE     = ['smoothstep', 'bezier', 'straight']
const ARROW_TYPE    = ['filled', 'open']
const TEXT_ALIGN    = ['left', 'center', 'right']
const HANDLE        = ['top', 'right', 'bottom', 'left']
const FONT_WEIGHT   = ['600', '700']
const FONT_STYLE    = ['normal', 'italic']
const TEXT_DECO     = ['none', 'underline']

function eEnc(table, value) {
  const i = table.indexOf(String(value))
  return i === -1 ? 0 : i
}

function eDec(table, index, fallback) {
  if (index == null) return fallback ?? table[0]
  return table[index] ?? (fallback ?? table[0])
}

// ─── Color palette ────────────────────────────────────────────────────────────
// All colors across nodes + edges are collected into a shared array.
// Each color field is stored as its palette index (an integer) instead of
// a 7-character hex string. Repeated colors (very common in diagrams) cost
// only 1–2 digits instead of 7 characters.

function buildPalette(nodes, edges) {
  const seen = new Set()
  const palette = []
  const add = (c) => { if (c && !seen.has(c)) { seen.add(c); palette.push(c) } }

  for (const n of nodes) {
    const d = n.data || {}
    add(d.fillColor); add(d.strokeColor); add(d.textColor); add(d.accentColor)
  }
  for (const e of edges) {
    add((e.data || {}).edgeColor)
  }
  return palette
}

// ─── ID shortening ────────────────────────────────────────────────────────────
// n_1700000000000_a1b2 (21 chars) → n0 (2 chars)
// The shortened IDs are kept as the diagram IDs after decompression —
// they are still unique within the diagram, which is all Grafly requires.

function buildIdMaps(nodes, edges) {
  const nodeMap = Object.fromEntries(nodes.map((n, i) => [n.id, `n${i}`]))
  const edgeMap = Object.fromEntries(edges.map((e, i) => [e.id, `e${i}`]))
  return { nodeMap, edgeMap }
}

// ─── Node defaults (omit field if value equals this) ─────────────────────────

const ND = { z: 0, sw: 2, ss: 0, fw: 0, fi: 0, td: 0, ta: 1, o: 1, fs: 13 }

function compressNode(node, palette, nodeMap) {
  const d   = node.data || {}
  const sw  = d.strokeWidth  ?? 2
  const ss  = eEnc(STROKE_STYLE, d.strokeStyle  ?? 'solid')
  const fw  = eEnc(FONT_WEIGHT,  d.fontWeight   ?? '600')
  const fi  = eEnc(FONT_STYLE,   d.fontStyle    ?? 'normal')
  const td  = eEnc(TEXT_DECO,    d.textDecoration ?? 'none')
  const ta  = eEnc(TEXT_ALIGN,   d.textAlign    ?? 'center')
  const fs  = d.fontSize ?? 13
  const o   = d.opacity  ?? 1
  const z   = node.zIndex ?? 0

  const c = {
    i:  nodeMap[node.id] ?? node.id,
    x:  node.position.x,
    y:  node.position.y,
    w:  node.width,
    h:  node.height,
    s:  d.shapeType,
    f:  palette.indexOf(d.fillColor),
    k:  palette.indexOf(d.strokeColor),
    tc: palette.indexOf(d.textColor),
  }

  if (d.label)      c.l  = d.label
  if (sw !== ND.sw) c.sw = sw
  if (ss !== ND.ss) c.ss = ss
  if (fw !== ND.fw) c.fw = fw
  if (fi !== ND.fi) c.fi = fi
  if (td !== ND.td) c.td = td
  if (ta !== ND.ta) c.ta = ta
  if (fs !== ND.fs) c.fs = fs
  if (o  !== ND.o)  c.o  = o
  if (z  !== ND.z)  c.z  = z

  if (d.isCloudShape) {
    c.c  = 1
    c.ac = palette.indexOf(d.accentColor)
  }

  return c
}

function decompressNode(c, palette) {
  const node = {
    id:       c.i,
    type:     'shape',
    position: { x: c.x, y: c.y },
    width:    c.w,
    height:   c.h,
    zIndex:   c.z ?? 0,
    data: {
      shapeType:      c.s,
      label:          c.l ?? '',
      fillColor:      palette[c.f]  ?? '#EEF2FF',
      strokeColor:    palette[c.k]  ?? '#818CF8',
      strokeWidth:    c.sw ?? 2,
      strokeStyle:    eDec(STROKE_STYLE, c.ss),
      textColor:      palette[c.tc] ?? '#111827',
      fontSize:       c.fs ?? 13,
      fontWeight:     eDec(FONT_WEIGHT, c.fw),
      fontStyle:      eDec(FONT_STYLE,  c.fi),
      textDecoration: eDec(TEXT_DECO,   c.td),
      textAlign:      eDec(TEXT_ALIGN,  c.ta, 'center'),
      opacity:        c.o ?? 1,
    },
  }

  if (c.c) {
    node.data.isCloudShape = true
    node.data.accentColor  = palette[c.ac]
  }

  return node
}

// ─── Edge defaults (omit field if value equals this) ─────────────────────────

const ED = { es: 0, ew: 2, a: 0, p: 0, ar: 0, as: 0 }

function compressEdge(edge, palette, nodeMap, edgeMap) {
  const d  = edge.data || {}
  const es = eEnc(STROKE_STYLE, d.edgeStyle ?? 'solid')
  const ew = d.edgeWidth ?? 2
  const a  = d.animated  ? 1 : 0
  const p  = eEnc(PATH_TYPE,   d.pathType  ?? 'smoothstep')
  const ar = eEnc(ARROW_TYPE,  d.arrowType ?? 'filled')
  const as = d.arrowStart ? 1 : 0

  const c = {
    i:  edgeMap[edge.id]     ?? edge.id,
    s:  nodeMap[edge.source] ?? edge.source,
    t:  nodeMap[edge.target] ?? edge.target,
    ec: palette.indexOf(d.edgeColor),
  }

  if (edge.sourceHandle != null) c.sh = eEnc(HANDLE, edge.sourceHandle)
  if (edge.targetHandle != null) c.th = eEnc(HANDLE, edge.targetHandle)
  if (d.label) c.l = d.label
  if (es !== ED.es) c.es = es
  if (ew !== ED.ew) c.ew = ew
  if (a  !== ED.a)  c.a  = a
  if (p  !== ED.p)  c.p  = p
  if (ar !== ED.ar) c.ar = ar
  if (as !== ED.as) c.as = as
  if (d.waypoint)   c.wp = [d.waypoint.x, d.waypoint.y]

  return c
}

function decompressEdge(c, palette) {
  const edge = {
    id:     c.i,
    type:   'custom',
    source: c.s,
    target: c.t,
    data: {
      label:      c.l ?? '',
      edgeStyle:  eDec(STROKE_STYLE, c.es),
      edgeColor:  palette[c.ec] ?? '#6B7280',
      edgeWidth:  c.ew ?? 2,
      animated:   c.a === 1,
      pathType:   eDec(PATH_TYPE,  c.p),
      arrowType:  eDec(ARROW_TYPE, c.ar),
      arrowStart: c.as === 1,
      waypoint:   c.wp ? { x: c.wp[0], y: c.wp[1] } : null,
    },
  }

  if (c.sh != null) edge.sourceHandle = eDec(HANDLE, c.sh)
  if (c.th != null) edge.targetHandle = eDec(HANDLE, c.th)

  return edge
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Compress a Grafly diagram object into a URL-safe string.
 * The result can be placed in a URL hash: `grafly.io/view#<result>`
 */
export function encodeDiagram(diagram) {
  const { nodes = [], edges = [] } = diagram
  const palette              = buildPalette(nodes, edges)
  const { nodeMap, edgeMap } = buildIdMaps(nodes, edges)

  const compressed = {
    v:  1,                                             // codec version
    id: diagram.id,
    nm: diagram.name,
    vp: [diagram.viewport?.x ?? 0, diagram.viewport?.y ?? 0, diagram.viewport?.zoom ?? 1],
    cp: palette,
    n:  nodes.map(n => compressNode(n, palette, nodeMap)),
    e:  edges.map(e => compressEdge(e, palette, nodeMap, edgeMap)),
  }

  return LZString.compressToEncodedURIComponent(JSON.stringify(compressed))
}

/**
 * Decompress a URL-safe string back into a Grafly diagram object.
 * Throws if the string is invalid or uses an unsupported codec version.
 */
// ─── Security: sanitize colors before they reach dangerouslySetInnerHTML ────────
// accentColor flows into SVG icon functions via template literals. Only allow
// CSS hex colors (#RGB / #RRGGBB / #RRGGBBAA) — anything else is replaced with
// a safe fallback so a crafted URL cannot inject markup into the SVG.
function sanitizeColor(color) {
  if (typeof color !== 'string') return '#000000'
  return /^#[0-9A-Fa-f]{3,8}$/.test(color.trim()) ? color.trim() : '#000000'
}

export function decodeDiagram(encoded) {
  const json = LZString.decompressFromEncodedURIComponent(encoded)
  if (!json) throw new Error('Failed to decompress diagram — string may be corrupted')

  const c = JSON.parse(json)
  if (c.v !== 1) throw new Error(`Unsupported codec version: ${c.v}`)

  const palette = (c.cp ?? []).map(sanitizeColor)

  return {
    id:       c.id,
    name:     c.nm,
    viewport: { x: c.vp[0], y: c.vp[1], zoom: c.vp[2] },
    nodes:    (c.n ?? []).map(n => decompressNode(n, palette)),
    edges:    (c.e ?? []).map(e => decompressEdge(e, palette)),
  }
}
