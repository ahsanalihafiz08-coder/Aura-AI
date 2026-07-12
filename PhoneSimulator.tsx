import React, { useState, useEffect, useRef } from "react";
import { 
  Play, 
  Send, 
  PhoneCall, 
  Mic, 
  MessageSquare, 
  ChevronLeft, 
  User, 
  Search, 
  Volume2, 
  CheckCircle, 
  ArrowRight,
  TrendingUp,
  Settings as SettingsIcon,
  ShieldAlert,
  Wifi,
  Battery,
  Lock,
  Mail,
  Eye,
  EyeOff,
  AlertCircle,
  Loader2,
  Plus,
  Trash2,
  Copy,
  Share2,
  Edit3,
  Menu,
  Image as ImageIcon,
  X,
  CloudOff,
  Brain,
  Paperclip,
  Tag,
  FileText,
  Download,
  Check,
  Shield,
  Users,
  Activity
} from "lucide-react";
import { Lead, SimulatedScreen } from "../types";
import { motion, AnimatePresence } from "motion/react";
import { auth, db } from "../firebase";
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  sendPasswordResetEmail, 
  signOut, 
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup
} from "firebase/auth";
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  deleteDoc, 
  updateDoc,
  increment
} from "firebase/firestore";

interface PhoneSimulatorProps {
  onScreenChange?: (screen: SimulatedScreen) => void;
  selectedLeadId?: string;
  onLeadSelect?: (id: string) => void;
}

interface Message {
  role: "user" | "assistant";
  content: string;
  image?: string;
}

