import { GoogleGenAI } from '@google/genai';
import { functionDeclarations } from './src/services/intentParser.js';
import dotenv from 'dotenv';
dotenv.config();

const SYSTEM_INSTRUCTION = "Você é Lola";

async function run() {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        { role: 'user', parts: [{ text: '* Segunda-feira: 11h20\n* Terça-feira: 07h00\n* Quarta-feira: 08h00\n* Quinta-feira: 06h00\n* Sexta-feira: 06h00\n\nPreciso acordar nesses dias.' }] }
      ],
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        tools: [{ functionDeclarations }],
      },
    });
    
    if (response.candidates[0].content.parts[0].functionCall) {
      console.log("Success Function Call:", response.candidates[0].content.parts[0].functionCall);
    } else {
      console.log("Success Text:", response.text);
    }
  } catch (err) {
    console.error("Error calling Gemini:", err.message);
  }
}

run();
