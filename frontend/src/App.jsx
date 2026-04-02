import "./App.css";
import { HelmetProvider } from "react-helmet-async";
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
import WhiteBoard from "./seekhowithrua-animation/WhiteBoard";
import ForgotPassword from "./components/ForgotPassword";
import Profile from "./components/Profile";

export const TOKEN_KEY = "cosmos_token";

// ProtectedRoute: only used for /login (public-only)
// /live-voice is NOT wrapped in ProtectedRoute because VCRoom
// handles its own auth internally via useCosmosAuth hook —
// it shows its own login screen if no token is found.
// This way Exit (which clears the token) doesn't cause a redirect loop.
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
    <HelmetProvider>
      <Router>
        <Navbar user={user} />
        <div className="main-wrapper">
          <Routes>
            <Route path="/login"      element={<PublicOnlyRoute><LoginSignupLogout /></PublicOnlyRoute>} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/profile"     element={<Profile />} />

            {/* VCRoom handles its own auth — no ProtectedRoute wrapper needed */}
            <Route path="/live-voice" element={<VCRoom />} />

            <Route path="/"                element={<MasterRua />} />
            <Route path="/employees"       element={<Employees />} />
            <Route path="/ml"              element={<MLPredictor />} />
            <Route path="/syllabus"        element={<SyllabusPage />} />
            <Route path="/trainer-kpi"     element={<TrainerDashboard />} />
            <Route path="/mnemonic-system" element={<MnemonicSystem />} />
            <Route path="/talk-with-rua"   element={<TalkWithRua />} />

            {/* New SEO-friendly routes */}
            <Route path="/courses"       element={<SyllabusPage />} />
            <Route path="/whiteboard"      element={<WhiteBoard />} />
            <Route path="/ml/:algorithm" element={<MLPredictor />} />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </Router>
    </HelmetProvider>
  );
}

export default App;