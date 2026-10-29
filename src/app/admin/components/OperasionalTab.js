"use client";

import React, { useState } from "react";
import { 
  Package, 
  ShoppingBag, 
  Boxes, 
  Search, 
  Plus, 
  Trash2, 
  Printer, 
  CheckCircle, 
  AlertTriangle, 
  ArrowUpDown, 
  Eye,
  Filter,
  RefreshCw,
  Edit2
} from "lucide-react";
import { EditProductModal } from "./ActionModals";
import { EditInventoryModal } from "./ActionModals";

export default function OperasionalTab({
  subTab = "pesanan",
  setSubTab,
  orders = [],
  products = [],
  setProducts,
  inventory = [],
  setInventory,
  onUpdateOrderStatus,
  onDeleteOrder,
  onViewProof,
  onPrintInvoice,
  onOpenQuickOrder,
  onOpenRestock
}) {
  // Search & Filters for Orders
  const [orderSearch, setOrderSearch] = useState("");
  const [orderStatusFilter, setOrderStatusFilter] = useState("Semua");
  const [orderPaymentFilter, setOrderPaymentFilter] = useState("Semua");

  // Filter for Products
  const [productCategoryFilter, setProductCategoryFilter] = useState("Semua");
  const [productSearch, setProductSearch] = useState("");
  const [editingProduct, setEditingProduct] = useState(null);

  // Filter for Inventory
  const [inventoryCategoryFilter, setInventoryCategoryFilter] = useState("Semua");
  const [editingInventory, setEditingInventory] = useState(null);

  // Handle manual inventory edit/save
  const handleSaveInventory = (id, updates) => {
    setInventory(prev => prev.map(item => item.id === id ? { ...item, ...updates } : item));
  };

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

  // Toggle Product Availability
  const toggleProductStatus = async (id) => {
    const target = products.find(p => p.id === id);
    const newAvail = target ? !target.isAvailable : true;
    setProducts(prev => prev.map(p => {
      if (p.id === id) return { ...p, isAvailable: newAvail };
      return p;
    }));
    try {
      await fetch("/api/products", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, isAvailable: newAvail })
      });
    } catch (e) {
      // handled
    }
  };

  // Update Product Details
  const handleUpdateProduct = async (id, updatedFields) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, ...updatedFields } : p));
    try {
      await fetch("/api/products", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...updatedFields })
      });
    } catch (e) {
      // handled
    }
  };

  // Filtered Orders
  const filteredOrders = orders.filter(o => {
    const matchSearch = (o.id || "").toLowerCase().includes(orderSearch.toLowerCase()) ||
                        (o.customerName || "").toLowerCase().includes(orderSearch.toLowerCase()) ||
                        (o.address || "").toLowerCase().includes(orderSearch.toLowerCase());
    const matchStatus = orderStatusFilter === "Semua" || o.status === orderStatusFilter;
    const matchPayment = orderPaymentFilter === "Semua" || (o.paymentMethod || "COD") === orderPaymentFilter;
    return matchSearch && matchStatus && matchPayment;
  });

  // Filtered Products
  const filteredProducts = products.filter(p => {
    const matchCat = productCategoryFilter === "Semua" || p.category === productCategoryFilter;
    const matchSearch = !productSearch ||
      (p.name || "").toLowerCase().includes(productSearch.toLowerCase()) ||
      (p.id || "").toLowerCase().includes(productSearch.toLowerCase()) ||
      (p.description || "").toLowerCase().includes(productSearch.toLowerCase());
    return matchCat && matchSearch;
  });

  // Filtered Inventory
  const filteredInventory = inventory.filter(i => {
    if (inventoryCategoryFilter === "Semua") return true;
    return i.category === inventoryCategoryFilter;
  });

  return (
    <div className="space-y-6">
      {/* Sub-tab Navigation Pills */}
      <div className="flex flex-wrap items-center gap-2 border-b border-gray-200 pb-3">
        <button
          onClick={() => setSubTab("produk")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            subTab === "produk"
              ? "bg-gradient-to-r from-amber-400 to-amber-500 text-gray-950 shadow-sm font-bold"
              : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
          }`}
        >
          <Package size={15} /> Produk & Layanan ({products.length})
        </button>
        <button
          onClick={() => setSubTab("pesanan")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            subTab === "pesanan"
              ? "bg-gradient-to-r from-amber-400 to-amber-500 text-gray-950 shadow-sm font-bold"
              : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
          }`}
        >
          <ShoppingBag size={15} /> Pesanan & Transaksi ({orders.length})
        </button>
        <button
          onClick={() => setSubTab("inventaris")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            subTab === "inventaris"
              ? "bg-gradient-to-r from-amber-400 to-amber-500 text-gray-950 shadow-sm font-bold"
              : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
          }`}
        >
          <Boxes size={15} /> Inventaris & Stok Bahan ({inventory.length})
        </button>
      </div>

      {/* ======================================================== */}
      {/* SUB-TAB 1: PRODUK & LAYANAN */}
      {/* ======================================================== */}
      {subTab === "produk" && (
        <div className="space-y-4">
          {/* Header & Controls Bar */}
          <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
            <div>
              <h3 className="text-base md:text-lg font-bold text-gray-900 flex items-center gap-2">
                <Package size={18} className="text-amber-600" />
                Daftar Produk &amp; Layanan Kuliner
              </h3>
              <p className="text-xs text-gray-500">Kelola harga jual, estimasi HPP, margin kotor, dan ketersediaan menu</p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
              {/* Search Menu */}
              <div className="relative flex-1 md:w-60">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Cari kode atau nama menu..."
                  value={productSearch}
                  onChange={e => setProductSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800 placeholder-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400 transition"
                />
              </div>

              {/* Category Filter */}
              <select
                value={productCategoryFilter}
                onChange={e => setProductCategoryFilter(e.target.value)}
                className="bg-gray-50 border border-gray-200 text-xs rounded-xl px-3 py-2 text-gray-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400 transition"
              >
                <option value="Semua">Semua Kategori</option>
                <option value="Menu Satuan">Menu Satuan</option>
                <option value="Paket Bundling">Paket Bundling</option>
                <option value="Minuman">Minuman</option>
              </select>
            </div>
          </div>

          {/* Table: Baris dan Kolom */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/80 border-b border-gray-200 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                    <th className="p-4">Kode &amp; Menu</th>
                    <th className="p-4">Kategori</th>
                    <th className="p-4">Porsi / Kemasan</th>
                    <th className="p-4 text-right">Harga Jual</th>
                    <th className="p-4 text-right">Estimasi HPP</th>
                    <th className="p-4 text-right">Gross Margin</th>
                    <th className="p-4 text-center">Status</th>
                    <th className="p-4 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-xs">
                  {filteredProducts.map(product => {
                    const marginNominal = (product.price || 0) - (product.hpp || 0);
                    const profitMargin = product.price > 0 ? Math.round((marginNominal / product.price) * 100) : 0;
                    return (
                      <tr key={product.id} className="hover:bg-amber-50/30 transition">
                        {/* Kolom 1: Kode & Menu */}
                        <td className="p-4 max-w-xs">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-gray-100 text-gray-600 font-bold">
                              {product.id}
                            </span>
                            <span className="font-bold text-gray-900 text-sm">{product.name}</span>
                          </div>
                          <p className="text-[11px] text-gray-500 line-clamp-1">{product.description}</p>
                        </td>

                        {/* Kolom 2: Kategori */}
                        <td className="p-4 whitespace-nowrap">
                          <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-gray-100 text-gray-700 border border-gray-200">
                            {product.category}
                          </span>
                        </td>

                        {/* Kolom 3: Porsi */}
                        <td className="p-4 text-gray-600 font-medium whitespace-nowrap">
                          <span className="text-[11px] bg-amber-50 text-amber-800 border border-amber-200/80 font-semibold px-2 py-0.5 rounded">
                            {product.portion}
                          </span>
                        </td>

                        {/* Kolom 4: Harga Jual */}
                        <td className="p-4 text-right font-bold text-gray-900 font-mono whitespace-nowrap text-sm">
                          {formatRupiah(product.price)}
                        </td>

                        {/* Kolom 5: Estimasi HPP */}
                        <td className="p-4 text-right text-gray-600 font-mono whitespace-nowrap">
                          {formatRupiah(product.hpp)}
                        </td>

                        {/* Kolom 6: Gross Margin */}
                        <td className="p-4 text-right font-mono whitespace-nowrap">
                          <span className="font-bold text-emerald-700 block">{profitMargin}%</span>
                          <span className="text-[10px] text-gray-400 block">+{formatRupiah(marginNominal)}</span>
                        </td>

                        {/* Kolom 7: Status Ketersediaan */}
                        <td className="p-4 text-center whitespace-nowrap">
                          <button
                            onClick={() => toggleProductStatus(product.id)}
                            title={product.isAvailable ? "Klik untuk ubah jadi Habis" : "Klik untuk ubah jadi Siap Jual"}
                            className={`text-xs px-2.5 py-1 rounded-full font-bold transition inline-flex items-center gap-1.5 border ${
                              product.isAvailable
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                                : "bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100"
                            }`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${product.isAvailable ? "bg-emerald-500" : "bg-rose-500"}`}></span>
                            <span>{product.isAvailable ? "Siap Jual" : "Habis"}</span>
                          </button>
                        </td>

                        {/* Kolom 8: Aksi */}
                        <td className="p-4 text-center whitespace-nowrap">
                          <button
                            onClick={() => setEditingProduct(product)}
                            title="Edit Harga & Detail Menu"
                            className="px-2.5 py-1 text-amber-700 hover:text-amber-900 bg-amber-50 hover:bg-amber-100 rounded-lg border border-amber-200 transition inline-flex items-center gap-1 text-xs font-semibold shadow-sm"
                          >
                            <Edit2 size={13} />
                            <span>Edit</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                  {filteredProducts.length === 0 && (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-gray-400">
                        Tidak ada produk yang cocok dengan pencarian atau filter.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Footer Table Summary */}
            <div className="bg-gray-50/80 px-4 py-3 border-t border-gray-200 flex flex-col sm:flex-row justify-between items-center text-xs text-gray-500 gap-2">
              <span>Menampilkan <strong>{filteredProducts.length}</strong> dari {products.length} menu</span>
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  {products.filter(p => p.isAvailable).length} Siap Jual
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                  {products.filter(p => !p.isAvailable).length} Habis
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* SUB-TAB 2: PESANAN & TRANSAKSI */}
      {/* ======================================================== */}
      {subTab === "pesanan" && (
        <div className="space-y-6">
          {/* Action Header & Filters */}
          <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm space-y-3">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Manajemen Pesanan & Resi</h3>
                <p className="text-xs text-gray-500">Lacak, verifikasi pembayaran QRIS, update status antar, dan cetak struk</p>
              </div>
              <button
                onClick={onOpenQuickOrder}
                className="px-4 py-2 bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-gray-950 rounded-xl text-xs font-black transition flex items-center gap-1.5 shadow-sm"
              >
                <Plus size={15} /> Buat Pesanan Baru
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-gray-100">
              {/* Search */}
              <div className="relative">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Cari ID resi, nama, lokasi kelas..."
                  value={orderSearch}
                  onChange={e => setOrderSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400 transition"
                />
              </div>

              {/* Status Filter */}
              <div>
                <select
                  value={orderStatusFilter}
                  onChange={e => setOrderStatusFilter(e.target.value)}
                  className="w-full py-2 px-3 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400 transition"
                >
                  <option value="Semua">Semua Status Pesanan</option>
                  <option value="Pesanan Diterima">Pesanan Diterima</option>
                  <option value="Sedang Diproses">Sedang Diproses</option>
                  <option value="Sedang Diantar">Sedang Diantar</option>
                  <option value="Selesai">Selesai</option>
                  <option value="Dibatalkan">Dibatalkan</option>
                </select>
              </div>

              {/* Payment Method Filter */}
              <div>
                <select
                  value={orderPaymentFilter}
                  onChange={e => setOrderPaymentFilter(e.target.value)}
                  className="w-full py-2 px-3 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400 transition"
                >
                  <option value="Semua">Semua Pembayaran (QRIS & COD)</option>
                  <option value="QRIS">Hanya QRIS</option>
                  <option value="COD">Hanya COD (Tunai)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Orders Table */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/80 border-b border-gray-200 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                    <th className="p-4">ID / Waktu</th>
                    <th className="p-4">Pemesan & Lokasi</th>
                    <th className="p-4">Rincian Menu</th>
                    <th className="p-4">Metode & Bukti</th>
                    <th className="p-4">Total</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-center">Aksi Manajemen</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-xs">
                  {filteredOrders.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="p-8 text-center text-gray-400">
                        Tidak ada pesanan yang sesuai dengan filter.
                      </td>
                    </tr>
                  ) : (
                    filteredOrders.map(order => (
                      <tr key={order.id} className="hover:bg-gray-50/70 transition">
                        <td className="p-4 font-mono">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-gray-900">{order.id}</span>
                            <span className={`text-[9px] px-1.5 py-0.5 rounded font-sans font-bold ${
                              order.orderSource === 'WhatsApp' 
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
                                : 'bg-gray-100 text-gray-600 border border-gray-200'
                            }`}>
                              {order.orderSource === 'WhatsApp' ? '💬 WA' : '🌐 Web'}
                            </span>
                          </div>
                          <span className="text-[10px] text-gray-400">
                            {order.time ? new Date(order.time).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) : "-"}
                          </span>
                        </td>
                        <td className="p-4">
                          <p className="font-bold text-gray-900">{order.customerName}</p>
                          <p className="text-[11px] text-gray-500 mt-0.5">{order.address}</p>
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
                        <td className="p-4">
                          <span className={`inline-block px-2 py-0.5 rounded font-bold uppercase text-[10px] ${
                            order.paymentMethod === "QRIS" ? "bg-blue-100 text-blue-800" : "bg-emerald-100 text-emerald-800"
                          }`}>
                            {order.paymentMethod || "COD"}
                          </span>
                          {order.paymentProof && (
                            <button
                              onClick={() => onViewProof(order.paymentProof)}
                              className="text-[10px] text-amber-700 hover:text-amber-900 underline font-bold block mt-1"
                            >
                              Lihat Bukti Foto
                            </button>
                          )}
                        </td>
                        <td className="p-4 font-mono font-bold text-gray-900">
                          {formatRupiah(order.total || 0)}
                        </td>
                        <td className="p-4">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${statusColors[order.status] || "bg-gray-100 text-gray-700"}`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center justify-center gap-1.5">
                            {/* Update status select */}
                            <select
                              value={order.status}
                              onChange={e => onUpdateOrderStatus(order.id, e.target.value)}
                              className="bg-white border border-gray-200 text-gray-700 text-xs rounded-lg px-2 py-1 focus:ring-1 focus:ring-amber-400 focus:outline-none"
                            >
                              <option value="Pesanan Diterima">Pesanan Diterima</option>
                              <option value="Sedang Diproses">Sedang Diproses</option>
                              <option value="Sedang Diantar">Sedang Diantar</option>
                              <option value="Selesai">Selesai</option>
                              <option value="Dibatalkan">Dibatalkan</option>
                            </select>

                            {/* Print receipt */}
                            <button
                              onClick={() => onPrintInvoice(order)}
                              title="Cetak Nota / Struk"
                              className="p-1.5 text-gray-500 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
                            >
                              <Printer size={15} />
                            </button>

                            {/* Delete order */}
                            <button
                              onClick={() => onDeleteOrder(order.id)}
                              title="Hapus Pesanan"
                              className="p-1.5 text-rose-500 hover:text-white bg-rose-50 hover:bg-rose-600 rounded-lg transition"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* SUB-TAB 3: INVENTARIS & STOK BAHAN */}
      {/* ======================================================== */}
      {subTab === "inventaris" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Inventaris Bahan Baku & Kemasan</h3>
              <p className="text-xs text-gray-500">Pantau sisa stok tepung, daging ayam, bumbu kari, boks makanan, dan cup</p>
            </div>
            <div className="flex items-center gap-2">
              <select
                value={inventoryCategoryFilter}
                onChange={e => setInventoryCategoryFilter(e.target.value)}
                className="bg-white border border-gray-200 text-xs rounded-xl px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400 transition"
              >
                <option value="Semua">Semua Kategori Bahan</option>
                <option value="Bahan Utama">Bahan Utama</option>
                <option value="Bahan Isian">Bahan Isian</option>
                <option value="Bumbu & Rempah">Bumbu & Rempah</option>
                <option value="Bahan Minuman">Bahan Minuman</option>
                <option value="Kemasan">Kemasan</option>
                <option value="Operasional">Operasional</option>
              </select>
              <button
                onClick={onOpenRestock}
                className="px-3.5 py-2 bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-gray-950 rounded-xl text-xs font-black transition flex items-center gap-1.5 shadow-sm"
              >
                <Plus size={15} /> Tambah Stok / Restock
              </button>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/80 border-b border-gray-200 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                    <th className="p-4">Kode & Nama Bahan</th>
                    <th className="p-4">Kategori</th>
                    <th className="p-4">Stok Saat Ini</th>
                    <th className="p-4">Batas Minimal</th>
                    <th className="p-4">Biaya / Satuan</th>
                    <th className="p-4">Pemasok / Sumber</th>
                    <th className="p-4">Status Stok</th>
                    <th className="p-4 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-xs">
                  {filteredInventory.map(item => {
                    const statusClass = 
                      item.status === "Aman" 
                        ? "bg-emerald-100 text-emerald-800"
                        : item.status === "Menipis"
                        ? "bg-amber-100 text-amber-800"
                        : "bg-rose-100 text-rose-800 animate-pulse";

                    return (
                      <tr key={item.id} className="hover:bg-amber-50/30 transition">
                        <td className="p-4">
                          <span className="font-bold text-gray-900 block">{item.name}</span>
                          <span className="text-[10px] text-gray-400 font-mono">{item.id}</span>
                        </td>
                        <td className="p-4 text-gray-600">{item.category}</td>
                        <td className="p-4 font-bold text-gray-900 font-mono">
                          {item.stock} {item.unit}
                        </td>
                        <td className="p-4 text-gray-500 font-mono">
                          {item.minStock} {item.unit}
                        </td>
                        <td className="p-4 font-mono font-semibold text-gray-800">
                          {formatRupiah(item.costPerUnit)}
                        </td>
                        <td className="p-4 text-gray-500">{item.supplier}</td>
                        <td className="p-4">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${statusClass}`}>
                            {item.status}
                          </span>
                        </td>
                        <td className="p-4 text-center">
                          <button
                            onClick={() => setEditingInventory(item)}
                            title="Edit Item Inventaris"
                            className="p-1.5 text-amber-600 hover:text-amber-800 bg-amber-50 hover:bg-amber-100 rounded-lg border border-amber-200 transition"
                          >
                            <Edit2 size={14} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Edit Product Modal */}
      {editingProduct && (
        <EditProductModal
          isOpen={Boolean(editingProduct)}
          onClose={() => setEditingProduct(null)}
          product={editingProduct}
          onUpdateProduct={handleUpdateProduct}
        />
      )}

      {/* Edit Inventory Modal */}
      {editingInventory && (
        <EditInventoryModal
          isOpen={Boolean(editingInventory)}
          onClose={() => setEditingInventory(null)}
          item={editingInventory}
          onSave={handleSaveInventory}
        />
      )}
    </div>
  );
}
