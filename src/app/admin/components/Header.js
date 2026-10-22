"use client";

import React from "react";
import { Menu, RefreshCw, ExternalLink, Bell, Store } from "lucide-react";

export default function Header({
  activeTabTitle,
  activeSubTitle,
  onToggleMobileMenu,
  onRefresh,
  isLoading,
  storeOpen,
  setStoreOpen
}) {
  const [currentDate, setCurrentDate] = React.useState("");

  React.useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentDate(now.toLocaleDateString("id-ID", {
        weekday: "long",
        day: "numeric",
        month: "short",
        year: "numeric"
      }));
    };
    updateTime();
  }, []);

  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-gray-200 px-4 md:px-8 py-3.5 transition">
      <div className="flex items-center justify-between gap-4">
        {/* Left: Hamburger & Title */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleMobileMenu}
            className="lg:hidden p-2 rounded-xl text-gray-600 hover:bg-gray-100 transition"
            title="Buka Navigasi"
          >
            <Menu size={20} />
          </button>

          <div>
            <div className="flex items-center gap-2 text-xs text-gray-400 font-medium">
              <span>Portal Admin JALA</span>
              {activeSubTitle && (
                <>
                  <span>/</span>
                  <span className="text-gray-600">{activeTabTitle}</span>
                </>
              )}
            </div>
            <h1 className="text-xl md:text-2xl font-bold text-gray-800 tracking-tight flex items-center gap-2">
              {activeSubTitle || activeTabTitle}
            </h1>
          </div>
        </div>

        {/* Right: Actions, Store status, and links */}
        <div className="flex items-center gap-2 md:gap-3">
          {/* Store Open/Close Toggle */}
          <button
            onClick={() => setStoreOpen(!storeOpen)}
            className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border transition ${
              storeOpen
                ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                : "bg-red-50 text-red-700 border-red-200 hover:bg-red-100"
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${storeOpen ? "bg-emerald-500 animate-pulse" : "bg-red-500"}`}></span>
            <Store size={14} />
            <span>Gerai: {storeOpen ? "BUKA" : "TUTUP"}</span>
          </button>

          {/* Date Badge */}
          <div className="hidden md:block text-right pr-2">
            <span className="text-xs text-gray-500 font-medium">{currentDate}</span>
          </div>

          {/* Refresh Button */}
          <button
            onClick={onRefresh}
            title="Perbarui Data"
            disabled={isLoading}
            className="p-2.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition shadow-sm"
          >
            <RefreshCw size={16} className={isLoading ? "animate-spin text-red-600" : ""} />
          </button>

          {/* Visit Store Button */}
          <a
            href="/"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white px-3.5 py-2 rounded-xl text-xs font-bold transition shadow-md shadow-red-600/20"
          >
            <ExternalLink size={14} />
            <span className="hidden sm:inline">Lihat Web Toko</span>
          </a>
        </div>
      </div>
    </header>
  );
}
