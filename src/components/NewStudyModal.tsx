import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  BookOpen, 
  FileText, 
  Lightbulb, 
  ArrowRight,
  TrendingUp,
  Cpu,
  Globe,
  HeartPulse
} from 'lucide-react';

interface NewStudyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartInvestigation: (problemStatement: string, domain: string, rawContext?: string) => void;
  isLoading: boolean;
}

const TEMPLATES = [
  {
    title: '🎯 Межведомственный алгоритм и скрининг ASQ в профилактике суицидов (2025–2030)',
    domain: 'Организация здравоохранения, суицидология, скрининг ASQ и регрессионный прогноз',
    problem: 'Доказательное исследование совершенствования профилактики суицидов (ГомГМУ, БелЖД, 2025): 10-компонентный межведомственный алгоритм, скрининг ASQ (Приказ МЗ РБ № 194), психологические кабинеты во всех ведомствах, статистика районов (RR 0.69–0.87) и линейный регрессионный тренд в R до 10.02 на 100 тыс. к 2030 г.',
    icon: Sparkles,
  },
  {
    title: '📈 Суицидальная активность Гомельской области 2018–2024 (N=1449)',
    domain: 'Эпидемиология, суицидология, межведомственный мониторинг и организация здравоохранения',
    problem: 'Эмпирический анализ 1449 протоколов межведомственного разбора (ГомГМУ, ГОКПБ): 83.1% мужчин, безработица 47.3%, одиночество 31.2%, опьянение >1.5‰ у 27.3%, скрытый пресуицид (73.2%), отсутствие психиатрического учета (86.2%), летальность повешения (84.4%) и алгоритм МЗ РБ от 11.09.2024.',
    icon: Sparkles,
  },
  {
    title: '🎗️ Профилактика суицидов и организационно-медицинские барьеры',
    domain: 'Организация здравоохранения, суицидология и клиническая кибернетика',
    problem: 'Системное исследование 491 врача (ГомГМУ): преодоление когнитивных барьеров (миф о молчании 70%, о привлечении внимания 49%), ликвидация «слепой зоны» амбулаторного звена и трехуровневая модель превенции.',
    icon: Sparkles,
  },
  {
    title: '📊 Самоконтроль и профилактика осложнений СД2 (COMPAR-EU)',
    domain: 'Превентивная диабетология, картирование доказательств и организация здравоохранения',
    problem: 'Системный мета-анализ 665 РКИ (COMPAR-EU): порочный круг диабетического дистресса и декомпенсации (R1), разрыв между контролем HbA1c (83%) и дефицитом совместного принятия решений (5%), и балансирующие контуры 12-компонентной таксономии самоконтроля.',
    icon: Sparkles,
  },
  {
    title: '🍄 Микоз глотки, респираторная патология и ИИ-СППР «ФарингоБот»',
    domain: 'Оториноларингология, медицинская микология и организация здравоохранения',
    problem: 'Каузальная спираль: болезни органов дыхания (БОД) и ИКС -> дисбиоз микробиома глотки -> колонизация Candida spp. -> ошибочное назначение антибиотиков -> усугубление микоза. Модель организационных мероприятий и ИИ-СППР «ФарингоБот» (ГомГМУ / ДЦРБ).',
    icon: Sparkles,
  },
  {
    title: '👁️ Сахарный диабет и диабетическая ретинопатия',
    domain: 'Эндокринология, офтальмология и клиническая кибернетика',
    problem: 'Каузальная спираль: гипергликемия и AGEs -> потеря перицитов -> ишемия сетчатки -> гиперэкспрессия VEGF -> макулярный отек и неоангиогенез -> слепота -> депрессия и срыв самоконтроля диабета.',
    icon: Sparkles,
  },
  {
    title: '🏥 Здравоохранение: Очереди в стационарах и выгорание врачей',
    domain: 'Медицинский менеджмент и клиническая кибернетика',
    problem: 'Исследование замкнутого круга: нехватка времени на прием ведет к недолечиванию, росту повторных госпитализаций, дефициту кадров и выгоранию врачей.',
    icon: HeartPulse,
  },
  {
    title: '🧬 Клиническая фармакология: Антибиотикорезистентность (AMR) и суперинфекции',
    domain: 'Инфекционные болезни и клиническая фармакология',
    problem: 'Анализ системной ловушки: эмпирическое назначение антибиотиков широкого спектра из-за страха сепсиса ускоряет селекцию резистентных штаммов и рост летальности в ОРИТ.',
    icon: Sparkles,
  },
  {
    title: '🥗 Общественное здоровье: Метаболический синдром и хронические болезни',
    domain: 'Общественное здоровье и превентивная медицина',
    problem: 'Моделирование системного бремени ультрапереработанных продуктов питания (UPF), гиподинамии, сахарного диабета 2 типа и нагрузки на бюджет здравоохранения.',
    icon: Globe,
  },
  {
    title: '📉 Макроэкономика: Инфляционная спираль и процентные ставки',
    domain: 'Экономическая кибернетика и монетарная политика',
    problem: 'Исследование механизмов передачи монетарной политики, формирования инфляционных ожиданий и спирали «зарплата — цены» при шоках предложения.',
    icon: TrendingUp,
  },
];

