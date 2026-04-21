import React, { useState, useEffect, useMemo } from 'react';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { practiceService } from '@/features/practice/services/practice.service';
import type { Prompt, Category, Topic } from '@/features/practice/services/practice.service';
import { TaskType } from '@/common/enums/task-type.enum';
import { Spin } from 'antd';
import { formatPrompt, taskTypeLabel } from '../utils/practice.utils';

export const PracticeLibrary: React.FC<{ onSelect: (prompt: Prompt) => void }> = ({ onSelect }) => {
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
  }, [isAuthenticated]); // refetch khi đổi state login

  const fetchData = async () => {
    try {
      setLoading(true);
      const [pData, cData, tData] = await Promise.all([
        practiceService.getPrompts(),
        practiceService.getCategories(),
        practiceService.getTopics()
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
    if (filterTask === 'all') return categories;
    return categories.filter(c => c.taskType === filterTask);
  }, [categories, filterTask]);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* GUEST BANNER */}
      {!isAuthenticated && (
        <>
          <div className="-mt-4 sm:-mt-6" />
          <div className="sticky top-[68px] sm:top-[90px] z-40 max-w-5xl mx-auto bg-amber-100 border border-amber-200 rounded-xl px-4 py-1.5 flex flex-wrap items-center justify-center gap-3 shadow-[0_4px_20px_-5px_rgba(0,0,0,0.05)] transition-shadow">
            <svg className="w-5 h-5 text-amber-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span className="text-amber-800 text-[13px] font-semibold text-center">Bạn đang xem danh sách các đề thi mẫu (Free Sample). Đăng nhập để mở khoá 100% kho đề.</span>
            <a href="/login" className="px-3 py-1 bg-amber-500 hover:bg-amber-600 text-white rounded font-bold text-[11px] uppercase tracking-wider transition-colors whitespace-nowrap shadow-sm active:scale-95">Đăng nhập</a>
          </div>
          <div className="h-4 sm:h-6" />
        </>
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
          <div className="flex flex-col gap-8">
            {/* Top Bar Filters */}
            <div className="w-full">
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm relative z-30">
                <h3 className="font-bold text-slate-800 mb-5 flex items-center gap-2">
                  <svg className="w-4 h-4 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                  </svg>
                  Bộ lọc đề thi
                </h3>

                <div className="flex flex-col md:flex-row gap-6 items-start md:items-end">
                  {/* Task Filter */}
                  <div className="w-full md:flex-1">
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3 block">Loại phần thi (Task)</label>
                    <div className="flex flex-wrap gap-2">
                      <button onClick={() => { setFilterTask('all'); setFilterCategory('all'); setFilterTopic('all'); }} className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all outline-none border-2 active:translate-y-[1px] ${filterTask === 'all' ? 'bg-indigo-50 border-indigo-300 text-indigo-700 shadow-sm' : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300 hover:text-slate-700'}`}>Tất cả</button>
                      <button onClick={() => { setFilterTask(TaskType.TASK_2); setFilterCategory('all'); }} className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all outline-none border-2 active:translate-y-[1px] ${filterTask === TaskType.TASK_2 ? 'bg-violet-50 border-violet-300 text-violet-700 shadow-sm' : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300 hover:text-slate-700'}`}>Task 2 (Essay)</button>
                      <button onClick={() => { setFilterTask(TaskType.TASK_1_ACADEMIC); setFilterCategory('all'); setFilterTopic('all'); }} className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all outline-none border-2 active:translate-y-[1px] ${filterTask === TaskType.TASK_1_ACADEMIC ? 'bg-cyan-50 border-cyan-300 text-cyan-700 shadow-sm' : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300 hover:text-slate-700'}`}>Task 1 Academic</button>
                      <button onClick={() => { setFilterTask(TaskType.TASK_1_GENERAL); setFilterCategory('all'); setFilterTopic('all'); }} className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all outline-none border-2 active:translate-y-[1px] ${filterTask === TaskType.TASK_1_GENERAL ? 'bg-teal-50 border-teal-300 text-teal-700 shadow-sm' : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300 hover:text-slate-700'}`}>Task 1 General</button>
                    </div>
                  </div>

                  {/* Right Controls Container */}
                  <div className="w-full md:w-auto flex flex-col sm:flex-row gap-5">
                    {/* Category Filter */}
                    <div className="w-full sm:w-56 flex-shrink-0">
                      <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 block">Dạng câu hỏi</label>
                      <select
                        value={filterCategory}
                        onChange={(e) => setFilterCategory(e.target.value)}
                        className="w-full bg-white border-2 border-b-4 border-slate-200 text-slate-700 text-[13px] font-bold rounded-xl px-4 py-2.5 outline-none hover:border-slate-300 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 transition-all appearance-none cursor-pointer shadow-sm active:translate-y-[2px] active:border-b-2"
                        style={{ backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%2394a3b8%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.7rem top 50%', backgroundSize: '0.65rem auto' }}
                      >
                        <option value="all">Tất cả bài</option>
                        {availableCategories.map(c => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    </div>

                    {/* Topic Filter */}
                    {(filterTask === 'all' || filterTask === TaskType.TASK_2) && (
                      <div className="w-full sm:w-56 flex-shrink-0 animate-in fade-in duration-300">
                        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 block">Chủ đề xã hội</label>
                        <select
                          value={filterTopic}
                          onChange={(e) => setFilterTopic(e.target.value)}
                          className="w-full bg-white border-2 border-b-4 border-slate-200 text-slate-700 text-[13px] font-bold rounded-xl px-4 py-2.5 outline-none hover:border-slate-300 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 transition-all appearance-none cursor-pointer shadow-sm active:translate-y-[2px] active:border-b-2"
                          style={{ backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%2394a3b8%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.7rem top 50%', backgroundSize: '0.65rem auto' }}
                        >
                          <option value="all">Tất cả đề</option>
                          {topics.map(t => (
                            <option key={t.id} value={t.id}>{t.name}</option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Prompt Grid */}
            <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
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
                      <p className="text-slate-800 text-sm font-medium line-clamp-4 leading-relaxed group-hover:text-indigo-900 transition-colors mb-4 flex-1 whitespace-pre-line">
                        "{formatPrompt(prompt.content)}"
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
