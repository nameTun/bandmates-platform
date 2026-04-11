import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { vocabularyApi } from '../api/vocabularyApi';
import type { SearchResult, AINotes } from '../api/vocabularyApi';
import { useAuthStore } from '@/features/auth/store/useAuthStore';

// ─── Icons ────────────────────────────────────────────────────────────────────
const SearchIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
);
const SpeakerIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
    </svg>
);
const BookmarkIcon = ({ filled }: { filled: boolean }) => (
    <svg className="w-5 h-5" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
    </svg>
);
const SparkleIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
    </svg>
);

// ─── Helpers ──────────────────────────────────────────────────────────────────
const POS_THEME: Record<string, { bg: string; text: string; border: string; label: string }> = {
    noun: { bg: 'bg-indigo-50', text: 'text-indigo-600', border: 'border-indigo-100', label: 'n' },
    verb: { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-100', label: 'v' },
    adjective: { bg: 'bg-pink-50', text: 'text-pink-600', border: 'border-pink-100', label: 'adj' },
    adj: { bg: 'bg-pink-50', text: 'text-pink-600', border: 'border-pink-100', label: 'adj' },
    adverb: { bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-100', label: 'adv' },
    adv: { bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-100', label: 'adv' },
};

const PosBadge = ({ pos }: { pos: string }) => {
    const theme = POS_THEME[pos.toLowerCase()] || { bg: 'bg-slate-100', text: 'text-slate-600', border: 'border-slate-200', label: pos };
    return (
        <span className={`inline-flex items-center gap-1 text-[9px] font-black px-1.5 py-0.5 rounded border uppercase tracking-widest ${theme.bg} ${theme.text} ${theme.border}`}>
            {theme.label}
        </span>
    );
};

const Skeleton = ({ className }: { className: string }) => (
    <div className={`animate-pulse bg-slate-200 rounded ${className}`} />
);

const HighlightedText = ({ text, highlight }: { text: string, highlight: string }) => {
    if (!highlight) return <>{text}</>;
    // Regex để tìm từ (không phân biệt hoa thường, khớp nguyên từ)
    const parts = text.split(new RegExp(`(\\b${highlight}\\b|\\b${highlight}s\\b|\\b${highlight}es\\b|\\b${highlight}ed\\b|\\b${highlight}ing\\b)`, 'gi'));
    return (
        <>
            {parts.map((part, i) => 
                part.toLowerCase().startsWith(highlight.toLowerCase().substring(0, highlight.length - 2)) || 
                part.toLowerCase() === highlight.toLowerCase() 
                ? <span key={i} className="font-bold text-indigo-600 underline decoration-indigo-200 underline-offset-2">{part}</span> 
                : part
            )}
        </>
    );
};

// ─── Main Component ───────────────────────────────────────────────────────────
const VocabularyPage: React.FC = () => {
    const { isAuthenticated } = useAuthStore();

    const [query, setQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<SearchResult | null>(null);
    const [aiNotes, setAiNotes] = useState<AINotes | null>(null);
    const [aiLoading, setAiLoading] = useState(false);
    const [aiAnalyzed, setAiAnalyzed] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [aiError, setAiError] = useState<string | null>(null);
    const [isSaved, setIsSaved] = useState(false);
    const [recentWords, setRecentWords] = useState<string[]>([]);
    
    const [isExpanded, setIsExpanded] = useState(false); 
    const [familyAiLoading, setFamilyAiLoading] = useState(false);
    const [enrichedFamilyData, setEnrichedFamilyData] = useState<any[] | null>(null);

    const [searchParams, setSearchParams] = useSearchParams();
    const urlWord = searchParams.get('word');

    const audioRef = useRef<HTMLAudioElement | null>(null);

    // ─── PERSISTENCE HELPERS (Full Cache for 10 words) ──────────────────────
    const CACHE_KEY = 'vocal_hub_v12_cache';
    
    const saveToCache = (word: string, updates: any) => {
        try {
            const cache = JSON.parse(localStorage.getItem(CACHE_KEY) || '{}');
            cache[word.toLowerCase()] = {
                ...(cache[word.toLowerCase()] || {}),
                ...updates,
                timestamp: Date.now()
            };
            
            // Giữ tối đa 10 từ gần nhất
            const keys = Object.keys(cache).sort((a, b) => cache[b].timestamp - cache[a].timestamp);
            if (keys.length > 10) {
                const newCache: any = {};
                keys.slice(0, 10).forEach(k => { newCache[k] = cache[k]; });
                localStorage.setItem(CACHE_KEY, JSON.stringify(newCache));
            } else {
                localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
            }
        } catch (e) { console.error('Cache save error', e); }
    };

    const loadFromCache = (word: string) => {
        try {
            const cache = JSON.parse(localStorage.getItem(CACHE_KEY) || '{}');
            return cache[word.toLowerCase()] || null;
        } catch { return null; }
    };

    // ─── INITIALIZATION ──────────────────────────────────────────────────────
    useEffect(() => {
        // Khôi phục danh sách từ gần đây từ Cache
        try {
            const cache = JSON.parse(localStorage.getItem(CACHE_KEY) || '{}');
            const keys = Object.keys(cache).sort((a, b) => cache[b].timestamp - cache[a].timestamp);
            setRecentWords(keys);
            
            if (urlWord) {
                handleSearch(urlWord);
            } else if (keys.length > 0) {
                // Nếu không có URL, lấy từ khóa cuối cùng trong cache
                setSearchParams({ word: keys[0] });
            }
        } catch {}
    }, [urlWord]); 

    const handleSearch = useCallback(async (word?: string) => {
        const searchWord = (word || query).trim();
        if (!searchWord) return;

        // BƯỚC 1: Kiểm tra Cache trước
        const cache = loadFromCache(searchWord);
        if (cache && cache.result) {
            setResult(cache.result);
            setIsSaved(cache.result.isSaved || false);
            setAiNotes(cache.aiNotes || null);
            setEnrichedFamilyData(cache.enrichedFamilyData || null);
            setIsExpanded(cache.isExpanded || false);
            setQuery(searchWord);
            setSearchParams({ word: searchWord });
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);
        setResult(null);
        setAiNotes(null);
        setAiAnalyzed(false);
        setEnrichedFamilyData(null);
        setIsSaved(false);
        setIsExpanded(false); 
        if (!word) setQuery(searchWord);

        try {
            const res = await vocabularyApi.search(searchWord);
            setResult(res.data);
            setIsSaved(res.data.isSaved || false);
            setRecentWords(prev => [searchWord, ...prev.filter(w => w !== searchWord)].slice(0, 10));
            
            // Cập nhật URL & Cache
            setSearchParams({ word: searchWord });
            saveToCache(searchWord, { result: res.data });
        } catch {
            setError(`Không tìm thấy từ "${searchWord}".`);
        } finally {
            setLoading(false);
        }
    }, [query]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') handleSearch();
    };

    const handlePlayAudio = () => {
        if (result?.audio) {
            audioRef.current = new Audio(result.audio);
            audioRef.current.play().catch(() => {});
        }
    };

    const handleToggleSave = async () => {
        if (!result) return;
        try {
            const res = await vocabularyApi.toggleSave(result.word);
            setIsSaved(res.data.isSaved);
        } catch { /* Handle error */ }
    };

    const handleAnalyzeIELTS = async () => {
        if (!result || aiLoading) return;
        setIsExpanded(true); 
        setAiLoading(true);
        setAiError(null);
        try {
            const res = await vocabularyApi.getAINotes(result.word);
            setAiNotes(res.data);
            saveToCache(result.word, { aiNotes: res.data, isExpanded: true });
        } catch (error: any) {
            if (error.response?.status === 429) {
                setAiError(error.response.data.message);
            } else {
                setAiError('Dịch vụ AI đang quá tải. Vui lòng thử lại sau.');
            }
            setAiNotes(null);
        } finally {
            setAiLoading(false);
        }
    };

    const handleEnrichFamilyAI = async () => {
        if (!result || familyAiLoading) return;
        setFamilyAiLoading(true);
        setAiError(null);
        try {
            const res = await vocabularyApi.getFamilyAINotes(result.word);
            if (res.data.familyData) {
                setEnrichedFamilyData(res.data.familyData);
                saveToCache(result.word, { enrichedFamilyData: res.data.familyData });
            }
            if (res.data.mainTranslation) {
                const updatedResult = { ...result, translation: res.data.mainTranslation };
                setResult(updatedResult);
                saveToCache(result.word, { result: updatedResult });
            }
        } catch (error: any) {
            if (error.response?.status === 429) {
                setAiError(error.response.data.message);
            } else {
                setAiError('Không thể làm giàu họ từ lúc này. Thử lại sau.');
            }
            setEnrichedFamilyData(null);
        } finally {
            setFamilyAiLoading(false);
        }
    };

    const quickWords = ['success', 'enhance', 'substantial', 'environment', 'crucial'];

    return (
        <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-indigo-100 transition-all duration-700">
            <div className={`mx-auto px-6 py-6 transition-all duration-700 ${isExpanded ? 'max-w-[1580px]' : 'max-w-7xl'}`}>
                
                {/* ── SEARCH AREA ── */}
                <div className="mb-8 flex items-center justify-between gap-4">
                    <h1 className="text-2xl font-black tracking-tight flex items-center gap-3">
                        Vocabulary Hub
                        {isExpanded && <span className="text-[10px] bg-indigo-600 text-white px-2 py-0.5 rounded-full uppercase tracking-widest animate-pulse">Deep Focus</span>}
                    </h1>
                    
                    <div className="flex-1 max-w-xl flex gap-2">
                        <div className="flex-1 relative group">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                                <SearchIcon />
                            </span>
                            <input
                                type="text"
                                value={query}
                                onChange={e => setQuery(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Tra từ IELTS..."
                                className="w-full pl-12 pr-4 py-3 rounded-2xl border border-slate-200 bg-white shadow-sm focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all text-sm"
                            />
                        </div>
                        <button
                            onClick={() => handleSearch()}
                            disabled={loading || !query.trim()}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-2xl font-black text-sm transition-all active:scale-95 disabled:bg-slate-300"
                        >
                            {loading ? '...' : 'Tìm'}
                        </button>
                    </div>
                </div>

                {/* ── RECENT SEARCHES CHIPS ── */}
                {recentWords.length > 0 && (
                    <div className="mb-8 flex items-center gap-3 overflow-x-auto pb-2 no-scrollbar">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Vừa tra:</span>
                        {recentWords.slice(0, 8).map(w => (
                            <button
                                key={w}
                                onClick={() => handleSearch(w)}
                                className={`px-4 py-1.5 rounded-full text-[11px] font-bold transition-all border whitespace-nowrap ${
                                    result?.word.toLowerCase() === w.toLowerCase()
                                        ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-200'
                                        : 'bg-white border-slate-200 text-slate-500 hover:border-indigo-300 hover:text-indigo-600'
                                }`}
                            >
                                {w}
                            </button>
                        ))}
                    </div>
                )}

                {/* ── LOADING & ERROR ── */}
                {loading && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <Skeleton className="h-[500px] rounded-[40px]" />
                        <Skeleton className="h-[500px] rounded-[40px]" />
                    </div>
                )}
                
                {error && !loading && (
                    <div className="p-8 bg-red-50 border border-red-100 rounded-3xl text-center max-w-lg mx-auto">
                        <p className="text-red-600 font-bold">{error}</p>
                    </div>
                )}

                {/* ── MAIN CONTENT (Dynamic 2/3 Column Grid) ── */}
                {result && !loading && (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start animate-in fade-in slide-in-from-bottom-5 duration-700">
                        
                        {/* ── COLUMN 1: MASTER CORE (Dictionary) ── */}
                        <div className={`transition-all duration-700 ${isExpanded ? 'lg:col-span-4' : 'lg:col-span-7'}`}>
                            <div className="bg-white rounded-[40px] p-8 border border-slate-200 shadow-xl shadow-slate-200/40 relative overflow-hidden h-full">
                                <div className="absolute top-0 left-0 w-2 h-full bg-indigo-500"></div>
                                
                                <div className="flex items-start justify-between mb-8">
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-4">
                                            <h2 className="text-5xl font-black tracking-tighter text-slate-900 leading-none">{result.word}</h2>
                                            {isAuthenticated && (
                                                <button onClick={handleToggleSave} className={`p-2 rounded-xl transition-all ${isSaved ? 'text-amber-500' : 'text-slate-200'}`}>
                                                    <BookmarkIcon filled={isSaved} />
                                                </button>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-3">
                                            {result.phonetic && <span className="text-lg font-mono text-indigo-400 font-medium">{result.phonetic}</span>}
                                            {result.audio && (
                                                <button onClick={handlePlayAudio} className="p-1.5 bg-indigo-50 text-indigo-500 rounded-lg hover:bg-indigo-100 transition-colors">
                                                    <SpeakerIcon />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                    
                                    <button 
                                        onClick={handleAnalyzeIELTS}
                                        className={`group relative p-3 rounded-2xl transition-all ${aiAnalyzed ? 'bg-violet-600 text-white' : 'bg-slate-50 text-slate-400 hover:bg-violet-50 hover:text-violet-600'}`}
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                        </svg>
                                        <span className="absolute bottom-full right-0 mb-3 px-2 py-1 bg-slate-800 text-white text-[9px] rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none font-black shadow-xl uppercase uppercase">Phân tích IELTS (AI)</span>
                                    </button>
                                </div>

                                <div className="p-6 bg-slate-900 rounded-[30px] mb-10 shadow-inner group overflow-hidden">
                                    {(() => {
                                        const fallbackDef = result.meanings?.[0]?.definitions?.[0]?.definition || '---';
                                        const displayVal = result.translation || fallbackDef;
                                        const isLong = displayVal.length > 50;
                                        return (
                                            <p className={`${isLong ? 'text-lg' : 'text-3xl'} font-black text-indigo-300 italic group-hover:text-indigo-200 transition-all duration-500 uppercase leading-tight`}>
                                                {displayVal}
                                            </p>
                                        );
                                    })()}
                                </div>

                                <div className="space-y-12">
                                    {result.meanings?.map((m, i) => (
                                        <div key={i} className="space-y-6">
                                            <div className="flex items-center gap-3">
                                                <PosBadge pos={m.partOfSpeech} />
                                                <div className="h-px flex-1 bg-slate-100"></div>
                                            </div>
                                            <div className="space-y-10 pl-2">
                                                {m.definitions?.map((def, j) => (
                                                    <div key={j} className="space-y-4">
                                                        <p className="text-xl font-bold text-slate-800 leading-tight">{def.definitionVi || def.definition}</p>
                                                        {def.definitionVi && <p className="text-sm text-slate-400 italic font-medium">{def.definition}</p>}
                                                        {def.example && (
                                                            <div className="pl-5 border-l-4 border-indigo-100 py-1 bg-indigo-50/20 rounded-r-2xl pr-4 transition-all hover:bg-indigo-50/40">
                                                                <p className="text-sm text-slate-600 font-medium italic leading-relaxed">
                                                                    "<HighlightedText text={def.example} highlight={result.word} />"
                                                                </p>
                                                                {def.exampleVi && <p className="text-[11px] text-indigo-500 font-black mt-3 uppercase tracking-widest leading-none">{def.exampleVi}</p>}
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {(result.synonyms?.length > 0 || result.antonyms?.length > 0) && (
                                    <div className="mt-16 pt-10 border-t border-slate-100 grid grid-cols-2 gap-8">
                                        <div className="space-y-4">
                                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Synonyms</h4>
                                            <div className="flex flex-wrap gap-2">
                                                {result.synonyms?.map(s => (
                                                    <button key={s} onClick={() => handleSearch(s)} className="px-3 py-1.5 bg-slate-50 text-slate-500 rounded-xl text-xs font-bold hover:bg-indigo-50 hover:text-indigo-600 transition-all shadow-sm">
                                                        {s}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="space-y-4">
                                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Antonyms</h4>
                                            <div className="flex flex-wrap gap-2">
                                                {result.antonyms?.map(a => (
                                                    <button key={a} onClick={() => handleSearch(a)} className="px-3 py-1.5 bg-slate-50 text-slate-500 rounded-xl text-xs font-bold hover:bg-rose-50 hover:text-rose-600 transition-all shadow-sm">
                                                        {a}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* ── COLUMN 2: WORD FAMILY (Always Visible) ── */}
                        <div className={`transition-all duration-700 lg:col-span-5`}>
                            <div className="bg-white rounded-[40px] p-8 border border-slate-200 shadow-sm relative overflow-hidden min-h-[600px] h-full flex flex-col">
                                <div className="flex items-center justify-between mb-8">
                                    <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Word Family Explorer</h3>
                                    
                                    <button 
                                        onClick={handleEnrichFamilyAI}
                                        disabled={familyAiLoading}
                                        className={`group relative p-3 rounded-2xl transition-all ${enrichedFamilyData ? 'bg-indigo-600 text-white shadow-indigo-200 shadow-lg' : 'bg-slate-50 text-slate-400 hover:bg-indigo-50 hover:text-indigo-600'}`}
                                    >
                                        <SparkleIcon />
                                        <span className="absolute bottom-full right-0 mb-3 px-2 py-1 bg-slate-800 text-white text-[9px] rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none font-black shadow-xl uppercase uppercase">Làm giàu Họ từ (AI)</span>
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 gap-5 flex-1">
                                    {(enrichedFamilyData || result.wordFamilyData)?.map((item, idx) => (
                                        <div key={idx} className="group p-6 bg-white rounded-[30px] border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-500">
                                            <div className="flex items-center justify-between mb-4">
                                                <button onClick={() => handleSearch(item.word)} className="text-xl font-black text-slate-800 hover:text-indigo-600 transition-colors uppercase tracking-tight underline decoration-slate-200 underline-offset-4">
                                                    {item.word}
                                                </button>
                                                <PosBadge pos={item.partOfSpeech} />
                                            </div>
                                            
                                            {(item.definitionVi || item.definition) ? (
                                                <>
                                                    <p className="text-sm font-bold text-slate-700 mb-4 leading-relaxed">{item.definitionVi || item.definition}</p>
                                                    {item.example && (
                                                        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 group-hover:border-indigo-50 transition-colors">
                                                            <p className="text-[13px] text-slate-500 italic leading-relaxed">
                                                                "<HighlightedText text={item.example} highlight={item.word} />"
                                                            </p>
                                                            {item.exampleVi && <p className="text-[10px] text-indigo-400 font-black mt-3 uppercase tracking-widest leading-none">{item.exampleVi}</p>}
                                                        </div>
                                                    )}
                                                </>
                                            ) : (
                                                <div className="py-4 border-t border-slate-50">
                                                    <p className="text-[10px] text-slate-300 font-medium italic">Nhấn biểu tượng icon AI phía trên để lấy định nghĩa & ví dụ cho biến thể này</p>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* ── COLUMN 3: AI INSIGHTS (Expandable) ── */}
                        {isExpanded && (
                            <div className="lg:col-span-3 lg:sticky lg:top-8 animate-in slide-in-from-right-10 duration-700">
                                <div className="bg-slate-900 rounded-[40px] p-8 text-white shadow-2xl space-y-8 relative overflow-hidden min-h-[600px] h-full">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 blur-[60px] -mr-16 -mt-16"></div>
                                    
                                    <div className="flex items-center gap-3 text-indigo-400">
                                        <SparkleIcon />
                                        <span className="text-[10px] font-black uppercase tracking-[0.3em]">IELTS Mastery Sidebar</span>
                                    </div>

                                    {aiLoading ? (
                                        <div className="space-y-8 py-20 text-center">
                                            <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin mx-auto"></div>
                                            <p className="text-xs font-black text-slate-500 uppercase tracking-widest">Sourcing Insights...</p>
                                        </div>
                                    ) : aiError ? (
                                        <div className="py-20 text-center px-4">
                                            <p className="text-indigo-300 text-sm font-medium mb-6 leading-relaxed">"{aiError}"</p>
                                            <button 
                                                onClick={handleAnalyzeIELTS}
                                                className="px-6 py-2 bg-indigo-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-500 transition-colors"
                                            >
                                                Thử lại ngay
                                            </button>
                                        </div>
                                    ) : aiNotes && (
                                        <>
                                            <div className="bg-indigo-500/10 rounded-[30px] p-6 border border-indigo-500/20">
                                                <p className="text-[9px] font-black uppercase text-indigo-300 mb-2 font-mono">Expert Tip</p>
                                                <p className="text-sm text-indigo-50 font-medium italic leading-relaxed">"{aiNotes.bandUpgradeTip}"</p>
                                            </div>

                                            <div className="space-y-6">
                                                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">IELTS Collocations</p>
                                                {aiNotes.collocations?.slice(0, 3).map((c, i) => (
                                                    <div key={i} className="pb-4 border-b border-white/5 last:border-0 group">
                                                        <p className="text-sm font-bold text-indigo-300 group-hover:text-white transition-colors">{c.phrase}</p>
                                                        <p className="text-[11px] text-slate-400 mt-1 leading-snug">{c.meaning}</p>
                                                    </div>
                                                ))}
                                            </div>

                                            <div className="space-y-6">
                                                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Advanced Structures</p>
                                                {aiNotes.writingStructures?.slice(0, 2).map((s, i) => (
                                                    <div key={i} className="p-4 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 transition-all">
                                                        <code className="text-xs text-amber-200 block mb-2 font-mono">{s.structure}</code>
                                                        <p className="text-[10px] text-slate-400 leading-relaxed italic">{s.explanation}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        )}

                    </div>
                )}

                {/* ── EMPTY STATE ── */}
                {!result && !loading && !error && (
                    <div className="text-center py-20 bg-white rounded-[60px] border border-slate-100 shadow-sm max-w-4xl mx-auto">
                        <div className="mb-6 inline-block p-10 bg-indigo-50 rounded-[40px] text-indigo-400 hover:rotate-12 transition-transform duration-500">
                            <SearchIcon />
                        </div>
                        <h2 className="text-4xl font-black text-slate-800 mb-4 tracking-tighter uppercase">Academic Vocabulary Hub</h2>
                        <p className="text-slate-500 text-lg max-w-sm mx-auto mb-10 leading-relaxed font-medium">
                            Tra cứu một từ để nhận trọn bộ Họ từ, Ví dụ học thuật và Phân tích IELTS từ AI.
                        </p>
                        <div className="flex flex-wrap gap-3 justify-center max-w-2xl mx-auto">
                            {quickWords.map(w => (
                                <button key={w} onClick={() => handleSearch(w)} className="px-6 py-3 rounded-2xl border border-slate-200 text-xs font-black text-slate-500 hover:bg-indigo-600 hover:border-indigo-600 hover:text-white transition-all duration-500 shadow-sm active:scale-95">
                                    {w}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
};

export default VocabularyPage;
