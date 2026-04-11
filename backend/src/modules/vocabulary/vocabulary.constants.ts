/**
 * Tập trung tất cả các URL và cấu hình API bên ngoài của Vocabulary module tại đây.
 * Mục đích: Dễ thay thế hoặc nâng cấp nguồn API mà không cần sửa trong phần logic nghiệp vụ.
 */
export const VOCABULARY_API = {
    /**
     * [Nguồn A] Free Dictionary API
     * Cung cấp: Phiên âm (IPA), audio, định nghĩa, ví dụ câu, synonyms/antonyms cơ bản.
     */
    DICTIONARY: (word: string) =>
        `https://api.dictionaryapi.dev/api/v2/entries/en/${word}`,

    /**
     * [Nguồn B] Datamuse API — rel_syn: Từ đồng nghĩa chính xác (WordNet)
     */
    DATAMUSE_SYNONYMS: (word: string) =>
        `https://api.datamuse.com/words?rel_syn=${word}&max=10`,

    /**
     * [Nguồn B] Datamuse API — ml: "Means like" — fallback khi rel_syn trả về rỗng.
     * Trả về các từ có nghĩa tương tự, rộng hơn rel_syn.
     */
    DATAMUSE_MEANS_LIKE: (word: string) =>
        `https://api.datamuse.com/words?ml=${word}&max=10`,

    /**
     * [Nguồn B] Datamuse API — rel_ant: Từ trái nghĩa.
     */
    DATAMUSE_ANTONYMS: (word: string) =>
        `https://api.datamuse.com/words?rel_ant=${word}&max=10`,
};
