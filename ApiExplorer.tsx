import React, { useState } from "react";
import { Network, ArrowRight, KeyRound, Globe, Copy, Check } from "lucide-react";
import { REST_APIS } from "../data";

export default function ApiExplorer() {
  const [selectedApiIndex, setSelectedApiIndex] = useState<number>(0);
  const [copied, setCopied] = useState(false);

  const selectedApi = REST_APIS[selectedApiIndex];

  const handleCopyResponseBody = () => {
    navigator.clipboard.writeText(selectedApi.responseBody);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col h-full bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
      {/* Top Title Section */}
      <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-b border-slate-200">
        <div className="flex items-center space-x-2.5">
          <Network className="h-5 w-5 text-indigo-600" />
          <h3 className="font-extrabold text-sm tracking-tight text-slate-900 uppercase">Aura AI - REST API Specifications</h3>
        </div>
        <span className="text-[10px] px-2.5 py-1 bg-indigo-50 text-indigo-600 border border-indigo-200 rounded-full font-mono font-bold select-none">Webhooks & Integration Gateway</span>
      </div>

      <div className="flex flex-1 flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-slate-200 overflow-hidden">
        
        {/* Left Side: Endpoint Directory */}
        <div className="w-full md:w-64 p-4 bg-slate-50/40 flex-shrink-0 max-h-40 md:max-h-none">
          <div className="mb-4">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Gateway Routers</span>
          </div>

          <div className="space-y-1.5">
            {REST_APIS.map((api, index) => (
              <button
                key={api.path}
                id={`btn-api-endpoint-${api.path.replace(/\//g, "-")}`}
                onClick={() => setSelectedApiIndex(index)}
                className={`w-full flex items-start space-x-2.5 p-3 rounded-2xl text-left text-xs transition-all border ${
                  selectedApiIndex === index
                    ? "bg-indigo-50 border-indigo-200 text-indigo-600"
                    : "border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100/60"
                }`}
              >
                <span className={`text-[9px] px-1.5 py-0.5 rounded font-black font-mono flex-shrink-0 ${
                  api.method === "POST" ? "bg-amber-50 text-amber-700 border border-amber-200" : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                }`}>
                  {api.method}
                </span>
                <div className="flex-1 min-w-0">
                  <p className={`font-bold font-mono text-[11px] truncate leading-tight ${selectedApiIndex === index ? "text-indigo-700" : "text-slate-700"}`}>{api.path}</p>
                  <p className="text-[10px] text-slate-400 truncate mt-1 leading-tight font-sans">{api.description}</p>
                </div>
              </button>
            ))}
          </div>

          <div className="mt-8 p-3 rounded-2xl bg-indigo-50/30 border border-indigo-100 text-[10px] text-slate-600 leading-relaxed font-sans">
            <h4 className="text-xs font-bold text-indigo-600 mb-1">API Integration:</h4>
            These REST APIs sync Aura AI with lead capture systems like Webflow, Zapier, or official Meta webhook alerts.
          </div>
        </div>

        {/* Right Side: Request/Response Visuals */}
        <div className="flex-1 p-6 space-y-5 overflow-y-auto bg-white">
          <div className="flex items-center space-x-2">
            <span className={`text-xs px-2 py-0.5 rounded-md font-black font-mono ${
              selectedApi.method === "POST" ? "bg-amber-50 text-amber-700 border border-amber-200" : "bg-emerald-50 text-emerald-700 border border-emerald-200"
            }`}>
              {selectedApi.method}
            </span>
            <span className="font-mono text-sm font-black text-slate-900">{selectedApi.path}</span>
          </div>

          <p className="text-xs text-slate-500 leading-relaxed max-w-2xl font-sans">{selectedApi.description}</p>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
            {/* Headers and Request Body */}
            <div className="space-y-4">
              <div className="space-y-2">
                <span className="text-[9px] font-mono font-black uppercase text-indigo-600 tracking-wider">Request Headers</span>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono space-y-1.5 text-slate-600">
                  {Object.entries(selectedApi.headers).map(([key, val]) => (
                    <div key={key} className="flex justify-between border-b border-slate-100 pb-1.5 last:border-b-0 last:pb-0">
                      <span className="text-slate-400">{key}:</span>
                      <span className="text-indigo-600 font-semibold">{val}</span>
                    </div>
                  ))}
                </div>
              </div>

              {selectedApi.requestBody && (
                <div className="space-y-2">
                  <span className="text-[9px] font-mono font-black uppercase text-indigo-600 tracking-wider">Request Payload (JSON)</span>
                  <div className="p-4 bg-slate-900 border border-slate-950 rounded-xl text-[10px] font-mono text-slate-200 overflow-auto max-h-56 shadow-sm">
                    <pre>{selectedApi.requestBody}</pre>
                  </div>
                </div>
              )}
            </div>

            {/* Response Body */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-mono font-black uppercase text-indigo-600 tracking-wider">Response Body (200 OK)</span>
                <button
                  onClick={handleCopyResponseBody}
                  className="p-1 px-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-[10px] text-slate-500 hover:text-slate-800 transition-all flex items-center space-x-1 font-semibold"
                >
                  {copied ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                  <span>{copied ? "Copied" : "Copy"}</span>
                </button>
              </div>
              <div className="p-4 bg-slate-900 border border-slate-950 rounded-xl text-[10px] font-mono text-emerald-400 overflow-auto max-h-72 shadow-sm">
                <pre>{selectedApi.responseBody}</pre>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
