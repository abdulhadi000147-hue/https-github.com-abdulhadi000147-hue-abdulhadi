import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { SYSTEM_INSTRUCTION_BASE } from '../constants';

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key not found");
  }
  return new GoogleGenAI({ apiKey });
};

export const sendMessageToGemini = async (
  prompt: string,
  imageBase64: string | null,
  subjectContext: string,
  history: { role: 'user' | 'model'; parts: { text: string }[] }[]
): Promise<string> => {
  const ai = getClient();
  
  // We will use gemini-2.5-flash for speed and multimodal capabilities
  // For standard homework help, flash is usually sufficient and fast.
  const modelId = 'gemini-2.5-flash';

  const systemInstruction = `${SYSTEM_INSTRUCTION_BASE}\n\nCurrent Subject Context: ${subjectContext}`;

  try {
    const chat = ai.chats.create({
      model: modelId,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.7, // Balanced creativity and accuracy
      },
      history: history,
    });

    let messageContent: any = [{ text: prompt }];
    
    if (imageBase64) {
      messageContent = [
        {
          inlineData: {
            mimeType: 'image/jpeg', // Assuming JPEG for simplicity from canvas/input, or detect
            data: imageBase64
          }
        },
        { text: prompt || "براہ کرم اس تصویر کی وضاحت کریں اور حل کرنے میں مدد کریں۔" } // Default prompt if empty with image
      ];
    }

    const result: GenerateContentResponse = await chat.sendMessage({
      message: { 
        parts: messageContent
      }
    });

    return result.text || "معذرت، میں کوئی جواب تیار نہیں کر سکا۔";
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};
