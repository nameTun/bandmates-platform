import React, { useState } from 'react';

/* ──── Mock Data ──── */

const mockEssays = [
  { id: 1, task: 'Task 2', topic: 'Environment & Climate Change', band: 7.0, date: '2 Tháng 4, 2026', wordCount: 287, prompt: 'Some people believe that climate change is the most pressing issue...', scores: { tr: 7, cc: 7, lr: 7, gra: 7 } },
  { id: 2, task: 'Task 1', topic: 'Line Graph — Internet Usage', band: 6.5, date: '1 Tháng 4, 2026', wordCount: 168, prompt: 'The chart below shows the percentage of households with internet access...', scores: { tr: 7, cc: 6, lr: 7, gra: 6 } },
  { id: 3, task: 'Task 2', topic: 'Technology & Education', band: 7.5, date: '31 Tháng 3, 2026', wordCount: 312, prompt: 'Technology is increasingly being used in the classroom. Discuss the advantages...', scores: { tr: 8, cc: 7, lr: 8, gra: 7 } },
  { id: 4, task: 'Task 1', topic: 'Pie Chart — Energy Sources', band: 6.0, date: '30 Tháng 3, 2026', wordCount: 155, prompt: 'The pie charts below compare the sources of electricity in two countries...', scores: { tr: 6, cc: 6, lr: 6, gra: 6 } },
  { id: 5, task: 'Task 2', topic: 'Health & Lifestyle', band: 6.5, date: '29 Tháng 3, 2026', wordCount: 264, prompt: 'In many developed countries, people lead increasingly sedentary lifestyles...', scores: { tr: 7, cc: 6, lr: 7, gra: 6 } },
  { id: 6, task: 'Task 2', topic: 'Society & Urbanization', band: 7.0, date: '28 Tháng 3, 2026', wordCount: 290, prompt: 'More and more people are moving to cities. What problems does this cause...', scores: { tr: 7, cc: 7, lr: 7, gra: 7 } },
];

const mockWords = [
  { word: 'significant', phonetic: '/sɪɡˈnɪfɪkənt/', type: 'adj', date: '2 Tháng 4, 2026' },
  { word: 'abundant', phonetic: '/əˈbʌndənt/', type: 'adj', date: '2 Tháng 4, 2026' },
  { word: 'deteriorate', phonetic: '/dɪˈtɪəriəreɪt/', type: 'verb', date: '1 Tháng 4, 2026' },
  { word: 'exacerbate', phonetic: '/ɪɡˈzæsəbeɪt/', type: 'verb', date: '1 Tháng 4, 2026' },
  { word: 'mitigate', phonetic: '/ˈmɪtɪɡeɪt/', type: 'verb', date: '31 Tháng 3, 2026' },
  { word: 'unprecedented', phonetic: '/ʌnˈpresɪdentɪd/', type: 'adj', date: '31 Tháng 3, 2026' },
  { word: 'resilience', phonetic: '/rɪˈzɪliəns/', type: 'noun', date: '30 Tháng 3, 2026' },
  { word: 'paradigm', phonetic: '/ˈpærədaɪm/', type: 'noun', date: '30 Tháng 3, 2026' },
  { word: 'encompass', phonetic: '/ɪnˈkʌmpəs/', type: 'verb', date: '29 Tháng 3, 2026' },
  { word: 'pragmatic', phonetic: '/præɡˈmætɪk/', type: 'adj', date: '29 Tháng 3, 2026' },
];

/* ──── Helpers ──── */

const bandColor = (b: number) => {
  if (b >= 7) return 'text-emerald-600 bg-emerald-50 border-emerald-200';
  if (b >= 6) return 'text-amber-600 bg-amber-50 border-amber-200';
  return 'text-red-600 bg-red-50 border-red-200';
};

const criteriaLabel: Record<string, string> = { tr: 'Task', cc: 'Coherence', lr: 'Lexical', gra: 'Grammar' };

const criteriaColor = (s: number) => {
  if (s >= 7) return 'bg-emerald-400';
  if (s >= 6) return 'bg-amber-400';
  return 'bg-red-400';
};

const typeColor: Record<string, string> = {
  adj: 'text-indigo-600 bg-indigo-50',
  verb: 'text-emerald-600 bg-emerald-50',
  noun: 'text-amber-600 bg-amber-50',
  adv: 'text-violet-600 bg-violet-50',
};

/* ──── Components ──── */

