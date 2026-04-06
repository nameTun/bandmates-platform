import React, { useState, useEffect } from 'react';
import { Tabs, message, Spin } from 'antd';
import { categoryApi } from '../api/category-api';
import type { Category } from '../api/category-api';
import { topicApi } from '../api/topic-api';
import type { Topic } from '../api/topic-api';
import { TaskType } from '@/common/enums/task-type.enum';

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

const TopicManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState('1');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState({ name: '', description: '' });

  // Reset form when modal closes/opens
  useEffect(() => {
    if (!isModalOpen) setFormData({ name: '', description: '' });
  }, [isModalOpen]);

  // States lưu trữ dữ liệu thực
  const [categories, setCategories] = useState<Category[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);

  // Fetch dữ liệu khi mount
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [catData, topData] = await Promise.all([
        categoryApi.getCategories(),
        topicApi.getTopics()
      ]);
      setCategories(catData);
      setTopics(topData);
    } catch (error) {
      message.error('Không thể tải dữ liệu. Vui lòng kiểm tra kết nối Backend!');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!formData.name.trim()) {
      return message.warning('Vui lòng nhập tên!');
    }

    try {
      setSubmitting(true);
      
      // Xác định loại dữ liệu cần tạo dựa trên Tab
      if (activeTab === '3') {
        // Tạo TOPIC (Chủ đề xã hội Task 2)
        await topicApi.createTopic({
          name: formData.name,
          taskType: TaskType.TASK_2,
          description: formData.description
        });
        message.success('Đã tạo chủ đề mới thành công!');
      } else {
        // Tạo CATEGORY (Dạng bài Task 1 hoặc Essay Task 2)
        let taskType: TaskType = TaskType.TASK_1_ACADEMIC;
        if (activeTab === '2') taskType = TaskType.TASK_1_GENERAL;
        if (activeTab === '4') taskType = TaskType.TASK_2;

        await categoryApi.createCategory({
          name: formData.name,
          taskType: taskType,
          description: formData.description
        });
        message.success('Đã tạo dạng bài mới thành công!');
      }

      setIsModalOpen(false);
      fetchData(); // Tải lại danh sách
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || 'Có lỗi xảy ra khi tạo!';
      message.error(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  // Phân loại dữ liệu cho từng Tab
  const academicCategories = categories.filter(c => c.taskType === TaskType.TASK_1_ACADEMIC);
  const generalCategories = categories.filter(c => c.taskType === TaskType.TASK_1_GENERAL);
  const task2EssayTypes = categories.filter(c => c.taskType === TaskType.TASK_2);
  const task2Subjects = topics; // Topics mặc định chỉ dành cho Task 2

  // Modern Minimal Table Renderer
  const MinimalTable = ({ data }: { data: any[] }) => (
      <div className="border border-[#27272a] rounded-xl overflow-hidden bg-[#0a0a0a]">
        <div className="grid grid-cols-12 px-6 py-3 text-[10px] font-semibold text-[#71717a] uppercase tracking-wider border-b border-[#27272a] bg-[#0f0f0f]">
            <div className="col-span-3">Tên Định Danh</div>
            <div className="col-span-6">Mô tả</div>
            <div className="col-span-1 text-center">Trạng thái</div>
            <div className="col-span-2 text-right">Actions</div>
        </div>
        {data.length === 0 ? (
          <div className="px-6 py-12 text-center text-[#52525b] text-sm">Chưa có dữ liệu nào được tạo.</div>
        ) : (
          data.map((item, i) => (
              <div key={item.id} className={`grid grid-cols-12 items-center px-6 py-4 hover:bg-[#18181b] transition-colors group ${i < data.length - 1 ? 'border-b border-[#27272a]' : ''}`}>
                  <div className="col-span-3 font-semibold text-[#ededed] text-sm tracking-tight">{item.name}</div>
                  <div className="col-span-6 text-sm text-[#a1a1aa] pr-8">{item.description || 'Không có mô tả'}</div>
                  <div className="col-span-1 flex justify-center">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${item.isActive ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-[#27272a] text-[#71717a]'}`}>
                          {item.isActive ? 'Active' : 'Hidden'}
                      </span>
                  </div>
                  <div className="col-span-2 flex justify-end gap-2 pr-1">
                     <button className="p-1.5 text-[#71717a] hover:text-white transition-colors" title="Edit"><EditIcon /></button>
                     <button className="p-1.5 text-[#71717a] hover:text-[#ef4444] transition-colors" title="Delete"><DeleteIcon /></button>
                  </div>
              </div>
          ))
        )}
      </div>
  );

  const activeTabLabels: Record<string, string> = {
    '1': 'Dạng bài Task 1 Academic',
    '2': 'Loại thư Task 1 General',
    '3': 'Chủ đề xã hội Task 2',
    '4': 'Dạng bài Essay Task 2',
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#ededed] font-sans selection:bg-orange-500/30 selection:text-white pb-20">
      <div className="max-w-[1000px] mx-auto px-8 py-12">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-white mb-2">Danh mục & Chủ đề</h1>
            <p className="text-[#a1a1aa] text-sm">
                Quản lý các dạng bài và chủ đề. Nếu bạn thêm dạng bài mới ở đây, hệ thống sinh đề sẽ tự động hỗ trợ dạng bài đó.
            </p>
          </div>
          <button 
             onClick={() => setIsModalOpen(true)}
             className="flex items-center gap-2 px-5 py-2.5 bg-white text-black text-sm font-medium rounded-lg hover:bg-[#ededed] transition-colors shadow-[0_0_15px_rgba(255,255,255,0.1)] active:scale-95 flex-shrink-0"
          >
             <PlusIcon /> {`Thêm ${activeTabLabels[activeTab] || 'mới'}`}
          </button>
        </div>

        {/* Main Content Area */}
        <div className="border border-[#27272a] rounded-xl bg-[#0f0f0f] shadow-lg overflow-hidden">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
              <Spin size="large" />
              <p className="text-[#71717a] text-sm animate-pulse">Đang kết nối Database...</p>
            </div>
          ) : (
            <Tabs
                activeKey={activeTab}
                onChange={setActiveTab}
                className="sleek-tabs"
                items={[
                    { key: '1', label: 'T1 Academic (Dạng bài)', children: <div className="p-6"><MinimalTable data={academicCategories} /></div> },
                    { key: '2', label: 'T1 General (Loại thư)', children: <div className="p-6"><MinimalTable data={generalCategories} /></div> },
                    { key: '3', label: 'T2 Subjects (Chủ đề)', children: <div className="p-6"><MinimalTable data={task2Subjects} /></div> },
                    { key: '4', label: 'T2 Essays (Dạng bài)', children: <div className="p-6"><MinimalTable data={task2EssayTypes} /></div> },
                ]}
            />
          )}
        </div>
      </div>

      {/* --- CREATE MODAL --- (Tạm thời giữ nguyên form UI cho đến bước tiếp theo) */}
      {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0">
             <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
             <div className="relative bg-[#0f0f0f] border border-[#27272a] rounded-2xl w-full max-w-md shadow-[0_20px_50px_rgba(0,0,0,0.7)] animate-in fade-in zoom-in-95 duration-200">
                <div className="px-6 py-5 border-b border-[#27272a] flex justify-between items-center">
                    <h3 className="text-base font-semibold text-white tracking-tight">
                        Thêm: <span className="text-white ml-1">{activeTabLabels[activeTab]}</span>
                    </h3>
                    <button onClick={() => setIsModalOpen(false)} className="text-[#a1a1aa] hover:text-white transition-colors">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>
                <div className="p-6">
                    <div className="flex flex-col gap-4 mb-6">
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[11px] font-medium text-[#71717a] uppercase tracking-wider">Tên hiển thị</label>
                            <input 
                                type="text" 
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                                placeholder="Ví dụ: Process, Map, Health..." 
                                className="w-full bg-[#18181b] border border-[#27272a] text-[#ededed] text-sm rounded-lg px-3.5 py-2.5 outline-none hover:border-[#3f3f46] focus:border-[#d4d4d8] focus:ring-1 focus:ring-[#d4d4d8] transition-all placeholder:text-[#52525b]" 
                            />
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[11px] font-medium text-[#71717a] uppercase tracking-wider">Mô tả dành cho Admin</label>
                            <textarea 
                                rows={3} 
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Mô tả công dụng của dạng bài này..." 
                                className="w-full bg-[#18181b] border border-[#27272a] text-[#ededed] text-sm rounded-lg px-3.5 py-2.5 outline-none hover:border-[#3f3f46] focus:border-[#d4d4d8] focus:ring-1 focus:ring-[#d4d4d8] transition-all resize-none placeholder:text-[#52525b]" 
                            />
                        </div>
                    </div>
                    <div className="flex justify-end gap-3">
                        <button 
                            onClick={() => setIsModalOpen(false)} 
                            disabled={submitting}
                            className="px-5 py-2.5 bg-transparent text-[#a1a1aa] text-sm font-medium rounded-lg hover:bg-[#18181b] hover:text-[#ededed] transition-colors disabled:opacity-50"
                        >
                            Hủy
                        </button>
                        <button 
                            onClick={handleCreate}
                            disabled={submitting}
                            className="px-5 py-2.5 bg-white text-black text-sm font-medium rounded-lg hover:bg-[#ededed] transition-colors disabled:opacity-50 flex items-center gap-2"
                        >
                            {submitting ? <Spin size="small" /> : 'Tạo ngay'}
                        </button>
                    </div>
                </div>
             </div>
          </div>
      )}

      {/* Global Style Override for Tabs */}
      <style>{`
        .sleek-tabs .ant-tabs-nav { margin: 0 !important; border-bottom: 1px solid #27272a !important; padding: 0 16px; }
        .sleek-tabs .ant-tabs-nav::before { display: none !important; }
        .sleek-tabs .ant-tabs-tab { padding: 16px 8px !important; margin: 0 16px 0 0 !important; color: #a1a1aa !important; font-size: 13px; transition: color 0.2s ease; }
        .sleek-tabs .ant-tabs-tab:hover { color: #ededed !important; }
        .sleek-tabs .ant-tabs-tab-active .ant-tabs-tab-btn { color: white !important; font-weight: 600 !important; }
        .sleek-tabs .ant-tabs-ink-bar { background: white !important; height: 2px !important; }
      `}</style>
    </div>
  );
};

export default TopicManagement;
