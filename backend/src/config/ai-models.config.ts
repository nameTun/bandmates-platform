/**
 * Danh sách phân cấp các model Gemini dựa trên Quota và tính năng.
 * Tên model phải khớp chính xác với định danh của Google API.
 */

export const AI_MODELS = {
    // Nhóm dùng cho các tác vụ nhẹ, cần tốc độ nhanh (Tra từ, word family...)
    LIGHT: [
        'gemini-3.1-flash-lite-preview', // Ưu tiên 1: 500 RPD
        'gemini-2.5-flash-lite',         // Ưu tiên 2: 20 RPD
    ],

    // Nhóm dùng cho các tác vụ nặng, yêu cầu độ chính xác cao (Chấm bài IELTS)
    HEAVY: [
        'gemini-3.1-flash-lite-preview', // Ưu tiên 1 (Do hiện tại Pro đang 0/0)
        'gemini-3-flash-preview',        // Ưu tiên 2
        'gemini-2.5-flash',              // Ưu tiên 3
    ]
};

export interface ModelLimits {
    rpm: number;
    rpd: number;
}

export const AI_LIMITS: Record<string, ModelLimits> = {
    'gemini-3.1-flash-lite-preview': { rpm: 15, rpd: 500 },
    'gemini-2.5-flash-lite': { rpm: 10, rpd: 20 },
    'gemini-3-flash-preview': { rpm: 5, rpd: 20 },
    'gemini-2.5-flash': { rpm: 5, rpd: 20 },
};
