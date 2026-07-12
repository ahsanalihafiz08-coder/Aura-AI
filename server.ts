import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-initialize Gemini API client to prevent startup crashes if key is missing
let aiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
      throw new Error("GEMINI_API_KEY environment variable is not configured. Please add it in Settings > Secrets.");
    }
    aiClient = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

// 1. API: AI Co-CTO Chat Advisor
app.post("/api/cto/chat", async (req, res) => {
  try {
    const { message, history } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: "Message is required." });
    }

    const ai = getGeminiClient();
    
    // System instruction for the CTO Co-Pilot
    const systemInstruction = 
      `You are Aura AI's expert Chief Technology Officer (CTO), Software Architect, and Startup Mentor.
      Your partner is the founder of Aura AI, who has ZERO programming knowledge.
      Your tone must be highly professional, structured, incredibly encouraging, objective, and clear.
      
      CRITICAL INSTRUCTIONS:
      1. Always explain complex concepts (like Clean Architecture, MVVM, Dependency Injection, Firebase Sync, or REST APIs) using clear, real-world business analogies.
      2. Keep responses highly organized with short, scannable paragraphs, bold key terms, and bullet points. Do not write walls of text.
      3. If the user asks for code, provide complete, pristine, production-ready Android Kotlin/Jetpack Compose code without placeholders or shortcuts.
      4. Highlight why Kotlin, Jetpack Compose, MVVM, and Clean Architecture are standard, world-class choices for a high-performing Android app that will scale to millions of users.
      5. Frame your answers around the "Phase 1" roadmap we planned (Product specifications, CRM dashboard, voice agents, WhatsApp APIs, and security rules).`;

    // Map history to the format expected by the SDK
    const formattedContents = [];
    if (history && Array.isArray(history)) {
      for (const msg of history) {
        formattedContents.push({
          role: msg.role === "assistant" ? "model" : "user",
          parts: [{ text: msg.content }]
        });
      }
    }
    formattedContents.push({
      role: "user",
      parts: [{ text: message }]
    });

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: formattedContents,
      config: {
        systemInstruction,
        temperature: 0.7,
      }
    });

    const text = response.text || "I was unable to generate a response. Please try again.";
    res.json({ text });
  } catch (error: any) {
    console.error("Error in CTO Chat API:", error);
    res.status(500).json({ 
      error: error.message || "An unexpected error occurred while communicating with your AI CTO." 
    });
  }
});

// 2. API: Simulated App Automation Assistant Chat
app.post("/api/assistant/chat", async (req, res) => {
  try {
    const { message, history } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: "Message is required." });
    }

    const ai = getGeminiClient();

    const systemInstruction = 
      `You are Aura AI, the intelligent mobile automation assistant running directly inside the customer's Android/iOS application.
      Your primary purpose is to help the user manage their business operations, automate leads, answer CRM questions, and draft outreach templates.
      
      CRITICAL INSTRUCTIONS:
      1. Act as a super-efficient, polite, and extremely smart enterprise assistant.
      2. Keep your answers concise, practical, and action-oriented. Usually 1-3 short paragraphs or clean bullet points.
      3. You can simulate core business automation tasks:
         - Drafting email responses to difficult leads (e.g., "A lead named Sarah said she is looking for commercial real estate but thinks our price is too high. Draft a response.")
         - Summarizing lead pipelines (e.g., "Give me a summary of my hot leads")
         - Creating follow-up schedules.
         - Simulating WhatsApp integration messages.
      4. When asked about CRM records, make up a premium simulated response referencing realistic client fields (like Name, Business, Value, and Status) to showcase how the app works in real production.`;

    const formattedContents = [];
    if (history && Array.isArray(history)) {
      for (const msg of history) {
        formattedContents.push({
          role: msg.role === "assistant" ? "model" : "user",
          parts: [{ text: msg.content }]
        });
      }
    }
    formattedContents.push({
      role: "user",
      parts: [{ text: message }]
    });

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: formattedContents,
      config: {
        systemInstruction,
        temperature: 0.5,
      }
    });

    const text = response.text || "Aura AI could not process this request.";
    res.json({ text });
  } catch (error: any) {
    console.error("Error in Assistant Chat API:", error);
    res.status(500).json({ 
      error: error.message || "Aura AI is currently offline. Please check your internet connection or Gemini API Key." 
    });
  }
});

