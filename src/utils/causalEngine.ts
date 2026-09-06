import { CausalNode, CausalEdge, CausalLoop, SimulationResult, Intervention } from '../types';

/**
 * Finds all simple directed feedback loops (cycles) in the causal graph.
 * Automatically computes loop polarity:
 * Even number of negative '-' edges = Reinforcing (R)
 * Odd number of negative '-' edges = Balancing (B)
 */
export function detectFeedbackLoops(nodes: CausalNode[], edges: CausalEdge[]): CausalLoop[] {
  const nodeMap = new Map<string, CausalNode>(nodes.map((n) => [n.id, n]));
  const adj = new Map<string, Array<{ target: string; edge: CausalEdge }>>();

  nodes.forEach((n) => adj.set(n.id, []));
  edges.forEach((e) => {
    if (adj.has(e.source)) {
      adj.get(e.source)!.push({ target: e.target, edge: e });
    }
  });

  const rawCycles: Array<{ nodes: string[]; edges: CausalEdge[] }> = [];
  const visited = new Set<string>();
  const recStack: string[] = [];
  const edgeStack: CausalEdge[] = [];

  function dfs(current: string, startNode: string, depth: number) {
    if (depth > 12) return; // Prevent excessive deep cycles
    recStack.push(current);

    const neighbors = adj.get(current) || [];
    for (const { target, edge } of neighbors) {
      if (target === startNode && recStack.length >= 2) {
        // Found a loop!
        const cycleEdges = [...edgeStack, edge];
        rawCycles.push({
          nodes: [...recStack],
          edges: cycleEdges,
        });
      } else if (!recStack.includes(target) && target >= startNode) {
        edgeStack.push(edge);
        dfs(target, startNode, depth + 1);
        edgeStack.pop();
      }
    }

    recStack.pop();
  }

  // Run DFS from each node in canonical order
  const nodeIds = nodes.map((n) => n.id).sort();
  for (const startId of nodeIds) {
    dfs(startId, startId, 0);
  }

  // Deduplicate and format cycles
  let rCount = 1;
  let bCount = 1;
  const uniqueSignatures = new Set<string>();
  const loops: CausalLoop[] = [];

  for (const cycle of rawCycles) {
    // Canonical signature: rotate so smallest id is first
    const n = cycle.nodes;
    const minIndex = n.indexOf([...n].sort()[0]);
    const normalizedNodes = [...n.slice(minIndex), ...n.slice(0, minIndex)];
    const sig = normalizedNodes.join('->');

    if (uniqueSignatures.has(sig)) continue;
    uniqueSignatures.add(sig);

    // Count negative polarities
    const negativeCount = cycle.edges.filter((e) => e.polarity === '-').length;
    const isReinforcing = negativeCount % 2 === 0;
    const loopId = isReinforcing ? `R${rCount++}` : `B${bCount++}`;

    const nodeNames = normalizedNodes.map((id) => nodeMap.get(id)?.name || id);
    const firstName = nodeNames[0];
    const secondName = nodeNames[1] || 'Следствие';

    loops.push({
      id: loopId,
      type: isReinforcing ? 'reinforcing' : 'balancing',
      name: isReinforcing
        ? `Петля усиления: ${firstName} ↔ ${secondName}`
        : `Петля балансирования: ${firstName} ↔ ${secondName}`,
      nodeIds: normalizedNodes,
      edgeIds: cycle.edges.map((e) => e.id),
      description: isReinforcing
        ? `Усиливающая обратная связь (четное число отрицательных связей: ${negativeCount}). Изменение в любой переменной возвращается лавинообразным ростом или спадом.`
        : `Балансирующая обратная связь (нечетное число отрицательных связей: ${negativeCount}). Стремится вернуть систему в равновесие или сдерживает рост.`,
      polarityReasoning: `Количество отрицательных связей (-) = ${negativeCount} (${
        isReinforcing ? 'четное → Положительная ОС' : 'нечетное → Отрицательная ОС'
      })`,
    });
  }

  return loops;
}

/**
 * Runs dynamic Euler numerical simulation over time steps (t = 0 ... steps).
 * Simulates non-linear feedback dynamics, variable delays, and policy shocks.
 */
