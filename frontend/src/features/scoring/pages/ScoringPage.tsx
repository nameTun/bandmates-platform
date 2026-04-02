import React, { useState } from 'react';
import { ScoringService } from '@/features/scoring/services/scoring.service';
import { useAuthStore } from '@/features/auth/store/useAuthStore';

/* ──────────── TYPES ──────────── */

interface Correction {
  original: string;
  corrected: string;
  explanation: string;
  type?: 'grammar' | 'vocabulary' | 'cohesion' | 'task';
}

interface AIResponse {
  score: number;
  feedback: string;
  corrections: Correction[];
  betterVersion: string;
}

type TaskType = 'task1' | 'task2';

/* ──────────── DATA ──────────── */

const taskInfo = {
  task1: {
    title: 'Task 1 — Mô tả dữ liệu',
    subtitle: 'Summarize visual information',
    minWords: 150,
    time: '20 phút',
    description: 'Mô tả, phân tích và so sánh dữ liệu từ biểu đồ, bảng, sơ đồ hoặc bản đồ. Bạn cần trình bày các xu hướng chính, khác biệt và đặc điểm nổi bật.',
    topics: [
      { icon: '📊', name: 'Bar Chart', desc: 'So sánh dữ liệu giữa nhiều nhóm' },
      { icon: '📈', name: 'Line Graph', desc: 'Xu hướng thay đổi theo thời gian' },
      { icon: '🥧', name: 'Pie Chart', desc: 'Tỷ lệ phần trăm và phân bố' },
      { icon: '📋', name: 'Table', desc: 'Dữ liệu dạng bảng so sánh' },
      { icon: '🔄', name: 'Process', desc: 'Quy trình sản xuất hoặc tự nhiên' },
      { icon: '🗺️', name: 'Map', desc: 'Biến đổi địa lý qua thời gian' },
    ],
    prompts: [
      'The chart below shows the percentage of households in two European countries that had internet access between 2010 and 2020. Summarize the information by selecting and reporting the main features, and make comparisons where relevant.',
      'The bar chart below shows the number of visitors to three London museums between 2007 and 2012. Summarize the information by selecting and reporting the main features.',
      'The diagram below shows the process of making chocolate. Summarize the information by selecting and reporting the main features.',
    ],
  },
  task2: {
    title: 'Task 2 — Viết luận',
    subtitle: 'Essay writing',
    minWords: 250,
    time: '40 phút',
    description: 'Viết bài luận trình bày quan điểm về một vấn đề xã hội. Bạn cần đưa ra lập luận rõ ràng, dẫn chứng cụ thể và kết luận mạch lạc.',
    topics: [
      { icon: '🌍', name: 'Environment', desc: 'Ô nhiễm, biến đổi khí hậu, năng lượng' },
      { icon: '💻', name: 'Technology', desc: 'AI, mạng xã hội, tự động hóa' },
      { icon: '🎓', name: 'Education', desc: 'Hệ thống giáo dục, phương pháp học' },
      { icon: '🏥', name: 'Health', desc: 'Y tế công cộng, lối sống, dinh dưỡng' },
      { icon: '🏙️', name: 'Society', desc: 'Đô thị hóa, tội phạm, bất bình đẳng' },
      { icon: '💼', name: 'Work', desc: 'Thất nghiệp, work-life balance' },
    ],
    prompts: [
      'Some people believe that the best way to learn a language is to live in the country where it is spoken. To what extent do you agree or disagree?',
      'In many countries, the gap between the rich and the poor is increasing. What problems does this cause? What solutions can be proposed?',
      'Some people think that governments should invest more money in public transport. Others think it is better to build more roads for cars. Discuss both views and give your opinion.',
    ],
  },
};

const typeConfig: Record<string, { label: string; bg: string }> = {
  grammar: { label: 'Grammar', bg: 'bg-red-100 text-red-700' },
  vocabulary: { label: 'Vocabulary', bg: 'bg-indigo-100 text-indigo-700' },
  cohesion: { label: 'Cohesion', bg: 'bg-amber-100 text-amber-700' },
  task: { label: 'Task Response', bg: 'bg-emerald-100 text-emerald-700' },
};

/* ──────────── TASK SELECTION SCREEN ──────────── */

