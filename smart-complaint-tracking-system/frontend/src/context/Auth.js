import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  // Load user from localStorage on page load
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  // Login function
  const login = async (email, password) => {
    try {
      const response = await axios.post(
        "http://localhost:5000/users/login",
        { email, password },
        { withCredentials: true }
      );

    const { token, user } = response.data;
    if (token) {
      localStorage.setItem("token", token); // ✅ Ensure token is stored
      localStorage.setItem("user", JSON.stringify(user));
      setUser(user);
    } else {
      console.error("No token received from server.");
    }

      return true; // Login successful
    } catch (error) {
      console.error("Login failed", error.response?.data || error.message);
      return false; // Login failed
    }
  };

  // Logout function
  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
