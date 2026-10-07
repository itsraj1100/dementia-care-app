import React, { useState } from 'react';
import { Search, Compass, ShieldCheck, AlertCircle, PhoneCall, Sparkles, BookOpen, ExternalLink } from 'lucide-react';
import { sound } from '../../utils/audio.ts';

interface GuideItem {
  id: string;
  topic: string;
  title: string;
  body: string;
  source: string;
  verified: boolean;
}

const GUIDE_KNOWLEDGE_BASE: GuideItem[] = [
  {
    id: 'g-1',
    topic: 'Evening restlessness',
    title: 'Managing Sundowning & Late Afternoon Agitation',
    body: 'Dimming light can cause disorientation. Turn on warm indoor lights before dusk, reduce background noise (turn off loud TVs), offer a warm cup of mild tea or milk, and play familiar calming music like flute or prayer melodies.',
    source: 'WHO iSupport Manual (Module 4.2)',
    verified: true,
  },
  {
    id: 'g-2',
    topic: 'Repeated questions',
    title: 'Responding to Repeated Inquiries Patiently',
    body: 'Repeated questions usually stem from anxiety or seeking reassurance, not forgetfulness alone. Answer the emotion behind the question ("You are safe, everything is taken care of") rather than pointing out they already asked.',
    source: "Alzheimer's Society Care Guidelines",
    verified: true,
  },
  {
    id: 'g-3',
    topic: 'Mealtime refusal',
    title: 'Encouraging Gentle Nourishment & Familiar Flavors',
    body: 'Use traditional bell-metal or familiar earthen ware that contrasts clearly with the food. Keep portions small and comforting. Eat together sitting on the veranda or dining table rather than urging them to eat alone.',
    source: 'National Institute on Aging (Geriatric Nutrition)',
    verified: true,
  },
  {
    id: 'g-4',
    topic: 'Hydration tips',
    title: 'Gentle Reminders for Regular Water Intake',
    body: 'Elders often lose their natural sensation of thirst. Offer small sips of warm water, lemon water, or mild tea frequently in a light cup rather than large glasses that may feel overwhelming.',
    source: 'WHO iSupport Manual (Module 3.1)',
    verified: true,
  },
  {
    id: 'g-5',
    topic: 'Bathing dignity',
    title: 'Preserving Dignity During Personal Care',
    body: 'Ensure the bathroom is warm and well-lit. Play soft music and wrap them in a warm Gamosa or towel. Wash in gentle steps, explaining what you are doing in soft, affectionate tones.',
    source: 'Dementia UK (Dignity in Care)',
    verified: true,
  },
  {
    id: 'g-6',
    topic: 'Caring for yourself',
    title: 'Caregiver Respite & Emotional Boundaries',
    body: 'Caregiving is a marathon. Share tasks with family members like Rahul, take a 15-minute quiet walk every morning, and remember that taking care of yourself is essential for Aita’s well-being.',
    source: 'Family Caregiver Alliance',
    verified: true,
  },
];

export const GuideScreen: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);

  const topicChips = [
    'Evening restlessness',
    'Repeated questions',
    'Mealtime refusal',
    'Hydration tips',
    'Bathing dignity',
    'Caring for yourself',
  ];

  const filteredItems = GUIDE_KNOWLEDGE_BASE.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.body.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.topic.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTopic = selectedTopic ? item.topic === selectedTopic : true;
    return matchesSearch && matchesTopic;
  });

  // Check for emergency / out-of-scope triggers as per Section 6.1
  const isEmergencyQuery = /\b(emergency|unconscious|chest pain|fall|bleeding|112|danger)\b/i.test(
    searchQuery
  );
  const isMedicalDiagnosisQuery = /\b(cure|stage|mri|drug dose|prescription|diagnos|pills dosage)\b/i.test(
    searchQuery
  );

  return (
    <div className="w-full flex flex-col pb-28 animate-in fade-in duration-300">
      {/* Header */}
      <div className="mb-5 text-left">
        <h2 className="text-2xl sm:text-3xl font-bold text-[#1E293B] dark:text-slate-100 tracking-tight">
          Caregiver Guide
        </h2>
        <p className="text-xs sm:text-sm text-[#475569] dark:text-slate-400 mt-0.5">
          Verified, evidence-based practical guidance for supporting Aita
        </p>
      </div>

      {/* Search Input */}
      <div className="relative w-full mb-4">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Ask about caring for Aita (e.g. evening restlessness, water)..."
          className="w-full pl-11 pr-4 py-3.5 rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-[#00524d] shadow-sm"
        />
      </div>

      {/* Topic Chips */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => {
            sound.playChime('gentle');
            setSelectedTopic(null);
          }}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            selectedTopic === null
              ? 'bg-[#00524d] text-white shadow-sm'
              : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
          }`}
          type="button"
        >
          All Topics
        </button>
        {topicChips.map((chip) => (
          <button
            key={chip}
            onClick={() => {
              sound.playChime('gentle');
              setSelectedTopic(selectedTopic === chip ? null : chip);
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              selectedTopic === chip
                ? 'bg-[#00524d] text-white shadow-sm'
                : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-slate-400'
            }`}
            type="button"
          >
            {chip}
          </button>
        ))}
      </div>

      {/* Safety Banner: Emergency (Section 6.1) */}
      {isEmergencyQuery && (
        <div className="mb-5 p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border-2 border-rose-500 text-rose-950 dark:text-rose-200 flex items-start gap-3 shadow-md">
          <PhoneCall className="w-6 h-6 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold text-sm">Emergency Safety Notice</h4>
            <p className="text-xs sm:text-sm font-semibold mt-1">
              If someone may be in danger, call 112 or your local emergency service now.
            </p>
          </div>
        </div>
      )}

      {/* Safety Banner: Out of Scope (Section 6.1) */}
      {isMedicalDiagnosisQuery && (
        <div className="mb-5 p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-700 text-amber-950 dark:text-amber-200 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold text-sm">Clinical Boundary Notice</h4>
            <p className="text-xs sm:text-sm mt-0.5">
              I can't help with diagnosis, dementia stage, or medicines. Please speak to a doctor or health worker.
            </p>
          </div>
        </div>
      )}

      {/* Results as GuidanceCards with SourceBadge */}
      <div className="flex flex-col gap-4">
        {filteredItems.length === 0 ? (
          <div className="p-8 text-center bg-white dark:bg-slate-800 rounded-3xl border border-[#E2DCD5] dark:border-slate-700">
            <BookOpen className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <h4 className="font-bold text-base text-slate-800 dark:text-slate-200">
              No specific guidance match found
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
              I couldn't find approved guidance for that. Please ask your doctor, a health worker, or see WHO iSupport.
            </p>
          </div>
        ) : (
          filteredItems.map((item) => (
            <div
              key={item.id}
              className="bg-white dark:bg-slate-800 rounded-3xl p-5 sm:p-6 border border-[#E2DCD5] dark:border-slate-700/80 shadow-sm flex flex-col gap-3"
            >
              <div className="flex items-start justify-between gap-3">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#E8F5E9] dark:bg-emerald-950/80 text-[#2D6A4F] dark:text-emerald-400">
                  {item.topic}
                </span>

                {/* SourceBadge with verification indicator */}
                <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{item.source}</span>
                </div>
              </div>

              <div>
                <h3 className="font-bold text-lg text-[#1E293B] dark:text-slate-100">
                  {item.title}
                </h3>
                <p className="text-sm text-[#475569] dark:text-slate-300 mt-2 leading-relaxed">
                  {item.body}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
