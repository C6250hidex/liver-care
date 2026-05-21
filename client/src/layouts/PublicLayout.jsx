import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";

const PublicLayout = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">
        {/* The Outlet component renders whatever page is in the current route */}
        <Outlet />
      </main>
      <footer className="bg-medical-lightSurface dark:bg-medical-darkSurface border-t border-gray-200 dark:border-slate-800 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center text-medical-lightMuted dark:text-medical-darkMuted">
          <p>© 2024 LiverCare AI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default PublicLayout;
