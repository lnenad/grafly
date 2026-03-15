import { useRef, useState, useEffect } from "react";
import { createPortal } from "react-dom";
import diagramFormatRaw from "../../GRAFLY_DIAGRAM_FORMAT.md?raw";
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
  FileJson,
  ChevronDown,
  ScanLine,
  Sun,
  Moon,
  Monitor,
  X,
  Sparkles,
  Check,
  Copy as CopyIcon,
  Info,
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
    gridSize,
    toggleMinimap,
    toggleGrid,
    toggleSnapToGrid,
    setGridSize,
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
  const [jsonModal, setJsonModal] = useState(false);
  const [jsonText, setJsonText] = useState("");
  const [jsonError, setJsonError] = useState("");
  const [aiModal, setAiModal] = useState(false);
  const [aboutModal, setAboutModal] = useState(() => !localStorage.getItem('grafly_visited'));

  const closeAbout = () => {
    localStorage.setItem('grafly_visited', '1');
    setAboutModal(false);
  };
  const [copied, setCopied] = useState(false);

  const copyDocs = () => {
    navigator.clipboard.writeText(diagramFormatRaw).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const openJsonModal = () => {
    setJsonText("");
    setJsonError("");
    setJsonModal(true);
  };

  const importJson = () => {
    try {
      const data = JSON.parse(jsonText.trim());
      if (!data.nodes || !data.edges) throw new Error('Missing required fields: "nodes" and "edges"');
      loadFromData(data);
      setJsonModal(false);
    } catch (e) {
      setJsonError(e.message);
    }
  };

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
      <ToolbarButton tooltip="Import from JSON" onClick={openJsonModal}>
        <FileJson size={16} />
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
      <select
        value={gridSize}
        onChange={(e) => setGridSize(Number(e.target.value))}
        data-tooltip="Grid size"
        className="h-7 px-1 rounded-lg text-xs text-gray-600 dark:text-gray-400 bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800 border-none outline-none cursor-pointer transition-colors"
      >
        {[8, 12, 16, 24, 32].map((s) => (
          <option key={s} value={s}>{s}px</option>
        ))}
      </select>
      <button
        onClick={() => setAiModal(true)}
        data-tooltip="AI diagram format reference"
        className="flex items-center gap-1 h-8 px-2.5 rounded-lg text-xs font-semibold transition-all cursor-pointer bg-gradient-to-r from-violet-500 to-indigo-500 text-white hover:from-violet-600 hover:to-indigo-600 shadow-sm shrink-0"
      >
        <Sparkles size={12} />
        AI
      </button>

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
      <Divider />
      <ToolbarButton tooltip="About Grafly" onClick={() => setAboutModal(true)}>
        <Info size={16} />
      </ToolbarButton>

      {/* About modal */}
      {aboutModal && createPortal(
        <div
          className="fixed inset-0 z-[9997] flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.55)" }}
          onMouseDown={(e) => { if (e.target === e.currentTarget) closeAbout() }}
        >
          <div
            className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 flex flex-col overflow-hidden"
            style={{ width: 520, maxHeight: "90vh" }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800 shrink-0">
              <div className="flex items-center gap-2.5">
                <GraflyLogo size={26} className="text-gray-800 dark:text-gray-100" />
                <div>
                  <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">About Grafly</h2>
                  <p className="text-xs text-gray-400 dark:text-gray-500">Free, open-source diagramming</p>
                </div>
              </div>
              <button
                onClick={closeAbout}
                className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <X size={15} />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5 text-xs text-gray-600 dark:text-gray-400 leading-relaxed">

              {/* What is it */}
              <section>
                <h3 className="text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">What is Grafly?</h3>
                <p>
                  Grafly is a free, browser-based diagramming tool for creating flowcharts, system architecture diagrams, AWS and GCP infrastructure maps, and anything in between. No account needed — open the page and start drawing.
                </p>
              </section>

              {/* AI */}
              <section>
                <h3 className="text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">Using AI to generate diagrams</h3>
                <ol className="space-y-1.5 list-decimal list-inside">
                  <li>Click the <span className="inline-flex items-center gap-1 font-medium text-violet-600 dark:text-violet-400"><Sparkles size={10} />AI</span> button in the toolbar to copy the Grafly format reference.</li>
                  <li>Paste it into any LLM (Claude, ChatGPT, Gemini…) along with a description of the diagram you want.</li>
                  <li>Copy the JSON the LLM returns.</li>
                  <li>Click the <span className="font-medium text-gray-700 dark:text-gray-300">Import JSON</span> button (<FileJson size={11} className="inline" />) in the toolbar and paste it in.</li>
                </ol>
                <p className="mt-2 text-gray-400 dark:text-gray-500">The format reference describes every node type, edge property, and shape ID so the LLM can produce valid diagrams without guessing.</p>
              </section>

              {/* Data & Privacy */}
              <section>
                <h3 className="text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">Data & Privacy</h3>
                <p>
                  All diagrams are stored exclusively in your browser's <span className="font-medium text-gray-700 dark:text-gray-300">localStorage</span>. Nothing is sent to any server — Grafly has no backend and no tracking.
                </p>
                <p className="mt-1.5">
                  Clearing your browser's site data will permanently delete your diagrams. Use <span className="font-medium text-gray-700 dark:text-gray-300">Export JSON</span> (<Download size={11} className="inline" />) regularly to back up your work.
                </p>
              </section>

              {/* License */}
              <section>
                <h3 className="text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">License</h3>
                <p>
                  Grafly is open source under the <span className="font-medium text-gray-700 dark:text-gray-300">GNU Affero General Public License v3.0</span> (AGPL-3.0). You are free to use, modify, and self-host it as long as you keep any derivative works open source under the same license.
                </p>
                <p className="mt-1.5">
                  For commercial use without open-sourcing your application, a commercial license is available — reach out via{" "}
                  <a href="https://github.com/lnenad" target="_blank" rel="noopener noreferrer" className="text-primary-500 hover:text-primary-600 dark:text-primary-400 hover:underline">GitHub</a>.
                </p>
              </section>

              {/* Author */}
              <section>
                <h3 className="text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">Made by</h3>
                <a
                  href="https://github.com/lnenad"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 transition-colors text-gray-700 dark:text-gray-300 font-medium"
                >
                  <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor" className="shrink-0">
                    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.63-5.37-12-12-12z"/>
                  </svg>
                  Nenad (lnenad)
                </a>
              </section>

              {/* Sponsor */}
              <section>
                <h3 className="text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">Sponsored by</h3>
                <a
                  href="https://logdot.io"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 transition-colors"
                >
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shrink-0 text-white font-bold text-xs">L</div>
                  <div>
                    <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">LogDot</p>
                    <p className="text-[11px] text-gray-400 dark:text-gray-500">Simple log management & metrics monitoring</p>
                  </div>
                </a>
              </section>

            </div>

            {/* Footer */}
            <div className="px-5 py-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between shrink-0">
              <span className="text-[11px] text-gray-400 dark:text-gray-600">grafly.io · AGPL-3.0</span>
              <button
                onClick={closeAbout}
                className="px-4 py-1.5 text-xs font-medium rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* AI format reference modal */}
      {aiModal && createPortal(
        <div
          className="fixed inset-0 z-[9996] flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.55)" }}
          onMouseDown={(e) => { if (e.target === e.currentTarget) setAiModal(false) }}
        >
          <div
            className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 flex flex-col"
            style={{ width: 720, maxHeight: "85vh" }}
            onKeyDown={(e) => { if (e.key === "Escape") setAiModal(false) }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800 shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center shrink-0">
                  <Sparkles size={13} className="text-white" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Grafly Diagram Format Reference</h2>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">Pass this to an LLM to generate diagrams for Grafly.</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={copyDocs}
                  className={`flex items-center gap-1.5 h-7 px-3 rounded-lg text-xs font-medium transition-all ${
                    copied
                      ? "bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-400"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
                  }`}
                >
                  {copied ? <Check size={12} /> : <CopyIcon size={12} />}
                  {copied ? "Copied!" : "Copy all"}
                </button>
                <button
                  onClick={() => setAiModal(false)}
                  className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <X size={15} />
                </button>
              </div>
            </div>

            {/* Content */}
            <pre
              className="flex-1 overflow-y-auto px-5 py-4 text-xs font-mono text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap break-words select-all"
            >
              {diagramFormatRaw}
            </pre>
          </div>
        </div>,
        document.body
      )}

      {/* JSON import modal */}
      {jsonModal && createPortal(
        <div
          className="fixed inset-0 z-[9995] flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.45)" }}
          onMouseDown={(e) => { if (e.target === e.currentTarget) setJsonModal(false) }}
        >
          <div
            className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 flex flex-col"
            style={{ width: 560, maxHeight: "80vh" }}
            onKeyDown={(e) => { if (e.key === "Escape") setJsonModal(false) }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800">
              <div>
                <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Import from JSON</h2>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                  Paste a Grafly diagram JSON to load it as a new diagram.{" "}
                  <button
                    onClick={() => setAiModal(true)}
                    className="text-violet-500 hover:text-violet-600 dark:text-violet-400 hover:underline inline-flex items-center gap-0.5"
                  >
                    <Sparkles size={10} />
                    View format reference
                  </button>
                </p>
              </div>
              <button
                onClick={() => setJsonModal(false)}
                className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <X size={15} />
              </button>
            </div>

            {/* Textarea */}
            <div className="flex-1 overflow-hidden px-5 py-4">
              <textarea
                autoFocus
                value={jsonText}
                onChange={(e) => { setJsonText(e.target.value); setJsonError("") }}
                placeholder={'{\n  "name": "My Diagram",\n  "nodes": [],\n  "edges": []\n}'}
                spellCheck={false}
                className={`w-full h-64 resize-none text-xs font-mono bg-gray-50 dark:bg-gray-800 border rounded-xl px-3 py-3 outline-none transition-colors text-gray-800 dark:text-gray-200 placeholder-gray-300 dark:placeholder-gray-600 ${
                  jsonError
                    ? "border-red-400 dark:border-red-600 focus:border-red-400"
                    : "border-gray-200 dark:border-gray-700 focus:border-primary-400 dark:focus:border-primary-500"
                }`}
              />
              {jsonError && (
                <p className="mt-2 text-xs text-red-500 dark:text-red-400 flex items-start gap-1.5">
                  <span className="font-semibold shrink-0">Error:</span>
                  <span>{jsonError}</span>
                </p>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-gray-100 dark:border-gray-800">
              <button
                onClick={() => setJsonModal(false)}
                className="px-4 py-1.5 text-xs font-medium rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={importJson}
                disabled={!jsonText.trim()}
                className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-primary-500 text-white hover:bg-primary-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Import
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
