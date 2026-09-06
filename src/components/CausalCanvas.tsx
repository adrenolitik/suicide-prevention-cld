import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  Plus, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Sparkles, 
  Layers, 
  Sliders, 
  X, 
  Trash2, 
  ArrowRight, 
  HelpCircle,
  Maximize2,
  Minimize2,
  Clock
} from 'lucide-react';
import { CausalNode, CausalEdge, CausalLoop, Polarity, NodeType } from '../types';

interface CausalCanvasProps {
  nodes: CausalNode[];
  edges: CausalEdge[];
  loops: CausalLoop[];
  selectedLoopId: string | null;
  onSelectLoop: (loopId: string | null) => void;
  onUpdateNodes: (nodes: CausalNode[]) => void;
  onUpdateEdges: (edges: CausalEdge[]) => void;
  onAddNode: (node: Omit<CausalNode, 'id'>) => void;
  onAddEdge: (edge: Omit<CausalEdge, 'id'>) => void;
}

export const CausalCanvas: React.FC<CausalCanvasProps> = ({
  nodes,
  edges,
  loops,
  selectedLoopId,
  onSelectLoop,
  onUpdateNodes,
  onUpdateEdges,
  onAddNode,
  onAddEdge,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [draggedNodeId, setDraggedNodeId] = useState<string | null>(null);
  const [nodeOffset, setNodeOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Dialogs
  const [showAddNodeModal, setShowAddNodeModal] = useState<boolean>(false);
  const [showAddEdgeModal, setShowAddEdgeModal] = useState<boolean>(false);
  const [newNodeName, setNewNodeName] = useState('');
  const [newNodeType, setNewNodeType] = useState<NodeType>('auxiliary');
  const [newNodeDesc, setNewNodeDesc] = useState('');
  const [newNodeCategory, setNewNodeCategory] = useState('');

  const [newEdgeSource, setNewEdgeSource] = useState('');
  const [newEdgeTarget, setNewEdgeTarget] = useState('');
  const [newEdgePolarity, setNewEdgePolarity] = useState<Polarity>('+');
  const [newEdgeDelay, setNewEdgeDelay] = useState<boolean>(false);
  const [newEdgeRationale, setNewEdgeRationale] = useState('');

  // Selected loop details
  const activeLoop = useMemo(() => {
    return loops.find((l) => l.id === selectedLoopId) || null;
  }, [loops, selectedLoopId]);

  const activeLoopNodeSet = useMemo(() => {
    return new Set(activeLoop?.nodeIds || []);
  }, [activeLoop]);

  const activeLoopEdgeSet = useMemo(() => {
    return new Set(activeLoop?.edgeIds || []);
  }, [activeLoop]);

  // Selected node details
  const selectedNode = useMemo(() => {
    return nodes.find((n) => n.id === selectedNodeId) || null;
  }, [nodes, selectedNodeId]);

  // Selected edge details
  const selectedEdge = useMemo(() => {
    return edges.find((e) => e.id === selectedEdgeId) || null;
  }, [edges, selectedEdgeId]);

  // Handle Canvas Zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.08 : 0.92;
    setZoom((prev) => Math.min(2.5, Math.max(0.4, prev * zoomFactor)));
  };

  // Dragging Nodes
  const handleNodeMouseDown = (e: React.MouseEvent, node: CausalNode) => {
    e.stopPropagation();
    setDraggedNodeId(node.id);
    setSelectedNodeId(node.id);
    setSelectedEdgeId(null);
    const rect = containerRef.current?.getBoundingClientRect();
    if (rect) {
      setNodeOffset({
        x: (e.clientX - rect.left - pan.x) / zoom - (node.x || 300),
        y: (e.clientY - rect.top - pan.y) / zoom - (node.y || 200),
      });
    }
  };

  // Canvas Pan
  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    if (e.target === containerRef.current || (e.target as HTMLElement).tagName === 'svg') {
      setIsPanning(true);
      setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
      setSelectedNodeId(null);
      setSelectedEdgeId(null);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (draggedNodeId) {
      const rect = containerRef.current?.getBoundingClientRect();
      if (rect) {
        const mouseX = (e.clientX - rect.left - pan.x) / zoom;
        const mouseY = (e.clientY - rect.top - pan.y) / zoom;
        const newX = mouseX - nodeOffset.x;
        const newY = mouseY - nodeOffset.y;

        onUpdateNodes(
          nodes.map((n) => (n.id === draggedNodeId ? { ...n, x: Math.round(newX), y: Math.round(newY) } : n))
        );
      }
    } else if (isPanning) {
      setPan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  };

  const handleMouseUp = () => {
    setDraggedNodeId(null);
    setIsPanning(false);
  };

  // Calculate Loop Centers for floating loop symbols [R1], [B1]
  const loopCenters = useMemo(() => {
    const nodeMap = new Map<string, CausalNode>(nodes.map((n) => [n.id, n]));
    return loops.map((loop) => {
      let sumX = 0;
      let sumY = 0;
      let count = 0;
      loop.nodeIds.forEach((nid) => {
        const node = nodeMap.get(nid);
        if (node && node.x !== undefined && node.y !== undefined) {
          sumX += node.x;
          sumY += node.y;
          count++;
        }
      });
      return {
        loop,
        x: count > 0 ? sumX / count + 60 : 400,
        y: count > 0 ? sumY / count + 30 : 250,
      };
    });
  }, [loops, nodes]);

  // Helper for curved bezier path between two nodes
  const getEdgePath = (sourceNode: CausalNode, targetNode: CausalNode, edgeId: string) => {
    const sx = (sourceNode.x || 300) + 70;
    const sy = (sourceNode.y || 200) + 30;
    const tx = (targetNode.x || 500) + 70;
    const ty = (targetNode.y || 200) + 30;

    const dx = tx - sx;
    const dy = ty - sy;
    const dist = Math.sqrt(dx * dx + dy * dy) || 1;

    // Curved offset perpendicular to line
    const isLoopEdge = activeLoopEdgeSet.has(edgeId);
    const curvature = Math.min(60, Math.max(25, dist * 0.22));
    const nx = -dy / dist;
    const ny = dx / dist;

    // Control point
    const cx = (sx + tx) / 2 + nx * curvature;
    const cy = (sy + ty) / 2 + ny * curvature;

    // Midpoint for polarity label
    const labelX = (sx + 2 * cx + tx) / 4;
    const labelY = (sy + 2 * cy + ty) / 4;

    return {
      d: `M ${sx} ${sy} Q ${cx} ${cy} ${tx} ${ty}`,
      labelX,
      labelY,
      isLoopEdge,
    };
  };

  const handleCreateNode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNodeName.trim()) return;
    onAddNode({
      name: newNodeName.trim(),
      type: newNodeType,
      category: newNodeCategory.trim() || 'Общее',
      description: newNodeDesc.trim() || 'Пользовательская переменная',
      initialValue: 50,
      x: 300 + Math.random() * 200,
      y: 150 + Math.random() * 200,
    });
    setNewNodeName('');
    setNewNodeDesc('');
    setNewNodeCategory('');
    setShowAddNodeModal(false);
  };

  const handleCreateEdge = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEdgeSource || !newEdgeTarget || newEdgeSource === newEdgeTarget) return;
    onAddEdge({
      source: newEdgeSource,
      target: newEdgeTarget,
      polarity: newEdgePolarity,
      strength: 'moderate',
      weight: 0.7,
      delay: newEdgeDelay,
      delayDuration: newEdgeDelay ? '1-3 периода' : undefined,
      rationale: newEdgeRationale.trim() || 'Причинное влияние между переменными',
    });
    setNewEdgeSource('');
    setNewEdgeTarget('');
    setNewEdgeRationale('');
    setNewEdgeDelay(false);
    setShowAddEdgeModal(false);
  };

  const handleDeleteNode = (id: string) => {
    onUpdateNodes(nodes.filter((n) => n.id !== id));
    onUpdateEdges(edges.filter((e) => e.source !== id && e.target !== id));
    setSelectedNodeId(null);
  };

  const handleDeleteEdge = (id: string) => {
    onUpdateEdges(edges.filter((e) => e.id !== id));
    setSelectedEdgeId(null);
  };

  return (
    <div className="relative w-full h-[calc(100vh-4rem)] bg-slate-950 overflow-hidden flex flex-col select-none">
      {/* Top Diagram Controls & Loop Pills Bar */}
      <div className="bg-slate-900/90 backdrop-blur border-b border-slate-800 px-4 py-2.5 z-20 flex flex-wrap items-center justify-between gap-3 shadow-md">
        {/* Loop Selector Pills */}
        <div className="flex items-center space-x-2 overflow-x-auto py-1 max-w-full">
          <span className="text-xs font-semibold text-slate-400 whitespace-nowrap flex items-center space-x-1">
            <Layers className="w-3.5 h-3.5 text-indigo-400" />
            <span>Петли обратной связи:</span>
          </span>

          <button
            onClick={() => onSelectLoop(null)}
            className={`px-2.5 py-1 text-xs rounded-full font-medium transition-all cursor-pointer whitespace-nowrap ${
              selectedLoopId === null
                ? 'bg-slate-700 text-white shadow-sm border border-slate-600'
                : 'bg-slate-800/80 text-slate-400 hover:text-slate-200 border border-slate-700/50'
            }`}
          >
            Все связи
          </button>

          {loops.map((loop) => {
            const isR = loop.type === 'reinforcing';
            const isSelected = selectedLoopId === loop.id;
            return (
              <button
                key={loop.id}
                onClick={() => onSelectLoop(isSelected ? null : loop.id)}
                className={`px-3 py-1 text-xs rounded-full font-medium flex items-center space-x-1.5 transition-all cursor-pointer whitespace-nowrap ${
                  isSelected
                    ? isR
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/20 ring-2 ring-emerald-400'
                      : 'bg-amber-600 text-white shadow-md shadow-amber-500/20 ring-2 ring-amber-400'
                    : isR
                    ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-800/60 hover:bg-emerald-900/50'
                    : 'bg-amber-950/60 text-amber-300 border border-amber-800/60 hover:bg-amber-900/50'
                }`}
              >
                <span className="font-bold font-mono">{loop.id}</span>
                <span className="truncate max-w-[150px]">{loop.name.split(':')[1] || loop.name}</span>
                <span className="text-[10px] opacity-75">
                  ({isR ? '+' : '-'})
                </span>
              </button>
            );
          })}
        </div>

        {/* Action Buttons: Add Node, Add Edge, Zoom */}
        <div className="flex items-center space-x-2">
          <button
            id="btn-add-node"
            onClick={() => setShowAddNodeModal(true)}
            className="flex items-center space-x-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs px-2.5 py-1.5 rounded-lg border border-slate-700 transition cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-indigo-400" />
            <span>Переменная</span>
          </button>

          <button
            id="btn-add-edge"
            onClick={() => setShowAddEdgeModal(true)}
            className="flex items-center space-x-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs px-2.5 py-1.5 rounded-lg border border-slate-700 transition cursor-pointer"
          >
            <ArrowRight className="w-3.5 h-3.5 text-cyan-400" />
            <span>Связь</span>
          </button>

          <div className="flex items-center bg-slate-800/80 rounded-lg border border-slate-700/60 p-0.5">
            <button
              onClick={() => setZoom((z) => Math.min(2.5, z * 1.15))}
              className="p-1 hover:bg-slate-700 text-slate-300 rounded transition cursor-pointer"
              title="Приблизить"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setZoom((z) => Math.max(0.4, z * 0.85))}
              className="p-1 hover:bg-slate-700 text-slate-300 rounded transition cursor-pointer"
              title="Отдалить"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => {
                setZoom(1);
                setPan({ x: 0, y: 0 });
              }}
              className="p-1 hover:bg-slate-700 text-slate-300 rounded transition cursor-pointer"
              title="Сбросить масштаб"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Canvas Stage */}
      <div
        ref={containerRef}
        onWheel={handleWheel}
        onMouseDown={handleCanvasMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        className="relative flex-1 w-full h-full cursor-grab active:cursor-grabbing overflow-hidden bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px]"
      >
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: '0 0',
          }}
        >
          <defs>
            {/* Standard Arrow Marker */}
            <marker
              id="arrow-default"
              viewBox="0 0 10 10"
              refX="18"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 1.5 L 10 5 L 0 8.5 z" fill="#64748b" />
            </marker>

            {/* Positive Arrow Marker */}
            <marker
              id="arrow-positive"
              viewBox="0 0 10 10"
              refX="18"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 1.5 L 10 5 L 0 8.5 z" fill="#38bdf8" />
            </marker>

            {/* Negative Arrow Marker */}
            <marker
              id="arrow-negative"
              viewBox="0 0 10 10"
              refX="18"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 1.5 L 10 5 L 0 8.5 z" fill="#f43f5e" />
            </marker>

            {/* Highlighted Loop Arrow Marker */}
            <marker
              id="arrow-highlight"
              viewBox="0 0 10 10"
              refX="18"
              refY="5"
              markerWidth="7"
              markerHeight="7"
              orient="auto-start-reverse"
            >
              <path d="M 0 1 L 10 5 L 0 9 z" fill="#10b981" />
            </marker>

            {/* Glow Filter for Active Loop */}
            <filter id="loop-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Render Causal Edges */}
          {edges.map((edge) => {
            const sourceNode = nodes.find((n) => n.id === edge.source);
            const targetNode = nodes.find((n) => n.id === edge.target);
            if (!sourceNode || !targetNode) return null;

            const { d, labelX, labelY, isLoopEdge } = getEdgePath(sourceNode, targetNode, edge.id);
            const isSelected = selectedEdgeId === edge.id;
            const isPositive = edge.polarity === '+';

            const strokeColor = isLoopEdge
              ? activeLoop?.type === 'reinforcing'
                ? '#10b981'
                : '#f59e0b'
              : isSelected
              ? '#818cf8'
              : isPositive
              ? '#38bdf8'
              : '#f43f5e';

            const markerId = isLoopEdge
              ? 'url(#arrow-highlight)'
              : isPositive
              ? 'url(#arrow-positive)'
              : 'url(#arrow-negative)';

            return (
              <g key={edge.id} className="pointer-events-auto cursor-pointer">
                {/* Thick invisible path for easy clicking */}
                <path
                  d={d}
                  fill="none"
                  stroke="transparent"
                  strokeWidth="24"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedEdgeId(edge.id);
                    setSelectedNodeId(null);
                  }}
                />

                {/* Visible Edge Line */}
                <path
                  d={d}
                  fill="none"
                  stroke={strokeColor}
                  strokeWidth={isLoopEdge ? 3.5 : isSelected ? 3 : 2}
                  strokeDasharray={edge.delay ? '6,4' : undefined}
                  markerEnd={markerId}
                  filter={isLoopEdge ? 'url(#loop-glow)' : undefined}
                  className={`transition-all ${isLoopEdge ? 'animate-pulse' : ''}`}
                />

                {/* Delay Hash Marks (||) if edge has time lag */}
                {edge.delay && (
                  <g transform={`translate(${labelX - 12}, ${labelY - 12})`}>
                    <rect x="0" y="0" width="24" height="24" rx="4" fill="#0f172a" stroke="#64748b" strokeWidth="1" />
                    <line x1="8" y1="5" x2="8" y2="19" stroke="#94a3b8" strokeWidth="2.5" />
                    <line x1="16" y1="5" x2="16" y2="19" stroke="#94a3b8" strokeWidth="2.5" />
                  </g>
                )}

                {/* Polarity Sign Pill (+ / -) */}
                <g
                  transform={`translate(${edge.delay ? labelX + 16 : labelX}, ${labelY})`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedEdgeId(edge.id);
                    setSelectedNodeId(null);
                  }}
                >
                  <circle
                    r="10"
                    fill={isPositive ? '#0369a1' : '#be123c'}
                    stroke={isPositive ? '#38bdf8' : '#f43f5e'}
                    strokeWidth="1.5"
                    className="shadow-sm"
                  />
                  <text
                    textAnchor="middle"
                    dominantBaseline="central"
                    fill="#ffffff"
                    fontSize="12"
                    fontWeight="bold"
                    fontFamily="monospace"
                  >
                    {edge.polarity}
                  </text>
                </g>
              </g>
            );
          })}

          {/* Render Loop Center Markers [R1], [B1] */}
          {loopCenters.map(({ loop, x, y }) => {
            const isR = loop.type === 'reinforcing';
            const isSelected = selectedLoopId === loop.id;

            return (
              <g
                key={loop.id}
                transform={`translate(${x}, ${y})`}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectLoop(isSelected ? null : loop.id);
                }}
                className="cursor-pointer pointer-events-auto"
              >
                <circle
                  r="20"
                  fill={isR ? (isSelected ? '#059669' : '#064e3b') : isSelected ? '#d97706' : '#78350f'}
                  stroke={isR ? '#34d399' : '#fbbf24'}
                  strokeWidth={isSelected ? '3' : '1.5'}
                  filter="url(#loop-glow)"
                />
                {/* Circular Loop Arrow icon representation */}
                <text
                  textAnchor="middle"
                  dominantBaseline="central"
                  fill="#ffffff"
                  fontSize="12"
                  fontWeight="bold"
                  fontFamily="sans-serif"
                >
                  {loop.id}
                </text>
                <text
                  y="28"
                  textAnchor="middle"
                  fill={isR ? '#6ee7b7' : '#fde68a'}
                  fontSize="10"
                  fontWeight="600"
                >
                  {isR ? 'Reinforcing' : 'Balancing'}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Render HTML Causal Nodes */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: '0 0',
          }}
        >
          {nodes.map((node) => {
            const isSelected = selectedNodeId === node.id;
            const inActiveLoop = activeLoopNodeSet.has(node.id);
            const isStock = node.type === 'stock';
            const isFlow = node.type === 'flow';

            return (
              <div
                key={node.id}
                onMouseDown={(e) => handleNodeMouseDown(e, node)}
                style={{
                  left: `${node.x || 300}px`,
                  top: `${node.y || 200}px`,
                  width: '160px',
                }}
                className={`absolute pointer-events-auto rounded-xl p-2.5 transition-shadow cursor-grab active:cursor-grabbing border ${
                  inActiveLoop
                    ? 'ring-2 ring-emerald-400 shadow-lg shadow-emerald-500/20 bg-slate-900 border-emerald-500'
                    : isSelected
                    ? 'ring-2 ring-indigo-400 shadow-lg shadow-indigo-500/30 bg-slate-900 border-indigo-500'
                    : 'bg-slate-900/95 hover:bg-slate-850 border-slate-700/80 shadow-md'
                }`}
              >
                {/* Header: Category & Type Badge */}
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-medium text-slate-400 truncate max-w-[90px]">
                    {node.category || 'Система'}
                  </span>
                  <span
                    className={`text-[9px] uppercase px-1.5 py-0.5 rounded font-mono font-bold ${
                      isStock
                        ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                        : isFlow
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                    }`}
                  >
                    {node.type}
                  </span>
                </div>

                {/* Node Name */}
                <div className="text-xs font-bold text-slate-100 leading-tight mb-2 line-clamp-2">
                  {node.name}
                </div>

                {/* Footer: Value & Leverage indicator */}
                <div className="flex items-center justify-between pt-1.5 border-t border-slate-800/80">
                  <div className="text-[11px] font-mono text-slate-300 font-medium">
                    {node.initialValue} <span className="text-[9px] text-slate-500">{node.unit || ''}</span>
                  </div>

                  {node.isLeveragePoint && (
                    <div
                      title="Точка воздействия (Leverage Point)"
                      className="flex items-center space-x-1 text-[10px] text-amber-400 font-semibold px-1.5 py-0.2 rounded bg-amber-500/10 border border-amber-500/30"
                    >
                      <Sparkles className="w-2.5 h-2.5 text-amber-400" />
                      <span>L{node.leverageScore || 8}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Floating Active Loop Inspector (Bottom Overlay) */}
      {activeLoop && (
        <div className="absolute bottom-4 left-4 right-4 md:right-auto md:max-w-md bg-slate-900/95 backdrop-blur-md border border-slate-700 rounded-2xl p-4 shadow-2xl z-30">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-2">
              <span
                className={`text-xs font-bold font-mono px-2 py-0.5 rounded-full ${
                  activeLoop.type === 'reinforcing'
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                    : 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                }`}
              >
                {activeLoop.id} ({activeLoop.type === 'reinforcing' ? 'Усиление' : 'Балансирование'})
              </span>
              <h4 className="text-sm font-bold text-white truncate">{activeLoop.name}</h4>
            </div>
            <button
              onClick={() => onSelectLoop(null)}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="text-xs text-slate-300 mt-2 leading-relaxed">
            {activeLoop.description}
          </p>

          <div className="mt-2.5 pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
            <span>Знак полярности:</span>
            <span className="font-mono text-indigo-300 font-semibold">{activeLoop.polarityReasoning}</span>
          </div>
        </div>
      )}

      {/* Selected Node Details Drawer */}
      {selectedNode && (
        <div className="absolute top-16 right-4 w-80 bg-slate-900/95 backdrop-blur-md border border-slate-700 rounded-2xl p-4 shadow-2xl z-30">
          <div className="flex items-start justify-between mb-2">
            <div>
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300">
                {selectedNode.type}
              </span>
              <h3 className="text-sm font-bold text-white mt-1">{selectedNode.name}</h3>
            </div>
            <button
              onClick={() => setSelectedNodeId(null)}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="text-xs text-slate-300 mb-3 leading-relaxed">
            {selectedNode.description}
          </p>

          <div className="space-y-2 text-xs border-t border-slate-800 pt-2 mb-3">
            <div className="flex justify-between text-slate-400">
              <span>Базовое значение:</span>
              <span className="font-mono text-slate-200 font-bold">
                {selectedNode.initialValue} {selectedNode.unit || ''}
              </span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Сила системного рычага:</span>
              <span className="font-mono text-amber-400 font-bold">
                {selectedNode.leverageScore || 5} / 10
              </span>
            </div>
          </div>

          {/* Incoming & Outgoing Causal Links */}
          <div className="text-[11px] space-y-2 border-t border-slate-800 pt-2">
            <div>
              <span className="font-semibold text-slate-400">Входящие причины (Причины):</span>
              <div className="mt-1 space-y-1">
                {edges
                  .filter((e) => e.target === selectedNode.id)
                  .map((e) => {
                    const src = nodes.find((n) => n.id === e.source);
                    return (
                      <div key={e.id} className="flex items-center space-x-1 text-slate-300 bg-slate-800/60 p-1 rounded">
                        <span className="font-mono font-bold text-cyan-400">[{e.polarity}]</span>
                        <span className="truncate">{src?.name || e.source}</span>
                      </div>
                    );
                  })}
              </div>
            </div>

            <div>
              <span className="font-semibold text-slate-400">Исходящие эффекты (Следствия):</span>
              <div className="mt-1 space-y-1">
                {edges
                  .filter((e) => e.source === selectedNode.id)
                  .map((e) => {
                    const tgt = nodes.find((n) => n.id === e.target);
                    return (
                      <div key={e.id} className="flex items-center space-x-1 text-slate-300 bg-slate-800/60 p-1 rounded">
                        <span className="font-mono font-bold text-rose-400">[{e.polarity}]</span>
                        <span className="truncate">{tgt?.name || e.target}</span>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>

          <div className="mt-4 pt-2 border-t border-slate-800 flex justify-end">
            <button
              onClick={() => handleDeleteNode(selectedNode.id)}
              className="flex items-center space-x-1 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 px-2.5 py-1.5 rounded-lg transition"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Удалить узел</span>
            </button>
          </div>
        </div>
      )}

      {/* Selected Edge Details Drawer */}
      {selectedEdge && (
        <div className="absolute top-16 right-4 w-80 bg-slate-900/95 backdrop-blur-md border border-slate-700 rounded-2xl p-4 shadow-2xl z-30">
          <div className="flex items-start justify-between mb-2">
            <div>
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300">
                Причинно-следственная связь
              </span>
              <h3 className="text-sm font-bold text-white mt-1">
                {nodes.find((n) => n.id === selectedEdge.source)?.name} →{' '}
                {nodes.find((n) => n.id === selectedEdge.target)?.name}
              </h3>
            </div>
            <button
              onClick={() => setSelectedEdgeId(null)}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-2 text-xs border-t border-slate-800 pt-2 mb-3">
            <div className="flex justify-between text-slate-400">
              <span>Знак полярности:</span>
              <span className={`font-mono font-bold ${selectedEdge.polarity === '+' ? 'text-cyan-400' : 'text-rose-400'}`}>
                {selectedEdge.polarity === '+' ? '(+) Прямопропорциональная' : '(-) Обратнопропорциональная'}
              </span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Сила влияния:</span>
              <span className="font-mono text-slate-200 capitalize">{selectedEdge.strength}</span>
            </div>
            {selectedEdge.delay && (
              <div className="flex justify-between text-slate-400">
                <span>Временной лаг (Delay):</span>
                <span className="font-mono text-amber-400">{selectedEdge.delayDuration || 'Да'}</span>
              </div>
            )}
          </div>

          <div className="text-xs text-slate-300 bg-slate-800/80 p-2.5 rounded-xl border border-slate-700 mb-3">
            <div className="font-semibold text-slate-400 text-[11px] mb-1">Научный механизм:</div>
            {selectedEdge.rationale}
          </div>

          <div className="flex justify-end">
            <button
              onClick={() => handleDeleteEdge(selectedEdge.id)}
              className="flex items-center space-x-1 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 px-2.5 py-1.5 rounded-lg transition"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Удалить связь</span>
            </button>
          </div>
        </div>
      )}

      {/* Modal: Add Node */}
      {showAddNodeModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md p-5 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-white">Добавить системную переменную</h3>
              <button onClick={() => setShowAddNodeModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateNode} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Название переменной</label>
                <input
                  type="text"
                  required
                  placeholder="напр., Доверие к бренду или Объем запасов"
                  value={newNodeName}
                  onChange={(e) => setNewNodeName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Тип переменной</label>
                  <select
                    value={newNodeType}
                    onChange={(e) => setNewNodeType(e.target.value as NodeType)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                  >
                    <option value="auxiliary">Auxiliary (Вспомогательная)</option>
                    <option value="stock">Stock (Накопитель/Фонд)</option>
                    <option value="flow">Flow (Поток/Темп)</option>
                    <option value="exogenous">Exogenous (Внешняя)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Категория / Сектор</label>
                  <input
                    type="text"
                    placeholder="напр., Экономика"
                    value={newNodeCategory}
                    onChange={(e) => setNewNodeCategory(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Научное описание / Формула</label>
                <textarea
                  rows={2}
                  placeholder="Опишите, что выражает данный показатель в системе"
                  value={newNodeDesc}
                  onChange={(e) => setNewNodeDesc(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddNodeModal(false)}
                  className="px-3 py-1.5 text-xs text-slate-400 hover:text-slate-200"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium rounded-lg shadow-sm"
                >
                  Создать
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Edge */}
      {showAddEdgeModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md p-5 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-white">Добавить причинную связь</h3>
              <button onClick={() => setShowAddEdgeModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateEdge} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Причина (Откуда)</label>
                  <select
                    required
                    value={newEdgeSource}
                    onChange={(e) => setNewEdgeSource(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                  >
                    <option value="">Выберите причину...</option>
                    {nodes.map((n) => (
                      <option key={n.id} value={n.id}>
                        {n.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Следствие (Куда)</label>
                  <select
                    required
                    value={newEdgeTarget}
                    onChange={(e) => setNewEdgeTarget(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                  >
                    <option value="">Выберите следствие...</option>
                    {nodes.map((n) => (
                      <option key={n.id} value={n.id}>
                        {n.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Полярность связи</label>
                  <select
                    value={newEdgePolarity}
                    onChange={(e) => setNewEdgePolarity(e.target.value as Polarity)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                  >
                    <option value="+">(+) Прямая (рост → рост)</option>
                    <option value="-">(-) Обратная (рост → падение)</option>
                  </select>
                </div>

                <div className="flex items-center space-x-2 pt-6">
                  <input
                    type="checkbox"
                    id="delay-check"
                    checked={newEdgeDelay}
                    onChange={(e) => setNewEdgeDelay(e.target.checked)}
                    className="rounded bg-slate-800 border-slate-700 text-indigo-600 focus:ring-0"
                  />
                  <label htmlFor="delay-check" className="text-xs text-slate-300 flex items-center space-x-1 cursor-pointer">
                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                    <span>Временной лаг (||)</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Научное обоснование связи</label>
                <textarea
                  rows={2}
                  placeholder="Объясните механизм, почему изменение причины влияет на следствие"
                  value={newEdgeRationale}
                  onChange={(e) => setNewEdgeRationale(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddEdgeModal(false)}
                  className="px-3 py-1.5 text-xs text-slate-400 hover:text-slate-200"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium rounded-lg shadow-sm"
                >
                  Сохранить связь
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
