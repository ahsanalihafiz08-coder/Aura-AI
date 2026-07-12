import React, { useState } from "react";
import { Database, ShieldCheck, KeyRound, Copy, Check, ChevronRight } from "lucide-react";
import { FIRESTORE_DATABASE_SCHEMA } from "../data";

export default function DatabaseExplorer() {
  const [selectedColIndex, setSelectedColIndex] = useState<number>(1); // default to 'leads' collection
  const [copied, setCopied] = useState(false);

  const selectedCollection = FIRESTORE_DATABASE_SCHEMA[selectedColIndex];

  const handleCopyRules = () => {
    navigator.clipboard.writeText(selectedCollection.rules);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col h-full bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
      {/* Top Title Section */}
      <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-b border-slate-200">
        <div className="flex items-center space-x-2.5">
          <Database className="h-5 w-5 text-indigo-600" />
          <h3 className="font-extrabold text-sm tracking-tight text-slate-900 uppercase">Aura AI - Firestore Database Designer</h3>
        </div>
        <span className="text-[10px] px-2.5 py-1 bg-indigo-50 text-indigo-600 border border-indigo-200 rounded-full font-mono font-bold select-none">NoSQL Cloud Schema</span>
      </div>

      <div className="flex flex-1 flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-slate-200 overflow-hidden">
        
        {/* Left Side: Collections List */}
        <div className="w-full md:w-64 p-4 bg-slate-50/40 flex-shrink-0 max-h-40 md:max-h-none">
          <div className="mb-4">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Cloud Collections</span>
          </div>

          <div className="space-y-1.5">
            {FIRESTORE_DATABASE_SCHEMA.map((col, index) => (
              <button
                key={col.name}
                id={`btn-db-col-${col.name}`}
                onClick={() => setSelectedColIndex(index)}
                className={`w-full flex items-center justify-between py-2.5 px-3.5 rounded-2xl text-left text-xs transition-all border ${
                  selectedColIndex === index
                    ? "bg-indigo-50 border-indigo-200 text-indigo-600 font-semibold"
                    : "border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100/60"
                }`}
              >
                <div className="flex flex-col min-w-0">
                  <span className="font-bold text-xs">{col.name}</span>
                  <span className="text-[10px] text-slate-400 truncate mt-0.5">{col.description}</span>
                </div>
                <ChevronRight className={`h-4 w-4 ${selectedColIndex === index ? "text-indigo-600" : "text-slate-400"}`} />
              </button>
            ))}
          </div>

          <div className="mt-8 p-3.5 rounded-2xl bg-indigo-50/30 border border-indigo-100 text-[10px] text-slate-600 leading-relaxed font-sans">
            <h4 className="text-xs font-bold text-indigo-600 mb-1">Firestore Tip:</h4>
            Firestore is a document-oriented database. Unlike SQL, it stores records as JSON-like documents within collections, which enables horizontal scaling and real-time synchronization.
          </div>
        </div>

        {/* Right Side: Schema Fields & Rules */}
        <div className="flex-1 flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-slate-200 bg-white overflow-y-auto">
          
          {/* Schema Fields Grid */}
          <div className="flex-1 p-6 space-y-4">
            <div>
              <span className="text-[10px] uppercase font-black text-indigo-600 tracking-wider font-mono">Document Schema fields</span>
              <h4 className="text-lg font-extrabold text-slate-900 leading-tight mt-1">Collection: <span className="font-mono text-indigo-600">/{selectedCollection.name}</span></h4>
            </div>

            <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-xs">
              <div className="grid grid-cols-3 gap-2 px-4 py-2.5 bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase tracking-wider font-mono">
                <span>Field Name</span>
                <span>Type</span>
                <span>Role</span>
              </div>
              <div className="divide-y divide-slate-100">
                {selectedCollection.fields.map((field) => (
                  <div key={field.name} className="grid grid-cols-3 gap-2 px-4 py-3 items-center hover:bg-slate-50/40">
                    <span className="text-xs font-bold font-mono text-slate-800">{field.name} {field.required && <span className="text-red-500 text-[9px] font-bold">*</span>}</span>
                    <span className="text-[10px] font-semibold text-indigo-600 font-mono">{field.type}</span>
                    <span className="text-[10px] text-slate-500 font-sans">{field.description}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <p className="text-[10px] text-slate-400 font-mono">* Indicates required field inside document schema definition.</p>
          </div>

          {/* Rules Security View */}
          <div className="w-full md:w-80 p-6 flex flex-col justify-between space-y-4 flex-shrink-0 bg-slate-50/30">
            <div className="space-y-3">
              <div className="flex items-center space-x-1.5 text-indigo-600">
                <ShieldCheck className="h-5 w-5 text-indigo-600" />
                <span className="text-[10px] uppercase font-black tracking-wider font-mono text-indigo-600">Security Rules</span>
              </div>
              <h4 className="text-xs font-extrabold text-slate-900">Firebase Security Configuration</h4>
              <p className="text-[11px] text-slate-500 leading-relaxed font-sans">
                These security rules protect lead records on the server. Only the authenticated owner of the business records can view or edit them.
              </p>

              <div className="relative mt-2 rounded-xl border border-slate-800 bg-slate-900 p-3 overflow-auto font-mono text-[9px] text-slate-200 leading-normal max-h-56 shadow-sm">
                <button
                  onClick={handleCopyRules}
                  className="absolute top-2 right-2 p-1.5 bg-slate-950 hover:bg-slate-800 border border-slate-850 rounded-lg text-slate-400 hover:text-white transition-all shadow-xs"
                >
                  {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                </button>
                <pre className="whitespace-pre">{selectedCollection.rules}</pre>
              </div>
            </div>

            <div className="p-3 bg-indigo-50 border border-indigo-200/50 rounded-xl">
              <span className="text-[9px] font-mono font-bold uppercase text-indigo-600">CTO Rule Mitigation:</span>
              <p className="text-[9px] text-slate-600 leading-relaxed mt-1 font-sans">
                Ensures 100% data partition compliance with European and US business requirements, including zero risk of multi-tenant data bleed.
              </p>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
