import { create } from 'zustand'
import { applyNodeChanges, applyEdgeChanges, addEdge } from '@xyflow/react'
import {
  saveDiagram,
  loadDiagram,
  createDiagramId,
  setActiveDiagram,
  getActiveDiagram,
  getAllDiagrams,
} from '../utils/storage'

const MAX_HISTORY = 50
let saveTimer = null

function debouncedSave(id, data) {
  clearTimeout(saveTimer)
  saveTimer = setTimeout(() => saveDiagram(id, data), 400)
}

const DEFAULT_DIAGRAM_ID = 'default'

function loadInitial() {
  const activeId = getActiveDiagram() || DEFAULT_DIAGRAM_ID
  const saved = loadDiagram(activeId)
  return {
    id: activeId,
    name: saved?.name || 'Untitled Diagram',
    nodes: saved?.nodes || [],
    edges: saved?.edges || [],
    viewport: saved?.viewport || { x: 0, y: 0, zoom: 1 },
  }
}

const initial = loadInitial()

const useDiagramStore = create((set, get) => ({
  // ── Current diagram ──
  id: initial.id,
  name: initial.name,
  nodes: initial.nodes,
  edges: initial.edges,
  viewport: initial.viewport,

  // ── History for undo/redo ──
  history: [{ nodes: initial.nodes, edges: initial.edges }],
  historyIndex: 0,

  // ── UI state ──
  selectedNodes: [],
  selectedEdges: [],
  showMinimap: true,
  showGrid: true,
  snapToGrid: false,
  edgeType: 'smoothstep',

  // ── React Flow callbacks ──
  onNodesChange: (changes) => {
    set((state) => {
      const nodes = applyNodeChanges(changes, state.nodes)
      return { nodes }
    })
    const { id, nodes, edges, name, viewport } = get()
    debouncedSave(id, { name, nodes, edges, viewport })
  },

  onEdgesChange: (changes) => {
    set((state) => {
      const edges = applyEdgeChanges(changes, state.edges)
      return { edges }
    })
    const { id, nodes, edges, name, viewport } = get()
    debouncedSave(id, { name, nodes, edges, viewport })
  },

  onConnect: (connection) => {
    set((state) => {
      const { edgeType } = state
      const edge = {
        ...connection,
        id: `e_${Date.now()}`,
        type: 'custom',
        data: {
          label: '',
          edgeStyle: 'solid',
          edgeColor: '#6B7280',
          edgeWidth: 2,
          animated: false,
        },
      }
      const edges = addEdge(edge, state.edges)
      return { edges }
    })
    get()._pushHistory()
    const { id, nodes, edges, name, viewport } = get()
    debouncedSave(id, { name, nodes, edges, viewport })
  },

  onViewportChange: (viewport) => {
    set({ viewport })
    const { id, nodes, edges, name } = get()
    debouncedSave(id, { name, nodes, edges, viewport })
  },

  // ── Node operations ──
  addNode: (node) => {
    set((state) => ({ nodes: [...state.nodes, node] }))
    get()._pushHistory()
    const { id, nodes, edges, name, viewport } = get()
    debouncedSave(id, { name, nodes, edges, viewport })
  },

  updateNodeData: (nodeId, newData) => {
    set((state) => ({
      nodes: state.nodes.map((n) =>
        n.id === nodeId ? { ...n, data: { ...n.data, ...newData } } : n
      ),
    }))
    const { id, nodes, edges, name, viewport } = get()
    debouncedSave(id, { name, nodes, edges, viewport })
  },

  deleteSelected: () => {
    set((state) => ({
      nodes: state.nodes.filter((n) => !n.selected),
      edges: state.edges.filter((e) => !e.selected),
    }))
    get()._pushHistory()
    const { id, nodes, edges, name, viewport } = get()
    debouncedSave(id, { name, nodes, edges, viewport })
  },

  duplicateSelected: () => {
    set((state) => {
      const selected = state.nodes.filter((n) => n.selected)
      const newNodes = selected.map((n) => ({
        ...n,
        id: `n_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        position: { x: n.position.x + 20, y: n.position.y + 20 },
        selected: false,
      }))
      return { nodes: [...state.nodes, ...newNodes] }
    })
    get()._pushHistory()
    const { id, nodes, edges, name, viewport } = get()
    debouncedSave(id, { name, nodes, edges, viewport })
  },

  // ── History ──
  _pushHistory: () => {
    set((state) => {
      const snapshot = { nodes: state.nodes, edges: state.edges }
      const history = state.history.slice(0, state.historyIndex + 1)
      const next = [...history, snapshot].slice(-MAX_HISTORY)
      return { history: next, historyIndex: next.length - 1 }
    })
  },

  undo: () => {
    const { history, historyIndex } = get()
    if (historyIndex <= 0) return
    const prev = history[historyIndex - 1]
    set({ nodes: prev.nodes, edges: prev.edges, historyIndex: historyIndex - 1 })
    const { id, nodes, edges, name, viewport } = get()
    debouncedSave(id, { name, nodes, edges, viewport })
  },

  redo: () => {
    const { history, historyIndex } = get()
    if (historyIndex >= history.length - 1) return
    const next = history[historyIndex + 1]
    set({ nodes: next.nodes, edges: next.edges, historyIndex: historyIndex + 1 })
    const { id, nodes, edges, name, viewport } = get()
    debouncedSave(id, { name, nodes, edges, viewport })
  },

  canUndo: () => get().historyIndex > 0,
  canRedo: () => get().historyIndex < get().history.length - 1,

  // ── Diagram meta ──
  setName: (name) => {
    set({ name })
    const { id, nodes, edges, viewport } = get()
    debouncedSave(id, { name, nodes, edges, viewport })
    setActiveDiagram(id)
  },

  // ── Load / reset ──
  loadFromData: (data) => {
    const id = data.id || createDiagramId()
    const nodes = data.nodes || []
    const edges = data.edges || []
    const name = data.name || 'Imported Diagram'
    const viewport = data.viewport || { x: 0, y: 0, zoom: 1 }
    set({
      id,
      name,
      nodes,
      edges,
      viewport,
      history: [{ nodes, edges }],
      historyIndex: 0,
    })
    saveDiagram(id, { name, nodes, edges, viewport })
    setActiveDiagram(id)
  },

  newDiagram: () => {
    const id = createDiagramId()
    const name = 'Untitled Diagram'
    set({
      id,
      name,
      nodes: [],
      edges: [],
      viewport: { x: 0, y: 0, zoom: 1 },
      history: [{ nodes: [], edges: [] }],
      historyIndex: 0,
    })
    saveDiagram(id, { name, nodes: [], edges: [], viewport: { x: 0, y: 0, zoom: 1 } })
    setActiveDiagram(id)
  },

  // ── Settings ──
  setEdgeType: (edgeType) => set({ edgeType }),
  toggleMinimap: () => set((s) => ({ showMinimap: !s.showMinimap })),
  toggleGrid: () => set((s) => ({ showGrid: !s.showGrid })),
  toggleSnapToGrid: () => set((s) => ({ snapToGrid: !s.snapToGrid })),

  // ── Selection ──
  onSelectionChange: ({ nodes, edges }) => {
    set({ selectedNodes: nodes, selectedEdges: edges })
  },

  // ── Edge update ──
  updateEdgeData: (edgeId, newData) => {
    set((state) => ({
      edges: state.edges.map((e) =>
        e.id === edgeId ? { ...e, data: { ...e.data, ...newData } } : e
      ),
    }))
    const { id, nodes, edges, name, viewport } = get()
    debouncedSave(id, { name, nodes, edges, viewport })
  },
}))

export default useDiagramStore
