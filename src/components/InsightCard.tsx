'use client';

import React from 'react';
import { InsightCard as InsightCardType, PRIORITY_COLORS, INSIGHT_TYPE_COLORS, TIMEFRAME_URGENCY } from '@/types';

interface InsightCardProps {
  insight: InsightCardType;
  onAction?: (action: string, insight: InsightCardType) => void;
}

const InsightCard: React.FC<InsightCardProps> = ({ insight, onAction }) => {
  const priorityClass = PRIORITY_COLORS[insight.priority];
  const typeClass = INSIGHT_TYPE_COLORS[insight.type];
  const timeframeText = TIMEFRAME_URGENCY[insight.timeframe];

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'risk_alert':
        return '⚠️';
      case 'follow_up':
        return '📅';
      case 'medication':
        return '💊';
      case 'care_coordination':
        return '🤝';
      default:
        return '📋';
    }
  };

  const getConfidenceColor = (confidence: string) => {
    switch (confidence) {
      case 'high':
        return 'text-green-600';
      case 'medium':
        return 'text-yellow-600';
      case 'low':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className={`rounded-lg border-2 p-4 mb-4 ${typeClass} transition-all duration-200 hover:shadow-md`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-2">
          <span className="text-lg">{getTypeIcon(insight.type)}</span>
          <h3 className="font-semibold text-gray-900">{insight.title}</h3>
        </div>
        <div className="flex flex-col items-end space-y-1">
          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${priorityClass}`}>
            {insight.priority.toUpperCase()}
          </span>
          <span className="text-xs text-gray-500">{timeframeText}</span>
        </div>
      </div>

      {/* Patient Info */}
      <div className="mb-3">
        <span className="text-sm font-medium text-gray-700">Patient: </span>
        <span className="text-sm text-gray-900">{insight.patient}</span>
      </div>

      {/* Recommendation */}
      <div className="mb-3">
        <h4 className="text-sm font-medium text-gray-700 mb-1">Recommendation:</h4>
        <p className="text-sm text-gray-900 leading-relaxed">{insight.recommendation}</p>
      </div>

      {/* Reasoning */}
      <div className="mb-3">
        <h4 className="text-sm font-medium text-gray-700 mb-1">Clinical Reasoning:</h4>
        <p className="text-sm text-gray-600 leading-relaxed">{insight.reasoning}</p>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-200">
        <div className="flex items-center space-x-2">
          <span className="text-xs text-gray-500">Confidence:</span>
          <span className={`text-xs font-medium ${getConfidenceColor(insight.confidence)}`}>
            {insight.confidence.toUpperCase()}
          </span>
        </div>
        
        {onAction && (
          <div className="flex space-x-2">
            <button
              onClick={() => onAction('acknowledge', insight)}
              className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
            >
              Acknowledge
            </button>
            <button
              onClick={() => onAction('schedule', insight)}
              className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors"
            >
              Schedule
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default InsightCard;
