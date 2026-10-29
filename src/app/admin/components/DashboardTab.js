"use client";

import React, { useMemo } from "react";
import { 
  DollarSign, 
  ShoppingBag, 
  TrendingUp, 
  AlertCircle, 
  Clock, 
  ArrowUpRight, 
  PlusCircle, 
  FileText, 
  CheckCircle2, 
  Flame, 
  Sparkles,
  ChevronRight
} from "lucide-react";

export default function DashboardTab({
  orders = [],
  inventory = [],
  transactions = [],
  products = [],
  settings = {},
  onNavigate,
  onOpenQuickOrder,
  onOpenQuickExpense,
  onUpdateOrderStatus,
  onViewProof
}) {
  const validOrders = orders.filter(o => o.status !== "Dibatalkan");
  const totalRevenue = validOrders.reduce((sum, o) => sum + (o.total || 0), 0);
  const pendingOrders = validOrders.filter(o => o.status !== "Selesai").length;
  const completedOrders = validOrders.filter(o => o.status === "Selesai").length;

  // Real Expenses from recorded operational transactions
  const totalExpenses = transactions
    .filter(t => t.type === "Pengeluaran")
    .reduce((sum, t) => sum + (t.amount || 0), 0);

  const estimatedProfit = Math.max(0, totalRevenue - totalExpenses);

  // Read quotas from settings or defaults
  const KUOTA = {
    kariMax: settings?.dailyTargets?.kariQuota || 15,
    ayamMax: settings?.dailyTargets?.ayamQuota || 15,
    kejuMax: settings?.dailyTargets?.kejuQuota || 15,
    telangMax: settings?.dailyTargets?.telangQuota || 20,
    dailyTargetRevenue: settings?.dailyTargets?.dailyRevenueTarget || 300000
  };

  // Real calculation of sold portions from actual order items
  let soldKari = 0, soldAyam = 0, soldKeju = 0, soldTelang = 0;

  validOrders.forEach(order => {
    order.items?.forEach(item => {
      const name = (item.name || "").toLowerCase();
      const qty = item.quantity || 1;
      if (name.includes("paket hemat")) { soldKari += qty; }
      else if (name.includes("paket lengkap")) { soldKari += qty; soldTelang += qty; }
      else if (name.includes("paket berdua")) { soldKari += qty; soldKeju += qty; soldTelang += 2 * qty; }
      else if (name.includes("paket puas")) { soldKari += qty; soldAyam += qty; soldKeju += qty; soldTelang += 2 * qty; }
      else if (name.includes("kari")) { soldKari += qty; }
      else if (name.includes("ayam")) { soldAyam += qty; }
      else if (name.includes("keju")) { soldKeju += qty; }
      else if (name.includes("telang")) { soldTelang += qty; }
    });
  });

  const totalPortionsSold = soldKari + soldAyam + soldKeju + soldTelang;
  const totalCapacity = KUOTA.kariMax + KUOTA.ayamMax + KUOTA.kejuMax + KUOTA.telangMax;
  const capacityPercent = totalCapacity > 0 ? Math.min(100, Math.round((totalPortionsSold / totalCapacity) * 100)) : 0;

  // Real Weekly Breakdown from order timestamps
  const weeklyData = useMemo(() => {
    const days = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
    const now = new Date();
    const result = [];

    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dayName = days[d.getDay()];
      const dateStr = d.toISOString().slice(0, 10);

      // Sum orders for this date
      const daySales = validOrders
        .filter(o => o.time && o.time.slice(0, 10) === dateStr)
        .reduce((s, o) => s + (o.total || 0), 0);

      result.push({
        day: dayName,
        date: dateStr,
        sales: daySales,
        isToday: i === 0
      });
    }

    const maxSales = Math.max(...result.map(r => r.sales), 100000);
    return result.map(r => ({
      ...r,
      heightPercent: Math.max(12, Math.round((r.sales / maxSales) * 100))
    }));
  }, [validOrders]);

  const criticalInventory = inventory.filter(i => i.status === "Kritis" || i.status === "Menipis");

  const formatRupiah = (num) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0
    }).format(num || 0);
  };

  const statusColors = {
    "Pesanan Diterima": "bg-amber-100 text-amber-800 border-amber-200",
    "Sedang Diproses": "bg-blue-100 text-blue-800 border-blue-200",
    "Sedang Diantar": "bg-purple-100 text-purple-800 border-purple-200",
    "Selesai": "bg-emerald-100 text-emerald-800 border-emerald-200",
    "Dibatalkan": "bg-rose-100 text-rose-800 border-rose-200 opacity-60"
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Alert if Critical Stock */}
      {criticalInventory.length > 0 && (
        <div className="bg-amber-50/80 border border-amber-200 p-4 rounded-2xl flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-700 flex items-center justify-center shrink-0">
              <AlertCircle size={18} />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-900">Pemberitahuan Stok Bahan: {criticalInventory.length} Item Menipis</p>
              <p className="text-xs text-gray-600">
                Item seperti {criticalInventory.map(c => c.name).slice(0, 2).join(", ")} mendekati batas aman produksi harian.
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigate("operasional", "inventaris")}
            className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-xl transition whitespace-nowrap shadow-sm"
          >
            Lihat Stok
          </button>
        </div>
      )}

      {/* Primary KPI Cards (Fully Real-time & Calculated) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {/* Total Omzet */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-sm relative overflow-hidden group hover:shadow-md transition">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Total Omzet Penjualan</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">{formatRupiah(totalRevenue)}</h3>
              <p className="text-xs text-gray-500 mt-2">
                Dari <strong className="text-gray-900 font-bold">{validOrders.length}</strong> pesanan sukses masuk
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100">
              <DollarSign size={20} />
            </div>
          </div>
        </div>

        {/* Antrean Pesanan */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-sm relative overflow-hidden group hover:shadow-md transition">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Antrean Pesanan Aktif</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">
                {pendingOrders} <span className="text-xs font-normal text-gray-500">Antre</span>
              </h3>
              <p className="text-xs text-gray-500 mt-2">
                <span className="font-semibold text-emerald-600">{completedOrders}</span> pesanan telah selesai
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
              <ShoppingBag size={20} />
            </div>
          </div>
        </div>

        {/* Laba Bersih */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-sm relative overflow-hidden group hover:shadow-md transition">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Estimasi Laba Bersih</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">{formatRupiah(estimatedProfit)}</h3>
              <p className="text-xs text-gray-500 mt-2">
                Omzet dikurangi pengeluaran operasional
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 border border-purple-100">
              <TrendingUp size={20} />
            </div>
          </div>
        </div>

        {/* Target Harian PKWU */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-sm relative overflow-hidden group hover:shadow-md transition">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Target Porsi Harian</p>
              <h3 className="text-2xl font-bold text-amber-600 mt-1">{capacityPercent}%</h3>
              <p className="text-xs text-gray-500 mt-2">
                {totalPortionsSold} dari {totalCapacity} porsi terjual
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-100">
              <Flame size={20} />
            </div>
          </div>
        </div>
      </div>

      {/* Middle Grid: Weekly Chart & Daily Quota Monitoring */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Trend Bar Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h4 className="font-bold text-gray-900 text-sm">Penjualan 7 Hari Terakhir</h4>
              <p className="text-xs text-gray-500 mt-0.5">Omzet riil dihitung dari pesanan terdata</p>
            </div>
            <span className="text-xs text-gray-500 font-medium">
              Total 7 Hari: <strong className="text-gray-900">{formatRupiah(totalRevenue)}</strong>
            </span>
          </div>

          {/* Bar Chart Visualization */}
          <div className="flex items-end justify-between h-44 pt-4 px-4 border-b border-gray-100">
            {weeklyData.map((item, idx) => (
              <div key={idx} className="flex flex-col items-center gap-2 group w-12">
                <div className="opacity-0 group-hover:opacity-100 transition text-[10px] bg-gray-900 text-white px-1.5 py-0.5 rounded pointer-events-none whitespace-nowrap mb-1">
                  {formatRupiah(item.sales)}
                </div>
                <div className="w-full bg-gray-100 rounded-t-lg relative flex items-end h-28 overflow-hidden">
                  <div
                    style={{ height: `${item.heightPercent}%` }}
                    className={`w-full rounded-t-lg transition-all duration-500 ${
                      item.isToday
                        ? "bg-amber-500"
                        : item.sales > 0
                        ? "bg-amber-300"
                        : "bg-gray-200"
                    }`}
                  ></div>
                </div>
                <span className={`text-xs font-semibold ${item.isToday ? "text-amber-700 font-bold" : "text-gray-500"}`}>
                  {item.day}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Daily Quota Card */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-4 border-b border-gray-100 pb-2">
              <h4 className="font-bold text-gray-900 text-sm">Sisa Stok Menu Hari Ini</h4>
              <span className="text-[10px] text-gray-400 font-mono">KUOTA</span>
            </div>

            <div className="space-y-3.5 text-xs">
              {/* Kari */}
              <div>
                <div className="flex justify-between mb-1">
                  <span className="font-medium text-gray-700">Roti Kirai Kari</span>
                  <span className="font-bold text-gray-900">{soldKari} / {KUOTA.kariMax} porsi</span>
                </div>
                <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-amber-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, (soldKari / KUOTA.kariMax) * 100)}%` }}
                  ></div>
                </div>
              </div>

              {/* Ayam */}
              <div>
                <div className="flex justify-between mb-1">
                  <span className="font-medium text-gray-700">Roti Kirai Ayam</span>
                  <span className="font-bold text-gray-900">{soldAyam} / {KUOTA.ayamMax} porsi</span>
                </div>
                <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-amber-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, (soldAyam / KUOTA.ayamMax) * 100)}%` }}
                  ></div>
                </div>
              </div>

              {/* Keju */}
              <div>
                <div className="flex justify-between mb-1">
                  <span className="font-medium text-gray-700">Roti Kirai Keju</span>
                  <span className="font-bold text-gray-900">{soldKeju} / {KUOTA.kejuMax} porsi</span>
                </div>
                <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-orange-400 h-full rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, (soldKeju / KUOTA.kejuMax) * 100)}%` }}
                  ></div>
                </div>
              </div>

              {/* Telang */}
              <div>
                <div className="flex justify-between mb-1">
                  <span className="font-medium text-gray-700">Es Telang Lemonade</span>
                  <span className="font-bold text-gray-900">{soldTelang} / {KUOTA.telangMax} cup</span>
                </div>
                <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-blue-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, (soldTelang / KUOTA.telangMax) * 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-gray-100 mt-3 flex items-center justify-between text-xs">
            <span className="text-gray-500">Sisa Kuota Produksi:</span>
            <span className="font-bold text-red-600 font-mono">
              {Math.max(0, totalCapacity - totalPortionsSold)} Porsi
            </span>
          </div>
        </div>
      </div>

      {/* Quick Action Buttons */}
      <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h4 className="font-bold text-sm text-gray-900">Aksi Cepat Gerai</h4>
          <p className="text-xs text-gray-500">Akses langsung fitur kasir dan pencatatan transaksi harian</p>
        </div>
        <div className="flex flex-wrap gap-2.5">
          <button
            onClick={onOpenQuickOrder}
            className="px-4 py-2 bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-gray-950 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
          >
            <PlusCircle size={15} /> Input Pesanan Kasir
          </button>
          <button
            onClick={onOpenQuickExpense}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl text-xs font-semibold transition flex items-center gap-1.5"
          >
            <FileText size={15} /> Catat Pengeluaran
          </button>
          <button
            onClick={() => onNavigate("ai_assistant")}
            className="px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white rounded-xl text-xs font-semibold transition flex items-center gap-1.5"
          >
            <Sparkles size={15} /> Konsultasi Bisnis
          </button>
        </div>
      </div>

      {/* Recent Orders Preview */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h4 className="font-bold text-gray-900 text-sm">Pesanan Terbaru Masuk ({orders.length})</h4>
            <p className="text-xs text-gray-500">Daftar transaksi yang sedang berjalan hari ini</p>
          </div>
          <button
            onClick={() => onNavigate("operasional", "pesanan")}
            className="text-xs text-amber-700 hover:text-amber-800 font-bold flex items-center gap-1 transition"
          >
            Semua Pesanan <ChevronRight size={14} />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/80 border-b border-gray-100 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                <th className="p-4">ID & Waktu</th>
                <th className="p-4">Pelanggan & Lokasi</th>
                <th className="p-4">Item Pesanan</th>
                <th className="p-4">Total</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-center">Update Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-xs">
              {orders.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-10 text-center">
                    <div className="flex flex-col items-center gap-2 text-gray-400">
                      <ShoppingBag size={28} className="text-gray-300" />
                      <p className="font-semibold text-gray-500">Belum ada pesanan masuk</p>
                      <p className="text-xs">Pesanan dari website atau WhatsApp akan muncul di sini secara real-time.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                orders.slice(0, 5).map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50/60 transition">
                    <td className="p-4 font-mono font-bold text-gray-900">
                      <div className="flex items-center gap-1.5">
                        <span>{order.id}</span>
                        <span className={`text-[9px] px-1.5 py-0.5 rounded font-sans font-bold ${
                          order.orderSource === 'WhatsApp' 
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
                            : 'bg-gray-100 text-gray-600 border border-gray-200'
                        }`}>
                          {order.orderSource === 'WhatsApp' ? '💬 WA' : '🌐 Web'}
                        </span>
                      </div>
                      <div className="text-[10px] text-gray-400 font-sans font-normal mt-0.5">
                        {order.time ? new Date(order.time).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) : "-"}
                      </div>
                    </td>
                    <td className="p-4">
                      <p className="font-semibold text-gray-900">{order.customerName}</p>
                      <p className="text-[11px] text-gray-500 truncate max-w-xs">{order.address}</p>
                      {order.paymentProof && (
                        <button
                          onClick={() => onViewProof(order.paymentProof)}
                          className="text-[10px] text-amber-700 hover:underline font-bold mt-0.5 inline-block"
                        >
                          Lihat Bukti QRIS
                        </button>
                      )}
                    </td>
                    <td className="p-4">
                      <ul className="space-y-0.5">
                        {order.items?.map((item, idx) => (
                          <li key={idx} className="text-gray-700">
                            {item.name} <span className="font-bold text-gray-900">x{item.quantity}</span>
                          </li>
                        ))}
                      </ul>
                    </td>
                    <td className="p-4 font-bold text-amber-700 font-mono">
                      {formatRupiah(order.total || 0)}
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${statusColors[order.status] || "bg-gray-100 text-gray-700"}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <select
                        value={order.status}
                        onChange={(e) => onUpdateOrderStatus(order.id, e.target.value)}
                        className="bg-white border border-gray-200 text-gray-700 text-xs rounded-lg px-2.5 py-1 focus:ring-1 focus:ring-amber-500 focus:outline-none"
                      >
                        <option value="Pesanan Diterima">Pesanan Diterima</option>
                        <option value="Sedang Diproses">Sedang Diproses</option>
                        <option value="Sedang Diantar">Sedang Diantar</option>
                        <option value="Selesai">Selesai</option>
                        <option value="Dibatalkan">Dibatalkan</option>
                      </select>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
