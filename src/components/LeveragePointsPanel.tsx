import React from 'react';
import { 
  Sparkles, 
  Target, 
  AlertCircle, 
  ShieldAlert, 
  Layers, 
  ArrowUpRight, 
  CheckCircle,
  HelpCircle
} from 'lucide-react';
import { LeveragePoint, SystemArchetype, CausalLoop, CausalNode } from '../types';

interface LeveragePointsPanelProps {
  leveragePoints: LeveragePoint[];
  archetypes: SystemArchetype[];
  loops: CausalLoop[];
  nodes: CausalNode[];
  onSelectLoop: (loopId: string) => void;
}

export const LeveragePointsPanel: React.FC<LeveragePointsPanelProps> = ({
  leveragePoints,
  archetypes,
  loops,
  nodes,
  onSelectLoop,
}) => {
  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-8">
      {/* Header Info */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center space-x-3 mb-2">
          <div className="p-2 bg-amber-500/20 text-amber-300 rounded-xl border border-amber-500/30">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">
              Точки системного воздействия (Donella Meadows Leverage Points)
            </h2>
            <p className="text-xs text-slate-300">
              Иерархия мест приложения силы в сложных системах: от смены парадигм и структуры петель до настройки числовых параметров
            </p>
          </div>
        </div>
      </div>

      {/* Leverage Points Grid */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-slate-200 flex items-center space-x-2">
          <Target className="w-4 h-4 text-indigo-400" />
          <span>Идентифицированные рычаги воздействия для текущей системы</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {leveragePoints.map((lev) => {
            const isHighLeverage = lev.level <= 4;
            return (
              <div
                key={lev.id}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden flex flex-col justify-between"
              >
                {/* Top Level Pill */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span
                      className={`text-xs font-mono font-bold px-2.5 py-1 rounded-full border ${
                        isHighLeverage
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                          : 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40'
                      }`}
                    >
                      Уровень {lev.level} • {lev.levelName}
                    </span>

                    <span className="text-[11px] font-medium text-slate-400">
                      Цель: <strong className="text-slate-200">{lev.targetNodeName}</strong>
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-white mb-2 leading-snug">
                    {lev.recommendation}
                  </h4>

                  <div className="bg-slate-800/60 rounded-xl p-3 border border-slate-700/60 text-xs text-slate-300 mb-3 space-y-1.5">
                    <div>
                      <span className="font-semibold text-emerald-400">Ожидаемый системный эффект: </span>
                      {lev.expectedImpact}
                    </div>

                    {lev.riskOfCounterIntuitiveBehavior && (
                      <div className="text-amber-300/90 pt-1 border-t border-slate-700/40 flex items-start space-x-1.5">
                        <AlertCircle className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 mt-0.5" />
                        <span>
                          <strong>Парадоксальный риск: </strong>
                          {lev.riskOfCounterIntuitiveBehavior}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="text-[11px] text-slate-500 flex items-center justify-between pt-2 border-t border-slate-800/80">
                  <span>
                    {isHighLeverage ? '🔥 Высокая системная отдача (Трансформация правил)' : '⚙️ Локальная оптимизация параметров'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* System Archetypes Section */}
      <div className="space-y-4 pt-4 border-t border-slate-800">
        <h3 className="text-sm font-bold text-slate-200 flex items-center space-x-2">
          <ShieldAlert className="w-4 h-4 text-rose-400" />
          <span>Системные архетипы и ловушки динамики</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {archetypes.map((arch) => (
            <div key={arch.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-white flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-rose-400" />
                  <span>{arch.name}</span>
                </h4>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                {arch.description}
              </p>

              {/* Involved loops */}
              <div className="flex items-center space-x-1.5 text-xs text-slate-400">
                <span>Задействованные контуры:</span>
                {arch.involvedLoops.map((lid) => (
                  <button
                    key={lid}
                    onClick={() => onSelectLoop(lid)}
                    className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-indigo-300 font-mono font-bold rounded text-[11px] border border-slate-700"
                  >
                    {lid}
                  </button>
                ))}
              </div>

              {/* Warning Signals */}
              <div className="bg-rose-950/20 border border-rose-900/40 rounded-xl p-3 text-xs space-y-1">
                <span className="font-bold text-rose-300 block">Тревожные сигналы (Warning Signals):</span>
                <ul className="list-disc list-inside text-rose-200/80 space-y-0.5 pl-1">
                  {arch.warningSignals.map((sig, i) => (
                    <li key={i}>{sig}</li>
                  ))}
                </ul>
              </div>

              {/* Strategic Interventions */}
              <div className="bg-emerald-950/20 border border-emerald-900/40 rounded-xl p-3 text-xs space-y-1">
                <span className="font-bold text-emerald-300 block">Стратегические контрмеры:</span>
                <ul className="list-disc list-inside text-emerald-200/80 space-y-0.5 pl-1">
                  {arch.strategicInterventions.map((sol, i) => (
                    <li key={i}>{sol}</li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
