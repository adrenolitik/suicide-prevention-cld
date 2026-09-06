import React, { useState, useMemo } from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  ReferenceLine 
} from 'recharts';
import { 
  Play, 
  RotateCcw, 
  Plus, 
  Trash2, 
  Activity, 
  AlertTriangle, 
  CheckCircle2, 
  Zap, 
  TrendingUp,
  Info
} from 'lucide-react';
import { CausalNode, CausalEdge, Intervention, SimulationResult } from '../types';
import { runDynamicSimulation } from '../utils/causalEngine';

interface SimulationPanelProps {
  nodes: CausalNode[];
  edges: CausalEdge[];
  interventions: Intervention[];
  onUpdateInterventions: (interventions: Intervention[]) => void;
}

const LINE_COLORS = [
  '#38bdf8', '#818cf8', '#f43f5e', '#34d399', '#fbbf24', 
  '#a855f7', '#f97316', '#22d3ee', '#ec4899', '#84cc16'
];

export const SimulationPanel: React.FC<SimulationPanelProps> = ({
  nodes,
  edges,
  interventions,
  onUpdateInterventions,
}) => {
  const [timeSteps, setTimeSteps] = useState<number>(60);
  const [selectedNodeIds, setSelectedNodeIds] = useState<string[]>(
    nodes.slice(0, 5).map((n) => n.id)
  );

  // New intervention state
  const [targetNodeId, setTargetNodeId] = useState<string>(nodes[0]?.id || '');
  const [deltaPercent, setDeltaPercent] = useState<number>(30);
  const [startStep, setStartStep] = useState<number>(10);
  const [duration, setDuration] = useState<number>(20);
  const [invType, setInvType] = useState<'step' | 'pulse' | 'linear'>('step');

  // Run simulation
  const simResult: SimulationResult = useMemo(() => {
    return runDynamicSimulation(nodes, edges, interventions, timeSteps);
  }, [nodes, edges, interventions, timeSteps]);

  // Transform data for recharts
  const chartData = useMemo(() => {
    return simResult.steps.map((t) => {
      const point: Record<string, any> = { step: t };
      nodes.forEach((n) => {
        point[n.id] = simResult.timeSeries[n.id]?.[t] ?? n.initialValue;
      });
      return point;
    });
  }, [simResult, nodes]);

  const handleAddIntervention = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetNodeId) return;
    const node = nodes.find((n) => n.id === targetNodeId);
    const newInv: Intervention = {
      id: 'inv-' + Date.now(),
      nodeId: targetNodeId,
      name: `${node?.name || targetNodeId} (${deltaPercent > 0 ? '+' : ''}${deltaPercent}%)`,
      deltaPercent,
      startStep,
      duration,
      type: invType,
    };
    onUpdateInterventions([...interventions, newInv]);
  };

  const handleRemoveIntervention = (id: string) => {
    onUpdateInterventions(interventions.filter((i) => i.id !== id));
  };

  const toggleNodeSelection = (id: string) => {
    if (selectedNodeIds.includes(id)) {
      if (selectedNodeIds.length > 1) {
        setSelectedNodeIds(selectedNodeIds.filter((nid) => nid !== id));
      }
    } else {
      setSelectedNodeIds([...selectedNodeIds, id]);
    }
  };

  const stabilityMeta = {
    stable_equilibrium: {
      label: 'Устойчивое динамическое равновесие',
      badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
      icon: CheckCircle2,
      desc: 'Балансирующие контуры (B) успешно гасят внешние возмущения.',
    },
    runaway_growth: {
      label: 'Лавинообразный рост / Неустойчивость',
      badge: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
      icon: AlertTriangle,
      desc: 'Доминирование усиливающих петель (R) приводит к взрывному росту или коллапсу системы.',
    },
    damped_oscillation: {
      label: 'Затухающие колебания',
      badge: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
      icon: Activity,
      desc: 'Временные лаги вызывают колебания, которые постепенно стабилизируются.',
    },
    cyclical_oscillation: {
      label: 'Периодические автоколебания',
      badge: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
      icon: TrendingUp,
      desc: 'Система вошла в фазу устойчивых циклов (бум-спад / маятник).',
    },
    collapse: {
      label: 'Системный коллапс',
      badge: 'bg-rose-900/40 text-rose-300 border-rose-700',
      icon: AlertTriangle,
      desc: 'Показатели вышли за допустимые пределы выживаемости системы.',
    },
  }[simResult.systemStability] || {
    label: 'Сложная динамика',
    badge: 'bg-slate-700 text-slate-300 border-slate-600',
    icon: Info,
    desc: 'Многофакторный отклик.',
  };

  const StabilityIcon = stabilityMeta.icon;

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Top Banner: Stability Diagnosis & Controls */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <span className={`flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${stabilityMeta.badge}`}>
              <StabilityIcon className="w-4 h-4" />
              <span>{stabilityMeta.label}</span>
            </span>
            <span className="text-xs font-mono text-slate-400">
              Горизонт: {timeSteps} шагов
            </span>
          </div>
          <p className="text-xs text-slate-300 mt-2">
            {stabilityMeta.desc}
          </p>
        </div>

        <div className="flex items-center space-x-3 w-full md:w-auto">
          <div className="flex items-center space-x-2 bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-700 text-xs text-slate-300">
            <span>Шаги:</span>
            {[30, 60, 100].map((steps) => (
              <button
                key={steps}
                onClick={() => setTimeSteps(steps)}
                className={`px-2 py-0.5 rounded font-mono transition ${
                  timeSteps === steps ? 'bg-indigo-600 text-white font-bold' : 'hover:bg-slate-700 text-slate-400'
                }`}
              >
                {steps}
              </button>
            ))}
          </div>

          <button
            onClick={() => onUpdateInterventions([])}
            className="flex items-center space-x-1.5 text-xs text-slate-400 hover:text-slate-200 bg-slate-800 hover:bg-slate-700 px-3 py-2 rounded-xl border border-slate-700 transition cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Сбросить шоки</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Chart + Variable Toggles */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Time Series Chart */}
        <div className="lg:col-span-3 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                <Activity className="w-4 h-4 text-indigo-400" />
                <span>Динамические траектории переменных во времени (t)</span>
              </h3>
              <p className="text-xs text-slate-400">
                Численное интегрирование дифференциальных связей с насыщением и временными лагами
              </p>
            </div>
          </div>

          {/* Recharts Canvas */}
          <div className="w-full h-80 sm:h-96">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis 
                  dataKey="step" 
                  stroke="#64748b" 
                  fontSize={11} 
                  tickLine={false}
                  label={{ value: 'Время (шаги t)', position: 'insideBottomRight', offset: -5, fill: '#64748b', fontSize: 10 }} 
                />
                <YAxis 
                  stroke="#64748b" 
                  fontSize={11} 
                  tickLine={false} 
                  domain={['auto', 'auto']}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#0f172a', 
                    borderColor: '#334155', 
                    borderRadius: '12px',
                    fontSize: '12px',
                    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)'
                  }}
                  itemStyle={{ padding: '2px 0' }}
                />
                <Legend 
                  verticalAlign="top" 
                  height={36} 
                  wrapperStyle={{ fontSize: '11px', paddingBottom: '10px' }}
                />

                {/* Intervention vertical marker lines */}
                {interventions.map((inv) => (
                  <ReferenceLine
                    key={inv.id}
                    x={inv.startStep}
                    stroke="#f59e0b"
                    strokeDasharray="4 4"
                    label={{
                      value: `Шок: ${inv.name.slice(0, 16)}`,
                      fill: '#fbbf24',
                      fontSize: 10,
                      position: 'top',
                    }}
                  />
                ))}

                {/* Render Selected Node Lines */}
                {nodes
                  .filter((n) => selectedNodeIds.includes(n.id))
                  .map((node, idx) => {
                    const color = LINE_COLORS[idx % LINE_COLORS.length];
                    return (
                      <Line
                        key={node.id}
                        type="monotone"
                        dataKey={node.id}
                        name={node.name}
                        stroke={color}
                        strokeWidth={2.5}
                        dot={false}
                        activeDot={{ r: 5 }}
                      />
                    );
                  })}
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Key Empirical Findings */}
          <div className="mt-4 pt-4 border-t border-slate-800/80 grid grid-cols-1 sm:grid-cols-3 gap-3">
            {simResult.keyFindings.map((finding, idx) => (
              <div key={idx} className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/50 text-xs text-slate-300">
                <span className="font-bold text-indigo-400 block mb-1">Вывод #{idx + 1}:</span>
                {finding}
              </div>
            ))}
          </div>
        </div>

        {/* Right Sidebar: Variable Filter & Interventions */}
        <div className="space-y-6">
          {/* Active Variable Filter */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl">
            <h4 className="text-xs font-bold text-slate-200 mb-2.5 flex items-center justify-between">
              <span>Отображаемые переменные</span>
              <span className="text-[10px] text-slate-400 font-normal">
                {selectedNodeIds.length} из {nodes.length}
              </span>
            </h4>

            <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
              {nodes.map((node, idx) => {
                const isSelected = selectedNodeIds.includes(node.id);
                const color = LINE_COLORS[idx % LINE_COLORS.length];
                return (
                  <button
                    key={node.id}
                    onClick={() => toggleNodeSelection(node.id)}
                    className={`w-full text-left flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition cursor-pointer ${
                      isSelected
                        ? 'bg-slate-800 text-white font-medium border border-slate-700'
                        : 'text-slate-500 hover:bg-slate-800/40'
                    }`}
                  >
                    <div className="flex items-center space-x-2 truncate">
                      <span
                        className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: isSelected ? color : '#475569' }}
                      />
                      <span className="truncate">{node.name}</span>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400 ml-1">
                      {simResult.timeSeries[node.id]?.[timeSteps - 1]?.toFixed(0) || '-'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Policy Intervention Creator */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl">
            <h4 className="text-xs font-bold text-slate-200 mb-2.5 flex items-center space-x-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>Управляющий шок / Политика</span>
            </h4>

            <form onSubmit={handleAddIntervention} className="space-y-3">
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Целевая переменная</label>
                <select
                  value={targetNodeId}
                  onChange={(e) => setTargetNodeId(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                >
                  {nodes.map((n) => (
                    <option key={n.id} value={n.id}>
                      {n.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">
                    Дельта ({deltaPercent > 0 ? '+' : ''}{deltaPercent}%)
                  </label>
                  <input
                    type="range"
                    min="-80"
                    max="100"
                    step="10"
                    value={deltaPercent}
                    onChange={(e) => setDeltaPercent(Number(e.target.value))}
                    className="w-full accent-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Старт на шаге t</label>
                  <input
                    type="number"
                    min="1"
                    max={timeSteps - 5}
                    value={startStep}
                    onChange={(e) => setStartStep(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-xs text-white focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white text-xs font-semibold py-2 rounded-lg shadow-sm transition flex items-center justify-center space-x-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Применить воздействие</span>
              </button>
            </form>

            {/* List of Active Interventions */}
            {interventions.length > 0 && (
              <div className="mt-3 pt-3 border-t border-slate-800 space-y-1.5">
                <span className="text-[10px] uppercase font-bold text-slate-400">Активные вмешательства:</span>
                {interventions.map((inv) => (
                  <div
                    key={inv.id}
                    className="flex items-center justify-between bg-slate-800/80 p-2 rounded-lg text-xs text-slate-200 border border-slate-700/60"
                  >
                    <div className="truncate pr-2">
                      <span className="font-bold text-amber-400">t={inv.startStep}: </span>
                      <span className="truncate">{inv.name}</span>
                    </div>
                    <button
                      onClick={() => handleRemoveIntervention(inv.id)}
                      className="text-slate-400 hover:text-rose-400 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
