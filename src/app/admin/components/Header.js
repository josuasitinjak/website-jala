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
              <span>Portal Admin <strong className="text-amber-600 font-bold">JALA</strong></span>
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
            className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${
              storeOpen
                ? "bg-white text-gray-800 border-gray-200 hover:border-amber-400"
                : "bg-white text-gray-400 border-gray-200 hover:border-gray-300"
            }`}
          >
            <Store size={13} className={storeOpen ? "text-amber-500" : "text-gray-400"} />
            <span>{storeOpen ? "Buka" : "Tutup"}</span>
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
            className="p-2.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-amber-50 hover:text-amber-700 transition shadow-sm"
          >
            <RefreshCw size={16} className={isLoading ? "animate-spin text-amber-500" : ""} />
          </button>

          {/* Visit Store Button */}
          <a
            href="/"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-gray-950 px-3.5 py-2 rounded-xl text-xs font-black transition shadow-md shadow-amber-500/20"
          >
            <ExternalLink size={14} />
            <span className="hidden sm:inline">Lihat Web Toko</span>
          </a>
        </div>
      </div>
    </header>
  );
}
