import { useEffect, useRef, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthContext.jsx';

const ProfileMenu = () => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [panel, setPanel] = useState(null);
  const [pwForm, setPwForm] = useState({ current: '', next: '', confirm: '' });
  const [pwStatus, setPwStatus] = useState({ loading: false, error: '', success: '' });
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setOpen(false);
  };

  const handlePasswordReset = async () => {
    if (!user?.email) return;
    try {
      await supabase.auth.resetPasswordForEmail(user.email);
    } catch (err) {
      console.error('Password reset error', err);
    }
  };

  const handlePasswordUpdate = async (event) => {
    event.preventDefault();
    setPwStatus({ loading: true, error: '', success: '' });
    if (!pwForm.current || !pwForm.next || !pwForm.confirm) {
      setPwStatus({ loading: false, error: 'All fields are required.', success: '' });
      return;
    }
    if (pwForm.next !== pwForm.confirm) {
      setPwStatus({ loading: false, error: 'New passwords do not match.', success: '' });
      return;
    }
    try {
      const { error: verifyError } = await supabase.auth.signInWithPassword({
        email: user?.email,
        password: pwForm.current,
      });
      if (verifyError) throw verifyError;
      const { error: updateError } = await supabase.auth.updateUser({ password: pwForm.next });
      if (updateError) throw updateError;
      setPwForm({ current: '', next: '', confirm: '' });
      setPwStatus({ loading: false, error: '', success: 'Password updated successfully.' });
    } catch (err) {
      console.error('Password update error', err);
      setPwStatus({
        loading: false,
        error: "We couldn't update your password. Please check your current password and try again.",
        success: '',
      });
    }
  };

  const userInitial = user?.email?.[0]?.toUpperCase() ?? 'U';

  return (
    <div className="profile-menu" ref={dropdownRef}>
      <button type="button" className="profile-trigger" onClick={() => setOpen((prev) => !prev)}>
        {userInitial}
      </button>
      {open && (
        <div className="profile-dropdown">
          <button type="button" onClick={() => { setPanel('account'); setOpen(false); }}>
            Account settings
          </button>
          <button type="button" onClick={() => { setPanel('notifications'); setOpen(false); }}>
            Notifications
          </button>
          {/* <button type="button">Manage subscription</button> */}
          <button type="button" onClick={handleSignOut}>
            Sign out
          </button>
        </div>
      )}
      {panel && (
        <div className="profile-panel-overlay" onClick={() => setPanel(null)}>
          <div className="profile-panel" onClick={(e) => e.stopPropagation()}>
            <div className="profile-panel-header">
              <h3>{panel === 'account' ? 'Account settings' : 'Notifications'}</h3>
              <button type="button" className="profile-panel-close" onClick={() => setPanel(null)}>
                ✕
              </button>
            </div>
            {panel === 'account' ? (
          <div className="profile-panel-body">
            <p>
              <span className="muted">Email:</span> {user?.email}
            </p>
            <p>
              <span className="muted">User ID:</span> {user?.id}
            </p>
            <button type="button" className="profile-secondary-btn" onClick={handlePasswordReset}>
              Send password reset email
            </button>
            <form className="profile-password-form" onSubmit={handlePasswordUpdate}>
              <label className="stack xs">
                <span className="label">Current password</span>
                <input
                  className="input"
                  type="password"
                  value={pwForm.current}
                  onChange={(e) => setPwForm((prev) => ({ ...prev, current: e.target.value }))}
                  required
                />
              </label>
              <label className="stack xs">
                <span className="label">New password</span>
                <input
                  className="input"
                  type="password"
                  value={pwForm.next}
                  onChange={(e) => setPwForm((prev) => ({ ...prev, next: e.target.value }))}
                  required
                />
              </label>
              <label className="stack xs">
                <span className="label">Confirm new password</span>
                <input
                  className="input"
                  type="password"
                  value={pwForm.confirm}
                  onChange={(e) => setPwForm((prev) => ({ ...prev, confirm: e.target.value }))}
                  required
                />
                {pwStatus.error && <p className="auth-error">{pwStatus.error}</p>}
                {pwStatus.success && <p className="auth-success">{pwStatus.success}</p>}
              </label>
              <button type="submit" className="profile-secondary-btn" disabled={pwStatus.loading}>
                {pwStatus.loading ? 'Updating...' : 'Update password'}
              </button>
            </form>
          </div>
        ) : (
              <div className="profile-panel-body">
                <p className="muted">Notification preferences coming soon.</p>
                <div className="profile-placeholder-pill">Daily reminder emails</div>
                <div className="profile-placeholder-pill">AI coach notifications</div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileMenu;
