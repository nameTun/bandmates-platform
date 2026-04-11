import api from '@/lib/api';

export interface Definition {
    definition: string;
    definitionVi: string;
    example: string;
    exampleVi: string;
}

export interface Meaning {
    partOfSpeech: string;
    definitions: Definition[];
}

export interface SearchResult {
    word: string;
    phonetic: string;
    audio: string;
    translation: string;       // Nghĩa tiếng Việt tổng quát
    meanings: Meaning[];       // Từ loại + định nghĩa song ngữ
    wordFamily?: {             // NEW: Họ từ đầy đủ thông tin
        noun: string[];
        verb: string[];
        adj: string[];
        adv: string[];
    };
    wordFamilyData?: Array<{
        word: string;
        partOfSpeech: string;
        definition?: string;
        definitionVi?: string;
        example?: string;
        exampleVi?: string;
    }>;
    synonyms: string[];
    antonyms: string[];
    isSaved?: boolean;
}

export interface IELTSCollocation {
    phrase: string;
    meaning: string;
    example: string;
}

export interface IELTSStructure {
    structure: string;
    explanation: string;
    example: string;
}

export interface IELTSMistake {
    wrong: string;
    correct: string;
    note: string;
}

export interface AINotes {
    word: string;
    hasSpecialStructures: boolean;
    ieltsBand: string;
    collocations: IELTSCollocation[];
    writingStructures: IELTSStructure[];
    commonMistakes: IELTSMistake[];
    bandUpgradeTip: string;
}

export const vocabularyApi = {
    /** Tra cứu từ vựng nhanh — Dictionary + Google Translate + Datamuse (~400ms) */
    search: (word: string) =>
        api.get<SearchResult>(`/vocabulary/search?word=${encodeURIComponent(word)}`),

    /** Phân tích IELTS Writing chuyên sâu từ AI — Chỉ gọi khi người dùng bấm nút */
    getAINotes: (word: string) =>
        api.get<AINotes>(`/vocabulary/ai-notes?word=${encodeURIComponent(word)}`),

    /** [NÂNG CẤP] Phân tích Họ từ chuyên sâu bằng AI */
    getFamilyAINotes: (word: string) =>
        api.get<any[]>(`/vocabulary/enrich?word=${encodeURIComponent(word)}`),

    /** Toggle lưu/bỏ lưu từ vào Sổ tay */
    toggleSave: (word: string) =>
        api.post<{ word: string; isSaved: boolean }>('/vocabulary/save', { word }),

    /** Lấy lịch sử tra cứu */
    getHistory: (page = 1, limit = 20, savedOnly = false) =>
        api.get('/vocabulary/history', { params: { page, limit, savedOnly } }),
};
