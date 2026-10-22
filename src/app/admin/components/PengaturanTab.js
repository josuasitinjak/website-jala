"use client";

import React, { useState } from "react";
import { Settings, Store, Save, RefreshCw, QrCode, AlertTriangle, Check } from "lucide-react";

export default function PengaturanTab({
  settings = {},
  setSettings,
  onResetData
}) {
  const [formData, setFormData] = useState(settings);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSettings(formData);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
        <div className="border-b border-gray-100 pb-4 mb-6 flex justify-between items-center">
          <div>
            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Store size={22} className="text-red-600" /> Pengaturan Sistem Gerai JALA
            </h3>
            <p className="text-xs text-gray-500 mt-1">Konfigurasi profil usaha, target kuota produksi, dan pembayaran QRIS</p>
          </div>
          {savedSuccess && (
            <span className="text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5">
              <Check size={14} /> Berhasil Disimpan
            </span>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 text-xs">
          {/* Section 1: Profil Toko */}
          <div className="space-y-4">
            <h4 className="font-bold text-sm text-gray-800 border-b pb-2">1. Identitas Brand & Lokasi Gerai</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Nama Brand / Usaha</label>
                <input
                  type="text"
                  value={formData.storeName || ""}
                  onChange={e => setFormData({ ...formData, storeName: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-red-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Tagline</label>
                <input
                  type="text"
                  value={formData.tagline || ""}
                  onChange={e => setFormData({ ...formData, tagline: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-red-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Lokasi Produksi / Sekolah</label>
                <input
                  type="text"
                  value={formData.schoolLocation || ""}
                  onChange={e => setFormData({ ...formData, schoolLocation: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-red-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Nomor WhatsApp CS Resmi</label>
                <input
                  type="text"
                  value={formData.whatsappContact || ""}
                  onChange={e => setFormData({ ...formData, whatsappContact: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-red-500 font-mono"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Kuota Harian */}
          <div className="space-y-4 pt-2">
            <h4 className="font-bold text-sm text-gray-800 border-b pb-2">2. Target Kuota Produksi Harian (Porsi)</h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Kuota Kari</label>
                <input
                  type="number"
                  value={formData.dailyTargets?.kariQuota || 15}
                  onChange={e => setFormData({
                    ...formData,
                    dailyTargets: { ...formData.dailyTargets, kariQuota: parseInt(e.target.value) || 0 }
                  })}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none font-bold"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Kuota Ayam</label>
                <input
                  type="number"
                  value={formData.dailyTargets?.ayamQuota || 15}
                  onChange={e => setFormData({
                    ...formData,
                    dailyTargets: { ...formData.dailyTargets, ayamQuota: parseInt(e.target.value) || 0 }
                  })}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none font-bold"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Kuota Keju</label>
                <input
                  type="number"
                  value={formData.dailyTargets?.kejuQuota || 15}
                  onChange={e => setFormData({
                    ...formData,
                    dailyTargets: { ...formData.dailyTargets, kejuQuota: parseInt(e.target.value) || 0 }
                  })}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none font-bold"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Kuota Telang</label>
                <input
                  type="number"
                  value={formData.dailyTargets?.telangQuota || 20}
                  onChange={e => setFormData({
                    ...formData,
                    dailyTargets: { ...formData.dailyTargets, telangQuota: parseInt(e.target.value) || 0 }
                  })}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none font-bold"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Pembayaran QRIS */}
          <div className="space-y-4 pt-2">
            <h4 className="font-bold text-sm text-gray-800 border-b pb-2 flex items-center gap-2">
              <QrCode size={16} /> 3. Rekening Penerimaan QRIS
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Nama Pemilik Akun QRIS</label>
                <input
                  type="text"
                  value={formData.qrisPayment?.qrisHolder || ""}
                  onChange={e => setFormData({
                    ...formData,
                    qrisPayment: { ...formData.qrisPayment, qrisHolder: e.target.value }
                  })}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">NMID QRIS</label>
                <input
                  type="text"
                  value={formData.qrisPayment?.qrisNmid || ""}
                  onChange={e => setFormData({
                    ...formData,
                    qrisPayment: { ...formData.qrisPayment, qrisNmid: e.target.value }
                  })}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none font-mono"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-gray-100">
            <button
              type="submit"
              className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold transition flex items-center gap-2 shadow-md"
            >
              <Save size={16} /> Simpan Perubahan Pengaturan
            </button>
          </div>
        </form>
      </div>

      {/* Danger Zone: Reset Data */}
      <div className="bg-white p-6 rounded-2xl border border-rose-200 shadow-sm space-y-3">
        <h4 className="font-bold text-rose-700 text-sm flex items-center gap-2">
          <AlertTriangle size={16} /> Zona Perawatan Data
        </h4>
        <p className="text-xs text-gray-500">
          Reset seluruh data lokal (pesanan, mutasi kas, stok, voucher) kembali ke konfigurasi bawaan awal.
        </p>
        <button
          onClick={onResetData}
          className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
        >
          <RefreshCw size={14} /> Reset Data Lokal ke Default
        </button>
      </div>
    </div>
  );
}
