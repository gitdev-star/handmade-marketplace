// src/App.js
import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { auth } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";

// Pages & Components
import Home from "./pages/Home";
import AdminDashboard from "./components/sellers/SellerDashboard";
import Login from "./components/auth/Login";

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // Optional: show loading while checking auth

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return <div style={{ textAlign: "center", marginTop: "50px" }}>Loading...</div>;
  }

  return (
    <Router>
      <Routes>
        {/* Public Home Page */}
        <Route path="/" element={<Home />} />

        {/* Admin Dashboard (protected) */}
        <Route
          path="/admin"
          element={
            user
              ? <AdminDashboard user={user} />
              : <Navigate to="/login" replace />
          }
        />

        {/* Login Page */}
        <Route
          path="/login"
          element={
            !user
              ? <Login />
              : <Navigate to="/admin" replace />
          }
        />

        {/* Catch-all route: redirect unknown paths to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
