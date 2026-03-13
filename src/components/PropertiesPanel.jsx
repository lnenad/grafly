import { useCallback } from 'react'
import {
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignStartHorizontal,
  AlignCenterHorizontal,
  AlignEndHorizontal,
  AlignStartVertical,
  AlignCenterVertical,
  AlignEndVertical,
  BringToFront,
  SendToBack,
  ArrowUpToLine,
  ArrowDownToLine,
  Bold,
  Italic,
  Underline,
  Minus,
  Layers,
} from 'lucide-react'
import useDiagramStore from '../store/diagramStore'

const PRESET_COLORS = [
  { fill: '#EEF2FF', stroke: '#818CF8', label: 'Indigo' },
  { fill: '#F0FDF4', stroke: '#4ADE80', label: 'Green' },
  { fill: '#FFF7ED', stroke: '#FB923C', label: 'Orange' },
  { fill: '#FDF2F8', stroke: '#F472B6', label: 'Pink' },
  { fill: '#FEFCE8', stroke: '#FACC15', label: 'Yellow' },
  { fill: '#F0F9FF', stroke: '#38BDF8', label: 'Sky' },
  { fill: '#F5F3FF', stroke: '#A78BFA', label: 'Purple' },
  { fill: '#FFF1F2', stroke: '#FB7185', label: 'Rose' },
  { fill: '#F9FAFB', stroke: '#9CA3AF', label: 'Gray' },
  { fill: '#FFFFFF', stroke: '#374151', label: 'White' },
]

const STROKE_WIDTHS = [1, 2, 3, 4, 6]
const FONT_SIZES = [10, 11, 12, 13, 14, 16, 18, 20, 24, 28, 32]
const STROKE_STYLES = [
  { value: 'solid',  label: '—'   },
  { value: 'dashed', label: '- -' },
  { value: 'dotted', label: '···' },
]
const ARROW_TYPES = [
  { value: 'filled', label: 'Filled' },
  { value: 'open',   label: 'Open'   },
]
const PATH_TYPES = [
  { value: 'smoothstep', label: 'Curved'   },
  { value: 'bezier',     label: 'Bezier'   },
  { value: 'straight',   label: 'Straight' },
]

// ─── Primitives ──────────────────────────────────────────────────────────────

function Label({ children }) {
  return <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1">{children}</div>
}

function Section({ title, children }) {
  return (
    <div className="px-3 py-3 border-b border-gray-100">
      {title && <Label>{title}</Label>}
      {children}
    </div>
  )
}

function ColorInput({ value, onChange }) {
  return (
    <div className="flex items-center gap-2">
      <div
        className="relative w-6 h-6 rounded cursor-pointer border border-gray-200 overflow-hidden shrink-0"
        style={{
          background: value === 'transparent'
            ? 'linear-gradient(45deg, #ddd 25%, transparent 25%, transparent 75%, #ddd 75%), linear-gradient(45deg, #ddd 25%, white 25%, white 75%, #ddd 75%)'
            : value,
          backgroundSize: '8px 8px, 8px 8px',
          backgroundPosition: '0 0, 4px 4px',
        }}
      >
        <input
          type="color"
          value={value === 'transparent' ? '#ffffff' : value}
          onChange={(e) => onChange(e.target.value)}
          className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
        />
      </div>
      <input
        type="text"
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        className="flex-1 text-xs bg-gray-50 border border-gray-200 rounded-md px-2 py-1 outline-none focus:border-primary-400 font-mono"
        placeholder="#000000"
      />
    </div>
  )
}

function ToggleButton({ active, onClick, children, title }) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={`flex items-center justify-center w-7 h-7 rounded-md text-xs transition-all ${
        active ? 'bg-primary-100 text-primary-600' : 'hover:bg-gray-100 text-gray-500'
      }`}
    >
      {children}
    </button>
  )
}

// ─── Layer controls (shared) ──────────────────────────────────────────────────

function LayerSection() {
  const bringToFront = useDiagramStore((s) => s.bringToFront)
  const sendToBack   = useDiagramStore((s) => s.sendToBack)
  const bringForward = useDiagramStore((s) => s.bringForward)
  const sendBackward = useDiagramStore((s) => s.sendBackward)
  return (
    <Section title="Layer">
      <div className="flex gap-1">
        <ToggleButton onClick={sendToBack}   title="Send to back">   <SendToBack size={13} /></ToggleButton>
        <ToggleButton onClick={sendBackward} title="Send backward">  <ArrowDownToLine size={13} /></ToggleButton>
        <ToggleButton onClick={bringForward} title="Bring forward">  <ArrowUpToLine size={13} /></ToggleButton>
        <ToggleButton onClick={bringToFront} title="Bring to front"> <BringToFront size={13} /></ToggleButton>
      </div>
    </Section>
  )
}

