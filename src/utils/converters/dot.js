import { BASIC_SHAPES } from '../../data/basicShapes.js'
import { COLOR_EDGE_DEFAULT } from '../styleConstants.js'
import { applyAutoLayout } from './layout.js'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function freshNodeId() {
  return `n_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`
}
function freshEdgeId() {
  return `e_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`
}

function dotQuote(id) {
  return `"${id.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`
}

function escapeDotLabel(s) {
  return (s || '')
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"')
    .replace(/\n/g, '\\n')
}

function unescapeDotLabel(s) {
  return (s || '')
    .replace(/\\n/g, '\n')
    .replace(/\\"/g, '"')
    .replace(/\\\\/g, '\\')
}

// ─── Export ───────────────────────────────────────────────────────────────────

const SHAPE_TO_DOT = {
  rect:          { shape: 'box' },
  textbox:       { shape: 'box' },
  roundedRect:   { shape: 'box',      extra: 'style=rounded' },
  circle:        { shape: 'ellipse' },
  diamond:       { shape: 'diamond' },
  cylinder:      { shape: 'cylinder' },
  hexagon:       { shape: 'hexagon' },
  parallelogram: { shape: 'parallelogram' },
  triangle:      { shape: 'triangle' },
  pill:          { shape: 'oval' },
  callout:       { shape: 'note' },
}

function nodeAttrsStr(node) {
  const d = node.data
  const st = d.shapeType
  const label = escapeDotLabel(d.label)
  const attrs = [`label="${label}"`]

  if (st.startsWith('aws-') || st.startsWith('gcp-')) {
    attrs.push('shape=box')
    attrs.push(`comment="${st}"`)
  } else {
    const mapping = SHAPE_TO_DOT[st] ?? SHAPE_TO_DOT.rect
    attrs.push(`shape=${mapping.shape}`)
    if (mapping.extra) attrs.push(mapping.extra)
  }

  if (d.fillColor && d.fillColor !== 'transparent') {
    attrs.push(`fillcolor="${d.fillColor}"`)
    // fillcolor requires style=filled (unless already set)
    if (!attrs.some(a => a.startsWith('style='))) attrs.push('style=filled')
  }
  if (d.strokeColor && d.strokeColor !== 'transparent') {
    attrs.push(`color="${d.strokeColor}"`)
  }

  return `    ${dotQuote(node.id)} [${attrs.join(', ')}]`
}

function edgeAttrsStr(edge) {
  const d = edge.data ?? {}
  const attrs = []

  if (d.label)                  attrs.push(`label="${escapeDotLabel(d.label)}"`)
  if (d.edgeStyle === 'dashed') attrs.push('style=dashed')
  if (d.edgeStyle === 'dotted') attrs.push('style=dotted')
  if (d.animated)               attrs.push('style=bold')
  if (d.arrowStart)             attrs.push('dir=both')
  if (d.arrowType === 'open')   attrs.push('arrowhead=open')
  if (d.edgeColor && d.edgeColor !== COLOR_EDGE_DEFAULT) {
    attrs.push(`color="${d.edgeColor}"`)
  }

  const attrStr = attrs.length ? ` [${attrs.join(', ')}]` : ''
  return `    ${dotQuote(edge.source)} -> ${dotQuote(edge.target)}${attrStr}`
}

export function exportDot({ nodes = [], edges = [] }) {
  const lines = [
    'digraph G {',
    '    rankdir=TB',
    '    node [fontname="Arial", fontsize=13]',
    '    edge [fontsize=11]',
    '',
  ]
  for (const n of nodes) lines.push(nodeAttrsStr(n))
  if (nodes.length && edges.length) lines.push('')
  for (const e of edges) lines.push(edgeAttrsStr(e))
  lines.push('}')
  return lines.join('\n')
}

// ─── Import ───────────────────────────────────────────────────────────────────

function stripDotComments(text) {
  let s = text.replace(/\/\*[\s\S]*?\*\//g, ' ')
  s = s.replace(/\/\/[^\n]*/g, '')
  s = s.replace(/^\s*#[^\n]*/gm, '')  // only strip # comments at start of line
  return s
}

// Returns true if the line contains -> or -- outside of quoted strings
function lineHasArrow(line) {
  let inStr = false
  for (let i = 0; i < line.length; i++) {
    if (line[i] === '"') { inStr = !inStr; continue }
    if (!inStr && line[i] === '-' && (line[i + 1] === '>' || line[i + 1] === '-')) return true
  }
  return false
}

// Extract the attribute list string from inside [...] at end of line, respecting quotes
function extractAttrStr(line) {
  // Find the last [ that opens an attr list (not inside a quoted string)
  let inStr = false
  let bracketStart = -1
  for (let i = 0; i < line.length; i++) {
    if (line[i] === '"') { inStr = !inStr; continue }
    if (!inStr && line[i] === '[') bracketStart = i
  }
  if (bracketStart === -1) return null
  const inner = line.slice(bracketStart + 1)
  const bracketEnd = inner.lastIndexOf(']')
  return bracketEnd === -1 ? null : inner.slice(0, bracketEnd)
}

// Extract the node/edge id(s) before any [ or -> from a line
function extractIds(line) {
  // Remove the attr list part if present
  let inStr = false
  let bracketStart = -1
  for (let i = 0; i < line.length; i++) {
    if (line[i] === '"') { inStr = !inStr; continue }
    if (!inStr && line[i] === '[') { bracketStart = i; break }
  }
  return bracketStart === -1 ? line : line.slice(0, bracketStart)
}

function parseAttrList(s) {
  const attrs = {}
  const re = /(\w+)\s*=\s*(?:"((?:[^"\\]|\\.)*)"|([^\s,\]]+))/g
  let m
  while ((m = re.exec(s)) !== null) {
    attrs[m[1]] = m[2] !== undefined ? m[2] : m[3]
  }
  return attrs
}

function stripQuotes(s) {
  s = s.trim()
  if ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'"))) {
    return s.slice(1, -1).replace(/\\"/g, '"')
  }
  return s
}

const DOT_SHAPE_TO_CHARTY = {
  box:           'rect',
  rectangle:     'rect',
  rect:          'rect',
  ellipse:       'circle',
  oval:          'pill',
  diamond:       'diamond',
  cylinder:      'cylinder',
  hexagon:       'hexagon',
  parallelogram: 'parallelogram',
  triangle:      'triangle',
  note:          'callout',
}

function buildNode(id, attrs) {
  // Cloud shape via comment attribute
  let shapeType
  const comment = attrs.comment
  if (comment && (comment.startsWith('aws-') || comment.startsWith('gcp-'))) {
    shapeType = comment
  } else {
    const dotShape = attrs.shape || 'box'
    shapeType = DOT_SHAPE_TO_CHARTY[dotShape] ?? 'rect'
  }

  const label = attrs.label ? unescapeDotLabel(attrs.label) : id
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
      ...(attrs.fillcolor ? { fillColor: attrs.fillcolor } : {}),
      ...(attrs.color ? { strokeColor: attrs.color } : {}),
    },
    _parsedId: id,
  }
}

