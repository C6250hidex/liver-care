import React, { useState } from "react";
import { useTheme } from "../context/ThemeContext";
import { Sun, Moon, Activity, Menu, X, LayoutDashboard } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const Navbar = () => {
  const { darkMode, toggleDarkMode } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const token = localStorage.getItem("token");

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "About", path: "/about" },
    { name: "Services", path: "/services" },
    { name: "Blog", path: "/blog" },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full bg-medical-lightSurface/80 dark:bg-medical-darkSurface/80 backdrop-blur-md border-b border-gray-200 dark:border-slate-800 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <Activity className="text-medical-primary w-8 h-8" />
            <span className="text-xl font-bold text-medical-lightText dark:text-medical-darkText">
              Liver<span className="text-medical-primary">Care</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={`text-sm font-semibold transition ${
                  location.pathname === link.path
                    ? "text-medical-primary"
                    : "text-medical-lightMuted dark:text-medical-darkMuted hover:text-medical-primary"
                }`}
              >
                {link.name}
              </Link>
            ))}

            <div className="flex items-center space-x-4 border-l border-gray-200 dark:border-slate-700 pl-8">
              <button
                onClick={toggleDarkMode}
                className="p-2 rounded-lg bg-gray-100 dark:bg-slate-800 text-medical-primary"
              >
                {darkMode ? (
                  <Sun size={18} className="text-yellow-400" />
                ) : (
                  <Moon size={18} />
                )}
              </button>

              {token ? (
                <Link
                  to="/dashboard"
                  className="btn-primary flex items-center space-x-2"
                >
                  <LayoutDashboard size={18} />
                  <span>Dashboard</span>
                </Link>
              ) : (
                <Link to="/login" className="btn-primary">
                  Login
                </Link>
              )}
            </div>
          </div>

          {/* Mobile Buttons */}
          <div className="flex md:hidden items-center space-x-3">
            <button
              onClick={toggleDarkMode}
              className="p-2 text-medical-primary"
            >
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-medical-lightText dark:text-medical-darkText"
            >
              {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMenuOpen && (
        <div className="md:hidden bg-medical-lightSurface dark:bg-medical-darkSurface border-b border-gray-200 dark:border-slate-800 p-4 space-y-4">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              onClick={() => setIsMenuOpen(false)}
              className="block font-medium text-medical-lightText dark:text-medical-darkText"
            >
              {link.name}
            </Link>
          ))}
          <Link
            to={token ? "/dashboard" : "/login"}
            className="block w-full text-center btn-primary"
          >
            {token ? "Go to Dashboard" : "Login / Register"}
          </Link>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
