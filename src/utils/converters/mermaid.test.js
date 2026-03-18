import { describe, it, expect } from 'vitest'
import { exportMermaid, importMermaid } from './mermaid.js'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function makeNode(id, overrides = {}) {
  return {
    id,
    type: 'shape',
    position: { x: 0, y: 0 },
    width: 160,
    height: 80,
    zIndex: 0,
    data: {
      shapeType: 'rect',
      label: 'Node',
      fillColor: '#EEF2FF',
      strokeColor: '#818CF8',
      strokeWidth: 2,
      strokeStyle: 'solid',
      textColor: '#111827',
      fontSize: 13,
      fontWeight: '600',
      opacity: 1,
      ...overrides,
    },
  }
}

function makeEdge(id, source, target, overrides = {}) {
  return {
    id,
    type: 'custom',
    source,
    target,
    data: {
      label: '',
      edgeStyle: 'solid',
      edgeColor: '#6B7280',
      edgeWidth: 2,
      animated: false,
      pathType: 'smoothstep',
      arrowType: 'filled',
      arrowStart: false,
      waypoint: null,
      ...overrides,
    },
  }
}

// ─── exportMermaid ─────────────────────────────────────────────────────────────

describe('exportMermaid', () => {
  it('produces flowchart TD header', () => {
    const out = exportMermaid({ nodes: [], edges: [] })
    expect(out).toMatch(/^flowchart TD/)
  })

  it('maps rect shapeType to ["label"] syntax', () => {
    const out = exportMermaid({ nodes: [makeNode('n1', { shapeType: 'rect', label: 'Start' })], edges: [] })
    expect(out).toContain('["Start"]')
  })

  it('maps textbox to ["label"]', () => {
    const out = exportMermaid({ nodes: [makeNode('n1', { shapeType: 'textbox', label: 'Text' })], edges: [] })
    expect(out).toContain('["Text"]')
  })

  it('maps roundedRect to ("label")', () => {
    const out = exportMermaid({ nodes: [makeNode('n1', { shapeType: 'roundedRect', label: 'A' })], edges: [] })
    expect(out).toMatch(/\("A"\)/)
  })

  it('maps circle to (("label"))', () => {
    const out = exportMermaid({ nodes: [makeNode('n1', { shapeType: 'circle', label: 'C' })], edges: [] })
    expect(out).toContain('(("C"))')
  })

  it('maps diamond to {"label"}', () => {
    const out = exportMermaid({ nodes: [makeNode('n1', { shapeType: 'diamond', label: 'D' })], edges: [] })
    expect(out).toContain('{"D"}')
  })

  it('maps hexagon to {{"label"}}', () => {
    const out = exportMermaid({ nodes: [makeNode('n1', { shapeType: 'hexagon', label: 'H' })], edges: [] })
    expect(out).toContain('{{"H"}}')
  })

  it('maps parallelogram to [/"label"/]', () => {
    const out = exportMermaid({ nodes: [makeNode('n1', { shapeType: 'parallelogram', label: 'P' })], edges: [] })
    expect(out).toContain('[/"P"/]')
  })

  it('maps cylinder to [("label")]', () => {
    const out = exportMermaid({ nodes: [makeNode('n1', { shapeType: 'cylinder', label: 'DB' })], edges: [] })
    expect(out).toContain('[("DB")]')
  })

  it('maps pill to (["label"])', () => {
    const out = exportMermaid({ nodes: [makeNode('n1', { shapeType: 'pill', label: 'Pill' })], edges: [] })
    expect(out).toContain('(["Pill"])')
  })

  it('maps callout to >"label"]', () => {
    const out = exportMermaid({ nodes: [makeNode('n1', { shapeType: 'callout', label: 'Note' })], edges: [] })
    expect(out).toContain('>"Note"]')
  })

  it('maps triangle to [/"label"\\]', () => {
    const out = exportMermaid({ nodes: [makeNode('n1', { shapeType: 'triangle', label: 'T' })], edges: [] })
    expect(out).toContain('[/"T"\\]')
  })

  it('annotates aws-* shapes with %% cloud comment and falls back to rect syntax', () => {
    const out = exportMermaid({ nodes: [makeNode('n1', { shapeType: 'aws-ec2', label: 'EC2' })], edges: [] })
    expect(out).toContain('%% cloud:aws-ec2')
    expect(out).toContain('["EC2"]')
  })

  it('annotates gcp-* shapes with %% cloud comment', () => {
    const out = exportMermaid({ nodes: [makeNode('n1', { shapeType: 'gcp-storage', label: 'GCS' })], edges: [] })
    expect(out).toContain('%% cloud:gcp-storage')
  })

  it('escapes double-quotes in labels', () => {
    const out = exportMermaid({ nodes: [makeNode('n1', { label: 'Say "hello"' })], edges: [] })
    expect(out).toContain('#quot;')
    expect(out).not.toContain('"hello"')
  })

  it('escapes < and > as #lt; and #gt;', () => {
    const out = exportMermaid({ nodes: [makeNode('n1', { label: 'a < b > c' })], edges: [] })
    expect(out).toContain('#lt;')
    expect(out).toContain('#gt;')
  })

  it('replaces empty label with a space to avoid Mermaid parse errors', () => {
    const out = exportMermaid({ nodes: [makeNode('n1', { label: '' })], edges: [] })
    expect(out).not.toContain('[""]')
    expect(out).toContain('[" "]')
  })

  it('renders solid arrow edge as -->', () => {
    const out = exportMermaid({
      nodes: [makeNode('n1'), makeNode('n2')],
      edges: [makeEdge('e1', 'n1', 'n2')],
    })
    expect(out).toMatch(/-->/)
  })

  it('renders solid no-arrow edge as ---', () => {
    const out = exportMermaid({
      nodes: [makeNode('n1'), makeNode('n2')],
      edges: [makeEdge('e1', 'n1', 'n2', { arrowType: 'open' })],
    })
    expect(out).toMatch(/---/)
  })

  it('renders dashed arrow edge as -.->', () => {
    const out = exportMermaid({
      nodes: [makeNode('n1'), makeNode('n2')],
      edges: [makeEdge('e1', 'n1', 'n2', { edgeStyle: 'dashed' })],
    })
    expect(out).toMatch(/-\.->/)
  })

  it('renders animated edge as ==>', () => {
    const out = exportMermaid({
      nodes: [makeNode('n1'), makeNode('n2')],
      edges: [makeEdge('e1', 'n1', 'n2', { animated: true })],
    })
    expect(out).toMatch(/==>/)
  })

  it('renders bidirectional edge with <', () => {
    const out = exportMermaid({
      nodes: [makeNode('n1'), makeNode('n2')],
      edges: [makeEdge('e1', 'n1', 'n2', { arrowStart: true })],
    })
    expect(out).toMatch(/</)
  })

  it('renders edge with label using |"label"| syntax', () => {
    const out = exportMermaid({
      nodes: [makeNode('n1'), makeNode('n2')],
      edges: [makeEdge('e1', 'n1', 'n2', { label: 'yes' })],
    })
    expect(out).toContain('|"yes"|')
  })

  it('skips edges where source or target is not in the node list', () => {
    const out = exportMermaid({
      nodes: [makeNode('n1')],
      edges: [makeEdge('e1', 'n1', 'missing')],
    })
    // No edge lines should appear (only header + node)
    expect(out).not.toContain('->')
  })

  it('handles empty nodes and edges gracefully', () => {
    const out = exportMermaid({ nodes: [], edges: [] })
    expect(out).toBe('flowchart TD')
  })
})