// ─── Shared node data sections (Color, Border, Opacity, Text) ────────────────

function NodeDataSections({ data, update, isCloud }) {
  return (
    <>
      {!isCloud && (
        <Section title="Color">
          <div className="flex flex-wrap gap-1.5 mb-2">
            {PRESET_COLORS.map((c) => (
              <button
                key={c.label}
                title={c.label}
                onClick={() => update({ fillColor: c.fill, strokeColor: c.stroke })}
                className="w-5 h-5 rounded border-2 transition-transform hover:scale-110"
                style={{ background: c.fill, borderColor: c.stroke }}
              />
            ))}
          </div>
          <div className="space-y-1.5">
            <Label>Fill</Label>
            <ColorInput value={data.fillColor} onChange={(v) => update({ fillColor: v })} />
            <Label>Stroke</Label>
            <ColorInput value={data.strokeColor} onChange={(v) => update({ strokeColor: v })} />
          </div>
        </Section>
      )}

      {!isCloud && (
        <Section title="Border">
          <div className="space-y-2">
            <div>
              <Label>Width</Label>
              <div className="flex gap-1">
                {STROKE_WIDTHS.map((w) => (
                  <button
                    key={w}
                    onClick={() => update({ strokeWidth: w })}
                    className={`flex-1 h-6 rounded text-xs font-medium transition-all ${
                      (data.strokeWidth || 2) === w
                        ? 'bg-primary-500 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {w}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <Label>Style</Label>
              <div className="flex gap-1">
                {STROKE_STYLES.map((s) => (
                  <button
                    key={s.value}
                    onClick={() => update({ strokeStyle: s.value })}
                    className={`flex-1 h-6 rounded text-xs transition-all ${
                      (data.strokeStyle || 'solid') === s.value
                        ? 'bg-primary-500 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </Section>
      )}

      <Section title="Opacity">
        <div className="flex items-center gap-2">
          <input
            type="range" min={0} max={1} step={0.05}
            value={data.opacity ?? 1}
            onChange={(e) => update({ opacity: parseFloat(e.target.value) })}
            className="flex-1 accent-primary-500"
          />
          <span className="text-xs text-gray-500 w-8 text-right">
            {Math.round((data.opacity ?? 1) * 100)}%
          </span>
        </div>
      </Section>

      <Section title="Text">
        <div className="space-y-2">
          <div>
            <Label>Size</Label>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => update({ fontSize: Math.max(8, (data.fontSize || 13) - 1) })}
                className="w-6 h-6 rounded bg-gray-100 text-gray-600 hover:bg-gray-200 flex items-center justify-center text-sm font-bold"
              >−</button>
              <select
                value={data.fontSize || 13}
                onChange={(e) => update({ fontSize: parseInt(e.target.value) })}
                className="flex-1 text-xs bg-gray-50 border border-gray-200 rounded-md px-1 py-1 outline-none focus:border-primary-400"
              >
                {FONT_SIZES.map((s) => <option key={s} value={s}>{s}px</option>)}
              </select>
              <button
                onClick={() => update({ fontSize: Math.min(72, (data.fontSize || 13) + 1) })}
                className="w-6 h-6 rounded bg-gray-100 text-gray-600 hover:bg-gray-200 flex items-center justify-center text-sm font-bold"
              >+</button>
            </div>
          </div>
          <div>
            <Label>Style</Label>
            <div className="flex gap-1">
              <ToggleButton
                active={data.fontWeight === 'bold' || data.fontWeight === '700'}
                onClick={() => update({ fontWeight: (data.fontWeight === 'bold' || data.fontWeight === '700') ? '400' : 'bold' })}
                title="Bold"
              ><Bold size={13} /></ToggleButton>
              <ToggleButton
                active={data.fontStyle === 'italic'}
                onClick={() => update({ fontStyle: data.fontStyle === 'italic' ? 'normal' : 'italic' })}
                title="Italic"
              ><Italic size={13} /></ToggleButton>
              <ToggleButton
                active={data.textDecoration === 'underline'}
                onClick={() => update({ textDecoration: data.textDecoration === 'underline' ? 'none' : 'underline' })}
                title="Underline"
              ><Underline size={13} /></ToggleButton>
            </div>
          </div>
          <div>
            <Label>Align</Label>
            <div className="flex gap-1">
              {[
                { value: 'left',   icon: <AlignLeft size={13} />   },
                { value: 'center', icon: <AlignCenter size={13} /> },
                { value: 'right',  icon: <AlignRight size={13} />  },
              ].map(({ value, icon }) => (
                <ToggleButton
                  key={value}
                  active={(data.textAlign || 'center') === value}
                  onClick={() => update({ textAlign: value })}
                  title={value}
                >{icon}</ToggleButton>
              ))}
            </div>
          </div>
          <div>
            <Label>Color</Label>
            <ColorInput value={data.textColor || '#111827'} onChange={(v) => update({ textColor: v })} />
          </div>
        </div>
      </Section>
    </>
  )
}

// ─── Single node properties ───────────────────────────────────────────────────

function NodeProperties({ node }) {
  const updateNodeData = useDiagramStore((s) => s.updateNodeData)
  const data    = node.data
  const isCloud = data.shapeType?.startsWith('aws-') || data.shapeType?.startsWith('gcp-')
  const update  = useCallback((patch) => updateNodeData(node.id, patch), [node.id, updateNodeData])

  return (
    <>
      <LayerSection />
      <NodeDataSections data={data} update={update} isCloud={isCloud} />
      <Section title="Layout">
        <div className="grid grid-cols-2 gap-1.5 text-xs">
          {[
            { label: 'Width',  value: Math.round(node.measured?.width  || node.width  || 160) },
            { label: 'Height', value: Math.round(node.measured?.height || node.height || 80)  },
            { label: 'X',      value: Math.round(node.position?.x || 0) },
            { label: 'Y',      value: Math.round(node.position?.y || 0) },
          ].map(({ label, value }) => (
            <div key={label}>
              <Label>{label}</Label>
              <input
                type="number" value={value} readOnly
                className="w-full bg-gray-50 border border-gray-200 rounded px-2 py-1 outline-none text-gray-500"
              />
            </div>
          ))}
        </div>
      </Section>
    </>
  )
}

// ─── Multi-node properties ────────────────────────────────────────────────────

const ALIGN_ACTIONS = [
  { type: 'left',     icon: <AlignStartVertical size={14} />,    title: 'Align left edges'         },
  { type: 'center-h', icon: <AlignCenterVertical size={14} />,   title: 'Align horizontal centers' },
  { type: 'right',    icon: <AlignEndVertical size={14} />,      title: 'Align right edges'        },
  { type: 'top',      icon: <AlignStartHorizontal size={14} />,  title: 'Align top edges'          },
  { type: 'center-v', icon: <AlignCenterHorizontal size={14} />, title: 'Align vertical centers'   },
  { type: 'bottom',   icon: <AlignEndHorizontal size={14} />,    title: 'Align bottom edges'       },
]

function MultiNodeProperties({ selectedNodes, allNodes }) {
  const alignNodes              = useDiagramStore((s) => s.alignNodes)
  const updateSelectedNodesData = useDiagramStore((s) => s.updateSelectedNodesData)

  const firstNode = allNodes.find((n) => selectedNodes.some((s) => s.id === n.id))
  const data      = firstNode?.data || {}
  const isCloud   = data.shapeType?.startsWith('aws-') || data.shapeType?.startsWith('gcp-')

  return (
    <>
      <LayerSection />

      <Section title="Align">
        <div className="space-y-1.5">
          <div>
            <Label>Horizontal</Label>
            <div className="flex gap-1">
              {ALIGN_ACTIONS.slice(0, 3).map(({ type, icon, title }) => (
                <ToggleButton key={type} onClick={() => alignNodes(type)} title={title}>{icon}</ToggleButton>
              ))}
            </div>
          </div>
          <div>
            <Label>Vertical</Label>
            <div className="flex gap-1">
              {ALIGN_ACTIONS.slice(3).map(({ type, icon, title }) => (
                <ToggleButton key={type} onClick={() => alignNodes(type)} title={title}>{icon}</ToggleButton>
              ))}
            </div>
          </div>
        </div>
      </Section>

      <NodeDataSections data={data} update={updateSelectedNodesData} isCloud={isCloud} />
    </>
  )
}

// ─── Edge properties ──────────────────────────────────────────────────────────

function EdgeProperties({ edge }) {
  const updateEdgeData = useDiagramStore((s) => s.updateEdgeData)
  const data = edge.data || {}
  const update = useCallback((patch) => updateEdgeData(edge.id, patch), [edge.id, updateEdgeData])

  return (
    <>
      <Section title="Connection">
        <div className="space-y-2">
          <div>
            <Label>Path style</Label>
            <div className="flex flex-col gap-1">
              {PATH_TYPES.map((p) => (
                <button
                  key={p.value}
                  onClick={() => update({ pathType: p.value })}
                  className={`text-left px-2 py-1.5 rounded-lg text-xs transition-all ${
                    (data.pathType || 'smoothstep') === p.value
                      ? 'bg-primary-100 text-primary-700 font-medium'
                      : 'hover:bg-gray-50 text-gray-600'
                  }`}
                >{p.label}</button>
              ))}
            </div>
          </div>
          <div>
            <Label>Line style</Label>
            <div className="flex gap-1">
              {STROKE_STYLES.map((s) => (
                <button
                  key={s.value}
                  onClick={() => update({ edgeStyle: s.value })}
                  className={`flex-1 h-6 rounded text-xs transition-all ${
                    (data.edgeStyle || 'solid') === s.value
                      ? 'bg-primary-500 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >{s.label}</button>
              ))}
            </div>
          </div>
          <div>
            <Label>Width</Label>
            <div className="flex gap-1">
              {[1, 2, 3, 4].map((w) => (
                <button
                  key={w}
                  onClick={() => update({ edgeWidth: w })}
                  className={`flex-1 h-6 rounded text-xs font-medium transition-all ${
                    (data.edgeWidth || 2) === w
                      ? 'bg-primary-500 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >{w}</button>
              ))}
            </div>
          </div>
        </div>
      </Section>

      <Section title="Arrow">
        <div className="space-y-2">
          <div>
            <Label>End arrow</Label>
            <div className="flex gap-1">
              {ARROW_TYPES.map((a) => (
                <button
                  key={a.value}
                  onClick={() => update({ arrowType: a.value })}
                  className={`flex-1 h-6 rounded text-xs transition-all ${
                    (data.arrowType || 'filled') === a.value
                      ? 'bg-primary-500 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >{a.value === 'filled' ? 'Filled' : 'Open'}</button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox" id="arrow-start"
              checked={!!data.arrowStart}
              onChange={(e) => update({ arrowStart: e.target.checked })}
              className="accent-primary-500"
            />
            <label htmlFor="arrow-start" className="text-xs text-gray-600 cursor-pointer">Start arrow</label>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox" id="animated"
              checked={!!data.animated}
              onChange={(e) => update({ animated: e.target.checked })}
              className="accent-primary-500"
            />
            <label htmlFor="animated" className="text-xs text-gray-600 cursor-pointer">Animated</label>
          </div>
        </div>
      </Section>

      <Section title="Color">
        <ColorInput value={data.edgeColor || '#6B7280'} onChange={(v) => update({ edgeColor: v })} />
      </Section>

      <Section title="Label">
        <input
          type="text"
          value={data.label || ''}
          onChange={(e) => update({ label: e.target.value })}
          placeholder="Add label..."
          className="w-full text-xs bg-gray-50 border border-gray-200 rounded-lg px-2 py-1.5 outline-none focus:border-primary-400"
        />
      </Section>
    </>
  )
}

// ─── Main PropertiesPanel ─────────────────────────────────────────────────────

export default function PropertiesPanel() {
  const selectedNodes = useDiagramStore((s) => s.selectedNodes)
  const selectedEdges = useDiagramStore((s) => s.selectedEdges)
  const nodes         = useDiagramStore((s) => s.nodes)
  const edges         = useDiagramStore((s) => s.edges)

  const multiNode = selectedNodes.length > 1
  const nodeId    = selectedNodes[0]?.id
  const edgeId    = selectedEdges[0]?.id
  const node      = (!multiNode && nodeId) ? nodes.find((n) => n.id === nodeId) : null
  const edge      = edgeId ? edges.find((e) => e.id === edgeId) : null

  if (!multiNode && !node && !edge) {
    return (
      <div
        className="bg-white border-l border-gray-200 flex flex-col items-center justify-center text-center px-4"
        style={{ width: 220, minWidth: 220 }}
      >
        <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center mb-3">
          <Minus size={18} className="text-gray-400" />
        </div>
        <p className="text-xs text-gray-400 leading-relaxed">
          Select a shape or connection to edit its properties
        </p>
      </div>
    )
  }

  return (
    <div
      className="bg-white border-l border-gray-200 flex flex-col h-full overflow-y-auto"
      style={{ width: 220, minWidth: 220 }}
    >
      <div className="px-3 py-2.5 border-b border-gray-100 flex items-center gap-2">
        {multiNode && <Layers size={13} className="text-gray-400 shrink-0" />}
        <div>
          <p className="text-xs font-semibold text-gray-700">
            {multiNode
              ? `${selectedNodes.length} shapes selected`
              : node
                ? node.data?.shapeType?.replace('aws-', '').replace('gcp-', '').replace(/-/g, ' ') || 'Shape'
                : 'Connection'}
          </p>
          {!multiNode && (
            <p className="text-[10px] text-gray-400">
              {node ? `ID: ${node.id.slice(0, 12)}…` : `ID: ${edge?.id?.slice(0, 12)}…`}
            </p>
          )}
        </div>
      </div>

      {multiNode  && <MultiNodeProperties selectedNodes={selectedNodes} allNodes={nodes} />}
      {!multiNode && node && <NodeProperties node={node} />}
      {!multiNode && edge && !node && <EdgeProperties edge={edge} />}
    </div>
  )
}
