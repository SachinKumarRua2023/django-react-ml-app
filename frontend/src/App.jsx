import "./App.css";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import MasterRua from "./components/MasterRua";
import Employees from "./components/Employees";
import MLPredictor from "./pages/MLPredictor";
import SyllabusPage from "./pages/SyllabusPage";
import TrainerDashboard from "./components/TrainerDashboard";
import LoginSignupLogout from "./components/Login_Signup_Logout";
import VCRoom from "./components/VCRoom";

// ── Auth key used everywhere in this app ─────────────────────────────────────
export const TOKEN_KEY = "cosmos_token";

// Protected Route — redirects to /login if no token
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem(TOKEN_KEY);
  return token ? children : <Navigate to="/login" replace />;
};

// Public Route — redirects to /live-voice if already logged in (for login page)
const PublicOnlyRoute = ({ children }) => {
  const token = localStorage.getItem(TOKEN_KEY);
  return token ? <Navigate to="/live-voice" replace /> : children;
};

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem(TOKEN_KEY);
      const userData = localStorage.getItem("cosmos_user");
      if (token && userData) {
        try { setUser(JSON.parse(userData)); }
        catch { setUser(null); }
      } else {
        setUser(null);
      }
    };

    checkAuth();
    const interval = setInterval(checkAuth, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Router>
      <Navbar user={user} />
      <div className="main-wrapper">
        <Routes>
          {/* Auth - redirect to live-voice if already logged in */}
          <Route 
            path="/login" 
            element={
              <PublicOnlyRoute>
                <LoginSignupLogout />
              </PublicOnlyRoute>
            } 
          />

          {/* Live Voice — protected */}
          <Route
            path="/live-voice"
            element={
              <ProtectedRoute>
                <VCRoom />
              </ProtectedRoute>
            }
          />

          {/* Public pages - NO LOGIN REQUIRED */}
          <Route path="/"           element={<MasterRua />} />
          <Route path="/employees"  element={<Employees />} />
          <Route path="/ml"         element={<MLPredictor />} />
          <Route path="/syllabus"   element={<SyllabusPage />} />
          
          {/* FIXED: Trainer KPI is now PUBLIC - no ProtectedRoute wrapper */}
          <Route path="/trainer-kpi" element={<TrainerDashboard />} />

          {/* Catch all - redirect to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;