const HistoryPage: React.FC = () => {
  const [tab, setTab] = useState<'essays' | 'words'>('essays');
  const [expandedEssay, setExpandedEssay] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-5xl mx-auto px-6 py-10">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-1">Lịch sử</h1>
            <p className="text-slate-500">Xem lại các bài viết đã chấm và từ vựng đã tra cứu.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-white border border-slate-200 rounded-xl p-1 flex shadow-sm">
              <button
                onClick={() => setTab('essays')}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                  tab === 'essays' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Bài viết ({mockEssays.length})
              </button>
              <button
                onClick={() => setTab('words')}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                  tab === 'words' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Từ vựng ({mockWords.length})
              </button>
            </div>
          </div>
        </div>

        {/* ═══ ESSAYS TAB ═══ */}
        {tab === 'essays' && (
          <>
            {/* Stats summary */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              {[
                { label: 'Tổng bài', value: mockEssays.length, icon: '📝' },
                { label: 'Band TB', value: (mockEssays.reduce((a, e) => a + e.band, 0) / mockEssays.length).toFixed(1), icon: '📊' },
                { label: 'Band cao nhất', value: Math.max(...mockEssays.map(e => e.band)).toFixed(1), icon: '🏆' },
              ].map(s => (
                <div key={s.label} className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex items-center gap-3">
                  <span className="text-2xl">{s.icon}</span>
                  <div>
                    <p className="text-xl font-extrabold text-slate-900">{s.value}</p>
                    <p className="text-xs text-slate-500 font-medium">{s.label}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Essay list */}
            <div className="space-y-3">
              {mockEssays.map(essay => {
                const isExpanded = expandedEssay === essay.id;
                return (
                  <div
                    key={essay.id}
                    className={`bg-white rounded-2xl border transition-all duration-300 overflow-hidden ${
                      isExpanded ? 'border-indigo-200 shadow-lg shadow-indigo-100/50' : 'border-slate-200 shadow-sm hover:shadow-md'
                    }`}
                  >
                    {/* Main row */}
                    <button
                      onClick={() => setExpandedEssay(isExpanded ? null : essay.id)}
                      className="w-full flex items-center gap-4 p-5 text-left hover:bg-slate-50/50 transition-colors"
                    >
                      {/* Task icon */}
                      <div className="w-11 h-11 rounded-xl bg-slate-100 flex items-center justify-center text-lg flex-shrink-0">
                        {essay.task === 'Task 1' ? '📊' : '📝'}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-xs font-bold text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded-full">{essay.task}</span>
                          <span className="text-sm font-semibold text-slate-800 truncate">{essay.topic}</span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-slate-400">
                          <span>{essay.date}</span>
                          <span>·</span>
                          <span>{essay.wordCount} từ</span>
                        </div>
                      </div>

                      {/* Band score */}
                      <span className={`text-lg font-extrabold px-3.5 py-1 rounded-xl border ${bandColor(essay.band)} flex-shrink-0`}>
                        {essay.band.toFixed(1)}
                      </span>

                      {/* Chevron */}
                      <svg className={`w-5 h-5 text-slate-400 transition-transform duration-300 flex-shrink-0 ${isExpanded ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>

                    {/* Expanded content */}
                    {isExpanded && (
                      <div className="px-5 pb-5 border-t border-slate-100 pt-4 animate-in">
                        {/* Prompt */}
                        <div className="bg-slate-50 rounded-xl p-4 mb-4 border border-slate-100">
                          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Đề bài</p>
                          <p className="text-sm text-slate-700 leading-relaxed">{essay.prompt}</p>
                        </div>

                        {/* Criteria scores */}
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Điểm chi tiết</p>
                        <div className="grid grid-cols-4 gap-3 mb-4">
                          {Object.entries(essay.scores).map(([key, val]) => (
                            <div key={key} className="bg-slate-50 rounded-xl p-3 border border-slate-100 text-center">
                              <p className="text-xs text-slate-500 font-medium mb-1">{criteriaLabel[key]}</p>
                              <p className="text-xl font-extrabold text-slate-900">{val}.0</p>
                              <div className="mt-2 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                                <div className={`h-full rounded-full ${criteriaColor(val)}`} style={{ width: `${(val / 9) * 100}%` }} />
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3">
                          <button className="flex-1 px-4 py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white font-bold text-sm rounded-xl transition-colors flex items-center justify-center gap-2 shadow-sm">
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            Xem chi tiết
                          </button>
                          <button className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm rounded-xl transition-colors flex items-center gap-2">
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                            Tải PDF
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* ═══ WORDS TAB ═══ */}
        {tab === 'words' && (
          <>
            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              {[
                { label: 'Tổng từ đã tra', value: mockWords.length, icon: '📚' },
                { label: 'Hôm nay', value: mockWords.filter(w => w.date.includes('2 Tháng 4')).length, icon: '📅' },
                { label: 'Loại từ phổ biến', value: 'Adjective', icon: '🏷️' },
              ].map(s => (
                <div key={s.label} className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex items-center gap-3">
                  <span className="text-2xl">{s.icon}</span>
                  <div>
                    <p className="text-xl font-extrabold text-slate-900">{s.value}</p>
                    <p className="text-xs text-slate-500 font-medium">{s.label}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Words grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {mockWords.map((w, i) => (
                <div
                  key={i}
                  className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all cursor-pointer group"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="text-lg font-extrabold text-slate-900 group-hover:text-indigo-600 transition-colors">{w.word}</h3>
                      <p className="text-sm text-indigo-500 font-medium">{w.phonetic}</p>
                    </div>
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide ${typeColor[w.type] || 'text-slate-600 bg-slate-50'}`}>
                      {w.type}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-xs text-slate-400">{w.date}</span>
                    <button className="text-xs font-semibold text-indigo-500 hover:text-indigo-700 opacity-0 group-hover:opacity-100 transition-all flex items-center gap-1">
                      Tra lại
                      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

      </div>
    </div>
  );
};

export default HistoryPage;
