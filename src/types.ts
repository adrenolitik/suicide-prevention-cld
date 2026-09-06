export type Polarity = '+' | '-';
export type LoopType = 'reinforcing' | 'balancing';
export type NodeType = 'stock' | 'flow' | 'auxiliary' | 'constant' | 'exogenous';
export type ResearchStage = 'ideation' | 'discovery' | 'loop_analysis' | 'simulation' | 'writeup';

export interface CausalNode {
  id: string;
  name: string;
  type: NodeType;
  category?: string;
  description: string;
  initialValue: number; // 0 - 100 normalized baseline
  unit?: string;
  min?: number;
  max?: number;
  x?: number;
  y?: number;
  leverageScore?: number; // 1 - 10
  isLeveragePoint?: boolean;
}

export interface CausalEdge {
  id: string;
  source: string;
  target: string;
  polarity: Polarity;
  strength: 'weak' | 'moderate' | 'strong';
  weight: number; // 0.1 - 1.0
  delay: boolean;
  delayDuration?: string;
  rationale: string;
  confidence?: number;
}

export interface CausalLoop {
  id: string; // e.g. "R1", "B1"
  type: LoopType;
  name: string;
  nodeIds: string[];
  edgeIds: string[];
  description: string;
  archetype?: string;
  polarityReasoning?: string;
}

export interface SystemArchetype {
  id: string;
  name: string;
  description: string;
  involvedLoops: string[];
  warningSignals: string[];
  strategicInterventions: string[];
}

export interface LeveragePoint {
  id: string;
  level: number; // 1 (highest - transcend paradigms) to 12 (constants/parameters)
  levelName: string;
  targetNodeId: string;
  targetNodeName: string;
  recommendation: string;
  expectedImpact: string;
  riskOfCounterIntuitiveBehavior?: string;
}

export interface Hypothesis {
  id: string;
  statement: string;
  confidence: number;
  status: 'confirmed' | 'disproven' | 'exploratory';
  evidence: string;
}

export interface Intervention {
  id: string;
  nodeId: string;
  name: string;
  deltaPercent: number; // e.g. +30% or -50%
  startStep: number;
  duration: number;
  type: 'step' | 'pulse' | 'linear';
}

export interface SimulationResult {
  steps: number[];
  timeSeries: Record<string, number[]>; // nodeId -> array of values
  systemStability: 'stable_equilibrium' | 'runaway_growth' | 'collapse' | 'cyclical_oscillation' | 'damped_oscillation';
  keyFindings: string[];
  tippingPoints: string[];
}

export interface ScientificPaper {
  title: string;
  abstract: string;
  introduction: string;
  systemBoundaries: string;
  causalStructureAnalysis: string;
  feedbackLoopDynamics: string;
  simulationResults: string;
  policyRecommendations: string;
  conclusion: string;
  references: Array<{
    title: string;
    authors?: string;
    year?: string;
    relevance: string;
  }>;
}

export interface AgentLog {
  id: string;
  timestamp: string;
  stage: ResearchStage;
  message: string;
  details?: string;
  type?: 'info' | 'hypothesis' | 'insight' | 'warning' | 'success';
}

export interface CausalStudy {
  id: string;
  title: string;
  shortTitle?: string;
  catalog?: string;
  domain: string;
  problemStatement: string;
  rawInputContext?: string;
  researchQuestions: string[];
  hypotheses: Hypothesis[];
  nodes: CausalNode[];
  edges: CausalEdge[];
  loops: CausalLoop[];
  archetypes: SystemArchetype[];
  leveragePoints: LeveragePoint[];
  interventions: Intervention[];
  simulation?: SimulationResult;
  scientificPaper?: ScientificPaper;
  agentLogs: AgentLog[];
  status: 'idle' | 'running' | 'completed' | 'error';
  currentStage?: ResearchStage;
  progressPercent: number;
  createdAt: string;
  updatedAt: string;
}
