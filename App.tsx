import React, { useState } from "react";
import { 
  Cpu, 
  Terminal, 
  Database, 
  Network, 
  TrendingUp, 
  Smartphone, 
  Globe, 
  Mail, 
  Clock,
  Layers,
  Download
} from "lucide-react";
import PhoneSimulator from "./components/PhoneSimulator";
import CtoPanel from "./components/CtoPanel";
import CodeExplorer from "./components/CodeExplorer";
import DatabaseExplorer from "./components/DatabaseExplorer";
import ApiExplorer from "./components/ApiExplorer";

type AppTab = "specifications" | "codebase" | "database" | "endpoints";

export default function App() {
  const [activeTab, setActiveTab] = useState<AppTab>("specifications");
  const [selectedLeadId, setSelectedLeadId] = useState<string | undefined>(undefined);

  // Sync clicking on leads in Phone simulator to change tabs and focus code/DB if needed
  const handleLeadSelect = (id: string) => {
    setSelectedLeadId(id);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans flex flex-col selection:bg-indigo-100 selection:text-indigo-950">
      
      {/* Top Banner / Navigation Bar */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 select-none flex-shrink-0 shadow-xs">
        
        {/* Logo and App Status */}
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center shadow-sm">
            <Cpu className="h-5.5 w-5.5 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-base font-black tracking-tight text-slate-900 uppercase leading-none">Aura AI Studio</h1>
              <span className="text-[10px] px-2 py-0.5 bg-indigo-50 text-indigo-600 border border-indigo-200 rounded font-bold">Phase 1 Approved</span>
            </div>
            <p className="text-xs text-slate-500 mt-1 font-semibold font-sans">Startup CTO Command Center & Interactive Android Simulator</p>
          </div>
        </div>

        {/* Global Metadata metrics */}
        <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-slate-500">
          <div className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-50 rounded-xl border border-slate-200">
            <Mail className="h-3.5 w-3.5 text-indigo-600" />
            <span>Founder: <span className="text-slate-800 font-bold">husnain18650@gmail.com</span></span>
          </div>
          <div className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-50 rounded-xl border border-slate-200">
            <Clock className="h-3.5 w-3.5 text-indigo-600" />
            <span>Timezone: <span className="text-slate-800 font-bold">UTC</span></span>
          </div>
          <div className="flex items-center space-x-1.5 px-3 py-1.5 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-700 font-bold">
            <Smartphone className="h-3.5 w-3.5 text-emerald-600 animate-pulse" />
            <span>Android Client Connected</span>
          </div>
          <a 
            href="/api/download-android" 
            download
            className="flex items-center space-x-1.5 px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs hover:shadow-md cursor-pointer uppercase tracking-tight"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Download Android ZIP</span>
          </a>
        </div>

      </header>

      {/* Main Studio Body (Split Layout: Phone Simulator on Left, Workspaces on Right) */}
      <main className="flex-1 w-full flex flex-col lg:flex-row p-4 lg:p-6 gap-6 overflow-y-auto lg:overflow-hidden min-h-0">
        
        {/* Left Column: Interactive Mobile Device Simulator */}
        <div className="flex flex-col items-center justify-center lg:border-r lg:border-slate-200 lg:pr-6 flex-shrink-0 w-full lg:w-auto">
          <div className="mb-3 text-center select-none">
            <span className="text-[10px] uppercase font-black tracking-widest text-indigo-600 font-mono">Live Simulation</span>
            <p className="text-[11px] text-slate-500 mt-0.5 font-sans font-semibold">Touch phone buttons or screens to navigate</p>
          </div>
          
          <PhoneSimulator 
            selectedLeadId={selectedLeadId}
            onLeadSelect={handleLeadSelect}
          />
        </div>

        {/* Right Column: Dynamic Architectural workspaces */}
        <div className="flex-1 flex flex-col gap-5 min-w-0 w-full">
          
          {/* Main Workspace Navigation Selector */}
          <div className="flex items-center justify-between border-b border-slate-200 pb-3 select-none flex-shrink-0 w-full overflow-hidden">
            <div className="flex space-x-2 overflow-x-auto pb-1 max-w-full scrollbar-none snap-x flex-nowrap">
              {[
                { id: "specifications", label: "Strategic Specifications", icon: Layers },
                { id: "codebase", label: "Kotlin Clean Architecture", icon: Terminal },
                { id: "database", label: "Firestore Cloud Databases", icon: Database },
                { id: "endpoints", label: "REST Webhooks & Integrations", icon: Network },
              ].map((tab) => {
                const IconComp = tab.icon;
                return (
                  <button
                    key={tab.id}
                    id={`btn-workspace-tab-${tab.id}`}
                    onClick={() => setActiveTab(tab.id as AppTab)}
                    className={`flex items-center space-x-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer border flex-shrink-0 snap-start ${
                      activeTab === tab.id
                        ? "bg-indigo-600 text-white border-indigo-500 shadow-sm"
                        : "bg-white border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-100"
                    }`}
                  >
                    <IconComp className="h-4 w-4 text-current" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Dynamic Workspace Workspace Container */}
          <div className="flex-1 min-h-0 h-[680px] sm:h-[760px] lg:h-full">
            {activeTab === "specifications" && <CtoPanel />}
            {activeTab === "codebase" && <CodeExplorer />}
            {activeTab === "database" && <DatabaseExplorer />}
            {activeTab === "endpoints" && <ApiExplorer />}
          </div>

        </div>

      </main>

    </div>
  );
}
