/**
 * Tập trung tất cả các URL và cấu hình API bên ngoài của Vocabulary module tại đây.
 * Mục đích: Dễ thay thế hoặc nâng cấp nguồn API mà không cần sửa trong phần logic nghiệp vụ.
 */
export const VOCABULARY_API = {
    /**
     * [Nguồn A] Free Dictionary API
     * Cung cấp: Phiên âm (IPA), audio, định nghĩa, ví dụ câu, synonyms/antonyms cơ bản.
     * Giới hạn: 1,000 requests/giờ/IP. Không cần API Key.
     * Docs: https://dictionaryapi.dev/
     */
    DICTIONARY: (word: string) =>
        `https://api.dictionaryapi.dev/api/v2/entries/en/${word}`,

    /**
     * [Nguồn B] Datamuse API
     * Cung cấp: Từ đồng nghĩa, trái nghĩa, collocations mở rộng.
     * Giới hạn: 100,000 requests/ngày. Không cần API Key.
     * Docs: https://www.datamuse.com/api/
     */
    DATAMUSE_SYNONYMS: (word: string) =>
        `https://api.datamuse.com/words?rel_syn=${word}&max=10`,

    DATAMUSE_ANTONYMS: (word: string) =>
        `https://api.datamuse.com/words?rel_ant=${word}&max=10`,
};
