import { useEffect, useCallback, useState } from 'react'
import { ReactFlowProvider } from '@xyflow/react'
import Toolbar from './components/Toolbar'
import ProjectsPanel from './components/ProjectsPanel'
import ShapeLibrary from './components/ShapeLibrary'
import Canvas from './components/Canvas'
import PropertiesPanel from './components/PropertiesPanel'
import ContextMenu from './components/ContextMenu'
import useDiagramStore from './store/diagramStore'
import { decodeDiagram, encodeDiagram } from './utils/urlCodec'

// Capture before params are stripped — used to set initial view / edit mode
const _params = new URLSearchParams(window.location.search)
const isSharedUrl = _params.has('d')
const isEditMode  = isSharedUrl && _params.has('edit')

function App() {
  const { undo, redo, deleteSelected, copySelected, paste, theme, setIsDark, loadFromData, triggerFitView, showMinimap, toggleMinimap } = useDiagramStore()
  const [contextMenu, setContextMenu] = useState(null)
  // View mode: hide all UI chrome. True for shared URLs that aren't explicitly edit links.
  const [viewMode, setViewMode] = useState(isSharedUrl && !isEditMode)
  // Edit warning: shown once when the page is opened via an edit link (?edit=1)
  const [editWarning, setEditWarning] = useState(isEditMode)

  // Load diagram from ?d= query param on first mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const encoded = params.get('d')
    if (!encoded) return

    try {
      const diagram = decodeDiagram(encoded)
      loadFromData(diagram)
      triggerFitView()
    } catch {
      // malformed param — silently ignore, load normally
    }

    // Remove shared-URL params so refresh doesn't re-import
    const url = new URL(window.location)
    url.searchParams.delete('d')
    url.searchParams.delete('edit')
    window.history.replaceState({}, '', url)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const apply = (dark) => {
      document.documentElement.classList.toggle('dark', dark)
      setIsDark(dark)
    }
    if (theme === 'dark') { apply(true); return }
    if (theme === 'light') { apply(false); return }
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    apply(mq.matches)
    const handler = (e) => apply(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [theme, setIsDark])

  // Global keyboard shortcuts (only in edit mode)
  const onKeyDown = useCallback(
    (e) => {
      if (viewMode) return
      const isInput = ['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)
      if (isInput) return

      const meta = e.metaKey || e.ctrlKey

      if (meta && e.key === 'z' && !e.shiftKey) {
        e.preventDefault()
        undo()
      } else if (meta && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault()
        useDiagramStore.getState().redo()
      } else if (meta && e.key === 'c') {
        e.preventDefault()
        copySelected()
      } else if (meta && e.key === 'v') {
        e.preventDefault()
        paste()
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        deleteSelected()
      }
    },
    [viewMode, undo, deleteSelected, copySelected, paste]
  )

  useEffect(() => {
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onKeyDown])

  const openEditTab = useCallback(() => {
    const state = useDiagramStore.getState()
    const encoded = encodeDiagram(state)
    const url = new URL(window.location.href)
    url.search = ''
    url.searchParams.set('d', encoded)
    url.searchParams.set('edit', '1')
    window.open(url.toString(), '_blank')
  }, [])

  return (
    <ReactFlowProvider>
      <div className="flex flex-col h-screen w-screen bg-gray-50 dark:bg-gray-950 overflow-hidden">
        {!viewMode && <Toolbar />}

        <div className="flex flex-1 overflow-hidden">
          {!viewMode && <ProjectsPanel />}
          {!viewMode && <ShapeLibrary />}

          <div className="flex-1 relative overflow-hidden">
            <Canvas onContextMenu={(x, y) => !viewMode && setContextMenu({ x, y })} />

            {viewMode && (
              <div className="absolute bottom-6 right-6 flex flex-col items-end gap-2 z-10">
                <button
                  onClick={toggleMinimap}
                  data-tooltip={showMinimap ? 'Hide map' : 'Show map'}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold shadow-lg transition-colors"
                  style={{
                    background: showMinimap ? 'rgba(123,97,255,0.12)' : 'rgba(255,255,255,0.9)',
                    color: showMinimap ? '#7B61FF' : '#374151',
                    border: `1.5px solid ${showMinimap ? '#7B61FF' : '#E5E7EB'}`,
                    backdropFilter: 'blur(6px)',
                  }}
                >
                  <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="1" y="1" width="14" height="14" rx="2"/>
                    <rect x="8.5" y="8.5" width="4" height="4" rx="0.5" fill="currentColor" stroke="none"/>
                    <path d="M3 5l3 2 3-2 3 2"/>
                  </svg>
                  Map
                </button>

                <button
                  onClick={openEditTab}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold shadow-lg transition-colors"
                >
                  <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M11.5 2.5l2 2L5 13H3v-2L11.5 2.5z"/>
                  </svg>
                  Edit diagram
                </button>
              </div>
            )}
          </div>

          {!viewMode && <PropertiesPanel />}
        </div>
      </div>

      {!viewMode && contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          onClose={() => setContextMenu(null)}
        />
      )}

      {/* Edit-mode warning: shown when the page is opened via an edit link */}
      {editWarning && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 9993, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          onClick={() => setEditWarning(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'var(--modal-bg, #fff)',
              borderRadius: 16,
              padding: '32px 36px',
              maxWidth: 440,
              width: '90%',
              boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
              display: 'flex',
              flexDirection: 'column',
              gap: 16,
            }}
            className="dark:bg-gray-900"
          >
            {/* Icon */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: '#EEF2FF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg viewBox="0 0 20 20" width="20" height="20" fill="none">
                  <path d="M10 2a8 8 0 100 16A8 8 0 0010 2zm0 4a1 1 0 110 2 1 1 0 010-2zm0 4a1 1 0 011 1v3a1 1 0 11-2 0v-3a1 1 0 011-1z" fill="#7B61FF"/>
                </svg>
              </div>
              <h2 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: '#111827', lineHeight: 1.3 }} className="dark:text-white">
                You're editing a shared diagram
              </h2>
            </div>

            <p style={{ margin: 0, fontSize: 14, color: '#6B7280', lineHeight: 1.6 }} className="dark:text-gray-400">
              This is <strong style={{ color: '#374151' }} className="dark:text-gray-200">your own copy</strong> — any changes you make are saved locally and won't affect the original shared link or anyone else's version.
            </p>
            <p style={{ margin: 0, fontSize: 14, color: '#6B7280', lineHeight: 1.6 }} className="dark:text-gray-400">
              When you're ready to share your updated diagram, use the <strong style={{ color: '#374151' }} className="dark:text-gray-200">Share</strong> button in the toolbar to generate a new link.
            </p>

            <button
              onClick={() => setEditWarning(false)}
              style={{
                marginTop: 4,
                padding: '10px 0',
                background: '#7B61FF',
                color: '#fff',
                border: 'none',
                borderRadius: 10,
                fontSize: 14,
                fontWeight: 600,
                cursor: 'pointer',
                width: '100%',
              }}
            >
              Got it, start editing
            </button>
          </div>
        </div>
      )}
    </ReactFlowProvider>
  )
}

export default App
