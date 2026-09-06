import React, { useState } from 'react';
import { 
  FileText, 
  Download, 
  Copy, 
  Check, 
  BookOpen, 
  Share2, 
  Layers, 
  ExternalLink 
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { CausalStudy } from '../types';

interface ScientificPaperViewProps {
  study: CausalStudy;
}

export const ScientificPaperView: React.FC<ScientificPaperViewProps> = ({ study }) => {
  const [copied, setCopied] = useState(false);
  const [format, setFormat] = useState<'preview' | 'latex' | 'markdown'>('preview');

  const paper = study.scientificPaper || {
    title: study.title,
    abstract: `${study.problemStatement} В исследовании построена причинно-следственная диаграмма (CLD) из ${study.nodes.length} переменных и ${study.edges.length} связей. Идентифицировано ${study.loops.length} замкнутых контуров обратной связи.`,
    introduction: `Исследуемая проблема лежит в области "${study.domain}". Традиционные линейные модели не учитывают запаздывания и нелинейные эффекты обратных связей.`,
    systemBoundaries: `Границы исследуемой системы включают ключевые накопители и потоки: ${study.nodes.map((n) => n.name).join(', ')}.`,
    causalStructureAnalysis: `Анализ выявил ${study.edges.length} направленных связей. Особое значение имеют связи с задержками времени, создающие колебательные режимы.`,
    feedbackLoopDynamics: `В системе доминируют контуры: ${study.loops.map((l) => `${l.id} (${l.name})`).join('; ')}.`,
    simulationResults: `Численное моделирование методом Эйлера демонстрирует характерные фазовые траектории и чувствительность к шоковым воздействиям.`,
    policyRecommendations: `Рекомендуется сфокусироваться на высокоуровневых точках воздействия по Донелле Медоуз, разрывающих порочные круги.`,
    conclusion: `Построенная диаграмма причинно-следственных связей позволяет предотвратить контринтуитивные ошибки управления.`,
    references: [
      { title: 'Thinking in Systems: A Primer', authors: 'Donella H. Meadows', year: '2008', relevance: 'Методология точек воздействия и системных архетипов.' },
      { title: 'Business Dynamics: Systems Thinking and Modeling for a Complex World', authors: 'John D. Sterman', year: '2000', relevance: 'Математические основы построения CLD и симуляции.' },
      { title: 'Causality: Models, Reasoning, and Inference', authors: 'Judea Pearl', year: '2009', relevance: 'Теория причинного вывода и направленных графов.' }
    ]
  };

  const markdownFullText = `
# ${paper.title}

**Авторы:** Autonomous Causal AI Scientist (OmniCausal Core Engine)  
**Дата:** ${new Date(study.createdAt).toLocaleDateString('ru-RU')}  
**Предметная область:** ${study.domain}  

---

### Аннотация (Abstract)
${paper.abstract}

---

### 1. Введение и постановка проблемы (Introduction)
${paper.introduction}

**Исследовательские вопросы:**
${study.researchQuestions.map((q) => `- ${q}`).join('\n')}

**Ключевые гипотезы:**
${study.hypotheses.map((h) => `- **[${h.id.toUpperCase()}]** ${h.statement} *(Уверенность: ${(h.confidence * 100).toFixed(0)}%, Статус: ${h.status})*`).join('\n')}

---

### 2. Системные границы и таксономия переменных (System Boundaries)
${paper.systemBoundaries}

| ID | Переменная | Тип | Базовое значение | Сила рычага |
|---|---|---|---|---|
${study.nodes.map((n) => `| \`${n.id}\` | ${n.name} | ${n.type} | ${n.initialValue} ${n.unit || ''} | ${n.leverageScore || 5}/10 |`).join('\n')}

---

### 3. Архитектура причинно-следственных связей (Causal Loop Architecture)
${paper.causalStructureAnalysis}

#### Идентифицированные петли обратной связи (Feedback Loops):
${study.loops.map((l) => `
- **[${l.id}] ${l.name} (${l.type === 'reinforcing' ? 'Петля усиления (R)' : 'Петля балансирования (B)'})**
  - *Описание:* ${l.description}
  - *Математическое обоснование полярности:* ${l.polarityReasoning || 'Произведение знаков по контуру.'}
  - *Последовательность узлов:* \`${l.nodeIds.join(' → ')}\`
`).join('')}

---

### 4. Динамическая симуляция и анализ устойчивости (Simulation & Dynamics)
${paper.simulationResults}

---

