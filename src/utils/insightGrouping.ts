import { InsightCard, GroupedInsight } from "@/types";

export function groupInsightsByPatient(insights: InsightCard[]): GroupedInsight[] {
  const groupedMap = new Map<string, InsightCard[]>();

  // Group insights by patient name
  insights.forEach(insight => {
    const patientName = insight.patient;
    if (!groupedMap.has(patientName)) {
      groupedMap.set(patientName, []);
    }
    groupedMap.get(patientName)!.push(insight);
  });

  // Convert grouped insights to GroupedInsight format
  const groupedInsights: GroupedInsight[] = [];

  groupedMap.forEach((patientInsights, patientName) => {
    if (patientInsights.length === 1) {
      // Single insight - keep as is
      const insight = patientInsights[0];
      groupedInsights.push({
        patient: patientName,
        insights: patientInsights,
        priority: insight.priority,
        type: insight.type,
        confidence: insight.confidence,
        timeframe: insight.timeframe,
        title: insight.title,
        recommendation: insight.recommendation,
        reasoning: insight.reasoning
      });
    } else {
      // Multiple insights - combine them
      const highestPriority = getHighestPriority(patientInsights.map(i => i.priority));
      const mostUrgentTimeframe = getMostUrgentTimeframe(patientInsights.map(i => i.timeframe));
      const highestConfidence = getHighestConfidence(patientInsights.map(i => i.confidence));
      
      // Create a combined title
      const title = `${patientInsights.length} Recommendations for ${patientName}`;
      
      // Combine recommendations
      const recommendations = patientInsights.map(insight => 
        `• ${insight.recommendation}`
      ).join('\n');
      
      // Combine reasoning
      const reasoning = patientInsights.map(insight => 
        `${insight.title}: ${insight.reasoning}`
      ).join('\n\n');

      groupedInsights.push({
        patient: patientName,
        insights: patientInsights,
        priority: highestPriority,
        type: "general", // Use general for combined insights
        confidence: highestConfidence,
        timeframe: mostUrgentTimeframe,
        title,
        recommendation: recommendations,
        reasoning
      });
    }
  });

  return groupedInsights;
}

function getHighestPriority(priorities: ("high" | "medium" | "low")[]): "high" | "medium" | "low" {
  if (priorities.includes("high")) return "high";
  if (priorities.includes("medium")) return "medium";
  return "low";
}

function getMostUrgentTimeframe(timeframes: ("immediate" | "within_24h" | "within_week" | "routine")[]): "immediate" | "within_24h" | "within_week" | "routine" {
  if (timeframes.includes("immediate")) return "immediate";
  if (timeframes.includes("within_24h")) return "within_24h";
  if (timeframes.includes("within_week")) return "within_week";
  return "routine";
}

function getHighestConfidence(confidences: ("high" | "medium" | "low")[]): "high" | "medium" | "low" {
  if (confidences.includes("high")) return "high";
  if (confidences.includes("medium")) return "medium";
  return "low";
} 