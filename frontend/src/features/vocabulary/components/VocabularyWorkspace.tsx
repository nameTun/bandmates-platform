import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import { vocabularyService } from '../services/vocabulary.service';
import type { SearchResult, AINotes } from '../services/vocabulary.service';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { Skeleton, SearchIcon } from './VocabularyUIComponents';

import { VocabularySearch } from './VocabularySearch';
import { DictionaryCore } from './DictionaryCore';
import { WordFamilyExplorer } from './WordFamilyExplorer';
import { AIInsightsSidebar } from './AIInsightsSidebar';

export const VocabularyWorkspace: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { isAuthenticated } = useAuthStore();

    const [query, setQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<SearchResult | null>(null);
    const [aiNotes, setAiNotes] = useState<AINotes | null>(null);
    const [aiLoading, setAiLoading] = useState(false);
    const [aiAnalyzed, setAiAnalyzed] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [aiError, setAiError] = useState<string | null>(null);
    
    // Quota state
    const [showQuotaModal, setShowQuotaModal] = useState(false);
    const [quotaMessage, setQuotaMessage] = useState('');
    const [quotaUserLimit, setQuotaUserLimit] = useState<number | null>(null);
    const [usage, setUsage] = useState<{ limit: number; used: number; remaining: number } | null>(null);
    
    // User interaction state
    const [isSaved, setIsSaved] = useState(false);
    const [recentWords, setRecentWords] = useState<string[]>([]);
    const [isExpanded, setIsExpanded] = useState(false); 
    const [familyAiLoading, setFamilyAiLoading] = useState(false);
    const [enrichedFamilyData, setEnrichedFamilyData] = useState<any[] | null>(null);

    // Draggable Sidebar states
    const [isPanelExpanded, setIsPanelExpanded] = useState(true);
    const [panelWidth, setPanelWidth] = useState(380);
    const [isDragging, setIsDragging] = useState(false);

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
        try {
            const cache = JSON.parse(localStorage.getItem(CACHE_KEY) || '{}');
            const keys = Object.keys(cache).sort((a, b) => cache[b].timestamp - cache[a].timestamp);
            setRecentWords(keys);
            
            if (urlWord) {
                handleSearch(urlWord);
            } else if (keys.length > 0) {
                setSearchParams({ word: keys[0] });
            }
        } catch {}
    }, [urlWord]); 

    // ─── ACTIONS ──────────────────────────────────────────────────────
    const handleSearch = useCallback(async (word?: string) => {
        const searchWord = (word || query).trim();
        if (!searchWord) return;

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
            const data = await vocabularyService.search(searchWord);
            setResult(data);
            setIsSaved(data.isSaved || false);
            setRecentWords(prev => [searchWord, ...prev.filter(w => w !== searchWord)].slice(0, 10));
            setSearchParams({ word: searchWord });
            saveToCache(searchWord, { result: data });
        } catch {
            setError(`Không tìm thấy từ "${searchWord}".`);
        } finally {
            setLoading(false);
        }
    }, [query, setSearchParams]);

    const handlePlayAudio = () => {
        if (result?.audio) {
            audioRef.current = new Audio(result.audio);
            audioRef.current.play().catch(() => {});
        }
    };

    const handleToggleSave = async () => {
        if (!result) return;
        try {
            const data = await vocabularyService.toggleSave(result.word);
            setIsSaved(data.isSaved);
        } catch { /* Handle error */ }
    };

    const handleAnalyzeIELTS = async () => {
        if (!result || aiLoading) return;
        // UX: Toggle sidebar if already analyzed
        if (aiAnalyzed && aiNotes && isExpanded) {
             setIsExpanded(false);
             return;
        }
        setIsExpanded(true); 
        if (aiNotes) return; // already loaded
        
        setAiLoading(true);
        setAiError(null);
        try {
            const data = await vocabularyService.getAINotes(result.word);
            setAiNotes(data.result);
            setUsage(data.usage);
            setAiAnalyzed(true);
            saveToCache(result.word, { aiNotes: data.result, isExpanded: true });
        } catch (error: any) {
            if (error.response?.status === 429) {
                const data = error.response.data;
                setQuotaMessage(data.message || 'Bạn đã hết lượt sử dụng AI hôm nay.');
                if (data.userLimit) setQuotaUserLimit(data.userLimit);
                setShowQuotaModal(true);
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
        if (enrichedFamilyData) return; // Prevent duplicate API requests if already enriched

        setFamilyAiLoading(true);
        setAiError(null);
        try {
            const data = await vocabularyService.getFamilyAINotes(result.word);
            setUsage(data.usage);
            if (data.result.familyData) {
                setEnrichedFamilyData(data.result.familyData);
                saveToCache(result.word, { enrichedFamilyData: data.result.familyData });
            }
            if (data.result.mainTranslation) {
                const updatedResult = { ...result, translation: data.result.mainTranslation };
                setResult(updatedResult);
                saveToCache(result.word, { result: updatedResult });
            }
        } catch (error: any) {
            if (error.response?.status === 429) {
                const data = error.response.data;
                setQuotaMessage(data.message || 'Bạn đã hết lượt sử dụng AI hôm nay.');
                if (data.userLimit) setQuotaUserLimit(data.userLimit);
                setShowQuotaModal(true);
            } else {
                alert('Không thể làm giàu họ từ lúc này. Thử lại sau.');
            }
            setEnrichedFamilyData(null);
        } finally {
            setFamilyAiLoading(false);
        }
    };

    const quickWords = ['success', 'enhance', 'substantial', 'environment', 'crucial'];

    return (
        <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-indigo-100 transition-all duration-700">
            <div className={`mx-auto px-4 lg:px-6 py-4 transition-all duration-700 ${isExpanded ? 'max-w-[1600px]' : 'max-w-7xl'}`}>
                
                <VocabularySearch 
                    query={query}
                    setQuery={setQuery}
                    onSearch={handleSearch}
                    loading={loading}
                    recentWords={recentWords}
                    resultWord={result?.word}
                    isExpanded={isExpanded}
                    showBackButton={location.state?.from === 'history'}
                    onBack={() => navigate('/history')}
                />

                {/* ── LOADING & ERROR ── */}
                {loading && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-4">
                        <Skeleton className="h-[600px] rounded-[40px]" />
                        <Skeleton className="h-[600px] rounded-[40px]" />
                    </div>
                )}
                
                {error && !loading && (
                    <div className="p-6 bg-red-50 border border-red-100 rounded-3xl text-center max-w-lg mx-auto mt-4">
                        <p className="text-red-600 font-bold">{error}</p>
                    </div>
                )}

                {/* ── MAIN CONTENT FLEX ── */}
                {result && !loading && (
                    <div className="flex flex-col lg:flex-row gap-5 lg:gap-8 items-start animate-in fade-in slide-in-from-bottom-5 duration-700 mt-4 relative">
                        
                        {/* COLUMN 1 & 2 WRAPPER (Fluid flex) */}
                        <div className={`flex-1 w-full grid grid-cols-1 ${isExpanded ? 'xl:grid-cols-2 gap-5 lg:gap-8' : 'lg:grid-cols-12 gap-5 lg:gap-8'} transition-all`}>
                            
                            {/* COLUMN 1: DICTIONARY CORE */}
                            <div className={`${isExpanded ? 'xl:col-span-1' : 'md:col-span-7'}`}>
                                <DictionaryCore 
                                    result={result}
                                    isAuthenticated={isAuthenticated}
                                    isSaved={isSaved}
                                    onToggleSave={handleToggleSave}
                                    onPlayAudio={handlePlayAudio}
                                    onSearchSynonymAntonym={handleSearch}
                                />
                            </div>

                            {/* COLUMN 2: WORD FAMILY */}
                            <div className={`${isExpanded ? 'xl:col-span-1' : 'lg:col-span-5'}`}>
                                <WordFamilyExplorer 
                                    familyData={result.wordFamilyData || []}
                                    enrichedFamilyData={enrichedFamilyData}
                                    usage={usage}
                                    loading={familyAiLoading}
                                    onEnrichFamily={handleEnrichFamilyAI}
                                    onSearchWord={handleSearch}
                                />
                            </div>

                        </div>

                        {/* COLUMN 3: AI INSIGHTS SIDEBAR */}
                        {isExpanded && (
                            <AIInsightsSidebar 
                                loading={aiLoading}
                                error={aiError}
                                aiNotes={aiNotes}
                                onAnalyze={handleAnalyzeIELTS}
                                isPanelExpanded={isPanelExpanded}
                                setIsPanelExpanded={setIsPanelExpanded}
                                panelWidth={panelWidth}
                                setPanelWidth={setPanelWidth}
                                isDragging={isDragging}
                                setIsDragging={setIsDragging}
                            />
                        )}

                        {/* TOGGLE BUTTON FOR AI SIDEBAR (When not even analyzed) */}
                        {!isExpanded && !loading && result && (
                            <div className="hidden lg:block fixed right-0 top-1/2 -translate-y-1/2 z-[60]">
                                <button 
                                    onClick={handleAnalyzeIELTS}
                                    className="w-12 h-24 bg-indigo-600 rounded-l-2xl shadow-[-8px_0_15px_-3px_rgba(0,0,0,0.1)] flex flex-col items-center justify-center gap-1 hover:bg-slate-900 group transition-all"
                                    title="Mở bảng phân tích AI"
                                >
                                    <svg className="w-5 h-5 text-indigo-300 group-hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                                    </svg>
                                    <span className="text-[10px] font-black text-indigo-200 group-hover:text-white" style={{ writingMode: 'vertical-rl' }}>AI</span>
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {/* ── EMPTY STATE ── */}
                {!result && !loading && !error && (
                    <div className="text-center py-16 lg:py-24 bg-white rounded-[60px] border border-slate-100 shadow-sm max-w-4xl mx-auto mt-4 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50/50 blur-[100px] pointer-events-none"></div>
                        <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-50/50 blur-[100px] pointer-events-none"></div>
                        
                        <div className="mb-6 inline-block p-8 bg-indigo-50 rounded-[30px] text-indigo-400 shadow-inner group transition-transform duration-500">
                            <SearchIcon />
                        </div>
                        <h2 className="text-3xl md:text-5xl font-black text-slate-800 mb-6 tracking-tighter uppercase relative z-10">Academic Vocabulary Hub</h2>
                        <p className="text-slate-500 md:text-lg max-w-sm mx-auto mb-10 leading-relaxed font-medium relative z-10">
                            Tra cứu một từ để nhận trọn bộ Họ từ, Ví dụ học thuật và Phân tích IELTS từ AI.
                        </p>
                        <div className="flex flex-wrap gap-3 justify-center max-w-2xl mx-auto relative z-10">
                            {quickWords.map(w => (
                                <button key={w} onClick={() => handleSearch(w)} className="px-6 py-3 rounded-2xl border-2 border-slate-100 text-xs font-black text-slate-500 hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-600 transition-all duration-300 shadow-sm active:scale-95">
                                    {w}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
            
            {/* ═══ QUOTA MODAL ═══ */}
            {showQuotaModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full overflow-hidden animate-in zoom-in-95 duration-300 border border-slate-100 text-center">
                        <div className="p-8">
                            <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-[24px] flex items-center justify-center mx-auto mb-6 shadow-inner ring-4 ring-indigo-50/50">
                                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-slate-800 mb-3">Hết lượt dùng AI</h3>
                            <p className="text-slate-500 text-sm leading-relaxed mb-8">
                                {quotaMessage}
                            </p>
                            
                            <div className="flex flex-col gap-3">
                                {!isAuthenticated ? (
                                    <>
                                        <button 
                                            onClick={() => navigate('/register')}
                                            className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl shadow-lg shadow-indigo-200 transition-all hover:-translate-y-0.5"
                                        >
                                            Đăng ký nhận {quotaUserLimit || 5} lượt/ngày
                                        </button>
                                        <button 
                                            onClick={() => navigate('/login')}
                                            className="w-full py-4 text-slate-600 font-bold hover:bg-slate-50 rounded-2xl transition-colors"
                                        >
                                            Đã có tài khoản? Đăng nhập
                                        </button>
                                    </>
                                ) : (
                                    <button 
                                        onClick={() => setShowQuotaModal(false)}
                                        className="w-full py-4 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-2xl shadow-lg transition-all"
                                    >
                                        Đã hiểu
                                    </button>
                                )}
                                
                                {!isAuthenticated && (
                                    <button 
                                        onClick={() => setShowQuotaModal(false)}
                                        className="mt-2 text-xs text-slate-400 hover:text-slate-500 font-medium font-sans"
                                    >
                                        Bỏ qua lần này
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
