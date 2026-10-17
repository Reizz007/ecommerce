import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  X, 
  Crown, 
  Key, 
  CreditCard, 
  Box, 
  Copy, 
  Check, 
  Trash2, 
  Plus, 
  Download, 
  Zap, 
  ShieldCheck, 
  Activity 
} from 'lucide-react';

export default function AccountDashboardModal() {
  const { 
    isAccountOpen, 
    setIsAccountOpen, 
    userSubscription, 
    apiKeys, 
    generateNewApiKey, 
    revokeApiKey,
    purchasedLicenses,
    addToast
  } = useApp();

  const [activeTab, setActiveTab] = useState('sub'); // 'sub' | 'keys' | 'licenses'
  const [copiedKeyId, setCopiedKeyId] = useState(null);
  const [newKeyName, setNewKeyName] = useState('');
  const [isCreatingKey, setIsCreatingKey] = useState(false);

  if (!isAccountOpen) return null;

  const handleCopyKey = (keyObj) => {
    navigator.clipboard.writeText(keyObj.key);
    setCopiedKeyId(keyObj.id);
    setTimeout(() => setCopiedKeyId(null), 2000);
    addToast(`Copied key: ${keyObj.name}`, 'info');
  };

  const handleCreateKeySubmit = (e) => {
    e.preventDefault();
    if (!newKeyName.trim()) return;
    generateNewApiKey(newKeyName.trim());
    setNewKeyName('');
    setIsCreatingKey(false);
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-container account-modal-container">
        <button
          className="modal-close"
          onClick={() => setIsAccountOpen(false)}
          aria-label="Close Dashboard"
        >
          <X size={20} />
        </button>

        {/* User Profile Header */}
        <div className="account-header">
          <div className="account-profile">
            <div className="avatar-circle">AV</div>
            <div className="profile-details">
              <h3>Alex Vance</h3>
              <span className="user-email-tag">alex@venturelabs.ai</span>
            </div>
          </div>

          <div className="plan-status-badge">
            <Crown size={15} />
            <span>{userSubscription.planName.toUpperCase()} • ACTIVE</span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="account-tabs">
          <button
            className={`account-tab ${activeTab === 'sub' ? 'active' : ''}`}
            onClick={() => setActiveTab('sub')}
          >
            <CreditCard size={16} />
            <span>Subscriptions & Usage</span>
          </button>
          <button
            className={`account-tab ${activeTab === 'keys' ? 'active' : ''}`}
            onClick={() => setActiveTab('keys')}
          >
            <Key size={16} />
            <span>API Keys ({apiKeys.length})</span>
          </button>
          <button
            className={`account-tab ${activeTab === 'licenses' ? 'active' : ''}`}
            onClick={() => setActiveTab('licenses')}
          >
            <Box size={16} />
            <span>Tool Licenses ({purchasedLicenses.length})</span>
          </button>
        </div>

        {/* Tab 1: Subscriptions & Usage Quotas */}
        {activeTab === 'sub' && (
          <div className="account-panel active">
            <div className="quota-cards-grid">
              <div className="quota-card">
                <div className="quota-title">Monthly Neural Tokens</div>
                <div className="quota-val">3,842,100 / 15,000,000</div>
                <div className="quota-bar-wrap">
                  <div className="quota-bar-fill" style={{ width: '25.6%' }}></div>
                </div>
                <div className="quota-sub">25.6% consumed • Resets in 18 days</div>
              </div>

              <div className="quota-card">
                <div className="quota-title">Image Synthesis Credits</div>
                <div className="quota-val">820 Renders</div>
                <div className="quota-bar-wrap">
                  <div className="quota-bar-fill" style={{ width: '42%' }}></div>
                </div>
                <div className="quota-sub">H100 Turbo Queue Priority Active</div>
              </div>

              <div className="quota-card">
                <div className="quota-title">API Requests (Today)</div>
                <div className="quota-val">12,480 reqs</div>
                <div className="quota-bar-wrap">
                  <div className="quota-bar-fill" style={{ width: '18%' }}></div>
                </div>
                <div className="quota-sub">Latency avg: 14ms • 99.99% success</div>
              </div>
            </div>

            <div className="sub-manage-box">
              <div className="sub-manage-info">
                <h4>
                  Active Plan: <span className="gradient-text">{userSubscription.planName}</span>
                </h4>
                <p>
                  Next billing renewal: <strong>{userSubscription.renewsOn}</strong> • $49/mo (Billed annually)
                </p>
              </div>
              <div className="sub-manage-actions">
                <a
                  href="#pricing"
                  className="btn btn-secondary btn-sm"
                  onClick={() => setIsAccountOpen(false)}
                >
                  Change Plan
                </a>
                <button
                  className="btn btn-outline btn-sm text-danger"
                  onClick={() => addToast('Subscription cancellation scheduled at end of period.', 'info')}
                >
                  Cancel Plan
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: API Keys */}
        {activeTab === 'keys' && (
          <div className="account-panel active">
            <div className="keys-header-row">
              <div>
                <h4>Manage Secret API Keys</h4>
                <p>Use these bearer tokens to authenticate requests from your servers or client SDKs.</p>
              </div>
              <button
                className="btn btn-primary btn-sm btn-glow"
                onClick={() => setIsCreatingKey(!isCreatingKey)}
              >
                <Plus size={15} />
                <span>{isCreatingKey ? 'Close Form' : 'Generate New Key'}</span>
              </button>
            </div>

            {isCreatingKey && (
              <form onSubmit={handleCreateKeySubmit} className="new-key-inline-form">
                <input
                  type="text"
                  placeholder="Key name (e.g. Staging Server, Worker 01)..."
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  required
                />
                <button type="submit" className="btn btn-primary btn-sm">
                  Create Key
                </button>
              </form>
            )}

            <div className="keys-table-wrap">
              <table className="keys-table">
                <thead>
                  <tr>
                    <th>Key Name</th>
                    <th>Secret Key</th>
                    <th>Created</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {apiKeys.map((k) => (
                    <tr key={k.id}>
                      <td><strong>{k.name}</strong></td>
                      <td>
                        <div className="key-code-wrap">
                          <code>{k.key.slice(0, 14)}...{k.key.slice(-4)}</code>
                          <button
                            className="btn-copy-small"
                            onClick={() => handleCopyKey(k)}
                            title="Copy full key"
                          >
                            {copiedKeyId === k.id ? (
                              <Check size={13} className="text-success" />
                            ) : (
                              <Copy size={13} />
                            )}
                          </button>
                        </div>
                      </td>
                      <td>{k.created}</td>
                      <td>
                        <span className="badge-status-active">{k.status}</span>
                      </td>
                      <td>
                        <button
                          className="btn-icon-danger"
                          onClick={() => revokeApiKey(k.id)}
                          title="Revoke Key"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 3: Purchased Tool Licenses */}
        {activeTab === 'licenses' && (
          <div className="account-panel active">
            <div className="licenses-list">
              {purchasedLicenses.map((lic) => (
                <div key={lic.id} className="license-item-card">
                  <div className="lic-icon">
                    <Box size={22} />
                  </div>
                  <div className="lic-details">
                    <h4>{lic.toolName}</h4>
                    <p>Perpetual Commercial License • {lic.version}</p>
                    <span className="lic-key-tag">
                      {lic.licenseKey}
                    </span>
                  </div>
                  <div className="lic-actions">
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => addToast(`Downloading ${lic.toolName} CLI Bundle...`, 'success')}
                    >
                      <Download size={15} />
                      <span>Download CLI</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