export default function PhoneSimulator({ 
  onScreenChange, 
  selectedLeadId, 
  onLeadSelect 
}: PhoneSimulatorProps) {
  const [currentScreen, setCurrentScreen] = useState<SimulatedScreen>("login");
  
  // Interactive Auth Flow State (Phase 3 Authentication Module)
  const [authSubScreen, setAuthSubScreen] = useState<"loginMain" | "emailLogin" | "signUp" | "forgotPassword" | "otp">("loginMain");
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authName, setAuthName] = useState("");
  const [authOtpCode, setAuthOtpCode] = useState("");
  const [authError, setAuthError] = useState("");
  const [authSuccessMsg, setAuthSuccessMsg] = useState("");
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Authenticated User State
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Form Fields for adding a lead
  const [newLeadName, setNewLeadName] = useState("");
  const [newLeadBusiness, setNewLeadBusiness] = useState("");
  const [newLeadEmail, setNewLeadEmail] = useState("");
  const [newLeadPhone, setNewLeadPhone] = useState("");
  const [newLeadValue, setNewLeadValue] = useState("");
  const [newLeadStatus, setNewLeadStatus] = useState<"Hot" | "Warm" | "Cold">("Hot");
  const [newLeadSource, setNewLeadSource] = useState("WhatsApp");
  const [newLeadNotes, setNewLeadNotes] = useState("");

  const navigateAuthTo = (sub: "loginMain" | "emailLogin" | "signUp" | "forgotPassword" | "otp") => {
    setAuthSubScreen(sub);
    setAuthError("");
    setAuthSuccessMsg("");
  };

  const [leads, setLeads] = useState<Lead[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  
  // Voice Agent State
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [voiceWaveforms, setVoiceWaveforms] = useState<number[]>([15, 25, 40, 15, 30, 60, 20, 10, 35, 45, 12, 18, 30, 25, 15]);
  const [voiceStatus, setVoiceStatus] = useState("Tap microphone to initialize...");
  const [simulatedVoiceDialog, setSimulatedVoiceDialog] = useState<string[]>([]);
  
  // Chat Assistant Enhanced Phase 5 State
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [chatsList, setChatsList] = useState<any[]>([]);
  const [attachedImage, setAttachedImage] = useState<string | null>(null);
  const [attachedImageMime, setAttachedImageMime] = useState<string | null>(null);
  const [voiceRecordingState, setVoiceRecordingState] = useState<"idle" | "recording" | "processing">("idle");
  const [chatRenameTitle, setChatRenameTitle] = useState("");
  const [isRenamingChatId, setIsRenamingChatId] = useState<string | null>(null);
  const [showChatRoomsMenu, setShowChatRoomsMenu] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [tokenUsageMetrics, setTokenUsageMetrics] = useState({ prompt: 0, candidates: 0 });
  const [dailyQueriesCount, setDailyQueriesCount] = useState(0);
  const [lastChatMessageError, setLastChatMessageError] = useState<string | null>(null);

  const [chatMessages, setChatMessages] = useState<Message[]>([
    { role: "assistant", content: "Hello! I am Aura AI, your mobile automation core. I can draft automated emails, answer CRM lead metrics, or write WhatsApp templates. What business task can I automate for you today?" }
  ]);
  const [chatInput, setChatInput] = useState("");
  const [isChatLoading, setIsChatLoading] = useState(false);
  
  const chatEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // CRM, Lead Management & Business Automation States (Phase 7)
  const [crmViewMode, setCrmViewMode] = useState<"list" | "kanban">("list");
  const [userRole, setUserRole] = useState<"Admin" | "Manager" | "Staff">("Admin");
  
  // Interactive sub-elements linked to selected lead
  const [leadTasks, setLeadTasks] = useState<Record<string, { id: string; title: string; priority: string; completed: boolean }[]>>({});
  const [leadMeetings, setLeadMeetings] = useState<Record<string, { id: string; title: string; dateTime: string; location: string }[]>>({});
  const [leadNotes, setLeadNotes] = useState<Record<string, { id: string; content: string; type: string; timestamp: string }[]>>({});
  
  // New input fields for task, meeting, and notes
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskPriority, setNewTaskPriority] = useState("Medium");
  const [newMtgTitle, setNewMtgTitle] = useState("");
  const [newMtgLocation, setNewMtgLocation] = useState("");
  const [newNoteText, setNewNoteText] = useState("");

  // AI Generated outreach states
  const [aiScore, setAiScore] = useState<Record<string, number>>({});
  const [aiSummary, setAiSummary] = useState<Record<string, string>>({});
  const [aiNextAction, setAiNextAction] = useState<Record<string, string>>({});
  const [aiHighPriority, setAiHighPriority] = useState<Record<string, boolean>>({});
  
  const [generatedEmail, setGeneratedEmail] = useState<string | null>(null);
  const [generatedWhatsApp, setGeneratedWhatsApp] = useState<string | null>(null);
  const [outreachGoal, setOutreachGoal] = useState("Enterprise pilot discount trial pack");

  // Phase 8: Subscription, Billing & Revenue System States
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");
  const [activeCoupon, setActiveCoupon] = useState("");
  const [discountPercent, setDiscountPercent] = useState(0);
  const [promoInput, setPromoInput] = useState("");
  const [promoStatus, setPromoStatus] = useState<{ status: "idle" | "valid" | "invalid"; message: string }>({ status: "idle", message: "" });
  const [isSubscriptionCancelled, setIsSubscriptionCancelled] = useState(false);
  const [billingExpiresAt, setBillingExpiresAt] = useState<string>("");
  const [billingOrderId, setBillingOrderId] = useState("");
  const [billingPurchaseToken, setBillingPurchaseToken] = useState("");
  const [invoices, setInvoices] = useState<any[]>([]);
  const [showInvoiceReceipt, setShowInvoiceReceipt] = useState<any | null>(null);
  const [isBillingProcessing, setIsBillingProcessing] = useState(false);
  const [voiceCallSimulationCount, setVoiceCallSimulationCount] = useState(0);
  const [showPlayBillingSheet, setShowPlayBillingSheet] = useState<any | null>(null);

  // Sync state change handlers to parent
  const changeScreen = (screen: SimulatedScreen) => {
    setCurrentScreen(screen);
    if (onScreenChange) {
      onScreenChange(screen);
    }
  };

  // Listen to Online/Offline status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Helper to seed initial leads into Firestore on first signup
  const seedUserLeads = async (userId: string) => {
    const defaultLeads = [
      {
        ownerId: userId,
        name: "Sarah Jenkins",
        business: "Apex Realty Group",
        email: "sarah@apexrealty.com",
        phone: "+1 (555) 019-2834",
        value: 12500,
        status: "Hot" as const,
        source: "WhatsApp",
        lastContact: "10 mins ago",
        notes: "Looking for an AI agent to handle late-night customer booking queries. Budget approved.",
        automatedAction: "WhatsApp follow-up scheduled for tomorrow, 10:00 AM."
      },
      {
        ownerId: userId,
        name: "Marcus Vance",
        business: "Vance Logistics Co.",
        email: "m.vance@vancelog.com",
        phone: "+1 (555) 482-9011",
        value: 45000,
        status: "Warm" as const,
        source: "Inbound Email",
        lastContact: "2 hours ago",
        notes: "Interested in full WhatsApp + Email sales funnel automation. Needs high security assurance.",
        automatedAction: "Email introductory deck sent automatically."
      },
      {
        ownerId: userId,
        name: "Evelyn Chen",
        business: "E-Com Brands Inc.",
        email: "evelyn@ecombrands.io",
        phone: "+44 20 7946 0958",
        value: 8500,
        status: "Cold" as const,
        source: "Facebook Ads",
        lastContact: "1 day ago",
        notes: "Downloaded the AI integration guide. Has not requested demo yet.",
        automatedAction: "Drip sequence Day 1 email scheduled."
      },
      {
        ownerId: userId,
        name: "David Miller",
        business: "SaaS Rocket Ltd.",
        email: "david@saasrocket.io",
        phone: "+1 (555) 893-1122",
        value: 32000,
        status: "Hot" as const,
        source: "Referral",
        lastContact: "Just Now",
        notes: "Wants to deploy Aura AI Voice Agent to automate outbound qualified meeting bookings.",
        automatedAction: "AI Voice booking campaign initialized."
      }
    ];

    for (const l of defaultLeads) {
      const docRef = doc(collection(db, "leads"));
      await setDoc(docRef, { ...l, id: docRef.id });
    }
  };

  // Auth State Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);
        
        // Fetch user profile from Firestore
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);
        
        if (userSnap.exists()) {
          setUserProfile(userSnap.data());
        } else {
          // If profile missing, auto create it
          const profileData = {
            uid: user.uid,
            email: user.email || "",
            displayName: authName || user.displayName || user.email?.split("@")[0] || "Agency Lead",
            subscriptionTier: "Business",
            whatsappConnected: false,
            createdAt: new Date().toISOString()
          };
          await setDoc(userRef, profileData);
          setUserProfile(profileData);
          
          try {
            await seedUserLeads(user.uid);
          } catch (e) {
            console.error("Auto-seeding leads failed:", e);
          }
        }
        
        // Auto-redirect if on login screen
        if (currentScreen === "login") {
          setCurrentScreen("dashboard");
        }
      } else {
        setCurrentUser(null);
        setUserProfile(null);
        // Force login screen
        if (currentScreen !== "login") {
          setCurrentScreen("login");
        }
      }
    });
    return () => unsubscribe();
  }, [currentScreen]);

  // Real-time Leads Synchronization
  useEffect(() => {
    if (!currentUser) {
      // If not logged in, fetch default mock leads via API
      fetch("/api/crm/leads")
        .then((res) => res.json())
        .then((data) => {
          if (data.leads) {
            setLeads(data.leads);
          }
        })
        .catch((err) => console.error("Error loading leads in simulator:", err));
      return;
    }

    const q = query(
      collection(db, "leads"),
      where("ownerId", "==", currentUser.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const loadedLeads: Lead[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        loadedLeads.push({
          id: data.id || doc.id,
          name: data.name || "",
          business: data.business || "",
          email: data.email || "",
          phone: data.phone || "",
          value: Number(data.value) || 0,
          status: data.status || "Warm",
          source: data.source || "Web",
          lastContact: data.lastContact || "Just now",
          notes: data.notes || "",
          automatedAction: data.automatedAction || "No action taken yet."
        });
      });
      setLeads(loadedLeads);
    }, (err) => {
      console.error("Leads real-time sync error:", err);
    });

    return () => unsubscribe();
  }, [currentUser]);

  // Real-time Subscription & Invoices Synchronization (Phase 8)
  useEffect(() => {
    if (!currentUser) {
      setInvoices([]);
      setDiscountPercent(0);
      setActiveCoupon("");
      setIsSubscriptionCancelled(false);
      return;
    }

    // 1. Listen to user profile document in real-time
    const userDocRef = doc(db, "users", currentUser.uid);
    const unsubUser = onSnapshot(userDocRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setUserProfile(data);
        setIsSubscriptionCancelled(!!data.isSubscriptionCancelled);
        setDiscountPercent(data.discountPercent || 0);
        setActiveCoupon(data.activeCouponCode || "");
        setBillingExpiresAt(data.subscriptionExpiresAt || "");
        setBillingOrderId(data.billingOrderId || "");
        setBillingPurchaseToken(data.billingPurchaseToken || "");
      }
    });

    // 2. Listen to invoices in real-time
    const qInvoices = query(
      collection(db, "invoices"),
      where("userId", "==", currentUser.uid)
    );
    const unsubInvoices = onSnapshot(qInvoices, (snapshot) => {
      const loadedInvoices: any[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        loadedInvoices.push({
          id: data.id || doc.id,
          ...data
        });
      });
      // Sort by date descending
      loadedInvoices.sort((a, b) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime());
      setInvoices(loadedInvoices);
    });

    return () => {
      unsubUser();
      unsubInvoices();
    };
  }, [currentUser]);

  // Sync lead from outside props if selected
  useEffect(() => {
    if (selectedLeadId && leads.length > 0) {
      const match = leads.find((l) => l.id === selectedLeadId);
      if (match) {
        setSelectedLead(match);
        setCurrentScreen("leadDetails");
      }
    }
  }, [selectedLeadId, leads]);

  // Handle lead click inside phone
  const handleLeadClick = (lead: Lead) => {
    setSelectedLead(lead);
    if (onLeadSelect) {
      onLeadSelect(lead.id);
    }
    changeScreen("leadDetails");
  };

  // Voice wave animation loop
  useEffect(() => {
    let interval: any;
    if (isVoiceActive) {
      interval = setInterval(() => {
        setVoiceWaveforms(Array.from({ length: 15 }, () => Math.floor(Math.random() * 65) + 15));
      }, 120);
    }
    return () => clearInterval(interval);
  }, [isVoiceActive]);

  // Voice simulation logic
  const handleVoiceToggle = () => {
    if (!isVoiceActive) {
      // Enforce Voice call limits for Free tier (Pro, Business, Enterprise have unlimited outbound calls)
      const isSaaSPremium = userProfile?.subscriptionTier === "Pro" || userProfile?.subscriptionTier === "Business" || userProfile?.subscriptionTier === "Enterprise" || userProfile?.subscriptionTier === "Starter";
      if (!isSaaSPremium) {
        if (voiceCallSimulationCount >= 1) {
          setVoiceStatus("Voice Limit Reached (1/1 call used). Upgrade plan to Pro, Business, or Enterprise to unlock unlimited outbound voice campaigns!");
          showToast("Voice trial limit reached. Please upgrade.");
          return;
        }
        setVoiceCallSimulationCount(prev => prev + 1);
      }

      setIsVoiceActive(true);
      setVoiceStatus("Aura AI Listening...");
      setSimulatedVoiceDialog([]);
      
      // Simulate speech-to-text dialogue
      setTimeout(() => {
        setSimulatedVoiceDialog(prev => [...prev, "🎤 Lead (Sarah): Hi, I left a message about your real estate automation package. Is it still available?"]);
        setVoiceStatus("Aura AI Processing...");
      }, 2500);

      setTimeout(() => {
        setVoiceStatus("Aura AI Speaking...");
        setSimulatedVoiceDialog(prev => [...prev, "🤖 Aura AI: Yes, Sarah! The automation core connects instantly. I can schedule a demo or email you the credentials right now. Which do you prefer?"]);
      }, 5500);

      setTimeout(() => {
        setVoiceStatus("Aura AI Listening...");
        setSimulatedVoiceDialog(prev => [...prev, "🎤 Lead (Sarah): Awesome, please email me the demo package at sarah@apexrealty.com."]);
      }, 9500);

      setTimeout(() => {
        setVoiceStatus("Aura AI Action Triggered!");
        setSimulatedVoiceDialog(prev => [
          ...prev, 
          "🤖 Aura AI: Done! I have sent the demo credentials to sarah@apexrealty.com and updated your CRM status to HOT.",
          "✨ SYSTEM ACTION: Draft sent, CRM database synchronized!"
        ]);
        setIsVoiceActive(false);
      }, 13000);

    } else {
      setIsVoiceActive(false);
      setVoiceStatus("Voice Call Ended.");
    }
  };

  // ==========================================
  // PHASE 5: AI CHAT ASSISTANT CORE ENGINE
  // ==========================================

  // Sync AI Chats List from Firestore for the current user in real-time
  useEffect(() => {
    if (!currentUser) {
      setChatsList([]);
      return;
    }

    const q = query(
      collection(db, "ai_chats"),
      where("userId", "==", currentUser.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const loadedChats: any[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        loadedChats.push({
          id: docSnap.id,
          ...data
        });
      });
      // Sort newest exchanges first
      loadedChats.sort((a, b) => {
        return new Date(b.lastMessageTime || 0).getTime() - new Date(a.lastMessageTime || 0).getTime();
      });
      setChatsList(loadedChats);
    }, (err) => {
      console.error("AI Chats Real-Time sync error:", err);
    });

    return () => unsubscribe();
  }, [currentUser]);

  // Load selected Chat Session's messageHistory in real-time
  useEffect(() => {
    if (!activeChatId) {
      // Default initial welcome message when starting a fresh session
      setChatMessages([
        { role: "assistant", content: "Hello! I am Aura AI, your mobile automation core. I can draft automated emails, answer CRM lead metrics, or write WhatsApp templates. What business task can I automate for you today?" }
      ]);
      setLastChatMessageError(null);
      return;
    }

    const matchedChat = chatsList.find((c) => c.id === activeChatId);
    if (matchedChat && matchedChat.messageHistory) {
      setChatMessages(matchedChat.messageHistory);
      setLastChatMessageError(null);
    }
  }, [activeChatId, chatsList]);

  // Manage daily query limit counters (using Local Storage with a date-bounded key for offline robustness)
  useEffect(() => {
    if (!currentUser) return;
    const todayStr = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
    const localKey = `aura_queries_used_${currentUser.uid}_${todayStr}`;
    const used = Number(localStorage.getItem(localKey) || "0");
    setDailyQueriesCount(used);
  }, [currentUser, currentScreen]);

  // Handle plan updates by saving directly to the Firestore User profile document
  const handleSelectPlan = async (planName: string) => {
    if (!currentUser) return;
    try {
      await updateDoc(doc(db, "users", currentUser.uid), {
        subscriptionTier: planName
      });
      setUserProfile((prev: any) => prev ? { ...prev, subscriptionTier: planName } : null);
      showToast(`Switched plan to ${planName}!`);

      // Record in activity audit logs
      const logRef = doc(collection(db, "activity_logs"));
      await setDoc(logRef, {
        id: logRef.id,
        userId: currentUser.uid,
        actionType: "BILLING_TIER_CHANGED",
        description: `User adjusted plan membership to ${planName} ($${planName === "Business" ? "99" : "29"}/mo).`,
        ipAddress: "127.0.0.1",
        deviceDetails: navigator.userAgent,
        timestamp: new Date().toISOString()
      });
    } catch (err: any) {
      console.error("Error updating subscription plan:", err);
      showToast("Billing synchronization failed.");
    }
  };

  // Phase 8: Subscription Coupon & Billing Action Handlers
  const handleApplyPromoCode = (code: string) => {
    const clean = code.trim().toUpperCase();
    if (clean === "AURAEARLY50") {
      setDiscountPercent(50);
      setActiveCoupon("AURAEARLY50");
      setPromoStatus({ status: "valid", message: "AURAEARLY50 Applied! 50% discount active." });
      showToast("50% discount code activated!");
    } else if (clean === "FREE100") {
      setDiscountPercent(100);
      setActiveCoupon("FREE100");
      setPromoStatus({ status: "valid", message: "FREE100 Applied! 100% discount active (Sandbox Tester)." });
      showToast("100% sandbox discount activated!");
    } else {
      setPromoStatus({ status: "invalid", message: "Promo code unrecognized or expired." });
      showToast("Invalid promo code.");
    }
  };

  const handleCancelSubscription = async () => {
    if (!currentUser) return;
    try {
      await updateDoc(doc(db, "users", currentUser.uid), {
        isSubscriptionCancelled: true
      });
      setIsSubscriptionCancelled(true);
      showToast("Auto-billing cancelled. Active tier remains until cycle end.");
    } catch (e) {
      showToast("Cancellation failed.");
    }
  };

  const handleRestorePurchases = async () => {
    if (!currentUser) return;
    try {
      setIsBillingProcessing(true);
      setTimeout(async () => {
        await updateDoc(doc(db, "users", currentUser.uid), {
          subscriptionTier: "Business",
          isSubscriptionCancelled: false,
          subscriptionExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        });
        setIsBillingProcessing(false);
        showToast("Purchases successfully restored from Google Play!");
      }, 1500);
    } catch (e) {
      setIsBillingProcessing(false);
      showToast("Restore failed.");
    }
  };

  const handleConfirmGooglePlayPurchase = async (plan: any) => {
    if (!currentUser) return;
    try {
      setIsBillingProcessing(true);
      
      const orderId = `GPA.${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`;
      const purchaseToken = Math.random().toString(36).substring(2, 17);
      const signature = btoa(orderId);

      const res = await fetch("/api/billing/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: currentUser.uid,
          purchaseToken,
          orderId,
          planId: plan.id,
          signature,
          developerPayload: activeCoupon || null
        })
      });

      const responseData = await res.json();
      if (res.ok && responseData.verified) {
        const originalPrice = billingCycle === "monthly" ? plan.priceMonthly : plan.priceYearly;
        const discountAmt = originalPrice * (discountPercent / 100);
        const finalPrice = originalPrice - discountAmt;
        const expiresAt = new Date(Date.now() + (billingCycle === "monthly" ? 30 : 365) * 24 * 60 * 60 * 1000).toISOString();

        await updateDoc(doc(db, "users", currentUser.uid), {
          subscriptionTier: plan.tier,
          billingPeriod: billingCycle.toUpperCase(),
          subscriptionExpiresAt: expiresAt,
          isTrialActive: false,
          billingPurchaseToken: purchaseToken,
          billingOrderId: orderId,
          isSubscriptionCancelled: false,
          activeCouponCode: activeCoupon || null,
          discountPercent: discountPercent,
          whatsappConnected: true
        });

        const invoiceRef = doc(collection(db, "invoices"));
        await setDoc(invoiceRef, {
          id: invoiceRef.id,
          userId: currentUser.uid,
          invoiceNumber: `INV-2026-${Math.floor(100000 + Math.random() * 900000)}`,
          amount: finalPrice,
          date: new Date().toISOString(),
          status: "Paid",
          planName: plan.name,
          billingPeriod: billingCycle === "monthly" ? "Monthly" : "Yearly",
          pdfUrl: `https://aura.studio/invoices/${invoiceRef.id}.pdf`
        });

        const logRef = doc(collection(db, "activity_logs"));
        await setDoc(logRef, {
          id: logRef.id,
          userId: currentUser.uid,
          actionType: "SUBSCRIPTION_PURCHASE_SUCCESS",
          description: `Google Play Billing completed: User upgraded to ${plan.name} (${billingCycle}). Transaction ID: ${orderId}`,
          ipAddress: "127.0.0.1",
          deviceDetails: navigator.userAgent,
          timestamp: new Date().toISOString()
        });

        showToast(`Upgraded to ${plan.name}! Premium tools unlocked.`);
      } else {
        showToast("Cryptographic purchase verification failed.");
      }
      setIsBillingProcessing(false);
      setShowPlayBillingSheet(null);
    } catch (e) {
      console.error(e);
      showToast("Transaction failed.");
      setIsBillingProcessing(false);
      setShowPlayBillingSheet(null);
    }
  };

  // Trigger non-blocking, beautiful custom UI toast messages
  const showToast = (messageText: string) => {
    setToastMsg(messageText);
    setTimeout(() => {
      setToastMsg(null);
    }, 2500);
  };

  // ==========================================
  // PHASE 7: CRM & LEAD BUSINESS AUTOMATIONS
  // ==========================================
  
  const handleRunAiQualification = (leadId: string) => {
    const currentScore = aiScore[leadId] || 0;
    if (currentScore > 0) {
      showToast("Lead is already qualified!");
      return;
    }
    
    const randomScore = Math.floor(Math.random() * 35) + 60; // 60-95%
    const highPri = randomScore >= 75;
    
    setAiScore(prev => ({ ...prev, [leadId]: randomScore }));
    setAiHighPriority(prev => ({ ...prev, [leadId]: highPri }));
    setAiSummary(prev => ({
      ...prev,
      [leadId]: `Highly qualified account evaluated by Gemini. Lead has high interest in Aura's real-time custom workflow automation with an approved pilot budget.`
    }));
    setAiNextAction(prev => ({
      ...prev,
      [leadId]: `Schedule a tailored sandbox setup session to demonstrate CRM offline capabilities and trigger outbound campaign logs.`
    }));
    
    showToast(`AI qualification completed! Score: ${randomScore}%`);
  };

  const handleGenerateSalesEmail = (leadName: string, company: string) => {
    const text = `Subject: Enhancing ${company}'s sales conversions with Aura AI\n\nDear ${leadName},\n\nI was reviewing your business needs at ${company} and wanted to offer you a personalized walkthrough of Aura's smart voice agent integration. Based on our latest benchmark data, companies using our real-time CRM platform have achieved a 96% retention increase during outbound demo phases.\n\nAre you available for a brief meeting this week?\n\nBest regards,\nAura CRM Automation Copilot`;
    setGeneratedEmail(text);
    showToast("Sales Email copy drafted!");
  };

  const handleGenerateWhatsApp = (leadName: string) => {
    const text = `Hi ${leadName}! 👋 This is Aura AI. I noticed your interest in our business pipeline automations. To help you evaluate, we can provision a trial sandbox for your team today. Let me know if you would like me to send over the access credentials!`;
    setGeneratedWhatsApp(text);
    showToast("WhatsApp template drafted!");
  };

  const handleAddTask = (leadId: string) => {
    if (!newTaskTitle.trim()) return;
    const task = {
      id: Math.random().toString(),
      title: newTaskTitle.trim(),
      priority: newTaskPriority,
      completed: false
    };
    setLeadTasks(prev => ({
      ...prev,
      [leadId]: [...(prev[leadId] || []), task]
    }));
    setNewTaskTitle("");
    showToast("Follow-up task registered!");
  };

  const handleToggleTask = (leadId: string, taskId: string) => {
    setLeadTasks(prev => ({
      ...prev,
      [leadId]: (prev[leadId] || []).map(t => t.id === taskId ? { ...t, completed: !t.completed } : t)
    }));
    showToast("Task updated!");
  };

  const handleScheduleMeeting = (leadId: string) => {
    if (!newMtgTitle.trim()) return;
    const mtg = {
      id: Math.random().toString(),
      title: newMtgTitle.trim(),
      dateTime: new Date(Date.now() + 86400000).toLocaleString(),
      location: newMtgLocation.trim() || "Google Meet Link"
    };
    setLeadMeetings(prev => ({
      ...prev,
      [leadId]: [...(prev[leadId] || []), mtg]
    }));
    setNewMtgTitle("");
    setNewMtgLocation("");
    showToast("Meeting reserved in calendar!");
  };

  const handleAddNote = (leadId: string) => {
    if (!newNoteText.trim()) return;
    const note = {
      id: Math.random().toString(),
      content: newNoteText.trim(),
      type: "Note",
      timestamp: new Date().toLocaleTimeString()
    };
    setLeadNotes(prev => ({
      ...prev,
      [leadId]: [...(prev[leadId] || []), note]
    }));
    setNewNoteText("");
    showToast("Activity note logged!");
  };

  const handleImportCsv = () => {
    showToast("Successfully imported 3 campaigns leads from CSV!");
  };

  // Copy textual chat dialogue log to clipboard
  const handleCopyChatHistory = () => {
    if (chatMessages.length === 0) return;
    const formattedText = chatMessages
      .map((m) => `[${m.role === "user" ? "USER" : "AURA AI"}]: ${m.content}`)
      .join("\n\n");
    navigator.clipboard.writeText(formattedText);
    showToast("Chat transcript copied!");
  };

  // Generate and copy a simulation share URL to clipboard
  const handleShareChat = () => {
    if (!activeChatId) {
      showToast("Send a message first to generate a share link!");
      return;
    }
    const fakeShareUrl = `${window.location.origin}/share/chat/${activeChatId}`;
    navigator.clipboard.writeText(fakeShareUrl);
    showToast("Shareable link copied to clipboard!");
  };

  // Update a chat session's title in Firestore
  const handleRenameChat = async (chatId: string, newTitleString: string) => {
    if (!newTitleString.trim()) return;
    try {
      await updateDoc(doc(db, "ai_chats", chatId), {
        title: newTitleString.trim()
      });
      setIsRenamingChatId(null);
      showToast("Topic title renamed.");
    } catch (err: any) {
      console.error("Rename chat error:", err);
      showToast("Rename failed.");
    }
  };

  // Delete a chat session from Firestore
  const handleDeleteChat = async (chatId: string) => {
    try {
      await deleteDoc(doc(db, "ai_chats", chatId));
      if (activeChatId === chatId) {
        setActiveChatId(null);
      }
      showToast("Conversation deleted.");
    } catch (err: any) {
      console.error("Delete chat error:", err);
      showToast("Failed to delete.");
    }
  };

  // Select attached file inside mobile and convert to Base64 data-url
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      showToast("Only image attachments are supported.");
      return;
    }

    setAttachedImageMime(file.type);
    const reader = new FileReader();
    reader.onloadend = () => {
      setAttachedImage(reader.result as string);
      showToast("Image attached! Ready to send.");
    };
    reader.readAsDataURL(file);
  };

  // Initialize dictation / speech-to-text recording with robust fallbacks
  const startVoiceInput = () => {
    if (voiceRecordingState !== "idle") return;
    setVoiceRecordingState("recording");

    const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognitionAPI) {
      try {
        const recog = new SpeechRecognitionAPI();
        recog.continuous = false;
        recog.interimResults = false;
        recog.lang = "en-US";

        recog.onresult = (event: any) => {
          const spokenText = event.results[0][0].transcript;
          if (spokenText) {
            setChatInput(spokenText);
            showToast("Voice transcribed successfully!");
          }
          setVoiceRecordingState("idle");
        };

        recog.onerror = (err: any) => {
          console.warn("Native speech failed (blocked in frame), invoking realistic fallback:", err);
          triggerVoiceSimulationFallback();
        };

        recog.onend = () => {
          if (voiceRecordingState === "recording") {
            triggerVoiceSimulationFallback();
          }
        };

        recog.start();

        // Safe timeout block
        setTimeout(() => {
          try { recog.stop(); } catch(e){}
        }, 4000);

      } catch (err) {
        triggerVoiceSimulationFallback();
      }
    } else {
      triggerVoiceSimulationFallback();
    }
  };

  // Simulates transcribing vocal CRM instructions
  const triggerVoiceSimulationFallback = () => {
    setVoiceRecordingState("processing");
    const spokenPrompts = [
      "Aura, draft a professional outreach email to Sarah Jenkins offering her a 10% demo discount.",
      "Summarize my hot real estate leads and generate a follow-up checklist for today.",
      "Write a friendly follow-up WhatsApp message templates for Marcus Vance.",
      "Analyze our sales conversion parameters and outline three key optimization recommendations."
    ];
    const pickedPrompt = spokenPrompts[Math.floor(Math.random() * spokenPrompts.length)];

    setTimeout(() => {
      setChatInput(pickedPrompt);
      setVoiceRecordingState("idle");
      showToast("Simulated voice dictated.");
    }, 1800);
  };

  // Custom-crafted visual Markdown and syntax-colored Kotlin code rendering
  const renderMarkdown = (textRaw: string) => {
    if (!textRaw) return null;

    // Split text into code blocks and normal paragraphs
    const fragments = textRaw.split(/(```[\s\S]*?```)/g);

    return fragments.map((fragment, fragIdx) => {
      if (fragment.startsWith("```")) {
        const match = fragment.match(/```(\w*)\n([\s\S]*?)```/);
        const language = match ? match[1] : "code";
        const codeText = match ? match[2] : fragment.slice(3, -3);

        return (
          <div key={fragIdx} className="my-2.5 rounded-xl border border-slate-700 bg-slate-900 overflow-hidden font-mono text-[9px] text-slate-200 shadow-sm text-left">
            <div className="flex justify-between items-center px-3 py-1.5 bg-slate-800 border-b border-slate-700 text-[8px] font-bold text-slate-400 uppercase select-none">
              <span>{language || "code"}</span>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(codeText.trim());
                  showToast("Code copied!");
                }}
                className="hover:text-white flex items-center space-x-1 font-sans transition-colors cursor-pointer text-slate-400"
              >
                <Copy className="h-2.5 w-2.5" />
                <span>Copy</span>
              </button>
            </div>
            <pre className="p-3 overflow-x-auto whitespace-pre-wrap leading-relaxed select-text font-mono">{codeText.trim()}</pre>
          </div>
        );
      }

      // Format line-breaks and inline styles
      const segments = fragment.split("\n");
      return (
        <div key={fragIdx} className="space-y-1.5 text-left font-sans">
          {segments.map((segment, segIdx) => {
            const trimmed = segment.trim();
            if (trimmed === "") {
              return <div key={segIdx} className="h-1.5" />;
            }

            // Headers formatting
            if (segment.startsWith("### ")) {
              return <h4 key={segIdx} className="text-[11px] font-extrabold text-slate-900 mt-2 mb-1 leading-tight">{segment.slice(4)}</h4>;
            }
            if (segment.startsWith("## ")) {
              return <h3 key={segIdx} className="text-[12px] font-black text-indigo-950 mt-2.5 mb-1 leading-tight">{segment.slice(3)}</h3>;
            }
            if (segment.startsWith("# ")) {
              return <h2 key={segIdx} className="text-[13px] font-black text-indigo-600 mt-3 mb-1.5 leading-snug">{segment.slice(2)}</h2>;
            }

            // Unordered list formatting
            if (segment.startsWith("* ") || segment.startsWith("- ") || segment.startsWith("• ")) {
              const cleanedText = segment.replace(/^[-*•]\s+/, "");
              return (
                <div key={segIdx} className="flex items-start pl-1 space-x-1.5 text-slate-700 leading-normal text-[11px]">
                  <span className="text-indigo-500 mt-0.5 select-none font-bold">•</span>
                  <span>{formatInlineMarkdown(cleanedText)}</span>
                </div>
              );
            }

            return <p key={segIdx} className="text-[11px] leading-relaxed text-slate-700 font-sans">{formatInlineMarkdown(segment)}</p>;
          })}
        </div>
      );
    });
  };

  // Formats inline bold text
  const formatInlineMarkdown = (lineText: string) => {
    const boldPattern = /\*\*([\s\S]+?)\*\*/g;
    const items = [];
    let lastPos = 0;
    let matchObj;

    while ((matchObj = boldPattern.exec(lineText)) !== null) {
      if (matchObj.index > lastPos) {
        items.push(lineText.substring(lastPos, matchObj.index));
      }
      items.push(<strong key={matchObj.index} className="font-extrabold text-slate-900 select-text">{matchObj[1]}</strong>);
      lastPos = boldPattern.lastIndex;
    }

    if (lastPos < lineText.length) {
      items.push(lineText.substring(lastPos));
    }

    return items.length > 0 ? items : lineText;
  };

  // Secure full-stack Gemini SSE response stream and real-time Firestore sync
  const handleSendChatMessage = async (e: React.FormEvent, retryPrompt?: string) => {
    if (e) e.preventDefault();

    const textToSubmit = retryPrompt !== undefined ? retryPrompt : chatInput;
    if (!textToSubmit.trim() || isChatLoading) return;

    // Check internet connectivity state
    if (!isOnline) {
      setLastChatMessageError("Network offline. Aura AI requires an active internet connection to synthesize responses.");
      return;
    }

    // Check daily queries budget for Starter/Free tier (Pro, Business, Enterprise have unlimited queries)
    const isSaaSPremium = userProfile?.subscriptionTier === "Pro" || userProfile?.subscriptionTier === "Business" || userProfile?.subscriptionTier === "Enterprise" || userProfile?.subscriptionTier === "Starter";
    if (!isSaaSPremium && dailyQueriesCount >= 5) {
      setLastChatMessageError("Daily Free Tier Limit Reached (5/5 queries used). Upgrade to Pro, Business, or Enterprise for unlimited premium AI chat queries!");
      return;
    }

    setLastChatMessageError(null);
    setChatInput("");
    setIsChatLoading(true);

    const activeImageBase64 = attachedImage;
    const activeImageMimeType = attachedImageMime;

    // Clear file attachment states
    setAttachedImage(null);
    setAttachedImageMime(null);

    // Prepare user message block (supporting visual image metadata)
    const userMsg: Message = {
      role: "user" as const,
      content: textToSubmit,
      ...(activeImageBase64 ? { image: activeImageBase64 } : {})
    };

    const updatedUserHistory = [...chatMessages, userMsg];
    setChatMessages(updatedUserHistory);

    // Insert placeholders for streaming content
    let accumulatedText = "";
    const loadingStateHistory = [...updatedUserHistory, { role: "assistant" as const, content: "" }];
    setChatMessages(loadingStateHistory);

    try {
      // Stream chunks word-by-word via secure backend proxy
      const response = await fetch("/api/assistant/chat/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: textToSubmit,
          history: chatMessages.filter(m => m.content && !m.content.startsWith("⚠️")),
          image: activeImageBase64 ? { data: activeImageBase64.split(",")[1] || activeImageBase64, mimeType: activeImageMimeType } : null
        })
      });

      if (!response.ok) {
        throw new Error(`API returned network error code ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error("Stream body reader is unsupported in this browser environment.");

      const decoder = new TextDecoder("utf-8");
      let streamFinished = false;
      let promptTokensCount = 0;
      let candidatesTokensCount = 0;

      while (!streamFinished) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunkText = decoder.decode(value);
        const chunkLines = chunkText.split("\n");

        for (const line of chunkLines) {
          if (line.startsWith("data: ")) {
            const dataString = line.slice(6).trim();
            if (dataString === "[DONE]") {
              streamFinished = true;
              break;
            }
            try {
              const dataObj = JSON.parse(dataString);
              if (dataObj.error) {
                throw new Error(dataObj.error);
              }
              if (dataObj.text) {
                accumulatedText += dataObj.text;
                setChatMessages([...updatedUserHistory, { role: "assistant" as const, content: accumulatedText }]);
              }
              if (dataObj.done) {
                promptTokensCount = dataObj.promptTokens || 0;
                candidatesTokensCount = dataObj.candidatesTokens || 0;
                setTokenUsageMetrics({ prompt: promptTokensCount, candidates: candidatesTokensCount });
              }
            } catch (err) {
              // Ignore split chunk parsing errors
            }
          }
        }
      }

      // Update local storage limits for Free plan
      if (!isSaaSPremium && currentUser) {
        const todayStr = new Date().toISOString().split("T")[0];
        const localKey = `aura_queries_used_${currentUser.uid}_${todayStr}`;
        const newCountValue = dailyQueriesCount + 1;
        localStorage.setItem(localKey, String(newCountValue));
        setDailyQueriesCount(newCountValue);
      }

      // Write-through synchronization back to Firebase Firestore
      if (currentUser) {
        const timestampEpoch = new Date().toISOString();
        const synchronizedHistory = [...updatedUserHistory, { role: "assistant" as const, content: accumulatedText }];
        let activeChatSessionId = activeChatId;

        if (!activeChatSessionId) {
          // New conversation: request the title generator API to summarize a clean title
          let generatedTitleSummary = "New CRM Task";
          try {
            const titleRes = await fetch("/api/assistant/chat/title", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ message: textToSubmit })
            });
            const titleData = await titleRes.json();
            if (titleData.title) generatedTitleSummary = titleData.title;
          } catch (titleErr) {
            console.error("Failed to generate title summary:", titleErr);
          }

          const chatDocRef = doc(collection(db, "ai_chats"));
          const chatDocPayload = {
            id: chatDocRef.id,
            userId: currentUser.uid,
            title: generatedTitleSummary,
            leadId: selectedLead?.id || "",
            agentId: "aura-core",
            messageHistory: synchronizedHistory,
            status: "active",
            sentimentScore: 0.95,
            lastMessageTime: timestampEpoch,
            createdAt: timestampEpoch,
            promptTokensUsed: promptTokensCount,
            candidatesTokensUsed: candidatesTokensCount
          };

          await setDoc(chatDocRef, chatDocPayload);
          setActiveChatId(chatDocRef.id);
        } else {
          // Update existing conversation room history
          await updateDoc(doc(db, "ai_chats", activeChatSessionId), {
            messageHistory: synchronizedHistory,
            lastMessageTime: timestampEpoch,
            promptTokensUsed: increment(promptTokensCount),
            candidatesTokensUsed: increment(candidatesTokensCount)
          });
        }
      }

    } catch (err: any) {
      console.error("AI Chat processing error:", err);
      setLastChatMessageError(err.message || "Communication with Gemini backend failed. Please confirm process.env.GEMINI_API_KEY.");
      // Rollback loading animation on failure, preserving client transcript
      setChatMessages(updatedUserHistory);
    } finally {
      setIsChatLoading(false);
    }
  };

  // Scroll chat messages to bottom smoothly
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, currentScreen, isChatLoading]);

  // CRM Lead Action: Delete Lead
  const handleDeleteLead = async (leadId: string) => {
    if (!currentUser) return;
    try {
      await deleteDoc(doc(db, "leads", leadId));
      setSelectedLead(null);
      changeScreen("dashboard");

      // Log action in activity_logs
      const logRef = doc(collection(db, "activity_logs"));
      await setDoc(logRef, {
        id: logRef.id,
        userId: currentUser.uid,
        actionType: "LEAD_DELETE",
        description: `Deleted lead document ID: ${leadId}.`,
        ipAddress: "127.0.0.1",
        deviceDetails: navigator.userAgent,
        timestamp: new Date().toISOString()
      });
    } catch (err: any) {
      console.error("Delete lead error:", err);
      setAuthError("Failed to delete lead: " + err.message);
    }
  };

  // CRM Lead Action: Toggle status (Hot -> Warm -> Cold -> Hot)
  const handleUpdateLeadStatus = async (leadId: string, currentStatus: "Hot" | "Warm" | "Cold") => {
    if (!currentUser) return;
    const nextStatusMap: Record<string, "Hot" | "Warm" | "Cold"> = {
      "Hot": "Warm",
      "Warm": "Cold",
      "Cold": "Hot"
    };
    const newStatus = nextStatusMap[currentStatus] || "Hot";
    try {
      await updateDoc(doc(db, "leads", leadId), { status: newStatus });
      setSelectedLead(prev => prev ? { ...prev, status: newStatus } : null);

      // Log action in activity_logs
      const logRef = doc(collection(db, "activity_logs"));
      await setDoc(logRef, {
        id: logRef.id,
        userId: currentUser.uid,
        actionType: "LEAD_UPDATE",
        description: `Updated status of lead ${leadId} to ${newStatus}.`,
        ipAddress: "127.0.0.1",
        deviceDetails: navigator.userAgent,
        timestamp: new Date().toISOString()
      });
    } catch (err: any) {
      console.error("Update lead status error:", err);
    }
  };

  // CRM Lead Action: Save New Lead
  const handleSaveNewLead = async () => {
    if (!currentUser) return;
    if (!newLeadName.trim() || !newLeadBusiness.trim()) {
      setAuthError("Name and Company cannot be empty!");
      return;
    }

    // Enforce CRM leads limits for Free tier (Pro, Business, Enterprise have unlimited leads)
    const isSaaSPremium = userProfile?.subscriptionTier === "Pro" || userProfile?.subscriptionTier === "Business" || userProfile?.subscriptionTier === "Enterprise" || userProfile?.subscriptionTier === "Starter";
    if (!isSaaSPremium && leads.length >= 3) {
      setAuthError("CRM Record Limit Reached (3/3). Please upgrade to Pro, Business, or Enterprise to manage unlimited leads!");
      showToast("Upgrade required to save unlimited leads.");
      return;
    }

    try {
      const docRef = doc(collection(db, "leads"));
      const leadData: Lead = {
        id: docRef.id,
        name: newLeadName,
        business: newLeadBusiness,
        email: newLeadEmail || "no-email@company.com",
        phone: newLeadPhone || "+1 (555) 000-0000",
        value: Number(newLeadValue) || 0,
        status: newLeadStatus,
        source: newLeadSource || "WhatsApp",
        lastContact: "Just Now",
        notes: newLeadNotes || "Manual CRM entry.",
        automatedAction: "WhatsApp follow-up scheduled automatically."
      };

      await setDoc(docRef, {
        ...leadData,
        ownerId: currentUser.uid,
        createdAt: new Date().toISOString()
      });

      // Create activity log
      const logRef = doc(collection(db, "activity_logs"));
      await setDoc(logRef, {
        id: logRef.id,
        userId: currentUser.uid,
        actionType: "LEAD_CREATE",
        description: `Created new lead: ${newLeadName} for ${newLeadBusiness}.`,
        ipAddress: "127.0.0.1",
        deviceDetails: navigator.userAgent,
        timestamp: new Date().toISOString()
      });

      // Reset form fields
      setNewLeadName("");
      setNewLeadBusiness("");
      setNewLeadEmail("");
      setNewLeadPhone("");
      setNewLeadValue("");
      setNewLeadStatus("Hot");
      setNewLeadSource("WhatsApp");
      setNewLeadNotes("");

      changeScreen("dashboard");
    } catch (err: any) {
      console.error("Save lead error:", err);
      setAuthError("Failed to save lead: " + err.message);
    }
  };

  // Auth Action: Google Sign In
  const handleGoogleSignIn = async () => {
    setIsAuthLoading(true);
    setAuthError("");
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      setIsAuthLoading(false);
      changeScreen("dashboard");
    } catch (err: any) {
      console.warn("Google Sign-In popup blocked or failed, using iframe proxy login:", err);
      try {
        await signInWithEmailAndPassword(auth, "google_agent@company.com", "GoogleProxyPass123!");
        setIsAuthLoading(false);
        changeScreen("dashboard");
      } catch (signinErr: any) {
        try {
          await createUserWithEmailAndPassword(auth, "google_agent@company.com", "GoogleProxyPass123!");
          const user = auth.currentUser;
          if (user) {
            const userRef = doc(db, "users", user.uid);
            await setDoc(userRef, {
              uid: user.uid,
              email: user.email || "",
              displayName: "Google Founder Agent",
              subscriptionTier: "Business",
              whatsappConnected: true,
              createdAt: new Date().toISOString()
            });
            await seedUserLeads(user.uid);
          }
          setIsAuthLoading(false);
          changeScreen("dashboard");
        } catch (signupErr: any) {
          setIsAuthLoading(false);
          setAuthError("Google Sign-In failed in secure sandbox. Please sign in or register with email.");
        }
      }
    }
  };

  // Auth Action: Corporate Email Sign In
  const handleEmailLogin = async () => {
    if (!authEmail.trim() || !authPassword.trim()) {
      setAuthError("Credentials cannot be left empty. Please provide a valid email and password.");
      return;
    }
    if (!authEmail.includes("@")) {
      setAuthError("Malformed email address structure. Please provide a valid domain name.");
      return;
    }
    setAuthError("");
    setIsAuthLoading(true);
    try {
      await signInWithEmailAndPassword(auth, authEmail, authPassword);
      setIsAuthLoading(false);
      changeScreen("dashboard");
    } catch (err: any) {
      setIsAuthLoading(false);
      console.error("Firebase Sign In Error:", err);
      if (err.code === "auth/user-not-found" || err.code === "auth/wrong-password" || err.code === "auth/invalid-credential") {
        setAuthError("Invalid credentials. Please verify your email and password.");
      } else {
        setAuthError(err.message || "An error occurred during authentication.");
      }
    }
  };

  // Auth Action: Register / Sign Up
  const handleSignUp = async () => {
    if (!authName.trim()) {
      setAuthError("Lead name is required to personalize your CRM space.");
      return;
    }
    if (!authEmail.trim() || !authPassword.trim()) {
      setAuthError("Credentials cannot be left empty.");
      return;
    }
    if (authPassword.length < 6) {
      setAuthError("Password must be at least 6 characters for Firebase security compliance.");
      return;
    }

    setAuthError("");
    setIsAuthLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, authEmail, authPassword);
      const user = userCredential.user;

      // Create profiles
      const userRef = doc(db, "users", user.uid);
      const profileData = {
        uid: user.uid,
        email: user.email || "",
        displayName: authName,
        subscriptionTier: "Business",
        whatsappConnected: false,
        createdAt: new Date().toISOString()
      };
      await setDoc(userRef, profileData);

      // Create settings
      await setDoc(doc(db, "settings", user.uid), {
        userId: user.uid,
        pushEnabled: true,
        whatsappIntegrationEnabled: false,
        autoResponseEnabled: true,
        aiMaxTokens: 2000,
        timezone: "UTC",
        updatedAt: new Date().toISOString()
      });

      // Create initial subscription
      const subRef = doc(collection(db, "subscriptions"));
      await setDoc(subRef, {
        id: subRef.id,
        userId: user.uid,
        planType: "Business",
        status: "active",
        price: 99,
        billingCycle: "monthly",
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      });

      // Create initial analytics
      await setDoc(doc(db, "analytics", user.uid), {
        id: user.uid,
        userId: user.uid,
        date: new Date().toISOString().split('T')[0],
        totalLeads: 4,
        activeChats: 2,
        voiceCallsDuration: 45,
        conversionRate: 75,
        revenueEstimates: 98000
      });

      // Create activity log
      const logRef = doc(collection(db, "activity_logs"));
      await setDoc(logRef, {
        id: logRef.id,
        userId: user.uid,
        actionType: "USER_SIGNUP",
        description: `Provisioned new Aura AI command center account for ${authName}.`,
        ipAddress: "127.0.0.1",
        deviceDetails: navigator.userAgent,
        timestamp: new Date().toISOString()
      });

      // Seed default leads
      await seedUserLeads(user.uid);

      setIsAuthLoading(false);
      navigateAuthTo("otp");
    } catch (err: any) {
      setIsAuthLoading(false);
      console.error("Firebase Sign Up Error:", err);
      setAuthError(err.message || "An error occurred during provisioning.");
    }
  };

  // Auth Action: Reset Password
  const handlePasswordReset = async () => {
    if (!authEmail.trim()) {
      setAuthError("Recovery email is required.");
      return;
    }
    setAuthError("");
    setAuthSuccessMsg("");
    setIsAuthLoading(true);
    try {
      await sendPasswordResetEmail(auth, authEmail);
      setIsAuthLoading(false);
      setAuthSuccessMsg("Firebase reset email dispatched successfully! Please check your inbox.");
    } catch (err: any) {
      setIsAuthLoading(false);
      console.error("Firebase Password Reset Error:", err);
      setAuthError(err.message || "Failed to dispatch password recovery email.");
    }
  };

  const filteredLeads = leads.filter(l => 
    l.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    l.business.toLowerCase().includes(searchQuery.toLowerCase()) ||
    l.status.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div id="phone-container" className="relative mx-auto flex h-[760px] w-full max-w-[360px] flex-col rounded-[50px] border-[12px] border-slate-800 bg-slate-100 p-3 shadow-2xl ring-4 ring-slate-200/50">
      
      {/* Speaker and Camera island notched area */}
      <div className="absolute top-0 left-1/2 z-50 h-5 w-32 -translate-x-1/2 rounded-b-2xl bg-slate-800 flex items-center justify-center">
        <div className="h-1.5 w-12 rounded-full bg-slate-900 mr-2"></div>
        <div className="h-2 w-2 rounded-full bg-slate-900"></div>
      </div>

      {/* Top Status Bar */}
      <div className="flex h-7 w-full items-center justify-between px-5 text-[11px] font-semibold text-slate-600 select-none mt-1">
        <span>21:44</span>
        <div className="flex items-center space-x-1.5">
          <Wifi className="h-3.5 w-3.5 text-indigo-600" />
          <span className="text-[9px] px-1.5 bg-indigo-50 text-indigo-700 rounded border border-indigo-200 font-mono font-bold">5G LTE</span>
          <Battery className="h-3.5 w-3.5 text-slate-600" />
        </div>
      </div>

      {/* Main Screen Area with Screen transitions */}
      <div className="relative flex-1 w-full overflow-hidden rounded-[38px] bg-slate-50 flex flex-col text-slate-800 font-sans">
        <AnimatePresence mode="wait">
          
          {/* SCREEN: LOGIN & AUTH SUB-SCREENS */}
          {currentScreen === "login" && (
            <motion.div 
              key="login"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex flex-col h-full bg-slate-50 text-slate-800"
            >
              {/* SUBSCREEN: MAIN AUTHENTICATION CHANNELS */}
              {authSubScreen === "loginMain" && (
                <div className="flex flex-col items-center justify-center h-full p-6 text-center select-none">
                  <div className="p-4 rounded-3xl bg-gradient-to-tr from-indigo-600 to-violet-500 shadow-md mb-6">
                    <TrendingUp className="h-12 w-12 text-white animate-pulse" />
                  </div>
                  <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 mb-2">AURA AI</h1>
                  <p className="text-sm text-slate-500 mb-8 max-w-[240px]">World-Class Business Automation Mobile Command Center</p>
                  
                  <button 
                    id="btn-login-google"
                    onClick={handleGoogleSignIn}
                    disabled={isAuthLoading}
                    className="flex w-full items-center justify-center space-x-3 rounded-2xl bg-white text-slate-800 py-3.5 px-4 font-semibold hover:bg-slate-50 transition-colors shadow-xs text-sm border border-slate-200 disabled:opacity-75"
                  >
                    <svg className="h-5 w-5" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22c-.22-.67-.35-1.37-.35-2.09z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                    <span>Sign in with Google</span>
                  </button>

                  <button 
                    id="btn-login-email-portal"
                    onClick={() => navigateAuthTo("emailLogin")}
                    className="mt-4 flex w-full items-center justify-center space-x-2 py-3 px-4 rounded-2xl bg-indigo-50 border border-indigo-150 text-indigo-700 hover:bg-indigo-100 transition-colors text-xs font-bold"
                  >
                    <Mail className="h-4 w-4" />
                    <span>Sign in with Corporate Email</span>
                  </button>
                </div>
              )}

              {/* SUBSCREEN: CORPORATE EMAIL LOGIN */}
              {authSubScreen === "emailLogin" && (
                <div className="flex flex-col h-full justify-between p-5 select-text text-left">
                  <div className="space-y-4">
                    {/* Top back button */}
                    <button onClick={() => navigateAuthTo("loginMain")} className="p-1 hover:bg-slate-200/50 rounded-xl text-slate-500 hover:text-slate-800 transition-colors w-fit -ml-2">
                      <ChevronLeft className="h-5 w-5" />
                    </button>

                    <div className="space-y-1">
                      <h2 className="text-xl font-black text-slate-900">Access Aura CRM</h2>
                      <p className="text-xs text-slate-500">Provide registered corporate credentials</p>
                    </div>

                    {/* Form Fields */}
                    <div className="space-y-3 pt-2">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Corporate Email</label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                          <input 
                            id="input-auth-email"
                            type="email"
                            placeholder="agent@company.com"
                            value={authEmail}
                            onChange={(e) => setAuthEmail(e.target.value)}
                            className="w-full pl-9 pr-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs placeholder-slate-400 focus:outline-none focus:border-indigo-500 text-slate-800"
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between items-center mb-1.5">
                          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Access Key</label>
                          <button 
                            onClick={() => navigateAuthTo("forgotPassword")}
                            className="text-[10px] font-bold text-indigo-600 hover:underline"
                          >
                            Forgot Access?
                          </button>
                        </div>
                        <div className="relative">
                          <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                          <input 
                            id="input-auth-password"
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••••••"
                            value={authPassword}
                            onChange={(e) => setAuthPassword(e.target.value)}
                            className="w-full pl-9 pr-9 py-2.5 bg-white border border-slate-200 rounded-xl text-xs placeholder-slate-400 focus:outline-none focus:border-indigo-500 text-slate-800"
                          />
                          <button 
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                          >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>

                      {/* Remember Me Option */}
                      <div className="flex items-center space-x-2 pt-1 select-none">
                        <input 
                          type="checkbox" 
                          id="chk-remember-me"
                          checked={rememberMe}
                          onChange={(e) => setRememberMe(e.target.checked)}
                          className="h-4 w-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500" 
                        />
                        <label htmlFor="chk-remember-me" className="text-xs text-slate-500 cursor-pointer">Remember this console</label>
                      </div>
                    </div>

                    {/* Error Display */}
                    {authError && (
                      <div className="p-2.5 bg-red-50 border border-red-150 text-red-700 text-xs rounded-xl flex items-start space-x-2">
                        <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />
                        <span>{authError}</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-3.5 pt-4">
                    <button 
                      id="btn-auth-signin"
                      onClick={handleEmailLogin}
                      disabled={isAuthLoading}
                      className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-550 disabled:opacity-75 text-white font-bold text-xs flex items-center justify-center space-x-2 shadow-xs transition-colors"
                    >
                      {isAuthLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin text-white" />
                      ) : (
                        <span>Authenticate Credentials</span>
                      )}
                    </button>

                    <button 
                      onClick={() => navigateAuthTo("signUp")}
                      className="w-full text-center text-xs text-slate-500 hover:text-slate-800 font-medium transition-colors"
                    >
                      New Agency? <span className="text-indigo-600 font-bold underline">Register Here</span>
                    </button>
                  </div>
                </div>
              )}

              {/* SUBSCREEN: REGISTER ACCOUNT */}
              {authSubScreen === "signUp" && (
                <div className="flex flex-col h-full justify-between p-5 select-text text-left">
                  <div className="space-y-4">
                    {/* Top back button */}
                    <button onClick={() => navigateAuthTo("emailLogin")} className="p-1 hover:bg-slate-200/50 rounded-xl text-slate-500 hover:text-slate-800 transition-colors w-fit -ml-2">
                      <ChevronLeft className="h-5 w-5" />
                    </button>

                    <div className="space-y-1">
                      <h2 className="text-xl font-black text-slate-900">Provision Core</h2>
                      <p className="text-xs text-slate-500">Join the premier AI SaaS automation network</p>
                    </div>

                    {/* Form Fields */}
                    <div className="space-y-3 pt-1">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Agency Lead Name</label>
                        <div className="relative">
                          <User className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                          <input 
                            id="input-auth-signup-name"
                            type="text"
                            placeholder="John Doe"
                            value={authName}
                            onChange={(e) => setAuthName(e.target.value)}
                            className="w-full pl-9 pr-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs placeholder-slate-400 focus:outline-none focus:border-indigo-500 text-slate-800"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Corporate Email</label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                          <input 
                            id="input-auth-signup-email"
                            type="email"
                            placeholder="john@agency.com"
                            value={authEmail}
                            onChange={(e) => setAuthEmail(e.target.value)}
                            className="w-full pl-9 pr-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs placeholder-slate-400 focus:outline-none focus:border-indigo-500 text-slate-800"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Set Secure Password</label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                          <input 
                            id="input-auth-signup-password"
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••••••"
                            value={authPassword}
                            onChange={(e) => setAuthPassword(e.target.value)}
                            className="w-full pl-9 pr-9 py-2.5 bg-white border border-slate-200 rounded-xl text-xs placeholder-slate-400 focus:outline-none focus:border-indigo-500 text-slate-800"
                          />
                          <button 
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                          >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                        
                        {/* Real-time Password Strength Meter */}
                        {authPassword.length > 0 && (
                          <div className="mt-1.5 flex items-center justify-between text-[9px] font-bold">
                            <span className="text-slate-400 uppercase">Key Strength:</span>
                            {authPassword.length < 6 ? (
                              <span className="text-red-500 font-bold uppercase">Weak (Min 6 char)</span>
                            ) : authPassword.length >= 10 && /[0-9]/.test(authPassword) ? (
                              <span className="text-emerald-600 font-bold uppercase">Strong (Hilt & Firebase compliant)</span>
                            ) : (
                              <span className="text-amber-500 font-bold uppercase">Medium</span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Error Display */}
                    {authError && (
                      <div className="p-2.5 bg-red-50 border border-red-150 text-red-700 text-xs rounded-xl flex items-start space-x-2">
                        <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />
                        <span>{authError}</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-3 pt-4">
                    <button 
                      id="btn-auth-signup-submit"
                      onClick={handleSignUp}
                      disabled={isAuthLoading}
                      className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-550 disabled:opacity-75 text-white font-bold text-xs flex items-center justify-center space-x-2 shadow-xs transition-colors"
                    >
                      {isAuthLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin text-white" />
                      ) : (
                        <span>Provision New Account</span>
                      )}
                    </button>

                    <button 
                      onClick={() => navigateAuthTo("emailLogin")}
                      className="w-full text-center text-xs text-slate-500 hover:text-slate-800 font-medium transition-colors"
                    >
                      Already Registered? <span className="text-indigo-600 font-bold underline">Sign In Instead</span>
                    </button>
                  </div>
                </div>
              )}

              {/* SUBSCREEN: ACCESS RECOVERY */}
              {authSubScreen === "forgotPassword" && (
                <div className="flex flex-col h-full justify-between p-5 select-text text-left">
                  <div className="space-y-4">
                    {/* Top back button */}
                    <button onClick={() => navigateAuthTo("emailLogin")} className="p-1 hover:bg-slate-200/50 rounded-xl text-slate-500 hover:text-slate-800 transition-colors w-fit -ml-2">
                      <ChevronLeft className="h-5 w-5" />
                    </button>

                    <div className="space-y-1">
                      <h2 className="text-xl font-black text-slate-900">Access Recovery</h2>
                      <p className="text-xs text-slate-500">Retrieve access to your automation cloud</p>
                    </div>

                    {/* Form Fields */}
                    <div className="space-y-3 pt-2">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Registered Email</label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                          <input 
                            id="input-auth-forgot-email"
                            type="email"
                            placeholder="agent@company.com"
                            value={authEmail}
                            onChange={(e) => setAuthEmail(e.target.value)}
                            className="w-full pl-9 pr-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs placeholder-slate-400 focus:outline-none focus:border-indigo-500 text-slate-800"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Success Display */}
                    {authSuccessMsg && (
                      <div className="p-3 bg-emerald-50 border border-emerald-150 text-emerald-700 text-xs rounded-xl flex items-start space-x-2 leading-relaxed">
                        <CheckCircle className="h-4 w-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                        <span>{authSuccessMsg}</span>
                      </div>
                    )}

                    {/* Error Display */}
                    {authError && (
                      <div className="p-2.5 bg-red-50 border border-red-150 text-red-700 text-xs rounded-xl flex items-start space-x-2">
                        <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />
                        <span>{authError}</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-3.5 pt-4">
                    <button 
                      id="btn-auth-forgot-submit"
                      onClick={handlePasswordReset}
                      disabled={isAuthLoading}
                      className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-550 disabled:opacity-75 text-white font-bold text-xs flex items-center justify-center space-x-2 shadow-xs transition-colors"
                    >
                      {isAuthLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin text-white" />
                      ) : (
                        <span>Transmit Recovery Link</span>
                      )}
                    </button>

                    <button 
                      onClick={() => navigateAuthTo("emailLogin")}
                      className="w-full text-center text-xs text-slate-500 hover:text-slate-800 font-medium transition-colors"
                    >
                      Remember access? <span className="text-indigo-600 font-bold underline">Back to Login</span>
                    </button>
                  </div>
                </div>
              )}

              {/* SUBSCREEN: IDENTITY CHECK (OTP/EMAIL VERIFICATION SCREEN) */}
              {authSubScreen === "otp" && (
                <div className="flex flex-col h-full justify-between p-5 select-text text-left">
                  <div className="space-y-4">
                    {/* Top back button */}
                    <button onClick={() => navigateAuthTo("signUp")} className="p-1 hover:bg-slate-200/50 rounded-xl text-slate-500 hover:text-slate-800 transition-colors w-fit -ml-2">
                      <ChevronLeft className="h-5 w-5" />
                    </button>

                    <div className="space-y-1">
                      <h2 className="text-xl font-black text-slate-900">Identity Check</h2>
                      <p className="text-xs text-slate-500">An email dispatch code was sent to <span className="text-slate-800 font-semibold">{authEmail || "your inbox"}</span></p>
                    </div>

                    {/* Verification pin field */}
                    <div className="space-y-3 pt-2">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 text-center">6-Digit Verification PIN</label>
                        <input 
                          id="input-auth-otp"
                          type="text"
                          maxLength={6}
                          placeholder="AURA-8"
                          value={authOtpCode}
                          onChange={(e) => setAuthOtpCode(e.target.value.replace(/[^0-9A-Za-z]/g, ""))}
                          className="w-full py-3 bg-white border border-slate-200 rounded-2xl text-center text-lg font-mono tracking-widest placeholder-slate-300 focus:outline-none focus:border-indigo-500 text-slate-800"
                        />
                      </div>
                      
                      {/* Timer details */}
                      <div className="text-center text-[10px] text-slate-400 font-semibold">
                        Resend pin code in <span className="text-indigo-600 font-mono">0:45s</span>
                      </div>
                    </div>

                    {/* Error Display */}
                    {authError && (
                      <div className="p-2.5 bg-red-50 border border-red-150 text-red-700 text-xs rounded-xl flex items-start space-x-2">
                        <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />
                        <span>{authError}</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-3.5 pt-4">
                    <button 
                      id="btn-auth-otp-submit"
                      onClick={() => {
                        if (!authOtpCode.trim()) {
                          setAuthError("Please input the verification code sent to your inbox.");
                          return;
                        }
                        setAuthError("");
                        setIsAuthLoading(true);
                        setTimeout(() => {
                          setIsAuthLoading(false);
                          changeScreen("dashboard");
                        }, 1200);
                      }}
                      disabled={isAuthLoading}
                      className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-550 disabled:opacity-75 text-white font-bold text-xs flex items-center justify-center space-x-2 shadow-xs transition-colors"
                    >
                      {isAuthLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin text-white" />
                      ) : (
                        <span>Confirm & Launch CRM</span>
                      )}
                    </button>

                    <button 
                      onClick={() => {
                        setAuthSuccessMsg("New code dispatched!");
                        setTimeout(() => setAuthSuccessMsg(""), 3000);
                      }}
                      className="w-full text-center text-xs text-indigo-600 hover:text-indigo-800 font-bold underline transition-colors"
                    >
                      Transmit New PIN Code
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* SCREEN: CRM DASHBOARD */}
          {currentScreen === "dashboard" && (
            <motion.div 
              key="dashboard"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex flex-col h-full bg-slate-50"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-slate-200">
                <div className="flex items-center space-x-2">
                  <div className="h-8 w-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs">
                    {userProfile?.displayName ? userProfile.displayName.substring(0, 2).toUpperCase() : "AG"}
                  </div>
                  <div>
                    <h2 className="text-xs font-bold leading-none text-slate-800">{userProfile?.displayName || "Aura Agency"}</h2>
                    <span className="text-[9px] text-slate-500 font-mono">{userProfile?.subscriptionTier || "Business"} Account</span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button onClick={() => changeScreen("settings")} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-800 transition-colors">
                    <SettingsIcon className="h-4 w-4" />
                  </button>
                  <button 
                    onClick={async () => {
                      try {
                        await signOut(auth);
                        changeScreen("login");
                      } catch (err) {
                        console.error("Sign out error:", err);
                      }
                    }} 
                    className="px-2 py-1 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors text-[9px] font-bold"
                    title="Sign Out"
                  >
                    Logout
                  </button>
                </div>
              </div>

              {/* Automation Quick Launcher */}
              <div className="grid grid-cols-2 gap-2 p-3 bg-slate-50/80 border-b border-slate-200">
                <button 
                  id="btn-quick-voice"
                  onClick={() => changeScreen("voiceAgent")}
                  className="flex items-center justify-center space-x-2 p-2.5 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 transition-all font-semibold text-xs text-white shadow-xs"
                >
                  <Mic className="h-4 w-4 text-white" />
                  <span>AI Voice Agent</span>
                </button>
                <button 
                  id="btn-quick-chat"
                  onClick={() => changeScreen("chatAssistant")}
                  className="flex items-center justify-center space-x-2 p-2.5 rounded-xl bg-gradient-to-tr from-violet-600 to-violet-500 hover:from-violet-500 hover:to-violet-400 transition-all font-semibold text-xs text-white shadow-xs"
                >
                  <MessageSquare className="h-4 w-4 text-white" />
                  <span>AI Chat Engine</span>
                </button>
              </div>

              {/* Title & Pipeline Value */}
              <div className="px-4 py-3 flex justify-between items-center select-none">
                <div>
                  <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Total Pipeline</h3>
                  <p className="text-lg font-black text-indigo-600">
                    ${leads.reduce((sum, l) => sum + l.value, 0).toLocaleString()} 
                    <span className="text-[10px] text-emerald-600 font-normal font-mono ml-1.5">+12%</span>
                  </p>
                </div>
                <div className="flex items-center space-x-1.5">
                  <span className="text-[8px] px-2 py-0.5 bg-indigo-550 text-white rounded-full font-bold">AURA CRM PRO</span>
                  <button
                    id="btn-add-lead-screen"
                    onClick={() => changeScreen("addLead")}
                    className="p-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-550 transition-all shadow-xs"
                    title="Add New Lead"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {/* Advanced CRM Interactive Utilities (Role, CSV, View mode) */}
              <div className="px-3 pb-2.5 space-y-2 select-none">
                {/* Utility Line 1: Interactive Segmented Controller */}
                <div className="flex items-center space-x-2 bg-slate-100 p-1 rounded-xl">
                  <button
                    onClick={() => setCrmViewMode("list")}
                    className={`flex-1 py-1 rounded-lg text-[9px] font-bold transition-all ${crmViewMode === "list" ? "bg-white text-indigo-600 shadow-xs" : "text-slate-500 hover:text-slate-700"}`}
                  >
                    Standard List
                  </button>
                  <button
                    onClick={() => setCrmViewMode("kanban")}
                    className={`flex-1 py-1 rounded-lg text-[9px] font-bold transition-all ${crmViewMode === "kanban" ? "bg-white text-indigo-600 shadow-xs" : "text-slate-500 hover:text-slate-700"}`}
                  >
                    Pipeline Kanban
                  </button>
                </div>

                {/* Utility Line 2: Role Authorization Selector & CSV Import/Export */}
                <div className="flex items-center justify-between text-[9px] text-slate-500 pt-0.5">
                  <div className="flex items-center space-x-1 bg-white border border-slate-200 rounded-lg px-2 py-0.5">
                    <span className="font-mono text-[8px] font-bold">ROLE:</span>
                    <select
                      value={userRole}
                      onChange={(e) => {
                        const newRole = e.target.value as "Admin" | "Manager" | "Staff";
                        setUserRole(newRole);
                        showToast(`Switched active workspace permission to ${newRole}`);
                      }}
                      className="bg-transparent font-bold text-indigo-600 focus:outline-none cursor-pointer"
                    >
                      <option value="Admin">Admin (Full Access)</option>
                      <option value="Manager">Manager</option>
                      <option value="Staff">Staff</option>
                    </select>
                  </div>

                  <div className="flex space-x-1.5">
                    <button
                      onClick={handleImportCsv}
                      className="px-2 py-1 bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 hover:text-slate-800 rounded-lg transition-all font-bold"
                    >
                      📥 Import CSV
                    </button>
                    <button
                      onClick={() => {
                        const csvHeader = "Name,Business,Email,Phone,Value,Status\n";
                        const csvRows = leads.map(l => `"${l.name}","${l.business}","${l.email}","${l.phone}",${l.value},"${l.status}"`).join("\n");
                        navigator.clipboard.writeText(csvHeader + csvRows);
                        showToast("Campaign contacts exported to clipboard CSV!");
                      }}
                      className="px-2 py-1 bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 hover:text-slate-800 rounded-lg transition-all font-bold"
                    >
                      📤 Export CSV
                    </button>
                  </div>
                </div>
              </div>

              {/* Search Bar */}
              <div className="px-3 pb-2">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
                  <input 
                    type="text" 
                    placeholder="Search pipeline leads, company, notes..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs placeholder-slate-400 focus:outline-none focus:border-indigo-500 text-slate-800"
                  />
                </div>
              </div>

              {/* CRM View Body: List Mode vs Pipeline Kanban Board */}
              <div className="flex-1 overflow-y-auto px-3 space-y-2 pb-4">
                {crmViewMode === "list" ? (
                  // STANDARD LIST REPRESENTATION
                  filteredLeads.map((lead) => {
                    const leadScore = aiScore[lead.id] || 0;
                    const isHighPri = aiHighPriority[lead.id] || false;
                    return (
                      <div 
                        key={lead.id}
                        onClick={() => handleLeadClick(lead)}
                        className={`p-3 bg-white hover:bg-slate-50/50 border rounded-2xl cursor-pointer transition-all shadow-xs ${isHighPri ? "border-l-4 border-l-red-500 border-slate-200" : "border-slate-200/60"}`}
                      >
                        <div className="flex justify-between items-start mb-1">
                          <div className="flex items-center space-x-1.5">
                            <h4 className="font-extrabold text-xs text-slate-800 leading-tight">{lead.name}</h4>
                            {isHighPri && (
                              <span className="bg-red-100 text-red-700 text-[7px] px-1 rounded font-bold uppercase">High Priority</span>
                            )}
                          </div>
                          <span className={`text-[9px] px-1.5 py-0.5 rounded-md font-mono font-bold ${
                            lead.status === "Hot" ? "bg-red-50 text-red-600 border border-red-200" :
                            lead.status === "Warm" ? "bg-amber-50 text-amber-600 border border-amber-200" :
                            "bg-blue-50 text-blue-600 border border-blue-200"
                          }`}>{lead.status}</span>
                        </div>
                        <p className="text-[10px] text-slate-500 truncate mb-2 font-sans">{lead.business}</p>
                        <div className="flex justify-between items-center text-[9px] text-slate-400">
                          <span className="font-black text-indigo-600">${lead.value.toLocaleString()}</span>
                          <div className="flex items-center space-x-1.5">
                            {leadScore > 0 && (
                              <span className="text-[8.5px] font-mono font-bold text-indigo-600 flex items-center bg-indigo-50/70 px-1 rounded">
                                ⭐ {leadScore}% Fit
                              </span>
                            )}
                            <span>{lead.lastContact}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  // PIPELINE KANBAN BOARD VIEW
                  <div className="space-y-3 pt-1 text-left">
                    {(["Hot", "Warm", "Cold"] as const).map((column) => {
                      const columnLeads = filteredLeads.filter(l => l.status === column);
                      return (
                        <div key={column} className="bg-slate-100 p-2.5 rounded-xl border border-slate-200/60">
                          <div className="flex justify-between items-center mb-2 px-1 select-none">
                            <span className="text-[9px] font-black uppercase tracking-wider text-slate-600">{column} Pipeline</span>
                            <span className="text-[8px] font-mono bg-white px-1.5 py-0.5 rounded-md border border-slate-200 text-slate-500 font-bold">{columnLeads.length} deals</span>
                          </div>
                          <div className="space-y-1.5">
                            {columnLeads.length === 0 ? (
                              <p className="text-[8.5px] text-slate-400 italic text-center py-2 bg-white/50 rounded-lg">No leads in column.</p>
                            ) : (
                              columnLeads.map(l => (
                                <div
                                  key={l.id}
                                  onClick={() => handleLeadClick(l)}
                                  className="p-2 bg-white hover:bg-slate-50 border border-slate-150 rounded-lg shadow-2xs cursor-pointer text-left"
                                >
                                  <div className="flex justify-between items-center">
                                    <span className="text-[10px] font-bold text-slate-800">{l.name}</span>
                                    <span className="text-[9px] font-black text-indigo-600">${l.value.toLocaleString()}</span>
                                  </div>
                                  <p className="text-[8px] text-slate-500 font-sans truncate mt-0.5">{l.business}</p>
                                </div>
                              ))
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* SCREEN: LEAD DETAILS */}
          {currentScreen === "leadDetails" && selectedLead && (
            <motion.div 
              key="leadDetails"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex flex-col h-full bg-slate-50"
            >
              <div className="flex items-center px-3 py-3 bg-white border-b border-slate-200">
                <button onClick={() => changeScreen("dashboard")} className="p-1 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-800 transition-colors">
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <h2 className="ml-2 text-xs font-bold truncate text-slate-800">Lead: {selectedLead.name}</h2>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                <div className="p-3.5 bg-white border border-slate-200 rounded-2xl shadow-xs">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Business profile</span>
                    <div className="flex space-x-1.5 items-center">
                      <button 
                        onClick={() => handleUpdateLeadStatus(selectedLead.id, selectedLead.status)}
                        className={`text-[9px] px-2 py-0.5 rounded-md font-bold border font-mono transition-all hover:brightness-95 select-none ${
                          selectedLead.status === "Hot" ? "bg-red-50 text-red-600 border-red-200" :
                          selectedLead.status === "Warm" ? "bg-amber-50 text-amber-600 border-amber-200" :
                          "bg-blue-50 text-blue-600 border-blue-200"
                        }`}
                        title="Toggle Status (Hot -> Warm -> Cold)"
                      >
                        {selectedLead.status} 🔄
                      </button>
                      <button 
                        onClick={() => handleDeleteLead(selectedLead.id)}
                        className="p-1.5 hover:bg-red-50 rounded-lg text-red-500 transition-colors"
                        title="Delete Lead"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                  <h3 className="text-sm font-black text-slate-900">{selectedLead.name}</h3>
                  <p className="text-xs text-slate-500 font-mono mb-2">{selectedLead.business}</p>
                  <p className="text-sm font-extrabold text-indigo-600">${selectedLead.value.toLocaleString()}</p>
                </div>
                <div className="space-y-2">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Contact details</span>
                  <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-2 text-xs shadow-xs">
                    <p className="truncate text-slate-600">📧 <span className="font-mono text-slate-800 font-semibold">{selectedLead.email}</span></p>
                    <p className="truncate text-slate-600">📞 <span className="font-mono text-slate-800 font-semibold">{selectedLead.phone}</span></p>
                    <p className="text-[10px] text-slate-400 pt-1 border-t border-slate-100">Captured via: <span className="text-indigo-600 font-bold">{selectedLead.source}</span></p>
                  </div>
                </div>

                {/* 2. GEMINI AI AUTOMATION CENTER */}
                <div className="space-y-2 select-none">
                  <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider flex items-center justify-between">
                    <span>Gemini AI Business Automation</span>
                    <span className="px-1.5 py-0.5 rounded-full bg-indigo-50 text-indigo-600 font-mono text-[7px] font-extrabold uppercase">Enterprise Core</span>
                  </span>
                  <div className="p-3.5 bg-indigo-50/50 border border-indigo-150 rounded-2xl space-y-3 shadow-xs text-left">
                    {/* Trigger AI Qualification */}
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-[10.5px] font-bold text-slate-800">Automatic Lead Qualification</p>
                        <p className="text-[8px] text-slate-500">Analyze interest, priority, and assign fit score</p>
                      </div>
                      <button
                        onClick={() => handleRunAiQualification(selectedLead.id)}
                        className="px-2.5 py-1.5 bg-indigo-600 hover:bg-indigo-550 text-white rounded-xl text-[9px] font-bold transition-all shadow-2xs cursor-pointer"
                      >
                        Run qualification
                      </button>
                    </div>

                    {/* AI Score Status */}
                    {aiScore[selectedLead.id] && (
                      <div className="p-2.5 bg-white border border-indigo-100 rounded-xl space-y-1.5">
                        <div className="flex justify-between items-center text-[9px]">
                          <span className="font-bold text-slate-600">Gemini Lead Score:</span>
                          <span className="font-mono font-black text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">{aiScore[selectedLead.id]}% Match</span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-indigo-600" style={{ width: `${aiScore[selectedLead.id]}%` }}></div>
                        </div>
                        <div className="text-[8.5px] text-slate-600 leading-normal bg-slate-50 p-2 rounded-lg mt-1 font-sans">
                          <span className="font-bold block text-slate-800 mb-0.5">Gemini Summary:</span>
                          {aiSummary[selectedLead.id]}
                        </div>
                        <div className="text-[8.5px] text-emerald-700 leading-normal bg-emerald-50/50 p-2 rounded-lg font-sans">
                          <span className="font-bold block text-emerald-800 mb-0.5">Next Action Recommendation:</span>
                          {aiNextAction[selectedLead.id]}
                        </div>
                      </div>
                    )}

                    {/* Outreach Draft copy generators */}
                    <div className="pt-2 border-t border-slate-200/60 space-y-2">
                      <p className="text-[9.5px] font-bold text-slate-700">Outbound Template Generators</p>
                      <div className="flex items-center space-x-1.5 bg-white border border-slate-200 rounded-lg p-1">
                        <span className="text-[8px] font-bold text-slate-400 pl-1">GOAL:</span>
                        <input
                          type="text"
                          value={outreachGoal}
                          onChange={(e) => setOutreachGoal(e.target.value)}
                          placeholder="Goal/offer..."
                          className="flex-1 bg-transparent text-[9.5px] focus:outline-none placeholder-slate-300 text-slate-800 font-bold"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2 pt-0.5">
                        <button
                          onClick={() => handleGenerateSalesEmail(selectedLead.name, selectedLead.business)}
                          className="py-1.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-[9px] font-bold transition-colors"
                        >
                          ✉️ Draft Email
                        </button>
                        <button
                          onClick={() => handleGenerateWhatsApp(selectedLead.name)}
                          className="py-1.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-[9px] font-bold transition-colors"
                        >
                          💬 Draft WhatsApp
                        </button>
                      </div>

                      {/* Display generated text */}
                      {generatedEmail && (
                        <div className="p-2.5 bg-white border border-slate-150 rounded-xl space-y-1 mt-2 text-left">
                          <div className="flex justify-between items-center text-[8px] font-bold uppercase tracking-wider text-slate-400">
                            <span>Sales Email Copy</span>
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(generatedEmail);
                                showToast("Email copy copied!");
                              }}
                              className="text-indigo-600 hover:underline"
                            >
                              Copy
                            </button>
                          </div>
                          <pre className="text-[8.5px] text-slate-600 whitespace-pre-wrap leading-normal bg-slate-50 p-2 rounded-lg font-mono">{generatedEmail}</pre>
                        </div>
                      )}

                      {generatedWhatsApp && (
                        <div className="p-2.5 bg-white border border-slate-150 rounded-xl space-y-1 mt-2 text-left">
                          <div className="flex justify-between items-center text-[8px] font-bold uppercase tracking-wider text-slate-400">
                            <span>WhatsApp Message Copy</span>
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(generatedWhatsApp);
                                showToast("WhatsApp copy copied!");
                              }}
                              className="text-indigo-600 hover:underline"
                            >
                              Copy
                            </button>
                          </div>
                          <pre className="text-[8.5px] text-slate-600 whitespace-pre-wrap leading-normal bg-slate-50 p-2 rounded-lg font-mono">{generatedWhatsApp}</pre>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* 3. INTERACTIVE FOLLOW-UP TASK LIST */}
                <div className="space-y-2 select-none">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Follow-up Tasks ({ (leadTasks[selectedLead.id] || []).filter(t => !t.completed).length })</span>
                  <div className="p-3 bg-white border border-slate-200 rounded-2xl space-y-3 shadow-xs text-left">
                    {/* Add Task Control */}
                    <div className="flex space-x-1.5">
                      <input
                        type="text"
                        placeholder="New follow-up task..."
                        value={newTaskTitle}
                        onChange={(e) => setNewTaskTitle(e.target.value)}
                        className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-[10px] placeholder-slate-400 focus:outline-none focus:border-indigo-500 text-slate-800"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleAddTask(selectedLead.id);
                        }}
                      />
                      <select
                        value={newTaskPriority}
                        onChange={(e) => setNewTaskPriority(e.target.value)}
                        className="bg-slate-50 border border-slate-200 rounded-lg px-1.5 py-1 text-[9px] font-bold text-slate-600 focus:outline-none"
                      >
                        <option value="High">🔴 High</option>
                        <option value="Medium">🟡 Med</option>
                        <option value="Low">🔵 Low</option>
                      </select>
                      <button
                        onClick={() => handleAddTask(selectedLead.id)}
                        className="px-2 py-1 bg-indigo-600 hover:bg-indigo-550 text-white rounded-lg text-[10px] font-bold"
                      >
                        Add
                      </button>
                    </div>

                    {/* Task list items */}
                    <div className="space-y-1.5 pt-1">
                      {!(leadTasks[selectedLead.id]) || leadTasks[selectedLead.id].length === 0 ? (
                        <p className="text-[9px] text-slate-400 italic py-1 text-center">No tasks assigned to lead.</p>
                      ) : (
                        leadTasks[selectedLead.id].map(task => (
                          <div key={task.id} className="flex items-center justify-between p-1.5 hover:bg-slate-50 rounded-lg">
                            <div className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                checked={task.completed}
                                onChange={() => handleToggleTask(selectedLead.id, task.id)}
                                className="h-3 w-3 rounded text-indigo-600 border-slate-300 focus:ring-indigo-500 cursor-pointer"
                              />
                              <span className={`text-[10px] ${task.completed ? "line-through text-slate-400" : "text-slate-700 font-medium"}`}>{task.title}</span>
                            </div>
                            <span className={`text-[7.5px] font-extrabold px-1.5 py-0.5 rounded font-mono uppercase ${
                              task.priority === "High" ? "bg-red-50 text-red-600" :
                              task.priority === "Medium" ? "bg-amber-50 text-amber-600" :
                              "bg-blue-50 text-blue-600"
                            }`}>{task.priority}</span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>

                {/* 4. CALENDAR & MEETING SCHEDULER */}
                <div className="space-y-2 select-none">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Calendar Meetings ({ (leadMeetings[selectedLead.id] || []).length })</span>
                  <div className="p-3 bg-white border border-slate-200 rounded-2xl space-y-3 shadow-xs text-left">
                    <div className="space-y-1.5">
                      <input
                        type="text"
                        placeholder="Agenda Title..."
                        value={newMtgTitle}
                        onChange={(e) => setNewMtgTitle(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-[10px] placeholder-slate-400 focus:outline-none focus:border-indigo-500 text-slate-800"
                      />
                      <div className="flex space-x-1.5">
                        <input
                          type="text"
                          placeholder="Location (e.g. Google Meet Link)..."
                          value={newMtgLocation}
                          onChange={(e) => setNewMtgLocation(e.target.value)}
                          className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-[10px] placeholder-slate-400 focus:outline-none focus:border-indigo-500 text-slate-800"
                        />
                        <button
                          onClick={() => handleScheduleMeeting(selectedLead.id)}
                          className="px-3 py-1 bg-emerald-600 hover:bg-emerald-550 text-white rounded-lg text-[10px] font-bold"
                        >
                          Book Slot
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1.5 pt-1">
                      {!(leadMeetings[selectedLead.id]) || leadMeetings[selectedLead.id].length === 0 ? (
                        <p className="text-[9px] text-slate-400 italic py-1 text-center">No meetings scheduled.</p>
                      ) : (
                        leadMeetings[selectedLead.id].map(mtg => (
                          <div key={mtg.id} className="p-2 bg-slate-50 rounded-lg border border-slate-150 text-[9.5px]">
                            <div className="flex justify-between items-center mb-0.5">
                              <span className="font-bold text-slate-800">{mtg.title}</span>
                              <span className="text-emerald-600 font-bold font-mono">Confirmed</span>
                            </div>
                            <p className="text-slate-500 font-mono text-[8.5px]">{mtg.dateTime}</p>
                            <p className="text-indigo-600 font-bold font-mono text-[8.5px] truncate mt-0.5">🔗 {mtg.location}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>

                {/* 5. HISTORIC TIMELINE NOTES */}
                <div className="space-y-2 select-none">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Activity Log & Notes</span>
                  <div className="p-3 bg-white border border-slate-200 rounded-2xl space-y-3 shadow-xs text-left">
                    <div className="flex space-x-1.5">
                      <input
                        type="text"
                        placeholder="Log custom notes, calls..."
                        value={newNoteText}
                        onChange={(e) => setNewNoteText(e.target.value)}
                        className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-[10px] placeholder-slate-400 focus:outline-none focus:border-indigo-500 text-slate-800"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleAddNote(selectedLead.id);
                        }}
                      />
                      <button
                        onClick={() => handleAddNote(selectedLead.id)}
                        className="px-3 py-1 bg-slate-700 hover:bg-slate-800 text-white rounded-lg text-[10px] font-bold"
                      >
                        Log
                      </button>
                    </div>

                    <div className="space-y-2 pt-1 font-sans">
                      {/* Base notes */}
                      <div className="p-2 bg-slate-50 rounded-lg text-[9.5px] leading-relaxed text-slate-600 border border-slate-150">
                        <div className="flex justify-between items-center text-[7.5px] text-slate-400 font-mono mb-0.5 uppercase">
                          <span>SYSTEM INGESTION</span>
                          <span>Initial Lead Creation</span>
                        </div>
                        {selectedLead.notes}
                      </div>

                      {/* Custom notes */}
                      {leadNotes[selectedLead.id] && leadNotes[selectedLead.id].map(note => (
                        <div key={note.id} className="p-2 bg-slate-50 rounded-lg text-[9.5px] leading-relaxed text-slate-600 border border-slate-150">
                          <div className="flex justify-between items-center text-[7.5px] text-slate-400 font-mono mb-0.5 uppercase">
                            <span>{note.type}</span>
                            <span>{note.timestamp}</span>
                          </div>
                          {note.content}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 6. AUTOMATED NEXT STEPS ACTION */}
                <div className="space-y-2">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Automated workflow queue</span>
                  <div className="p-3 bg-indigo-50 border border-indigo-200/50 rounded-xl flex items-start space-x-2 text-xs text-indigo-700 shadow-xs">
                    <CheckCircle className="h-4 w-4 text-indigo-600 flex-shrink-0 mt-0.5" />
                    <span>{selectedLead.automatedAction}</span>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-white border-t border-slate-200 flex space-x-2">
                <button 
                  onClick={() => changeScreen("voiceAgent")}
                  className="flex-1 flex items-center justify-center space-x-1.5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 font-bold text-xs text-white"
                >
                  <Mic className="h-3.5 w-3.5 text-white" />
                  <span>AI Voice Call</span>
                </button>
                <button 
                  onClick={() => changeScreen("chatAssistant")}
                  className="flex-1 flex items-center justify-center space-x-1.5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 font-bold text-xs text-white"
                >
                  <MessageSquare className="h-3.5 w-3.5 text-white" />
                  <span>AI Chat Core</span>
                </button>
              </div>
            </motion.div>
          )}

          {/* SCREEN: VOICE AGENT */}
          {currentScreen === "voiceAgent" && (
            <motion.div 
              key="voiceAgent"
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="flex flex-col h-full bg-slate-50 p-4 justify-between"
            >
              <div className="flex items-center bg-white border border-slate-200 p-2.5 rounded-2xl shadow-xs">
                <button onClick={() => changeScreen("dashboard")} className="p-1 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-800 transition-colors">
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <span className="ml-2 text-[10px] font-bold text-indigo-600 tracking-widest uppercase">AI Voice Automation Simulator</span>
              </div>

              {/* Status Visual Area */}
              <div className="flex flex-col items-center justify-center py-6 text-center select-none">
                <div className="relative mb-6 h-36 w-36 flex items-center justify-center">
                  <div className={`absolute inset-0 rounded-full border border-indigo-500/30 ${isVoiceActive ? "animate-ping opacity-75" : ""}`}></div>
                  <div className="absolute inset-4 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center shadow-xs">
                    <Mic className={`h-12 w-12 text-indigo-600 ${isVoiceActive ? "scale-110" : ""}`} />
                  </div>
                </div>
                
                <h3 className="text-xs font-bold text-slate-800 mb-1">AURA VOICE NODE #102</h3>
                <p className="text-[11px] font-mono font-bold text-indigo-600 uppercase tracking-widest">{voiceStatus}</p>
              </div>

              {/* Waveform Visualization */}
              <div className="flex justify-center items-end h-16 space-x-1 px-4 mb-4 select-none">
                {voiceWaveforms.map((h, i) => (
                  <motion.div 
                    key={i}
                    animate={{ height: isVoiceActive ? `${h}%` : "15%" }}
                    className="w-1 rounded-full bg-indigo-600"
                    style={{ minHeight: "6px" }}
                  />
                ))}
              </div>

              {/* Dialogue Transcript */}
              <div className="bg-slate-900 border border-slate-950 rounded-2xl p-3 flex-1 overflow-y-auto mb-4 text-[10px] space-y-2 select-text font-mono shadow-inner text-slate-200">
                {simulatedVoiceDialog.length === 0 ? (
                  <p className="text-slate-500 text-center italic py-6">Dialogue transcripts will generate in real-time once the call is initiated.</p>
                ) : (
                  simulatedVoiceDialog.map((line, idx) => (
                    <div key={idx} className={`p-1.5 rounded-lg ${
                      line.startsWith("✨") ? "bg-indigo-950 text-indigo-300" :
                      line.startsWith("🤖") ? "bg-slate-800/80 text-slate-100" : "text-slate-400"
                    }`}>
                      {line}
                    </div>
                  ))
                )}
              </div>

              {/* Toggle Call Trigger */}
              <button 
                id="btn-voice-toggle"
                onClick={handleVoiceToggle}
                className={`w-full py-3 rounded-2xl font-bold text-xs text-white transition-all shadow-xs ${
                  isVoiceActive 
                    ? "bg-red-600 hover:bg-red-500 shadow-red-950/20" 
                    : "bg-linear-to-r from-indigo-600 to-indigo-700 hover:from-indigo-550 hover:to-indigo-650 shadow-indigo-950/20"
                }`}
              >
                {isVoiceActive ? "HANG UP (END CALL)" : "START SIMULATED LEAD CONVERSATION"}
              </button>
            </motion.div>
          )}

          {/* SCREEN: CHAT ASSISTANT (Connected to Live Gemini Backend) */}
          {currentScreen === "chatAssistant" && (
            <motion.div 
              key="chatAssistant"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex flex-col h-full bg-slate-50 relative overflow-hidden"
            >
              {/* Dynamic Toast Feedback Overlay */}
              {toastMsg && (
                <div className="absolute top-16 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-slate-900/95 text-white text-[9px] font-bold rounded-lg shadow-md flex items-center space-x-1.5 z-50 pointer-events-none select-none animate-bounce">
                  <span>{toastMsg}</span>
                </div>
              )}

              {/* Header */}
              <div className="flex items-center justify-between px-3 py-2.5 bg-white border-b border-slate-200/80 shadow-xs">
                <div className="flex items-center space-x-2">
                  <button onClick={() => changeScreen("dashboard")} className="p-1 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-800 transition-colors cursor-pointer">
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button 
                    onClick={() => setShowChatRoomsMenu(true)} 
                    className="p-1 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                    title="Conversation Sessions"
                  >
                    <Menu className="h-4 w-4 text-indigo-600" />
                  </button>
                  <div className="text-left">
                    <h3 className="text-xs font-black leading-tight text-slate-800 font-sans tracking-tight">
                      {activeChatId ? (chatsList.find(c => c.id === activeChatId)?.title || "Aura AI") : "Aura AI"}
                    </h3>
                    <span className="text-[7.5px] font-mono text-emerald-600 flex items-center font-bold">
                      <span className="h-1 w-1 rounded-full bg-emerald-500 mr-1 animate-ping"></span>
                      Gemini 3.5 Engine Ready
                    </span>
                  </div>
                </div>

                {/* Header Actions */}
                <div className="flex items-center space-x-1">
                  <button
                    onClick={handleCopyChatHistory}
                    className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                    title="Copy Transcript"
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={handleShareChat}
                    className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                    title="Share Link"
                  >
                    <Share2 className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      setActiveChatId(null);
                      showToast("Started fresh chat session!");
                    }}
                    className="p-1.5 hover:bg-slate-100 rounded-lg text-indigo-600 hover:text-indigo-800 transition-colors cursor-pointer"
                    title="New Chat"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {/* Sliding Chat Rooms Menu Drawer */}
              <AnimatePresence>
                {showChatRoomsMenu && (
                  <div className="absolute inset-0 bg-slate-950/45 z-40" onClick={() => setShowChatRoomsMenu(false)}>
                    <motion.div
                      initial={{ x: "-100%" }}
                      animate={{ x: 0 }}
                      exit={{ x: "-100%" }}
                      transition={{ type: "spring", damping: 25, stiffness: 220 }}
                      className="absolute top-0 bottom-0 left-0 w-[240px] bg-white shadow-2xl z-50 flex flex-col p-4 text-left border-r border-slate-100"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center space-x-1.5 font-mono">
                          <Brain className="h-4 w-4 text-indigo-600 animate-pulse" />
                          <span>AI Chat History</span>
                        </h3>
                        <button onClick={() => setShowChatRoomsMenu(false)} className="p-1 hover:bg-slate-100 rounded-lg text-slate-400">
                          <X className="h-4 w-4" />
                        </button>
                      </div>

                      {/* Fresh Session Trigger */}
                      <button
                        onClick={() => {
                          setActiveChatId(null);
                          setShowChatRoomsMenu(false);
                          showToast("Fresh conversation space ready.");
                        }}
                        className="w-full mb-3 py-2 px-3 border border-indigo-150 bg-indigo-50/50 hover:bg-indigo-50 text-indigo-700 hover:text-indigo-800 rounded-xl font-bold text-[10px] flex items-center justify-center space-x-1.5 transition-colors cursor-pointer"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        <span>Fresh Conversation</span>
                      </button>

                      {/* Conversation list */}
                      <div className="flex-1 overflow-y-auto space-y-1.5 pr-0.5">
                        {chatsList.length === 0 ? (
                          <div className="text-center py-10 space-y-2">
                            <MessageSquare className="h-6 w-6 text-slate-200 mx-auto" />
                            <p className="text-[10px] text-slate-400 italic">No saved conversations yet.</p>
                          </div>
                        ) : (
                          chatsList.map((chat) => {
                            const isCurrentActive = chat.id === activeChatId;
                            return (
                              <div
                                key={chat.id}
                                onClick={() => {
                                  setActiveChatId(chat.id);
                                  setShowChatRoomsMenu(false);
                                }}
                                className={`group relative p-2.5 rounded-xl border text-left cursor-pointer transition-all ${
                                  isCurrentActive
                                    ? "bg-indigo-600 border-indigo-600 text-white shadow-xs"
                                    : "bg-slate-50 border-slate-200/80 hover:bg-slate-100 text-slate-700"
                                }`}
                              >
                                {isRenamingChatId === chat.id ? (
                                  <div className="flex items-center space-x-1" onClick={(e) => e.stopPropagation()}>
                                    <input
                                      type="text"
                                      value={chatRenameTitle}
                                      onChange={(e) => setChatRenameTitle(e.target.value)}
                                      className="flex-1 px-2 py-1 text-[9px] text-slate-800 bg-white border border-slate-300 rounded-lg focus:outline-none"
                                      onKeyDown={(e) => {
                                        if (e.key === "Enter") handleRenameChat(chat.id, chatRenameTitle);
                                      }}
                                      autoFocus
                                    />
                                    <button
                                      onClick={() => handleRenameChat(chat.id, chatRenameTitle)}
                                      className="p-1 bg-emerald-500 text-white rounded-md hover:bg-emerald-600 cursor-pointer"
                                    >
                                      <CheckCircle className="h-3 w-3" />
                                    </button>
                                    <button
                                      onClick={() => setIsRenamingChatId(null)}
                                      className="p-1 bg-slate-300 text-slate-600 rounded-md hover:bg-slate-400 cursor-pointer"
                                    >
                                      <X className="h-3 w-3" />
                                    </button>
                                  </div>
                                ) : (
                                  <div className="flex flex-col">
                                    <div className="flex items-center justify-between">
                                      <span className="text-[10.5px] font-bold truncate pr-8 leading-tight block w-full">{chat.title || "Untitled Conversation"}</span>
                                      <div className="absolute right-2 top-2.5 hidden group-hover:flex items-center space-x-0.5" onClick={(e) => e.stopPropagation()}>
                                        <button
                                          onClick={() => {
                                            setChatRenameTitle(chat.title || "");
                                            setIsRenamingChatId(chat.id);
                                          }}
                                          className={`p-0.5 rounded transition-colors cursor-pointer ${
                                            isCurrentActive ? "hover:bg-indigo-700 text-indigo-200 hover:text-white" : "hover:bg-slate-200 text-slate-400 hover:text-slate-600"
                                          }`}
                                          title="Rename"
                                        >
                                          <Edit3 className="h-3 w-3" />
                                        </button>
                                        <button
                                          onClick={() => handleDeleteChat(chat.id)}
                                          className={`p-0.5 rounded transition-colors cursor-pointer ${
                                            isCurrentActive ? "hover:bg-indigo-700 text-indigo-200 hover:text-white" : "hover:bg-red-50 text-red-500 hover:text-red-700"
                                          }`}
                                          title="Delete"
                                        >
                                          <Trash2 className="h-3 w-3" />
                                        </button>
                                      </div>
                                    </div>
                                    <span className={`text-[8px] mt-1 font-mono ${isCurrentActive ? "text-indigo-200" : "text-slate-400"}`}>
                                      {new Date(chat.lastMessageTime || "").toLocaleDateString()} &bull; {new Date(chat.lastMessageTime || "").toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                  </div>
                                )}
                              </div>
                            );
                          })
                        )}
                      </div>

                      {/* Cloud Synced banner */}
                      <div className="mt-4 p-2 bg-slate-50 border border-slate-200/80 rounded-xl">
                        <span className="text-[8px] font-mono font-bold text-slate-400 uppercase block tracking-wider mb-0.5">Persistence Status</span>
                        <p className="text-[8px] leading-relaxed text-slate-500">
                          Securely synchronized with Cloud Firestore database. Sessions back up automatically.
                        </p>
                      </div>
                    </motion.div>
                  </div>
                )}
              </AnimatePresence>

              {/* Network offline notification */}
              {!isOnline && (
                <div className="px-3 py-1.5 bg-red-500 text-white text-[9px] font-bold flex items-center justify-center space-x-1.5 select-none shadow-xs z-20">
                  <CloudOff className="h-3 w-3 animate-pulse" />
                  <span>Aura is in Offline Mode. Queries are locally buffered.</span>
                </div>
              )}

              {/* Free Tier Daily limit tracker banner */}
              {userProfile?.subscriptionTier === "Starter" && (
                <div className="px-3 py-1.5 bg-amber-50 border-b border-amber-150 flex items-center justify-between select-none z-20 text-left">
                  <div className="flex items-center space-x-1.5">
                    <Brain className="h-3.5 w-3.5 text-amber-500 flex-shrink-0 animate-pulse" />
                    <div>
                      <p className="text-[8px] font-bold text-amber-800">DAILY RESOURCE LIMIT: {dailyQueriesCount} / 5 MESSAGES</p>
                      <p className="text-[7px] text-amber-600 font-medium">Starter Tier. Switch to Business in settings for unlimited AI capacity.</p>
                    </div>
                  </div>
                  <button
                    onClick={() => changeScreen("settings")}
                    className="px-2 py-0.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-black text-[7px] uppercase tracking-wider transition-colors cursor-pointer shadow-xs"
                  >
                    Upgrade Plan
                  </button>
                </div>
              )}

              {/* Visual Error alerts with instant retry */}
              {lastChatMessageError && (
                <div className="mx-3 my-2 p-2.5 bg-red-50 border border-red-150 rounded-xl text-[9px] flex items-start space-x-1.5 text-left text-red-800 shadow-xs z-20">
                  <AlertCircle className="h-3.5 w-3.5 text-red-500 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <span className="font-semibold block">Aura Connection Error:</span>
                    <span className="text-red-700 leading-tight block mt-0.5">{lastChatMessageError}</span>
                    <div className="mt-2 flex items-center space-x-2">
                      <button
                        type="button"
                        onClick={() => handleSendChatMessage(null as any, chatMessages[chatMessages.length - 2]?.content || chatInput)}
                        className="px-2 py-0.5 bg-red-600 hover:bg-red-700 text-white text-[8px] font-bold rounded cursor-pointer transition-colors"
                      >
                        Retry Query
                      </button>
                      <button
                        type="button"
                        onClick={() => setLastChatMessageError(null)}
                        className="px-2 py-0.5 bg-white hover:bg-slate-100 text-slate-500 text-[8px] font-medium border border-slate-200 rounded cursor-pointer transition-colors"
                      >
                        Dismiss
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Chat log stream */}
              <div className="flex-1 overflow-y-auto p-3 space-y-3.5 select-text">
                {chatMessages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} animate-fade-in`}>
                    <div className={`max-w-[88%] rounded-2xl p-2.5 shadow-xs text-left ${
                      msg.role === "user" 
                        ? "bg-indigo-600 text-white rounded-tr-none font-sans" 
                        : "bg-white border border-slate-200/80 text-slate-700 rounded-tl-none font-sans"
                    }`}>
                      {/* Attached image if any */}
                      {msg.image && (
                        <div className="mb-2 max-w-[120px] rounded-lg overflow-hidden border border-indigo-250 bg-slate-50 shadow-xs">
                          <img src={msg.image} className="w-full h-auto object-cover" alt="Attached prompt" referrerPolicy="no-referrer" />
                        </div>
                      )}
                      
                      {msg.role === "user" ? (
                        <p className="text-[11px] leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                      ) : (
                        <div className="prose prose-sm prose-slate max-w-none">
                          {renderMarkdown(msg.content)}
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {/* Thinking / Streaming loader state with custom status updates */}
                {isChatLoading && (
                  <div className="flex justify-start">
                    <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-none p-3 shadow-xs text-left flex items-start space-x-2">
                      <Brain className="h-4 w-4 text-indigo-500 animate-spin flex-shrink-0 mt-0.5" />
                      <div className="space-y-1">
                        <span className="text-[10px] text-indigo-600 font-bold block animate-pulse">Aura is synthesizing response...</span>
                        <span className="text-[8px] text-slate-400 font-mono block">Securing streaming chunks of text</span>
                      </div>
                    </div>
                  </div>
                )}
                
                <div ref={chatEndRef} />
              </div>

              {/* Visual token details metrics */}
              {tokenUsageMetrics.prompt > 0 && (
                <div className="px-3 py-1 bg-slate-100 border-t border-slate-200 flex items-center justify-between select-none text-[7.5px] font-mono text-slate-400">
                  <span>Usage stats: Prompt {tokenUsageMetrics.prompt} tokens</span>
                  <span>Candidates {tokenUsageMetrics.candidates} tokens</span>
                </div>
              )}

              {/* Image attachment preview thumb */}
              {attachedImage && (
                <div className="px-3 py-1.5 bg-indigo-50/50 border-t border-slate-200 flex items-center space-x-2.5 text-left">
                  <div className="relative h-10 w-10 border border-indigo-200 rounded-lg overflow-hidden flex-shrink-0 bg-white">
                    <img src={attachedImage} className="h-full w-full object-cover" alt="Selected Attachment" referrerPolicy="no-referrer" />
                    <button
                      type="button"
                      onClick={() => {
                        setAttachedImage(null);
                        setAttachedImageMime(null);
                      }}
                      className="absolute top-0.5 right-0.5 p-0.5 bg-slate-900/80 text-white hover:bg-slate-900 rounded-full cursor-pointer"
                    >
                      <X className="h-2 w-2" />
                    </button>
                  </div>
                  <div>
                    <span className="text-[8px] font-bold text-indigo-800 uppercase block tracking-wider">Image Attachment Ready</span>
                    <span className="text-[7.5px] text-indigo-500 font-mono block">Will process with multimodal Gemini 3.5</span>
                  </div>
                </div>
              )}

              {/* Voice recording fluctuating waves overlay */}
              {voiceRecordingState !== "idle" && (
                <div className="absolute bottom-14 left-0 right-0 p-3 bg-indigo-900 text-white text-center flex flex-col items-center space-y-1.5 z-30 shadow-lg select-none">
                  <div className="flex items-center space-x-2">
                    <Mic className={`h-4 w-4 ${voiceRecordingState === "recording" ? "text-red-500 animate-ping" : "text-amber-400 animate-pulse"}`} />
                    <span className="text-[10px] font-bold uppercase tracking-wider font-mono">
                      {voiceRecordingState === "recording" ? "Dictating spoken message..." : "Transcribing speech..."}
                    </span>
                  </div>
                  {voiceRecordingState === "recording" && (
                    <div className="flex items-center space-x-1 pt-1 h-4 justify-center">
                      {[15, 30, 45, 20, 60, 45, 20, 30, 15].map((h, index) => (
                        <span 
                          key={index} 
                          style={{ height: `${h}%` }} 
                          className="w-1 bg-white rounded-full animate-pulse"
                        />
                      ))}
                    </div>
                  )}
                  <p className="text-[8px] text-indigo-200 max-w-[80%] leading-normal">
                    {voiceRecordingState === "recording" ? "Speak business instruction now..." : "Converting audio wave to text..."}
                  </p>
                </div>
              )}

              {/* Hidden file input */}
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
              />

              {/* Input toolbar form */}
              <form onSubmit={handleSendChatMessage} className="p-2.5 bg-white border-t border-slate-200/80 flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isChatLoading}
                  className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer disabled:opacity-50 flex-shrink-0"
                  title="Attach Image"
                >
                  <ImageIcon className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={startVoiceInput}
                  disabled={isChatLoading || voiceRecordingState !== "idle"}
                  className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer disabled:opacity-50 flex-shrink-0"
                  title="Voice Input"
                >
                  <Mic className="h-3.5 w-3.5" />
                </button>

                <input 
                  type="text"
                  placeholder="Ask Aura to draft an email, reply..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  disabled={isChatLoading || voiceRecordingState !== "idle"}
                  className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200/85 rounded-xl text-[11px] focus:outline-none focus:border-indigo-500 text-slate-800 placeholder-slate-400 select-text"
                />

                <button 
                  id="btn-chat-send"
                  type="submit"
                  disabled={(!chatInput.trim() && !attachedImage) || isChatLoading || voiceRecordingState !== "idle"}
                  className="p-2 rounded-xl bg-indigo-600 hover:bg-indigo-550 text-white disabled:opacity-40 transition-colors flex-shrink-0 cursor-pointer shadow-xs"
                >
                  <Send className="h-3.5 w-3.5 text-white" />
                </button>
              </form>
            </motion.div>
          )}

          {/* SCREEN: SETTINGS & SAAS SUBSCRIPTIONS */}
          {currentScreen === "settings" && (
            <motion.div 
              key="settings"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="flex flex-col h-full bg-slate-50 relative"
            >
              <div className="flex items-center px-3 py-3 bg-white border-b border-slate-200">
                <button onClick={() => changeScreen("dashboard")} className="p-1 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-800 transition-colors">
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <h2 className="ml-2 text-xs font-bold text-slate-800">Premium Subscription Plans</h2>
              </div>

              <div className="flex-1 overflow-y-auto p-3.5 space-y-4">
                
                {/* 1. Active Plan Banner Details */}
                <div className="p-3.5 rounded-2xl bg-indigo-50/50 border border-indigo-150 text-left select-none shadow-xs">
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center space-x-1.5">
                      <CheckCircle className={`h-4 w-4 ${userProfile?.subscriptionTier && userProfile.subscriptionTier !== "Free" ? "text-indigo-600" : "text-slate-400"}`} />
                      <span className="font-extrabold text-xs text-slate-900">
                        Active Tier: {userProfile?.subscriptionTier || "Free Plan"}
                      </span>
                    </div>
                    {userProfile?.subscriptionTier && userProfile.subscriptionTier !== "Free" && (
                      <span className={`text-[8px] font-bold uppercase px-1.5 py-0.5 rounded ${
                        isSubscriptionCancelled ? "bg-red-50 text-red-600" : "bg-emerald-50 text-emerald-600 animate-pulse"
                      }`}>
                        {isSubscriptionCancelled ? "Cancelled" : "Auto-Renew"}
                      </span>
                    )}
                  </div>
                  
                  <p className="text-[9px] text-slate-500 leading-normal mb-2.5">
                    {userProfile?.subscriptionTier && userProfile.subscriptionTier !== "Free"
                      ? `Your premium subscription cycle ends on ${billingExpiresAt ? new Date(billingExpiresAt).toLocaleDateString() : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}. Payment is synced with your secure Google Play Account.`
                      : "Unlock full Outbound Call voice campaigns, template-driven WhatsApp template automation engines, and secure unlimited CRM records."}
                  </p>

                  <div className="flex items-center justify-between text-[9px]">
                    {userProfile?.subscriptionTier && userProfile.subscriptionTier !== "Free" && !isSubscriptionCancelled ? (
                      <button 
                        onClick={handleCancelSubscription}
                        className="text-red-500 hover:text-red-700 font-extrabold hover:underline cursor-pointer"
                      >
                        Cancel Auto-Renew
                      </button>
                    ) : (
                      <span className="text-slate-400 font-medium">Free Tier trial active</span>
                    )}
                    
                    <button 
                      onClick={handleRestorePurchases}
                      disabled={isBillingProcessing}
                      className="text-indigo-600 hover:text-indigo-800 font-extrabold hover:underline cursor-pointer disabled:opacity-50"
                    >
                      {isBillingProcessing ? "Restoring..." : "Restore Purchases"}
                    </button>
                  </div>
                </div>

                {/* Sandbox Dropdown option to switch back to Free for Testing/Reviewing Limits */}
                <div className="flex justify-between items-center p-2.5 rounded-xl bg-slate-100 border border-slate-200 select-none">
                  <span className="text-[9.5px] font-extrabold text-slate-600">Sandbox Tester controls:</span>
                  <select 
                    value={userProfile?.subscriptionTier || "Free"} 
                    onChange={(e) => handleSelectPlan(e.target.value)}
                    className="text-[9px] font-bold text-slate-800 bg-white border border-slate-350 rounded px-1.5 py-0.5 cursor-pointer focus:outline-none"
                  >
                    <option value="Free">Free Plan (Trial Locks)</option>
                    <option value="Pro">Pro Plan</option>
                    <option value="Business">Business Plan</option>
                    <option value="Enterprise">Enterprise Plan</option>
                  </select>
                </div>

                {/* 2. Billing Toggle Frequency */}
                <div className="flex p-1 bg-slate-200 rounded-xl select-none">
                  <button 
                    onClick={() => setBillingCycle("monthly")}
                    className={`flex-1 text-[10px] py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                      billingCycle === "monthly" ? "bg-white text-indigo-700 shadow-xs" : "text-slate-500 hover:text-slate-700"
                    }`}
                  >
                    Monthly Cycle
                  </button>
                  <button 
                    onClick={() => setBillingCycle("yearly")}
                    className={`flex-1 text-[10px] py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                      billingCycle === "yearly" ? "bg-white text-indigo-700 shadow-xs" : "text-slate-500 hover:text-slate-700"
                    }`}
                  >
                    Yearly Billing (-20% ARR)
                  </button>
                </div>

                {/* 3. Pricing Cards list */}
                <div className="space-y-3 text-left">
                  {[
                    {
                      id: "aura_pro",
                      tier: "Pro",
                      name: "Pro Plan",
                      priceMonthly: 29,
                      priceYearly: 290,
                      trialDays: 7,
                      features: [
                        "Unlimited AI Chat queries",
                        "100 AI Voice Agent mins / mo",
                        "Unlimited CRM Leads & Pipelines",
                        "5GB Cloud storage capacity",
                        "Priority processing speed"
                      ]
                    },
                    {
                      id: "aura_business",
                      tier: "Business",
                      name: "Aura Business",
                      priceMonthly: 99,
                      priceYearly: 990,
                      trialDays: 14,
                      features: [
                        "Unlimited AI Chat & Voice actions",
                        "500 AI Voice Agent mins / mo",
                        "Unlimited CRM Leads & Pipelines",
                        "50GB Cloud storage capacity",
                        "Team collaboration (up to 5 seats)",
                        "Basic SaaS Revenue analytics"
                      ],
                      popular: true
                    },
                    {
                      id: "aura_enterprise",
                      tier: "Enterprise",
                      name: "Enterprise SLA",
                      priceMonthly: 299,
                      priceYearly: 2990,
                      trialDays: 30,
                      features: [
                        "Unlimited AI Chat & Voice actions",
                        "Unlimited AI Voice Agent calls",
                        "Unlimited CRM Leads & Funnels",
                        "Unlimited Cloud storage space",
                        "Team collaboration seat licenses",
                        "Advanced analytics dashboards",
                        "24/7 Dedicated SLA support"
                      ]
                    }
                  ].map((plan) => {
                    const isCurrent = userProfile?.subscriptionTier === plan.tier;
                    const originalPrice = billingCycle === "monthly" ? plan.priceMonthly : plan.priceYearly;
                    const discountedPrice = originalPrice * (1 - discountPercent / 100);

                    return (
                      <div 
                        key={plan.id}
                        className={`p-4 rounded-2xl bg-white border select-none transition-all relative ${
                          isCurrent 
                            ? "border-indigo-600 bg-indigo-50/15 ring-2 ring-indigo-600/10" 
                            : plan.popular 
                              ? "border-violet-350 shadow-sm" 
                              : "border-slate-200"
                        }`}
                      >
                        {plan.popular && (
                          <div className="absolute top-3.5 right-4.5 px-2 py-0.5 bg-gradient-to-r from-indigo-600 to-violet-500 text-white rounded-full text-[7.5px] font-extrabold uppercase tracking-widest shadow-xs">
                            Popular Choice
                          </div>
                        )}

                        <div className="flex justify-between items-start mb-1.5">
                          <div>
                            <span className="font-extrabold text-xs text-slate-900 block">{plan.name}</span>
                            <span className="text-[8px] text-slate-400 block mt-0.5">Includes {plan.trialDays}-day trial period</span>
                          </div>

                          <div className="text-right">
                            <div className="flex items-center space-x-1 justify-end">
                              {discountPercent > 0 && (
                                <span className="text-[9px] font-mono text-slate-400 line-through">
                                  ${originalPrice}
                                </span>
                              )}
                              <span className="text-[12px] font-mono font-black text-indigo-600">
                                ${discountedPrice.toFixed(0)}
                              </span>
                            </div>
                            <span className="text-[7.5px] text-slate-400 font-medium">
                              {billingCycle === "monthly" ? "per month" : "per year"}
                            </span>
                          </div>
                        </div>

                        <ul className="space-y-1.5 mb-3.5 mt-2.5">
                          {plan.features.map((feat, fIdx) => (
                            <li key={fIdx} className="flex items-center text-[9px] text-slate-600 space-x-1.5">
                              <Check className="h-2.5 w-2.5 text-emerald-500 flex-shrink-0" />
                              <span>{feat}</span>
                            </li>
                          ))}
                        </ul>

                        <button
                          onClick={() => {
                            if (isCurrent) {
                              showToast(`${plan.name} is currently your active tier.`);
                            } else {
                              setShowPlayBillingSheet(plan);
                            }
                          }}
                          className={`w-full py-2 rounded-xl text-[9px] font-extrabold shadow-xs transition-all cursor-pointer ${
                            isCurrent
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : plan.popular
                                ? "bg-indigo-600 text-white hover:bg-indigo-550 hover:shadow-md"
                                : "bg-slate-900 text-white hover:bg-slate-850"
                          }`}
                        >
                          {isCurrent ? "✓ Plan Active" : `Upgrade to ${plan.tier}`}
                        </button>
                      </div>
                    );
                  })}
                </div>

                {/* 4. Promo Code input field */}
                <div className="p-3.5 rounded-2xl bg-white border border-slate-200 text-left select-none">
                  <span className="text-[10px] font-extrabold text-slate-700 block mb-1">Have a SaaS Discount Code?</span>
                  <div className="flex space-x-2 mt-1.5">
                    <input 
                      type="text"
                      placeholder="AURAEARLY50"
                      value={promoInput}
                      onChange={(e) => setPromoInput(e.target.value)}
                      className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-[10px] font-mono focus:outline-none focus:border-indigo-500 uppercase select-text"
                    />
                    <button 
                      onClick={() => handleApplyPromoCode(promoInput)}
                      className="px-4 py-1.5 bg-indigo-600 text-white rounded-xl text-[9px] font-extrabold hover:bg-indigo-550 transition-colors cursor-pointer"
                    >
                      Verify
                    </button>
                  </div>
                  {promoStatus.status !== "idle" && (
                    <span className={`text-[8.5px] font-semibold block mt-1.5 ${
                      promoStatus.status === "valid" ? "text-emerald-600" : "text-red-500"
                    }`}>
                      {promoStatus.message}
                    </span>
                  )}
                </div>

                {/* 5. Revenue Projections Mini Dashboard for SaaS Tiers */}
                {userProfile?.subscriptionTier && userProfile.subscriptionTier !== "Free" && (
                  <div className="p-4 rounded-2xl bg-slate-900 text-white text-left select-none shadow-md">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-1.5">
                        <Activity className="h-3.5 w-3.5 text-sky-400" />
                        <span className="text-[10px] font-black tracking-wide uppercase text-slate-200">Revenue Analytics Dashboard</span>
                      </div>
                      <span className="text-[7px] font-mono font-bold text-sky-400 uppercase bg-sky-950/50 px-1 py-0.5 rounded border border-sky-900/30">Live Simulation</span>
                    </div>

                    <div className="grid grid-cols-3 gap-2.5 my-3">
                      <div>
                        <span className="text-[7.5px] text-slate-400 block">YOUR CHARGES</span>
                        <span className="text-sm font-extrabold font-mono text-sky-400 block mt-0.5">
                          ${invoices.filter(i => i.status === "Paid").sumOf ? invoices.filter(i => i.status === "Paid").reduce((acc, curr) => acc + (curr.amount || 0), 0).toFixed(0) : (discountPercent === 50 ? "49" : discountPercent === 100 ? "0" : "99")}
                        </span>
                      </div>
                      <div>
                        <span className="text-[7.5px] text-slate-400 block">SIMULATED MRR</span>
                        <span className="text-sm font-extrabold font-mono text-emerald-400 block mt-0.5">
                          ${discountPercent === 50 ? "49.50" : discountPercent === 100 ? "0.00" : "99.00"}
                        </span>
                      </div>
                      <div>
                        <span className="text-[7.5px] text-slate-400 block">SIMULATED ARR</span>
                        <span className="text-sm font-extrabold font-mono text-violet-400 block mt-0.5">
                          ${((discountPercent === 50 ? 49.50 : discountPercent === 100 ? 0.00 : 99.00) * 12).toFixed(0)}
                        </span>
                      </div>
                    </div>

                    {/* SVG/CSS projections bars */}
                    <div className="bg-slate-950/80 rounded-xl p-2.5 h-16 flex items-end justify-between space-x-2 border border-slate-800">
                      {[0.2, 0.45, 0.38, 0.65, 0.8, 0.95].map((pct, idx) => (
                        <div key={idx} className="flex-1 flex flex-col items-center">
                          <div 
                            style={{ height: `${pct * 32}px` }} 
                            className="w-full rounded-t bg-gradient-to-t from-indigo-600 to-sky-400 min-h-[3px]"
                          />
                          <span className="text-[6.5px] text-slate-500 font-mono mt-1 select-none">Q{idx+1}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 6. Invoice lists */}
                <div className="space-y-2 text-left">
                  <span className="text-[10px] font-black text-slate-800 block">Invoice Logs & Receipts</span>
                  
                  {invoices.length === 0 ? (
                    <div className="p-5 text-center bg-white border border-slate-200 rounded-2xl select-none">
                      <span className="text-[9.5px] text-slate-400">No payment logs. Upgrading on a SaaS tier will populate receipts.</span>
                    </div>
                  ) : (
                    <div className="space-y-1.5">
                      {invoices.map((inv) => (
                        <div 
                          key={inv.id}
                          className="flex justify-between items-center p-3 bg-white border border-slate-200 rounded-xl select-none"
                        >
                          <div>
                            <span className="text-[9.5px] font-extrabold text-slate-800 block">{inv.invoiceNumber}</span>
                            <span className="text-[8px] text-slate-400 block">{inv.planName} ({inv.billingPeriod})</span>
                          </div>

                          <div className="flex items-center space-x-2.5">
                            <span className="text-[10px] font-mono font-extrabold text-slate-700">${(inv.amount || 0).toFixed(0)}</span>
                            <button 
                              onClick={() => setShowInvoiceReceipt(inv)}
                              className="p-1 hover:bg-slate-50 border border-slate-200 rounded text-indigo-600 cursor-pointer"
                              title="Download Invoice"
                            >
                              <Share2 className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>

              {/* OVERLAY 1: Google Play Billing Native Bottom Sheet Simulation */}
              <AnimatePresence>
                {showPlayBillingSheet && (
                  <div className="absolute inset-0 bg-slate-900/60 z-50 flex items-end justify-center select-none text-left">
                    <motion.div 
                      initial={{ y: "100%" }}
                      animate={{ y: 0 }}
                      exit={{ y: "100%" }}
                      className="w-full bg-white rounded-t-3xl shadow-2xl p-5 border-t border-slate-200 flex flex-col space-y-4"
                    >
                      <div className="flex justify-between items-center pb-2.5 border-b border-slate-100">
                        <div className="flex items-center space-x-2">
                          <div className="h-6 w-6 bg-gradient-to-tr from-indigo-600 to-violet-500 rounded-lg flex items-center justify-center font-black text-white text-[10px]">
                            A
                          </div>
                          <div>
                            <span className="text-[11.5px] font-black text-slate-900 block">Aura AI Outbound Suite</span>
                            <span className="text-[8px] text-indigo-600 font-bold block font-sans">SaaS Mobile License Sync</span>
                          </div>
                        </div>
                        <button 
                          onClick={() => setShowPlayBillingSheet(null)}
                          className="p-1.5 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>

                      <div className="space-y-2.5">
                        <div className="flex justify-between items-center text-[10.5px]">
                          <span className="text-slate-500 font-bold">Billing frequency:</span>
                          <span className="text-slate-800 font-extrabold uppercase font-mono">{billingCycle} Cycle</span>
                        </div>

                        <div className="flex justify-between items-center text-[10.5px]">
                          <span className="text-slate-500 font-bold">Upgrade Target Plan:</span>
                          <span className="text-slate-800 font-black">{showPlayBillingSheet.name}</span>
                        </div>

                        {discountPercent > 0 && (
                          <div className="flex justify-between items-center text-[10.5px] text-emerald-600">
                            <span className="font-bold flex items-center">
                              <Tag className="h-3 w-3 mr-1" />
                              Coupon Discount Applied:
                            </span>
                            <span className="font-extrabold font-mono">-{discountPercent}%</span>
                          </div>
                        )}

                        <div className="flex justify-between items-center text-[11px] pt-2 border-t border-slate-100 font-sans">
                          <span className="text-slate-900 font-extrabold">Grand Total Today:</span>
                          <span className="text-indigo-600 font-black font-mono">
                            ${((billingCycle === "monthly" ? showPlayBillingSheet.priceMonthly : showPlayBillingSheet.priceYearly) * (1 - discountPercent / 100)).toFixed(2)}
                          </span>
                        </div>
                      </div>

                      <div className="bg-slate-50 rounded-xl p-3 flex items-center justify-between border border-slate-200">
                        <div className="flex items-center space-x-2">
                          <div className="h-5 w-8 bg-indigo-700 rounded flex items-center justify-center font-bold text-white text-[7.5px] font-mono select-none uppercase shadow-xs">GPay</div>
                          <span className="text-[9.5px] font-bold text-slate-800">Google Pay •••• 9011</span>
                        </div>
                        <span className="text-[8.5px] text-slate-400 font-bold">Secured by Play SDK v7</span>
                      </div>

                      <button
                        onClick={() => handleConfirmGooglePlayPurchase(showPlayBillingSheet)}
                        disabled={isBillingProcessing}
                        className="w-full py-3 bg-indigo-600 text-white rounded-2xl text-[11px] font-black hover:bg-indigo-550 shadow-md transition-colors flex items-center justify-center space-x-1.5 cursor-pointer disabled:opacity-50"
                      >
                        {isBillingProcessing ? (
                          <>
                            <Loader2 className="h-3.5 w-3.5 animate-spin text-white" />
                            <span>Authorizing Play purchase state...</span>
                          </>
                        ) : (
                          <span>SUBSCRIBE & START FREE TRIAL</span>
                        )}
                      </button>

                      <span className="text-[7.5px] text-slate-400 text-center leading-normal">
                        By subscribing, you agree to Aura AI's Terms & Privacy SLA. Subscription renews automatically via Google Play console. Cancel anytime inside play store subscriptions panel.
                      </span>
                    </motion.div>
                  </div>
                )}
              </AnimatePresence>

              {/* OVERLAY 2: Invoice Receipt formal dialogue popup details */}
              <AnimatePresence>
                {showInvoiceReceipt && (
                  <div className="absolute inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 select-none text-left">
                    <motion.div 
                      initial={{ scale: 0.95, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.95, opacity: 0 }}
                      className="w-full max-w-[310px] bg-white rounded-2xl shadow-2xl p-4.5 border border-slate-200 flex flex-col space-y-3.5"
                    >
                      <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                        <span className="text-[11.5px] font-black text-slate-900">Digital Tax Invoice Receipt</span>
                        <button onClick={() => setShowInvoiceReceipt(null)} className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-700 cursor-pointer">
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      <div className="space-y-1.5 font-sans">
                        <div className="flex justify-between items-center text-[9.5px]">
                          <span className="text-slate-400 font-bold">Invoice Number:</span>
                          <span className="text-slate-800 font-mono font-bold">{showInvoiceReceipt.invoiceNumber}</span>
                        </div>
                        <div className="flex justify-between items-center text-[9.5px]">
                          <span className="text-slate-400 font-bold">Charged Date:</span>
                          <span className="text-slate-800 font-medium">{new Date(showInvoiceReceipt.date).toLocaleDateString()}</span>
                        </div>
                        <div className="flex justify-between items-center text-[9.5px]">
                          <span className="text-slate-400 font-bold">Sync Account UID:</span>
                          <span className="text-slate-800 font-mono text-[8px]">{currentUser?.uid.substring(0, 14)}...</span>
                        </div>
                      </div>

                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-150 space-y-1.5 font-sans">
                        <div className="flex justify-between items-center text-[10px]">
                          <span className="text-slate-700 font-extrabold">{showInvoiceReceipt.planName}</span>
                          <span className="text-slate-800 font-bold">${(showInvoiceReceipt.amount || 0).toFixed(0)}.00 USD</span>
                        </div>
                        <div className="flex justify-between items-center text-[8.5px] text-slate-400 border-t border-slate-200/80 pt-1.5">
                          <span>Billing Frequency:</span>
                          <span>{showInvoiceReceipt.billingPeriod} Cycle</span>
                        </div>
                      </div>

                      <div className="bg-emerald-50 rounded-lg p-2 flex items-center justify-between text-emerald-800 text-[8.5px] font-bold border border-emerald-150">
                        <span>STATUS: TRANSACTION SUCCESSFUL</span>
                        <span>PAID ONLINE</span>
                      </div>

                      <div className="flex justify-between items-center space-x-2 pt-1">
                        <button 
                          onClick={() => {
                            showToast("PDF invoice downloaded to local storage.");
                            setShowInvoiceReceipt(null);
                          }}
                          className="flex-1 py-1.5 bg-slate-100 border border-slate-200 rounded-xl text-[9px] font-extrabold text-slate-600 hover:bg-slate-200 cursor-pointer flex items-center justify-center space-x-1"
                        >
                          <Download className="h-3 w-3" />
                          <span>Save PDF</span>
                        </button>
                        <button 
                          onClick={() => {
                            navigator.clipboard.writeText(showInvoiceReceipt.pdfUrl);
                            showToast("Secure PDF URL copied to clipboard!");
                            setShowInvoiceReceipt(null);
                          }}
                          className="flex-1 py-1.5 bg-indigo-600 text-white rounded-xl text-[9px] font-extrabold hover:bg-indigo-550 cursor-pointer flex items-center justify-center space-x-1"
                        >
                          <Share2 className="h-3 w-3 text-white" />
                          <span>Copy Link</span>
                        </button>
                      </div>
                    </motion.div>
                  </div>
                )}
              </AnimatePresence>

            </motion.div>
          )}

          {/* SCREEN: ADD NEW CRM LEAD */}
          {currentScreen === "addLead" && (
            <motion.div 
              key="addLead"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex flex-col h-full bg-slate-50 text-left select-text"
            >
              <div className="flex items-center px-3 py-3 bg-white border-b border-slate-200">
                <button onClick={() => changeScreen("dashboard")} className="p-1 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-800 transition-colors">
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <h2 className="ml-2 text-xs font-bold text-slate-800">Create New CRM Lead</h2>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Lead Full Name</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Robert Downey"
                    value={newLeadName}
                    onChange={(e) => setNewLeadName(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs placeholder-slate-400 focus:outline-none focus:border-indigo-500 text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Business Name / Company</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Stark Industries"
                    value={newLeadBusiness}
                    onChange={(e) => setNewLeadBusiness(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs placeholder-slate-400 focus:outline-none focus:border-indigo-500 text-slate-800"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Contact Email</label>
                    <input 
                      type="email" 
                      placeholder="robert@stark.com"
                      value={newLeadEmail}
                      onChange={(e) => setNewLeadEmail(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs placeholder-slate-400 focus:outline-none focus:border-indigo-500 text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Contact Phone</label>
                    <input 
                      type="text" 
                      placeholder="+1 (555) 012-3456"
                      value={newLeadPhone}
                      onChange={(e) => setNewLeadPhone(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs placeholder-slate-400 focus:outline-none focus:border-indigo-500 text-slate-800"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Estimated Value ($)</label>
                    <input 
                      type="number" 
                      placeholder="e.g. 15000"
                      value={newLeadValue}
                      onChange={(e) => setNewLeadValue(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs placeholder-slate-400 focus:outline-none focus:border-indigo-500 text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Lead Source</label>
                    <select 
                      value={newLeadSource}
                      onChange={(e) => setNewLeadSource(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-indigo-500 text-slate-800"
                    >
                      <option value="WhatsApp">WhatsApp</option>
                      <option value="Inbound Email">Inbound Email</option>
                      <option value="Facebook Ads">Facebook Ads</option>
                      <option value="Referral">Referral</option>
                      <option value="Web Form">Web Form</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 font-mono">Lead Temperature Status</label>
                  <div className="flex space-x-2 pt-0.5">
                    {(["Hot", "Warm", "Cold"] as const).map((status) => (
                      <button
                        key={status}
                        type="button"
                        onClick={() => setNewLeadStatus(status)}
                        className={`flex-1 py-1.5 rounded-lg border font-bold text-[10px] transition-all select-none ${
                          newLeadStatus === status
                            ? status === "Hot"
                              ? "bg-red-500 text-white border-red-500"
                              : status === "Warm"
                              ? "bg-amber-500 text-white border-amber-500"
                              : "bg-blue-500 text-white border-blue-500"
                            : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50"
                        }`}
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Context Notes & Conversation Log</label>
                  <textarea 
                    rows={2}
                    placeholder="Enter details on specific client needs or automation targets..."
                    value={newLeadNotes}
                    onChange={(e) => setNewLeadNotes(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs placeholder-slate-400 focus:outline-none focus:border-indigo-500 text-slate-800"
                  />
                </div>

                {authError && (
                  <div className="p-2.5 bg-red-50 border border-red-150 text-red-700 text-[10px] rounded-xl flex items-start space-x-1.5">
                    <AlertCircle className="h-3.5 w-3.5 text-red-500 flex-shrink-0 mt-0.5" />
                    <span>{authError}</span>
                  </div>
                )}
              </div>

              <div className="p-3 bg-white border-t border-slate-200">
                <button 
                  onClick={handleSaveNewLead}
                  className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-550 text-white font-extrabold text-xs shadow-xs transition-colors"
                >
                  Save Lead to Firestore
                </button>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* Navigation Bar */}
      <div className="flex h-12 w-full items-center justify-around border-t border-slate-200 bg-white px-4 select-none">
        <button 
          onClick={() => changeScreen("dashboard")}
          className={`flex flex-col items-center justify-center p-1.5 transition-colors ${currentScreen === "dashboard" || currentScreen === "leadDetails" ? "text-indigo-600" : "text-slate-400 hover:text-slate-600"}`}
        >
          <TrendingUp className="h-4.5 w-4.5 text-current" />
          <span className="text-[8px] mt-0.5 font-bold">CRM Leads</span>
        </button>
        <button 
          onClick={() => changeScreen("voiceAgent")}
          className={`flex flex-col items-center justify-center p-1.5 transition-colors ${currentScreen === "voiceAgent" ? "text-indigo-600" : "text-slate-400 hover:text-slate-600"}`}
        >
          <Mic className="h-4.5 w-4.5 text-current" />
          <span className="text-[8px] mt-0.5 font-bold">Voice Agent</span>
        </button>
        <button 
          onClick={() => changeScreen("chatAssistant")}
          className={`flex flex-col items-center justify-center p-1.5 transition-colors ${currentScreen === "chatAssistant" ? "text-indigo-600" : "text-slate-400 hover:text-slate-600"}`}
        >
          <MessageSquare className="h-4.5 w-4.5 text-current" />
          <span className="text-[8px] mt-0.5 font-bold">AI Assistant</span>
        </button>
      </div>

    </div>
  );
}
