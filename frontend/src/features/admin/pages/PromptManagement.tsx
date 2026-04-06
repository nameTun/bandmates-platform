import React, { useState, useMemo } from 'react';

/* ── MOCK DATA ── */
const mockCategories = [
  { id: '1', name: 'Line Graph', taskType: 'task_1_academic' },
  { id: '2', name: 'Bar Chart', taskType: 'task_1_academic' },
  { id: '3', name: 'Pie Chart', taskType: 'task_1_academic' },
  { id: '4', name: 'Table', taskType: 'task_1_academic' },
  { id: '5', name: 'Mixed', taskType: 'task_1_academic' },
  { id: '6', name: 'Process', taskType: 'task_1_academic' },
  { id: '7', name: 'Map', taskType: 'task_1_academic' },
  { id: '8', name: 'Formal Letter', taskType: 'task_1_general' },
  { id: '9', name: 'Semi-formal Letter', taskType: 'task_1_general' },
  { id: '10', name: 'Informal Letter', taskType: 'task_1_general' },
  { id: '11', name: 'Opinion (Agree/Disagree)', taskType: 'task_2' },
  { id: '12', name: 'Discussion (Both Views)', taskType: 'task_2' },
  { id: '13', name: 'Problem-Solution', taskType: 'task_2' },
  { id: '14', name: 'Advantages/Disadvantages', taskType: 'task_2' },
  { id: '15', name: 'Two-Part Question', taskType: 'task_2' },
];

const mockTopics = [
  { id: 't1', name: 'Education' },
  { id: 't2', name: 'Technology' },
  { id: 't3', name: 'Environment' },
  { id: 't4', name: 'Health' },
  { id: 't5', name: 'Society' },
];

const mockPrompts = [
  { id: '1', taskType: 'task_2', category: 'Opinion', topic: 'Education', content: 'Some people believe that children should be taught how to manage money...', isActive: true, createdAt: '2024-03-15' },
  { id: '2', taskType: 'task_2', category: 'Discussion', topic: 'Technology', content: 'In many countries, the use of mobile phones in public places is...', isActive: true, createdAt: '2024-03-14' },
  { id: '3', taskType: 'task_1_academic', category: 'Line Graph', topic: null, content: 'The graph below shows the number of overseas visitors...', isActive: true, createdAt: '2024-03-12' },
];

const taskTypeLabel: Record<string, { text: string; color: string }> = {
  task_1_academic: { text: 'Task 1 Aca', color: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' },
  task_1_general: { text: 'Task 1 Gen', color: 'bg-teal-500/10 text-teal-400 border-teal-500/20' },
  task_2: { text: 'Task 2', color: 'bg-violet-500/10 text-violet-400 border-violet-500/20' },
};

/* ── UI COMPONENTS ── */
const PlusIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
  </svg>
);

