import * as dotenv from 'dotenv';
import * as path from 'path';

// Load cấu hình từ file .env
dotenv.config({ path: path.join(__dirname, '../.env') });

async function getActualModelNames() {
  const apiKey = process.env.GEMINI_API_KEY;
  console.log("--- ĐANG TRUY VẤN DANH SÁCH TEXT-OUT MODELS ---");

  if (!apiKey) {
    console.error(" LỖI: Không tìm thấy GEMINI_API_KEY trong file .env");
    return;
  }

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    const data: any = await response.json();

    if (data.models) {
      // Lọc các model hỗ trợ tạo nội dung VÀ không phải là model chuyên dụng multimedia/TTS
      const textModels = data.models.filter((m: any) => {
        const name = m.name.toLowerCase();
        const isGeneration = m.supportedGenerationMethods.includes("generateContent");
        
        // Loại bỏ các model chuyên biệt về Media
        const isMediaSpecialist = name.includes('-image') || 
                                 name.includes('-tts') || 
                                 name.includes('-clip') || 
                                 name.includes('robotics') ||
                                 name.includes('vision');
        
        return isGeneration && !isMediaSpecialist;
      });

      console.log(`✅ Đã tìm thấy ${textModels.length} Model chuyên về Văn bản (Text-out):\n`);

      textModels.forEach((m: any) => {
        const id = m.name.replace('models/', '');
        console.log(`- ${m.displayName}`);
        console.log(`  ID: "${id}"`);
        console.log(`  Giới hạn: Input ${m.inputTokenLimit.toLocaleString()} tokens | Output ${m.outputTokenLimit.toLocaleString()} tokens`);
        console.log(`  Mô tả: ${m.description || 'Không có mô tả.'}\n`);
      });

    } else {
      console.error("Không lấy được dữ liệu. Phản hồi từ Google:", data);
    }
  } catch (error) {
    console.error("Lỗi kết nối:", error);
  }
  console.log("\n--- KẾT THÚC TRUY VẤN ---");
}

getActualModelNames();