import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { authApi } from "../api/authApi";

/* ------------------------------------------------------------------ */
/* Context                                                              */
/* ------------------------------------------------------------------ */

const AuthContext = createContext(null);

/* ------------------------------------------------------------------ */
/* Provider                                                             */
/* ------------------------------------------------------------------ */

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem("hp_user");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  // Persist user to localStorage whenever it changes
  useEffect(() => {
    if (user) {
      localStorage.setItem("hp_user", JSON.stringify(user));
    } else {
      localStorage.removeItem("hp_user");
      localStorage.removeItem("hp_token");
    }
  }, [user]);

  // On mount, verify token is still valid
  useEffect(() => {
    const token = localStorage.getItem("hp_token");
    if (!token) {
      setLoading(false);
      return;
    }
    authApi
      .getMe()
      .then(({ data }) => setUser(data.user))
      .catch(() => {
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async ({ email, password, captchaToken }) => {
    const { data } = await authApi.login({ email, password, captchaToken });
    localStorage.setItem("hp_token", data.accessToken);
    setUser(data.user);
    return data.user; // caller can inspect role to redirect
  }, []);

  const register = useCallback(
    async ({ firstName, lastName, mi, email, password, role, phone, captchaToken }) => {
      const { data } = await authApi.register({
        firstName,
        lastName,
        mi,
        email,
        password,
        role,
        phone,
        captchaToken,
      });
      localStorage.setItem("hp_token", data.accessToken);
      setUser(data.user);
      return data.user;
    },
    [],
  );

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      // ignore network errors on logout
    } finally {
      setUser(null);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

/* ------------------------------------------------------------------ */
/* Hook                                                                  */
/* ------------------------------------------------------------------ */

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}

export default AuthContext;
