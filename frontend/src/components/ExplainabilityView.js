import React from 'react';
import { motion } from 'framer-motion';
import { Brain, CheckCircle, AlertTriangle } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';

const ExplainabilityView = ({ result }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="bg-white border border-gray-200 rounded-lg p-6"
      data-testid="explainability-view"
    >
      <div className="flex items-center gap-2 mb-4">
        <Brain className="w-5 h-5 text-blue-900" />
        <h3 className="text-lg font-semibold cabinet-grotesk">AI Explanation</h3>
      </div>

      <div className="space-y-4">
        {/* Main Explanation */}
        <div className="p-4 bg-gray-50 rounded-md">
          <p className="text-sm text-gray-700 leading-relaxed">
            {result.explanation || 'No detailed explanation available.'}
          </p>
        </div>

        {/* Highlighted Segments */}
        {result.highlighted_segments && result.highlighted_segments.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-gray-500 mb-3">
              Suspicious Elements
            </h4>
            <div className="space-y-2">
              {result.highlighted_segments.map((segment, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-3 bg-yellow-50 border border-yellow-200 rounded-md"
                  data-testid={`highlighted-segment-${index}`}
                >
                  <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{segment.text}</p>
                    <p className="text-xs text-gray-600 mt-1">{segment.reason}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* AI Provider Analysis */}
        {result.ai_provider_analysis && (
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="providers">
              <AccordionTrigger data-testid="provider-analysis-toggle">
                <span className="text-sm font-semibold">Detailed AI Provider Analysis</span>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-3 pt-2">
                  {Object.entries(result.ai_provider_analysis).map(([provider, analysis], index) => {
                    if (provider === 'technical_analysis') return null;
                    
                    return (
                      <div
                        key={provider}
                        className="p-3 bg-gray-50 rounded-md border border-gray-200"
                        data-testid={`provider-${provider}`}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <CheckCircle className="w-4 h-4 text-blue-900" />
                          <span className="text-sm font-semibold capitalize">{provider}</span>
                        </div>
                        <pre className="text-xs text-gray-600 whitespace-pre-wrap overflow-auto max-h-40">
                          {JSON.stringify(analysis, null, 2)}
                        </pre>
                      </div>
                    );
                  })}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        )}
      </div>
    </motion.div>
  );
};

export default ExplainabilityView;