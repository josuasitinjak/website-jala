"use client";

import { useState, useEffect } from "react";

const REGULAR_PRODUCTS = [
    {
        id: 1,
        name: "Roti Kirai Berinti Kari Kentang",
        category: "Makanan utama",
        tag: "Akar Tradisi",
        price: 12000,
        desc: "Isian kentang dadu bumbu kari Melayu meresap, dibungkus jala lembut beraroma kunyit. Kering, harum, dan praktis.",
        flavorNotes: "Cita rasa karipap Melayu berbalut roti kirai lembut.",
        suitableFor: "Pembeli yang ingin mencoba rasa aman, klasik, dan familiar.",
        img: "/images/products/roti jala kari kentang.jpeg"
    },
    {
        id: 2,
        name: "Roti Kirai Berinti Ayam Suwir",
        category: "Makanan utama",
        tag: "Gurih Lezat",
        price: 12000,
        desc: "Suwiran daging ayam berbumbu rempah gurih yang dimasak kering dan meresap, terbungkus rapi di dalam roti jala.",
        flavorNotes: "Gurih manis daging ayam suwir kaya bumbu meresap.",
        suitableFor: "Penggemar olahan daging ayam lezat yang padat dan mengenyangkan.",
        img: "/images/products/roti jala ayam suir.jpeg"
    },
    {
        id: 3,
        name: "Roti Kirai Berinti Keju",
        category: "Makanan utama",
        tag: "Creamy & Gurih",
        price: 12000,
        desc: "Keju leleh gurih dan creamy yang lumer di mulut. Sensasi camilan modern kekinian yang disukai semua usia.",
        flavorNotes: "Rasa keju leleh creamy berpadu kelembutan adonan kunyit.",
        suitableFor: "Pecinta keju yang mencari camilan gurih dan mengenyangkan.",
        img: "/images/products/roti jala keju.jpeg"
    },
    {
        id: 4,
        name: "Es Telang Lemonade",
        category: "Minuman",
        tag: "Alami & Segar",
        price: 5000,
        desc: "Air rebusan bunga telang biru alami dipadu es & perasan jeruk lemon segar yang berubah warna menjadi keunguan alami.",
        flavorNotes: "Asam manis citrus segar penyeimbang rasa gurih rempah.",
        suitableFor: "Teman pendamping seluruh varian Roti Kirai.",
        img: "/images/products/es telang lemonade.jpeg"
    }
];

const PACKAGE_PRODUCTS = [
    {
        id: 5,
        name: "Paket Hemat",
        price: 10000,
        normalPrice: 10000,
        portionInfo: "3 buah Roti Kirai",
        desc: "3 buah Roti Kirai Berinti dengan pilihan isian favorit. Pas dan praktis untuk ganjal lapar di jam istirahat.",
        img: "/images/products/paket hemat.jpeg"
    },
    {
        id: 6,
        name: "Paket Lengkap",
        price: 15000,
        normalPrice: 17000,
        portionInfo: "4 buah (1 porsi) + 1 Minuman",
        desc: "1 porsi Roti Kirai Berinti (4 buah) + 1 cup Es Telang Lemonade. Harmoni makan & minum paling pas dan hemat!",
        img: "/images/products/paket lengkap.jpeg"
    },
    {
        id: 7,
        name: "Paket Berdua",
        price: 30000,
        normalPrice: 34000,
        portionInfo: "8 buah (2 porsi) + 2 Minuman",
        desc: "2 porsi makanan (8 buah Roti Kirai) + 2 cup Es Telang Lemonade. Pilihan hemat untuk dinikmati berdua bareng teman.",
        img: "/images/products/paket berdua.jpeg"
    },
    {
        id: 8,
        name: "Paket Puas",
        price: 42000,
        normalPrice: 46000,
        portionInfo: "12 buah (3 porsi) + 2 Minuman",
        desc: "3 porsi makanan (12 buah Roti Kirai) + 2 cup Es Telang Lemonade. Porsi maksimal untuk nongkrong dan makan bersama-sama!",
        img: "/images/products/paket puas.jpeg"
    }
];

