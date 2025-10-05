import React from "react";
import { Outlet } from "react-router-dom";
import Topbar from "./Topbar"; 

export default function Layout() {
  return (
    <>
      <Topbar />
      <main className="container mx-auto p-4">
        <Outlet />
      </main>
    </>
  );
}                 