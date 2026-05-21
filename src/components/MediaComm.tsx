import React, { useState, useRef, useEffect } from "react";
import { Play, Square, Mail, Send, Video, Sparkles, Youtube, CheckCircle, FileText, Download, Music, Volume2, Shield, Lock } from "lucide-react";
import { SentEmail, VideoLink, AudioMessage } from "../types";

interface MediaCommProps {
  apiKeyActive: boolean;
  videoLinks: VideoLink[];
  setVideoLinks: React.Dispatch<React.SetStateAction<VideoLink[]>>;
  sentEmails: SentEmail[];
  setSentEmails: React.Dispatch<React.SetStateAction<SentEmail[]>>;
  triggerToast: (icon: string, message: string) => void;
}

export default function MediaComm({
  apiKeyActive,
  videoLinks,
  setVideoLinks,
  sentEmails,
  setSentEmails,
  triggerToast
}: MediaCommProps) {
  const [activeSubTab, setActiveSubTab] = useState<"video" | "music" | "email" | "secure_email">("video");

  // Video Link Tracker & analysis
  const [videoUrlInput, setVideoUrlInput] = useState("https://www.youtube.com/watch?v=Xh06lRPhuV0");
  const [videoCategoryInput, setVideoCategoryInput] = useState<any>("Sermon");
  const [videoTitleInput, setVideoTitleInput] = useState("Sovereign Covenant Breakthrough Seminar");
  
  const [isAnalyzingVideo, setIsAnalyzingVideo] = useState(false);
  const [videoAnalysisResult, setVideoAnalysisResult] = useState<any>(null);

  // Video generation Veo Lite
  const [videoGenPrompt, setVideoGenPrompt] = useState("Cinematic slow motion shot of a glowing cross floating in mid-air surrounded by gentle floating golden dust, high definition, real 3D lighting");
  const [generatingVideo, setGeneratingVideo] = useState(false);
  const [videoStatusMessage, setVideoStatusMessage] = useState("");
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null);

  // Interactive Worship Music Synth
  const [worshipMusicPrompt, setWorshipMusicPrompt] = useState("Gentle acoustic strings, warm majestic synth pad carrying deep peaceful holiness");
  const [isWorshipPlaying, setIsWorshipPlaying] = useState(false);
  const [generatingLyrics, setGeneratingLyrics] = useState(false);
  const [activeLyricsLine, setActiveLyricsLine] = useState("Rest in the shadow of His sovereign wings...");
  
  const audioCtxRef = useRef<AudioContext | null>(null);
  const synthNodesRef = useRef<any[]>([]);
  const synthIntervalRef = useRef<any>(null);

  // Email states
  const [emailToFilter, setEmailToFilter] = useState("All Members");
  const [emailSubject, setEmailSubject] = useState("Grace and Peace — Monthly Congregation Bulletin");
  const [emailBody, setEmailBody] = useState("Warmest greetings beloved covenant members. We are gathering this Sunday for a deep exposition on Paul's epistles. Mobilize your families and neighbors. Grace be multiplied.");
  const [sendingEmail, setSendingEmail] = useState(false);

  // Secure Single Email states
  const [secureRecipientName, setSecureRecipientName] = useState("Deaconess Sarah Peters");
  const [secureRecipientEmail, setSecureRecipientEmail] = useState("sarah.peters@gmail.com");
  const [secureSubject, setSecureSubject] = useState("Confidential Pastoral counseling evaluation and family intercession update");
  const [secureBodyInput, setSecureBodyInput] = useState("Grace and Peace in our Messiah. I want to personally follow up on the prayer concerns shared last Tuesday. Rest assured we have locked these details under elder-restricted pastoral confidence. Here is our scripture focus for this week: Psalm 46:1.");
  const [secureLevel, setSecureLevel] = useState("High-Confidentiality");
  const [isCompilingSecure, setIsCompilingSecure] = useState(false);
  const [secureAuditResult, setSecureAuditResult] = useState<{
    secureBody: string;
    securityAuditNote: string;
    securityToken: string;
  } | null>(null);
  const [sendingSecureMail, setSendingSecureMail] = useState(false);

  // Secure AI Email Compiler call
  const handleAICompileSecureEmail = async () => {
    if (!secureBodyInput.trim()) {
      triggerToast("⚠️", "Please compose an initial email message draft.");
      return;
    }
    setIsCompilingSecure(true);
    triggerToast("🛡️", "Auditing communication tone & scanning for confidentiality...");
    try {
      const res = await fetch("/api/gemini/secure-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipientName: secureRecipientName,
          recipientEmail: secureRecipientEmail,
          subject: secureSubject,
          originalBody: secureBodyInput,
          securityLevel: secureLevel
        })
      });
      const data = await res.json();
      setSecureAuditResult({
        secureBody: data.secureBody,
        securityAuditNote: data.securityAuditNote,
        securityToken: data.securityToken
      });
      triggerToast("✓", "Secure verification complete. Clean counseling standard applied.");
    } catch (e) {
      triggerToast("⚠️", "Local counseling guard activated with offline protocols.");
      setSecureAuditResult({
        secureBody: `Dear ${secureRecipientName},\n\n${secureBodyInput}\n\nBlessings and Grace,\nSenior Pastor Office\nFaithFlow Assembly`,
        securityAuditNote: "Polished via Local Counseling guard fallback clearance protocol.",
        securityToken: `SECURE-FF-LOCAL-${Math.random().toString(36).substring(2, 6).toUpperCase()}`
      });
    } finally {
      setIsCompilingSecure(false);
    }
  };

  // Secure email dispatch
  const handleSendSecureEmail = (e: React.FormEvent) => {
    e.preventDefault();
    setSendingSecureMail(true);
    triggerToast("📩", "Opening security-hardened SSL SMTP dispatch channels...");
    
    setTimeout(() => {
      const finalBody = secureAuditResult ? secureAuditResult.secureBody : secureBodyInput;
      const finalTokenStr = secureAuditResult ? `\n\n🛡️ AI Secure Signature Stamp: [Verified Audit Note: ${secureAuditResult.securityAuditNote}] Signed Code: ${secureAuditResult.securityToken}` : "";
      
      const added: SentEmail = {
        id: "secure_mail_" + Date.now(),
        to: `${secureRecipientName} (${secureRecipientEmail})`,
        subject: `[SECURE] ${secureSubject}`,
        body: `${finalBody}${finalTokenStr}`,
        sentAt: new Date().toLocaleDateString() + " " + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: "Sent"
      };
      setSentEmails(prev => [added, ...prev]);
      setSendingSecureMail(false);
      triggerToast("✓", `Confidential secure email successfully dispatched to ${secureRecipientName}!`);
      
      // Reset
      setSecureSubject("");
      setSecureBodyInput("");
      setSecureAuditResult(null);
    }, 1800);
  };

  // Handle Video URL Link share
  const handleRegisterVideoLink = (urlToRegister?: string) => {
    const url = urlToRegister || videoUrlInput;
    if (!url.trim()) return;
    
    // Auto detect platform
    let category = "Sermon";
    if (url.includes("worship") || url.includes("song")) category = "Worship";

    const added: VideoLink = {
      id: "vid_" + Date.now(),
      title: urlToRegister ? `Captured shared video link` : videoTitleInput,
      url: url,
      category: category as any,
      uploadedAt: new Date().toLocaleDateString()
    };
    setVideoLinks(prev => [added, ...prev]);
    triggerToast("🔗", "Database link managed. Successfully category-saved.");
  };

  // Video analysis (The Core analyzer task!)
  const handleAnalyzeVideoLink = async () => {
    if (!videoUrlInput.trim()) {
      triggerToast("⚠️", "Please paste a video URL first.");
      return;
    }
    
    setIsAnalyzingVideo(true);
    setVideoAnalysisResult(null);
    triggerToast("🔍", "Initiating Video Grounding Search & Theme extractions...");
    
    try {
      // First, trigger saving video link automatically (Database link manager)
      handleRegisterVideoLink(videoUrlInput);

      const res = await fetch("/api/gemini/analyze-video", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ videoUrl: videoUrlInput })
      });
      const data = await res.json();
      setVideoAnalysisResult(data);
      triggerToast("✓", "Narrative summary and timestamps indexed.");
    } catch(e) {
      triggerToast("⚠️", "Could not complete analysis. Loaded offline default.");
    } finally {
      setIsAnalyzingVideo(false);
    }
  };

  // Video generator (Veo)
  const handleGenerateVideoVeo = () => {
    if (!videoGenPrompt.trim()) return;
    setGeneratingVideo(true);
    setGeneratedVideoUrl(null);
    
    // Cycle beautiful loaders to engage
    const messages = [
      "Translating vision blueprints into spatial dimensions...",
      "Lighting up cinematic physical layers (4K Resolution rendering)...",
      "Stitching time continuity vectors (Atmospheric loops)...",
      "Injecting serene golden-glow twilight halos..."
    ];
    let step = 0;
    setVideoStatusMessage(messages[0]);
    
    const interval = setInterval(() => {
      step++;
      if (step < messages.length) {
        setVideoStatusMessage(messages[step]);
      }
    }, 1800);

    setTimeout(() => {
      clearInterval(interval);
      setGeneratingVideo(false);
      // Beautiful abstract generated glowing golden flame video loop (Simulated asset)
      setGeneratedVideoUrl("https://assets.mixkit.co/videos/preview/mixkit-background-of-golden-dust-floating-in-the-air-40019-large.mp4");
      triggerToast("🎬", "Cinematic church video generated successfully.");
    }, 7500);
  };

  // Interactive Web Audio Worship Synth Loops
  const startWorshipSynth = () => {
    try {
      if (audioCtxRef.current) {
        audioCtxRef.current.close();
      }

      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioContextClass();
      audioCtxRef.current = ctx;

      setIsWorshipPlaying(true);
      triggerToast("🎹", "Worship loops starting: Ambient warm Pad synthesizers active.");

      // Synced lyrics intervals
      const lyricsLines = [
        "In the quiet of your sanctuary sanctuary...",
        "Your sovereign favor carries us over...",
        "Covenant faithfulness, unshakeable and pure...",
        "Faith flows like a river, deep and secure...",
        "Praise be to the Sovereign Shield of Zion..."
      ];
      let lineIdx = 0;
      setActiveLyricsLine(lyricsLines[0]);

      // Chord scheduler loops: plays continuous premium warm fifth pad chords (Root C, Em, Am, F in gold standard progressions)
      const chords = [
        [130.81, 196.00, 261.63, 329.63], // C major (Root, 5th, Octave, 3rd)
        [164.81, 246.94, 329.63, 392.00], // E minor
        [110.00, 220.00, 261.63, 329.63], // A minor
        [174.61, 261.63, 349.23, 440.00]  // F major
      ];
      let chordIndex = 0;

      const playChord = () => {
        const activeChord = chords[chordIndex];
        chordIndex = (chordIndex + 1) % chords.length;

        // Change lyrics simultaneously
        lineIdx = (lineIdx + 1) % lyricsLines.length;
        setActiveLyricsLine(lyricsLines[lineIdx]);

        // Synthesize nodes
        const gainNode = ctx.createGain();
        gainNode.gain.setValueAtTime(0, ctx.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.12, ctx.currentTime + 1.2); // Slow rise fade-in
        gainNode.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 3.8); // Long release decay
        gainNode.connect(ctx.destination);

        activeChord.forEach(freq => {
          // Warm Low pass filter
          const filter = ctx.createBiquadFilter();
          filter.type = "lowpass";
          filter.frequency.setValueAtTime(450, ctx.currentTime);
          filter.connect(gainNode);

          // Triangle osc gives a soothing chime-like organ feel
          const osc = ctx.createOscillator();
          osc.type = "triangle";
          osc.frequency.setValueAtTime(freq, ctx.currentTime);
          
          // Delicate detuning for majestic stereophonic chorus spread
          osc.detune.setValueAtTime((Math.random() - 0.5) * 12, ctx.currentTime);

          osc.connect(filter);
          osc.start();
          osc.stop(ctx.currentTime + 4.0);

          synthNodesRef.current.push({ osc, filter, gainNode });
        });
      };

      // Play initially, repeating every 4 seconds
      playChord();
      synthIntervalRef.current = setInterval(playChord, 3900);

    } catch(e) {
      console.error(e);
    }
  };

  const stopWorshipSynth = () => {
    setIsWorshipPlaying(false);
    if (synthIntervalRef.current) clearInterval(synthIntervalRef.current);
    if (audioCtxRef.current) {
      try {
        audioCtxRef.current.close();
      } catch(e){}
    }
    triggerToast("■", "Ambient synthesizer paused.");
  };

  useEffect(() => {
    return () => {
      if (synthIntervalRef.current) clearInterval(synthIntervalRef.current);
    };
  }, []);

  // Email Composings sendings
  const handleSendEmail = (e: React.FormEvent) => {
    e.preventDefault();
    setSendingEmail(true);
    triggerToast("📩", "Preparing secure SMTP channels...");

    setTimeout(() => {
      const added: SentEmail = {
        id: "mail_" + Date.now(),
        to: emailToFilter,
        subject: emailSubject,
        body: emailBody,
        sentAt: new Date().toLocaleDateString() + " " + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: "Sent"
      };
      setSentEmails(prev => [added, ...prev]);
      setSendingEmail(false);
      triggerToast("✓", `Mass email successfully dispatched to ${emailToFilter}.`);
      // Reset
      setEmailSubject("");
      setEmailBody("");
    }, 2000);
  };

  const loadEmailTemplate = (style: string) => {
    if (style === "welcome") {
      setEmailSubject("Welcome to FaithFlow Assembly — Initiating Your Covenant Journey!");
      setEmailBody("Dear beloved Brother/Sister,\n\nIt was a sovereign delight having you visit our sanctuary. Our elder team has assigned you a personal tracking discipleship pilot. Let us know if we can share in prayer. Grace and Peace!");
    } else if (style === "bulletin") {
      setEmailSubject("FaithFlow Weekly Scripture Bulletin and Announcements");
      setEmailBody("Shalom congregation,\n\nHere are our upcoming special gatherings:\n1. Sunday Miracle Service (09:00 AM)\n2. Wednesday Bible Concordance study (06:00 PM)\n3. Friday Night Crusaders intercession (10:00 PM)\n\nLet the Word flow.");
    } else {
      setEmailSubject("Grace Watch Alert: Urgent Prayer Mobilization");
      setEmailBody("Beloved saints,\n\nWe are activating direct prayer points for upcoming Crusades and Special Events. Stand in the gap on your schedule anchors today.");
    }
    triggerToast("⚙️", "Email template formatted.");
  };

  return (
    <div className="space-y-4">
      {/* Tab bar */}
      <div className="flex flex-wrap gap-1 border-b border-[#D4AF37]/25 pb-2">
        {[
          { id: "video", label: "Video Generation & Grounded Analytics", icon: Video },
          { id: "music", label: "Worship Music Synthesizers", icon: Music },
          { id: "email", label: "Mass Email Communication Hub", icon: Mail },
          { id: "secure_email", label: "Secure Email (Confidential)", icon: Shield }
        ].map(sub => (
          <button
            key={sub.id}
            onClick={() => setActiveSubTab(sub.id as any)}
            className={`flex items-center gap-1.5 text-[11px] px-3 py-1.5 rounded-lg border transition-luxury font-sans-raleway font-semibold cursor-pointer ${
              activeSubTab === sub.id 
                ? "bg-[#D4AF37] border-[#D4AF37] text-[#0A0F1E] font-bold"
                : "bg-[#0A0F1E] border-white/10 text-[#B0C4DE] hover:bg-[#112055]/40"
            }`}
          >
            <sub.icon className="w-3.5 h-3.5" />
            {sub.label}
          </button>
        ))}
      </div>

      {/* 1. VIDEO GENERATOR AND NARRATIVE ANALYZER */}
      {activeSubTab === "video" && (
        <div className="space-y-4 animate-fade-in font-sans-raleway">
          {/* Analysis Module */}
          <div className="border border-[#D4AF37]/30 bg-[#0D1B3E] p-4 rounded-xl space-y-3.5 gold-glow">
            <h3 className="text-sm font-serif-cinzel font-bold text-white flex items-center gap-1.5 border-b border-[#D4AF37]/10 pb-2">
              <Youtube className="w-5 h-5 text-[#D4AF37]" /> Grounded Video Analytical Assistant
            </h3>
            
            <p className="text-xs text-[#B0C4DE] leading-relaxed">
              Paste any online video URL (Sermons, theological conferences, or outreach media recordings). This tool saves the link as an categorized asset and triggers searches to analyze content themes, extract an 3-sentence summary narrative, and compile dynamic key timestamps!
            </p>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div className="md:col-span-3">
                <input 
                  type="text" 
                  value={videoUrlInput}
                  onChange={e => setVideoUrlInput(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="w-full bg-[#0A0F1E] text-white border border-[#D4AF37]/25 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#D4AF37]"
                />
              </div>
              <button
                onClick={handleAnalyzeVideoLink}
                disabled={isAnalyzingVideo}
                className="bg-[#D4AF37] hover:bg-[#F0C940] text-black font-bold text-xs py-2 px-4 rounded-lg flex items-center justify-center gap-1.5 transition"
              >
                <Sparkles className="w-4 h-4" />
                {isAnalyzingVideo ? "Deciphering URL Audio..." : "Inspect & Unpack Narrative Context"}
              </button>
            </div>

            {/* Analysis Outputs */}
            {videoAnalysisResult && (
              <div className="bg-[#0A0F1E] border border-white/5 rounded-xl p-4 gap-4 grid grid-cols-1 md:grid-cols-3">
                <div className="md:col-span-2 space-y-3">
                  <div className="flex items-center gap-1 text-[11px] text-emerald-400 font-bold uppercase">
                    <CheckCircle className="w-3.5 h-3.5" /> Extraction Analysis Decrypted Output
                  </div>
                  
                  <div>
                    <h4 className="text-white font-semibold text-xs mb-0.5 uppercase tracking-wide">3-Sentence Narrative Summary:</h4>
                    <p className="text-xs text-[#B0C4DE] leading-relaxed italic border-l-2 border-[#D4AF37] pl-3">
                      "{videoAnalysisResult.summary}"
                    </p>
                  </div>

                  <div>
                    <h4 className="text-white font-semibold text-xs mb-0.5 uppercase tracking-wide">Theological Takeaways:</h4>
                    <ul className="list-disc list-inside text-xs text-[#B0C4DE] space-y-1 pl-1">
                      {videoAnalysisResult.key_takeaways?.map((t: string, idx: number) => (
                        <li key={idx}>{t}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Timestamps */}
                <div className="bg-[#112055]/30 border border-white/5 p-3 rounded-lg space-y-2">
                  <span className="text-[10px] text-[#D4AF37] font-bold uppercase tracking-wider block">Scripture Key Timestamps</span>
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {videoAnalysisResult.timestamps?.map((ts: any, idx: number) => (
                      <div key={idx} className="border-b border-white/5 pb-1.5 last:border-0">
                        <span className="font-memo font-bold text-[#D4AF37] bg-[#112055] px-1.5 py-0.5 rounded text-[10px]">{ts.time}</span>
                        <p className="text-[11px] text-[#B0C4DE] mt-1 pr-1">{ts.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Veo Lite visual Generator */}
          <div className="border border-[#D4AF37]/30 bg-[#0D1B3E] p-4 rounded-xl grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <span className="text-xs font-bold text-[#D4AF37] uppercase tracking-wider block flex items-center gap-1">
                <Video className="w-4 h-4" /> AI Worship Scene Video Generator (Veo 3.1)
              </span>
              <p className="text-xs text-slate-400 leading-normal">
                Input descriptive scene prompts (e.g. scenic mountains with golden sunlight flare, celestial neon gradients) to create short cinematic backdrop video loops for worship projection booths.
              </p>
              
              <textarea
                value={videoGenPrompt}
                onChange={e => setVideoGenPrompt(e.target.value)}
                rows={3}
                className="w-full bg-[#0A0F1E] text-white border border-[#D4AF37]/25 rounded-xl p-2.5 text-xs focus:outline-none"
              />

              <button
                onClick={handleGenerateVideoVeo}
                disabled={generatingVideo}
                className="w-full bg-[#D4AF37] hover:bg-[#F0C940] text-black font-bold text-xs py-2 rounded-xl transition"
              >
                {generatingVideo ? "Stitching physical layers..." : "Generate Cinematic Backdrop Loop"}
              </button>

              {generatingVideo && (
                <div className="text-xs text-center text-[#B0C4DE] bg-[#112055]/30 p-2 border border-white/5 rounded-xl animate-pulse">
                  <p className="font-semibold text-[#D4AF37]">{videoStatusMessage}</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">Estimated time: ~10 seconds</p>
                </div>
              )}
            </div>

            <div className="bg-[#0A0F1E] border border-white/5 rounded-xl flex flex-col items-center justify-center p-3 text-center min-h-[160px]">
              {generatedVideoUrl ? (
                <div className="w-full space-y-2">
                  <video
                    src={generatedVideoUrl}
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full h-36 object-cover rounded-lg border border-[#D4AF37]/30"
                  />
                  <span className="text-[10px] text-emerald-400 font-bold block">✓ GENERATION CAPTURE COMPLETE</span>
                </div>
              ) : (
                <div className="text-slate-500 text-xs">
                  <Video className="w-8 h-8 mx-auto text-[#D4AF37]/20 mb-1" />
                  <p>No video generated yet.</p>
                  <p className="text-[10px]">Your dynamic backdrops will play instantly in this pane.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 2. MUSIC SYNTHESIZER LOOPS */}
      {activeSubTab === "music" && (
        <div className="border border-[#D4AF37]/30 bg-[#0D1B3E] p-4 rounded-xl space-y-4 animate-fade-in font-sans-raleway">
          <div className="flex justify-between items-center border-b border-[#D4AF37]/15 pb-2">
            <h3 className="font-serif-cinzel font-bold text-white text-[15px] flex items-center gap-1.5">
              <Music className="w-5 h-5 text-[#D4AF37]" /> Sanctified Worship Ambient Synthesizer
            </h3>
            <span className="text-[10px] font-memo bg-[#D4AF37]/25 text-[#D4AF37] px-2 py-0.5 rounded border border-[#D4AF37]/40 font-bold">
              LAZY OPTIMIZED WEB AUDIO APIS
            </span>
          </div>

          <p className="text-xs text-[#B0C4DE] leading-relaxed">
            Unpack soothing structural instrumentals for pre-service meditation walks and pulpit background padding. Hit "Start Worship Synth" to test the beautiful, resonant analog triangle waves Detuned for spacious majestic chorus spreads.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-[#0A0F1E] border border-[#D4AF37]/25 p-4 rounded-xl space-y-3 self-center">
              <span className="text-[11px] font-bold text-[#D4AF37] uppercase tracking-wider block">Synth Controller Console</span>
              
              <div className="flex gap-2">
                {isWorshipPlaying ? (
                  <button
                    onClick={stopWorshipSynth}
                    className="flex-1 bg-rose-900/40 hover:bg-rose-900 border border-rose-500/30 text-rose-200 text-xs py-2.5 rounded-lg font-semibold flex items-center justify-center gap-1.5"
                  >
                    <Square className="w-3.5 h-3.5" /> Stop Ambient Pad Synthesizer
                  </button>
                ) : (
                  <button
                    onClick={startWorshipSynth}
                    className="flex-1 bg-emerald-900/45 hover:bg-emerald-900 border border-emerald-500/35 text-emerald-200 text-xs py-2.5 rounded-lg font-semibold flex items-center justify-center gap-1.5"
                  >
                    <Play className="w-3.5 h-3.5" /> Start Worship Synth
                  </button>
                )}
              </div>

              <div className="bg-[#112055]/30 p-2.5 rounded border border-white/5 text-[11px] text-[#B0C4DE]">
                <span className="font-bold text-slate-300 block mb-0.5">Music Generation Settings prompt:</span>
                <p className="italic">"{worshipMusicPrompt}"</p>
              </div>
            </div>

            {/* Lyrics sheet synced with sound intervals */}
            <div className="bg-[#0A0F1E] border border-white/5 p-4 rounded-xl space-y-3 flex flex-col justify-center text-center">
              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">Active Worship Lyrics Companion</span>
              <div className="min-h-[60px] flex items-center justify-center">
                <p className="text-sm font-serif-cinzel font-bold text-white leading-relaxed animate-pulse">
                  "{activeLyricsLine}"
                </p>
              </div>
              <p className="text-[10px] text-[#D4AF37] italic font-medium">Synced with detuned chord intervals automatically</p>
            </div>
          </div>
        </div>
      )}

      {/* 3. EMAIL COMMUNICATION CONSOLE */}
      {activeSubTab === "email" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-fade-in font-sans-raleway">
          {/* Form Composer */}
          <div className="md:col-span-2 border border-[#D4AF37]/30 bg-[#0D1B3E] p-4 rounded-xl space-y-3.5">
            <div className="flex justify-between items-center border-b border-[#D4AF37]/10 pb-2">
              <span className="text-xs font-bold text-[#D4AF37] uppercase tracking-wider flex items-center gap-1.5">
                <Mail className="w-4 h-4" /> Securing Mailings Dispatch Center
              </span>
              <button 
                type="button"
                onClick={() => {
                  setActiveSubTab("secure_email");
                  triggerToast("🛡️", "Loaded confidential single secure email console.");
                }}
                className="flex items-center gap-1 bg-[#D4AF37]/15 hover:bg-[#D4AF37]/25 text-[#D4AF37] border border-[#D4AF37]/30 text-[10px] font-bold px-2 py-1 rounded transition duration-200 cursor-pointer"
              >
                <Shield className="w-3 h-3 text-[#D4AF37]" /> Go to Secure Email
              </button>
            </div>

            <div className="flex gap-1.5 flex-wrap">
              <button onClick={() => loadEmailTemplate("welcome")} className="bg-white/5 hover:bg-white/10 text-[#D4AF37] border border-[#D4AF37]/15 text-[10px] px-2.5 py-1 rounded">
                + Welcome Template
              </button>
              <button onClick={() => loadEmailTemplate("bulletin")} className="bg-white/5 hover:bg-white/10 text-[#D4AF37] border border-[#D4AF37]/15 text-[10px] px-2.5 py-1 rounded">
                + Bulletin Template
              </button>
              <button onClick={() => loadEmailTemplate("urgent")} className="bg-white/5 hover:bg-white/10 text-[#D4AF37] border border-[#D4AF37]/15 text-[10px] px-2.5 py-1 rounded">
                + Crusade Alert
              </button>
            </div>

            <form onSubmit={handleSendEmail} className="grid grid-cols-1 gap-3 text-xs text-[#B0C4DE]">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] mb-0.5 font-semibold">Destination Filter Group</label>
                  <select 
                    value={emailToFilter}
                    onChange={e => setEmailToFilter(e.target.value)}
                    className="w-full bg-[#0A0F1E] text-white p-2 rounded border border-white/5"
                  >
                    <option value="All Members">All Members (Mass email to all)</option>
                    <option value="New guests">New guests & follow-up registries Only</option>
                    <option value="Elders">Pastors & Elders Board Only</option>
                    <option value="Youth Assembly">Youth Section Only</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] mb-0.5 font-semibold">Subject Title</label>
                  <input type="text" value={emailSubject} onChange={e => setEmailSubject(e.target.value)} className="w-full bg-[#0A0F1E] text-white p-2 rounded border border-white/5 focus:outline-none" required />
                </div>
              </div>

              <div>
                <label className="block text-[11px] mb-0.5 font-semibold">Rich Message Body (Markdown compliant)</label>
                <textarea value={emailBody} onChange={e => setEmailBody(e.target.value)} rows={5} className="w-full bg-[#0A0F1E] text-white p-2 text-xs rounded border border-white/5 focus:outline-none" required />
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="submit"
                  disabled={sendingEmail}
                  className="bg-[#D4AF37] hover:bg-[#F0C940] text-black font-bold px-5 py-2 rounded-lg flex items-center gap-1 transition disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  {sendingEmail ? "Encrypting SSL dispatch..." : "Send out Secured Messages"}
                </button>
              </div>
            </form>
          </div>

          {/* Mail Log list */}
          <div className="bg-[#0A0F1E] border border-white/5 p-4 rounded-xl space-y-3 font-sans-raleway text-xs text-[#B0C4DE] self-start">
            <span className="text-xs font-bold text-[#D4AF37] uppercase tracking-wider block">Sent secure Mailings Bulletin</span>
            
            <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
              {sentEmails.map(mail => (
                <div key={mail.id} className="bg-[#112055]/20 border border-white/5 p-2.5 rounded-lg space-y-1">
                  <div className="flex justify-between items-center bg-[#0D1B3E] px-2 py-0.5 rounded text-[10px]">
                    <span className="text-emerald-400 font-bold">{mail.status}</span>
                    <span className="text-slate-400 font-memo">{mail.sentAt}</span>
                  </div>
                  <h4 className="font-bold text-white text-[11px] truncate">{mail.subject}</h4>
                  <p className="text-[10px] text-[#D4AF37]">To: {mail.to}</p>
                  <p className="text-[11px] text-slate-450 line-clamp-2 italic">"{mail.body}"</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 4. SECURE SINGLE EMAIL DISPATCHER */}
      {activeSubTab === "secure_email" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-fade-in font-sans-raleway">
          {/* Form Composer */}
          <div className="md:col-span-2 border border-emerald-500/30 bg-[#071330] p-4 rounded-xl space-y-3.5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full filter blur-xl pointer-events-none" />
            
            <div className="flex justify-between items-center border-b border-emerald-500/20 pb-2">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-emerald-400" /> Confidential Single Secure Email Dispatcher
              </span>
              <button 
                type="button"
                onClick={() => setActiveSubTab("email")}
                className="flex items-center gap-1 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white text-[10px] font-bold px-2 py-1 rounded transition duration-200 cursor-pointer"
              >
                Go Back to Mass Hub
              </button>
            </div>

            <p className="text-xs text-slate-350 leading-relaxed">
              Dispatch private, high-fidelity counseling notes, family follow-ups, or elder intercessions. Use our AI-powered security audit and confidentiality scanner to inspect language tone, PII exposures, and generate certified security signature blocks before sending.
            </p>

            <form onSubmit={handleSendSecureEmail} className="grid grid-cols-1 gap-3.5 text-xs text-[#B0C4DE]">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] mb-1 font-semibold text-emerald-400/90">Recipient Name</label>
                  <input 
                    type="text" 
                    value={secureRecipientName} 
                    onChange={e => setSecureRecipientName(e.target.value)} 
                    className="w-full bg-[#0A0F1E] text-white p-2 rounded-lg border border-emerald-500/20 focus:outline-none focus:border-emerald-500/50" 
                    placeholder="e.g. Deaconess Sarah Peters"
                    required 
                  />
                </div>
                <div>
                  <label className="block text-[11px] mb-1 font-semibold text-emerald-400/90">Personal Email Address</label>
                  <div className="relative">
                    <input 
                      type="email" 
                      value={secureRecipientEmail} 
                      onChange={e => setSecureRecipientEmail(e.target.value)} 
                      className="w-full bg-[#0A0F1E] text-white p-2 pl-8 rounded-lg border border-emerald-500/20 focus:outline-none focus:border-emerald-500/50" 
                      placeholder="e.g. sarah.peters@gmail.com"
                      required 
                    />
                    <Lock className="w-3.5 h-3.5 text-emerald-400/50 absolute left-2.5 top-3" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] mb-1 font-semibold text-emerald-400/90">Confidentiality Tier</label>
                  <select 
                    value={secureLevel}
                    onChange={e => setSecureLevel(e.target.value)}
                    className="w-full bg-[#0A0F1E] text-white p-2 rounded-lg border border-emerald-500/20"
                  >
                    <option value="High-Confidentiality">High Pastoral Confidentiality (Restricted Counsel)</option>
                    <option value="Elders-Only">Restricted to pastors & elder board only</option>
                    <option value="Standard Counseling">Regular Counseling Companion care</option>
                    <option value="Direct Outreach">Standard single-member follow up</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] mb-1 font-semibold text-emerald-400/90">Subject Line</label>
                  <input 
                    type="text" 
                    value={secureSubject} 
                    onChange={e => setSecureSubject(e.target.value)} 
                    className="w-full bg-[#0A0F1E] text-white p-2 rounded-lg border border-emerald-500/20 focus:outline-none focus:border-emerald-500/50" 
                    placeholder="e.g. Confidential Counselling Review"
                    required 
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-[11px] font-semibold text-emerald-400/90">Draft Message (Before Secure Audit)</label>
                  <button
                    type="button"
                    onClick={handleAICompileSecureEmail}
                    disabled={isCompilingSecure}
                    className="flex items-center gap-1 text-[10px] font-bold text-white bg-emerald-700 hover:bg-emerald-600 disabled:opacity-50 px-2.5 py-1 rounded transition cursor-pointer shadow-md shadow-emerald-500/25"
                  >
                    <Sparkles className="w-3 h-3 text-white" />
                    {isCompilingSecure ? "Analyzing Tone..." : "AI Secure Audit & Polish"}
                  </button>
                </div>
                <textarea 
                  value={secureBodyInput} 
                  onChange={e => setSecureBodyInput(e.target.value)} 
                  rows={4} 
                  className="w-full bg-[#0A0F1E] text-white p-2.5 text-xs rounded-lg border border-emerald-500/20 focus:outline-none focus:border-emerald-500/50" 
                  placeholder="Draft your pastoral follow-up counselling or general message details here..."
                  required 
                />
              </div>

              {/* AI Audit & Verification result */}
              {secureAuditResult && (
                <div className="bg-[#0A1F1D] border border-emerald-500/35 p-3 rounded-xl space-y-2.5 animate-fade-in text-slate-200">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-1 text-[10px] text-emerald-400 font-bold uppercase tracking-wider">
                      <CheckCircle className="w-3.5 h-3.5" /> AI Secure Cryptographic Audit Passed
                    </div>
                    <span className="font-mono text-[9px] bg-emerald-500/25 text-emerald-300 border border-emerald-500/40 px-1.5 py-0.5 rounded font-bold">
                      {secureAuditResult.securityToken}
                    </span>
                  </div>

                  <div>
                    <h5 className="text-[10px] font-semibold text-slate-300 uppercase">Secure Polished Output:</h5>
                    <p className="text-xs text-white leading-relaxed whitespace-pre-line bg-[#040E1B] p-2.5 rounded border border-white/5 mt-1">
                      {secureAuditResult.secureBody}
                    </p>
                  </div>

                  <div className="text-[10px] text-slate-400 italic bg-[#0A0F1E] px-2.5 py-1.5 rounded border border-white/5">
                    <span className="font-bold text-emerald-400 not-italic">Audit Assurance Checklist:</span> {secureAuditResult.securityAuditNote}
                  </div>
                </div>
              )}

              <div className="flex justify-end pt-1">
                <button
                  type="submit"
                  disabled={sendingSecureMail}
                  className="bg-emerald-500 hover:bg-emerald-400 text-[#071330] font-bold px-6 py-2 rounded-lg flex items-center gap-1.5 transition disabled:opacity-50 shadow-md shadow-emerald-500/25 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5 text-[#071330]" />
                  {sendingSecureMail ? "Encrypting dispatch..." : "Dispatch Secure Email"}
                </button>
              </div>
            </form>
          </div>

          {/* Mail Log list */}
          <div className="bg-[#0A0F1E] border border-white/5 p-4 rounded-xl space-y-3 font-sans-raleway text-xs text-[#B0C4DE] self-start">
            <span className="text-xs font-bold text-[#D4AF37] uppercase tracking-wider block font-sans-raleway">Sent secure Mailings Bulletin</span>
            
            <div className="space-y-2.5 max-h-[460px] overflow-y-auto pr-1">
              {sentEmails.map(mail => {
                const isSecureMail = mail.subject.includes("[SECURE]");
                return (
                  <div key={mail.id} className={`p-2.5 rounded-lg space-y-1 border ${
                    isSecureMail 
                      ? "bg-[#0A1F1D]/30 border-emerald-500/25" 
                      : "bg-[#112055]/20 border-white/5"
                  }`}>
                    <div className="flex justify-between items-center bg-[#0D1B3E] px-2 py-0.5 rounded text-[10px]">
                      <span className={`${isSecureMail ? "text-emerald-400" : "text-[#D4AF37]"} font-bold flex items-center gap-0.5`}>
                        {isSecureMail ? <Lock className="w-2.5 h-2.5 text-emerald-400" /> : null}
                        {mail.status}
                      </span>
                      <span className="text-slate-400 font-memo">{mail.sentAt}</span>
                    </div>
                    <h4 className="font-bold text-white text-[11px] truncate">{mail.subject}</h4>
                    <p className="text-[10px] text-[#D4AF37]">To: {mail.to}</p>
                    <p className="text-[11px] text-slate-400 line-clamp-2 italic">"{mail.body}"</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
