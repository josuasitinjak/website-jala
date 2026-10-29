"use client";

import React, { useState } from "react";
import { 
  Megaphone, 
  Ticket, 
  Send, 
  Copy, 
  Check, 
  Plus, 
  Calendar, 
  Sparkles,
  Share2
} from "lucide-react";

export default function PemasaranTab({
  vouchers = [],
  setVouchers,
  onOpenAddVoucher
}) {
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState("jumat");
  const [customBroadcastText, setCustomBroadcastText] = useState("");

  const templates = {
    jumat: `🎉 *PROMO JUMAT SPESIAL JALA* 🥖✨\n\nHalo Sahabat JALA! Semangat hari Jumat! Dapatkan diskon spesial untuk santapan istirahat Anda:\n\n🔥 *Paket Berdua:* Rp26.000 (Hemat Rp4.000)\n🔥 *Paket Lengkap:* Rp13.500 (Roti Kirai + Es Telang Lemonade)\n\n📍 Siap antar langsung ke kelas & ruang guru Anda!\n👉 Pesan sekarang sebelum kehabisan: http://localhost:3000\n\n_Warisan Melayu Kepri, Sentuhan Modern Praktis_`,
    bundling: `🍱 *SERBU BUNDLING HEMAT JALA KELAS X HANG JEBAT 5* ✨\n\nLagi lapar pas jam istirahat? Cobain *Roti Kirai Berinti Kari Kentang & Ayam Suwir* dengan aroma kunyit khas Melayu Kepri yang gurih lezat!\n\n✅ Paket Hemat: Mulai Rp10.000 saja\n✅ Minuman Segar: Es Telang Lemonade Rp5.000\n\n🛵 *GRATIS ONGKIR* antar sampai meja kelas kamu!\nPesan cepat via web: http://localhost:3000`,
    preorder: `📢 *PRE-ORDER H-1 JALA KULINER SMAN 1 BATAM* 🌿\n\nHalo Teman-teman & Bapak/Ibu Guru! Untuk memastikan stok porsi favorit Anda besok aman, kami membuka pemesanan Pre-Order hari ini.\n\nKupon diskon: *JALABERDUA5K* (Potongan Rp5.000 khusus pembelian Paket Berdua).\n\nKlik link ini untuk amankan porsi Anda sekarang: http://localhost:3000`
  };

  // Content Calendar Mock
  const contentPlan = [
    { day: "Senin", platform: "Instagram Reels", topic: "Behind the Scene pembuatan adonan kuning kunyit roti jala lembut", status: "Selesai" },
    { day: "Rabu", platform: "TikTok", topic: "Tes rasa guru SMAN 1 Batam coba Roti Kirai Ayam Suwir vs Keju Lumer", status: "Siap Posting" },
    { day: "Jumat", platform: "Instagram Story", topic: "Magic color change: Rebusan biru bunga telang berubah ungu dengan lemon", status: "Direncanakan" }
  ];

  const handleCopy = (text, index) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2500);
  };

  const handleSendWA = (text) => {
    const encoded = encodeURIComponent(text);
    window.open(`https://api.whatsapp.com/send?text=${encoded}`, "_blank");
  };

  const toggleVoucher = (id) => {
    setVouchers(prev => prev.map(v => {
      if (v.id === id) return { ...v, isActive: !v.isActive };
      return v;
    }));
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-400 p-6 rounded-2xl text-gray-950 shadow-md border border-amber-300/50">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <span className="text-xs bg-gray-950/15 text-gray-950 px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
              GROWTH & MARKETING SUITE
            </span>
            <h3 className="text-xl font-extrabold mt-2 tracking-tight">Pusat Pemasaran & Kampanye JALA</h3>
            <p className="text-xs text-gray-900 font-medium mt-1 max-w-xl">
              Dorong penjualan gerai melalui voucher promo terukur, pesan siaran WhatsApp massal, dan kalender konten kreatif.
            </p>
          </div>
          <button
            onClick={onOpenAddVoucher}
            className="px-4 py-2.5 bg-gray-950 hover:bg-gray-900 text-amber-300 rounded-xl text-xs font-black transition shadow-sm flex items-center gap-1.5 whitespace-nowrap"
          >
            <Plus size={15} /> Buat Voucher Promo Baru
          </button>
        </div>
      </div>

      {/* Grid: Voucher Management & WA Broadcast */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Voucher Cards */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b border-gray-100 pb-3">
            <div>
              <h4 className="font-bold text-gray-900 text-base flex items-center gap-2">
                <Ticket size={18} className="text-amber-600" /> Voucher & Kupon Diskon Aktif
              </h4>
              <p className="text-xs text-gray-500">Kelola kuota kupon belanja pelanggan</p>
            </div>
            <span className="text-xs font-bold text-amber-900 font-mono bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
              {vouchers.length} Kupon
            </span>
          </div>

          <div className="space-y-3">
            {vouchers.map((v) => (
              <div key={v.id} className="p-4 rounded-xl border border-gray-100 bg-gray-50/70 hover:bg-gray-50 transition flex flex-col justify-between">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-sm bg-gradient-to-r from-amber-400 to-amber-500 text-gray-950 px-2.5 py-0.5 rounded-lg tracking-wider shadow-xs">
                      {v.code}
                    </span>
                    <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                      {v.discountType === "Nominal" ? `Potongan Rp${v.discountVal.toLocaleString("id-ID")}` : `Diskon ${v.discountVal}%`}
                    </span>
                  </div>
                  <button
                    onClick={() => toggleVoucher(v.id)}
                    className={`text-[10px] px-2 py-0.5 rounded-full font-bold transition ${
                      v.isActive ? "bg-emerald-100 text-emerald-800" : "bg-gray-200 text-gray-600"
                    }`}
                  >
                    {v.isActive ? "Aktif" : "Non-aktif"}
                  </button>
                </div>

                <p className="text-xs text-gray-600 mb-2">{v.note}</p>

                <div className="flex items-center justify-between text-[11px] text-gray-500 pt-2 border-t border-gray-200/60">
                  <span>Terpakai: <strong className="text-gray-900">{v.used}</strong> / {v.quota}</span>
                  <span>Berlaku hingga: <strong className="text-gray-900">{v.validUntil}</strong></span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* WA Broadcast Generator */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
          <div className="border-b border-gray-100 pb-3">
            <h4 className="font-bold text-gray-900 text-base flex items-center gap-2">
              <Megaphone size={18} className="text-emerald-600" /> Generator Siaran Promo WhatsApp
            </h4>
            <p className="text-xs text-gray-500">Pilih template promo siap kirim ke grup kelas atau kontak broadcast</p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setSelectedTemplate("jumat")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                selectedTemplate === "jumat" ? "bg-gradient-to-r from-amber-400 to-amber-500 text-gray-950 font-bold shadow-xs" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Jumat Spesial
            </button>
            <button
              onClick={() => setSelectedTemplate("bundling")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                selectedTemplate === "bundling" ? "bg-gradient-to-r from-amber-400 to-amber-500 text-gray-950 font-bold shadow-xs" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Bundling Istirahat
            </button>
            <button
              onClick={() => setSelectedTemplate("preorder")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                selectedTemplate === "preorder" ? "bg-gradient-to-r from-amber-400 to-amber-500 text-gray-950 font-bold shadow-xs" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Pre-Order H-1
            </button>
          </div>

          <div className="relative">
            <textarea
              rows={8}
              readOnly
              value={templates[selectedTemplate]}
              className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono text-gray-800 focus:outline-none"
            />
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => handleCopy(templates[selectedTemplate], 1)}
              className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2"
            >
              {copiedIndex === 1 ? <Check size={15} className="text-emerald-600" /> : <Copy size={15} />}
              <span>{copiedIndex === 1 ? "Berhasil Disalin!" : "Salin Teks"}</span>
            </button>
            <button
              onClick={() => handleSendWA(templates[selectedTemplate])}
              className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-sm"
            >
              <Send size={15} /> Kirim ke WhatsApp
            </button>
          </div>
        </div>
      </div>

      {/* Social Media Content Planner */}
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
        <div className="flex justify-between items-center border-b border-gray-100 pb-3">
          <div>
            <h4 className="font-bold text-gray-900 text-base flex items-center gap-2">
              <Share2 size={18} className="text-purple-600" /> Kalender & Rencana Konten Media Sosial
            </h4>
            <p className="text-xs text-gray-500">Jadwal publikasi Instagram Reels & TikTok promosi budaya kuliner Melayu Kepri</p>
          </div>
          <span className="text-xs bg-purple-50 text-purple-700 border border-purple-200 font-bold px-2.5 py-1 rounded-full">
            Divisi CMCO (Letty)
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {contentPlan.map((c, idx) => (
            <div key={idx} className="p-4 rounded-xl border border-gray-100 bg-gray-50 space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-bold text-xs text-gray-900">{c.day}</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                  c.status === "Selesai" ? "bg-emerald-100 text-emerald-800" : c.status === "Siap Posting" ? "bg-blue-100 text-blue-800" : "bg-gray-200 text-gray-700"
                }`}>
                  {c.status}
                </span>
              </div>
              <p className="text-xs font-semibold text-purple-700">{c.platform}</p>
              <p className="text-xs text-gray-600 line-clamp-2">{c.topic}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
