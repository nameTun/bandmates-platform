import React, { useState, useMemo, useEffect } from 'react';
import { message, Spin } from 'antd';
import { categoryApi } from '../api/category-api';
import type { Category } from '../api/category-api';
import { topicApi } from '../api/topic-api';
import type { Topic } from '../api/topic-api';
import { promptApi } from '../api/prompt-api';
import type { Prompt, CreatePromptDto } from '../api/prompt-api';
import { TaskType } from '@/common/enums/task-type.enum';

const taskTypeLabel: Record<string, { text: string; color: string }> = {
  [TaskType.TASK_1_ACADEMIC]: { text: 'Task 1 Aca', color: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' },
  [TaskType.TASK_1_GENERAL]: { text: 'Task 1 Gen', color: 'bg-teal-500/10 text-teal-400 border-teal-500/20' },
  [TaskType.TASK_2]: { text: 'Task 2', color: 'bg-violet-500/10 text-violet-400 border-violet-500/20' },
};

/* ── UI COMPONENTS ── */
const PlusIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
  </svg>
);

const EditIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-[14px] h-[14px]">
    <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
  </svg>
);

const DeleteIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-[14px] h-[14px]">
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

const PromptManagement: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTask, setFilterTask] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  // Data States
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);

  // Form States
  const [selectedTaskType, setSelectedTaskType] = useState<TaskType>(TaskType.TASK_2);
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [selectedTopicId, setSelectedTopicId] = useState('');
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  // Fetch data on mount
  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [pData, cData, tData] = await Promise.all([
        promptApi.getPrompts(),
        categoryApi.getCategories(),
        topicApi.getTopics()
      ]);
      setPrompts(pData);
      setCategories(cData);
      setTopics(tData);
    } catch (error) {
      message.error('Không thể tải dữ liệu đề bài!');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Lọc Categories theo Task Type đang chọn
  const availableCategories = useMemo(() => {
    return categories.filter(c => c.taskType === selectedTaskType);
  }, [categories, selectedTaskType]);

  const handleCreatePrompt = async () => {
    if (!content.trim() || !selectedCategoryId) {
      return message.warning('Vui lòng điền đầy đủ các thông tin bắt buộc!');
    }

    if (selectedTaskType !== TaskType.TASK_2 && !imageUrl.trim()) {
      return message.warning('Vui lòng cung cấp link hình ảnh cho Task 1!');
    }

    try {
      setSubmitting(true);
      const payload: CreatePromptDto = {
        taskType: selectedTaskType,
        categoryId: selectedCategoryId,
        topicId: selectedTaskType === TaskType.TASK_2 ? selectedTopicId : undefined,
        content: content,
        imageUrl: selectedTaskType !== TaskType.TASK_2 ? imageUrl : undefined
      };

      await promptApi.createPrompt(payload);
      message.success('Đã tạo đề bài mới thành công!');
      
      // Reset form & Refresh
      setShowForm(false);
      setContent('');
      setImageUrl('');
      setSelectedCategoryId('');
      setSelectedTopicId('');
      fetchInitialData();
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || 'Có lỗi xảy ra khi tạo đề!';
      message.error(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = prompts.filter(p => {
    const matchSearch = p.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.topic?.name && p.topic.name.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchTask = filterTask === 'all' || p.taskType === filterTask;
    return matchSearch && matchTask;
  });

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#ededed] font-sans selection:bg-orange-500/30 selection:text-white">
      <div className="max-w-[1200px] mx-auto px-8 py-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-white">Quản lý Đề thi</h1>
            <p className="text-[#a1a1aa] mt-2 text-sm max-w-lg">
              Hệ thống lưu trữ đề bài thông minh. Dữ liệu tại đây sẽ được AI sử dụng trực tiếp để sinh bài tập.
            </p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 px-5 py-2.5 bg-white text-black text-sm font-medium rounded-lg hover:bg-[#ededed] transition-colors shadow-[0_0_15px_rgba(255,255,255,0.1)] active:scale-95"
          >
            <PlusIcon />
            {showForm ? 'Đóng bảng tạo' : 'Tạo đề bài mới'}
          </button>
        </div>

        {/* Add Form (Collapsible) */}
        {showForm && (
          <div className="bg-[#0f0f0f] border border-[#27272a] rounded-xl p-8 mb-10 shadow-[0_4px_30px_rgba(0,0,0,0.5)] animate-in slide-in-from-top-4 duration-300">
            <h3 className="text-base font-semibold text-white mb-6 tracking-tight">Khai báo cấu trúc đề bài</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-5">
              {/* Task Type */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-medium text-[#71717a] uppercase tracking-wider">Loại bài thi</label>
                <select 
                  value={selectedTaskType}
                  onChange={(e) => {
                    setSelectedTaskType(e.target.value as TaskType);
                    setSelectedCategoryId('');
                    setSelectedTopicId('');
                  }}
                  className="w-full bg-[#18181b] border border-[#27272a] text-[#ededed] text-sm rounded-lg px-3.5 py-2.5 outline-none hover:border-[#3f3f46] focus:border-[#d4d4d8] focus:ring-1 focus:ring-[#d4d4d8] transition-all appearance-none cursor-pointer"
                >
                  <option value={TaskType.TASK_2}>IELTS Task 2 (Essay)</option>
                  <option value={TaskType.TASK_1_ACADEMIC}>IELTS Task 1 Academic</option>
                  <option value={TaskType.TASK_1_GENERAL}>IELTS Task 1 General</option>
                </select>
              </div>

              {/* Category (Dynamic) */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-medium text-[#71717a] uppercase tracking-wider">Dạng bài</label>
                <select 
                  value={selectedCategoryId}
                  onChange={(e) => setSelectedCategoryId(e.target.value)}
                  className="w-full bg-[#18181b] border border-[#27272a] text-[#ededed] text-sm rounded-lg px-3.5 py-2.5 outline-none hover:border-[#3f3f46] focus:border-[#d4d4d8] focus:ring-1 focus:ring-[#d4d4d8] transition-all appearance-none cursor-pointer"
                >
                  <option value="" disabled>Chọn dạng bài...</option>
                  {availableCategories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              {/* Topic (Only for Task 2) */}
              {selectedTaskType === TaskType.TASK_2 && (
                <div className="flex flex-col gap-1.5 animate-in fade-in duration-300">
                  <label className="text-[11px] font-medium text-[#71717a] uppercase tracking-wider">Chủ đề xã hội</label>
                  <select 
                    value={selectedTopicId}
                    onChange={(e) => setSelectedTopicId(e.target.value)}
                    className="w-full bg-[#18181b] border border-[#27272a] text-[#ededed] text-sm rounded-lg px-3.5 py-2.5 outline-none hover:border-[#3f3f46] focus:border-[#d4d4d8] focus:ring-1 focus:ring-[#d4d4d8] transition-all appearance-none cursor-pointer"
                  >
                    <option value="" disabled>Chọn chủ đề...</option>
                    {topics.map(top => (
                      <option key={top.id} value={top.id}>{top.name}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <div className="flex flex-col gap-1.5 mb-5">
              <label className="text-[11px] font-medium text-[#71717a] uppercase tracking-wider">Nội dung đề bài chi tiết</label>
              <textarea
                rows={4}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Ví dụ: Some people believe that..."
                className="w-full bg-[#18181b] border border-[#27272a] text-[#ededed] text-sm rounded-lg px-3.5 py-3 outline-none hover:border-[#3f3f46] focus:border-[#d4d4d8] focus:ring-1 focus:ring-[#d4d4d8] transition-all resize-none placeholder:text-[#52525b] font-mono"
              />
            </div>

            {/* Link Image ONLY for Task 1 */}
            {selectedTaskType !== TaskType.TASK_2 && (
              <div className="flex flex-col gap-1.5 mb-6 animate-in fade-in duration-300">
                <label className="text-[11px] font-medium text-[#71717a] uppercase tracking-wider flex items-center gap-2">
                  <span>Link hình ảnh biểu đồ</span>
                  <span className="bg-[#27272a] text-[#a1a1aa] px-1.5 py-0.5 rounded-[4px] text-[9px] uppercase">Bắt buộc</span>
                </label>
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://imgur.com/image.png"
                  className="w-full bg-[#18181b] border border-[#27272a] text-[#ededed] text-sm rounded-lg px-3.5 py-2.5 outline-none hover:border-[#3f3f46] focus:border-[#d4d4d8] focus:ring-1 focus:ring-[#d4d4d8] transition-all font-mono placeholder:text-[#52525b]"
                />
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-3 pt-2 border-t border-[#27272a] mt-6">
              <button 
                onClick={handleCreatePrompt}
                disabled={submitting}
                className="px-5 py-2.5 bg-white text-black text-sm font-medium rounded-lg hover:bg-[#ededed] transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                {submitting ? <Spin size="small" /> : 'Hoàn tất tạo đề'}
              </button>
              <button
                onClick={() => setShowForm(false)}
                disabled={submitting}
                className="px-5 py-2.5 bg-transparent text-[#a1a1aa] text-sm font-medium rounded-lg hover:bg-[#18181b] hover:text-[#ededed] transition-colors"
              >
                Hủy thao tác
              </button>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1 group">
            <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#71717a] group-focus-within:text-[#ededed] transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Tìm kiếm nội dung đề bài..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-[#0a0a0a] border border-[#27272a] text-[#ededed] text-sm rounded-lg pl-10 pr-4 py-2.5 outline-none hover:border-[#3f3f46] focus:border-[#d4d4d8] transition-all placeholder:text-[#52525b]"
            />
          </div>
          <div className="flex gap-2">
            {[
              { key: 'all', label: 'All types' },
              { key: TaskType.TASK_2, label: 'T2 Essay' },
              { key: TaskType.TASK_1_ACADEMIC, label: 'T1 Academic' },
            ].map(f => (
              <button
                key={f.key}
                onClick={() => setFilterTask(f.key)}
                className={`px-4 py-2 text-xs font-medium rounded-lg transition-all border ${filterTask === f.key
                    ? 'bg-[#ededed] text-black border-[#ededed]'
                    : 'bg-transparent text-[#a1a1aa] border-[#27272a] hover:bg-[#18181b] hover:text-[#ededed]'
                  }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Table - Minimalist */}
        <div className="border border-[#27272a] rounded-xl overflow-hidden bg-[#0a0a0a]">
          {/* Table Header */}
          <div className="grid grid-cols-12 px-6 py-3 text-[10px] font-semibold text-[#71717a] uppercase tracking-wider border-b border-[#27272a] bg-[#0f0f0f]">
            <div className="col-span-1">STT</div>
            <div className="col-span-2">Dạng bài</div>
            <div className="col-span-2">Chủ đề</div>
            <div className="col-span-5">Nội dung</div>
            <div className="col-span-2 text-right">Settings</div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <Spin />
              <p className="text-xs text-[#71717a]">Đang lấy danh sách đề bài...</p>
            </div>
          ) : (
            <>
              {/* Rows */}
              {filtered.map((prompt, i) => {
                const tt = taskTypeLabel[prompt.taskType] || taskTypeLabel[TaskType.TASK_2];
                return (
                  <div
                    key={prompt.id}
                    className={`grid grid-cols-12 items-center px-6 py-4 hover:bg-[#18181b] transition-colors group ${i < filtered.length - 1 ? 'border-b border-[#27272a]' : ''
                      }`}
                  >
                    <div className="col-span-1 text-xs text-[#71717a] font-mono">#{i + 1}</div>
                    <div className="col-span-2 flex flex-col gap-1 items-start">
                      <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${tt.color}`}>
                        {tt.text}
                      </span>
                      <span className="text-xs font-medium text-[#ededed]">{prompt.category?.name || 'Unknown'}</span>
                    </div>
                    <div className="col-span-2">
                      {prompt.topic ? (
                        <span className="text-xs text-[#a1a1aa] bg-[#18181b] px-2 py-1 rounded-md border border-[#27272a]">{prompt.topic.name}</span>
                      ) : (
                        <span className="text-xs text-[#52525b]">—</span>
                      )}
                    </div>
                    <div className="col-span-5 text-sm text-[#a1a1aa] truncate pr-8 font-mono group-hover:text-[#ededed] transition-colors">{prompt.content}</div>
                    <div className="col-span-2 flex justify-end gap-2 pr-1">
                      <button className="p-1.5 text-[#71717a] hover:text-white transition-colors" title="Edit">
                        <EditIcon />
                      </button>
                      <button className="p-1.5 text-[#71717a] hover:text-[#ef4444] transition-colors" title="Delete">
                        <DeleteIcon />
                      </button>
                    </div>
                  </div>
                );
              })}

              {filtered.length === 0 && (
                <div className="px-6 py-16 text-center">
                  <div className="text-[#a1a1aa] text-sm">Không tìm thấy dữ liệu.</div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default PromptManagement;
