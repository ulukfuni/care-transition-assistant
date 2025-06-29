import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { DischargeSummary } from "@/types";

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
  try {
    const { message, patientIds } = await request.json();

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

    // Get relevant patient data
    const allPatients = await getPatientData();
    let relevantPatients = allPatients;
    if (patientIds && patientIds.length > 0) {
      relevantPatients = allPatients.filter((patient) =>
        patientIds.includes(patient.id)
      );
    }

    // Create system prompt for healthcare insights
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
${JSON.stringify(relevantPatients, null, 2)}`;

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
}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
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
    } catch {
      // If JSON parsing fails, create a fallback response
      parsedResponse = {
        insights: [
          {
            type: "general",
            title: "Analysis Complete",
            patient: "Multiple patients",
            priority: "medium",
            recommendation: responseContent,
            reasoning: "AI analysis of patient data",
            confidence: "medium",
            timeframe: "routine",
          },
        ],
        summary: "Analysis completed successfully",
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

    // Provide more specific error messages
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
