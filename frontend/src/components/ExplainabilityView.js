import React from 'react';
import { motion } from 'framer-motion';
import { Brain, CheckCircle, AlertTriangle, ExternalLink, Shield } from 'lucide-react';
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
        {/* Confidence Metrics */}
        {result.agreement_score !== undefined && (
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
              <div className="text-xs font-semibold uppercase tracking-wider text-blue-900 mb-1">
                Model Agreement
              </div>
              <div className="text-xl font-bold cabinet-grotesk text-blue-900">
                {result.agreement_score?.toFixed(0)}%
              </div>
            </div>
            {result.confidence_interval && (
              <div className="bg-gray-50 border border-gray-200 rounded-md p-3">
                <div className="text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">
                  Confidence Interval
                </div>
                <div className="text-sm font-bold cabinet-grotesk">
                  {result.confidence_interval.lower?.toFixed(0)}% - {result.confidence_interval.upper?.toFixed(0)}%
                </div>
              </div>
            )}
          </div>
        )}

        {/* Main Explanation */}
        <div className="p-4 bg-gray-50 rounded-md border border-gray-200">
          <p className="text-sm text-gray-700 leading-relaxed">
            {result.explanation || 'No detailed explanation available.'}
          </p>
        </div>

        {/* Extracted Claims */}
        {result.extracted_claims && result.extracted_claims.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-gray-500 mb-3 flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Extracted Claims & Verification
            </h4>
            <div className="space-y-2">
              {result.extracted_claims.map((claim, index) => (
                <div
                  key={index}
                  className="p-4 bg-white border border-gray-200 rounded-md"
                  data-testid={`extracted-claim-${index}`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${
                      claim.verification?.wikipedia_found ? 'bg-green-500' : 'bg-gray-300'
                    }`} />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 mb-1">{claim.claim}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs text-gray-500 capitalize">{claim.type}</span>
                        <span className="text-gray-300">·</span>
                        <span className="text-xs text-gray-500 capitalize">{claim.importance} importance</span>
                      </div>
                      {claim.verification?.sources?.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-gray-100 space-y-2">
                          {claim.verification.sources.slice(0, 2).map((src, i) => (
                            <a
                              key={i}
                              href={src.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-start gap-2 text-xs text-blue-900 hover:underline"
                              data-testid={`claim-source-${index}-${i}`}
                            >
                              <ExternalLink className="w-3 h-3 mt-0.5 flex-shrink-0" />
                              <div>
                                <p className="font-medium">{src.title}</p>
                                <p className="text-gray-500">{src.description?.substring(0, 100)}</p>
                              </div>
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Source Verification Summary */}
        {result.source_verification && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-md">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-4 h-4 text-green-700" />
              <span className="text-sm font-semibold text-green-900">Source Verification</span>
            </div>
            <p className="text-xs text-green-800">
              {result.source_verification.verified} of {result.source_verification.total_claims} claims verified via Wikipedia
              ({result.source_verification.verification_rate?.toFixed(0)}% verification rate)
            </p>
          </div>
        )}

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
                  {Object.entries(result.ai_provider_analysis).map(([provider, analysis]) => {
                    if (provider === 'technical_analysis' || provider === 'frame_analyses' || provider === 'suspicious_frames' || provider === 'total_frames_analyzed') return null;

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
