import { GoogleGenAI } from "@google/genai";

import type { Project } from "../types";

// In Vite, use import.meta.env.VITE_API_KEY instead of process.env
const API_KEY = import.meta.env.VITE_API_KEY || ''; 

export const generateExecutiveSummary = async (projects: Project[]): Promise<string> => {
  if (!API_KEY) {
    return "API Key missing. Create a .env file in the client folder with VITE_API_KEY=your_key_here";
  }

  const ai = new GoogleGenAI({ apiKey: API_KEY });

  // Prepare context for the model
  const projectContext = projects.map(p => 
    `- Project: ${p.name}, Budget: $${p.budget}, Spent: $${p.spent}, Progress: ${p.progress}%, Status: ${p.status}, Calculated Risk: ${p.riskLevel}`
  ).join('\n');

  const prompt = `
    You are an expert Construction ERP AI Advisor. Analyze the following project data:
    ${projectContext}

    1. Identify the most critical project requiring immediate attention.
    2. Suggest 2 specific financial actions to mitigate risk.
    3. Provide a brief 1-sentence forecast for the portfolio health.
    
    Keep the tone professional and concise.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text || "No insights generated.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Unable to generate AI insights at this time. Please check your network or API quota.";
  }
};