import React, { useState, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { Navbar } from './components/Navbar';
import { CausalCanvas } from './components/CausalCanvas';
import { SimulationPanel } from './components/SimulationPanel';
import { LeveragePointsPanel } from './components/LeveragePointsPanel';
import { ScientificPaperView } from './components/ScientificPaperView';
import { AgentResearchTimeline } from './components/AgentResearchTimeline';
import { AiCopilotDrawer } from './components/AiCopilotDrawer';
import { NewStudyModal } from './components/NewStudyModal';
import { ExportModal } from './components/ExportModal';
import { SuicideCatalogModal } from './components/SuicideCatalogModal';
import { BENCHMARK_STUDIES } from './data/benchmarks';
import { CausalStudy, CausalNode, CausalEdge, Intervention } from './types';
import { detectFeedbackLoops } from './utils/causalEngine';

export default function App() {
  const [currentStudy, setCurrentStudy] = useState<CausalStudy>(BENCHMARK_STUDIES[0]);
  const [activeTab, setActiveTab] = useState<'canvas' | 'simulation' | 'leverage' | 'paper' | 'timeline'>('canvas');
  const [selectedLoopId, setSelectedLoopId] = useState<string | null>(null);

  // Modals & Drawers
  const [showNewStudyModal, setShowNewStudyModal] = useState<boolean>(false);
  const [showExportModal, setShowExportModal] = useState<boolean>(false);
  const [showCatalogModal, setShowCatalogModal] = useState<boolean>(false);
  const [showCopilotDrawer, setShowCopilotDrawer] = useState<boolean>(false);

  // Agent Investigation State
  const [isInvestigating, setIsInvestigating] = useState<boolean>(false);
  const [errorToast, setErrorToast] = useState<string | null>(null);

  // Select Benchmark Study
  const handleSelectBenchmark = (study: CausalStudy) => {
    setCurrentStudy(study);
    setSelectedLoopId(null);
  };

  // Node & Edge Updates with Auto Loop Re-computation
  const handleUpdateNodes = useCallback((newNodes: CausalNode[]) => {
    setCurrentStudy((prev) => {
      const updatedLoops = detectFeedbackLoops(newNodes, prev.edges);
      return {
        ...prev,
        nodes: newNodes,
        loops: updatedLoops,
        updatedAt: new Date().toISOString(),
      };
    });
  }, []);

  const handleUpdateEdges = useCallback((newEdges: CausalEdge[]) => {
    setCurrentStudy((prev) => {
      const updatedLoops = detectFeedbackLoops(prev.nodes, newEdges);
      return {
        ...prev,
        edges: newEdges,
        loops: updatedLoops,
        updatedAt: new Date().toISOString(),
      };
    });
  }, []);

  const handleAddNode = useCallback((nodeData: Omit<CausalNode, 'id'>) => {
    const newNode: CausalNode = {
      ...nodeData,
      id: 'node_' + Math.random().toString(36).substring(2, 8),
    };
    setCurrentStudy((prev) => {
      const updatedNodes = [...prev.nodes, newNode];
      const updatedLoops = detectFeedbackLoops(updatedNodes, prev.edges);
      return {
        ...prev,
        nodes: updatedNodes,
        loops: updatedLoops,
        updatedAt: new Date().toISOString(),
      };
    });
  }, []);

  const handleAddEdge = useCallback((edgeData: Omit<CausalEdge, 'id'>) => {
    const newEdge: CausalEdge = {
      ...edgeData,
      id: 'edge_' + Math.random().toString(36).substring(2, 8),
    };
    setCurrentStudy((prev) => {
      const updatedEdges = [...prev.edges, newEdge];
      const updatedLoops = detectFeedbackLoops(prev.nodes, updatedEdges);
      return {
        ...prev,
        edges: updatedEdges,
        loops: updatedLoops,
        updatedAt: new Date().toISOString(),
      };
    });
  }, []);

  const handleUpdateInterventions = useCallback((interventions: Intervention[]) => {
    setCurrentStudy((prev) => ({
      ...prev,
      interventions,
      updatedAt: new Date().toISOString(),
    }));
  }, []);

  // Launch Autonomous AI Investigation
  const handleStartInvestigation = async (
    problemStatement: string,
    domain: string,
    rawContext?: string
  ) => {
    setIsInvestigating(true);
    setShowNewStudyModal(false);
    setActiveTab('timeline');
    setErrorToast(null);

    // Initial placeholder study in running state
    const temporaryStudy: CausalStudy = {
      id: 'study_' + Date.now(),
      title: problemStatement.slice(0, 60) + '...',
      domain: domain || 'Системный анализ',
      problemStatement,
      rawInputContext: rawContext,
      researchQuestions: ['Формулируются исследовательские вопросы...'],
      hypotheses: [],
      nodes: [],
      edges: [],
      loops: [],
      archetypes: [],
      leveragePoints: [],
      interventions: [],
      agentLogs: [
        {
          id: 'log-start',
          timestamp: '00:00.000',
          stage: 'ideation',
          message: 'Автономный исследователь OmniCausal инициализирован. Формулировка гипотез и границ системы...',
          type: 'info',
        },
      ],
      status: 'running',
      progressPercent: 20,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setCurrentStudy(temporaryStudy);

    try {
      const res = await fetch('/api/scientist/investigate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          problemStatement,
          domain,
          rawContext,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Ошибка при проведении ИИ-исследования.');
      }

      const generatedData = await res.json();

      // Recalculate and synchronize loops using strict graph algebra
      const computedLoops = detectFeedbackLoops(generatedData.nodes || [], generatedData.edges || []);
      const mergedLoops = (generatedData.loops?.length ? generatedData.loops : computedLoops);

      const finalStudy: CausalStudy = {
        id: 'study_' + Date.now(),
        title: generatedData.title || problemStatement,
        domain: generatedData.domain || domain,
        problemStatement: generatedData.problemStatement || problemStatement,
        rawInputContext: rawContext,
        researchQuestions: generatedData.researchQuestions || [],
        hypotheses: generatedData.hypotheses || [],
        nodes: generatedData.nodes || [],
        edges: generatedData.edges || [],
        loops: mergedLoops,
        archetypes: generatedData.archetypes || [],
        leveragePoints: generatedData.leveragePoints || [],
        interventions: [],
        scientificPaper: generatedData.scientificPaper,
        agentLogs: [
          {
            id: 'log-1',
            timestamp: '00:01.200',
            stage: 'ideation',
            message: `Выделено ${generatedData.nodes?.length || 0} системных переменных и определены границы системы.`,
            type: 'insight',
          },
          {
            id: 'log-2',
            timestamp: '00:02.400',
            stage: 'discovery',
            message: `Сформировано ${generatedData.edges?.length || 0} каузальных связей с вычислением полярностей (+/-) и задержек.`,
            type: 'info',
          },
          {
            id: 'log-3',
            timestamp: '00:03.100',
            stage: 'loop_analysis',
            message: `Идентифицировано ${mergedLoops.length} замкнутых контуров обратной связи и ${generatedData.leveragePoints?.length || 0} точек воздействия по Медоуз.`,
            type: 'success',
          },
          {
            id: 'log-4',
            timestamp: '00:04.500',
            stage: 'writeup',
            message: 'Синтезирован полный академический отчет и сформированы рекомендации.',
            type: 'success',
          },
        ],
        status: 'completed',
        progressPercent: 100,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      setCurrentStudy(finalStudy);

      // Celebrate discovery with confetti
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.8 },
      });
    } catch (err: any) {
      console.error(err);
      setErrorToast(err?.message || 'Не удалось выполнить исследование.');
      setCurrentStudy((prev) => ({
        ...prev,
        status: 'error',
      }));
    } finally {
      setIsInvestigating(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Top Navigation */}
      <Navbar
        currentStudy={currentStudy}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onSelectBenchmark={handleSelectBenchmark}
        onOpenNewStudy={() => setShowNewStudyModal(true)}
        onOpenExport={() => setShowExportModal(true)}
        onOpenCopilot={() => setShowCopilotDrawer(true)}
        onOpenCatalog={() => setShowCatalogModal(true)}
        isInvestigating={isInvestigating}
      />

      {/* Error Toast Notification */}
      {errorToast && (
        <div className="bg-rose-900/90 border-b border-rose-700 text-rose-200 text-xs px-4 py-2 flex items-center justify-between z-50">
          <span>{errorToast}</span>
          <button onClick={() => setErrorToast(null)} className="text-white font-bold ml-4">
            ✕
          </button>
        </div>
      )}

      {/* Main Tab Content */}
      <main className="flex-1 overflow-x-hidden">
        {activeTab === 'canvas' && (
          <CausalCanvas
            nodes={currentStudy.nodes}
            edges={currentStudy.edges}
            loops={currentStudy.loops}
            selectedLoopId={selectedLoopId}
            onSelectLoop={setSelectedLoopId}
            onUpdateNodes={handleUpdateNodes}
            onUpdateEdges={handleUpdateEdges}
            onAddNode={handleAddNode}
            onAddEdge={handleAddEdge}
          />
        )}

        {activeTab === 'simulation' && (
          <SimulationPanel
            nodes={currentStudy.nodes}
            edges={currentStudy.edges}
            interventions={currentStudy.interventions}
            onUpdateInterventions={handleUpdateInterventions}
          />
        )}

        {activeTab === 'leverage' && (
          <LeveragePointsPanel
            leveragePoints={currentStudy.leveragePoints}
            archetypes={currentStudy.archetypes}
            loops={currentStudy.loops}
            nodes={currentStudy.nodes}
            onSelectLoop={(loopId) => {
              setSelectedLoopId(loopId);
              setActiveTab('canvas');
            }}
          />
        )}

        {activeTab === 'paper' && <ScientificPaperView study={currentStudy} />}

        {activeTab === 'timeline' && (
          <AgentResearchTimeline
            study={currentStudy}
            isInvestigating={isInvestigating}
            onRerunInvestigation={() =>
              handleStartInvestigation(
                currentStudy.problemStatement,
                currentStudy.domain,
                currentStudy.rawInputContext
              )
            }
          />
        )}
      </main>

      {/* AI Co-pilot Drawer */}
      <AiCopilotDrawer
        isOpen={showCopilotDrawer}
        onClose={() => setShowCopilotDrawer(false)}
        nodes={currentStudy.nodes}
        edges={currentStudy.edges}
        loops={currentStudy.loops}
        onAddSuggestedNode={(suggested) => {
          handleAddNode({
            name: suggested.name,
            type: suggested.type,
            category: suggested.category || 'Расширение',
            description: suggested.description,
            initialValue: 50,
            x: 350 + Math.random() * 150,
            y: 200 + Math.random() * 150,
          });
        }}
        onAddSuggestedEdge={(suggested) => {
          handleAddEdge({
            source: suggested.source,
            target: suggested.target,
            polarity: suggested.polarity,
            strength: 'moderate',
            weight: 0.7,
            delay: false,
            rationale: suggested.rationale,
          });
        }}
      />

      {/* New Study Modal */}
      <NewStudyModal
        isOpen={showNewStudyModal}
        onClose={() => setShowNewStudyModal(false)}
        onStartInvestigation={handleStartInvestigation}
        isLoading={isInvestigating}
      />

      {/* Export Modal */}
      <ExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        study={currentStudy}
      />

      {/* Dedicated Suicide Studies Catalog Modal */}
      <SuicideCatalogModal
        isOpen={showCatalogModal}
        onClose={() => setShowCatalogModal(false)}
        currentStudyId={currentStudy.id}
        onSelectStudy={(study) => {
          handleSelectBenchmark(study);
          setShowCatalogModal(false);
        }}
        onOpenExport={() => {
          setShowCatalogModal(false);
          setShowExportModal(true);
        }}
      />
    </div>
  );
}
