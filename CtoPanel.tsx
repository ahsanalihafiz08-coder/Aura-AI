import React, { useState, useEffect, useRef } from "react";
import { 
  Compass, 
  MapPin, 
  TrendingUp, 
  ShieldAlert, 
  Milestone, 
  DollarSign, 
  Users, 
  Send, 
  Bot, 
  Briefcase, 
  MessageSquare, 
  TrendingDown, 
  CheckCircle,
  HelpCircle,
  Sparkles
} from "lucide-react";
import { USER_PERSONAS, RISK_MATRIX, ROADMAP } from "../data";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export default function CtoPanel() {
  const [activeTab, setActiveTab] = useState<string>("planning");
  
  // CTO Live Chat state
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    { role: "assistant", content: "Greetings, Partner! I am your AI Co-CTO. I helped design our Phase 1 Kotlin MVP specs and Clean Architecture databases. Ask me any question, whether you want an explanation in simple language, customization ideas, or more production-ready Kotlin code blocks!" }
  ]);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  const handleSendCtoMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isChatLoading) return;

    const userMessage = chatInput;
    const updatedMessages = [...chatMessages, { role: "user" as const, content: userMessage }];
    setChatMessages(updatedMessages);
    setChatInput("");
    setIsChatLoading(true);

    try {
      const response = await fetch("/api/cto/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage,
          history: chatMessages
        })
      });

      const data = await response.json();
      if (response.ok) {
        setChatMessages([...updatedMessages, { role: "assistant", content: data.text }]);
      } else {
        setChatMessages([...updatedMessages, { role: "assistant", content: `⚠️ Error: ${data.error || "Failed to contact Gemini server."}` }]);
      }
    } catch (err: any) {
      console.error("CTO Chat error:", err);
      setChatMessages([...updatedMessages, { role: "assistant", content: "⚠️ CTO Server is offline. Please ensure your GEMINI_API_KEY is configured in the secrets menu." }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-full overflow-hidden w-full">
      
      {/* Left Column: Strategic Tabs Selector & Content */}
      <div className="flex-1 flex flex-col bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm min-w-0 h-[380px] sm:h-[450px] lg:h-full">
        
        {/* Navigation Tabs Header */}
        <div className="flex items-center bg-slate-50/80 px-4 py-2 gap-1 border-b border-slate-200 overflow-x-auto scrollbar-none flex-nowrap w-full shrink-0">
          {[
            { id: "planning", label: "Product Vision", icon: Compass },
            { id: "personas", label: "User Personas", icon: Users },
            { id: "navigation", label: "Navigation Flow", icon: Milestone },
            { id: "roadmap", label: "Roadmap Timeline", icon: Briefcase },
            { id: "monetization", label: "Monetization & Growth", icon: DollarSign },
            { id: "risks", label: "Risk Mitigation", icon: ShieldAlert },
          ].map((tab) => {
            const IconComp = tab.icon;
            return (
              <button
                key={tab.id}
                id={`btn-cto-tab-${tab.id}`}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer flex-shrink-0 ${
                  activeTab === tab.id
                    ? "bg-indigo-50 text-indigo-600 border border-indigo-200/60"
                    : "text-slate-500 hover:text-slate-800 hover:bg-slate-100/60 border border-transparent"
                }`}
              >
                <IconComp className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content Body */}
        <div className="flex-1 p-6 overflow-y-auto bg-slate-50/30">
          
          {/* TAB: PRODUCT VISION & FEATURE PLANNING */}
          {activeTab === "planning" && (
            <div className="space-y-6 select-text">
              <div className="border-b border-slate-200/80 pb-4">
                <span className="text-[10px] uppercase font-bold tracking-widest text-indigo-600 font-mono bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">Phase 1 deliverable</span>
                <h3 className="text-xl font-extrabold text-slate-900 mt-2.5 leading-tight">Product Architecture & Market Positioning</h3>
                <p className="text-xs text-slate-600 mt-2 font-sans leading-relaxed">
                  Aura AI is designed to solve one simple, critical problem: small business owners lose up to **42% of qualified inbound leads** because they cannot respond instantly. Aura AI automates this funnel using server-side Gemini intelligence and Outbound Voice Agents.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
                  <h4 className="text-xs font-black uppercase text-indigo-600 mb-2.5 font-mono">Core Product Value Proposition</h4>
                  <ul className="space-y-2.5 text-xs text-slate-600 leading-relaxed font-sans">
                    <li>⚡ **Instant 24/7 Qualification**: AI responds to cold WhatsApp and Web leads in under 60 seconds.</li>
                    <li>📞 **Conversational Voice Outbound**: Real-time voice agent dials cold leads to qualify and book live meetings.</li>
                    <li>💾 **Offline-First Synchronization**: Perfect for busy sales agents traveling with poor cellular connectivity.</li>
                    <li>📊 **Google Play In-App Billing**: Scalable subscriptions tailored to user volume and pipeline sizes.</li>
                  </ul>
                </div>

                <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
                  <h4 className="text-xs font-black uppercase text-indigo-600 mb-2.5 font-mono">Target Competitor Differentiation</h4>
                  <p className="text-xs text-slate-500 leading-relaxed mb-3 font-sans">
                    Traditional CRM tools (like Salesforce or HubSpot) are heavy, expensive, desktop-first, and require manual data entry.
                  </p>
                  <ul className="space-y-2 text-xs text-slate-600 font-sans">
                    <li>✔️ **HubSpot Mobile**: Relies on manual status logging. Aura AI automates follow-ups entirely.</li>
                    <li>✔️ **Vapi/Retell AI**: Provides APIs only. Aura AI offers a full CRM interface out-of-the-box.</li>
                    <li>✔️ **Zapier/Make**: Requires complex code-less logic. Aura AI is plug-and-play with pre-built models.</li>
                  </ul>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-indigo-50/50 border border-indigo-200/60 shadow-xs">
                <h4 className="text-xs font-black uppercase text-indigo-700 mb-1.5 font-mono">Aura AI High-Level Architecture Flow</h4>
                <p className="text-xs text-slate-600 leading-relaxed font-sans">
                  The client application (built with Jetpack Compose) communicates with **Firebase Auth** and **Firestore** for configuration, user records, and lead data. For heavy operations (such as running Gemini agents, routing WhatsApp APIs, or hosting WebSocket Voice sessions), the app queries our highly scalable C++ and Node.js servers, hiding API secrets completely from client bundles.
                </p>
              </div>
            </div>
          )}

          {/* TAB: USER PERSONAS */}
          {activeTab === "personas" && (
            <div className="space-y-6 select-text">
              <div className="border-b border-slate-200/80 pb-4">
                <span className="text-[10px] uppercase font-bold tracking-widest text-indigo-600 font-mono bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">Phase 1 deliverable</span>
                <h3 className="text-xl font-extrabold text-slate-900 mt-2.5 leading-tight">Target Audience User Personas</h3>
                <p className="text-xs text-slate-600 mt-2 font-sans leading-relaxed">
                  We have mapped out three distinct buyer persona profiles to guide our visual design systems and mobile navigation hierarchy.
                </p>
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
                {USER_PERSONAS.map((p) => (
                  <div key={p.name} className="flex flex-col justify-between p-5 bg-white border border-slate-200 rounded-2xl shadow-xs hover:border-slate-300 transition-all relative overflow-hidden">
                    <div>
                      {/* Avatar Mockup */}
                      <div className="flex items-center space-x-3 mb-3">
                        <div className={`h-11 w-11 rounded-full flex items-center justify-center font-black text-sm text-white bg-linear-to-tr ${
                          p.avatarSeed === "sarah" ? "from-pink-500 to-rose-500" :
                          p.avatarSeed === "david" ? "from-indigo-500 to-blue-500" :
                          "from-purple-500 to-indigo-500"
                        }`}>
                          {p.name.split(" ").map(n => n[0]).join("")}
                        </div>
                        <div>
                          <h4 className="font-extrabold text-xs text-slate-900 leading-tight">{p.name}</h4>
                          <span className="text-[10px] text-slate-500 font-medium font-mono">{p.role}</span>
                        </div>
                      </div>

                      <p className="text-[10.5px] italic text-slate-500 leading-relaxed border-l-2 border-slate-200 pl-2.5 py-1.5 mb-4">
                        "{p.quote}"
                      </p>

                      <div className="space-y-3 mb-4">
                        <div>
                          <span className="text-[9px] font-mono font-black uppercase text-indigo-600 tracking-wider">Pain Points</span>
                          <ul className="list-disc pl-3 text-[10px] text-slate-600 leading-relaxed space-y-1 mt-1 font-sans">
                            {p.painPoints.map((pt, i) => <li key={i}>{pt}</li>)}
                          </ul>
                        </div>
                        <div>
                          <span className="text-[9px] font-mono font-black uppercase text-indigo-600 tracking-wider">Primary Goals</span>
                          <ul className="list-disc pl-3 text-[10px] text-slate-600 leading-relaxed space-y-1 mt-1 font-sans">
                            {p.goals.map((g, i) => <li key={i}>{g}</li>)}
                          </ul>
                        </div>
                      </div>
                    </div>

                    <div className="text-[9px] px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-md inline-block font-semibold text-slate-600 select-none self-start">
                      Scale: {p.businessSize}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: NAVIGATION FLOW CHART */}
          {activeTab === "navigation" && (
            <div className="space-y-6">
              <div className="border-b border-slate-200/80 pb-4">
                <span className="text-[10px] uppercase font-bold tracking-widest text-indigo-600 font-mono bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">Phase 1 deliverable</span>
                <h3 className="text-xl font-extrabold text-slate-900 mt-2.5 leading-tight">Android Navigation Architecture Diagram</h3>
                <p className="text-xs text-slate-600 mt-2 font-sans leading-relaxed">
                  The primary Android Client navigation graph is implemented in native Kotlin Jetpack Compose using the modern `androidx.navigation` API. Here is the visual flowchart representing deep-linking routing, credential validations, and target destinations.
                </p>
              </div>

              {/* Navigation Flowchart UI */}
              <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col items-center justify-center space-y-4 overflow-x-auto min-w-full">
                
                {/* Node 1: Entry Checkpoint */}
                <div className="flex flex-col items-center select-none">
                  <div className="p-3 bg-white border border-slate-200 rounded-xl text-center shadow-xs">
                    <span className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest leading-none">Splash Launch</span>
                    <h4 className="text-xs font-black text-slate-800 mt-1 font-mono leading-none">app/MainActivity.kt</h4>
                  </div>
                  <div className="h-6 w-0.5 bg-slate-300"></div>
                </div>

                {/* Node 2: Auth Gate */}
                <div className="flex flex-col items-center select-none">
                  <div className="p-3.5 bg-white border border-indigo-200 rounded-2xl text-center max-w-sm shadow-xs">
                    <span className="text-[9px] font-mono font-bold text-indigo-600 uppercase tracking-widest">Authentication Gate</span>
                    <h4 className="text-xs font-black text-slate-800 mt-1">FirebaseUser == null?</h4>
                  </div>
                  <div className="flex justify-between w-64 h-6 relative">
                    <div className="w-0.5 h-full bg-slate-300 absolute left-0"></div>
                    <div className="w-0.5 h-full bg-slate-300 absolute right-0"></div>
                    <div className="absolute top-1.5 left-2 text-[9px] text-slate-400 font-mono">YES (Redirect)</div>
                    <div className="absolute top-1.5 right-2 text-[9px] text-slate-400 font-mono">NO (Auto-Login)</div>
                  </div>
                </div>

                {/* Dual Path Nodes */}
                <div className="flex justify-between w-full max-w-lg select-none">
                  
                  {/* Left Path: Login */}
                  <div className="flex flex-col items-center w-40">
                    <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-center w-full shadow-xs">
                      <span className="text-[8px] font-mono font-bold text-rose-600 uppercase tracking-wider">Screen.Login</span>
                      <p className="text-[10px] text-slate-800 font-bold mt-1 leading-tight">LoginScreen.kt</p>
                    </div>
                    <div className="h-6 w-0.5 bg-slate-300"></div>
                    <div className="p-2.5 bg-white border border-slate-200 rounded-lg text-center text-[10px] text-slate-500 w-full font-mono shadow-xs">
                      Google OAuth Sign-In
                    </div>
                  </div>

                  {/* Right Path: Main Dashboard Container */}
                  <div className="flex flex-col items-center w-52">
                    <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-center w-full shadow-xs">
                      <span className="text-[8px] font-mono font-bold text-emerald-600 uppercase tracking-wider">Screen.Dashboard</span>
                      <p className="text-[10px] text-slate-800 font-extrabold mt-1 leading-tight">DashboardScreen.kt</p>
                    </div>
                    <div className="h-6 w-0.5 bg-slate-300"></div>
                    <div className="p-2.5 bg-white border border-slate-200 rounded-lg text-center text-[10px] text-slate-500 w-full font-sans shadow-xs">
                      Offline SQLite DB Caching & Active Leads CRM Flow
                    </div>
                  </div>

                </div>

                {/* Converging into Dashboard actions */}
                <div className="h-4 w-0.5 bg-slate-300 select-none"></div>

                {/* Sub-features destinations */}
                <div className="p-3.5 bg-indigo-50/50 border border-indigo-200/50 rounded-2xl text-center select-none w-full max-w-sm shadow-xs">
                  <span className="text-[9px] font-mono font-black text-indigo-600 uppercase tracking-wider">Composables Bottom Nav Controllers</span>
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    <div className="p-1.5 bg-white border border-slate-200 rounded-lg text-[9px] font-bold text-slate-700 shadow-xs">
                      LeadDetailsScreen
                    </div>
                    <div className="p-1.5 bg-white border border-slate-200 rounded-lg text-[9px] font-bold text-slate-700 shadow-xs">
                      VoiceAgentScreen
                    </div>
                    <div className="p-1.5 bg-white border border-slate-200 rounded-lg text-[9px] font-bold text-slate-700 shadow-xs">
                      ChatAssistantScreen
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* TAB: ROADMAP TIMELINE */}
          {activeTab === "roadmap" && (
            <div className="space-y-6">
              <div className="border-b border-slate-200/80 pb-4">
                <span className="text-[10px] uppercase font-bold tracking-widest text-indigo-600 font-mono bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">Phase 1 deliverable</span>
                <h3 className="text-xl font-extrabold text-slate-900 mt-2.5 leading-tight">Development Milestone Roadmap (Weeks 1 - 18)</h3>
                <p className="text-xs text-slate-600 mt-2 font-sans leading-relaxed">
                  Our structured execution pipeline is engineered to launch the fully certified MVP to Google Play within 18 weeks.
                </p>
              </div>

              {/* Gantt / Timeline visualization */}
              <div className="space-y-4">
                {ROADMAP.map((mile) => (
                  <div key={mile.phase} className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1.5">
                      <div className="flex items-center space-x-2">
                        <span className={`text-[9px] px-2.5 py-0.5 rounded-md text-white font-black font-mono uppercase tracking-wider ${
                          mile.phase === "Phase 1" ? "bg-indigo-500" :
                          mile.phase === "Phase 2" ? "bg-blue-500" :
                          mile.phase === "Phase 3" ? "bg-purple-500" :
                          mile.phase === "Phase 4" ? "bg-pink-500" :
                          "bg-emerald-500"
                        }`}>
                          {mile.phase}
                        </span>
                        <span className="text-xs font-bold text-slate-500 font-mono">{mile.duration}</span>
                      </div>
                      <h4 className="text-sm font-extrabold text-slate-900">{mile.title}</h4>
                      <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1 text-xs text-slate-600 pl-4 list-disc font-sans leading-relaxed mt-2 select-text">
                        {mile.items.map((item, idx) => <li key={idx}>{item}</li>)}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: MONETIZATION & GROWTH STRATEGY */}
          {activeTab === "monetization" && (
            <div className="space-y-6 select-text">
              <div className="border-b border-slate-200/80 pb-4">
                <span className="text-[10px] uppercase font-bold tracking-widest text-indigo-600 font-mono bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">Phase 1 deliverable</span>
                <h3 className="text-xl font-extrabold text-slate-900 mt-2.5 leading-tight">SaaS Business Model & Growth Unit Economics</h3>
                <p className="text-xs text-slate-600 mt-2 font-sans leading-relaxed">
                  Aura AI utilizes a highly optimized value-based tiered SaaS pricing architecture to convert free/trial users into long-term subscribers, driven by direct Google Play In-App Billing subscriptions.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
                  <span className="text-[9px] font-mono font-black uppercase text-indigo-600 tracking-wider">Starter Tier</span>
                  <h4 className="text-lg font-black text-slate-900 mt-1 font-mono">$29/mo</h4>
                  <p className="text-[11px] text-slate-500 mt-2 font-sans leading-relaxed">
                    Designed for independent brokers, realtors, or freelancers. Auto-syncs SQLite records with Firestore. Limited to 500 automation runs per month.
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-indigo-50/40 border-2 border-indigo-500 relative shadow-sm">
                  <div className="absolute top-2.5 right-3 px-1.5 py-0.5 bg-indigo-600 text-white rounded text-[8px] font-black uppercase tracking-wider">Sweet Spot</div>
                  <span className="text-[9px] font-mono font-black uppercase text-indigo-600 tracking-wider">Business Tier</span>
                  <h4 className="text-lg font-black text-indigo-700 mt-1 font-mono">$99/mo</h4>
                  <p className="text-[11px] text-slate-600 mt-2 font-sans leading-relaxed">
                    For active agencies and local brands. Includes unlimited chat automation core, custom WhatsApp API templates, and 500 Voice Outbound Agent minutes.
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
                  <span className="text-[9px] font-mono font-black uppercase text-indigo-600 tracking-wider">Enterprise Tier</span>
                  <h4 className="text-lg font-black text-slate-900 mt-1 font-mono">Custom Pricing</h4>
                  <p className="text-[11px] text-slate-500 mt-2 font-sans leading-relaxed">
                    For multinational agencies and custom franchise chains. Dedicated cloud storage partitions, custom CRM integrations, and 24/7 dedicated support.
                  </p>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-indigo-50/50 border border-indigo-200/60 shadow-xs">
                <h4 className="text-xs font-black uppercase text-indigo-700 mb-1.5 font-mono font-bold">Scaling Growth Channels:</h4>
                <p className="text-xs text-slate-600 leading-relaxed font-sans">
                  Our customer acquisition growth model centers on product-led growth. Sales agents can generate a single "Aura Live Chat Link" and embed it directly onto their business cards or email signatures. Leads clicking this link will have their conversation processed in real-time by the AI, showing the value instantly and encouraging other sales agents to buy the premium app!
                </p>
              </div>
            </div>
          )}

          {/* TAB: RISK MITIGATION MATRIX */}
          {activeTab === "risks" && (
            <div className="space-y-6 select-text">
              <div className="border-b border-slate-200/80 pb-4">
                <span className="text-[10px] uppercase font-bold tracking-widest text-indigo-600 font-mono bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">Phase 1 deliverable</span>
                <h3 className="text-xl font-extrabold text-slate-900 mt-2.5 leading-tight">Critical Risk Assessment & Mitigation Matrix</h3>
                <p className="text-xs text-slate-600 mt-2 font-sans leading-relaxed">
                  As CTO, I have mapped out our main architectural and market risks, complete with dynamic failsafe and cloud mitigation plans.
                </p>
              </div>

              <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-xs">
                <div className="grid grid-cols-4 gap-2 p-3.5 bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono">
                  <span>Critical Risk</span>
                  <span>Category</span>
                  <span className="text-center">Prob/Imp</span>
                  <span>CTO Mitigation Strategy</span>
                </div>
                <div className="divide-y divide-slate-200 bg-white">
                  {RISK_MATRIX.map((item) => (
                    <div key={item.risk} className="grid grid-cols-4 gap-2 p-3.5 items-start hover:bg-slate-50/30">
                      <span className="text-xs font-bold text-slate-900 font-sans">{item.risk}</span>
                      <span className="text-[10px] font-semibold text-slate-500 font-mono">{item.category}</span>
                      <div className="text-center font-semibold font-mono text-[9px] space-y-1">
                        <div className="bg-amber-50 text-amber-700 border border-amber-200 px-1.5 py-0.5 rounded">P: {item.probability}</div>
                        <div className="bg-rose-50 text-rose-700 border border-rose-200 px-1.5 py-0.5 rounded">I: {item.impact}</div>
                      </div>
                      <span className="text-[11px] text-slate-600 leading-relaxed font-sans">{item.mitigation}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Right Column: AI CTO Live Advisor Chat (Always Visible Side Panel) */}
      <div className="w-full lg:w-80 flex flex-col bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-md flex-shrink-0 h-[280px] sm:h-[300px] lg:h-full">
        
        {/* CTO Live Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-slate-950/80 border-b border-slate-850">
          <div className="flex items-center space-x-2">
            <Bot className="h-5 w-5 text-indigo-400 animate-pulse" />
            <div>
              <h3 className="font-extrabold text-xs text-white leading-tight">YOUR AI Co-CTO</h3>
              <span className="text-[9px] text-slate-400 font-mono">Consulting Mode • Active</span>
            </div>
          </div>
          <Sparkles className="h-4 w-4 text-indigo-400" />
        </div>

        {/* CTO Chat History */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-900/40">
          {chatMessages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[90%] rounded-2xl p-3 text-[11px] leading-relaxed shadow-xs ${
                msg.role === "user"
                  ? "bg-indigo-600 text-white rounded-br-none"
                  : "bg-slate-950 border border-slate-850 text-slate-300 rounded-bl-none"
              }`}>
                {/* Format paragraphs properly */}
                {msg.content.split("\n").map((para, idx) => (
                  <p key={idx} className={idx > 0 ? "mt-1.5" : ""}>{para}</p>
                ))}
              </div>
            </div>
          ))}
          {isChatLoading && (
            <div className="flex justify-start">
              <div className="bg-slate-950 border border-slate-850 rounded-2xl rounded-bl-none p-3 text-[10px] text-slate-400 flex items-center space-x-1.5">
                <span className="animate-pulse">CTO is thinking...</span>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* CTO Input Form */}
        <form onSubmit={handleSendCtoMessage} className="p-3 bg-slate-950/80 border-t border-slate-850 flex items-center space-x-1.5">
          <input 
            type="text"
            placeholder="Ask me: Explain Clean Arch, customize database..."
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            disabled={isChatLoading}
            className="flex-1 px-3 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-hidden focus:border-indigo-500 placeholder-slate-500"
          />
          <button 
            id="btn-cto-send"
            type="submit"
            disabled={!chatInput.trim() || isChatLoading}
            className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-50 transition-all shadow-xs"
          >
            <Send className="h-4 w-4 text-white" />
          </button>
        </form>

      </div>

    </div>
  );
}
