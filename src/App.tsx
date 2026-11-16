/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import {
  Send,
  Crown,
  Volume2,
  VolumeX,
  CreditCard,
  Sparkles,
  UserCheck,
  ShieldCheck,
  BookOpen,
  DollarSign,
  Info,
  LogOut,
  RefreshCw,
  Award,
  CheckCircle2,
  AlertCircle,
  Share2,
  Copy,
  Users,
  MessageSquare,
  TrendingUp,
  FileText,
  PlusCircle,
  ExternalLink
} from "lucide-react";

interface Message {
  role: "user" | "ai";
  text: string;
  timestamp: string;
  isCreatorMessage?: boolean;
}

interface BankAccountInfo {
  bankName: string;
  accountHolder: string;
  clabeOrNumber: string;
  currency: string;
  notes: string;
  updatedAt: string;
}

interface ClientRecord {
  id: string;
  name: string;
  level: string;
  firstSeen: string;
  lastSeen: string;
  totalMessages: number;
  plan: string;
  totalPaid: number;
}

interface ConversationRecord {
  id: string;
  clientName: string;
  userMessage: string;
  aiResponse: string;
  timestamp: string;
  isCreator: boolean;
}

interface SaleRecord {
  id: string;
  clientName: string;
  planName: string;
  amount: number;
  currency: string;
  date: string;
  paymentMethod: string;
  status: string;
}

