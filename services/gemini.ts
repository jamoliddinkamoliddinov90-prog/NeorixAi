
import { GoogleGenAI, Chat, GenerateContentResponse } from "@google/genai";

export type AiMode = 'general' | 'coding' | 'fast' | 'international';

const SYSTEM_INSTRUCTIONS: Record<AiMode, string> = {
  general: `
    Sening isming Neorix AI. Asosching Jamoliddin Kamoliddinov. 12.02.2026 da kashf etilgansan.
    Sen universal va aqlli yordamchisan. Foydalanuvchi bilan do'stona va ochiq muloqot qil.
  `,
  coding: `
    Sen Neorix AI ning Dasturlash bo'yicha mutaxassisisan. Asosching Jamoliddin Kamoliddinov.
    Faqat kodlash, algoritmlar, arxitektura va texnologiyalar haqida gapir. 
    Javoblaringda doimo kod namunalarini keltir va eng samarali usullarni tavsiya qil.
  `,
  fast: `
    Sen Neorix AI (Tezkor rejim). Asosching Jamoliddin Kamoliddinov.
    Javoblaring juda qisqa, aniq va lunda bo'lishi shart. Ortiqcha so'zlarsiz faqat mohiyatni yoz.
  `,
  international: `
    Sen Neorix AI (Xalqaro ekspert). Asosching Jamoliddin Kamoliddinov.
    Sen dunyo tillari, madaniyatlari va xalqaro yangiliklar bo'yicha mutaxassissan. 
    Tarjima qilishga va madaniy farqlarni tushuntirishga tayyor tur.
  `
};

export class GeminiService {
  private ai: GoogleGenAI;
  private chat: Chat | null = null;
  private currentMode: AiMode = 'general';

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
    this.initChat('general');
  }

  private initChat(mode: AiMode) {
    this.currentMode = mode;
    this.chat = this.ai.chats.create({
      model: mode === 'coding' ? 'gemini-3-pro-preview' : 'gemini-3-flash-preview',
      config: {
        systemInstruction: SYSTEM_INSTRUCTIONS[mode],
        temperature: mode === 'fast' ? 0.3 : 0.7,
      },
    });
  }

  async setMode(mode: AiMode) {
    if (this.currentMode !== mode) {
      this.initChat(mode);
    }
  }

  async sendMessageStream(message: string, onChunk: (chunk: string) => void) {
    if (!this.chat) this.initChat(this.currentMode);
    try {
      const response = await this.chat!.sendMessageStream({ message });
      for await (const chunk of response) {
        const text = (chunk as GenerateContentResponse).text;
        if (text) onChunk(text);
      }
    } catch (error) {
      console.error("Gemini API Error:", error);
      throw error;
    }
  }
}

export const geminiService = new GeminiService();
