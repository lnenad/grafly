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
  clipboard: null,
  showMinimap: true,
  showGrid: true,
  snapToGrid: false,
  gridSize: 16,
  edgeType: 'smoothstep',

  // ── React Flow callbacks ──
  onNodesChange: (changes) => {
    set((state) => {
      const nodes = applyNodeChanges(changes, state.nodes)
      return { nodes }
    })
    const ended = changes.some(
      (c) => (c.type === 'position' && c.dragging === false) ||
             (c.type === 'dimensions' && c.resizing === false)
    )
    if (ended) get()._pushHistory()
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
    get()._pushHistory()
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
  theme: localStorage.getItem('grafly_theme') || 'auto',
  isDark: false,
  setTheme: (theme) => { localStorage.setItem('grafly_theme', theme); set({ theme }) },
  setIsDark: (isDark) => set({ isDark }),
  setEdgeType: (edgeType) => set({ edgeType }),
  toggleMinimap: () => set((s) => ({ showMinimap: !s.showMinimap })),
  toggleGrid: () => set((s) => ({ showGrid: !s.showGrid })),
  toggleSnapToGrid: () => set((s) => ({ snapToGrid: !s.snapToGrid })),
  setGridSize: (gridSize) => set({ gridSize }),

  // ── Selection ──
  onSelectionChange: ({ nodes, edges }) => {
    set({ selectedNodes: nodes, selectedEdges: edges })
  },

  // ── Edge update ──
  // skipHistory: true is used during continuous waypoint drag (mousemove) to avoid
  // flooding the history stack; CustomEdge calls pushHistory() once on mouseup.
  updateEdgeData: (edgeId, newData, { skipHistory = false } = {}) => {
    set((state) => ({
      edges: state.edges.map((e) =>
        e.id === edgeId ? { ...e, data: { ...e.data, ...newData } } : e
      ),
    }))
    if (!skipHistory) get()._pushHistory()
    const { id, nodes, edges, name, viewport } = get()
    debouncedSave(id, { name, nodes, edges, viewport })
  },

  pushHistory: () => get()._pushHistory(),

  // ── Programmatic selection (used by right-click) ──
  selectNode: (nodeId) => {
    set((state) => {
      const nodes = state.nodes.map((n) => ({ ...n, selected: n.id === nodeId }))
      const edges = state.edges.map((e) => ({ ...e, selected: false }))
      return { nodes, edges, selectedNodes: nodes.filter((n) => n.selected), selectedEdges: [] }
    })
  },
  selectEdge: (edgeId) => {
    set((state) => {
      const nodes = state.nodes.map((n) => ({ ...n, selected: false }))
      const edges = state.edges.map((e) => ({ ...e, selected: e.id === edgeId }))
      return { nodes, edges, selectedNodes: [], selectedEdges: edges.filter((e) => e.selected) }
    })
  },

  // ── Bulk node data update (applies patch to all selected nodes) ──
  updateSelectedNodesData: (newData) => {
    const { selectedNodes } = get()
    const selectedIds = new Set(selectedNodes.map((n) => n.id))
    set((state) => ({
      nodes: state.nodes.map((n) =>
        selectedIds.has(n.id) ? { ...n, data: { ...n.data, ...newData } } : n
      ),
    }))
    get()._pushHistory()
    const { id, nodes, edges, name, viewport } = get()
    debouncedSave(id, { name, nodes, edges, viewport })
  },

  // ── Copy / Paste ──
  copySelected: () => {
    const { selectedNodes, selectedEdges, nodes, edges } = get()
    const selectedNodeIds = new Set(selectedNodes.map((n) => n.id))
    const copiedNodes = nodes.filter((n) => selectedNodeIds.has(n.id))
    const copiedEdges = edges.filter(
      (e) => selectedNodeIds.has(e.source) && selectedNodeIds.has(e.target)
    )
    set({ clipboard: { nodes: copiedNodes, edges: copiedEdges } })
  },

  paste: () => {
    const { clipboard } = get()
    if (!clipboard?.nodes?.length) return
    const idMap = {}
    const ts = Date.now()
    const newNodes = clipboard.nodes.map((n) => {
      const newId = `n_${ts}_${Math.random().toString(36).slice(2, 6)}`
      idMap[n.id] = newId
      return { ...n, id: newId, position: { x: n.position.x + 20, y: n.position.y + 20 }, selected: true }
    })
    const newEdges = clipboard.edges.map((e) => ({
      ...e,
      id: `e_${ts}_${Math.random().toString(36).slice(2, 6)}`,
      source: idMap[e.source],
      target: idMap[e.target],
      selected: true,
    }))
    set((state) => ({
      nodes: [...state.nodes.map((n) => ({ ...n, selected: false })), ...newNodes],
      edges: [...state.edges.map((e) => ({ ...e, selected: false })), ...newEdges],
    }))
    get()._pushHistory()
    const { id, nodes, edges, name, viewport } = get()
    debouncedSave(id, { name, nodes, edges, viewport })
  },

  // ── Align ──
  alignNodes: (type) => {
    const { selectedNodes, nodes: currentNodes } = get()
    if (selectedNodes.length < 2) return
    const selectedIds = new Set(selectedNodes.map((n) => n.id))
    const sel = currentNodes.filter((n) => selectedIds.has(n.id))
    const getW = (n) => n.measured?.width  || n.width  || 160
    const getH = (n) => n.measured?.height || n.height || 80

    let ref
    if (type === 'left')     ref = Math.min(...sel.map((n) => n.position.x))
    if (type === 'center-h') ref = (Math.min(...sel.map((n) => n.position.x)) + Math.max(...sel.map((n) => n.position.x + getW(n)))) / 2
    if (type === 'right')    ref = Math.max(...sel.map((n) => n.position.x + getW(n)))
    if (type === 'top')      ref = Math.min(...sel.map((n) => n.position.y))
    if (type === 'center-v') ref = (Math.min(...sel.map((n) => n.position.y)) + Math.max(...sel.map((n) => n.position.y + getH(n)))) / 2
    if (type === 'bottom')   ref = Math.max(...sel.map((n) => n.position.y + getH(n)))

    set((state) => ({
      nodes: state.nodes.map((n) => {
        if (!selectedIds.has(n.id)) return n
        const w = getW(n), h = getH(n)
        const pos = { ...n.position }
        if (type === 'left')     pos.x = ref
        if (type === 'center-h') pos.x = ref - w / 2
        if (type === 'right')    pos.x = ref - w
        if (type === 'top')      pos.y = ref
        if (type === 'center-v') pos.y = ref - h / 2
        if (type === 'bottom')   pos.y = ref - h
        return { ...n, position: pos }
      }),
    }))
    get()._pushHistory()
    const { id, nodes, edges, name, viewport } = get()
    debouncedSave(id, { name, nodes, edges, viewport })
  },

  // ── Stacking order ──
  bringToFront: () => {
    const { selectedNodes, nodes: currentNodes } = get()
    if (!selectedNodes.length) return
    const maxZ = Math.max(0, ...currentNodes.map((n) => n.zIndex || 0))
    set((state) => ({
      nodes: state.nodes.map((n) =>
        selectedNodes.some((s) => s.id === n.id) ? { ...n, zIndex: maxZ + 1 } : n
      ),
    }))
    get()._pushHistory()
    const { id, nodes, edges, name, viewport } = get()
    debouncedSave(id, { name, nodes, edges, viewport })
  },

  sendToBack: () => {
    const { selectedNodes, nodes: currentNodes } = get()
    if (!selectedNodes.length) return
    const minZ = Math.min(0, ...currentNodes.map((n) => n.zIndex || 0))
    set((state) => ({
      nodes: state.nodes.map((n) =>
        selectedNodes.some((s) => s.id === n.id) ? { ...n, zIndex: minZ - 1 } : n
      ),
    }))
    get()._pushHistory()
    const { id, nodes, edges, name, viewport } = get()
    debouncedSave(id, { name, nodes, edges, viewport })
  },

  bringForward: () => {
    const { selectedNodes } = get()
    if (!selectedNodes.length) return
    set((state) => ({
      nodes: state.nodes.map((n) =>
        selectedNodes.some((s) => s.id === n.id) ? { ...n, zIndex: (n.zIndex || 0) + 1 } : n
      ),
    }))
    get()._pushHistory()
    const { id, nodes, edges, name, viewport } = get()
    debouncedSave(id, { name, nodes, edges, viewport })
  },

  sendBackward: () => {
    const { selectedNodes } = get()
    if (!selectedNodes.length) return
    set((state) => ({
      nodes: state.nodes.map((n) =>
        selectedNodes.some((s) => s.id === n.id) ? { ...n, zIndex: (n.zIndex || 0) - 1 } : n
      ),
    }))
    get()._pushHistory()
    const { id, nodes, edges, name, viewport } = get()
    debouncedSave(id, { name, nodes, edges, viewport })
  },
}))

export default useDiagramStore
