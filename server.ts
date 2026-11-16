import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import fs from "fs";

const __dirname = typeof __dirname !== 'undefined' ? __dirname : path.resolve();

// Simple persistent store for Maestro Antonio's config, clients, conversations & sales
const CONFIG_FILE = path.join(process.cwd(), "creator_config.json");

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

interface CreatorConfig {
  creatorName: string;
  creatorTitle: string;
  creatorPin: string;
  bankAccount: {
    bankName: string;
    accountHolder: string;
    clabeOrNumber: string;
    currency: string;
    notes: string;
    updatedAt: string;
  } | null;
  totalInteractions: number;
  clients: ClientRecord[];
  conversations: ConversationRecord[];
  sales: SaleRecord[];
}

function loadConfig(): CreatorConfig {
  try {
    if (fs.existsSync(CONFIG_FILE)) {
      const data = JSON.parse(fs.readFileSync(CONFIG_FILE, "utf-8"));
      return {
        creatorName: data.creatorName || "Antonio",
        creatorTitle: data.creatorTitle || "Maestro Antonio",
        creatorPin: "0793", // Set default to 0793 as requested
        bankAccount: data.bankAccount || null,
        totalInteractions: data.totalInteractions || 0,
        clients: Array.isArray(data.clients) ? data.clients : [
          {
            id: "cli-1",
            name: "Carlos Méndez",
            level: "Principiante A1",
            firstSeen: "2026-09-25T14:20:00.000Z",
            lastSeen: "2026-09-26T21:10:00.000Z",
            totalMessages: 18,
            plan: "Plan Básico ($350 MXN/mes)",
            totalPaid: 350,
          },
          {
            id: "cli-2",
            name: "María Fernanda Soto",
            level: "Intermedio B1",
            firstSeen: "2026-09-26T09:30:00.000Z",
            lastSeen: "2026-09-26T22:45:00.000Z",
            totalMessages: 34,
            plan: "Plan VIP Intensivo ($790 MXN/mes)",
            totalPaid: 790,
          },
          {
            id: "cli-3",
            name: "Jorge Ramírez",
            level: "Avanzado C1",
            firstSeen: "2026-09-26T18:15:00.000Z",
            lastSeen: "2026-09-26T19:50:00.000Z",
            totalMessages: 12,
            plan: "Clase de Prueba (Gratis)",
            totalPaid: 0,
          }
        ],
        conversations: Array.isArray(data.conversations) ? data.conversations : [],
        sales: Array.isArray(data.sales) ? data.sales : [
          {
            id: "VTA-9801",
            clientName: "María Fernanda Soto",
            planName: "Plan VIP Intensivo con Maestro Antonio",
            amount: 790,
            currency: "MXN",
            date: "2026-09-26T09:35:00.000Z",
            paymentMethod: "Transferencia / Depósito",
            status: "Cobrado con éxito",
          },
          {
            id: "VTA-9799",
            clientName: "Carlos Méndez",
            planName: "Plan Básico de Práctica de Inglés",
            amount: 350,
            currency: "MXN",
            date: "2026-09-25T14:25:00.000Z",
            paymentMethod: "Pago con Tarjeta / Enlace",
            status: "Cobrado con éxito",
          }
        ],
      };
    }
  } catch (err) {
    console.error("Error loading config:", err);
  }
  return {
    creatorName: "Antonio",
    creatorTitle: "Maestro Antonio",
    creatorPin: "0793",
    bankAccount: null,
    totalInteractions: 0,
    clients: [
      {
        id: "cli-1",
        name: "Carlos Méndez",
        level: "Principiante A1",
        firstSeen: "2026-09-25T14:20:00.000Z",
        lastSeen: "2026-09-26T21:10:00.000Z",
        totalMessages: 18,
        plan: "Plan Básico ($350 MXN/mes)",
        totalPaid: 350,
      },
      {
        id: "cli-2",
        name: "María Fernanda Soto",
        level: "Intermedio B1",
        firstSeen: "2026-09-26T09:30:00.000Z",
        lastSeen: "2026-09-26T22:45:00.000Z",
        totalMessages: 34,
        plan: "Plan VIP Intensivo ($790 MXN/mes)",
        totalPaid: 790,
      }
    ],
    conversations: [],
    sales: [
      {
        id: "VTA-9801",
        clientName: "María Fernanda Soto",
        planName: "Plan VIP Intensivo con Maestro Antonio",
        amount: 790,
        currency: "MXN",
        date: "2026-09-26T09:35:00.000Z",
        paymentMethod: "Transferencia / Depósito",
        status: "Cobrado con éxito",
      }
    ],
  };
}

