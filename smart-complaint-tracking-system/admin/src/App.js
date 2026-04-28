import React from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Complaints from "./pages/Complaints";
// import AdminPanel from "./pages/AdminPanel";
import { AuthProvider, useAuth } from "./context/Auth";
import Navbar from "./components/NavBar";
// import Footer from "./components/Footer";
import Home from "./pages/Home";  
import ComplaintDetails from './pages/ComplaintDetail'; // ✅ Import ComplaintDetails

function ProtectedRoute({ children, role }) {
  const { admin } = useAuth();
  const isAuthenticated = !!admin; // ✅ Ensure it's a boolean
  console.log("Admin state in ProtectedRoute:", admin);
  console.log("IsAuthenticated:", isAuthenticated);
  return isAuthenticated && (!role || admin.role === role) ? (
    children
  ) : (
    <Navigate to="/login" replace />
  );
}

// 🔥 Move the useAuth() check inside this component
function Layout() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/complaint" element={<ProtectedRoute><Complaints /></ProtectedRoute>} />
        <Route path="/complaint/:id" element={<ComplaintDetails />} />
      </Routes>
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
