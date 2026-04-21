import React from 'react';
import { SparkleIcon, PosBadge, HighlightedText, POS_THEME } from './VocabularyUIComponents';

interface WordFamilyExplorerProps {
    familyData: any[];
    enrichedFamilyData: any[] | null;
    usage: { limit: number; used: number; remaining: number } | null;
    loading: boolean;
    onEnrichFamily: () => void;
    onSearchWord: (word: string) => void;
}

export const WordFamilyExplorer: React.FC<WordFamilyExplorerProps> = ({
    familyData,
    enrichedFamilyData,
    usage,
    loading,
    onEnrichFamily,
    onSearchWord
}) => {
    const dataToRender = enrichedFamilyData || familyData;

    if (!dataToRender || dataToRender.length === 0) return null;

    return (
        <div className="bg-white rounded-[24px] p-6 border border-slate-100 shadow-sm relative overflow-hidden h-[calc(100vh-150px)] flex flex-col">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                    Word Family Explorer
                </h3>

                <div className="flex items-center gap-2">
                    {usage && (
                        <div className="flex flex-col items-end leading-none">
                            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">AI Limit</span>
                            <span className="text-[10px] font-bold text-indigo-500 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-100">
                                {usage.used}/{usage.limit}
                            </span>
                        </div>
                    )}
                    <button
                        onClick={onEnrichFamily}
                        disabled={loading}
                        className={`group relative p-2 rounded-xl transition-colors border ${enrichedFamilyData ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-200' : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200'}`}
                        title="AI Làm giàu Họ từ"
                    >
                        {loading ? (
                            <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        ) : (
                            <SparkleIcon className="w-4 h-4" />
                        )}
                        <span className="absolute bottom-full right-0 mb-2 px-2 py-1 bg-slate-800 text-white text-[9px] rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none font-bold shadow-xl">AI Dịch & Lấy ví dụ</span>
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-3 flex-1 overflow-y-auto pr-1 custom-scrollbar">
                {dataToRender.map((item, idx) => {
                    const theme = POS_THEME[item.partOfSpeech?.toLowerCase() || 'noun'] || POS_THEME.noun;
                    return (
                        <div key={idx} className="group p-4 bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all duration-200">
                        <div className="flex items-start justify-between mb-2">
                            <button onClick={() => onSearchWord(item.word)} className="text-[15px] font-black text-slate-800 hover:text-indigo-600 transition-colors uppercase tracking-tight hover:underline decoration-indigo-200 underline-offset-4 text-left">
                                {item.word}
                            </button>
                            <PosBadge pos={item.partOfSpeech} />
                        </div>

                        {(item.definitionVi || item.definition) ? (
                            <>
                                <p className="text-[13px] font-semibold text-slate-600 mb-2 leading-snug">{item.definitionVi || item.definition}</p>
                                {item.example && (
                                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 group-hover:bg-indigo-50/30 transition-colors">
                                        <p className="text-xs text-slate-500 italic leading-relaxed font-medium">
                                            "<HighlightedText text={item.example} highlight={item.word} pos={item.partOfSpeech} />"
                                        </p>
                                        {item.exampleVi && <p className={`text-[11px] ${theme.text} font-semibold mt-1.5 italic`}>{item.exampleVi}</p>}
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="py-2 mt-1">
                                <p className="text-[10px] text-slate-400 font-medium italic flex items-center gap-1.5">
                                    <SparkleIcon className="w-3 h-3 text-slate-300" />
                                    Dùng AI để dịch & lấy ví dụ
                                </p>
                            </div>
                        )}
                    </div>
                );
                })}
            </div>
        </div>
    );
};
