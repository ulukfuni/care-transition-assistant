import { GoogleGenerativeAI, GenerativeModel } from "@google/generative-ai";
import { DischargeSummary, ChatMessage } from "@/types";
import { getRelevantPatients } from "./patientFilter";
import { buildFullPrompt, PromptContext } from "./promptEngineering";

export interface GeminiResponse {
  response_type: "insights" | "text" | "mixed";
  content?: string; // Simple text response when no insights needed
  insights?: Array<{
    type: "risk_alert" | "follow_up" | "medication" | "care_coordination" | "general";
    title: string;
    patient: string;
    priority: "high" | "medium" | "low";
    recommendation: string;
    reasoning: string;
    confidence: "high" | "medium" | "low";
    timeframe: "immediate" | "within_24h" | "within_week" | "routine";
  }>;
  summary?: string; // Only present when insights are generated
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
    allPatientData: DischargeSummary[],
    chatHistory: ChatMessage[] = []
  ): Promise<GeminiResponse> {
    try {
      // Filter patients based on the user message
      const relevantPatients = getRelevantPatients(allPatientData, message);
      
      console.log(`Gemini: Filtered ${allPatientData.length} total patients down to ${relevantPatients.length} relevant patients for query: "${message}"`);

      // Build prompt context
      const promptContext: PromptContext = {
        relevantPatients,
        chatHistory,
        message
      };

      // Use shared prompt engineering
      const fullPrompt = buildFullPrompt(promptContext);

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