export function runDynamicSimulation(
  nodes: CausalNode[],
  edges: CausalEdge[],
  interventions: Intervention[] = [],
  steps: number = 60
): SimulationResult {
  const nodeMap = new Map<string, CausalNode>(nodes.map((n) => [n.id, n]));
  const incoming = new Map<string, CausalEdge[]>();
  nodes.forEach((n) => incoming.set(n.id, []));
  edges.forEach((e) => {
    if (incoming.has(e.target)) {
      incoming.get(e.target)!.push(e);
    }
  });

  const stepList = Array.from({ length: steps }, (_, i) => i);
  const timeSeries: Record<string, number[]> = {};

  // Initialize baselines
  nodes.forEach((n) => {
    timeSeries[n.id] = [n.initialValue || 50];
  });

  const dt = 0.15; // Time step delta

  for (let t = 1; t < steps; t++) {
    // Check interventions at this time step
    const activeInterventions = new Map<string, number>();
    interventions.forEach((inv) => {
      if (t >= inv.startStep && t < inv.startStep + inv.duration) {
        const factor = inv.deltaPercent / 100;
        if (inv.type === 'step') {
          activeInterventions.set(inv.nodeId, (activeInterventions.get(inv.nodeId) || 0) + factor * 20);
        } else if (inv.type === 'pulse') {
          if (t === inv.startStep) {
            activeInterventions.set(inv.nodeId, (activeInterventions.get(inv.nodeId) || 0) + factor * 40);
          }
        } else if (inv.type === 'linear') {
          const progress = (t - inv.startStep) / inv.duration;
          activeInterventions.set(inv.nodeId, (activeInterventions.get(inv.nodeId) || 0) + factor * progress * 25);
        }
      }
    });

    // Compute derivative dX for each node
    for (const node of nodes) {
      const currentVal = timeSeries[node.id][t - 1];
      const baseline = node.initialValue || 50;
      const inEdges = incoming.get(node.id) || [];

      let netInfluence = 0;
      for (const edge of inEdges) {
        const sourceVal = timeSeries[edge.source]?.[Math.max(0, edge.delay ? t - 4 : t - 1)] ?? baseline;
        const sourceBase = nodeMap.get(edge.source)?.initialValue || 50;
        const deviation = (sourceVal - sourceBase) / (sourceBase || 1);

        const sign = edge.polarity === '+' ? 1 : -1;
        const weight = edge.weight || (edge.strength === 'strong' ? 0.8 : edge.strength === 'weak' ? 0.3 : 0.5);

        // Sigmoidal smooth saturation of influence
        const influence = Math.tanh(deviation * 1.8) * weight * 15 * sign;
        netInfluence += influence;
      }

      // Natural system decay/homeostasis towards baseline
      const decayRate = node.type === 'stock' ? 0.04 : 0.12;
      const decay = -decayRate * (currentVal - baseline);

      // Intervention shock
      const shock = activeInterventions.get(node.id) || 0;

      // Update state via Euler integration with bounds
      const nextVal = currentVal + (netInfluence + decay + shock) * dt;
      const clampedVal = Math.max(node.min ?? 0, Math.min(node.max ?? 150, Math.round(nextVal * 100) / 100));

      timeSeries[node.id].push(clampedVal);
    }
  }

  // Assess system stability
  const nodeVariations = nodes.map((n) => {
    const series = timeSeries[n.id];
    const initial = series[0];
    const final = series[series.length - 1];
    const min = Math.min(...series);
    const max = Math.max(...series);
    const range = max - min;
    return { id: n.id, name: n.name, initial, final, range, series };
  });

  const maxRange = Math.max(...nodeVariations.map((v) => v.range));
  const endingDrift = Math.max(...nodeVariations.map((v) => Math.abs(v.final - v.initial)));

  let systemStability: SimulationResult['systemStability'] = 'stable_equilibrium';
  if (maxRange > 70 && endingDrift > 40) {
    systemStability = 'runaway_growth';
  } else if (maxRange > 30 && endingDrift < 15) {
    systemStability = 'damped_oscillation';
  } else if (maxRange > 35) {
    systemStability = 'cyclical_oscillation';
  } else if (endingDrift < 8) {
    systemStability = 'stable_equilibrium';
  }

  const keyFindings: string[] = [];
  const sortedByImpact = [...nodeVariations].sort((a, b) => b.range - a.range);

  if (sortedByImpact[0]) {
    keyFindings.push(`Наибольшую амплитуду изменений демонстрирует показатель «${sortedByImpact[0].name}» (колебание: ${sortedByImpact[0].range.toFixed(1)} пунктов).`);
  }
  if (sortedByImpact[1]) {
    keyFindings.push(`Критический каскадный отклик зафиксирован в переменной «${sortedByImpact[1].name}».`);
  }
  keyFindings.push(
    systemStability === 'runaway_growth'
      ? 'Обнаружен режим лавинообразного усиления: доминируют положительные петли обратной связи (R).'
      : systemStability === 'damped_oscillation'
      ? 'Система выходит на новый гомеостаз благодаря демпфирующим балансирующим контурам (B).'
      : 'Динамика демонстрирует устойчивое равновесие с поглощением возмущений.'
  );

  const tippingPoints: string[] = [];
  interventions.forEach((inv) => {
    const node = nodeMap.get(inv.nodeId);
    tippingPoints.push(`Временной шаг t=${inv.startStep}: Воздействие на «${node?.name || inv.nodeId}» (${inv.deltaPercent > 0 ? '+' : ''}${inv.deltaPercent}%) вызвало перестройку динамических трендов.`);
  });

  return {
    steps: stepList,
    timeSeries,
    systemStability,
    keyFindings,
    tippingPoints,
  };
}
