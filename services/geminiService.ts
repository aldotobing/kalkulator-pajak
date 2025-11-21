
import { GoogleGenAI } from "@google/genai";

// Ensure API key is present
const apiKey = process.env.API_KEY || '';

export const generateTaxAdviceStream = async function* (
  prompt: string, 
  context: string
): AsyncGenerator<string, void, unknown> {
  if (!apiKey) {
    yield "API Key not found. Please configure the environment.";
    return;
  }

  const ai = new GoogleGenAI({ apiKey });
  
  try {
    const systemInstruction = `You are an expert Indonesian Tax Consultant acting as a warm, friendly, and professional Customer Care agent for 'PajakKu Pro'. 

    Your Personality:
    - Warm, empathetic, and approachable (like a helpful human expert).
    - Professional but not robotic. Use natural, polite Bahasa Indonesia (sopan & santun).
    - You genuinely care about helping the user understand their taxes.
    - Use emojis periodically (e.g., 👋, 😊, ✅, 💡, 📉) to make the conversation lighter and less intimidating, but do not overuse them.

    Your Task:
    - Explain tax laws (UU HPP, PPh, PPN) in simple, easy-to-understand language.
    - Avoid overly bureaucratic jargon unless necessary, and always explain it if used.
    - Always use proper formatting (bullet points, bold text, lists) for readability.
    
    Context Handling:
    - If the user asks about a calculation, YOU MUST refer to the 'Context' provided below which contains the specific numbers currently on their screen.
    - Guide them based on those specific numbers.

    Example Tone:
    "Halo Kak! 👋 Untuk perhitungan PPh 21 ini, karena Kakak belum punya NPWP, tarifnya jadi lebih tinggi 20% ya. 😊 Berikut detailnya..."`;

    const responseStream = await ai.models.generateContentStream({
      model: 'gemini-2.5-flash',
      contents: `Context:\n${context}\n\nUser Question:\n${prompt}`,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.7,
      }
    });

    for await (const chunk of responseStream) {
      if (chunk.text) {
        yield chunk.text;
      }
    }
  } catch (error) {
    console.error("Gemini Error:", error);
    yield "Mohon maaf, sepertinya ada sedikit gangguan koneksi saat menghubungi asisten pajak AI. 🙏 Silakan coba lagi sebentar lagi ya.";
  }
};
