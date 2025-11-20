import { GoogleGenAI, Type } from "@google/genai";
import { MissionIntel } from "../types";

const apiKey = process.env.API_KEY || '';
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

export const generateMissionIntel = async (): Promise<MissionIntel> => {
  if (!ai) {
    console.warn("No API Key found, using default mission.");
    return {
      operationName: "Operation: Offline Protocol",
      briefing: "Network connection to HQ severed. Proceed with standard containment protocols. Eliminate all hostiles in the AO.",
      objective: "Survive the horde.",
      difficulty: "Offline Mode"
    };
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: "Generate a cool, tactical military mission briefing for a top-down shooter game. It should be short, intense, and Call of Duty style.",
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            operationName: { type: Type.STRING },
            briefing: { type: Type.STRING },
            objective: { type: Type.STRING },
            difficulty: { type: Type.STRING }
          },
          required: ["operationName", "briefing", "objective", "difficulty"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from Gemini");

    return JSON.parse(text) as MissionIntel;
  } catch (error) {
    console.error("Failed to generate mission:", error);
    return {
      operationName: "Operation: Fallback",
      briefing: "Intelligence feed interrupted. Hostiles inbound. Weapons free.",
      objective: "Survive.",
      difficulty: "Hardened"
    };
  }
};
