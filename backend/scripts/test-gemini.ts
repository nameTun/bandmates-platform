import { GoogleGenerativeAI } from "@google/generative-ai";
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(__dirname, '../.env') });

async function listModels() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("No API key found in .env");
    return;
  }

  console.log("Using API Key:", apiKey.substring(0, 10) + "...");

  const genAI = new GoogleGenerativeAI(apiKey);
  
  try {
    const models = ["gemini-2.0-flash", "gemini-flash-latest", "gemini-3-flash-preview"];
    
    for (const modelName of models) {
        try {
            const model = genAI.getGenerativeModel({ model: modelName });
            await model.generateContent("Hi");
            console.log(`Model '${modelName}' is AVAILABLE`);
        } catch (err) {
            console.log(`Model '${modelName}' failed: ${err.message}`);
        }
    }
  } catch (error) {
    console.error("Error listing models:", error);
  }
}

listModels();
