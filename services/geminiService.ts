
import { GoogleGenAI, GenerateContentResponse, Modality } from "@google/genai";
import { AI_SYSTEM_INSTRUCTION } from "../constants";

export class GeminiService {
  constructor() {}

  // الحصول على المفتاح النشط (سواء من الإعدادات أو البيئة الافتراضية)
  public getActiveApiKey(): string {
    const override = localStorage.getItem('GEMINI_API_KEY_OVERRIDE');
    return override || process.env.API_KEY || "";
  }

  // حفظ مفتاح جديد من لوحة التحكم
  public setApiKeyOverride(key: string) {
    if (key.trim()) {
      localStorage.setItem('GEMINI_API_KEY_OVERRIDE', key.trim());
    } else {
      localStorage.removeItem('GEMINI_API_KEY_OVERRIDE');
    }
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
    const model = 'gemini-3-flash-preview';
    
    const prompt = `
      بصفتك خبير في تنظيم الوقت ومنهج البكالوريا الجزائري، املأ جدول مراجعة أسبوعي لطالب في شعبة "${stream}".
      المواد التي يريد الطالب التركيز عليها: ${weakSubjects.join('، ')}.
      عدد ساعات الدراسة المتاحة يومياً: ${availableHours} ساعة.
      المخرجات: جدول Markdown منظم باللغة العربية.
    `;

    try {
      const response = await ai.models.generateContent({
        model: model,
        contents: prompt,
        config: { temperature: 0.5 }
      });
      return response.text;
    } catch (error: any) {
      if (error.message?.includes('429')) {
        throw new Error("تجاوزت حد الطلبات. يرجى المحاولة لاحقاً.");
      }
      throw error;
    }
  }

  async searchLessonVideos(topic: string) {
    const ai = this.getAI();
    const model = 'gemini-3-flash-preview';
    
    const prompt = `أعطني روابط فيديوهات يوتيوب مباشرة (ليست Shorts إذا أمكن) لدرس: "${topic}" في البكالوريا الجزائرية. 
    ركز على الأساتذة: الأستاذ نور الدين (رياضيات)، مولاي (فيزياء)، بوالريش (علوم).
    يجب أن يتضمن الرد روابط يوتيوب كاملة تدعم التضمين (youtube.com/watch?v=...).`;
    
    try {
      const response = await ai.models.generateContent({
        model: model,
        contents: prompt,
        config: { 
          tools: [{ googleSearch: {} }] 
        },
      });
      
      const text = response.text || "";
      const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
      
      const videos: any[] = [];
      const seenUrls = new Set<string>();

      groundingChunks.forEach((chunk: any) => {
        if (chunk.web && chunk.web.uri && (chunk.web.uri.includes('youtube.com') || chunk.web.uri.includes('youtu.be'))) {
          const url = chunk.web.uri;
          if (!seenUrls.has(url)) {
            seenUrls.add(url);
            videos.push({
              title: chunk.web.title || "فيديو تعليمي مقترح",
              url: url,
              source: 'YouTube'
            });
          }
        }
      });

      const youtubeRegex = /(https?:\/\/(?:www\.)?youtube\.com\/(?:watch\?v=|shorts\/|embed\/)[\w-]+|https?:\/\/youtu\.be\/[\w-]+)/g;
      const matches = text.match(youtubeRegex);
      if (matches) {
        matches.forEach(url => {
          if (!seenUrls.has(url)) {
            seenUrls.add(url);
            videos.push({
              title: "درس مرئي مختار",
              url: url,
              source: 'YouTube'
            });
          }
        });
      }

      return { text, videos };
    } catch (error) {
      console.error("Video search error:", error);
      return { text: "حدث خطأ أثناء محاولة البحث عن الفيديوهات.", videos: [] };
    }
  }

  async searchSummaries(topic: string) {
    const ai = this.getAI();
    const model = 'gemini-3-flash-preview';
    const prompt = `ابحث عن ملخصات، فروض، اختبارات أو مذكرات بصيغة PDF لدرس: "${topic}" في شهادة البكالوريا الجزائرية. 
    ركز على المواقع التعليمية الجزائرية الموثوقة (dzexams, ency-education, ...).`;
    
    try {
      const response = await ai.models.generateContent({
        model: model,
        contents: prompt,
        config: {
          tools: [{ googleSearch: {} }],
        },
      });

      const grounding = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
      
      const seenUrls = new Set<string>();
      const results: any[] = [];

      for (const chunk of grounding) {
        if (chunk.web && chunk.web.uri && !seenUrls.has(chunk.web.uri)) {
          seenUrls.add(chunk.web.uri);
          results.push({
            id: `ai-${Math.random().toString(36).substr(2, 9)}`,
            title: chunk.web.title || `ملخص ${topic}`,
            subject: "مادة البحث",
            author: new URL(chunk.web.uri).hostname,
            url: chunk.web.uri,
            downloads: Math.floor(Math.random() * 10000) + 500,
            rating: 4.5 + Math.random() * 0.5,
            fileSize: (1 + Math.random() * 4).toFixed(1) + " MB",
            previewSnippet: `ملخص خارجي مفيد لدرس ${topic} من موقع ${new URL(chunk.web.uri).hostname}.`
          });
        }
      }

      return results;
    } catch (error) {
      console.error("Search Summaries Error:", error);
      throw error;
    }
  }

  async generateExercises(topic: string) {
    const ai = this.getAI();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `قم بتوليد تمارين لدرس: "${topic}" مع الحلول المختصرة للبكالوريا الجزائرية.`,
    });
    return response.text;
  }

  async generateSpeech(text: string) {
    const ai = this.getAI();
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: `اقرأ هذا الملخص التعليمي بوضوح وبلهجة عربية فصحى مشجعة: ${text}` }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' },
          },
        },
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
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Zephyr' },
          },
        },
        systemInstruction: AI_SYSTEM_INSTRUCTION + " أنت الآن في وضع التحدث المباشر.",
      },
    });
  }
}

export const geminiService = new GeminiService();
