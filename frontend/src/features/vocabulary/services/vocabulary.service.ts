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
    translation: string;
    meanings: Meaning[];
    wordFamily?: {
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

export interface FamilyAINotesResponse {
    familyData?: any[];
    mainTranslation?: string;
}

export const vocabularyService = {
    /** Tra cứu từ vựng nhanh */
    search: async (word: string): Promise<SearchResult> => {
        const response = await api.get<SearchResult>(`/vocabulary/search?word=${encodeURIComponent(word)}`);
        return response.data;
    },

    /** Phân tích IELTS Writing chuyên sâu từ AI */
    getAINotes: async (word: string): Promise<AINotes> => {
        const response = await api.get<AINotes>(`/vocabulary/word-analysis-ai?word=${encodeURIComponent(word)}`);
        return response.data;
    },

    /** Phân tích Họ từ chuyên sâu bằng AI */
    getFamilyAINotes: async (word: string): Promise<FamilyAINotesResponse> => {
        const response = await api.get<FamilyAINotesResponse>(`/vocabulary/word-family-ai?word=${encodeURIComponent(word)}`);
        return response.data;
    },

    /** Toggle lưu/bỏ lưu từ vào Sổ tay */
    toggleSave: async (word: string) => {
        const response = await api.post<{ word: string; isSaved: boolean }>('/vocabulary/toggle-save', { word });
        return response.data;
    },

    /** Lấy lịch sử tra cứu */
    getHistory: async (page = 1, limit = 20) => {
        const response = await api.get('/vocabulary/history', { params: { page, limit } });
        return response.data;
    },

    /** Lấy danh sách từ đã lưu (Sổ tay) */
    getSavedWords: async (page = 1, limit = 20) => {
        const response = await api.get('/vocabulary/saved', { params: { page, limit } });
        return response.data;
    },
};
