import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);

  // 🔵 Load admin & token from localStorage on page load
// Load admin & token from localStorage on page load
useEffect(() => {
  const storedAdmin = localStorage.getItem("admin");
  const token = localStorage.getItem("token");
  console.log("Loaded from LocalStorage -> Admin:", storedAdmin);
  console.log("Loaded from LocalStorage -> Token:", token);

  if (storedAdmin) {
    try {
      setAdmin(JSON.parse(storedAdmin)); // ✅ Only parse if it's valid
    } catch (error) {
      console.error("Error parsing admin from localStorage:", error);
      localStorage.removeItem("admin"); // ❌ Remove invalid data
    }
  }

  if (token) {
    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  }
}, []);


  // 🔵 Login function
  const login = async (email, password, role) => {
    try {
      const response = await axios.post(
        "http://localhost:5000/users/login",
        { email, password ,role },
        { withCredentials: true }
      );

      const { token, user } = response.data;
      if (token) {
        localStorage.setItem("token", token);
        localStorage.setItem("admin", JSON.stringify(user));
        axios.defaults.headers.common["Authorization"] = `Bearer ${token}`; // ✅ Ensure token is sent
        setAdmin(user);
        return true;
      } else {
        console.error("No token received from server.");
        return false;
      }
    } catch (error) {
      console.error("Login failed", error.response?.data || error.message);
      return false;
    }
  };

  // 🔵 Logout function
  const logout = () => {
    setAdmin(null);
    localStorage.removeItem("admin");
    localStorage.removeItem("token");
    delete axios.defaults.headers.common["Authorization"]; // ✅ Remove token from headers
  };

  return (
    <AuthContext.Provider value={{ admin, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook for using auth
export const useAuth = () => useContext(AuthContext);
