import { useState, useEffect, useCallback, useRef } from 'react'
import { Plus, ChevronLeft, ChevronRight, Trash2, FileText } from 'lucide-react'
import useDiagramStore from '../store/diagramStore'
import { getAllDiagrams, deleteDiagram, saveDiagram } from '../utils/storage'

function formatDate(ts) {
  if (!ts) return ''
  const d = new Date(ts)
  const now = new Date()
  if (d.toDateString() === now.toDateString()) {
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }
  const yesterday = new Date(now)
  yesterday.setDate(yesterday.getDate() - 1)
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday'
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' })
}

export default function ProjectsPanel() {
  const [collapsed, setCollapsed]   = useState(false)
  const [diagrams,  setDiagrams]    = useState([])
  const [editingId, setEditingId]   = useState(null)
  const [editName,  setEditName]    = useState('')
  const editRef = useRef(null)

  const currentId    = useDiagramStore((s) => s.id)
  const currentName  = useDiagramStore((s) => s.name)
  const newDiagram   = useDiagramStore((s) => s.newDiagram)
  const loadFromData = useDiagramStore((s) => s.loadFromData)
  const setName      = useDiagramStore((s) => s.setName)

  const refresh = useCallback(() => {
    const all = getAllDiagrams()
    const list = Object.entries(all)
      .map(([id, data]) => ({ id, name: data.name || 'Untitled', updatedAt: data.updatedAt || 0 }))
      .sort((a, b) => b.updatedAt - a.updatedAt)
    setDiagrams(list)
  }, [])

  // Re-read storage whenever the active diagram's id or name changes
  useEffect(() => { refresh() }, [currentId, currentName, refresh])

  useEffect(() => {
    if (editingId && editRef.current) {
      editRef.current.focus()
      editRef.current.select()
    }
  }, [editingId])

  const handleSwitch = (id) => {
    if (id === currentId) return
    const all = getAllDiagrams()
    if (all[id]) loadFromData({ ...all[id], id })
  }

  const handleDelete = (e, id) => {
    e.stopPropagation()
    if (diagrams.length <= 1) return
    deleteDiagram(id)
    if (id === currentId) {
      const other = diagrams.find((d) => d.id !== id)
      if (other) {
        const all = getAllDiagrams()
        if (all[other.id]) loadFromData({ ...all[other.id], id: other.id })
      }
    } else {
      refresh()
    }
  }

  const startRename = (e, diagram) => {
    e.stopPropagation()
    setEditingId(diagram.id)
    setEditName(diagram.name)
  }

  const commitRename = (id) => {
    const name = editName.trim() || 'Untitled'
    if (id === currentId) {
      setName(name)   // store handles save; useEffect will refresh
    } else {
      const all = getAllDiagrams()
      if (all[id]) saveDiagram(id, { ...all[id], name })
      refresh()
    }
    setEditingId(null)
  }

  // ── Collapsed strip ──────────────────────────────────────────────────────
  if (collapsed) {
    return (
      <div className="flex flex-col items-center bg-white border-r border-gray-200 py-2 w-9 shrink-0">
        <button
          onClick={() => setCollapsed(false)}
          className="p-1.5 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600"
          title="Show files"
        >
          <ChevronRight size={14} />
        </button>
      </div>
    )
  }

  // ── Expanded panel ───────────────────────────────────────────────────────
  return (
    <div className="flex flex-col bg-white border-r border-gray-200 w-52 shrink-0 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2.5 border-b border-gray-100">
        <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">Files</span>
        <div className="flex items-center gap-0.5">
          <button
            onClick={() => newDiagram()}
            className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors"
            title="New diagram"
          >
            <Plus size={14} />
          </button>
          <button
            onClick={() => setCollapsed(true)}
            className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors"
            title="Collapse"
          >
            <ChevronLeft size={14} />
          </button>
        </div>
      </div>

      {/* Diagram list */}
      <div className="flex-1 overflow-y-auto py-1">
        {diagrams.map((d) => {
          const isActive = d.id === currentId
          return (
            <div
              key={d.id}
              onClick={() => handleSwitch(d.id)}
              onDoubleClick={(e) => startRename(e, d)}
              className={`group flex items-start gap-2 px-2.5 py-2 mx-1 my-0.5 rounded-lg cursor-pointer select-none transition-colors ${
                isActive
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'hover:bg-gray-50 text-gray-700'
              }`}
            >
              <FileText
                size={13}
                className={`mt-0.5 shrink-0 ${isActive ? 'text-indigo-400' : 'text-gray-300'}`}
              />

              <div className="flex-1 min-w-0">
                {editingId === d.id ? (
                  <input
                    ref={editRef}
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    onBlur={() => commitRename(d.id)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') commitRename(d.id)
                      if (e.key === 'Escape') setEditingId(null)
                    }}
                    onClick={(e) => e.stopPropagation()}
                    className="w-full text-xs bg-white border border-indigo-300 rounded px-1 py-0.5 outline-none"
                  />
                ) : (
                  <>
                    <p className="text-xs font-medium truncate leading-tight">{d.name}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">{formatDate(d.updatedAt)}</p>
                  </>
                )}
              </div>

              {diagrams.length > 1 && editingId !== d.id && (
                <button
                  onClick={(e) => handleDelete(e, d.id)}
                  className="shrink-0 mt-0.5 p-0.5 rounded opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-400 hover:bg-red-50 transition-colors"
                  title="Delete"
                >
                  <Trash2 size={11} />
                </button>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
