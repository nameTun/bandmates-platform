import React, { useState } from 'react';

/* ── Mock Data ── */
const mockPrompts = [
  { id: '1', taskType: 'task_2', topic: 'Education', content: 'Some people believe that children should be taught how to manage money...', isActive: true, createdAt: '2024-03-15' },
  { id: '2', taskType: 'task_2', topic: 'Technology', content: 'In many countries, the use of mobile phones in public places is...', isActive: true, createdAt: '2024-03-14' },
  { id: '3', taskType: 'task_2', topic: 'Environment', content: 'Climate change is now an accepted threat to our planet...', isActive: false, createdAt: '2024-03-13' },
  { id: '4', taskType: 'task_1_academic', topic: 'Line Graph', content: 'The graph below shows the number of overseas visitors...', isActive: true, createdAt: '2024-03-12' },
  { id: '5', taskType: 'task_2', topic: 'Health', content: 'An increasing number of people are choosing to have cosmetic surgery...', isActive: true, createdAt: '2024-03-11' },
  { id: '6', taskType: 'task_2', topic: 'Society', content: 'Rich countries often give money to poorer countries...', isActive: true, createdAt: '2024-03-10' },
];

const taskTypeLabel: Record<string, { text: string; color: string }> = {
  task_1_academic: { text: 'Task 1 Aca', color: 'bg-cyan-400/10 text-cyan-400 border-cyan-400/20' },
  task_1_general: { text: 'Task 1 Gen', color: 'bg-teal-400/10 text-teal-400 border-teal-400/20' },
  task_2: { text: 'Task 2', color: 'bg-violet-400/10 text-violet-400 border-violet-400/20' },
};

