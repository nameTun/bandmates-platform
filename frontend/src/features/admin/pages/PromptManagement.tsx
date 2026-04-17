import React, { useState, useMemo, useEffect } from 'react';
import { message, Spin, Tabs, Badge, Image, Tooltip, Input as AntInput, Table, Switch } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { FilterValue } from 'antd/es/table/interface';
import { categoryService } from '../services/category.service';
import type { Category } from '../services/category.service';
import { topicService } from '../services/topic.service';
import type { Topic } from '../services/topic.service';
import { promptService } from '../services/prompt.service';
import type { Prompt, CreatePromptDto } from '../services/prompt.service';
import { TaskType } from '@/common/enums/task-type.enum';

const taskTypeLabel: Record<string, { text: string; color: string }> = {
  [TaskType.TASK_1_ACADEMIC]: { text: 'Task 1 Aca', color: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' },
  [TaskType.TASK_1_GENERAL]: { text: 'Task 1 Gen', color: 'bg-teal-500/10 text-teal-400 border-teal-500/20' },
  [TaskType.TASK_2]: { text: 'Task 2', color: 'bg-violet-500/10 text-violet-400 border-violet-500/20' },
};

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
  { bg: 'bg-pink-50',    text: 'text-pink-700',     border: 'border-pink-200' },
];

const getTagColor = (name: string) => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return TAG_COLORS[Math.abs(hash) % TAG_COLORS.length];
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

const CheckIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-[14px] h-[14px]">
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
  </svg>
);

