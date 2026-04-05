// App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"; // ✅ import router
import "./index.css";
import "leaflet/dist/leaflet.css";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from "react-toastify";
import AdminDashboard from "./pages/AdminDashboard";
import RegisterTourist from "./components/RegisterTourist";
import TouristTrackerPage from "./pages/TouristTrackerPage";
import TouristTracking from "./pages/TouristTracking";

function App() {
  return (
    <Router> {/* wrap everything in Router */}
      <>
        <Routes>
          <Route path="/" element={<AdminDashboard />} /> {/* your existing page */}
          <Route path="/register-tourist" element={<RegisterTourist />} />
          <Route path="/tourist-tracker" element={<TouristTrackerPage />} />
          <Route path="/tourist" element={<TouristTracking />} />
        </Routes>
        <ToastContainer /> {/* keep it exactly as before */}
      </>
    </Router>
  );
}

export default App;