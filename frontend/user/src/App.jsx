import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import { useState, useEffect } from "react";
import Layout from "./Layout/Layout";
import Home from "./pages/HomePage";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Events from "./pages/Events";
import Gallery from "./pages/Gallery";
import Membership from "./pages/Membership";
import Branches from "./pages/Branches";
import Login from "./pages/LoginPage";
import Profile from "./pages/profile";
import AllCommittees from "./pages/AllCommittees";
import BranchDetail from "./pages/BranchDetail";
import CurtainAnimation from "./components/CurtainAnimation";

function App() {
  const [showAnimation, setShowAnimation] = useState(false);
  const [animationMessage, setAnimationMessage] = useState("");
  const API_BASE_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const hasSeen = sessionStorage.getItem("hasSeenCurtain");
        if (hasSeen) return;

        const response = await axios.get(`${API_BASE_URL}/api/v1/settings`);
        if (response.data && response.data.data) {
          const { curtainAnimationEnabled, curtainAnimationMessage } = response.data.data;

          if (curtainAnimationEnabled === true || curtainAnimationEnabled === "true") {
            setAnimationMessage(curtainAnimationMessage || "Welcome!");
            setShowAnimation(true);
          }
        }
      } catch (error) {
        console.error("Failed to fetch settings:", error);
      }
    };

    fetchSettings();
  }, [API_BASE_URL]);

  const handleAnimationComplete = () => {
    setShowAnimation(false);
    sessionStorage.setItem("hasSeenCurtain", "true");
  };

  return (
    <Router>
      {showAnimation && (
        <CurtainAnimation
          message={animationMessage}
          onComplete={handleAnimationComplete}
        />
      )}
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/aboutus" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/events" element={<Events />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/membership" element={<Membership />} />
          <Route path="/branches" element={<Branches />} />
          <Route path="/branches/:branchName" element={<BranchDetail />} />
          <Route path="/branch" element={<Branches />} />
          <Route path="/branch/:branchName" element={<BranchDetail />} />
          <Route path="/login" element={<Login />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/committees" element={<AllCommittees />} />
        </Routes>
      </Layout>
      <ToastContainer />
    </Router>
  );
}

export default App;
