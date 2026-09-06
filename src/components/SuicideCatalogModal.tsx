import React, { useState } from 'react';
import { 
  X, 
  FolderHeart, 
  Sparkles, 
  ArrowRight, 
  Download, 
  Copy, 
  Check, 
  GitFork, 
  Github, 
  ExternalLink, 
  BookOpen, 
  Activity, 
  FileText, 
  Layers, 
  ShieldAlert,
  Users,
  CheckCircle2,
  Database
} from 'lucide-react';
import { CausalStudy } from '../types';
import { SUICIDE_STUDIES_CATALOG } from '../data/benchmarks';

interface SuicideCatalogModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentStudyId: string;
  onSelectStudy: (study: CausalStudy) => void;
  onOpenExport?: () => void;
}

export const SuicideCatalogModal: React.FC<SuicideCatalogModalProps> = ({
  isOpen,
  onClose,
  currentStudyId,
  onSelectStudy,
}) => {
  const [copiedScript, setCopiedScript] = useState<boolean>(false);
  const [activeView, setActiveView] = useState<'studies' | 'github'>('studies');

  if (!isOpen) return null;

  const handleDownloadCatalogJson = () => {
    const catalogData = {
      catalogName: 'Суициды',
      catalogDescription: 'Эмпирический цикл системно-динамических моделей превенции суицидов (ГомГМУ, ГОКПБ, БелЖД, 2024–2025)',
      exportedAt: new Date().toISOString(),
      studiesCount: SUICIDE_STUDIES_CATALOG.length,
      studies: SUICIDE_STUDIES_CATALOG,
    };
    const blob = new Blob([JSON.stringify(catalogData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'catalog-suicide-prevention-gomel-gsmu-2025.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const gitCommands = `# 1. Клонирование или создание репозитория для каталога «Суициды»
git init
git add .
git commit -m "feat: Инициализация каталога системно-динамических моделей «Суициды» (ГомГМУ / БелЖД)"

# 2. Привязка удаленного репозитория на GitHub (замените на свой аккаунт)
git remote add origin https://github.com/ai2medica/omnicausal-suicide-prevention.git
git branch -M main
git push -u origin main`;

  const handleCopyGit = () => {
    navigator.clipboard.writeText(gitCommands);
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 2200);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 z-50 overflow-y-auto">
      <div className="bg-slate-900 border border-rose-500/30 rounded-3xl w-full max-w-4xl p-5 sm:p-7 shadow-2xl shadow-rose-950/40 space-y-6 max-h-[92vh] flex flex-col my-auto">
        
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-800 pb-5 shrink-0">
          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-rose-600 via-red-500 to-amber-500 flex items-center justify-center shadow-lg shadow-rose-600/25 shrink-0">
              <FolderHeart className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                  Тематический каталог
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  3 взаимосвязанных проекта
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white mt-1">
                Каталог исследований: «Суициды»
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 max-w-2xl mt-0.5 leading-relaxed">
                Доказательная база и системная динамика превенции аутоагрессивного поведения (Гомельский государственный медицинский университет, ГОКПБ, БелЖД, 2024–2025 гг.)
              </p>
            </div>
          </div>

          <button
            id="btn-close-catalog-modal"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition-colors shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center justify-between shrink-0 bg-slate-950/60 p-1.5 rounded-2xl border border-slate-800">
          <div className="flex items-center space-x-1.5">
            <button
              id="tab-catalog-studies"
              onClick={() => setActiveView('studies')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                activeView === 'studies'
                  ? 'bg-rose-600 text-white shadow-md shadow-rose-600/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Проекты каталога (3)</span>
            </button>
            <button
              id="tab-catalog-github"
              onClick={() => setActiveView('github')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                activeView === 'github'
                  ? 'bg-slate-700 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Github className="w-3.5 h-3.5 text-slate-200" />
              <span>Форк на GitHub & Экспорт</span>
              <span className="text-[10px] bg-indigo-500/30 text-indigo-300 px-1.5 py-0.5 rounded-md border border-indigo-400/30">
                Git Ready
              </span>
            </button>
          </div>

          <button
            id="btn-download-all-catalog"
            onClick={handleDownloadCatalogJson}
            className="hidden sm:flex items-center space-x-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-xl border border-slate-700 transition"
          >
            <Download className="w-3.5 h-3.5 text-rose-400" />
            <span>Скачать каталог (JSON)</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="overflow-y-auto space-y-4 pr-1 flex-1">
          {activeView === 'studies' ? (
            <>
              {/* Summary Metric Ribbon */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3 rounded-2xl bg-slate-800/40 border border-slate-800 text-center">
                <div className="p-2">
                  <div className="text-xl font-extrabold text-white">3</div>
                  <div className="text-[11px] text-slate-400">CLD исследования</div>
                </div>
                <div className="p-2 border-l border-slate-800">
                  <div className="text-xl font-extrabold text-rose-400">31 узел</div>
                  <div className="text-[11px] text-slate-400">Факторы и детерминанты</div>
                </div>
                <div className="p-2 border-l border-slate-800">
                  <div className="text-xl font-extrabold text-amber-400">10 петель</div>
                  <div className="text-[11px] text-slate-400">R1-R2, B1-B3 контуры</div>
                </div>
                <div className="p-2 border-l border-slate-800">
                  <div className="text-xl font-extrabold text-emerald-400">1940+</div>
                  <div className="text-[11px] text-slate-400">Протоколов и анкет врачей</div>
                </div>
              </div>

              {/* Studies Cards */}
              <div className="space-y-3.5">
                {SUICIDE_STUDIES_CATALOG.map((study, idx) => {
                  const isCurrent = study.id === currentStudyId;
                  return (
                    <div
                      key={study.id}
                      className={`relative p-4 sm:p-5 rounded-2xl border transition-all ${
                        isCurrent
                          ? 'bg-gradient-to-r from-rose-950/40 via-slate-900 to-slate-900 border-rose-500/60 ring-1 ring-rose-500/30'
                          : 'bg-slate-800/50 hover:bg-slate-800/80 border-slate-700/70 hover:border-slate-600'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                        <div className="space-y-1.5 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-[11px] font-bold px-2 py-0.5 rounded-lg bg-rose-500/20 text-rose-300 border border-rose-500/30">
                              Проект #{idx + 1}
                            </span>
                            {isCurrent && (
                              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center space-x-1">
                                <CheckCircle2 className="w-3 h-3" />
                                <span>Открыт в рабочей области</span>
                              </span>
                            )}
                            <span className="text-xs text-slate-400">
                              {study.domain.slice(0, 55)}...
                            </span>
                          </div>

                          <h3 className="text-base font-bold text-white leading-snug">
                            {study.title}
                          </h3>

                          <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                            {study.problemStatement}
                          </p>

                          {/* Highlights pills */}
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            <span className="text-[10px] px-2 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-700">
                              {study.nodes.length} узлов
                            </span>
                            <span className="text-[10px] px-2 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-700">
                              {study.edges.length} связей
                            </span>
                            <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/30">
                              {study.loops.length} контуров
                            </span>
                            <span className="text-[10px] px-2 py-0.5 rounded bg-blue-500/10 text-blue-300 border border-blue-500/30">
                              {study.leveragePoints.length} точек рычага Медоуз
                            </span>
                          </div>
                        </div>

                        {/* Action buttons */}
                        <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 pt-2 sm:pt-0 shrink-0">
                          <button
                            id={`btn-select-suicide-${idx + 1}`}
                            onClick={() => {
                              onSelectStudy(study);
                              onClose();
                            }}
                            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                              isCurrent
                                ? 'bg-slate-700 text-slate-200 hover:bg-slate-600'
                                : 'bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-600/20'
                            }`}
                          >
                            <span>{isCurrent ? 'Перейти к диаграмме' : 'Загрузить проект'}</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            /* GitHub Fork & Export Tab */
            <div className="space-y-4">
              <div className="bg-slate-800/60 border border-slate-700 p-5 rounded-2xl space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-slate-900 border border-slate-700 text-white rounded-xl">
                    <Github className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">Форк каталога «Суициды» на GitHub</h3>
                    <p className="text-xs text-slate-400">
                      Экспортируйте проект в свой репозиторий GitHub для версионирования, совместной работы и публикации
                    </p>
                  </div>
                </div>

                {/* Option 1: AI Studio UI Export */}
                <div className="p-4 rounded-xl bg-indigo-950/30 border border-indigo-500/30 space-y-2">
                  <div className="flex items-center space-x-2 text-indigo-300 font-bold text-xs">
                    <Sparkles className="w-4 h-4" />
                    <span>Способ 1: Прямой экспорт в GitHub через интерфейс Google AI Studio</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    В правом верхнем углу интерфейса Google AI Studio откройте меню <strong>Settings / Действия с проектом</strong> и выберите <strong>«Export to GitHub»</strong> (или <strong>«Download ZIP»</strong>). Система автоматически создаст репозиторий с полным исходным кодом, включая каталог «Суициды» и файл <code>README.md</code>.
                  </p>
                </div>

                {/* Option 2: CLI Git Push */}
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-700/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 text-slate-300 font-bold text-xs">
                      <GitFork className="w-4 h-4 text-emerald-400" />
                      <span>Способ 2: Клонирование и пуш через терминал (Git CLI)</span>
                    </div>
                    <button
                      onClick={handleCopyGit}
                      className="flex items-center space-x-1.5 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs transition"
                    >
                      {copiedScript ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-400">Скопировано!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Копировать команды</span>
                        </>
                      )}
                    </button>
                  </div>
                  <pre className="p-3 bg-slate-950 rounded-lg text-[11px] font-mono text-emerald-400 overflow-x-auto border border-slate-800">
                    {gitCommands}
                  </pre>
                </div>

                {/* Download All JSON Dataset */}
                <div className="flex items-center justify-between p-4 rounded-xl bg-rose-950/20 border border-rose-500/30">
                  <div className="flex items-center space-x-3">
                    <Database className="w-5 h-5 text-rose-400" />
                    <div>
                      <h4 className="text-xs font-bold text-white">Экспорт пакета данных каталога «Суициды»</h4>
                      <p className="text-[11px] text-slate-400">Все 3 системно-динамические модели с узлами, матрицами связей и регрессиями</p>
                    </div>
                  </div>
                  <button
                    onClick={handleDownloadCatalogJson}
                    className="flex items-center space-x-1.5 px-3.5 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-semibold shadow transition"
                  >
                    <Download className="w-4 h-4" />
                    <span>Скачать каталог (.json)</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-slate-800 pt-4 shrink-0 text-xs text-slate-400">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>ГомГМУ / БелЖД / ГОКПБ (2024–2025)</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-medium transition"
          >
            Закрыть
          </button>
        </div>

      </div>
    </div>
  );
};
