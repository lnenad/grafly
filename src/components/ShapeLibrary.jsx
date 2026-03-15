import { useState, useMemo, useCallback } from 'react'
import { Search, ChevronDown, ChevronRight, ChevronLeft } from 'lucide-react'
import { useReactFlow } from '@xyflow/react'
import { BASIC_SHAPES } from '../data/basicShapes'
import { AWS_SHAPES, AWS_ICONS } from '../data/awsShapes'
import { GCP_SHAPES, GCP_ICONS } from '../data/gcpShapes'
import useDiagramStore from '../store/diagramStore'

const isTouchDevice = typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches

// ─── Shape preview SVGs ────────────────────────────────────────────────────

function BasicShapePreview({ shapeType, fill, stroke, sw = 1.5 }) {
  const w = 44
  const h = 28

  switch (shapeType) {
    case 'roundedRect':
      return <rect x={sw/2} y={sw/2} width={w-sw} height={h-sw} rx={5} fill={fill} stroke={stroke} strokeWidth={sw} />
    case 'circle':
      return <ellipse cx={w/2} cy={h/2} rx={w/2-sw/2} ry={h/2-sw/2} fill={fill} stroke={stroke} strokeWidth={sw} />
    case 'diamond': {
      const pts = `${w/2},${sw} ${w-sw},${h/2} ${w/2},${h-sw} ${sw},${h/2}`
      return <polygon points={pts} fill={fill} stroke={stroke} strokeWidth={sw} />
    }
    case 'triangle': {
      const pts = `${w/2},${sw} ${w-sw},${h-sw} ${sw},${h-sw}`
      return <polygon points={pts} fill={fill} stroke={stroke} strokeWidth={sw} />
    }
    case 'parallelogram': {
      const off = w * 0.2
      const pts = `${off},${sw} ${w-sw},${sw} ${w-off},${h-sw} ${sw},${h-sw}`
      return <polygon points={pts} fill={fill} stroke={stroke} strokeWidth={sw} />
    }
    case 'cylinder': {
      const rx = (w-sw)/2
      const ry = 4
      return (
        <g>
          <rect x={sw/2} y={ry+sw/2} width={w-sw} height={h-ry*2-sw} fill={fill} stroke="none" />
          <line x1={sw/2} y1={ry+sw/2} x2={sw/2} y2={h-ry-sw/2} stroke={stroke} strokeWidth={sw} />
          <line x1={w-sw/2} y1={ry+sw/2} x2={w-sw/2} y2={h-ry-sw/2} stroke={stroke} strokeWidth={sw} />
          <ellipse cx={w/2} cy={h-ry-sw/2} rx={rx} ry={ry} fill={fill} stroke={stroke} strokeWidth={sw} />
          <ellipse cx={w/2} cy={ry+sw/2} rx={rx} ry={ry} fill={fill} stroke={stroke} strokeWidth={sw} />
        </g>
      )
    }
    case 'hexagon': {
      const qw = w * 0.22
      const pts = `${qw},${sw} ${w-qw},${sw} ${w-sw},${h/2} ${w-qw},${h-sw} ${qw},${h-sw} ${sw},${h/2}`
      return <polygon points={pts} fill={fill} stroke={stroke} strokeWidth={sw} />
    }
    case 'pill':
      return <rect x={sw/2} y={sw/2} width={w-sw} height={h-sw} rx={(h-sw)/2} fill={fill} stroke={stroke} strokeWidth={sw} />
    case 'callout': {
      const tailH = h * 0.25
      const bodyH = h - tailH
      const tx = w * 0.2
      return (
        <g>
          <rect x={sw/2} y={sw/2} width={w-sw} height={bodyH-sw/2} rx={4} fill={fill} stroke={stroke} strokeWidth={sw} />
          <polygon points={`${tx},${bodyH-sw/2} ${tx+10},${bodyH-sw/2} ${tx+4},${h-sw}`} fill={fill} stroke={stroke} strokeWidth={sw} strokeLinejoin="round" />
        </g>
      )
    }
    case 'textbox':
      return (
        <text x={w/2} y={h/2+5} textAnchor="middle" fill={fill === 'transparent' ? '#6B7280' : fill} fontSize="12" fontFamily="sans-serif">
          Text
        </text>
      )
    default:
      return <rect x={sw/2} y={sw/2} width={w-sw} height={h-sw} fill={fill} stroke={stroke} strokeWidth={sw} />
  }
}