const PromptManagement: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTask, setFilterTask] = useState('all');
  const [showForm, setShowForm] = useState(false);
  
  // States cho Form
  const [selectedTaskType, setSelectedTaskType] = useState('task_2');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('');

  // Lọc Categories theo Task Type đang chọn
  const availableCategories = useMemo(() => {
    return mockCategories.filter(c => c.taskType === selectedTaskType);
  }, [selectedTaskType]);

  const filtered = mockPrompts.filter(p => {
    const matchSearch = p.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.topic && p.topic.toLowerCase().includes(searchQuery.toLowerCase()));
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
            Tạo đề bài mới
          </button>
        </div>

        {/* Add Form (Collapsible) - Linear/Ghost aesthetic */}
        {showForm && (
          <div className="bg-[#0f0f0f] border border-[#27272a] rounded-xl p-8 mb-10 shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
            <h3 className="text-base font-semibold text-white mb-6 tracking-tight">Khai báo cấu trúc đề bài</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-5">
              {/* Task Type */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-medium text-[#71717a] uppercase tracking-wider">Loại bài thi</label>
                <select 
                  value={selectedTaskType}
                  onChange={(e) => {
                    setSelectedTaskType(e.target.value);
                    setSelectedCategory('');
                  }}
                  className="w-full bg-[#18181b] border border-[#27272a] text-[#ededed] text-sm rounded-lg px-3.5 py-2.5 outline-none hover:border-[#3f3f46] focus:border-[#d4d4d8] focus:ring-1 focus:ring-[#d4d4d8] transition-all appearance-none cursor-pointer"
                >
                  <option value="task_2">IELTS Task 2 (Essay)</option>
                  <option value="task_1_academic">IELTS Task 1 Academic</option>
                  <option value="task_1_general">IELTS Task 1 General</option>
                </select>
              </div>

              {/* Category (Dynamic) */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-medium text-[#71717a] uppercase tracking-wider">Dạng bài</label>
                <select 
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full bg-[#18181b] border border-[#27272a] text-[#ededed] text-sm rounded-lg px-3.5 py-2.5 outline-none hover:border-[#3f3f46] focus:border-[#d4d4d8] focus:ring-1 focus:ring-[#d4d4d8] transition-all appearance-none cursor-pointer"
                >
                  <option value="" disabled>Chọn dạng bài...</option>
                  {availableCategories.map(cat => (
                    <option key={cat.id} value={cat.name}>{cat.name}</option>
                  ))}
                </select>
              </div>

              {/* Topic (Only for Task 2) */}
              {selectedTaskType === 'task_2' && (
                <div className="flex flex-col gap-1.5 animate-in fade-in duration-300">
                  <label className="text-[11px] font-medium text-[#71717a] uppercase tracking-wider">Chủ đề xã hội</label>
                  <select 
                    value={selectedTopic}
                    onChange={(e) => setSelectedTopic(e.target.value)}
                    className="w-full bg-[#18181b] border border-[#27272a] text-[#ededed] text-sm rounded-lg px-3.5 py-2.5 outline-none hover:border-[#3f3f46] focus:border-[#d4d4d8] focus:ring-1 focus:ring-[#d4d4d8] transition-all appearance-none cursor-pointer"
                  >
                    <option value="" disabled>Chọn chủ đề...</option>
                    {mockTopics.map(top => (
                      <option key={top.id} value={top.name}>{top.name}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <div className="flex flex-col gap-1.5 mb-5">
              <label className="text-[11px] font-medium text-[#71717a] uppercase tracking-wider">Nội dung đề bài chi tiết</label>
              <textarea
                rows={4}
                placeholder="Ví dụ: Some people believe that..."
                className="w-full bg-[#18181b] border border-[#27272a] text-[#ededed] text-sm rounded-lg px-3.5 py-3 outline-none hover:border-[#3f3f46] focus:border-[#d4d4d8] focus:ring-1 focus:ring-[#d4d4d8] transition-all resize-none placeholder:text-[#52525b] font-mono"
              />
            </div>

            {/* Link Image ONLY for Task 1 */}
            {selectedTaskType !== 'task_2' && (
              <div className="flex flex-col gap-1.5 mb-6 animate-in fade-in duration-300">
                <label className="text-[11px] font-medium text-[#71717a] uppercase tracking-wider flex items-center gap-2">
                  <span>Link hình ảnh biểu đồ</span>
                  <span className="bg-[#27272a] text-[#a1a1aa] px-1.5 py-0.5 rounded-[4px] text-[9px] uppercase">Bắt buộc đối với biểu đồ</span>
                </label>
                <input
                  type="url"
                  placeholder="https://imgur.com/image.png"
                  className="w-full bg-[#18181b] border border-[#27272a] text-[#ededed] text-sm rounded-lg px-3.5 py-2.5 outline-none hover:border-[#3f3f46] focus:border-[#d4d4d8] focus:ring-1 focus:ring-[#d4d4d8] transition-all font-mono placeholder:text-[#52525b]"
                />
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-3 pt-2 border-t border-[#27272a] mt-6">
              <button className="px-5 py-2.5 bg-white text-black text-sm font-medium rounded-lg hover:bg-[#ededed] transition-colors flexitems-center gap-2">
                Hoàn tất tạo đề
              </button>
              <button
                onClick={() => setShowForm(false)}
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
              { key: 'task_2', label: 'T2 Essay' },
              { key: 'task_1_academic', label: 'T1 Academic' },
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
            <div className="col-span-1">ID</div>
            <div className="col-span-2">Dạng bài</div>
            <div className="col-span-2">Chủ đề</div>
            <div className="col-span-5">Nội dung</div>
            <div className="col-span-2 text-right">Settings</div>
          </div>

          {/* Rows */}
          {filtered.map((prompt, i) => {
            const tt = taskTypeLabel[prompt.taskType] || taskTypeLabel.task_2;
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
                  <span className="text-xs font-medium text-[#ededed]">{prompt.category}</span>
                </div>
                <div className="col-span-2">
                   {prompt.topic ? (
                     <span className="text-xs text-[#a1a1aa] bg-[#18181b] px-2 py-1 rounded-md border border-[#27272a]">{prompt.topic}</span>
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
        </div>
      </div>
    </div>
  );
};

/* ── HELPER COMPONENTS ── */
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

export default PromptManagement;
