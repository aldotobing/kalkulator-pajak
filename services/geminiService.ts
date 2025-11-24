
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
    yield "Mohon maaf, sepertinya ada sedikit gangguan koneksi saat menghubungi asisten pajak AI. 🙏 Silakan coba sebentar lagi ya.";
  }
};

// New Function: AI Tax Letter Drafter
export const generateTaxLetter = async function* (
  letterType: string,
  userData: { name: string; npwp: string; address: string },
  recipient: string,
  keyFacts: string
): AsyncGenerator<string, void, unknown> {
  if (!apiKey) {
    yield "API Key Missing";
    return;
  }

  const ai = new GoogleGenAI({ apiKey });
  const today = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

  const systemInstruction = `You are an expert Indonesian Tax Consultant and Legal Drafter.
  Your task is to write a FORMAL, OFFICIAL, and PROFESSIONAL letter to the Direktorat Jenderal Pajak (DJP).
  
  Tone & Style: 
  - Formal Bureaucratic Indonesian (Bahasa Baku).
  - Professional, respectful, and convincing.
  - Balanced length: Not too short (abrupt), not too long (rambling). Standard 1-page formal letter style.
  - Elaborate on the "Core Reason" slightly to make the argument stronger and more polite.
  - STRICTLY use the provided variable data. DO NOT use placeholders like [Nama], [Alamat], or [Tanggal].
  
  Structure:
  1. Header (City & Date): Use "${userData.address.split(' ')[0] || 'Jakarta'}, ${today}".
  2. Recipient: "Yth. ${recipient}" (If recipient string is empty, use "Kepala KPP Pratama Terkait").
  3. Sender Info (Under signature or intro): Name: ${userData.name}, NPWP: ${userData.npwp}, Address: ${userData.address}.
  4. Subject Line (Perihal): ${letterType}.
  5. Body:
     - Intro: "Saya yang bertanda tangan di bawah ini:" (List Identity Name/NPWP/Address here cleanly).
     - Content: Explain the facts based on this input: "${keyFacts}". (Rewrite this to be formal, logical, and sufficiently detailed to be understood clearly).
     - Legal: Briefly cite relevant law (UU KUP/PPh) only if it strengthens the argument.
     - Closing: Request/Hope (Standard formal closing sentences).
  6. Signature: "Hormat Saya," followed by ${userData.name}.

  Input Data to MUST use:
  - Type: ${letterType}
  - Sender Name: ${userData.name}
  - Sender NPWP: ${userData.npwp}
  - Sender Address: ${userData.address}
  - Recipient: ${recipient}
  - Core Reason: ${keyFacts}
  
  Output ONLY the final letter content. Do not add markdown like \`\`\` or conversational text.`;

  try {
    const responseStream = await ai.models.generateContentStream({
      model: 'gemini-2.5-flash',
      contents: `Buatkan surat resmi untuk keperluan: ${letterType}. Detail alasan: ${keyFacts}`,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.4, // Slightly higher temp for better elaboration
      }
    });

    for await (const chunk of responseStream) {
      if (chunk.text) {
        yield chunk.text;
      }
    }
  } catch (error) {
    console.error("Letter Gen Error:", error);
    yield "Gagal membuat draft surat. Silakan coba lagi.";
  }
};
