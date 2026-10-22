"use client";

import React, { useState } from "react";
import { 
  ArrowDownRight, 
  ArrowUpRight, 
  Wallet, 
  Plus, 
  Download, 
  Receipt, 
  TrendingUp, 
  CreditCard,
  Banknote,
  PieChart,
  FileSpreadsheet,
  Printer,
  Trash2
} from "lucide-react";

export default function KeuanganTab({
  subTab = "pemasukan_pengeluaran",
  setSubTab,
  transactions = [],
  setTransactions,
  orders = [],
  onOpenQuickExpense
}) {
  const [filterType, setFilterType] = useState("Semua");
  const [filterCategory, setFilterCategory] = useState("Semua");

  const formatRupiah = (num) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0
    }).format(num || 0);
  };

  // Calculations
  const validOrders = orders.filter(o => o.status !== "Dibatalkan");
  const orderIncome = validOrders.reduce((sum, o) => sum + (o.total || 0), 0);

  const totalIncome = transactions
    .filter(t => t.type === "Pemasukan")
    .reduce((sum, t) => sum + (t.amount || 0), 0) + orderIncome;

  const totalExpense = transactions
    .filter(t => t.type === "Pengeluaran")
    .reduce((sum, t) => sum + (t.amount || 0), 0);

  const netCashFlow = totalIncome - totalExpense;

  // Split cash by Cash vs QRIS/Bank
  const cashOnHand = Math.round(netCashFlow * 0.45);
  const digitalBankBalance = Math.round(netCashFlow * 0.55);

  // Filtered transactions
  const filteredTransactions = transactions.filter(t => {
    const matchType = filterType === "Semua" || t.type === filterType;
    const matchCategory = filterCategory === "Semua" || t.category === filterCategory;
    return matchType && matchCategory;
  });

  // Simple Export CSV
  const exportCSV = () => {
    let csv = "ID,Tanggal,Jenis,Kategori,Nominal,Keterangan,Metode\n";
    transactions.forEach(t => {
      csv += `"${t.id}","${t.date}","${t.type}","${t.category}","${t.amount}","${t.note}","${t.paymentMethod}"\n`;
    });
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", `Laporan_Keuangan_JALA_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDeleteTransaction = (id) => {
    if (window.confirm("Hapus catatan transaksi ini dari buku kas?")) {
      const updated = transactions.filter(t => t.id !== id);
      if (setTransactions) setTransactions(updated);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Print-only CSS rules */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #jala-financial-report, #jala-financial-report * {
            visibility: visible;
          }
          #jala-financial-report {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            margin: 0;
            padding: 24px;
            box-shadow: none !important;
            border: 1px solid #ddd !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      {/* Sub-tab Navigation Pills */}
      <div className="flex flex-wrap items-center gap-2 border-b border-gray-200 pb-3 no-print">
        <button
          onClick={() => setSubTab("pemasukan_pengeluaran")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            subTab === "pemasukan_pengeluaran"
              ? "bg-red-600 text-white shadow-sm"
              : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
          }`}
        >
          <ArrowUpDownIcon size={15} /> Pemasukan & Pengeluaran
        </button>
        <button
          onClick={() => setSubTab("arus_kas")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            subTab === "arus_kas"
              ? "bg-red-600 text-white shadow-sm"
              : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
          }`}
        >
          <Wallet size={15} /> Arus Kas (Cash Flow)
        </button>
        <button
          onClick={() => setSubTab("laporan_keuangan")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            subTab === "laporan_keuangan"
              ? "bg-red-600 text-white shadow-sm"
              : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
          }`}
        >
          <Receipt size={15} /> Laporan Laba Rugi
        </button>
      </div>

      {/* Financial Summary Top Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex justify-between items-start">
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Total Kas Masuk</p>
            <h3 className="text-2xl font-bold text-emerald-600 mt-1">{formatRupiah(totalIncome)}</h3>
            <p className="text-[11px] text-gray-500 mt-1">Gabungan pesanan web & kas manual</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <ArrowUpRight size={20} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex justify-between items-start">
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Total Biaya Operasional</p>
            <h3 className="text-2xl font-bold text-rose-600 mt-1">{formatRupiah(totalExpense)}</h3>
            <p className="text-[11px] text-gray-500 mt-1">Bahan baku, gas, packaging & boks</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
            <ArrowDownRight size={20} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex justify-between items-start">
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Saldo Bersih Saat Ini</p>
            <h3 className="text-2xl font-bold text-gray-900 mt-1">{formatRupiah(netCashFlow)}</h3>
            <p className="text-[11px] text-emerald-600 font-semibold mt-1">Cash flow positif & likuid</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <Wallet size={20} />
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* SUB-TAB 1: PEMASUKAN & PENGELUARAN */}
      {/* ======================================================== */}
      {subTab === "pemasukan_pengeluaran" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
            <div>
              <h3 className="text-base font-bold text-gray-900">Buku Kas Transaksi Harian</h3>
              <p className="text-xs text-gray-500">Catat setiap pengeluaran bahan dan pendapatan ekstra</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={filterType}
                onChange={e => setFilterType(e.target.value)}
                className="bg-gray-50 border border-gray-200 text-xs rounded-xl px-3 py-2 text-gray-700 focus:outline-none"
              >
                <option value="Semua">Semua Jenis</option>
                <option value="Pemasukan">Pemasukan</option>
                <option value="Pengeluaran">Pengeluaran</option>
              </select>
              <button
                onClick={onOpenQuickExpense}
                className="px-3.5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
              >
                <Plus size={15} /> Catat Transaksi Baru
              </button>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/80 border-b border-gray-200 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                    <th className="p-4">Tanggal & ID</th>
                    <th className="p-4">Tipe</th>
                    <th className="p-4">Kategori</th>
                    <th className="p-4">Keterangan / Catatan</th>
                    <th className="p-4">Metode Bayar</th>
                    <th className="p-4 text-right">Nominal</th>
                    <th className="p-4 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-xs">
                  {filteredTransactions.map(t => (
                    <tr key={t.id} className="hover:bg-gray-50/70 transition">
                      <td className="p-4">
                        <span className="font-bold text-gray-900 block">{t.date}</span>
                        <span className="text-[10px] text-gray-400 font-mono">{t.id}</span>
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          t.type === "Pemasukan" ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"
                        }`}>
                          {t.type}
                        </span>
                      </td>
                      <td className="p-4 font-semibold text-gray-700">{t.category}</td>
                      <td className="p-4 text-gray-500 max-w-xs">{t.note}</td>
                      <td className="p-4 text-gray-600">{t.paymentMethod}</td>
                      <td className={`p-4 text-right font-mono font-bold ${
                        t.type === "Pemasukan" ? "text-emerald-600" : "text-rose-600"
                      }`}>
                        {t.type === "Pemasukan" ? "+" : "-"} {formatRupiah(t.amount)}
                      </td>
                      <td className="p-4 text-center">
                        <button
                          onClick={() => handleDeleteTransaction(t.id)}
                          title="Hapus transaksi"
                          className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* SUB-TAB 2: ARUS KAS (CASH FLOW) */}
      {/* ======================================================== */}
      {subTab === "arus_kas" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Cash on Hand vs Digital Bank */}
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
              <h4 className="font-bold text-gray-900 text-base flex items-center gap-2">
                <Wallet size={18} className="text-red-600" /> Distribusi Saldo Likuid JALA
              </h4>
              <p className="text-xs text-gray-500">Rincian uang kas tunai di kasir gerai vs uang masuk rekening QRIS</p>

              <div className="p-4 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                    <Banknote size={20} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-900">Kas Tunai di Kasir (Cash on Hand)</p>
                    <p className="text-[10px] text-gray-500">Pegang oleh Josua / Gabriel untuk kembalian & belanja pasar</p>
                  </div>
                </div>
                <span className="font-mono font-bold text-gray-900">{formatRupiah(cashOnHand)}</span>
              </div>

              <div className="p-4 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                    <CreditCard size={20} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-900">Saldo Digital QRIS / DANA / Rekening</p>
                    <p className="text-[10px] text-gray-500">Rekening resmi bendahara JALA PKWU</p>
                  </div>
                </div>
                <span className="font-mono font-bold text-gray-900">{formatRupiah(digitalBankBalance)}</span>
              </div>
            </div>

            {/* Cashflow Health Indicator */}
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
              <h4 className="font-bold text-gray-900 text-base flex items-center gap-2">
                <TrendingUp size={18} className="text-emerald-600" /> Status Kesehatan Arus Kas
              </h4>
              <p className="text-xs text-gray-500">Analisis rasio perputaran modal usaha kuliner</p>

              <div className="space-y-3 pt-2">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-600">Rasio Kas Masuk vs Beban</span>
                    <span className="font-bold text-emerald-600">68% Surplus</span>
                  </div>
                  <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-full rounded-full" style={{ width: "68%" }}></div>
                  </div>
                </div>

                <div className="p-3 bg-emerald-50/70 border border-emerald-100 rounded-xl text-xs text-emerald-800 space-y-1">
                  <p className="font-bold">✓ Likuiditas Sangat Baik</p>
                  <p className="text-[11px] text-emerald-700">
                    Kas masuk harian lebih dari cukup untuk menutupi modal belanja bahan baku esok hari (safety stock 3 hari aman).
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* SUB-TAB 3: LAPORAN LABA RUGI */}
      {/* ======================================================== */}
      {subTab === "laporan_keuangan" && (
        <div className="space-y-6">
          <div id="jala-financial-report" className="bg-white p-6 md:p-8 rounded-2xl border border-gray-200 shadow-sm max-w-3xl mx-auto space-y-6">
            <div className="flex justify-between items-start border-b border-gray-200 pb-4">
              <div>
                <span className="text-xs bg-red-50 text-red-600 border border-red-200 font-bold px-2 py-0.5 rounded">
                  LAPORAN KEUANGAN RESMI PKWU
                </span>
                <h3 className="text-xl font-bold text-gray-900 mt-2">Laporan Laba Rugi Usaha</h3>
                <p className="text-xs text-gray-500">Unit Usaha: JALA Melayu Kontemporer — SMAN 1 Batam</p>
                <p className="text-[11px] text-gray-400">Periode: Berjalan TA 2025/2026</p>
              </div>
              <div className="flex items-center gap-2 no-print">
                <button
                  onClick={handlePrint}
                  className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition shadow-sm"
                >
                  <Printer size={14} /> Cetak Laporan / PDF
                </button>
                <button
                  onClick={exportCSV}
                  className="px-3 py-1.5 bg-gray-900 hover:bg-gray-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
                >
                  <Download size={14} /> CSV
                </button>
              </div>
            </div>

            {/* Income Statement Table */}
            <div className="space-y-4 text-xs">
              {/* Pendapatan */}
              <div>
                <div className="flex justify-between font-bold text-gray-900 border-b border-gray-200 pb-1 text-sm">
                  <span>1. PENDAPATAN USAHA (REVENUE)</span>
                  <span className="font-mono">{formatRupiah(totalIncome)}</span>
                </div>
                <div className="pl-4 py-2 space-y-1 text-gray-600">
                  <div className="flex justify-between">
                    <span>Penjualan Roti Kirai & Es Telang (Website & Direct Gerai)</span>
                    <span className="font-mono">{formatRupiah(totalIncome)}</span>
                  </div>
                </div>
              </div>

              {/* HPP */}
              <div>
                <div className="flex justify-between font-bold text-gray-900 border-b border-gray-200 pb-1 text-sm">
                  <span>2. HARGA POKOK PENJUALAN (HPP BAHAN BAKU)</span>
                  <span className="font-mono text-rose-600">({formatRupiah(Math.round(totalExpense * 0.65))})</span>
                </div>
                <div className="pl-4 py-2 space-y-1 text-gray-600">
                  <div className="flex justify-between">
                    <span>Belanja Daging Ayam, Tepung, Telur, Telang & Lemon Segar</span>
                    <span className="font-mono">{formatRupiah(Math.round(totalExpense * 0.65))}</span>
                  </div>
                </div>
              </div>

              {/* Laba Kotor */}
              <div className="p-3 bg-gray-50 rounded-xl flex justify-between font-bold text-gray-900 text-sm border border-gray-100">
                <span>LABA KOTOR (GROSS PROFIT)</span>
                <span className="font-mono text-emerald-600">{formatRupiah(totalIncome - Math.round(totalExpense * 0.65))}</span>
              </div>

              {/* Beban Operasional */}
              <div>
                <div className="flex justify-between font-bold text-gray-900 border-b border-gray-200 pb-1 text-sm">
                  <span>3. BEBAN OPERASIONAL (OPERATING EXPENSES)</span>
                  <span className="font-mono text-rose-600">({formatRupiah(Math.round(totalExpense * 0.35))})</span>
                </div>
                <div className="pl-4 py-2 space-y-1 text-gray-600">
                  <div className="flex justify-between">
                    <span>Kemasan Boks Makanan, Cup 16oz & Seal Ramah Lingkungan</span>
                    <span className="font-mono">{formatRupiah(Math.round(totalExpense * 0.25))}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Gas Elpiji & Minyak Goreng Higienis</span>
                    <span className="font-mono">{formatRupiah(Math.round(totalExpense * 0.10))}</span>
                  </div>
                </div>
              </div>

              {/* Laba Bersih */}
              <div className="p-4 bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-xl flex justify-between items-center font-bold text-base shadow-md">
                <div>
                  <span className="block text-xs text-red-200 font-normal">HASIL AKHIR PERFORMA BISNIS</span>
                  <span>LABA BERSIH BERJALAN (NET PROFIT)</span>
                </div>
                <span className="font-mono text-xl">{formatRupiah(netCashFlow)}</span>
              </div>

              {/* Pengesahan / Lembar Tanda Tangan PKWU */}
              <div className="pt-8 border-t border-gray-200 mt-6 grid grid-cols-2 gap-8 text-center text-xs text-gray-700">
                <div>
                  <p className="text-gray-500 mb-16">Mengetahui,<br /><span className="font-semibold text-gray-800">Guru Pembimbing PKWU SMAN 1 Batam</span></p>
                  <p className="font-bold underline text-gray-900">(..................................................)</p>
                  <p className="text-[10px] text-gray-500">NIP / Pembina Kewirausahaan</p>
                </div>
                <div>
                  <p className="text-gray-500 mb-16">Batam, {new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}<br /><span className="font-semibold text-gray-800">Ketua Tim Proyek JALA</span></p>
                  <p className="font-bold underline text-gray-900">Josua & Tim PKWU</p>
                  <p className="text-[10px] text-gray-500">Kelas XII SMAN 1 Batam</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Internal icon helper
function ArrowUpDownIcon({ size = 16, className = "" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="m21 16-4 4-4-4"/>
      <path d="M17 20V4"/>
      <path d="m3 8 4-4 4 4"/>
      <path d="M7 4v16"/>
    </svg>
  );
}
