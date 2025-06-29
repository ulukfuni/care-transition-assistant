"use client";

import React from "react";
import { ChatMessage as ChatMessageType } from "@/types";
import GroupedInsightCard from "./GroupedInsightCard";
import { groupInsightsByPatient } from "@/utils/insightGrouping";

interface ChatMessageProps {
  message: ChatMessageType;
  onInsightAction?: (action: string, insight: unknown) => void;
}

const ChatMessage: React.FC<ChatMessageProps> = ({
  message,
  onInsightAction,
}) => {
  const isUser = message.role === "user";
  const timestamp = new Date(message.timestamp).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  // Group insights by patient if they exist
  const groupedInsights = message.insights ? groupInsightsByPatient(message.insights) : [];

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-4`}>
      {/* Avatar */}
      <div
        className={`flex-shrink-0 ${isUser ? "order-2 ml-3" : "order-1 mr-3"}`}
      >
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
            isUser ? "bg-blue-600 text-white" : "bg-gray-300 text-gray-700"
          }`}
        >
          {isUser ? "U" : "AI"}
        </div>
      </div>

      <div className={`max-w-3xl ${isUser ? "order-1" : "order-2"}`}>
        {/* Grouped insight cards for assistant messages (show above message) */}
        {!isUser && groupedInsights.length > 0 && (
          <div className="space-y-3 mb-3">
            {groupedInsights.map((groupedInsight, index) => (
              <GroupedInsightCard
                key={`${message.id}-grouped-insight-${index}`}
                groupedInsight={groupedInsight}
                onAction={onInsightAction}
              />
            ))}
          </div>
        )}

        {/* Message bubble */}
        <div
          className={`rounded-lg px-4 py-3 ${
            isUser
              ? "bg-blue-600 text-white ml-auto"
              : "bg-gray-100 text-gray-900"
          }`}
        >
          <p className="text-sm leading-relaxed whitespace-pre-wrap">
            {message.content}
          </p>
          <div
            className={`text-xs mt-2 ${
              isUser ? "text-blue-100" : "text-gray-500"
            }`}
          >
            {timestamp}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
