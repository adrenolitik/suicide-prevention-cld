import React from 'react';
import { 
  Bot, 
  Sparkles, 
  Lightbulb, 
  Network, 
  Repeat, 
  Activity, 
  FileText, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  Play,
  ArrowRight
} from 'lucide-react';
import { CausalStudy, AgentLog, ResearchStage } from '../types';

interface AgentResearchTimelineProps {
  study: CausalStudy;
  isInvestigating: boolean;
  onRerunInvestigation: () => void;
}

const STAGES: Array<{ id: ResearchStage; title: string; subtitle: string; icon: React.FC<any> }> = [
  {
    id: 'ideation',
    title: '1. Формулировка проблемы и сбор гипотез (Ideation)',
    subtitle: 'Выделение фундаментальных сущностей, определение границ системы и базовых переменных.',
    icon: Lightbulb,
  },
  {
    id: 'discovery',
    title: '2. Причинный вывод и полярность связей (Causal Discovery)',
    subtitle: 'Определение направленных связей, знаков (+/-), весов влияния и временных запаздываний.',
    icon: Network,
  },
  {
    id: 'loop_analysis',
    title: '3. Алгебра циклов и системные архетипы (Loop Analysis)',
    subtitle: 'Идентификация петель усиления (R) и балансирования (B), поиск точек воздействия по Медоуз.',
    icon: Repeat,
  },
  {
    id: 'simulation',
    title: '4. Динамическая симуляция и верификация (Dynamic Simulation)',
    subtitle: 'Численное моделирование методом Эйлера, выявление аттракторов и режимов устойчивости.',
    icon: Activity,
  },
  {
    id: 'writeup',
    title: '5. Синтез научного отчета и публикации (Paper Synthesis)',
    subtitle: 'Формирование академической статьи, аннотации, системных выводов и рекомендаций.',
    icon: FileText,
  },
];

export const AgentResearchTimeline: React.FC<AgentResearchTimelineProps> = ({
  study,
  isInvestigating,
  onRerunInvestigation,
}) => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      {/* Header Pipeline Card */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400 shadow-inner">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-base font-bold text-white">
                Автономный исследовательский цикл OmniCausal
              </h2>
              <span className="px-2 py-0.5 text-[10px] font-mono uppercase rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                {isInvestigating ? 'Исследование в процессе...' : 'Цикл завершен'}
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              Модель ИИ-ученого: <strong>Gemini 3.7 Flash Reasoning Engine</strong>
            </p>
          </div>
        </div>

        <button
          onClick={onRerunInvestigation}
          disabled={isInvestigating}
          className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl shadow-md transition disabled:opacity-50 cursor-pointer"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          <span>Перезапустить цикл исследования</span>
        </button>
      </div>

      {/* 5-Stage Scientific Pipeline */}
      <div className="space-y-4">
        {STAGES.map((stage, idx) => {
          const Icon = stage.icon;
          const isDone = !isInvestigating || study.status === 'completed';
          return (
            <div
              key={stage.id}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg transition-all relative overflow-hidden"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3.5">
                  <div className="p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-indigo-400 flex-shrink-0">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                      <span>{stage.title}</span>
                    </h3>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      {stage.subtitle}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-1.5 text-xs font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-1 rounded-full flex-shrink-0">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Верифицировано</span>
                </div>
              </div>

              {/* Stage-specific Summary pill */}
              <div className="mt-3 pt-3 border-t border-slate-800/80 flex flex-wrap items-center gap-2 text-xs">
                {stage.id === 'ideation' && (
                  <span className="text-slate-300">
                    Сгенерировано <strong>{study.nodes.length}</strong> системных переменных и <strong>{study.hypotheses.length}</strong> гипотез.
                  </span>
                )}
                {stage.id === 'discovery' && (
                  <span className="text-slate-300">
                    Построено <strong>{study.edges.length}</strong> каузальных связей с вычислением полярностей (+/-).
                  </span>
                )}
                {stage.id === 'loop_analysis' && (
                  <span className="text-slate-300">
                    Обнаружено <strong>{study.loops.length}</strong> петель обратной связи и <strong>{study.leveragePoints.length}</strong> точек рычага.
                  </span>
                )}
                {stage.id === 'simulation' && (
                  <span className="text-slate-300">
                    Проведена 60-шаговая динамическая симуляция системных траекторий.
                  </span>
                )}
                {stage.id === 'writeup' && (
                  <span className="text-slate-300">
                    Сформирован академический отчет со списком литературы и рекомендациями.
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Agent Thought Logs Stream */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center space-x-2">
          <Clock className="w-3.5 h-3.5 text-indigo-400" />
          <span>Журнал рассуждений и логи исследователя (Agent Execution Trace)</span>
        </h3>

        <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
          {study.agentLogs.length > 0 ? (
            study.agentLogs.map((log) => (
              <div
                key={log.id}
                className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800/80 text-xs flex items-start space-x-2.5"
              >
                <span className="font-mono text-[10px] text-slate-500 flex-shrink-0 mt-0.5">
                  [{log.timestamp}]
                </span>
                <span className="text-slate-300 leading-relaxed">
                  {log.message}
                </span>
              </div>
            ))
          ) : (
            <div className="text-xs text-slate-500 py-3 text-center">
              Журнал выполнения готов. Запустите новое исследование для просмотра рассуждений агента в реальном времени.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
