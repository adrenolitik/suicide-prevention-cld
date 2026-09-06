import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '15mb' }));

// Lazy initializer for Gemini SDK
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn('GEMINI_API_KEY is not set in environment.');
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    hasApiKey: Boolean(process.env.GEMINI_API_KEY),
    timestamp: new Date().toISOString(),
  });
});

/**
 * Autonomous Causal Research Agent API
 * Conducts Ideation -> Discovery -> Loop Identification -> Leverage Point Extraction -> Scientific Paper
 */
app.post('/api/scientist/investigate', async (req, res) => {
  try {
    const { problemStatement, domain, rawContext } = req.body;

    if (!problemStatement || typeof problemStatement !== 'string') {
      return res.status(400).json({ error: 'problemStatement is required' });
    }

    const ai = getGeminiClient();
    if (!ai) {
      return res.status(500).json({
        error: 'API ключ GEMINI_API_KEY не сконфигурирован. Пожалуйста, укажите его в настройках Secrets.',
      });
    }

    const prompt = `
Ты — элитный автономный ИИ-ученый в области системной динамики, кибернетики и причинного вывода (Causal Discovery & Causal Loop Diagrams).
Твоя цель — провести фундаментальное научное исследование и построить детальную причинно-следственную диаграмму (CLD / Causal Loop Diagram) для следующей исследовательской задачи:

[ПРЕДМЕТНАЯ ОБЛАСТЬ]: ${domain || 'Системный анализ и моделирование'}
[ПРОБЛЕМА ДЛЯ ИССЛЕДОВАНИЯ]: ${problemStatement}
${rawContext ? `[ДОПОЛНИТЕЛЬНЫЙ КОНТЕКСТ / ДАННЫЕ / СТАТЬИ]:\n${rawContext}` : ''}

Выполни строгую методологию:
1. Выдели 6-10 ключевых системных переменных (узлов).
   - Определи их тип: 'stock' (накопитель), 'flow' (поток), 'auxiliary' (вспомогательная), 'exogenous' (внешняя).
   - Укажи начальное базовое значение (0-100, по умолчанию 50-65), единицы измерения, понятное научное описание.
   - Оцени силу рычага (leverage score 1-10) и отметь isLeveragePoint для 2-3 ключевых узлов.
   - Задай логичные координаты x (от 100 до 850) и y (от 80 до 450) для красивого расположения на диаграмме.

2. Сформируй 8-16 направленных причинно-следственных связей (ребер).
   - Определи ТОЧНУЮ полярность:
     * '+' (положительная связь: увеличение причины приводит к увеличению следствия при прочих равных, или уменьшение к уменьшению - прямопропорционально)
     * '-' (отрицательная связь: увеличение причины приводит к уменьшению следствия - обратнопропорционально).
   - Оцени силу: 'weak' | 'moderate' | 'strong' и вес (0.3 - 0.95).
   - Укажи наличие временного лага (delay: true/false) и его длительность (delayDuration, напр. "2-4 месяца", "1-2 квартала").
   - Дай строгое научное обоснование механизма влияния (rationale).

3. Проанализируй замкнутые циклы (петли обратной связи):
   - Обязательно выдели петли усиления (R / Reinforcing - четное число отрицательных связей) и балансирования (B / Balancing - нечетное число отрицательных связей).
   - Идентифицируй системные архетипы (например: "Пределы роста", "Смещение бремени", "Эскалация", "Трагедия общин", "Фиксы, которые проваливаются").

4. Выдели точки воздействия (Donella Meadows Leverage Points):
   - Укажи уровни воздействия от 1 (смена парадигмы) до 12 (параметры и константы), конкретные рекомендации и риски парадоксального системного поведения.

5. Сгенерируй полноценный научный отчет (Scientific Paper) на академическом русском языке:
   - title, abstract, introduction, systemBoundaries, causalStructureAnalysis, feedbackLoopDynamics, simulationResults, policyRecommendations, conclusion, references.

Ответь строго в формате JSON по следующей схеме.
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.7-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            domain: { type: Type.STRING },
            problemStatement: { type: Type.STRING },
            researchQuestions: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            hypotheses: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  statement: { type: Type.STRING },
                  confidence: { type: Type.NUMBER },
                  status: { type: Type.STRING },
                  evidence: { type: Type.STRING },
                },
                required: ['id', 'statement', 'confidence', 'status', 'evidence'],
              },
            },
            nodes: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  name: { type: Type.STRING },
                  type: { type: Type.STRING },
                  category: { type: Type.STRING },
                  description: { type: Type.STRING },
                  initialValue: { type: Type.NUMBER },
                  unit: { type: Type.STRING },
                  min: { type: Type.NUMBER },
                  max: { type: Type.NUMBER },
                  x: { type: Type.NUMBER },
                  y: { type: Type.NUMBER },
                  leverageScore: { type: Type.NUMBER },
                  isLeveragePoint: { type: Type.BOOLEAN },
                },
                required: ['id', 'name', 'type', 'description', 'initialValue'],
              },
            },
            edges: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  source: { type: Type.STRING },
                  target: { type: Type.STRING },
                  polarity: { type: Type.STRING },
                  strength: { type: Type.STRING },
                  weight: { type: Type.NUMBER },
                  delay: { type: Type.BOOLEAN },
                  delayDuration: { type: Type.STRING },
                  rationale: { type: Type.STRING },
                },
                required: ['id', 'source', 'target', 'polarity', 'strength', 'rationale'],
              },
            },
            loops: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  type: { type: Type.STRING },
                  name: { type: Type.STRING },
                  nodeIds: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                  edgeIds: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                  description: { type: Type.STRING },
                  archetype: { type: Type.STRING },
                  polarityReasoning: { type: Type.STRING },
                },
                required: ['id', 'type', 'name', 'nodeIds', 'description'],
              },
            },
            archetypes: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  name: { type: Type.STRING },
                  description: { type: Type.STRING },
                  involvedLoops: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                  warningSignals: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                  strategicInterventions: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                },
                required: ['id', 'name', 'description', 'involvedLoops', 'warningSignals', 'strategicInterventions'],
              },
            },
            leveragePoints: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  level: { type: Type.NUMBER },
                  levelName: { type: Type.STRING },
                  targetNodeId: { type: Type.STRING },
                  targetNodeName: { type: Type.STRING },
                  recommendation: { type: Type.STRING },
                  expectedImpact: { type: Type.STRING },
                  riskOfCounterIntuitiveBehavior: { type: Type.STRING },
                },
                required: ['id', 'level', 'levelName', 'targetNodeId', 'targetNodeName', 'recommendation', 'expectedImpact'],
              },
            },
            scientificPaper: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                abstract: { type: Type.STRING },
                introduction: { type: Type.STRING },
                systemBoundaries: { type: Type.STRING },
                causalStructureAnalysis: { type: Type.STRING },
                feedbackLoopDynamics: { type: Type.STRING },
                simulationResults: { type: Type.STRING },
                policyRecommendations: { type: Type.STRING },
                conclusion: { type: Type.STRING },
                references: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      title: { type: Type.STRING },
                      authors: { type: Type.STRING },
                      year: { type: Type.STRING },
                      relevance: { type: Type.STRING },
                    },
                    required: ['title', 'relevance'],
                  },
                },
              },
              required: [
                'title',
                'abstract',
                'introduction',
                'systemBoundaries',
                'causalStructureAnalysis',
                'feedbackLoopDynamics',
                'simulationResults',
                'policyRecommendations',
                'conclusion',
              ],
            },
          },
          required: [
            'title',
            'domain',
            'problemStatement',
            'researchQuestions',
            'hypotheses',
            'nodes',
            'edges',
            'loops',
            'archetypes',
            'leveragePoints',
            'scientificPaper',
          ],
        },
      },
    });

    const text = response.text || '{}';
    const parsed = JSON.parse(text);

    res.json(parsed);
  } catch (error: any) {
    console.error('Error in /api/scientist/investigate:', error);
    res.status(500).json({
      error: error?.message || 'Ошибка генерации причинно-следственного исследования.',
    });
  }
});

/**
 * Co-pilot endpoint: suggest missing causal links, unobserved variables, or test interventions
 */
app.post('/api/scientist/critique-and-refine', async (req, res) => {
  try {
    const { nodes, edges, loops, query } = req.body;

    const ai = getGeminiClient();
    if (!ai) {
      return res.status(500).json({ error: 'GEMINI_API_KEY is not configured.' });
    }

    const prompt = `
Ты — научный рецензент и методолог системной динамики.
Проанализируй текущую диаграмму причинно-следственных связей (CLD):
Узлы (${nodes?.length || 0}): ${JSON.stringify(nodes?.map((n: any) => ({ id: n.id, name: n.name, type: n.type })))}
Связи (${edges?.length || 0}): ${JSON.stringify(edges?.map((e: any) => ({ from: e.source, to: e.target, sign: e.polarity, delay: e.delay })))}
Петли обратной связи (${loops?.length || 0}): ${JSON.stringify(loops?.map((l: any) => ({ id: l.id, type: l.type, name: l.name })))}

Запрос пользователя: "${query || 'Проведи критический аудит модели, найди скрытые петли, конфаундеры и предложи улучшения.'}"

Сгенерируй ответ в JSON с рекомендациями:
- critique: общий методологический анализ и слабые места модели
- suggestedNodes: 1-3 новых узла, которые стоит добавить (с id, name, type, description, whyNeeded)
- suggestedEdges: 2-4 новые связи (с source, target, polarity, rationale)
- hiddenFeedbacks: обнаруженные или возможные неучтенные петли
- policyInterventionIdeas: 2-3 идеи управляющих воздействий
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.7-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json(parsed);
  } catch (error: any) {
    console.error('Error in /api/scientist/critique-and-refine:', error);
    res.status(500).json({ error: error?.message || 'Ошибка анализа модели.' });
  }
});

// Vite middleware for dev / static for prod
async function start() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[OmniCausal Server] Running on http://0.0.0.0:${PORT}`);
  });
}

start();
