import { memo, useState, useCallback, useRef, useEffect } from 'react'
import { Handle, Position, NodeResizer, useReactFlow } from '@xyflow/react'
import useDiagramStore from '../../store/diagramStore'
import {
  COLOR_TEXT_DEFAULT,
  DEFAULT_FONT_WEIGHT,
  DEFAULT_FONT_SIZE,
  DEFAULT_TEXT_ALIGN,
  STROKE_DASH_DASHED,
  STROKE_DASH_DOTTED,
} from '../../utils/styleConstants'
import { AWS_ICONS } from '../../data/awsShapes'
import { GCP_ICONS } from '../../data/gcpShapes'

// ─── SVG shape renderers ───────────────────────────────────────────────────

function RectShape({ w, h, fill, stroke, sw, rx = 0, dash }) {
  const s = sw / 2
  return <rect x={s} y={s} width={w - sw} height={h - sw} rx={rx} ry={rx} fill={fill} stroke={stroke} strokeWidth={sw} strokeDasharray={dash} />
}

function CircleShape({ w, h, fill, stroke, sw, dash }) {
  const s = sw / 2
  return <ellipse cx={w / 2} cy={h / 2} rx={w / 2 - s} ry={h / 2 - s} fill={fill} stroke={stroke} strokeWidth={sw} strokeDasharray={dash} />
}

function DiamondShape({ w, h, fill, stroke, sw, dash }) {
  const s = sw
  const pts = `${w / 2},${s} ${w - s},${h / 2} ${w / 2},${h - s} ${s},${h / 2}`
  return <polygon points={pts} fill={fill} stroke={stroke} strokeWidth={sw} strokeDasharray={dash} strokeLinejoin="round" />
}

function TriangleShape({ w, h, fill, stroke, sw, dash }) {
  const s = sw
  const pts = `${w / 2},${s} ${w - s},${h - s} ${s},${h - s}`
  return <polygon points={pts} fill={fill} stroke={stroke} strokeWidth={sw} strokeDasharray={dash} strokeLinejoin="round" />
}

function ParallelogramShape({ w, h, fill, stroke, sw, dash }) {
  const s = sw
  const offset = w * 0.2
  const pts = `${offset},${s} ${w - s},${s} ${w - offset},${h - s} ${s},${h - s}`
  return <polygon points={pts} fill={fill} stroke={stroke} strokeWidth={sw} strokeDasharray={dash} strokeLinejoin="round" />
}

function CylinderShape({ w, h, fill, stroke, sw }) {
  const s = sw / 2
  const rx = (w - sw) / 2
  const ry = Math.min((h - sw) * 0.12, 14)
  const topY = s + ry
  const botY = h - s - ry
  return (
    <g>
      <rect x={s} y={topY} width={w - sw} height={botY - topY} fill={fill} stroke="none" />
      <line x1={s} y1={topY} x2={s} y2={botY} stroke={stroke} strokeWidth={sw} />
      <line x1={w - s} y1={topY} x2={w - s} y2={botY} stroke={stroke} strokeWidth={sw} />
      <ellipse cx={w / 2} cy={botY} rx={rx} ry={ry} fill={fill} stroke={stroke} strokeWidth={sw} />
      <ellipse cx={w / 2} cy={topY} rx={rx} ry={ry} fill={fill} stroke={stroke} strokeWidth={sw} />
    </g>
  )
}

function HexagonShape({ w, h, fill, stroke, sw, dash }) {
  const s = sw
  const qw = w * 0.25
  const pts = `${qw},${s} ${w - qw},${s} ${w - s},${h / 2} ${w - qw},${h - s} ${qw},${h - s} ${s},${h / 2}`
  return <polygon points={pts} fill={fill} stroke={stroke} strokeWidth={sw} strokeDasharray={dash} strokeLinejoin="round" />
}

function PillShape({ w, h, fill, stroke, sw, dash }) {
  const s = sw / 2
  const r = (h - sw) / 2
  return <rect x={s} y={s} width={w - sw} height={h - sw} rx={r} ry={r} fill={fill} stroke={stroke} strokeWidth={sw} strokeDasharray={dash} />
}

function CalloutShape({ w, h, fill, stroke, sw }) {
  const s = sw / 2
  const tailH = h * 0.22
  const bodyH = h - tailH
  const tailX = w * 0.2
  return (
    <g>
      <rect x={s} y={s} width={w - sw} height={bodyH - s} rx={6} fill={fill} stroke={stroke} strokeWidth={sw} />
      <polygon
        points={`${tailX},${bodyH - s} ${tailX + 18},${bodyH - s} ${tailX + 6},${h - s}`}
        fill={fill}
        stroke={stroke}
        strokeWidth={sw}
        strokeLinejoin="round"
      />
    </g>
  )
}

function TextboxShape({ w, h }) {
  return <rect x={0} y={0} width={w} height={h} fill="transparent" stroke="transparent" />
}

// ─── Cloud icon node ───────────────────────────────────────────────────────

function CloudShape({ w, h, shapeType, accentColor, strokeColor, strokeWidth, fillColor, selected }) {
  const iconFn = AWS_ICONS[shapeType] || GCP_ICONS[shapeType]
  const color = accentColor || '#7B61FF'
  const iconSVG = iconFn ? iconFn(color) : ''
  const labelReserve = 26                          // px reserved for label at bottom
  const iconAreaH = h - labelReserve
  const iconSize = Math.min(w * 0.55, iconAreaH * 0.65)
  const iconX = (w - iconSize) / 2
  const iconY = (iconAreaH - iconSize) / 2          // vertically centered in icon area
  const sw = strokeWidth || 1

  return (
    <g>
      <rect
        x={sw / 2}
        y={sw / 2}
        width={w - sw}
        height={h - sw}
        rx={10}
        fill={fillColor || '#ffffff'}
        stroke={selected ? '#7B61FF' : strokeColor || '#E5E7EB'}
        strokeWidth={selected ? 2 : sw}
      />
      <g transform={`translate(${iconX}, ${iconY}) scale(${iconSize / 32})`} dangerouslySetInnerHTML={{ __html: iconSVG }} />
    </g>
  )
}

