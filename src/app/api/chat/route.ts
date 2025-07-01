import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { DischargeSummary, ChatMessage } from "@/types";
import { mockInsightsResponse } from "@/utils/mockData";
import { GeminiClient } from "@/utils/geminiClient";
import { getRelevantPatients } from "@/utils/patientFilter";
import { buildSystemPrompt, buildUserPrompt, PromptContext } from "@/utils/promptEngineering";

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

    // Build prompt context
    const promptContext: PromptContext = {
      relevantPatients,
      chatHistory,
      message
    };

    // Determine which LLM to use based on available API keys
    const hasOpenAIKey = !!process.env.OPENAI_API_KEY;
    const hasGeminiKey = !!process.env.GEMINI_API_KEY;

    let parsedResponse;
    let llmProvider = "unknown";
    let usage = { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 };

    if (hasOpenAIKey) {
      // Try OpenAI first
      try {
        console.log("Using OpenAI for LLM processing");
        const openai = new OpenAI({
          apiKey: process.env.OPENAI_API_KEY,
        });

        const completion = await openai.chat.completions.create({
          model: "gpt-3.5-turbo",
          messages: [
            { role: "system", content: buildSystemPrompt(promptContext) },
            { role: "user", content: buildUserPrompt(promptContext) },
          ],
          temperature: 0.3,
          max_tokens: 2000,
        });

        const responseContent = completion.choices[0]?.message?.content;

        if (!responseContent) {
          throw new Error("No response from OpenAI");
        }

        // Try to parse the JSON response
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

        llmProvider = "openai";
        usage = completion.usage || usage;

      } catch (openaiError) {
        console.error("OpenAI API error:", openaiError);
        
        // If OpenAI fails and Gemini is available, try Gemini as fallback
        if (hasGeminiKey) {
          console.log("OpenAI failed, trying Gemini as fallback");
          try {
            const geminiClient = new GeminiClient();
            const geminiResponse = await geminiClient.generateInsights(message, relevantPatients, chatHistory);
            
            parsedResponse = geminiResponse;
            llmProvider = "gemini_fallback";
            
          } catch (geminiError) {
            console.error("Gemini API also failed:", geminiError);
            throw openaiError; // Re-throw the original OpenAI error
          }
        } else {
          throw openaiError;
        }
      }
    } else if (hasGeminiKey) {
      // Use Gemini if OpenAI is not available
      try {
        console.log("Using Gemini for LLM processing");
        const geminiClient = new GeminiClient();
        const geminiResponse = await geminiClient.generateInsights(message, relevantPatients, chatHistory);
        
        parsedResponse = geminiResponse;
        llmProvider = "gemini";
        
      } catch (geminiError) {
        console.error("Gemini API error:", geminiError);
        throw geminiError;
      }
    } else {
      // No API keys available, return mock data
      console.log("No API keys available, using mock data");
      parsedResponse = mockInsightsResponse;
      llmProvider = "mock";
    }

    return NextResponse.json({
      success: true,
      data: parsedResponse,
      usage,
      timestamp: new Date().toISOString(),
      llm_provider: llmProvider,
    });

  } catch (error) {
    console.error("Error in chat API:", error);

    // Provide more specific error messages for different scenarios
    let errorMessage = "Failed to process chat request";
    if (error instanceof Error) {
      if (error.message.includes("API key")) {
        errorMessage = "API key is invalid or missing";
      } else if (error.message.includes("quota")) {
        errorMessage = "API quota exceeded";
      } else if (error.message.includes("rate limit")) {
        errorMessage = "Rate limit exceeded, please try again later";
      } else if (error.message.includes("No API keys available")) {
        errorMessage = "No LLM API keys configured. Please set OPENAI_API_KEY or GEMINI_API_KEY in your environment variables.";
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
