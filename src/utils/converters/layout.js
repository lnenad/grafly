/**
 * BFS-based layered auto-layout for imported diagrams.
 * Mutates node.position in-place.
 *
 * @param {object[]} nodes
 * @param {object[]} edges
 * @param {{ xGap?: number, yGap?: number }} options
 */
export function applyAutoLayout(nodes, edges, { xGap = 220, yGap = 140 } = {}) {
  if (!nodes.length) return

  // Build adjacency — only for nodes that actually appear in edges
  const inCount = new Map()
  const outgoing = new Map()
  const connectedIds = new Set()
  for (const n of nodes) {
    inCount.set(n.id, 0)
    outgoing.set(n.id, new Set())
  }
  for (const e of edges) {
    if (inCount.has(e.target) && outgoing.has(e.source)) {
      inCount.set(e.target, (inCount.get(e.target) || 0) + 1)
      outgoing.get(e.source).add(e.target)
      connectedIds.add(e.source)
      connectedIds.add(e.target)
    }
  }

  // Truly isolated nodes (appear in no edge) → place after the connected graph
  const isolatedNodes = nodes.filter(n => !connectedIds.has(n.id))

  // Find roots among connected nodes only; fallback to first connected node if pure cycle
  let roots = nodes.filter(n => connectedIds.has(n.id) && inCount.get(n.id) === 0)
  if (!roots.length && connectedIds.size > 0) {
    roots = [nodes.find(n => connectedIds.has(n.id))]
  }

  // BFS layering
  const layer = new Map()
  const queue = roots.map(n => [n.id, 0])
  const visited = new Set()

  while (queue.length) {
    const [id, depth] = queue.shift()
    if (visited.has(id)) continue
    visited.add(id)
    layer.set(id, depth)
    for (const tgt of (outgoing.get(id) || [])) {
      if (!visited.has(tgt)) queue.push([tgt, depth + 1])
    }
  }

  // Unreached connected nodes (in a sub-cycle not reached from roots)
  const maxConnectedLayer = layer.size ? Math.max(...layer.values()) : -1
  let nextLayer = maxConnectedLayer + 1
  for (const n of nodes) {
    if (connectedIds.has(n.id) && !layer.has(n.id)) {
      layer.set(n.id, nextLayer++)
    }
  }

  // Truly isolated nodes get their own column(s) after all connected nodes
  const maxLayer = layer.size ? Math.max(...layer.values()) : -1
  let isolatedLayer = maxLayer + 1
  for (const n of isolatedNodes) {
    layer.set(n.id, isolatedLayer++)
  }

  // Group nodes by layer, preserve insertion order within layer
  const layerNodes = new Map()
  for (const n of nodes) {
    const l = layer.get(n.id)
    if (!layerNodes.has(l)) layerNodes.set(l, [])
    layerNodes.get(l).push(n.id)
  }

  // Assign positions, centered vertically per layer
  const nodeById = new Map(nodes.map(n => [n.id, n]))
  for (const [l, ids] of layerNodes) {
    const count = ids.length
    ids.forEach((id, i) => {
      const n = nodeById.get(id)
      n.position = {
        x: l * xGap,
        y: i * yGap - ((count - 1) * yGap) / 2,
      }
    })
  }
}
