import React, { useState, useEffect, useMemo } from 'react';
import { ScoringService } from '@/features/scoring/services/scoring.service';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { practiceApi } from '@/features/practice/api/practice-api';
import type { Prompt, Topic, Category } from '@/features/practice/api/practice-api';
import { TaskType } from '@/common/enums/task-type.enum';
import { Spin } from 'antd';

/* ──────────── TYPES ──────────── */
interface Correction {
  original: string;
  corrected: string;
  explanation: string;
  type?: 'grammar' | 'vocabulary' | 'cohesion' | 'task';
}

interface AIResponse {
  scoreTA: number;
  scoreCC: number;
  scoreLR: number;
  scoreGRA: number;
  overallScore: number;
  feedback: {
    general: string;
    ta: string;
    cc: string;
    lr: string;
    gra: string;
  };
  corrections: Correction[];
  betterVersion: string;
}

const typeConfig: Record<string, { label: string; bg: string }> = {
  grammar: { label: 'Grammar', bg: 'bg-red-100 text-red-700' },
  vocabulary: { label: 'Vocabulary', bg: 'bg-indigo-100 text-indigo-700' },
  cohesion: { label: 'Cohesion', bg: 'bg-amber-100 text-amber-700' },
  task: { label: 'Task Response', bg: 'bg-emerald-100 text-emerald-700' },
};

const taskTypeLabel: Record<string, { text: string; color: string }> = {
  [TaskType.TASK_1_ACADEMIC]: { text: 'Task 1 Aca', color: 'bg-cyan-50 text-cyan-600 border-cyan-200' },
  [TaskType.TASK_1_GENERAL]: { text: 'Task 1 Gen', color: 'bg-teal-50 text-teal-600 border-teal-200' },
  [TaskType.TASK_2]: { text: 'Task 2', color: 'bg-violet-50 text-violet-600 border-violet-200' },
};

/* ──────────── PRACTICE LIBRARY SCREEN ──────────── */

