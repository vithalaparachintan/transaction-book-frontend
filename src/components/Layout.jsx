import React from "react";
import { Outlet } from "react-router-dom";
import Topbar from "./Topbar";
import { useDarkMode } from "../context/DarkModeContext";

export default function Layout() {
  const { isDarkMode } = useDarkMode();

  return (
    <div className={`${isDarkMode ? "bg-gray-900 text-white" : "bg-white text-black"} min-h-screen transition-colors duration-300`}>
      <Topbar />
      <main className={`container mx-auto p-4 ${isDarkMode ? "bg-gray-900" : "bg-white"}`}>
        <Outlet />
      </main>
    </div>
  );
}                 