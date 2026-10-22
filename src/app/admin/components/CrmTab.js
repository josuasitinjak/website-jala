"use client";

import React, { useState, useMemo } from "react";
import { Users, Search, MessageSquare, Star, Plus, Phone, MapPin, ShoppingBag, Copy, Check, Download, ExternalLink } from "lucide-react";
import { CustomerDetailModal } from "./ActionModals";

export default function CrmTab({
  orders = [],
  customersList = [],
  setCustomers,
  onOpenAddCustomer
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [tierFilter, setTierFilter] = useState("Semua");
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [isCopiedBroadcast, setIsCopiedBroadcast] = useState(false);

  const formatRupiah = (num) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0
    }).format(num || 0);
  };

  // Known customer phone mapping for realistic contact
  const phoneDirectory = {
    "bu siti rahayu, s.pd": "082198765432",
    "rafi ramadhan": "081234567890",
    "daffa pratama": "085278901234",
    "aisyah putri": "081345678912",
    "pak hendra kurniawan": "081123456789",
    "kevin sanjaya": "081299887766",
    "nabila khairunnisa": "085388776655",
    "bu maya wulandari, m.pd": "082166554433",
    "dimas anggara": "081355443322",
    "zahra amalia": "085244332211"
  };

  // Dynamically compute real customer list from actual orders + custom customers
  const customers = useMemo(() => {
    const map = {};

    // 1. Populate custom/registered customers first
    customersList.forEach(c => {
      if (!c.name) return;
      const key = c.name.trim().toLowerCase();
      map[key] = {
        id: c.id || `CUST-${Math.floor(100 + Math.random() * 900)}`,
        name: c.name.trim(),
        phone: c.phone || "081200000000",
        classLocation: c.classLocation || "SMAN 1 Batam",
        totalOrders: c.totalOrders || 1,
        totalSpent: c.totalSpent || 15000,
        lastOrder: c.lastOrder || "Hari ini",
        ordersList: [],
        favoriteItems: {},
        notes: c.notes || ""
      };
    });

    // 2. Merge orders into map
    orders.forEach(order => {
      if (!order.customerName) return;
      const cleanKey = order.customerName.trim().toLowerCase();
      
      if (!map[cleanKey]) {
        let hash = 0;
        for (let i = 0; i < cleanKey.length; i++) {
          hash = (hash << 5) - hash + cleanKey.charCodeAt(i);
          hash |= 0;
        }
        const custId = `CUST-${Math.abs(hash % 900) + 100}`;

        map[cleanKey] = {
          id: custId,
          name: order.customerName.trim(),
          phone: order.phone || phoneDirectory[cleanKey] || "0821" + Math.abs(hash % 89999999 + 10000000),
          classLocation: order.address || "SMAN 1 Batam",
          totalOrders: 0,
          totalSpent: 0,
          lastOrder: order.time ? new Date(order.time).toLocaleDateString("id-ID") : "Hari ini",
          ordersList: [],
          favoriteItems: {},
          notes: ""
        };
      }

      map[cleanKey].totalOrders += 1;
      if (order.status !== "Dibatalkan") {
        map[cleanKey].totalSpent += (order.total || 0);
      }
      map[cleanKey].ordersList.push(order);

      // Track item preferences
      order.items?.forEach(item => {
        const iName = item.name || "Menu";
        map[cleanKey].favoriteItems[iName] = (map[cleanKey].favoriteItems[iName] || 0) + (item.quantity || 1);
      });
    });

    return Object.values(map).map(c => {
      const tier = c.totalOrders >= 3 ? "VIP Pelanggan" : c.totalOrders >= 2 ? "Regular" : "Pelanggan Baru";
      const favEntries = Object.entries(c.favoriteItems);
      const topFav = favEntries.length > 0 ? favEntries.sort((a, b) => b[1] - a[1])[0][0] : "Roti Kirai";
      return {
        ...c,
        tier,
        topFavorite: topFav
      };
    }).sort((a, b) => b.totalSpent - a.totalSpent);
  }, [orders, customersList]);

  const filteredCustomers = customers.filter(c => {
    const matchSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        c.phone.includes(searchTerm) ||
                        c.classLocation.toLowerCase().includes(searchTerm.toLowerCase());
    const matchTier = tierFilter === "Semua" || c.tier === tierFilter;
    return matchSearch && matchTier;
  });

  const repeatOrderCount = customers.filter(c => c.totalOrders > 1).length;
  const repeatOrderRate = customers.length > 0 ? Math.round((repeatOrderCount / customers.length) * 100) : 0;
  const totalRevenueAll = customers.reduce((s, c) => s + c.totalSpent, 0);

  const handleWhatsAppContact = (customer, e) => {
    if (e) e.stopPropagation();
    let cleanPhone = customer.phone.replace(/[^0-9]/g, "");
    if (cleanPhone.startsWith("0")) {
      cleanPhone = "62" + cleanPhone.slice(1);
    }
    const text = encodeURIComponent(
      `Halo Kak ${customer.name}! 👋 Terima kasih telah memesan di JALA (${customer.topFavorite}). Bagaimana rasa sajian kami hari ini? Ada masukan atau ingin pesan lagi untuk istirahat besok? 😊`
    );
    window.open(`https://wa.me/${cleanPhone}?text=${text}`, "_blank");
  };

  const handleCopyBroadcastList = () => {
    const list = filteredCustomers.map(c => `${c.name} (${c.phone})`).join("\n");
    navigator.clipboard.writeText(list);
    setIsCopiedBroadcast(true);
    setTimeout(() => setIsCopiedBroadcast(false), 2500);
  };

  const handleUpdateCustomerNote = (id, newNote) => {
    if (setCustomers) {
      setCustomers(prev => {
        const found = prev.find(p => p.id === id);
        if (found) {
          return prev.map(p => p.id === id ? { ...p, notes: newNote } : p);
        } else {
          const cust = customers.find(c => c.id === id);
          return [...prev, { ...cust, notes: newNote }];
        }
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Top CRM KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex justify-between items-start">
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Total Pelanggan Terdata</p>
            <h3 className="text-2xl font-bold text-gray-900 mt-1">{customers.length} Orang</h3>
            <p className="text-[11px] text-gray-500 mt-1">Gabungan transaksi web & kasir</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Users size={20} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex justify-between items-start">
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Tingkat Repeat Order</p>
            <h3 className="text-2xl font-bold text-emerald-600 mt-1">{repeatOrderRate}%</h3>
            <p className="text-[11px] text-emerald-600 font-semibold mt-1">
              {repeatOrderCount} dari {customers.length} pelanggan memesan &gt; 1 kali
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <Star size={20} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex justify-between items-start">
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Rata-rata Nilai / Pelanggan</p>
            <h3 className="text-2xl font-bold text-gray-900 mt-1">
              {formatRupiah(customers.length > 0 ? Math.round(totalRevenueAll / customers.length) : 0)}
            </h3>
            <p className="text-[11px] text-gray-500 mt-1">Total kontribusi: {formatRupiah(totalRevenueAll)}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <ShoppingBag size={20} />
          </div>
        </div>
      </div>

      {/* Action Header & Search */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <h3 className="text-base font-bold text-gray-900">Database Pelanggan & Profil Pembeli</h3>
            <p className="text-xs text-gray-500">Klik baris pelanggan untuk melihat riwayat lengkap & preferensi rasa</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyBroadcastList}
              className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-semibold transition flex items-center gap-1.5"
            >
              {isCopiedBroadcast ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
              <span>{isCopiedBroadcast ? "Tersalin!" : "Salin Kontak WA"}</span>
            </button>
            <button
              onClick={onOpenAddCustomer}
              className="px-3.5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
            >
              <Plus size={15} /> Input Kontak Pelanggan
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-gray-100">
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Cari nama pemesan, nomor WhatsApp, atau lokasi kelas..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-red-500"
            />
          </div>

          <div>
            <select
              value={tierFilter}
              onChange={e => setTierFilter(e.target.value)}
              className="w-full py-2 px-3 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-700 focus:bg-white focus:outline-none focus:ring-1 focus:ring-red-500"
            >
              <option value="Semua">Semua Kategori Loyalitas</option>
              <option value="VIP Pelanggan">VIP Pelanggan (≥ 3x order)</option>
              <option value="Regular">Regular (2x order)</option>
              <option value="Pelanggan Baru">Pelanggan Baru (1x order)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Customer Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/80 border-b border-gray-200 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                <th className="p-4">Nama Pelanggan</th>
                <th className="p-4">WhatsApp & Lokasi Antar</th>
                <th className="p-4">Menu Favorit</th>
                <th className="p-4 text-center">Frekuensi</th>
                <th className="p-4">Total Belanja</th>
                <th className="p-4">Status Loyalitas</th>
                <th className="p-4 text-center">Aksi & WA</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-gray-400">
                    Belum ada data pelanggan yang cocok.
                  </td>
                </tr>
              ) : (
                filteredCustomers.map(customer => {
                  const tierClass =
                    customer.tier === "VIP Pelanggan"
                      ? "bg-amber-100 text-amber-800 border-amber-200"
                      : customer.tier === "Regular"
                      ? "bg-blue-100 text-blue-800 border-blue-200"
                      : "bg-gray-100 text-gray-700 border-gray-200";

                  return (
                    <tr
                      key={customer.id}
                      onClick={() => setSelectedCustomer(customer)}
                      className="hover:bg-red-50/40 cursor-pointer transition"
                    >
                      <td className="p-4">
                        <span className="font-bold text-gray-900 block">{customer.name}</span>
                        <span className="text-[10px] text-gray-400 font-mono">{customer.id}</span>
                      </td>
                      <td className="p-4">
                        <p className="font-mono text-gray-700 flex items-center gap-1.5">
                          <Phone size={12} className="text-gray-400" /> {customer.phone}
                        </p>
                        <p className="text-[11px] text-gray-500 flex items-center gap-1.5 mt-0.5">
                          <MapPin size={12} className="text-red-500" /> {customer.classLocation}
                        </p>
                      </td>
                      <td className="p-4">
                        <span className="text-gray-700 font-medium block truncate max-w-[180px]">
                          {customer.topFavorite}
                        </span>
                        <span className="text-[10px] text-gray-400">Terakhir: {customer.lastOrder}</span>
                      </td>
                      <td className="p-4 font-bold text-gray-900 font-mono text-center">
                        <span className="px-2 py-1 bg-gray-100 rounded-lg">{customer.totalOrders}x</span>
                      </td>
                      <td className="p-4 font-mono font-bold text-red-600">
                        {formatRupiah(customer.totalSpent)}
                      </td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${tierClass}`}>
                          {customer.tier}
                        </span>
                      </td>
                      <td className="p-4 text-center" onClick={e => e.stopPropagation()}>
                        <button
                          onClick={(e) => handleWhatsAppContact(customer, e)}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 mx-auto transition shadow-sm"
                        >
                          <MessageSquare size={13} /> Chat WA
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Customer Detail Modal */}
      {selectedCustomer && (
        <CustomerDetailModal
          isOpen={Boolean(selectedCustomer)}
          onClose={() => setSelectedCustomer(null)}
          customer={selectedCustomer}
          onUpdateCustomerNote={handleUpdateCustomerNote}
        />
      )}
    </div>
  );
}
