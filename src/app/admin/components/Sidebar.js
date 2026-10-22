"use client";

import React from "react";
import { 
  LayoutDashboard, 
  Briefcase, 
  Wallet, 
  Users, 
  Megaphone, 
  BarChart3, 
  Bot, 
  ShieldCheck, 
  Settings, 
  ChevronDown, 
  ChevronRight, 
  LogOut,
  X
} from "lucide-react";

export default function Sidebar({ 
  activeTab, 
  setActiveTab, 
  activeSubTab, 
  setActiveSubTab, 
  pendingOrdersCount = 0,
  criticalStockCount = 0,
  isOpenMobile,
  setIsOpenMobile,
  onLogout
}) {
  const [openDropdowns, setOpenDropdowns] = React.useState({
    operasional: true,
    keuangan: true
  });

  const toggleDropdown = (key) => {
    setOpenDropdowns(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const navItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
      badge: null
    },
    {
      id: "operasional",
      label: "Operasional Bisnis",
      icon: Briefcase,
      hasSub: true,
      subItems: [
        { id: "produk", label: "Produk & Layanan" },
        { 
          id: "pesanan", 
          label: "Pesanan & Transaksi", 
          badge: pendingOrdersCount > 0 ? `${pendingOrdersCount}` : null, 
          badgeColor: "bg-red-600 text-white" 
        },
        { 
          id: "inventaris", 
          label: "Inventaris & Stok", 
          badge: criticalStockCount > 0 ? `${criticalStockCount}` : null, 
          badgeColor: "bg-amber-600 text-white" 
        }
      ]
    },
    {
      id: "keuangan",
      label: "Keuangan",
      icon: Wallet,
      hasSub: true,
      subItems: [
        { id: "pemasukan_pengeluaran", label: "Pemasukan & Pengeluaran" },
        { id: "arus_kas", label: "Arus Kas (Cash Flow)" },
        { id: "laporan_keuangan", label: "Laporan Keuangan" }
      ]
    },
    {
      id: "crm",
      label: "Pelanggan & CRM",
      icon: Users,
      badge: null
    },
    {
      id: "pemasaran",
      label: "Pemasaran",
      icon: Megaphone,
      badge: null
    },
    {
      id: "analitik",
      label: "Analitik & Laporan",
      icon: BarChart3,
      badge: null
    },
    {
      id: "ai_assistant",
      label: "Konsultasi & Asisten Bisnis",
      icon: Bot,
      badge: null
    },
    {
      id: "tim",
      label: "Tim & Hak Akses",
      icon: ShieldCheck,
      badge: null
    },
    {
      id: "pengaturan",
      label: "Pengaturan",
      icon: Settings,
      badge: null
    }
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setIsOpenMobile(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-gray-900 text-gray-200 flex flex-col transition-transform duration-300 ease-in-out border-r border-gray-800 ${
        isOpenMobile ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      }`}>
        {/* Brand Header with Real JALA Logo */}
        <div className="p-4 flex items-center justify-between border-b border-gray-800/80">
          <div className="flex items-center gap-3">
            <img 
              src="/images/assets/logo.jpeg" 
              alt="Logo JALA" 
              className="w-10 h-10 rounded-xl object-cover border border-gray-700 shadow-md bg-white shrink-0" 
              style={{ width: '40px', height: '40px', objectFit: 'cover' }}
            />
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg tracking-tight text-white">JALA</span>
                <span className="text-[10px] bg-red-600/20 text-red-400 border border-red-500/30 px-1.5 py-0.5 rounded font-mono font-bold">PORTAL</span>
              </div>
              <p className="text-[11px] text-gray-400 truncate">SMAN 1 Batam · Hang Lekir 9</p>
            </div>
          </div>
          <button 
            onClick={() => setIsOpenMobile(false)}
            className="lg:hidden p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800 transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Nav Items */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1 custom-scrollbar">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            if (item.hasSub) {
              const isDropdownOpen = openDropdowns[item.id];
              return (
                <div key={item.id} className="space-y-0.5">
                  <button
                    onClick={() => {
                      setActiveTab(item.id);
                      toggleDropdown(item.id);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-medium text-xs transition group ${
                      isActive 
                        ? "bg-red-600/10 text-red-400 border border-red-500/20" 
                        : "text-gray-300 hover:bg-gray-800/80 hover:text-white"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon size={17} className={isActive ? "text-red-400" : "text-gray-400 group-hover:text-white"} />
                      <span>{item.label}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-gray-400">
                      {isDropdownOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                    </div>
                  </button>

                  {/* Submenu Items */}
                  {isDropdownOpen && (
                    <div className="pl-8 pr-1 space-y-0.5 py-1">
                      {item.subItems.map((sub) => {
                        const isSubActive = activeTab === item.id && activeSubTab === sub.id;
                        return (
                          <button
                            key={sub.id}
                            onClick={() => {
                              setActiveTab(item.id);
                              setActiveSubTab(sub.id);
                              if (window.innerWidth < 1024) setIsOpenMobile(false);
                            }}
                            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition ${
                              isSubActive
                                ? "bg-red-600 text-white font-semibold shadow-sm"
                                : "text-gray-400 hover:bg-gray-800 hover:text-gray-200"
                            }`}
                          >
                            <span>{sub.label}</span>
                            {sub.badge && (
                              <span className={`text-[10px] px-2 py-0.2 rounded-full font-bold ${sub.badgeColor || 'bg-gray-700 text-gray-300'}`}>
                                {sub.badge}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            }

            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  if (window.innerWidth < 1024) setIsOpenMobile(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-medium text-xs transition group ${
                  isActive
                    ? "bg-red-600 text-white shadow-sm font-semibold"
                    : "text-gray-300 hover:bg-gray-800/80 hover:text-white"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon size={17} className={isActive ? "text-white" : "text-gray-400 group-hover:text-white"} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                    isActive ? "bg-white/20 text-white" : "bg-gray-800 text-gray-300 border border-gray-700"
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* User Card & Logout Footer */}
        <div className="p-3.5 border-t border-gray-800 bg-gray-950/70">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center font-bold text-white text-xs shrink-0 shadow">
                JS
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-white truncate">Josua Sitinjak</p>
                <p className="text-[10px] text-gray-400 truncate">Chief Executive Officer</p>
              </div>
            </div>
            <button
              onClick={onLogout}
              title="Logout dari Sistem"
              className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-gray-800 rounded-lg transition"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
