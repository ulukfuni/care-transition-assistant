import { GoogleGenerativeAI, GenerativeModel } from "@google/generative-ai";
import { DischargeSummary, ChatMessage } from "@/types";
import { getRelevantPatients } from "./patientFilter";

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

      // Get the last 10 messages for context
      const recentMessages = chatHistory.slice(-10);
      const conversationContext = recentMessages.length > 0 
        ? `\n\nConversation History (Last ${recentMessages.length} messages):\n${recentMessages.map(msg => `${msg.role}: ${msg.content}`).join('\n')}`
        : '';

      const systemPrompt = `You are an expert healthcare AI assistant specializing in care transition management. Your role is to analyze patient discharge summaries and provide actionable insights for healthcare providers.

Key responsibilities:
1. Identify high-risk patients who may need immediate attention
2. Suggest appropriate follow-up care and interventions
3. Flag potential medication issues or drug interactions
4. Recommend care coordination strategies
5. Assess readmission risk factors
6. Suggest specific next steps for each patient's care journey

When analyzing patient data, consider:
- Medical complexity and comorbidities
- Social determinants of health
- Medication compliance risks
- Follow-up care requirements
- Discharge disposition appropriateness
- Care transition gaps and opportunities

Always provide specific, actionable recommendations with clear reasoning. For each insight, include concrete next steps that should be taken for the patient's care. Format your response as structured insights that can be displayed as cards.

RESPONSE GUIDELINES:
- If the user is asking for patient analysis, risk assessment, specific insights, or care recommendations → Generate insights (response_type: "insights")
- If the user is asking general questions, clarifications, or making statements → Provide simple text response (response_type: "text")
- If the user is asking follow-up questions about previous insights → Reference previous insights in text response (response_type: "text")
- If the user is asking for both analysis and general information → Provide both (response_type: "mixed")

Examples of when to generate insights:
- "Analyze readmission risk for all patients"
- "Show me medication issues"
- "Which patients need immediate follow-up?"
- "Identify care coordination opportunities"

Examples of when to provide simple text response:
- "How does this system work?"
- "Can you explain what you mean by that?"
- "Thanks for the help"
- "What are your capabilities?"

NEXT STEPS GUIDANCE:
When generating insights, always include specific next steps for each patient such as:
- Immediate actions (within 24 hours): Phone calls, medication reconciliation, home health referrals
- Short-term follow-up (within 1 week): Specialist appointments, lab tests, care coordination meetings
- Medium-term planning (within 1 month): Ongoing monitoring, medication adjustments, social work involvement
- Long-term care planning: Chronic disease management, preventive care, family education

Use the conversation history to provide context-aware responses and build upon previous insights when relevant.${conversationContext}

IMPORTANT: You are analyzing ${relevantPatients.length} patient(s) that were specifically selected based on the user's query. Focus your analysis on these patients and their specific needs.

Patient Data Context:
${JSON.stringify(relevantPatients, null, 2)}`;

      const userPrompt = `${message}

Please analyze the user's request and respond appropriately. Structure your response as JSON with one of the following formats:

For insights (response_type: "insights"):
{
  "response_type": "insights",
  "insights": [
    {
      "type": "risk_alert" | "follow_up" | "medication" | "care_coordination" | "general",
      "title": "Brief title",
      "patient": "Patient name or 'Multiple patients'",
      "priority": "high" | "medium" | "low",
      "recommendation": "Specific actionable recommendation with concrete next steps (e.g., 'Schedule cardiology follow-up within 7 days, arrange home health for medication management, coordinate with social work for transportation assistance')",
      "reasoning": "Clinical reasoning behind the recommendation",
      "confidence": "high" | "medium" | "low",
      "timeframe": "immediate" | "within_24h" | "within_week" | "routine"
    }
  ],
  "summary": "Brief overall summary of key findings and next steps"
}

For simple text response (response_type: "text"):
{
  "response_type": "text",
  "content": "Your helpful response to the user's question or statement"
}

For mixed response (response_type: "mixed"):
{
  "response_type": "mixed",
  "content": "General response or explanation",
  "insights": [...],
  "summary": "Brief summary of insights"
}

IMPORTANT: 
- Respond ONLY with valid JSON. Do not include any other text or formatting.
- When generating insights, always include specific, actionable next steps in the recommendation field.
- Next steps should be concrete and time-bound (e.g., "Call patient within 24 hours", "Schedule appointment within 1 week").`;

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