const PromptManagement: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTask, setFilterTask] = useState('all');
  const [showForm, setShowForm] = useState(false);

  const filtered = mockPrompts.filter(p => {
    const matchSearch = p.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.topic.toLowerCase().includes(searchQuery.toLowerCase());
    const matchTask = filterTask === 'all' || p.taskType === filterTask;
    return matchSearch && matchTask;
  });

  return (
    <div className="min-h-screen">
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">Quản lý Đề thi</h1>
            <p className="text-slate-500 mt-1">Thêm, sửa, xóa và quản lý toàn bộ đề bài IELTS Writing.</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-orange-500 to-red-500 text-white text-sm font-bold rounded-xl hover:shadow-lg hover:shadow-orange-500/25 transition-all active:scale-95"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Thêm đề mới
          </button>
        </div>

        {/* Add Form (Collapsible) */}
        {showForm && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mb-6 animate-in">
            <h3 className="text-sm font-bold text-white mb-4">Thêm đề bài mới</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5">Loại bài thi</label>
                <select className="w-full bg-slate-800 border border-slate-700 text-slate-200 text-sm rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500">
                  <option value="task_2">Task 2</option>
                  <option value="task_1_academic">Task 1 Academic</option>
                  <option value="task_1_general">Task 1 General</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5">Chủ đề</label>
                <select className="w-full bg-slate-800 border border-slate-700 text-slate-200 text-sm rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500">
                  <option>Education</option>
                  <option>Technology</option>
                  <option>Environment</option>
                  <option>Health</option>
                  <option>Society</option>
                </select>
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-xs font-semibold text-slate-500 mb-1.5">Nội dung đề bài</label>
              <textarea
                rows={4}
                placeholder="Nhập đề bài IELTS Writing..."
                className="w-full bg-slate-800 border border-slate-700 text-slate-200 text-sm rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 resize-none placeholder:text-slate-600"
              />
            </div>
            <div className="mb-4">
              <label className="block text-xs font-semibold text-slate-500 mb-1.5">Bài mẫu (Model Answer) — tùy chọn</label>
              <textarea
                rows={3}
                placeholder="Nhập bài viết mẫu..."
                className="w-full bg-slate-800 border border-slate-700 text-slate-200 text-sm rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 resize-none placeholder:text-slate-600"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5">Link ảnh (Task 1) — tùy chọn</label>
                <input
                  type="url"
                  placeholder="https://..."
                  className="w-full bg-slate-800 border border-slate-700 text-slate-200 text-sm rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 placeholder:text-slate-600"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5">Gợi ý — tùy chọn</label>
                <input
                  type="text"
                  placeholder="Gợi ý cho người dùng..."
                  className="w-full bg-slate-800 border border-slate-700 text-slate-200 text-sm rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 placeholder:text-slate-600"
                />
              </div>
            </div>
            <div className="flex gap-3">
              <button className="px-5 py-2.5 bg-gradient-to-r from-orange-500 to-red-500 text-white text-sm font-bold rounded-xl hover:shadow-lg hover:shadow-orange-500/25 transition-all active:scale-95">
                Lưu đề bài
              </button>
              <button
                onClick={() => setShowForm(false)}
                className="px-5 py-2.5 bg-slate-800 text-slate-400 text-sm font-medium rounded-xl hover:bg-slate-700 hover:text-white transition-all"
              >
                Hủy
              </button>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          {/* Search */}
          <div className="relative flex-1">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Tìm kiếm đề bài, chủ đề..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 text-slate-200 text-sm rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 placeholder:text-slate-600"
            />
          </div>
          {/* Task Filter */}
          <div className="flex gap-2">
            {[
              { key: 'all', label: 'Tất cả' },
              { key: 'task_2', label: 'Task 2' },
              { key: 'task_1_academic', label: 'Task 1 Aca' },
            ].map(f => (
              <button
                key={f.key}
                onClick={() => setFilterTask(f.key)}
                className={`px-3.5 py-2 text-xs font-semibold rounded-xl transition-all ${filterTask === f.key
                    ? 'bg-orange-500/10 text-orange-400 border border-orange-500/30'
                    : 'bg-slate-900 text-slate-500 border border-slate-800 hover:border-slate-700 hover:text-slate-300'
                  }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Prompts Table */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
          {/* Table Header */}
          <div className="grid grid-cols-12 px-6 py-3 text-[11px] font-bold text-slate-600 uppercase tracking-wider border-b border-slate-800">
            <div className="col-span-1">#</div>
            <div className="col-span-1">Loại</div>
            <div className="col-span-2">Chủ đề</div>
            <div className="col-span-5">Nội dung đề bài</div>
            <div className="col-span-1 text-center">Trạng thái</div>
            <div className="col-span-2 text-right">Hành động</div>
          </div>

          {/* Rows */}
          {filtered.map((prompt, i) => {
            const tt = taskTypeLabel[prompt.taskType] || taskTypeLabel.task_2;
            return (
              <div
                key={prompt.id}
                className={`grid grid-cols-12 items-center px-6 py-4 hover:bg-slate-800/40 transition-colors ${i < filtered.length - 1 ? 'border-b border-slate-800/30' : ''
                  }`}
              >
                <div className="col-span-1 text-xs text-slate-600 font-mono">{i + 1}</div>
                <div className="col-span-1">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${tt.color}`}>
                    {tt.text}
                  </span>
                </div>
                <div className="col-span-2 text-sm font-medium text-slate-300">{prompt.topic}</div>
                <div className="col-span-5 text-sm text-slate-400 truncate pr-4">{prompt.content}</div>
                <div className="col-span-1 text-center">
                  <span className={`inline-block w-2 h-2 rounded-full ${prompt.isActive ? 'bg-emerald-400' : 'bg-slate-600'}`} />
                </div>
                <div className="col-span-2 flex justify-end gap-2">
                  <button className="p-2 rounded-lg text-slate-500 hover:text-blue-400 hover:bg-blue-400/10 transition-all" title="Sửa">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button className="p-2 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-400/10 transition-all" title="Xóa">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            );
          })}

          {filtered.length === 0 && (
            <div className="px-6 py-12 text-center text-slate-600 text-sm">
              Không tìm thấy đề bài nào phù hợp.
            </div>
          )}
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between mt-4 px-2">
          <p className="text-xs text-slate-600">Hiển thị {filtered.length} / {mockPrompts.length} đề bài</p>
          <div className="flex gap-1">
            {[1, 2, 3].map(p => (
              <button
                key={p}
                className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${p === 1
                    ? 'bg-orange-500/10 text-orange-400 border border-orange-500/30'
                    : 'text-slate-600 hover:bg-slate-800 hover:text-slate-300'
                  }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PromptManagement;
