import React, { useState } from 'react';

interface WordResult {
  word: string;
  phonetic: string;
  partOfSpeech: { type: string; definition: string; example: string }[];
  synonyms: string[];
  antonyms: string[];
}

// Mock data — sẽ thay bằng API thật sau
const mockLookup = (word: string): WordResult | null => {
  const dict: Record<string, WordResult> = {
    significant: {
      word: 'significant',
      phonetic: '/sɪɡˈnɪfɪkənt/',
      partOfSpeech: [
        { type: 'Adjective', definition: 'Sufficiently great or important to be worthy of attention; noteworthy.', example: 'There was a significant increase in internet usage over the period.' },
        { type: 'Adjective', definition: 'Having a particular meaning; indicative of something.', example: 'The results are statistically significant.' },
      ],
      synonyms: ['notable', 'substantial', 'considerable', 'remarkable', 'important'],
      antonyms: ['insignificant', 'trivial', 'minor', 'negligible'],
    },
    abundant: {
      word: 'abundant',
      phonetic: '/əˈbʌndənt/',
      partOfSpeech: [
        { type: 'Adjective', definition: 'Existing or available in large quantities; plentiful.', example: 'The country has abundant natural resources.' },
      ],
      synonyms: ['plentiful', 'copious', 'ample', 'profuse', 'lavish'],
      antonyms: ['scarce', 'sparse', 'meager', 'insufficient'],
    },
  };
  return dict[word.toLowerCase()] || null;
};

const VocabularyPage: React.FC = () => {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState<WordResult | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [recentWords, setRecentWords] = useState<string[]>([]);

  const handleSearch = () => {
    if (!query.trim()) return;
    const found = mockLookup(query.trim());
    setResult(found);
    setNotFound(!found);
    if (found && !recentWords.includes(found.word)) {
      setRecentWords(prev => [found.word, ...prev].slice(0, 10));
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch();
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-4xl mx-auto px-6 py-10">

        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">Tra cứu từ vựng</h1>
          <p className="text-slate-500">Tìm nghĩa, phiên âm, đồng/trái nghĩa và ví dụ thực tế cho bất kỳ từ nào.</p>
        </div>

        {/* Search Bar */}
        <div className="relative mb-8">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder='Nhập từ cần tra, ví dụ: "significant"'
                className="w-full pl-12 pr-4 py-4 rounded-xl border border-slate-200 bg-white text-base text-slate-800 placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300 outline-none transition-all shadow-sm"
              />
            </div>
            <button
              onClick={handleSearch}
              disabled={!query.trim()}
              className="px-6 py-4 bg-indigo-500 hover:bg-indigo-600 disabled:bg-slate-300 text-white font-bold rounded-xl shadow-md shadow-indigo-200 hover:shadow-lg disabled:shadow-none active:scale-95 transition-all"
            >
              Tra cứu
            </button>
          </div>
        </div>

        {/* Recent words */}
        {recentWords.length > 0 && !result && (
          <div className="mb-8">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Từ đã tra gần đây</h3>
            <div className="flex flex-wrap gap-2">
              {recentWords.map(w => (
                <button
                  key={w}
                  onClick={() => { setQuery(w); setResult(mockLookup(w)); setNotFound(false); }}
                  className="px-3.5 py-1.5 bg-white border border-slate-200 rounded-full text-sm font-medium text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 transition-all"
                >
                  {w}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Not Found */}
        {notFound && (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">🔍</div>
            <h3 className="text-lg font-bold text-slate-700 mb-2">Không tìm thấy từ "{query}"</h3>
            <p className="text-sm text-slate-500">Vui lòng kiểm tra lại chính tả hoặc thử từ khác.</p>
          </div>
        )}

        {/* Result */}
        {result && (
          <div className="space-y-6 animate-in">
            {/* Word header */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <div className="flex items-baseline gap-4 mb-1">
                <h2 className="text-3xl font-extrabold text-slate-900">{result.word}</h2>
                <span className="text-lg text-indigo-500 font-medium">{result.phonetic}</span>
                <button className="p-1.5 rounded-lg hover:bg-indigo-50 text-indigo-400 hover:text-indigo-600 transition-colors" title="Phát âm">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Definitions */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Định nghĩa & Ví dụ</h3>
              <div className="space-y-5">
                {result.partOfSpeech.map((pos, i) => (
                  <div key={i}>
                    <span className="text-[11px] font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full uppercase tracking-wide">
                      {pos.type}
                    </span>
                    <p className="text-slate-800 mt-2 leading-relaxed">{pos.definition}</p>
                    <p className="text-sm text-slate-500 mt-1.5 italic border-l-2 border-indigo-200 pl-3">
                      "{pos.example}"
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Synonyms & Antonyms */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Synonyms */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                <h3 className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                  </svg>
                  Đồng nghĩa
                </h3>
                <div className="flex flex-wrap gap-2">
                  {result.synonyms.map(s => (
                    <button
                      key={s}
                      onClick={() => { setQuery(s); setResult(mockLookup(s)); setNotFound(!mockLookup(s)); }}
                      className="px-3 py-1.5 bg-emerald-50 border border-emerald-100 rounded-full text-sm font-medium text-emerald-700 hover:bg-emerald-100 transition-colors cursor-pointer"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Antonyms */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                <h3 className="text-xs font-bold text-red-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                  </svg>
                  Trái nghĩa
                </h3>
                <div className="flex flex-wrap gap-2">
                  {result.antonyms.map(a => (
                    <button
                      key={a}
                      onClick={() => { setQuery(a); setResult(mockLookup(a)); setNotFound(!mockLookup(a)); }}
                      className="px-3 py-1.5 bg-red-50 border border-red-100 rounded-full text-sm font-medium text-red-600 hover:bg-red-100 transition-colors cursor-pointer"
                    >
                      {a}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!result && !notFound && recentWords.length === 0 && (
          <div className="text-center py-20">
            <div className="w-24 h-24 rounded-2xl bg-indigo-50 flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12 text-indigo-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-slate-700 mb-2">Bắt đầu tra cứu</h3>
            <p className="text-sm text-slate-500 max-w-md mx-auto">
              Nhập bất kỳ từ tiếng Anh nào vào ô tìm kiếm. Bạn sẽ nhận được phiên âm IPA, định nghĩa, ví dụ sử dụng,
              và danh sách từ đồng nghĩa / trái nghĩa.
            </p>
            <div className="flex flex-wrap gap-2 justify-center mt-6">
              {['significant', 'abundant', 'crucial', 'enhance'].map(w => (
                <button
                  key={w}
                  onClick={() => { setQuery(w); setResult(mockLookup(w)); setNotFound(!mockLookup(w)); }}
                  className="px-4 py-2 bg-white border border-slate-200 rounded-full text-sm font-medium text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 transition-all shadow-sm"
                >
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
