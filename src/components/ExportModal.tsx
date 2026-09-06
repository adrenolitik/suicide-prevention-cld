import React, { useState } from 'react';
import { 
  X, 
  Download, 
  Copy, 
  Check, 
  FileCode, 
  FileText, 
  Share2, 
  Database, 
  Printer,
  Github,
  GitFork,
  FolderHeart,
  Sparkles
} from 'lucide-react';
import { CausalStudy } from '../types';
import { SUICIDE_STUDIES_CATALOG } from '../data/benchmarks';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  study: CausalStudy;
}

export const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose, study }) => {
  const [copiedType, setCopiedType] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2000);
  };

  const handleDownload = (content: string, filename: string, mime: string) => {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadSuicideCatalog = () => {
    const catalogData = {
      catalogName: 'Суициды',
      catalogDescription: 'Эмпирический цикл системно-динамических моделей превенции суицидов (ГомГМУ, ГОКПБ, БелЖД, 2024–2025)',
      exportedAt: new Date().toISOString(),
      studiesCount: SUICIDE_STUDIES_CATALOG.length,
      studies: SUICIDE_STUDIES_CATALOG,
    };
    handleDownload(JSON.stringify(catalogData, null, 2), 'catalog-suicide-prevention-gomel-gsmu-2025.json', 'application/json');
  };

  const gitPushCommand = `git remote add origin https://github.com/ai2medica/suicide-prevention-cld.git\ngit branch -M main\ngit push -u origin main --force`;

  const jsonStudyData = JSON.stringify(study, null, 2);

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-2xl p-6 shadow-2xl space-y-5 max-h-[90vh] flex flex-col my-auto">
        <div className="flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className="p-2.5 bg-rose-500/20 text-rose-400 rounded-xl">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Экспорт: suicide-prevention-cld</h3>
              <p className="text-xs text-slate-400">Развертывание на GitHub, скачивание моделей и отчетов</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-3 overflow-y-auto pr-1 flex-1">
          {/* Conflict Resolution Advice Card if user saw "Conflicts found in 1 file" */}
          <div className="bg-amber-950/30 border border-amber-500/40 p-3.5 rounded-2xl text-xs space-y-2">
            <div className="flex items-center space-x-2 text-amber-300 font-bold">
              <span className="text-sm">⚠️</span>
              <span>Решение ошибки «Conflicts found in 1 file» при экспорте:</span>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              Конфликт возникает, если на GitHub репозиторий был создан с уже готовым файлом (например, чекбокс <em>«Add a README file»</em>).
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
              <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
                <span className="text-emerald-400 font-semibold block mb-0.5">Вариант 1 (В 1 клик):</span>
                В окне ошибки нажмите <strong>«Resolve conflicts»</strong> и подтвердите замену файлов из приложения. Либо введите при экспорте новое имя репозитория: <code className="text-rose-300 font-mono">suicide-prevention-cld</code>.
              </div>
              <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
                <span className="text-cyan-400 font-semibold block mb-0.5">Вариант 2 (Через терминал):</span>
                Команда с ключом <code className="text-amber-300 font-mono">--force</code> (скопируйте блок ниже) принудительно запишет проект без конфликтов слияния.
              </div>
            </div>
          </div>

          {/* GitHub Fork Banner */}
          <div className="bg-gradient-to-r from-slate-950 via-indigo-950/40 to-slate-950 border border-indigo-500/40 p-4 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 bg-slate-800 text-white rounded-lg border border-slate-700">
                  <Github className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white flex items-center space-x-1.5">
                    <span>Развернуть suicide-prevention-cld на GitHub</span>
                    <span className="text-[10px] px-2 py-0.2 rounded bg-indigo-500/20 text-indigo-300 font-mono">
                      Pages Ready
                    </span>
                  </h4>
                  <p className="text-[11px] text-slate-300">
                    Через меню AI Studio Settings → <strong>«Export to GitHub»</strong> (укажите <code>suicide-prevention-cld</code>) или CLI:
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleCopy(gitPushCommand, 'git')}
                className="flex items-center space-x-1 px-2.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-medium transition cursor-pointer"
              >
                {copiedType === 'git' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedType === 'git' ? 'Скопировано' : 'Команды git'}</span>
              </button>
            </div>
            <pre className="p-2 bg-slate-950/80 rounded-lg text-[10px] font-mono text-emerald-400 overflow-x-auto border border-slate-800">
              {gitPushCommand}
            </pre>
          </div>

          {/* Suicide Catalog Export */}
          <div className="bg-rose-950/20 border border-rose-500/40 p-4 rounded-2xl flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-rose-500/20 text-rose-400 rounded-xl">
                <FolderHeart className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Весь каталог: «Суициды» (3 модели)</h4>
                <p className="text-[11px] text-slate-300">
                  Полный пакет 3 исследований (ГомГМУ / БелЖД): алгоритм ASQ, N=1449 протоколов, опрос 491 врача
                </p>
              </div>
            </div>
            <button
              onClick={handleDownloadSuicideCatalog}
              className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-medium transition shadow-md shrink-0 cursor-pointer"
            >
              Скачать каталог (.json)
            </button>
          </div>

          {/* Current JSON Export */}
          <div className="bg-slate-800/80 border border-slate-700/80 p-4 rounded-2xl flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-500/20 text-blue-400 rounded-xl">
                <Database className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Текущая модель: JSON графа</h4>
                <p className="text-[11px] text-slate-400">Узлы, полярности связей, петли и координаты активного проекта</p>
              </div>
            </div>
            <div className="flex items-center space-x-1.5 shrink-0">
              <button
                onClick={() => handleCopy(jsonStudyData, 'json')}
                className="p-2 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg text-xs transition"
                title="Копировать"
              >
                {copiedType === 'json' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
              <button
                onClick={() => handleDownload(jsonStudyData, `${study.id}.json`, 'application/json')}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-medium transition"
              >
                Скачать JSON
              </button>
            </div>
          </div>

          {/* Markdown Paper Export */}
          <div className="bg-slate-800/80 border border-slate-700/80 p-4 rounded-2xl flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Научный отчет в Markdown (.md)</h4>
                <p className="text-[11px] text-slate-400">Готовая академическая публикация с таблицами, петлями и выводами</p>
              </div>
            </div>
            <button
              onClick={() => handleDownload(study.scientificPaper?.introduction || '', `${study.id}-paper.md`, 'text/markdown')}
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-medium transition shrink-0"
            >
              Скачать .md
            </button>
          </div>

          {/* Printable Layout */}
          <div className="bg-slate-800/80 border border-slate-700/80 p-4 rounded-2xl flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-500/20 text-purple-400 rounded-xl">
                <Printer className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Печать / Сохранить в PDF</h4>
                <p className="text-[11px] text-slate-400">Форматированная версия для печати через диалог браузера</p>
              </div>
            </div>
            <button
              onClick={() => window.print()}
              className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-xs font-medium transition cursor-pointer shrink-0"
            >
              Печать (Ctrl+P)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