const PracticeLibrary: React.FC<{ onSelect: (prompt: Prompt) => void }> = ({ onSelect }) => {
  const { isAuthenticated } = useAuthStore();
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [filterTask, setFilterTask] = useState<string>('all');
  const [filterTopic, setFilterTopic] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  useEffect(() => {
    fetchData();
  }, [isAuthenticated]); // refetch khi đổi state login (mặc dù bị giới hạn bởi backend)

  const fetchData = async () => {
    try {
      setLoading(true);
      const [pData, cData, tData] = await Promise.all([
        practiceApi.getPrompts(),
        practiceApi.getCategories(),
        practiceApi.getTopics()
      ]);
      setPrompts(pData);
      setCategories(cData);
      setTopics(tData);
    } catch (error) {
      console.error('Failed to load practice data', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPrompts = useMemo(() => {
    return prompts.filter(p => {
      const matchTask = filterTask === 'all' || p.taskType === filterTask;
      const matchTopic = filterTopic === 'all' || (p.topic?.id === filterTopic);
      const matchCategory = filterCategory === 'all' || (p.category?.id === filterCategory);
      return matchTask && matchTopic && matchCategory;
    });
  }, [prompts, filterTask, filterTopic, filterCategory]);

  const availableCategories = useMemo(() => {
    // If filterTask is 'all', you probably want all categories, 
    // but usually user selects a TaskType first to see relevant categories.
    if (filterTask === 'all') return categories;
    return categories.filter(c => c.taskType === filterTask);
  }, [categories, filterTask]);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* GUEST BANNER */}
      {!isAuthenticated && (
        <div className="bg-amber-100 border-b border-amber-200 px-4 py-3 flex items-center justify-center gap-3">
          <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span className="text-amber-800 text-sm font-medium">Bạn đang xem danh sách các đề thi mẫu (Free Sample). Đăng nhập để mở khoá 100% kho đề.</span>
          <a href="/login" className="px-3 py-1 bg-amber-500 hover:bg-amber-600 text-white rounded text-xs font-bold transition-colors">Đăng nhập</a>
        </div>
      )}

      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight mb-3">
            Thư viện Luyện tập IELTS
          </h1>
          <p className="text-slate-500 max-w-xl mx-auto">
            Chọn đề thi từ thư viện được tổng hợp bám sát cấu trúc đề thi thật. Viết và nhận điểm chi tiết từ AI.
          </p>
        </div>

        {loading ? (
          <div className="py-20 flex justify-center items-center flex-col gap-4">
            <Spin size="large" />
            <p className="text-slate-500">Đang tải kho đề thi...</p>
          </div>
        ) : (
          <div className="flex flex-col md:flex-row gap-8">
            {/* Sidebar Filters */}
            <div className="w-full md:w-64 flex-shrink-0">
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm sticky top-6">
                <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <svg className="w-4 h-4 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                  </svg>
                  Bộ lọc
                </h3>
                
                <div className="mb-6">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3 block">Loại phần thi (Task)</label>
                  <div className="flex flex-col gap-3">
                    <button onClick={() => { setFilterTask('all'); setFilterCategory('all'); setFilterTopic('all'); }} className={`text-left px-4 py-3 rounded-xl text-[13px] font-bold transition-all outline-none border-2 border-b-4 active:border-b-2 active:translate-y-[2px] ${filterTask === 'all' ? 'bg-indigo-50 border-indigo-300 text-indigo-700 shadow-sm' : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300 hover:text-slate-700'}`}>Tất cả các phần thi</button>
                    <button onClick={() => { setFilterTask(TaskType.TASK_2); setFilterCategory('all'); }} className={`text-left px-4 py-3 rounded-xl text-[13px] font-bold transition-all outline-none border-2 border-b-4 active:border-b-2 active:translate-y-[2px] ${filterTask === TaskType.TASK_2 ? 'bg-violet-50 border-violet-300 text-violet-700 shadow-sm' : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300 hover:text-slate-700'}`}>IELTS Task 2 (Essay)</button>
                    <button onClick={() => { setFilterTask(TaskType.TASK_1_ACADEMIC); setFilterCategory('all'); setFilterTopic('all'); }} className={`text-left px-4 py-3 rounded-xl text-[13px] font-bold transition-all outline-none border-2 border-b-4 active:border-b-2 active:translate-y-[2px] ${filterTask === TaskType.TASK_1_ACADEMIC ? 'bg-cyan-50 border-cyan-300 text-cyan-700 shadow-sm' : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300 hover:text-slate-700'}`}>Task 1 Academic</button>
                    <button onClick={() => { setFilterTask(TaskType.TASK_1_GENERAL); setFilterCategory('all'); setFilterTopic('all'); }} className={`text-left px-4 py-3 rounded-xl text-[13px] font-bold transition-all outline-none border-2 border-b-4 active:border-b-2 active:translate-y-[2px] ${filterTask === TaskType.TASK_1_GENERAL ? 'bg-teal-50 border-teal-300 text-teal-700 shadow-sm' : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300 hover:text-slate-700'}`}>Task 1 General</button>
                  </div>
                </div>

                <div className="mb-6">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 block">Dạng câu hỏi (Category)</label>
                  <select 
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="w-full bg-white border-2 border-b-4 border-slate-200 text-slate-700 text-[13px] font-bold rounded-xl px-4 py-3 outline-none hover:border-slate-300 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 transition-all appearance-none cursor-pointer shadow-sm active:translate-y-[2px] active:border-b-2"
                    style={{ backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%2394a3b8%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.7rem top 50%', backgroundSize: '0.65rem auto' }}
                  >
                    <option value="all">Tất cả dạng bài</option>
                    {availableCategories.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                {(filterTask === 'all' || filterTask === TaskType.TASK_2) && (
                  <div className="animate-in fade-in duration-300">
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 block">Chủ đề xã hội (Topic)</label>
                    <select 
                      value={filterTopic}
                      onChange={(e) => setFilterTopic(e.target.value)}
                      className="w-full bg-white border-2 border-b-4 border-slate-200 text-slate-700 text-[13px] font-bold rounded-xl px-4 py-3 outline-none hover:border-slate-300 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 transition-all appearance-none cursor-pointer shadow-sm active:translate-y-[2px] active:border-b-2"
                      style={{ backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%2394a3b8%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.7rem top 50%', backgroundSize: '0.65rem auto' }}
                    >
                      <option value="all">Tất cả chủ đề</option>
                      {topics.map(t => (
                        <option key={t.id} value={t.id}>{t.name}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            </div>

            {/* Prompt Grid */}
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-5">
              {filteredPrompts.length === 0 ? (
                <div className="col-span-full py-16 text-center bg-white rounded-xl border border-slate-200 border-dashed">
                  <p className="text-slate-500 font-medium">Không có đề bài nào khớp với bộ lọc.</p>
                </div>
              ) : (
                filteredPrompts.map(prompt => {
                  const tt = taskTypeLabel[prompt.taskType] || taskTypeLabel[TaskType.TASK_2];
                  return (
                    <div 
                      key={prompt.id}
                      onClick={() => onSelect(prompt)}
                      className="bg-white p-7 rounded-2xl border-2 border-b-[6px] border-slate-200 hover:border-indigo-300 hover:border-b-[6px] hover:-translate-y-1.5 hover:shadow-xl hover:shadow-indigo-500/10 transition-all cursor-pointer flex flex-col group active:translate-y-[2px] active:border-b-2"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex flex-wrap gap-2">
                          <span className={`text-[10px] font-bold px-2 py-1 rounded border ${tt.color} uppercase tracking-wide`}>
                            {tt.text}
                          </span>
                          <span className="text-[10px] font-semibold text-slate-600 bg-slate-100 border border-slate-200 px-2 py-1 rounded">
                            {prompt.category?.name}
                          </span>
                        </div>
                        {prompt.isFreeSample && (
                          <span className="text-[9px] font-extrabold text-green-600 bg-green-50 px-2 py-1 rounded border border-green-200 uppercase tracking-widest">
                            Free
                          </span>
                        )}
                      </div>
                      <p className="text-slate-800 text-sm font-medium line-clamp-4 leading-relaxed group-hover:text-indigo-900 transition-colors mb-4 flex-1">
                        "{prompt.content}"
                      </p>
                      
                      <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between">
                        {prompt.topic ? (
                          <div className="flex items-center gap-1.5 text-slate-500">
                            <span className="text-xs bg-slate-50 border border-slate-200 px-2.5 py-0.5 rounded-full">{prompt.topic.name}</span>
                          </div>
                        ) : (
                          <div />
                        )}
                        <span className="text-xs font-bold text-indigo-500 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity translate-x-2 group-hover:translate-x-0">
                          Làm bài 
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                          </svg>
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

/* ──────────── WRITING EDITOR ──────────── */

const WritingEditor: React.FC<{
  promptObj: Prompt;
  onBack: () => void;
}> = ({ promptObj, onBack }) => {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AIResponse | null>(null);
  const [activeTab, setActiveTab] = useState<'mistakes' | 'feedback' | 'improved'>('mistakes');
  const [timeSpent, setTimeSpent] = useState(0);
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    // Only increment timer if we haven't received a result yet
    if (result) return;
    
    const interval = setInterval(() => {
      setTimeSpent(prev => prev + 1);
    }, 1000);
    
    return () => clearInterval(interval);
  }, [result]);

  const isTask1 = promptObj.taskType !== TaskType.TASK_2;
  const minWords = isTask1 ? 150 : 250;
  const time = isTask1 ? '20 phút' : '40 phút';

  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
  const isEnough = wordCount >= minWords;

  const handleAnalyze = async () => {
    if (!text.trim() || text.length < 10) return;
    setLoading(true);
    setResult(null);
    try {
      const data = await ScoringService.checkIelts(text, promptObj.id, timeSpent);
      setResult(data.data);
      setActiveTab('mistakes');
    } catch { /* handled */ }
    finally { setLoading(false); }
  };

  const scoreColor = (s: number) => s >= 7 ? 'text-emerald-500' : s >= 5 ? 'text-amber-500' : 'text-red-500';
  const scoreRingColor = (s: number) => s >= 7 ? '#10b981' : s >= 5 ? '#f59e0b' : '#ef4444';
  const scorePercent = result ? (result.overallScore / 9) * 100 : 0;

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">

      {/* ═══ LEFT — Editor ═══ */}
      <div className="flex-1 flex flex-col overflow-y-auto">
        <div className="flex-1 p-6 md:p-10 max-w-4xl mx-auto w-full">

          {/* Back + Task info */}
          <div className="flex items-center gap-3 mb-6">
            <button onClick={onBack} className="p-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors shadow-sm">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div className="flex items-center gap-2">
              <span className="text-sm font-extrabold text-slate-800 tracking-tight">{isTask1 ? 'IELTS Task 1' : 'IELTS Task 2'}</span>
              <span className="text-[11px] font-bold text-slate-500 bg-slate-200/50 px-2.5 py-1 rounded-full uppercase tracking-wider border border-slate-200">{promptObj.category?.name}</span>
              <span className="text-[11px] font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-100">⏱ {time}</span>
              {!isAuthenticated && (
                <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2.5 py-1 rounded-full uppercase border border-amber-200">Guest</span>
              )}
            </div>
          </div>

          {/* Prompt */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm mb-6">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
              Chủ đề bài viết
            </h3>
            <p className="text-slate-800 font-semibold leading-relaxed text-[15px]">{promptObj.content}</p>
            {promptObj.imageUrl && (
              <div className="mt-4 p-4 bg-slate-50 rounded-xl border border-slate-100 flex justify-center">
                <img src={promptObj.imageUrl} alt="Prompt Image" className="max-w-full h-auto max-h-[300px] object-contain rounded-lg" />
              </div>
            )}
            {promptObj.topic && (
              <div className="mt-4 flex gap-2">
                <span className="text-[10px] font-bold px-2.5 py-1 uppercase tracking-wider text-slate-500 bg-slate-100 rounded-md">
                  Topic: {promptObj.topic.name}
                </span>
              </div>
            )}
          </div>

          {/* Editor */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm min-h-[400px] relative flex flex-col focus-within:ring-4 focus-within:ring-indigo-500/10 focus-within:border-indigo-400 transition-all">
            <div className="flex items-center gap-1 p-3 border-b border-slate-100 bg-slate-50/50 rounded-t-2xl">
              <div className="flex-1" />
              <span className={`text-[11px] px-3 font-bold uppercase tracking-wider transition-colors ${isEnough ? 'text-emerald-500' : 'text-slate-400'}`}>
                {wordCount} / {minWords}+ từ
                {isEnough && <span className="ml-1 text-base leading-none inline-block align-middle">✓</span>}
              </span>
            </div>
            <textarea
              className="flex-1 w-full flex-grow resize-none border-none p-6 focus:ring-0 focus:outline-none bg-transparent text-[15px] leading-8 text-slate-800 placeholder:text-slate-300 min-h-[350px]"
              placeholder="Bắt đầu gõ bài luận của bạn tại đây... Hãy thư giãn và làm tốt nhất có thể nhé!"
              value={text}
              onChange={e => setText(e.target.value)}
            />
          </div>

          {/* Floating Action */}
          <div className="sticky bottom-6 flex justify-center mt-6 z-10 pointer-events-none">
            <div className="pointer-events-auto shadow-[0_10px_40px_-10px_rgba(79,70,229,0.3)] rounded-2xl bg-white p-1.5 flex gap-2 border border-indigo-100">
              <button
                onClick={handleAnalyze}
                disabled={!text.trim() || text.length < 10 || loading}
                className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-white px-8 py-3.5 rounded-xl font-bold flex items-center gap-2 transition-all active:scale-95 text-sm uppercase tracking-wide"
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
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                    Chấm điểm AI
                  </>
                )}
              </button>
            </div>
          </div>
          <div className="h-10" />
        </div>
      </div>

      {/* ═══ RIGHT — AI Analysis ═══ */}
      <aside className={`w-[450px] bg-white border-l border-slate-200 flex-col hidden lg:flex shadow-[-10px_0_30px_rgba(0,0,0,0.03)] flex-shrink-0 z-20 ${!result ? 'items-center justify-center' : ''}`}>
        {!result ? (
          <div className="text-center px-10">
            <div className="w-24 h-24 rounded-3xl bg-indigo-50 flex items-center justify-center mx-auto mb-6 border border-indigo-100">
              <svg className="w-12 h-12 text-indigo-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <h3 className="text-xl font-extrabold text-slate-800 mb-3 tracking-tight">Khu vực phân tích AI</h3>
            <p className="text-[15px] text-slate-500 leading-relaxed">
              Hoàn thành bài viết của bạn ở bên trái và AI của chúng tôi sẽ đánh giá chi tiết 4 tiêu chí chuẩn IELTS cho bạn.
            </p>
          </div>
        ) : (
          <>
            {/* Score */}
            <div className="py-6 border-b border-slate-100 flex flex-col items-center bg-slate-50/50">
              <div className="flex flex-col items-center w-full px-6">
                
                <div className="flex flex-row items-center justify-between w-full mb-4">
                  <div className="relative w-28 h-28 drop-shadow-sm flex-shrink-0">
                    <svg className="w-28 h-28 -rotate-90" viewBox="0 0 120 120">
                      <circle cx="60" cy="60" r="54" fill="none" stroke="#e2e8f0" strokeWidth="8" />
                      <circle cx="60" cy="60" r="54" fill="none" stroke={scoreRingColor(result.overallScore)} strokeWidth="8" strokeLinecap="round" strokeDasharray={`${scorePercent * 3.39} 339`} className="transition-all duration-1000 ease-out" />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className={`text-[36px] font-black tracking-tighter leading-none ${scoreColor(result.overallScore)}`}>{result.overallScore}</span>
                      <span className="text-[9px] text-slate-400 uppercase font-black tracking-widest mt-1">Overall</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pl-6">
                    {[
                      { label: 'Task Response', score: result.scoreTA },
                      { label: 'Coherence', score: result.scoreCC },
                      { label: 'Lexical', score: result.scoreLR },
                      { label: 'Grammar', score: result.scoreGRA },
                    ].map((item, idx) => (
                      <div key={idx} className="bg-white px-3 py-2 rounded-xl border border-b-[3px] border-slate-200 shadow-sm text-center flex flex-col justify-center transform hover:-translate-y-0.5 transition-transform cursor-default">
                        <div className={`text-lg font-black leading-none ${scoreColor(item.score)}`}>{item.score}</div>
                        <div className="text-[9px] uppercase font-bold text-slate-400 mt-1 line-clamp-1">{item.label}</div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-slate-100 px-4 bg-white/80 backdrop-blur-md sticky top-0 z-10 pt-2">
              {[
                { id: 'mistakes' as const, label: 'Lỗi sai', count: result.corrections.length },
                { id: 'feedback' as const, label: 'Nhận xét chi tiết' },
                { id: 'improved' as const, label: 'Bản nâng cấp' },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 pb-3 pt-3 text-[13px] uppercase tracking-wider font-bold transition-all border-b-[3px] ${
                    activeTab === tab.id ? 'text-indigo-600 border-indigo-600' : 'text-slate-400 border-transparent hover:text-slate-600 hover:border-slate-300'
                  }`}
                >
                  {tab.label}
                  {tab.count !== undefined && tab.count > 0 && (
                    <span className="ml-2 bg-red-100 text-red-600 text-[10px] font-black px-1.5 py-0.5 rounded-md">{tab.count}</span>
                  )}
                </button>
              ))}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 bg-slate-50/30">
              {activeTab === 'mistakes' && (
                <div className="flex flex-col gap-4">
                  {result.corrections.length === 0 ? (
                    <div className="text-center py-16 bg-white rounded-2xl border border-slate-100">
                      <div className="text-5xl mb-4">🎉</div>
                      <p className="text-[15px] font-bold text-slate-700">Perfect! Không tìm thấy lỗi nào!</p>
                      <p className="text-sm text-slate-500 mt-2">Bài viết của bạn rất chuẩn chỉnh về mặt ngữ pháp và từ vựng.</p>
                    </div>
                  ) : (
                    result.corrections.map((c, i) => {
                      const t = typeConfig[c.type || 'grammar'] || typeConfig.grammar;
                      return (
                        <div key={i} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
                          <div className={`absolute top-0 left-0 w-1 h-full ${t.bg.split(' ')[0]}`} />
                          <span className={`text-[10px] font-extrabold px-2 py-1 rounded-md uppercase tracking-wider ${t.bg}`}>{t.label}</span>
                          <div className="mt-3 mb-3 pl-1">
                            <div className="text-[15px] text-slate-500 line-through decoration-red-400/70 decoration-[3px] leading-relaxed">{c.original}</div>
                            <div className="text-[15px] font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg inline-block mt-2 border border-emerald-100 shadow-sm">{c.corrected}</div>
                          </div>
                          <p className="text-[13px] text-slate-600 leading-relaxed font-medium pl-1 bg-slate-50 p-3 rounded-lg border border-slate-100">{c.explanation}</p>
                        </div>
                      );
                    })
                  )}
                </div>
              )}
              {activeTab === 'feedback' && (
                <div className="flex flex-col gap-4">
                  {/* General Feedback */}
                  <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500" />
                    <h4 className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest mb-3">
                      Nhận xét chung
                    </h4>
                    <p className="text-[14px] text-slate-700 leading-relaxed font-medium">{result.feedback.general}</p>
                  </div>

                  {/* 4 Criteria Detailed Feedback */}
                  <div className="grid grid-cols-1 gap-3 mt-1">
                    {[
                      { title: 'Task Achievement/Response', key: 'ta', content: result.feedback.ta, color: 'emerald' },
                      { title: 'Coherence and Cohesion', key: 'cc', content: result.feedback.cc, color: 'amber' },
                      { title: 'Lexical Resource', key: 'lr', content: result.feedback.lr, color: 'indigo' },
                      { title: 'Grammar and Accuracy', key: 'gra', content: result.feedback.gra, color: 'red' },
                    ].map((crit, idx) => (
                      <div key={idx} className={`bg-${crit.color}-50/50 rounded-xl p-4 border border-${crit.color}-100`}>
                        <h4 className={`text-[11px] font-extrabold uppercase tracking-wider mb-2 text-${crit.color}-700 flex items-center gap-1.5`}>
                          <div className={`w-1.5 h-1.5 rounded-full bg-${crit.color}-500`} />
                          {crit.title}
                        </h4>
                        <p className="text-[13px] text-slate-700 leading-relaxed font-medium pl-3 border-l-2 border-white">{crit.content}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {activeTab === 'improved' && (
                <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-6 border border-emerald-100 shadow-sm">
                  <h4 className="text-[11px] font-extrabold text-emerald-700 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Bản cải thiện đạt điểm cao
                  </h4>
                  <p className="text-[15px] text-slate-800 leading-8 italic whitespace-pre-line font-medium">"{result.betterVersion}"</p>
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
  const [selectedTask, setSelectedTask] = useState<Prompt | null>(null);

  if (!selectedTask) {
    return <PracticeLibrary onSelect={setSelectedTask} />;
  }

  return (
    <WritingEditor
      promptObj={selectedTask}
      onBack={() => setSelectedTask(null)}
    />
  );
};

export default ScoringPage;
