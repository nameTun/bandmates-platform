
import { GoogleGenerativeAI } from "@google/generative-ai";
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load cấu hình từ file .env
dotenv.config({ path: path.join(__dirname, '../.env') });

async function diagnosticGemini() {
  const apiKey = process.env.GEMINI_API_KEY;

  console.log("--- HỆ THỐNG CHẨN ĐOÁN GEMINI API ---");

  if (!apiKey) {
    console.error("LỖI: Không tìm thấy GEMINI_API_KEY trong file .env");
    return;
  }

  console.log("API Key: Đã nhận diện (bắt đầu bằng: " + apiKey.substring(0, 5) + "...)");

  const genAI = new GoogleGenerativeAI(apiKey);

  // Danh sách các Model thực sự có hạn mức (Quota) theo Dashboard BandMates của bạn
  const modelsToTest = [
    "gemini-3.1-flash-lite-preview", // [ƯU TIÊN 1] 15 RPM | 500 RPD (Khỏe nhất hiện tại)
    "gemini-2.5-flash-lite",         // [ƯU TIÊN 2] 10 RPM | 20 RPD
    "gemini-3-flash-preview",        // [ƯU TIÊN 3] 5 RPM  | 20 RPD
    "gemini-2.5-flash",              // [ƯU TIÊN 4] 5 RPM  | 20 RPD
  ];

  for (const modelName of modelsToTest) {
    console.log(`\nĐang kiểm tra Model: ${modelName}...`);
    try {
      const model = genAI.getGenerativeModel({ model: modelName });

      // Thử thực hiện một truy vấn đơn giản nhất
      const result = await model.generateContent("Phản hồi 'OK' nếu bạn nghe thấy tôi.");
      const response = await result.response;
      const text = response.text();

      console.log(`KẾT QUẢ: Thành công!`);
      console.log(`AI Phản hồi: "${text.trim()}"`);
    } catch (err: any) {
      console.error(`KẾT QUẢ: Thất bại.`);
      console.error(`Lý do: ${err.message}`);
    }
  }

  console.log("\n--- KẾT THÚC CHẨN ĐOÁN ---");
}

diagnosticGemini();

