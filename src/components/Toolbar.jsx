import { useRef, useState } from 'react'
import {
  Undo2,
  Redo2,
  Download,
  Upload,
  Trash2,
  Copy,
  Grid3X3,
  Map,
  Magnet,
  FilePlus,
  ChevronDown,
  ScanLine,
} from 'lucide-react'
import useDiagramStore from '../store/diagramStore'
import { downloadDiagram, uploadDiagram } from '../utils/fileUtils'

const EDGE_TYPES = [
  { value: 'smoothstep', label: 'Curved' },
  { value: 'bezier', label: 'Bezier' },
  { value: 'straight', label: 'Straight' },
]

function ToolbarButton({ onClick, disabled, active, tooltip, children, danger }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      data-tooltip={tooltip}
      className={`
        flex items-center justify-center w-8 h-8 rounded-lg text-sm transition-all
        ${disabled ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer hover:bg-gray-100'}
        ${active ? 'bg-primary-100 text-primary-600' : 'text-gray-600'}
        ${danger && !disabled ? 'hover:bg-red-50 hover:text-red-500' : ''}
      `}
    >
      {children}
    </button>
  )
}

function Divider() {
  return <div className="w-px h-5 bg-gray-200 mx-1" />
}

export default function Toolbar() {
  const {
    name,
    setName,
    undo,
    redo,
    canUndo,
    canRedo,
    deleteSelected,
    duplicateSelected,
    showMinimap,
    showGrid,
    snapToGrid,
    toggleMinimap,
    toggleGrid,
    toggleSnapToGrid,
    edgeType,
    setEdgeType,
    nodes,
    edges,
    viewport,
    selectedNodes,
    selectedEdges,
    newDiagram,
    loadFromData,
  } = useDiagramStore()

  const fileInputRef = useRef(null)
  const [nameEditing, setNameEditing] = useState(false)
  const [nameVal, setNameVal] = useState(name)
  const [edgeDropdown, setEdgeDropdown] = useState(false)

  const handleDownload = () => {
    downloadDiagram({ id: useDiagramStore.getState().id, name, nodes, edges, viewport }, `${name}`)
  }

  const handleUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const data = await uploadDiagram(file)
      loadFromData(data)
    } catch (err) {
      alert(err.message)
    }
    e.target.value = ''
  }

  const hasSelection = selectedNodes.length > 0 || selectedEdges.length > 0

  const commitName = () => {
    setName(nameVal)
    setNameEditing(false)
  }

  return (
    <div
      className="flex items-center h-12 px-3 bg-white border-b border-gray-200 gap-1 select-none"
      style={{ boxShadow: '0 1px 0 rgba(0,0,0,0.06)' }}
    >
      {/* Logo */}
      <div className="flex items-center gap-2 mr-3">
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center text-white font-bold text-sm"
          style={{ background: 'linear-gradient(135deg, #7B61FF, #6D54EF)' }}
        >
          C
        </div>
      </div>

      {/* Diagram name */}
      <div className="flex items-center mr-3">
        {nameEditing ? (
          <input
            autoFocus
            value={nameVal}
            onChange={(e) => setNameVal(e.target.value)}
            onBlur={commitName}
            onKeyDown={(e) => { if (e.key === 'Enter') commitName(); if (e.key === 'Escape') setNameEditing(false) }}
            className="text-sm font-medium text-gray-800 bg-transparent border-b border-primary-500 outline-none px-1 min-w-[140px]"
          />
        ) : (
          <button
            onDoubleClick={() => { setNameVal(name); setNameEditing(true) }}
            className="text-sm font-medium text-gray-700 hover:text-gray-900 px-1 rounded cursor-pointer max-w-[200px] truncate"
          >
            {name}
          </button>
        )}
      </div>

      <Divider />

      {/* New */}
      <ToolbarButton tooltip="New diagram" onClick={newDiagram}>
        <FilePlus size={16} />
      </ToolbarButton>

      <Divider />

      {/* Undo / Redo */}
      <ToolbarButton tooltip="Undo (Ctrl+Z)" onClick={undo} disabled={!canUndo()}>
        <Undo2 size={16} />
      </ToolbarButton>
      <ToolbarButton tooltip="Redo (Ctrl+Y)" onClick={redo} disabled={!canRedo()}>
        <Redo2 size={16} />
      </ToolbarButton>

      <Divider />

      {/* Selection actions */}
      <ToolbarButton tooltip="Duplicate selected" onClick={duplicateSelected} disabled={selectedNodes.length === 0}>
        <Copy size={16} />
      </ToolbarButton>
      <ToolbarButton tooltip="Delete selected (Del)" onClick={deleteSelected} disabled={!hasSelection} danger>
        <Trash2 size={16} />
      </ToolbarButton>

      <Divider />

      {/* Edge type */}
      <div className="relative">
        <button
          onClick={() => setEdgeDropdown((v) => !v)}
          className="flex items-center gap-1 h-8 px-2 rounded-lg text-xs font-medium text-gray-600 hover:bg-gray-100 transition-colors"
        >
          <ScanLine size={14} />
          <span>{EDGE_TYPES.find((e) => e.value === edgeType)?.label || 'Edge'}</span>
          <ChevronDown size={12} />
        </button>
        {edgeDropdown && (
          <div className="absolute top-9 left-0 bg-white border border-gray-200 rounded-xl shadow-lg py-1 z-50 min-w-[110px]">
            {EDGE_TYPES.map((et) => (
              <button
                key={et.value}
                onClick={() => { setEdgeType(et.value); setEdgeDropdown(false) }}
                className={`w-full text-left px-3 py-1.5 text-xs hover:bg-gray-50 ${edgeType === et.value ? 'text-primary-600 font-medium' : 'text-gray-700'}`}
              >
                {et.label}
              </button>
            ))}
          </div>
        )}
      </div>

      <Divider />

      {/* View toggles */}
      <ToolbarButton tooltip="Toggle grid" active={showGrid} onClick={toggleGrid}>
        <Grid3X3 size={16} />
      </ToolbarButton>
      <ToolbarButton tooltip="Toggle minimap" active={showMinimap} onClick={toggleMinimap}>
        <Map size={16} />
      </ToolbarButton>
      <ToolbarButton tooltip="Snap to grid" active={snapToGrid} onClick={toggleSnapToGrid}>
        <Magnet size={16} />
      </ToolbarButton>

      <div className="flex-1" />

      {/* Download / Upload */}
      <ToolbarButton tooltip="Download diagram" onClick={handleDownload}>
        <Download size={16} />
      </ToolbarButton>
      <ToolbarButton tooltip="Upload diagram">
        <label className="cursor-pointer">
          <Upload size={16} />
          <input ref={fileInputRef} type="file" accept=".json" className="hidden" onChange={handleUpload} />
        </label>
      </ToolbarButton>
    </div>
  )
}
