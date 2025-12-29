import { AlertCircle, CheckCircle, Clock, TrendingUp, MessageSquare, Sparkles, ChevronRight, Package, FileText, X, Upload, Database, BarChart, Search, Plus } from 'lucide-react';
import { useState } from 'react';
import { ExceptionReview } from './ExceptionReview';

interface DashboardProps {
  onNavigate: (view: 'dashboard' | 'classify' | 'bulk' | 'profile') => void;
}

export function Dashboard({ onNavigate }: DashboardProps) {
  const [selectedException, setSelectedException] = useState<any>(null);
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [resolvedItems, setResolvedItems] = useState<any[]>([]);
  const [showSuccessNotification, setShowSuccessNotification] = useState(false);
  const [lastResolvedItem, setLastResolvedItem] = useState<any>(null);
  const [activeExceptions, setActiveExceptions] = useState<any[]>([
    { 
      id: 1, 
      product: 'Smart Watch with Health Monitor',
      sku: 'SWH-2024', 
      reason: 'Low confidence (68%)', 
      hts: '9102.11.0000', 
      status: 'urgent',
      origin: 'China', 
      value: '$11,250',
      description: 'Fitness tracking, heart rate, GPS',
      priority: 'high',
      dueDate: 'Today'
    },
    { 
      id: 2, 
      product: 'Wireless Bluetooth Speaker',
      sku: 'WBS-001', 
      reason: 'Missing origin documentation', 
      hts: '8518.22.0000', 
      status: 'review',
      origin: 'China', 
      value: '$6,250',
      description: 'Portable speaker with rechargeable battery',
      priority: 'medium',
      dueDate: 'Tomorrow'
    },
    { 
      id: 3, 
      product: 'Cotton-Polyester Blend Fabric',
      sku: 'CPF-555', 
      reason: 'Multiple HTS alternatives', 
      hts: '5515.11.0000', 
      status: 'review',
      origin: 'India', 
      value: '$8,940',
      description: '60% cotton, 40% polyester blend',
      priority: 'medium',
      dueDate: 'Dec 18'
    },
    {
      id: 4,
      product: 'Protective Carrying Case',
      sku: 'PCC-789',
      reason: 'Material composition unclear',
      hts: '4202.92.9026',
      status: 'review',
      origin: 'China',
      value: '$1,875',
      description: 'EVA material protective case',
      priority: 'low',
      dueDate: 'Dec 19'
    }
  ]);
  const [aiMessages, setAiMessages] = useState([
    { role: 'assistant', text: "Hi! I noticed you have 4 exceptions requiring review. Would you like me to help you resolve them?" }
  ]);
  const [aiInput, setAiInput] = useState('');

  const stats = [
    { label: 'Exceptions', value: activeExceptions.length.toString(), subtext: 'Need Review', icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-50' },
    { label: 'Classified', value: '1,247', subtext: 'This Month', icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Product Profiles', value: '342', subtext: 'Total Saved', icon: Package, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Avg Confidence', value: '97.2%', subtext: 'Last 30 Days', icon: TrendingUp, color: 'text-purple-600', bg: 'bg-purple-50' },
  ];

  const recentClassifications = [
    { product: 'LED Desk Lamp', hts: '9405.20.4000', confidence: '98%', time: '2 hours ago', status: 'auto-approved' },
    { product: 'Wireless Speaker', hts: '8518.22.0000', confidence: '94%', time: '3 hours ago', status: 'auto-approved' },
    { product: 'Cotton T-Shirt', hts: '6109.10.0012', confidence: '96%', time: '5 hours ago', status: 'auto-approved' },
  ];

  const recentProfiles = [
    { name: 'Bluetooth Audio Series', products: 12, updated: '1 day ago' },
    { name: 'Smart Home Devices', products: 8, updated: '2 days ago' },
    { name: 'Textile Products', products: 24, updated: '3 days ago' },
  ];

  const handleSendMessage = () => {
    if (!aiInput.trim()) return;
    
    setAiMessages(prev => [...prev, { role: 'user', text: aiInput }]);
    
    // Simulate AI response
    setTimeout(() => {
      setAiMessages(prev => [...prev, { 
        role: 'assistant', 
        text: "I can help with that! The Smart Watch classification needs clarification on its primary function. Is it mainly used for timekeeping or health monitoring? This will determine if it's classified under watches (9102) or medical devices (9018)."
      }]);
    }, 1000);
    
    setAiInput('');
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-700 bg-red-100 border-red-200';
      case 'medium': return 'text-amber-700 bg-amber-100 border-amber-200';
      case 'low': return 'text-blue-700 bg-blue-100 border-blue-200';
      default: return 'text-slate-700 bg-slate-100 border-slate-200';
    }
  };

  const handleResolveException = (exception: any) => {
    setResolvedItems(prev => [...prev, exception]);
    setLastResolvedItem(exception);
    setShowSuccessNotification(true);
    setActiveExceptions(prev => prev.filter(item => item.id !== exception.id));
    setSelectedException(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 p-6">
      <div className="max-w-[1600px] mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h1 className="text-slate-900 mb-1">Good morning 👋</h1>
              <div className="flex items-center gap-3">
                <p className="text-slate-600">
                  You have {activeExceptions.length} item{activeExceptions.length !== 1 ? 's' : ''} requiring your attention
                </p>
                {resolvedItems.length > 0 && (
                  <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm flex items-center gap-1.5">
                    <CheckCircle className="w-4 h-4" />
                    {resolvedItems.length} resolved today
                  </span>
                )}
              </div>
            </div>
            <div className="text-right">
              <div className="text-slate-600 text-sm">Monday, December 15, 2025</div>
              <div className="text-slate-500 text-sm">Last sync: 2 min ago</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Main Content - 2 columns */}
          <div className="xl:col-span-2 space-y-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-4 gap-4">
              {stats.map((stat) => (
                <div key={stat.label} className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-3">
                    <div className={`${stat.bg} ${stat.color} p-2.5 rounded-lg`}>
                      <stat.icon className="w-5 h-5" />
                    </div>
                  </div>
                  <div className={`${stat.color} mb-1`}>{stat.value}</div>
                  <div className="text-slate-600 text-sm">{stat.label}</div>
                  <div className="text-slate-500 text-xs mt-1">{stat.subtext}</div>
                </div>
              ))}
            </div>

            {/* Actions Required */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="bg-gradient-to-r from-red-50 to-orange-50 px-6 py-4 border-b border-red-100">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-slate-900 mb-1">Actions Required</h2>
                    <p className="text-slate-600 text-sm">Review and resolve exceptions to keep imports moving</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1.5 bg-red-100 text-red-700 rounded-full text-sm">
                      {activeExceptions.length} urgent
                    </span>
                  </div>
                </div>
              </div>

              <div className="divide-y divide-slate-100">
                {activeExceptions.map((item) => (
                  <div 
                    key={item.id} 
                    className="p-5 hover:bg-slate-50 transition-colors cursor-pointer group"
                    onClick={() => setSelectedException(item)}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <AlertCircle className={`w-5 h-5 flex-shrink-0 ${
                            item.priority === 'high' ? 'text-red-600' : 
                            item.priority === 'medium' ? 'text-amber-600' : 'text-blue-600'
                          }`} />
                          <span className="text-slate-900 truncate">{item.product}</span>
                          <span className={`px-2 py-0.5 rounded text-xs border ${getPriorityColor(item.priority)}`}>
                            {item.priority}
                          </span>
                        </div>
                        
                        <div className="ml-8 space-y-1">
                          <div className="text-sm text-slate-600">
                            <span className="text-red-700">⚠ {item.reason}</span>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-slate-500">
                            <span>SKU: {item.sku}</span>
                            <span>•</span>
                            <span>HTS: {item.hts}</span>
                            <span>•</span>
                            <span>Origin: {item.origin}</span>
                            <span>•</span>
                            <span>Value: {item.value}</span>
                            <span>•</span>
                            <span>Due: {item.dueDate}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedException(item);
                          }}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm opacity-0 group-hover:opacity-100"
                        >
                          Review Now
                        </button>
                        <ChevronRight className="w-5 h-5 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="px-6 py-4 bg-slate-50 border-t border-slate-200">
                <button 
                  onClick={() => onNavigate('classify')}
                  className="text-blue-600 hover:text-blue-700 text-sm flex items-center gap-2"
                >
                  View all exceptions
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100">
                <h3 className="text-slate-900">Recent Activity</h3>
              </div>
              <div className="divide-y divide-slate-100">
                {resolvedItems.length > 0 && (
                  <>
                    {resolvedItems.slice().reverse().map((item, idx) => (
                      <div 
                        key={`resolved-${idx}`} 
                        className="flex items-center gap-3 p-4 bg-green-50 border-l-4 border-green-500 cursor-pointer hover:bg-green-100 transition-colors group"
                        onClick={() => onNavigate('profile')}
                      >
                        <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="text-slate-900 text-sm truncate">{item.product}</div>
                          <div className="text-green-600 text-xs">Exception resolved • Confidence improved to 96%</div>
                        </div>
                        <div className="text-slate-400 text-xs whitespace-nowrap">Just now</div>
                        <ChevronRight className="w-4 h-4 text-green-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    ))}
                  </>
                )}
                {recentClassifications.map((activity, idx) => (
                  <div 
                    key={idx} 
                    className="flex items-center gap-3 p-4 hover:bg-slate-50 transition-colors cursor-pointer group"
                    onClick={() => onNavigate('profile')}
                  >
                    <div className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0"></div>
                    <div className="flex-1 min-w-0">
                      <div className="text-slate-900 text-sm">{activity.product}</div>
                      <div className="text-slate-500 text-xs">HTS: {activity.hts} • Confidence: {activity.confidence}</div>
                    </div>
                    <div className="text-slate-400 text-xs whitespace-nowrap">{activity.time}</div>
                    <ChevronRight className="w-4 h-4 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                ))}
              </div>
              <div className="px-6 py-4 bg-slate-50 border-t border-slate-200">
                <button 
                  onClick={() => onNavigate('profile')}
                  className="text-blue-600 hover:text-blue-700 text-sm flex items-center gap-2"
                >
                  View all activity
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* AI Assistant Sidebar - 1 column */}
          <div className="xl:col-span-1">
            <div className="sticky top-6 space-y-6">
              {/* AI Assistant */}
              {showAIAssistant && (
                <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-xl overflow-hidden">
                  <div className="bg-white/10 backdrop-blur-sm px-5 py-4 flex items-center justify-between border-b border-white/20">
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-white/20 rounded-lg">
                        <Sparkles className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="text-white">AI Assistant</h3>
                        <p className="text-indigo-100 text-xs">Always here to help</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setShowAIAssistant(false)}
                      className="text-white/70 hover:text-white transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="p-5 bg-white">
                    <div className="space-y-4 mb-4 max-h-[400px] overflow-y-auto">
                      {aiMessages.map((message, idx) => (
                        <div
                          key={idx}
                          className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                        >
                          {message.role === 'assistant' && (
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                              <Sparkles className="w-4 h-4 text-white" />
                            </div>
                          )}
                          <div
                            className={`rounded-2xl px-4 py-3 max-w-[85%] text-sm ${
                              message.role === 'user'
                                ? 'bg-blue-600 text-white rounded-tr-sm'
                                : 'bg-slate-100 text-slate-900 rounded-tl-sm'
                            }`}
                          >
                            {message.text}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={aiInput}
                        onChange={(e) => setAiInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                        placeholder="Ask me anything..."
                        className="flex-1 px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                      <button
                        onClick={handleSendMessage}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                      >
                        <MessageSquare className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="px-5 py-3 bg-indigo-50 border-t border-indigo-100">
                    <p className="text-indigo-700 text-xs">
                      💡 Try: "Help me classify the smart watch" or "What documents do I need?"
                    </p>
                  </div>
                </div>
              )}

              {/* Quick Insights */}
              <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
                <h3 className="text-slate-900 mb-4">Today's Insights</h3>
                <div className="space-y-4">
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                    <div className="flex items-start gap-2 mb-1">
                      <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5" />
                      <div className="text-sm text-amber-900">3 shipments approaching duty threshold</div>
                    </div>
                    <p className="text-xs text-amber-700 ml-6">Review to optimize tariff costs</p>
                  </div>

                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-start gap-2 mb-1">
                      <TrendingUp className="w-4 h-4 text-blue-600 mt-0.5" />
                      <div className="text-sm text-blue-900">Classification accuracy up 2.1%</div>
                    </div>
                    <p className="text-xs text-blue-700 ml-6">Great job on product details!</p>
                  </div>

                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-start gap-2 mb-1">
                      <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                      <div className="text-sm text-green-900">127 products classified today</div>
                    </div>
                    <p className="text-xs text-green-700 ml-6">Your bulk upload is complete</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {selectedException && (
        <ExceptionReview
          product={{
            id: selectedException.id,
            productName: selectedException.product,
            description: selectedException.description,
            hts: selectedException.hts,
            confidence: 67,
            tariff: '9.8%',
            origin: selectedException.origin,
            reason: selectedException.reason
          }}
          onClose={() => setSelectedException(null)}
          onApprove={() => handleResolveException(selectedException)}
          onReject={() => setSelectedException(null)}
        />
      )}

      {showSuccessNotification && (
        <div className="fixed bottom-6 right-6 bg-green-500 text-white px-4 py-3 rounded shadow-lg flex items-center gap-2">
          <CheckCircle className="w-5 h-5" />
          <span>Resolved: {lastResolvedItem.product}</span>
          <button
            onClick={() => setShowSuccessNotification(false)}
            className="ml-4 text-white hover:text-gray-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Floating AI Assistant */}
      {!showAIAssistant ? (
        <button
          onClick={() => setShowAIAssistant(true)}
          className="fixed bottom-6 right-6 bg-gradient-to-br from-indigo-500 to-purple-600 text-white p-4 rounded-full shadow-2xl hover:shadow-xl hover:scale-105 transition-all group"
        >
          <Sparkles className="w-6 h-6" />
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
          <div className="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-slate-900 text-white px-3 py-2 rounded-lg text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            Need help? Ask me anything!
            <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 rotate-45 w-2 h-2 bg-slate-900"></div>
          </div>
        </button>
      ) : (
        <div className="fixed bottom-6 right-6 w-[400px] bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4">
          <div className="bg-white/10 backdrop-blur-sm px-5 py-4 flex items-center justify-between border-b border-white/20">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg relative">
                <Sparkles className="w-5 h-5 text-white" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
              </div>
              <div>
                <h3 className="text-white">AI Assistant</h3>
                <p className="text-indigo-100 text-xs">Online • Ready to help</p>
              </div>
            </div>
            <button
              onClick={() => setShowAIAssistant(false)}
              className="text-white/70 hover:text-white transition-colors p-1 hover:bg-white/10 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-5 bg-white max-h-[500px] flex flex-col">
            <div className="space-y-4 mb-4 overflow-y-auto flex-1">
              {aiMessages.map((message, idx) => (
                <div
                  key={idx}
                  className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  {message.role === 'assistant' && (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                      <Sparkles className="w-4 h-4 text-white" />
                    </div>
                  )}
                  <div
                    className={`rounded-2xl px-4 py-3 max-w-[85%] text-sm ${
                      message.role === 'user'
                        ? 'bg-blue-600 text-white rounded-tr-sm'
                        : 'bg-slate-100 text-slate-900 rounded-tl-sm'
                    }`}
                  >
                    {message.text}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-2 pt-3 border-t border-slate-200">
              <input
                type="text"
                value={aiInput}
                onChange={(e) => setAiInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Ask me anything..."
                className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                onClick={handleSendMessage}
                className="px-4 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                <MessageSquare className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="px-5 py-3 bg-indigo-50 border-t border-indigo-100">
            <p className="text-indigo-700 text-xs">
              💡 Try: "Help me classify the smart watch" or "What documents do I need?"
            </p>
          </div>
        </div>
      )}
    </div>
  );
}