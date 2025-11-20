import { GoogleGenAI } from "@google/genai";

// Ensure API key is present
const apiKey = process.env.API_KEY || '';

export const generateTaxAdvice = async (
  prompt: string, 
  context: string
): Promise<string> => {
  if (!apiKey) return "API Key not found. Please configure the environment.";

  const ai = new GoogleGenAI({ apiKey });
  
  try {
    const systemInstruction = `You are an expert Indonesian Tax Consultant (Konsultan Pajak). 
    You are helpful, accurate, and professional. 
    You explain tax laws (UU HPP, PPh, PPN) in simple Bahasa Indonesia.
    Always use proper formatting (bullet points, bold text) for readability.
    If the user asks about a calculation, refer to the context provided.
    Context provided includes the current numbers on the user's screen.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Context:\n${context}\n\nUser Question:\n${prompt}`,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.7,
      }
    });

    return response.text || "Maaf, saya tidak dapat menghasilkan jawaban saat ini.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Terjadi kesalahan saat menghubungi asisten pajak AI.";
  }
};
