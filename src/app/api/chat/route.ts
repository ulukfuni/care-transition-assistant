import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { DischargeSummary, ChatMessage } from "@/types";
import { mockInsightsResponse } from "@/utils/mockData";
import { GeminiClient } from "@/utils/geminiClient";
import { getRelevantPatients } from "@/utils/patientFilter";

// Import the transformed data from the discharges API
async function getPatientData(): Promise<DischargeSummary[]> {
  // In a real application, this would be a database call
  // For now, we'll fetch from our own API endpoint
  const response = await fetch(
    `${
      process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
    }/api/discharges`
  );
  const data = await response.json();
  return data.success ? data.data : [];
}

export async function POST(request: NextRequest) {
  let message = "";
  let relevantPatients: DischargeSummary[] = [];
  let chatHistory: ChatMessage[] = [];
  
  try {
    const { message: requestMessage, patientIds, chatHistory: requestChatHistory } = await request.json();
    message = requestMessage;
    chatHistory = requestChatHistory || [];

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        {
          success: false,
          error: "OpenAI API key not configured",
          timestamp: new Date().toISOString(),
        },
        { status: 500 }
      );
    }

    // Initialize OpenAI client
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    // Get all patient data
    const allPatients = await getPatientData();
    
    // Filter patients based on user message and any specific patient IDs
    if (patientIds && patientIds.length > 0) {
      // If specific patient IDs are provided, use those
      relevantPatients = allPatients.filter((patient) =>
        patientIds.includes(patient.id)
      );
    } else {
      // Otherwise, use intelligent filtering based on the user message
      relevantPatients = getRelevantPatients(allPatients, message);
    }

    console.log(`Filtered ${allPatients.length} total patients down to ${relevantPatients.length} relevant patients for query: "${message}"`);

    // Get the last 10 messages for context
    const recentMessages = chatHistory.slice(-10);
    const conversationContext = recentMessages.length > 0 
      ? `\n\nConversation History (Last ${recentMessages.length} messages):\n${recentMessages.map(msg => `${msg.role}: ${msg.content}`).join('\n')}`
      : '';

    // Create system prompt for healthcare insights
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

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.3,
      max_tokens: 2000,
    });

    const responseContent = completion.choices[0]?.message?.content;

    if (!responseContent) {
      throw new Error("No response from OpenAI");
    }

    // Try to parse the JSON response
    let parsedResponse;
    try {
      parsedResponse = JSON.parse(responseContent);
      
      // Ensure the response has the correct format
      if (!parsedResponse.response_type) {
        // Legacy format - convert to new format
        parsedResponse = {
          response_type: "insights",
          insights: parsedResponse.insights || [],
          summary: parsedResponse.summary || "Analysis completed"
        };
      }
    } catch {
      // If JSON parsing fails, create a fallback response
      parsedResponse = {
        response_type: "text",
        content: responseContent || "I apologize, but I couldn't process your request properly. Please try again."
      };
    }

    return NextResponse.json({
      success: true,
      data: parsedResponse,
      usage: completion.usage,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error in chat API:", error);

    // Check if it's a quota/API error and try Gemini as fallback
    if (error instanceof Error && (
      error.message.includes("quota") || 
      error.message.includes("429") || 
      error.message.includes("insufficient_quota") ||
      error.message.includes("rate limit")
    )) {
      console.log("OpenAI API quota exceeded - trying Gemini as fallback");
      
      try {
        // Try Gemini API with chat history
        const geminiClient = new GeminiClient();
        const geminiResponse = await geminiClient.generateInsights(message, relevantPatients, chatHistory);
        
        return NextResponse.json({
          success: true,
          data: geminiResponse,
          usage: { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 },
          timestamp: new Date().toISOString(),
          note: "Response generated using Gemini API due to OpenAI quota limits"
        });
      } catch (geminiError) {
        console.error("Gemini API also failed:", geminiError);
        console.log("Falling back to mock data");
        
        // Fall back to mock data if Gemini also fails
        return NextResponse.json({
          success: true,
          data: mockInsightsResponse,
          usage: { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 },
          timestamp: new Date().toISOString(),
          note: "Mock data returned due to API quota limits"
        });
      }
    }

    // Provide more specific error messages for other errors
    let errorMessage = "Failed to process chat request";
    if (error instanceof Error) {
      if (error.message.includes("API key")) {
        errorMessage = "OpenAI API key is invalid or missing";
      } else if (error.message.includes("quota")) {
        errorMessage = "OpenAI API quota exceeded";
      } else if (error.message.includes("rate limit")) {
        errorMessage = "Rate limit exceeded, please try again later";
      }
    }

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
