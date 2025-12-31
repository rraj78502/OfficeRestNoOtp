import { NavLink } from "react-router-dom";
import logo from "../../assets/logo.jpg";
import { useState, useEffect } from "react";
import axios from "axios";

const api_base_url = import.meta.env.VITE_API_URL;

function Header() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);

  const navItems = [
    "Home",
    "About Us",
    "Events",
    "Branch",
    "Gallery",
    "Contact",
    "Membership",
  ];

  // Check login status and fetch user data
  useEffect(() => {
    fetchUserData();
  }, []);

  // Fetch user data from backend
  const fetchUserData = async () => {
    try {
      const response = await axios.get(`${api_base_url}/api/v1/user/check-auth`, {
        withCredentials: true,
      });
      if (response.data.success) {
        setIsLoggedIn(true);
        setUser(response.data.data);
      } else {
        setIsLoggedIn(false);
        setUser(null);
      }
    } catch (error) {
      // Handle 401 (unauthenticated) and other errors gracefully
      if (error.response?.status === 401) {
        // User is not authenticated - this is normal
        setIsLoggedIn(false);
        setUser(null);
      } else {
        // Only log actual errors, not authentication failures
        console.error("Failed to fetch user data:", error.message);
        setIsLoggedIn(false);
        setUser(null);
      }
    }
  };

  return (
    <header className="bg-[#0c1c35] text-white">
      <div className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
        <div className="flex items-center space-x-3">
          <img src={logo} alt="REST Logo" className="w-14 h-14 rounded-full" />
          <div>
            <h1 className="text-xl font-bold">नेपाल दूरसञ्चार निवृत्त कर्मचारी समाज</h1>
            <p className="text-sm text-gray-300">RETIRED EMPLOYEE'S SOCIETY OF TELECOM</p>
          </div>
        </div>
        <nav className="flex items-center space-x-6">
          {navItems.map((item) => (
            <NavLink
              key={item}
              to={
                item === "Home"
                  ? "/"
                  : item === "Branch"
                  ? "/branches"
                  : `/${item.toLowerCase().replace(/\s+/g, "")}`
              }
              className={({ isActive }) =>
                `px-3 py-1 rounded-full transition ${
                  isActive ? "bg-black text-white" : "hover:underline"
                }`
              }
            >
              {item}
            </NavLink>
          ))}
          {isLoggedIn && user ? (
            <NavLink to="/profile" className="w-10 h-10 rounded-full overflow-hidden">
              <img
                src={user.profilePic || "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMjAiIGZpbGw9IiM2MzY2RjEiLz4KPHBhdGggZD0iTTIwIDIwQzIyLjc2MTQgMjAgMjUgMTcuNzYxNCAyNSAxNUMyNSAxMi4yMzg2IDIyLjc2MTQgMTAgMjAgMTBDMTcuMjM4NiAxMCAxNSAxMi4yMzg2IDE1IDE1QzE1IDE3Ljc2MTQgMTcuNzYxNCAyMCAyMFoiIGZpbGw9IndoaXRlIi8+Cjwvc3ZnPgo="}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            </NavLink>
          ) : (
            <NavLink
              to="/login"
              className={({ isActive }) =>
                `px-3 py-1 rounded-full transition ${
                  isActive ? "bg-black text-white" : "hover:underline"
                }`
              }
            >
              Login
            </NavLink>
          )}
        </nav>
      </div>
    </header>
  );
}

export default Header;