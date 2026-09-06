import React, { useState } from 'react';
import { 
  Sparkles, 
  X, 
  Send, 
  Bot, 
  Plus, 
  AlertCircle, 
  ArrowRight, 
  CheckCircle,
  HelpCircle,
  Lightbulb
} from 'lucide-react';
import { CausalNode, CausalEdge, CausalLoop } from '../types';

interface AiCopilotDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  nodes: CausalNode[];
  edges: CausalEdge[];
  loops: CausalLoop[];
  onAddSuggestedNode: (node: { name: string; type: any; description: string; category?: string }) => void;
  onAddSuggestedEdge: (edge: { source: string; target: string; polarity: any; rationale: string }) => void;
}

export const AiCopilotDrawer: React.FC<AiCopilotDrawerProps> = ({
  isOpen,
  onClose,
  nodes,
  edges,
  loops,
  onAddSuggestedNode,
  onAddSuggestedEdge,
}) => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [critiqueResult, setCritiqueResult] = useState<any>(null);
  const [addedNodeNames, setAddedNodeNames] = useState<Set<string>>(new Set());

  if (!isOpen) return null;

  const handleAskCopilot = async (customPrompt?: string) => {
    const promptText = customPrompt || query;
    if (!promptText.trim() && !customPrompt) return;

    setLoading(true);
    try {
      const res = await fetch('/api/scientist/critique-and-refine', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nodes,
          edges,
          loops,
          query: promptText,
        }),
      });

      if (!res.ok) {
        throw new Error('Ошибка связи с AI-рецензентом');
      }

      const data = await res.json();
      setCritiqueResult(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-y-0 right-0 w-full max-w-lg bg-slate-900/98 backdrop-blur-xl border-l border-slate-700 shadow-2xl z-50 flex flex-col">
      {/* Drawer Header */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 bg-indigo-500/20 text-indigo-400 rounded-xl border border-indigo-500/30">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">AI Рецензент и Ко-пилот модели</h3>
            <p className="text-[11px] text-slate-400">Поиск скрытых петель, конфаундеров и аудит причинных связей</p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Preset Quick Prompts */}
      <div className="p-4 border-b border-slate-800/80 bg-slate-950/40 flex flex-wrap gap-2">
        <button
          onClick={() => handleAskCopilot('Проведи полный аудит диаграммы: найди слабые места, пропущенные переменные и скрытые конфаундеры.')}
          disabled={loading}
          className="px-2.5 py-1 rounded-lg text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
        >
          🔍 Аудит модели
        </button>
        <button
          onClick={() => handleAskCopilot('Какие контринтуитивные системные эффекты могут возникнуть при наивных управленческих решениях?')}
          disabled={loading}
          className="px-2.5 py-1 rounded-lg text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
        >
          ⚠️ Контринтуитивные риски
        </button>
        <button
          onClick={() => handleAskCopilot('Предложи 2 новые балансирующие петли (B) для стабилизации системы.')}
          disabled={loading}
          className="px-2.5 py-1 rounded-lg text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
        >
          ⚖️ Предложить петли балансирования
        </button>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {loading ? (
          <div className="py-16 text-center space-y-3">
            <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-slate-400">AI-ученый анализирует структуру причинного графа...</p>
          </div>
        ) : critiqueResult ? (
          <div className="space-y-4">
            {/* General Critique */}
            {critiqueResult.critique && (
              <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700 text-xs text-slate-200 leading-relaxed">
                <span className="font-bold text-indigo-400 block mb-1">Методологическая рецензия:</span>
                {critiqueResult.critique}
              </div>
            )}

            {/* Suggested Nodes */}
            {critiqueResult.suggestedNodes?.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Рекомендуемые к добавлению переменные:
                </h4>
                {critiqueResult.suggestedNodes.map((node: any, idx: number) => {
                  const isAdded = addedNodeNames.has(node.name);
                  return (
                    <div
                      key={idx}
                      className="bg-slate-800/60 border border-slate-700/60 p-3 rounded-xl flex items-center justify-between text-xs text-slate-300"
                    >
                      <div className="pr-2">
                        <div className="font-bold text-white">{node.name}</div>
                        <div className="text-[11px] text-slate-400 mt-0.5">{node.description || node.whyNeeded}</div>
                      </div>
                      <button
                        onClick={() => {
                          onAddSuggestedNode({
                            name: node.name,
                            type: node.type || 'auxiliary',
                            description: node.description || 'Добавлено по рекомендации AI',
                            category: node.category || 'Расширение',
                          });
                          setAddedNodeNames(new Set([...addedNodeNames, node.name]));
                        }}
                        disabled={isAdded}
                        className={`px-2.5 py-1 rounded-lg text-xs font-medium flex items-center space-x-1 flex-shrink-0 ${
                          isAdded
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : 'bg-indigo-600 hover:bg-indigo-500 text-white cursor-pointer'
                        }`}
                      >
                        {isAdded ? <CheckCircle className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                        <span>{isAdded ? 'Добавлено' : 'Добавить'}</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Hidden Feedbacks */}
            {critiqueResult.hiddenFeedbacks && (
              <div className="bg-amber-950/20 border border-amber-900/40 p-4 rounded-xl text-xs text-amber-200/90 leading-relaxed">
                <span className="font-bold text-amber-300 block mb-1">Скрытые петли обратной связи:</span>
                {critiqueResult.hiddenFeedbacks}
              </div>
            )}

            {/* Policy Interventions */}
            {critiqueResult.policyInterventionIdeas?.length > 0 && (
              <div className="space-y-1.5 bg-slate-950/60 border border-slate-800 p-3 rounded-xl text-xs">
                <span className="font-bold text-slate-300 block">Идеи управляющих интервенций:</span>
                <ul className="list-disc list-inside text-slate-300 space-y-1 pl-1">
                  {critiqueResult.policyInterventionIdeas.map((idea: string, i: number) => (
                    <li key={i}>{idea}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ) : (
          <div className="py-12 text-center text-slate-500 space-y-2">
            <Bot className="w-10 h-10 mx-auto text-slate-600 opacity-60" />
            <p className="text-xs">Задайте вопрос ИИ-рецензенту или воспользуйтесь быстрыми подсказками сверху.</p>
          </div>
        )}
      </div>

      {/* Input Footer */}
      <div className="p-4 border-t border-slate-800 bg-slate-950">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleAskCopilot();
          }}
          className="flex items-center space-x-2"
        >
          <input
            type="text"
            placeholder="Спросите о структуре модели, конфаундерах..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
          />
          <button
            type="submit"
            disabled={loading || !query.trim()}
            className="p-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl disabled:opacity-50 transition cursor-pointer"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
