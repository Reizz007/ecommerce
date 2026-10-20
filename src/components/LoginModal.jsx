import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { apiUrl } from '../utils/api';
import { 
  X, 
  Mail, 
  ArrowRight, 
  AlertCircle, 
  KeyRound, 
  RotateCw, 
  ArrowLeft,
  Lock,
  ShieldCheck
} from 'lucide-react';

export default function LoginModal({ isOpen, onClose, onLoginSuccess }) {
  const { addToast } = useApp();

  // Mode: 'otp' | 'password'
  const [loginMode, setLoginMode] = useState('otp');
  // OTP step: 'email' | 'otp'
  const [step, setStep] = useState('email');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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

  const resetModal = () => {
    setLoginMode('otp');
    setStep('email');
    setOtp('');
    setPassword('');
    setErrorMessage('');
    setIsLoading(false);
  };

  // Password-based login for Admin / Users
  const handlePasswordLogin = async (e) => {
    if (e) e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      setErrorMessage('Please enter your email address.');
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

      if (res.ok && data.success && data.user) {
        localStorage.setItem('synapse_user', JSON.stringify(data.user));
        if (data.token) localStorage.setItem('synapse_token', data.token);

        const isAdmin = data.user.role === 'admin' || cleanEmail === 'chetranicky@gmail.com' || cleanEmail === 'admin@synapse.ai' || cleanEmail === 'admin@dyzzstore.com';
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
        setErrorMessage(data.message || 'Invalid email or password. (Default admin password is admin123)');
      }
    } catch (err) {
      setErrorMessage('Could not connect to authentication server. Please try again.');
    } finally {
      setIsLoading(false);
    }
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

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 20000);

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

      if (res.ok && data.success) {
        setStep('otp');
        setResendCooldown(30);
        if (data.otp) {
          addToast(`🔑 Verification code: ${data.otp}`, 'success');
        } else {
          addToast(`📨 Verification code sent to ${cleanEmail}! Please check your inbox.`, 'success');
        }
      } else {
        setErrorMessage(data.message || 'Failed to send verification code. Please check your email address and try again.');
      }
    } catch (err) {
      clearTimeout(timeoutId);
      setErrorMessage(err.name === 'AbortError' 
        ? 'Request timed out. Please try again or use Admin Password login below.' 
        : `Could not connect to authentication server (${apiUrl('')}). Please make sure the Laravel backend server is running or sign in with Password below.`);
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Verify OTP & Sign In
  const handleVerifyOtp = async (e) => {
    if (e) e.preventDefault();
    const cleanOtp = otp.trim();
    if (cleanOtp.length < 4) {
      setErrorMessage('Please enter the verification code.');
      return;
    }

    setErrorMessage('');
    setIsLoading(true);
    const cleanEmail = email.trim().toLowerCase();

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    let verifiedUser = null;
    let verifiedToken = null;

    try {
      const res = await fetch(apiUrl('/api/auth/verify-otp'), {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ email: cleanEmail, otp: cleanOtp }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json().catch(() => ({}));
        if (data.success && data.user) {
          verifiedUser = data.user;
          verifiedToken = data.token;
        } else if (data.message) {
          setErrorMessage(data.message);
          setIsLoading(false);
          return;
        }
      }
    } catch (err) {
      clearTimeout(timeoutId);
    }

    // Verify against offline resilient OTP if remote authentication server failed
    if (!verifiedUser) {
      try {
        const raw = sessionStorage.getItem('synapse_offline_otp_' + cleanEmail);
        if (raw) {
          const stored = JSON.parse(raw);
          if (stored.otp === cleanOtp && stored.expiresAt > Date.now()) {
            sessionStorage.removeItem('synapse_offline_otp_' + cleanEmail);
            const isAdmin = cleanEmail === 'chetranicky@gmail.com' || cleanEmail === 'admin@synapse.ai' || cleanEmail === 'admin@dyzzstore.com';
            verifiedUser = {
              id: isAdmin ? 'admin_master' : `user_${Date.now()}`,
              name: isAdmin ? 'Master Admin' : cleanEmail.split('@')[0],
              email: cleanEmail,
              role: isAdmin ? 'admin' : 'user'
            };
            verifiedToken = `token_${Date.now()}`;
          }
        }
      } catch (err) {}
    }

    if (verifiedUser) {
      localStorage.setItem('synapse_user', JSON.stringify(verifiedUser));
      if (verifiedToken) localStorage.setItem('synapse_token', verifiedToken);

      const isAdmin = verifiedUser.role === 'admin' || cleanEmail === 'chetranicky@gmail.com' || cleanEmail === 'admin@synapse.ai' || cleanEmail === 'admin@dyzzstore.com';
      if (isAdmin) {
        addToast('👑 Welcome Administrator! Access granted to Control Center.', 'success');
        onLoginSuccess(verifiedUser, true);
      } else {
        addToast(`👋 Welcome back, ${verifiedUser.name}!`, 'info');
        onLoginSuccess(verifiedUser, false);
      }
      onClose();
      resetModal();
    } else if (!errorMessage) {
      setErrorMessage('Invalid or expired verification code. Please check your code and try again.');
    }

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
              {loginMode === 'password' ? (
                <Lock size={26} className="text-cyan" />
              ) : step === 'otp' ? (
                <KeyRound size={26} className="text-cyan" />
              ) : (
                <Mail size={26} className="text-cyan" />
              )}
            </div>
            <h2>
              {loginMode === 'password' ? (
                <span>Admin <span className="gradient-text">Password</span></span>
              ) : step === 'otp' ? (
                <span>Verify <span className="gradient-text">OTP Code</span></span>
              ) : (
                <span>Sign In with <span className="gradient-text">OTP</span></span>
              )}
            </h2>
            <p className="login-subtitle">
              {loginMode === 'password' ? (
                <>Sign in with your administrator email and password.</>
              ) : step === 'otp' ? (
                <>Enter the 6-digit code sent to <strong className="text-cyan">{email}</strong></>
              ) : (
                <>Passwordless secure login. Enter your email to receive a one-time verification code.</>
              )}
            </p>
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div className="login-error-alert">
              <AlertCircle size={16} style={{ flexShrink: 0 }} />
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span>{errorMessage}</span>
              </div>
            </div>
          )}

          {/* Form Switch: Password vs OTP */}
          {loginMode === 'password' ? (
            <form onSubmit={handlePasswordLogin} className="login-form" autoComplete="off">
              <div className="form-group">
                <label htmlFor="loginEmail">Email Address</label>
                <div className="input-with-icon-wrap">
                  <Mail size={16} className="input-field-icon" />
                  <input
                    id="loginEmail"
                    type="email"
                    autoComplete="off"
                    required
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
                    type="password"
                    autoComplete="current-password"
                    required
                    autoFocus
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-glow btn-full"
                disabled={isLoading}
              >
                <span>{isLoading ? 'Signing In...' : 'Sign In as Administrator'}</span>
                <ArrowRight size={16} />
              </button>

              <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                <button
                  type="button"
                  style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '0.8rem', cursor: 'pointer', textDecoration: 'underline' }}
                  onClick={() => { setLoginMode('otp'); setErrorMessage(''); }}
                >
                  Sign in with Email OTP Code instead
                </button>
              </div>
            </form>
          ) : step === 'email' ? (
            <form onSubmit={handleSendOtp} className="login-form" autoComplete="off">
              <div className="form-group">
                <label htmlFor="loginEmail">Email Address</label>
                <div className="input-with-icon-wrap">
                  <Mail size={16} className="input-field-icon" />
                  <input
                    id="loginEmail"
                    type="email"
                    autoComplete="off"
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

              <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                <button
                  type="button"
                  style={{ background: 'none', border: 'none', color: '#64748b', fontSize: '0.8rem', cursor: 'pointer' }}
                  onClick={() => { setLoginMode('password'); setErrorMessage(''); }}
                >
                  🔐 Administrator? Sign in with Password
                </button>
              </div>
            </form>
          ) : (
            /* STEP 2: 6-Digit OTP Verification */
            <form onSubmit={handleVerifyOtp} className="login-form" autoComplete="off">
              <div className="form-group">
                <label htmlFor="loginOtp">Enter 6-Digit Verification Code</label>
                <div className="input-with-icon-wrap">
                  <KeyRound size={16} className="input-field-icon" />
                  <input
                    id="loginOtp"
                    type="text"
                    inputMode="numeric"
                    autoComplete="off"
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
