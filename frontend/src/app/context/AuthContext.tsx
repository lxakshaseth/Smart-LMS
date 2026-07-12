import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import {
  apiRequest,
  clearAuthToken,
  getAuthToken,
  setAuthToken,
} from "../lib/api";

export interface User {
  id: string;
  fullName: string;
  email: string;
  avatar: string;
  createdAt: string;
  exam?: string;
  phone?: string;
  username?: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

interface AuthContextValue extends AuthState {
  login: (email: string, password: string, remember: boolean) => Promise<{ ok: boolean; error?: string }>;
  signup: (fullName: string, email: string, password: string, username: string, exam?: string, phone?: string) => Promise<{ ok: boolean; error?: string }>;
  logout: () => void;
  updateUser: (data: Partial<User>) => void;
}

interface ApiUser {
  id?: string;
  _id?: string;
  fullName?: string;
  name?: string;
  username?: string;
  email: string;
  phone?: string;
  exam?: string;
  createdAt?: string;
}

interface AuthResponse {
  success: boolean;
  token: string;
  user: ApiUser;
}

function initials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function normalizeUser(user: ApiUser): User {
  const fullName = user.fullName || user.name || user.username || "User";
  return {
    id: user.id || user._id || "",
    fullName,
    email: user.email,
    avatar: initials(fullName),
    createdAt: user.createdAt || "",
    exam: user.exam,
    phone: user.phone,
    username: user.username,
  };
}

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Something went wrong. Please try again.";
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });

  useEffect(() => {
    let active = true;

    async function restoreSession() {
      if (!getAuthToken()) {
        if (active) setState({ user: null, isAuthenticated: false, isLoading: false });
        return;
      }

      try {
        const response = await apiRequest<{ success: boolean; user: ApiUser }>("/auth/me");
        if (active) {
          setState({ user: normalizeUser(response.user), isAuthenticated: true, isLoading: false });
        }
      } catch {
        clearAuthToken();
        if (active) setState({ user: null, isAuthenticated: false, isLoading: false });
      }
    }

    restoreSession();
    return () => {
      active = false;
    };
  }, []);

  const login = async (email: string, password: string, remember: boolean) => {
    try {
      const response = await apiRequest<AuthResponse>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      setAuthToken(response.token, remember);
      const user = normalizeUser(response.user);
      setState({ user, isAuthenticated: true, isLoading: false });
      return { ok: true };
    } catch (error) {
      return { ok: false, error: errorMessage(error) };
    }
  };

  const signup = async (
    fullName: string,
    email: string,
    password: string,
    username: string,
    exam?: string,
    phone?: string,
  ) => {
    try {
      const response = await apiRequest<AuthResponse>("/auth/register", {
        method: "POST",
        body: JSON.stringify({ fullName, email, password, username, exam, phone }),
      });
      setAuthToken(response.token, true);
      const user = normalizeUser(response.user);
      setState({ user, isAuthenticated: true, isLoading: false });
      return { ok: true };
    } catch (error) {
      return { ok: false, error: errorMessage(error) };
    }
  };

  const logout = () => {
    clearAuthToken();
    setState({ user: null, isAuthenticated: false, isLoading: false });
  };

  const updateUser = (data: Partial<User>) => {
    setState((previous) => {
      if (!previous.user) return previous;
      return { ...previous, user: { ...previous.user, ...data } };
    });
  };

  return (
    <AuthContext.Provider value={{ ...state, login, signup, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}