const TaskSelection: React.FC<{ onSelect: (task: TaskType, prompt: string) => void }> = ({ onSelect }) => {
  const [hoveredTask, setHoveredTask] = useState<TaskType | null>(null);

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-5xl mx-auto px-6 py-12">

        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-600 text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wider mb-4 border border-indigo-100">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
            IELTS Writing Practice
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight mb-3">
            Chọn dạng bài luyện tập
          </h1>
          <p className="text-slate-500 max-w-xl mx-auto">
            IELTS Writing gồm 2 phần. Chọn dạng bài bạn muốn luyện, hệ thống sẽ tự điều chỉnh tiêu chí chấm điểm phù hợp.
          </p>
        </div>

        {/* Task Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {(['task1', 'task2'] as TaskType[]).map(taskKey => {
            const task = taskInfo[taskKey];
            const isHovered = hoveredTask === taskKey;
            const randomPrompt = task.prompts[Math.floor(Math.random() * task.prompts.length)];

            return (
              <div
                key={taskKey}
                className={`relative bg-white rounded-2xl border transition-all duration-300 cursor-pointer group overflow-hidden ${
                  isHovered
                    ? 'border-indigo-300 shadow-xl shadow-indigo-100 scale-[1.02]'
                    : 'border-slate-200 shadow-sm hover:shadow-lg'
                }`}
                onMouseEnter={() => setHoveredTask(taskKey)}
                onMouseLeave={() => setHoveredTask(null)}
                onClick={() => onSelect(taskKey, randomPrompt)}
              >
                {/* Top accent */}
                <div className={`h-1.5 transition-all duration-300 ${
                  isHovered
                    ? 'bg-gradient-to-r from-indigo-500 to-violet-500'
                    : 'bg-slate-100'
                }`} />

                <div className="p-7">
                  {/* Title row */}
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h2 className="text-xl font-extrabold text-slate-900 mb-1">{task.title}</h2>
                      <p className="text-sm text-slate-500 font-medium">{task.subtitle}</p>
                    </div>
                    <div className="flex gap-2">
                      <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
                        {task.minWords}+ từ
                      </span>
                      <span className="text-[11px] font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full">
                        ⏱ {task.time}
                      </span>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-slate-600 leading-relaxed mb-5">{task.description}</p>

                  {/* Topic chips */}
                  <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3">Các dạng chủ đề phổ biến</h4>
                  <div className="grid grid-cols-2 gap-2 mb-5">
                    {task.topics.map(topic => (
                      <div key={topic.name} className="flex items-center gap-2.5 bg-slate-50 rounded-lg px-3 py-2 border border-slate-100">
                        <span className="text-lg">{topic.icon}</span>
                        <div>
                          <p className="text-xs font-bold text-slate-700">{topic.name}</p>
                          <p className="text-[11px] text-slate-400">{topic.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* CTA */}
                  <button className={`w-full py-3 rounded-xl font-bold text-sm transition-all duration-300 flex items-center justify-center gap-2 ${
                    isHovered
                      ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-200'
                      : 'bg-slate-100 text-slate-600 group-hover:bg-indigo-50 group-hover:text-indigo-600'
                  }`}>
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                    Bắt đầu luyện {taskKey === 'task1' ? 'Task 1' : 'Task 2'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Scoring criteria info */}
        <div className="bg-white rounded-2xl border border-slate-200 p-7 shadow-sm">
          <h3 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
            <svg className="w-4 h-4 text-indigo-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            4 tiêu chí chấm điểm IELTS Writing
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { name: 'Task Response', desc: 'Trả lời đúng yêu cầu đề', color: 'text-emerald-600 bg-emerald-50 border-emerald-100' },
              { name: 'Coherence', desc: 'Mạch lạc & liên kết', color: 'text-indigo-600 bg-indigo-50 border-indigo-100' },
              { name: 'Lexical Resource', desc: 'Vốn từ vựng', color: 'text-amber-600 bg-amber-50 border-amber-100' },
              { name: 'Grammar', desc: 'Ngữ pháp đa dạng & chính xác', color: 'text-red-600 bg-red-50 border-red-100' },
            ].map(c => (
              <div key={c.name} className={`rounded-xl px-4 py-3 border ${c.color}`}>
                <p className="text-xs font-bold">{c.name}</p>
                <p className="text-[11px] opacity-70 mt-0.5">{c.desc}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

/* ──────────── WRITING EDITOR ──────────── */

const WritingEditor: React.FC<{
  taskType: TaskType;
  prompt: string;
  onBack: () => void;
}> = ({ taskType, prompt, onBack }) => {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AIResponse | null>(null);
  const [activeTab, setActiveTab] = useState<'mistakes' | 'feedback' | 'improved'>('mistakes');
  const { isAuthenticated } = useAuthStore();

  const task = taskInfo[taskType];
  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
  const isEnough = wordCount >= task.minWords;

  const handleAnalyze = async () => {
    if (!text.trim() || text.length < 10) return;
    setLoading(true);
    setResult(null);
    try {
      const data = await ScoringService.checkIelts(text);
      setResult(data.data);
      setActiveTab('mistakes');
    } catch { /* handled by interceptor */ }
    finally { setLoading(false); }
  };

  const scoreColor = (s: number) => s >= 7 ? 'text-emerald-500' : s >= 5 ? 'text-amber-500' : 'text-red-500';
  const scoreRingColor = (s: number) => s >= 7 ? '#10b981' : s >= 5 ? '#f59e0b' : '#ef4444';
  const scorePercent = result ? (result.score / 9) * 100 : 0;

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">

      {/* ═══ LEFT — Editor ═══ */}
      <div className="flex-1 flex flex-col overflow-y-auto">
        <div className="flex-1 p-6 md:p-10 max-w-4xl mx-auto w-full">

          {/* Back + Task info */}
          <div className="flex items-center gap-3 mb-6">
            <button onClick={onBack} className="p-2 rounded-lg hover:bg-slate-200 text-slate-400 hover:text-slate-700 transition-colors">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-slate-800">{taskType === 'task1' ? 'Task 1' : 'Task 2'}</span>
              <span className="text-[11px] font-bold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full">{task.minWords}+ từ</span>
              <span className="text-[11px] font-bold text-indigo-500 bg-indigo-50 px-2.5 py-1 rounded-full">⏱ {task.time}</span>
              {!isAuthenticated && (
                <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2.5 py-1 rounded-full uppercase">Guest</span>
              )}
            </div>
          </div>

          {/* Prompt */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm mb-6">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              {taskType === 'task1' ? 'Task 1 Prompt' : 'Task 2 Prompt'}
            </h3>
            <p className="text-slate-800 font-medium leading-relaxed">{prompt}</p>
          </div>

          {/* Editor */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm min-h-[400px] relative flex flex-col focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-300 transition-all">
            <div className="flex items-center gap-1 p-2.5 border-b border-slate-100 bg-slate-50/50 rounded-t-xl">
              <div className="flex-1" />
              <span className={`text-xs px-3 font-semibold transition-colors ${isEnough ? 'text-emerald-500' : 'text-slate-400'}`}>
                {wordCount} / {task.minWords}+ từ
                {isEnough && <span className="ml-1">✓</span>}
              </span>
            </div>
            <textarea
              className="flex-1 w-full resize-none border-none p-6 focus:ring-0 focus:outline-none bg-transparent text-base leading-relaxed text-slate-800 placeholder:text-slate-300 min-h-[350px]"
              placeholder="Bắt đầu viết bài của bạn ở đây..."
              value={text}
              onChange={e => setText(e.target.value)}
            />
          </div>

          {/* Floating Action */}
          <div className="sticky bottom-6 flex justify-center mt-6 z-10 pointer-events-none">
            <div className="pointer-events-auto shadow-lg shadow-slate-200 rounded-xl bg-white p-1.5 flex gap-2 border border-slate-200">
              <button
                onClick={handleAnalyze}
                disabled={!text.trim() || text.length < 10 || loading}
                className="bg-indigo-500 hover:bg-indigo-600 disabled:bg-slate-300 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-bold flex items-center gap-2 shadow-lg shadow-indigo-500/20 transition-all active:scale-95"
              >
                {loading ? (
                  <>
                    <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Đang phân tích...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                    Phân tích với AI
                  </>
                )}
              </button>
            </div>
          </div>
          <div className="h-10" />
        </div>
      </div>

      {/* ═══ RIGHT — AI Analysis ═══ */}
      <aside className={`w-[400px] bg-white border-l border-slate-200 flex-col hidden lg:flex shadow-[-4px_0_24px_rgba(0,0,0,0.02)] flex-shrink-0 ${!result ? 'items-center justify-center' : ''}`}>
        {!result ? (
          <div className="text-center px-8">
            <div className="w-20 h-20 rounded-2xl bg-indigo-50 flex items-center justify-center mx-auto mb-5">
              <svg className="w-10 h-10 text-indigo-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-2">Chưa có phân tích</h3>
            <p className="text-sm text-slate-500 leading-relaxed">
              Viết bài ở bên trái và nhấn <span className="font-semibold text-indigo-500">"Phân tích với AI"</span> để nhận kết quả.
            </p>
          </div>
        ) : (
          <>
            {/* Score */}
            <div className="p-6 border-b border-slate-100 flex flex-col items-center bg-slate-50/50">
              <div className="relative w-28 h-28 mb-4">
                <svg className="w-28 h-28 -rotate-90" viewBox="0 0 120 120">
                  <circle cx="60" cy="60" r="52" fill="none" stroke="#e2e8f0" strokeWidth="8" />
                  <circle cx="60" cy="60" r="52" fill="none" stroke={scoreRingColor(result.score)} strokeWidth="8" strokeLinecap="round" strokeDasharray={`${scorePercent * 3.267} 326.7`} className="transition-all duration-1000" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className={`text-3xl font-extrabold ${scoreColor(result.score)}`}>{result.score}</span>
                  <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Band Score</span>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-slate-100 px-4 bg-white sticky top-0 z-10">
              {[
                { id: 'mistakes' as const, label: 'Lỗi sai', count: result.corrections.length },
                { id: 'feedback' as const, label: 'Nhận xét' },
                { id: 'improved' as const, label: 'Bản cải thiện' },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 pb-3 pt-3 text-sm font-semibold transition-all border-b-2 ${
                    activeTab === tab.id ? 'text-indigo-600 border-indigo-500' : 'text-slate-400 border-transparent hover:text-slate-600'
                  }`}
                >
                  {tab.label}
                  {tab.count !== undefined && tab.count > 0 && (
                    <span className="ml-1.5 bg-red-100 text-red-600 text-[10px] font-bold px-1.5 py-0.5 rounded-full">{tab.count}</span>
                  )}
                </button>
              ))}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-5">
              {activeTab === 'mistakes' && (
                <div className="flex flex-col gap-3">
                  {result.corrections.length === 0 ? (
                    <div className="text-center py-10">
                      <div className="text-4xl mb-3">🎉</div>
                      <p className="text-sm font-semibold text-slate-600">Không tìm thấy lỗi!</p>
                    </div>
                  ) : (
                    result.corrections.map((c, i) => {
                      const t = typeConfig[c.type || 'grammar'] || typeConfig.grammar;
                      return (
                        <div key={i} className="bg-slate-50 rounded-xl p-4 border border-slate-100 hover:shadow-md transition-shadow">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wide ${t.bg}`}>{t.label}</span>
                          <div className="mt-2 mb-2.5">
                            <div className="text-sm text-slate-500 line-through decoration-red-400 decoration-2">{c.original}</div>
                            <div className="text-sm font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 -mx-1 rounded inline-block mt-1">{c.corrected}</div>
                          </div>
                          <p className="text-xs text-slate-500 leading-relaxed">{c.explanation}</p>
                        </div>
                      );
                    })
                  )}
                </div>
              )}
              {activeTab === 'feedback' && (
                <div className="bg-slate-50 rounded-xl p-5 border border-slate-100">
                  <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">{result.feedback}</p>
                </div>
              )}
              {activeTab === 'improved' && (
                <div className="bg-emerald-50 rounded-xl p-5 border border-emerald-100">
                  <h4 className="text-xs font-bold text-emerald-700 uppercase tracking-wider mb-3">Phiên bản cải thiện</h4>
                  <p className="text-sm text-slate-700 leading-relaxed italic whitespace-pre-line">"{result.betterVersion}"</p>
                </div>
              )}
            </div>
          </>
        )}
      </aside>
    </div>
  );
};

/* ──────────── MAIN PAGE COMPONENT ──────────── */

const ScoringPage: React.FC = () => {
  const [selectedTask, setSelectedTask] = useState<{ type: TaskType; prompt: string } | null>(null);

  if (!selectedTask) {
    return <TaskSelection onSelect={(type, prompt) => setSelectedTask({ type, prompt })} />;
  }

  return (
    <WritingEditor
      taskType={selectedTask.type}
      prompt={selectedTask.prompt}
      onBack={() => setSelectedTask(null)}
    />
  );
};

export default ScoringPage;
