"use client";

import React from "react";
import { ChatMessage as ChatMessageType } from "@/types";
import InsightCard from "./InsightCard";

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
        {/* Insight cards for assistant messages (show above message) */}
        {!isUser && message.insights && message.insights.length > 0 && (
          <div className="space-y-3 mb-3">
            {message.insights.map((insight, index) => (
              <InsightCard
                key={`${message.id}-insight-${index}`}
                insight={insight}
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