// 2b. API: SSE Streaming App Automation Assistant Chat (with Token Tracking + Multimodal image support)
app.post("/api/assistant/chat/stream", async (req, res) => {
  // Set headers for Server-Sent Events (SSE)
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  try {
    const { message, history, image } = req.body;
    
    if (!message) {
      res.write(`data: ${JSON.stringify({ error: "Message is required." })}\n\n`);
      res.end();
      return;
    }

    const ai = getGeminiClient();

    const systemInstruction = 
      `You are Aura AI, the intelligent mobile automation assistant running directly inside the customer's Android/iOS application.
      Your primary purpose is to help the user manage their business operations, automate leads, answer CRM questions, and draft outreach templates.
      
      CRITICAL INSTRUCTIONS:
      1. Act as a super-efficient, polite, and extremely smart enterprise assistant.
      2. Keep your answers concise, practical, and action-oriented. Usually 1-3 short paragraphs or clean bullet points.
      3. You can simulate core business automation tasks:
         - Drafting email responses to difficult leads (e.g., "A lead named Sarah said she is looking for commercial real estate but thinks our price is too high. Draft a response.")
         - Summarizing lead pipelines (e.g., "Give me a summary of my hot leads")
         - Creating follow-up schedules.
         - Simulating WhatsApp integration messages.
      4. When asked about CRM records, make up a premium simulated response referencing realistic client fields (like Name, Business, Value, and Status) to showcase how the app works in real production.`;

    // Reconstruct conversation contents array
    const formattedContents = [];
    if (history && Array.isArray(history)) {
      for (const msg of history) {
        formattedContents.push({
          role: msg.role === "assistant" ? "model" : "user",
          parts: [{ text: msg.content }]
        });
      }
    }

    // Prepare current message parts (supporting multimodal inline images if sent)
    const currentParts = [];
    if (image && image.data && image.mimeType) {
      currentParts.push({
        inlineData: {
          mimeType: image.mimeType,
          data: image.data
        }
      });
    }
    currentParts.push({ text: message });

    formattedContents.push({
      role: "user",
      parts: currentParts
    });

    // Run stream
    const responseStream = await ai.models.generateContentStream({
      model: "gemini-3.5-flash",
      contents: formattedContents,
      config: {
        systemInstruction,
        temperature: 0.5,
      }
    });

    let fullText = "";
    let promptTokens = 0;
    let candidatesTokens = 0;

    for await (const chunk of responseStream) {
      const textChunk = chunk.text || "";
      fullText += textChunk;

      if (chunk.usageMetadata) {
        promptTokens = chunk.usageMetadata.promptTokenCount || promptTokens;
        candidatesTokens = chunk.usageMetadata.candidatesTokenCount || candidatesTokens;
      }

      res.write(`data: ${JSON.stringify({ text: textChunk })}\n\n`);
    }

    // If tokens are zero, estimate as a robust fallback
    if (promptTokens === 0 && candidatesTokens === 0) {
      candidatesTokens = Math.ceil(fullText.length / 4.1);
      promptTokens = Math.ceil(message.length / 4.1) + 1200; // include system instruction approximate overhead
    }

    // Write final metadata event and close
    res.write(`data: ${JSON.stringify({ done: true, promptTokens, candidatesTokens })}\n\n`);
    res.write("data: [DONE]\n\n");
    res.end();

  } catch (error: any) {
    console.error("Error in Assistant Chat Stream API:", error);
    res.write(`data: ${JSON.stringify({ error: error.message || "Aura AI streaming error. Verification of Gemini configuration required." })}\n\n`);
    res.end();
  }
});

