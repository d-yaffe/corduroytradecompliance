import { useState } from 'react';
import { Search, Sparkles, AlertTriangle, CheckCircle, ChevronDown, ChevronUp, MessageSquare, Plus, X, Upload, FileText, File, Package, MapPin, DollarSign, Calendar, Edit2 } from 'lucide-react';
import { LLMAssistant } from './LLMAssistant';

interface MaterialComposition {
  material: string;
  percentage: number;
}

interface ClassificationResult {
  hts: string;
  confidence: number;
  description: string;
  tariff: string;
  reasoning: string;
  tariffByOrigin?: { country: string; rate: string; tradeAgreement?: string }[];
  alternatives?: Array<{ hts: string; confidence: number; description: string; tariff: string; reasoning?: string }>;
}

export function ClassificationView() {
  const [query, setQuery] = useState('');
  const [originCountry, setOriginCountry] = useState('');
  const [result, setResult] = useState<ClassificationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [showAlternatives, setShowAlternatives] = useState(false);
  const [showAssistant, setShowAssistant] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [materials, setMaterials] = useState<MaterialComposition[]>([]);
  const [newMaterial, setNewMaterial] = useState({ material: '', percentage: 0 });
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [editMode, setEditMode] = useState(false);
  
  // Additional fields for product profile
  const [sku, setSku] = useState('');
  const [vendor, setVendor] = useState('');
  const [unitCost, setUnitCost] = useState('');

  const addMaterial = () => {
    if (newMaterial.material && newMaterial.percentage > 0) {
      setMaterials([...materials, newMaterial]);
      setNewMaterial({ material: '', percentage: 0 });
    }
  };

  const removeMaterial = (index: number) => {
    setMaterials(materials.filter((_, i) => i !== index));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setUploadedFiles([...uploadedFiles, ...newFiles]);
    }
  };

  const removeFile = (index: number) => {
    setUploadedFiles(uploadedFiles.filter((_, i) => i !== index));
  };

  const getFileIcon = (fileName: string) => {
    const parts = fileName.split('.');
    const ext = parts.length > 0 && parts[parts.length - 1] ? parts[parts.length - 1].toLowerCase() : '';
    if (ext === 'pdf') return <FileText className="w-4 h-4 text-red-600" />;
    if (ext === 'xlsx' || ext === 'xls' || ext === 'csv') return <FileText className="w-4 h-4 text-green-600" />;
    if (ext === 'doc' || ext === 'docx') return <FileText className="w-4 h-4 text-blue-600" />;
    return <File className="w-4 h-4 text-slate-600" />;
  };

  const getTotalPercentage = (items: { percentage: number }[]) => {
    return items.reduce((sum, item) => sum + item.percentage, 0);
  };

  const handleClassify = () => {
    if (!query.trim()) return;
    
    setLoading(true);
    
    // Simulate AI classification
    setTimeout(() => {
      const mockResult: ClassificationResult = {
        hts: '8517.62.0050',
        confidence: 96,
        description: 'Machines for the reception, conversion and transmission or regeneration of voice, images or other data',
        tariff: originCountry ? (originCountry === 'China' ? '0% (Free)' : '0% (Free)') : 'Dependent on country of origin',
        reasoning: 'Based on the product description "wireless bluetooth speaker," this item is classified as a telecommunications device. The primary function is receiving and converting wireless audio signals. Key classification factors: wireless connectivity (Bluetooth), audio transmission capability, and electronic amplification.',
        tariffByOrigin: originCountry ? [
          { country: originCountry, rate: '0% (Free)', tradeAgreement: originCountry === 'Mexico' || originCountry === 'Canada' ? 'USMCA' : 'MFN' },
          { country: 'China', rate: '0% (Free)', tradeAgreement: 'MFN' },
          { country: 'Mexico', rate: '0% (Free)', tradeAgreement: 'USMCA' },
          { country: 'Vietnam', rate: '0% (Free)', tradeAgreement: 'MFN' },
        ] : undefined,
        alternatives: [
          { 
            hts: '8518.22.0000', 
            confidence: 82, 
            description: 'Multiple loudspeakers, mounted in the same enclosure',
            tariff: originCountry ? '4.9%' : 'Dependent on country of origin',
            reasoning: 'This classification applies if the bluetooth speaker contains multiple driver units (woofer, tweeter, etc.) mounted in the same housing. The emphasis is on the physical speaker configuration rather than wireless connectivity. This code is often used for home audio systems with multiple speaker drivers.'
          },
          { 
            hts: '8519.81.4040', 
            confidence: 71, 
            description: 'Sound reproducing apparatus not incorporating a sound recording device',
            tariff: originCountry ? '0% (Free)' : 'Dependent on country of origin',
            reasoning: 'This code applies to devices designed solely for sound reproduction without recording capability. If the bluetooth speaker lacks a microphone for recording or voice commands, and functions only as an audio playback device, this classification may be appropriate.'
          },
        ]
      };
      
      setResult(mockResult);
      setLoading(false);
    }, 1500);
  };

  const handleSelectAlternative = (alternative: { hts: string; confidence: number; description: string; tariff: string; reasoning?: string }) => {
    if (!result) return;

    // Store the current classification as an alternative
    const currentAsAlternative = {
      hts: result.hts,
      confidence: result.confidence,
      description: result.description,
      tariff: result.tariff,
      reasoning: result.reasoning
    };

    // Filter out the selected alternative and add the current one
    const newAlternatives = result.alternatives && result.alternatives.filter ? result.alternatives.filter(alt => alt.hts !== alternative.hts) : [];
    newAlternatives.unshift(currentAsAlternative);

    // Update the result with the selected alternative as the main classification
    setResult({
      ...result,
      hts: alternative.hts,
      confidence: alternative.confidence,
      description: alternative.description,
      tariff: alternative.tariff,
      reasoning: alternative.reasoning || '',
      alternatives: newAlternatives
    });
  };

  return (
    <div>
      <div className="max-w-4xl mx-auto">
        {/* Query Input */}
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-slate-700 mb-2">Product Description</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleClassify()}
                  placeholder="e.g., Wireless bluetooth speaker"
                  className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-slate-700 mb-2">Country of Origin</label>
              <select
                value={originCountry}
                onChange={(e) => setOriginCountry(e.target.value)}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select country...</option>
                <option value="China">China</option>
                <option value="Mexico">Mexico</option>
                <option value="Canada">Canada</option>
                <option value="Vietnam">Vietnam</option>
                <option value="India">India</option>
                <option value="South Korea">South Korea</option>
                <option value="Japan">Japan</option>
                <option value="Germany">Germany</option>
              </select>
            </div>
          </div>
          
          {/* File Upload Section */}
          <div className="mt-4 p-4 border-2 border-dashed border-slate-300 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Upload className="w-5 h-5 text-slate-600" />
                <div>
                  <h4 className="text-slate-900">Upload Supporting Documents (Optional)</h4>
                  <p className="text-slate-600 text-sm">Specs, BOMs, datasheets, or other product details</p>
                </div>
              </div>
              <label
                htmlFor="file-upload-single"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer flex items-center gap-2 text-sm"
              >
                <Plus className="w-4 h-4" />
                Add Files
              </label>
              <input
                id="file-upload-single"
                type="file"
                multiple
                accept=".pdf,.xlsx,.xls,.csv,.doc,.docx,.txt,.jpg,.jpeg,.png"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>

            {uploadedFiles.length > 0 && (
              <div className="space-y-2">
                {uploadedFiles.map((file, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-2 bg-white rounded border border-slate-200">
                    {getFileIcon(file.name)}
                    <div className="flex-1 min-w-0">
                      <p className="text-slate-900 text-sm truncate">{file.name}</p>
                      <p className="text-slate-500 text-xs">
                        {(file.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                    <button
                      onClick={() => removeFile(idx)}
                      className="p-1 hover:bg-red-50 rounded transition-colors flex-shrink-0"
                    >
                      <X className="w-4 h-4 text-red-600" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {uploadedFiles.length === 0 && (
              <div className="text-center py-4">
                <p className="text-slate-500 text-sm">
                  PDF, Excel, CSV, Word, images • Max 10MB per file
                </p>
              </div>
            )}
          </div>
          
          {/* Advanced: Material Composition */}
          <div className="mt-4">
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors text-left"
            >
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-600" />
                <span className="text-slate-900">Add Product Details & Material Composition (Optional)</span>
                <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded">Improves Accuracy</span>
              </div>
              {showAdvanced ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
            </button>

            {showAdvanced && (
              <div className="mt-4 p-4 border border-slate-200 rounded-lg bg-slate-50 space-y-4">
                {/* Product Details */}
                <div>
                  <h4 className="text-slate-900 mb-3">Product Details</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-slate-700 text-sm mb-1">SKU Number</label>
                      <input
                        type="text"
                        value={sku}
                        onChange={(e) => setSku(e.target.value)}
                        placeholder="e.g., PROD-12345"
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-slate-700 text-sm mb-1">Vendor Name</label>
                      <input
                        type="text"
                        value={vendor}
                        onChange={(e) => setVendor(e.target.value)}
                        placeholder="e.g., TechSupply Co."
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-slate-700 text-sm mb-1">Product Cost</label>
                      <input
                        type="text"
                        value={unitCost}
                        onChange={(e) => setUnitCost(e.target.value)}
                        placeholder="e.g., $12.50"
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                      />
                    </div>
                  </div>
                </div>

                {/* Material Composition */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-slate-900">Material Composition</h4>
                    <span className={`text-xs ${getTotalPercentage(materials) === 100 ? 'text-green-600' : 'text-amber-600'}`}>
                      Total: {getTotalPercentage(materials)}%
                    </span>
                  </div>
                  
                  {materials.length > 0 && (
                    <div className="space-y-2 mb-3">
                      {materials.map((material, idx) => (
                        <div key={idx} className="flex items-center gap-2 p-2 bg-white rounded border border-slate-200">
                          <div className="flex-1 flex items-center gap-2">
                            <span className="text-slate-900 text-sm">{material.material}</span>
                            <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded">{material.percentage}%</span>
                          </div>
                          <button
                            onClick={() => removeMaterial(idx)}
                            className="p-1 hover:bg-red-50 rounded transition-colors"
                          >
                            <X className="w-4 h-4 text-red-600" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Material (e.g., Cotton, Polyester, Steel)"
                      value={newMaterial.material}
                      onChange={(e) => setNewMaterial({ ...newMaterial, material: e.target.value })}
                      className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="number"
                      placeholder="%"
                      min="0"
                      max="100"
                      value={newMaterial.percentage || ''}
                      onChange={(e) => setNewMaterial({ ...newMaterial, percentage: parseFloat(e.target.value) || 0 })}
                      className="w-20 px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      onClick={addMaterial}
                      disabled={!newMaterial.material || newMaterial.percentage <= 0}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 text-sm"
                    >
                      <Plus className="w-4 h-4" />
                      Add
                    </button>
                  </div>
                  <p className="text-xs text-slate-500 mt-2">
                    💡 Many HTS codes depend on material composition (e.g., textiles, metals). Adding percentages improves classification accuracy.
                  </p>
                </div>
              </div>
            )}
          </div>

          <button
            onClick={handleClassify}
            disabled={loading || !query.trim()}
            className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-lg hover:from-blue-700 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 mt-4"
          >
            <Sparkles className="w-5 h-5" />
            {loading ? 'Classifying...' : 'Classify Product'}
          </button>
          
          <div className="mt-3 flex flex-wrap gap-2">
            <span className="text-slate-500 text-sm">Try:</span>
            {['Organic cotton t-shirt', 'Stainless steel water bottle', 'LED desk lamp'].map((example) => (
              <button
                key={example}
                onClick={() => setQuery(example)}
                className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-sm hover:bg-slate-200 transition-colors"
              >
                {example}
              </button>
            ))}
          </div>
        </div>

        {/* Classification Result - Product Profile Style */}
        {result && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            {/* Header */}
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-slate-900 mb-1">{query}</h2>
                <p className="text-slate-600">SKU: {sku || 'Not assigned'}</p>
              </div>
              <button 
                onClick={() => setResult(null)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Current Classification Card */}
            <div className="mb-6 p-5 bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="text-green-900 mb-1">Current Classification</div>
                  <div className="text-green-800">HTS Code: {result.hts}</div>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-green-100 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-700" />
                  <span className="text-green-900">{result.confidence}% Confidence</span>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm text-green-700">
                <Calendar className="w-4 h-4" />
                Last updated: {new Date().toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </div>
            </div>

            {/* Product Information Grid */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 group hover:border-blue-300 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 text-slate-700">
                    <Package className="w-5 h-5" />
                    <span>SKU</span>
                  </div>
                  {!editMode && (
                    <button onClick={() => setEditMode(true)} className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <Edit2 className="w-4 h-4 text-blue-600" />
                    </button>
                  )}
                </div>
                {editMode ? (
                  <input
                    type="text"
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    placeholder="Enter SKU..."
                    className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <p className="text-slate-900 text-sm">{sku || 'Not assigned'}</p>
                )}
              </div>

              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 group hover:border-blue-300 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 text-slate-700">
                    <MapPin className="w-5 h-5" />
                    <span>Country of Origin</span>
                  </div>
                  {!editMode && (
                    <button onClick={() => setEditMode(true)} className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <Edit2 className="w-4 h-4 text-blue-600" />
                    </button>
                  )}
                </div>
                {editMode ? (
                  <select
                    value={originCountry}
                    onChange={(e) => setOriginCountry(e.target.value)}
                    className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="China">China</option>
                    <option value="Mexico">Mexico</option>
                    <option value="Canada">Canada</option>
                    <option value="Vietnam">Vietnam</option>
                    <option value="India">India</option>
                    <option value="South Korea">South Korea</option>
                    <option value="Japan">Japan</option>
                    <option value="Germany">Germany</option>
                  </select>
                ) : (
                  <p className="text-slate-900 text-sm">{originCountry || 'Not specified'}</p>
                )}
              </div>

              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 group hover:border-blue-300 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 text-slate-700">
                    <DollarSign className="w-5 h-5" />
                    <span>Unit Cost</span>
                  </div>
                  {!editMode && (
                    <button onClick={() => setEditMode(true)} className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <Edit2 className="w-4 h-4 text-blue-600" />
                    </button>
                  )}
                </div>
                {editMode ? (
                  <input
                    type="text"
                    value={unitCost}
                    onChange={(e) => setUnitCost(e.target.value)}
                    placeholder="e.g., $12.50"
                    className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <p className="text-slate-900 text-sm">{unitCost || '$12.50'}</p>
                )}
              </div>

              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 group hover:border-blue-300 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 text-slate-700">
                    <FileText className="w-5 h-5" />
                    <span>Vendor</span>
                  </div>
                  {!editMode && (
                    <button onClick={() => setEditMode(true)} className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <Edit2 className="w-4 h-4 text-blue-600" />
                    </button>
                  )}
                </div>
                {editMode ? (
                  <input
                    type="text"
                    value={vendor}
                    onChange={(e) => setVendor(e.target.value)}
                    placeholder="Enter vendor name..."
                    className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <p className="text-slate-900 text-sm">{vendor || 'TechSupply Co.'}</p>
                )}
              </div>
            </div>

            {editMode && (
              <div className="flex gap-3 mb-6">
                <button 
                  onClick={() => setEditMode(false)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                >
                  Save Changes
                </button>
                <button 
                  onClick={() => setEditMode(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors text-sm"
                >
                  Cancel
                </button>
              </div>
            )}

            {/* Trade Analysis */}
            <div className="mb-6">
              <h3 className="text-slate-900 mb-3">Trade Analysis</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <span className="text-blue-900 text-sm">Standard Tariff Rate (MFN)</span>
                  <span className="text-blue-700">{result.tariff}</span>
                </div>
              </div>
            </div>

            {/* AI Reasoning Section */}
            <div className="border-t border-slate-200 pt-6">
              <div className="border border-blue-200 rounded-xl overflow-hidden mb-6">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-5 py-3 border-b border-blue-100">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-blue-600" />
                    <h3 className="text-blue-900">AI Reasoning</h3>
                  </div>
                </div>
                <div className="p-5 bg-white">
                  <p className="text-blue-800 text-sm mb-4">
                    {result.reasoning}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button className="flex-1 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                  Approve & Save
                </button>
                <button 
                  onClick={() => setShowAssistant(true)}
                  className="px-6 py-3 border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors flex items-center gap-2"
                >
                  <MessageSquare className="w-5 h-5" />
                  Ask AI
                </button>
              </div>
            </div>

            {/* Alternative Classifications - Always Visible */}
            {result.alternatives && result.alternatives.length > 0 && (
              <div className="mt-6 border-t border-slate-200 pt-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-amber-100 p-2 rounded-lg">
                    <AlertTriangle className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <h3 className="text-slate-900">Alternative Classifications</h3>
                    <p className="text-slate-600 text-sm">{result.alternatives.length} alternatives found</p>
                  </div>
                </div>
                <div className="space-y-3">
                  {result.alternatives.map((alt, index) => (
                    <div key={index} className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-slate-900">{alt.hts}</span>
                        <div className="flex items-center gap-3">
                          <span className="text-slate-600 text-sm">Confidence: {alt.confidence}%</span>
                          <div className="w-20 h-2 bg-slate-200 rounded-full">
                            <div 
                              className="h-full bg-amber-500 rounded-full"
                              style={{ width: `${alt.confidence}%` }}
                            />
                          </div>
                        </div>
                      </div>
                      <p className="text-slate-700 text-sm mb-3">{alt.description}</p>
                      {alt.reasoning && (
                        <div className="mb-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                          <div className="flex items-start gap-2">
                            <Sparkles className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                            <p className="text-amber-900 text-xs leading-relaxed">{alt.reasoning}</p>
                          </div>
                        </div>
                      )}
                      <div className="flex items-center justify-between">
                        <span className="text-slate-600 text-sm">Tariff: {alt.tariff}</span>
                        <button 
                          onClick={() => handleSelectAlternative(alt)}
                          className="px-3 py-1 border border-slate-300 text-slate-700 rounded-lg text-sm hover:bg-white transition-colors"
                        >
                          Select This Code
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {!result && !loading && (
          <div className="bg-white rounded-xl p-12 border border-slate-200 shadow-sm text-center">
            <div className="bg-slate-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-slate-900 mb-2">Ready to Classify</h3>
            <p className="text-slate-600">Enter a product description above to get AI-powered HS/HTS classification with confidence scoring and tariff information.</p>
          </div>
        )}

        {/* AI Assistant */}
        {showAssistant && (
          <LLMAssistant
            productContext={result && query ? {
              name: query,
              description: query,
              hts: result.hts,
              origin: originCountry
            } : undefined}
            onClose={() => setShowAssistant(false)}
          />
        )}
      </div>
    </div>
  );
}