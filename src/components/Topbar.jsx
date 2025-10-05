"use client";
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useDarkMode } from "../context/DarkModeContext";
import {logoImage} from "../assets/logo.jpg";
// Import the logo

export default function Topbar() {
  const { logout, user } = useAuth();
  const { isDarkMode } = useDarkMode();
  const nav = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const doLogout = () => {
    logout();
    nav("/login");
  };

  const navLinks = [
    { href: "/", label: "Data Insights", icon: "📊" },
    { href: "/customers", label: "Customers", icon: "👥" },
    { href: "/reports", label: "Reports", icon: "📈" },
  ];

  const userName = user?.name || user?.email?.split("@")[0] || "User";

  return (
    <header
      className={`shadow-md sticky top-0 z-50 border-b backdrop-blur-sm transition-colors duration-300 ${
        isDarkMode
          ? "bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 border-gray-700"
          : "bg-gradient-to-r from-white via-cyan-50 to-white border-cyan-100"
      }`}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-6 lg:px-8 py-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          {/* LOGO CHANGED HERE */}
          <img
            src={logoImage}
            alt="Transaction Book Logo"
            className="h-12 w-12 object-contain group-hover:scale-105 transition-transform"
          />
          <div className="hidden sm:block">
            <div
              className={`text-xl font-bold bg-gradient-to-r bg-clip-text text-transparent ${
                isDarkMode
                  ? "from-cyan-400 to-blue-400"
                  : "from-cyan-600 to-blue-600"
              }`}
            >
              Transaction Book
            </div>
            <div
              className={`text-xs -mt-1 transition-colors duration-300 ${
                isDarkMode ? "text-gray-400" : "text-gray-500"
              }`}
            >
              Manage your finances
            </div>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-2">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className={`group relative flex items-center gap-2 text-sm font-medium px-4 py-2.5 rounded-xl transition-all duration-200 ${
                isDarkMode
                  ? "text-gray-300 hover:text-cyan-400 hover:bg-gray-800"
                  : "text-gray-700 hover:text-cyan-600 hover:bg-white"
              }`}
            >
              <span className="text-lg group-hover:scale-110 transition-transform">
                {link.icon}
              </span>
              <span>{link.label}</span>
              <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-gradient-to-r from-cyan-500 to-blue-500 group-hover:w-3/4 transition-all duration-300 rounded-full"></span>
            </Link>
          ))}

          {/* User Profile Button */}
          <div
            className={`ml-4 pl-4 border-l transition-colors duration-300 ${
              isDarkMode ? "border-gray-700" : "border-gray-200"
            }`}
          >
            <Link
              to="/profile"
              className={`flex items-center gap-2 font-semibold px-4 py-2.5 rounded-xl text-sm transition-all duration-200 shadow-sm hover:shadow-md border group ${
                isDarkMode
                  ? "bg-gray-800 hover:bg-gray-700 text-gray-200 border-gray-700 hover:border-cyan-500"
                  : "bg-white hover:bg-gradient-to-r hover:from-cyan-50 hover:to-blue-50 text-gray-800 border-gray-200 hover:border-cyan-300"
              }`}
            >
              <div className="w-8 h-8 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm group-hover:scale-110 transition-transform shadow-sm">
                {userName.charAt(0).toUpperCase()}
              </div>
              <span className="hidden lg:inline">Hi, {userName}</span>
            </Link>
          </div>
        </nav>

        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className={`p-2.5 rounded-xl border transition-all duration-200 shadow-sm hover:shadow-md ${
              isDarkMode
                ? "text-gray-400 hover:text-cyan-400 border-gray-700 hover:border-cyan-500 hover:bg-gray-800"
                : "text-gray-600 hover:text-cyan-600 border-gray-200 hover:border-cyan-300 hover:bg-white"
            }`}
            aria-label="Toggle menu"
          >
            <svg
              className="w-6 h-6 transition-transform"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2.5"
                d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16m-7 6h7"}
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div
          className={`md:hidden border-t shadow-lg animate-in slide-in-from-top-2 duration-200 ${
            isDarkMode
              ? "bg-gray-800 border-gray-700"
              : "bg-white border-gray-100"
          }`}
        >
          <nav className="flex flex-col p-4 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                onClick={() => setIsMenuOpen(false)}
                className={`flex items-center gap-3 py-3 px-4 rounded-xl transition-all duration-200 font-medium ${
                  isDarkMode
                    ? "text-gray-300 hover:text-cyan-400 hover:bg-gray-700"
                    : "text-gray-700 hover:text-cyan-600 hover:bg-gradient-to-r hover:from-cyan-50 hover:to-blue-50"
                }`}
              >
                <span className="text-xl">{link.icon}</span>
                <span>{link.label}</span>
              </Link>
            ))}

            <div
              className={`mt-4 pt-4 border-t ${
                isDarkMode ? "border-gray-700" : "border-gray-200"
              }`}
            >
              <Link
                to="/profile"
                onClick={() => setIsMenuOpen(false)}
                className={`flex items-center gap-3 py-3 px-4 rounded-xl transition-all duration-200 font-medium ${
                  isDarkMode
                    ? "text-gray-300 hover:text-cyan-400 hover:bg-gray-700"
                    : "text-gray-700 hover:text-cyan-600 hover:bg-gradient-to-r hover:from-cyan-50 hover:to-blue-50"
                }`}
              >
                <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full flex items-center justify-center text-white font-bold shadow-sm">
                  {userName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="font-semibold">Profile</div>
                  <div
                    className={`text-xs ${
                      isDarkMode ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    {userName}
                  </div>
                </div>
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}