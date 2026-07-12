import React, { useState } from "react";
import { Folder, FolderOpen, FileCode, Copy, Check, Terminal, ExternalLink } from "lucide-react";
import { ANDROID_FILES } from "../data";

export default function CodeExplorer() {
  const [selectedFile, setSelectedFile] = useState<string>("SplashScreen.kt");
  const [copied, setCopied] = useState(false);

  // File structure tree matching our clean architecture design
  const filesList = [
    { name: "SplashScreen.kt", path: "SplashScreen.kt", category: "UI/View" },
    { name: "SplashViewModel.kt", path: "SplashViewModel.kt", category: "MVVM/ViewModel" },
    { name: "MainActivity.kt", path: "MainActivity.kt", category: "UI/Entry" },
    { name: "NavGraph.kt", path: "NavGraph.kt", category: "UI/Navigation" },
    { name: "LoginScreen.kt", path: "LoginScreen.kt", category: "UI/AuthScreen" },
    { name: "SignUpScreen.kt", path: "SignUpScreen.kt", category: "UI/AuthScreen" },
    { name: "ForgotPasswordScreen.kt", path: "ForgotPasswordScreen.kt", category: "UI/AuthScreen" },
    { name: "OtpVerificationScreen.kt", path: "OtpVerificationScreen.kt", category: "UI/AuthScreen" },
    { name: "AuthViewModel.kt", path: "AuthViewModel.kt", category: "MVVM/ViewModel" },
    { name: "AuthRepository.kt", path: "AuthRepository.kt", category: "Clean/DomainRepository" },
    { name: "AuthRepositoryImpl.kt", path: "AuthRepositoryImpl.kt", category: "Clean/DataRepository" },
    { name: "LoginUseCase.kt", path: "LoginUseCase.kt", category: "Clean/UseCase" },
    { name: "SignUpUseCase.kt", path: "SignUpUseCase.kt", category: "Clean/UseCase" },
    { name: "SendPasswordResetUseCase.kt", path: "SendPasswordResetUseCase.kt", category: "Clean/UseCase" },
    { name: "VerifyEmailUseCase.kt", path: "VerifyEmailUseCase.kt", category: "Clean/UseCase" },
    { name: "LeadViewModel.kt", path: "LeadViewModel.kt", category: "MVVM/ViewModel" },
    { name: "GetLeadsUseCase.kt", path: "GetLeadsUseCase.kt", category: "Clean/UseCase" },
    { name: "LeadRepositoryImpl.kt", path: "LeadRepositoryImpl.kt", category: "Clean/DataRepository" },
    { name: "DomainModels.kt", path: "DomainModels.kt", category: "Clean/DomainModel" },
    { name: "AppDatabase.kt", path: "AppDatabase.kt", category: "Clean/OfflineCache" },
    { name: "DatabaseDaos.kt", path: "DatabaseDaos.kt", category: "Clean/LocalDao" },
    { name: "SaaSBackendRepository.kt", path: "SaaSBackendRepository.kt", category: "Clean/DomainRepository" },
    { name: "SaaSBackendRepositoryImpl.kt", path: "SaaSBackendRepositoryImpl.kt", category: "Clean/DataRepository" },
    { name: "SaaSBackendUseCases.kt", path: "SaaSBackendUseCases.kt", category: "Clean/UseCase" },
    { name: "SaaSBackendViewModels.kt", path: "SaaSBackendViewModels.kt", category: "MVVM/ViewModel" },
    { name: "build.gradle.kts", path: "build.gradle.kts", category: "Config/Gradle" },
    { name: "AndroidManifest.xml", path: "AndroidManifest.xml", category: "Config/Manifest" }
  ];

  const handleCopy = () => {
    navigator.clipboard.writeText(ANDROID_FILES[selectedFile]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col h-full bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
      {/* Top Title Section */}
      <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-b border-slate-200">
        <div className="flex items-center space-x-2.5">
          <Terminal className="h-5 w-5 text-indigo-600" />
          <h3 className="font-extrabold text-sm tracking-tight text-slate-900 uppercase">Aura AI - Kotlin MVVM Codebase Explorer</h3>
        </div>
        <span className="text-[10px] px-2.5 py-1 bg-indigo-50 text-indigo-600 border border-indigo-200 rounded-full font-mono font-bold select-none">Android Native SDK 35</span>
      </div>

      <div className="flex flex-1 flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-slate-200 overflow-hidden">
        
        {/* Left Side: Directory Tree */}
        <div className="w-full md:w-64 p-4 bg-slate-50/40 overflow-y-auto flex-shrink-0 max-h-40 md:max-h-none">
          <div className="mb-4">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Project Files (app/src/main/java)</span>
          </div>

          <div className="space-y-1">
            {/* Root package folder representation */}
            <div className="flex items-center space-x-2 text-xs font-semibold text-slate-700 py-1.5 px-2 select-none">
              <FolderOpen className="h-4 w-4 text-indigo-600 flex-shrink-0" />
              <span>com.aura.ai</span>
            </div>

            {/* Child directories and their files */}
            <div className="pl-4 space-y-1">
              {filesList.map((file) => (
                <button
                  key={file.name}
                  id={`btn-code-file-${file.name.replace(".", "-")}`}
                  onClick={() => setSelectedFile(file.name)}
                  className={`w-full flex items-center justify-between py-2 px-3 rounded-xl text-left text-xs transition-all border ${
                    selectedFile === file.name
                      ? "bg-indigo-50 border-indigo-200 text-indigo-600 font-semibold"
                      : "border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100/60"
                  }`}
                >
                  <div className="flex items-center space-x-2 truncate">
                    <FileCode className={`h-4 w-4 flex-shrink-0 ${selectedFile === file.name ? "text-indigo-600" : "text-slate-400"}`} />
                    <span className="truncate">{file.name}</span>
                  </div>
                  <span className="text-[9px] text-slate-400 hidden xl:inline ml-2 font-mono">{file.category}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="mt-8 p-3.5 rounded-2xl bg-indigo-50/30 border border-indigo-100 shadow-xs">
            <h4 className="text-xs font-bold text-indigo-600 mb-1">CTO Architecture Fact:</h4>
            <p className="text-[10px] text-slate-500 leading-relaxed font-sans">
              This MVVM + Clean Architecture structures code into decoupled layers: **UI (Jetpack Compose)**, **Domain (Use Cases)**, and **Data (Repositories)**. Perfect for testing, maintenance, and massive startup scale!
            </p>
          </div>
        </div>

        {/* Right Side: Code Viewer */}
        <div className="flex-1 flex flex-col bg-slate-950 overflow-hidden">
          {/* Code Header Bar */}
          <div className="flex items-center justify-between px-5 py-2.5 bg-slate-900 border-b border-slate-950">
            <span className="text-xs font-mono text-slate-300">{`com/aura/ai/${selectedFile}`}</span>
            <button
              onClick={handleCopy}
              className="flex items-center space-x-1.5 px-3 py-1 bg-slate-950 border border-slate-850 rounded-lg text-slate-400 hover:text-white hover:border-slate-700 transition-all text-xs font-medium"
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  <span>Copy Code</span>
                </>
              )}
            </button>
          </div>

          {/* Code Text Content (Preformatted/Styled) */}
          <div className="flex-1 overflow-auto p-5 font-mono text-xs text-slate-300 leading-relaxed select-text bg-slate-950 selection:bg-indigo-900/50 selection:text-indigo-200">
            <pre className="whitespace-pre">
              {ANDROID_FILES[selectedFile].split("\n").map((line, idx) => {
                // Extremely simple basic custom Kotlin pseudo syntax highlighting!
                let lineElem = <span>{line}</span>;
                if (line.trim().startsWith("package ") || line.trim().startsWith("import ")) {
                  lineElem = <span className="text-pink-400">{line}</span>;
                } else if (line.trim().startsWith("class ") || line.trim().startsWith("interface ") || line.trim().startsWith("object ") || line.trim().startsWith("sealed class ")) {
                  lineElem = <span className="text-indigo-300 font-bold">{line}</span>;
                } else if (line.trim().startsWith("fun ") || line.trim().startsWith("operator fun ")) {
                  lineElem = <span className="text-emerald-400 font-semibold">{line}</span>;
                } else if (line.trim().startsWith("@") || line.trim().startsWith("@Inject") || line.trim().startsWith("@HiltViewModel")) {
                  lineElem = <span className="text-amber-400">{line}</span>;
                } else if (line.trim().startsWith("//") || line.trim().startsWith("/**") || line.trim().startsWith("*")) {
                  lineElem = <span className="text-slate-400/80 italic">{line}</span>;
                }
                return (
                  <div key={idx} className="flex hover:bg-slate-900">
                    <span className="w-10 text-slate-500/60 pr-3 text-right select-none font-mono text-[10px]">{idx + 1}</span>
                    <span className="flex-1">{lineElem}</span>
                  </div>
                );
              })}
            </pre>
          </div>

        </div>

      </div>
    </div>
  );
}