### 5. Точки системного воздействия и рекомендации (Policy & Leverage Points)
${paper.policyRecommendations}

${study.leveragePoints.map((lp) => `
- **Уровень ${lp.level} (${lp.levelName}):** ${lp.recommendation}
  - *Целевой узел:* **${lp.targetNodeName}**
  - *Ожидаемый эффект:* ${lp.expectedImpact}
  ${lp.riskOfCounterIntuitiveBehavior ? `- *Предостережение:* ${lp.riskOfCounterIntuitiveBehavior}` : ''}
`).join('\n')}

---

### 6. Заключение (Conclusion)
${paper.conclusion}

---

### Список литературы (References)
${paper.references.map((r, i) => `[${i + 1}] **${r.title}**${r.authors ? ` // *${r.authors}*` : ''}${r.year ? `, ${r.year}` : ''}. — ${r.relevance}`).join('\n')}
  `.trim();

  const latexCode = `
\\documentclass[11pt,a4paper]{article}
\\usepackage[utf8]{inputenc}
\\usepackage[russian,english]{babel}
\\usepackage{amsmath,amssymb}
\\usepackage{booktabs}
\\usepackage{hyperref}

\\title{${paper.title}}
\\author{OmniCausal AI Scientist \\\\ \\textit{Domain: ${study.domain}}}
\\date{\\today}

\\begin{document}
\\maketitle

\\begin{abstract}
${paper.abstract}
\\end{abstract}

\\section{Введение}
${paper.introduction}

\\section{Системная структура и причинно-следственная диаграмма}
${paper.causalStructureAnalysis}

\\section{Анализ петель обратной связи}
${paper.feedbackLoopDynamics}

\\section{Симуляция и динамическое поведение}
${paper.simulationResults}

\\section{Точки воздействия и управляющие рекомендации}
${paper.policyRecommendations}

\\section{Заключение}
${paper.conclusion}

\\end{document}
  `.trim();

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadFile = (content: string, filename: string, type: string) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      {/* Header Toolbar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center space-x-2 bg-slate-800 p-1 rounded-xl border border-slate-700">
          <button
            onClick={() => setFormat('preview')}
            className={`px-3 py-1 text-xs font-semibold rounded-lg transition ${
              format === 'preview' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Научный макет (Preview)
          </button>
          <button
            onClick={() => setFormat('markdown')}
            className={`px-3 py-1 text-xs font-semibold rounded-lg transition ${
              format === 'markdown' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Markdown (.md)
          </button>
          <button
            onClick={() => setFormat('latex')}
            className={`px-3 py-1 text-xs font-semibold rounded-lg transition ${
              format === 'latex' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            LaTeX (.tex)
          </button>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleCopy(format === 'latex' ? latexCode : markdownFullText)}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded-lg border border-slate-700 transition cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Скопировано!' : 'Копировать'}</span>
          </button>

          <button
            onClick={() =>
              handleDownloadFile(
                format === 'latex' ? latexCode : markdownFullText,
                format === 'latex' ? 'causal-paper.tex' : 'causal-paper.md',
                'text/plain'
              )
            }
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium rounded-lg shadow-sm transition cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Скачать</span>
          </button>
        </div>
      </div>

      {/* Render Format */}
      {format === 'preview' ? (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 sm:p-12 shadow-2xl space-y-8 text-slate-200 leading-relaxed font-sans">
          {/* Article Header */}
          <div className="border-b border-slate-800 pb-6 text-center space-y-3">
            <span className="text-xs uppercase font-mono tracking-widest text-indigo-400 font-bold">
              Autonomous Systems Dynamics Research Report
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight">
              {paper.title}
            </h1>
            <div className="text-xs text-slate-400 flex items-center justify-center space-x-4">
              <span>Автор: <strong>OmniCausal AI Agent</strong></span>
              <span>•</span>
              <span>Область: <strong>{study.domain}</strong></span>
              <span>•</span>
              <span>Дата: <strong>{new Date(study.createdAt).toLocaleDateString('ru-RU')}</strong></span>
            </div>
          </div>

          {/* Abstract Box */}
          <div className="bg-slate-800/60 border-l-4 border-indigo-500 p-5 rounded-r-2xl space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-300">
              Аннотация (Abstract)
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed italic">
              {paper.abstract}
            </p>
          </div>

          {/* Section 1: Introduction */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white border-b border-slate-800/80 pb-1.5">
              1. Введение и постановка проблемы
            </h2>
            <p className="text-xs sm:text-sm text-slate-300">
              {paper.introduction}
            </p>

            <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 text-xs space-y-2">
              <span className="font-bold text-indigo-300">Исследовательские вопросы:</span>
              <ul className="list-disc list-inside text-slate-300 space-y-1 pl-1">
                {study.researchQuestions.map((q, i) => (
                  <li key={i}>{q}</li>
                ))}
              </ul>
            </div>
          </section>

          {/* Section 2: System Boundaries & Variables Table */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white border-b border-slate-800/80 pb-1.5">
              2. Границы системы и таксономия переменных
            </h2>
            <p className="text-xs sm:text-sm text-slate-300">
              {paper.systemBoundaries}
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="bg-slate-800/80 text-slate-300 border-b border-slate-700">
                    <th className="p-2.5 font-semibold">Идентификатор</th>
                    <th className="p-2.5 font-semibold">Переменная</th>
                    <th className="p-2.5 font-semibold">Тип</th>
                    <th className="p-2.5 font-semibold">Базовое значение</th>
                    <th className="p-2.5 font-semibold">Рычаг</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {study.nodes.map((n) => (
                    <tr key={n.id} className="hover:bg-slate-800/30">
                      <td className="p-2.5 font-mono text-slate-400">{n.id}</td>
                      <td className="p-2.5 font-medium text-white">{n.name}</td>
                      <td className="p-2.5">
                        <span className="px-1.5 py-0.5 rounded text-[10px] uppercase font-mono bg-slate-800 text-indigo-300">
                          {n.type}
                        </span>
                      </td>
                      <td className="p-2.5 font-mono text-slate-300">{n.initialValue} {n.unit || ''}</td>
                      <td className="p-2.5 font-mono text-amber-400 font-bold">L{n.leverageScore || 5}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Section 3: Causal Loops */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white border-b border-slate-800/80 pb-1.5">
              3. Анализ замкнутых контуров обратной связи (Feedback Loops)
            </h2>
            <p className="text-xs sm:text-sm text-slate-300">
              {paper.causalStructureAnalysis}
            </p>

            <div className="grid grid-cols-1 gap-3">
              {study.loops.map((loop) => {
                const isR = loop.type === 'reinforcing';
                return (
                  <div
                    key={loop.id}
                    className={`p-4 rounded-xl border ${
                      isR
                        ? 'bg-emerald-950/20 border-emerald-800/50'
                        : 'bg-amber-950/20 border-amber-800/50'
                    }`}
                  >
                    <div className="flex items-center space-x-2 mb-1.5">
                      <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${isR ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'}`}>
                        [{loop.id}] {isR ? 'Петля усиления (R)' : 'Петля балансирования (B)'}
                      </span>
                      <span className="text-xs font-bold text-white">{loop.name}</span>
                    </div>
                    <p className="text-xs text-slate-300 mb-2">{loop.description}</p>
                    <div className="text-[11px] font-mono text-slate-400">
                      Контур: {loop.nodeIds.join(' → ')}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Section 4: Simulation */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white border-b border-slate-800/80 pb-1.5">
              4. Результаты динамического моделирования
            </h2>
            <p className="text-xs sm:text-sm text-slate-300">
              {paper.simulationResults}
            </p>
          </section>

          {/* Section 5: Recommendations */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white border-b border-slate-800/80 pb-1.5">
              5. Стратегические точки воздействия и выводы
            </h2>
            <p className="text-xs sm:text-sm text-slate-300">
              {paper.policyRecommendations}
            </p>
            <p className="text-xs sm:text-sm text-slate-300">
              {paper.conclusion}
            </p>
          </section>

          {/* References */}
          <section className="space-y-3 pt-4 border-t border-slate-800">
            <h3 className="text-sm font-bold text-slate-300">Список использованных источников</h3>
            <div className="space-y-1 text-xs text-slate-400">
              {paper.references.map((r, i) => (
                <div key={i} className="flex space-x-2">
                  <span className="font-mono text-slate-500">[{i + 1}]</span>
                  <span>
                    <strong>{r.title}</strong>
                    {r.authors ? ` // ${r.authors}` : ''}
                    {r.year ? `, ${r.year}` : ''}. — <em>{r.relevance}</em>
                  </span>
                </div>
              ))}
            </div>
          </section>
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl">
          <pre className="text-xs font-mono text-slate-300 overflow-x-auto p-4 bg-slate-950 rounded-xl border border-slate-800/80 max-h-[600px] leading-relaxed">
            {format === 'latex' ? latexCode : markdownFullText}
          </pre>
        </div>
      )}
    </div>
  );
};
