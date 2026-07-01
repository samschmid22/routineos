import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { AuthContext } from './authContextValue';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;

    const loadUser = async () => {
      setLoading(true);
      setError(null);

      try {
        const { data, error: userError } = await supabase.auth.getUser();
        if (!mounted) return;

        if (userError) {
          setError(userError);
          setUser(null);
        } else {
          setUser(data?.user ?? null);
        }
      } catch (authError) {
        if (mounted) {
          setError(authError);
          setUser(null);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadUser();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setError(null);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  const refreshAuth = async () => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: sessionError } = await supabase.auth.refreshSession();
      if (sessionError) throw sessionError;
      setUser(data?.session?.user ?? null);
    } catch (refreshError) {
      setError(refreshError);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  return <AuthContext.Provider value={{ user, loading, error, refreshAuth }}>{children}</AuthContext.Provider>;
};
