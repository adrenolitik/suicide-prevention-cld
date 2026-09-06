import React from 'react';
import { 
  Network, 
  Sparkles, 
  Play, 
  FileText, 
  Activity, 
  Download, 
  PlusCircle, 
  Bot, 
  Layers,
  BookOpen,
  FolderHeart,
  GitFork,
  Github
} from 'lucide-react';
import { CausalStudy } from '../types';
import { BENCHMARK_STUDIES, SUICIDE_STUDIES_CATALOG } from '../data/benchmarks';

interface NavbarProps {
  currentStudy: CausalStudy;
  activeTab: 'canvas' | 'simulation' | 'paper' | 'timeline' | 'leverage';
  setActiveTab: (tab: 'canvas' | 'simulation' | 'paper' | 'timeline' | 'leverage') => void;
  onSelectBenchmark: (study: CausalStudy) => void;
  onOpenNewStudy: () => void;
  onOpenExport: () => void;
  onOpenCopilot: () => void;
  onOpenCatalog: () => void;
  isInvestigating: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentStudy,
  activeTab,
  setActiveTab,
  onSelectBenchmark,
  onOpenNewStudy,
  onOpenExport,
  onOpenCopilot,
  onOpenCatalog,
  isInvestigating,
}) => {
  const suicideStudies = BENCHMARK_STUDIES.filter((s) => s.catalog === 'Суициды');
  const otherStudies = BENCHMARK_STUDIES.filter((s) => s.catalog !== 'Суициды');
  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Title */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-600 via-red-500 to-amber-500 flex items-center justify-center shadow-lg shadow-rose-600/25 shrink-0">
              <FolderHeart className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-base sm:text-lg font-mono text-white tracking-tight">
                  suicide-prevention-cld
                </span>
                <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                  CLD
                </span>
                <span className="hidden lg:inline text-[10px] text-slate-400 font-mono bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700">
                  ГомГМУ · БелЖД · ГОКПБ
                </span>
              </div>
              <p className="text-xs text-slate-400 truncate max-w-xs sm:max-w-sm">
                {currentStudy.shortTitle || currentStudy.title}
              </p>
            </div>
          </div>

          {/* Center Navigation Tabs */}
          <div className="hidden md:flex items-center space-x-1 bg-slate-800/80 p-1 rounded-xl border border-slate-700/60">
            <button
              id="tab-canvas"
              onClick={() => setActiveTab('canvas')}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'canvas'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>CLD Диаграмма</span>
              <span className="px-1.5 py-0.2 text-[10px] rounded-full bg-slate-900/60 text-slate-300 font-mono">
                {currentStudy.nodes.length}
              </span>
            </button>

            <button
              id="tab-simulation"
              onClick={() => setActiveTab('simulation')}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'simulation'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Симуляция</span>
            </button>

            <button
              id="tab-leverage"
              onClick={() => setActiveTab('leverage')}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'leverage'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Точки воздействия</span>
              <span className="px-1.5 py-0.2 text-[10px] rounded-full bg-amber-500/20 text-amber-300 font-mono">
                {currentStudy.loops.length}
              </span>
            </button>

            <button
              id="tab-paper"
              onClick={() => setActiveTab('paper')}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'paper'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Научный отчет</span>
            </button>

            <button
              id="tab-timeline"
              onClick={() => setActiveTab('timeline')}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'timeline'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
              }`}
            >
              <Bot className="w-3.5 h-3.5" />
              <span>Пайплайн агента</span>
            </button>
          </div>

          {/* Right Action Controls */}
          <div className="flex items-center space-x-2">
            {/* GitHub Deploy Button */}
            <button
              id="btn-github-deploy"
              onClick={onOpenExport}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 hover:border-slate-600 transition shadow-sm cursor-pointer"
              title="Деплой на GitHub Pages и форк репозитория"
            >
              <Github className="w-3.5 h-3.5 text-white" />
              <span className="hidden sm:inline">GitHub Деплой</span>
              <span className="text-[10px] bg-indigo-500/30 text-indigo-300 px-1 rounded font-mono hidden md:inline">
                Pages
              </span>
            </button>

            {/* Suicide Studies Dedicated Catalog Button */}
            <button
              id="btn-open-suicide-catalog"
              onClick={onOpenCatalog}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white shadow-md shadow-rose-900/30 border border-rose-500/40 cursor-pointer transition-all shrink-0"
              title="Открыть каталог исследований «Суициды» (3 проекта, ГомГМУ / БелЖД)"
            >
              <FolderHeart className="w-3.5 h-3.5 text-rose-200" />
              <span className="hidden sm:inline">Каталог</span>
              <span className="bg-rose-950/80 text-rose-200 text-[10px] px-1.5 py-0.2 rounded-full font-mono">
                3
              </span>
            </button>

            {/* New Autonomous Investigation */}
            <button
              id="btn-new-study"
              onClick={onOpenNewStudy}
              disabled={isInvestigating}
              className="hidden sm:flex items-center space-x-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium px-2.5 py-1.5 rounded-lg border border-slate-700 transition-all disabled:opacity-50 cursor-pointer"
              title="Создать новое исследование"
            >
              <PlusCircle className="w-3.5 h-3.5 text-indigo-400" />
              <span>Создать</span>
            </button>

            {/* AI Co-pilot Critique */}
            <button
              id="btn-open-copilot"
              onClick={onOpenCopilot}
              title="AI Рецензент и Ко-пилот модели"
              className="p-1.5 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-indigo-400" />
            </button>

            {/* Export */}
            <button
              id="btn-open-export"
              onClick={onOpenExport}
              title="Экспорт исследования"
              className="p-1.5 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Dedicated 3-Project Switcher Bar for Suicide Studies Suite */}
        <div className="py-2 border-t border-slate-800/80 flex items-center justify-between overflow-x-auto scrollbar-none gap-2 text-xs">
          <div className="flex items-center space-x-1.5 shrink-0">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-1 mr-1">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
              <span>Проекты:</span>
            </span>

            {suicideStudies.map((study, idx) => {
              const isActive = study.id === currentStudy.id;
              return (
                <button
                  key={study.id}
                  onClick={() => onSelectBenchmark(study)}
                  className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-lg transition-all text-[11px] whitespace-nowrap cursor-pointer ${
                    isActive
                      ? 'bg-rose-500/20 text-rose-200 font-bold border border-rose-500/40 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 border border-transparent'
                  }`}
                  title={study.title}
                >
                  <span className="w-4 h-4 rounded-full bg-slate-800 text-[10px] flex items-center justify-center font-mono text-slate-300">
                    {idx + 1}
                  </span>
                  <span>{study.shortTitle || `Проект ${idx + 1}`}</span>
                </button>
              );
            })}
          </div>

          <div className="hidden lg:flex items-center space-x-2 text-[11px] text-slate-400 shrink-0">
            <span className="font-mono text-slate-300">N=1940+</span> протоколов и анкет
            <span className="text-slate-600">·</span>
            <span>R 4.5.0 регрессия</span>
            <span className="text-slate-600">·</span>
            <span className="text-emerald-400">Приказ МЗ РБ № 194</span>
          </div>
        </div>
      </div>

      {/* Mobile Sub-Navigation Bar */}
      <div className="md:hidden flex items-center justify-around bg-slate-950 border-t border-slate-800 py-1.5 px-2">
        <button
          onClick={() => setActiveTab('canvas')}
          className={`text-xs px-2 py-1 rounded ${activeTab === 'canvas' ? 'text-indigo-400 font-bold' : 'text-slate-400'}`}
        >
          Диаграмма
        </button>
        <button
          onClick={() => setActiveTab('simulation')}
          className={`text-xs px-2 py-1 rounded ${activeTab === 'simulation' ? 'text-indigo-400 font-bold' : 'text-slate-400'}`}
        >
          Симуляция
        </button>
        <button
          onClick={() => setActiveTab('leverage')}
          className={`text-xs px-2 py-1 rounded ${activeTab === 'leverage' ? 'text-amber-400 font-bold' : 'text-slate-400'}`}
        >
          Рычаги
        </button>
        <button
          onClick={() => setActiveTab('paper')}
          className={`text-xs px-2 py-1 rounded ${activeTab === 'paper' ? 'text-indigo-400 font-bold' : 'text-slate-400'}`}
        >
          Отчет
        </button>
        <button
          onClick={() => setActiveTab('timeline')}
          className={`text-xs px-2 py-1 rounded ${activeTab === 'timeline' ? 'text-indigo-400 font-bold' : 'text-slate-400'}`}
        >
          Агент
        </button>
      </div>
    </header>
  );
};
