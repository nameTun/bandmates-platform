import React, { useState } from 'react';
import { Tabs } from 'antd'; // Tạm giữ Tabs của antd, nhưng sẽ đè style css cực mạnh

/* ── MOCK DATA ── */
const mockAcademicCategories = [
  { id: '1', name: 'Line Graph', description: 'Biểu đồ đường xu hướng qua thời gian.', isActive: true },
  { id: '2', name: 'Bar Chart', description: 'Biểu đồ cột so sánh các số liệu.', isActive: true },
  { id: '3', name: 'Pie Chart', description: 'Biểu đồ tròn thể hiện tỷ lệ phần trăm.', isActive: true },
  { id: '4', name: 'Table', description: 'Bảng số liệu chi tiết.', isActive: true },
  { id: '5', name: 'Mixed', description: 'Sự kết hợp giữa 2 loại biểu đồ (vừa line vừa bar).', isActive: true },
  { id: '6', name: 'Process', description: 'Quy trình sản xuất hoặc chu trình tự nhiên.', isActive: true },
  { id: '7', name: 'Map', description: 'Sự thay đổi về địa điểm hoặc quy hoạch.', isActive: true },
];

const mockGeneralCategories = [
  { id: 'g1', name: 'Formal Letter', description: 'Thư trang trọng dành cho công việc hoặc khiếu nại.', isActive: true },
  { id: 'g2', name: 'Semi-formal Letter', description: 'Thư dành cho người quen biết nhưng cần sự chuyên nghiệp.', isActive: true },
  { id: 'g3', name: 'Informal Letter', description: 'Thư thân mật dành cho bạn bè, người thân.', isActive: true },
];

const mockTask2Subjects = [
  { id: 't1', name: 'Education', description: 'Chủ đề giáo dục, trường học, kỹ năng.', isActive: true },
  { id: 't2', name: 'Environment', description: 'Chủ đề môi trường, năng lượng, biến đổi khí hậu.', isActive: true },
  { id: 't3', name: 'Technology', description: 'Chủ đề công nghệ, AI, mạng xã hội.', isActive: true },
  { id: 't4', name: 'Health', description: 'Chủ đề sức khỏe, y tế, lối sống.', isActive: true },
];

const mockTask2EssayTypes = [
  { id: 'e1', name: 'Opinion (Agree/Disagree)', description: 'Nêu quan điểm cá nhân đồng ý hay phản đối.', isActive: true },
  { id: 'e2', name: 'Discussion (Both Views)', description: 'Thảo luận cả 2 mặt của vấn đề.', isActive: true },
  { id: 'e3', name: 'Problem-Solution', description: 'Phân tích nguyên nhân và đề xuất giải pháp.', isActive: true },
  { id: 'e4', name: 'Advantages & Disadvantages', description: 'Cân nhắc lợi ích và tác hại.', isActive: true },
  { id: 'e5', name: 'Two-Part Question', description: 'Trả lời đồng thời hai câu hỏi khác nhau.', isActive: true },
];

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

  // Modern Minimal Table Renderer
  const MinimalTable = ({ data }: { data: any[] }) => (
      <div className="border border-[#27272a] rounded-xl overflow-hidden bg-[#0a0a0a]">
        <div className="grid grid-cols-12 px-6 py-3 text-[10px] font-semibold text-[#71717a] uppercase tracking-wider border-b border-[#27272a] bg-[#0f0f0f]">
            <div className="col-span-3">Tên Định Danh</div>
            <div className="col-span-6">Mô tả</div>
            <div className="col-span-1 text-center">Trạng thái</div>
            <div className="col-span-2 text-right">Actions</div>
        </div>
        {data.map((item, i) => (
            <div key={item.id} className={`grid grid-cols-12 items-center px-6 py-4 hover:bg-[#18181b] transition-colors group ${i < data.length - 1 ? 'border-b border-[#27272a]' : ''}`}>
                <div className="col-span-3 font-semibold text-[#ededed] text-sm tracking-tight">{item.name}</div>
                <div className="col-span-6 text-sm text-[#a1a1aa] pr-8">{item.description}</div>
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
        ))}
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
        <div className="border border-[#27272a] rounded-xl bg-[#0f0f0f] shadow-lg">
            <Tabs
                activeKey={activeTab}
                onChange={setActiveTab}
                className="sleek-tabs"
                items={[
                    { key: '1', label: 'T1 Academic (Dạng bài)', children: <div className="p-6"><MinimalTable data={mockAcademicCategories} /></div> },
                    { key: '2', label: 'T1 General (Loại thư)', children: <div className="p-6"><MinimalTable data={mockGeneralCategories} /></div> },
                    { key: '3', label: 'T2 Subjects (Chủ đề)', children: <div className="p-6"><MinimalTable data={mockTask2Subjects} /></div> },
                    { key: '4', label: 'T2 Essays (Dạng bài)', children: <div className="p-6"><MinimalTable data={mockTask2EssayTypes} /></div> },
                ]}
            />
        </div>
      </div>

      {/* --- CREATE MODAL --- */}
      {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0">
             {/* Backdrop */}
             <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
             
             {/* Modal Content */}
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
                            <input type="text" placeholder="Ví dụ: Process, Map, Health..." className="w-full bg-[#18181b] border border-[#27272a] text-[#ededed] text-sm rounded-lg px-3.5 py-2.5 outline-none hover:border-[#3f3f46] focus:border-[#d4d4d8] focus:ring-1 focus:ring-[#d4d4d8] transition-all placeholder:text-[#52525b]" />
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[11px] font-medium text-[#71717a] uppercase tracking-wider">Mô tả dành cho Admin</label>
                            <textarea rows={3} placeholder="Mô tả công dụng của dạng bài này..." className="w-full bg-[#18181b] border border-[#27272a] text-[#ededed] text-sm rounded-lg px-3.5 py-2.5 outline-none hover:border-[#3f3f46] focus:border-[#d4d4d8] focus:ring-1 focus:ring-[#d4d4d8] transition-all resize-none placeholder:text-[#52525b]" />
                        </div>
                    </div>
                    <div className="flex justify-end gap-3">
                        <button onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 bg-transparent text-[#a1a1aa] text-sm font-medium rounded-lg hover:bg-[#18181b] hover:text-[#ededed] transition-colors">Hủy</button>
                        <button className="px-5 py-2.5 bg-white text-black text-sm font-medium rounded-lg hover:bg-[#ededed] transition-colors">Tạo ngay</button>
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
