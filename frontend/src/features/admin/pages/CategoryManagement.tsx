import React, { useState, useMemo, useEffect } from 'react';
import { message, Spin, Tabs, Badge, Tooltip, Modal, Input as AntInput } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import { categoryService, type Category } from '../services/category.service';
import { TaskType } from '@/common/enums/task-type.enum';

/* ── UI COMPONENTS ── */
const PlusIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4">
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

const SearchIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3.5 h-3.5 text-slate-400">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
);

/* ── COLOR PALETTE FOR TAGS ── */
const TAG_COLORS = [
  { bg: 'bg-blue-50',    text: 'text-blue-700',    border: 'border-blue-200' },
  { bg: 'bg-emerald-50', text: 'text-emerald-700',  border: 'border-emerald-200' },
  { bg: 'bg-violet-50',  text: 'text-violet-700',   border: 'border-violet-200' },
  { bg: 'bg-amber-50',   text: 'text-amber-700',    border: 'border-amber-200' },
  { bg: 'bg-rose-50',    text: 'text-rose-700',     border: 'border-rose-200' },
  { bg: 'bg-cyan-50',    text: 'text-cyan-700',     border: 'border-cyan-200' },
  { bg: 'bg-fuchsia-50', text: 'text-fuchsia-700',  border: 'border-fuchsia-200' },
  { bg: 'bg-lime-50',    text: 'text-lime-700',     border: 'border-lime-200' },
  { bg: 'bg-orange-50',  text: 'text-orange-700',   border: 'border-orange-200' },
  { bg: 'bg-teal-50',    text: 'text-teal-700',     border: 'border-teal-200' },
  { bg: 'bg-indigo-50',  text: 'text-indigo-700',   border: 'border-indigo-200' },
];

const getTagColor = (name: string) => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return TAG_COLORS[Math.abs(hash) % TAG_COLORS.length];
};

