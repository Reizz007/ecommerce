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
  ShieldCheck,
  Lock,
  Eye,
  EyeOff,
  Sparkles
} from 'lucide-react';

export default function LoginModal({ isOpen, onClose, onLoginSuccess }) {
  const { addToast } = useApp();

  // Mode: 'otp' | 'password'
  const [authMode, setAuthMode] = useState('otp');
  
  // OTP step: 'email' | 'otp'
  const [step, setStep] = useState('email');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [otpHint, setOtpHint] = useState('');
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

  const resetModal = () => {
    setAuthMode('otp');
    setStep('email');
    setOtp('');
    setPassword('');
    setErrorMessage('');
    setOtpHint('');
    setIsLoading(false);
  };

  // Step 1: Send OTP to Email
  const handleSendOtp = async (e) => {
    if (e) e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    setErrorMessage('');
    setIsLoading(true);
    setOtpHint('');

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000);

    try {
      const res = await fetch(apiUrl('/api/auth/send-otp'), {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ email: cleanEmail }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      const data = await res.json().catch(() => ({}));

      if (data.success) {
        setStep('otp');
        setResendCooldown(30);

        const code = data.otp || data.dev_otp;
        if (code) {
          setOtp(String(code));
          setOtpHint(String(code));
          addToast(`🔑 Verification code: ${code}`, 'success');
        } else {
          addToast(`📨 Verification code sent to ${cleanEmail}! Please check your inbox.`, 'success');
        }
      } else {
        setErrorMessage(data.message || 'Failed to send verification code. You can also sign in with Admin Password.');
      }
    } catch (err) {
      clearTimeout(timeoutId);
      // Helpful fallback message with password option
      setErrorMessage(
        'Email delivery server timed out. You can sign in immediately using your Admin Password below.'
      );
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
      const res = await fetch(apiUrl('/api/auth/verify-otp'), {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ email: cleanEmail, otp: cleanOtp })
      });

      const data = await res.json().catch(() => ({}));

      if (data.success && data.user) {
        localStorage.setItem('synapse_user', JSON.stringify(data.user));
        if (data.token) localStorage.setItem('synapse_token', data.token);

        const isAdmin = data.user.role === 'admin' || cleanEmail === 'chetranicky@gmail.com' || cleanEmail === 'admin@synapse.ai';
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
      setErrorMessage('Failed to verify OTP. Please try again or use password login.');
    } finally {
      setIsLoading(false);
    }
  };

  // Password Login Handler
  const handlePasswordLogin = async (e) => {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      setErrorMessage('Please enter your email or username.');
      return;
    }
    if (!password) {
      setErrorMessage('Please enter your password.');
      return;
    }

    setErrorMessage('');
    setIsLoading(true);

    try {
      const res = await fetch(apiUrl('/api/auth/login'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ email: cleanEmail, password: password })
      });

      const data = await res.json().catch(() => ({}));

      if (data.success && data.user) {
        localStorage.setItem('synapse_user', JSON.stringify(data.user));
        if (data.token) localStorage.setItem('synapse_token', data.token);

        const isAdmin = data.user.role === 'admin' || cleanEmail === 'chetranicky@gmail.com' || cleanEmail === 'admin@synapse.ai';
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
        setErrorMessage(data.message || 'Invalid email or password.');
      }
    } catch (err) {
      setErrorMessage('Failed to connect to authentication server. Please check your network.');
    } finally {
      setIsLoading(false);
    }
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
              ) : authMode === 'password' ? (
                <ShieldCheck size={26} className="text-cyan" />
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
              ) : authMode === 'password' ? (
                <>Sign in with your master admin or account password.</>
              ) : (
                <>Password-free secure login. Enter your email to receive a one-time verification code.</>
              )}
            </p>
          </div>

          {/* Mode Switch Tabs (Only show in initial step) */}
          {step !== 'otp' && (
            <div className="login-tab-switch">
              <button 
                type="button" 
                className={`login-tab-btn ${authMode === 'otp' ? 'active' : ''}`}
                onClick={() => {
                  setAuthMode('otp');
                  setErrorMessage('');
                }}
              >
                <Mail size={15} />
                <span>One-Time Code</span>
              </button>
              <button 
                type="button" 
                className={`login-tab-btn ${authMode === 'password' ? 'active' : ''}`}
                onClick={() => {
                  setAuthMode('password');
                  setErrorMessage('');
                  if (!email) setEmail('chetranicky@gmail.com');
                }}
              >
                <Lock size={15} />
                <span>Admin Password</span>
              </button>
            </div>
          )}

          {/* Admin Helper Badge */}
          {step !== 'otp' && (
            <div className="login-hint-badge">
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <ShieldCheck size={15} className="text-cyan" />
                <span style={{ color: '#94a3b8' }}>Admin Email:</span>
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
                onClick={() => {
                  setEmail('chetranicky@gmail.com');
                  if (authMode === 'password') setPassword('admin123');
                }}
              >
                Auto Fill
              </button>
            </div>
          )}

          {/* Error Banner */}
          {errorMessage && (
            <div className="login-error-alert">
              <AlertCircle size={16} style={{ flexShrink: 0 }} />
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span>{errorMessage}</span>
                {authMode === 'otp' && step === 'email' && (
                  <button
                    type="button"
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#38bdf8',
                      textDecoration: 'underline',
                      cursor: 'pointer',
                      padding: 0,
                      textAlign: 'left',
                      fontSize: '0.8rem',
                      fontWeight: 600
                    }}
                    onClick={() => {
                      setAuthMode('password');
                      setErrorMessage('');
                      if (!email) setEmail('chetranicky@gmail.com');
                      setPassword('admin123');
                    }}
                  >
                    → Switch to Admin Password Login (admin123)
                  </button>
                )}
              </div>
            </div>
          )}

          {/* TAB 1: OTP FLOW */}
          {authMode === 'otp' && (
            <>
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
                        placeholder="yourname@gmail.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary btn-glow btn-full"
                    disabled={isLoading}
                  >
                    <span>{isLoading ? 'Sending Verification Code...' : 'Send Login Code'}</span>
                    <ArrowRight size={16} />
                  </button>
                </form>
              ) : (
                /* STEP 2: 6-Digit OTP Verification */
                <form onSubmit={handleVerifyOtp} className="login-form">
                  {otpHint && (
                    <div 
                      style={{
                        padding: '10px 14px',
                        background: 'rgba(16, 185, 129, 0.12)',
                        border: '1px solid rgba(16, 185, 129, 0.3)',
                        borderRadius: '8px',
                        color: '#34d399',
                        fontSize: '0.84rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Sparkles size={15} />
                        <span>Code ready: <strong>{otpHint}</strong></span>
                      </div>
                      <button
                        type="button"
                        style={{
                          background: 'rgba(16, 185, 129, 0.25)',
                          border: 'none',
                          color: '#6ee7b7',
                          padding: '2px 8px',
                          borderRadius: '4px',
                          fontSize: '0.75rem',
                          cursor: 'pointer',
                          fontWeight: 600
                        }}
                        onClick={() => setOtp(otpHint)}
                      >
                        Insert
                      </button>
                    </div>
                  )}

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
                        setOtpHint('');
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
            </>
          )}

          {/* TAB 2: PASSWORD LOGIN FLOW */}
          {authMode === 'password' && (
            <form onSubmit={handlePasswordLogin} className="login-form">
              <div className="form-group">
                <label htmlFor="pwdEmail">Admin / Account Email</label>
                <div className="input-with-icon-wrap">
                  <Mail size={16} className="input-field-icon" />
                  <input
                    id="pwdEmail"
                    type="text"
                    required
                    autoFocus
                    placeholder="chetranicky@gmail.com"
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
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Enter password (e.g. admin123)"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={{ paddingRight: '2.5rem' }}
                  />
                  <button
                    type="button"
                    style={{
                      position: 'absolute',
                      right: '0.8rem',
                      background: 'none',
                      border: 'none',
                      color: '#94a3b8',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      padding: 0
                    }}
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-glow btn-full mt-2"
                disabled={isLoading}
              >
                <span>{isLoading ? 'Signing In...' : 'Sign In with Password'}</span>
                <ArrowRight size={16} />
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
