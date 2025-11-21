import { useEffect, useRef, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthContext.jsx';

const ProfileMenu = () => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [panel, setPanel] = useState(null);
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
