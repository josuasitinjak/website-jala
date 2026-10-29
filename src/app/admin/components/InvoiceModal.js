"use client";

import React from "react";
import { Printer, X, CheckCircle, UtensilsCrossed } from "lucide-react";

export default function InvoiceModal({ order, onClose }) {
  if (!order) return null;

  const handlePrint = () => {
    window.print();
  };

  const formatRupiah = (num) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0
    }).format(num || 0);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden border border-gray-100 flex flex-col">
        {/* Modal Top Control */}
        <div className="p-4 bg-gray-50 border-b border-gray-100 flex items-center justify-between print:hidden">
          <span className="text-xs font-bold text-gray-700">Preview Struk Pesanan</span>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-200 transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Receipt Body (Printable Area) */}
        <div className="p-6 space-y-4 font-mono text-xs text-gray-800" id="receipt-print-area">
          <div className="text-center space-y-1 border-b border-dashed border-gray-300 pb-4">
            <h3 className="font-extrabold text-base tracking-tight font-sans text-gray-900">JALA</h3>
            <p className="text-[10px] text-gray-500 font-sans">Contemporary Malay Heritage Culinary</p>
            <p className="text-[10px] text-gray-400 font-sans">Projek PKWU SMAN 1 Batam · Kelas XI Hang Jebat 5</p>
          </div>

          <div className="space-y-1 text-[11px] border-b border-dashed border-gray-300 pb-3">
            <div className="flex justify-between">
              <span className="text-gray-500">No. Resi:</span>
              <span className="font-bold">{order.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Waktu:</span>
              <span>{order.time ? new Date(order.time).toLocaleString("id-ID") : "-"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Pelanggan:</span>
              <span className="font-bold">{order.customerName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Lokasi Antar:</span>
              <span>{order.address}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Metode Bayar:</span>
              <span className="font-bold uppercase">{order.paymentMethod || "COD"}</span>
            </div>
          </div>

          {/* Items */}
          <div className="space-y-2 border-b border-dashed border-gray-300 pb-3">
            {order.items?.map((item, idx) => (
              <div key={idx} className="flex justify-between">
                <div>
                  <p className="font-bold">{item.name}</p>
                  <p className="text-[10px] text-gray-500">{item.quantity} x {formatRupiah(item.price || (order.total / item.quantity))}</p>
                </div>
                <span className="font-bold">{formatRupiah(item.quantity * (item.price || (order.total / item.quantity)))}</span>
              </div>
            ))}
          </div>

          {/* Total */}
          <div className="space-y-1.5 pt-1 text-sm font-bold">
            <div className="flex justify-between text-base">
              <span>TOTAL BAYAR:</span>
              <span className="text-red-600">{formatRupiah(order.total || 0)}</span>
            </div>
            <div className="flex justify-between text-[11px] text-gray-500 font-normal">
              <span>Status Pesanan:</span>
              <span className="font-bold text-gray-800">{order.status}</span>
            </div>
          </div>

          <div className="text-center pt-3 text-[10px] text-gray-400 font-sans border-t border-dashed border-gray-200">
            <p>Terima kasih telah mencicipi warisan kuliner Melayu Kepri bersama JALA! Selamat menikmati.</p>
          </div>
        </div>

        {/* Modal Bottom Actions */}
        <div className="p-4 bg-gray-50 border-t border-gray-100 flex gap-2.5 print:hidden">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 bg-white border border-gray-200 text-gray-700 hover:bg-gray-100 rounded-xl text-xs font-semibold transition"
          >
            Tutup
          </button>
          <button
            onClick={handlePrint}
            className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm"
          >
            <Printer size={15} /> Cetak Struk
          </button>
        </div>
      </div>
    </div>
  );
}
