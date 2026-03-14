import { useRef, useState } from "react";
import {
  Undo2,
  Redo2,
  Download,
  Upload,
  Trash2,
  Copy,
  ClipboardPaste,
  Grid3X3,
  Map,
  Magnet,
  FilePlus,
  ChevronDown,
  ScanLine,
  Sun,
  Moon,
  Monitor,
} from "lucide-react";
import useDiagramStore from "../store/diagramStore";
import { downloadDiagram, uploadDiagram } from "../utils/fileUtils";
import GraflyLogo from "./GraflyLogo";

const EDGE_TYPES = [
  { value: "smoothstep", label: "Curved" },
  { value: "bezier", label: "Bezier" },
  { value: "straight", label: "Straight" },
];

const THEMES = [
  { value: "light", icon: Sun, title: "Light" },
  { value: "dark", icon: Moon, title: "Dark" },
  { value: "auto", icon: Monitor, title: "Auto" },
];

function ToolbarButton({
  onClick,
  disabled,
  active,
  tooltip,
  children,
  danger,
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      data-tooltip={tooltip}
      className={`
        flex items-center justify-center w-8 h-8 rounded-lg text-sm transition-all
        ${disabled ? "opacity-30 cursor-not-allowed" : "cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"}
        ${active ? "bg-primary-100 text-primary-600 dark:bg-primary-900/40 dark:text-primary-400" : "text-gray-600 dark:text-gray-400"}
        ${danger && !disabled ? "hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950/50 dark:hover:text-red-400" : ""}
      `}
    >
      {children}
    </button>
  );
}

function Divider() {
  return (
    <div className="w-px h-5 bg-gray-200 dark:bg-gray-700 mx-1 shrink-0" />
  );
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
    copySelected,
    paste,
    clipboard,
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
    theme,
    setTheme,
  } = useDiagramStore();

  const fileInputRef = useRef(null);
  const [nameEditing, setNameEditing] = useState(false);
  const [nameVal, setNameVal] = useState(name);
  const [edgeDropdown, setEdgeDropdown] = useState(false);

  const handleDownload = () =>
    downloadDiagram(
      { id: useDiagramStore.getState().id, name, nodes, edges, viewport },
      name,
    );

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      loadFromData(await uploadDiagram(file));
    } catch (err) {
      alert(err.message);
    }
    e.target.value = "";
  };

  const hasSelection = selectedNodes.length > 0 || selectedEdges.length > 0;

  const commitName = () => {
    setName(nameVal);
    setNameEditing(false);
  };

  return (
    <div
      className="flex items-center h-12 px-3 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 gap-1 select-none shrink-0"
      style={{ boxShadow: "0 1px 0 rgba(0,0,0,0.06)" }}
    >
      {/* Logo + Diagram name */}
      <div className="flex items-center gap-1.5 shrink-0">
        <GraflyLogo size={26} className="text-gray-800 dark:text-gray-100" />
        <span className="text-sm font-semibold text-gray-800 dark:text-gray-100 tracking-tight">
          G &nbsp; |
        </span>
      </div>

      <div className="flex items-center mr-3 ml-1 min-w-0">
        {nameEditing ? (
          <input
            autoFocus
            value={nameVal}
            onChange={(e) => setNameVal(e.target.value)}
            onBlur={commitName}
            onKeyDown={(e) => {
              if (e.key === "Enter") commitName();
              if (e.key === "Escape") setNameEditing(false);
            }}
            className="text-sm font-medium text-gray-800 dark:text-gray-200 bg-transparent border-b border-primary-500 outline-none px-1 min-w-[140px]"
          />
        ) : (
          <button
            onDoubleClick={() => {
              setNameVal(name);
              setNameEditing(true);
            }}
            className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 px-1 rounded cursor-pointer max-w-[200px] truncate"
          >
            {name}
          </button>
        )}
      </div>

      <Divider />
      <ToolbarButton tooltip="New diagram" onClick={newDiagram}>
        <FilePlus size={16} />
      </ToolbarButton>
      <Divider />

      <ToolbarButton
        tooltip="Undo (Ctrl+Z)"
        onClick={undo}
        disabled={!canUndo()}
      >
        <Undo2 size={16} />
      </ToolbarButton>
      <ToolbarButton
        tooltip="Redo (Ctrl+Y)"
        onClick={redo}
        disabled={!canRedo()}
      >
        <Redo2 size={16} />
      </ToolbarButton>
      <Divider />

      <ToolbarButton
        tooltip="Copy (Ctrl+C)"
        onClick={copySelected}
        disabled={!hasSelection}
      >
        <Copy size={16} />
      </ToolbarButton>
      <ToolbarButton
        tooltip="Paste (Ctrl+V)"
        onClick={paste}
        disabled={!clipboard?.nodes?.length}
      >
        <ClipboardPaste size={16} />
      </ToolbarButton>
      <ToolbarButton
        tooltip="Delete selected (Del)"
        onClick={deleteSelected}
        disabled={!hasSelection}
        danger
      >
        <Trash2 size={16} />
      </ToolbarButton>
      <Divider />

      {/* Edge type */}
      <div className="relative shrink-0">
        <button
          onClick={() => setEdgeDropdown((v) => !v)}
          className="flex items-center gap-1 h-8 px-2 rounded-lg text-xs font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <ScanLine size={14} />
          <span>
            {EDGE_TYPES.find((e) => e.value === edgeType)?.label || "Edge"}
          </span>
          <ChevronDown size={12} />
        </button>
        {edgeDropdown && (
          <div className="absolute top-9 left-0 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg py-1 z-50 min-w-[110px]">
            {EDGE_TYPES.map((et) => (
              <button
                key={et.value}
                onClick={() => {
                  setEdgeType(et.value);
                  setEdgeDropdown(false);
                }}
                className={`w-full text-left px-3 py-1.5 text-xs hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${
                  edgeType === et.value
                    ? "text-primary-600 dark:text-primary-400 font-medium"
                    : "text-gray-700 dark:text-gray-300"
                }`}
              >
                {et.label}
              </button>
            ))}
          </div>
        )}
      </div>
      <Divider />

      <ToolbarButton
        tooltip="Toggle grid"
        active={showGrid}
        onClick={toggleGrid}
      >
        <Grid3X3 size={16} />
      </ToolbarButton>
      <ToolbarButton
        tooltip="Toggle minimap"
        active={showMinimap}
        onClick={toggleMinimap}
      >
        <Map size={16} />
      </ToolbarButton>
      <ToolbarButton
        tooltip="Snap to grid"
        active={snapToGrid}
        onClick={toggleSnapToGrid}
      >
        <Magnet size={16} />
      </ToolbarButton>

      <div className="flex-1" />

      {/* Theme toggle */}
      <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-lg p-0.5 gap-0.5 shrink-0">
        {THEMES.map(({ value, icon: Icon, title }) => (
          <button
            key={value}
            onClick={() => setTheme(value)}
            title={title}
            className={`flex items-center justify-center w-7 h-7 rounded-md transition-all ${
              theme === value
                ? "bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 shadow-sm"
                : "text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
            }`}
          >
            <Icon size={13} />
          </button>
        ))}
      </div>

      <Divider />
      <ToolbarButton tooltip="Download diagram" onClick={handleDownload}>
        <Download size={16} />
      </ToolbarButton>
      <ToolbarButton tooltip="Upload diagram">
        <label className="cursor-pointer">
          <Upload size={16} />
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            className="hidden"
            onChange={handleUpload}
          />
        </label>
      </ToolbarButton>
    </div>
  );
}
