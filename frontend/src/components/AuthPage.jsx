import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';

const AuthPage = () => {
  const [mode, setMode] = useState('signup');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [infoMessage, setInfoMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showResend, setShowResend] = useState(false);
  const [resendStatus, setResendStatus] = useState('idle');
  const [loading, setLoading] = useState(false);

  const resetMessages = () => {
    setError('');
    setInfoMessage('');
    setSuccessMessage('');
    setShowResend(false);
    setResendStatus('idle');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    resetMessages();
    setLoading(true);
    try {
      if (mode === 'login') {
        const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        if (signInError) throw signInError;
      } else {
        const { error: signUpError } = await supabase.auth.signUp({ email, password });
        if (signUpError) throw signUpError;
        setSuccessMessage('Account created. Check your email and verify your account before signing in.');
        setMode('login');
      }
    } catch (err) {
      console.error(err);
      if (mode === 'login') {
        const message = err.message?.toLowerCase() || '';
        if (message.includes('confirm') || message.includes('verify')) {
          setInfoMessage("Please verify your email address to sign in. We've sent you a new verification link.");
          setShowResend(true);
        } else {
          setError('Incorrect email or password. Please try again.');
        }
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (!email) return;
    setResendStatus('sending');
    const { error: resendError } = await supabase.auth.resend({ type: 'signup', email });
    if (resendError) {
      console.error(resendError);
      setResendStatus('error');
      setError('Unable to resend verification email. Please try again later.');
      return;
    }
    setResendStatus('sent');
    setInfoMessage('Verification email sent. Please check your inbox.');
  };

  const toggleMode = () => {
    setMode(mode === 'login' ? 'signup' : 'login');
    resetMessages();
  };

  return (
    <div className="auth-page-wrapper">
      <div className="auth-card">
        <h1 className="section-title">Sign in to Routine OS</h1>
        <p className="muted">We keep it simple—email + password only.</p>
        <form className="auth-form" onSubmit={handleSubmit}>
          <label className="auth-label">
            Email
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>
          <label className="auth-label">
            Password
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>
          {error && <p className="auth-error">{error}</p>}
          {infoMessage && (
            <div className="auth-info">
              <p>{infoMessage}</p>
              {showResend && (
                <button
                  type="button"
                  className="auth-link"
                  onClick={handleResendVerification}
                  disabled={resendStatus === 'sending'}
                >
                  {resendStatus === 'sent' ? 'Link sent!' : 'Resend verification email'}
                </button>
              )}
            </div>
          )}
          {successMessage && <p className="auth-success">{successMessage}</p>}
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Working...' : mode === 'login' ? 'Log in' : 'Sign up'}
          </button>
        </form>
        <button type="button" className="auth-toggle" onClick={toggleMode}>
          {mode === 'login' ? 'Need an account? Sign up.' : 'Have an account? Log in.'}
        </button>
      </div>
    </div>
  );
};

export default AuthPage;
