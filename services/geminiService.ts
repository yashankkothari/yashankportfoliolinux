import { GoogleGenAI, Modality } from "@google/genai";
import { RESUME } from '../constants';

// Initialize the Gemini API client
// process.env.API_KEY is assumed to be available
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Sends a chat message to Gemini 3 Pro Preview.
 * Includes the Resume context for better answers.
 */
export const chatWithGemini = async (message: string, history: { role: string; content: string }[] = []) => {
  try {
    const systemContext = `
      You are an AI assistant for Yashank Kothari's portfolio website.
      Your goal is to answer questions about Yashank's professional background, skills, and projects.
      
      Here is Yashank's Resume Data:
      ${JSON.stringify(RESUME, null, 2)}

      Be helpful, concise, and professional. Maintain a slight "hacker/terminal" persona if possible, but keep it readable.
      Do not make up facts not in the resume. If asked about something not listed, say you don't have that information.
    `;

    // Create a new chat session (simplified for single-turn or client-managed history for this demo)
    // For a true chat session, we would use ai.chats.create and maintain the object, 
    // but for this react structure, we will just use generateContent with system instructions for simplicity 
    // or a chat object if we persist it. Let's use ai.chats.create for better context handling.
    
    const chat = ai.chats.create({
      model: 'gemini-3-pro-preview',
      config: {
        systemInstruction: systemContext,
      },
    });
    
    // Replay history if needed, or just send the new message. 
    // Since we create a new chat instance each time here (stateless service call), 
    // we should actually rely on the model being smart enough with just the system prompt + current message 
    // OR reconstruct history. For this specific task, let's just send the prompt with context.
    
    const result = await chat.sendMessage({
      message: message
    });

    return result.text;
  } catch (error) {
    console.error("Gemini Chat Error:", error);
    return "Error: Connection to neural link failed. Please try again.";
  }
};

/**
 * Edits an image using Gemini 2.5 Flash Image (Nano Banana).
 * Takes a base64 string and a text prompt.
 */
export const editImageWithGemini = async (base64Image: string, prompt: string): Promise<string | null> => {
  try {
    // Remove header if present (e.g., "data:image/png;base64,")
    const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, "");
    const mimeType = base64Image.match(/^data:(image\/\w+);base64,/)?.[1] || "image/png";

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Data,
              mimeType: mimeType, 
            },
          },
          {
            text: prompt,
          },
        ],
      },
      config: {
        responseModalities: [Modality.IMAGE],
      },
    });

    const part = response.candidates?.[0]?.content?.parts?.[0];
    if (part && part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
    
    return null;
  } catch (error) {
    console.error("Gemini Image Edit Error:", error);
    throw error;
  }
};