// ─── Shape dispatcher ─────────────────────────────────────────────────────

function ShapeRenderer({ shapeType, w, h, fill, stroke, sw, dash, selected, accentColor, fillColor, strokeColor, strokeWidth }) {
  const props = { w, h, fill, stroke, sw, dash }

  if (shapeType?.startsWith('aws-') || shapeType?.startsWith('gcp-')) {
    return (
      <CloudShape
        w={w}
        h={h}
        shapeType={shapeType}
        accentColor={accentColor}
        strokeColor={strokeColor}
        strokeWidth={strokeWidth}
        fillColor={fillColor}
        selected={selected}
      />
    )
  }

  switch (shapeType) {
    case 'roundedRect': return <RectShape {...props} rx={12} />
    case 'circle': return <CircleShape {...props} />
    case 'diamond': return <DiamondShape {...props} />
    case 'triangle': return <TriangleShape {...props} />
    case 'parallelogram': return <ParallelogramShape {...props} />
    case 'cylinder': return <CylinderShape {...props} />
    case 'hexagon': return <HexagonShape {...props} />
    case 'pill': return <PillShape {...props} />
    case 'callout': return <CalloutShape {...props} />
    case 'textbox': return <TextboxShape {...props} />
    default: return <RectShape {...props} />
  }
}

// ─── Main ShapeNode ────────────────────────────────────────────────────────

const ShapeNode = memo(function ShapeNode({ id, data, selected, width, height }) {
  const w = width || data.defaultWidth || 160
  const h = height || data.defaultHeight || 80
  const [editing, setEditing] = useState(false)
  const [editText, setEditText] = useState(data.label || '')
  const inputRef = useRef(null)
  const updateNodeData = useDiagramStore((s) => s.updateNodeData)

  const isCloud = data.shapeType?.startsWith('aws-') || data.shapeType?.startsWith('gcp-')

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [editing])

  const handleDoubleClick = useCallback((e) => {
    e.stopPropagation()
    setEditText(data.label || '')
    setEditing(true)
  }, [data.label])

  const commitEdit = useCallback(() => {
    updateNodeData(id, { label: editText })
    setEditing(false)
  }, [id, editText, updateNodeData])

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      commitEdit()
    }
    if (e.key === 'Escape') {
      setEditing(false)
    }
  }, [commitEdit])

  const strokeDash = data.strokeStyle === 'dashed' ? STROKE_DASH_DASHED : data.strokeStyle === 'dotted' ? STROKE_DASH_DOTTED : undefined

  const labelStyle = {
    color: data.textColor || COLOR_TEXT_DEFAULT,
    fontSize: `${data.fontSize || DEFAULT_FONT_SIZE}px`,
    fontWeight: data.fontWeight || DEFAULT_FONT_WEIGHT,
    textAlign: data.textAlign || DEFAULT_TEXT_ALIGN,
    fontStyle: data.fontStyle || 'normal',
    textDecoration: data.textDecoration || 'none',
    lineHeight: 1.35,
  }

  const labelAreaStyle = isCloud
    ? { position: 'absolute', bottom: 7, left: 0, right: 0, height: 20, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '0 4px' }
    : { position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '6px 10px' }

  return (
    <div
      className="shape-node"
      style={{
        width: w,
        height: h,
        opacity: data.opacity ?? 1,
        outline: 'none',
      }}
      onDoubleClick={handleDoubleClick}
    >
      <NodeResizer
        isVisible={selected}
        minWidth={40}
        minHeight={30}
        handleStyle={{ background: '#7B61FF', border: '2px solid white', borderRadius: 2, width: 8, height: 8 }}
        lineStyle={{ borderColor: '#7B61FF', borderWidth: 1, pointerEvents: 'none' }}
      />

      {/* Connection handles — shown on hover/select, act as both source & target */}
      <Handle type="source" position={Position.Top} id="top" />
      <Handle type="source" position={Position.Right} id="right" />
      <Handle type="source" position={Position.Bottom} id="bottom" />
      <Handle type="source" position={Position.Left} id="left" />

      {/* Shape SVG */}
      <svg
        width={w}
        height={h}
        style={{ position: 'absolute', inset: 0, overflow: 'visible', pointerEvents: 'none' }}
      >
        <ShapeRenderer
          shapeType={data.shapeType}
          w={w}
          h={h}
          fill={data.fillColor || '#EEF2FF'}
          stroke={selected && !isCloud ? '#7B61FF' : data.strokeColor || '#818CF8'}
          sw={selected && !isCloud ? Math.max(data.strokeWidth || 2, 2) : data.strokeWidth || 2}
          dash={strokeDash}
          selected={selected}
          accentColor={data.accentColor}
          fillColor={data.fillColor}
          strokeColor={data.strokeColor}
          strokeWidth={data.strokeWidth}
        />
      </svg>

      {/* Label */}
      <div style={labelAreaStyle} className="shape-label">
        {editing ? (
          <textarea
            ref={inputRef}
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            onBlur={commitEdit}
            onKeyDown={handleKeyDown}
            rows={2}
            style={{
              ...labelStyle,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              resize: 'none',
              width: '100%',
              textAlign: 'center',
              pointerEvents: 'all',
              cursor: 'text',
            }}
          />
        ) : (
          <span style={labelStyle}>{data.label}</span>
        )}
      </div>
    </div>
  )
})

export default ShapeNode
