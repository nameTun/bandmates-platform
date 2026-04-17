import React, { useState, useEffect, useMemo } from 'react';
import { message, Spin, Tabs, Tooltip, Input, Button } from 'antd';
import { scoringCriteriaService, type ScoringCriteria } from '../services/criteria.service';
import { TaskType } from '@/common/enums/task-type.enum';

const { TextArea } = Input;

/* ── UI ICONS ── */
const SaveIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
    </svg>
);

const BoltIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5 text-indigo-600">
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
);

const InfoIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5 text-slate-400">
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

const CriteriaManagement: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [criteria, setCriteria] = useState<ScoringCriteria[]>([]);
    const [activeTab, setActiveTab] = useState<string>(TaskType.TASK_2);
    const [savingId, setSavingId] = useState<string | null>(null);

    useEffect(() => {
        fetchCriteria();
    }, []);

    const fetchCriteria = async () => {
        try {
            setLoading(true);
            const data = await scoringCriteriaService.getAll();
            setCriteria(data);
        } catch (error) {
            message.error('Không thể tải tiêu chí chấm điểm');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async (id: string, newDesc: string) => {
        try {
            setSavingId(id);
            await scoringCriteriaService.update(id, newDesc);
            message.success('Đã cập nhật chỉ dẫn chấm điểm');
            // Cập nhật state local
            setCriteria(prev => prev.map(c => c.id === id ? { ...c, description: newDesc } : c));
        } catch (error) {
            message.error('Lỗi khi cập nhật tiêu chí');
        } finally {
            setSavingId(null);
        }
    };

    const CRITERIA_ORDER: Record<string, number> = { TA: 0, CC: 1, LR: 2, GRA: 3 };

    const filteredCriteria = useMemo(() => {
        return criteria
            .filter(c => c.taskType === activeTab)
            .sort((a, b) => (CRITERIA_ORDER[a.criteriaKey] ?? 99) - (CRITERIA_ORDER[b.criteriaKey] ?? 99));
    }, [criteria, activeTab]);

    const tabConfig = [
        { key: TaskType.TASK_2, label: 'Task 2 (Essay)' },
        { key: TaskType.TASK_1_ACADEMIC, label: 'Task 1 Academic' },
        { key: TaskType.TASK_1_GENERAL, label: 'Task 1 General' },
    ];

    return (
        <div className="min-h-screen bg-slate-50/50 pb-20">
            {/* Header Hub */}
            <div className="bg-white border-b border-slate-200 pt-10 pb-6 px-8 mb-8 shadow-sm">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div className="max-w-3xl">
                            <div className="flex items-center gap-2 mb-3">
                                <div className="p-2 bg-indigo-50 rounded-xl">
                                    <BoltIcon />
                                </div>
                                <span className="text-indigo-600 font-black text-[10px] uppercase tracking-[0.2em]">Prompt Engineering</span>
                            </div>
                            <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Tiêu chí chấm điểm AI</h1>
                            <p className="text-slate-500 text-sm leading-relaxed max-w-2xl">
                                Quản lý các chỉ dẫn (Instructions) cho AI khi chấm điểm. Mỗi thay đổi ở đây sẽ ảnh hưởng trực tiếp đến cách AI nhận xét và cho điểm các bài làm của học viên.
                            </p>
                        </div>
                    </div>

                    <div className="mt-8">
                        <Tabs
                            activeKey={activeTab}
                            onChange={setActiveTab}
                            className="admin-tabs"
                            items={tabConfig.map(tab => ({
                                key: tab.key,
                                label: (
                                    <span className="px-2 py-1 font-bold text-[13px] uppercase tracking-wide">
                                        {tab.label}
                                    </span>
                                )
                            }))}
                        />
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-8">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-32 gap-4">
                        <Spin size="large" />
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Đang tải cấu hình AI...</span>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in slide-in-from-bottom-4 duration-500">
                        {filteredCriteria.map(item => (
                            <div 
                                key={item.id} 
                                className="bg-white border border-slate-200 rounded-[24px] p-6 shadow-sm hover:shadow-md transition-all flex flex-col group"
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-2 text-indigo-600">
                                        <div className="w-1.5 h-5 bg-indigo-500 rounded-full opacity-50"></div>
                                        <h4 className="text-sm font-black uppercase tracking-widest">
                                            {item.criteriaKey === 'TA' && activeTab === TaskType.TASK_2 ? 'Task Response' : 
                                             item.criteriaKey === 'TA' ? 'Task Achievement' : 
                                             item.criteriaKey === 'CC' ? 'Coherence & Cohesion' :
                                             item.criteriaKey === 'LR' ? 'Lexical Resource' :
                                             'Grammatical Range & Accuracy'}
                                        </h4>
                                    </div>
                                    <span className="px-2 py-1 rounded-lg bg-slate-50 text-[10px] font-black text-slate-400 border border-slate-100 uppercase tracking-tighter">
                                        {item.criteriaKey}
                                    </span>
                                </div>

                                <div className="relative flex-1">
                                    <TextArea
                                        id={`ta-${item.id}`}
                                        defaultValue={item.description}
                                        rows={8}
                                        className="w-full bg-slate-50/50 border-slate-100 text-slate-700 text-sm leading-relaxed rounded-xl p-4 focus:bg-white focus:border-indigo-200 focus:shadow-sm transition-all resize-none"
                                        placeholder={`Nhập hướng dẫn chấm điểm cho ${item.criteriaKey}...`}

                                        onBlur={(e) => {
                                            if (e.target.value !== item.description) {
                                                handleUpdate(item.id, e.target.value);
                                            }
                                        }}
                                    />
                                    <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Tooltip title="Tự động lưu khi bạn rời khỏi ô nhập">
                                            <div className="flex items-center gap-1 text-[10px] font-medium text-slate-300">
                                                <InfoIcon />
                                                <span>Auto-save</span>
                                            </div>
                                        </Tooltip>
                                    </div>
                                </div>

                                <div className="mt-4 flex items-center justify-between pt-4 border-t border-slate-50">
                                    <div className="text-[10px] text-slate-400">
                                        Cập nhật lần cuối: {new Date(item.updatedAt).toLocaleDateString()}
                                    </div>
                                    <Button
                                        type="primary"
                                        icon={<SaveIcon />}
                                        loading={savingId === item.id}
                                        onClick={() => {
                                            const textarea = document.getElementById(`ta-${item.id}`) as HTMLTextAreaElement;
                                            if (textarea) handleUpdate(item.id, textarea.value);
                                        }}
                                        className="h-10 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-700 border-none shadow-sm shadow-indigo-100 font-bold text-[12px] uppercase tracking-wide flex items-center gap-2"
                                        id={`btn-${item.id}`}
                                    >
                                        Lưu cấu hình
                                    </Button>
                                    {/* Link textarea via id for the button above if it wasn't for the onBlur auto-save */}
                                    <style>{`
                                        #ta-${item.id} { }
                                    `}</style>
                                </div>
                                <div className="hidden">
                                     <script>{`
                                         // This is just a placeholder to use the id in the button click
                                     `}</script>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default CriteriaManagement;
