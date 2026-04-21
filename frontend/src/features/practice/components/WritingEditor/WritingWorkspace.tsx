import React, { useState, useEffect } from 'react';
import { practiceService } from '@/features/practice/services/practice.service';
import type { Prompt, AIResponse } from '@/features/practice/services/practice.service';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { TaskType } from '@/common/enums/task-type.enum';
import { typeConfig } from '../../utils/practice.utils';
import { Task1AcademicEditor, Task1GeneralEditor, Task2Editor } from './TaskEditors';
import { Dropdown, Modal, InputNumber } from 'antd';
import type { MenuProps } from 'antd';

const formatTime = (sec: number) => {
  const m = Math.floor(sec / 60).toString().padStart(2, '0');
  const s = (sec % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
};

interface WritingWorkspaceProps {
  promptObj: Prompt;
  onBack: () => void;
  onReset?: () => void;
  onError?: (status: number, message: string, extraData?: any) => void;
  reviewAttempt?: any;
}

export const WritingWorkspace: React.FC<WritingWorkspaceProps> = ({ promptObj, onBack, onReset, onError, reviewAttempt }) => {
  const [text, setText] = useState(reviewAttempt?.originalText || '');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AIResponse | null>(reviewAttempt?.aiResponse || null);
  const [usage, setUsage] = useState<{ limit: number; used: number; remaining: number } | null>(null);
  const [activeTab, setActiveTab] = useState<'mistakes' | 'feedback' | 'improved'>('mistakes');
  const [timeSpent, setTimeSpent] = useState(reviewAttempt?.timeSpent || 0);
  const [hasStarted, setHasStarted] = useState(!!reviewAttempt || !!result);
  const [isPaused, setIsPaused] = useState(false);
  const [timeLimit, setTimeLimit] = useState<number | null>(null);
  const [isTimeUp, setIsTimeUp] = useState(false);
  const { isAuthenticated } = useAuthStore();
  const [isPanelExpanded, setIsPanelExpanded] = useState(true);
  const [panelWidth, setPanelWidth] = useState(450);
  const [isDragging, setIsDragging] = useState(false);
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);
  const [customMinutes, setCustomMinutes] = useState<number | null>(20);

  useEffect(() => {
    if (!hasStarted || reviewAttempt || result || isPaused || isTimeUp) return;
    const interval = setInterval(() => {
      setTimeSpent((prev: number) => {
        const next = prev + 1;
        if (timeLimit && next >= timeLimit) {
           setIsTimeUp(true);
        }
        return next;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [hasStarted, result, reviewAttempt, isPaused, isTimeUp, timeLimit]);

  const timerMenuItems: MenuProps['items'] = [
    {
      key: 'stopwatch',
      label: <span className="text-sm font-medium">⏱ Đếm tiến (Stopwatch)</span>,
      onClick: () => { 
        setTimeSpent(0);
        setTimeLimit(null); 
        setIsTimeUp(false);
        setHasStarted(true);
        setIsPaused(false);
      },
    },
    {
      key: 'countdown_20',
      label: <span className="text-sm font-medium">⏳ Đếm lùi (20 phút)</span>,
      onClick: () => { 
        setTimeSpent(0);
        setTimeLimit(20 * 60); 
        setIsTimeUp(false);
        setHasStarted(true);
        setIsPaused(false);
      },
    },
    {
      key: 'countdown_40',
      label: <span className="text-sm font-medium">⏳ Đếm lùi (40 phút)</span>,
      onClick: () => { 
        setTimeSpent(0);
        setTimeLimit(40 * 60); 
        setIsTimeUp(false); 
        setHasStarted(true);
        setIsPaused(false);
      },
    },
    { type: 'divider' },
    {
      key: 'custom',
      label: <span className="text-sm font-medium">✨ Hẹn giờ tùy chỉnh...</span>,
      onClick: () => setIsCustomModalOpen(true),
    },
  ];

  const handleSetCustomTimer = () => {
    if (customMinutes && customMinutes > 0) {
      setTimeSpent(0);
      setTimeLimit(customMinutes * 60);
      setIsTimeUp(false);
      setHasStarted(true);
      setIsPaused(false);
      setIsCustomModalOpen(false);
    }
  };

  const isTask1 = promptObj.taskType !== TaskType.TASK_2;
  const minWords = isTask1 ? 150 : 250;

  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
  const isEnough = wordCount >= minWords;

  const handleAnalyze = async () => {
    if (!text.trim() || text.length < 10) return;

    setIsPaused(true);
    setLoading(true);
    setResult(null);
    try {
      const data = await practiceService.checkIelts(text, promptObj.id, timeSpent);
      setResult(data.result);
      setUsage(data.usage);
      setActiveTab('mistakes');
    } catch (err: any) {
      if (err.response?.status === 429) {
        const data = err.response.data;
        onError?.(429, data?.message || 'Hết lượt dùng', data);
      }
    } finally { setLoading(false); }
  };

  const handleReset = () => {
    const confirmMsg = result || reviewAttempt 
      ? 'Bắt đầu lượt làm bài mới? Bài làm này của bạn vẫn sẽ được lưu trong phần Lịch sử. Màn hình soạn thảo sẽ được xóa trắng.'
      : 'Bạn có chắc chắn muốn xóa hết nội dung đang viết để làm lại từ đầu?';

    if (window.confirm(confirmMsg)) {
      setText('');
      setResult(null);
      setTimeSpent(0);
      setHasStarted(false);
      setIsTimeUp(false);
      setIsPaused(false);
      setTimeLimit(null);
      if (onReset) onReset();
    }
  };

  const scoreColor = (s: number) => s >= 7 ? 'text-emerald-500' : s >= 5 ? 'text-amber-500' : 'text-red-500';
  const scoreRingColor = (s: number) => s >= 7 ? '#10b981' : s >= 5 ? '#f59e0b' : '#ef4444';
  const scorePercent = result ? (result.overallScore / 9) * 100 : 0;

  const editorProps = {
    promptObj,
    text,
    setText,
    isEnough,
    wordCount,
    minWords,
    reviewAttempt,
    isTimeUp,
  };

  return (
    <div className={`flex overflow-hidden bg-slate-50 ${isAuthenticated ? 'h-screen' : 'h-[calc(100vh-96px)] sm:h-[calc(100vh-128px)]'}`}>
      {/* ═══ LEFT — Editor ═══ */}
      <div className="flex-1 flex flex-col overflow-y-auto w-full">
        <div className="flex-1 p-6 md:p-10 max-w-[1600px] mx-auto w-full relative">

          {/* Header Layout (Back + Task info + Timer + Analyze Button) */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <button onClick={onBack} className="p-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors shadow-sm">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div className="flex items-center gap-2">
                <span className="text-sm font-extrabold text-slate-800 tracking-tight hidden sm:inline-block">{isTask1 ? 'IELTS Task 1' : 'IELTS Task 2'}</span>
                <span className="text-[11px] font-bold text-slate-500 bg-slate-200/50 px-2.5 py-1 rounded-full uppercase tracking-wider border border-slate-200 hidden md:inline-block">{promptObj.category?.name}</span>
                
                
              <div className="flex items-center">
                {!hasStarted && !result && !reviewAttempt ? (
                  <button 
                    onClick={() => setHasStarted(true)}
                    className="group flex items-center gap-2 text-[11px] font-black px-4 py-2 bg-emerald-600 text-white rounded-xl shadow-md hover:bg-emerald-700 transition-all active:scale-95 uppercase tracking-wider"
                  >
                    <svg className="w-3.5 h-3.5 animate-pulse text-emerald-200" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                    Bắt đầu làm bài
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => !result && !reviewAttempt && setIsPaused(!isPaused)}
                      disabled={!!result || !!reviewAttempt}
                      className={`text-[11px] font-black h-[32px] px-3 flex items-center gap-1.5 transition-all outline-none shadow-sm
                        ${result || reviewAttempt 
                          ? 'text-slate-600 bg-slate-50 border border-slate-200 rounded-xl' 
                          : `text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-l-xl border-r-0 hover:bg-emerald-100 cursor-pointer active:scale-[0.98] ${isPaused ? '!bg-amber-50 !text-amber-700 !border-amber-200' : ''}`
                        }
                        ${isTimeUp && !result && !reviewAttempt ? '!text-red-700 !bg-red-50 !border-red-300' : ''}
                      `}
                      title={isPaused ? "Tiếp tục" : "Tạm dừng"}
                    >
                      <div className={`w-1.5 h-1.5 rounded-full ${result || reviewAttempt ? 'bg-slate-400' : (isPaused ? 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.6)]' : 'bg-red-500 animate-pulse')}`} />
                      {timeLimit ? formatTime(Math.max(0, timeLimit - timeSpent)) : formatTime(timeSpent)}
                    </button>
                    {!result && !reviewAttempt && (
                      <Dropdown menu={{ items: timerMenuItems }} trigger={['click']}>
                        <button className={`px-2.5 h-[32px] ${isTimeUp ? 'bg-red-50 border-red-300 text-red-600 hover:bg-red-100' : 'bg-emerald-50 border-emerald-200 text-emerald-600 hover:bg-emerald-100'} border border-l-0 rounded-r-xl transition-colors flex items-center justify-center outline-none shadow-sm active:scale-[0.98] border-l-emerald-200/50`} title="Cài đặt đồng hồ">
                          <svg className="w-3.5 h-3.5 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                        </button>
                      </Dropdown>
                    )}
                  </>
                )}
              </div>

                {!isAuthenticated && (
                  <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2.5 py-1 rounded-full uppercase border border-amber-200 hidden sm:inline-block">Guest</span>
                )}
              </div>
            </div>

            {/* Analyze / Reset Button (Top Right) */}
            <div className="flex items-center gap-3">
              {usage && !reviewAttempt && (
                <div className="hidden lg:flex flex-col items-end leading-none">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Hạn mức AI</span>
                  <span className="text-[12px] font-black text-indigo-600">
                    {usage.used}/{usage.limit}
                  </span>
                </div>
              )}
              
              {result || reviewAttempt ? (
                <button
                  onClick={handleReset}
                  className="bg-white border border-slate-200 hover:bg-slate-100 hover:border-slate-300 text-slate-600 px-5 py-2.5 rounded-xl font-bold flex items-center gap-1.5 transition-all active:scale-95 text-[11px] sm:text-xs uppercase tracking-wide shadow-sm"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                  Làm lại bài
                </button>
              ) : (
                <button
                  onClick={handleAnalyze}
                  disabled={!text.trim() || text.length < 10 || loading}
                  className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all active:scale-95 text-[11px] sm:text-xs uppercase tracking-wide shadow-md hover:shadow-lg"
                >
                  {loading ? (
                    <>
                      <svg className="w-4 h-4 animate-spin hidden sm:block" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Đang chấm...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4 hidden sm:block" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                      Nộp & Chấm Điểm
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Dynamic Task Layout Rendering */}
          {promptObj.taskType === TaskType.TASK_1_ACADEMIC && <Task1AcademicEditor {...editorProps} />}
          {promptObj.taskType === TaskType.TASK_1_GENERAL && <Task1GeneralEditor {...editorProps} />}
          {promptObj.taskType === TaskType.TASK_2 && <Task2Editor {...editorProps} />}
          <div className="h-10" />
        </div>
      </div>

      {/* ═══ RIGHT — AI Analysis ═══ */}
      {result && (
        <aside
          style={{ width: isPanelExpanded ? `${panelWidth}px` : '50px' }}
          className={`bg-white border-l border-slate-200 flex-col hidden lg:flex shadow-[-10px_0_30px_rgba(0,0,0,0.03)] flex-shrink-0 z-20 relative ${!isDragging ? 'transition-all duration-300 ease-in-out' : ''}`}
        >
          {/* Toggle Button */}
          <button
            onClick={() => setIsPanelExpanded(!isPanelExpanded)}
            className="absolute -left-3.5 bottom-50 w-7 h-7 bg-white border border-slate-200 rounded-full flex items-center justify-center text-slate-400 hover:text-indigo-600 shadow-sm z-[70] transition-all hover:scale-110"
          >
            <svg className={`w-4 h-4 transition-transform duration-300 ${!isPanelExpanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>

          {/* Drag Handle */}
          <div
            className="absolute left-0 -ml-1.5 top-0 bottom-0 w-3 cursor-col-resize z-[60] flex items-center justify-center group/dragger"
            onMouseDown={(e) => {
              e.preventDefault();
              setIsDragging(true);

              const startX = e.pageX;
              let currentStartWidth = panelWidth;

              // Nếu đang bị nhỏ mà user cố tình tóm mép kéo ra, ta tự động mở nó ra từ size 50
              if (!isPanelExpanded) {
                setIsPanelExpanded(true);
                currentStartWidth = 50;
                setPanelWidth(50);
              }

              const handleMouseMove = (moveEvent: MouseEvent) => {
                const newWidth = Math.max(350, Math.min(700, currentStartWidth + (startX - moveEvent.pageX)));
                setPanelWidth(newWidth);
              };

              const handleMouseUp = () => {
                setIsDragging(false);
                document.removeEventListener('mousemove', handleMouseMove);
                document.removeEventListener('mouseup', handleMouseUp);
              };

              document.addEventListener('mousemove', handleMouseMove);
              document.addEventListener('mouseup', handleMouseUp);
            }}
          >
            <div className={`w-0.5 h-full transition-colors ${isDragging ? 'bg-indigo-500' : 'bg-transparent group-hover/dragger:bg-indigo-300'}`} />
          </div>

          {isPanelExpanded ? (
            <div className="flex-1 flex flex-col w-full overflow-hidden">
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
                    className={`flex-1 pb-3 pt-3 text-[13px] uppercase tracking-wider font-bold transition-all border-b-[3px] ${activeTab === tab.id ? 'text-indigo-600 border-indigo-600' : 'text-slate-400 border-transparent hover:text-slate-600 hover:border-slate-300'
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
                        {result.overallScore >= 8 ? (
                          <>
                            <div className="text-5xl mb-4">🎉</div>
                            <p className="text-[15px] font-bold text-slate-700">Perfect! Không tìm thấy lỗi nào!</p>
                            <p className="text-sm text-slate-500 mt-2">Bài viết của bạn rất chuẩn chỉnh về mặt ngữ pháp và từ vựng.</p>
                          </>
                        ) : (
                          <>
                            <div className="text-5xl mb-4">⚠️</div>
                            <p className="text-[15px] font-bold text-slate-700">Cần kiểm tra lại nội dung!</p>
                            <p className="text-sm text-slate-500 mt-2 px-6">Tuy không tìm thấy lỗi ngữ pháp cụ thể, nhưng điểm số của bạn thấp (Band {result.overallScore}). Có thể bài viết bị lạc đề hoặc không đủ nội dung học thuật.</p>
                          </>
                        )}
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
                    <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500" />
                      <h4 className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest mb-3">Nhận xét chung</h4>
                      <p className="text-[14px] text-slate-700 leading-relaxed font-medium">{result.feedback.general}</p>
                    </div>

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
            </div>
          ) : (
            <div className="flex flex-col items-center py-6 w-[50px] overflow-hidden h-full gap-6">
              <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap rotate-180" style={{ writingMode: 'vertical-rl' }}>
                AI Result
              </div>
              
              <div className="w-8 h-8 relative flex items-center justify-center flex-shrink-0 mt-2" title="Overall Score">
                <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 120 120">
                  <circle cx="60" cy="60" r="54" fill="none" stroke="#e2e8f0" strokeWidth="12" />
                  <circle cx="60" cy="60" r="54" fill="none" stroke={scoreRingColor(result.overallScore)} strokeWidth="12" strokeLinecap="round" strokeDasharray={`${scorePercent * 3.39} 339`} />
                </svg>
                <span className={`text-xs font-black ${scoreColor(result.overallScore)}`}>{result.overallScore}</span>
              </div>

              <div className="flex flex-col gap-3 mt-auto mb-6">
                <button onClick={() => { setActiveTab('mistakes'); setIsPanelExpanded(true); }} className="relative group p-2 rounded-xl hover:bg-slate-100 transition-colors">
                  <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  {result.corrections.length > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                      <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-red-500 items-center justify-center text-[8px] font-black text-white">{result.corrections.length}</span>
                    </span>
                  )}
                  <div className="absolute right-full mr-3 top-1/2 -translate-y-1/2 px-2.5 py-1.5 bg-slate-800 text-white text-[11px] font-bold rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50">
                    Lỗi sai ({result.corrections.length})
                    <div className="absolute top-1/2 -right-1 -translate-y-1/2 w-2 h-2 bg-slate-800 rotate-45" />
                  </div>
                </button>

                <button onClick={() => { setActiveTab('feedback'); setIsPanelExpanded(true); }} className="relative group p-2 rounded-xl hover:bg-slate-100 transition-colors">
                  <svg className="w-5 h-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="absolute right-full mr-3 top-1/2 -translate-y-1/2 px-2.5 py-1.5 bg-slate-800 text-white text-[11px] font-bold rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50">
                    Chi tiết
                    <div className="absolute top-1/2 -right-1 -translate-y-1/2 w-2 h-2 bg-slate-800 rotate-45" />
                  </div>
                </button>

                <button onClick={() => { setActiveTab('improved'); setIsPanelExpanded(true); }} className="relative group p-2 rounded-xl hover:bg-slate-100 transition-colors">
                  <svg className="w-5 h-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <div className="absolute right-full mr-3 top-1/2 -translate-y-1/2 px-2.5 py-1.5 bg-slate-800 text-white text-[11px] font-bold rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50">
                    Bản cải thiện
                    <div className="absolute top-1/2 -right-1 -translate-y-1/2 w-2 h-2 bg-slate-800 rotate-45" />
                  </div>
                </button>
              </div>
            </div>
          )}
        </aside>
      )}

      {/* ═══ CUSTOM TIMER MODAL ═══ */}
      <Modal
        title={
          <div className="flex items-center gap-2">
            <span className="text-lg">✨</span>
            <span>Cài đặt thời gian đếm lùi</span>
          </div>
        }
        open={isCustomModalOpen}
        onOk={handleSetCustomTimer}
        onCancel={() => setIsCustomModalOpen(false)}
        okText="Bắt đầu"
        cancelText="Hủy"
        centered
        width={320}
        closeIcon={null}
        okButtonProps={{ className: 'bg-indigo-600 hover:bg-indigo-700 font-bold' }}
      >
        <div className="py-6 flex flex-col items-center">
          <p className="text-slate-500 text-sm mb-4">Nhập số phút bạn muốn đếm lùi:</p>
          <InputNumber
            min={1}
            max={180}
            value={customMinutes}
            onChange={(val) => setCustomMinutes(val)}
            className="w-32 text-center text-xl font-bold h-12 flex items-center"
            placeholder="Phút"
            autoFocus
            onPressEnter={handleSetCustomTimer}
          />
        </div>
      </Modal>
    </div>
  );
};
