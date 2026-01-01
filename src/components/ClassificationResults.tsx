import { useState } from 'react';
import { CheckCircle, Package, MapPin, DollarSign, FileText, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';

export interface ClassificationResultData {
  hts: string;
  confidence: number;
  description: string;
  tariff_rate?: number;
  tariff_amount?: number;
  total_cost?: number;
  alternate_classification?: string;
  reasoning?: string;
  rulings?: any;
  parsed_data?: {
    product_name?: string;
    product_description?: string;
    country_of_origin?: string;
    materials?: any;
    unit_cost?: number;
    vendor?: string;
  };
}

interface ClassificationResultsProps {
  result: ClassificationResultData;
  onApprove?: () => void;
  onReviewLater?: () => void;
}

export function ClassificationResults({ result, onApprove, onReviewLater }: ClassificationResultsProps) {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-6 py-4 border-b border-slate-200 rounded-t-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-600 rounded-lg">
              <CheckCircle className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-slate-900 font-semibold">Classification Complete</h3>
              <p className="text-slate-600 text-sm">HTS code and rulings have been generated</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              result.confidence >= 95 
                ? 'bg-green-100 text-green-700' 
                : result.confidence >= 85 
                ? 'bg-amber-100 text-amber-700' 
                : 'bg-red-100 text-red-700'
            }`}>
              {result.confidence}% Confidence
            </span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6 space-y-6">
        {/* HTS Classification */}
        <div className="bg-green-50 border-2 border-green-300 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-green-900 font-semibold text-lg">HTS Classification</h4>
            <div className="text-green-700 text-sm">Primary Classification</div>
          </div>
          <div className="text-green-800 text-2xl font-mono mb-2">{result.hts}</div>
          <p className="text-green-700 text-sm mb-4">{result.description}</p>
          
          {result.tariff_rate !== null && result.tariff_rate !== undefined && (
            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-green-200">
              <div>
                <div className="text-green-600 text-xs mb-1">Tariff Rate</div>
                <div className="text-green-900 font-semibold">
                  {(result.tariff_rate * 100).toFixed(2)}%
                </div>
              </div>
              {result.tariff_amount !== null && result.tariff_amount !== undefined && (
                <div>
                  <div className="text-green-600 text-xs mb-1">Tariff Amount</div>
                  <div className="text-green-900 font-semibold">
                    ${result.tariff_amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                </div>
              )}
              {result.total_cost !== null && result.total_cost !== undefined && (
                <div>
                  <div className="text-green-600 text-xs mb-1">Total Cost</div>
                  <div className="text-green-900 font-semibold">
                    ${result.total_cost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Parsed Data */}
        {result.parsed_data && (
          <div className="border border-slate-200 rounded-lg p-4">
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="w-full flex items-center justify-between text-left"
            >
              <h4 className="text-slate-900 font-semibold">Parsed Product Information</h4>
              {showDetails ? (
                <ChevronUp className="w-5 h-5 text-slate-400" />
              ) : (
                <ChevronDown className="w-5 h-5 text-slate-400" />
              )}
            </button>
            
            {showDetails && (
              <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                {result.parsed_data.product_name && (
                  <div>
                    <div className="text-slate-600 mb-1">Product Name</div>
                    <div className="text-slate-900">{result.parsed_data.product_name}</div>
                  </div>
                )}
                {result.parsed_data.country_of_origin && (
                  <div>
                    <div className="text-slate-600 mb-1">Country of Origin</div>
                    <div className="text-slate-900">{result.parsed_data.country_of_origin}</div>
                  </div>
                )}
                {result.parsed_data.product_description && (
                  <div className="col-span-2">
                    <div className="text-slate-600 mb-1">Description</div>
                    <div className="text-slate-900">{result.parsed_data.product_description}</div>
                  </div>
                )}
                {result.parsed_data.materials && (
                  <div className="col-span-2">
                    <div className="text-slate-600 mb-1">Materials</div>
                    <div className="text-slate-900">
                      {typeof result.parsed_data.materials === 'string' 
                        ? result.parsed_data.materials 
                        : JSON.stringify(result.parsed_data.materials)}
                    </div>
                  </div>
                )}
                {result.parsed_data.unit_cost !== null && result.parsed_data.unit_cost !== undefined && (
                  <div>
                    <div className="text-slate-600 mb-1">Unit Cost</div>
                    <div className="text-slate-900">
                      ${result.parsed_data.unit_cost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                  </div>
                )}
                {result.parsed_data.vendor && (
                  <div>
                    <div className="text-slate-600 mb-1">Vendor</div>
                    <div className="text-slate-900">{result.parsed_data.vendor}</div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Reasoning */}
        {result.reasoning && (
          <div className="border border-slate-200 rounded-lg p-4">
            <h4 className="text-slate-900 font-semibold mb-2">Classification Reasoning</h4>
            <p className="text-slate-700 text-sm whitespace-pre-wrap">{result.reasoning}</p>
          </div>
        )}

        {/* Alternate Classification */}
        {result.alternate_classification && (
          <div className="border border-amber-200 bg-amber-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="w-5 h-5 text-amber-600" />
              <h4 className="text-amber-900 font-semibold">Alternate Classification</h4>
            </div>
            <div className="text-amber-800 font-mono">{result.alternate_classification}</div>
          </div>
        )}

        {/* Rulings */}
        {result.rulings && (
          <div className="border border-blue-200 bg-blue-50 rounded-lg p-4">
            <h4 className="text-blue-900 font-semibold mb-3">Relevant Rulings & Documentation</h4>
            <div className="text-blue-800 text-sm">
              {typeof result.rulings === 'string' 
                ? result.rulings 
                : JSON.stringify(result.rulings, null, 2)}
            </div>
          </div>
        )}

        {/* Actions */}
        {(onApprove || onReviewLater) && (
          <div className="flex gap-3 pt-4 border-t border-slate-200">
            {onApprove && (
              <button
                onClick={onApprove}
                className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
              >
                <CheckCircle className="w-5 h-5" />
                Approve & Save
              </button>
            )}
            {onReviewLater && (
              <button
                onClick={onReviewLater}
                className="px-6 py-3 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Review Later
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

