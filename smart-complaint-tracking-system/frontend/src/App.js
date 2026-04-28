import React from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import ComplaintForm from "./pages/ComplaintForm";
import AdminPanel from "./pages/AdminPanel";
import { AuthProvider, useAuth } from "./context/Auth";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";  
import ComplaintDetails from './pages/ComplaintDetail'; // ✅ Import ComplaintDetails

function ProtectedRoute({ children, role }) {
  const { user } = useAuth();
  return user && (!role || user.role === role) ? children : <Navigate to="/login" />;
}

// 🔥 Move the useAuth() check inside this component
function Layout() { // ✅ Now useAuth() is inside AuthProvider
  return (
    <>
      <Navbar />  {/* ✅ Always visible */}
      <Routes>
        <Route path="/" element={<Home />} /> {/* 🔥 Home should be inside ProtectedRoute */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/complaint" element={<ProtectedRoute role="user"><ComplaintForm /></ProtectedRoute>} />
        <Route path="/complaint/:id" element={<ComplaintDetails />} />
        <Route path="/admin" element={<ProtectedRoute role="admin"><AdminPanel /></ProtectedRoute>} />
      </Routes>
      <Footer /> {/* ✅ Always visible */}
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Layout /> {/* ✅ Now useAuth() is inside AuthProvider */}
      </Router>
    </AuthProvider>
  );
}

export default App;
