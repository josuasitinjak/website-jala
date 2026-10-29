"use client";

import React, { useState } from "react";
import { X, Plus, ShoppingBag, DollarSign, Boxes, User, Ticket, Package } from "lucide-react";

// Modal 1: Buat Pesanan Manual Kasir
export function QuickOrderModal({ isOpen, onClose, products = [], onSubmitOrder }) {
  const [customerName, setCustomerName] = useState("");
  const [address, setAddress] = useState("");
  const [selectedProductId, setSelectedProductId] = useState(products[0]?.id || "");
  const [quantity, setQuantity] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState("COD");

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const product = products.find(p => p.id === selectedProductId) || products[0];
    const total = (product?.price || 12000) * quantity;
    const orderData = {
      customerName: customerName.trim(),
      address: address.trim() || "Diambil di Gerai Kasir",
      items: [{ name: product?.name || "Roti Kirai", quantity: parseInt(quantity) || 1, price: product?.price || 12000 }],
      total: total,
      paymentMethod: paymentMethod,
      paymentStatus: paymentMethod === "COD" ? "Bayar di Tempat" : "Lunas QRIS",
      status: "Pesanan Diterima"
    };
    onSubmitOrder(orderData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl p-6 border border-gray-100">
        <div className="flex justify-between items-center mb-4 border-b pb-3">
          <h3 className="font-bold text-gray-900 text-base flex items-center gap-2">
            <ShoppingBag size={18} className="text-amber-600" /> Input Pesanan Manual Kasir
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 transition">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-gray-700 mb-1">Nama Pemesan</label>
            <input
              type="text"
              required
              placeholder="Contoh: Bu Guru Maya / Siswa X-9"
              value={customerName}
              onChange={e => setCustomerName(e.target.value)}
              className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-amber-400"
            />
          </div>

          <div>
            <label className="block font-semibold text-gray-700 mb-1">Lokasi Antar / Meja</label>
            <input
              type="text"
              placeholder="Contoh: Ruang Guru Lantai 2 / Kelas XI Hang Jebat 5"
              value={address}
              onChange={e => setAddress(e.target.value)}
              className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-red-500"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="block font-semibold text-gray-700 mb-1">Pilih Menu</label>
              <select
                value={selectedProductId}
                onChange={e => setSelectedProductId(e.target.value)}
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none"
              >
                {products.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name} (Rp{p.price.toLocaleString("id-ID")})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Jumlah</label>
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={e => setQuantity(e.target.value)}
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none font-bold"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-gray-700 mb-1">Metode Pembayaran</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setPaymentMethod("COD")}
                className={`py-2 rounded-xl font-bold border transition ${
                  paymentMethod === "COD" ? "bg-red-50 border-red-500 text-red-700" : "bg-gray-50 border-gray-200 text-gray-600"
                }`}
              >
                Tunai / COD
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod("QRIS")}
                className={`py-2 rounded-xl font-bold border transition ${
                  paymentMethod === "QRIS" ? "bg-blue-50 border-blue-500 text-blue-700" : "bg-gray-50 border-gray-200 text-gray-600"
                }`}
              >
                QRIS Cashless
              </button>
            </div>
          </div>

          <div className="pt-3 border-t flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl font-semibold text-gray-700"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold shadow-sm"
            >
              Simpan & Cetak Pesanan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Modal 2: Catat Pengeluaran Cepat
