
import { GoogleGenAI, Type } from "@google/genai";
import { PatientData, TriageResult, Severity } from "../types";

// Defensive initialization to prevent white-screen on missing process.env
const getAiClient = () => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

  if (!apiKey) {
    console.warn("Gemini API Key is missing. Triage features will use fallback logic.");
    return null;
  }

  return new GoogleGenAI({ apiKey });
};


export const triagePatient = async (data: PatientData): Promise<TriageResult> => {
  const ai = getAiClient();
  
  if (!ai) {
    return {
      severity: Severity.MODERATE,
      summary: "Triage service temporarily offline (API Key Missing). Please follow manual emergency protocols.",
      recommended_specialists: ["ER Triage Physician"],
      equipment_needed: ["Standard Emergency Response Kit"]
    };
  }

  try {
    const prompt = `
      Act as an emergency medical triage AI. Analyze the following patient data provided by paramedics.
      
      Patient Info:
      Age: ${data.age}
      Gender: ${data.gender}
      Symptoms: ${data.symptoms}
      Vitals: ${data.vitals}

      Provide a structured assessment including severity (CRITICAL, MODERATE, STABLE), a brief medical summary, recommended specialists, and equipment needed.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            severity: {
              type: Type.STRING,
              enum: [Severity.CRITICAL, Severity.MODERATE, Severity.STABLE],
            },
            summary: {
              type: Type.STRING,
            },
            recommended_specialists: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            equipment_needed: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            }
          },
          required: ["severity", "summary", "recommended_specialists", "equipment_needed"]
        }
      }
    });

    const textOutput = response.text || "{}";
    return JSON.parse(textOutput) as TriageResult;
  } catch (error) {
    console.error("Triage Error:", error);
    return {
      severity: Severity.MODERATE,
      summary: "Automated triage analysis failed. Proceed with standard emergency protocols and human assessment.",
      recommended_specialists: ["General ER Physician"],
      equipment_needed: ["Standard ER Kit"]
    };
  }
};