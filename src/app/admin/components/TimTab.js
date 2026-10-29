"use client";

import React, { useState } from "react";
import { ShieldCheck, UserCheck, Calendar, Phone, Mail, Award, CheckCircle2, Plus } from "lucide-react";

export default function TimTab({
  team = [],
  setTeam,
  onOpenAddMember,
  onEditMember
}) {
  const handleDeleteMember = (id, name) => {
    if (confirm(`Yakin ingin menghapus ${name} dari daftar staf dan hak akses gerai?`)) {
      setTeam(prev => prev.filter(m => m.id !== id));
    }
  };

  const handleWhatsAppStaff = (phone, name) => {
    let clean = phone.replace(/[^0-9]/g, "");
    if (clean.startsWith("0")) clean = "62" + clean.slice(1);
    const text = encodeURIComponent(`Halo ${name}! Koordinasi jadwal piket dan operasional JALA hari ini.`);
    window.open(`https://wa.me/${clean}?text=${text}`, "_blank");
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="text-xs bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded font-bold uppercase">
            STRUKTUR PENGURUS RESMI
          </span>
          <h3 className="text-xl font-bold text-gray-900 mt-2">Tim Manajemen & Pembagian Hak Akses</h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Projek PKWU Siswa Kelas XI / Hang Jebat 5 SMAN 1 Batam
          </p>
        </div>
        <button
          onClick={onOpenAddMember}
          className="px-4 py-2 bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-gray-950 rounded-xl text-xs font-black transition flex items-center gap-1.5 shadow-sm"
        >
          <Plus size={15} /> Tambah Anggota / Staf
        </button>
      </div>

      {/* Team Member Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {team.map((member) => (
          <div key={member.id} className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition space-y-4 flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-xl ${member.avatarBg || "bg-amber-500"} text-white flex items-center justify-center font-bold text-sm shadow-md`}>
                    {member.name.split(" ").map(n => n[0]).slice(0, 2).join("")}
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 text-base">{member.name}</h4>
                    <p className="text-xs text-amber-700 font-bold">{member.role}</p>
                  </div>
                </div>
                <span className="text-[10px] bg-gray-100 text-gray-700 font-mono font-bold px-2 py-1 rounded">
                  {member.accessLevel}
                </span>
              </div>

              <div className="space-y-2 text-xs pt-3 mt-2 border-t border-gray-100 text-gray-600">
                <div className="flex items-center gap-2">
                  <Award size={14} className="text-amber-500" />
                  <span>Divisi: <strong className="text-gray-800">{member.division}</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar size={14} className="text-blue-500" />
                  <span>Jadwal Piket Dapur: <strong className="text-gray-800">{member.dutyShift}</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone size={14} className="text-emerald-500" />
                  <span>WhatsApp: <strong className="text-gray-800 font-mono">{member.phone}</strong></span>
                </div>
              </div>

              <div className="p-3 bg-gray-50 rounded-xl text-[11px] text-gray-500 mt-3">
                <span className="font-semibold text-gray-700 block mb-1">Wewenang Sistem:</span>
                <div className="flex flex-wrap gap-1.5">
                  <span className="px-2 py-0.5 bg-white border border-gray-200 rounded text-gray-700">Update Pesanan</span>
                  <span className="px-2 py-0.5 bg-white border border-gray-200 rounded text-gray-700">Lihat Laporan</span>
                  {member.accessLevel === "Super Admin" && (
                    <span className="px-2 py-0.5 bg-amber-50 border border-amber-200 text-amber-800 font-bold">Akses Penuh Finansial</span>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Action Footer */}
            <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
              <button
                onClick={() => handleWhatsAppStaff(member.phone, member.name)}
                className="text-emerald-600 hover:text-emerald-700 font-semibold flex items-center gap-1 transition"
              >
                <Phone size={13} /> Chat WhatsApp
              </button>

              {member.id !== "TEAM-01" && (
                <button
                  onClick={() => handleDeleteMember(member.id, member.name)}
                  className="text-rose-500 hover:text-rose-700 font-semibold transition text-[11px]"
                >
                  Hapus Staf
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Permissions Matrix Overview */}
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
        <h4 className="font-bold text-gray-900 text-base">Matriks Otoritas & SOP Tim</h4>
        <div className="overflow-x-auto text-xs">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 font-bold text-gray-600">
                <th className="p-3">Divisi / Peran</th>
                <th className="p-3 text-center">Kelola Pesanan</th>
                <th className="p-3 text-center">Ubah Stok Bahan</th>
                <th className="p-3 text-center">Catat Kas Keluar</th>
                <th className="p-3 text-center">Ubah Pengaturan Toko</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              <tr>
                <td className="p-3 font-semibold text-gray-800">CEO (Josua Sitinjak)</td>
                <td className="p-3 text-center text-emerald-600 font-bold">✓ Penuh</td>
                <td className="p-3 text-center text-emerald-600 font-bold">✓ Penuh</td>
                <td className="p-3 text-center text-emerald-600 font-bold">✓ Penuh</td>
                <td className="p-3 text-center text-emerald-600 font-bold">✓ Penuh</td>
              </tr>
              <tr>
                <td className="p-3 font-semibold text-gray-800">COO (Gabriel)</td>
                <td className="p-3 text-center text-emerald-600 font-bold">✓ Penuh</td>
                <td className="p-3 text-center text-emerald-600 font-bold">✓ Penuh</td>
                <td className="p-3 text-center text-amber-600 font-semibold">✓ Khusus Bahan</td>
                <td className="p-3 text-center text-gray-300">-</td>
              </tr>
              <tr>
                <td className="p-3 font-semibold text-gray-800">CPCO (Haura)</td>
                <td className="p-3 text-center text-emerald-600 font-bold">✓ Pantau</td>
                <td className="p-3 text-center text-emerald-600 font-bold">✓ Resep & Bahan</td>
                <td className="p-3 text-center text-gray-300">-</td>
                <td className="p-3 text-center text-gray-300">-</td>
              </tr>
              <tr>
                <td className="p-3 font-semibold text-gray-800">CMCO (Letty)</td>
                <td className="p-3 text-center text-emerald-600 font-bold">✓ Follow-up WA</td>
                <td className="p-3 text-center text-gray-300">-</td>
                <td className="p-3 text-center text-amber-600 font-semibold">✓ Khusus Promo</td>
                <td className="p-3 text-center text-gray-300">-</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