export function QuickExpenseModal({ isOpen, onClose, onAddTransaction }) {
  const [category, setCategory] = useState("Belanja Bahan Baku");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Tunai");

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!amount || isNaN(amount)) return;
    onAddTransaction({
      id: `TRX-${Math.floor(100 + Math.random() * 900)}`,
      date: new Date().toISOString().slice(0, 10),
      type: "Pengeluaran",
      category: category,
      amount: parseInt(amount),
      note: note.trim() || category,
      paymentMethod: paymentMethod
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl p-6 border border-gray-100">
        <div className="flex justify-between items-center mb-4 border-b pb-3">
          <h3 className="font-bold text-gray-900 text-base flex items-center gap-2">
            <DollarSign size={18} className="text-amber-600" /> Catat Kas Pengeluaran
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 transition">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-gray-700 mb-1">Kategori Biaya</label>
            <select
              value={category}
              onChange={e => setCategory(e.target.value)}
              className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none"
            >
              <option value="Belanja Bahan Baku">Belanja Bahan Baku (Ayam, Tepung, Telur)</option>
              <option value="Kemasan & Packaging">Kemasan & Packaging (Box, Cup, Plastik)</option>
              <option value="Operasional & Gas">Operasional & Gas Elpiji / Minyak</option>
              <option value="Promosi & Marketing">Promosi & Marketing</option>
              <option value="Transport & Kurir">Transport & Pengantaran</option>
              <option value="Lain-lain">Biaya Tak Terduga Lainnya</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-gray-700 mb-1">Nominal (Rp)</label>
            <input
              type="number"
              required
              placeholder="Contoh: 45000"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none font-bold text-gray-900 text-sm"
            />
          </div>

          <div>
            <label className="block font-semibold text-gray-700 mb-1">Keterangan / Rincian Belanja</label>
            <input
              type="text"
              required
              placeholder="Contoh: Beli bumbu kari kering & santan di pasar"
              value={note}
              onChange={e => setNote(e.target.value)}
              className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-semibold text-gray-700 mb-1">Sumber Kas</label>
            <select
              value={paymentMethod}
              onChange={e => setPaymentMethod(e.target.value)}
              className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none"
            >
              <option value="Tunai">Kas Tunai di Kasir</option>
              <option value="Transfer / QRIS">Rekening Bank / Dompet Digital</option>
            </select>
          </div>

          <div className="pt-3 border-t flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl font-semibold text-gray-700"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold shadow-sm"
            >
              Simpan Pengeluaran
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Modal 3: Restock Bahan Baku
export function RestockModal({ isOpen, onClose, inventory = [], onUpdateInventory, onAddTransaction }) {
  const [selectedInvId, setSelectedInvId] = useState(inventory[0]?.id || "");
  const [addQty, setAddQty] = useState(1);
  const [totalCost, setTotalCost] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const item = inventory.find(i => i.id === selectedInvId) || inventory[0];
    const cost = totalCost ? parseInt(totalCost) : (item?.costPerUnit || 10000) * addQty;

    // Update inventory quantity
    onUpdateInventory(selectedInvId, parseFloat(addQty));

    // Also auto-record expense in cashbook
    onAddTransaction({
      id: `TRX-${Math.floor(100 + Math.random() * 900)}`,
      date: new Date().toISOString().slice(0, 10),
      type: "Pengeluaran",
      category: "Belanja Bahan Baku",
      amount: cost,
      note: `Restock ${item?.name} (+${addQty} ${item?.unit})`,
      paymentMethod: "Tunai"
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl p-6 border border-gray-100">
        <div className="flex justify-between items-center mb-4 border-b pb-3">
          <h3 className="font-bold text-gray-900 text-base flex items-center gap-2">
            <Boxes size={18} className="text-amber-600" /> Restock Bahan Baku & Kemasan
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 transition">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-gray-700 mb-1">Pilih Item Bahan Baku</label>
            <select
              value={selectedInvId}
              onChange={e => setSelectedInvId(e.target.value)}
              className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none"
            >
              {inventory.map(item => (
                <option key={item.id} value={item.id}>
                  {item.name} (Sisa: {item.stock} {item.unit})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Jumlah Tambahan</label>
              <input
                type="number"
                step="0.1"
                min="0.1"
                required
                value={addQty}
                onChange={e => setAddQty(e.target.value)}
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none font-bold"
              />
            </div>
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Total Biaya (Rp)</label>
              <input
                type="number"
                placeholder="Otomatis terhitung"
                value={totalCost}
                onChange={e => setTotalCost(e.target.value)}
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none"
              />
            </div>
          </div>

          <p className="text-[11px] text-gray-500 bg-amber-50 p-2.5 rounded-lg border border-amber-100">
            ℹ️ Biaya pembelian restock ini akan otomatis dicatat sebagai pengeluaran pada Buku Kas Keuangan.
          </p>

          <div className="pt-3 border-t flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl font-semibold text-gray-700"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold shadow-sm"
            >
              Update Stok & Catat Kas
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Modal 4: Tambah Pelanggan Baru (CRM)
export function AddCustomerModal({ isOpen, onClose, onAddCustomer }) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onAddCustomer({
      id: `CUST-${Math.floor(10 + Math.random() * 90)}`,
      name: name.trim(),
      phone: phone.trim(),
      classLocation: location.trim() || "SMAN 1 Batam",
      totalOrders: 1,
      totalSpent: 15000,
      lastOrder: new Date().toISOString().slice(0, 10),
      tier: "Pelanggan Baru"
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl p-6 border border-gray-100">
        <div className="flex justify-between items-center mb-4 border-b pb-3">
          <h3 className="font-bold text-gray-900 text-base flex items-center gap-2">
            <User size={18} className="text-blue-600" /> Tambah Pelanggan Baru
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 transition">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-gray-700 mb-1">Nama Lengkap</label>
            <input
              type="text"
              required
              placeholder="Contoh: Sarah Aulia"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-semibold text-gray-700 mb-1">Nomor WhatsApp</label>
            <input
              type="text"
              required
              placeholder="Contoh: 081234567890"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none font-mono"
            />
          </div>

          <div>
            <label className="block font-semibold text-gray-700 mb-1">Kelas / Ruangan</label>
            <input
              type="text"
              required
              placeholder="Contoh: Kelas XI Hang Jebat 5 / Ruang Guru"
              value={location}
              onChange={e => setLocation(e.target.value)}
              className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none"
            />
          </div>

          <div className="pt-3 border-t flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl font-semibold text-gray-700"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-sm"
            >
              Simpan Data Pelanggan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Modal 5: Tambah Voucher Diskon
export function AddVoucherModal({ isOpen, onClose, onAddVoucher }) {
  const [code, setCode] = useState("");
  const [discountType, setDiscountType] = useState("Nominal");
  const [discountVal, setDiscountVal] = useState("");
  const [quota, setQuota] = useState(20);
  const [validUntil, setValidUntil] = useState("2026-11-30");
  const [note, setNote] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onAddVoucher({
      id: `VOUCH-${Math.floor(10 + Math.random() * 90)}`,
      code: code.trim().toUpperCase(),
      discountType: discountType,
      discountVal: parseInt(discountVal) || 2000,
      minOrder: 15000,
      quota: parseInt(quota) || 20,
      used: 0,
      validUntil: validUntil,
      isActive: true,
      note: note.trim() || `Diskon ${code}`
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl p-6 border border-gray-100">
        <div className="flex justify-between items-center mb-4 border-b pb-3">
          <h3 className="font-bold text-gray-900 text-base flex items-center gap-2">
            <Ticket size={18} className="text-amber-600" /> Buat Kupon Diskon Baru
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 transition">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-gray-700 mb-1">Kode Voucher (Kapital)</label>
            <input
              type="text"
              required
              placeholder="Contoh: JALABESTIE3K"
              value={code}
              onChange={e => setCode(e.target.value.toUpperCase())}
              className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none uppercase font-mono font-bold"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Jenis Diskon</label>
              <select
                value={discountType}
                onChange={e => setDiscountType(e.target.value)}
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none"
              >
                <option value="Nominal">Nominal (Rp)</option>
                <option value="Persen">Persentase (%)</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Nilai Potongan</label>
              <input
                type="number"
                required
                placeholder={discountType === "Nominal" ? "3000" : "15"}
                value={discountVal}
                onChange={e => setDiscountVal(e.target.value)}
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none font-bold"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Kuota Terbatas (Pcs)</label>
              <input
                type="number"
                value={quota}
                onChange={e => setQuota(e.target.value)}
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Masa Berlaku</label>
              <input
                type="date"
                value={validUntil}
                onChange={e => setValidUntil(e.target.value)}
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-gray-700 mb-1">Keterangan Syarat & Ketentuan</label>
            <input
              type="text"
              placeholder="Contoh: Khusus siswa SMAN 1 Batam min. belanja Rp15.000"
              value={note}
              onChange={e => setNote(e.target.value)}
              className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none"
            />
          </div>

          <div className="pt-3 border-t flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl font-semibold text-gray-700"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold shadow-sm"
            >
              Aktifkan Voucher
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Modal 6: Tambah Staf / Anggota Tim Baru
export function AddTeamMemberModal({ isOpen, onClose, onAddMember }) {
  const [name, setName] = useState("");
  const [role, setRole] = useState("Staf Dapur & Produksi");
  const [division, setDivision] = useState("Operations & Commercial");
  const [phone, setPhone] = useState("");
  const [dutyShift, setDutyShift] = useState("Senin & Rabu");
  const [accessLevel, setAccessLevel] = useState("Dapur & Logistik");
  const [avatarBg, setAvatarBg] = useState("bg-blue-600");

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    onAddMember({
      id: `TEAM-0${Math.floor(5 + Math.random() * 90)}`,
      name: name.trim(),
      role: role.trim(),
      division: division.trim(),
      email: `${name.trim().toLowerCase().replace(/\s+/g, '')}@jalakuliner.com`,
      phone: phone.trim() || "081200000000",
      accessLevel: accessLevel,
      dutyShift: dutyShift,
      avatarBg: avatarBg
    });

    setName("");
    setPhone("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl p-6 border border-gray-100">
        <div className="flex justify-between items-center mb-4 border-b pb-3">
          <h3 className="font-bold text-gray-900 text-base flex items-center gap-2">
            <User size={18} className="text-amber-600" /> Tambah Anggota Tim / Staf
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 transition">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-gray-700 mb-1">Nama Lengkap</label>
            <input
              type="text"
              required
              placeholder="Contoh: Farhan Alamsyah"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-red-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Jabatan / Role</label>
              <input
                type="text"
                required
                placeholder="Contoh: Asisten Koki Dapur"
                value={role}
                onChange={e => setRole(e.target.value)}
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Divisi Kerja</label>
              <select
                value={division}
                onChange={e => setDivision(e.target.value)}
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none"
              >
                <option value="Operations & Commercial">Operations & Commercial</option>
                <option value="Product & Quality">Product & Quality</option>
                <option value="Marketing & CRM">Marketing & CRM</option>
                <option value="Technology & Finance">Technology & Finance</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Nomor WhatsApp</label>
              <input
                type="text"
                required
                placeholder="081234567890"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none font-mono"
              />
            </div>
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Jadwal Piket Dapur</label>
              <input
                type="text"
                placeholder="Contoh: Selasa & Kamis"
                value={dutyShift}
                onChange={e => setDutyShift(e.target.value)}
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Hak Akses Sistem</label>
              <select
                value={accessLevel}
                onChange={e => setAccessLevel(e.target.value)}
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none"
              >
                <option value="Dapur & Logistik">Dapur & Logistik</option>
                <option value="Kasir & Kurir">Kasir & Kurir</option>
                <option value="Marketing & CRM">Marketing & CRM</option>
                <option value="Super Admin">Super Admin</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Warna Label Avatar</label>
              <select
                value={avatarBg}
                onChange={e => setAvatarBg(e.target.value)}
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none"
              >
                <option value="bg-blue-600">Biru</option>
                <option value="bg-emerald-600">Hijau</option>
                <option value="bg-purple-600">Ungu</option>
                <option value="bg-amber-600">Kuning Amber</option>
                <option value="bg-rose-600">Merah Rose</option>
              </select>
            </div>
          </div>

          <div className="pt-3 border-t flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl font-semibold text-gray-700"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold shadow-sm"
            >
              Simpan Staf
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Modal 7: Edit Detail Produk Kuliner
export function EditProductModal({ isOpen, onClose, product, onUpdateProduct }) {
  const [price, setPrice] = useState(product?.price || 12000);
  const [hpp, setHpp] = useState(product?.hpp || 6500);
  const [portion, setPortion] = useState(product?.portion || "Porsi (4 pcs)");
  const [description, setDescription] = useState(product?.description || "");

  React.useEffect(() => {
    if (product) {
      setPrice(product.price || 12000);
      setHpp(product.hpp || 6500);
      setPortion(product.portion || "Porsi (4 pcs)");
      setDescription(product.description || "");
    }
  }, [product]);

  if (!isOpen || !product) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onUpdateProduct(product.id, {
      price: parseInt(price),
      hpp: parseInt(hpp),
      portion: portion.trim(),
      description: description.trim()
    });
    onClose();
  };

  const currentMargin = price > 0 ? Math.round(((price - hpp) / price) * 100) : 0;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl p-6 border border-gray-100">
        <div className="flex justify-between items-center mb-4 border-b pb-3">
          <h3 className="font-bold text-gray-900 text-base flex items-center gap-2">
            <ShoppingBag size={18} className="text-amber-600" /> Edit Menu: {product.name}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 transition">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Harga Jual (Rp)</label>
              <input
                type="number"
                required
                value={price}
                onChange={e => setPrice(e.target.value)}
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none font-bold text-gray-900"
              />
            </div>
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Estimasi HPP (Rp)</label>
              <input
                type="number"
                required
                value={hpp}
                onChange={e => setHpp(e.target.value)}
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none font-bold text-gray-700"
              />
            </div>
          </div>

          <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center justify-between">
            <span className="text-emerald-800 font-medium">Margin Keuntungan Kotor:</span>
            <span className="text-emerald-700 font-bold font-mono text-sm">
              {currentMargin}% (Rp{(price - hpp).toLocaleString("id-ID")})
            </span>
          </div>

          <div>
            <label className="block font-semibold text-gray-700 mb-1">Keterangan Porsi</label>
            <input
              type="text"
              value={portion}
              onChange={e => setPortion(e.target.value)}
              placeholder="Contoh: Porsi (4 pcs) / Cup 16oz"
              className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-semibold text-gray-700 mb-1">Deskripsi Menu</label>
            <textarea
              rows={3}
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none leading-relaxed"
            />
          </div>

          <div className="pt-3 border-t flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl font-semibold text-gray-700"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold shadow-sm"
            >
              Simpan Perubahan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Modal 8: Kartu Profil & Riwayat Pesanan Pelanggan (CRM Detail)
export function CustomerDetailModal({ isOpen, onClose, customer, onUpdateCustomerNote }) {
  const [note, setNote] = useState(customer?.notes || "");
  const [isSavingNote, setIsSavingNote] = useState(false);

  React.useEffect(() => {
    if (customer) {
      setNote(customer.notes || "");
    }
  }, [customer]);

  if (!isOpen || !customer) return null;

  const handleSaveNote = () => {
    setIsSavingNote(true);
    if (onUpdateCustomerNote) {
      onUpdateCustomerNote(customer.id, note);
    }
    setTimeout(() => setIsSavingNote(false), 1000);
  };

  const handleWhatsAppChat = () => {
    let cleanPhone = (customer.phone || "").replace(/[^0-9]/g, "");
    if (cleanPhone.startsWith("0")) cleanPhone = "62" + cleanPhone.slice(1);
    const text = encodeURIComponent(
      `Halo Kak ${customer.name}! 👋 Terima kasih telah menjadi pelanggan setia JALA. Apakah ada pesanan yang ingin kami siapkan untuk jam istirahat hari ini? 😊`
    );
    window.open(`https://wa.me/${cleanPhone}?text=${text}`, "_blank");
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl p-6 border border-gray-100 max-h-[90vh] overflow-y-auto custom-scrollbar">
        <div className="flex justify-between items-start border-b pb-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-amber-500 text-gray-950 flex items-center justify-center font-bold text-base shadow-md">
              {customer.name.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-gray-900 text-lg">{customer.name}</h3>
                <span className="text-[10px] bg-amber-50 text-amber-800 font-bold px-2 py-0.5 rounded border border-amber-200">
                  {customer.tier || "Pelanggan"}
                </span>
              </div>
              <p className="text-xs text-gray-500 font-mono">{customer.phone} · {customer.classLocation}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 transition">
            <X size={18} />
          </button>
        </div>

        {/* Customer Stats Cards */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
            <span className="text-[10px] text-gray-400 uppercase font-semibold">Total Belanja</span>
            <p className="text-base font-bold text-amber-700 font-mono mt-0.5">
              Rp{(customer.totalSpent || 0).toLocaleString("id-ID")}
            </p>
          </div>
          <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
            <span className="text-[10px] text-gray-400 uppercase font-semibold">Total Order Masuk</span>
            <p className="text-base font-bold text-gray-900 font-mono mt-0.5">
              {customer.totalOrders || 1} Kali Transaksi
            </p>
          </div>
        </div>

        {/* Note section */}
        <div className="mb-4 space-y-1.5">
          <label className="block text-xs font-semibold text-gray-700">Catatan Khusus Pelanggan / Preferensi Rasa</label>
          <textarea
            rows={2}
            value={note}
            onChange={e => setNote(e.target.value)}
            placeholder="Contoh: Suka ekstra kuah kari, langganan guru piket, alergi udang..."
            className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:bg-white"
          />
          <div className="flex justify-end">
            <button
              onClick={handleSaveNote}
              className="text-xs text-amber-700 hover:text-amber-800 font-semibold"
            >
              {isSavingNote ? "Tersimpan!" : "Simpan Catatan"}
            </button>
          </div>
        </div>

        {/* Order History */}
        <div className="space-y-2 mb-6">
          <h4 className="font-bold text-xs text-gray-800 uppercase tracking-wider">Riwayat Pesanan Terakhir</h4>
          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {customer.ordersList && customer.ordersList.length > 0 ? (
              customer.ordersList.map((ord, idx) => (
                <div key={idx} className="p-2.5 rounded-lg bg-gray-50 border border-gray-100 text-xs flex justify-between items-center">
                  <div>
                    <span className="font-bold font-mono text-gray-900">{ord.id}</span>
                    <span className="text-[10px] text-gray-400 ml-2">{ord.time ? new Date(ord.time).toLocaleDateString("id-ID") : "Hari ini"}</span>
                    <p className="text-gray-600 text-[11px] mt-0.5">
                      {ord.items?.map(i => `${i.name} (${i.quantity}x)`).join(", ")}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="font-bold font-mono text-amber-700 block">Rp{(ord.total || 0).toLocaleString("id-ID")}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">{ord.status}</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-gray-400 py-3 text-center">Belum ada riwayat pesanan.</p>
            )}
          </div>
        </div>

        <div className="pt-3 border-t flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl font-semibold text-xs text-gray-700"
          >
            Tutup
          </button>
          <button
            type="button"
            onClick={handleWhatsAppChat}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-sm flex items-center gap-1.5"
          >
            Chat WhatsApp
          </button>
        </div>
      </div>
    </div>
  );
}


// Modal 9: Edit Inventaris Manual
export function EditInventoryModal({ isOpen, onClose, item, onSave }) {
  const [stock, setStock] = useState(item?.stock ?? "");
  const [minStock, setMinStock] = useState(item?.minStock ?? "");
  const [costPerUnit, setCostPerUnit] = useState(item?.costPerUnit ?? "");
  const [supplier, setSupplier] = useState(item?.supplier ?? "");
  const [name, setName] = useState(item?.name ?? "");
  const [category, setCategory] = useState(item?.category ?? "Bahan Utama");

  React.useEffect(() => {
    if (item) {
      setStock(item.stock ?? "");
      setMinStock(item.minStock ?? "");
      setCostPerUnit(item.costPerUnit ?? "");
      setSupplier(item.supplier ?? "");
      setName(item.name ?? "");
      setCategory(item.category ?? "Bahan Utama");
    }
  }, [item]);

  if (!isOpen || !item) return null;

  const computeStatus = (s, min) => {
    const sv = parseFloat(s);
    const mv = parseFloat(min);
    if (isNaN(sv) || isNaN(mv)) return item.status;
    if (sv <= 0) return "Kritis";
    if (sv < mv) return "Menipis";
    return "Aman";
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const stockVal = parseFloat(stock);
    const minVal = parseFloat(minStock);
    const costVal = parseInt(costPerUnit);
    onSave(item.id, {
      name: name.trim(),
      category,
      stock: isNaN(stockVal) ? item.stock : stockVal,
      minStock: isNaN(minVal) ? item.minStock : minVal,
      costPerUnit: isNaN(costVal) ? item.costPerUnit : costVal,
      supplier: supplier.trim() || item.supplier,
      status: computeStatus(stockVal, minVal)
    });
    onClose();
  };

  const previewStatus = computeStatus(stock, minStock);
  const statusColor =
    previewStatus === "Aman"
      ? "text-emerald-700 bg-emerald-50 border-emerald-200"
      : previewStatus === "Menipis"
      ? "text-amber-700 bg-amber-50 border-amber-200"
      : "text-rose-700 bg-rose-50 border-rose-200";

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl p-6 border border-gray-100">
        <div className="flex justify-between items-center mb-4 border-b pb-3">
          <h3 className="font-bold text-gray-900 text-base flex items-center gap-2">
            <Package size={18} className="text-amber-600" />
            Edit Inventaris
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 transition">
            <X size={18} />
          </button>
        </div>

        <div className="mb-4 p-3 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-gray-400 font-mono uppercase">{item.id}</span>
            <p className="text-xs font-bold text-gray-700 mt-0.5">{item.name}</p>
          </div>
          <span className={`text-[10px] font-bold px-2 py-1 rounded-lg border ${statusColor}`}>
            {previewStatus}
          </span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div>
            <label className="block font-semibold text-gray-700 mb-1">Nama Bahan / Item</label>
            <input
              type="text"
              required
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400"
            />
          </div>

          <div>
            <label className="block font-semibold text-gray-700 mb-1">Kategori</label>
            <select
              value={category}
              onChange={e => setCategory(e.target.value)}
              className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400"
            >
              <option value="Bahan Utama">Bahan Utama</option>
              <option value="Bahan Isian">Bahan Isian</option>
              <option value="Bumbu & Rempah">Bumbu &amp; Rempah</option>
              <option value="Bahan Minuman">Bahan Minuman</option>
              <option value="Kemasan">Kemasan</option>
              <option value="Operasional">Operasional</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Stok Saat Ini ({item.unit})</label>
              <input
                type="number"
                step="0.01"
                min="0"
                required
                value={stock}
                onChange={e => setStock(e.target.value)}
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400 font-bold text-gray-900"
              />
            </div>
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Batas Minimal ({item.unit})</label>
              <input
                type="number"
                step="0.01"
                min="0"
                required
                value={minStock}
                onChange={e => setMinStock(e.target.value)}
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-gray-700 mb-1">Biaya per Satuan (Rp)</label>
            <input
              type="number"
              min="0"
              value={costPerUnit}
              onChange={e => setCostPerUnit(e.target.value)}
              className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400 font-mono"
            />
          </div>

          <div>
            <label className="block font-semibold text-gray-700 mb-1">Pemasok / Sumber</label>
            <input
              type="text"
              value={supplier}
              onChange={e => setSupplier(e.target.value)}
              placeholder="Nama toko atau pasar"
              className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400"
            />
          </div>

          <div className="pt-3 border-t flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl font-semibold text-gray-700"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-gray-950 rounded-xl font-bold shadow-sm"
            >
              Simpan Perubahan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
