import { useState } from 'react';
import { Save, Building2, Lock, Sliders, Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';

export function Settings() {
  // Account Settings
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  // Company Details
  const [companyName, setCompanyName] = useState('Acme Corporation');
  const [companyMessage, setCompanyMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // Automation Settings
  const [autoApprovalThreshold, setAutoApprovalThreshold] = useState(95);
  const [automationMessage, setAutomationMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordMessage({ type: 'error', text: 'Please fill in all password fields' });
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordMessage({ type: 'error', text: 'New passwords do not match' });
      return;
    }

    if (newPassword.length < 8) {
      setPasswordMessage({ type: 'error', text: 'Password must be at least 8 characters long' });
      return;
    }

    // Simulate password change
    setPasswordMessage({ type: 'success', text: 'Password updated successfully' });
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');

    // Clear message after 3 seconds
    setTimeout(() => setPasswordMessage(null), 3000);
  };

  const handleCompanySave = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!companyName) {
      setCompanyMessage({ type: 'error', text: 'Company name is required' });
      return;
    }

    // Simulate save
    setCompanyMessage({ type: 'success', text: 'Company details saved successfully' });

    // Clear message after 3 seconds
    setTimeout(() => setCompanyMessage(null), 3000);
  };

  const handleAutomationSave = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (autoApprovalThreshold < 80) {
      setAutomationMessage({ type: 'error', text: 'Auto-approval threshold must be at least 80%' });
      return;
    }

    // Simulate save
    setAutomationMessage({ type: 'success', text: 'Automation settings saved successfully' });

    // Clear message after 3 seconds
    setTimeout(() => setAutomationMessage(null), 3000);
  };

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-slate-900 mb-2">Settings</h1>
          <p className="text-slate-600">Manage your account, company information, and automation preferences</p>
        </div>

        <div className="space-y-6">
          {/* Account Settings */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-200 bg-slate-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Lock className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-slate-900">Account Security</h2>
                  <p className="text-slate-600 text-sm">Update your password to keep your account secure</p>
                </div>
              </div>
            </div>

            <div className="p-6">
              {passwordMessage && (
                <div className={`mb-4 p-3 rounded-lg flex items-center gap-2 ${
                  passwordMessage.type === 'success' 
                    ? 'bg-green-50 text-green-800 border border-green-200' 
                    : 'bg-red-50 text-red-800 border border-red-200'
                }`}>
                  {passwordMessage.type === 'success' ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    <AlertCircle className="w-4 h-4" />
                  )}
                  <span className="text-sm">{passwordMessage.text}</span>
                </div>
              )}

              <button
                onClick={() => setShowPasswordModal(true)}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <Lock className="w-4 h-4" />
                Reset Password
              </button>
            </div>
          </div>

          {/* Password Reset Modal */}
          {showPasswordModal && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
                <div className="p-6 border-b border-slate-200">
                  <h3 className="text-slate-900">Reset Password</h3>
                  <p className="text-slate-600 text-sm mt-1">Enter your current password and choose a new one</p>
                </div>

                <form onSubmit={(e) => {
                  handlePasswordChange(e);
                  if (newPassword && confirmPassword && newPassword === confirmPassword && newPassword.length >= 8) {
                    setTimeout(() => setShowPasswordModal(false), 1500);
                  }
                }} className="p-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm text-slate-700 mb-2">Current Password</label>
                      <div className="relative">
                        <input
                          type={showCurrentPassword ? 'text' : 'password'}
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Enter current password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        >
                          {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm text-slate-700 mb-2">New Password</label>
                      <div className="relative">
                        <input
                          type={showNewPassword ? 'text' : 'password'}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Enter new password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        >
                          {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">Password must be at least 8 characters long</p>
                    </div>

                    <div>
                      <label className="block text-sm text-slate-700 mb-2">Confirm New Password</label>
                      <div className="relative">
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Confirm new password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        >
                          {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 flex gap-3 justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        setShowPasswordModal(false);
                        setCurrentPassword('');
                        setNewPassword('');
                        setConfirmPassword('');
                      }}
                      className="px-4 py-2 text-slate-600 hover:text-slate-900 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                    >
                      <Save className="w-4 h-4" />
                      Update Password
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Company Information */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-200 bg-slate-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h2 className="text-slate-900">Company Information</h2>
                  <p className="text-slate-600 text-sm">Manage your company details for customs documentation</p>
                </div>
              </div>
            </div>

            <form onSubmit={handleCompanySave} className="p-6">
              {companyMessage && (
                <div className={`mb-4 p-3 rounded-lg flex items-center gap-2 ${
                  companyMessage.type === 'success' 
                    ? 'bg-green-50 text-green-800 border border-green-200' 
                    : 'bg-red-50 text-red-800 border border-red-200'
                }`}>
                  {companyMessage.type === 'success' ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    <AlertCircle className="w-4 h-4" />
                  )}
                  <span className="text-sm">{companyMessage.text}</span>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm text-slate-700 mb-2">Company Name *</label>
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter company name"
                    required
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  Save Company Details
                </button>
              </div>
            </form>
          </div>

          {/* Automation Settings */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-200 bg-slate-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Sliders className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h2 className="text-slate-900">Automation Settings</h2>
                  <p className="text-slate-600 text-sm">Configure confidence thresholds for classification approval</p>
                </div>
              </div>
            </div>

            <form onSubmit={handleAutomationSave} className="p-6">
              {automationMessage && (
                <div className={`mb-4 p-3 rounded-lg flex items-center gap-2 ${
                  automationMessage.type === 'success' 
                    ? 'bg-green-50 text-green-800 border border-green-200' 
                    : 'bg-red-50 text-red-800 border border-red-200'
                }`}>
                  {automationMessage.type === 'success' ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    <AlertCircle className="w-4 h-4" />
                  )}
                  <span className="text-sm">{automationMessage.text}</span>
                </div>
              )}

              <div className="space-y-6">
                {/* Auto-Approval Threshold */}
                <div>
                  <label className="block text-sm text-slate-700 mb-2">Automatic Approval Threshold</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={autoApprovalThreshold}
                      onChange={(e) => {
                        const value = parseInt(e.target.value) || 0;
                        if (value >= 0 && value <= 100) {
                          setAutoApprovalThreshold(value);
                        }
                      }}
                      className="w-32 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="95"
                    />
                    <span className="text-slate-700">%</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-2">
                    Classifications with confidence ≥ {autoApprovalThreshold}% will be automatically approved without human review
                  </p>
                </div>

                {/* Visual Guide */}
                <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                  <h4 className="text-sm text-slate-700 mb-3">Classification Handling:</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="text-slate-700">
                        <span className="font-medium">≥ {autoApprovalThreshold}%:</span> Auto-approved
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <span className="text-slate-700">
                        <span className="font-medium">&lt; {autoApprovalThreshold}%:</span> Review required
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  Save Automation Settings
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}