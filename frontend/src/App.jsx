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
import MnemonicSystem from "./components/MnemonicSystem";
import TalkWithRua from "./components/TalkWithRua";

export const TOKEN_KEY = "cosmos_token";

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem(TOKEN_KEY);
  return token ? children : <Navigate to="/login" replace />;
};

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
          <Route path="/login" element={<PublicOnlyRoute><LoginSignupLogout /></PublicOnlyRoute>} />
          <Route path="/live-voice" element={<ProtectedRoute><VCRoom /></ProtectedRoute>} />

          <Route path="/"                  element={<MasterRua />} />
          <Route path="/employees"         element={<Employees />} />
          <Route path="/ml"                element={<MLPredictor />} />
          <Route path="/syllabus"          element={<SyllabusPage />} />
          <Route path="/trainer-kpi"       element={<TrainerDashboard />} />
          <Route path="/mnemonic-system"   element={<MnemonicSystem />} />
          <Route path="/talk-with-rua"     element={<TalkWithRua />} />
          <Route path="/talk-with-rua"     element={<TalkWithRua />} /> {/* ← ADDED */}

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;