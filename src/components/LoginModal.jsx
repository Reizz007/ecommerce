import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { apiUrl } from '../utils/api';
import { 
  X, 
  Mail, 
  ArrowRight, 
  AlertCircle, 
  Cpu, 
  KeyRound, 
  RotateCw, 
  ArrowLeft,
  CheckCircle2,
  ShieldCheck
} from 'lucide-react';

export default function LoginModal({ isOpen, onClose, onLoginSuccess }) {
  const { addToast } = useApp();

  // 'email' | 'otp'
  const [step, setStep] = useState('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);

  // Cooldown countdown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  if (!isOpen) return null;

  // Step 1: Send OTP to Email
  const handleSendOtp = async (e) => {
    if (e) e.preventDefault();
    if (!email || !email.includes('@')) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    setErrorMessage('');
    setIsLoading(true);

    const cleanEmail = email.trim().toLowerCase();

    try {
      let res = await fetch(apiUrl('/api/auth/send-otp'), {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ email: cleanEmail })
      });

      let data = await res.json().catch(() => ({}));

      // If Render failed or timed out on port 587, automatically fallback to local server
      if (!data.success && (res.status >= 500 || data.message?.includes('timed out') || data.message?.includes('587'))) {
        try {
          const localRes = await fetch('http://127.0.0.1:8000/api/auth/send-otp', {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            },
            body: JSON.stringify({ email: cleanEmail })
          });
          const localData = await localRes.json();
          if (localData.success) {
            data = localData;
          }
        } catch (_) {}
      }

      if (data.success) {
        setStep('otp');
        setResendCooldown(30);
        addToast(`📨 Verification code sent to ${cleanEmail}! Please check your inbox.`, 'success');
      } else {
        setErrorMessage(data.message || 'Failed to send verification code. Please try again.');
      }
    } catch (err) {
      // If network failed to Render, try local server
      try {
        const localRes = await fetch('http://127.0.0.1:8000/api/auth/send-otp', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({ email: cleanEmail })
        });
        const localData = await localRes.json();
        if (localData.success) {
          setStep('otp');
          setResendCooldown(30);
          addToast(`📨 Verification code sent to ${cleanEmail}! Please check your inbox.`, 'success');
          return;
        }
      } catch (_) {}

      setErrorMessage('Failed to connect to authentication server. Please check your network.');
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Verify OTP & Sign In
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    const cleanOtp = otp.trim();
    if (cleanOtp.length < 4) {
      setErrorMessage('Please enter the verification code.');
      return;
    }

    setErrorMessage('');
    setIsLoading(true);

    const cleanEmail = email.trim().toLowerCase();

    try {
      let res = await fetch(apiUrl('/api/auth/verify-otp'), {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ email: cleanEmail, otp: cleanOtp })
      });

      let data = await res.json().catch(() => ({}));

      // If remote verify failed, try local server verification
      if (!data.success) {
        try {
          const localRes = await fetch('http://127.0.0.1:8000/api/auth/verify-otp', {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            },
            body: JSON.stringify({ email: cleanEmail, otp: cleanOtp })
          });
          const localData = await localRes.json();
          if (localData.success) {
            data = localData;
          }
        } catch (_) {}
      }

      if (data.success && data.user) {
        localStorage.setItem('synapse_user', JSON.stringify(data.user));
        if (data.token) localStorage.setItem('synapse_token', data.token);

        const isAdmin = data.user.role === 'admin' || cleanEmail === 'chetranicky@gmail.com';
        if (isAdmin) {
          addToast('👑 Welcome Administrator! Access granted to Control Center.', 'success');
          onLoginSuccess(data.user, true);
        } else {
          addToast(`👋 Welcome back, ${data.user.name}!`, 'info');
          onLoginSuccess(data.user, false);
        }
        onClose();
        resetModal();
      } else {
        setErrorMessage(data.message || 'Invalid or expired verification code.');
      }
    } catch (err) {
      // Fallback to local
      try {
        const localRes = await fetch('http://127.0.0.1:8000/api/auth/verify-otp', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({ email: cleanEmail, otp: cleanOtp })
        });
        const localData = await localRes.json();
        if (localData.success && localData.user) {
          localStorage.setItem('synapse_user', JSON.stringify(localData.user));
          if (localData.token) localStorage.setItem('synapse_token', localData.token);
          addToast('👑 Welcome Administrator! Access granted to Control Center.', 'success');
          onLoginSuccess(localData.user, true);
          onClose();
          resetModal();
          return;
        }
      } catch (_) {}

      setErrorMessage('Failed to connect to authentication server. Please check your network.');
    } finally {
      setIsLoading(false);
    }
  };

  const resetModal = () => {
    setStep('email');
    setOtp('');
    setErrorMessage('');
    setIsLoading(false);
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-container login-modal-container">
        <button 
          className="modal-close" 
          onClick={() => {
            onClose();
            resetModal();
          }} 
          aria-label="Close Login"
        >
          <X size={20} />
        </button>

        <div className="login-card-inner">
          <div className="login-header text-center">
            <div className="login-icon-badge">
              {step === 'otp' ? (
                <KeyRound size={26} className="text-cyan" />
              ) : (
                <Cpu size={26} className="text-cyan" />
              )}
            </div>
            <h2>
              {step === 'otp' ? (
                <span>Verify <span className="gradient-text">OTP Code</span></span>
              ) : (
                <span>Sign In to <span className="gradient-text">SYNAPSE.AI</span></span>
              )}
            </h2>
            <p className="login-subtitle">
              {step === 'otp' ? (
                <>Enter the 6-digit code sent to <strong className="text-cyan">{email}</strong></>
              ) : (
                <>Password-free secure login. Enter your email to receive a one-time verification code.</>
              )}
            </p>
          </div>

          {errorMessage && (
            <div className="login-error-alert">
              <AlertCircle size={16} />
              <span>{errorMessage}</span>
            </div>
          )}

          {step === 'email' ? (
            /* STEP 1: Email Input */
            <form onSubmit={handleSendOtp} className="login-form">
              <div className="form-group">
                <label htmlFor="loginEmail">Email Address</label>
                <div className="input-with-icon-wrap">
                  <Mail size={16} className="input-field-icon" />
                  <input
                    id="loginEmail"
                    type="email"
                    required
                    autoFocus
                    placeholder="chetranicky@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              {/* Quick Admin Helper Badge */}
              <div 
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  background: 'rgba(56, 189, 248, 0.08)',
                  border: '1px solid rgba(56, 189, 248, 0.2)',
                  marginBottom: '1rem',
                  fontSize: '0.8rem'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <ShieldCheck size={15} className="text-cyan" />
                  <span style={{ color: '#94a3b8' }}>Admin Login:</span>
                  <span style={{ color: '#e2e8f0', fontWeight: 600 }}>chetranicky@gmail.com</span>
                </div>
                <button
                  type="button"
                  style={{
                    background: 'rgba(56, 189, 248, 0.2)',
                    border: '1px solid rgba(56, 189, 248, 0.35)',
                    color: '#38bdf8',
                    padding: '3px 8px',
                    borderRadius: '5px',
                    fontSize: '0.72rem',
                    cursor: 'pointer',
                    fontWeight: 600
                  }}
                  onClick={() => setEmail('chetranicky@gmail.com')}
                >
                  Use Admin
                </button>
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-glow btn-full"
                disabled={isLoading}
              >
                <span>{isLoading ? 'Sending OTP Code...' : 'Send Login Code'}</span>
                <ArrowRight size={16} />
              </button>
            </form>
          ) : (
            /* STEP 2: 6-Digit OTP Verification */
            <form onSubmit={handleVerifyOtp} className="login-form">
              <div className="form-group">
                <label htmlFor="loginOtp">Enter 6-Digit Verification Code</label>
                <div className="input-with-icon-wrap">
                  <KeyRound size={16} className="input-field-icon" />
                  <input
                    id="loginOtp"
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={6}
                    required
                    autoFocus
                    placeholder="••••••"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    style={{
                      fontSize: '1.4rem',
                      letterSpacing: '8px',
                      textAlign: 'center',
                      fontFamily: 'monospace',
                      fontWeight: 700
                    }}
                  />
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-glow btn-full mt-3"
                disabled={isLoading || otp.length < 4}
              >
                <span>{isLoading ? 'Verifying Code...' : 'Verify & Sign In'}</span>
                <ArrowRight size={16} />
              </button>

              <div 
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginTop: '1.25rem',
                  paddingTop: '0.75rem',
                  borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                  fontSize: '0.82rem'
                }}
              >
                <button
                  type="button"
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#94a3b8',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    cursor: 'pointer'
                  }}
                  onClick={() => {
                    setStep('email');
                    setOtp('');
                    setErrorMessage('');
                  }}
                >
                  <ArrowLeft size={14} />
                  <span>Change Email</span>
                </button>

                <button
                  type="button"
                  disabled={resendCooldown > 0 || isLoading}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: resendCooldown > 0 ? '#64748b' : '#38bdf8',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    cursor: resendCooldown > 0 ? 'not-allowed' : 'pointer'
                  }}
                  onClick={() => handleSendOtp()}
                >
                  <RotateCw size={14} className={isLoading ? 'animate-spin' : ''} />
                  <span>{resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Code'}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
