import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { authApi, type User } from "../lib/api";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const cached = localStorage.getItem("gt_user");
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("gt_token");
    if (!token) {
      setLoading(false);
      return;
    }
    authApi
      .me()
      .then((res) => {
        setUser(res.data);
        localStorage.setItem("gt_user", JSON.stringify(res.data));
        if (res.data.currency) localStorage.setItem("gt_currency", res.data.currency);
        if (res.data.language) localStorage.setItem("gt_language", res.data.language);
      })
      .catch((err) => {
        if (err.response?.status === 401) {
          localStorage.removeItem("gt_token");
          localStorage.removeItem("gt_user");
          setUser(null);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  async function login(email: string, password: string) {
    const cleanEmail = email.trim().toLowerCase();
    const res = await authApi.login({ email: cleanEmail, password });
    localStorage.setItem("gt_token", res.data.token);
    localStorage.setItem("gt_user", JSON.stringify(res.data.user));
    if (res.data.user.currency) localStorage.setItem("gt_currency", res.data.user.currency);
    if (res.data.user.language) localStorage.setItem("gt_language", res.data.user.language);
    setUser(res.data.user);
  }

  async function register(name: string, email: string, password: string) {
    const cleanEmail = email.trim().toLowerCase();
    const res = await authApi.register({ name: name.trim(), email: cleanEmail, password });
    localStorage.setItem("gt_token", res.data.token);
    localStorage.setItem("gt_user", JSON.stringify(res.data.user));
    if (res.data.user.currency) localStorage.setItem("gt_currency", res.data.user.currency);
    if (res.data.user.language) localStorage.setItem("gt_language", res.data.user.language);
    setUser(res.data.user);
  }

  function logout() {
    localStorage.removeItem("gt_token");
    localStorage.removeItem("gt_user");
    setUser(null);
  }

  async function refreshUser() {
    const res = await authApi.me();
    setUser(res.data);
    localStorage.setItem("gt_user", JSON.stringify(res.data));
    if (res.data.currency) localStorage.setItem("gt_currency", res.data.currency);
    if (res.data.language) localStorage.setItem("gt_language", res.data.language);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
