import React from 'react';
import { SparkleIcon } from './VocabularyUIComponents';
import type { AINotes } from '../services/vocabulary.service';

interface AIInsightsSidebarProps {
    loading: boolean;
    error: string | null;
    aiNotes: AINotes | null;
    onAnalyze: () => void;
    isPanelExpanded: boolean;
    setIsPanelExpanded: (expanded: boolean) => void;
    panelWidth: number;
    setPanelWidth: (width: number) => void;
    isDragging: boolean;
    setIsDragging: (dragging: boolean) => void;
}

export const AIInsightsSidebar: React.FC<AIInsightsSidebarProps> = ({
    loading,
    error,
    aiNotes,
    onAnalyze,
    isPanelExpanded,
    setIsPanelExpanded,
    panelWidth,
    setPanelWidth,
    isDragging,
    setIsDragging
}) => {
    return (
        <aside
            style={{ width: isPanelExpanded ? `${panelWidth}px` : '50px' }}
            className={`bg-slate-900 border-l border-slate-800 rounded-2xl flex-col hidden lg:flex shadow-[-10px_0_30px_rgba(0,0,0,0.2)] flex-shrink-0 z-20 relative overflow-visible ${!isDragging ? 'transition-all duration-300 ease-in-out' : ''} h-[calc(100vh-150px)] ml-auto`}
        >
            {/* Background Glow Effect */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 blur-[50px] -mr-8 -mt-8 pointer-events-none rounded-full"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-500/10 blur-[50px] -ml-16 -mb-16 pointer-events-none rounded-full"></div>

            {/* Toggle Button */}
            <button
                onClick={() => setIsPanelExpanded(!isPanelExpanded)}
                className="absolute -left-3.5 top-1/2 -translate-y-1/2 w-7 h-7 bg-slate-800 border border-slate-700 rounded-full flex items-center justify-center text-slate-400 hover:text-indigo-400 shadow-lg z-[70] transition-all hover:scale-110"
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

                    if (!isPanelExpanded) {
                        setIsPanelExpanded(true);
                        currentStartWidth = 50;
                        setPanelWidth(50);
                    }

                    const handleMouseMove = (moveEvent: MouseEvent) => {
                        const newWidth = Math.max(300, Math.min(800, currentStartWidth + (startX - moveEvent.pageX)));
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
                <div className={`w-0.5 h-full transition-colors ${isDragging ? 'bg-indigo-500' : 'bg-transparent group-hover/dragger:bg-indigo-500/50'}`} />
            </div>

            {isPanelExpanded ? (
                <div className="flex-1 flex flex-col w-full h-full overflow-hidden p-6 relative z-10">
                    {/* Header */}
                    <div className="flex flex-col mb-4 border-b border-white/10 pb-4 shrink-0">
                        <div className="flex items-center gap-2 text-indigo-400">
                            <SparkleIcon className="w-5 h-5 drop-shadow-[0_0_8px_rgba(99,102,241,0.8)]" />
                            <span className="text-xs font-black uppercase tracking-[0.2em]">IELTS Mastery</span>
                        </div>
                    </div>

                    {/* Scrollable Content */}
                    <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                        {loading ? (
                            <div className="space-y-6 py-20 text-center flex flex-col items-center justify-center">
                                <div className="w-10 h-10 border-[3px] border-slate-700 border-t-indigo-500 rounded-full animate-spin mx-auto mb-4"></div>
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest animate-pulse">Sourcing Insights...</p>
                            </div>
                        ) : error ? (
                            <div className="py-20 text-center px-4 flex flex-col items-center justify-center">
                                <div className="w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center mb-4 border border-red-500/20">
                                    <svg className="w-6 h-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                    </svg>
                                </div>
                                <p className="text-slate-300 text-xs font-medium mb-6 leading-relaxed">"{error}"</p>
                                <button 
                                    onClick={onAnalyze}
                                    className="px-6 py-2.5 bg-indigo-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-500 transition-all active:scale-95 shadow-[0_0_15px_rgba(79,70,229,0.4)]"
                                >
                                    Thử lại ngay
                                </button>
                            </div>
                        ) : aiNotes && (
                            <div className="space-y-6 pb-4">
                                {/* EXPERT TIP */}
                                <div className="bg-gradient-to-br from-indigo-500/10 to-purple-500/5 rounded-2xl p-5 border border-indigo-500/20 shadow-inner">
                                    <div className="flex items-center gap-2 mb-3">
                                        <span className="p-1.5 bg-indigo-500/20 rounded-md text-indigo-300 shadow-[0_0_10px_rgba(99,102,241,0.2)]">
                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                                        </span>
                                        <p className="text-[10px] font-black uppercase text-indigo-300 tracking-[0.1em] drop-shadow-md">Cố vấn Chuyên gia</p>
                                    </div>
                                    <p className="text-sm text-indigo-50 font-medium italic leading-relaxed text-pretty mix-blend-plus-lighter">
                                        "{aiNotes.bandUpgradeTip}"
                                    </p>
                                </div>

                                {/* COLLOCATIONS */}
                                <div className="space-y-4 bg-slate-800/60 p-5 rounded-2xl border border-white/5 shadow-md">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 drop-shadow-sm">
                                        <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full shadow-[0_0_5px_#34d399]"></span>
                                        IELTS Collocations
                                    </p>
                                    <div className="space-y-4 pt-1">
                                        {aiNotes.collocations?.slice(0, 4).map((c, i) => (
                                            <div key={i} className="pb-4 border-b border-white/5 last:border-0 last:pb-0 group">
                                                <p className="text-[15px] font-bold text-indigo-300 group-hover:text-amber-100 transition-colors tracking-tight mb-1.5">{c.phrase}</p>
                                                <p className="text-xs text-slate-400 leading-relaxed font-medium">{c.meaning}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* ADVANCED STRUCTURES */}
                                <div className="space-y-4 pt-2">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2 border-l-2 border-indigo-500/50 drop-shadow-sm">Advanced Structures</p>
                                    <div className="space-y-3">
                                        {aiNotes.writingStructures?.map((s, i) => (
                                            <div key={i} className="p-4 bg-white/5 rounded-xl border border-white/5 hover:bg-white/10 transition-all flex flex-col gap-2.5 shadow-sm">
                                                <code className="text-xs text-amber-300 block font-mono font-bold bg-black/40 p-3 rounded-lg border border-amber-500/20 whitespace-pre-wrap">{s.structure}</code>
                                                <p className="text-xs text-slate-300 leading-relaxed italic opacity-90">{s.explanation}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                <div className="flex flex-col items-center py-6 w-[50px] overflow-hidden h-full gap-6 relative z-10">
                    <div className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] whitespace-nowrap -rotate-180 drop-shadow-[0_0_5px_rgba(99,102,241,0.5)] mt-4" style={{ writingMode: 'vertical-rl' }}>
                        AI Insights
                    </div>
                    
                    <div className="flex flex-col gap-5 mt-auto mb-6">
                        <button onClick={() => setIsPanelExpanded(true)} className="relative group p-2.5 bg-indigo-500/10 rounded-xl hover:bg-indigo-500/20 transition-all border border-indigo-500/20">
                            <SparkleIcon className="w-4 h-4 text-indigo-400 group-hover:text-amber-300 transition-colors" />
                            <div className="absolute right-full mr-3 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-indigo-600 text-white text-[11px] font-bold rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 shadow-xl">
                                Mở bảng AI
                                <div className="absolute top-1/2 -right-1 -translate-y-1/2 w-2 h-2 bg-indigo-600 rotate-45" />
                            </div>
                        </button>
                    </div>
                </div>
            )}
        </aside>
    );
};
