import { createContext, useContext, useState } from "react";

const AuthContext = createContext(null);

const readUser = () => {
  try {
    const value = localStorage.getItem("roommatch_user");
    return value ? JSON.parse(value) : null;
  } catch {
    localStorage.removeItem("roommatch_user");
    localStorage.removeItem("roommatch_token");
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(readUser);
  const [token, setToken] = useState(() => localStorage.getItem("roommatch_token") || null);

  const login = (userData, jwtToken) => {
    setUser(userData);
    setToken(jwtToken);
    localStorage.setItem("roommatch_user", JSON.stringify(userData));
    localStorage.setItem("roommatch_token", jwtToken);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("roommatch_user");
    localStorage.removeItem("roommatch_token");
  };

  return <AuthContext.Provider value={{ user, token, login, logout }}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
