"use client";

import { useState, useEffect } from "react";
import { Lock, User, ArrowLeft, Loader2, RefreshCw, Eye, EyeOff, AlertCircle } from "lucide-react";

// Import Modular Components
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import DashboardTab from "./components/DashboardTab";
import OperasionalTab from "./components/OperasionalTab";
import KeuanganTab from "./components/KeuanganTab";
import CrmTab from "./components/CrmTab";
import PemasaranTab from "./components/PemasaranTab";
import AnalitikTab from "./components/AnalitikTab";
import AiAssistantTab from "./components/AiAssistantTab";
import TimTab from "./components/TimTab";
import PengaturanTab from "./components/PengaturanTab";
import InvoiceModal from "./components/InvoiceModal";
import { 
  QuickOrderModal, 
  QuickExpenseModal, 
  RestockModal, 
  AddCustomerModal, 
  AddVoucherModal,
  AddTeamMemberModal 
} from "./components/ActionModals";

// Import Initial Data
import { 
  initialProducts, 
  initialInventory, 
  initialTransactions, 
  initialCustomers, 
  initialVouchers, 
  initialTeam, 
  initialSettings 
} from "./components/initialData";

export default function AdminPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();
    setLoginError("");
    const validUsers = ["adminjala", "admincapcipcup", "admin", "josua"];
    const validPass = ["adminjala2026", "admincapcipcup2026", "admin2026", "jala2026"];

    if (validUsers.includes(username.trim().toLowerCase()) && validPass.includes(password)) {
      setIsLoggedIn(true);
    } else {
      setLoginError("Username atau kata sandi tidak sesuai. Silakan periksa kembali.");
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50/50 via-yellow-50/30 to-white p-6">
        <div className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-md relative border border-amber-200/80">
          <a href="/" className="absolute top-6 left-6 text-gray-400 hover:text-amber-600 flex items-center gap-2 text-xs font-semibold transition">
            <ArrowLeft size={16} /> Ke Halaman Web
          </a>

          <div className="text-center mb-8 mt-6">
            <div className="w-16 h-16 p-1 rounded-2xl bg-gradient-to-br from-amber-200/60 via-amber-100/30 to-amber-50 border border-amber-200/80 shadow-md inline-block mx-auto mb-3">
              <img 
                src="/images/assets/logo.jpeg" 
                alt="Logo JALA" 
                className="w-full h-full rounded-xl object-cover" 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
            <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">Portal Manajemen <span className="bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-500 bg-clip-text text-transparent">JALA</span></h2>
            <p className="text-gray-500 text-xs mt-1">Sistem Terpadu PKWU SMAN 1 Batam · Kelas XI Hang Jebat 5</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            {loginError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl font-medium flex items-center gap-2">
                <AlertCircle size={15} className="shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wider">Username</label>
              <div className="relative">
                <User size={18} className="absolute top-3.5 left-4 text-gray-400" />
                <input 
                  type="text" 
                  required 
                  autoComplete="username"
                  value={username}
                  onChange={e => { setUsername(e.target.value); setLoginError(""); }}
                  placeholder="Masukkan username Anda..."
                  className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-amber-400 focus:border-amber-400 focus:outline-none transition text-sm text-gray-800 placeholder-gray-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wider">Password</label>
              <div className="relative">
                <Lock size={18} className="absolute top-3.5 left-4 text-gray-400" />
                <input 
                  type={showPassword ? "text" : "password"} 
                  required 
                  autoComplete="current-password"
                  value={password}
                  onChange={e => { setPassword(e.target.value); setLoginError(""); }}
                  placeholder="Masukkan kata sandi..."
                  className="w-full pl-11 pr-11 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-amber-400 focus:border-amber-400 focus:outline-none transition text-sm text-gray-800 placeholder-gray-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute top-3.5 right-4 text-gray-400 hover:text-gray-600 transition"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="pt-2">
              <button 
                type="submit" 
                className="w-full bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-gray-950 font-black py-3.5 rounded-xl shadow-lg shadow-amber-500/20 transition transform hover:-translate-y-0.5 text-sm"
              >
                Masuk ke Dashboard
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return <AdminApp onLogout={() => setIsLoggedIn(false)} />;
}

function AdminApp({ onLogout }) {
  // Navigation State
  const [activeTab, setActiveTab] = useState("dashboard");
  const [activeSubTab, setActiveSubTab] = useState("pesanan");
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [storeOpen, setStoreOpen] = useState(true);

  // Core Data Stores
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState(initialProducts);
  const [inventory, setInventory] = useState(initialInventory);
  const [transactions, setTransactions] = useState(initialTransactions);
  const [customers, setCustomers] = useState(initialCustomers);
  const [vouchers, setVouchers] = useState(initialVouchers);
  const [team, setTeam] = useState(initialTeam);
  const [settings, setSettings] = useState(initialSettings);

  // Modals State
  const [selectedProofImage, setSelectedProofImage] = useState(null);
  const [invoiceOrder, setInvoiceOrder] = useState(null);
  const [isQuickOrderOpen, setIsQuickOrderOpen] = useState(false);
  const [isQuickExpenseOpen, setIsQuickExpenseOpen] = useState(false);
  const [isRestockOpen, setIsRestockOpen] = useState(false);
  const [isAddCustomerOpen, setIsAddCustomerOpen] = useState(false);
  const [isAddVoucherOpen, setIsAddVoucherOpen] = useState(false);
  const [isAddTeamOpen, setIsAddTeamOpen] = useState(false);

  // LocalStorage Persistence on Load
  useEffect(() => {
    try {
      // Schema version check: auto-clear stale demo data from old versions
      const schemaVersion = localStorage.getItem("jala_schema_version");
      if (schemaVersion !== "v2") {
        // Clear old demo data keys and reset to clean state
        ["jala_transactions", "jala_customers", "jala_vouchers"].forEach(k => localStorage.removeItem(k));
        localStorage.setItem("jala_schema_version", "v2");
      }

      const savedProducts = localStorage.getItem("jala_products");
      if (savedProducts) setProducts(JSON.parse(savedProducts));

      const savedInv = localStorage.getItem("jala_inventory");
      if (savedInv) setInventory(JSON.parse(savedInv));

      const savedTrx = localStorage.getItem("jala_transactions");
      if (savedTrx) setTransactions(JSON.parse(savedTrx));

      const savedCust = localStorage.getItem("jala_customers");
      if (savedCust) setCustomers(JSON.parse(savedCust));

      const savedVouch = localStorage.getItem("jala_vouchers");
      if (savedVouch) setVouchers(JSON.parse(savedVouch));

      const savedTeam = localStorage.getItem("jala_team");
      if (savedTeam) setTeam(JSON.parse(savedTeam));

      const savedSettings = localStorage.getItem("jala_settings");
      if (savedSettings) setSettings(JSON.parse(savedSettings));

      const savedStoreOpen = localStorage.getItem("jala_store_open");
      if (savedStoreOpen !== null) setStoreOpen(JSON.parse(savedStoreOpen));
    } catch (e) {
      console.error("Local storage error:", e);
    }
  }, []);

  // Save changes to localStorage & sync API
  useEffect(() => {
    localStorage.setItem("jala_products", JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem("jala_inventory", JSON.stringify(inventory));
  }, [inventory]);

  useEffect(() => {
    localStorage.setItem("jala_transactions", JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem("jala_customers", JSON.stringify(customers));
  }, [customers]);

  useEffect(() => {
    localStorage.setItem("jala_vouchers", JSON.stringify(vouchers));
  }, [vouchers]);

  useEffect(() => {
    localStorage.setItem("jala_team", JSON.stringify(team));
  }, [team]);

  useEffect(() => {
    localStorage.setItem("jala_settings", JSON.stringify(settings));
    fetch("/api/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(settings)
    }).catch(() => {});
  }, [settings]);

  useEffect(() => {
    localStorage.setItem("jala_store_open", JSON.stringify(storeOpen));
    fetch("/api/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ storeOpen })
    }).catch(() => {});
  }, [storeOpen]);

  // Fetch Orders from Next.js API
  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/orders?t=${Date.now()}`, { cache: "no-store" });
      const data = await res.json();
      setOrders(data.orders || []);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 5000);
    return () => clearInterval(interval);
  }, []);

  // Order Operations
  const handleUpdateOrderStatus = async (id, newStatus) => {
    try {
      await fetch("/api/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: newStatus })
      });
      fetchOrders();
    } catch (err) {
      alert("Gagal mengupdate status pesanan.");
    }
  };

  const handleDeleteOrder = async (id) => {
    if (!confirm("Yakin ingin menghapus jejak pesanan ini dari sistem?")) return;
    try {
      await fetch(`/api/orders?id=${id}`, { method: "DELETE" });
      fetchOrders();
    } catch (err) {
      alert("Gagal menghapus pesanan.");
    }
  };

  const handleCreateOrder = async (orderData) => {
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData)
      });
      const data = await res.json();
      fetchOrders();
      if (data.order) {
        setInvoiceOrder(data.order);
      }
    } catch (err) {
      alert("Gagal membuat pesanan.");
    }
  };

  const handleAddTransaction = (trx) => {
    setTransactions(prev => [trx, ...prev]);
  };

  const handleUpdateInventory = (id, addStock) => {
    setInventory(prev => prev.map(item => {
      if (item.id === id) {
        const newStock = Math.max(0, item.stock + addStock);
        const newStatus = newStock <= item.minStock * 0.5 ? "Kritis" : newStock <= item.minStock ? "Menipis" : "Aman";
        return { ...item, stock: Number(newStock.toFixed(2)), status: newStatus };
      }
      return item;
    }));
  };

  const handleAddCustomer = (cust) => {
    setCustomers(prev => [cust, ...prev]);
  };

  const handleAddVoucher = (vouch) => {
    setVouchers(prev => [vouch, ...prev]);
  };

  const handleAddTeamMember = (member) => {
    setTeam(prev => [...prev, member]);
  };

  const handleResetData = () => {
    if (!confirm("PERINGATAN: Semua perubahan lokal akan dikembalikan ke data default. Lanjutkan?")) return;
    localStorage.clear();
    setProducts(initialProducts);
    setInventory(initialInventory);
    setTransactions(initialTransactions);
    setCustomers(initialCustomers);
    setVouchers(initialVouchers);
    setSettings(initialSettings);
    alert("Data berhasil direset ke setelan awal.");
  };

  // Tab Titles mapping
  const titles = {
    dashboard: "Dashboard Utama",
    operasional: "Operasional Bisnis",
    keuangan: "Keuangan & Kas",
    crm: "Pelanggan & CRM",
    pemasaran: "Pemasaran & Promosi",
    analitik: "Analitik & Laporan",
    ai_assistant: "AI Bot & Dokumen Supabase",
    tim: "Tim & Hak Akses",
    pengaturan: "Pengaturan Gerai"
  };

  const subTitles = {
    produk: "Produk & Layanan",
    pesanan: "Pesanan & Transaksi",
    inventaris: "Inventaris & Stok",
    pemasukan_pengeluaran: "Pemasukan & Pengeluaran",
    arus_kas: "Arus Kas (Cash Flow)",
    laporan_keuangan: "Laporan Laba Rugi"
  };

  const pendingOrdersCount = orders.filter(o => o.status !== "Selesai" && o.status !== "Dibatalkan").length;
  const criticalStockCount = inventory.filter(i => i.status === "Kritis" || i.status === "Menipis").length;

  return (
    <div className="min-h-screen bg-slate-50 text-gray-800 flex">
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        activeSubTab={activeSubTab}
        setActiveSubTab={setActiveSubTab}
        pendingOrdersCount={pendingOrdersCount}
        criticalStockCount={criticalStockCount}
        isOpenMobile={isMobileOpen}
        setIsOpenMobile={setIsMobileOpen}
        onLogout={onLogout}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-72">
        {/* Sticky Header */}
        <Header
          activeTabTitle={titles[activeTab] || "Admin"}
          activeSubTitle={activeTab === "operasional" || activeTab === "keuangan" ? subTitles[activeSubTab] : null}
          onToggleMobileMenu={() => setIsMobileOpen(!isMobileOpen)}
          onRefresh={fetchOrders}
          isLoading={loading}
          storeOpen={storeOpen}
          setStoreOpen={setStoreOpen}
        />

        {/* Dynamic Page Tab Rendering */}
        <main className="flex-1 p-4 md:p-8 overflow-y-auto">
          {activeTab === "dashboard" && (
            <DashboardTab
              orders={orders}
              inventory={inventory}
              transactions={transactions}
              products={products}
              settings={settings}
              onNavigate={(tab, sub) => {
                setActiveTab(tab);
                if (sub) setActiveSubTab(sub);
              }}
              onOpenQuickOrder={() => setIsQuickOrderOpen(true)}
              onOpenQuickExpense={() => setIsQuickExpenseOpen(true)}
              onUpdateOrderStatus={handleUpdateOrderStatus}
              onViewProof={(img) => setSelectedProofImage(img)}
            />
          )}

          {activeTab === "operasional" && (
            <OperasionalTab
              subTab={activeSubTab}
              setSubTab={setActiveSubTab}
              orders={orders}
              products={products}
              setProducts={setProducts}
              inventory={inventory}
              setInventory={setInventory}
              onUpdateOrderStatus={handleUpdateOrderStatus}
              onDeleteOrder={handleDeleteOrder}
              onViewProof={(img) => setSelectedProofImage(img)}
              onPrintInvoice={(order) => setInvoiceOrder(order)}
              onOpenQuickOrder={() => setIsQuickOrderOpen(true)}
              onOpenRestock={() => setIsRestockOpen(true)}
            />
          )}

          {activeTab === "keuangan" && (
            <KeuanganTab
              subTab={activeSubTab}
              setSubTab={setActiveSubTab}
              transactions={transactions}
              setTransactions={setTransactions}
              orders={orders}
              onOpenQuickExpense={() => setIsQuickExpenseOpen(true)}
            />
          )}

          {activeTab === "crm" && (
            <CrmTab
              orders={orders}
              customersList={customers}
              setCustomers={setCustomers}
              onOpenAddCustomer={() => setIsAddCustomerOpen(true)}
            />
          )}

          {activeTab === "pemasaran" && (
            <PemasaranTab
              vouchers={vouchers}
              setVouchers={setVouchers}
              onOpenAddVoucher={() => setIsAddVoucherOpen(true)}
            />
          )}

          {activeTab === "analitik" && (
            <AnalitikTab
              orders={orders}
              products={products}
            />
          )}

          {activeTab === "ai_assistant" && (
            <AiAssistantTab
              orders={orders}
              transactions={transactions}
              inventory={inventory}
            />
          )}

          {activeTab === "tim" && (
            <TimTab
              team={team}
              setTeam={setTeam}
              onOpenAddMember={() => setIsAddTeamOpen(true)}
            />
          )}

          {activeTab === "pengaturan" && (
            <PengaturanTab
              settings={settings}
              setSettings={setSettings}
              onResetData={handleResetData}
            />
          )}
        </main>
      </div>

      {/* Action Modals */}
      <QuickOrderModal
        isOpen={isQuickOrderOpen}
        onClose={() => setIsQuickOrderOpen(false)}
        products={products}
        onSubmitOrder={handleCreateOrder}
      />

      <QuickExpenseModal
        isOpen={isQuickExpenseOpen}
        onClose={() => setIsQuickExpenseOpen(false)}
        onAddTransaction={handleAddTransaction}
      />

      <RestockModal
        isOpen={isRestockOpen}
        onClose={() => setIsRestockOpen(false)}
        inventory={inventory}
        onUpdateInventory={handleUpdateInventory}
        onAddTransaction={handleAddTransaction}
      />

      <AddCustomerModal
        isOpen={isAddCustomerOpen}
        onClose={() => setIsAddCustomerOpen(false)}
        onAddCustomer={handleAddCustomer}
      />

      <AddVoucherModal
        isOpen={isAddVoucherOpen}
        onClose={() => setIsAddVoucherOpen(false)}
        onAddVoucher={handleAddVoucher}
      />

      <AddTeamMemberModal
        isOpen={isAddTeamOpen}
        onClose={() => setIsAddTeamOpen(false)}
        onAddMember={handleAddTeamMember}
      />

      {/* Printable Receipt Modal */}
      {invoiceOrder && (
        <InvoiceModal
          order={invoiceOrder}
          onClose={() => setInvoiceOrder(null)}
        />
      )}

      {/* Proof Photo Modal */}
      {selectedProofImage && (
        <div 
          className="fixed inset-0 bg-black/60 z-[2000] flex items-center justify-center p-4 backdrop-blur-sm"
          onClick={() => setSelectedProofImage(null)}
        >
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full relative shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4 border-b pb-2">
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <i className="fas fa-file-invoice-dollar text-red-600"></i> Bukti Pembayaran QRIS
              </h3>
              <button onClick={() => setSelectedProofImage(null)} className="text-gray-400 hover:text-gray-700 text-2xl font-bold transition">&times;</button>
            </div>
            <div className="flex justify-center bg-gray-50 border border-gray-100 rounded-xl p-2 max-h-[70vh] overflow-y-auto custom-scrollbar">
              <img src={selectedProofImage} alt="Bukti Pembayaran QRIS" className="max-w-full h-auto object-contain rounded-lg shadow-sm" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
