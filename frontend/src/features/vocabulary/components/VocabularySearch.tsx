import React from 'react';
import { SearchIcon } from './VocabularyUIComponents';

interface VocabularySearchProps {
    query: string;
    setQuery: (val: string) => void;
    onSearch: (word?: string) => void;
    loading: boolean;
    recentWords: string[];
    resultWord?: string;
    isExpanded: boolean;
    showBackButton?: boolean;
    onBack?: () => void;
}

export const VocabularySearch: React.FC<VocabularySearchProps> = ({
    query,
    setQuery,
    onSearch,
    loading,
    recentWords,
    resultWord,
    isExpanded,
    showBackButton,
    onBack
}) => {
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') onSearch();
    };

    return (
        <div className="w-full">
            {/* ── SEARCH HEAD AREA ── */}
            <div className="mb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h1 className="text-2xl font-black tracking-tight flex items-center gap-3 text-slate-800">
                    {showBackButton && (
                        <button 
                            onClick={onBack}
                            className="mr-2 p-2 rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-indigo-600 hover:border-indigo-100 hover:bg-slate-50 transition-all group/back shadow-sm"
                            title="Quay lại Lịch sử"
                        >
                            <svg className="w-5 h-5 group-hover/back:-translate-x-1 transition-transform" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                        </button>
                    )}
                    Vocabulary Hub
                    {isExpanded && <span className="text-[10px] bg-indigo-600 text-white px-2 py-0.5 rounded-full uppercase tracking-widest animate-pulse">Deep Focus</span>}
                </h1>
                
                <div className="flex-1 w-full md:max-w-xl flex gap-3">
                    <div className="flex-1 relative group">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors">
                            <SearchIcon />
                        </span>
                        <input
                            type="text"
                            value={query}
                            onChange={e => setQuery(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Tra cứu từ vựng IELTS tột đỉnh..."
                            className="w-full pl-12 pr-4 py-3.5 rounded-2xl border-2 border-slate-200 bg-white/70 backdrop-blur-md shadow-sm focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 outline-none transition-all text-sm font-medium"
                        />
                    </div>
                    <button
                        onClick={() => onSearch()}
                        disabled={loading || !query.trim()}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3.5 rounded-2xl font-black text-sm transition-all active:scale-95 disabled:bg-slate-300 shadow-xl shadow-indigo-200"
                    >
                        {loading ? '...' : 'Tìm'}
                    </button>
                </div>
            </div>

            {/* ── RECENT SEARCHES CHIPS ── */}
            {recentWords.length > 0 && (
                <div className="mb-3 flex items-center gap-3 overflow-x-auto pb-1 custom-scrollbar">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Vừa tra:</span>
                    {recentWords.slice(0, 8).map(w => (
                        <button
                            key={w}
                            onClick={() => onSearch(w)}
                            className={`px-4 py-1.5 rounded-xl text-[11px] font-bold transition-all border whitespace-nowrap ${
                                resultWord?.toLowerCase() === w.toLowerCase()
                                    ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-200'
                                    : 'bg-white border-slate-200 text-slate-500 hover:border-indigo-300 hover:text-indigo-600 hover:shadow-sm'
                            }`}
                        >
                            {w}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};
