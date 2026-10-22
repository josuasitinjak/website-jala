"use client";

import React from "react";
import { 
  BarChart3, 
  TrendingUp, 
  Clock, 
  CreditCard, 
  Award, 
  CheckCircle2, 
  PieChart, 
  Sparkles,
  ArrowUpRight
} from "lucide-react";

export default function AnalitikTab({
  orders = [],
  products = []
}) {
  const validOrders = orders.filter(o => o.status !== "Dibatalkan");
  const totalRevenue = validOrders.reduce((sum, o) => sum + (o.total || 0), 0);
  const totalTransactions = validOrders.length;
  const aov = totalTransactions > 0 ? Math.round(totalRevenue / totalTransactions) : 0;

  const formatRupiah = (num) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0
    }).format(num || 0);
  };

  // Payment Breakdown
  const qrisOrders = validOrders.filter(o => o.paymentMethod === "QRIS");
  const codOrders = validOrders.filter(o => o.paymentMethod !== "QRIS");
  const qrisTotal = qrisOrders.reduce((s, o) => s + (o.total || 0), 0);
  const codTotal = codOrders.reduce((s, o) => s + (o.total || 0), 0);
  const qrisPercentage = totalRevenue > 0 ? Math.round((qrisTotal / totalRevenue) * 100) : 50;

  // Best Selling Items Calculation
  const itemMap = {};
  validOrders.forEach(order => {
    order.items?.forEach(item => {
      const name = item.name || "Menu";
      const qty = item.quantity || 1;
      const price = item.price || 12000;
      if (!itemMap[name]) {
        itemMap[name] = { name, quantity: 0, revenue: 0 };
      }
      itemMap[name].quantity += qty;
      itemMap[name].revenue += qty * price;
    });
  });

  const topItems = Object.values(itemMap).sort((a, b) => b.quantity - a.quantity).slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Top Analytics Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex justify-between items-start">
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Rata-rata Transaksi (AOV)</p>
            <h3 className="text-2xl font-bold text-gray-900 mt-1">{formatRupiah(aov)}</h3>
            <p className="text-[11px] text-emerald-600 font-semibold mt-1 flex items-center gap-1">
              <ArrowUpRight size={13} /> +12% dibanding baseline
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center shrink-0">
            <TrendingUp size={20} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex justify-between items-start">
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Total Porsi Terjual</p>
            <h3 className="text-2xl font-bold text-gray-900 mt-1">
              {validOrders.reduce((sum, o) => sum + (o.items?.reduce((is, i) => is + (i.quantity || 1), 0) || 0), 0)} Pcs
            </h3>
            <p className="text-[11px] text-gray-500 mt-1">Volume makanan & minuman</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Award size={20} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex justify-between items-start">
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Metode QRIS Digital</p>
            <h3 className="text-2xl font-bold text-blue-600 mt-1">{qrisPercentage}%</h3>
            <p className="text-[11px] text-gray-500 mt-1">{formatRupiah(qrisTotal)} dari omzet</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <CreditCard size={20} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex justify-between items-start">
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Jam Sibuk Order</p>
            <h3 className="text-xl font-bold text-purple-700 mt-1">09.30 - 10.15</h3>
            <p className="text-[11px] text-gray-500 mt-1">Istirahat pertama sekolah</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <Clock size={20} />
          </div>
        </div>
      </div>

      {/* Middle Grid: Top Selling Items & Payment Channel Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Selling Menu Ranking */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b border-gray-100 pb-3">
            <div>
              <h4 className="font-bold text-gray-900 text-base">Menu Paling Laris (Best Sellers)</h4>
              <p className="text-xs text-gray-500">Peringkat produk berdasarkan total porsi dan kontribusi omzet</p>
            </div>
            <span className="text-xs font-mono font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded">
              TOP 5
            </span>
          </div>

          <div className="space-y-4">
            {topItems.length === 0 ? (
              <p className="text-xs text-gray-400 py-4 text-center">Belum ada data porsi yang tercatat.</p>
            ) : (
              topItems.map((item, idx) => {
                const maxQty = topItems[0]?.quantity || 1;
                const widthPercent = Math.round((item.quantity / maxQty) * 100);
                return (
                  <div key={idx} className="space-y-1.5">
                    <div className="flex justify-between items-center text-xs">
                      <div className="flex items-center gap-2">
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                          idx === 0 ? "bg-amber-500 text-white" : idx === 1 ? "bg-gray-400 text-white" : "bg-gray-200 text-gray-700"
                        }`}>
                          {idx + 1}
                        </span>
                        <span className="font-semibold text-gray-800">{item.name}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-gray-900">{item.quantity} porsi</span>
                        <span className="text-gray-400 ml-2">({formatRupiah(item.revenue)})</span>
                      </div>
                    </div>
                    <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          idx === 0 ? "bg-red-600" : "bg-red-400"
                        }`}
                        style={{ width: `${widthPercent}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Payment Channels Comparison */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4 flex flex-col justify-between">
          <div>
            <div className="border-b border-gray-100 pb-3">
              <h4 className="font-bold text-gray-900 text-base">Komparasi Metode Bayar</h4>
              <p className="text-xs text-gray-500">Adopsi pembayaran cashless QRIS vs Tunai COD</p>
            </div>

            <div className="space-y-4 pt-4">
              {/* QRIS */}
              <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-100 space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="font-bold text-blue-900">QRIS (Cashless / Dompet Digital)</span>
                  <span className="font-bold text-blue-700">{qrisPercentage}%</span>
                </div>
                <p className="text-sm font-mono font-bold text-blue-900">{formatRupiah(qrisTotal)}</p>
                <p className="text-[10px] text-blue-600">{qrisOrders.length} transaksi terverifikasi</p>
              </div>

              {/* COD */}
              <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-100 space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="font-bold text-emerald-900">COD (Tunai saat Makanan Diantar)</span>
                  <span className="font-bold text-emerald-700">{100 - qrisPercentage}%</span>
                </div>
                <p className="text-sm font-mono font-bold text-emerald-900">{formatRupiah(codTotal)}</p>
                <p className="text-[10px] text-emerald-600">{codOrders.length} transaksi tunai</p>
              </div>
            </div>
          </div>

          <div className="p-3 bg-gray-50 rounded-xl text-[11px] text-gray-600 border border-gray-100">
            💡 <strong>Insight:</strong> Pembayaran QRIS sangat diminati oleh guru dan staf, sedangkan COD dominan di kalangan siswa kelas X.
          </div>
        </div>
      </div>
    </div>
  );
}