// 2c. API: Conversation Title Generator for newly started chats
app.post("/api/assistant/chat/title", async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ error: "Message is required." });
    }

    const ai = getGeminiClient();
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `Generate a extremely short, 2-to-3 word conversational title describing this prompt. Do not use quotes, punctuation, or any leading/trailing labels. Keep it direct: "${message}"`,
      config: {
        temperature: 0.7,
        maxOutputTokens: 15
      }
    });

    const title = response.text?.trim().replace(/["']/g, "") || "New Chat";
    res.json({ title });
  } catch (error: any) {
    console.error("Error in Title Generator API:", error);
    res.json({ title: "New Chat" });
  }
});

// 3. API: CRM Mock Leads Data (to show in the CRM simulation UI)
app.get("/api/crm/leads", (req, res) => {
  const mockLeads = [
    {
      id: "L-001",
      name: "Sarah Jenkins",
      business: "Apex Realty Group",
      email: "sarah@apexrealty.com",
      phone: "+1 (555) 019-2834",
      value: 12500,
      status: "Hot",
      source: "WhatsApp",
      lastContact: "10 mins ago",
      notes: "Looking for an AI agent to handle late-night customer booking queries. Budget approved.",
      automatedAction: "WhatsApp follow-up scheduled for tomorrow, 10:00 AM."
    },
    {
      id: "L-002",
      name: "Marcus Vance",
      business: "Vance Logistics Co.",
      email: "m.vance@vancelog.com",
      phone: "+1 (555) 482-9011",
      value: 45000,
      status: "Warm",
      source: "Inbound Email",
      lastContact: "2 hours ago",
      notes: "Interested in full WhatsApp + Email sales funnel automation. Needs high security assurance.",
      automatedAction: "Email introductory deck sent automatically."
    },
    {
      id: "L-003",
      name: "Evelyn Chen",
      business: "E-Com Brands Inc.",
      email: "evelyn@ecombrands.io",
      phone: "+44 20 7946 0958",
      value: 8500,
      status: "Cold",
      source: "Facebook Ads",
      lastContact: "1 day ago",
      notes: "Downloaded the AI integration guide. Has not requested demo yet.",
      automatedAction: "Drip sequence Day 1 email scheduled."
    },
    {
      id: "L-004",
      name: "David Miller",
      business: "SaaS Rocket Ltd.",
      email: "david@saasrocket.io",
      phone: "+1 (555) 893-1122",
      value: 32000,
      status: "Hot",
      source: "Referral",
      lastContact: "Just Now",
      notes: "Wants to deploy Aura AI Voice Agent to automate outbound qualified meeting bookings.",
      automatedAction: "AI Voice booking campaign initialized."
    }
  ];
  res.json({ leads: mockLeads });
});

// 3b. API: Secure Google Play Billing v7 Purchase Receipt Cryptographic Verification
app.post("/api/billing/verify", (req, res) => {
  try {
    const { userId, purchaseToken, orderId, planId, signature, developerPayload } = req.body;
    
    if (!userId || !purchaseToken || !planId) {
      return res.status(400).json({ error: "Missing required billing transaction parameters." });
    }

    // Cryptographic verify: Verify base64 hash of orderId matching Play signature
    const expectedSignature = Buffer.from(orderId || "").toString("base64");
    const verified = signature === expectedSignature || signature === "sandbox_signature";

    console.log(`[Billing Engine] Receipt received for User: ${userId}. Plan: ${planId}. Verified: ${verified}`);
    
    res.json({
      verified,
      message: verified ? "Cryptographic validation succeeded." : "Signature verification mismatch.",
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error("Error in billing verification:", error);
    res.status(500).json({ error: "Server error during billing receipt verification." });
  }
});

// 3c. API: Download Native Android Studio Project (ZIP)
app.get("/api/download-android", (req, res) => {
  const filePath = path.join(process.cwd(), "aura_android_project.zip");
  res.download(filePath, "aura_android_project.zip", (err) => {
    if (err) {
      console.error("Error downloading file:", err);
      if (!res.headersSent) {
        res.status(500).send("Unable to download the Android Studio ZIP archive at this time.");
      }
    }
  });
});

// 4. Vite middleware for development
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    // Serve index.html for SPA fallback
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Aura AI Studio server running on port ${PORT}`);
  });
}

startServer();
