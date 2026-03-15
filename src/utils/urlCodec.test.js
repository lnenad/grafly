import { describe, it, expect } from 'vitest'
import LZString from 'lz-string'
import { encodeDiagram, decodeDiagram } from './urlCodec.js'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function makeNode(id, overrides = {}) {
  return {
    id,
    type: 'shape',
    position: { x: 100, y: 200 },
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
      fontStyle: 'normal',
      textDecoration: 'none',
      textAlign: 'center',
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
    sourceHandle: 'right',
    targetHandle: 'left',
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

function makeDiagram(nodes, edges, overrides = {}) {
  return {
    id: 'diagram_test_001',
    name: 'Test Diagram',
    viewport: { x: 0, y: 0, zoom: 1 },
    nodes,
    edges,
    ...overrides,
  }
}

// ─── Round-trip helpers ───────────────────────────────────────────────────────

/** Encode then decode, verify structural equality of nodes and edges. */
function roundTrip(diagram) {
  const encoded = encodeDiagram(diagram)
  const decoded = decodeDiagram(encoded)
  return { encoded, decoded }
}

function expectNodeEqual(got, want) {
  // IDs are shortened to n0, n1, … so we only check data fields
  expect(got.type).toBe('shape')
  expect(got.position).toEqual(want.position)
  expect(got.width).toBe(want.width)
  expect(got.height).toBe(want.height)
  expect(got.zIndex).toBe(want.zIndex ?? 0)
  expect(got.data.shapeType).toBe(want.data.shapeType)
  expect(got.data.label).toBe(want.data.label)
  expect(got.data.fillColor).toBe(want.data.fillColor)
  expect(got.data.strokeColor).toBe(want.data.strokeColor)
  expect(got.data.strokeWidth).toBe(want.data.strokeWidth ?? 2)
  expect(got.data.strokeStyle).toBe(want.data.strokeStyle ?? 'solid')
  expect(got.data.textColor).toBe(want.data.textColor)
  expect(got.data.fontSize).toBe(want.data.fontSize ?? 13)
  expect(got.data.fontWeight).toBe(want.data.fontWeight ?? '600')
  expect(got.data.fontStyle).toBe(want.data.fontStyle ?? 'normal')
  expect(got.data.textDecoration).toBe(want.data.textDecoration ?? 'none')
  expect(got.data.textAlign).toBe(want.data.textAlign ?? 'center')
  expect(got.data.opacity).toBe(want.data.opacity ?? 1)
}

function expectEdgeEqual(got, want) {
  expect(got.type).toBe('custom')
  expect(got.data.label).toBe(want.data.label ?? '')
  expect(got.data.edgeStyle).toBe(want.data.edgeStyle ?? 'solid')
  expect(got.data.edgeColor).toBe(want.data.edgeColor)
  expect(got.data.edgeWidth).toBe(want.data.edgeWidth ?? 2)
  expect(got.data.animated).toBe(want.data.animated ?? false)
  expect(got.data.pathType).toBe(want.data.pathType ?? 'smoothstep')
  expect(got.data.arrowType).toBe(want.data.arrowType ?? 'filled')
  expect(got.data.arrowStart).toBe(want.data.arrowStart ?? false)
  expect(got.data.waypoint).toEqual(want.data.waypoint ?? null)
  if (want.sourceHandle != null) expect(got.sourceHandle).toBe(want.sourceHandle)
  if (want.targetHandle != null) expect(got.targetHandle).toBe(want.targetHandle)
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('encodeDiagram / decodeDiagram', () => {

  // ── Basic round-trip ────────────────────────────────────────────────────────

  it('round-trips a single default node with no edges', () => {
    const node = makeNode('n_001')
    const diagram = makeDiagram([node], [])
    const { decoded } = roundTrip(diagram)

    expect(decoded.nodes).toHaveLength(1)
    expect(decoded.edges).toHaveLength(0)
    expectNodeEqual(decoded.nodes[0], node)
  })

  it('preserves diagram metadata (name, viewport)', () => {
    const diagram = makeDiagram([], [], {
      id: 'diagram_abc',
      name: 'My Flowchart',
      viewport: { x: 120, y: -40, zoom: 0.75 },
    })
    const { decoded } = roundTrip(diagram)

    expect(decoded.id).toBe('diagram_abc')
    expect(decoded.name).toBe('My Flowchart')
    expect(decoded.viewport).toEqual({ x: 120, y: -40, zoom: 0.75 })
  })

  it('round-trips an edge with all fields at non-default values', () => {
    const n0 = makeNode('n_a')
    const n1 = makeNode('n_b')
    const edge = makeEdge('e_ab', 'n_a', 'n_b', {
      edgeStyle:  'dashed',
      edgeColor:  '#FF0000',
      edgeWidth:  3,
      animated:   true,
      pathType:   'bezier',
      arrowType:  'open',
      arrowStart: true,
      label:      'flows to',
    })
    const { decoded } = roundTrip(makeDiagram([n0, n1], [edge]))

    expect(decoded.edges).toHaveLength(1)
    expectEdgeEqual(decoded.edges[0], edge)
  })

  // ── Enum coverage ───────────────────────────────────────────────────────────

  it.each([
    ['solid'],
    ['dashed'],
    ['dotted'],
  ])('round-trips strokeStyle: %s', (strokeStyle) => {
    const node = makeNode('n1', { strokeStyle })
    const { decoded } = roundTrip(makeDiagram([node], []))
    expect(decoded.nodes[0].data.strokeStyle).toBe(strokeStyle)
  })

  it.each([
    ['smoothstep'],
    ['bezier'],
    ['straight'],
  ])('round-trips edge pathType: %s', (pathType) => {
    const n0 = makeNode('n0')
    const n1 = makeNode('n1')
    const { decoded } = roundTrip(makeDiagram([n0, n1], [makeEdge('e0', 'n0', 'n1', { pathType })]))
    expect(decoded.edges[0].data.pathType).toBe(pathType)
  })

  it.each([
    ['filled'],
    ['open'],
  ])('round-trips arrowType: %s', (arrowType) => {
    const n0 = makeNode('n0')
    const n1 = makeNode('n1')
    const { decoded } = roundTrip(makeDiagram([n0, n1], [makeEdge('e0', 'n0', 'n1', { arrowType })]))
    expect(decoded.edges[0].data.arrowType).toBe(arrowType)
  })

  it.each([
    ['left'],
    ['center'],
    ['right'],
  ])('round-trips textAlign: %s', (textAlign) => {
    const { decoded } = roundTrip(makeDiagram([makeNode('n0', { textAlign })], []))
    expect(decoded.nodes[0].data.textAlign).toBe(textAlign)
  })

  it.each([
    ['top'],
    ['right'],
    ['bottom'],
    ['left'],
  ])('round-trips sourceHandle/targetHandle: %s', (handle) => {
    const n0 = makeNode('n0'); const n1 = makeNode('n1')
    const edge = { ...makeEdge('e0', 'n0', 'n1'), sourceHandle: handle, targetHandle: handle }
    const { decoded } = roundTrip(makeDiagram([n0, n1], [edge]))
    expect(decoded.edges[0].sourceHandle).toBe(handle)
    expect(decoded.edges[0].targetHandle).toBe(handle)
  })

  it('round-trips fontWeight 700 (bold)', () => {
    const { decoded } = roundTrip(makeDiagram([makeNode('n0', { fontWeight: '700' })], []))
    expect(decoded.nodes[0].data.fontWeight).toBe('700')
  })

  it('round-trips fontStyle italic', () => {
    const { decoded } = roundTrip(makeDiagram([makeNode('n0', { fontStyle: 'italic' })], []))
    expect(decoded.nodes[0].data.fontStyle).toBe('italic')
  })

  it('round-trips textDecoration underline', () => {
    const { decoded } = roundTrip(makeDiagram([makeNode('n0', { textDecoration: 'underline' })], []))
    expect(decoded.nodes[0].data.textDecoration).toBe('underline')
  })

  // ── Defaults omission ───────────────────────────────────────────────────────

  it('omits default fields — compressed JSON contains no verbose keys', () => {
    const diagram = makeDiagram([makeNode('n0')], [makeEdge('e0', 'n0', 'n0')])
    const encoded = encodeDiagram(diagram)
    // The compressed token must not contain long key names
    expect(encoded).not.toContain('strokeStyle')
    expect(encoded).not.toContain('fillColor')
    expect(encoded).not.toContain('fontWeight')
    expect(encoded).not.toContain('animated')
    expect(encoded).not.toContain('arrowStart')
    expect(encoded).not.toContain('waypoint')
  })

  // ── Color palette ───────────────────────────────────────────────────────────

  it('shares color palette entries across nodes using the same colors', () => {
    const nodes = Array.from({ length: 10 }, (_, i) =>
      makeNode(`n${i}`, { fillColor: '#EEF2FF', strokeColor: '#818CF8', textColor: '#111827' })
    )
    const diagram = makeDiagram(nodes, [])
    const encoded = encodeDiagram(diagram)

    // Palette should appear exactly once in the compressed JSON, not repeated per node
    // Count occurrences of the fillColor hex value
    const inner = JSON.parse(LZString.decompressFromEncodedURIComponent(encoded))
    expect(inner.cp.filter(c => c === '#EEF2FF')).toHaveLength(1)
    expect(inner.cp.filter(c => c === '#818CF8')).toHaveLength(1)

    // All 10 nodes reference palette index 0 (f:0)
    expect(inner.n.every(n => n.f === 0)).toBe(true)
  })

  // ── Cloud shapes ────────────────────────────────────────────────────────────

  it('round-trips a cloud (AWS) shape with isCloudShape and accentColor', () => {
    const node = {
      id: 'n_ec2',
      type: 'shape',
      position: { x: 0, y: 0 },
      width: 90,
      height: 90,
      zIndex: 0,
      data: {
        shapeType: 'aws-ec2',
        label: 'EC2',
        fillColor: '#FFFFFF',
        strokeColor: '#E5E7EB',
        strokeWidth: 1,
        strokeStyle: 'solid',
        textColor: '#111827',
        fontSize: 12,
        fontWeight: '600',
        fontStyle: 'normal',
        textDecoration: 'none',
        textAlign: 'center',
        opacity: 1,
        isCloudShape: true,
        accentColor: '#FF9900',
      },
    }
    const { decoded } = roundTrip(makeDiagram([node], []))
    const d = decoded.nodes[0].data
    expect(d.shapeType).toBe('aws-ec2')
    expect(d.isCloudShape).toBe(true)
    expect(d.accentColor).toBe('#FF9900')
    expect(d.strokeWidth).toBe(1)
    expect(d.fontSize).toBe(12)
  })

  // ── Waypoint ────────────────────────────────────────────────────────────────

  it('round-trips an edge with a waypoint', () => {
    const n0 = makeNode('n0'); const n1 = makeNode('n1')
    const edge = makeEdge('e0', 'n0', 'n1', { waypoint: { x: 250, y: 130 } })
    const { decoded } = roundTrip(makeDiagram([n0, n1], [edge]))
    expect(decoded.edges[0].data.waypoint).toEqual({ x: 250, y: 130 })
  })

  it('round-trips an edge with waypoint: null', () => {
    const n0 = makeNode('n0'); const n1 = makeNode('n1')
    const { decoded } = roundTrip(makeDiagram([n0, n1], [makeEdge('e0', 'n0', 'n1')]))
    expect(decoded.edges[0].data.waypoint).toBeNull()
  })

  // ── Non-default numeric values ───────────────────────────────────────────────

  it('round-trips non-default zIndex', () => {
    const node = { ...makeNode('n0'), zIndex: 5 }
    const { decoded } = roundTrip(makeDiagram([node], []))
    expect(decoded.nodes[0].zIndex).toBe(5)
  })

  it('round-trips non-default opacity', () => {
    const { decoded } = roundTrip(makeDiagram([makeNode('n0', { opacity: 0.5 })], []))
    expect(decoded.nodes[0].data.opacity).toBe(0.5)
  })

  it('round-trips non-default fontSize', () => {
    const { decoded } = roundTrip(makeDiagram([makeNode('n0', { fontSize: 20 })], []))
    expect(decoded.nodes[0].data.fontSize).toBe(20)
  })

  it('round-trips non-default strokeWidth', () => {
    const { decoded } = roundTrip(makeDiagram([makeNode('n0', { strokeWidth: 4 })], []))
    expect(decoded.nodes[0].data.strokeWidth).toBe(4)
  })

  // ── Edge source/target references ───────────────────────────────────────────

  it('preserves source/target references after ID shortening', () => {
    const nodes = ['n_a', 'n_b', 'n_c'].map(id => makeNode(id))
    const edges = [
      makeEdge('e_ab', 'n_a', 'n_b'),
      makeEdge('e_bc', 'n_b', 'n_c'),
      makeEdge('e_ca', 'n_c', 'n_a'),
    ]
    const { decoded } = roundTrip(makeDiagram(nodes, edges))

    // After shortening: n_a→n0, n_b→n1, n_c→n2
    const ids = decoded.nodes.map(n => n.id)
    expect(decoded.edges[0].source).toBe(ids[0])
    expect(decoded.edges[0].target).toBe(ids[1])
    expect(decoded.edges[1].source).toBe(ids[1])
    expect(decoded.edges[1].target).toBe(ids[2])
    expect(decoded.edges[2].source).toBe(ids[2])
    expect(decoded.edges[2].target).toBe(ids[0])
  })

  // ── Error handling ──────────────────────────────────────────────────────────

  it('throws on corrupted input', () => {
    expect(() => decodeDiagram('not-valid-lzstring!!!')).toThrow()
  })

  it('throws on wrong codec version', () => {
    const bad = LZString.compressToEncodedURIComponent(JSON.stringify({ v: 99, n: [], e: [], cp: [] }))
    expect(() => decodeDiagram(bad)).toThrow(/Unsupported codec version/)
  })

  // ── 100-node / 100-edge benchmark ──────────────────────────────────────────

  it('encodes 100 nodes + 100 edges in under 8,192 bytes (CloudFront limit)', () => {
    const SHAPE_TYPES = ['rect', 'roundedRect', 'circle', 'diamond', 'hexagon', 'cylinder', 'pill']
    const COLORS = [
      { fill: '#EEF2FF', stroke: '#818CF8', text: '#1E1B4B' },
      { fill: '#F0FDF4', stroke: '#4ADE80', text: '#14532D' },
      { fill: '#FFF7ED', stroke: '#FB923C', text: '#7C2D12' },
      { fill: '#F0F9FF', stroke: '#38BDF8', text: '#0C4A6E' },
      { fill: '#FDF2F8', stroke: '#F472B6', text: '#831843' },
    ]

    const COLS = 10
    const GAP_X = 200
    const GAP_Y = 120

    const nodes = Array.from({ length: 100 }, (_, i) => {
      const col   = i % COLS
      const row   = Math.floor(i / COLS)
      const color = COLORS[i % COLORS.length]
      const shape = SHAPE_TYPES[i % SHAPE_TYPES.length]
      return {
        id:       `n_${i}`,
        type:     'shape',
        position: { x: col * GAP_X, y: row * GAP_Y },
        width:    160,
        height:   80,
        zIndex:   0,
        data: {
          shapeType:      shape,
          label:          `Step ${i + 1}`,
          fillColor:      color.fill,
          strokeColor:    color.stroke,
          strokeWidth:    2,
          strokeStyle:    'solid',
          textColor:      color.text,
          fontSize:       13,
          fontWeight:     '600',
          fontStyle:      'normal',
          textDecoration: 'none',
          textAlign:      'center',
          opacity:        1,
        },
      }
    })

    // 99 chain edges (each node → next) + 1 wrap edge = 100 edges
    const edges = Array.from({ length: 99 }, (_, i) => ({
      id:           `e_${i}`,
      type:         'custom',
      source:       `n_${i}`,
      target:       `n_${i + 1}`,
      sourceHandle: 'right',
      targetHandle: 'left',
      data: {
        label:      '',
        edgeStyle:  'solid',
        edgeColor:  '#6B7280',
        edgeWidth:  2,
        animated:   false,
        pathType:   'smoothstep',
        arrowType:  'filled',
        arrowStart: false,
        waypoint:   null,
      },
    }))
    edges.push({
      id: 'e_99', type: 'custom', source: 'n_99', target: 'n_0',
      sourceHandle: 'bottom', targetHandle: 'top',
      data: { label: 'loop', edgeStyle: 'dashed', edgeColor: '#818CF8', edgeWidth: 2,
              animated: true, pathType: 'smoothstep', arrowType: 'filled',
              arrowStart: false, waypoint: null },
    })

    const diagram = {
      id:       'diagram_benchmark',
      name:     '100-node benchmark',
      viewport: { x: 0, y: 0, zoom: 0.8 },
      nodes,
      edges,
    }

    const encoded = encodeDiagram(diagram)
    const byteLength = new TextEncoder().encode(encoded).length

    console.log(`\n  Benchmark: 100 nodes + 100 edges`)
    console.log(`  Encoded length : ${encoded.length} chars`)
    console.log(`  Byte size      : ${byteLength} bytes`)
    console.log(`  CloudFront cap : 8192 bytes`)
    console.log(`  Headroom       : ${8192 - byteLength} bytes\n`)

    expect(byteLength).toBeLessThan(8192)

    // Also verify it round-trips correctly
    const decoded = decodeDiagram(encoded)
    expect(decoded.nodes).toHaveLength(100)
    expect(decoded.edges).toHaveLength(100)
    expect(decoded.nodes[0].data.shapeType).toBe(nodes[0].data.shapeType)
    expect(decoded.nodes[99].data.label).toBe('Step 100')
    expect(decoded.edges[99].data.label).toBe('loop')
    expect(decoded.edges[99].data.edgeStyle).toBe('dashed')
    expect(decoded.edges[99].data.animated).toBe(true)
  })

  // ── Realistic diagram from format doc (AWS example) ─────────────────────────

  it('round-trips the AWS three-tier example from the format doc', () => {
    const diagram = {
      id: 'diagram_example_002',
      name: 'AWS Three-Tier Web App',
      viewport: { x: 60, y: 40, zoom: 0.9 },
      nodes: [
        { id: 'n_r53',      type: 'shape', position: { x: 355, y: 40  }, width: 90, height: 90, zIndex: 0,
          data: { shapeType: 'aws-route53',   label: 'Route 53',      fillColor: '#FFFFFF', strokeColor: '#E5E7EB', strokeWidth: 1, strokeStyle: 'solid', textColor: '#111827', fontSize: 12, fontWeight: '600', fontStyle: 'normal', textDecoration: 'none', textAlign: 'center', opacity: 1, accentColor: '#8C4FFF', isCloudShape: true } },
        { id: 'n_cf',       type: 'shape', position: { x: 355, y: 200 }, width: 90, height: 90, zIndex: 0,
          data: { shapeType: 'aws-cloudfront', label: 'CloudFront',   fillColor: '#FFFFFF', strokeColor: '#E5E7EB', strokeWidth: 1, strokeStyle: 'solid', textColor: '#111827', fontSize: 12, fontWeight: '600', fontStyle: 'normal', textDecoration: 'none', textAlign: 'center', opacity: 1, accentColor: '#8C4FFF', isCloudShape: true } },
        { id: 'n_alb',      type: 'shape', position: { x: 355, y: 360 }, width: 90, height: 90, zIndex: 0,
          data: { shapeType: 'aws-elb',        label: 'Load Balancer', fillColor: '#FFFFFF', strokeColor: '#E5E7EB', strokeWidth: 1, strokeStyle: 'solid', textColor: '#111827', fontSize: 12, fontWeight: '600', fontStyle: 'normal', textDecoration: 'none', textAlign: 'center', opacity: 1, accentColor: '#8C4FFF', isCloudShape: true } },
        { id: 'n_ec2_a',    type: 'shape', position: { x: 200, y: 520 }, width: 90, height: 90, zIndex: 0,
          data: { shapeType: 'aws-ec2',         label: 'EC2',          fillColor: '#FFFFFF', strokeColor: '#E5E7EB', strokeWidth: 1, strokeStyle: 'solid', textColor: '#111827', fontSize: 12, fontWeight: '600', fontStyle: 'normal', textDecoration: 'none', textAlign: 'center', opacity: 1, accentColor: '#FF9900', isCloudShape: true } },
        { id: 'n_rds',      type: 'shape', position: { x: 280, y: 680 }, width: 90, height: 90, zIndex: 0,
          data: { shapeType: 'aws-rds',         label: 'RDS',          fillColor: '#FFFFFF', strokeColor: '#E5E7EB', strokeWidth: 1, strokeStyle: 'solid', textColor: '#111827', fontSize: 11, fontWeight: '600', fontStyle: 'normal', textDecoration: 'none', textAlign: 'center', opacity: 1, accentColor: '#3B48CC', isCloudShape: true } },
      ],
      edges: [
        { id: 'e_r53_cf',  type: 'custom', source: 'n_r53',   target: 'n_cf',    sourceHandle: 'bottom', targetHandle: 'top',  data: { label: '', edgeStyle: 'solid',  edgeColor: '#6B7280', edgeWidth: 1, animated: false, pathType: 'smoothstep', arrowType: 'filled', arrowStart: false, waypoint: null } },
        { id: 'e_cf_alb',  type: 'custom', source: 'n_cf',    target: 'n_alb',   sourceHandle: 'bottom', targetHandle: 'top',  data: { label: 'API requests', edgeStyle: 'solid', edgeColor: '#6B7280', edgeWidth: 1, animated: false, pathType: 'smoothstep', arrowType: 'filled', arrowStart: false, waypoint: null } },
        { id: 'e_alb_ec2', type: 'custom', source: 'n_alb',   target: 'n_ec2_a', sourceHandle: 'bottom', targetHandle: 'top',  data: { label: '', edgeStyle: 'solid',  edgeColor: '#6B7280', edgeWidth: 1, animated: false, pathType: 'smoothstep', arrowType: 'filled', arrowStart: false, waypoint: null } },
        { id: 'e_ec2_rds', type: 'custom', source: 'n_ec2_a', target: 'n_rds',   sourceHandle: 'bottom', targetHandle: 'top',  data: { label: '', edgeStyle: 'solid',  edgeColor: '#6B7280', edgeWidth: 1, animated: false, pathType: 'smoothstep', arrowType: 'filled', arrowStart: false, waypoint: null } },
      ],
    }

    const { decoded } = roundTrip(diagram)

    expect(decoded.nodes).toHaveLength(5)
    expect(decoded.edges).toHaveLength(4)

    const cf = decoded.nodes[1]
    expect(cf.data.shapeType).toBe('aws-cloudfront')
    expect(cf.data.isCloudShape).toBe(true)
    expect(cf.data.accentColor).toBe('#8C4FFF')
    expect(cf.data.strokeWidth).toBe(1)

    const e = decoded.edges[1]
    expect(e.data.label).toBe('API requests')
    expect(e.sourceHandle).toBe('bottom')
    expect(e.targetHandle).toBe('top')
  })

})
