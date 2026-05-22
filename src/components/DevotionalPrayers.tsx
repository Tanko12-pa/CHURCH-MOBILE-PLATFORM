import React, { useState, useEffect } from "react";
import { 
  Sparkles, Play, Pause, Square, Copy, Check, Flame, MessageSquare, BookOpen, Star, HelpCircle, 
  Heart, CheckSquare, RotateCw, ExternalLink, Bell, Volume2, VolumeX, SkipForward, SkipBack, 
  Calendar, Trash2, Clock, Music, Plus, History, ChevronRight, CheckCircle, FlameKindling,
  Search, Download
} from "lucide-react";
import { 
  collection, doc, setDoc, deleteDoc, onSnapshot, query, where, getDocs 
} from "firebase/firestore";
import { db, handleFirestoreError, OperationType } from "../firebase";
import { DevotionalSession, PrayerJournalEntry, ReminderSetting } from "../types";

interface DevotionalPrayersProps {
  user?: any;
  triggerToast: (icon: string, message: string) => void;
  preferredVersion: string;
}

interface DevotionalResult {
  rawMarkdown: string;
  scriptureReading: string;
  dailyMeditation: string;
  propheticDeclaration: string;
  prayerPoints: string[];
  styleLabel: string;
  resources: { name: string; url: string }[];
}

const BROADCAST_TRACKS = [
  { id: "manna", title: "Daily Manna Expository Audio", host: "Pastor Joseph - Faith Radio", duration: 180 },
  { id: "bread", title: "Our Daily Bread Audio Companion", host: "ODB Reader - Global Feed", duration: 150 },
  { id: "pray", title: "Guided Morning Prayer", host: "Intercession Ministries Daily", duration: 240 },
  { id: "soak", title: "Deep Altar Soaking Instrumental", host: "Sanctuary Strings Ensemble", duration: 320 },
];