const CategoryManagement: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [categories, setCategories] = useState<Category[]>([]);
    const [activeTab, setActiveTab] = useState<string>(TaskType.TASK_2);
    const [searchQuery, setSearchQuery] = useState('');

    // Modal States
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
    const [formName, setFormName] = useState('');
    const [formDescription, setFormDescription] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            setLoading(true);
            const data = await categoryService.getCategories();
            setCategories(data);
        } catch (error) {
            message.error('Không thể tải danh sách danh mục');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenEdit = (cat: Category) => {
        setSelectedCategory(cat);
        setFormName(cat.name);
        setFormDescription(cat.description || '');
        setIsEditModalOpen(true);
    };

    const handleCreate = async () => {
        if (!formName.trim()) return message.warning('Vui lòng nhập tên dạng bài');
        try {
            setSubmitting(true);
            await categoryService.createCategory({
                name: formName,
                description: formDescription,
                taskType: activeTab as TaskType
            });
            message.success('Đã tạo dạng bài mới thành công');
            setIsAddModalOpen(false);
            setFormName('');
            setFormDescription('');
            fetchCategories();
        } catch (error: any) {
            message.error(error.response?.data?.message || 'Có lỗi xảy ra');
        } finally {
            setSubmitting(false);
        }
    };

    const handleUpdate = async () => {
        if (!selectedCategory || !formName.trim()) return;
        try {
            setSubmitting(true);
            await categoryService.updateCategory(selectedCategory.id, {
                name: formName,
                description: formDescription
            });
            message.success('Đã cập nhật thông tin thành công');
            setIsEditModalOpen(false);
            fetchCategories();
        } catch (error: any) {
            message.error(error.response?.data?.message || 'Có lỗi xảy ra');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = (id: string, name: string, count: number) => {
        Modal.confirm({
            title: 'Xác nhận xoá dạng bài?',
            icon: <ExclamationCircleOutlined className="text-red-500" />,
            content: (
                <div className="mt-3">
                    <p className="text-slate-600">Bạn đang chuẩn bị xoá dạng bài <span className="font-bold text-slate-800">"{name}"</span>.</p>
                    {count > 0 && (
                        <div className="mt-2 p-3 bg-red-50 border border-red-100 rounded-lg">
                            <p className="text-red-700 text-xs font-semibold leading-relaxed">
                                CẢNH BÁO: Đang có <span className="underline font-black">{count} đề bài</span> thuộc danh mục này. 
                                Nếu bạn xoá, thông tin phân loại của các đề bài đó sẽ bị xoá bỏ (chuyển về giá trị rỗng/NULL).
                            </p>
                        </div>
                    )}
                    <p className="mt-3 text-red-500 text-[11px] font-bold italic uppercase tracking-wider">Thao tác này không thể hoàn tác!</p>
                </div>
            ),
            okText: 'Tôi hiểu, hãy xoá',
            okButtonProps: { danger: true, className: 'rounded-lg font-bold shadow-none' },
            cancelText: 'Huỷ bỏ',
            cancelButtonProps: { className: 'rounded-lg font-semibold' },
            onOk: async () => {
                try {
                    await categoryService.deleteCategory(id);
                    message.success('Đã xoá danh mục thành công');
                    fetchCategories();
                } catch (error) {
                    message.error('Lỗi khi xoá danh mục');
                }
            },
        });
    };

    const filteredCategories = useMemo(() => {
        return categories.filter(c => 
            c.taskType === activeTab && 
            c.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [categories, activeTab, searchQuery]);

    const tabConfig = [
        { key: TaskType.TASK_2, label: 'IELTS Task 2 (Essay)', color: 'violet' },
        { key: TaskType.TASK_1_ACADEMIC, label: 'Task 1 Academic', color: 'cyan' },
        { key: TaskType.TASK_1_GENERAL, label: 'Task 1 General', color: 'teal' },
    ];

    const TASK_TYPE_COLORS: Record<string, string> = {
        [TaskType.TASK_2]: 'bg-violet-50 text-violet-700 border-violet-200',
        [TaskType.TASK_1_ACADEMIC]: 'bg-cyan-50 text-cyan-700 border-cyan-200',
        [TaskType.TASK_1_GENERAL]: 'bg-teal-50 text-teal-700 border-teal-200',
    };

    return (
        <div className="min-h-screen bg-transparent text-slate-900 font-sans selection:bg-orange-500/20 selection:text-orange-900">
            <div className="max-w-[1100px] mx-auto px-8 py-12">
                
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Quản lý Danh mục</h1>
                        <p className="text-slate-500 mt-2 text-sm max-w-lg leading-relaxed">
                            Quản lý các dạng bài thi (Categories) cho từng phần thi IELTS. 
                            Cấu trúc danh mục rõ ràng giúp học sinh dễ dàng tìm kiếm và luyện tập.
                        </p>
                    </div>
                    <button
                        onClick={() => { setFormName(''); setFormDescription(''); setIsAddModalOpen(true); }}
                        className="flex items-center justify-center gap-2 px-6 py-3 bg-slate-900 text-white text-sm font-bold rounded-xl hover:bg-slate-800 transition-all shadow-lg shadow-slate-200 active:scale-95 flex-shrink-0"
                    >
                        <PlusIcon />
                        Tạo Dạng bài mới
                    </button>
                </div>

                {/* Main Tabs */}
                <div className="bg-white border border-slate-200 rounded-[24px] overflow-hidden shadow-xl shadow-slate-200/50">
                    <div className="border-b border-slate-100 bg-slate-50/50 px-8 pt-6">
                        <Tabs 
                            activeKey={activeTab} 
                            onChange={setActiveTab}
                            className="category-tabs"
                            items={tabConfig.map(t => ({
                                key: t.key,
                                label: (
                                    <div className="flex items-center gap-2.5 px-1 pb-4">
                                        <span className="font-bold tracking-tight">{t.label}</span>
                                        <Badge 
                                            count={categories.filter(c => c.taskType === t.key).length} 
                                            style={{ backgroundColor: t.key === activeTab ? '#000' : '#94a3b8', fontSize: '10px' }} 
                                        />
                                    </div>
                                )
                            }))}
                        />

                        {/* Search & Stats Bar */}
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-5 border-t border-slate-100/60 mt-[-1px]">
                            <div className="relative w-full sm:w-80">
                                <div className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none">
                                    <SearchIcon />
                                </div>
                                <input 
                                    type="text"
                                    placeholder="Tìm kiếm danh mục..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 text-sm font-medium rounded-xl outline-none focus:border-orange-500/50 focus:ring-4 focus:ring-orange-500/5 transition-all text-slate-800 placeholder:text-slate-400 shadow-sm"
                                />
                            </div>
                            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-4">
                                <div className="flex items-center gap-1.5">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-sm shadow-emerald-200"></div>
                                    {categories.filter(c => c.isActive).length} Active
                                </div>
                                <span>/</span>
                                <div className="text-slate-400">Total: {categories.length}</div>
                            </div>
                        </div>
                    </div>

                    {/* Category List Area */}
                    <div className="p-8 bg-white min-h-[400px]">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-24 gap-4 animate-in fade-in">
                                <Spin size="large" />
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Đang đồng bộ dữ liệu...</span>
                            </div>
                        ) : filteredCategories.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-24 text-center">
                                <div className="w-20 h-20 bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl flex items-center justify-center mb-6">
                                    <svg className="w-8 h-8 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M4 6h16M4 12h16M4 18h7" strokeWidth="2" strokeLinecap="round" /></svg>
                                </div>
                                <h3 className="text-base font-bold text-slate-400 uppercase tracking-widest">Chưa có dữ liệu nào</h3>
                                <p className="text-slate-400 text-xs mt-2">Hãy bắt đầu bằng cách tạo một dạng bài mới cho Task này.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in slide-in-from-bottom-4 duration-500 ease-out">
                                {filteredCategories.map(cat => {
                                    const theme = getTagColor(cat.name);
                                    const taskColor = TASK_TYPE_COLORS[activeTab] || 'bg-slate-50 text-slate-700 border-slate-200';
                                    return (
                                        <div 
                                            key={cat.id} 
                                            className="group bg-white border border-slate-200 rounded-2xl p-6 hover:shadow-2xl hover:shadow-slate-200 transition-all hover:-translate-y-1 cursor-default relative overflow-hidden"
                                        >
                                            {/* Tag indicator */}
                                            <div className={`absolute top-0 right-0 w-12 h-12 ${theme.bg} rotate-45 translate-x-6 -translate-y-6 opacity-40 transition-opacity group-hover:opacity-100`}></div>
                                            
                                            <div className="flex flex-col h-full">
                                                <div className="mb-4">
                                                    <span className={`inline-flex px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border ${taskColor} mb-3`}>
                                                        {activeTab.replace('_', ' ')}
                                                    </span>
                                                    <h4 className={`text-lg font-bold ${theme.text} leading-tight group-hover:text-orange-600 transition-colors`}>
                                                        {cat.name}
                                                    </h4>
                                                </div>

                                                <div className="mt-auto flex items-center justify-between pt-4 border-t border-slate-50">
                                                    <div className="flex flex-col">
                                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Số lượng đề</span>
                                                        <span className="text-sm font-black text-slate-700">{cat.promptsCount || 0}</span>
                                                    </div>
                                                    
                                                    <div className="flex items-center gap-1.5">
                                                        <Tooltip title="Chỉnh sửa">
                                                            <button 
                                                                onClick={() => handleOpenEdit(cat)}
                                                                className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all"
                                                            >
                                                                <EditIcon />
                                                            </button>
                                                        </Tooltip>
                                                        <Tooltip title="Xoá danh mục">
                                                            <button 
                                                                onClick={() => handleDelete(cat.id, cat.name, cat.promptsCount || 0)}
                                                                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                                            >
                                                                <DeleteIcon />
                                                            </button>
                                                        </Tooltip>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Modal: Create */}
            <Modal
                title={<span className="text-lg font-bold text-slate-900 tracking-tight">Tạo Dạng bài mới</span>}
                open={isAddModalOpen}
                onCancel={() => setIsAddModalOpen(false)}
                footer={[
                    <button key="cancel" onClick={() => setIsAddModalOpen(false)} className="px-5 py-2.5 text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors">Huỷ</button>,
                    <button 
                        key="submit" 
                        onClick={handleCreate} 
                        disabled={submitting}
                        className="px-6 py-2.5 bg-slate-900 text-white text-sm font-bold rounded-xl hover:bg-slate-800 transition-all disabled:bg-slate-300"
                    >
                        {submitting ? 'Đang tạo...' : 'Xác nhận tạo'}
                    </button>
                ]}
                className="premium-modal"
                centered
            >
                <div className="py-6 flex flex-col gap-6">
                    <div className="flex flex-col gap-1.5">
                        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Loại bài thi (Task)</label>
                        <div className="px-4 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-sm font-bold text-slate-600">
                             {tabConfig.find(tc => tc.key === activeTab)?.label}
                        </div>
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Tên dạng bài <span className="text-red-500">*</span></label>
                        <AntInput 
                            value={formName}
                            onChange={(e) => setFormName(e.target.value)}
                            placeholder="Ví dụ: Opinion, Discussion, Line Graph..."
                            className="h-12 border-slate-200 hover:border-orange-500/50 focus:border-orange-500 shadow-sm rounded-xl font-medium"
                        />
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Mô tả hướng dẫn (Tuỳ chọn)</label>
                        <AntInput.TextArea 
                            value={formDescription}
                            onChange={(e) => setFormDescription(e.target.value)}
                            placeholder="Mô tả ngắn gọn về dạng bài này..."
                            rows={3}
                            className="border-slate-200 hover:border-orange-500/50 focus:border-orange-500 shadow-sm rounded-xl font-medium"
                        />
                    </div>
                </div>
            </Modal>

            {/* Modal: Edit */}
            <Modal
                title={<span className="text-lg font-bold text-slate-900 tracking-tight">Sửa Dạng bài</span>}
                open={isEditModalOpen}
                onCancel={() => setIsEditModalOpen(false)}
                footer={[
                    <button key="cancel" onClick={() => setIsEditModalOpen(false)} className="px-5 py-2.5 text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors">Huỷ</button>,
                    <button 
                        key="submit" 
                        onClick={handleUpdate} 
                        disabled={submitting}
                        className="px-6 py-2.5 bg-slate-900 text-white text-sm font-bold rounded-xl hover:bg-slate-800 transition-all disabled:bg-slate-300"
                    >
                        {submitting ? 'Đang lưu...' : 'Lưu thay đổi'}
                    </button>
                ]}
                className="premium-modal"
                centered
            >
                <div className="py-6 flex flex-col gap-6">
                    <div className="flex flex-col gap-1.5">
                        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest text-slate-400">Tên dạng bài <span className="text-red-500">*</span></label>
                        <AntInput 
                            value={formName}
                            onChange={(e) => setFormName(e.target.value)}
                            className="h-12 border-slate-200 hover:border-orange-500/50 focus:border-orange-500 shadow-sm rounded-xl font-medium"
                        />
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest text-slate-400">Mô tả hướng dẫn</label>
                        <AntInput.TextArea 
                            value={formDescription}
                            onChange={(e) => setFormDescription(e.target.value)}
                            rows={4}
                            className="border-slate-200 hover:border-orange-500/50 focus:border-orange-500 shadow-sm rounded-xl font-medium"
                        />
                    </div>
                </div>
            </Modal>

            <style>{`
                .category-tabs .ant-tabs-nav::before { border-bottom: none !important; }
                .category-tabs .ant-tabs-tab { color: #94a3b8 !important; padding: 0 !important; margin: 0 24px 0 0 !important; }
                .category-tabs .ant-tabs-tab-active .ant-tabs-tab-btn { color: #0f172a !important; }
                .category-tabs .ant-tabs-ink-bar { background: #000 !important; height: 3px !important; border-radius: 3px 3px 0 0; }
                
                .premium-modal .ant-modal-content { border-radius: 24px; padding: 32px; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.15); }
                .premium-modal .ant-modal-header { border-bottom: none; margin-bottom: 0; padding: 0; }
                .premium-modal .ant-modal-footer { border-top: none; padding: 0; margin-top: 8px; }
            `}</style>
        </div>
    );
};

export default CategoryManagement;
