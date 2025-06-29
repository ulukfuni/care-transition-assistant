'use client';

import React, { useState } from 'react';
import { PRIORITY_COLORS, INSIGHT_TYPE_COLORS, TIMEFRAME_URGENCY, GroupedInsight } from '@/types';

interface GroupedInsightCardProps {
  groupedInsight: GroupedInsight;
  onAction?: (action: string, insight: GroupedInsight) => void;
}

const GroupedInsightCard: React.FC<GroupedInsightCardProps> = ({ groupedInsight, onAction }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const priorityClass = PRIORITY_COLORS[groupedInsight.priority];
  const typeClass = INSIGHT_TYPE_COLORS[groupedInsight.type];
  const timeframeText = TIMEFRAME_URGENCY[groupedInsight.timeframe];

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

  const hasMultipleInsights = groupedInsight.insights.length > 1;

  return (
    <div className={`rounded-lg border-2 p-4 mb-4 ${typeClass} transition-all duration-200 hover:shadow-md`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-2">
          <span className="text-lg">{getTypeIcon(groupedInsight.type)}</span>
          <h3 className="font-semibold text-gray-900">{groupedInsight.title}</h3>
          {hasMultipleInsights && (
            <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">
              {groupedInsight.insights.length} insights
            </span>
          )}
        </div>
        <div className="flex flex-col items-end space-y-1">
          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${priorityClass}`}>
            {groupedInsight.priority.toUpperCase()}
          </span>
          <span className="text-xs text-gray-500">{timeframeText}</span>
        </div>
      </div>

      {/* Patient Info */}
      <div className="mb-3">
        <span className="text-sm font-medium text-gray-700">Patient: </span>
        <span className="text-sm text-gray-900">{groupedInsight.patient}</span>
      </div>

      {/* Recommendations */}
      <div className="mb-3">
        <h4 className="text-sm font-medium text-gray-700 mb-1">Recommendations:</h4>
        {hasMultipleInsights ? (
          <div>
            {isExpanded ? (
              // Show all individual insights when expanded
              <div className="space-y-2">
                {groupedInsight.insights.map((insight, index) => (
                  <div key={index} className="pl-4 border-l-2 border-gray-200">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="text-xs font-medium text-gray-600">{insight.title}</span>
                      <span className={`px-1 py-0.5 rounded text-xs ${PRIORITY_COLORS[insight.priority]}`}>
                        {insight.priority}
                      </span>
                    </div>
                    <p className="text-sm text-gray-900 leading-relaxed">{insight.recommendation}</p>
                    <p className="text-xs text-gray-600 mt-1">{insight.reasoning}</p>
                  </div>
                ))}
              </div>
            ) : (
              // Show collapsed view with summary
              <div>
                <p className="text-sm text-gray-900 leading-relaxed">
                  {groupedInsight.insights.slice(0, 2).map(insight => insight.recommendation).join('. ')}
                  {groupedInsight.insights.length > 2 && '...'}
                </p>
                <button
                  onClick={() => setIsExpanded(true)}
                  className="text-xs text-blue-600 hover:text-blue-800 mt-1 underline"
                >
                  Show all {groupedInsight.insights.length} recommendations
                </button>
              </div>
            )}
          </div>
        ) : (
          // Single insight - show normally
          <p className="text-sm text-gray-900 leading-relaxed">{groupedInsight.recommendation}</p>
        )}
      </div>

      {/* Reasoning - only show for single insights or when expanded */}
      {(!hasMultipleInsights || isExpanded) && (
        <div className="mb-3">
          <h4 className="text-sm font-medium text-gray-700 mb-1">Clinical Reasoning:</h4>
          <p className="text-sm text-gray-600 leading-relaxed">{groupedInsight.reasoning}</p>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-200">
        <div className="flex items-center space-x-2">
          <span className="text-xs text-gray-500">Confidence:</span>
          <span className={`text-xs font-medium ${getConfidenceColor(groupedInsight.confidence)}`}>
            {groupedInsight.confidence.toUpperCase()}
          </span>
        </div>
        
        <div className="flex space-x-2">
          {isExpanded && hasMultipleInsights && (
            <button
              onClick={() => setIsExpanded(false)}
              className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
            >
              Collapse
            </button>
          )}
          
          {onAction && (
            <>
              <button
                onClick={() => onAction('acknowledge', groupedInsight)}
                className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
              >
                Acknowledge
              </button>
              <button
                onClick={() => onAction('schedule', groupedInsight)}
                className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors"
              >
                Schedule
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default GroupedInsightCard; 