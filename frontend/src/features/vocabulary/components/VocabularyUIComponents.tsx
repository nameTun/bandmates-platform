// ─── Icons ────────────────────────────────────────────────────────────────────
export const SearchIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
);
export const SpeakerIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
    </svg>
);
export const BookmarkIcon = ({ filled }: { filled: boolean }) => (
    <svg className="w-5 h-5" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
    </svg>
);
export const SparkleIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
    </svg>
);
export const ChevronRightIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
    </svg>
);
export const ChevronLeftIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
    </svg>
);

// ─── Helpers ──────────────────────────────────────────────────────────────────
export const POS_THEME: Record<string, { bg: string; text: string; border: string; decoration: string; label: string }> = {
    noun: { bg: 'bg-indigo-50', text: 'text-indigo-600', border: 'border-indigo-100', decoration: 'decoration-indigo-200', label: 'n' },
    verb: { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-100', decoration: 'decoration-emerald-200', label: 'v' },
    adjective: { bg: 'bg-pink-50', text: 'text-pink-600', border: 'border-pink-100', decoration: 'decoration-pink-200', label: 'adj' },
    adj: { bg: 'bg-pink-50', text: 'text-pink-600', border: 'border-pink-100', decoration: 'decoration-pink-200', label: 'adj' },
    adverb: { bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-100', decoration: 'decoration-amber-200', label: 'adv' },
    adv: { bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-100', decoration: 'decoration-amber-200', label: 'adv' },
};

export const PosBadge = ({ pos }: { pos: string }) => {
    const theme = POS_THEME[pos.toLowerCase()] || { bg: 'bg-slate-100', text: 'text-slate-600', border: 'border-slate-200', label: pos };
    return (
        <span className={`inline-flex items-center gap-1 text-[9px] font-black px-1.5 py-0.5 rounded border uppercase tracking-widest ${theme.bg} ${theme.text} ${theme.border}`}>
            {theme.label}
        </span>
    );
};

export const Skeleton = ({ className }: { className: string }) => (
    <div className={`animate-pulse bg-slate-200 rounded ${className}`} />
);

export const HighlightedText = ({ text, highlight, pos }: { text: string, highlight: string, pos?: string }) => {
    if (!highlight) return <>{text}</>;
    // Regex để tìm từ (không phân biệt hoa thường, khớp nguyên từ)
    const parts = text.split(new RegExp(`(\\b${highlight}\\b|\\b${highlight}s\\b|\\b${highlight}es\\b|\\b${highlight}ed\\b|\\b${highlight}ing\\b)`, 'gi'));
    const theme = POS_THEME[pos?.toLowerCase() || 'noun'] || POS_THEME.noun;
    return (
        <>
            {parts.map((part, i) => 
                part.toLowerCase().startsWith(highlight.toLowerCase().substring(0, highlight.length - 2)) || 
                part.toLowerCase() === highlight.toLowerCase() 
                ? <span key={i} className={`font-bold ${theme.text} underline ${theme.decoration} underline-offset-2`}>{part}</span> 
                : part
            )}
        </>
    );
};
