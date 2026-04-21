import React from 'react';
import type { SearchResult } from '../services/vocabulary.service';
import { BookmarkIcon, PosBadge, SpeakerIcon, HighlightedText, POS_THEME } from './VocabularyUIComponents';

interface DictionaryCoreProps {
    result: SearchResult;
    isAuthenticated: boolean;
    isSaved: boolean;
    onToggleSave: () => void;
    onPlayAudio: () => void;
    onSearchSynonymAntonym: (word: string) => void;
}

export const DictionaryCore: React.FC<DictionaryCoreProps> = ({
    result,
    isAuthenticated,
    isSaved,
    onToggleSave,
    onPlayAudio,
    onSearchSynonymAntonym
}) => {
    return (
        <div className="bg-white rounded-[24px] border border-slate-100 shadow-2xl shadow-indigo-500/5 relative overflow-hidden h-[calc(100vh-150px)] flex flex-col">
            {/* Edge Accent */}
            <div className="absolute top-0 left-0 w-1.5 h-full bg-indigo-500 z-10 pointer-events-none"></div>
            
            <div className="flex-1 overflow-y-auto custom-scrollbar p-6 lg:p-8 relative">
                {/* ── HEADER (Word, Phonetic, Audio, Save) ── */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <div className="flex flex-wrap items-center gap-4">
                        <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 leading-none">{result.word}</h2>
                        {result.phonetic && <span className="text-sm bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded font-mono font-bold tracking-tight border border-indigo-100/50">{result.phonetic}</span>}
                    </div>
                    
                    <div className="flex items-center gap-2">
                        {result.audio && (
                            <button onClick={onPlayAudio} className="p-2 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-600 hover:text-white transition-colors border border-indigo-100" title="Phát âm">
                                <SpeakerIcon />
                            </button>
                        )}
                        {isAuthenticated && (
                            <button 
                                onClick={onToggleSave} 
                                className={`p-2 rounded-xl border transition-all ${isSaved ? 'bg-amber-50 text-amber-500 border-amber-100' : 'bg-slate-50 text-slate-400 border-slate-100 hover:bg-slate-100'}`}
                                title={isSaved ? "Bỏ lưu" : "Lưu từ vựng"}
                            >
                                <BookmarkIcon filled={isSaved} />
                            </button>
                        )}
                    </div>
                </div>

                {/* ── MAIN HIGHLIGHT THEME ── */}
                <div className="p-5 bg-slate-900 rounded-2xl mb-8 shadow-inner group overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/20 blur-[30px] -mr-8 -mt-8 pointer-events-none"></div>
                    {(() => {
                        const fallbackDef = result.meanings?.[0]?.definitions?.[0]?.definition || '---';
                        const displayVal = result.translation || fallbackDef;
                        const isLong = displayVal.length > 50;
                        return (
                            <p className={`${isLong ? 'text-base' : 'text-xl md:text-2xl'} font-black text-white italic group-hover:text-indigo-200 transition-all duration-300 uppercase leading-snug relative z-10`}>
                                {displayVal}
                            </p>
                        );
                    })()}
                </div>

                {/* ── MEANINGS ── */}
                <div className="space-y-8">
                    {result.meanings?.map((m, i) => {
                        const theme = POS_THEME[m.partOfSpeech?.toLowerCase() || 'noun'] || POS_THEME.noun;
                        return (
                            <div key={i} className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <PosBadge pos={m.partOfSpeech} />
                                    <div className="h-px flex-1 bg-slate-100 rounded-full"></div>
                                </div>
                                <div className="space-y-6 pl-2">
                                    {m.definitions?.map((def, j) => (
                                        <div key={j} className="space-y-2">
                                            <p className="text-base font-bold text-slate-800 leading-snug">{def.definitionVi || def.definition}</p>
                                            {def.definitionVi && <p className="text-sm text-slate-500 italic font-medium">{def.definition}</p>}
                                            
                                            {def.example && (
                                                <div className="pl-4 border-l-2 border-slate-200 py-1 bg-slate-50 rounded-r-lg pr-4 mt-2">
                                                    <p className="text-[13px] text-slate-600 font-medium italic leading-relaxed">
                                                        "<HighlightedText text={def.example} highlight={result.word} pos={m.partOfSpeech} />"
                                                    </p>
                                                    {def.exampleVi && <p className={`text-[11px] ${theme.text} font-semibold mt-1 italic`}>{def.exampleVi}</p>}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* ── SYNONYMS & ANTONYMS ── */}
                {(result.synonyms?.length > 0 || result.antonyms?.length > 0) && (
                    <div className="mt-10 pt-6 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {result.synonyms?.length > 0 && (
                            <div className="space-y-3">
                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Synonyms / Đồng nghĩa</h4>
                                <div className="flex flex-wrap gap-2">
                                    {result.synonyms.map(s => (
                                        <button key={s} onClick={() => onSearchSynonymAntonym(s)} className="px-3 py-1.5 bg-white border border-slate-200 text-slate-600 rounded-lg text-xs font-semibold hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-600 transition-colors">
                                            {s}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                        {result.antonyms?.length > 0 && (
                            <div className="space-y-3">
                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Antonyms / Trái nghĩa</h4>
                                <div className="flex flex-wrap gap-2">
                                    {result.antonyms.map(a => (
                                        <button key={a} onClick={() => onSearchSynonymAntonym(a)} className="px-3 py-1.5 bg-white border border-slate-200 text-slate-600 rounded-lg text-xs font-semibold hover:border-rose-300 hover:bg-rose-50 hover:text-rose-600 transition-colors">
                                            {a}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};
