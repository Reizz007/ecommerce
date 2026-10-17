import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { apiUrl } from '../utils/api';
import { 
  X, 
  Lock, 
  Mail, 
  ArrowRight, 
  AlertCircle, 
  Cpu 
} from 'lucide-react';

export default function LoginModal({ isOpen, onClose, onLoginSuccess }) {
  const { addToast } = useApp();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    try {
      const res = await fetch(apiUrl('/api/auth/login'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password })
      });

      const data = await res.json();

      if (data.success && data.user) {
        // Save session
        localStorage.setItem('synapse_user', JSON.stringify(data.user));
        if (data.token) localStorage.setItem('synapse_token', data.token);

        if (data.user.role === 'admin') {
          addToast(`👑 Welcome Administrator! Access granted to Control Center.`, 'success');
          onLoginSuccess(data.user, true); // true = open admin panel
        } else {
          addToast(`👋 Welcome back, ${data.user.name}!`, 'info');
          onLoginSuccess(data.user, false);
        }
        onClose();
      } else {
        setErrorMessage(data.message || 'Invalid email or password.');
      }
    } catch (err) {
      // Fallback offline mock in case backend is rebooting
      if (email.toLowerCase().includes('admin') && password === 'admin123') {
        const adminUser = { id: 'admin_1', name: 'Master Admin', email: 'admin@synapse.ai', role: 'admin' };
        localStorage.setItem('synapse_user', JSON.stringify(adminUser));
        addToast('👑 Welcome Administrator! (Offline Auth)', 'success');
        onLoginSuccess(adminUser, true);
        onClose();
      } else {
        setErrorMessage('Failed to connect to authentication server. Try admin@synapse.ai / admin123');
      }
    } finally {
      setIsLoading(false);
    }
  };



  return (
    <div className="modal-backdrop">
      <div className="modal-container login-modal-container">
        <button className="modal-close" onClick={onClose} aria-label="Close Login">
          <X size={20} />
        </button>

        <div className="login-card-inner">
          <div className="login-header text-center">
            <div className="login-icon-badge">
              <Cpu size={26} className="text-cyan" />
            </div>
            <h2>Sign In to <span className="gradient-text">SYNAPSE.AI</span></h2>
            <p className="login-subtitle">
              Sign in to manage your AI subscriptions, generate API keys, or access the admin panel.
            </p>
          </div>

          {errorMessage && (
            <div className="login-error-alert">
              <AlertCircle size={16} />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label htmlFor="loginEmail">Email Address</label>
              <div className="input-with-icon-wrap">
                <Mail size={16} className="input-field-icon" />
                <input
                  id="loginEmail"
                  type="email"
                  required
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="loginPassword">Password</label>
              <div className="input-with-icon-wrap">
                <Lock size={16} className="input-field-icon" />
                <input
                  id="loginPassword"
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-glow btn-full mt-3"
              disabled={isLoading}
            >
              <span>{isLoading ? 'Authenticating...' : 'Sign In'}</span>
              <ArrowRight size={16} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
