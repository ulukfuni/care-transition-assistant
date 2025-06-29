"use client";

import React from "react";
import { useChat } from "@/hooks/useChat";
import { usePatients } from "@/hooks/usePatients";
import ChatInterface from "@/components/ChatInterface";
import PatientSelector from "@/components/PatientSelector";
import LoadingSpinner from "@/components/LoadingSpinner";

export default function Home() {
  const {
    messages,
    isLoading: chatLoading,
    error: chatError,
    sendMessage,
  } = useChat();

  const {
    patients,
    selectedPatients,
    isLoading: patientsLoading,
    error: patientsError,
    updateSelectedPatients,
  } = usePatients();

  const handleSendMessage = async (message: string) => {
    await sendMessage(message, selectedPatients);
  };

  if (patientsLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading patient data..." />
      </div>
    );
  }

  if (patientsError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 mb-4">
            <svg
              className="w-12 h-12 mx-auto"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 19.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Error Loading Data
          </h2>
          <p className="text-gray-600 mb-4">{patientsError}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  Care Transition Assistant
                </h1>
                <p className="text-sm text-gray-500">
                  AI-powered insights for healthcare transitions
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                <span className="font-medium">{patients.length}</span> patients
                loaded
              </div>
              <div className="text-sm text-gray-600">
                <span className="font-medium">{selectedPatients.length}</span>{" "}
                selected
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-140px)]">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <PatientSelector
              patients={patients}
              selectedPatients={selectedPatients}
              onSelectionChange={updateSelectedPatients}
            />

            {/* Quick Stats */}
            <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <h3 className="font-medium text-gray-900 mb-3">Quick Stats</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">High Risk:</span>
                  <span className="font-medium text-red-600">
                    {patients.filter((p) => p.risk_factors.length >= 3).length}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Medium Risk:</span>
                  <span className="font-medium text-yellow-600">
                    {patients.filter((p) => p.risk_factors.length === 2).length}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Low Risk:</span>
                  <span className="font-medium text-green-600">
                    {patients.filter((p) => p.risk_factors.length <= 1).length}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Chat Interface */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 h-full">
              <ChatInterface
                messages={messages}
                onSendMessage={handleSendMessage}
                isLoading={chatLoading}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Error Toast */}
      {chatError && (
        <div className="fixed bottom-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg shadow-lg">
          <div className="flex items-center">
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span className="text-sm">{chatError}</span>
          </div>
        </div>
      )}
    </div>
  );
}