export const NewStudyModal: React.FC<NewStudyModalProps> = ({
  isOpen,
  onClose,
  onStartInvestigation,
  isLoading,
}) => {
  const [problemStatement, setProblemStatement] = useState('');
  const [domain, setDomain] = useState('');
  const [rawContext, setRawContext] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!problemStatement.trim()) return;
    onStartInvestigation(
      problemStatement.trim(),
      domain.trim() || 'Системная динамика и кибернетика',
      rawContext.trim() || undefined
    );
  };

  const handleApplyTemplate = (tpl: typeof TEMPLATES[0]) => {
    setProblemStatement(tpl.problem);
    setDomain(tpl.domain);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-2xl p-6 sm:p-8 shadow-2xl space-y-6 my-8">
        {/* Modal Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-gradient-to-tr from-indigo-600 to-blue-500 rounded-2xl text-white shadow-lg shadow-indigo-500/20">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Новое системное исследование (CLD)</h2>
              <p className="text-xs text-slate-400">Автономный ИИ-ученый построит причинно-следственные связи, петли и проведет симуляцию</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Templates */}
        <div>
          <span className="text-xs font-semibold text-slate-400 mb-2 block">
            Быстрые шаблоны исследовательских задач:
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {TEMPLATES.map((tpl, i) => {
              const Icon = tpl.icon;
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleApplyTemplate(tpl)}
                  className="text-left p-2.5 rounded-xl bg-slate-800/70 hover:bg-slate-800 border border-slate-700/60 hover:border-indigo-500/50 transition cursor-pointer group"
                >
                  <div className="flex items-center space-x-2 text-xs font-bold text-slate-200 group-hover:text-indigo-300">
                    <Icon className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
                    <span className="truncate">{tpl.title}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Проблема или система для исследования (Problem Statement) <span className="text-rose-400">*</span>
            </label>
            <textarea
              required
              rows={3}
              placeholder="Опишите феномен, противоречие или сложную систему, которую нужно исследовать на причинно-следственные петли..."
              value={problemStatement}
              onChange={(e) => setProblemStatement(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none leading-relaxed"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Предметная область (Domain)
            </label>
            <input
              type="text"
              placeholder="напр., Экономика, Экология, Управление продуктом, Социология"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Дополнительные материалы / Текст статьи / Эмпирические данные (Опционально)
            </label>
            <textarea
              rows={2}
              placeholder="Вставьте выдержки из научных статей, отчетов или заметок для глубокого синтеза..."
              value={rawContext}
              onChange={(e) => setRawContext(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs text-slate-400 hover:text-white"
            >
              Отмена
            </button>

            <button
              type="submit"
              disabled={isLoading || !problemStatement.trim()}
              className="flex items-center space-x-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-500/25 transition disabled:opacity-50 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Идет исследование...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Запустить автономного ИИ-ученого</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
