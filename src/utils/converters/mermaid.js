import { BASIC_SHAPES } from '../../data/basicShapes.js'
import {
  COLOR_EDGE_DEFAULT,
  COLOR_TEXT_DEFAULT,
  DEFAULT_FONT_WEIGHT,
  DEFAULT_STROKE_STYLE,
  DEFAULT_OPACITY,
  DEFAULT_FONT_SIZE,
} from '../styleConstants.js'
import { applyAutoLayout } from './layout.js'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function freshNodeId() {
  return `n_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`
}
function freshEdgeId() {
  return `e_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`
}

// Mermaid IDs must be alphanumeric
function sanitizeId(id) {
  const safe = id.replace(/[^A-Za-z0-9]/g, '')
  return /^\d/.test(safe) ? 'n' + safe : (safe || 'node')
}

function escapeLbl(s) {
  return (s || '')
    .replace(/&/g, '#amp;')
    .replace(/"/g, '#quot;')
    .replace(/</g, '#lt;')
    .replace(/>/g, '#gt;')
    .replace(/\n/g, '<br/>')
}

function unescapeLbl(s) {
  return (s || '')
    .replace(/#quot;/g, '"')
    .replace(/#lt;/g, '<')
    .replace(/#gt;/g, '>')
    .replace(/#amp;/g, '&')
    .replace(/<br\/>/g, '\n')
}

// ─── Export ───────────────────────────────────────────────────────────────────

const SHAPE_TO_MERMAID = {
  rect:          (id, lbl) => `${id}["${lbl}"]`,
  textbox:       (id, lbl) => `${id}["${lbl}"]`,
  roundedRect:   (id, lbl) => `${id}("${lbl}")`,
  circle:        (id, lbl) => `${id}(("${lbl}"))`,
  diamond:       (id, lbl) => `${id}{"${lbl}"}`,
  hexagon:       (id, lbl) => `${id}{{"${lbl}"}}`,
  parallelogram: (id, lbl) => `${id}[/"${lbl}"/]`,
  cylinder:      (id, lbl) => `${id}[("${lbl}")]`,
  pill:          (id, lbl) => `${id}(["${lbl}"])`,
  callout:       (id, lbl) => `${id}>"${lbl}"]`,
  triangle:      (id, lbl) => `${id}[/"${lbl}"\\]`,
}

function nodeToMermaid(node, safeId) {
  const lbl = escapeLbl(node.data.label) || ' '
  const st = node.data.shapeType
  const lines = []
  if (st.startsWith('aws-') || st.startsWith('gcp-')) {
    lines.push(`    %% cloud:${st}`)
    lines.push(`    ${SHAPE_TO_MERMAID.rect(safeId, lbl)}`)
  } else {
    const fn = SHAPE_TO_MERMAID[st] ?? SHAPE_TO_MERMAID.rect
    lines.push(`    ${fn(safeId, lbl)}`)
  }
  return lines.join('\n')
}

function edgeToMermaid(edge, srcId, tgtId) {
  const d = edge.data ?? {}
  const labelSuffix = d.label ? ` |"${escapeLbl(d.label)}"|` : ''
  const dashed = d.edgeStyle === 'dashed' || d.edgeStyle === 'dotted'
  const bidir = d.arrowStart === true
  const noArrow = d.arrowType === 'open' && !bidir
  let arrow

  if (d.animated) {
    arrow = bidir ? `<==>` : `==>`
  } else if (dashed) {
    if (bidir)        arrow = `<-.->`
    else if (noArrow) arrow = `-.-`
    else              arrow = `-.->`
  } else {
    if (bidir)        arrow = `<-->`
    else if (noArrow) arrow = `---`
    else              arrow = `-->`
  }

  return `    ${srcId} ${arrow}${labelSuffix} ${tgtId}`
}

export function exportMermaid({ nodes = [], edges = [] }) {
  const idMap = {}
  const usedIds = new Set()
  for (const n of nodes) {
    let safe = sanitizeId(n.id)
    // deduplicate
    let candidate = safe
    let i = 2
    while (usedIds.has(candidate)) candidate = safe + i++
    idMap[n.id] = candidate
    usedIds.add(candidate)
  }

  const nodeLines = nodes.map(n => nodeToMermaid(n, idMap[n.id]))
  const edgeLines = edges
    .filter(e => idMap[e.source] && idMap[e.target])
    .map(e => edgeToMermaid(e, idMap[e.source], idMap[e.target]))

  const parts = ['flowchart TD', '']
  if (nodeLines.length) parts.push(...nodeLines, '')
  if (edgeLines.length) parts.push(...edgeLines)

  return parts.join('\n').trimEnd()
}

// ─── Import ───────────────────────────────────────────────────────────────────

// Ranked node patterns (most-specific first)
const NODE_PATTERNS = [
  { re: /^(\w[\w-]*)\s*\[\("(.+?)"\)\]\s*$/,     shape: 'cylinder' },
  { re: /^(\w[\w-]*)\s*\(\["(.+?)"\]\)\s*$/,     shape: 'pill' },
  { re: /^(\w[\w-]*)\s*\{\{"(.+?)"\}\}\s*$/,     shape: 'hexagon' },
  { re: /^(\w[\w-]*)\s*\{"(.+?)"\}\s*$/,         shape: 'diamond' },
  { re: /^(\w[\w-]*)\s*\(\("(.+?)"\)\)\s*$/,     shape: 'circle' },
  { re: /^(\w[\w-]*)\s*\("(.+?)"\)\s*$/,         shape: 'roundedRect' },
  { re: /^(\w[\w-]*)\s*\[\/["']?(.+?)["']?\/\]\s*$/, shape: 'parallelogram' },
  { re: /^(\w[\w-]*)\s*\[\/["']?(.+?)["']?\\?\]\s*$/, shape: 'triangle' },
  { re: /^(\w[\w-]*)\s*>["']?(.+?)["']?\]\s*$/,  shape: 'callout' },
  { re: /^(\w[\w-]*)\s*\[["']?(.+?)["']?\]\s*$/, shape: 'rect' },
  { re: /^(\w[\w-]*)$/,                           shape: 'rect', labelFromId: true },
]

// Arrow patterns applied after label extraction. Each has 2 groups: src, tgt.
const ARROW_PATTERNS = [
  { re: /^(.+?)\s*<==>\s*(.+)$/,  animated: true,  bidir: true  },
  { re: /^(.+?)\s*==>\s*(.+)$/,   animated: true,  bidir: false },
  { re: /^(.+?)\s*<-.->(.+)$/,    style: 'dashed', bidir: true  },
  { re: /^(.+?)\s*-.->(.+)$/,     style: 'dashed', bidir: false },
  { re: /^(.+?)\s*-\.-\s*(.+)$/,  style: 'dashed', noArrow: true },
  { re: /^(.+?)\s*<-->\s*(.+)$/,  style: 'solid',  bidir: true  },
  { re: /^(.+?)\s*-->\s*(.+)$/,   style: 'solid',  bidir: false },
  { re: /^(.+?)\s*---\s*(.+)$/,   style: 'solid',  noArrow: true },
]

const ARROW_RE = /<==>|==>|<-.->|-.->|-\.-|<-->|-->|---|<--|--/

function hasArrow(line) {
  // Strip label first so |"text"| containing dashes doesn't falsely match
  const clean = line.replace(/\|["']?[^|]*?["']?\|/g, '')
  return ARROW_RE.test(clean)
}

function parseNode(line, pendingCloud) {
  for (const p of NODE_PATTERNS) {
    const m = line.match(p.re)
    if (m) {
      const id = m[1]
      const label = unescapeLbl(p.labelFromId ? id : m[2])
      const shapeType = pendingCloud || p.shape
      return { parsedId: id, label, shapeType }
    }
  }
  return null
}

function parseEdge(line) {
  // Step 1: extract |"label"| (or |label|) anywhere in the line
  let label = ''
  const cleanLine = line
    .replace(/\|"([^|]*)"\|/, (_, lbl) => { label = unescapeLbl(lbl.trim()); return ' ' })
    .replace(/\|([^|]+)\|/, (_, lbl) => { if (!label) label = unescapeLbl(lbl.trim()); return ' ' })
    .replace(/\s{2,}/g, ' ')
    .trim()

  // Step 2: match clean line against arrow patterns
  for (const p of ARROW_PATTERNS) {
    const m = cleanLine.match(p.re)
    if (!m) continue
    return {
      src: m[1].trim(),
      tgt: m[2].trim(),
      label,
      style: p.style || 'solid',
      animated: p.animated || false,
      bidir: p.bidir || false,
      noArrow: p.noArrow || false,
    }
  }
  return null
}

function buildNode(parsedId, shapeType, label) {
  const shapeDef = BASIC_SHAPES.find(s => s.id === shapeType) ?? BASIC_SHAPES[0]
  return {
    id: freshNodeId(),
    type: 'shape',
    position: { x: 0, y: 0 },
    width: shapeDef.defaultWidth,
    height: shapeDef.defaultHeight,
    zIndex: 0,
    data: {
      ...shapeDef.defaultData,
      shapeType,
      label,
    },
    _parsedId: parsedId,
  }
}

function buildEdge(srcId, tgtId, props) {
  return {
    id: freshEdgeId(),
    type: 'custom',
    source: srcId,
    target: tgtId,
    data: {
      label: props.label || '',
      edgeStyle: props.style || 'solid',
      edgeColor: COLOR_EDGE_DEFAULT,
      edgeWidth: 2,
      animated: props.animated || false,
      pathType: 'smoothstep',
      arrowType: props.noArrow ? 'open' : 'filled',
      arrowStart: props.bidir || false,
      waypoint: null,
    },
  }
}

export function importMermaid(text) {
  if (!text || !text.trim()) throw new Error('Empty input')

  const lines = text.split('\n')

  // Strip direction line
  const firstLine = lines[0].trim().toLowerCase()
  const isHeader = firstLine.startsWith('flowchart') || firstLine.startsWith('graph')
  const bodyLines = isHeader ? lines.slice(1) : lines

  // Parse with comment tracking
  const nodeMap = new Map()   // parsedId → node
  const edgeDefs = []
  let pendingCloud = null

  for (const rawLine of bodyLines) {
    // Extract cloud annotation from comment
    const cloudMatch = rawLine.match(/%%\s*cloud:([\w-]+)/)
    if (cloudMatch) {
      pendingCloud = cloudMatch[1]
      continue
    }
    // Strip inline comments
    const line = rawLine.replace(/%%.*$/, '').trim()
    if (!line) continue

    if (hasArrow(line)) {
      const parsed = parseEdge(line)
      if (parsed) edgeDefs.push(parsed)
      pendingCloud = null
    } else {
      const parsed = parseNode(line, pendingCloud)
      if (parsed) {
        // Last definition wins
        nodeMap.set(parsed.parsedId, buildNode(parsed.parsedId, parsed.shapeType, parsed.label))
      }
      pendingCloud = null
    }
  }

  if (!nodeMap.size && !edgeDefs.length) {
    throw new Error('No nodes or edges found. Is this a valid Mermaid flowchart?')
  }

  // Create implicit nodes for IDs referenced only in edges
  for (const e of edgeDefs) {
    for (const pid of [e.src, e.tgt]) {
      if (!nodeMap.has(pid)) {
        nodeMap.set(pid, buildNode(pid, 'rect', pid))
      }
    }
  }

  // Build parsedId → charty id map
  const idMap = new Map()
  for (const [pid, node] of nodeMap) idMap.set(pid, node.id)

  const nodes = [...nodeMap.values()].map(n => {
    const { _parsedId, ...rest } = n
    return rest
  })

  const edges = edgeDefs
    .filter(e => idMap.has(e.src) && idMap.has(e.tgt))
    .map(e => buildEdge(idMap.get(e.src), idMap.get(e.tgt), e))

  applyAutoLayout(nodes, edges)

  return { nodes, edges }
}