function CloudShapePreview({ shapeType, accentColor }) {
  const icons = { ...AWS_ICONS, ...GCP_ICONS }
  const iconFn = icons[shapeType]
  const color = accentColor || '#7B61FF'
  const iconSVG = iconFn ? iconFn(color) : ''
  return (
    <g transform="scale(0.6) translate(3, 3)" dangerouslySetInnerHTML={{ __html: iconSVG }} />
  )
}

// ─── Draggable shape item ──────────────────────────────────────────────────

function ShapeItem({ shape, onTap }) {
  const isCloud = shape.defaultData?.isCloudShape
  const fill = shape.defaultData?.fillColor || '#EEF2FF'
  const stroke = shape.defaultData?.strokeColor || '#818CF8'
  const accentColor = shape.defaultData?.accentColor

  const onDragStart = useCallback((e) => {
    e.dataTransfer.setData('application/grafly-shape', JSON.stringify(shape))
    e.dataTransfer.effectAllowed = 'move'
  }, [shape])

  const handleClick = useCallback(() => {
    if (onTap) onTap(shape)
  }, [onTap, shape])

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onClick={onTap ? handleClick : undefined}
      className="flex flex-col items-center gap-1 p-2 rounded-xl cursor-grab active:cursor-grabbing hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors select-none"
      data-tooltip={onTap ? `Tap to add ${shape.name}` : `Drag to add ${shape.name}`}
    >
      <svg
        width={44}
        height={isCloud ? 36 : 28}
        viewBox={isCloud ? '0 0 26 26' : '0 0 44 28'}
        className="overflow-visible"
      >
        {isCloud ? (
          <CloudShapePreview shapeType={shape.id} accentColor={accentColor} />
        ) : (
          <BasicShapePreview
            shapeType={shape.defaultData?.shapeType}
            fill={fill}
            stroke={stroke}
          />
        )}
      </svg>
      <span className="text-[10px] text-gray-500 dark:text-gray-400 text-center leading-tight max-w-[48px] truncate">{shape.name}</span>
    </div>
  )
}

// ─── Category section ─────────────────────────────────────────────────────