const PromptManagement: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<string>(TaskType.TASK_2);
  
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  // Data States
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);

  // Inline Edit State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  // Cross-filter state: track which filters are active on each column
  const [tableFilters, setTableFilters] = useState<Record<string, FilterValue | null>>({});

  // Form States
  const [editingFullPromptId, setEditingFullPromptId] = useState<string | null>(null);
  const [selectedTaskType, setSelectedTaskType] = useState<TaskType>(TaskType.TASK_2);
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [selectedTopicId, setSelectedTopicId] = useState('');
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isFreeSample, setIsFreeSample] = useState(false);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [pData, cData, tData] = await Promise.all([
        promptService.getPrompts(),
        categoryService.getCategories(),
        topicService.getTopics()
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

  const handleUpdateModelAnswer = async (id: string) => {
    try {
      setLoading(true);
      await promptService.updatePrompt(id, { modelAnswer: editValue });
      message.success('Đã cập nhật bài mẫu');
      setEditingId(null);
      fetchInitialData();
    } catch (error) {
      message.error('Lỗi cập nhật bài mẫu!');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFreeSample = async (id: string, isFreeSample: boolean) => {
    try {
      await promptService.updatePrompt(id, { isFreeSample });
      message.success('Đã cập nhật trạng thái đề mẫu');
      fetchInitialData();
    } catch {
      message.error('Lỗi khi cập nhật trạng thái đề mẫu!');
    }
  };

  const handleEditFullPrompt = (prompt: Prompt) => {
    setEditingFullPromptId(prompt.id);
    setSelectedTaskType(prompt.taskType);
    setSelectedCategoryId(prompt.category?.id || '');
    setSelectedTopicId(prompt.topic?.id || '');
    setContent(prompt.content || '');
    setImageUrl(prompt.imageUrl || '');
    setIsFreeSample(prompt.isFreeSample || false);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmitForm = async () => {
    if (!content.trim() || !selectedCategoryId) {
      return message.warning('Vui lòng điền đầy đủ các thông tin bắt buộc!');
    }

    if (selectedTaskType !== TaskType.TASK_2 && !imageUrl.trim()) {
      return message.warning('Vui lòng cung cấp link hình ảnh cho Task 1!');
    }

    try {
      setSubmitting(true);
      const payload: Partial<CreatePromptDto> = {
        taskType: selectedTaskType,
        categoryId: selectedCategoryId,
        topicId: selectedTaskType === TaskType.TASK_2 ? selectedTopicId : undefined,
        content: content,
        imageUrl: selectedTaskType !== TaskType.TASK_2 ? imageUrl : undefined,
        isFreeSample: isFreeSample
      };

      if (editingFullPromptId) {
        await promptService.updatePrompt(editingFullPromptId, payload);
        message.success('Đã cập nhật đề bài thành công!');
      } else {
        await promptService.createPrompt(payload as CreatePromptDto);
        message.success('Đã tạo đề bài mới thành công!');
      }
      
      // Reset form & Refresh
      setShowForm(false);
      setEditingFullPromptId(null);
      setContent('');
      setImageUrl('');
      setSelectedCategoryId('');
      setSelectedTopicId('');
      setIsFreeSample(false);
      fetchInitialData();
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || 'Có lỗi xảy ra!';
      message.error(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleImport = async (taskType: TaskType, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setLoading(true);
      const res = await promptService.importPrompts(taskType, file);
      message.success(`Import thành công! Tạo mới: ${res.created}, Cập nhật: ${res.updated}.`);
      if (res.errors.length > 0) {
        console.error('Import Errors:', res.errors);
        message.warning(`Có ${res.errors.length} dòng dữ liệu bị lỗi, kiểm tra Console.`);
      }
      fetchInitialData();
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Lỗi khi import file!');
    } finally {
      setLoading(false);
      e.target.value = ''; // Reset input
    }
  };

  const handleExport = async (taskType?: TaskType) => {
    const hide = message.loading('Đang khởi tạo tệp Excel...', 0);
    try {
      await promptService.downloadExport(taskType);
      message.success('Tải dữ liệu thành công!');
    } catch (error) {
      console.error('Export error:', error);
      message.error('Lỗi khi tải dữ liệu Excel!');
    } finally {
      hide();
    }
  };

  const handleDeletePrompt = async (id: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn xoá đề bài này?')) return;
    try {
      setLoading(true);
      await promptService.deletePrompt(id);
      message.success('Đã xoá đề bài thành công');
      fetchInitialData();
    } catch (error) {
      message.error('Không thể xoá đề bài');
    } finally {
      setLoading(false);
    }
  };

  // Computed data for current tab
  const filteredPrompts = useMemo(() => {
    return prompts.filter(p => {
      const matchSearch = p.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.topic?.name && p.topic.name.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchTask = p.taskType === activeTab;
      return matchSearch && matchTask;
    });
  }, [prompts, searchQuery, activeTab]);

  /**
   * Cross-filter counting: khi tính count cho filter option của cột X,
   * áp dụng tất cả filter đang active của các cột KHÁC (trừ cột X).
   */
  const getCrossFilteredData = (excludeKey: string) => {
    return filteredPrompts.filter(p => {
      // Topic filter
      if (excludeKey !== 'topic' && tableFilters.topic?.length) {
        if (!tableFilters.topic.includes(p.topic?.name as any)) return false;
      }
      // Category filter
      if (excludeKey !== 'category' && tableFilters.category?.length) {
        if (!tableFilters.category.includes(p.category?.name as any)) return false;
      }
      // isFreeSample filter
      if (excludeKey !== 'isFreeSample' && tableFilters.isFreeSample?.length) {
        if (!tableFilters.isFreeSample.includes(p.isFreeSample as any)) return false;
      }
      return true;
    });
  };

  // Generate Table Columns dynamically
  const getColumns = (): ColumnsType<Prompt> => {
    const baseColumns: ColumnsType<Prompt> = [
      {
        title: 'STT',
        key: 'index',
        render: (_, __, index) => <span className="text-slate-600 font-mono text-xs">#{index + 1}</span>,
        width: 60,
      },
    ];

    if (activeTab === TaskType.TASK_2) {
      baseColumns.push({
        title: (() => {
          const crossData = getCrossFilteredData('topic');
          const count = new Set(crossData.map(p => p.topic?.name).filter(Boolean)).size;
          return `Chủ đề (${count})`;
        })(),
        dataIndex: ['topic', 'name'],
        key: 'topic',
        render: (name) => {
          if (!name) return <span className="text-slate-400">—</span>;
          const color = getTagColor(name);
          return <span className={`text-[11px] font-semibold ${color.bg} ${color.text} ${color.border} px-2.5 py-1 rounded-full inline-block max-w-[150px] truncate border`}>{name}</span>;
        },
        filters: (() => {
          const crossData = getCrossFilteredData('topic');
          const uniqueNames = Array.from(new Set(crossData.map(p => p.topic?.name).filter(Boolean)));
          return uniqueNames.map(name => ({
            text: `${name} (${crossData.filter(p => p.topic?.name === name).length})`,
            value: name as string
          }));
        })(),
        filteredValue: tableFilters.topic || null,
        onFilter: (value, record) => record.topic?.name === value,
        width: 160,
      });
    }

    if (activeTab === TaskType.TASK_1_ACADEMIC) {
      baseColumns.push({
        title: 'Image',
        dataIndex: 'imageUrl',
        key: 'imageUrl',
        render: (url) => url ? (
          <Image width={36} height={36} src={url} className="rounded-md object-cover border border-slate-200 shadow-sm cursor-pointer" fallback="https://via.placeholder.com/36?text=NA" />
        ) : (
          <div className="w-9 h-9 rounded-md bg-slate-50 border border-slate-200 flex items-center justify-center text-[9px] text-slate-400 font-bold">N/A</div>
        ),
        width: 80,
      });
    }

    baseColumns.push({
      title: (() => {
        const crossData = getCrossFilteredData('category');
        const count = new Set(crossData.map(p => p.category?.name).filter(Boolean)).size;
        return `Dạng bài (${count})`;
      })(),
      dataIndex: ['category', 'name'],
      key: 'category',
      render: (name) => {
        const label = name || 'Unknown';
        const color = getTagColor(label);
        return <span className={`text-xs font-semibold tracking-wide ${color.bg} ${color.text} ${color.border} px-2.5 py-1 rounded-full border`}>{label}</span>;
      },
      filters: (() => {
        const crossData = getCrossFilteredData('category');
        const uniqueNames = Array.from(new Set(crossData.map(p => p.category?.name).filter(Boolean)));
        return uniqueNames.map(name => ({
          text: `${name} (${crossData.filter(p => p.category?.name === name).length})`,
          value: name as string
        }));
      })(),
      filteredValue: tableFilters.category || null,
      onFilter: (value, record) => record.category?.name === value,
      width: 160,
    });

    baseColumns.push({
      title: 'Nội dung & Bài mẫu',
      key: 'content',
      render: (_, prompt) => (
        <div className="flex flex-col gap-2.5 min-w-[300px]">
          <div className="text-sm font-medium text-slate-800 leading-relaxed">
            {prompt.content}
          </div>
          {editingId === prompt.id ? (
            <div className="mt-2 flex flex-col gap-2.5 bg-transparent p-3 rounded-xl border border-orange-500/50 shadow-inner">
               <span className="text-[10px] font-bold text-orange-400 uppercase tracking-wider flex items-center gap-1.5"><EditIcon/> Chỉnh sửa bài mẫu</span>
               <AntInput.TextArea 
                 value={editValue}
                 onChange={(e) => setEditValue(e.target.value)}
                 autoSize={{ minRows: 3, maxRows: 10 }}
                 className="bg-slate-50 border-slate-200 text-sm text-slate-900 font-medium rounded-lg"
                 placeholder="Nhập nội dung bài mẫu vào đây..."
               />
               <div className="flex items-center justify-end gap-2 mt-1">
                 <button onClick={() => setEditingId(null)} className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-[#27272a] rounded-lg transition-all">Huỷ</button>
                 <button onClick={() => handleUpdateModelAnswer(prompt.id)} className="px-4 py-1.5 text-xs font-bold bg-gradient-to-r from-orange-500 to-orange-600 shadow border border-orange-400/50 text-slate-900 rounded-lg hover:from-orange-400 hover:to-orange-500 transition-all flex items-center gap-1.5">
                   <CheckIcon/> Cập nhật
                 </button>
               </div>
            </div>
          ) : (
            <div 
              className={`mt-1 p-3 rounded-xl border transition-all ${prompt.modelAnswer ? 'bg-slate-50 border-slate-200 hover:border-slate-300' : 'bg-white border-dashed border-slate-200 hover:border-orange-500/50 hover:bg-orange-500/5 cursor-pointer group/add'}`}
              onClick={() => {
                if (!prompt.modelAnswer) {
                   setEditingId(prompt.id);
                   setEditValue('');
                }
              }}
            >
              {prompt.modelAnswer ? (
                <div className="relative group/answer">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="inline-flex text-[9px] font-bold text-orange-500 uppercase tracking-widest bg-orange-500/10 border border-orange-500/20 px-1.5 py-0.5 rounded">Bài mẫu tham khảo</span>
                  </div>
                  <div className="text-xs text-slate-600 line-clamp-3 leading-relaxed group-hover/answer:text-slate-800 transition-colors">{prompt.modelAnswer}</div>
                   <button 
                     onClick={(e) => { e.stopPropagation(); setEditingId(prompt.id); setEditValue(prompt.modelAnswer || ''); }}
                     className="absolute -top-1 -right-1 p-1.5 opacity-0 group-hover/answer:opacity-100 bg-[#27272a] text-slate-900 rounded-md hover:bg-orange-500 shadow-lg transition-all"
                   >
                     <EditIcon />
                   </button>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-xs text-slate-400 group-hover/add:text-orange-400 transition-colors font-medium">
                  <div className="p-1 rounded-md bg-slate-50 group-hover/add:bg-orange-500/20"><PlusIcon /></div> 
                  <span>Thêm bài mẫu cho đề này</span>
                </div>
              )}
            </div>
          )}
        </div>
      )
    });

    baseColumns.push({
      title: (() => {
        const crossData = getCrossFilteredData('isFreeSample');
        return `Đề mẫu (${crossData.length})`;
      })(),
      dataIndex: 'isFreeSample',
      key: 'isFreeSample',
      render: (isFreeSample: boolean, record: Prompt) => (
        <Switch 
           checked={isFreeSample} 
           onChange={(checked) => handleToggleFreeSample(record.id, checked)} 
           size="small" 
           className={isFreeSample ? 'bg-orange-500' : 'bg-[#27272a]'}
        />
      ),
      filters: (() => {
        const crossData = getCrossFilteredData('isFreeSample');
        const yesCount = crossData.filter(p => p.isFreeSample).length;
        const noCount = crossData.filter(p => !p.isFreeSample).length;
        return [
          { text: `Đề mẫu (${yesCount})`, value: true },
          { text: `Không (${noCount})`, value: false },
        ];
      })(),
      filteredValue: tableFilters.isFreeSample || null,
      onFilter: (value, record) => record.isFreeSample === value,
      width: 100,
      align: 'center'
    });

    baseColumns.push({
      title: 'Settings',
      key: 'actions',
      render: (_, record) => (
        <div className="flex justify-center gap-1.5">
          <Tooltip title="Sửa đề thi">
            <button 
              onClick={() => handleEditFullPrompt(record)}
              className="p-2 bg-slate-50 border border-slate-200 text-slate-500 rounded-lg hover:text-slate-900 hover:border-slate-300 hover:bg-[#27272a] transition-all shadow-sm"
            >
              <EditIcon />
            </button>
          </Tooltip>
          <Tooltip title="Xoá đề bài">
            <button 
              onClick={() => handleDeletePrompt(record.id)}
              className="p-2 bg-slate-50 border border-slate-200 text-slate-500 rounded-lg hover:text-red-500 hover:border-red-500/30 hover:bg-red-500/10 transition-all shadow-sm"
            >
              <DeleteIcon />
            </button>
          </Tooltip>
        </div>
      ),
      width: 110,
      align: 'center' as const,
    });

    return baseColumns;
  };

  return (
    <div className="min-h-screen bg-transparent text-slate-900 font-sans selection:bg-orange-500/20 selection:text-orange-900">
      <div className="max-w-[1200px] mx-auto px-8 py-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-slate-900">Quản lý Đề thi</h1>
            <p className="text-slate-600 mt-2 text-sm max-w-lg">
              Hệ thống lưu trữ đề bài thông minh. Dữ liệu tại đây sẽ được AI sử dụng trực tiếp để sinh bài tập.
            </p>
          </div>
          <div className="flex items-center gap-3">
             <button
              onClick={() => handleExport()}
              className="flex items-center gap-2 px-4 py-2.5 bg-slate-50 border border-slate-200 text-slate-900 text-sm font-medium rounded-lg hover:border-slate-300 transition-all active:scale-95"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
              </svg>
              Export All
            </button>
            <button
              onClick={() => {
                setShowForm(!showForm);
                if (showForm) setEditingFullPromptId(null);
              }}
              className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800 transition-colors shadow-md shadow-slate-200 active:scale-95"
            >
              <PlusIcon />
              {showForm ? 'Đóng bảng' : (editingFullPromptId ? 'Đóng sửa Form' : 'Tạo mới')}
            </button>
          </div>
        </div>

        {/* --- DATA CENTER (Import/Export Specialized) --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
          {[
            { type: TaskType.TASK_2, label: 'Task 2 (Essay)', color: 'violet' },
            { type: TaskType.TASK_1_ACADEMIC, label: 'Task 1 Academic', color: 'cyan' },
            { type: TaskType.TASK_1_GENERAL, label: 'Task 1 General', color: 'teal' }
          ].map(task => (
            <div key={task.type} className={`bg-white border border-slate-200 rounded-xl p-5 hover:border-${task.color}-500/30 transition-all group`}>
              <div className="flex items-center justify-between mb-4">
                <span className={`text-xs font-bold uppercase tracking-widest text-${task.color}-400`}>{task.label}</span>
                <div className={`w-2 h-2 rounded-full bg-${task.color}-500/40 shadow-sm`}></div>
              </div>
              <div className="flex gap-2">
                <label className="flex-1">
                  <input 
                    type="file" 
                    className="hidden" 
                    accept=".xlsx, .xls"
                    onChange={(e) => handleImport(task.type, e)}
                  />
                  <div className="flex items-center justify-center gap-2 px-3 py-2 bg-slate-50 border border-slate-200 text-slate-600 text-[11px] font-bold uppercase rounded-lg hover:border-slate-300 hover:text-slate-900 transition-all cursor-pointer">
                    Import
                  </div>
                </label>
                <button 
                  onClick={() => handleExport(task.type)}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-transparent border border-slate-200 text-slate-500 text-[11px] font-bold uppercase rounded-lg hover:border-slate-300 hover:text-slate-900 transition-all"
                >
                  Export
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Add Form (Collapsible) */}
        {showForm && (
          <div className="bg-white border border-slate-200 rounded-xl p-8 mb-10 shadow-xl shadow-slate-200/50 animate-in slide-in-from-top-4 duration-300">
            <h3 className="text-base font-semibold text-slate-900 mb-6 tracking-tight font-bold">
              {editingFullPromptId ? 'Sửa thông tin đề bài' : 'Khai báo cấu trúc đề bài'}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-5">
              {/* Task Type */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-medium text-slate-500 uppercase tracking-wider">Loại bài thi</label>
                <select 
                  value={selectedTaskType}
                  onChange={(e) => {
                    setSelectedTaskType(e.target.value as TaskType);
                    setSelectedCategoryId('');
                    setSelectedTopicId('');
                  }}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-lg px-3.5 py-2.5 outline-none hover:border-slate-300 focus:border-[#d4d4d8] focus:ring-1 focus:ring-[#d4d4d8] transition-all"
                >
                  <option value={TaskType.TASK_2}>Task 2 (Essay)</option>
                  <option value={TaskType.TASK_1_ACADEMIC}>Task 1 Academic</option>
                  <option value={TaskType.TASK_1_GENERAL}>Task 1 General</option>
                </select>
              </div>

              {/* Category */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-medium text-slate-500 uppercase tracking-wider">Dạng bài</label>
                <select 
                  value={selectedCategoryId}
                  onChange={(e) => setSelectedCategoryId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-lg px-3.5 py-2.5 outline-none hover:border-slate-300 focus:border-[#d4d4d8] focus:ring-1 focus:ring-[#d4d4d8] transition-all"
                >
                  <option value="" disabled>-- Chọn dạng bài --</option>
                  {categories.filter(c => c.taskType === selectedTaskType).map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              {/* Topic (Only Task 2) */}
              {selectedTaskType === TaskType.TASK_2 && (
                <div className="flex flex-col gap-1.5 animate-in fade-in duration-300">
                  <label className="text-[13px] font-medium text-slate-500 uppercase tracking-wider">Chủ đề (Topic)</label>
                  <select 
                    value={selectedTopicId}
                    onChange={(e) => setSelectedTopicId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-lg px-3.5 py-2.5 outline-none hover:border-slate-300 focus:border-[#d4d4d8] focus:ring-1 focus:ring-[#d4d4d8] transition-all"
                  >
                    <option value="" disabled>-- Không có --</option>
                    {topics.filter(t => t.taskType === TaskType.TASK_2).map(top => (
                      <option key={top.id} value={top.id}>{top.name}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Prompt Content */}
            <div className="flex flex-col gap-1.5 mb-5">
              <label className="text-[13px] font-medium text-slate-500 uppercase tracking-wider">Nội dung đề bài</label>
              <textarea
                rows={4}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Ví dụ: Some people believe that..."
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-lg px-3.5 py-3 outline-none hover:border-slate-300 focus:border-[#d4d4d8] focus:ring-1 focus:ring-[#d4d4d8] transition-all resize-none placeholder:text-slate-400 font-mono"
              />
            </div>

            {/* Link Image ONLY for Task 1 */}
            {selectedTaskType !== TaskType.TASK_2 && (
              <div className="flex flex-col gap-1.5 mb-6 animate-in fade-in duration-300">
                <label className="text-[13px] font-medium text-slate-500 uppercase tracking-wider flex items-center gap-2">
                  <span>Link hình ảnh biểu đồ</span>
                  <span className="bg-[#27272a] text-slate-600 px-1.5 py-0.5 rounded-[4px] text-[9px] uppercase">Bắt buộc</span>
                </label>
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://imgur.com/image.png"
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-lg px-3.5 py-2.5 outline-none hover:border-slate-300 focus:border-[#d4d4d8] focus:ring-1 focus:ring-[#d4d4d8] transition-all font-mono placeholder:text-slate-400"
                />
              </div>
            )}

            {/* Free Sample Toggle */}
            <div className="flex items-center gap-3 mb-8 bg-slate-50/50 border border-slate-200 p-4 rounded-xl">
              <Switch 
                checked={isFreeSample} 
                onChange={setIsFreeSample} 
                className={isFreeSample ? 'bg-orange-500' : 'bg-[#27272a]'}
              />
              <div className="flex flex-col">
                <span className="text-base font-medium text-slate-900">Đặt làm đề thi mẫu (Free Sample)</span>
                <span className="text-[12px] text-slate-500">Bài mẫu cho Guest thực hành 1 lần.</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 pt-2 border-t border-slate-200 mt-6">
              <button 
                onClick={handleSubmitForm}
                disabled={submitting}
                className="px-5 py-2.5 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800 transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                {submitting ? <Spin size="small" /> : (editingFullPromptId ? 'Cập nhật đề bài' : 'Hoàn tất tạo đề')}
              </button>
              <button
                onClick={() => {
                   setShowForm(false);
                   setEditingFullPromptId(null);
                }}
                disabled={submitting}
                className="px-5 py-2.5 bg-transparent text-slate-600 text-sm font-medium rounded-lg hover:bg-slate-50 hover:text-slate-900 transition-colors"
              >
                Hủy thao tác
              </button>
            </div>
          </div>
        )}

        {/* --- TABS SYSTEM --- */}
        <Tabs
          activeKey={activeTab}
          onChange={(key) => {
            setActiveTab(key);
            setSearchQuery('');
            setTableFilters({});
            setEditingId(null);
          }}
          className="admin-tabs"
          items={[
            {
              key: TaskType.TASK_2,
              label: (
                <div className="flex items-center gap-2">
                  <span>Task 2 (Essay)</span>
                  <Badge count={prompts.filter(p => p.taskType === TaskType.TASK_2).length} className="site-badge-count-109" color="#8b5cf6" />
                </div>
              ),
              children: null
            },
            {
              key: TaskType.TASK_1_ACADEMIC,
              label: (
                <div className="flex items-center gap-2">
                  <span>Task 1 Academic</span>
                  <Badge count={prompts.filter(p => p.taskType === TaskType.TASK_1_ACADEMIC).length} color="#06b6d4" />
                </div>
              ),
              children: null
            },
            {
              key: TaskType.TASK_1_GENERAL,
              label: (
                <div className="flex items-center gap-2">
                  <span>Task 1 General</span>
                  <Badge count={prompts.filter(p => p.taskType === TaskType.TASK_1_GENERAL).length} color="#14b8a6" />
                </div>
              ),
              children: null
            }
          ]}
        />

        {/* Filters and Search */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6 mt-4">
          <div className="relative flex-1 group">
            <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-slate-900 transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Tìm kiếm bằng nội dung đề bài..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-transparent border border-slate-200 text-slate-900 text-sm rounded-lg pl-10 pr-4 py-2.5 outline-none hover:border-slate-300 focus:border-[#d4d4d8] transition-all placeholder:text-slate-400"
            />
          </div>
        </div>

        {/* Table System */}
        <div className="rounded-xl overflow-hidden bg-white border border-slate-200 admin-table-wrapper">
          <Table 
            className="admin-table"
            columns={getColumns()}
            dataSource={filteredPrompts}
            rowKey="id"
            loading={loading}
            pagination={{ pageSize: 15, position: ['bottomCenter'] }}
            onChange={(_pagination, filters) => {
              setTableFilters(filters);
            }}
          />
        </div>
      </div>
      
      {/* ── GLOBAL STYLES OVERRIDES FOR ANTD TABS AND TABLE ── */}
      <style>{`
        .admin-tabs .ant-tabs-nav {
          margin-bottom: 0 !important;
        }
        .admin-tabs .ant-tabs-nav::before {
          border-bottom: 1px solid #e2e8f0 !important;
        }
        .admin-tabs .ant-tabs-tab {
          padding: 12px 0 !important;
          margin-right: 32px !important;
        }
        .admin-tabs .ant-tabs-tab-btn {
          color: #94a3b8 !important;
          font-weight: 500 !important;
          font-size: 14px !important;
        }
        .admin-tabs .ant-tabs-tab-active .ant-tabs-tab-btn {
          color: #0f172a !important;
          font-weight: 600 !important;
        }
        .admin-tabs .ant-tabs-ink-bar {
          background: #f97316 !important;
          height: 2px !important;
        }

        /* ── TABLE OVERRIDES FOR LIGHT MODE ── */
        .admin-table .ant-table {
          background: transparent !important;
          color: #0f172a !important;
        }
        .admin-table .ant-table-thead > tr > th {
          background: #f8fafc !important;
          color: #64748b !important;
          border-bottom: 1px solid #e2e8f0 !important;
          text-transform: uppercase;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.05em;
          padding: 12px 24px;
        }
        .admin-table .ant-table-thead th.ant-table-column-has-sorters:hover {
          background: #f1f5f9 !important;
        }
        .admin-table .ant-table-tbody > tr > td {
          border-bottom: 1px solid #e2e8f0 !important;
          padding: 16px 24px;
          background: #ffffff !important;
          vertical-align: top;
        }
        .admin-table .ant-table-tbody > tr.ant-table-row:hover > td {
          background: #f8fafc !important;
        }
        .admin-table .ant-table-filter-trigger {
          color: #94a3b8 !important;
        }
        .admin-table .ant-table-filter-trigger.active {
          color: #f97316 !important;
        }
        .admin-table-wrapper .ant-pagination {
          margin: 16px 24px !important;
        }
        .admin-table-wrapper .ant-pagination-item a {
          color: #64748b !important;
        }
        .admin-table-wrapper .ant-pagination-item-active {
          background-color: #f97316 !important;
          border-color: #f97316 !important;
        }
        .admin-table-wrapper .ant-pagination-item-active a {
          color: white !important;
        }
        .admin-table-wrapper .ant-pagination-prev button,
        .admin-table-wrapper .ant-pagination-next button {
          color: #64748b !important;
        }
      `}</style>
    </div>
  );
};

export default PromptManagement;