function buildEdge(srcId, tgtId, attrs) {
  let edgeStyle = 'solid'
  if (attrs.style === 'dashed') edgeStyle = 'dashed'
  if (attrs.style === 'dotted') edgeStyle = 'dotted'

  return {
    id: freshEdgeId(),
    type: 'custom',
    source: srcId,
    target: tgtId,
    data: {
      label: attrs.label ? unescapeDotLabel(attrs.label) : '',
      edgeStyle,
      edgeColor: attrs.color || COLOR_EDGE_DEFAULT,
      edgeWidth: 2,
      animated: attrs.style === 'bold',
      pathType: 'smoothstep',
      arrowType: attrs.arrowhead === 'open' ? 'open' : 'filled',
      arrowStart: attrs.dir === 'both',
      waypoint: null,
    },
  }
}

// Prefixes that should be skipped (global attrs, keywords)
const SKIP_RE = /^(graph|digraph|strict|node\s*\[|edge\s*\[|rankdir|rank\s*=|label\s*=|subgraph)/i

export function importDot(text) {
  if (!text || !text.trim()) throw new Error('Empty input')

  const clean = stripDotComments(text)

  // Extract body between outer braces
  const start = clean.indexOf('{')
  const end = clean.lastIndexOf('}')
  if (start === -1 || end === -1 || end <= start) {
    throw new Error('Could not find a valid digraph/graph block')
  }
  const body = clean.slice(start + 1, end)

  // Process line by line — handles single-statement-per-line DOT (the vast majority)
  const lines = body.split('\n').map(l => l.trim().replace(/;$/, '').trim()).filter(Boolean)

  const nodeMap = new Map()   // parsedId → node
  const edgeDefs = []

  for (const line of lines) {
    if (!line || SKIP_RE.test(line) || line === '{' || line === '}') continue

    if (lineHasArrow(line)) {
      // Edge: ID1 -> ID2 [attrs] or ID1 -- ID2 [attrs]
      const attrStr = extractAttrStr(line)
      const attrs = attrStr != null ? parseAttrList(attrStr) : {}
      const idsLine = attrStr != null ? extractIds(line) : line
      // Split on -> or --
      const arrowMatch = idsLine.match(/^(.+?)\s*(?:->|--)\s*(.+)$/)
      if (arrowMatch) {
        const src = stripQuotes(arrowMatch[1].trim())
        const tgt = stripQuotes(arrowMatch[2].trim())
        if (src && tgt) edgeDefs.push({ src, tgt, attrs })
      }
      continue
    }

    // Node statement: ID [attrs] or bare ID
    const attrStr = extractAttrStr(line)
    if (attrStr != null) {
      const idPart = extractIds(line).trim()
      const id = stripQuotes(idPart)
      if (id && !id.includes('{') && !id.includes('}')) {
        const attrs = parseAttrList(attrStr)
        nodeMap.set(id, buildNode(id, attrs))
      }
      continue
    }

    // Bare id (no brackets)
    const id = stripQuotes(line)
    if (id && /^[\w"]/.test(line) && !id.includes('{') && !id.includes('}')) {
      if (!nodeMap.has(id)) nodeMap.set(id, buildNode(id, {}))
    }
  }

  if (!nodeMap.size && !edgeDefs.length) {
    throw new Error('No nodes or edges found. Is this valid DOT syntax?')
  }

  // Create implicit nodes
  for (const e of edgeDefs) {
    for (const pid of [e.src, e.tgt]) {
      if (!nodeMap.has(pid)) {
        nodeMap.set(pid, buildNode(pid, {}))
      }
    }
  }

  const idMap = new Map()
  for (const [pid, node] of nodeMap) idMap.set(pid, node.id)

  const nodes = [...nodeMap.values()].map(n => {
    const { _parsedId, ...rest } = n
    return rest
  })

  const edges = edgeDefs
    .filter(e => idMap.has(e.src) && idMap.has(e.tgt))
    .map(e => buildEdge(idMap.get(e.src), idMap.get(e.tgt), e.attrs))

  applyAutoLayout(nodes, edges)

  return { nodes, edges }
}
