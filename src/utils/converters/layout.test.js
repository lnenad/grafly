import { describe, it, expect } from 'vitest'
import { applyAutoLayout } from './layout.js'

function makeNode(id) {
  return { id, position: { x: 0, y: 0 } }
}
function makeEdge(source, target) {
  return { id: `e_${source}_${target}`, source, target }
}

describe('applyAutoLayout', () => {
  it('assigns x=0 to root nodes', () => {
    const nodes = [makeNode('a'), makeNode('b')]
    const edges = [makeEdge('a', 'b')]
    applyAutoLayout(nodes, edges)
    expect(nodes.find(n => n.id === 'a').position.x).toBe(0)
  })

  it('assigns x=220 to nodes one hop from root', () => {
    const nodes = [makeNode('a'), makeNode('b')]
    const edges = [makeEdge('a', 'b')]
    applyAutoLayout(nodes, edges)
    expect(nodes.find(n => n.id === 'b').position.x).toBe(220)
  })

  it('respects custom xGap', () => {
    const nodes = [makeNode('a'), makeNode('b')]
    const edges = [makeEdge('a', 'b')]
    applyAutoLayout(nodes, edges, { xGap: 300 })
    expect(nodes.find(n => n.id === 'b').position.x).toBe(300)
  })

  it('positions multiple nodes in same layer at different y values', () => {
    const nodes = [makeNode('root'), makeNode('c1'), makeNode('c2')]
    const edges = [makeEdge('root', 'c1'), makeEdge('root', 'c2')]
    applyAutoLayout(nodes, edges)
    const y1 = nodes.find(n => n.id === 'c1').position.y
    const y2 = nodes.find(n => n.id === 'c2').position.y
    expect(y1).not.toBe(y2)
  })

  it('centers layer vertically so nodes are symmetric around y=0', () => {
    const nodes = [makeNode('root'), makeNode('c1'), makeNode('c2')]
    const edges = [makeEdge('root', 'c1'), makeEdge('root', 'c2')]
    applyAutoLayout(nodes, edges, { yGap: 100 })
    const y1 = nodes.find(n => n.id === 'c1').position.y
    const y2 = nodes.find(n => n.id === 'c2').position.y
    expect(y1 + y2).toBeCloseTo(0)
  })

  it('places isolated nodes (no edges) in a rightmost column', () => {
    const nodes = [makeNode('a'), makeNode('b'), makeNode('iso')]
    const edges = [makeEdge('a', 'b')]
    applyAutoLayout(nodes, edges)
    const xA = nodes.find(n => n.id === 'a').position.x
    const xB = nodes.find(n => n.id === 'b').position.x
    const xIso = nodes.find(n => n.id === 'iso').position.x
    expect(xIso).toBeGreaterThan(Math.max(xA, xB))
  })

  it('handles empty nodes array without error', () => {
    expect(() => applyAutoLayout([], [])).not.toThrow()
  })

  it('handles empty edges array (all nodes are isolated)', () => {
    const nodes = [makeNode('a'), makeNode('b')]
    applyAutoLayout(nodes, [])
    // Should not throw and should assign positions
    expect(nodes[0].position).toBeDefined()
    expect(nodes[1].position).toBeDefined()
  })

  it('handles a pure cycle without infinite loop', () => {
    const nodes = [makeNode('a'), makeNode('b'), makeNode('c')]
    const edges = [makeEdge('a', 'b'), makeEdge('b', 'c'), makeEdge('c', 'a')]
    expect(() => applyAutoLayout(nodes, edges)).not.toThrow()
    // All nodes should get positions
    for (const n of nodes) expect(n.position).toBeDefined()
  })

  it('no two nodes share identical x,y position in a simple graph', () => {
    const nodes = [makeNode('a'), makeNode('b'), makeNode('c'), makeNode('d')]
    const edges = [makeEdge('a', 'b'), makeEdge('a', 'c'), makeEdge('b', 'd'), makeEdge('c', 'd')]
    applyAutoLayout(nodes, edges)
    const positions = nodes.map(n => `${n.position.x},${n.position.y}`)
    const unique = new Set(positions)
    expect(unique.size).toBe(nodes.length)
  })

  it('respects custom yGap', () => {
    const nodes = [makeNode('root'), makeNode('c1'), makeNode('c2')]
    const edges = [makeEdge('root', 'c1'), makeEdge('root', 'c2')]
    applyAutoLayout(nodes, edges, { yGap: 200 })
    const y1 = nodes.find(n => n.id === 'c1').position.y
    const y2 = nodes.find(n => n.id === 'c2').position.y
    expect(Math.abs(y1 - y2)).toBeCloseTo(200)
  })
})