function CategorySection({ title, shapes, defaultOpen = false, onTap }) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div>
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-3 py-1.5 text-xs font-semibold text-gray-500 dark:text-gray-500 uppercase tracking-wider hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
      >
        <span>{title}</span>
        {open ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
      </button>
      {open && (
        <div className="grid grid-cols-3 gap-0 px-1 pb-2">
          {shapes.map((s) => (
            <ShapeItem key={s.id} shape={s} onTap={onTap} />
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Main ShapeLibrary ─────────────────────────────────────────────────────

const AWS_BY_CATEGORY = AWS_SHAPES.reduce((acc, s) => {
  const cat = s.category || 'Other'
  if (!acc[cat]) acc[cat] = []
  acc[cat].push(s)
  return acc
}, {})

const GCP_BY_CATEGORY = GCP_SHAPES.reduce((acc, s) => {
  const cat = s.category || 'Other'
  if (!acc[cat]) acc[cat] = []
  acc[cat].push(s)
  return acc
}, {})

const TABS = ['Basic', 'AWS', 'GCP']

export default function ShapeLibrary() {
  const [tab, setTab] = useState('Basic')
  const [search, setSearch] = useState('')
  const [collapsed, setCollapsed] = useState(isTouchDevice)

  const reactFlow = useReactFlow()
  const addNode = useDiagramStore((s) => s.addNode)

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim()
    if (!q) return null
    const all = [...BASIC_SHAPES, ...AWS_SHAPES, ...GCP_SHAPES]
    return all.filter((s) => s.name.toLowerCase().includes(q))
  }, [search])

  const handleTap = useCallback((shape) => {
    const canvasEl = document.querySelector('.react-flow')
    if (!canvasEl) return
    const rect = canvasEl.getBoundingClientRect()
    const position = reactFlow.screenToFlowPosition({
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    })
    addNode({
      id:   `n_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      type: 'shape',
      position: {
        x: position.x - shape.defaultWidth  / 2,
        y: position.y - shape.defaultHeight / 2,
      },
      data:   { ...shape.defaultData },
      width:  shape.defaultWidth,
      height: shape.defaultHeight,
    })
  }, [reactFlow, addNode])

  const onTap = isTouchDevice ? handleTap : null

  // ── Collapsed strip ──────────────────────────────────────────────────────
  if (collapsed) {
    return (
      <div
        onClick={() => setCollapsed(false)}
        className="flex flex-col items-center bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 py-2 w-9 shrink-0 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/60 transition-colors"
        data-tooltip="Show shapes"
      >
        <div className="p-1.5 text-gray-400">
          <ChevronRight size={14} />
        </div>
      </div>
    )
  }

  // ── Expanded panel ───────────────────────────────────────────────────────
  return (
    <div
      className="flex flex-col bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 h-full"
      style={{ width: 180, minWidth: 180, boxShadow: '1px 0 0 rgba(0,0,0,0.04)' }}
    >
      {/* Tabs + collapse button */}
      <div className="flex items-end border-b border-gray-200 dark:border-gray-700 px-2 pt-2 gap-1">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 pb-1.5 text-xs font-medium rounded-t transition-colors ${
              tab === t
                ? 'text-primary-600 dark:text-primary-400 border-b-2 border-primary-500'
                : 'text-gray-500 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            {t}
          </button>
        ))}
        <button
          onClick={() => setCollapsed(true)}
          className="pb-1.5 px-0.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors shrink-0"
          data-tooltip="Collapse"
        >
          <ChevronLeft size={14} />
        </button>
      </div>

      {/* Search */}
      <div className="px-2 py-2">
        <div className="flex items-center gap-1.5 bg-gray-100 dark:bg-gray-800 rounded-lg px-2 py-1.5">
          <Search size={12} className="text-gray-400 shrink-0" />
          <input
            type="text"
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent text-xs text-gray-700 dark:text-gray-300 outline-none w-full placeholder-gray-400 dark:placeholder-gray-600"
          />
        </div>
      </div>

      {/* Shape list */}
      <div className="flex-1 overflow-y-auto">
        {filtered ? (
          <div>
            <div className="px-3 py-1 text-[10px] text-gray-400 dark:text-gray-600 uppercase tracking-wider font-semibold">
              Results ({filtered.length})
            </div>
            <div className="grid grid-cols-3 gap-0 px-1">
              {filtered.map((s) => (
                <ShapeItem key={s.id} shape={s} onTap={onTap} />
              ))}
            </div>
            {filtered.length === 0 && (
              <div className="text-center py-8 text-xs text-gray-400 dark:text-gray-600">No shapes found</div>
            )}
          </div>
        ) : tab === 'Basic' ? (
          <div className="py-1">
            <CategorySection title="Shapes" shapes={BASIC_SHAPES} defaultOpen onTap={onTap} />
          </div>
        ) : tab === 'AWS' ? (
          <div className="py-1">
            {Object.entries(AWS_BY_CATEGORY).map(([cat, shapes]) => (
              <CategorySection key={cat} title={cat} shapes={shapes} defaultOpen={cat === 'Compute'} onTap={onTap} />
            ))}
          </div>
        ) : (
          <div className="py-1">
            {Object.entries(GCP_BY_CATEGORY).map(([cat, shapes]) => (
              <CategorySection key={cat} title={cat} shapes={shapes} defaultOpen={cat === 'Compute'} onTap={onTap} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
