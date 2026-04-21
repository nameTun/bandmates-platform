import React from 'react';
import { SparkleIcon } from './VocabularyUIComponents';
import type { AINotes } from '../services/vocabulary.service';

interface AIInsightsSidebarProps {
    isExpanded: boolean;
    loading: boolean;
    error: string | null;
    aiNotes: AINotes | null;
    onAnalyze: () => void;
    onClose?: () => void;
}

export const AIInsightsSidebar: React.FC<AIInsightsSidebarProps> = ({
    isExpanded,
    loading,
    error,
    aiNotes,
    onAnalyze,
    onClose
}) => {
    if (!isExpanded) return null;

    return (
        <div className="bg-slate-900 rounded-[24px] p-6 text-white shadow-2xl space-y-6 relative overflow-hidden h-[calc(100vh-150px)] flex flex-col border border-slate-800">
            {/* Background Glow Effect */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 blur-[50px] -mr-8 -mt-8 pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-500/10 blur-[50px] -ml-16 -mb-16 pointer-events-none"></div>
            
            {/* Header */}
            <div className="flex items-center justify-between relative z-10 border-b border-white/10 pb-4">
                <div className="flex items-center gap-2 text-indigo-400">
                    <SparkleIcon className="w-4 h-4" />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">IELTS Mastery Sidebar</span>
                </div>
                {onClose && (
                    <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                )}
            </div>

            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar relative z-10">
                {loading ? (
                    <div className="space-y-6 py-20 text-center flex flex-col items-center justify-center">
                        <div className="w-10 h-10 border-[3px] border-slate-700 border-t-indigo-500 rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest animate-pulse">Sourcing AI Insights...</p>
                    </div>
                ) : error ? (
                    <div className="py-20 text-center px-4 flex flex-col items-center justify-center">
                        <div className="w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center mb-4">
                            <svg className="w-6 h-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                        <p className="text-slate-300 text-xs font-medium mb-6 leading-relaxed">"{error}"</p>
                        <button 
                            onClick={onAnalyze}
                            className="px-6 py-2.5 bg-indigo-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-500 transition-all active:scale-95"
                        >
                            Thử lại ngay
                        </button>
                    </div>
                ) : aiNotes && (
                    <div className="space-y-6 pb-4">
                        {/* EXPERT TIP */}
                        <div className="bg-gradient-to-br from-indigo-500/10 to-purple-500/5 rounded-2xl p-5 border border-indigo-500/20 shadow-inner">
                            <div className="flex items-center gap-2 mb-3">
                                <span className="p-1 bg-indigo-500/20 roundedmd text-indigo-300">
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                                </span>
                                <p className="text-[9px] font-black uppercase text-indigo-300 tracking-[0.1em]">Cố vấn Chuyên gia</p>
                            </div>
                            <p className="text-sm text-indigo-50 font-medium italic leading-relaxed text-pretty">
                                "{aiNotes.bandUpgradeTip}"
                            </p>
                        </div>

                        {/* COLLOCATIONS */}
                        <div className="space-y-4 bg-slate-800/40 p-5 rounded-2xl border border-white/5">
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full"></span>
                                IELTS Collocations
                            </p>
                            <div className="space-y-3">
                                {aiNotes.collocations?.slice(0, 4).map((c, i) => (
                                    <div key={i} className="pb-3 border-b border-white/5 last:border-0 last:pb-0 group">
                                        <p className="text-sm font-bold text-indigo-300 group-hover:text-amber-100 transition-colors tracking-tight mb-1">{c.phrase}</p>
                                        <p className="text-[11px] text-slate-400 leading-relaxed font-medium">{c.meaning}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* ADVANCED STRUCTURES */}
                        <div className="space-y-4">
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest pl-1 border-l-2 border-slate-600">Advanced Structures</p>
                            <div className="space-y-2">
                                {aiNotes.writingStructures?.map((s, i) => (
                                    <div key={i} className="p-4 bg-white/5 rounded-xl border border-white/5 hover:bg-white/10 transition-all flex flex-col gap-2">
                                        <code className="text-xs text-amber-300 block font-mono font-bold bg-black/30 p-2.5 rounded-lg border border-amber-500/20">{s.structure}</code>
                                        <p className="text-[11px] text-slate-300 leading-relaxed italic">{s.explanation}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