// ─── importMermaid ─────────────────────────────────────────────────────────────

describe('importMermaid', () => {
  it('parses a simple flowchart with 2 nodes and 1 edge', () => {
    const { nodes, edges } = importMermaid('flowchart TD\n    A["Start"] --> B["End"]')
    expect(nodes).toHaveLength(2)
    expect(edges).toHaveLength(1)
  })

  it('parses rect node syntax ["label"]', () => {
    const { nodes } = importMermaid('flowchart TD\n    A["My Node"]')
    expect(nodes[0].data.shapeType).toBe('rect')
    expect(nodes[0].data.label).toBe('My Node')
  })

  it('parses roundedRect node syntax ("label")', () => {
    const { nodes } = importMermaid('flowchart TD\n    A("Rounded")')
    expect(nodes[0].data.shapeType).toBe('roundedRect')
    expect(nodes[0].data.label).toBe('Rounded')
  })

  it('parses circle node syntax (("label"))', () => {
    const { nodes } = importMermaid('flowchart TD\n    A(("Circle"))')
    expect(nodes[0].data.shapeType).toBe('circle')
  })

  it('parses diamond node syntax {"label"}', () => {
    const { nodes } = importMermaid('flowchart TD\n    A{"Diamond"}')
    expect(nodes[0].data.shapeType).toBe('diamond')
  })

  it('parses hexagon node syntax {{"label"}}', () => {
    const { nodes } = importMermaid('flowchart TD\n    A{{"Hex"}}')
    expect(nodes[0].data.shapeType).toBe('hexagon')
  })

  it('parses cylinder node syntax [("label")]', () => {
    const { nodes } = importMermaid('flowchart TD\n    A[("DB")]')
    expect(nodes[0].data.shapeType).toBe('cylinder')
  })

  it('parses pill node syntax (["label"])', () => {
    const { nodes } = importMermaid('flowchart TD\n    A(["Pill"])')
    expect(nodes[0].data.shapeType).toBe('pill')
  })

  it('parses edge labels from |"text"| syntax', () => {
    const { edges } = importMermaid('flowchart TD\n    A -->|"yes"| B')
    expect(edges[0].data.label).toBe('yes')
  })

  it('strips %% comments before parsing', () => {
    const { nodes, edges } = importMermaid('flowchart TD\n    %% this is a comment\n    A["Start"] --> B["End"]')
    expect(nodes).toHaveLength(2)
    expect(edges).toHaveLength(1)
  })

  it('parses %% cloud:aws-ec2 annotation and sets shapeType', () => {
    const text = 'flowchart TD\n    %% cloud:aws-ec2\n    A["EC2"]'
    const { nodes } = importMermaid(text)
    expect(nodes[0].data.shapeType).toBe('aws-ec2')
  })

  it('parses %% cloud:gcp-storage annotation', () => {
    const text = 'flowchart TD\n    %% cloud:gcp-storage\n    A["GCS"]'
    const { nodes } = importMermaid(text)
    expect(nodes[0].data.shapeType).toBe('gcp-storage')
  })

  it('creates implicit rect nodes referenced only in edges', () => {
    const { nodes } = importMermaid('flowchart TD\n    A --> B')
    expect(nodes).toHaveLength(2)
    expect(nodes.every(n => n.data.shapeType === 'rect')).toBe(true)
  })

  it('unescapes #quot; back to " in labels', () => {
    const { nodes } = importMermaid('flowchart TD\n    A["Say #quot;hello#quot;"]')
    expect(nodes[0].data.label).toBe('Say "hello"')
  })

  it('unescapes #lt; and #gt;', () => {
    const { nodes } = importMermaid('flowchart TD\n    A["a #lt; b #gt; c"]')
    expect(nodes[0].data.label).toBe('a < b > c')
  })

  it('throws on completely invalid input', () => {
    expect(() => importMermaid('not a diagram at all !!!@@@###')).toThrow()
  })

  it('throws on empty input', () => {
    expect(() => importMermaid('')).toThrow()
    expect(() => importMermaid('   ')).toThrow()
  })

  it('assigns positions (auto-layout applied)', () => {
    const { nodes } = importMermaid('flowchart TD\n    A["Start"] --> B["End"]')
    expect(nodes[0].position.x).toBeDefined()
    expect(nodes[1].position.x).toBeDefined()
    // Two connected nodes should have different x values
    expect(nodes[0].position.x).not.toBe(nodes[1].position.x)
  })

  it('generates valid Charty node IDs', () => {
    const { nodes } = importMermaid('flowchart TD\n    A["Node"]')
    expect(nodes[0].id).toMatch(/^n_\d+_[a-z0-9]+$/)
  })

  it('parses graph LR direction prefix without error', () => {
    const { nodes } = importMermaid('graph LR\n    A["LR"]')
    expect(nodes).toHaveLength(1)
  })

  it('round-trip: export then import preserves labels and shape types', () => {
    const original = {
      nodes: [
        makeNode('n1', { shapeType: 'rect',    label: 'Start' }),
        makeNode('n2', { shapeType: 'diamond', label: 'Decision' }),
        makeNode('n3', { shapeType: 'circle',  label: 'End' }),
      ],
      edges: [makeEdge('e1', 'n1', 'n2'), makeEdge('e2', 'n2', 'n3')],
    }
    const text = exportMermaid(original)
    const { nodes, edges } = importMermaid(text)

    const labels = nodes.map(n => n.data.label).sort()
    expect(labels).toEqual(['Decision', 'End', 'Start'])

    const shapes = nodes.map(n => n.data.shapeType).sort()
    expect(shapes).toEqual(['circle', 'diamond', 'rect'])

    expect(edges).toHaveLength(2)
  })

  it('nodes have required Charty fields after import', () => {
    const { nodes } = importMermaid('flowchart TD\n    A["Test"]')
    const n = nodes[0]
    expect(n.type).toBe('shape')
    expect(n.position).toBeDefined()
    expect(n.data.shapeType).toBeDefined()
    expect(n.data.label).toBeDefined()
  })
})
