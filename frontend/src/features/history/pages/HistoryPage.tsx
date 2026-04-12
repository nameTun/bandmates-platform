import React, { useState, useEffect } from 'react';
import { historyService } from '../services/history.service';
import type { Essay, VocabHistoryItem } from '../services/history.service';
import { Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';
import { TaskType } from '@/common/enums/task-type.enum';
import { Pagination, Modal, message } from 'antd';
import { vocabularyService } from '../../vocabulary/services/vocabulary.service';

// Mock data removed in favor of real API


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

/* ──── Components ──── */


/* ──── Components ──── */

const HistoryPage: React.FC = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState<'essays' | 'words'>('essays');
  const [expandedEssay, setExpandedEssay] = useState<string | null>(null);
  const [essays, setEssays] = useState<Essay[]>([]);
  const [words, setWords] = useState<VocabHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Pagination & Filter States
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  
  const [vocabPage, setVocabPage] = useState(1);
  const [totalVocab, setTotalVocab] = useState(0);
  
  const [taskFilter, setTaskFilter] = useState<string>('all');
  const [isSavedOnly, setIsSavedOnly] = useState(false);

  useEffect(() => {
    if (tab === 'essays') {
      const fetchHistory = async () => {
        setLoading(true);
        try {
          const queryParams: any = { 
            page: currentPage, 
            limit: 10 
          };
          if (taskFilter !== 'all') {
            queryParams.taskType = taskFilter;
          }

          const response = await historyService.getMyHistory(queryParams);
          const rawHistory = response.data || [];
          
          if (response.meta) {
            setTotalItems(response.meta.total);
          }

          const mappedEssays: Essay[] = rawHistory.map((item: any) => ({
            id: item.id,
            task: item.prompt ? (item.prompt.taskType === TaskType.TASK_2 ? 'Task 2' : 'Task 1') : 'Tự do',
            topic: item.prompt?.topic?.name || item.prompt?.category?.name || 'Tự chọn',
            band: Number(item.overallScore || 0),
            date: format(new Date(item.createdAt), 'd MMMM, yyyy', { locale: vi }),
            wordCount: item.wordCount || 0,
            prompt: item.prompt?.content || 'Bài viết tự do không dùng đề mẫu.',
            scores: {
              tr: Number(item.scoreTA || 0),
              cc: Number(item.scoreCC || 0),
              lr: Number(item.scoreLR || 0),
              gra: Number(item.scoreGRA || 0),
            }
          }));
          setEssays(mappedEssays);
        } catch (err) {
          console.error('Failed to fetch practice history', err);
        } finally {
          setLoading(false);
        }
      };
      fetchHistory();
    } else {
      const fetchVocabHistory = async () => {
        setLoading(true);
        try {
          const data = isSavedOnly 
            ? await vocabularyService.getSavedWords(vocabPage, 12)
            : await vocabularyService.getHistory(vocabPage, 12);
          
          setWords(data.data);
          setTotalVocab(data.total);
        } catch (err) {
          console.error('Failed to fetch vocab history', err);
        } finally {
          setLoading(false);
        }
      };
      fetchVocabHistory();
    }
  }, [tab, currentPage, vocabPage, taskFilter, isSavedOnly]);

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation(); // Ngăn sự kiện click lan ra làm đóng/mở essay card
    
    Modal.confirm({
      title: 'Xóa bài làm?',
      content: 'Bạn có chắc chắn muốn xóa bài làm này không? Hành động này không thể hoàn tác.',
      okText: 'Xóa ngay',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          await historyService.deleteAttempt(id);
          message.success('Đã xóa bài làm thành công!');
          // Refresh list
          setCurrentPage(1); // Quay về trang 1 cho chắc chắn
          setTaskFilter('all'); // Reset filter
        } catch (err) {
          message.error('Không thể xóa bài làm. Vui lòng thử lại.');
          console.error(err);
        }
      },
    });
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFilterChange = (filter: string) => {
    setTaskFilter(filter);
    setCurrentPage(1); // Reset về trang 1 khi đổi bộ lọc
  };

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
                Bài viết ({essays.length})
              </button>
              <button
                onClick={() => setTab('words')}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                  tab === 'words' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Từ vựng ({totalVocab})
              </button>
            </div>
          </div>
        </div>

        {/* ═══ ESSAYS TAB ═══ */}
        {tab === 'essays' && (
          <>
            {/* Filter row */}
            <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
              {[
                { label: 'Tất cả', value: 'all' },
                { label: 'Task 1 Academic', value: TaskType.TASK_1_ACADEMIC },
                { label: 'Task 1 General', value: TaskType.TASK_1_GENERAL },
                { label: 'Task 2', value: TaskType.TASK_2 },
              ].map(f => (
                <button
                  key={f.value}
                  onClick={() => handleFilterChange(f.value)}
                  className={`px-5 py-2 rounded-xl text-xs font-bold transition-all border whitespace-nowrap ${
                    taskFilter === f.value 
                      ? 'bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-200' 
                      : 'bg-white border-slate-200 text-slate-500 hover:border-indigo-300 hover:text-indigo-600'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Stats summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {[
                { label: 'Tổng bài', value: essays.length, icon: '📝' },
                { label: 'Band TB', value: essays.length > 0 ? (essays.reduce((a, e) => a + e.band, 0) / essays.length).toFixed(1) : '0.0', icon: '📊' },
                { label: 'Band cao nhất', value: essays.length > 0 ? Math.max(...essays.map(e => e.band)).toFixed(1) : '0.0', icon: '🏆' },
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
            {loading ? (
              <div className="py-20 flex justify-center items-center">
                <Spin indicator={<LoadingOutlined style={{ fontSize: 32, color: '#4f46e5' }} spin />} />
              </div>
            ) : essays.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-sm">
                <div className="text-5xl mb-4">✍️</div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">Bạn chưa làm bài nào</h3>
                <p className="text-slate-500 mb-6">Hãy bắt đầu hành trình luyện IELTS của bạn bằng một bài thi mẫu nhé!</p>
                <a href="/practice" className="bg-indigo-600 text-white px-6 py-2.5 rounded-lg font-bold shadow-sm hover:bg-indigo-700 transition">Bắt đầu luyện tập</a>
              </div>
            ) : (
              <div className="space-y-3">
                {essays.map(essay => {
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

                      {/* Delete icon */}
                      <button 
                        onClick={(e) => handleDelete(e, essay.id)}
                        className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all flex-shrink-0"
                        title="Xóa bài làm"
                      >
                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>

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
                          <button 
                            onClick={() => navigate(`/history/${essay.id}`)}
                            className="flex-1 px-4 py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white font-bold text-sm rounded-xl transition-colors flex items-center justify-center gap-2 shadow-sm"
                          >
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
            )}

            {/* Pagination UI */}
            {!loading && totalItems > 10 && (
              <div className="mt-10 flex justify-center">
                <Pagination 
                  current={currentPage}
                  total={totalItems}
                  pageSize={10}
                  onChange={handlePageChange}
                  showSizeChanger={false}
                  className="custom-pagination"
                />
              </div>
            )}
          </>
        )}

        {/* ═══ WORDS TAB ═══ */}
        {tab === 'words' && (
          <>
            {/* Filter */}
            <div className="flex items-center gap-2 mb-6">
              <button
                onClick={() => { setIsSavedOnly(false); setVocabPage(1); }}
                className={`px-5 py-2 rounded-xl text-xs font-bold transition-all border ${
                  !isSavedOnly 
                    ? 'bg-indigo-600 border-indigo-600 text-white shadow-md' 
                    : 'bg-white border-slate-200 text-slate-500 hover:border-indigo-300'
                }`}
              >
                Tất cả lịch sử
              </button>
              <button
                onClick={() => { setIsSavedOnly(true); setVocabPage(1); }}
                className={`px-5 py-2 rounded-xl text-xs font-bold transition-all border ${
                  isSavedOnly 
                    ? 'bg-amber-500 border-amber-500 text-white shadow-md' 
                    : 'bg-white border-slate-200 text-slate-500 hover:border-amber-300'
                }`}
              >
                ⭐ Đã lưu (Sổ tay)
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {[
                { label: 'Từ đã tra', value: totalVocab, icon: '📚' },
                { label: 'Đã lưu sổ tay', value: words.filter(w => w.isSaved).length, icon: '⭐' },
                { label: 'Hành trình', value: 'Chăm chỉ', icon: '🔥' },
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

            {loading ? (
              <div className="py-20 flex justify-center items-center">
                <Spin indicator={<LoadingOutlined style={{ fontSize: 32, color: '#4f46e5' }} spin />} />
              </div>
            ) : words.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-sm">
                <div className="text-5xl mb-4">📖</div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">Chưa có dữ liệu từ vựng</h3>
                <p className="text-slate-500 mb-6">Hãy tra cứu những từ mới để bắt đầu xây dựng vốn từ của bạn!</p>
                <a href="/vocabulary" className="bg-indigo-600 text-white px-6 py-2.5 rounded-lg font-bold shadow-sm hover:bg-indigo-700 transition">Đi tra từ ngay</a>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {words.map((w) => (
                  <div
                    key={w.id}
                    onClick={() => navigate(`/vocabulary?word=${w.word}`)}
                    className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all cursor-pointer group"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="text-lg font-extrabold text-slate-900 group-hover:text-indigo-600 transition-colors uppercase tracking-tight">{w.word}</h3>
                        <p className="text-xs text-indigo-400 font-medium font-mono">{w.phonetic}</p>
                      </div>
                      <div className="flex gap-2">
                          {w.isSaved && <span className="text-amber-500">⭐</span>}
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-50 text-slate-400 uppercase tracking-widest border border-slate-100">
                             {w.searchedAt ? format(new Date(w.searchedAt), 'dd/MM') : '--/--'}
                          </span>
                      </div>
                    </div>
                    
                    <div className="mt-3 flex items-center justify-between">
                        <span className="text-[10px] text-slate-400 font-medium">Click để xem lại AI Notes</span>
                        <div className="text-xs font-bold text-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity">
                           Xem chi tiết →
                        </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {!loading && totalVocab > 12 && (
              <div className="mt-10 flex justify-center">
                <Pagination 
                  current={vocabPage}
                  total={totalVocab}
                  pageSize={12}
                  onChange={(p) => { setVocabPage(p); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  showSizeChanger={false}
                />
              </div>
            )}
          </>
        )}

      </div>
    </div>
  );
};

export default HistoryPage;