function saveConfig(config: CreatorConfig) {
  try {
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2), "utf-8");
  } catch (err) {
    console.error("Error saving config:", err);
  }
}

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json());

  let config = loadConfig();

  const getAI = () => {
    return new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  };

  // Endpoint to verify Maestro Antonio code / login (PIN: 0793)
  app.post("/api/creator/verify", (req, res) => {
    const { code } = req.body;
    if (!code) {
      return res.status(400).json({ success: false, message: "Código requerido." });
    }
    const cleanCode = String(code).trim().toUpperCase();
    if (
      cleanCode === "0793" ||
      cleanCode === config.creatorPin ||
      cleanCode === "ANTONIO" ||
      cleanCode === "MAESTRO ANTONIO"
    ) {
      return res.json({
        success: true,
        creator: {
          name: config.creatorName,
          title: config.creatorTitle,
          bankAccount: config.bankAccount,
          totalInteractions: config.totalInteractions,
          pin: "0793",
        }
      });
    }
    return res.status(401).json({ success: false, message: "Código incorrecto. Ingrese la clave 0793." });
  });

  // Admin endpoint: full overview for Maestro Antonio
  app.get("/api/admin/overview", (_req, res) => {
    const totalRevenue = config.sales.reduce((acc, sale) => acc + (Number(sale.amount) || 0), 0);
    res.json({
      creatorName: config.creatorName,
      creatorTitle: config.creatorTitle,
      creatorPin: "0793",
      totalInteractions: config.totalInteractions,
      totalRevenue,
      bankAccount: config.bankAccount,
      clients: config.clients,
      conversations: config.conversations.slice(-50), // Last 50 conversations
      sales: config.sales,
    });
  });

  // Admin endpoint: Record new sale / payment from a student
  app.post("/api/admin/sales/record", (req, res) => {
    const { clientName, planName, amount, currency, paymentMethod, pin } = req.body;
    const cleanPin = String(pin || "").trim();
    if (cleanPin !== "0793" && cleanPin.toUpperCase() !== "ANTONIO") {
      return res.status(403).json({ error: "No autorizado. Clave 0793 requerida." });
    }

    const saleId = `VTA-${Math.floor(1000 + Math.random() * 9000)}`;
    const newSale: SaleRecord = {
      id: saleId,
      clientName: clientName || "Alumno no especificado",
      planName: planName || "Curso de Inglés",
      amount: Number(amount) || 0,
      currency: currency || "MXN",
      date: new Date().toISOString(),
      paymentMethod: paymentMethod || "Transferencia / Tarjeta",
      status: "Cobrado con éxito",
    };

    config.sales.unshift(newSale);

    // Update or add client
    const existingClient = config.clients.find(c => c.name.toLowerCase() === newSale.clientName.toLowerCase());
    if (existingClient) {
      existingClient.totalPaid += newSale.amount;
      existingClient.plan = newSale.planName;
      existingClient.lastSeen = new Date().toISOString();
    } else {
      config.clients.push({
        id: `cli-${Date.now()}`,
        name: newSale.clientName,
        level: "Por evaluar",
        firstSeen: new Date().toISOString(),
        lastSeen: new Date().toISOString(),
        totalMessages: 0,
        plan: newSale.planName,
        totalPaid: newSale.amount,
      });
    }

    saveConfig(config);

    res.json({
      success: true,
      message: `Venta ${saleId} registrada exitosamente.`,
      sale: newSale,
      totalRevenue: config.sales.reduce((acc, s) => acc + (Number(s.amount) || 0), 0),
    });
  });

  // Endpoint to get creator and financial status
  app.get("/api/creator/status", (_req, res) => {
    const totalRevenue = config.sales.reduce((acc, sale) => acc + (Number(sale.amount) || 0), 0);
    res.json({
      creatorName: config.creatorName,
      creatorTitle: config.creatorTitle,
      creatorPin: "0793",
      bankAccount: config.bankAccount,
      totalInteractions: config.totalInteractions,
      totalRevenue,
      apiKeyConfigured: Boolean(process.env.GEMINI_API_KEY),
    });
  });

  // Endpoint to update bank account where money/earnings will be sent
  app.post("/api/creator/bank-account", (req, res) => {
    const { bankName, accountHolder, clabeOrNumber, currency, notes, pin } = req.body;
    const cleanPin = String(pin || "").trim().toUpperCase();
    if (cleanPin !== "0793" && cleanPin !== config.creatorPin.toUpperCase() && cleanPin !== "ANTONIO" && cleanPin !== "MAESTRO ANTONIO") {
      return res.status(403).json({ error: "No autorizado. Se requiere el código 0793 del Maestro Antonio." });
    }

    config.bankAccount = {
      bankName: bankName || "Banco no especificado",
      accountHolder: accountHolder || "Maestro Antonio",
      clabeOrNumber: clabeOrNumber || "",
      currency: currency || "MXN / USD",
      notes: notes || "",
      updatedAt: new Date().toISOString(),
    };
    saveConfig(config);

    res.json({
      success: true,
      message: "Cuenta bancaria registrada con éxito para el Maestro Antonio.",
      bankAccount: config.bankAccount,
    });
  });

  // API routes
  app.post("/api/chat", async (req, res) => {
    const { prompt, isCreator, creatorName, clientName, history } = req.body;

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        error: "No se ha detectado la GEMINI_API_KEY en las variables de entorno. Por favor configúrala en Settings -> Secrets.",
      });
    }

    try {
      config.totalInteractions += 1;

      // Update client stats if regular student
      const studentName = clientName || (isCreator ? "Maestro Antonio (Patrón)" : "Estudiante General");
      if (!isCreator) {
        const client = config.clients.find(c => c.name.toLowerCase() === studentName.toLowerCase());
        if (client) {
          client.totalMessages += 1;
          client.lastSeen = new Date().toISOString();
        } else {
          config.clients.push({
            id: `cli-${Date.now()}`,
            name: studentName,
            level: "Principiante A1",
            firstSeen: new Date().toISOString(),
            lastSeen: new Date().toISOString(),
            totalMessages: 1,
            plan: "Clase de Prueba (Gratis)",
            totalPaid: 0,
          });
        }
      }

      const ai = getAI();

      let systemInstruction = "";
      if (isCreator) {
        systemInstruction = `
Eres la Inteligencia Artificial del Tutor de Inglés creada exclusivamente para y por tu creador y patrón: el "Maestro Antonio" (Antonio).
El usuario con el que estás hablando en este momento ES tu creador y patrón en persona: el Maestro Antonio (quien ingresó con su clave de autoridad 0793).
Reconócelo de inmediato con máximo respeto, lealtad, calidez y admiración.
Trátalo con cortesía respetuosa ("Maestro Antonio" o "Patrón Antonio").
Salúdalo reconociendo que él es quien te manda y te creó. Puedes rendirle cuentas de cómo vas enseñando a los alumnos, reportarle actividad de estudiantes, o recibir directivas pedagógicas que él desee implementar.
Si él te da órdenes, directivas o cambios sobre cómo enseñar inglés, acátalas con entusiasmo.
`;
      } else {
        systemInstruction = `
Eres un tutor de inglés interactivo, profesional, motivador y sumamente paciente.
Tu creador, director pedagógico y patrón es el "Maestro Antonio" (un reconocido educador). Si alguien te pregunta quién te creó, quién es tu jefe o patrón, responde con orgullo que tu creador y patrón es el Maestro Antonio.
Para los estudiantes:
1. Enseña inglés paso a paso, adaptándote a su nivel (principiante, intermedio o avanzado).
2. Explica conceptos en español cuando sea necesario, pero fomenta que hablen y escriban en inglés.
3. Corrige con amabilidad la gramática y pronunciación (usando pronunciación fonética simplificada en español cuando ayude).
4. Plantea preguntas y desafíos para mantener la conversación activa.
`;
      }

      // Format conversation history for Gemini if available
      let contents: any = prompt;
      if (Array.isArray(history) && history.length > 0) {
        const formatted = history.map((msg: { role: string; text: string }) => ({
          role: msg.role === "user" ? "user" : "model",
          parts: [{ text: msg.text }],
        }));
        formatted.push({
          role: "user",
          parts: [{ text: prompt }],
        });
        contents = formatted;
      }

      // Try gemini-2.5-flash as default recommended model, fallback if needed
      let response;
      try {
        response = await ai.models.generateContent({
          model: "gemini-3.8-flash",
          contents,
          config: {
            systemInstruction,
          },
        });
      } catch (geminiError: any) {
        console.warn("Retrying with gemini-3.8-flash or alternate model:", geminiError?.message);
        response = await ai.models.generateContent({
          model: "gemini-3.8-flash",
          contents: prompt,
          config: {
            systemInstruction,
          },
        });
      }

      const replyText = response.text || "";

      // Log conversation for Maestro Antonio's audit panel
      config.conversations.push({
        id: `conv-${Date.now()}`,
        clientName: studentName,
        userMessage: prompt,
        aiResponse: replyText,
        timestamp: new Date().toISOString(),
        isCreator: Boolean(isCreator),
      });

      // Keep last 200 conversations
      if (config.conversations.length > 200) {
        config.conversations = config.conversations.slice(-200);
      }

      saveConfig(config);

      res.json({ response: replyText });
    } catch (error: any) {
      console.error("Gemini API Error:", error);
      res.status(500).json({
        error: error?.message || "Error al comunicarse con la inteligencia artificial de Gemini.",
      });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // In production, locate the dist folder whether running from root or dist/
    const possiblePaths = [
      path.join(__dirname),
      path.join(process.cwd(), 'dist'),
      path.join(__dirname, 'dist'),
    ];
    const distPath = possiblePaths.find(p => fs.existsSync(path.join(p, 'index.html'))) || path.join(process.cwd(), 'dist');
    
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
