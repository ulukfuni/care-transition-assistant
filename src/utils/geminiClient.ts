import { GoogleGenerativeAI, GenerativeModel } from "@google/generative-ai";
import { DischargeSummary } from "@/types";

export interface GeminiResponse {
  insights: Array<{
    type: "risk_alert" | "follow_up" | "medication" | "care_coordination" | "general";
    title: string;
    patient: string;
    priority: "high" | "medium" | "low";
    recommendation: string;
    reasoning: string;
    confidence: "high" | "medium" | "low";
    timeframe: "immediate" | "within_24h" | "within_week" | "routine";
  }>;
  summary: string;
}

function extractJsonFromMarkdown(text: string): string {
  // Remove markdown code blocks if present
  const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  if (jsonMatch) {
    return jsonMatch[1].trim();
  }
  
  // If no markdown blocks, return the text as is
  return text.trim();
}

export class GeminiClient {
  private genAI: GoogleGenerativeAI;
  private model: GenerativeModel;

  constructor() {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is not configured");
    }
    
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    this.model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  }

  async generateInsights(
    message: string,
    patientData: DischargeSummary[]
  ): Promise<GeminiResponse> {
    try {
      const systemPrompt = `You are an expert healthcare AI assistant specializing in care transition management. Your role is to analyze patient discharge summaries and provide actionable insights for healthcare providers.

Key responsibilities:
1. Identify high-risk patients who may need immediate attention
2. Suggest appropriate follow-up care and interventions
3. Flag potential medication issues or drug interactions
4. Recommend care coordination strategies
5. Assess readmission risk factors

When analyzing patient data, consider:
- Medical complexity and comorbidities
- Social determinants of health
- Medication compliance risks
- Follow-up care requirements
- Discharge disposition appropriateness

Always provide specific, actionable recommendations with clear reasoning. Format your response as structured insights that can be displayed as cards.

Patient Data Context:
${JSON.stringify(patientData, null, 2)}`;

      const userPrompt = `${message}

Please analyze the provided patient data and generate actionable insights. Structure your response as JSON with the following format:
{
  "insights": [
    {
      "type": "risk_alert" | "follow_up" | "medication" | "care_coordination" | "general",
      "title": "Brief title",
      "patient": "Patient name or 'Multiple patients'",
      "priority": "high" | "medium" | "low",
      "recommendation": "Specific actionable recommendation",
      "reasoning": "Clinical reasoning behind the recommendation",
      "confidence": "high" | "medium" | "low",
      "timeframe": "immediate" | "within_24h" | "within_week" | "routine"
    }
  ],
  "summary": "Brief overall summary of key findings"
}

IMPORTANT: Respond ONLY with valid JSON. Do not include any other text or formatting.`;

      const fullPrompt = systemPrompt + "\n\n" + userPrompt;
      const result = await this.model.generateContent(fullPrompt);

      const response = await result.response;
      const text = response.text();

      // Extract JSON from markdown if present
      const jsonText = extractJsonFromMarkdown(text);

      // Try to parse the JSON response
      try {
        const parsedResponse = JSON.parse(jsonText);
        return parsedResponse as GeminiResponse;
      } catch {
        console.error("Failed to parse Gemini response as JSON:", text);
        console.error("Extracted JSON text:", jsonText);
        throw new Error("Invalid JSON response from Gemini");
      }
    } catch (error) {
      console.error("Gemini API error:", error);
      throw error;
    }
  }
} 