export default function DevotionalPrayers({ user, triggerToast }: DevotionalPrayersProps) {
  // Navigation tabs within Devotional Suite
  const [activeSubTab, setActiveSubTab] = useState<"study" | "journal" | "reminders">("study");

  const [topic, setTopic] = useState("Peace in Times of Storms");
  const [selectedStyle, setSelectedStyle] = useState<"manna" | "bread" | "spurgeon" | "prayer">("manna");
  const [loading, setLoading] = useState(false);
  const [devotional, setDevotional] = useState<DevotionalResult | null>(null);

  // Mark prayer points as complete (interactive checklist state)
  const [completedPrayers, setCompletedPrayers] = useState<Record<number, boolean>>({});

  // TTS Read Aloud state
  const [isPlayingText, setIsPlayingText] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoiceName, setSelectedVoiceName] = useState<string>("");
  const [speechSpeed, setSpeechSpeed] = useState<number>(1.0);
  const [speechUtterance, setSpeechUtterance] = useState<SpeechSynthesisUtterance | null>(null);

  // Companion Broadcast Player Deck state
  const [activeTrackIdx, setActiveTrackIdx] = useState(0);
  const [isPlayingTrack, setIsPlayingTrack] = useState(false);
  const [trackProgress, setTrackProgress] = useState(0);
  const [trackVolume, setTrackVolume] = useState(0.85);
  const [trackMuted, setTrackMuted] = useState(false);
  const [isLoopingDeck, setIsLoopingDeck] = useState(false);

  // Daily Prayer Reminder states
  const [reminderHour, setReminderHour] = useState(7);
  const [reminderMinute, setReminderMinute] = useState(0);
  const [reminderEnabled, setReminderEnabled] = useState(false);

  // Prayer Journal states
  const [journalEntries, setJournalEntries] = useState<PrayerJournalEntry[]>([]);
  const [journalLoading, setJournalLoading] = useState(false);
  const [newJournalTitle, setNewJournalTitle] = useState("");
  const [newJournalRequest, setNewJournalRequest] = useState("");
  const [journalFilter, setJournalFilter] = useState<"All" | "Active" | "Answered">("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [dailyGoals, setDailyGoals] = useState({
    bibleReading: false,
    meditationTime: false,
  });

  useEffect(() => {
    const stored = localStorage.getItem("faithflow_daily_spiritual_goals");
    if (stored) {
      try {
        setDailyGoals(JSON.parse(stored));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  // Saved Devotions History states
  const [savedDevotions, setSavedDevotions] = useState<DevotionalSession[]>([]);

  const activeTrack = BROADCAST_TRACKS[activeTrackIdx];

  // 1. Initial Default Devotional Loading
  const loadDefaultDevotional = () => {
    setDevotional({
      rawMarkdown: `### 📖 Today's Scripture Reading\n**Mark 4:39 (ESV)** — "And he awoke and rebuked the wind and said to the sea, 'Peace! Be still!' And the wind ceased, and there was a great calm."\n\n### 💡 Daily Meditation\nSurrounded by the raging waves of the Galilean sea, the disciples were consumed by immediate terror. Yet, nestled in the stern of the boat lay the Sovereign Creator, in complete, undisturbed repose. Sometimes we mistake Jesus' silent rest for complete indifference. This is the gravity of temporal fear. When He awoke, He did not address the disciples first; He commanded the creation. "Peace! Be still!" In the original language, this is a command to muzzle the storm. The wind did not merely subside—it suffered an immediate arrest. Nature receded under the absolute authority of its King.\n\n### 🗣️ Prophetic Declaration / Life Application\nNo storm in your life is too loud to ignore the muzzle of the Prince of Peace. Speak peace to your thoughts today and trust the sovereign grip of the One who holds the oceans.\n\n### 🙏 Structured Prayer Points\n1. Father, I thank You that You are always in my boat; Your presence overrides the howling winds of anxiety and panic.\n2. Lord, lay Your hand on every storm of health, family, or finance in my life today, and command a sovereign, quiet calm.\n3. I declare that my path is secure, and no wave of adversity can take me under because my Anchor remains unshakable.`,
      scriptureReading: `**Mark 4:39 (ESV)** — "And he awoke and rebuked the wind and said to the sea, 'Peace! Be still!' And the wind ceased, and there was a great calm."`,
      dailyMeditation: `Surrounded by the raging waves of the Galilean sea, the disciples were consumed by immediate terror. Yet, nestled in the stern of the boat lay the Sovereign Creator, in complete, undisturbed repose. Sometimes we mistake Jesus' silent rest for complete indifference. This is the gravity of temporal fear. When He awoke, He did not address the disciples first; He commanded the creation. "Peace! Be still!" In the original language, this is a command to muzzle the storm. The wind did not merely subside—it suffered an immediate arrest. Nature receded under the absolute authority of its King.`,
      propheticDeclaration: `No storm in your life is too loud to ignore the muzzle of the Prince of Peace. Speak peace to your thoughts today and trust the sovereign grip of the One who holds the oceans.`,
      prayerPoints: [
        "Father, I thank You that You are always in my boat; Your presence overrides the howling winds of anxiety and panic.",
        "Lord, lay Your hand on every storm of health, family, or finance in my life today, and command a sovereign, quiet calm.",
        "I declare that my path is secure, and no wave of adversity can take me under because my Anchor remains unshakable."
      ],
      styleLabel: `Deep, Prophetic & Scriptural (Style: "Daily Manna")`,
      resources: [
        { name: "Daily Manna App", url: "https://www.dailymanna.app/" },
        { name: "Pray.com Daily", url: "https://www.pray.com/daily-prayer/" }
      ]
    });
    setCompletedPrayers({});
  };

  useEffect(() => {
    loadDefaultDevotional();
  }, []);

  // 2. Load TTS Voices Available
  useEffect(() => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      const loadVoices = () => {
        const available = window.speechSynthesis.getVoices();
        setVoices(available);
        if (available.length > 0) {
          const engVoice = available.find(v => v.lang.startsWith("en-US")) || available.find(v => v.lang.startsWith("en")) || available[0];
          setSelectedVoiceName(engVoice.name);
        }
      };
      loadVoices();
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, []);

  // 3. Audio Player Deck Timer Process
  useEffect(() => {
    let timer: any;
    if (isPlayingTrack) {
      timer = setInterval(() => {
        setTrackProgress(prev => {
          if (prev >= activeTrack.duration) {
            if (isLoopingDeck) {
              return 0;
            } else {
              if (activeTrackIdx < BROADCAST_TRACKS.length - 1) {
                setActiveTrackIdx(prevIdx => prevIdx + 1);
                return 0;
              } else {
                setIsPlayingTrack(false);
                return 0;
              }
            }
          }
          return prev + 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isPlayingTrack, activeTrackIdx, isLoopingDeck, activeTrack.duration]);

  // 4. Daily Reminder Evaluation Timer
  useEffect(() => {
    let lastCheckedMinute = -1;
    const intervalObj = setInterval(() => {
      if (!reminderEnabled) return;
      const now = new Date();
      const currH = now.getHours();
      const currM = now.getMinutes();

      if (currH === reminderHour && currM === reminderMinute && currM !== lastCheckedMinute) {
        lastCheckedMinute = currM;
        // Broadcast in-app toast
        triggerToast("🔔", `FaithFlow Prayer Hour: It is exactly ${String(reminderHour).padStart(2, "0")}:${String(reminderMinute).padStart(2, "0")}! Let us bow and seek His presence.`);
        
        // Broadcast Native push notification
        if (typeof Notification !== "undefined" && Notification.permission === "granted") {
          new Notification("FaithFlow App: Altar Call", {
            body: `It's time for your scheduled daily scripture meditation: "${topic}". Let us gather in faith.`,
            icon: "/favicon.ico"
          });
        }
      }
    }, 15000); // Poll every 15 seconds safely

    return () => clearInterval(intervalObj);
  }, [reminderEnabled, reminderHour, reminderMinute, topic]);

  // 5. Real-time Firebase Sync of Prayer Journal Entries
  useEffect(() => {
    if (!user) {
      const offline = localStorage.getItem("faithflow_journal_guest") || "[]";
      setJournalEntries(JSON.parse(offline));
      return;
    }

    setJournalLoading(true);
    const q = query(
      collection(db, "journal"),
      where("userId", "==", user.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items: PrayerJournalEntry[] = [];
      snapshot.forEach((doc) => {
        items.push(doc.data() as PrayerJournalEntry);
      });
      items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setJournalEntries(items);
      setJournalLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, "journal");
      setJournalLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  // 6. Real-time Firebase Sync of Devotional Sessions History
  useEffect(() => {
    if (!user) {
      const offline = localStorage.getItem("faithflow_saved_devotions") || "[]";
      setSavedDevotions(JSON.parse(offline));
      return;
    }

    const q = query(
      collection(db, "devotions"),
      where("userId", "==", user.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items: DevotionalSession[] = [];
      snapshot.forEach((doc) => {
        items.push(doc.data() as DevotionalSession);
      });
      items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setSavedDevotions(items);
    }, (error) => {
      console.error("Failed sync saved devotions", error);
    });

    return () => unsubscribe();
  }, [user]);

  // 7. Load Reminder Configuration from Firebase / Storage
  useEffect(() => {
    if (!user) {
      const offlineEnabled = localStorage.getItem("faithflow_reminder_enabled_guest") === "true";
      const offlineHour = Number(localStorage.getItem("faithflow_reminder_hour_guest") || "7");
      const offlineMinute = Number(localStorage.getItem("faithflow_reminder_minute_guest") || "0");
      setReminderEnabled(offlineEnabled);
      setReminderHour(offlineHour);
      setReminderMinute(offlineMinute);
      return;
    }

    const configId = `${user.uid}_config`;
    const unsubscribe = onSnapshot(doc(db, "reminders", configId), (snapshot) => {
      if (snapshot.exists()) {
        const val = snapshot.data() as ReminderSetting;
        setReminderHour(val.hour);
        setReminderMinute(val.minute);
        setReminderEnabled(val.enabled);
      }
    }, (error) => {
      console.error("Failed load reminder config", error);
    });

    return () => unsubscribe();
  }, [user]);

  // Clean speech synthesis synthesis on exit
  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // ----------------------------------------
  // Handlers
  // ----------------------------------------

  const handleGenerateDevotional = async () => {
    setLoading(true);
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsPlayingText(false);
    }
    triggerToast("✨", "Deliberating theological scriptures...");

    try {
      const res = await fetch("/api/gemini/devotional", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: topic,
          style: selectedStyle
        })
      });

      if (res.ok) {
        const data = await res.json();
        setDevotional(data);
        setCompletedPrayers({});
        triggerToast("📖", "Daily devotional assembled perfectly!");
      } else {
        triggerToast("❌", "Failed generating. Triggering local offline standard.");
        loadDefaultDevotional();
      }
    } catch (err) {
      console.error(err);
      triggerToast("⚠️", "Connection pipeline issue. Restoring default guide.");
      loadDefaultDevotional();
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePrayer = (idx: number) => {
    setCompletedPrayers(prev => {
      const current = !!prev[idx];
      const next = !current;
      if (next) {
        triggerToast("🙏", `Prayer point #${idx + 1} sealed in faith!`);
      }
      return { ...prev, [idx]: next };
    });
  };

  const handleCopy = () => {
    if (!devotional) return;
    const textToCopy = `[Devotional STYLE: ${devotional.styleLabel}]\n\n--- TODAY'S STUDY ---\n${devotional.rawMarkdown}`;
    navigator.clipboard.writeText(textToCopy);
    triggerToast("📋", "Copied devotional study guide to clipboard.");
  };

  const handleSpeak = () => {
    if (!devotional) return;

    if (isPlayingText) {
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      setIsPlayingText(false);
      return;
    }

    const SpeechS = typeof window !== "undefined" ? window.speechSynthesis : null;
    if (!SpeechS) {
      triggerToast("⚠️", "TTS Synthesis is unsupported in this browser.");
      return;
    }

    const textToSpeak = `${devotional.styleLabel}. 
      Today's Scripture Reading. Key Passage: ${devotional.scriptureReading.replace(/\*\*|\*/g, "")}.
      Daily Meditation: ${devotional.dailyMeditation.replace(/\*\*|\*/g, "")}.
      Prophetic Affirmation: ${devotional.propheticDeclaration.replace(/\*\*|\*/g, "")}.
      Let us pray these three key prayer points:
      First: ${devotional.prayerPoints[0] || ""}
      Second: ${devotional.prayerPoints[1] || ""}
      Third: ${devotional.prayerPoints[2] || ""}
      In Jesus Name, Amen.`;

    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.rate = speechSpeed;
    
    if (selectedVoiceName) {
      const chosenVoice = voices.find(v => v.name === selectedVoiceName);
      if (chosenVoice) utterance.voice = chosenVoice;
    }

    utterance.onend = () => {
      setIsPlayingText(false);
    };
    utterance.onerror = () => {
      setIsPlayingText(false);
    };

    setIsPlayingText(true);
    setSpeechUtterance(utterance);
    SpeechS.speak(utterance);
    triggerToast("🔊", "Narration playing at customized speed.");
  };

  // Saved Devotional History Handlers
  const handleSaveDevotion = async () => {
    if (!devotional) return;
    const newId = "dev_" + Date.now();
    const newSession: DevotionalSession = {
      id: newId,
      userId: user?.uid || "guest",
      topic: topic,
      styleLabel: devotional.styleLabel,
      scriptureReading: devotional.scriptureReading,
      dailyMeditation: devotional.dailyMeditation,
      propheticDeclaration: devotional.propheticDeclaration,
      prayerPoints: devotional.prayerPoints,
      createdAt: new Date().toISOString()
    };

    if (user) {
      try {
        await setDoc(doc(db, "devotions", newId), newSession);
        triggerToast("💾", "Theological session securely archived to your Firestore history!");
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, "devotions");
      }
    } else {
      const next = [newSession, ...savedDevotions];
      setSavedDevotions(next);
      localStorage.setItem("faithflow_saved_devotions", JSON.stringify(next));
      triggerToast("💾", "Saved to local browser offline history.");
    }
  };

  const handleLoadSavedDevotion = (session: DevotionalSession) => {
    setTopic(session.topic);
    setDevotional({
      rawMarkdown: `### 📖 Today's Scripture Reading\n${session.scriptureReading}\n\n### 💡 Daily Meditation\n${session.dailyMeditation}\n\n### 🗣️ Prophetic Declaration / Life Application\n${session.propheticDeclaration}\n\n### 🙏 Structured Prayer Points\n${session.prayerPoints.map((p, i) => `${i + 1}. ${p}`).join("\n")}`,
      scriptureReading: session.scriptureReading,
      dailyMeditation: session.dailyMeditation,
      propheticDeclaration: session.propheticDeclaration,
      prayerPoints: session.prayerPoints,
      styleLabel: session.styleLabel,
      resources: [
        { name: "Daily Manna App", url: "https://www.dailymanna.app/" },
        { name: "Pray.com Daily", url: "https://www.pray.com/daily-prayer/" }
      ]
    });
    setCompletedPrayers({});
    setActiveSubTab("study");
    triggerToast("📖", `Re-loaded archived study: "${session.topic}"`);
  };

  const handleDeleteSavedDevotion = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (user) {
      try {
        await deleteDoc(doc(db, "devotions", id));
        triggerToast("🗑️", "Removed devotional from history archives.");
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, "devotions");
      }
    } else {
      const next = savedDevotions.filter(item => item.id !== id);
      setSavedDevotions(next);
      localStorage.setItem("faithflow_saved_devotions", JSON.stringify(next));
      triggerToast("🗑️", "Removed offline archived study.");
    }
  };

  // Prayer Journal Handlers
  const handleCreateJournal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newJournalTitle.trim() || !newJournalRequest.trim()) return;

    const newId = "jr_" + Date.now();
    const newEntry: PrayerJournalEntry = {
      id: newId,
      userId: user?.uid || "guest",
      title: newJournalTitle.trim(),
      request: newJournalRequest.trim(),
      status: "Active",
      createdAt: new Date().toISOString()
    };

    if (user) {
      try {
        await setDoc(doc(db, "journal", newId), newEntry);
        triggerToast("✍️", "Petition sealed in your personal prayer journal!");
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, "journal");
      }
    } else {
      const next = [newEntry, ...journalEntries];
      setJournalEntries(next);
      localStorage.setItem("faithflow_journal_guest", JSON.stringify(next));
      triggerToast("✍️", "Petition logged locally in offline diary.");
    }

    setNewJournalTitle("");
    setNewJournalRequest("");
  };

  const handleToggleAnswered = async (entry: PrayerJournalEntry) => {
    const isCompleted = entry.status === "Answered";
    const updated: PrayerJournalEntry = {
      ...entry,
      status: isCompleted ? "Active" : "Answered",
      answeredAt: isCompleted ? undefined : new Date().toISOString()
    };

    if (user) {
      try {
        await setDoc(doc(db, "journal", entry.id), updated);
        if (!isCompleted) {
          triggerToast("🌟", "Hallelujah! Your prayer petition has been marked as answered! Testimony recorded.");
        } else {
          triggerToast("✏️", "Prayer request restored to active focus.");
        }
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, "journal");
      }
    } else {
      const next = journalEntries.map(j => j.id === entry.id ? updated : j);
      setJournalEntries(next);
      localStorage.setItem("faithflow_journal_guest", JSON.stringify(next));
      if (!isCompleted) {
        triggerToast("🌟", "Testimony recorded in local memory.");
      }
    }
  };

  const handleDeleteJournal = async (id: string) => {
    if (user) {
      try {
        await deleteDoc(doc(db, "journal", id));
        triggerToast("🗑️", "Entry cleaned from journal.");
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, "journal");
      }
    } else {
      const next = journalEntries.filter(j => j.id !== id);
      setJournalEntries(next);
      localStorage.setItem("faithflow_journal_guest", JSON.stringify(next));
      triggerToast("🗑️", "Logged item removed.");
    }
  };

  // Daily Reminder Handlers
  const handleToggleReminder = async (checked: boolean) => {
    setReminderEnabled(checked);
    if (checked && typeof Notification !== "undefined" && Notification.permission === "default") {
      try {
        await Notification.requestPermission();
      } catch (err) {
        console.error("Denied notifications", err);
      }
    }

    if (user) {
      try {
        const configId = `${user.uid}_config`;
        await setDoc(doc(db, "reminders", configId), {
          id: configId,
          userId: user.uid,
          hour: reminderHour,
          minute: reminderMinute,
          enabled: checked,
          updatedAt: new Date().toISOString()
        });
        triggerToast("💾", checked ? "Reminder enabled & dynamic alerts online!" : "Reminder alerts silence secured.");
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, "reminders");
      }
    } else {
      localStorage.setItem("faithflow_reminder_enabled_guest", String(checked));
      triggerToast("💾", checked ? "Reminder alerts active locally." : "Silence enabled.");
    }
  };

  const handleSaveReminderTime = async (h: number, m: number) => {
    setReminderHour(h);
    setReminderMinute(m);
    if (user) {
      try {
        const configId = `${user.uid}_config`;
        await setDoc(doc(db, "reminders", configId), {
          id: configId,
          userId: user.uid,
          hour: h,
          minute: m,
          enabled: reminderEnabled,
          updatedAt: new Date().toISOString()
        });
        triggerToast("⏰", `New notification hour set: ${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, "reminders");
      }
    } else {
      localStorage.setItem("faithflow_reminder_hour_guest", String(h));
      localStorage.setItem("faithflow_reminder_minute_guest", String(m));
      triggerToast("⏰", `Offline reminder hour targeted.`);
    }
  };

  // Broadcast player controls
  const handlePlayPauseTrack = () => {
    setIsPlayingTrack(!isPlayingTrack);
    triggerToast("🎵", isPlayingTrack ? "Broadcast paused." : `Now playing: "${activeTrack.title}"`);
  };

  const handleNextTrack = () => {
    const nextIdx = (activeTrackIdx + 1) % BROADCAST_TRACKS.length;
    setActiveTrackIdx(nextIdx);
    setTrackProgress(0);
    setIsPlayingTrack(true);
    triggerToast("🎵", `Streaming next: "${BROADCAST_TRACKS[nextIdx].title}"`);
  };

  const handlePrevTrack = () => {
    const prevIdx = activeTrackIdx === 0 ? BROADCAST_TRACKS.length - 1 : activeTrackIdx - 1;
    setActiveTrackIdx(prevIdx);
    setTrackProgress(0);
    setIsPlayingTrack(true);
    triggerToast("🎵", `Streaming previous: "${BROADCAST_TRACKS[prevIdx].title}"`);
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remaining = secs % 60;
    return `${String(mins).padStart(2, "0")}:${String(remaining).padStart(2, "0")}`;
  };

  const handleToggleGoal = (key: "bibleReading" | "meditationTime") => {
    setDailyGoals(prev => {
      const next = { ...prev, [key]: !prev[key] };
      localStorage.setItem("faithflow_daily_spiritual_goals", JSON.stringify(next));
      if (next[key]) {
        const label = key === "bibleReading" ? "Bible Reading" : "Meditation Time";
        triggerToast("🌟", `Daily '${label}' goal completed! Keep growing in grace.`);
      }
      return next;
    });
  };

  const handleExportCSV = () => {
    if (journalEntries.length === 0) {
      triggerToast("⚠️", "There are no journal entries to export!");
      return;
    }
    const headers = ["ID", "Title", "Petition / Request", "Status", "Created At", "Answered At"];
    const rows = journalEntries.map(e => [
      e.id,
      `"${e.title.replace(/"/g, '""')}"`,
      `"${e.request.replace(/"/g, '""')}"`,
      e.status,
      e.createdAt,
      e.answeredAt || ""
    ]);
    const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `FaithFlow_Prayer_Journal_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    triggerToast("📥", "Exported all prayer journal entries to CSV successfully!");
  };

  // Filtered journal entries
  const filteredJournal = journalEntries.filter(e => {
    const matchesStatus = journalFilter === "All" || e.status === journalFilter;
    const matchesSearch = 
      e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.request.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6">
      
      {/* Upper Suite Header */}
      <div className="bg-[#050D1E] border border-[#D4AF37]/25 p-5 rounded-2xl shadow-lg relative overflow-hidden backdrop-blur-md">
        <div className="absolute top-0 right-0 w-36 h-36 bg-[#D4AF37]/5 rounded-bl-full pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-[#112055] to-[#D4AF37]/20 flex items-center justify-center border border-[#D4AF37]/35 shadow-inner">
              <Flame className="w-6 h-6 text-[#D4AF37] animate-pulse" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                Devotional & Prayers Suite
                <span className="text-[10px] uppercase tracking-wider font-mono text-[#D4AF37] bg-[#D4AF37]/15 border border-[#D4AF37]/25 px-1.5 py-0.5 rounded">
                  Theological AI
                </span>
              </h2>
              <p className="text-xs text-slate-300">
                Biblically sound expository sermons, guided audio broadcasts, personal journals & active daily reminders.
              </p>
            </div>
          </div>
          
          {/* Navigation Sub-Tabs */}
          <div className="flex items-center bg-[#030611] border border-slate-800 p-1 rounded-xl">
            <button
              onClick={() => setActiveSubTab("study")}
              className={`flex items-center gap-1.5 text-xs font-bold py-2 px-4 rounded-lg cursor-pointer transition-all duration-150 ${
                activeSubTab === "study"
                  ? "bg-[#D4AF37] text-black shadow-md"
                  : "text-[#B0C4DE] hover:text-white"
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" /> Devotional Generator
            </button>
            <button
              onClick={() => setActiveSubTab("journal")}
              className={`flex items-center gap-1.5 text-xs font-bold py-2 px-4 rounded-lg cursor-pointer transition-all duration-150 ${
                activeSubTab === "journal"
                  ? "bg-[#D4AF37] text-black shadow-md"
                  : "text-[#B0C4DE] hover:text-white"
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" /> Prayer Journal
            </button>
            <button
              onClick={() => setActiveSubTab("reminders")}
              className={`flex items-center gap-1.5 text-xs font-bold py-2 px-4 rounded-lg cursor-pointer transition-all duration-150 ${
                activeSubTab === "reminders"
                  ? "bg-[#D4AF37] text-black shadow-md"
                  : "text-[#B0C4DE] hover:text-white"
              }`}
            >
              <Bell className="w-3.5 h-3.5" /> Daily Reminders
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* ========================================================================= */}
        {/* STUDY TAB VIEW */}
        {/* ========================================================================= */}
        {activeSubTab === "study" && (
          <>
            {/* LEFT CONFIGURATION PANEL (4 columns) */}
            <div className="col-span-1 lg:col-span-4 space-y-4 animate-fade-in">
              
              {/* Creator config */}
              <div className="bg-[#050D1E]/95 border border-[#D4AF37]/20 p-5 rounded-xl space-y-4">
                <h3 className="text-xs font-bold text-[#D4AF37] uppercase tracking-wider border-b border-[#D4AF37]/10 pb-2 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" /> Session Configurations
                </h3>

                <div className="space-y-1.5">
                  <label className="block text-[11px] font-semibold text-slate-200">
                    Focus Topic or Scripture Passage
                  </label>
                  <input
                    type="text"
                    value={topic}
                    onChange={e => setTopic(e.target.value)}
                    placeholder="e.g. Walking in Grace, Mark 4:39"
                    className="w-full text-xs bg-[#030611] border border-slate-700/80 rounded-lg p-2.5 text-white focus:outline-none focus:border-[#D4AF37] transition font-medium"
                  />
                  <span className="text-[10px] text-slate-400 block italic leading-snug">
                    Ground today's AI generation in a custom scripture or spiritual concept.
                  </span>
                </div>

                <div className="space-y-2">
                  <label className="block text-[11px] font-semibold text-slate-200">
                    Theological Framework & Style
                  </label>
                  <div className="space-y-1.5">
                    {[
                      { id: "manna", label: "Daily Manna (Deep & Prophetic)", d: "Expository scripture breakdowns, prophetic declarations, targeted prayers." },
                      { id: "bread", label: "Our Daily Bread (Conversational)", d: "Key scripture passage, heart-warming analogy study, everyday action takeaways." },
                      { id: "spurgeon", label: "Charles Spurgeon (Holiness Puritan)", d: "Historical theological reflections meditating on God's character and grace." },
                      { id: "prayer", label: "Morning Prayers (Guided Intercession)", d: "Structured daily intercession roadmap focusing on gratitude and guidance." },
                    ].map(styleItem => (
                      <button
                        key={styleItem.id}
                        onClick={() => setSelectedStyle(styleItem.id as any)}
                        className={`w-full text-left p-2.5 rounded-lg border text-xs cursor-pointer transition duration-150 block space-y-0.5 ${
                          selectedStyle === styleItem.id
                            ? "bg-[#D4AF37]/10 border-[#D4AF37] text-white"
                            : "bg-transparent border-slate-800 hover:border-slate-700 hover:bg-[#112055]/15 text-[#B0C4DE]"
                        }`}
                      >
                        <span className="font-bold flex items-center gap-1.5">
                          <Star className={`w-3 h-3 ${selectedStyle === styleItem.id ? "text-[#D4AF37] fill-[#D4AF37]" : "text-slate-500"}`} />
                          {styleItem.label}
                        </span>
                        <span className="text-[10px] text-slate-400 block leading-snug">
                          {styleItem.d}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleGenerateDevotional}
                  disabled={loading}
                  className="w-full bg-[#D4AF37] hover:bg-[#E5BF48] disabled:bg-[#D4AF37]/40 text-black font-extrabold text-xs py-3 rounded-lg shadow-md cursor-pointer transition-all duration-200 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <RotateCw className="w-4 h-4 animate-spin text-black" />
                      Illuminating Sacred Script...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-black" />
                      Generate Holy Devotional
                    </>
                  )}
                </button>
              </div>

              {/* INTEGRATED AUDIO BROADCAST DECK PLAYER (3. Add audio players control) */}
              <div className="bg-[#050D1E]/95 border border-slate-800 p-4 rounded-xl space-y-3 shadow-md">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                    <Music className="w-3.5 h-3.5 text-[#D4AF37]" /> Audio Broadcasts Player
                  </h4>
                  {isPlayingTrack && (
                    <div className="flex items-end gap-0.5 h-3 select-none px-1">
                      <div className="w-0.5 bg-emerald-400 animate-[bounce_0.8s_infinite_0.1s] h-full" />
                      <div className="w-0.5 bg-[#D4AF37] animate-[bounce_0.8s_infinite_0.3s] h-3/4" />
                      <div className="w-0.5 bg-emerald-400 animate-[bounce_0.8s_infinite_0.5s] h-2/3" />
                      <div className="w-0.5 bg-[#D4AF37] animate-[bounce_0.8s_infinite_0.2s] h-full" />
                    </div>
                  )}
                </div>

                {/* Track Selection list */}
                <div className="space-y-1">
                  {BROADCAST_TRACKS.map((t, i) => (
                    <button
                      key={t.id}
                      onClick={() => {
                        setActiveTrackIdx(i);
                        setTrackProgress(0);
                        setIsPlayingTrack(true);
                        triggerToast("🎵", `Streaming: ${t.title}`);
                      }}
                      className={`w-full text-left p-1.5 rounded-lg text-[10.5px] font-medium flex items-center justify-between transition cursor-pointer ${
                        activeTrackIdx === i
                          ? "bg-[#112055] border border-[#D4AF37]/20 text-white"
                          : "bg-transparent text-slate-400 hover:bg-[#112055]/20 hover:text-white"
                      }`}
                    >
                      <div className="truncate pr-1">
                        <span className="block font-bold">{t.title}</span>
                        <span className="text-[9px] text-slate-500">{t.host}</span>
                      </div>
                      <span className="font-mono text-[9px] shrink-0 text-slate-400">{formatTime(t.duration)}</span>
                    </button>
                  ))}
                </div>

                {/* Main Audio Controls Deck */}
                <div className="bg-[#030611] p-3 rounded-xl border border-slate-900 space-y-3">
                  <div className="text-center">
                    <span className="text-[9px] font-mono text-emerald-400 block tracking-wider uppercase mb-0.5">
                      {isPlayingTrack ? "⚡ Active Broadcast Stream" : "⏸️ Stream Paused"}
                    </span>
                    <span className="text-xs font-black text-slate-200 block truncate">{activeTrack.title}</span>
                  </div>

                  {/* Scrub and Seeker Timeline Progress */}
                  <div className="space-y-1">
                    <input 
                      type="range"
                      min={0}
                      max={activeTrack.duration}
                      value={trackProgress}
                      onChange={e => setTrackProgress(Number(e.target.value))}
                      className="w-full accent-[#D4AF37] h-1.5 rounded bg-slate-800 cursor-pointer text-xs"
                    />
                    <div className="flex justify-between text-[10px] font-mono text-slate-400 select-none">
                      <span>{formatTime(trackProgress)}</span>
                      <span>{formatTime(activeTrack.duration)}</span>
                    </div>
                  </div>

                  {/* Command Buttons */}
                  <div className="flex items-center justify-center gap-4 text-slate-300">
                    <button 
                      onClick={handlePrevTrack}
                      className="hover:text-[#D4AF37] transition cursor-pointer"
                      title="Skip Previous"
                    >
                      <SkipBack className="w-4 h-4 fill-current" />
                    </button>
                    <button 
                      onClick={handlePlayPauseTrack}
                      className="w-9 h-9 rounded-full bg-[#D4AF37] hover:bg-[#E5BF48] text-black flex items-center justify-center transition shadow-md cursor-pointer shrink-0"
                      title={isPlayingTrack ? "Pause" : "Play"}
                    >
                      {isPlayingTrack ? (
                        <Pause className="w-4 h-4 text-black fill-black" />
                      ) : (
                        <Play className="w-4 h-4 text-black fill-black ml-0.5" />
                      )}
                    </button>
                    <button 
                      onClick={() => { setTrackProgress(0); setIsPlayingTrack(false); }}
                      className="hover:text-rose-400 transition cursor-pointer hover:scale-105"
                      title="Stop Track"
                    >
                      <Square className="w-4 h-4 fill-current" />
                    </button>
                    <button 
                      onClick={handleNextTrack}
                      className="hover:text-[#D4AF37] transition cursor-pointer"
                      title="Skip Next"
                    >
                      <SkipForward className="w-4 h-4 fill-current" />
                    </button>
                  </div>

                  {/* Volume Desk Slider */}
                  <div className="flex items-center gap-2 pt-1 border-t border-slate-900/60">
                    <button 
                      onClick={() => setTrackMuted(!trackMuted)} 
                      className="text-slate-400 hover:text-white transition cursor-pointer"
                    >
                      {trackMuted || trackVolume === 0 ? (
                        <VolumeX className="w-3.5 h-3.5 text-rose-400" />
                      ) : (
                        <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
                      )}
                    </button>
                    <input 
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={trackMuted ? 0 : trackVolume}
                      onChange={e => { setTrackVolume(Number(e.target.value)); setTrackMuted(false); }}
                      className="w-full h-1.5 accent-emerald-400 rounded bg-slate-800 cursor-pointer"
                    />
                    <button
                      onClick={() => setIsLoopingDeck(!isLoopingDeck)}
                      className={`text-[9px] font-mono font-bold uppercase border px-1 py-0.5 rounded transition ${
                        isLoopingDeck 
                          ? "bg-emerald-950/20 text-emerald-400 border-emerald-500/35" 
                          : "bg-transparent text-slate-500 border-slate-800"
                      }`}
                    >
                      Loop
                    </button>
                  </div>
                </div>
              </div>

            </div>

            {/* RIGHT DEVOTIONAL DISPLAY PANEL (8 columns) */}
            <div className="col-span-1 lg:col-span-8 space-y-6 animate-fade-in text-white">
              {devotional ? (
                <div className="space-y-6">
                  
                  {/* Master Presentation Guide */}
                  <div className="bg-gradient-to-b from-[#060D1F] to-[#0A112A] border border-[#D4AF37]/25 p-6 rounded-2xl shadow-xl space-y-6">
                    
                    {/* Header Controls for Copy / Read Aloud / Save to History */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#D4AF37]/15 pb-4 gap-3">
                      <span className="text-[10px] font-bold font-mono text-[#D4AF37] uppercase tracking-widest block bg-[#D4AF37]/10 px-2 py-0.5 rounded border border-[#D4AF37]/20 self-start">
                        Layout: {devotional.styleLabel}
                      </span>
                      
                      <div className="flex items-center gap-2 self-end">
                        {/* 4. Save references to history */}
                        <button
                          onClick={handleSaveDevotion}
                          className="flex items-center gap-1 text-[10.5px] bg-emerald-950/30 hover:bg-emerald-900/40 border border-emerald-500/30 text-emerald-300 py-1.5 px-3 rounded-lg cursor-pointer transition font-bold"
                          title="Archive Session to Firestore History"
                        >
                          <History className="w-3.5 h-3.5" /> Save to History
                        </button>
                        <button
                          onClick={handleCopy}
                          className="flex items-center gap-1 text-[10.5px] bg-[#112055]/45 hover:bg-[#112055]/70 border border-slate-700 py-1.5 px-3 rounded-lg text-[#B0C4DE] cursor-pointer transition font-medium"
                          title="Copy text content"
                        >
                          <Copy className="w-3.5 h-3.5" /> Copy
                        </button>
                        <button
                          onClick={handleSpeak}
                          className={`flex items-center gap-1 text-[10.5px] border py-1.5 px-3 rounded-lg cursor-pointer transition font-medium ${
                            isPlayingText
                              ? "bg-rose-950/40 border-rose-500/30 text-rose-300"
                              : "bg-[#112055]/45 hover:bg-[#112055]/70 border-slate-700 text-[#B0C4DE]"
                          }`}
                        >
                          {isPlayingText ? (
                            <>
                              <Square className="w-3.5 h-3.5 text-rose-400 fill-rose-400 animate-pulse" /> Stop Speech
                            </>
                          ) : (
                            <>
                              <Play className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400" /> Read Aloud
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Speech Customizations panel if Read Aloud active */}
                    {isPlayingText && (
                      <div className="bg-[#030611] p-3 border border-rose-500/10 rounded-xl space-y-2.5 animate-slide-down">
                        <span className="text-[9.5px] font-mono text-rose-400 block uppercase font-bold tracking-wider">🌟 Narrator Speed & Audio Settings</span>
                        <div className="flex flex-wrap items-center gap-4 text-xs">
                          <label className="flex items-center gap-1.5 text-slate-300 font-medium">
                            Speed Rate:
                            <select
                              value={speechSpeed}
                              onChange={e => {
                                setSpeechSpeed(Number(e.target.value));
                                if (isPlayingText) {
                                  // restart speech synthesis at new rate
                                  window.speechSynthesis.cancel();
                                  handleSpeak();
                                }
                              }}
                              className="bg-[#050D1E] border border-slate-800 rounded p-1 text-xs text-white"
                            >
                              <option value="0.75">0.75x (Relaxed Pastor)</option>
                              <option value="1.0">1.0x (Standard Pace)</option>
                              <option value="1.2">1.2x (Active Expository)</option>
                              <option value="1.4">1.4x (Quick Outline)</option>
                            </select>
                          </label>

                          <label className="flex items-center gap-1.5 text-slate-300 font-medium flex-1 min-w-[200px]">
                            Voice:
                            <select
                              value={selectedVoiceName}
                              onChange={e => {
                                setSelectedVoiceName(e.target.value);
                                if (isPlayingText) {
                                  window.speechSynthesis.cancel();
                                  handleSpeak();
                                }
                              }}
                              className="bg-[#050D1E] border border-slate-800 rounded p-1 text-xs text-white truncate max-w-full"
                            >
                              {voices.map(v => (
                                <option key={v.name} value={v.name}>{v.name} ({v.lang})</option>
                              ))}
                            </select>
                          </label>
                        </div>
                      </div>
                    )}

                    {/* 1. Scripture Reading Section */}
                    <div className="bg-[#112055]/15 border border-[#112055]/30 p-4 rounded-xl space-y-2">
                      <h4 className="text-xs font-black text-white flex items-center gap-2 uppercase tracking-wide">
                        <BookOpen className="w-4 h-4 text-[#D4AF37]" />
                        📖 Today's Scripture Reading
                      </h4>
                      <div className="text-xs text-slate-100 italic leading-relaxed border-l-2 border-[#D4AF37] pl-3 py-1 font-sans">
                        {devotional.scriptureReading.replace(/###\s*📖\s*Today's\s*Scripture\s*Reading/i, "").trim()}
                      </div>
                    </div>

                    {/* 2. Daily Meditation Body Section */}
                    <div className="space-y-3">
                      <h4 className="text-sm font-black text-white flex items-center gap-2 uppercase tracking-wide">
                        <Heart className="w-4 h-1 px-1 bg-[#D4AF37]" />
                        🎯 Daily Meditation Study
                      </h4>
                      <div className="text-xs text-slate-200 leading-relaxed font-normal whitespace-pre-wrap font-sans">
                        {devotional.dailyMeditation.replace(/###\s*💡\s*Daily\s*Meditation/i, "").trim()}
                      </div>
                    </div>

                    {/* 3. Prophetic Declaration Card */}
                    <div className="bg-[#050D1E]/95 border-l-4 border-[#D4AF37] p-4 rounded-r-xl space-y-1.5 shadow-sm">
                      <h4 className="text-[10.5px] font-bold text-[#D4AF37] uppercase tracking-wider flex items-center gap-1.5">
                        <Star className="w-3.5 h-3.5 text-[#D4AF37] fill-[#D4AF37]/20" />
                        🗣️ Prophetic Declaration
                      </h4>
                      <p className="text-xs font-medium leading-relaxed text-slate-100 italic">
                        "{devotional.propheticDeclaration.replace(/###\s*🗣️\s*Prophetic\s*Declaration\s*\/|###\s*🗣️\s*Life\s*Application/i, "").trim()}"
                      </p>
                    </div>

                    {/* 4. Structured Prayer Points Interactive Checklist */}
                    <div className="bg-[#060D1E] border border-slate-800 p-5 rounded-xl space-y-3">
                      <h4 className="text-xs font-black text-white flex items-center gap-2 uppercase tracking-wide">
                        <CheckSquare className="w-4 h-4 text-emerald-400" />
                        🙏 Structured Intercessory Checklist
                      </h4>
                      <p className="text-[10px] text-slate-400">
                        Check off these structured, laser-focused prayer points as you complete your intercession.
                      </p>
                      
                      <div className="space-y-2">
                        {devotional.prayerPoints.map((prayer, index) => {
                          const cleanPrayer = prayer.replace(/^\d+\.\s*/, "").replace(/###\s*🙏\s*Structured\s*Prayer\s*Points/i, "").trim();
                          if (!cleanPrayer) return null;
                          
                          const isDone = !!completedPrayers[index];
                          return (
                            <button
                              key={index}
                              onClick={() => handleTogglePrayer(index)}
                              className={`w-full text-left p-2.5 rounded-lg border text-xs transition duration-150 flex items-start gap-3 cursor-pointer ${
                                isDone 
                                  ? "bg-emerald-950/20 border-emerald-500/20 text-slate-400" 
                                  : "bg-[#030611] border-slate-800 hover:border-slate-700 text-slate-100"
                              }`}
                            >
                              <div className="mt-0.5 shrink-0 select-none">
                                {isDone ? (
                                  <CheckSquare className="w-4 h-4 text-emerald-400 animate-scale-up" />
                                ) : (
                                  <span className="w-4 h-4 rounded border border-slate-700 block transition hover:border-[#D4AF37]" />
                                )}
                              </div>
                              <div className="flex-1">
                                <span className="text-[9px] font-semibold text-slate-400 font-mono block mb-0.5">
                                  PRAYER POINT #{index + 1} {index === 0 ? "(Thanksgiving)" : index === 1 ? "(Petition & Cry)" : "(Affirmation)"}
                                </span>
                                <p className={`leading-relaxed text-xs ${isDone ? "line-through text-slate-500" : ""}`}>
                                  {cleanPrayer}
                                </p>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                  </div>

                  {/* SAVED STUDIES ACCORDION VIEW HISTORIES (Scrollable panel under active view) */}
                  {savedDevotions.length > 0 && (
                    <div className="bg-[#050D1E]/90 border border-slate-800 p-5 rounded-xl space-y-3.5">
                      <div className="flex items-center gap-1.5 border-b border-slate-800 pb-2">
                        <History className="w-4 h-4 text-[#D4AF37]" />
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                          My Saved Study Guides History ({savedDevotions.length})
                        </h4>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-60 overflow-y-auto pr-1">
                        {savedDevotions.map((session) => (
                          <div
                            key={session.id}
                            onClick={() => handleLoadSavedDevotion(session)}
                            className="bg-[#030611] hover:bg-[#112055]/30 border border-slate-800 hover:border-[#D4AF37]/30 p-3 rounded-lg flex items-start justify-between gap-2.5 transition cursor-pointer group"
                          >
                            <div className="space-y-1 truncate-1-line flex-1">
                              <span className="text-[10px] text-slate-400 font-mono block">
                                {new Date(session.createdAt).toLocaleDateString()} &bull; {session.styleLabel.split("(")[0]}
                              </span>
                              <h5 className="text-xs font-bold text-white group-hover:text-[#D4AF37] transition truncate">
                                {session.topic}
                              </h5>
                              <p className="text-[10px] text-slate-400 truncate font-sans">
                                {session.dailyMeditation.slice(0, 80)}...
                              </p>
                            </div>
                            <button
                              onClick={(e) => handleDeleteSavedDevotion(e, session.id)}
                              className="text-slate-500 hover:text-rose-400 p-1 rounded transition self-center cursor-pointer shrink-0"
                              title="Delete Archive Record"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Raw markdown details check */}
                  <details className="group bg-[#040914] border border-slate-800 p-4 rounded-xl cursor-pointer">
                    <summary className="text-[11px] font-bold font-mono text-slate-400 select-none uppercase hover:text-white transition duration-150 flex items-center justify-between">
                      <span>View Raw Theological Expository Layout</span>
                      <span className="text-[9px] bg-slate-800 text-[#D4AF37] px-1.5 py-0.5 rounded font-normal">
                        Fidelity Standard
                      </span>
                    </summary>
                    <div className="mt-4 pt-3 border-t border-slate-800/85">
                      <pre className="text-[10px] bg-[#02050B] p-4 rounded border border-slate-900 text-slate-300 overflow-x-auto whitespace-pre-wrap select-all font-mono leading-relaxed">
                        {devotional.rawMarkdown}
                      </pre>
                    </div>
                  </details>

                </div>
              ) : (
                <div className="bg-[#050D1E]/40 border border-dashed border-[#D4AF37]/25 h-72 rounded-2xl flex flex-col items-center justify-center text-center p-6 space-y-2">
                  <RotateCw className="w-8 h-8 text-[#D4AF37] animate-spin" />
                  <p className="text-xs text-slate-300 font-medium">Assembling sacred theological insights...</p>
                </div>
              )}
            </div>
          </>
        )}

        {/* ========================================================================= */}
        {/* PRAYER JOURNAL TAB VIEW (2. Create prayer journal) */}
        {/* ========================================================================= */}
        {activeSubTab === "journal" && (
          <div className="col-span-1 lg:col-span-12 space-y-6 animate-fade-in text-white">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
              
              {/* Journal Record Entry Form & Daily Goals Tracker */}
              <div className="col-span-1 md:col-span-4 space-y-4">
                <div className="bg-[#050D1E]/95 border border-slate-800 p-5 rounded-2xl space-y-4 shadow-lg">
                  <div className="border-b border-slate-800 pb-2">
                    <h3 className="text-sm font-bold text-[#D4AF37] uppercase tracking-wider flex items-center gap-1.5">
                      <Plus className="w-4 h-4 text-[#D4AF37]" /> Log a Prayer Petition
                    </h3>
                    <p className="text-[10px] text-slate-400">Record your cries, petitions, and intercessory burdens to track God's faithfulness.</p>
                  </div>

                  <form onSubmit={handleCreateJournal} className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-slate-300 block">Burden Subject / Title</label>
                      <input 
                        type="text"
                        required
                        value={newJournalTitle}
                        onChange={e => setNewJournalTitle(e.target.value)}
                        placeholder="e.g., Mother's Heart Healing"
                        className="w-full text-xs font-medium bg-[#030611] border border-slate-800 focus:border-[#D4AF37] rounded-lg p-3 outline-none text-white transition"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-slate-300 block">Specific Petition / Details</label>
                      <textarea 
                        required
                        rows={5}
                        value={newJournalRequest}
                        onChange={e => setNewJournalRequest(e.target.value)}
                        placeholder="Excribe details of the petition, scriptural promises you are claiming, and target dates..."
                        className="w-full text-xs font-medium bg-[#030611] border border-slate-800 focus:border-[#D4AF37] rounded-lg p-3 outline-none text-white transition resize-none"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-[#D4AF37] hover:bg-[#E5BF48] text-black font-extrabold text-xs py-3 rounded-lg shadow-md cursor-pointer transition flex items-center justify-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5 text-black" /> Insert Journal Entry
                    </button>
                  </form>
                </div>

                {/* Daily Goals Tracker card */}
                <div className="bg-[#050D1E]/95 border border-[#D4AF37]/25 p-5 rounded-2xl space-y-4 shadow-lg">
                  <div className="border-b border-slate-800 pb-2">
                    <h3 className="text-sm font-bold text-[#D4AF37] uppercase tracking-wider flex items-center gap-1.5 font-sans">
                      <FlameKindling className="w-4 h-4 text-[#D4AF37]" /> Daily Spiritual Goals
                    </h3>
                    <p className="text-[10px] text-slate-400">Track your daily devotion standards for spiritual growth.</p>
                  </div>
                  
                  <div className="space-y-2.5">
                    <button
                      onClick={() => handleToggleGoal("bibleReading")}
                      className={`w-full text-left p-2.5 rounded-xl border text-xs transition duration-150 flex items-center gap-3 cursor-pointer ${
                        dailyGoals.bibleReading 
                          ? "bg-emerald-950/20 border-emerald-500/30 text-emerald-300" 
                          : "bg-[#030611] border-slate-800 hover:border-slate-700 text-slate-300"
                      }`}
                    >
                      <div className="shrink-0 select-none">
                        {dailyGoals.bibleReading ? (
                          <CheckCircle className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <span className="w-4 h-4 rounded border border-slate-700 block transition hover:border-[#D4AF37]" />
                        )}
                      </div>
                      <div className="flex-1">
                        <span className="font-bold text-[11.5px] block">Bible Reading Goal</span>
                        <span className="text-[10px] text-slate-400 block font-normal">Complete scriptural readings for today</span>
                      </div>
                    </button>

                    <button
                      onClick={() => handleToggleGoal("meditationTime")}
                      className={`w-full text-left p-2.5 rounded-xl border text-xs transition duration-150 flex items-center gap-3 cursor-pointer ${
                        dailyGoals.meditationTime 
                          ? "bg-emerald-950/20 border-emerald-500/30 text-emerald-300" 
                          : "bg-[#030611] border-slate-800 hover:border-slate-700 text-slate-300"
                      }`}
                    >
                      <div className="shrink-0 select-none">
                        {dailyGoals.meditationTime ? (
                          <CheckCircle className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <span className="w-4 h-4 rounded border border-slate-700 block transition hover:border-[#D4AF37]" />
                        )}
                      </div>
                      <div className="flex-1">
                        <span className="font-bold text-[11.5px] block">Meditation Time Goal</span>
                        <span className="text-[10px] text-slate-400 block font-normal">Spend quiet time in deep study contemplation</span>
                      </div>
                    </button>
                  </div>

                  <div className="space-y-1.5 pt-1">
                    <div className="flex justify-between text-[11px] font-mono text-slate-400 font-bold">
                      <span>Daily Goals Progress</span>
                      <span className={((dailyGoals.bibleReading ? 50 : 0) + (dailyGoals.meditationTime ? 50 : 0)) === 100 ? "text-emerald-400 font-extrabold" : "text-[#D4AF37]"}>
                        {((dailyGoals.bibleReading ? 50 : 0) + (dailyGoals.meditationTime ? 50 : 0))}% Done
                      </span>
                    </div>
                    <div className="w-full h-2 rounded bg-slate-900 overflow-hidden border border-slate-800">
                      <div 
                        className="h-full bg-gradient-to-r from-[#D4AF37] to-emerald-400 transition-all duration-500"
                        style={{ width: `${(dailyGoals.bibleReading ? 50 : 0) + (dailyGoals.meditationTime ? 50 : 0)}%` }}
                      />
                    </div>
                    {((dailyGoals.bibleReading ? 50 : 0) + (dailyGoals.meditationTime ? 50 : 0)) === 100 && (
                      <span className="text-[9px] text-emerald-400 font-bold block animate-pulse text-center">
                        🎉 Sovereign spiritual targets met for today!
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Journal Board and Timelines */}
              <div className="col-span-1 md:col-span-8 space-y-4">
                <div className="bg-[#050D1E]/90 border border-slate-800 p-5 rounded-2xl space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800 pb-3 gap-3">
                    <div>
                      <h4 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                        <MessageSquare className="w-4 h-4 text-[#D4AF37]" /> My Prayer Journal Archive
                      </h4>
                      <p className="text-[11px] text-slate-400">Manage, review, and celebrate answered intercessory points.</p>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Export CSV Button */}
                      <button
                        onClick={handleExportCSV}
                        className="flex items-center gap-1.5 text-[10.5px] font-bold bg-[#112055] hover:bg-[#D4AF37] hover:text-[#0A0F1E] border border-[#D4AF37]/35 text-[#D4AF37] py-2 px-3 rounded-lg cursor-pointer transition"
                        title="Export Diary Entries to Offline CSV log"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Export CSV</span>
                      </button>
                    </div>
                  </div>

                  {/* Search and filter control tray */}
                  <div className="flex flex-col sm:flex-row items-center gap-3 bg-[#030611]/65 border border-slate-800/60 p-3 rounded-xl justify-between">
                    <div className="relative w-full sm:w-64">
                      <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="Search title or content..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="w-full bg-[#050D1E] text-xs text-white pl-8 pr-3 py-2 rounded-lg border border-slate-800 focus:border-[#D4AF37] outline-none transition placeholder-slate-500"
                      />
                    </div>

                    {/* Filter controls */}
                    <div className="flex items-center gap-1 bg-[#050D1E] border border-slate-800 p-0.5 rounded-lg w-full sm:w-auto justify-end">
                      {(["All", "Active", "Answered"] as const).map(tabf => (
                        <button
                          key={tabf}
                          onClick={() => setJournalFilter(tabf)}
                          className={`text-[10.5px] font-bold px-3 py-1.5 rounded transition cursor-pointer ${
                            journalFilter === tabf 
                              ? "bg-[#D4AF37] text-black" 
                              : "text-slate-400 hover:text-white"
                          }`}
                        >
                          {tabf}
                        </button>
                      ))}
                    </div>
                  </div>

                  {journalLoading ? (
                    <div className="flex items-center justify-center py-10">
                      <RotateCw className="w-6 h-6 text-[#D4AF37] animate-spin" />
                    </div>
                  ) : filteredJournal.length === 0 ? (
                    <div className="text-center py-12 bg-[#030611]/30 border border-dashed border-slate-800 rounded-xl space-y-2">
                      <FlameKindling className="w-8 h-8 text-slate-600 mx-auto" />
                      <p className="text-xs text-slate-400 font-medium">No prayer diary logs matched under "{journalFilter}" status.</p>
                      <p className="text-[10px] text-slate-500">Record a new daily burden to begin tracking spiritual breakthroughs.</p>
                    </div>
                  ) : (
                    <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
                      {filteredJournal.map((entry) => {
                        const isAnswered = entry.status === "Answered";
                        return (
                          <div
                            key={entry.id}
                            className={`p-4 rounded-xl border transition-all duration-300 relative overflow-hidden flex flex-col justify-between gap-3 ${
                              isAnswered
                                ? "bg-emerald-950/15 border-emerald-500/25 shadow-[0_0_15px_rgba(16,185,129,0.02)]"
                                : "bg-[#030611]/80 border-slate-800 hover:border-slate-700"
                            }`}
                          >
                            {/* Answered Celebration Watermark Accent */}
                            {isAnswered && (
                              <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-500/5 rounded-bl-full pointer-events-none flex items-center justify-center">
                                <Star className="w-5 h-5 text-emerald-400/20 fill-emerald-400/10 rotate-12" />
                              </div>
                            )}

                            <div>
                              <div className="flex items-start justify-between gap-3">
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2">
                                    <span className={`w-2 h-2 rounded-full ${isAnswered ? "bg-emerald-400" : "bg-amber-400"}`} />
                                    <h5 className={`text-sm font-bold tracking-tight ${isAnswered ? "text-emerald-300" : "text-white"}`}>
                                      {entry.title}
                                    </h5>
                                  </div>
                                  <span className="text-[9.5px] text-slate-500 font-mono block">
                                    CREATED: {new Date(entry.createdAt).toLocaleString()} 
                                    {entry.answeredAt && ` | ANSWERED: ${new Date(entry.answeredAt).toLocaleString()}`}
                                  </span>
                                </div>

                                <div className="flex items-center gap-2 z-10 shrink-0">
                                  {/* Toggle Marked Answered button */}
                                  <button
                                    onClick={() => handleToggleAnswered(entry)}
                                    className={`flex items-center gap-1 text-[10px] font-bold py-1 px-2.5 rounded-lg border cursor-pointer transition ${
                                      isAnswered
                                        ? "bg-emerald-950/40 border-emerald-500/40 text-emerald-300 hover:bg-emerald-900/50"
                                        : "bg-transparent border-slate-800 hover:border-slate-700 text-[#B0C4DE]"
                                    }`}
                                    title={isAnswered ? "Re-open to active status" : "Celebrate Answered Prayer!"}
                                  >
                                    {isAnswered ? (
                                      <>
                                        <CheckCircle className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400" /> Answered Testimony
                                      </>
                                    ) : (
                                      <>
                                        <Star className="w-3.5 h-3.5 text-amber-400" /> Mark Answered
                                      </>
                                    )}
                                  </button>

                                  <button
                                    onClick={() => handleDeleteJournal(entry.id)}
                                    className="text-slate-500 hover:text-rose-400 p-1 rounded transition cursor-pointer"
                                    title="Delete Entry"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>

                              <p className={`text-xs mt-3 leading-relaxed leading-normal whitespace-pre-wrap ${isAnswered ? "text-slate-400 font-normal italic" : "text-slate-200"}`}>
                                {entry.request}
                              </p>
                            </div>

                            {/* Answered Celebration Banner */}
                            {isAnswered && (
                              <div className="bg-emerald-950/40 border border-emerald-500/10 p-2.5 rounded-lg mt-2 text-[10.5px] " >
                                <span className="font-bold text-emerald-400 flex items-center gap-1 uppercase tracking-wider font-mono">
                                  👑 Hallelujah Testimony Recorded
                                </span>
                                <p className="text-slate-400 italic mt-0.5">"I will give thanks to the LORD with my whole heart; I will recount all of your wonderful deeds." &mdash; Psalm 9:1</p>
                              </div>
                            )}

                          </div>
                        );
                      })}
                    </div>
                  )}

                </div>
              </div>

            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* DAILY REMINDERS TAB VIEW (1. Implement daily prayer reminder) */}
        {/* ========================================================================= */}
        {activeSubTab === "reminders" && (
          <div className="col-span-1 lg:col-span-12 space-y-6 animate-fade-in text-white">
            <div className="bg-[#050D1E]/95 border border-slate-800 p-6 rounded-2xl max-w-2xl mx-auto space-y-6">
              
              <div className="border-b border-slate-800 pb-3 flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-[#D4AF37]/10 flex items-center justify-center border border-[#D4AF37]/20">
                  <Clock className="w-5 h-5 text-[#D4AF37]" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white uppercase tracking-wider">Configure Daily Altar Break Reminder</h3>
                  <p className="text-xs text-slate-400">Establish a persistent daily alarm schedule to pause, meditate on Holy context, and pray.</p>
                </div>
              </div>

              {/* Status Indicator */}
              <div className={`p-4 rounded-xl border flex items-center justify-between gap-4 transition ${
                reminderEnabled 
                  ? "bg-emerald-950/15 border-emerald-500/20" 
                  : "bg-slate-950/40 border-slate-900"
              }`}>
                <div className="space-y-0.5">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500">Scheduler Status Indicator</span>
                  <p className={`text-sm font-bold ${reminderEnabled ? "text-emerald-400" : "text-rose-400"}`}>
                    ● {reminderEnabled 
                      ? `DAILY REMINDER COMMITTED TO ${String(reminderHour).padStart(2, "0")}:${String(reminderMinute).padStart(2, "0")} DAILY` 
                      : "DAILY COMMUNION MEDITATIONS SILENCED"}
                  </p>
                </div>

                {/* Big Switch style control */}
                <button
                  onClick={() => handleToggleReminder(!reminderEnabled)}
                  className={`w-14 h-7 rounded-full px-1 relative transition flex items-center cursor-pointer ${
                    reminderEnabled ? "bg-emerald-500" : "bg-slate-800"
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform duration-200 ${
                    reminderEnabled ? "translate-x-7" : "translate-x-0"
                  }`} />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                
                {/* Time picker dial */}
                <div className="bg-[#030611] p-5 rounded-xl border border-slate-900 text-center space-y-4">
                  <span className="text-xs font-bold text-[#D4AF37] block uppercase tracking-wider">Configure Targeted Alarm Hour</span>
                  
                  <div className="flex items-center justify-center gap-2">
                    {/* Hour Select dial */}
                    <div className="space-y-1">
                      <select
                        value={reminderHour}
                        onChange={e => handleSaveReminderTime(Number(e.target.value), reminderMinute)}
                        className="bg-[#050D1E] border-2 border-slate-800 text-2xl font-black rounded-lg p-3 outline-none text-[#D4AF37]"
                      >
                        {Array.from({ length: 24 }).map((_, hidx) => (
                          <option key={hidx} value={hidx}>{String(hidx).padStart(2, "0")}</option>
                        ))}
                      </select>
                      <span className="text-[10px] text-slate-500 block uppercase font-bold font-mono">Hour</span>
                    </div>

                    <span className="text-2xl font-black text-slate-400 self-start mt-2">:</span>

                    {/* Minute Select dial */}
                    <div className="space-y-1">
                      <select
                        value={reminderMinute}
                        onChange={e => handleSaveReminderTime(reminderHour, Number(e.target.value))}
                        className="bg-[#050D1E] border-2 border-slate-800 text-2xl font-black rounded-lg p-3 outline-none text-[#D4AF37]"
                      >
                        {Array.from({ length: 12 }).map((_, midx) => {
                          const mValue = midx * 5;
                          return <option key={midx} value={mValue}>{String(mValue).padStart(2, "0")}</option>;
                        })}
                      </select>
                      <span className="text-[10px] text-slate-500 block uppercase font-bold font-mono">minute</span>
                    </div>
                  </div>

                  <p className="text-[10.5px] leading-relaxed text-slate-400 pl-2 pr-2">
                    Alarm schedules synchronize directly inside Firebase Firestore config maps or local secure cache structures.
                  </p>
                </div>

                {/* System Capabilities checklist */}
                <div className="space-y-3 font-sans text-xs">
                  <span className="font-bold text-slate-200 block uppercase tracking-wider font-mono text-[10px]">Activated reminder capabilities:</span>
                  
                  <div className="space-y-2 text-slate-300">
                    <div className="flex items-start gap-2.5">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span><strong>Browser Audio/In-App Alerting:</strong> Triggers beautiful spiritual banners while active.</span>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span><strong>Native OS Push notifications:</strong> Prompts system notifications if permitted.</span>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span><strong>Firestore Schema Syncing:</strong> Guards preferences across devices cleanly.</span>
                    </div>
                  </div>

                  {/* Manual testing button */}
                  <button
                    onClick={() => {
                      triggerToast("🔔", "Test Daily Communion Alert fired! Hallelujah.");
                      if (typeof Notification !== "undefined") {
                        if (Notification.permission === "granted") {
                          new Notification("FaithFlow App Test Alarm", {
                            body: "Test success! This is how your daily meditation alarm will alert you.",
                            icon: "/favicon.ico"
                          });
                        } else if (Notification.permission === "default") {
                          Notification.requestPermission();
                        }
                      }
                    }}
                    className="w-full mt-2 bg-[#112055] hover:bg-[#112055]/80 border border-slate-800 text-[10.5px] py-2 px-3 rounded-lg text-slate-300 font-bold transition cursor-pointer"
                  >
                    Send Instanteous Test Push Alarm
                  </button>
                </div>

              </div>

            </div>
          </div>
        )}

      </div>

    </div>
  );
}
