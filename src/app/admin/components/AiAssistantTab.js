"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  Send, 
  User, 
  RefreshCw, 
  Lightbulb, 
  Bot, 
  FileText, 
  Upload, 
  Trash2, 
  ExternalLink, 
  CheckCircle, 
  AlertCircle, 
  Database, 
  Sparkles, 
  MessageSquare, 
  ShieldCheck,
  FileCheck,
  ArrowRight
} from "lucide-react";

export default function AiAssistantTab({
  orders = [],
  transactions = [],
  inventory = []
}) {
  const [activeSubView, setActiveSubView] = useState("chat"); // 'chat' | 'supabase_docs' | 'advisory'

  // State untuk Live Chat AI Bot
  const [messages, setMessages] = useState([
    {
      sender: "ai",
      text: "Halo Admin JALA! 👋 Saya adalah AI Bot yang terhubung langsung ke database dokumen PDF Supabase dan sistem gerai Anda. Anda bisa menguji jawaban bot, menanyakan isi dokumen PDF yang telah diunggah, atau mengecek informasi menu dan SOP.",
      engine: "Google Gemini / Groq"
    }
  ]);
  const [inputPrompt, setInputPrompt] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [currentAiEngine, setCurrentAiEngine] = useState("AI Model");
  const [hasPdfKnowledge, setHasPdfKnowledge] = useState(false);
  const chatBottomRef = useRef(null);

  // State untuk Dokumen Supabase
  const [supabaseFiles, setSupabaseFiles] = useState([]);
  const [isLoadingDocs, setIsLoadingDocs] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadFeedback, setUploadFeedback] = useState(null); // { type: 'success' | 'error', message: string }
  const [isSupabaseConfigured, setIsSupabaseConfigured] = useState(true);
  const [bucketName, setBucketName] = useState("documents");
  const [isSyncing, setIsSyncing] = useState(false);
  const fileInputRef = useRef(null);

  // Auto-scroll chat
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isThinking]);

  // Muat daftar dokumen PDF dari Supabase
  const fetchSupabaseDocuments = async () => {
    setIsLoadingDocs(true);
    try {
      const res = await fetch("/api/supabase/documents");
      const data = await res.json();
      setIsSupabaseConfigured(!!data.configured);
      if (data.bucket) setBucketName(data.bucket);
      setSupabaseFiles(data.files || []);
      setHasPdfKnowledge((data.files || []).length > 0);
    } catch (err) {
      console.error("Gagal mengambil dokumen Supabase:", err);
      setIsSupabaseConfigured(false);
    }
    setIsLoadingDocs(false);
  };

  useEffect(() => {
    fetchSupabaseDocuments();
  }, []);

  // Handle Upload PDF ke Supabase
  const handleUploadPdf = async (e) => {
    e.preventDefault();
    if (!selectedFile) return;

    if (!selectedFile.name.toLowerCase().endsWith(".pdf")) {
      setUploadFeedback({ type: "error", message: "Hanya file berekstensi .pdf yang diperbolehkan!" });
      return;
    }

    setIsUploading(true);
    setUploadFeedback(null);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      const res = await fetch("/api/supabase/documents", {
        method: "POST",
        body: formData
      });
      const data = await res.json();

      if (data.success) {
        setUploadFeedback({
          type: "success",
          message: data.message || `File ${selectedFile.name} berhasil diunggah ke database Supabase!`
        });
        setSelectedFile(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
        await fetchSupabaseDocuments();

        // Notifikasi ke live chat
        setMessages(prev => [
          ...prev,
          {
            sender: "ai",
            text: `📁 Dokumen baru *${data.file?.name}* (${data.file?.pages || 1} halaman) berhasil diunggah ke Supabase! Sekarang saya sudah bisa menjawab pertanyaan berdasarkan isi dokumen ini.`
          }
        ]);
      } else {
        setUploadFeedback({
          type: "error",
          message: data.error || data.message || "Gagal mengunggah file ke Supabase."
        });
      }
    } catch (err) {
      setUploadFeedback({ type: "error", message: `Terjadi kendala jaringan: ${err.message}` });
    }
    setIsUploading(false);
  };

  // Handle Hapus PDF dari Supabase
  const handleDeletePdf = async (fileName) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus "${fileName}" dari database Supabase?`)) return;

    try {
      const res = await fetch(`/api/supabase/documents?fileName=${encodeURIComponent(fileName)}`, {
        method: "DELETE"
      });
      const data = await res.json();
      if (data.success) {
        await fetchSupabaseDocuments();
      } else {
        alert(data.error || "Gagal menghapus file.");
      }
    } catch (err) {
      alert(`Gagal: ${err.message}`);
    }
  };

  // Sync ulang pengetahuan AI dengan Supabase
  const handleSyncKnowledge = async () => {
    setIsSyncing(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "bot",
          refreshKnowledge: true,
          messages: [{ sender: "user", text: "Sinkronisasi dokumen PDF dari Supabase" }]
        })
      });
      await fetchSupabaseDocuments();
      setIsSyncing(false);
      setMessages(prev => [
        ...prev,
        {
          sender: "ai",
          text: `🔄 Sinkronisasi berhasil! Seluruh pengetahuan dari ${supabaseFiles.length} file PDF di Supabase telah dimuat ulang ke memori AI.`
        }
      ]);
    } catch (e) {
      setIsSyncing(false);
    }
  };

  // Handle Kirim Pesan ke AI Bot
  const handleSendMessage = async (customPrompt) => {
    const text = customPrompt || inputPrompt;
    if (!text.trim() || isThinking) return;

    const newMessages = [...messages, { sender: "user", text: text.trim() }];
    setMessages(newMessages);
    setInputPrompt("");
    setIsThinking(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: activeSubView === "advisory" ? "admin" : "bot",
          messages: newMessages.map(m => ({ sender: m.sender, text: m.text }))
        })
      });
      const data = await res.json();
      if (data.engine) setCurrentAiEngine(data.engine);
      if (data.hasPdfKnowledge !== undefined) setHasPdfKnowledge(data.hasPdfKnowledge);

      const aiReply = data.response || "Halo! Ada yang bisa kami bantu seputar informasi JALA?";
      setMessages([...newMessages, { sender: "ai", text: aiReply, engine: data.engine }]);
    } catch (err) {
      setMessages([
        ...newMessages,
        {
          sender: "ai",
          text: "Mohon maaf, sistem AI sedang memproses permintaan. Boleh diulang kembali pertanyaannya? 🙏"
        }
      ]);
    }
    setIsThinking(false);
  };

  const quickPrompts = [
    "Jelaskan ringkasan isi dokumen PDF yang sudah diupload ke Supabase",
    "Berapa harga dan porsi menu Roti Kirai JALA serta Es Telang?",
    "Apa keunggulan dan ciri khas produk JALA dibanding kompetitor?",
    "Bagaimana format pesan cepat via WhatsApp untuk pelanggan?"
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top Banner Navigation & Live Status */}
      <div className="bg-white p-6 rounded-3xl border border-gray-200/90 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span className="text-xs bg-amber-50 text-amber-800 border border-amber-200 px-2.5 py-0.5 rounded-lg font-bold uppercase font-mono flex items-center gap-1">
              <Sparkles size={12} className="text-amber-600" /> AI Grounding Hub
            </span>
            <span className={`text-xs px-2.5 py-0.5 rounded-lg font-semibold flex items-center gap-1.5 ${
              isSupabaseConfigured 
                ? "bg-emerald-50 text-emerald-700 border border-emerald-200" 
                : "bg-amber-50 text-amber-700 border border-amber-200"
            }`}>
              <Database size={12} />
              {isSupabaseConfigured ? `Supabase: Bucket "${bucketName}"` : "Supabase: Belum Diatur"}
            </span>
            <span className="text-xs bg-slate-100 text-slate-700 border border-slate-200 px-2.5 py-0.5 rounded-lg font-semibold flex items-center gap-1">
              <FileText size={12} /> {supabaseFiles.length} PDF Terbaca
            </span>
          </div>
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">AI Bot & Manajemen PDF Supabase</h2>
          <p className="text-xs text-gray-500 mt-1">
            Unggah dokumen PDF ke Supabase untuk melatih AI, lalu uji respon percakapan bot secara real-time.
          </p>
        </div>

        {/* Sync Button */}
        <button
          onClick={handleSyncKnowledge}
          disabled={isSyncing}
          className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 shadow-sm disabled:opacity-50"
          title="Muat ulang dan sinkronkan dokumen PDF Supabase ke AI"
        >
          <RefreshCw size={14} className={isSyncing ? "animate-spin text-amber-400" : ""} />
          <span>{isSyncing ? "Sinkronisasi..." : "Sinkronkan AI"}</span>
        </button>
      </div>

      {/* Sub Tabs Selector */}
      <div className="flex items-center gap-2 border-b border-gray-200 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveSubView("chat")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
            activeSubView === "chat"
              ? "bg-gradient-to-r from-amber-400 to-amber-500 text-gray-950 shadow-sm font-bold"
              : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
          }`}
        >
          <MessageSquare size={14} />
          <span>Live Chat AI Bot</span>
          <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
        </button>

        <button
          onClick={() => setActiveSubView("supabase_docs")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
            activeSubView === "supabase_docs"
              ? "bg-gradient-to-r from-amber-400 to-amber-500 text-gray-950 shadow-sm font-bold"
              : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
          }`}
        >
          <Database size={14} />
          <span>Kelola File PDF Supabase</span>
          <span className={`px-1.5 py-0.2 rounded-md text-[10px] font-mono font-bold ${
            activeSubView === "supabase_docs" ? "bg-amber-600 text-gray-950" : "bg-gray-100 text-gray-700"
          }`}>
            {supabaseFiles.length}
          </span>
        </button>

        <button
          onClick={() => setActiveSubView("advisory")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
            activeSubView === "advisory"
              ? "bg-gradient-to-r from-amber-400 to-amber-500 text-gray-950 shadow-sm font-bold"
              : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
          }`}
        >
          <Lightbulb size={14} />
          <span>Konsultasi Bisnis PKWU</span>
        </button>
      </div>

      {/* VIEW 1: LIVE CHAT DENGAN AI BOT */}
      {activeSubView === "chat" && (
        <div className="space-y-4">
          {/* Quick Prompts */}
          <div className="space-y-2">
            <p className="text-xs font-semibold text-gray-500 flex items-center gap-1.5">
              <Sparkles size={14} className="text-amber-500" /> Contoh Pertanyaan Pengujian Cepat:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {quickPrompts.map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(prompt)}
                  className="p-3 text-left bg-white hover:bg-red-50/50 border border-gray-200 hover:border-red-300 rounded-2xl text-xs font-medium text-gray-700 transition flex items-center justify-between gap-2 shadow-xs group"
                >
                  <span className="line-clamp-1">{prompt}</span>
                  <ArrowRight size={13} className="text-gray-400 group-hover:text-red-600 shrink-0 transition" />
                </button>
              ))}
            </div>
          </div>

          {/* Chat Container */}
          <div className="bg-white rounded-3xl border border-gray-200 shadow-sm flex flex-col h-[540px] overflow-hidden">
            {/* Chat Header Status */}
            <div className="px-5 py-3 border-b border-gray-100 bg-gray-50/60 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
                <span className="text-xs font-bold text-gray-800">Ruang Obrolan Interaktif AI Bot</span>
                <span className="text-[11px] text-gray-400">|</span>
                <span className="text-[11px] text-gray-500">
                  {supabaseFiles.length > 0 
                    ? `📚 Menggunakan data ${supabaseFiles.length} file PDF Supabase` 
                    : "ℹ️ Mode pengetahuan umum gerai"}
                </span>
              </div>
              <button
                onClick={() => setMessages([messages[0]])}
                className="text-[11px] text-gray-400 hover:text-red-600 font-medium transition"
              >
                Bersihkan Riwayat
              </button>
            </div>

            {/* Messages Scroll Area */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4 custom-scrollbar bg-slate-50/40">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex items-start gap-3 ${msg.sender === "user" ? "flex-row-reverse" : "flex-row"}`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 font-black text-xs shadow-xs ${
                    msg.sender === "user" ? "bg-gradient-to-br from-amber-400 to-amber-500 text-gray-950" : "bg-slate-900 text-white"
                  }`}>
                    {msg.sender === "user" ? <User size={15} /> : <Bot size={15} />}
                  </div>

                  <div className={`max-w-[82%] rounded-2xl p-4 text-xs leading-relaxed shadow-xs ${
                    msg.sender === "user"
                      ? "bg-gradient-to-br from-amber-400 to-amber-500 text-gray-950 font-medium"
                      : "bg-white border border-gray-200/90 text-gray-800"
                  }`}>
                    <p className="whitespace-pre-line">{msg.text}</p>
                    {msg.sender === "ai" && msg.engine && (
                      <div className="mt-2.5 pt-2 border-t border-gray-100 text-[10px] text-gray-400 flex items-center justify-between">
                        <span>Engine: {msg.engine}</span>
                        {supabaseFiles.length > 0 && <span className="text-emerald-600 font-semibold">✓ Grounded PDF</span>}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {isThinking && (
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center text-white text-xs">
                    <Bot size={15} />
                  </div>
                  <div className="bg-white border border-gray-200 rounded-2xl px-4 py-3 text-xs text-gray-500 flex items-center gap-2 shadow-xs">
                    <RefreshCw size={13} className="animate-spin text-amber-500" />
                    <span>AI Bot sedang membaca data PDF dan menyusun jawaban...</span>
                  </div>
                </div>
              )}
              <div ref={chatBottomRef} />
            </div>

            {/* Input Bar */}
            <div className="p-4 border-t border-gray-100 bg-white">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="flex items-center gap-2"
              >
                <input
                  type="text"
                  placeholder="Ketik pertanyaan untuk menguji AI bot berdasarkan PDF atau menu..."
                  value={inputPrompt}
                  onChange={(e) => setInputPrompt(e.target.value)}
                  className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-xs text-gray-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400 transition"
                />
                <button
                  type="submit"
                  disabled={!inputPrompt.trim() || isThinking}
                  className="px-5 py-3 bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 disabled:opacity-50 text-gray-950 font-black text-xs rounded-2xl transition shadow-sm flex items-center gap-1.5 shrink-0"
                >
                  <Send size={14} />
                  <span className="hidden sm:inline">Kirim</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: KELOLA FILE PDF DI SUPABASE */}
      {activeSubView === "supabase_docs" && (
        <div className="space-y-6">
          {/* Upload Area Card */}
          <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm">
            <h3 className="text-base font-bold text-gray-900 flex items-center gap-2 mb-2">
              <Upload size={18} className="text-amber-600" /> Upload File PDF ke Supabase Storage
            </h3>
            <p className="text-xs text-gray-500 mb-5">
              File PDF yang diunggah akan otomatis disimpan ke database Supabase dan diekstrak teksnya untuk dijadikan sumber pengetahuan bagi AI Gemini dan WhatsApp Bot.
            </p>

            <form onSubmit={handleUploadPdf} className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 hover:border-amber-400 bg-gray-50/60 rounded-2xl p-6 text-center transition cursor-pointer relative">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,application/pdf"
                  onChange={(e) => {
                    const file = e.target.files?.[0] || null;
                    setSelectedFile(file);
                    setUploadFeedback(null);
                  }}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="flex flex-col items-center justify-center pointer-events-none">
                  <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center mb-2 border border-amber-200">
                    <FileText size={24} />
                  </div>
                  <p className="text-xs font-bold text-gray-800">
                    {selectedFile ? selectedFile.name : "Klik atau seret file PDF ke sini"}
                  </p>
                  <p className="text-[11px] text-gray-400 mt-1">
                    {selectedFile 
                      ? `${(selectedFile.size / 1024).toFixed(1)} KB (Siap diunggah) ke Supabase` 
                      : "Format yang didukung: Dokumen PDF (Maksimal 25MB)"}
                  </p>
                </div>
              </div>

              {uploadFeedback && (
                <div className={`p-3.5 rounded-xl text-xs flex items-center gap-2 ${
                  uploadFeedback.type === "success" 
                    ? "bg-emerald-50 text-emerald-800 border border-emerald-200" 
                    : "bg-rose-50 text-rose-800 border border-rose-200"
                }`}>
                  {uploadFeedback.type === "success" ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                  <span>{uploadFeedback.message}</span>
                </div>
              )}

              <div className="flex justify-end gap-3">
                {selectedFile && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedFile(null);
                      if (fileInputRef.current) fileInputRef.current.value = "";
                    }}
                    className="px-4 py-2.5 text-xs text-gray-600 hover:text-gray-900 font-bold transition"
                  >
                    Batal
                  </button>
                )}
                <button
                  type="submit"
                  disabled={!selectedFile || isUploading}
                  className="px-6 py-2.5 bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 disabled:opacity-50 text-gray-950 rounded-xl text-xs font-black transition flex items-center gap-2 shadow-sm"
                >
                  {isUploading ? <RefreshCw size={14} className="animate-spin text-gray-950" /> : <Upload size={14} />}
                  <span>{isUploading ? "Mengunggah & Mengekstrak..." : "Unggah ke Supabase"}</span>
                </button>
              </div>
            </form>
          </div>

          {/* List of Files in Supabase */}
          <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <div>
                <h4 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                  <Database size={16} className="text-amber-600" /> Dokumen PDF Tersimpan di Supabase
                </h4>
                <p className="text-xs text-gray-500 mt-0.5">Bucket Storage: <span className="font-mono text-amber-700 font-semibold">{bucketName}</span></p>
              </div>
              <button
                onClick={fetchSupabaseDocuments}
                disabled={isLoadingDocs}
                className="p-2 text-gray-500 hover:text-gray-800 rounded-xl hover:bg-gray-100 transition text-xs font-medium flex items-center gap-1.5"
                title="Refresh daftar file"
              >
                <RefreshCw size={14} className={isLoadingDocs ? "animate-spin" : ""} />
                <span>Refresh</span>
              </button>
            </div>

            {isLoadingDocs ? (
              <div className="p-8 text-center text-xs text-gray-400">
                <RefreshCw size={20} className="animate-spin mx-auto text-amber-500 mb-2" />
                <span>Mengambil daftar file dari Supabase Storage...</span>
              </div>
            ) : supabaseFiles.length === 0 ? (
              <div className="p-10 text-center">
                <div className="w-12 h-12 rounded-2xl bg-gray-100 text-gray-400 flex items-center justify-center mx-auto mb-3">
                  <FileText size={24} />
                </div>
                <h5 className="text-xs font-bold text-gray-700">Belum Ada File PDF di Supabase</h5>
                <p className="text-[11px] text-gray-400 mt-1 max-w-sm mx-auto">
                  Unggah file PDF pertama Anda menggunakan formulir di atas. AI Bot akan langsung otomatis membaca dan menghafal isinya!
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {supabaseFiles.map((file) => (
                  <div key={file.id || file.name} className="p-4 flex items-center justify-between gap-4 hover:bg-gray-50/70 transition">
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0 border border-amber-200">
                        <FileText size={20} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-gray-900 truncate">{file.name}</p>
                        <div className="flex items-center gap-2 text-[11px] text-gray-400 mt-0.5">
                          <span>{(file.size / 1024).toFixed(1)} KB</span>
                          <span>•</span>
                          <span className="text-emerald-600 font-medium flex items-center gap-1">
                            <FileCheck size={12} /> Terhubung ke AI
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {file.publicUrl && (
                        <a
                          href={file.publicUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 text-gray-700 hover:text-amber-700 hover:bg-amber-50 rounded-xl transition text-xs font-bold flex items-center gap-1"
                          title="Buka / Unduh File"
                        >
                          <ExternalLink size={14} />
                          <span className="hidden sm:inline">Buka PDF</span>
                        </a>
                      )}
                      <button
                        onClick={() => handleDeletePdf(file.name)}
                        className="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition"
                        title="Hapus dari Supabase"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* VIEW 3: KONSULTASI STRATEGI BISNIS PKWU */}
      {activeSubView === "advisory" && (
        <div className="space-y-4">
          <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm">
            <h3 className="text-base font-bold text-gray-900 mb-1">Konsultasi Strategi Bisnis PKWU</h3>
            <p className="text-xs text-gray-500 mb-4">
              Diskusikan penetapan margin, HPP, perputaran kas, atau persiapan materi presentasi bisnis PKWU SMAN 1 Batam bersama AI Advisor.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {[
                "Bagaimana cara menaikkan margin laba tanpa menaikkan harga jual?",
                "Ide bundling istirahat sekolah yang paling diminati guru dan siswa",
                "Strategi efektif mencegah sisa bahan baku basah ayam & kentang agar zero-waste",
                "Poin penting pitch deck bisnis PKWU Melayu Kepri untuk penilaian terbaik"
              ].map((p, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setActiveSubView("chat");
                    handleSendMessage(p);
                  }}
                  className="p-3 text-left bg-gray-50 hover:bg-red-50 border border-gray-200 rounded-xl text-xs font-medium text-gray-700 transition flex items-center justify-between"
                >
                  <span>{p}</span>
                  <ArrowRight size={13} className="text-gray-400" />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
