import React, { useState, useEffect } from "react";
import { 
  Flame, Clock, ChevronRight, LayoutDashboard, Calendar, Users, ShieldAlert, BadgeInfo,
  Sliders, Bot, Globe, ShieldCheck, Mail, Volume2, Sparkles, BookOpen, AlertTriangle,
  Shield, Crown, Star, Sun, Heart, Check, Save, LogIn, LogOut, CloudLightning, ShieldOff
} from "lucide-react";

import { 
  onSnapshot, collection, doc, setDoc, deleteDoc 
} from "firebase/firestore";
import { 
  onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut 
} from "firebase/auth";
import { 
  auth, db, handleFirestoreError, OperationType 
} from "./firebase";

import { Member, NewComer, AttendanceRecord, SpecialEvent, SentEmail, VideoLink } from "./types";
import SermonPrepStudio from "./components/SermonPrepStudio";
import BibleTools from "./components/BibleTools";
import ChurchManagement from "./components/ChurchManagement";
import MediaComm from "./components/MediaComm";

export default function App() {
  // Global active tab state
  const [activeTab, setActiveTab] = useState<"dashboard" | "calendar" | "bible" | "prep" | "management" | "media" | "sub" | "settings">("dashboard");

  // Toasts
  const [toast, setToast] = useState<{ icon: string; msg: string } | null>(null);
  const triggerToast = (icon: string, msg: string) => {
    setToast({ icon, msg });
    setTimeout(() => setToast(null), 3200);
  };

  // State caches & Platform Branding with persistent secure local cache
  const [platformTitle, setPlatformTitle] = useState(() => {
    return localStorage.getItem("faithflow_platform_title") || "CHURCH MOBILE PLATFORM";
  });
  const [churchName, setChurchName] = useState(() => {
    return localStorage.getItem("faithflow_church_name") || "For Righteousness and Holiness";
  });
  const [logoType, setLogoType] = useState<"flame" | "cross" | "crown" | "dove" | "star" | "sun" | "shield">(() => {
    return (localStorage.getItem("faithflow_logo_type") || "flame") as any;
  });
  const [preferredVersion, setPreferredVersion] = useState(() => {
    return localStorage.getItem("faithflow_preferred_version") || "KJV";
  });
  const [timezone, setTimezone] = useState(() => {
    return localStorage.getItem("faithflow_timezone") || "UTC -05:00 Eastern Time";
  });

  // Automatically sync changed variables to Local Storage standard
  useEffect(() => {
    localStorage.setItem("faithflow_platform_title", platformTitle);
  }, [platformTitle]);

  useEffect(() => {
    localStorage.setItem("faithflow_church_name", churchName);
  }, [churchName]);

  useEffect(() => {
    localStorage.setItem("faithflow_logo_type", logoType);
  }, [logoType]);

  useEffect(() => {
    localStorage.setItem("faithflow_preferred_version", preferredVersion);
  }, [preferredVersion]);

  useEffect(() => {
    localStorage.setItem("faithflow_timezone", timezone);
  }, [timezone]);

  // Offline indicator simulation
  const [isOffline, setIsOffline] = useState(false);

  // Live Digital clock React hook
  const [currentTime, setCurrentTime] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Wiping cache triggers
  const handleUninstallAndWipe = () => {
    // Invalidate local states
    localStorage.clear();
    triggerToast("🗑️", "Persistent DB cookies destroyed. Client cold-restarted.");
    setTimeout(() => {
      window.location.reload();
    }, 1500);
  };

  // Firebase Auth user states
  const [user, setUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Raw states with initial mock data fallback
  const [members, rawSetMembers] = useState<Member[]>([
    { id: "mem_101", name: "Pastor Gabriel Adeyemi", role: "General Overseer", email: "gabriel.adeyemi@faithflow.org", phone: "+234 81 2234 5678", demographic: "Adult", status: "Active", joinedAt: "Jan 12, 2023", notes: "Seminary scholar, expository preacher." },
    { id: "mem_102", name: "Elder Sarah Mensah", role: "Worship Coordinator", email: "sarah.mensah@faithflow.org", phone: "+234 80 5566 7788", demographic: "Women", status: "Active", joinedAt: "Mar 18, 2023", notes: "Conducts worship pads and synths." },
    { id: "mem_103", name: "Brother Eric Asante", role: "Youth Leader", email: "eric.asante@faithflow.org", phone: "+233 24 555 1212", demographic: "Youth", status: "Active", joinedAt: "Aug 05, 2024", notes: "Mobilizes youth retreats and crusades." },
    { id: "mem_104", name: "Sister Naomi Osei", role: "Children Teacher", email: "naomi.osei@faithflow.org", phone: "+233 27 111 2222", demographic: "Children", status: "Active", joinedAt: "Nov 15, 2024", notes: "Grooms Scripture memory verses logs." }
  ]);

  const [newComers, rawSetNewComers] = useState<NewComer[]>([
    { id: "nc_201", name: "Mercy Adams", firstVisit: "May 10, 2026", email: "mercy.adams@guest.com", phone: "+234 90 1122 3344", assignedTo: "Brother Eric Asante", status: "New", followUpNotes: "Given welcoming pack and gospel tract." },
    { id: "nc_202", name: "David Kojo", firstVisit: "May 17, 2026", email: "david.kojo@guest.com", phone: "+233 50 444 8888", assignedTo: "Elder Sarah Mensah", status: "Contacted", followUpNotes: "Expressed great delight in worship melodies." }
  ]);

  const [attendanceLogs, rawSetAttendanceLogs] = useState<AttendanceRecord[]>([
    { id: "att_1", date: "May 03", serviceType: "Sunday Service", attendanceCount: 220, newVisitors: 8 },
    { id: "att_2", date: "May 10", serviceType: "Sunday Service", attendanceCount: 245, newVisitors: 14 },
    { id: "att_3", date: "May 17", serviceType: "Sunday Service", attendanceCount: 278, newVisitors: 11 }
  ]);

  const [specialEvents, rawSetSpecialEvents] = useState<SpecialEvent[]>([
    { id: "ev_1", name: "Zion Breakthrough Miracle Crusade", type: "Crusade", date: "June 18, 2026", venue: "National Deliverance Ground", budget: 4500, expectedAttendance: 1200, notes: "Joint interdenominational prayer night.", checklist: [
      { task: "Secure municipal sound permission", done: true },
      { task: "Rent spatial physical canopies", done: true },
      { task: "Mobilize intercession prayer logs", done: false }
    ], salvations: 12 }
  ]);

  const [videoLinks, rawSetVideoLinks] = useState<VideoLink[]>([
    { id: "vid_1", title: "Covenant Consecration Training Session", url: "https://www.youtube.com/watch?v=Xh06lRPhuV0", category: "Sermon", uploadedAt: "May 12, 2026" }
  ]);

  const [sentEmails, rawSetSentEmails] = useState<SentEmail[]>([
    { id: "mail_1", to: "All Members", subject: "Sovereign Grace Church - Pentecost Announcement Outlines", body: "Warm greeting beloved saints. This is to notify you of the upcoming miracle crusade in June...", sentAt: "May 18, 2026 10:15 AM", status: "Sent" }
  ]);

  // Sync mutations to Cloud Firestore helper
  const syncToFirestore = async (collectionName: string, prevList: any[], nextList: any[]) => {
    if (!auth.currentUser) return;
    try {
      // 1. Identify deleted records (in prevList but not in nextList)
      const deleted = prevList.filter(p => !nextList.some(n => n.id === p.id));
      for (const item of deleted) {
        await deleteDoc(doc(db, collectionName, item.id));
      }
      // 2. Identify created or modified records
      const updated = nextList.filter(n => {
        const prevItem = prevList.find(p => p.id === n.id);
        if (!prevItem) return true; // Added
        return JSON.stringify(prevItem) !== JSON.stringify(n); // Modified
      });
      for (const item of updated) {
        await setDoc(doc(db, collectionName, item.id), item);
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, collectionName);
    }
  };

  // Wrapped dispatchers conforming strictly to standard React setState type
  const setMembers = ((action: React.SetStateAction<Member[]>) => {
    rawSetMembers(prev => {
      const next = typeof action === "function" ? (action as any)(prev) : action;
      syncToFirestore("members", prev, next);
      return next;
    });
  }) as React.Dispatch<React.SetStateAction<Member[]>>;

  const setNewComers = ((action: React.SetStateAction<NewComer[]>) => {
    rawSetNewComers(prev => {
      const next = typeof action === "function" ? (action as any)(prev) : action;
      syncToFirestore("newcomers", prev, next);
      return next;
    });
  }) as React.Dispatch<React.SetStateAction<NewComer[]>>;

  const setAttendanceLogs = ((action: React.SetStateAction<AttendanceRecord[]>) => {
    rawSetAttendanceLogs(prev => {
      const next = typeof action === "function" ? (action as any)(prev) : action;
      syncToFirestore("attendance", prev, next);
      return next;
    });
  }) as React.Dispatch<React.SetStateAction<AttendanceRecord[]>>;

  const setSpecialEvents = ((action: React.SetStateAction<SpecialEvent[]>) => {
    rawSetSpecialEvents(prev => {
      const next = typeof action === "function" ? (action as any)(prev) : action;
      syncToFirestore("events", prev, next);
      return next;
    });
  }) as React.Dispatch<React.SetStateAction<SpecialEvent[]>>;

  const setVideoLinks = ((action: React.SetStateAction<VideoLink[]>) => {
    rawSetVideoLinks(prev => {
      const next = typeof action === "function" ? (action as any)(prev) : action;
      syncToFirestore("videos", prev, next);
      return next;
    });
  }) as React.Dispatch<React.SetStateAction<VideoLink[]>>;

  const setSentEmails = ((action: React.SetStateAction<SentEmail[]>) => {
    rawSetSentEmails(prev => {
      const next = typeof action === "function" ? (action as any)(prev) : action;
      syncToFirestore("emails", prev, next);
      return next;
    });
  }) as React.Dispatch<React.SetStateAction<SentEmail[]>>;

  // Auth & Sync Subscription Hook
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
    });

    const handleOnline = () => {
      setIsOnline(true);
      triggerToast("📡", "Network connection re-established.");
    };
    const handleOffline = () => {
      setIsOnline(false);
      triggerToast("🔌", "Operating in offline local-sandbox mode.");
    };
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      unsubscribe();
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  useEffect(() => {
    if (!user) return;

    const collectionsToSync = [
      { name: "members", setter: rawSetMembers, initialData: members },
      { name: "newcomers", setter: rawSetNewComers, initialData: newComers },
      { name: "attendance", setter: rawSetAttendanceLogs, initialData: attendanceLogs },
      { name: "events", setter: rawSetSpecialEvents, initialData: specialEvents },
      { name: "videos", setter: rawSetVideoLinks, initialData: videoLinks },
      { name: "emails", setter: rawSetSentEmails, initialData: sentEmails },
    ];

    const unsubscribes = collectionsToSync.map(({ name, setter, initialData }) => {
      return onSnapshot(collection(db, name), async (snapshot) => {
        if (snapshot.empty) {
          // Cold backup seeding
          try {
            for (const item of initialData) {
              await setDoc(doc(db, name, item.id), item);
            }
          } catch (e) {
            console.error(`Failed to seed ${name}:`, e);
          }
        } else {
          const items: any[] = [];
          snapshot.forEach(docSnap => {
            items.push(docSnap.data());
          });
          setter(items);
        }
      }, (error) => {
        console.error(`Firestore listener issue for ${name}:`, error);
      });
    });

    return () => {
      unsubscribes.forEach(unsub => unsub());
    };
  }, [user]);

  // Auth handler helpers
  const handleGoogleSignIn = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      triggerToast("🔐", `Divine authentication successful as ${result.user.displayName || result.user.email}!`);
    } catch (e: any) {
      triggerToast("⚠️", `Authentication error: ${e.message}`);
    }
  };

  const handleSignOutAuth = async () => {
    try {
      await signOut(auth);
      triggerToast("🚪", "Switched back to local simulation database.");
    } catch (e: any) {
      triggerToast("❌", `Failed to sign out: ${e.message}`);
    }
  };

  // Dashboard quick bulletin post announcements
  const [announcements, setAnnouncements] = useState<string[]>([
    "June Miracle Crusade logistics meeting this Wednesday at 6 PM.",
    "Youth Consecration weekend starting this Friday. Fasting manuals are active."
  ]);
  const [newAnnouncement, setNewAnnouncement] = useState("");

  // Floating Chatbot States
  const [showChatbot, setShowChatbot] = useState(false);
  const [chatbotInput, setChatbotInput] = useState("");
  const [isChatbotHighThinking, setIsChatbotHighThinking] = useState(true);
  const [chatbotMessages, setChatbotMessages] = useState<any[]>([
    { role: "assistant", content: "Warm shalom beloved. I am the FaithFlow AI Pastoral companion, equipped with deep scripture grounding. How can I assist you with theological study, sermon illustrations, or coordination?" }
  ]);
  const [chatbotLoading, setChatbotLoading] = useState(false);

  const handleChatbotSend = async () => {
    if (!chatbotInput.trim()) return;
    const userMsg = { role: "user", content: chatbotInput };
    setChatbotMessages(prev => [...prev, userMsg]);
    const originalInput = chatbotInput;
    setChatbotInput("");
    setChatbotLoading(true);

    try {
      const res = await fetch("/api/gemini/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...chatbotMessages, userMsg],
          systemInstruction: `You are the FaithFlow AI Ministry Assistant — a wise, scripture-grounded, pastoral companion. Anchor your answers theological soundness and relevant verse notations from ${preferredVersion} translation. Always cite accurately.`,
          useHighThinking: isChatbotHighThinking,
          version: preferredVersion
        })
      });
      const data = await res.json();
      setChatbotMessages(prev => [...prev, { role: "assistant", content: data.text }]);
    } catch(e) {
      setChatbotMessages(prev => [...prev, { role: "assistant", content: "Grace to you. Operating in high latency safeguard mode. Let us meditate on Psalm 23." }]);
    } finally {
      setChatbotLoading(false);
    }
  };

  // Church Calendar Custom states
  const [calendarMonthIndex, setCalendarMonthIndex] = useState(4); // May
  const daysInMay = Array.from({ length: 31 }, (_, i) => i + 1);
  const activeEventsMap: { [day: number]: { title: string; type: "gold" | "blue" | "green" } } = {
    10: { title: "Sundays Service", type: "gold" },
    13: { title: "Prayer Vigil", type: "blue" },
    17: { title: "Pentecost Study", type: "gold" },
    24: { title: "Greater Crusade Prep", type: "green" },
    31: { title: "Sanctuary Dedication", type: "gold" }
  };

  // AI-Powered Brand Customization
  const [isGeneratingBranding, setIsGeneratingBranding] = useState(false);
  const [brandingInstruction, setBrandingInstruction] = useState("");

  const handleAIBrandingRefine = async () => {
    if (!brandingInstruction.trim()) {
      triggerToast("⚠️", "Please specify what custom focus or theological theme you want!");
      return;
    }
    setIsGeneratingBranding(true);
    triggerToast("✨", "Deliberating scripture alignments and branding layouts...");
    try {
      const res = await fetch("/api/gemini/branding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentTitle: platformTitle,
          currentSubtitle: churchName,
          currentLogo: logoType,
          instruction: brandingInstruction
        })
      });
      const data = await res.json();
      if (data.refinedPlatformTitle) setPlatformTitle(data.refinedPlatformTitle);
      if (data.refinedChurchName) setChurchName(data.refinedChurchName);
      if (data.suggestedLogo) setLogoType(data.suggestedLogo);
      
      triggerToast("👑", data.theologicalConcept || "New sanctified branding configurations successfully deployed!");
      setBrandingInstruction("");
    } catch (e) {
      triggerToast("⚠️", "Branding system error. Applied covenant default standard offline.");
    } finally {
      setIsGeneratingBranding(false);
    }
  };

  const renderBrandingLogo = () => {
    switch (logoType) {
      case "cross":
        return <Heart className="w-5 h-5 text-[#D4AF37] animate-pulse" />;
      case "crown":
        return <Crown className="w-5 h-5 text-[#D4AF37] animate-pulse" />;
      case "dove":
        return <Sparkles className="w-5 h-5 text-[#D4AF37] animate-pulse" />;
      case "star":
        return <Star className="w-5 h-5 text-[#D4AF37] animate-pulse" />;
      case "sun":
        return <Sun className="w-5 h-5 text-[#D4AF37] animate-pulse" />;
      case "shield":
        return <Shield className="w-5 h-5 text-[#D4AF37] animate-pulse" />;
      case "flame":
      default:
        return <Flame className="w-5 h-5 text-[#D4AF37] animate-pulse" />;
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0F1E] text-white flex flex-col font-sans-raleway selection:bg-[#D4AF37] selection:text-black">
      
      {/* Toast popup panel */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-[#112055] border border-[#D4AF37] p-3 rounded-xl shadow-2xl flex items-center gap-2.5 animate-fade-in text-xs max-w-sm gold-glow">
          <span className="text-xl">{toast.icon}</span>
          <p className="font-semibold text-white leading-normal pr-5">{toast.msg}</p>
        </div>
      )}

      {/* Offline Indicator Alert Banner */}
      {isOffline && (
        <div className="bg-amber-500 text-black text-[11px] font-semibold text-center py-1 flex items-center justify-center gap-1.5 border-b border-amber-600">
          <AlertTriangle className="w-3.5 h-3.5" />
          Offline Operational local mode activated. Updates will queue for local storage.
        </div>
      )}

      {/* GLOBAL APPN HEADER BAR */}
      <header className="border-b border-[#D4AF37]/25 bg-[#0D1B3E] px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 sticky top-0 z-40">
        <div className="flex items-center gap-2.5">
          <div className="bg-[#D4AF37]/15 p-1.5 rounded-lg border border-[#D4AF37]/35 shadow-inner cursor-pointer hover:bg-[#D4AF37]/25 transition" onClick={() => setActiveTab("settings")} title="Customize App Branding">
            {renderBrandingLogo()}
          </div>
          <div className="cursor-pointer" onClick={() => setActiveTab("settings")} title="Customize App Branding">
            <h1 className="text-sm tracking-wider font-bold text-white font-decorative uppercase flex items-center gap-1.5">
              {platformTitle}
            </h1>
            <p className="text-[10px] text-slate-400 font-memo uppercase tracking-widest">{churchName}</p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs font-semibold">
          <div className="hidden sm:flex items-center gap-1.5 bg-[#0A0F1E] px-3 py-1 rounded-full border border-white/5 shadow-inner">
            <Clock className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span className="font-memo font-bold pt-0.5 text-white">
              {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Global Connection sync status indicator */}
            <span className={`text-[10px] flex items-center gap-1 border px-2 py-0.5 rounded font-memo ${
              isOnline 
                ? "bg-emerald-950/40 border-emerald-500/30 text-emerald-400 font-bold" 
                : "bg-amber-950/40 border-amber-500/35 text-amber-400 font-bold animate-pulse"
            }`} title={isOnline ? "Connected and Synced" : "Offline Sandbox Active"}>
              <span className={`w-1.5 h-1.5 rounded-full ${isOnline ? "bg-emerald-400 shadow-sm" : "bg-amber-400"}`} />
              {isOnline ? "Online" : "Offline"}
            </span>
            <span className="text-[10px] bg-[#D4AF37]/10 border border-[#D4AF37]/35 text-[#D4AF37] px-2 py-0.5 rounded font-memo">{preferredVersion} Version</span>
            <div 
              onClick={() => setActiveTab("settings")}
              className="w-7 h-7 bg-[#D4AF37] text-black font-extrabold flex items-center justify-center rounded-full cursor-pointer hover:bg-[#F0C940] transition duration-200"
              title="Church Settings Profile"
            >
              AS
            </div>
          </div>
        </div>
      </header>

      {/* MAIN LAYOUT BODY */}
      <div className="flex-1 flex flex-col md:flex-row">
        
        {/* NAVIGATIONAL TAB PANEL VERTICAL SIDEBAR */}
        <aside className="w-full md:w-60 bg-gradient-to-b from-[#0A0F1E] to-[#0D1B3E] border-r border-[#D4AF37]/25 p-4 flex flex-col gap-5">
          <div className="space-y-4 font-sans-raleway">
            
            {/* Group 1: Ministry Home */}
            <div className="space-y-1.5">
              <span className="text-[9px] font-bold text-[#D4AF37] uppercase tracking-widest block font-sans border-b border-[#D4AF37]/10 pb-0.5 mb-1">
                Ministry Home
              </span>
              {[
                { id: "dashboard", label: "Overview Dashboard", icon: LayoutDashboard },
                { id: "calendar", label: "Assembly Calendar", icon: Calendar }
              ].map(item => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as any)}
                  className={`w-full flex items-center justify-between text-left text-xs px-2.5 py-1.8 rounded-lg border transition-all duration-200 font-medium cursor-pointer ${
                    activeTab === item.id 
                      ? "bg-[#D4AF37] border-[#D4AF37] text-black font-black"
                      : "bg-transparent border-transparent text-[#B0C4DE] hover:bg-[#112055]/30 hover:text-white"
                  }`}
                >
                  <span className="flex items-center gap-2 font-semibold">
                    <item.icon className="w-3.5 h-3.5" /> {item.label}
                  </span>
                  <ChevronRight className="w-3 h-3 opacity-60" />
                </button>
              ))}
            </div>

            {/* Group 2: AI Bible Tools */}
            <div className="space-y-1.5">
              <span className="text-[9px] font-bold text-[#D4AF37] uppercase tracking-widest block font-sans border-b border-[#D4AF37]/10 pb-0.5 mb-1">
                AI Bible study tools
              </span>
              {[
                { id: "bible", label: "Bible Study Suite", icon: BookOpen },
                { id: "prep", label: "Sermon Preparation", icon: Volume2 }
              ].map(item => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as any)}
                  className={`w-full flex items-center justify-between text-left text-xs px-2.5 py-1.8 rounded-lg border transition-all duration-200 font-medium cursor-pointer ${
                    activeTab === item.id 
                      ? "bg-[#D4AF37] border-[#D4AF37] text-black font-black"
                      : "bg-transparent border-transparent text-[#B0C4DE] hover:bg-[#112055]/30 hover:text-white"
                  }`}
                >
                  <span className="flex items-center gap-2 font-semibold">
                    <item.icon className="w-3.5 h-3.5 animate-pulse" /> {item.label}
                  </span>
                  <ChevronRight className="w-3 h-3 opacity-60" />
                </button>
              ))}
            </div>

            {/* Group 3: Church Operations */}
            <div className="space-y-1.5">
              <span className="text-[9px] font-bold text-[#D4AF37] uppercase tracking-widest block font-sans border-b border-[#D4AF37]/10 pb-0.5 mb-1">
                Church Operations
              </span>
              {[
                { id: "management", label: "Congregation Records", icon: Users },
                { id: "media", label: "Multimedia Pathways", icon: Mail }
              ].map(item => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as any)}
                  className={`w-full flex items-center justify-between text-left text-xs px-2.5 py-1.8 rounded-lg border transition-all duration-200 font-medium cursor-pointer ${
                    activeTab === item.id 
                      ? "bg-[#D4AF37] border-[#D4AF37] text-black font-black"
                      : "bg-transparent border-transparent text-[#B0C4DE] hover:bg-[#112055]/30 hover:text-white"
                  }`}
                >
                  <span className="flex items-center gap-2 font-semibold">
                    <item.icon className="w-3.5 h-3.5" /> {item.label}
                  </span>
                  <ChevronRight className="w-3 h-3 opacity-60" />
                </button>
              ))}
            </div>

            {/* Group 4: Subscriptions */}
            <div className="space-y-1.5">
              <span className="text-[9px] font-bold text-[#D4AF37] uppercase tracking-widest block font-sans border-b border-[#D4AF37]/10 pb-0.5 mb-1">
                Administration
              </span>
              {[
                { id: "sub", label: "Subscription Billing", icon: BadgeInfo },
                { id: "settings", label: "Custom Settings", icon: Sliders }
              ].map(item => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as any)}
                  className={`w-full flex items-center justify-between text-left text-xs px-2.5 py-1.8 rounded-lg border transition-all duration-200 font-medium cursor-pointer ${
                    activeTab === item.id 
                      ? "bg-[#D4AF37] border-[#D4AF37] text-black font-black"
                      : "bg-transparent border-transparent text-[#B0C4DE] hover:bg-[#112055]/30 hover:text-white"
                  }`}
                >
                  <span className="flex items-center gap-2 font-semibold">
                    <item.icon className="w-3.5 h-3.5" /> {item.label}
                  </span>
                  <ChevronRight className="w-3 h-3 opacity-60" />
                </button>
              ))}
            </div>

          </div>

          {/* Quick Stats sidebar Card */}
          <div className="hidden md:block mt-auto bg-[#112055]/40 border border-[#D4AF37]/20 p-3 rounded-xl space-y-2">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Registry Counters</span>
            <div className="grid grid-cols-2 gap-2 text-center text-xs">
              <div className="bg-[#0A0F1E] border border-white/5 py-1.5 rounded">
                <span className="text-[10px] text-slate-405 block">Disciples</span>
                <span className="font-memo font-bold text-[#D4AF37] text-sm">{members.length}</span>
              </div>
              <div className="bg-[#0A0F1E] border border-white/5 py-1.5 rounded">
                <span className="text-[10px] text-slate-405 block">New guests</span>
                <span className="font-memo font-bold text-emerald-400 text-sm">{newComers.length}</span>
              </div>
            </div>
          </div>
        </aside>

        {/* DYNAMIC SCENE PANELS */}
        <main className="flex-1 p-4 md:p-6 overflow-y-auto space-y-6">
          
          {/* TAB 1: OVERVIEW DASHBOARD */}
          {activeTab === "dashboard" && (
            <div className="space-y-6 animate-fade-in font-sans-raleway">
              
              {/* Metric Row */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: "Aggregate Registered Flock", val: `${members.length} members`, sub: "+1 added this week", icon: Users, color: "text-[#D4AF37]" },
                  { label: "First-Timers Tracking", val: `${newComers.length} guests`, sub: "Assigned follow-up active", icon: Bot, color: "text-emerald-400" },
                  { label: "Scheduled Crusades", val: "1 Scheduled", sub: "June 18-20", icon: Calendar, color: "text-blue-400" },
                  { label: "Active Platform Status", val: "Premium Active", sub: "Wipe & Maintenance OK", icon: ShieldCheck, color: "text-amber-400" }
                ].map((stat, i) => (
                  <div key={i} className="border border-[#D4AF37]/30 bg-[#0D1B3E] p-3 rounded-xl gold-glow hover:border-[#D4AF37]/80 transition duration-150">
                    <div className="flex justify-between items-start text-xs text-slate-400 mb-1">
                      <span className="font-semibold text-slate-350">{stat.label}</span>
                      <stat.icon className={`w-4 h-4 ${stat.color}`} />
                    </div>
                    <p className="text-base font-bold text-white font-serif-cinzel">{stat.val}</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">{stat.sub}</p>
                  </div>
                ))}
              </div>

              {/* Large Grid Actions & Bulletins */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                
                {/* Bulletins Board */}
                <div className="md:col-span-2 border border-[#D4AF37]/30 bg-[#0D1B3E] p-4 rounded-xl gold-glow space-y-3">
                  <span className="text-xs font-serif-cinzel font-bold text-white tracking-wider flex items-center gap-1.5 border-b border-[#D4AF37]/15 pb-2">
                    <Sparkles className="w-4 h-4 text-[#D4AF37]" /> Active Pulpit Notifications & Bulletins
                  </span>

                  <div className="space-y-2 max-h-44 overflow-y-auto">
                    {announcements.map((ann, i) => (
                      <div key={i} className="bg-[#0A0F1E] border border-white/5 p-3 rounded-lg flex items-start gap-2 text-xs text-[#B0C4DE]">
                        <ChevronRight className="w-4 h-4 text-[#D4AF37] mt-0.5 shrink-0" />
                        <p>{ann}</p>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      placeholder="Draft a sudden church announcement with scriptural authority..."
                      value={newAnnouncement}
                      onChange={e => setNewAnnouncement(e.target.value)}
                      className="flex-1 bg-[#0A0F1E] text-white border border-[#D4AF37]/20 rounded-lg px-3 py-1.5 text-xs focus:outline-none"
                    />
                    <button
                      onClick={() => {
                        if (!newAnnouncement.trim()) return;
                        setAnnouncements(prev => [...prev, newAnnouncement]);
                        setNewAnnouncement("");
                        triggerToast("📢", "Pulpit Announcement published to bulletin.");
                      }}
                      className="bg-[#D4AF37] text-black text-xs font-bold px-3 py-1 border border-[#D4AF37] rounded-lg"
                    >
                      Publish Alert
                    </button>
                  </div>
                </div>

                {/* Micro Action card with Bible Study prompts */}
                <div className="border border-[#D4AF37]/30 bg-[#0D1B3E] p-4 rounded-xl space-y-3.5 font-sans-raleway">
                  <span className="text-xs font-serif-cinzel font-bold text-white block uppercase tracking-wider">Quick Action Gateway</span>
                  
                  <div className="space-y-2">
                    <button onClick={() => setActiveTab("bible")} className="w-full text-left bg-[#112055] hover:bg-[#112055]/70 border border-[#D4AF37]/30 text-[#D4AF37] text-xs font-semibold py-2 px-3 rounded-lg transition-all duration-150 flex items-center justify-between">
                      <span>Launch BibleGPT Study</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => setActiveTab("prep")} className="w-full text-left bg-[#112055] hover:bg-[#112055]/70 border border-[#D4AF37]/30 text-[#D4AF37] text-xs font-semibold py-2 px-3 rounded-lg transition-all duration-150 flex items-center justify-between">
                      <span>Prepare Custom Sermon</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => setActiveTab("media")} className="w-full text-left bg-[#112055] hover:bg-[#112055]/70 border border-[#D4AF37]/30 text-[#D4AF37] text-xs font-semibold py-2 px-3 rounded-lg transition-all duration-150 flex items-center justify-between">
                      <span>Analyze Outreach YouTube video</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* TAB 2: CHURCH CALENDAR */}
          {activeTab === "calendar" && (
            <div className="border border-[#D4AF37]/30 bg-[#0D1B3E] p-4 rounded-xl space-y-4 gold-glow animate-fade-in font-sans-raleway">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 border-b border-[#D4AF37]/15 pb-3">
                <h2 className="text-base font-serif-cinzel font-bold text-white flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-[#D4AF37]" /> Active Liturgical Calendar (May 2026)
                </h2>
                <div className="flex bg-[#0A0F1E] border border-white/5 rounded-lg p-1 text-xs">
                  <span className="bg-[#D4AF37] text-black px-3 py-1 rounded-md font-bold">Month View</span>
                  <span className="text-slate-450 px-3 py-1 rounded inline-block">Week</span>
                </div>
              </div>

              {/* Monthly Calendar Grid layout */}
              <div className="grid grid-cols-7 gap-1 text-center font-sans">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => (
                  <span key={day} className="text-[10px] uppercase font-bold text-[#D4AF37] py-1 bg-[#112055]/30 rounded">
                    {day}
                  </span>
                ))}
                
                {/* 3 placeholder days to shift block */}
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="min-h-[50px] bg-transparent" />
                ))}

                {daysInMay.map(day => {
                  const ev = activeEventsMap[day];
                  return (
                    <div 
                      key={day} 
                      onClick={() => {
                        if (ev) triggerToast("📅", ` Liturgical Event: ${ev.title}`);
                      }}
                      className={`min-h-[54px] p-1 border border-white/5 rounded-lg text-left transition ${
                        day === 20 ? "bg-[#D4AF37]/15 border-[#D4AF37]" : "bg-[#0A0F1E]/50 hover:bg-[#112055]/20"
                      }`}
                    >
                      <span className={`text-[10px] font-bold font-memo ${day === 20 ? "text-[#D4AF37]" : "text-slate-400"}`}>
                        {day} {day === 20 && " (Today)"}
                      </span>
                      {ev && (
                        <p className={`text-[8px] px-1 py-0.5 rounded truncate font-sans-raleway font-semibold leading-normal ${
                          ev.type === "gold" ? "bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/20" : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/15"
                        }`}>
                          {ev.title}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: BIBLE TOOLS */}
          {activeTab === "bible" && (
            <div className="animate-fade-in">
              <BibleTools 
                triggerToast={triggerToast} 
                preferredVersion={preferredVersion} 
                setPreferredVersion={setPreferredVersion}
                isOffline={isOffline}
              />
            </div>
          )}

          {/* TAB 4: SERMON PREPARATION */}
          {activeTab === "prep" && (
            <div className="animate-fade-in">
              <SermonPrepStudio 
                apiKeyActive={apiKeyActive} 
                triggerToast={triggerToast}
                preferredVersion={preferredVersion}
              />
            </div>
          )}

          {/* TAB 5: MANAGEMENT */}
          {activeTab === "management" && (
            <div className="animate-fade-in">
              <ChurchManagement
                members={members}
                setMembers={setMembers}
                newComers={newComers}
                setNewComers={setNewComers}
                attendanceLogs={attendanceLogs}
                setAttendanceLogs={setAttendanceLogs}
                specialEvents={specialEvents}
                setSpecialEvents={setSpecialEvents}
                triggerToast={triggerToast}
              />
            </div>
          )}

          {/* TAB 6: MULTIMEDIA AND EMAILS */}
          {activeTab === "media" && (
            <div className="animate-fade-in">
              <MediaComm
                apiKeyActive={apiKeyActive}
                videoLinks={videoLinks}
                setVideoLinks={setVideoLinks}
                sentEmails={sentEmails}
                setSentEmails={setSentEmails}
                triggerToast={triggerToast}
              />
            </div>
          )}

          {/* TAB 7: SUBSCRIPTIONS & OFFERS */}
          {activeTab === "sub" && (
            <div className="space-y-6 animate-fade-in font-sans-raleway">
              <div className="text-center max-w-xl mx-auto space-y-2">
                <span className="text-[10px] font-bold text-[#D4AF37] tracking-widest uppercase block">FaithFlow License Access</span>
                <h2 className="text-xl font-serif-cinzel font-bold text-white">Select Your Assembly Level Authorization</h2>
                <p className="text-xs text-[#B0C4DE]">
                  We prioritize continuous covenant tooling access. All packages are securely encrypted.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-4xl mx-auto">
                {/* Package 1 */}
                <div className="border border-white/10 bg-[#0D1B3E] p-5 rounded-2xl space-y-4 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Beta Trial</span>
                    <h3 className="text-lg font-serif-cinzel font-bold text-white mt-1">7-Day Free Trial</h3>
                    <p className="text-[#B0C4DE] text-xs leading-relaxed mt-2">
                      Full functional testing access to outline generators, BibleGPT databases, guest logs, and audio transcripts.
                    </p>
                  </div>
                  <div className="pt-4">
                    <p className="text-sm font-bold text-[#D4AF37] mb-3">$0.00 / No obligations</p>
                    <button 
                      onClick={() => triggerToast("✓", "Active Beta trial initialized instantly.")}
                      className="w-full bg-[#112055] hover:bg-[#112055]/70 border border-[#D4AF37]/30 text-white font-semibold text-xs py-2 rounded-lg transition"
                    >
                      Start Free Trial
                    </button>
                  </div>
                </div>

                {/* Package 2 */}
                <div className="border border-[#D4AF37] bg-[#112055] p-5 rounded-2xl space-y-4 flex flex-col justify-between gold-glow relative overflow-hidden">
                  <div className="absolute top-2 right-2 bg-[#D4AF37] text-[#0A0F1E] text-[8px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded">
                    Popular
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-[#D4AF37] uppercase block">Shepherd Monthly</span>
                    <h3 className="text-lg font-serif-cinzel font-bold text-white mt-1">Standard Monthly</h3>
                    <p className="text-[#B0C4DE] text-xs leading-relaxed mt-2">
                      Full access to live Veo visual generators, Sound doctrine filters, text-to-speech converters, and premium calendar synchronizers.
                    </p>
                  </div>
                  <div className="pt-4">
                    <p className="text-base font-bold text-[#D4AF37] mb-3">$9.99 / Monthly</p>
                    <button 
                      onClick={() => triggerToast("✨", "Navigating to secure integration billing portal...")}
                      className="w-full bg-[#D4AF37] hover:bg-[#F0C940] text-black font-extrabold text-xs py-2 rounded-lg transition"
                    >
                      Subscribe Monthly
                    </button>
                  </div>
                </div>

                {/* Package 3 */}
                <div className="border border-white/10 bg-[#0D1B3E] p-5 rounded-2xl space-y-4 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 block uppercase">Covenant Yearly</span>
                    <h3 className="text-lg font-serif-cinzel font-bold text-white mt-1">Assembly Yearly</h3>
                    <p className="text-[#B0C4DE] text-xs leading-relaxed mt-2">
                      Complete, uninterrupted multi-minister access limits. Save 17% and lock in constant premium low-latency processing speeds.
                    </p>
                  </div>
                  <div className="pt-4">
                    <p className="text-sm font-bold text-[#D4AF37] mb-3">$99.99 / Year (Best Value)</p>
                    <button 
                      onClick={() => triggerToast("✨", "Initializing continuous annual covenant token...")}
                      className="w-full bg-[#112055] hover:bg-[#112055]/70 border border-[#D4AF37]/30 text-white font-semibold text-xs py-2 rounded-lg transition"
                    >
                      Subscribe Yearly
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 8: SETTINGS PANEL */}
          {activeTab === "settings" && (
            <div className="border border-[#D4AF37]/30 bg-[#0D1B3E] p-4 rounded-xl space-y-4 gold-glow animate-fade-in font-sans-raleway text-xs text-[#B0C4DE]">
              <div className="flex justify-between items-center border-b border-[#D4AF37]/15 pb-2">
                <h2 className="text-base font-serif-cinzel font-bold text-white flex items-center gap-1.5">
                  <Sliders className="w-4.5 h-4.5 text-[#D4AF37]" /> App Settings and Parish Configurations
                </h2>
                <span className="text-[10px] bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/30 px-2.5 py-0.5 rounded font-mono uppercase font-bold">
                  Branding Active
                </span>
              </div>

              {/* 1. SECURE BRANDING EDIT SUITE (connected name and logo edit) */}
              <div className="bg-[#0A1128] border border-[#D4AF37]/25 rounded-xl p-4 space-y-4">
                <div className="flex items-center justify-between border-b border-white/5 pb-2">
                  <span className="text-[11px] font-bold text-[#D4AF37] uppercase tracking-wider flex items-center gap-1">
                    <Sparkles className="w-4 h-4 text-[#D4AF37]" /> Connected Platform Branding Suite
                  </span>
                  <span className="text-[10px] text-slate-400">Live Header Synchronization</span>
                </div>

                {/* Quick-Change Presets Row */}
                <div className="bg-[#112055]/20 border border-[#D4AF37]/15 rounded-lg p-2.5 space-y-2">
                  <span className="text-[9px] font-bold text-slate-300 font-mono uppercase tracking-wider block">⚡ Quick-Apply Sacred Brand Presets</span>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setPlatformTitle("CHURCH MOBILE PLATFORM");
                        setChurchName("For Righteousness and Holiness");
                        setLogoType("cross");
                        triggerToast("👑", "Loaded 'CHURCH MOBILE PLATFORM - For Righteousness and Holiness' preset. Click 'Save Configuration' below to pin!");
                      }}
                      className="bg-[#D4AF37]/10 hover:bg-[#D4AF37]/25 text-[#D4AF37] border border-[#D4AF37]/35 text-[10px] font-bold px-3 py-1 rounded transition duration-150 cursor-pointer"
                    >
                      CHURCH MOBILE PLATFORM Preset
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setPlatformTitle("FAITHFLOW MINISTRY PLATFORM");
                        setChurchName("Trinity sanctified assembly");
                        setLogoType("flame");
                        triggerToast("🔥", "Loaded 'FaithFlow Ministry' preset.");
                      }}
                      className="bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 text-[10px] font-medium px-3 py-1 rounded transition duration-150 cursor-pointer"
                    >
                      FaithFlow Standard
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setPlatformTitle("COVENANT HOLINESS UNION");
                        setChurchName("Walking in Sovereignty and Grace");
                        setLogoType("shield");
                        triggerToast("🛡️", "Loaded 'Covenant Holiness' preset.");
                      }}
                      className="bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 text-[10px] font-medium px-3 py-1 rounded transition duration-150 cursor-pointer"
                    >
                      Covenant Shield Preset
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-300 mb-1 font-mono uppercase tracking-wider">
                        Main Platform Title (Upper Case)
                      </label>
                      <input 
                        type="text" 
                        value={platformTitle} 
                        onChange={e => setPlatformTitle(e.target.value)}
                        className="w-full bg-[#050B1E] text-white py-1.5 px-3 border border-[#D4AF37]/30 rounded-lg text-xs font-bold font-decorative tracking-wider focus:outline-none focus:border-[#D4AF37]" 
                        placeholder="e.g. FAITHFLOW MINISTRY PLATFORM"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-300 mb-1 font-mono uppercase tracking-wider">
                        Assembly Subtitle Name (Parish)
                      </label>
                      <input 
                        type="text" 
                        value={churchName} 
                        onChange={e => setChurchName(e.target.value)}
                        className="w-full bg-[#050B1E] text-white py-1.5 px-3 border border-[#D4AF37]/30 rounded-lg text-xs focus:outline-none focus:border-[#D4AF37]" 
                        placeholder="e.g. Trinity sanctified assembly"
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="block text-[11px] font-semibold text-slate-300 font-mono uppercase tracking-wider">
                      Select Holy Logo Icon
                    </label>
                    <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                      {[
                        { id: "flame", icon: Flame, tooltip: "Pentecost Revival Flame" },
                        { id: "cross", icon: Heart, tooltip: "Orthodox Redemptive Love" },
                        { id: "crown", icon: Crown, tooltip: "Sovereign Kingdom Majesty" },
                        { id: "dove", icon: Sparkles, tooltip: "Spirit Communion Dove" },
                        { id: "star", icon: Star, tooltip: "Bethlehem Guidance Star" },
                        { id: "sun", icon: Sun, tooltip: "Righteousness Glory Sun" },
                        { id: "shield", icon: Shield, tooltip: "Shield of Shielding Faith" }
                      ].map(item => {
                        const IconComponent = item.icon;
                        const isSelected = logoType === item.id;
                        return (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => {
                              setLogoType(item.id as any);
                              triggerToast("🖌️", `App logo switched to ${item.tooltip}!`);
                            }}
                            className={`p-2.5 rounded-lg border flex flex-col items-center justify-center transition duration-200 cursor-pointer ${
                              isSelected 
                                ? "bg-[#D4AF37]/20 border-[#D4AF37] text-[#D4AF37] shadow-inner font-bold" 
                                : "bg-[#050B1E] border-white/5 hover:border-[#D4AF37]/30 text-slate-400 hover:text-white"
                            }`}
                            title={item.tooltip}
                          >
                            <IconComponent className={`w-5 h-5 ${isSelected ? "animate-bounce" : ""}`} />
                            <span className="text-[8px] uppercase tracking-wider mt-1 truncate max-w-full font-bold">{item.id}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Secure persistence and manual lock control bar */}
                <div className="flex flex-wrap justify-between items-center gap-3 bg-[#050B1E] p-3 rounded-lg border border-[#D4AF37]/15">
                  <div className="space-y-0.5">
                    <p className="text-[11px] font-bold text-white uppercase tracking-wider flex items-center gap-1">
                      <Check className="w-3.5 h-3.5 text-emerald-500 animate-pulse" /> Platform Configuration Live
                    </p>
                    <p className="text-[10px] text-slate-400">All configurations are connected & synced dynamically to local memory databases.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      localStorage.setItem("faithflow_platform_title", platformTitle);
                      localStorage.setItem("faithflow_church_name", churchName);
                      localStorage.setItem("faithflow_logo_type", logoType);
                      triggerToast("💾", "Sacred parish branding successfully saved & applied permanently!");
                    }}
                    className="bg-[#D4AF37] hover:bg-[#F0C940] text-black font-bold text-[10px] px-3.5 py-1.5 rounded transition duration-200 cursor-pointer flex items-center gap-1.5 font-mono uppercase tracking-wider shadow-sm"
                  >
                    <Save className="w-3.5 h-3.5" /> Save Configuration
                  </button>
                </div>

                {/* AI-Powered Branding Generative Helper */}
                <div className="bg-[#112055]/30 border border-dashed border-[#D4AF37]/30 rounded-xl p-3 space-y-2.5">
                  <div className="flex items-center gap-1 text-[11px] text-white font-bold uppercase">
                    <Sparkles className="w-3.5 h-3.5 text-[#D4AF37] animate-pulse" /> AI-Powered Branding Concept Refiner
                  </div>
                  <p className="text-[10px] text-slate-400">
                    Input a specific ministerial direction, vision, or theological emphasis (e.g. <i>"Deep covenant holiness with Bethlehem guiding star"</i>, <i>"Reformed Sovereign Grace under Christ's Crown"</i>) and let the AI instantly customize titles, subtitling, and configure the optimal holy logo standard.
                  </p>
                  
                  <div className="flex gap-2">
                    <input 
                      type="text"
                      value={brandingInstruction}
                      onChange={e => setBrandingInstruction(e.target.value)}
                      placeholder="e.g. 'Align branding to covenant deliverance and divine fire shield'"
                      className="flex-1 bg-[#050B1E] text-white border border-[#D4AF37]/30 rounded px-2.5 py-1 text-xs focus:outline-none placeholder:text-slate-500 font-mono"
                      onKeyDown={e => e.key === "Enter" && handleAIBrandingRefine()}
                    />
                    <button
                      type="button"
                      onClick={handleAIBrandingRefine}
                      disabled={isGeneratingBranding}
                      className="bg-[#D4AF37] hover:bg-[#F0C940] text-black font-bold text-[11px] px-3 py-1 rounded transition duration-200 cursor-pointer flex items-center gap-1 shrink-0 disabled:opacity-50"
                    >
                      {isGeneratingBranding ? "Generating..." : "Generate with AI"}
                    </button>
                  </div>
                </div>
              </div>

              {/* FIREBASE BACKEND AND CLOUD SYNCHRONIZER CONNECTION CENTER */}
              <div className="bg-[#0D1B3E] border border-[#D4AF37]/35 rounded-xl p-4.5 space-y-3.5 shadow-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CloudLightning className="w-4.5 h-4.5 text-[#D4AF37] animate-pulse" />
                    <div>
                      <h3 className="text-xs font-serif-cinzel font-bold text-[#D4AF37] tracking-widest uppercase mb-0.5">Firebase Backend Connection Center</h3>
                      <p className="text-[10px] text-slate-400">Secure real-time database synchronizers & administrative authentication gates</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {/* Physical Network sync status */}
                    <span className={`text-[9px] font-mono px-2 py-0.5 rounded border uppercase flex items-center gap-1 font-bold ${
                      isOnline ? "bg-emerald-950 text-emerald-400 border-emerald-500/30" : "bg-amber-950 text-amber-400 border-amber-500/30 animate-pulse"
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${isOnline ? "bg-emerald-400" : "bg-amber-400"}`} />
                      {isOnline ? "Cloud Sync Active" : "Local Cache Queue"}
                    </span>
                    {authLoading ? (
                      <span className="text-[9px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded animate-pulse font-mono">Initializing Auth Flow...</span>
                    ) : user ? (
                      <span className="text-[9px] bg-emerald-950 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded font-mono font-bold uppercase flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping" /> Connection Live
                      </span>
                    ) : (
                      <span className="text-[9px] bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/30 px-2 py-0.5 rounded font-mono font-bold uppercase flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-[#D4AF37] rounded-full" /> Local Fallback Mode
                      </span>
                    )}
                  </div>
                </div>

                {!user ? (
                  <div className="bg-[#050B1E] border border-white/5 rounded-lg p-3.5 space-y-3">
                    <p className="text-[11px] leading-relaxed text-slate-300">
                      Connect your Cloud Firestore database to enable secure persistent profiles, live collaborative synchronization across browsers, and standard secure multi-user role gates. All mock client tables will be safely seeded up to the cloud automatically!
                    </p>
                    <button
                      type="button"
                      onClick={handleGoogleSignIn}
                      className="bg-[#D4AF37] hover:bg-[#F0C940] text-black font-extrabold text-[11px] font-mono px-4 py-2 rounded-lg transition duration-200 cursor-pointer flex items-center gap-2 uppercase tracking-wider"
                    >
                      <LogIn className="w-4 h-4" /> Sign In with Google Cloud Auth
                    </button>
                  </div>
                ) : (
                  <div className="bg-[#050B1E] border border-emerald-500/15 rounded-lg p-3.5 space-y-3.5">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <img 
                          src={user.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.uid}`} 
                          alt="avatar" 
                          referrerPolicy="no-referrer"
                          className="w-10 h-10 rounded-full border border-[#D4AF37]" 
                        />
                        <div className="space-y-0.5">
                          <p className="text-xs font-bold text-white font-mono">{user.displayName || "Divine Saint"}</p>
                          <p className="text-[10px] text-slate-400">{user.email}</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={handleSignOutAuth}
                        className="bg-white/5 hover:bg-white/10 hover:text-rose-400 text-slate-300 font-semibold text-[10px] px-3 py-1.5 rounded transition duration-150 cursor-pointer flex items-center gap-1.5 border border-white/10"
                      >
                        <LogOut className="w-3.5 h-3.5" /> Sign Out Session
                      </button>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 pt-2 border-t border-white/5 font-mono">
                      {[
                        { label: "Members", count: members.length },
                        { label: "Newcomers", count: newComers.length },
                        { label: "Attendance", count: attendanceLogs.length },
                        { label: "Events", count: specialEvents.length },
                        { label: "Videos", count: videoLinks.length },
                        { label: "Emails", count: sentEmails.length }
                      ].map((item, ip) => (
                        <div key={ip} className="bg-[#0A0F1E] border border-white/5 p-2 rounded text-center">
                          <span className="text-[8px] text-slate-500 uppercase tracking-wider block font-bold">{item.label}</span>
                          <span className="text-xs font-bold text-[#D4AF37] font-mono">{item.count} docs</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* 2. CORE UTILITY CONFIGURATIONS */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-white/5 pt-4">
                <div className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-semibold mb-1">Global Bible Translation Override</label>
                    <select
                      value={preferredVersion}
                      onChange={e => {
                        setPreferredVersion(e.target.value);
                        triggerToast("⚙️", `Global default translation switched to ${e.target.value}.`);
                      }}
                      className="w-full bg-[#0A0F1E] text-white p-2 border border-white/15 rounded-lg text-xs focus:outline-none focus:border-[#D4AF37]/50"
                    >
                      <option value="KJV">King James Version (KJV)</option>
                      <option value="NKJV">New King James Version (NKJV)</option>
                      <option value="NIV">New International Version (NIV)</option>
                      <option value="ESV">English Standard Version (ESV)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1">Timezone Coordinates</label>
                    <input 
                      type="text" 
                      value={timezone} 
                      onChange={e => setTimezone(e.target.value)}
                      className="w-full bg-[#0A0F1E] text-white p-2 border border-white/15 rounded-lg text-xs focus:outline-none focus:border-[#D4AF37]/50" 
                    />
                  </div>
                </div>

                {/* Maintenance zone */}
                <div className="bg-rose-950/20 border border-rose-500/20 p-4 rounded-xl space-y-2">
                  <span className="text-[10px] font-bold text-rose-400 uppercase tracking-widest block">Sovereign Maintenance Zone</span>
                  <p className="text-[11px] leading-relaxed text-slate-300">
                    Wipe local state caches, revoke session cookies, and cold-restart application registries. Please back up your profiles prior to action.
                  </p>
                  <button 
                    onClick={handleUninstallAndWipe}
                    className="w-full bg-rose-900/60 hover:bg-rose-850 border border-rose-500/40 text-rose-100 font-semibold py-2 rounded-lg transition cursor-pointer"
                  >
                    🗑️ Wipe App Cookies & Cache
                  </button>
                </div>
              </div>
            </div>
          )}

        </main>
      </div>

      {/* FLOATING GEMINI CONGREGATIONAL AI ASSISTANT CHAT PANEL */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end">
        {showChatbot && (
          <div className="bg-[#0D1B3E] border border-[#D4AF37] rounded-2xl w-80 sm:w-88 h-96 flex flex-col shadow-2xl overflow-hidden animate-fade-in gold-glow mr-1 mb-2">
            
            {/* Header chat bot */}
            <div className="bg-[#112055] px-3.5 py-2.5 bg-gradient-to-r from-[#112055] to-[#0A0F1E] border-b border-[#D4AF37]/25 flex justify-between items-center text-xs">
              <div className="flex items-center gap-1.5 font-semibold text-white">
                <Bot className="w-4 h-4 text-[#D4AF37]" />
                <div>
                  <h4 className="font-serif-cinzel font-bold text-[11px] text-[#D4AF37]">PASTORAL COMPANION</h4>
                  <p className="text-[9px] text-slate-400 font-memo">GROUNDED IN SCRIPTURES</p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <label className="flex items-center gap-1 text-[9px] text-[#B0C4DE] cursor-pointer" title="Enable high calculations reasoning">
                  <input 
                    type="checkbox" 
                    checked={isChatbotHighThinking} 
                    onChange={e => setIsChatbotHighThinking(e.target.checked)}
                    className="accent-[#D4AF37]"
                  /> High Thinking
                </label>
                <button 
                  onClick={() => setShowChatbot(false)} 
                  className="text-slate-400 hover:text-white px-1.5 font-bold"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Chat Body */}
            <div className="flex-1 p-2 bg-[#0A0F1E] overflow-y-auto space-y-2.5 text-xs">
              {chatbotMessages.map((msg, i) => (
                <div 
                  key={i} 
                  className={`p-2 rounded-xl max-w-[85%] leading-normal ${
                    msg.role === "user" 
                      ? "bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/30 ml-auto"
                      : "bg-[#112055]/30 text-[#B0C4DE] border border-white/5"
                  }`}
                >
                  <p className="text-[9px] opacity-65 font-bold mb-0.5">{msg.role === "user" ? "You" : "Sovereign Guide"}</p>
                  <div className="whitespace-pre-line leading-relaxed text-[11px]">{msg.content}</div>
                </div>
              ))}
              {chatbotLoading && (
                <div className="text-[10px] text-slate-400 italic bg-[#112055]/35 p-2 rounded-xl w-32 animate-pulse">
                  Meditating scripture...
                </div>
              )}
            </div>

            {/* Chat footer input */}
            <div className="p-2 border-t border-white/5 bg-[#0D1B3E] flex gap-1.5">
              <input 
                type="text" 
                placeholder="Ask e.g. 'Compose a sermon illustration about grace'"
                value={chatbotInput}
                onChange={e => setChatbotInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleChatbotSend()}
                className="flex-1 bg-[#0A0F1E] text-white border border-[#D4AF37]/20 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-[#D4AF37]"
              />
              <button 
                onClick={handleChatbotSend}
                className="bg-[#D4AF37] hover:bg-[#F0C940] text-black rounded-lg px-3 py-1 text-xs font-bold"
              >
                Direct
              </button>
            </div>
          </div>
        )}

        <button
          onClick={() => setShowChatbot(!showChatbot)}
          className="bg-[#D4AF37] hover:bg-[#F0C940] text-black font-extrabold p-3 rounded-full flex items-center justify-center gap-1.5 gold-glow transition-all duration-200 cursor-pointer shadow-lg transform hover:scale-105"
        >
          <Bot className="w-5 h-5" />
          <span className="text-xs tracking-wider pr-1 font-sans-raleway font-bold">Pastoral AI Chat</span>
        </button>
      </div>

    </div>
  );
}

const apiKeyActive = !!process.env.GEMINI_API_KEY;
