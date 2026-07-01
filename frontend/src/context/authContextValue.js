import { createContext, useContext } from 'react';

export const AuthContext = createContext({
  user: null,
  loading: true,
  error: null,
  refreshAuth: async () => {},
});

export const useAuth = () => useContext(AuthContext);
