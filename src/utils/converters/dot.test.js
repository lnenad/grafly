import { describe, it, expect } from 'vitest'
import { exportDot, importDot } from './dot.js'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function makeNode(id, overrides = {}) {
  return {
    id,
    type: 'shape',
    position: { x: 100, y: 50 },
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

// ─── exportDot ────────────────────────────────────────────────────────────────

describe('exportDot', () => {
  it('produces digraph G { } wrapper', () => {
    const out = exportDot({ nodes: [], edges: [] })
    expect(out).toMatch(/^digraph G \{/)
    expect(out).toMatch(/\}$/)
  })

  it('includes rankdir=TB', () => {
    const out = exportDot({ nodes: [], edges: [] })
    expect(out).toContain('rankdir=TB')
  })

  it('maps rect to shape=box', () => {
    const out = exportDot({ nodes: [makeNode('n1', { shapeType: 'rect', label: 'R' })], edges: [] })
    expect(out).toContain('shape=box')
  })

  it('maps roundedRect to shape=box style=rounded', () => {
    const out = exportDot({ nodes: [makeNode('n1', { shapeType: 'roundedRect', label: 'R' })], edges: [] })
    expect(out).toContain('shape=box')
    expect(out).toContain('style=rounded')
  })

  it('maps circle to shape=ellipse', () => {
    const out = exportDot({ nodes: [makeNode('n1', { shapeType: 'circle', label: 'C' })], edges: [] })
    expect(out).toContain('shape=ellipse')
  })

  it('maps diamond to shape=diamond', () => {
    const out = exportDot({ nodes: [makeNode('n1', { shapeType: 'diamond', label: 'D' })], edges: [] })
    expect(out).toContain('shape=diamond')
  })

  it('maps cylinder to shape=cylinder', () => {
    const out = exportDot({ nodes: [makeNode('n1', { shapeType: 'cylinder', label: 'DB' })], edges: [] })
    expect(out).toContain('shape=cylinder')
  })

  it('maps hexagon to shape=hexagon', () => {
    const out = exportDot({ nodes: [makeNode('n1', { shapeType: 'hexagon', label: 'H' })], edges: [] })
    expect(out).toContain('shape=hexagon')
  })

  it('maps pill to shape=oval', () => {
    const out = exportDot({ nodes: [makeNode('n1', { shapeType: 'pill', label: 'P' })], edges: [] })
    expect(out).toContain('shape=oval')
  })

  it('maps callout to shape=note', () => {
    const out = exportDot({ nodes: [makeNode('n1', { shapeType: 'callout', label: 'N' })], edges: [] })
    expect(out).toContain('shape=note')
  })

  it('maps parallelogram to shape=parallelogram', () => {
    const out = exportDot({ nodes: [makeNode('n1', { shapeType: 'parallelogram', label: 'IO' })], edges: [] })
    expect(out).toContain('shape=parallelogram')
  })

  it('maps triangle to shape=triangle', () => {
    const out = exportDot({ nodes: [makeNode('n1', { shapeType: 'triangle', label: 'T' })], edges: [] })
    expect(out).toContain('shape=triangle')
  })

  it('includes fillcolor from node data', () => {
    const out = exportDot({ nodes: [makeNode('n1', { fillColor: '#FF0000' })], edges: [] })
    expect(out).toContain('fillcolor="#FF0000"')
  })

  it('includes color (strokeColor) from node data', () => {
    const out = exportDot({ nodes: [makeNode('n1', { strokeColor: '#00FF00' })], edges: [] })
    expect(out).toContain('color="#00FF00"')
  })

  it('skips fillcolor when transparent', () => {
    const out = exportDot({ nodes: [makeNode('n1', { fillColor: 'transparent' })], edges: [] })
    expect(out).not.toContain('fillcolor')
  })

  it('annotates cloud shapes with comment="aws-ec2"', () => {
    const out = exportDot({ nodes: [makeNode('n1', { shapeType: 'aws-ec2', label: 'EC2' })], edges: [] })
    expect(out).toContain('comment="aws-ec2"')
  })

  it('annotates gcp shapes with comment="gcp-storage"', () => {
    const out = exportDot({ nodes: [makeNode('n1', { shapeType: 'gcp-storage', label: 'GCS' })], edges: [] })
    expect(out).toContain('comment="gcp-storage"')
  })

  it('includes edge label', () => {
    const out = exportDot({
      nodes: [makeNode('n1'), makeNode('n2')],
      edges: [makeEdge('e1', 'n1', 'n2', { label: 'flows to' })],
    })
    expect(out).toContain('label="flows to"')
  })

  it('sets style=dashed for dashed edges', () => {
    const out = exportDot({
      nodes: [makeNode('n1'), makeNode('n2')],
      edges: [makeEdge('e1', 'n1', 'n2', { edgeStyle: 'dashed' })],
    })
    expect(out).toContain('style=dashed')
  })

  it('sets style=dotted for dotted edges', () => {
    const out = exportDot({
      nodes: [makeNode('n1'), makeNode('n2')],
      edges: [makeEdge('e1', 'n1', 'n2', { edgeStyle: 'dotted' })],
    })
    expect(out).toContain('style=dotted')
  })

  it('sets dir=both for arrowStart edges', () => {
    const out = exportDot({
      nodes: [makeNode('n1'), makeNode('n2')],
      edges: [makeEdge('e1', 'n1', 'n2', { arrowStart: true })],
    })
    expect(out).toContain('dir=both')
  })

  it('sets arrowhead=open for open arrowType', () => {
    const out = exportDot({
      nodes: [makeNode('n1'), makeNode('n2')],
      edges: [makeEdge('e1', 'n1', 'n2', { arrowType: 'open' })],
    })
    expect(out).toContain('arrowhead=open')
  })

  it('escapes double-quotes in node labels', () => {
    const out = exportDot({ nodes: [makeNode('n1', { label: 'Say "hi"' })], edges: [] })
    expect(out).toContain('\\"hi\\"')
  })

  it('handles empty diagram gracefully', () => {
    const out = exportDot({ nodes: [], edges: [] })
    expect(typeof out).toBe('string')
    expect(out.length).toBeGreaterThan(0)
  })
})

// ─── importDot ────────────────────────────────────────────────────────────────

describe('importDot', () => {
  it('parses a simple digraph with 2 nodes and 1 edge', () => {
    const { nodes, edges } = importDot('digraph G {\n    "A" [label="Start"]\n    "B" [label="End"]\n    "A" -> "B"\n}')
    expect(nodes).toHaveLength(2)
    expect(edges).toHaveLength(1)
  })

  it('parses node label attribute', () => {
    const { nodes } = importDot('digraph G {\n    "n1" [label="My Label", shape=box]\n}')
    expect(nodes[0].data.label).toBe('My Label')
  })

  it('maps shape=box back to rect', () => {
    const { nodes } = importDot('digraph G {\n    A [shape=box]\n}')
    expect(nodes[0].data.shapeType).toBe('rect')
  })

  it('maps shape=ellipse back to circle', () => {
    const { nodes } = importDot('digraph G {\n    A [shape=ellipse]\n}')
    expect(nodes[0].data.shapeType).toBe('circle')
  })

  it('maps shape=diamond back to diamond', () => {
    const { nodes } = importDot('digraph G {\n    A [shape=diamond]\n}')
    expect(nodes[0].data.shapeType).toBe('diamond')
  })

  it('maps shape=cylinder back to cylinder', () => {
    const { nodes } = importDot('digraph G {\n    A [shape=cylinder]\n}')
    expect(nodes[0].data.shapeType).toBe('cylinder')
  })

  it('maps shape=oval back to pill', () => {
    const { nodes } = importDot('digraph G {\n    A [shape=oval]\n}')
    expect(nodes[0].data.shapeType).toBe('pill')
  })

  it('maps shape=note back to callout', () => {
    const { nodes } = importDot('digraph G {\n    A [shape=note]\n}')
    expect(nodes[0].data.shapeType).toBe('callout')
  })

  it('maps comment="aws-ec2" back to aws-ec2 shapeType', () => {
    const { nodes } = importDot('digraph G {\n    A [shape=box, comment="aws-ec2"]\n}')
    expect(nodes[0].data.shapeType).toBe('aws-ec2')
  })

  it('maps comment="gcp-storage" back to gcp-storage shapeType', () => {
    const { nodes } = importDot('digraph G {\n    A [shape=box, comment="gcp-storage"]\n}')
    expect(nodes[0].data.shapeType).toBe('gcp-storage')
  })

  it('parses edge -> statement', () => {
    const { edges } = importDot('digraph G {\n    A -> B\n}')
    expect(edges).toHaveLength(1)
  })

  it('parses edge label attribute', () => {
    const { edges } = importDot('digraph G {\n    A -> B [label="flows"]\n}')
    expect(edges[0].data.label).toBe('flows')
  })

  it('parses style=dashed edge attribute', () => {
    const { edges } = importDot('digraph G {\n    A -> B [style=dashed]\n}')
    expect(edges[0].data.edgeStyle).toBe('dashed')
  })

  it('parses style=dotted edge attribute', () => {
    const { edges } = importDot('digraph G {\n    A -> B [style=dotted]\n}')
    expect(edges[0].data.edgeStyle).toBe('dotted')
  })

  it('strips C-style /* */ block comments', () => {
    const { nodes } = importDot('digraph G { /* ignore this */ A [label="X"] }')
    expect(nodes).toHaveLength(1)
  })

  it('strips // line comments', () => {
    const { nodes } = importDot('digraph G {\n    // comment\n    A [label="X"]\n}')
    expect(nodes).toHaveLength(1)
  })

  it('strips # hash comments', () => {
    const { nodes } = importDot('digraph G {\n    # comment\n    A [label="X"]\n}')
    expect(nodes).toHaveLength(1)
  })

  it('handles quoted node IDs', () => {
    const { nodes } = importDot('digraph G {\n    "My Node" [label="Test"]\n}')
    expect(nodes).toHaveLength(1)
    expect(nodes[0].data.label).toBe('Test')
  })

  it('creates implicit nodes referenced only in edges', () => {
    const { nodes } = importDot('digraph G {\n    A -> B\n}')
    expect(nodes).toHaveLength(2)
  })

  it('throws on completely invalid input', () => {
    expect(() => importDot('this is not dot syntax at all')).toThrow()
  })

  it('throws on empty input', () => {
    expect(() => importDot('')).toThrow()
    expect(() => importDot('   ')).toThrow()
  })

  it('assigns positions (auto-layout applied)', () => {
    const { nodes } = importDot('digraph G {\n    A -> B\n}')
    expect(nodes[0].position.x).toBeDefined()
    expect(nodes[1].position.x).toBeDefined()
  })

  it('nodes have required Charty fields after import', () => {
    const { nodes } = importDot('digraph G {\n    A [label="Test"]\n}')
    const n = nodes[0]
    expect(n.type).toBe('shape')
    expect(n.position).toBeDefined()
    expect(n.data.shapeType).toBeDefined()
    expect(n.data.label).toBeDefined()
  })

  it('parses graph (undirected) in addition to digraph', () => {
    const { nodes, edges } = importDot('graph G {\n    A -- B\n}')
    expect(nodes).toHaveLength(2)
    expect(edges).toHaveLength(1)
  })

  it('round-trip: export then import preserves labels and shapes', () => {
    const original = {
      nodes: [
        makeNode('n1', { shapeType: 'rect',     label: 'Start' }),
        makeNode('n2', { shapeType: 'diamond',  label: 'Choice' }),
        makeNode('n3', { shapeType: 'cylinder', label: 'DB' }),
      ],
      edges: [makeEdge('e1', 'n1', 'n2'), makeEdge('e2', 'n2', 'n3')],
    }
    const text = exportDot(original)
    const { nodes, edges } = importDot(text)

    const labels = nodes.map(n => n.data.label).sort()
    expect(labels).toEqual(['Choice', 'DB', 'Start'])

    const shapes = nodes.map(n => n.data.shapeType).sort()
    expect(shapes).toEqual(['cylinder', 'diamond', 'rect'])

    expect(edges).toHaveLength(2)
  })
})