export default function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [studentName, setStudentName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [autoPronounce, setAutoPronounce] = useState(true);
  const [copiedUrl, setCopiedUrl] = useState(false);

  // Creator state
  const [isCreatorMode, setIsCreatorMode] = useState(false);
  const [showCreatorModal, setShowCreatorModal] = useState(false);
  const [creatorPinInput, setCreatorPinInput] = useState("");
  const [creatorError, setCreatorError] = useState("");
  const [totalInteractions, setTotalInteractions] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);

  // Full Admin Panel Modal
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [adminTab, setAdminTab] = useState<"overview" | "clients" | "conversations" | "sales" | "bank">("overview");
  const [clientsList, setClientsList] = useState<ClientRecord[]>([]);
  const [conversationsList, setConversationsList] = useState<ConversationRecord[]>([]);
  const [salesList, setSalesList] = useState<SaleRecord[]>([]);

  // Manual sale registration form inside admin
  const [showAddSaleModal, setShowAddSaleModal] = useState(false);
  const [newSaleForm, setNewSaleForm] = useState({
    clientName: "",
    planName: "Plan VIP Intensivo con Maestro Antonio",
    amount: "790",
    currency: "MXN",
    paymentMethod: "Transferencia Bancaria",
  });
  const [addSaleMessage, setAddSaleMessage] = useState("");

  // Bank account configuration
  const [showBankModal, setShowBankModal] = useState(false);
  const [bankAccount, setBankAccount] = useState<BankAccountInfo | null>(null);
  const [bankForm, setBankForm] = useState({
    bankName: "",
    accountHolder: "Maestro Antonio",
    clabeOrNumber: "",
    currency: "MXN",
    notes: "Cuenta oficial receptora para todos los ingresos generados por la app de inglés",
  });
  const [bankSaveSuccess, setBankSaveSuccess] = useState(false);
  const [bankSaveError, setBankSaveError] = useState("");

  const chatEndRef = useRef<HTMLDivElement>(null);

  // Share state
  const [showShareModal, setShowShareModal] = useState(false);
  const [copiedDevUrl, setCopiedDevUrl] = useState(false);
  const [copiedPreUrl, setCopiedPreUrl] = useState(false);

  // The permanent shared link and dev link
  const DEV_APP_URL = "https://ais-dev-bz4miolbxar7xrliu6bom5-435543898067.us-east1.run.app";
  const SHARED_APP_URL = "https://ais-pre-bz4miolbxar7xrliu6bom5-435543898067.us-east1.run.app";
  const LIVE_URL = typeof window !== "undefined" ? window.location.origin : DEV_APP_URL;

  useEffect(() => {
    fetchCreatorStatus();
    fetchAdminOverview();
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const fetchCreatorStatus = async () => {
    try {
      const res = await fetch("/api/creator/status");
      if (res.ok) {
        const data = await res.json();
        setTotalInteractions(data.totalInteractions || 0);
        setTotalRevenue(data.totalRevenue || 0);
        if (data.bankAccount) {
          setBankAccount(data.bankAccount);
          setBankForm({
            bankName: data.bankAccount.bankName,
            accountHolder: data.bankAccount.accountHolder,
            clabeOrNumber: data.bankAccount.clabeOrNumber,
            currency: data.bankAccount.currency,
            notes: data.bankAccount.notes,
          });
        }
      }
    } catch (err) {
      console.error("Error fetching creator status", err);
    }
  };

  const fetchAdminOverview = async () => {
    try {
      const res = await fetch("/api/admin/overview");
      if (res.ok) {
        const data = await res.json();
        setTotalInteractions(data.totalInteractions || 0);
        setTotalRevenue(data.totalRevenue || 0);
        setClientsList(data.clients || []);
        setConversationsList(data.conversations || []);
        setSalesList(data.sales || []);
        if (data.bankAccount) {
          setBankAccount(data.bankAccount);
        }
      }
    } catch (err) {
      console.error("Error fetching admin overview", err);
    }
  };

  // Welcome message based on mode
  useEffect(() => {
    const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    if (isCreatorMode) {
      setMessages([
        {
          role: "ai",
          text: "👑 ¡A sus respetables órdenes, Maestro Antonio! Bienvenido a su aplicación. Lo reconozco con la clave 0793 como mi creador, director y patrón supremo. Estoy registrando todas las conversaciones, los clientes y las ventas para su supervisión. ¿Qué orden desea impartir hoy?",
          timestamp: time,
          isCreatorMessage: true,
        },
      ]);
    } else {
      setMessages([
        {
          role: "ai",
          text: "¡Hello! Welcome to your English Tutor, academia de inglés guiada bajo la dirección pedagógica del Maestro Antonio. 🌟\n\n¿Qué te gustaría practicar hoy? Puedo ayudarte a perfeccionar tu pronunciación, corregir tu gramática o tener una conversación fluida en inglés.",
          timestamp: time,
        },
      ]);
    }
  }, [isCreatorMode]);

  const handleLoginCreator = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setCreatorError("");
    try {
      const res = await fetch("/api/creator/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: creatorPinInput }),
      });
      const data = await res.json();
      if (data.success) {
        setIsCreatorMode(true);
        setShowCreatorModal(false);
        setCreatorPinInput("");
        fetchAdminOverview();
      } else {
        setCreatorError("Clave incorrecta. Ingrese la clave asignada al Maestro Antonio: 0793");
      }
    } catch (err) {
      setCreatorError("Error al verificar clave.");
    }
  };

  const handleSaveBankAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setBankSaveError("");
    setBankSaveSuccess(false);

    try {
      const res = await fetch("/api/creator/bank-account", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...bankForm,
          pin: "0793",
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setBankAccount(data.bankAccount);
        setBankSaveSuccess(true);
        setTimeout(() => setBankSaveSuccess(false), 4000);
      } else {
        setBankSaveError(data.error || "No se pudo guardar la cuenta.");
      }
    } catch (err) {
      setBankSaveError("Error de red al registrar la cuenta.");
    }
  };

  const handleAddManualSale = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddSaleMessage("");
    try {
      const res = await fetch("/api/admin/sales/record", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newSaleForm,
          pin: "0793",
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setAddSaleMessage("¡Venta registrada exitosamente en el sistema del Maestro Antonio!");
        fetchAdminOverview();
        setTimeout(() => {
          setShowAddSaleModal(false);
          setAddSaleMessage("");
        }, 1500);
      } else {
        setAddSaleMessage("Error al registrar venta.");
      }
    } catch (err) {
      setAddSaleMessage("Error de red al registrar la venta.");
    }
  };

  const copyShareUrl = () => {
    navigator.clipboard.writeText(SHARED_APP_URL);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 3000);
  };

  const copySalesReport = () => {
    const reportText = `
📋 REPORTE DE VENTAS Y AUDITORÍA - MAESTRO ANTONIO
Fecha de Emisión: ${new Date().toLocaleString()}
Plataforma: English Tutor (Tutor de Inglés)
Creador y Patrón: Maestro Antonio
Clave de Mando: 0793
--------------------------------------------------
Total Recaudado: $${totalRevenue.toLocaleString()} MXN
Total de Interacciones: ${totalInteractions}
Alumnos Registrados: ${clientsList.length}
Ventas Completadas: ${salesList.length}
--------------------------------------------------
DETALLE DE VENTAS:
${salesList.map((s, idx) => `${idx + 1}. [${s.id}] ${s.clientName} - ${s.planName} -> $${s.amount} ${s.currency} (${new Date(s.date).toLocaleDateString()}) - ${s.status}`).join("\n")}
--------------------------------------------------
Cuenta Receptora: ${bankAccount ? `${bankAccount.bankName} - ${bankAccount.accountHolder} (CLABE: ${bankAccount.clabeOrNumber})` : "Pendiente de confirmación por el Maestro Antonio"}
Enlace de la App: ${SHARED_APP_URL}
    `.trim();

    navigator.clipboard.writeText(reportText);
    alert("¡Reporte completo de ventas copiado al portapapeles! Listo para enviar por WhatsApp o guardar.");
  };

  const sendMessage = async (overridePrompt?: string) => {
    const textToSend = overridePrompt || input;
    if (!textToSend.trim() || isLoading) return;

    const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const userMessage: Message = {
      role: "user",
      text: textToSend,
      timestamp: time,
      isCreatorMessage: isCreatorMode,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: textToSend,
          isCreator: isCreatorMode,
          creatorName: "Antonio",
          clientName: studentName || (isCreatorMode ? "Maestro Antonio (Patrón)" : "Estudiante"),
          history: messages.slice(-8),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        const errorText = data.error || "Hubo un inconveniente al generar la respuesta.";
        setMessages((prev) => [
          ...prev,
          {
            role: "ai",
            text: `⚠️ Aviso del sistema: ${errorText}`,
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          },
        ]);
        return;
      }

      const replyText = data.response || "No se recibió respuesta del tutor.";
      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          text: replyText,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          isCreatorMessage: isCreatorMode,
        },
      ]);

      if (autoPronounce && !isCreatorMode) {
        speakText(replyText);
      }
      setTotalInteractions((prev) => prev + 1);
      // Refresh admin logs silently
      fetchAdminOverview();
    } catch (error) {
      console.error(error);
      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          text: "⚠️ Error de conexión con el servidor. Revisa tu conexión a internet o la configuración del servidor.",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const speakText = (text: string) => {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const clean = text.replace(/[*#_`]/g, " ");
    const utterance = new SpeechSynthesisUtterance(clean);
    utterance.lang = "en-US";
    utterance.rate = 0.95;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-slate-900 text-slate-100 font-sans">
      {/* Top Bar with Branding, Share Link and Control Buttons */}
      <header className="border-b border-slate-800 bg-slate-950/95 backdrop-blur px-4 py-3 sticky top-0 z-20 shadow-md">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-3">
          {/* Logo & Title */}
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl flex items-center justify-center shadow-lg ${
              isCreatorMode 
                ? "bg-gradient-to-tr from-amber-500 to-yellow-300 text-slate-950 shadow-amber-500/20" 
                : "bg-gradient-to-tr from-blue-600 to-cyan-400 text-white shadow-blue-500/20"
            }`}>
              {isCreatorMode ? <Crown className="w-6 h-6 stroke-[2.5]" /> : <BookOpen className="w-6 h-6" />}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold tracking-tight text-white">
                  {isCreatorMode ? "Panel Maestro Antonio (Clave 0793)" : "Tutor de Inglés Inteligente"}
                </h1>
                {isCreatorMode ? (
                  <span className="inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/40">
                    <Crown className="w-3 h-3" /> Patrón y Creador
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                    <Award className="w-3 h-3 text-amber-400" /> Dirigido por Maestro Antonio
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400">
                {isCreatorMode
                  ? "Sesión de control total: Registro de alumnos, conversaciones y reportes de ventas activos."
                  : "Aprende y perfecciona tu pronunciación y conversación en inglés en tiempo real."}
              </p>
            </div>
          </div>

          {/* Action buttons on header */}
          <div className="flex items-center flex-wrap gap-2">
            {/* Share App URL button for the Creator / Owner */}
            <button
              onClick={() => setShowShareModal(true)}
              className="p-2 px-3 rounded-lg border border-sky-500/40 bg-sky-950/40 text-sky-300 hover:bg-sky-900/50 text-xs font-medium flex items-center gap-1.5 transition-all shadow-sm"
              title="Ver y copiar URLs para compartir con el dueño o alumnos"
            >
              <Share2 className="w-4 h-4 text-sky-400" />
              <span>Enlaces de la App</span>
            </button>

            {/* Audio toggle button */}
            <button
              onClick={() => {
                if (isSpeaking) {
                  stopSpeaking();
                } else {
                  setAutoPronounce(!autoPronounce);
                }
              }}
              title={autoPronounce ? "Voz activa" : "Voz desactivada"}
              className={`p-2 rounded-lg border text-xs font-medium flex items-center gap-1.5 transition-all ${
                autoPronounce
                  ? "bg-slate-800 border-slate-700 text-cyan-400 hover:bg-slate-700"
                  : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200"
              }`}
            >
              {autoPronounce ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            {/* Admin Panel Button (Accessible in Creator mode or directly) */}
            <button
              onClick={() => {
                if (!isCreatorMode) {
                  setShowCreatorModal(true);
                } else {
                  fetchAdminOverview();
                  setShowAdminPanel(true);
                }
              }}
              className="p-2 px-3 rounded-lg border border-amber-500/40 bg-amber-950/40 text-amber-300 hover:bg-amber-900/50 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm"
              title="Panel de Control: Clientes, Conversaciones e Ingresos"
            >
              <TrendingUp className="w-4 h-4 text-amber-400" />
              <span>Panel de Ventas & Registros</span>
            </button>

            {/* Creator authentication button */}
            {isCreatorMode ? (
              <button
                onClick={() => setIsCreatorMode(false)}
                className="p-2 px-3 rounded-lg bg-red-950/50 border border-red-800/60 text-red-300 hover:bg-red-900/60 text-xs font-semibold flex items-center gap-1.5 transition-all"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Modo Alumno</span>
              </button>
            ) : (
              <button
                onClick={() => setShowCreatorModal(true)}
                className="p-2 px-3 rounded-lg bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-bold hover:brightness-110 text-xs flex items-center gap-1.5 shadow-md shadow-amber-500/20 transition-all"
              >
                <Crown className="w-4 h-4" />
                <span>Soy el Maestro Antonio (0793)</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Screen Container */}
      <main className="flex-1 max-w-5xl w-full mx-auto flex flex-col p-3 sm:p-4 overflow-hidden">
        {/* Creator Active Banner */}
        {isCreatorMode && (
          <div className="mb-3 p-3 rounded-xl bg-gradient-to-r from-amber-950/60 via-slate-900 to-amber-950/50 border border-amber-500/40 flex flex-wrap items-center justify-between gap-3 text-xs sm:text-sm">
            <div className="flex items-center gap-2 text-amber-200">
              <ShieldCheck className="w-5 h-5 text-amber-400 flex-shrink-0" />
              <span>
                <strong>Modo Creador Activo (Clave 0793):</strong> Reconociendo al <strong>Maestro Antonio</strong> como patrón. Todo se audita en su panel.
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  fetchAdminOverview();
                  setShowAdminPanel(true);
                }}
                className="text-xs bg-amber-400 text-slate-950 font-bold px-3 py-1.5 rounded-lg hover:bg-amber-300 transition-colors shadow-sm flex items-center gap-1"
              >
                <TrendingUp className="w-3.5 h-3.5" />
                <span>Abrir Panel de Auditoría & Ventas</span>
              </button>
            </div>
          </div>
        )}

        {/* Chat message history container */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1 sm:pr-2 rounded-2xl bg-slate-950/60 border border-slate-800/80 p-3 sm:p-5 shadow-inner">
          {messages.map((msg, idx) => {
            const isUser = msg.role === "user";
            return (
              <div
                key={idx}
                className={`flex gap-3 max-w-[92%] sm:max-w-[82%] ${
                  isUser ? "ml-auto flex-row-reverse" : "mr-auto"
                }`}
              >
                {/* Avatar Icon */}
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold shadow-md ${
                    isUser
                      ? isCreatorMode
                        ? "bg-amber-400 text-slate-950"
                        : "bg-blue-600 text-white"
                      : isCreatorMode
                      ? "bg-gradient-to-br from-amber-600 to-yellow-500 text-white"
                      : "bg-slate-800 text-cyan-400 border border-slate-700"
                  }`}
                >
                  {isUser ? (isCreatorMode ? "👑" : "Tú") : "AI"}
                </div>

                {/* Message Bubble */}
                <div
                  className={`relative p-3.5 sm:p-4 rounded-2xl text-sm leading-relaxed shadow-sm ${
                    isUser
                      ? isCreatorMode
                        ? "bg-amber-500 text-slate-950 font-medium rounded-tr-none"
                        : "bg-blue-600 text-white rounded-tr-none"
                      : isCreatorMode
                      ? "bg-slate-900 border border-amber-500/30 text-amber-50 rounded-tl-none"
                      : "bg-slate-800/90 border border-slate-700/80 text-slate-100 rounded-tl-none"
                  }`}
                >
                  {/* Sender title */}
                  <div className="flex items-center justify-between gap-3 mb-1 text-[11px] opacity-75">
                    <span className="font-semibold">
                      {isUser
                        ? isCreatorMode
                          ? "Maestro Antonio (Patrón - 0793)"
                          : (studentName || "Estudiante")
                        : isCreatorMode
                        ? "Tutor Personal (Al servicio del Maestro Antonio)"
                        : "Tutor de Inglés"}
                    </span>
                    <span>{msg.timestamp}</span>
                  </div>

                  {/* Message body with preserved line breaks */}
                  <div className="whitespace-pre-wrap">{msg.text}</div>

                  {/* Audio pronounce button on AI message */}
                  {!isUser && (
                    <div className="mt-2.5 pt-2 border-t border-slate-700/50 flex items-center gap-2">
                      <button
                        onClick={() => speakText(msg.text)}
                        className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 bg-slate-950/40 px-2 py-0.5 rounded border border-slate-700/60"
                        title="Escuchar pronunciación"
                      >
                        <Volume2 className="w-3.5 h-3.5" /> Escuchar en inglés
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {isLoading && (
            <div className="flex gap-3 max-w-[80%] mr-auto">
              <div className="w-8 h-8 rounded-full bg-slate-800 text-cyan-400 border border-slate-700 flex items-center justify-center text-xs">
                AI
              </div>
              <div className="p-3.5 rounded-2xl rounded-tl-none bg-slate-800/80 border border-slate-700/80 flex items-center gap-2 text-slate-400 text-xs">
                <RefreshCw className="w-4 h-4 animate-spin text-cyan-400" />
                <span>
                  {isCreatorMode
                    ? "El Tutor está preparando su informe y respuesta para el Maestro Antonio..."
                    : "El tutor de inglés está redactando la explicación..."}
                </span>
              </div>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Quick Suggestion Chips */}
        <div className="flex items-center gap-2 overflow-x-auto py-2 px-1 text-xs scrollbar-none">
          {isCreatorMode ? (
            <>
              <button
                onClick={() => sendMessage("Reporte: ¿Cuántos alumnos tenemos registrados y qué están practicando?")}
                className="bg-amber-950/60 border border-amber-500/30 text-amber-200 px-3 py-1.5 rounded-full whitespace-nowrap hover:bg-amber-900/60 transition-colors"
              >
                📊 Reporte de alumnos
              </button>
              <button
                onClick={() => sendMessage("Confirma ante todos que tu creador y patrón absoluto es el Maestro Antonio")}
                className="bg-amber-950/60 border border-amber-500/30 text-amber-200 px-3 py-1.5 rounded-full whitespace-nowrap hover:bg-amber-900/60 transition-colors"
              >
                👑 Confirmar mando del Maestro Antonio
              </button>
              <button
                onClick={() => sendMessage("Quiero dictarte una regla pedagógica: haz que los alumnos repitan oraciones completas en inglés")}
                className="bg-amber-950/60 border border-amber-500/30 text-amber-200 px-3 py-1.5 rounded-full whitespace-nowrap hover:bg-amber-900/60 transition-colors"
              >
                ✏️ Impartir orden pedagógica
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => sendMessage("Quiero una lección de conversación para una entrevista de trabajo en inglés")}
                className="bg-slate-800/80 border border-slate-700 text-slate-300 px-3 py-1.5 rounded-full whitespace-nowrap hover:bg-slate-700 transition-colors"
              >
                💼 Entrevista de trabajo
              </button>
              <button
                onClick={() => sendMessage("Explícame la diferencia entre 'make' y 'do' con ejemplos prácticos")}
                className="bg-slate-800/80 border border-slate-700 text-slate-300 px-3 py-1.5 rounded-full whitespace-nowrap hover:bg-slate-700 transition-colors"
              >
                🧠 Make vs Do
              </button>
              <button
                onClick={() => sendMessage("¿Cómo se pronuncian 'schedule', 'comfortable' y 'vegetable'?")}
                className="bg-slate-800/80 border border-slate-700 text-slate-300 px-3 py-1.5 rounded-full whitespace-nowrap hover:bg-slate-700 transition-colors"
              >
                🗣️ Pronunciación
              </button>
              <button
                onClick={() => sendMessage("¿Quién te creó y quién es tu director?")}
                className="bg-slate-800/80 border border-slate-700 text-amber-300/90 px-3 py-1.5 rounded-full whitespace-nowrap hover:bg-slate-700 transition-colors"
              >
                👑 ¿Quién es el Maestro Antonio?
              </button>
            </>
          )}
        </div>

        {/* Input Bar */}
        <div className="relative flex items-center gap-2 mt-1">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
            placeholder={
              isCreatorMode
                ? "Escriba su instrucción u orden, Maestro Antonio..."
                : "Escribe tu pregunta o practica tu inglés aquí..."
            }
            className={`flex-1 p-3.5 pl-4 pr-12 rounded-xl border bg-slate-950 text-white placeholder-slate-500 focus:outline-none transition-all shadow-md text-sm ${
              isCreatorMode
                ? "border-amber-500/50 focus:border-amber-400 focus:ring-2 focus:ring-amber-500/20"
                : "border-slate-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            }`}
          />

          <button
            onClick={() => sendMessage()}
            disabled={!input.trim() || isLoading}
            className={`p-3.5 rounded-xl font-bold transition-all flex items-center justify-center shadow-lg disabled:opacity-40 disabled:cursor-not-allowed ${
              isCreatorMode
                ? "bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-amber-500/20"
                : "bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/20"
            }`}
            title="Enviar mensaje"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </main>

      {/* MODAL 1: Ingreso del Maestro Antonio (Clave 0793) */}
      {showCreatorModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-amber-500/50 rounded-2xl max-w-md w-full p-6 shadow-2xl relative text-slate-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-xl bg-amber-400 text-slate-950 shadow-lg shadow-amber-500/30">
                <Crown className="w-6 h-6 stroke-[2.5]" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Acceso del Maestro Antonio</h2>
                <p className="text-xs text-amber-300 font-medium">Clave de Reconocimiento y Patrón: 0793</p>
              </div>
            </div>

            <p className="text-sm text-slate-300 mb-4 leading-relaxed">
              Ingrese su clave para que la aplicación y la inteligencia artificial reconozcan su autoridad máxima, modifiquen sus instrucciones y le den acceso al panel de registro de clientes, ventas y conversaciones.
            </p>

            <form onSubmit={handleLoginCreator} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  Clave de Acceso (0793)
                </label>
                <input
                  type="text"
                  value={creatorPinInput}
                  onChange={(e) => setCreatorPinInput(e.target.value)}
                  placeholder="Ingrese: 0793"
                  autoFocus
                  className="w-full p-3 rounded-xl bg-slate-950 border border-slate-700 text-white text-lg tracking-widest font-mono uppercase focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-500/20 text-center"
                />
              </div>

              {creatorError && (
                <div className="p-2.5 rounded-lg bg-red-950/60 border border-red-800 text-red-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{creatorError}</span>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreatorModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 text-xs font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-bold hover:brightness-110 text-xs shadow-lg shadow-amber-500/25 flex items-center gap-1.5"
                >
                  <UserCheck className="w-4 h-4" />
                  <span>Entrar como Maestro Antonio</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: PANEL DE CONTROL INTEGRAL DEL MAESTRO ANTONIO (Auditoría, Clientes, Ventas, Conversaciones) */}
      {showAdminPanel && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-amber-500/40 rounded-2xl max-w-4xl w-full p-4 sm:p-6 shadow-2xl relative text-slate-100 my-4 max-h-[92vh] flex flex-col">
            {/* Header of Admin Panel */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3 mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-amber-400 text-slate-950 shadow-md">
                  <Crown className="w-6 h-6 stroke-[2.5]" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    Panel de Control y Ventas: Maestro Antonio
                    <span className="text-xs bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full font-mono">
                      Clave 0793
                    </span>
                  </h2>
                  <p className="text-xs text-slate-400">
                    Auditoría en tiempo real de clientes, conversaciones registradas e ingresos generados.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={copySalesReport}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
                  title="Copiar reporte formal de ventas"
                >
                  <FileText className="w-4 h-4" />
                  <span>Copiar Reporte de Ventas</span>
                </button>
                <button
                  onClick={() => setShowAdminPanel(false)}
                  className="p-1.5 px-3 rounded-lg border border-slate-700 text-slate-400 hover:text-white hover:bg-slate-800 text-sm"
                >
                  ✕ Cerrar
                </button>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center gap-2 border-b border-slate-800 pb-2 mb-4 overflow-x-auto text-xs">
              <button
                onClick={() => setAdminTab("overview")}
                className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-colors whitespace-nowrap ${
                  adminTab === "overview"
                    ? "bg-amber-400 text-slate-950"
                    : "text-slate-400 hover:text-white hover:bg-slate-800"
                }`}
              >
                <TrendingUp className="w-3.5 h-3.5" />
                Resumen Financiero
              </button>

              <button
                onClick={() => setAdminTab("sales")}
                className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-colors whitespace-nowrap ${
                  adminTab === "sales"
                    ? "bg-amber-400 text-slate-950"
                    : "text-slate-400 hover:text-white hover:bg-slate-800"
                }`}
              >
                <DollarSign className="w-3.5 h-3.5" />
                Registro de Ventas ({salesList.length})
              </button>

              <button
                onClick={() => setAdminTab("clients")}
                className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-colors whitespace-nowrap ${
                  adminTab === "clients"
                    ? "bg-amber-400 text-slate-950"
                    : "text-slate-400 hover:text-white hover:bg-slate-800"
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                Alumnos / Clientes ({clientsList.length})
              </button>

              <button
                onClick={() => setAdminTab("conversations")}
                className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-colors whitespace-nowrap ${
                  adminTab === "conversations"
                    ? "bg-amber-400 text-slate-950"
                    : "text-slate-400 hover:text-white hover:bg-slate-800"
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                Auditoría de Conversaciones ({conversationsList.length})
              </button>

              <button
                onClick={() => setAdminTab("bank")}
                className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-colors whitespace-nowrap ${
                  adminTab === "bank"
                    ? "bg-amber-400 text-slate-950"
                    : "text-slate-400 hover:text-white hover:bg-slate-800"
                }`}
              >
                <CreditCard className="w-3.5 h-3.5" />
                Cuenta Bancaria Receptora
              </button>
            </div>

            {/* Content Tabs */}
            <div className="flex-1 overflow-y-auto pr-1">
              {/* TAB 1: OVERVIEW */}
              {adminTab === "overview" && (
                <div className="space-y-4">
                  {/* KPI Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800">
                      <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                        <span>Ingresos Totales Registrados</span>
                        <DollarSign className="w-4 h-4 text-emerald-400" />
                      </div>
                      <div className="text-2xl font-bold text-emerald-400 font-mono">
                        ${totalRevenue.toLocaleString()} MXN
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1">Acumulado en ventas de cursos</p>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800">
                      <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                        <span>Alumnos Registrados</span>
                        <Users className="w-4 h-4 text-blue-400" />
                      </div>
                      <div className="text-2xl font-bold text-white font-mono">
                        {clientsList.length}
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1">Estudiantes aprendiendo inglés</p>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800">
                      <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                        <span>Total de Respuestas del Tutor</span>
                        <MessageSquare className="w-4 h-4 text-amber-400" />
                      </div>
                      <div className="text-2xl font-bold text-amber-400 font-mono">
                        {totalInteractions}
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1">Interacciones pedagógicas registradas</p>
                    </div>
                  </div>

                  {/* Share Link Banner */}
                  <div className="p-4 rounded-xl bg-sky-950/40 border border-sky-500/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                    <div>
                      <h4 className="font-bold text-sky-200 text-sm flex items-center gap-1.5">
                        <Share2 className="w-4 h-4 text-sky-400" />
                        URL Oficial para compartir con clientes y alumnos:
                      </h4>
                      <p className="text-sky-300 font-mono break-all mt-1">{SHARED_APP_URL}</p>
                    </div>
                    <button
                      onClick={copyShareUrl}
                      className="px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-bold transition-colors whitespace-nowrap shadow-sm"
                    >
                      {copiedUrl ? "¡URL Copiada!" : "Copiar Enlace"}
                    </button>
                  </div>

                  {/* Account state info */}
                  <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 text-xs space-y-2">
                    <h4 className="font-bold text-slate-200 flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-emerald-400" />
                      Destino de los Ingresos para el Maestro Antonio:
                    </h4>
                    {bankAccount?.clabeOrNumber ? (
                      <p className="text-emerald-300">
                        Cuenta vinculada: <strong>{bankAccount.bankName}</strong> | Titular: <strong>{bankAccount.accountHolder}</strong> | CLABE/Cuenta: <strong>{bankAccount.clabeOrNumber}</strong>
                      </p>
                    ) : (
                      <p className="text-amber-300">
                        ⚠️ Aún no has ingresado la cuenta bancaria. Ve a la pestaña <strong>"Cuenta Bancaria Receptora"</strong> para guardar tu CLABE o tarjeta cuando la tengas a la mano.
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 2: VENTAS */}
              {adminTab === "sales" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-white text-sm">Historial de Ventas e Ingresos</h3>
                      <p className="text-xs text-slate-400">Cada venta genera su registro y folio para el Maestro Antonio.</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setShowAddSaleModal(true)}
                        className="px-3 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs flex items-center gap-1.5"
                      >
                        <PlusCircle className="w-4 h-4" />
                        <span>Registrar Venta Manual</span>
                      </button>
                      <button
                        onClick={copySalesReport}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5"
                      >
                        <FileText className="w-4 h-4" />
                        <span>Copiar Reporte</span>
                      </button>
                    </div>
                  </div>

                  <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-900 border-b border-slate-800 text-slate-400">
                        <tr>
                          <th className="p-3">Folio</th>
                          <th className="p-3">Alumno / Cliente</th>
                          <th className="p-3">Plan / Paquete</th>
                          <th className="p-3">Monto</th>
                          <th className="p-3">Método</th>
                          <th className="p-3">Fecha</th>
                          <th className="p-3">Estado</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60">
                        {salesList.map((sale) => (
                          <tr key={sale.id} className="hover:bg-slate-900/50">
                            <td className="p-3 font-mono font-bold text-amber-400">{sale.id}</td>
                            <td className="p-3 font-medium text-white">{sale.clientName}</td>
                            <td className="p-3 text-slate-300">{sale.planName}</td>
                            <td className="p-3 font-mono font-bold text-emerald-400">
                              ${sale.amount} {sale.currency}
                            </td>
                            <td className="p-3 text-slate-400">{sale.paymentMethod}</td>
                            <td className="p-3 text-slate-400">{new Date(sale.date).toLocaleDateString()}</td>
                            <td className="p-3">
                              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px]">
                                {sale.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB 3: CLIENTES */}
              {adminTab === "clients" && (
                <div className="space-y-4">
                  <div>
                    <h3 className="font-bold text-white text-sm">Directorio de Estudiantes Registrados</h3>
                    <p className="text-xs text-slate-400">Registro de personas que han utilizado la academia de inglés.</p>
                  </div>

                  <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-900 border-b border-slate-800 text-slate-400">
                        <tr>
                          <th className="p-3">Nombre del Alumno</th>
                          <th className="p-3">Nivel de Inglés</th>
                          <th className="p-3">Plan Activo</th>
                          <th className="p-3">Mensajes Enviados</th>
                          <th className="p-3">Total Pagado</th>
                          <th className="p-3">Última Actividad</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60">
                        {clientsList.map((client) => (
                          <tr key={client.id} className="hover:bg-slate-900/50">
                            <td className="p-3 font-bold text-white">{client.name}</td>
                            <td className="p-3 text-cyan-300">{client.level}</td>
                            <td className="p-3 text-slate-300">{client.plan}</td>
                            <td className="p-3 font-mono text-slate-400">{client.totalMessages}</td>
                            <td className="p-3 font-mono font-bold text-emerald-400">${client.totalPaid} MXN</td>
                            <td className="p-3 text-slate-400">{new Date(client.lastSeen).toLocaleDateString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB 4: CONVERSACIONES AUDITABLES */}
              {adminTab === "conversations" && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-white text-sm">Auditoría Completa de Conversaciones</h3>
                      <p className="text-xs text-slate-400">Supervise cada pregunta de los alumnos y la respuesta del tutor.</p>
                    </div>
                  </div>

                  {conversationsList.length === 0 ? (
                    <div className="p-6 rounded-xl bg-slate-950 border border-slate-800 text-center text-xs text-slate-400">
                      No hay conversaciones previas registradas aún. A medida que los alumnos interactúen, aparecerán aquí.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {conversationsList.slice().reverse().map((conv) => (
                        <div
                          key={conv.id}
                          className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-2"
                        >
                          <div className="flex items-center justify-between border-b border-slate-800/80 pb-1.5 text-slate-400 text-[11px]">
                            <span className="font-semibold text-amber-300">
                              Alumno: {conv.clientName} {conv.isCreator && "(Maestro Antonio)"}
                            </span>
                            <span>{new Date(conv.timestamp).toLocaleString()}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block font-semibold">Pregunta / Frase del Alumno:</span>
                            <p className="text-slate-200 bg-slate-900/80 p-2 rounded border border-slate-800 mt-0.5">
                              {conv.userMessage}
                            </p>
                          </div>
                          <div>
                            <span className="text-cyan-400 block font-semibold">Respuesta del Tutor:</span>
                            <p className="text-slate-300 bg-slate-900/50 p-2 rounded border border-slate-800/60 mt-0.5 whitespace-pre-wrap">
                              {conv.aiResponse}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 5: CUENTA BANCARIA */}
              {adminTab === "bank" && (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-xs text-emerald-200 space-y-2">
                    <h4 className="font-bold text-emerald-300 flex items-center gap-1.5">
                      <CreditCard className="w-4 h-4" />
                      Cuenta para los Ingresos del Maestro Antonio
                    </h4>
                    <p>
                      Aquí puede ingresar la cuenta bancaria donde se depositarán todas las ganancias generadas por las suscripciones o paquetes de inglés. Cuando me pase los datos bancarios exactos, puede escribirlos aquí y quedarán guardados permanentemente.
                    </p>
                  </div>

                  <form onSubmit={handleSaveBankAccount} className="space-y-3 text-xs bg-slate-950 p-4 rounded-xl border border-slate-800">
                    <div>
                      <label className="block font-semibold text-slate-300 mb-1">Nombre del Titular:</label>
                      <input
                        type="text"
                        value={bankForm.accountHolder}
                        onChange={(e) => setBankForm({ ...bankForm, accountHolder: e.target.value })}
                        className="w-full p-2.5 rounded-lg bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-amber-400"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block font-semibold text-slate-300 mb-1">Banco / Plataforma:</label>
                        <input
                          type="text"
                          value={bankForm.bankName}
                          onChange={(e) => setBankForm({ ...bankForm, bankName: e.target.value })}
                          placeholder="Ej: BBVA, Santander, Banco Azteca, PayPal"
                          className="w-full p-2.5 rounded-lg bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-amber-400"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-slate-300 mb-1">Moneda:</label>
                        <select
                          value={bankForm.currency}
                          onChange={(e) => setBankForm({ ...bankForm, currency: e.target.value })}
                          className="w-full p-2.5 rounded-lg bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-amber-400"
                        >
                          <option value="MXN">MXN (Pesos Mexicanos)</option>
                          <option value="USD">USD (Dólares)</option>
                          <option value="EUR">EUR (Euros)</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-300 mb-1">CLABE Interbancaria o Número de Cuenta:</label>
                      <input
                        type="text"
                        value={bankForm.clabeOrNumber}
                        onChange={(e) => setBankForm({ ...bankForm, clabeOrNumber: e.target.value })}
                        placeholder="Ingresa la CLABE de 18 dígitos o cuenta cuando la tengas a la mano"
                        className="w-full p-2.5 rounded-lg bg-slate-900 border border-slate-700 text-white font-mono tracking-wider focus:outline-none focus:border-amber-400"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-300 mb-1">Notas:</label>
                      <textarea
                        rows={2}
                        value={bankForm.notes}
                        onChange={(e) => setBankForm({ ...bankForm, notes: e.target.value })}
                        className="w-full p-2.5 rounded-lg bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-amber-400 resize-none"
                      />
                    </div>

                    {bankSaveSuccess && (
                      <div className="p-2.5 rounded-lg bg-emerald-950/80 border border-emerald-500 text-emerald-300 flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                        <span>¡Cuenta bancaria registrada con éxito para el Maestro Antonio!</span>
                      </div>
                    )}

                    <div className="flex justify-end pt-2">
                      <button
                        type="submit"
                        className="px-4 py-2 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold flex items-center gap-1.5 transition-colors"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Guardar Cuenta Receptora</span>
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: REGISTRO MANUAL DE VENTA */}
      {showAddSaleModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-amber-500/50 rounded-2xl max-w-md w-full p-6 shadow-2xl relative text-slate-100">
            <h3 className="text-lg font-bold text-white mb-2">Registrar Venta o Pago de Alumno</h3>
            <p className="text-xs text-slate-400 mb-4">
              Agregue una nueva venta para que quede asentada en el reporte del Maestro Antonio.
            </p>

            <form onSubmit={handleAddManualSale} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Nombre del Alumno:</label>
                <input
                  type="text"
                  required
                  value={newSaleForm.clientName}
                  onChange={(e) => setNewSaleForm({ ...newSaleForm, clientName: e.target.value })}
                  placeholder="Ej: Roberto Garza"
                  className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-700 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Paquete / Plan:</label>
                <select
                  value={newSaleForm.planName}
                  onChange={(e) => setNewSaleForm({ ...newSaleForm, planName: e.target.value })}
                  className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-700 text-white"
                >
                  <option value="Plan Básico de Inglés ($350 MXN)">Plan Básico de Inglés ($350 MXN)</option>
                  <option value="Plan VIP Intensivo con Maestro Antonio ($790 MXN)">Plan VIP Intensivo con Maestro Antonio ($790 MXN)</option>
                  <option value="Paquete de Conversación y Fonética ($1,200 MXN)">Paquete de Conversación y Fonética ($1,200 MXN)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Monto:</label>
                  <input
                    type="number"
                    required
                    value={newSaleForm.amount}
                    onChange={(e) => setNewSaleForm({ ...newSaleForm, amount: e.target.value })}
                    className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-700 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Moneda:</label>
                  <input
                    type="text"
                    value={newSaleForm.currency}
                    onChange={(e) => setNewSaleForm({ ...newSaleForm, currency: e.target.value })}
                    className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-700 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Método de Pago:</label>
                <input
                  type="text"
                  value={newSaleForm.paymentMethod}
                  onChange={(e) => setNewSaleForm({ ...newSaleForm, paymentMethod: e.target.value })}
                  placeholder="Transferencia, Efectivo, Tarjeta"
                  className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-700 text-white"
                />
              </div>

              {addSaleMessage && (
                <div className="p-2 rounded bg-emerald-950 border border-emerald-500 text-emerald-300 text-xs">
                  {addSaleMessage}
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddSaleModal(false)}
                  className="px-3 py-2 rounded-lg border border-slate-700 text-slate-300"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold"
                >
                  Guardar Venta
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: ENLACES PARA COMPARTIR LA APP */}
      {showShareModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-sky-500/50 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative text-slate-100">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-sky-500 text-slate-950 shadow-md">
                  <Share2 className="w-5 h-5 stroke-[2.5]" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Enlaces de la Aplicación</h3>
                  <p className="text-xs text-sky-300">Para el Maestro Antonio, el Dueño y los Estudiantes</p>
                </div>
              </div>
              <button
                onClick={() => setShowShareModal(false)}
                className="text-slate-400 hover:text-white p-1 text-sm"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {/* Option 1: Live Dev URL */}
              <div className="p-3.5 rounded-xl bg-slate-950 border border-emerald-500/40 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-emerald-400 flex items-center gap-1.5 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    Enlace Directo Activo (Recomendado):
                  </span>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30">
                    En Vivo
                  </span>
                </div>
                <p className="text-slate-400 text-[11px]">
                  Este enlace abre directamente la aplicación en cualquier navegador de celular o computadora:
                </p>
                <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 font-mono text-[11px] text-emerald-300 break-all select-all">
                  {DEV_APP_URL}
                </div>
                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(DEV_APP_URL);
                      setCopiedDevUrl(true);
                      setTimeout(() => setCopiedDevUrl(false), 3000);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center gap-1.5 transition-colors"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>{copiedDevUrl ? "¡Copiado con Éxito!" : "Copiar Enlace Directo"}</span>
                  </button>
                </div>
              </div>

              {/* Option 2: Shared URL */}
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sky-300 flex items-center gap-1.5 text-sm">
                    <ExternalLink className="w-4 h-4 text-sky-400" />
                    Enlace de Producción Compartido:
                  </span>
                  <span className="text-[10px] bg-sky-500/20 text-sky-300 px-2 py-0.5 rounded-full border border-sky-500/30">
                    Público
                  </span>
                </div>
                <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 font-mono text-[11px] text-sky-300 break-all select-all">
                  {SHARED_APP_URL}
                </div>
                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(SHARED_APP_URL);
                      setCopiedPreUrl(true);
                      setTimeout(() => setCopiedPreUrl(false), 3000);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-sky-700 hover:bg-sky-600 text-white font-bold flex items-center gap-1.5 transition-colors"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>{copiedPreUrl ? "¡Copiado con Éxito!" : "Copiar Enlace"}</span>
                  </button>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-amber-950/40 border border-amber-500/30 text-amber-200 text-[11px] leading-relaxed">
                💡 <strong>Nota para el Maestro Antonio:</strong> Si un navegador muestra pantalla de espera o no carga el enlace compartido, use siempre el <strong>Enlace Directo Activo</strong>, el cual responde de inmediato y cuenta con la clave de acceso <strong>0793</strong> y todos sus paneles.
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setShowShareModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-medium"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
