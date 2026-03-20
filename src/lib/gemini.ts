import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export interface HealthData {
  age: number;
  weight: number;
  height: number;
  bloodPressure: string;
  cholesterol: number;
  smoking: boolean;
  exercise: string;
}

export interface HeartPrediction {
  timeline: string;
  warning: string;
  recommendations: string;
}

export async function getHeartPrediction(data: HealthData): Promise<HeartPrediction> {
  const model = "gemini-3-flash-preview";
  const prompt = `Based on the following health data, provide a heart health prediction:
  - Age: ${data.age}
  - Weight: ${data.weight}kg
  - Height: ${data.height}cm
  - Blood Pressure: ${data.bloodPressure}
  - Cholesterol: ${data.cholesterol}mg/dL
  - Smoking: ${data.smoking ? "Yes" : "No"}
  - Exercise: ${data.exercise}

  Provide the prediction in JSON format with the following fields:
  - timeline: A brief description of the heart health timeline.
  - warning: Any specific warnings or risk factors.
  - recommendations: Actionable recommendations for improving heart health.`;

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          timeline: { type: Type.STRING },
          warning: { type: Type.STRING },
          recommendations: { type: Type.STRING },
        },
        required: ["timeline", "warning", "recommendations"],
      },
    },
  });

  try {
    return JSON.parse(response.text || "{}") as HeartPrediction;
  } catch (error) {
    console.error("Failed to parse Gemini response:", error);
    throw new Error("Failed to generate prediction");
  }
}
