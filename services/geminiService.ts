
import { GoogleGenAI, GenerateContentResponse, Modality } from "@google/genai";
import { AI_SYSTEM_INSTRUCTION } from "../constants";

export class GeminiService {
  private dynamicApiKey: string | null = null;

  constructor() {}

  /**
   * تعيين مفتاح API ديناميكي يتم جلبه من قاعدة البيانات
   */
  public setDynamicApiKey(key: string) {
    this.dynamicApiKey = key;
  }

  /**
   * يجلب مفتاح API النشط. 
   * الأولوية للمفتاح المجلوب من DB، ثم التخزين المحلي، ثم بيئة النظام.
   */
  public getActiveApiKey(): string {
    if (this.dynamicApiKey) return this.dynamicApiKey;
    const override = localStorage.getItem('GEMINI_API_KEY_OVERRIDE');
    return override || process.env.API_KEY || "";
  }

  /**
   * يحفظ مفتاح API في التخزين المحلي كخيار ثانوي.
   */
  public setApiKeyOverride(key: string) {
    if (key && key.trim().length > 10) {
      localStorage.setItem('GEMINI_API_KEY_OVERRIDE', key.trim());
      return true;
    } else if (!key || key.trim() === "") {
      localStorage.removeItem('GEMINI_API_KEY_OVERRIDE');
      return true;
    }
    return false;
  }

  private getAI() {
    return new GoogleGenAI({ apiKey: this.getActiveApiKey() });
  }

  async *streamChat(message: string, history: any[]) {
    const ai = this.getAI();
    const chat = ai.chats.create({
      model: 'gemini-3-flash-preview',
      config: {
        systemInstruction: AI_SYSTEM_INSTRUCTION,
        temperature: 0.7,
      },
    });

    const responseStream = await chat.sendMessageStream({ message });
    for await (const chunk of responseStream) {
      const c = chunk as GenerateContentResponse;
      yield c.text;
    }
  }

  async generateStudyPlan(stream: string, weakSubjects: string[], availableHours: number) {
    const ai = this.getAI();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `خطط لجدول مراجعة لشعبة ${stream} مع التركيز على ${weakSubjects.join(', ')} لمدة ${availableHours} ساعة يومياً. المخرجات بـ Markdown.`,
      config: { temperature: 0.5 }
    });
    return response.text;
  }

  async searchLessonVideos(topic: string) {
    const ai = this.getAI();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `ابحث عن دروس يوتيوب لـ: ${topic} في البكالوريا الجزائرية.`,
      config: { tools: [{ googleSearch: {} }] },
    });
    const text = response.text || "";
    const videos: any[] = [];
    const youtubeRegex = /(https?:\/\/(?:www\.)?youtube\.com\/(?:watch\?v=|shorts\/|embed\/)[\w-]+|https?:\/\/youtu\.be\/[\w-]+)/g;
    const matches = text.match(youtubeRegex);
    if (matches) {
      matches.forEach(url => videos.push({ title: "فيديو تعليمي", url, source: 'YouTube' }));
    }
    return { text, videos };
  }

  async searchSummaries(topic: string) {
    const ai = this.getAI();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `ابحث عن روابط PDF لملخصات ${topic} في الجزائر.`,
      config: { tools: [{ googleSearch: {} }] },
    });
    const grounding = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    return grounding.map((chunk: any) => ({
      id: Math.random().toString(36).substr(2, 9),
      title: chunk.web?.title || topic,
      url: chunk.web?.uri,
      author: new URL(chunk.web?.uri || "https://dz.edu").hostname,
      subject: "مادة البحث",
      fileSize: "رابط خارجي",
      downloads: 100,
      rating: 4.8,
      uploadDate: new Date().toISOString()
    }));
  }

  async generateExercises(topic: string) {
    const ai = this.getAI();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `ولد تمارين وحلول لدرس ${topic} للبكالوريا الجزائرية.`,
    });
    return response.text;
  }

  async generateSpeech(text: string) {
    const ai = this.getAI();
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } },
      },
    });
    return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  }

  connectLive(callbacks: any) {
    const ai = this.getAI();
    return ai.live.connect({
      model: 'gemini-2.5-flash-native-audio-preview-12-2025',
      callbacks,
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } } },
        systemInstruction: AI_SYSTEM_INSTRUCTION + " أنت الآن في وضع التحدث المباشر.",
      },
    });
  }
}

export const geminiService = new GeminiService();