export default function Home() {
    // State Management
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [activeSection, setActiveSection] = useState('home');
    const [cart, setCart] = useState([]);
    const [stockData, setStockData] = useState({ soldKari: 0, soldAyam: 0, soldKeju: 0, soldTelang: 0 });
    const [storeOpen, setStoreOpen] = useState(true);
    const [productsCatalog, setProductsCatalog] = useState({
        regular: REGULAR_PRODUCTS,
        package: PACKAGE_PRODUCTS
    });

    // Voucher / Promo State
    const [voucherInput, setVoucherInput] = useState("");
    const [appliedVoucher, setAppliedVoucher] = useState(null);
    const [voucherError, setVoucherError] = useState("");
    const [voucherLoading, setVoucherLoading] = useState(false);

    const KUOTA = { kariMax: 15, ayamMax: 15, kejuMax: 15, telangMax: 20 };

    useEffect(() => {
        // 1. Fetch store settings
        fetch('/api/settings')
            .then(res => res.json())
            .then(data => {
                if (typeof data.storeOpen === 'boolean') {
                    setStoreOpen(data.storeOpen);
                }
            })
            .catch(() => { });

        // 2. Fetch products catalog & availability
        fetch('/api/products')
            .then(res => res.json())
            .then(data => {
                if (data.products && Array.isArray(data.products)) {
                    const reg = REGULAR_PRODUCTS.map(p => {
                        const apiP = data.products.find(x => {
                            const xn = x.name.toLowerCase();
                            const pn = p.name.toLowerCase();
                            return xn === pn || 
                                   (pn.includes('kari') && xn.includes('kari')) ||
                                   (pn.includes('ayam') && xn.includes('ayam')) ||
                                   (pn.includes('keju') && xn.includes('keju')) ||
                                   (pn.includes('telang') && xn.includes('telang'));
                        });
                        return apiP ? { ...p, price: apiP.price, isAvailable: apiP.isAvailable } : p;
                    });
                    const pkg = PACKAGE_PRODUCTS.map(p => {
                        const apiP = data.products.find(x => x.name.toLowerCase() === p.name.toLowerCase());
                        return apiP ? { ...p, price: apiP.price, isAvailable: apiP.isAvailable } : p;
                    });
                    setProductsCatalog({ regular: reg, package: pkg });
                }
            })
            .catch(() => { });

        // 3. Fetch Orders for stock count
        fetch('/api/orders')
            .then(res => res.json())
            .then(data => {
                let soldKari = 0, soldAyam = 0, soldKeju = 0, soldTelang = 0;
                data.orders.forEach(order => {
                    if (order.status === 'Dibatalkan') return;
                    order.items.forEach(item => {
                        const name = item.name.toLowerCase();
                        const qty = item.quantity;
                        if (name.includes('paket hemat')) { soldKari += qty; }
                        else if (name.includes('paket lengkap')) { soldKari += qty; soldTelang += qty; }
                        else if (name.includes('paket berdua')) { soldKari += qty; soldKeju += qty; soldTelang += 2 * qty; }
                        else if (name.includes('paket puas')) { soldKari += qty; soldAyam += qty; soldKeju += qty; soldTelang += 2 * qty; }
                        else if (name.includes('kari')) { soldKari += qty; }
                        else if (name.includes('ayam')) { soldAyam += qty; }
                        else if (name.includes('keju')) { soldKeju += qty; }
                        else if (name.includes('telang')) { soldTelang += qty; }
                    });
                });
                setStockData({ soldKari, soldAyam, soldKeju, soldTelang });
            })
            .catch(console.error);
    }, []);


    // Chatbot State
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [chatMessages, setChatMessages] = useState([
        { sender: "ai", text: "Halo Kak! Saya adalah asisten AI dari JALA. Ada pertanyaan tentang Roti Kirai Berinti atau Es Telang Lemonade kami hari ini?" }
    ]);
    const [chatInput, setChatInput] = useState("");

    // Tracking State
    const [isTrackingModalOpen, setIsTrackingModalOpen] = useState(false);
    const [trackingId, setTrackingId] = useState("");
    const [trackingData, setTrackingData] = useState(null);

    // Modals
    const [isQuantityModalOpen, setIsQuantityModalOpen] = useState(false);
    const [isCartModalOpen, setIsCartModalOpen] = useState(false);
    const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
    const [recentOrderData, setRecentOrderData] = useState(null);
    const [currentProduct, setCurrentProduct] = useState(null);
    const [quantityInput, setQuantityInput] = useState(1);
    const [addressInput, setAddressInput] = useState("");
    const [addressError, setAddressError] = useState(false);
    const [qtyError, setQtyError] = useState(false);

    // Payment State
    const [isQrisModalOpen, setIsQrisModalOpen] = useState(false);
    const [paymentProof, setPaymentProof] = useState(null);
    const [paymentProofPreview, setPaymentProofPreview] = useState(null);
    const [isSubmittingPayment, setIsSubmittingPayment] = useState(false);
    const [customerName, setCustomerName] = useState("");
    const [nameError, setNameError] = useState(false);
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("COD");

    // Handlers
    const handleScrollSpy = () => {
        const sections = ['home', 'products', 'testimonials', 'about', 'contact'];
        let current = '';
        sections.forEach(secId => {
            const el = document.getElementById(secId);
            if (el) {
                if (window.scrollY >= el.offsetTop - 150) {
                    current = secId;
                }
            }
        });

        const footer = document.getElementById('contact');
        if (footer && window.scrollY + window.innerHeight >= footer.offsetTop) {
            current = 'contact';
        }

        if (current) setActiveSection(current);
    };

    useEffect(() => {
        window.addEventListener('scroll', handleScrollSpy);
        return () => window.removeEventListener('scroll', handleScrollSpy);
    }, []);

    const formatRupiah = (num) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num);

    const openQuantityModal = (product) => {
        setCurrentProduct(product);
        setQuantityInput(1);
        setQtyError(false);
        setIsQuantityModalOpen(true);
    };

    const confirmQuantity = () => {
        const qty = parseInt(quantityInput);
        if (qty > 0 && currentProduct) {
            const existing = cart.findIndex(item => item.id === currentProduct.id);
            if (existing > -1) {
                const newCart = [...cart];
                newCart[existing].quantity += qty;
                setCart(newCart);
            } else {
                setCart([...cart, { ...currentProduct, quantity: qty }]);
            }
            setIsQuantityModalOpen(false);
        } else {
            setQtyError(true);
            setTimeout(() => setQtyError(false), 2000);
        }
    };

    const removeFromCart = (index) => {
        const newCart = [...cart];
        newCart.splice(index, 1);
        setCart(newCart);
    };

    const cartTotalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const cartTotalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const discountAmount = appliedVoucher ? appliedVoucher.discountAmount : 0;
    const finalCartPrice = Math.max(0, cartTotalPrice - discountAmount);

    const handleApplyVoucher = async () => {
        if (!voucherInput.trim()) return;
        setVoucherLoading(true);
        setVoucherError("");
        try {
            const res = await fetch("/api/vouchers", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    action: "VALIDATE",
                    code: voucherInput.trim(),
                    cartTotal: cartTotalPrice
                })
            });
            const data = await res.json();
            if (data.valid) {
                setAppliedVoucher(data);
                setVoucherError("");
            } else {
                setVoucherError(data.message || "Kode voucher tidak dapat digunakan.");
                setAppliedVoucher(null);
            }
        } catch (err) {
            setVoucherError("Gagal memeriksa voucher.");
        }
        setVoucherLoading(false);
    };

    const handleRemoveVoucher = () => {
        setAppliedVoucher(null);
        setVoucherInput("");
        setVoucherError("");
    };

    // Shared: submit order to API
    const submitOrder = async (payMethod) => {
        setIsSubmittingPayment(true);
        const payload = {
            customerName: customerName.trim(),
            items: cart,
            subtotal: cartTotalPrice,
            discount: discountAmount,
            voucherCode: appliedVoucher?.voucher?.code || null,
            total: finalCartPrice,
            address: addressInput,
            paymentMethod: payMethod,
            paymentStatus: payMethod === 'COD' ? 'Bayar di Tempat' : 'Menunggu Verifikasi',
            paymentProof: payMethod === 'QRIS' ? paymentProofPreview : null,
            isPreorder: !storeOpen
        };
        try {
            const res = await fetch('/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data = await res.json();
            setCart([]);
            setAddressInput("");
            setCustomerName("");
            setPaymentProof(null);
            setPaymentProofPreview(null);
            setAppliedVoucher(null);
            setVoucherInput("");
            setSelectedPaymentMethod("COD");
            setIsCartModalOpen(false);
            setIsQrisModalOpen(false);
            setRecentOrderData(data.order);
            setTrackingId(data.order.id);
            setIsSuccessModalOpen(true);
        } catch (e) {
            alert("Gagal membuat pesanan. Coba lagi.");
        }
        setIsSubmittingPayment(false);
    };

    // Validate then proceed based on payment method
    const handleCheckout = async () => {
        if (cart.length === 0) return;
        if (customerName.trim() === "") {
            setNameError(true);
            setTimeout(() => setNameError(false), 3000);
            return;
        }
        if (addressInput.trim() === "") {
            setAddressError(true);
            setTimeout(() => setAddressError(false), 3000);
            return;
        }
        if (selectedPaymentMethod === 'QRIS') {
            setIsCartModalOpen(false);
            setIsQrisModalOpen(true);
        } else {
            // COD: langsung submit pesanan
            await submitOrder('COD');
        }
    };

    // Handle payment proof file selection
    const handlePaymentProofChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setPaymentProof(file);
            const reader = new FileReader();
            reader.onload = (ev) => setPaymentProofPreview(ev.target.result);
            reader.readAsDataURL(file);
        }
    };

    // QRIS: Submit order after payment proof uploaded
    const handleFinalSubmit = async () => {
        if (!paymentProof) {
            alert("Harap upload bukti pembayaran QRIS terlebih dahulu.");
            return;
        }
        await submitOrder('QRIS');
    };

    const handleTrackingFetch = async () => {
        if (!trackingId.trim()) return;
        try {
            const res = await fetch('/api/orders');
            const data = await res.json();
            const found = data.orders.find(o => o.id === trackingId.trim().toUpperCase());
            if (found) {
                setTrackingData(found);
            } else {
                alert("Nomor resi (ID) pesanan tidak ditemukan.");
                setTrackingData(null);
            }
        } catch (err) {
            alert("Gagal melacak pesanan.");
        }
    };

    const updateCartItemQuantity = (index, delta) => {
        setCart((prevCart) => {
            const newCart = [...prevCart];
            const result = newCart[index].quantity + delta;
            if (result <= 0) {
                newCart.splice(index, 1);
            } else {
                newCart[index].quantity = result;
            }
            return newCart;
        });
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!chatInput.trim()) return;

        // Add user message
        const userText = chatInput.trim();
        const newMessages = [...chatMessages, { sender: "user", text: userText }];
        setChatMessages(newMessages);
        setChatInput("");

        try {
            const res = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ messages: newMessages })
            });
            const data = await res.json();

            setChatMessages(msgs => [...msgs, { sender: "ai", text: data.response }]);
        } catch (err) {
            console.error(err);
            setChatMessages(msgs => [...msgs, { sender: "ai", text: "Maaf Kak, server AI kami sepertinya lelah. Mohon dicoba beberapa saat lagi ya!" }]);
        }
    };

    return (
        <>
            {/* Store Closed / Pre-Order Announcement Banner */}
            {!storeOpen && (
                <div className="bg-[#FEF9EE] text-amber-950 text-xs md:text-sm py-2 px-4 text-center font-medium flex items-center justify-center gap-2 border-b border-amber-200/70 shadow-xs z-50 sticky top-0">
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                    <span>
                        Gerai JALA saat ini di luar jam operasional dapur. Anda tetap dapat melakukan <strong>Pre-Order</strong> untuk pengantaran sesi besok!
                    </span>
                </div>
            )}

            {/* Navigation */}
            <header className={`bg-white shadow-sm sticky ${!storeOpen ? 'top-9' : 'top-0'} z-40 w-full transition-all border-b border-gray-100`}>
                <div className="container mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <img
                                src="/images/assets/logo.jpeg"
                                alt="JALA Logo"
                                className="jala-logo-img h-10 lg:h-12 w-auto object-contain rounded-xl shadow-sm"
                                style={{ height: '44px', maxHeight: '48px', width: 'auto', objectFit: 'contain' }}
                                onError={(e) => {
                                    e.target.style.display = 'none';
                                    const fallback = document.getElementById('fallback-icon');
                                    if (fallback) fallback.classList.remove('hidden');
                                }}
                            />
                            <i id="fallback-icon" className="fas fa-crown text-2xl text-amber-500 hidden"></i>
                            <h1 className="text-2xl lg:text-3xl font-black tracking-tight bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-500 bg-clip-text text-transparent">
                                JALA
                            </h1>
                        </div>

                        <nav className="hidden md:flex space-x-8">
                            <a href="#home" className={`nav-link text-lg hover:text-amber-600 ${activeSection === 'home' ? 'active' : ''}`}>Beranda</a>
                            <a href="#products" className={`nav-link text-lg hover:text-amber-600 ${activeSection === 'products' ? 'active' : ''}`}>Menu Utama</a>
                            <a href="#testimonials" className={`nav-link text-lg hover:text-amber-600 ${activeSection === 'testimonials' ? 'active' : ''}`}>Testimoni</a>
                            <a href="#about" className={`nav-link text-lg hover:text-amber-600 ${activeSection === 'about' ? 'active' : ''}`}>Tentang</a>
                            <a href="#contact" className={`nav-link text-lg hover:text-amber-600 ${activeSection === 'contact' ? 'active' : ''}`}>Kontak</a>
                        </nav>

                        <div className="flex items-center space-x-4 md:space-x-6">
                            <button onClick={() => setIsTrackingModalOpen(true)} className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-700 hover:bg-amber-50 hover:text-amber-700 transition hover:border-amber-300 text-sm font-bold shadow-sm">
                                <i className="fas fa-search text-amber-600"></i> <span className="hidden sm:inline">Lacak</span>
                            </button>
                            <button onClick={() => setIsCartModalOpen(true)} className="relative text-gray-700 hover:text-amber-600 transition ml-2">
                                <i className="fas fa-shopping-cart text-2xl"></i>
                                <span className="absolute -top-2 -right-3 bg-red-600 text-white text-xs font-black rounded-full w-5 h-5 flex items-center justify-center shadow-md">{cartTotalItems}</span>
                            </button>
                            <button className="md:hidden text-gray-700" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                                <i className="fas fa-bars text-2xl"></i>
                            </button>
                        </div>
                    </div>
                </div>

                {isMobileMenuOpen && (
                    <div className="md:hidden bg-white border-t">
                        <div className="container mx-auto px-6 py-4">
                            <div className="flex flex-col space-y-4">
                                <a href="#home" onClick={() => setIsMobileMenuOpen(false)} className="py-3 border-b text-lg hover:text-amber-600">Beranda</a>
                                <a href="#products" onClick={() => setIsMobileMenuOpen(false)} className="py-3 border-b text-lg hover:text-amber-600">Menu Utama</a>
                                <a href="#testimonials" onClick={() => setIsMobileMenuOpen(false)} className="py-3 border-b text-lg hover:text-amber-600">Testimoni</a>
                                <a href="#about" onClick={() => setIsMobileMenuOpen(false)} className="py-3 border-b text-lg hover:text-amber-600">Tentang Kami</a>
                                <a href="#contact" onClick={() => setIsMobileMenuOpen(false)} className="py-3 border-b text-lg hover:text-amber-600">Kontak</a>
                            </div>
                        </div>
                    </div>
                )}
            </header>

            {/* Hero Section */}
            <section id="home" className="hero relative overflow-hidden bg-gradient-to-b from-[#FFFDF9] via-[#FAF5E8] to-[#FFFDF9] text-gray-900 py-20 md:py-28 border-b border-amber-100/60">
                {/* Very soft ambient warm butter glow */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-amber-100/35 blur-[100px] rounded-full pointer-events-none z-0"></div>

                <div className="container mx-auto px-6 text-center relative z-10 py-4">
                    <div className="inline-block mb-6 px-5 py-2 rounded-full border border-amber-200/80 bg-white/90 text-amber-900 font-bold text-xs md:text-sm tracking-wide uppercase shadow-sm">
                        <i className="fas fa-crown text-amber-500 mr-2"></i> Warisan Kuliner Melayu
                    </div>
                    <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black mb-6 leading-tight text-gray-900 tracking-tight">
                        Roti Kirai Berinti<br />
                        <span className="text-amber-600 font-extrabold">& Es Telang Lemonade</span>
                    </h1>
                    <p className="text-lg md:text-xl mb-10 max-w-2xl mx-auto leading-relaxed font-normal text-gray-600">
                        Kuliner khas Melayu Kepri dalam format gulungan <strong className="text-gray-900 font-semibold bg-amber-100/60 px-2 py-0.5 rounded">porsi pas</strong> beraroma kunyit yang praktis, segar, dan siap santap di lingkungan sekolah.
                    </p>

                    <div className="flex flex-wrap justify-center gap-4">
                        <a href="#products" className="bg-amber-400 hover:bg-amber-500 text-gray-950 px-9 py-3.5 rounded-full font-bold text-base transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 flex items-center gap-2">
                            Lihat Menu JALA <i className="fas fa-arrow-right text-xs"></i>
                        </a>
                        <a href="#about" className="bg-white hover:bg-gray-50 text-gray-700 px-8 py-3.5 rounded-full font-semibold text-base transition-all duration-300 border border-gray-200 shadow-sm hover:border-gray-300">
                            Tentang Kami
                        </a>
                    </div>
                </div>
            </section>

            {/* Features */}
            <section className="section bg-white">
                <div className="container mx-auto px-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                        <div className="text-center p-8 rounded-2xl bg-white hover:bg-amber-50/60 transition-all border border-gray-100 hover:border-amber-200 shadow-sm hover:shadow-md">
                            <div className="bg-amber-100 w-20 h-20 mx-auto rounded-2xl flex items-center justify-center mb-6 shadow-inner">
                                <i className="fas fa-bolt text-amber-600 text-3xl"></i>
                            </div>
                            <h3 className="text-2xl font-bold mb-3 text-gray-800">Zero Queue Experience</h3>
                            <p className="text-gray-600 text-base leading-relaxed">Konsep pesan digital. Anda pesan online, datang hanya untuk mengambil pesanan tanpa antre lama.</p>
                        </div>

                        <div className="text-center p-8 rounded-2xl bg-white hover:bg-amber-50/60 transition-all border border-gray-100 hover:border-amber-200 shadow-sm hover:shadow-md">
                            <div className="bg-amber-100 w-20 h-20 mx-auto rounded-2xl flex items-center justify-center mb-6 shadow-inner">
                                <i className="fas fa-shield-alt text-amber-600 text-3xl"></i>
                            </div>
                            <h3 className="text-2xl font-bold mb-3 text-gray-800">Higienis Terjamin</h3>
                            <p className="text-gray-600 text-base leading-relaxed">Pencucian steril, gramatur presisi, hingga suhu penggorengan persis 160°C. Standard tinggi tanpa kompromi.</p>
                        </div>

                        <div className="text-center p-8 rounded-2xl bg-white hover:bg-amber-50/60 transition-all border border-gray-100 hover:border-amber-200 shadow-sm hover:shadow-md">
                            <div className="bg-amber-100 w-20 h-20 mx-auto rounded-2xl flex items-center justify-center mb-6 shadow-inner">
                                <i className="fas fa-leaf text-amber-600 text-3xl"></i>
                            </div>
                            <h3 className="text-2xl font-bold mb-3 text-gray-800">Eco-Friendly</h3>
                            <p className="text-gray-600 text-base leading-relaxed">Resep yang meminimalisir limbah produksi dan penggunaan paper cup ramah lingkungan.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Products Section */}
            <section id="products" className="section bg-[#fbf9f5]">
                <div className="container mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-extrabold text-gray-900 tracking-tight">Lini Produk JALA</h2>
                        <p className="text-lg text-gray-600 mt-3 font-normal">Pesan sekarang sebelum kehabisan! Kuota produksi terbatas setiap harinya.</p>
                    </div>

                    {/* Regular Products */}
                    <div className="mb-8 border-l-4 border-amber-500 pl-4">
                        <h3 className="text-2xl font-bold text-gray-800">Menu Satuan <span className="text-base font-normal text-gray-500 ml-2">(3 Roti Kirai & 1 Minuman Segar)</span></h3>
                        <p className="text-sm text-gray-500 mt-1">Pilihan kudapan porsi pas berinti lezat dan minuman pendamping alami.</p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
                        {productsCatalog.regular.map(product => (
                            <div key={product.id} className={`product-card bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl border border-gray-100 hover:border-amber-200 transition-all duration-300 flex flex-col group relative ${product.isAvailable === false ? 'opacity-75' : ''}`}>
                                <div className="w-full aspect-[4/3] relative overflow-hidden bg-gray-50 border-b border-gray-100">
                                    <img src={product.img} alt={product.name} className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    {product.isAvailable === false && (
                                        <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px] flex items-center justify-center z-20">
                                            <span className="bg-rose-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg border border-white/20">
                                                Habis Terjual
                                            </span>
                                        </div>
                                    )}

                                </div>
                                <div className="p-5 flex flex-col flex-grow">
                                    <h3 className="text-lg font-bold text-gray-800 mb-1.5 group-hover:text-amber-600 transition leading-snug">{product.name}</h3>
                                    <p className="text-gray-500 text-xs leading-relaxed mb-4 flex-grow line-clamp-3">{product.desc}</p>
                                    <div className="flex justify-between items-center mt-auto pt-3 border-t border-gray-50">
                                        <span className="text-xl font-black text-amber-600">{formatRupiah(product.price)}</span>
                                        <button
                                            disabled={product.isAvailable === false}
                                            className={`${product.isAvailable === false ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-gray-950 font-bold transform hover:-translate-y-0.5 shadow-sm shadow-amber-500/20'} px-4 py-2 rounded-xl text-sm transition flex items-center gap-1.5`}
                                            onClick={() => product.isAvailable !== false && openQuantityModal(product)}
                                        >
                                            <i className="fas fa-cart-plus text-xs"></i> <span>{product.isAvailable === false ? 'Habis' : 'Pesan'}</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Package Products */}
                    <div className="mb-8 border-l-4 border-amber-500 pl-4">
                        <h3 className="text-2xl font-bold text-gray-800">Paket Bundling <span className="text-base font-normal text-gray-500 ml-2">(Lebih Lengkap dan Hemat)</span></h3>
                        <p className="text-sm text-gray-500 mt-1">Kombinasi Roti Kirai & Es Telang Lemonade untuk dinikmati sendiri atau bersama-sama.</p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        {productsCatalog.package.map(product => (
                            <div key={product.id} className={`product-card bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl border border-gray-100 hover:border-amber-200 transition-all duration-300 flex flex-col group relative ${product.isAvailable === false ? 'opacity-75' : ''}`}>
                                <div className="relative w-full aspect-[4/3] overflow-hidden bg-gray-50 border-b border-gray-100">
                                    <img src={product.img} alt={product.name} className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    {product.isAvailable === false && (
                                        <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px] flex items-center justify-center z-20">
                                            <span className="bg-rose-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg border border-white/20">
                                                Habis Terjual
                                            </span>
                                        </div>
                                    )}
                                    {product.normalPrice > product.price && product.isAvailable !== false && (
                                        <div className="absolute top-3 right-3 bg-red-600 text-white text-[11px] font-black px-2.5 py-1 rounded-full shadow-md flex items-center gap-1 z-10 border border-white/30">
                                            <i className="fas fa-tags text-yellow-300"></i> Hemat {formatRupiah(product.normalPrice - product.price)}
                                        </div>
                                    )}
                                    <div className="absolute bottom-3 left-3 bg-black/70 backdrop-blur-sm text-white text-[11px] font-medium px-2.5 py-1 rounded-lg">
                                        {product.portionInfo}
                                    </div>
                                </div>
                                <div className="p-5 flex flex-col flex-grow">
                                    <h3 className="text-lg font-bold text-gray-800 mb-1.5 group-hover:text-amber-600 transition leading-snug">{product.name}</h3>
                                    <p className="text-gray-500 text-xs leading-relaxed mb-4 flex-grow line-clamp-3">{product.desc}</p>
                                    <div className="flex justify-between items-end mt-auto pt-3 border-t border-gray-50">
                                        <div>
                                            {product.normalPrice > product.price && (
                                                <p className="text-xs text-gray-400 line-through mb-0.5">{formatRupiah(product.normalPrice)}</p>
                                            )}
                                            <span className="text-xl font-black text-amber-600 block leading-none">{formatRupiah(product.price)}</span>
                                        </div>
                                        <button
                                            disabled={product.isAvailable === false}
                                            className={`${product.isAvailable === false ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-gray-950 font-bold transform hover:-translate-y-0.5 shadow-sm shadow-amber-500/20'} px-4 py-2 rounded-xl text-sm transition flex items-center gap-1.5`}
                                            onClick={() => product.isAvailable !== false && openQuantityModal(product)}
                                        >
                                            <i className="fas fa-cart-plus text-xs"></i> <span>{product.isAvailable === false ? 'Habis' : 'Pesan'}</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Perbandingan Harga Paket */}
                    <div className="bg-gradient-to-r from-amber-50 via-yellow-50/60 to-orange-50 border border-amber-200/80 rounded-2xl p-6 shadow-sm mb-16">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-8 h-8 rounded-lg bg-amber-500 text-gray-950 flex items-center justify-center font-bold text-sm shadow">
                                <i className="fas fa-percentage"></i>
                            </div>
                            <div>
                                <h4 className="text-base font-bold text-gray-800">Tabel Perbandingan Harga & Penghematan Paket</h4>
                                <p className="text-xs text-gray-500">Bandingkan harga satuan normal dengan harga paket bundling untuk penghematan maksimal</p>
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm border-collapse bg-white rounded-xl shadow-sm overflow-hidden">
                                <thead>
                                    <tr className="bg-gray-100/80 text-gray-600 text-xs uppercase tracking-wider border-b border-gray-200">
                                        <th className="py-3 px-4 font-bold">Produk / Paket</th>
                                        <th className="py-3 px-4 font-bold text-center">Isi Porsi</th>
                                        <th className="py-3 px-4 font-bold text-right">Harga Normal</th>
                                        <th className="py-3 px-4 font-bold text-right text-amber-700">Harga Paket</th>
                                        <th className="py-3 px-4 font-bold text-right text-green-600">Penghematan</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 font-medium">
                                    <tr className="hover:bg-gray-50/80 transition">
                                        <td className="py-3 px-4 font-bold text-gray-800">Paket Hemat</td>
                                        <td className="py-3 px-4 text-center text-gray-600 text-xs">3 buah Roti Kirai</td>
                                        <td className="py-3 px-4 text-right text-gray-400">Rp9.000*</td>
                                        <td className="py-3 px-4 text-right font-bold text-gray-800">Rp10.000</td>
                                        <td className="py-3 px-4 text-right text-gray-500 text-xs">-Rp1.000</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50/80 transition">
                                        <td className="py-3 px-4 font-bold text-gray-800">Paket Lengkap</td>
                                        <td className="py-3 px-4 text-center text-gray-600 text-xs">1 porsi (4 buah) + 1 Es Telang</td>
                                        <td className="py-3 px-4 text-right text-gray-400 line-through">Rp17.000</td>
                                        <td className="py-3 px-4 text-right font-bold text-amber-700">Rp15.000</td>
                                        <td className="py-3 px-4 text-right font-bold text-green-600">+Rp2.000</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50/80 transition">
                                        <td className="py-3 px-4 font-bold text-gray-800">Paket Berdua</td>
                                        <td className="py-3 px-4 text-center text-gray-600 text-xs">2 porsi (8 buah) + 2 Es Telang</td>
                                        <td className="py-3 px-4 text-right text-gray-400 line-through">Rp34.000</td>
                                        <td className="py-3 px-4 text-right font-bold text-amber-700">Rp30.000</td>
                                        <td className="py-3 px-4 text-right font-bold text-green-600">+Rp4.000</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50/80 transition">
                                        <td className="py-3 px-4 font-bold text-gray-800">Paket Puas</td>
                                        <td className="py-3 px-4 text-center text-gray-600 text-xs">3 porsi (12 buah) + 2 Es Telang</td>
                                        <td className="py-3 px-4 text-right text-gray-400 line-through">Rp46.000</td>
                                        <td className="py-3 px-4 text-right font-bold text-amber-700">Rp42.000</td>
                                        <td className="py-3 px-4 text-right font-bold text-green-600">+Rp4.000</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        <p className="text-[11px] text-gray-400 mt-2 italic">*Harga satuan 1 porsi standar Roti Kirai berisi 4 buah seharga Rp12.000 (Rp3.000/buah). Paket Hemat berisi 3 buah siap santap.</p>
                    </div>
                </div>
            </section>

            {/* Info Section - Stok Real-Time */}
            <section className="section bg-gradient-to-b from-amber-50/70 via-yellow-50/40 to-amber-50/60 border-y border-amber-200/60 py-12">
                <div className="container mx-auto px-6">
                    <div className="text-center mb-8">
                        <h3 className="text-2xl font-bold text-gray-800">Stok Hari Ini <span className="text-red-600 font-extrabold">(Terbatas!)</span></h3>
                        <p className="text-gray-500 mt-1 text-sm">Update langsung · Diproduksi setiap hari sesuai pesanan</p>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {/* Kari */}
                        <div className="bg-white p-5 rounded-xl shadow-sm border border-amber-200/80 hover:shadow-md transition">
                            <div className="flex items-center gap-2 mb-3">
                                <div className="bg-amber-100 rounded-full p-2 flex items-center justify-center w-10 h-10 shadow-sm">
                                    <span className="text-xl leading-none">🫓</span>
                                </div>
                                <div>
                                    <p className="font-bold text-gray-800 text-sm leading-tight">Kari Kentang</p>
                                    <p className="text-xs text-gray-500">Max: {KUOTA.kariMax}/hari</p>
                                </div>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-3 mb-1.5 overflow-hidden">
                                <div className="bg-gradient-to-r from-yellow-400 to-amber-500 h-3 rounded-full transition-all duration-1000" style={{ width: `${Math.min(100, (stockData.soldKari / KUOTA.kariMax) * 100)}%` }}></div>
                            </div>
                            <div className="flex justify-between text-xs">
                                <span className="text-gray-500">{stockData.soldKari} terjual</span>
                                <span className={`font-bold ${Math.max(0, KUOTA.kariMax - stockData.soldKari) === 0 ? 'text-red-600' : 'text-green-600'}`}>Sisa {Math.max(0, KUOTA.kariMax - stockData.soldKari)}</span>
                            </div>
                        </div>

                        {/* Ayam Suwir */}
                        <div className="bg-white p-5 rounded-xl shadow-sm border border-amber-200/80 hover:shadow-md transition">
                            <div className="flex items-center gap-2 mb-3">
                                <div className="bg-amber-100 rounded-full p-2 flex items-center justify-center w-10 h-10 shadow-sm">
                                    <span className="text-xl leading-none">🍗</span>
                                </div>
                                <div>
                                    <p className="font-bold text-gray-800 text-sm leading-tight">Ayam Suwir</p>
                                    <p className="text-xs text-gray-500">Max: {KUOTA.ayamMax}/hari</p>
                                </div>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-3 mb-1.5 overflow-hidden">
                                <div className="bg-gradient-to-r from-amber-500 to-red-500 h-3 rounded-full transition-all duration-1000" style={{ width: `${Math.min(100, (stockData.soldAyam / KUOTA.ayamMax) * 100)}%` }}></div>
                            </div>
                            <div className="flex justify-between text-xs">
                                <span className="text-gray-500">{stockData.soldAyam} terjual</span>
                                <span className={`font-bold ${Math.max(0, KUOTA.ayamMax - stockData.soldAyam) === 0 ? 'text-red-600' : 'text-green-600'}`}>Sisa {Math.max(0, KUOTA.ayamMax - stockData.soldAyam)}</span>
                            </div>
                        </div>

                        {/* Keju */}
                        <div className="bg-white p-5 rounded-xl shadow-sm border border-amber-200/80 hover:shadow-md transition">
                            <div className="flex items-center gap-2 mb-3">
                                <div className="bg-orange-100 rounded-full p-2 flex items-center justify-center w-10 h-10 shadow-sm">
                                    <span className="text-xl leading-none">🧀</span>
                                </div>
                                <div>
                                    <p className="font-bold text-gray-800 text-sm leading-tight">Keju</p>
                                    <p className="text-xs text-gray-500">Max: {KUOTA.kejuMax}/hari</p>
                                </div>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-3 mb-1.5 overflow-hidden">
                                <div className="bg-gradient-to-r from-orange-400 to-amber-500 h-3 rounded-full transition-all duration-1000" style={{ width: `${Math.min(100, (stockData.soldKeju / KUOTA.kejuMax) * 100)}%` }}></div>
                            </div>
                            <div className="flex justify-between text-xs">
                                <span className="text-gray-500">{stockData.soldKeju} terjual</span>
                                <span className={`font-bold ${Math.max(0, KUOTA.kejuMax - stockData.soldKeju) === 0 ? 'text-red-600' : 'text-green-600'}`}>Sisa {Math.max(0, KUOTA.kejuMax - stockData.soldKeju)}</span>
                            </div>
                        </div>

                        {/* Es Telang */}
                        <div className="bg-white p-5 rounded-xl shadow-sm border border-blue-100 hover:shadow-md transition">
                            <div className="flex items-center gap-2 mb-3">
                                <div className="bg-blue-100 rounded-full p-2 flex items-center justify-center w-10 h-10 shadow-sm">
                                    <span className="text-xl leading-none">💙</span>
                                </div>
                                <div>
                                    <p className="font-bold text-gray-800 text-sm leading-tight">Es Telang</p>
                                    <p className="text-xs text-gray-500">Max: {KUOTA.telangMax}/hari</p>
                                </div>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-3 mb-1.5 overflow-hidden">
                                <div className="bg-gradient-to-r from-blue-400 to-violet-500 h-3 rounded-full transition-all duration-1000" style={{ width: `${Math.min(100, (stockData.soldTelang / KUOTA.telangMax) * 100)}%` }}></div>
                            </div>
                            <div className="flex justify-between text-xs">
                                <span className="text-gray-500">{stockData.soldTelang} terjual</span>
                                <span className={`font-bold ${Math.max(0, KUOTA.telangMax - stockData.soldTelang) === 0 ? 'text-red-600' : 'text-green-600'}`}>Sisa {Math.max(0, KUOTA.telangMax - stockData.soldTelang)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Testimonials Section */}
            <section id="testimonials" className="section bg-white">
                <div className="container mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold text-gray-800">Apa Kata Mereka</h2>
                        <p className="text-xl text-gray-600 mt-4">Review nyata dari para siswa/i pemerhati jajanan lezat</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                        <div className="testimonial-card bg-gray-50 p-8 rounded-xl border border-gray-100 hover:border-amber-200 hover:bg-amber-50/30 transition shadow-sm cursor-pointer">
                            <div className="flex items-center mb-4">
                                <img src="https://placehold.co/100x100/fef3c7/92400e?text=HA" alt="Haura" className="w-16 h-16 rounded-full mr-4 border-2 border-white shadow-sm" />
                                <div>
                                    <h4 className="text-xl font-bold text-gray-800">Haura</h4>
                                    <div className="text-yellow-400">
                                        <i className="fas fa-star"></i><i className="fas fa-star"></i><i className="fas fa-star"></i><i className="fas fa-star"></i><i className="fas fa-star"></i>
                                    </div>
                                </div>
                            </div>
                            <p className="text-gray-600 text-lg italic leading-relaxed">"Roti Kirai isi Kari Kentang beneran nagih! Tekstur rotinya lembut beraroma kunyit khas Melayu, isian karinya padat dan gurih rempahnya berasa banget tanpa belepotan saat dimakan di kelas."</p>
                        </div>
                        <div className="testimonial-card bg-gray-50 p-8 rounded-xl border border-gray-100 hover:border-amber-200 hover:bg-amber-50/30 transition shadow-sm cursor-pointer">
                            <div className="flex items-center mb-4">
                                <img src="https://placehold.co/100x100/fce7f3/9d174d?text=LT" alt="Lettyzia" className="w-16 h-16 rounded-full mr-4 border-2 border-white shadow-sm" />
                                <div>
                                    <h4 className="text-xl font-bold text-gray-800">Lettyzia</h4>
                                    <div className="text-yellow-400">
                                        <i className="fas fa-star"></i><i className="fas fa-star"></i><i className="fas fa-star"></i><i className="fas fa-star"></i><i className="fas fa-star"></i>
                                    </div>
                                </div>
                            </div>
                            <p className="text-gray-600 text-lg italic leading-relaxed">"Suka banget varian Ayam Suwir dan Kejunya! Ditambah Es Telang Lemonade yang seger dan estetik pas berubah warna. Praktis, higienis, dan pas buat nemenin jam istirahat."</p>
                        </div>
                        <div className="testimonial-card bg-gray-50 p-8 rounded-xl border border-gray-100 hover:border-amber-200 hover:bg-amber-50/30 transition shadow-sm cursor-pointer">
                            <div className="flex items-center mb-4">
                                <img src="https://placehold.co/100x100/e0f2fe/0369a1?text=GB" alt="Gabriel" className="w-16 h-16 rounded-full mr-4 border-2 border-white shadow-sm" />
                                <div>
                                    <h4 className="text-xl font-bold text-gray-800">Gabriel</h4>
                                    <div className="text-yellow-400">
                                        <i className="fas fa-star"></i><i className="fas fa-star"></i><i className="fas fa-star"></i><i className="fas fa-star"></i><i className="fas fa-star"></i>
                                    </div>
                                </div>
                            </div>
                            <p className="text-gray-600 text-lg italic leading-relaxed">"Paket Lengkapnya worth it banget, porsinya ngenyangin dan hemat. Konsep pesan online tanpa antre lama bikin praktis banget buat anak sekolah yang jam istirahatnya terbatas!"</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* About Us Section */}
            <section id="about" className="section relative bg-gradient-to-b from-[#FAF8F5] via-amber-50/30 to-white border-t border-amber-100 overflow-hidden">
                {/* Decorative Background Elements */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-amber-200 rounded-full opacity-30 blur-3xl -translate-y-1/2 translate-x-1/3 z-0 pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-80 h-80 bg-amber-100 rounded-full opacity-40 blur-3xl translate-y-1/3 -translate-x-1/3 z-0 pointer-events-none"></div>

                <div className="container mx-auto px-6 relative z-10">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight">Lebih Dekat dengan <span className="bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-500 bg-clip-text text-transparent">JALA</span></h2>
                    </div>

                    <div className="grid lg:grid-cols-2 gap-16 items-center">

                        {/* Left Column: Descriptive Text & Features */}
                        <div className="order-2 lg:order-1 lg:sticky lg:top-32 lg:self-start pb-8">
                            <h3 className="text-3xl font-bold text-gray-800 mb-6 text-center lg:text-left leading-tight">Warisan Melayu Kepri<br />dalam Genggaman Kekinian</h3>
                            <p className="text-lg text-gray-600 mb-6 leading-relaxed text-center lg:text-left">
                                <strong className="text-gray-900 border-b-[3px] border-amber-400 pb-0.5">JALA</strong> lahir sebagai wujud nyata dari pembelajaran Kewirausahaan (PKWU) di SMA Negeri 1 Batam. Kami tidak sekadar berjualan jajanan biasa, kami mengangkat warisan budaya kuliner <em className="text-amber-700 not-italic font-semibold">Roti Kirai (Roti Jala)</em> khas Melayu Kepulauan Riau ke format yang lebih modern, praktis, dan siap dinikmati kapan saja.
                            </p>
                            <p className="text-lg text-gray-600 mb-6 leading-relaxed text-center lg:text-left">
                                Adonan tepung beraroma kunyit dibentuk menjadi jaring tipis, digulung bersama isian kering pilihan, lalu dipotong menjadi <strong className="text-gray-900 bg-amber-100/80 px-1.5 py-0.5 rounded">porsi pas rolls</strong> yang praktis dibawa dan tidak mengotori tangan. Ditemani Es Telang Lemonade dari bunga telang warisan tradisi kuliner Melayu.
                            </p>
                            <p className="text-lg text-gray-600 mb-10 leading-relaxed text-center lg:text-left">
                                Tim JALA bekerja secara <strong className="text-gray-900">Profesional</strong> dengan berpegang teguh pada <em>Standard Operating Procedure (SOP)</em> produksi yang ketat, mulai dari pemilihan bahan baku, takaran bumbu yang presisi, kontrol kualitas, hingga <em>packaging</em> ramah lingkungan guna menjaga konsistensi mutu rasa setiap harinya.
                            </p>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
                                <div className="group bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl hover:border-amber-300 transition-all duration-300 transform hover:-translate-y-2">
                                    <div className="bg-amber-50 w-16 h-16 mx-auto rounded-2xl flex items-center justify-center mb-5 group-hover:bg-gradient-to-br group-hover:from-amber-400 group-hover:to-amber-500 group-hover:rotate-6 transition-all duration-300">
                                        <i className="fas fa-balance-scale text-amber-600 text-2xl group-hover:text-gray-950 transition-colors duration-300"></i>
                                    </div>
                                    <h4 className="text-xl font-bold text-gray-900 mb-2">Terukur</h4>
                                    <p className="text-gray-500 text-sm font-medium">Resep Timbangan</p>
                                </div>
                                <div className="group bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl hover:border-amber-300 transition-all duration-300 transform hover:-translate-y-2 delay-75">
                                    <div className="bg-amber-50 w-16 h-16 mx-auto rounded-2xl flex items-center justify-center mb-5 group-hover:bg-gradient-to-br group-hover:from-amber-400 group-hover:to-amber-500 group-hover:-rotate-6 transition-all duration-300">
                                        <i className="fas fa-laptop-code text-amber-600 text-2xl group-hover:text-gray-950 transition-colors duration-300"></i>
                                    </div>
                                    <h4 className="text-xl font-bold text-gray-900 mb-2">Digital</h4>
                                    <p className="text-gray-500 text-sm font-medium">Pesanan Otomatis</p>
                                </div>
                                <div className="group bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl hover:border-amber-300 transition-all duration-300 transform hover:-translate-y-2 delay-150">
                                    <div className="bg-amber-50 w-16 h-16 mx-auto rounded-2xl flex items-center justify-center mb-5 group-hover:bg-gradient-to-br group-hover:from-amber-400 group-hover:to-amber-500 group-hover:rotate-6 transition-all duration-300">
                                        <i className="fas fa-leaf text-amber-600 text-2xl group-hover:text-gray-950 transition-colors duration-300"></i>
                                    </div>
                                    <h4 className="text-xl font-bold text-gray-900 mb-2">Organik</h4>
                                    <p className="text-gray-500 text-sm font-medium">Kemasan Ramah</p>
                                </div>
                            </div>
                        </div>

                        {/* Right Column: Group Info Card */}
                        <div className="order-1 lg:order-2">
                            <div className="bg-white rounded-[2rem] shadow-2xl overflow-hidden border border-gray-100/50 relative transform hover:scale-[1.02] transition-transform duration-500">
                                {/* Banner Header */}
                                <div className="h-36 bg-gradient-to-br from-amber-400 via-yellow-400 to-amber-300 relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-30 rounded-full -mr-10 -mt-10 blur-xl"></div>
                                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-white opacity-20 rounded-full -ml-8 -mb-8 blur-xl"></div>
                                    <div className="absolute -bottom-10 inset-x-0 flex justify-center z-10">
                                        <div className="w-24 h-24 bg-white rounded-[1.5rem] p-1.5 shadow-xl flex items-center justify-center transform rotate-12 transition-transform hover:rotate-0 duration-300">
                                            <div className="w-full h-full bg-amber-50 border-2 border-dashed border-amber-300 rounded-[1.1rem] flex items-center justify-center transform -rotate-12 hover:rotate-0 duration-300 transition-transform">
                                                <i className="fas fa-utensils text-4xl text-amber-600 drop-shadow-sm"></i>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-20 pb-12 px-8 sm:px-12">
                                    <h3 className="text-2xl font-black text-center text-gray-900 mb-10 tracking-wide uppercase">Informasi Proyek</h3>

                                    <div className="space-y-5">
                                        {/* Info Item */}
                                        <div className="flex items-center gap-5 p-4 rounded-2xl bg-gray-50/80 hover:bg-amber-50/60 border border-transparent hover:border-amber-200 transition-all group">
                                            <div className="bg-white p-3.5 rounded-xl shadow-sm border border-gray-100 group-hover:border-amber-300 group-hover:shadow-md transition-all">
                                                <i className="fas fa-school text-amber-600 text-xl w-6 text-center"></i>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500 uppercase tracking-widest font-bold mb-1">Asal Sekolah</p>
                                                <h4 className="font-bold text-gray-900 text-lg">SMA Negeri 1 Batam</h4>
                                            </div>
                                        </div>

                                        {/* Info Item */}
                                        <div className="flex items-center gap-5 p-4 rounded-2xl bg-gray-50/80 hover:bg-amber-50/60 border border-transparent hover:border-amber-200 transition-all group">
                                            <div className="bg-white p-3.5 rounded-xl shadow-sm border border-gray-100 group-hover:border-amber-300 group-hover:shadow-md transition-all">
                                                <i className="fas fa-chalkboard-teacher text-amber-600 text-xl w-6 text-center"></i>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500 uppercase tracking-widest font-bold mb-1">Mata Pelajaran</p>
                                                <h4 className="font-bold text-gray-900 text-lg">PKWU <span className="font-medium text-gray-500 text-sm ml-1">· Kelas XI / Hang Jebat 5</span></h4>
                                            </div>
                                        </div>

                                        {/* Info Item */}
                                        <div className="flex gap-5 p-4 rounded-2xl bg-gray-50/80 hover:bg-amber-50/60 border border-transparent hover:border-amber-200 transition-all group">
                                            <div className="bg-white p-3.5 rounded-xl shadow-sm border border-gray-100 group-hover:border-amber-300 group-hover:shadow-md transition-all h-max">
                                                <i className="fas fa-users text-amber-600 text-xl w-6 text-center"></i>
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-xs text-gray-500 uppercase tracking-widest font-bold mb-3">Struktur Organisasi Tim</p>

                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
                                                    {/* 1. CEO */}
                                                    <div className="flex items-center gap-3 bg-white p-3 rounded-xl border border-gray-100 shadow-sm hover:border-amber-300 transition-colors">
                                                        <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-800 text-[10px] font-extrabold shrink-0 shadow-sm">CEO</div>
                                                        <div>
                                                            <p className="font-bold text-gray-800 text-[13px] leading-tight">Josua Sitinjak</p>
                                                            <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-0.5 font-semibold">CEO · Tech, Finance & Strategy</p>
                                                        </div>
                                                    </div>

                                                    {/* 3. CPCO */}
                                                    <div className="flex items-center gap-3 bg-white p-3 rounded-xl border border-gray-100 shadow-sm hover:border-amber-300 transition-colors">
                                                        <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 text-[10px] font-bold shrink-0 shadow-sm">CPCO</div>
                                                        <div>
                                                            <p className="font-bold text-gray-800 text-[13px] leading-tight">Haura</p>
                                                            <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-0.5 font-semibold">CPCO · Produk & Kreatif</p>
                                                        </div>
                                                    </div>

                                                    {/* 4. CMCO */}
                                                    <div className="flex items-center gap-3 bg-white p-3 rounded-xl border border-gray-100 shadow-sm hover:border-amber-300 transition-colors">
                                                        <div className="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center text-pink-600 text-[10px] font-bold shrink-0 shadow-sm">CMCO</div>
                                                        <div>
                                                            <p className="font-bold text-gray-800 text-[13px] leading-tight">Letty</p>
                                                            <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-0.5 font-semibold">CMCO · Marketing & Customer</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
      
      {/* Contact Section */}
      <footer id="contact" className="section bg-gradient-to-b from-amber-50 via-yellow-50/50 to-amber-100/60 text-gray-800 pt-16 pb-8 border-t-2 border-amber-300">
          <div className="container mx-auto px-6 text-center">
              <div className="mb-4">
                  <span className="text-4xl font-black tracking-tight bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-500 bg-clip-text text-transparent">JALA</span>
                  <p className="text-gray-500 text-sm mt-1">Contemporary Malay Heritage Culinary</p>
              </div>
              <h2 className="text-3xl font-bold mb-4 w-full text-center text-gray-900">Hubungi Kami</h2>
              <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">Tanya-tanya pesanan atau perlu bantuan? Hubungi admin JALA langsung via WhatsApp atau ngobrol cerdas dengan Asisten AI JALA (Chatbot) di pojok kanan bawah!</p>
              <a href="https://wa.me/628217601738" target="_blank" rel="noreferrer" className="bg-green-500 hover:bg-green-600 text-white px-8 py-4 rounded-xl font-bold text-lg transition inline-flex items-center shadow-lg hover:shadow-xl">
                  <i className="fab fa-whatsapp mr-3 text-2xl"></i> Chat WhatsApp Kami
              </a>
              <div className="mt-12 border-t border-amber-200/80 pt-8 flex justify-center items-center flex-col md:flex-row md:justify-between px-6 text-sm text-gray-500">
                  <p>&copy; 2026 JALA Roti Kirai Berinti · SMAN 1 Batam. All Rights Reserved.</p>
                  <p className="mt-2 md:mt-0 font-medium">Projek PKWU Kelas XI / Hang Jebat 5</p>
              </div>
          </div>
      </footer>

            {/* Floating Action Buttons */}
            <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3">
                {/* WhatsApp Support */}
                <a href="https://wa.me/628217601738" target="_blank" rel="noreferrer" className="w-14 h-14 bg-green-500 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-green-600 hover:shadow-xl hover:-translate-y-1 transition duration-300 group relative">
                    <span className="absolute right-16 bg-gray-900 border border-gray-700 text-white text-xs px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition whitespace-nowrap pointer-events-none shadow-md">Hubungi WhatsApp</span>
                    <i className="fab fa-whatsapp text-[28px] relative z-10"></i>
                </a>

                {/* Website Chatbot (API Placeholder) */}
                <button onClick={() => setIsChatOpen(!isChatOpen)} className={`w-14 h-14 bg-gradient-to-br from-amber-400 to-amber-500 text-gray-950 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl hover:-translate-y-1 transition duration-300 group relative border-2 border-white ring-4 ${isChatOpen ? 'ring-amber-300 scale-105 -translate-y-1' : 'ring-amber-100'} z-50`}>
                    <span className="absolute right-16 bg-gray-900 border border-gray-700 text-white text-xs px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition whitespace-nowrap pointer-events-none shadow-md">Tanya Robot AI</span>
                    {!isChatOpen && <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-red-600 border-2 border-white rounded-full"></span>}
                    <i className={`fas ${isChatOpen ? 'fa-times' : 'fa-robot'} text-2xl relative z-10 transition-transform duration-300 text-gray-950`}></i>
                </button>
            </div>

            {/* Website Chatbot UI Screen */}
            <div className={`fixed bottom-28 right-6 w-[85%] sm:w-96 bg-white rounded-2xl shadow-2xl border border-gray-200 z-[90] flex flex-col overflow-hidden origin-bottom-right transition-all duration-300 ${isChatOpen ? 'scale-100 opacity-100 visible' : 'scale-75 opacity-0 invisible pointer-events-none'}`}>
                {/* Chat Header */}
                <div className="bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-400 p-4 text-gray-950 flex justify-between items-center shadow-sm border-b border-amber-300">
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <div className="w-10 h-10 bg-white/80 rounded-full flex items-center justify-center shadow-sm border border-amber-300">
                                <i className="fas fa-robot text-xl text-amber-700"></i>
                            </div>
                            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                        </div>
                        <div>
                            <h4 className="font-extrabold text-sm tracking-wide text-gray-950">JALA AI Assistant</h4>
                            <p className="text-[10px] text-gray-800 flex items-center gap-1 font-semibold"><i className="fas fa-circle text-[8px] text-green-600"></i> Online</p>
                        </div>
                    </div>
                    <button onClick={() => setIsChatOpen(false)} className="text-gray-700 hover:text-gray-950 transition w-8 h-8 flex items-center justify-center rounded-lg hover:bg-amber-500/20">
                        <i className="fas fa-times text-lg"></i>
                    </button>
                </div>

                {/* Chat Messages Log */}
                <div className="h-80 overflow-y-auto p-4 custom-scrollbar bg-slate-50 flex flex-col gap-3">
                    <div className="text-center mb-2">
                        <span className="bg-gray-200 text-gray-500 text-[9px] uppercase tracking-widest px-2.5 py-1 rounded-full font-bold">Hari ini</span>
                    </div>
                    {chatMessages.map((msg, idx) => (
                        <div key={idx} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in-up`}>
                            <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-[13px] leading-snug shadow-sm ${msg.sender === 'user' ? 'bg-gradient-to-br from-amber-500 to-amber-600 text-gray-950 font-medium rounded-br-sm' : 'bg-white border border-gray-100 text-gray-800 rounded-bl-sm'}`}>
                                {msg.text}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Chat Input Field */}
                <div className="p-3 bg-white border-t border-gray-100 flex items-center">
                    <form onSubmit={handleSendMessage} className="flex gap-2 relative w-full items-center">
                        <input
                            type="text"
                            value={chatInput}
                            onChange={(e) => setChatInput(e.target.value)}
                            placeholder="Ketik pesan Anda..."
                            className="flex-1 bg-gray-100 text-sm rounded-full px-5 py-3 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:bg-white border border-gray-300 placeholder-gray-500 text-gray-800 transition-all font-medium cursor-text shadow-inner"
                        />
                        <button type="submit" disabled={!chatInput.trim()} className="w-11 h-11 bg-gradient-to-br from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 disabled:opacity-50 disabled:from-gray-400 disabled:to-gray-400 text-gray-950 rounded-full flex items-center justify-center shrink-0 transition shadow-sm transform hover:scale-105 active:scale-95 disabled:hover:scale-100 font-bold">
                            <i className="fas fa-paper-plane text-sm ml-[-2px] mt-[1px]"></i>
                        </button>
                    </form>
                </div>
            </div>

            {/* Quantity Modal */}
            <div className={`modal-overlay ${isQuantityModalOpen ? 'active' : ''}`}>
                <div className="modal-content shadow-2xl">
                    <h3 className="text-2xl font-bold mb-4 text-gray-800">Konfirmasi Pesanan</h3>
                    <p className="text-lg mb-1">Menu: <span className="font-bold text-amber-700">{currentProduct?.name}</span></p>
                    <p className="text-lg mb-4">Harga: <span className="font-semibold">{formatRupiah(currentProduct?.price)}</span>/porsi</p>
                    <label className="block text-lg mb-2 font-medium text-gray-700">Jumlah Porsi:</label>
                    <input
                        type="number"
                        min="1"
                        value={quantityInput}
                        onChange={(e) => setQuantityInput(e.target.value)}
                        className={`w-full border-2 ${qtyError ? 'border-red-500' : 'border-gray-300'} p-3 rounded-lg text-lg focus:outline-none focus:border-amber-500 transition`}
                    />
                    {qtyError && <p className="text-red-500 text-sm mt-2">Jumlah porsi tidak valid.</p>}

                    <div className="flex justify-end gap-3 mt-8">
                        <button onClick={() => setIsQuantityModalOpen(false)} className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-3 rounded-lg font-medium transition">Batal</button>
                        <button onClick={confirmQuantity} className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-gray-950 px-6 py-3 rounded-lg font-bold transition flex items-center gap-2 shadow-md hover:shadow-lg"><i className="fas fa-check"></i> Tambahkan</button>
                    </div>
                </div>
            </div>

            {/* Cart Modal */}
            <div className={`modal-overlay ${isCartModalOpen ? 'active' : ''}`}>
                <div className="modal-content max-w-2xl shadow-2xl md:p-8">
                    <div className="flex justify-between items-center mb-6 border-b pb-4">
                        <h3 className="text-3xl font-bold text-gray-800 flex items-center gap-3"><i className="fas fa-shopping-basket text-amber-600"></i> Keranjang Anda</h3>
                        <button onClick={() => setIsCartModalOpen(false)} className="text-3xl text-gray-400 hover:text-amber-600 transition">&times;</button>
                    </div>

                    {cart.length === 0 ? (
                        <div className="text-center py-12">
                            <i className="fas fa-shopping-cart text-6xl text-gray-200 mb-6 block mx-auto"></i>
                            <p className="text-xl text-gray-500 font-medium">Keranjang Anda masih kosong.</p>
                        </div>
                    ) : (
                        <div className="mb-4 max-h-[40vh] overflow-y-auto pr-3 custom-scrollbar">
                            {cart.map((item, idx) => (
                                <div key={idx} className="flex justify-between items-center py-4 border-b border-gray-100">
                                    <div className="flex-grow pr-4">
                                        <p className="font-bold text-lg text-gray-800 leading-tight">{item.name}</p>
                                        <p className="text-gray-500 text-sm mt-1">{formatRupiah(item.price)} / porsi</p>
                                    </div>
                                    <div className="flex flex-col items-end gap-2">
                                        <p className="font-bold text-lg text-gray-800">{formatRupiah(item.price * item.quantity)}</p>
                                        <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden shrink-0 shadow-sm opacity-90 hover:opacity-100 transition-opacity">
                                            <button onClick={() => updateCartItemQuantity(idx, -1)} className="w-8 h-8 flex items-center justify-center bg-gray-50 hover:bg-gray-100 text-red-600 transition font-bold text-lg border-r border-gray-200">−</button>
                                            <span className="w-10 text-center font-bold text-sm text-gray-800">{item.quantity}</span>
                                            <button onClick={() => updateCartItemQuantity(idx, 1)} className="w-8 h-8 flex items-center justify-center bg-gray-50 hover:bg-gray-100 text-green-600 transition font-bold text-lg border-l border-gray-200">+</button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {cart.length > 0 && (
                        <div className="border-t pt-6 bg-amber-50/30 -mx-8 -mb-8 p-8 outline outline-1 outline-amber-100 rounded-b-xl mt-4">
                            <div className="mb-4">
                                <label className="block text-base mb-2 font-bold text-gray-800">Nama Pemesan (Wajib):</label>
                                <input type="text" placeholder="Nama lengkap / panggilan..." className={`w-full border-2 ${nameError ? 'border-red-500' : 'border-gray-300'} p-3 rounded-lg text-md focus:outline-none focus:border-amber-500 transition`} value={customerName} onChange={(e) => setCustomerName(e.target.value)} />
                                {nameError && <p className="text-red-500 text-sm mt-1">Nama pemesan tidak boleh kosong.</p>}
                            </div>
                            <div className="mb-5">
                                <label className="block text-base mb-2 font-bold text-gray-800">Alamat Pengantaran (Wajib):</label>
                                <textarea rows="2" placeholder="Contoh: Kelas XI 5 / Kantin Lantai 2..." className={`w-full border-2 ${addressError ? 'border-red-500' : 'border-gray-300'} p-3 rounded-lg text-md focus:outline-none focus:border-amber-500 transition`} value={addressInput} onChange={(e) => setAddressInput(e.target.value)}></textarea>
                                {addressError && <p className="text-red-500 text-sm mt-1">Alamat/Lokasi tidak boleh kosong untuk pengantaran.</p>}
                            </div>

                            {/* Payment Method Selector */}
                            <div className="mb-6">
                                <label className="block text-base mb-3 font-bold text-gray-800">Metode Pembayaran:</label>
                                <div className="grid grid-cols-2 gap-3">
                                    <button type="button" onClick={() => setSelectedPaymentMethod('COD')}
                                        className={`relative p-4 rounded-xl border-2 transition-all duration-200 text-center group ${selectedPaymentMethod === 'COD'
                                                ? 'border-green-500 bg-green-50 shadow-md ring-2 ring-green-200'
                                                : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                                            }`}>
                                        {selectedPaymentMethod === 'COD' && <div className="absolute top-2 right-2 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center"><i className="fas fa-check text-white text-[10px]"></i></div>}
                                        <i className={`fas fa-hand-holding-usd text-2xl mb-2 block ${selectedPaymentMethod === 'COD' ? 'text-green-600' : 'text-gray-400 group-hover:text-gray-600'}`}></i>
                                        <p className={`font-bold text-sm ${selectedPaymentMethod === 'COD' ? 'text-green-700' : 'text-gray-700'}`}>COD</p>
                                        <p className="text-[11px] text-gray-400 mt-0.5">Bayar di Tempat</p>
                                    </button>
                                    <button type="button" onClick={() => setSelectedPaymentMethod('QRIS')}
                                        className={`relative p-4 rounded-xl border-2 transition-all duration-200 text-center group ${selectedPaymentMethod === 'QRIS'
                                                ? 'border-blue-500 bg-blue-50 shadow-md ring-2 ring-blue-200'
                                                : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                                            }`}>
                                        {selectedPaymentMethod === 'QRIS' && <div className="absolute top-2 right-2 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center"><i className="fas fa-check text-white text-[10px]"></i></div>}
                                        <i className={`fas fa-qrcode text-2xl mb-2 block ${selectedPaymentMethod === 'QRIS' ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600'}`}></i>
                                        <p className={`font-bold text-sm ${selectedPaymentMethod === 'QRIS' ? 'text-blue-700' : 'text-gray-700'}`}>QRIS</p>
                                        <p className="text-[11px] text-gray-400 mt-0.5">Transfer via QR</p>
                                    </button>
                                </div>
                            </div>

                            {/* Voucher Promo Input */}
                            <div className="mb-5 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                                <div className="flex items-center justify-between mb-2">
                                    <label className="text-xs font-bold text-gray-700 flex items-center gap-1.5 uppercase tracking-wide">
                                        <i className="fas fa-ticket-alt text-amber-600"></i> Kupon / Voucher Diskon
                                    </label>
                                    {appliedVoucher && (
                                        <span className="text-[11px] bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded-full border border-emerald-200">
                                            ✓ Diskon Aktif
                                        </span>
                                    )}
                                </div>

                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        placeholder="Masukkan kode (Cth: JALABERDUA5K)"
                                        disabled={Boolean(appliedVoucher)}
                                        value={voucherInput}
                                        onChange={(e) => setVoucherInput(e.target.value.toUpperCase())}
                                        className="flex-1 border-2 border-gray-200 px-3 py-2.5 rounded-lg text-xs uppercase font-mono font-bold text-gray-800 focus:outline-none focus:border-amber-500 disabled:bg-gray-100"
                                    />
                                    {appliedVoucher ? (
                                        <button
                                            type="button"
                                            onClick={handleRemoveVoucher}
                                            className="px-4 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg text-xs font-bold transition whitespace-nowrap"
                                        >
                                            Hapus
                                        </button>
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={handleApplyVoucher}
                                            disabled={!voucherInput.trim() || voucherLoading}
                                            className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 disabled:opacity-50 text-gray-950 font-bold rounded-lg text-xs transition shadow-sm whitespace-nowrap"
                                        >
                                            {voucherLoading ? "Cek..." : "Gunakan"}
                                        </button>
                                    )}
                                </div>

                                {appliedVoucher && (
                                    <p className="text-xs text-emerald-600 font-semibold mt-2 flex items-center gap-1">
                                        <i className="fas fa-check-circle"></i> {appliedVoucher.message}
                                    </p>
                                )}
                                {voucherError && (
                                    <p className="text-xs text-red-500 font-semibold mt-2 flex items-center gap-1">
                                        <i className="fas fa-exclamation-circle"></i> {voucherError}
                                    </p>
                                )}
                            </div>

                            {/* Price Summary Breakdown */}
                            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6 space-y-2 text-sm">
                                <div className="flex justify-between text-gray-600">
                                    <span>Subtotal Pesanan:</span>
                                    <span className="font-mono font-semibold">{formatRupiah(cartTotalPrice)}</span>
                                </div>
                                {appliedVoucher && (
                                    <div className="flex justify-between text-emerald-600 font-semibold">
                                        <span>Potongan Kupon ({appliedVoucher.voucher?.code}):</span>
                                        <span className="font-mono font-bold">- {formatRupiah(appliedVoucher.discountAmount)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between items-center text-xl font-bold pt-2 border-t border-gray-100">
                                    <span className="text-gray-800">Total Bayar:</span>
                                    <span className="text-amber-600 text-2xl font-mono font-black">{formatRupiah(finalCartPrice)}</span>
                                </div>
                            </div>

                            <button onClick={handleCheckout} disabled={isSubmittingPayment} className={`w-full px-6 py-4 rounded-xl font-black text-lg transition flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transform hover:-translate-y-1 ${isSubmittingPayment ? 'bg-gray-400 cursor-not-allowed text-white' : 'bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-gray-950 shadow-[0_4px_16px_rgba(245,158,11,0.35)]'}`}>
                                {isSubmittingPayment ? (
                                    <><i className="fas fa-spinner fa-spin"></i> Memproses...</>
                                ) : selectedPaymentMethod === 'QRIS' ? (
                                    <><i className="fas fa-qrcode text-2xl"></i> Lanjut ke Pembayaran QRIS</>
                                ) : (
                                    <><i className="fas fa-check-circle text-2xl"></i> {storeOpen ? "Pesan Sekarang (COD)" : "Pesan Sekarang (Pre-Order)"}</>
                                )}
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* QRIS Payment Modal */}
            <div className={`modal-overlay ${isQrisModalOpen ? 'active' : ''} z-[100]`}>
                <div className="modal-content max-w-lg shadow-2xl mx-4 p-0 overflow-hidden flex flex-col">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-400 p-5 text-gray-950 flex justify-between items-center shrink-0 border-b border-amber-300">
                        <h3 className="text-xl font-bold flex items-center gap-3"><i className="fas fa-qrcode text-2xl text-amber-900"></i> Pembayaran QRIS</h3>
                        <button onClick={() => { setIsQrisModalOpen(false); setIsCartModalOpen(true); }} className="text-gray-700 hover:text-gray-950 text-2xl transition">&times;</button>
                    </div>

                    <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
                        {/* Total */}
                        <div className="flex justify-between items-center bg-amber-50/70 border border-amber-200 rounded-xl p-4 mb-6">
                            <span className="font-bold text-gray-700">Total Bayar:</span>
                            <span className="text-2xl font-extrabold text-amber-600">{formatRupiah(finalCartPrice)}</span>
                        </div>

                        {/* QRIS Image */}
                        <div className="text-center mb-4">
                            <p className="text-sm text-gray-500 mb-3 font-medium">Scan kode QR di bawah atau download untuk membayar:</p>
                            <div className="bg-white border-2 border-dashed border-gray-200 rounded-2xl p-4 inline-block mx-auto shadow-inner">
                                <img src="/images/assets/qris.png" alt="QRIS JALA" className="w-56 h-56 object-contain mx-auto" />
                            </div>
                        </div>

                        {/* Download QRIS button */}
                        <a href="/images/assets/qris.png" download="QRIS_JALA.png" className="w-full bg-white border-2 border-gray-200 text-gray-700 hover:bg-amber-50/50 hover:border-amber-300 px-4 py-3 rounded-xl font-bold text-sm transition flex items-center justify-center gap-2 mb-6 shadow-sm">
                            <i className="fas fa-download text-amber-600"></i> Download QRIS
                        </a>

                        {/* Upload Bukti Bayar */}
                        <div className="mb-6">
                            <label className="block text-base mb-2 font-bold text-gray-700">Upload Bukti Pembayaran <span className="text-red-500">*</span></label>
                            <div className={`relative border-2 border-dashed rounded-xl p-4 text-center transition cursor-pointer hover:border-amber-400 ${paymentProofPreview ? 'border-green-400 bg-green-50' : 'border-gray-300 bg-gray-50'}`}>
                                <input type="file" accept="image/*" onChange={handlePaymentProofChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                                {paymentProofPreview ? (
                                    <div className="flex flex-col items-center gap-2">
                                        <img src={paymentProofPreview} alt="Bukti Bayar" className="w-32 h-32 object-cover rounded-lg border border-green-200 shadow-sm" />
                                        <p className="text-sm text-green-600 font-bold flex items-center gap-1"><i className="fas fa-check-circle"></i> {paymentProof?.name}</p>
                                        <p className="text-xs text-gray-400">Klik untuk ganti</p>
                                    </div>
                                ) : (
                                    <div className="py-4">
                                        <i className="fas fa-cloud-upload-alt text-4xl text-gray-300 mb-2 block"></i>
                                        <p className="text-sm text-gray-500 font-medium">Klik atau seret file screenshot bukti bayar</p>
                                        <p className="text-xs text-gray-400 mt-1">Format: JPG, PNG (max 5MB)</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Submit */}
                        <button
                            onClick={handleFinalSubmit}
                            disabled={isSubmittingPayment || !paymentProof}
                            className={`w-full px-6 py-4 rounded-xl font-bold text-lg transition flex items-center justify-center gap-3 shadow-lg transform hover:-translate-y-0.5 ${paymentProof ? 'bg-green-600 hover:bg-green-700 text-white hover:shadow-xl' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
                        >
                            {isSubmittingPayment ? (
                                <><i className="fas fa-spinner fa-spin"></i> Memproses...</>
                            ) : (
                                <><i className="fas fa-paper-plane text-xl"></i> Kirim Pesanan & Bukti Bayar</>
                            )}
                        </button>

                        <button onClick={() => { setIsQrisModalOpen(false); setIsCartModalOpen(true); }} className="w-full mt-3 text-center text-sm text-gray-400 hover:text-gray-600 transition py-2">
                            <i className="fas fa-arrow-left mr-1"></i> Kembali ke Keranjang
                        </button>
                    </div>
                </div>
            </div>

            {/* Tracking Modal */}
            <div className={`modal-overlay ${isTrackingModalOpen ? 'active' : ''}`}>
                <div className="modal-content max-w-lg shadow-2xl mx-4">
                    <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
                        <h3 className="text-2xl md:text-3xl font-bold text-gray-800 flex items-center gap-3"><i className="fas fa-search text-amber-500"></i> Lacak Pesanan</h3>
                        <button onClick={() => { setIsTrackingModalOpen(false); setTrackingData(null); }} className="text-3xl text-gray-400 hover:text-amber-600 transition">&times;</button>
                    </div>

                    <div className="mb-6 flex flex-col sm:flex-row gap-3">
                        <div className="relative flex-1">
                            <i className="fas fa-receipt absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg"></i>
                            <input
                                type="text"
                                placeholder="Kode Resi (Cth: JALA-1001)"
                                className="w-full border-2 border-gray-200 pl-11 pr-4 py-3.5 rounded-xl focus:outline-none focus:border-amber-500 uppercase text-gray-800 bg-gray-50 focus:bg-white font-bold transition-all shadow-sm"
                                value={trackingId}
                                onChange={(e) => setTrackingId(e.target.value)}
                            />
                        </div>
                        <button onClick={handleTrackingFetch} className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-gray-950 px-8 py-3.5 rounded-xl font-bold transition shadow-md whitespace-nowrap flex items-center justify-center gap-2 transform hover:-translate-y-0.5">
                            <i className="fas fa-search"></i> Cek Status
                        </button>
                    </div>

                    {trackingData && (
                        <div className="bg-white border border-gray-200 rounded-xl p-6 mb-2 relative shadow-inner">
                            <div className="mb-6 text-center">
                                <p className="text-xs text-gray-400 uppercase tracking-widest font-bold mb-2">Status Pesanan: <span className="text-gray-800 px-2 py-1 bg-gray-100 rounded ml-1">{trackingData.id}</span></p>
                                <h4 className="text-2xl md:text-3xl font-extrabold text-amber-600 drop-shadow-sm">{trackingData.status}</h4>
                            </div>

                            <div className="relative pl-2">
                                <div className="absolute left-[24px] top-4 bottom-8 w-1 bg-amber-100 rounded-full"></div>
                                <ul className="space-y-6 relative z-10 w-full pl-2">
                                    {['Pesanan Diterima', 'Sedang Diproses', 'Sedang Diantar', 'Selesai'].map((step, idx) => {
                                        const statuses = ['Pesanan Diterima', 'Sedang Diproses', 'Sedang Diantar', 'Selesai'];
                                        const currentIndex = statuses.indexOf(trackingData.status);
                                        const isPassed = idx <= currentIndex;
                                        const isActive = idx === currentIndex;

                                        return (
                                            <li key={idx} className="flex items-center justify-between gap-5 relative">
                                                <div className={`w-8 h-8 rounded-full flex shrink-0 items-center justify-center font-bold text-sm ring-4 ${isActive ? 'bg-amber-500 text-gray-950 ring-amber-200 shadow-lg scale-110' : isPassed ? 'bg-amber-400 text-gray-950 ring-white' : 'bg-gray-200 text-gray-400 ring-white'}`}>
                                                    {isPassed ? <i className="fas fa-check"></i> : idx + 1}
                                                </div>
                                                <div className="flex-1 bg-gray-50 border border-gray-100 rounded-lg p-3 w-full ml-1">
                                                    <p className={`font-bold ${isActive ? 'text-amber-900 text-lg whitespace-nowrap' : isPassed ? 'text-gray-800' : 'text-gray-400'}`}>{step}</p>
                                                    {isActive && step === 'Pesanan Diterima' && <p className="text-xs text-gray-500 mt-1">Admin telah menerima pesanan Anda secara otomatis.</p>}
                                                    {isActive && step === 'Sedang Diproses' && <p className="text-xs text-gray-500 mt-1">Dapur kami sedang memproduksi dan merebus bumbu.</p>}
                                                    {isActive && step === 'Sedang Diantar' && <p className="text-xs text-gray-500 mt-1">Staf sedang mengantarkan pesanan menuju lokasi kelas Anda.</p>}
                                                    {isActive && step === 'Selesai' && <p className="text-xs text-green-600 mt-1 font-semibold">Selamat menikmati sajian JALA!</p>}
                                                </div>
                                            </li>
                                        )
                                    })}
                                </ul>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Success Modal */}
            <div className={`modal-overlay ${isSuccessModalOpen ? 'active' : ''} z-[100]`}>
                <div className="modal-content max-w-md shadow-2xl mx-4 text-center p-8 border-t-8 border-green-500">
                    <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <i className="fas fa-check text-5xl text-green-500 animate-bounce"></i>
                    </div>
                    <h3 className="text-3xl font-bold text-gray-800 mb-3">Pesanan Berhasil!</h3>
                    <p className="text-gray-600 mb-6 text-lg tracking-wide">Terima kasih Kak, pesanan JALA sudah masuk ke dapur kami!</p>

                    {recentOrderData && (
                        <div className="bg-gray-50 rounded-xl p-5 text-left border border-gray-100 mb-8 shadow-inner">
                            <div className="flex justify-between items-center mb-3">
                                <span className="text-gray-500 font-medium">Nomor Resi:</span>
                                <span className="font-extrabold text-amber-600 text-lg tracking-wider">{recentOrderData.id}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-500 font-medium">Est Pengerjaan:</span>
                                <span className="font-semibold text-gray-800">10-15 Menit</span>
                            </div>
                        </div>
                    )}

                    <button
                        onClick={() => {
                            setIsSuccessModalOpen(false);
                            setTrackingData(recentOrderData);
                            setIsTrackingModalOpen(true);
                        }}
                        className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-gray-950 px-6 py-4 rounded-xl font-bold text-lg transition flex items-center justify-center gap-3 shadow-lg"
                    >
                        <i className="fas fa-search"></i> Lacak Pesanan Saya
                    </button>
                    <button
                        onClick={() => setIsSuccessModalOpen(false)}
                        className="w-full mt-4 bg-white border-2 border-gray-100 text-gray-500 hover:bg-gray-50 px-6 py-3 rounded-xl font-bold transition hover:text-gray-800 shadow-sm"
                    >
                        Kembali ke JALA
                    </button>
                </div>
            </div>
        </>
    );
};
