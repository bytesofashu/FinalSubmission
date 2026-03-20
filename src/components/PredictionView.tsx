import React from 'react';
import { Activity, History, AlertCircle, CheckCircle2, Info, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { HeartPrediction } from '../lib/gemini';

interface PredictionViewProps {
  prediction: HeartPrediction | null;
  isPredicting: boolean;
  hasHealthData: boolean;
}

export function PredictionView({ prediction, isPredicting, hasHealthData }: PredictionViewProps) {
  return (
    <section className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-50 rounded-xl">
            <Activity className="w-6 h-6 text-indigo-600" aria-hidden="true" />
          </div>
          <h2 className="text-2xl font-bold">Twin Prediction</h2>
        </div>
        {isPredicting && (
          <div className="flex items-center gap-2 text-indigo-600 font-medium animate-pulse" role="status">
            <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
            AI is thinking...
          </div>
        )}
      </div>

      {prediction ? (
        <div className="space-y-8">
          <div className="p-6 bg-indigo-50 rounded-2xl border border-indigo-100">
            <div className="flex items-center gap-2 text-indigo-700 font-bold mb-3 uppercase tracking-wider text-xs">
              <History className="w-4 h-4" aria-hidden="true" />
              Health Timeline
            </div>
            <p className="text-lg leading-relaxed text-indigo-900">{prediction.timeline}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 bg-amber-50 rounded-2xl border border-amber-100">
              <div className="flex items-center gap-2 text-amber-700 font-bold mb-3 uppercase tracking-wider text-xs">
                <AlertCircle className="w-4 h-4" aria-hidden="true" />
                Risk Warnings
              </div>
              <p className="text-amber-900">{prediction.warning}</p>
            </div>
            <div className="p-6 bg-emerald-50 rounded-2xl border border-emerald-100">
              <div className="flex items-center gap-2 text-emerald-700 font-bold mb-3 uppercase tracking-wider text-xs">
                <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
                Recommendations
              </div>
              <div className="text-emerald-900 prose prose-sm max-w-none">
                <ReactMarkdown>{prediction.recommendations}</ReactMarkdown>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
          <Info className="w-12 h-12 text-gray-300 mx-auto mb-4" aria-hidden="true" />
          <p className="text-gray-500 font-medium">
            {hasHealthData 
              ? "Generating your digital twin prediction..." 
              : "Complete your health profile to generate your digital twin prediction."}
          </p>
        </div>
      )}
    </section>
  );
}
