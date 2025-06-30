'use client';

import { useState, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { ChatMessage, ChatResponse, ApiResponse } from '@/types';

export const useChat = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = useCallback(async (
    content: string, 
    patientIds?: number[],
    context?: string
  ) => {
    if (!content.trim()) return;

    setIsLoading(true);
    setError(null);

    // Add user message
    const userMessage: ChatMessage = {
      id: uuidv4(),
      role: 'user',
      content,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: content,
          patientIds,
          context,
          chatHistory: messages,
        }),
      });

      const data: ApiResponse<ChatResponse> = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to get response');
      }

      if (!data.data) {
        throw new Error('No data received from API');
      }

      // Add assistant message with insights
      const assistantMessage: ChatMessage = {
        id: uuidv4(),
        role: 'assistant',
        content: data.data.response_type === 'text' 
          ? data.data.content || 'Response received.'
          : data.data.summary || 'Analysis complete. Please see the insights below.',
        timestamp: new Date(),
        insights: data.data.insights || [],
      };

      setMessages(prev => [...prev, assistantMessage]);

    } catch (err) {
      console.error('Chat error:', err);
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMessage);

      // Add error message
      const errorChatMessage: ChatMessage = {
        id: uuidv4(),
        role: 'assistant',
        content: `I apologize, but I encountered an error: ${errorMessage}. Please try again or check your OpenAI API configuration.`,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, errorChatMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [messages]);

  const clearMessages = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  const removeMessage = useCallback((messageId: string) => {
    setMessages(prev => prev.filter(msg => msg.id !== messageId));
  }, []);

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    clearMessages,
    removeMessage,
  };
};
