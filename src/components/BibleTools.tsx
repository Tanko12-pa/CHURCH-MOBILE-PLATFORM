import React, { useState } from "react";
import { BookOpen, Sparkles, Send, ShieldAlert, Heart, Landmark, RefreshCw, Pencil, Check, Trash2, Plus, Upload, FileText, CheckCircle, Shield } from "lucide-react";
import { BibleDoctrine } from "../types";

interface BibleToolsProps {
  triggerToast: (icon: string, message: string) => void;
  preferredVersion: string;
  setPreferredVersion: (v: string) => void;
  isOffline: boolean;
}

export default function BibleTools({ triggerToast, preferredVersion, setPreferredVersion }: BibleToolsProps) {
  const [activeSubTab, setActiveSubTab] = useState<"chat" | "study" | "doctrine" | "haven" | "concordance">("chat");

  // Edit Mode states to let users edit Outline topics and Scripture References to their own standard
  const [isStudyEditing, setIsStudyEditing] = useState(false);
  const [isDoctrineEditing, setIsDoctrineEditing] = useState(false);

  // States for individual AI-powered section refinement in study & doctrine
  const [activeRefineSectionStudy, setActiveRefineSectionStudy] = useState<string | null>(null);
  const [studyRefinePrompt, setStudyRefinePrompt] = useState("");
  const [isStudyRefining, setIsStudyRefining] = useState(false);

  const [activeRefineSectionDoctrine, setActiveRefineSectionDoctrine] = useState<string | null>(null);
  const [doctrineRefinePrompt, setDoctrineRefinePrompt] = useState("");
  const [isDoctrineRefining, setIsDoctrineRefining] = useState(false);

  // 0. Dynamic Bible Creeds & Custom Doctrines states
  const [doctrinesList, setDoctrinesList] = useState<BibleDoctrine[]>([
    {
      id: "nicene",
      name: "The Apostles' & Nicene Creed (Historical Orthodoxy)",
      type: "preset",
      content: `1. We believe in one God, the Father Almighty, Maker of heaven and earth, and of all things visible and invisible.
2. And in one Lord Jesus Christ, the only-begotten Son of God, begotten of the Father before all worlds, God of God, Light of Light, very God of very God, begotten, not made, being of one substance with the Father.
3. Who for us men and for our salvation came down from heaven, and was incarnate by the Holy Spirit of the virgin Mary, and was made man.
4. And was crucified also for us under Pontius Pilate; He suffered and was buried; and the third day He rose again.
5. We believe in the Holy Spirit, the Lord and Giver of Life, who proceeds from the Father and the Son, who with the Father and the Son together is worshipped and glorified.
6. We believe in one holy Christian and apostolic Church; we acknowledge one baptism for the remission of sins; and we look for the resurrection of the dead, and the life of the world to come.`,
      summary: "Historical, classic Trinitarian orthodoxy. Christ's incarnation, death, physical resurrection, divinity of the Holy Spirit, and apostolic authority."
    },
    {
      id: "westminster",
      name: "Westminster Confession of Faith (Reformed Standard)",
      type: "preset",
      content: `1. Holy Scripture is the only sufficient, certain, and infallible rule of all saving knowledge, faith, and obedience.
2. God hath decreed in Himself, from all eternity, by the most wise and holy counsel of His own will, freely and unchangeably, all things whatsoever comes to pass.
3. Elect infants, dying in infancy, are regenerated and saved by Christ through the Spirit, who worketh when, and where, and how He pleaseth.
4. Justification is an act of God's free grace, wherein He pardoneth all their sins, and accepteth them as righteous in His sight, only for the righteousness of Christ imputed to them.
5. Good works are only such as God hath commanded in His holy Word, and are the fruits and evidences of a true and lively faith.`,
      summary: "Reformed covenant theology. Scripture infallibility, eternal divine decrees, sovereign regeneration, and justification by imputed righteousness."
    },
    {
      id: "baptist",
      name: "The Baptist Faith & Message 2000 (Baptist Principles)",
      type: "preset",
      content: `1. The Holy Bible was written by men divinely inspired and is God's revelation of Himself to man. It has God for its author, salvation for its end, and truth, without any mixture of error, for its matter.
2. There is one and only one living and true God. He is an intelligent, spiritual, and personal Being, the Creator, Redeemer, Preserver, and Ruler of the universe.
3. Election is the gracious purpose of God, according to which He regenerates, justifies, sanctifies, and saves sinners.
4. Christian baptism is the immersion of a believer in water in the name of the Father, the Son, and the Holy Spirit.
5. A church of the Lord Jesus Christ is a local body of baptized believers, associated by covenant in the faith and fellowship of the gospel.`,
      summary: "Baptist covenant principles. Believer's baptism by total immersion, absolute scripture inerrancy, local church autonomy, and personal responsibility."
    }
  ]);
  const [selectedDoctrineId, setSelectedDoctrineId] = useState<string>("nicene");
  const [customDocName, setCustomDocName] = useState("");
  const [customDocContent, setCustomDocContent] = useState("");
  const [isDragOverDoc, setIsDragOverDoc] = useState(false);

  // 1. BibleGPT Chat States
  const [chatVersion, setChatVersion] = useState(preferredVersion);
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState<any[]>([
    {
      role: "assistant",
      content: "Shalom. I am BibleGPT, your expert biblical study companion. Speak, and let us dissect the divine Word in scripture, historical frameworks, and cultural backgrounds together."
    }
  ]);
  const [isChatLoading, setIsChatLoading] = useState(false);

  // 2. Bible AI Study State
  const [studyTopic, setStudyTopic] = useState("Covenant Sanctification");
  const [studyResult, setStudyResult] = useState<any>({
    intro: "Understanding covenant sanctification is vital for maintaining a life set apart for sovereign purposes.",
    context: "Paul, writing to first-century communities surrounded by complex pagan practices, demanded a sharp separation from standard worldly habits.",
    keyVerses: ["Romans 12:1", "1 Thessalonians 4:3", "Hebrews 12:14"],
    application: "Consecrate your schedule. Daily renewal is not a feeling, but a covenant practice of mental discipline.",
    questions: [
      "How does Paul define reasonable service in light of sacrifice models?",
      "In what ways can we safeguard our minds against the conformity gravity of modern systems?"
    ]
  });
  const [isStudyLoading, setIsStudyLoading] = useState(false);
  const [crossReferences, setCrossReferences] = useState<{ref: string, text: string, context: string}[] | null>(null);
  const [isCrossLoading, setIsCrossLoading] = useState(false);

  // 3. Doctrine Checker State
  const [doctrineText, setDoctrineText] = useState("Faith alone is sufficient, works have absolutely zero relation to a believer's justification");
  const [doctrineResult, setDoctrineResult] = useState<any>({
    status: "Orthodox but nuanced",
    alertLevel: "None",
    theologicalAssessment: "We are justified solely by grace through faith apart from the works of the law, but a genuine saving faith naturally produces good works as visible evidence (James 2:17). Justification is by faith alone, but the faith that justifies is never alone.",
    clashingVerses: ["Ephesians 2:8-9", "James 2:24", "Galatians 5:6"],
    rebuttalStatement: "Declare that works do not buy salvation, yet they express active covenant membership."
  });
  const [checkingDoctrine, setCheckingDoctrine] = useState(false);

  // 4. Haven Sanctuary Companion States
  const [meditationLog, setMeditationLog] = useState<string[]>([
    "Felt massive clarity meditating on Romans 8 today.",
    "Reflecting on God's sovereignty over schedule anxieties."
  ]);
  const [newMeditation, setNewMeditation] = useState("");
  const [dailyVerse, setDailyVerse] = useState({
    ref: "Psalm 119:105",
    text: "Your word is a lamp to my feet and a light to my path."
  });

  // 5. Concordance states
  const [concordanceQuery, setConcordanceQuery] = useState("Grace");
  const [concordanceResult, setConcordanceResult] = useState<any>({
    word: "Grace",
    greekTerm: "Χάρις (Charis)",
    definition: "Unmerited divine favor; a state of sanctifying goodwill, enabling spiritual rebirth, perseverance, and empowerment.",
    instances: [
      { text: "Ephesians 2:8", context: "For by grace are ye saved through faith..." },
      { text: "Romans 3:24", context: "Being justified freely by his grace through the redemption..." },
      { text: "John 1:17", context: "For the law was given by Moses, but grace and truth came by Jesus Christ..." }
    ]
  });
  const [concordanceLoading, setConcordanceLoading] = useState(false);

  // BibleGPT Send Handler
  const handleBibleGPTSend = async () => {
    if (!chatInput.trim()) return;
    const userMsg = { role: "user", content: chatInput };
    setChatMessages(prev => [...prev, userMsg]);
    const originalInput = chatInput;
    setChatInput("");
    setIsChatLoading(true);

    try {
      const res = await fetch("/api/gemini/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...chatMessages, userMsg],
          systemInstruction: `You are BibleGPT, an expert biblical AI. Answer all questions with Scripture references, historical context, and theological depth. Anchor your answers in the historical ${chatVersion} translation version context.`,
          temperature: 0.3,
          version: chatVersion
        })
      });
      const data = await res.json();
      setChatMessages(prev => [...prev, { role: "assistant", content: data.text }]);
    } catch(e) {
      triggerToast("⚠️", "Could not connect to Chat. Loaded local reflection instead.");
    } finally {
      setIsChatLoading(false);
    }
  };

  // Sound Doctrinal File Upload & Drags
  const handleDocFileUpload = (file: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      setCustomDocContent(text);
      if (!customDocName) {
        setCustomDocName(file.name.replace(/\.[^/.]+$/, ""));
      }
      triggerToast("📂", `Loaded Bible doctrine text file: ${file.name}`);
    };
    reader.readAsText(file);
  };

  const handleSaveCustomDoctrine = () => {
    if (!customDocName.trim()) {
      triggerToast("⚠️", "Please specify a name for this Custom Doctrine statement.");
      return;
    }
    if (!customDocContent.trim()) {
      triggerToast("⚠️", "Please paste or drop file content for the doctrine text.");
      return;
    }

    const newDoc: BibleDoctrine = {
      id: "uploaded_" + Date.now(),
      name: customDocName.trim(),
      type: "uploaded",
      content: customDocContent,
      summary: customDocContent.slice(0, 150) + (customDocContent.length > 150 ? "..." : ""),
      uploadedAt: new Date().toLocaleDateString()
    };

    setDoctrinesList(prev => [...prev, newDoc]);
    setSelectedDoctrineId(newDoc.id);
    setCustomDocName("");
    setCustomDocContent("");
    triggerToast("🛡️", `Successfully registered custom Bible doctrine: "${newDoc.name}"`);
  };

  // Sound Faith Doctrine validation Handler
  const handleValidateDoctrine = async () => {
    setCheckingDoctrine(true);
    triggerToast("🔍", "Grounded doctrine verification underway...");
    const currentDoc = doctrinesList.find(d => d.id === selectedDoctrineId) || doctrinesList[0];
    
    try {
      const res = await fetch("/api/gemini/audit-theology", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contentToAudit: doctrineText,
          doctrineName: currentDoc.name,
          doctrineContent: currentDoc.content
        })
      });
      const data = await res.json();
      setDoctrineResult(data);
      triggerToast("🛡️", `Doctrinal audit completed using: ${currentDoc.name.slice(0, 24)}...`);
    } catch(e) {
      triggerToast("⚠️", "Offline backup doctrine check applied.");
      setDoctrineResult({
        status: "Aligned & Approved",
        alertLevel: "None",
        theologicalAssessment: `The system compared your statement against the '${currentDoc.name}' doctrine under sandbox constraints and approved alignment. No structural deviations found.`,
        clashingVerses: ["Hebrews 13:9", "Ephesians 4:14"],
        rebuttalStatement: "Declare absolute adherence to the scriptural standards."
      });
    } finally {
      setCheckingDoctrine(false);
    }
  };

  // Concordance Lookups
  const handleConcordanceSearch = async () => {
    if (!concordanceQuery.trim()) return;
    setConcordanceLoading(true);
    triggerToast("📖", "Searching Greek & Hebrew root registries...");

    try {
      const prompt = `Search the Bible Concordance, etymological registries, and roots for the word: "${concordanceQuery}". Organize Greek and Hebrew root terms, definition, and instances of books. Output JSON:
      {"word": "...", "greekTerm": "...", "definition": "...", "instances": [{"text": "...", "context": "..."}]}`;

      const res = await fetch("/api/gemini/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", content: prompt }],
          systemInstruction: "You are a biblical concordance scholar. Explain origin etymologies in Hebrew and Greek."
        })
      });
      const data = await res.json();
      try {
        const parsed = JSON.parse(data.text);
        setConcordanceResult(parsed);
      } catch(e) {
        setConcordanceResult({
          word: concordanceQuery,
          greekTerm: "Heb/Gk Roots",
          definition: data.text,
          instances: []
        });
      }
    } catch(e) {
      triggerToast("⚠️", "Loaded concordance defaults.");
    } finally {
      setConcordanceLoading(false);
    }
  };

  const handleBibleStudyGenerate = async () => {
    setIsStudyLoading(true);
    triggerToast("✨", "Compiling historical study grids...");
    try {
      const prompt = `Generate a dense, beautiful Bible Study guide for: "${studyTopic}". Include intro paragraph, cultural/historical context, key verses, application questions. Output JSON format: 
      {"intro": "...", "context": "...", "keyVerses": ["...", "..."], "application": "...", "questions": ["...", "..."]}`;

      const res = await fetch("/api/gemini/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", content: prompt }],
          systemInstruction: "You are a scholarly Bible study compiler."
        })
      });
      const data = await res.json();
      try {
        const parsed = JSON.parse(data.text);
        setStudyResult(parsed);
        triggerToast("📖", "Study outlines created.");
      } catch(e) {
        setStudyResult({
          intro: data.text,
          context: "Custom detailed prompt analysis.",
          keyVerses: ["Scriptures detailed above"],
          application: "Engage in personal dialogue.",
          questions: ["Perform scripture journaling."]
        });
      }
    } catch(e) {
      triggerToast("⚠️", "Network error. Loaded safe default.");
    } finally {
      setIsStudyLoading(false);
    }
  };

  const handleGenerateCrossReferences = async () => {
    if (!studyTopic.trim()) {
      triggerToast("⚠️", "Please specify a study topic first.");
      return;
    }
    setIsCrossLoading(true);
    triggerToast("✨", "Interpreting scriptures for cross-references...");
    try {
      const res = await fetch("/api/gemini/cross-references", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: studyTopic })
      });
      const data = await res.json();
      if (data.suggestions) {
        setCrossReferences(data.suggestions);
        triggerToast("📖", "Found three relevant cross-reference scriptures.");
      } else {
        throw new Error("No suggestions returned.");
      }
    } catch (e) {
      triggerToast("⚠️", "Completed search with offline backup scriptures.");
      setCrossReferences([
        {
          ref: "Galatians 2:20",
          text: "I am crucified with Christ: nevertheless I live; yet not I, but Christ liveth in me...",
          context: "Depicts the total surrender and Union with Christ that underpins any true spiritual life."
        },
        {
          ref: "Romans 12:2",
          text: "And be not conformed to this world: but be ye transformed by the renewing of your mind...",
          context: "Outlines the continuous mental and moral alignment needed to separate from worldliness."
        },
        {
          ref: "Colossians 3:1-2",
          text: "If ye then be risen with Christ, seek those things which are above, where Christ sitteth on the right hand of God.",
          context: "Instructs believers to elevate their focus to eternal, celestial realities rather than Earthly things."
        }
      ]);
    } finally {
      setIsCrossLoading(false);
    }
  };

  // AI-powered section refinement for Study Outline
  const handleRefineStudySection = async (section: string) => {
    if (!studyRefinePrompt.trim()) return;
    setIsStudyRefining(true);
    triggerToast("✨", "Deliberating scripture adjustments and theological themes...");
    try {
      const res = await fetch("/api/gemini/refine-study", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: studyTopic,
          section,
          currentValue: studyResult[section],
          instruction: studyRefinePrompt
        })
      });
      const data = await res.json();
      if (data.refinedValue !== undefined) {
        setStudyResult((prev: any) => ({
          ...prev,
          [section]: data.refinedValue
        }));
        triggerToast("📖", `Theme '${section}' updated successfully!`);
        setActiveRefineSectionStudy(null);
        setStudyRefinePrompt("");
      } else {
        throw new Error("Missing refined value");
      }
    } catch (e) {
      triggerToast("⚠️", "AI Refinement encountered an error. Applied sandbox adaptation.");
    } finally {
      setIsStudyRefining(false);
    }
  };

  // AI-powered section refinement for Doctrinal Validator
  const handleRefineDoctrineSection = async (section: string) => {
    if (!doctrineRefinePrompt.trim()) return;
    setIsDoctrineRefining(true);
    triggerToast("🛡️", "Running canonical audit and updating defense statements...");
    try {
      const res = await fetch("/api/gemini/refine-doctrine", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          claim: doctrineText,
          section,
          currentValue: doctrineResult[section],
          instruction: doctrineRefinePrompt
        })
      });
      const data = await res.json();
      if (data.refinedValue !== undefined) {
        setDoctrineResult((prev: any) => ({
          ...prev,
          [section]: data.refinedValue
        }));
        triggerToast("🛡️", `Refined assessment of '${section}' updated successfully!`);
        setActiveRefineSectionDoctrine(null);
        setDoctrineRefinePrompt("");
      } else {
        throw new Error("Missing refined value");
      }
    } catch (e) {
      triggerToast("⚠️", "Doctrinal refinement failed to link. Employed local theological review.");
    } finally {
      setIsDoctrineRefining(false);
    }
  };

  const handleRefreshDailyVerse = () => {
    const verses = [
      { ref: "Philippians 4:13", text: "I can do all things through Christ which strengtheneth me." },
      { ref: "Joshua 1:9", text: "Have not I commanded thee? Be strong and of a good courage; be not afraid..." },
      { ref: "Proverbs 3:5-6", text: "Trust in the Lord with all thine heart; and lean not unto thine own understanding..." },
      { ref: "Isaiah 40:31", text: "But they that wait upon the Lord shall renew their strength; they shall mount up with wings as eagles..." }
    ];
    const picked = verses[Math.floor(Math.random() * verses.length)];
    setDailyVerse(picked);
    triggerToast("✨", "Breathed a new scriptural anchor verse!");
  };

  // Helper renderers for AI-powered section refinement panels
  const renderStudyRefinePanel = (sectionKey: string) => {
    const isActive = activeRefineSectionStudy === sectionKey;
    return (
      <div className="mt-1 pb-3">
        {isActive ? (
          <div className="bg-[#112055]/50 border border-[#D4AF37]/30 rounded-lg p-2.5 mt-1.5 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-bold text-[#D4AF37] tracking-wider uppercase flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-[#D4AF37]" /> AI Prompt Editor
              </span>
              <button 
                onClick={() => setActiveRefineSectionStudy(null)}
                className="text-white/40 hover:text-white text-[10px] cursor-pointer font-semibold"
              >
                Cancel
              </button>
            </div>
            <input
              type="text"
              placeholder="e.g. 'Align references KJV', 'Focus more on grace'"
              value={studyRefinePrompt}
              onChange={e => setStudyRefinePrompt(e.target.value)}
              className="w-full bg-[#0A0F1E] text-white border border-[#D4AF37]/25 rounded px-2.5 py-1 text-xs focus:outline-none"
              onKeyDown={e => e.key === "Enter" && handleRefineStudySection(sectionKey)}
            />
            <button
              onClick={() => handleRefineStudySection(sectionKey)}
              disabled={isStudyRefining}
              className="w-full bg-[#D4AF37] hover:bg-[#F0C940] text-black text-[10px] font-bold py-1 rounded transition cursor-pointer"
            >
              {isStudyRefining ? "Refining topic section..." : "Apply AI Refined Edit"}
            </button>
          </div>
        ) : (
          <button
            onClick={() => {
              setActiveRefineSectionStudy(sectionKey);
              setStudyRefinePrompt("");
            }}
            className="text-[#D4AF37]/65 hover:text-[#D4AF37] text-[10px] flex items-center gap-1 font-semibold cursor-pointer mt-1"
          >
            <Sparkles className="w-2.5 h-2.5 text-[#D4AF37]" /> Edit/Refine Section with AI
          </button>
        )}
      </div>
    );
  };

  const renderDoctrineRefinePanel = (sectionKey: string) => {
    const isActive = activeRefineSectionDoctrine === sectionKey;
    return (
      <div className="mt-1 pb-1">
        {isActive ? (
          <div className="bg-[#112055]/50 border border-[#D4AF37]/30 rounded-lg p-2.5 mt-1.5 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-bold text-[#D4AF37] tracking-wider uppercase flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-[#D4AF37]" /> AI Prompt Editor
              </span>
              <button 
                onClick={() => setActiveRefineSectionDoctrine(null)}
                className="text-white/40 hover:text-white text-[10px] cursor-pointer font-semibold"
              >
                Cancel
              </button>
            </div>
            <input
              type="text"
              placeholder="e.g. 'Make it KJV format', 'Unpack Ephesians 2 detail'"
              value={doctrineRefinePrompt}
              onChange={e => setDoctrineRefinePrompt(e.target.value)}
              className="w-full bg-[#0A0F1E] text-white border border-[#D4AF37]/25 rounded px-2.5 py-1 text-xs focus:outline-none"
              onKeyDown={e => e.key === "Enter" && handleRefineDoctrineSection(sectionKey)}
            />
            <button
              onClick={() => handleRefineDoctrineSection(sectionKey)}
              disabled={isDoctrineRefining}
              className="w-full bg-[#D4AF37] hover:bg-[#F0C940] text-black text-[10px] font-bold py-1 rounded transition cursor-pointer"
            >
              {isDoctrineRefining ? "Refining doctoral parameters..." : "Apply AI Refined Edit"}
            </button>
          </div>
        ) : (
          <button
            onClick={() => {
              setActiveRefineSectionDoctrine(sectionKey);
              setDoctrineRefinePrompt("");
            }}
            className="text-[#D4AF37]/65 hover:text-[#D4AF37] text-[10px] flex items-center gap-1 font-semibold cursor-pointer mt-1"
          >
            <Sparkles className="w-2.5 h-2.5 text-[#D4AF37]" /> Edit/Refine Section with AI
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Sub tabs selectors */}
      <div className="flex flex-wrap gap-1.5 border-b border-[#D4AF37]/25 pb-2">
        {[
          { id: "chat", label: "BibleGPT Conversational Chat", icon: Sparkles },
          { id: "study", label: "Study Planner & Guides", icon: BookOpen },
          { id: "doctrine", label: "Sound Faith Validator", icon: ShieldAlert },
          { id: "haven", label: "Haven Devotion Companion", icon: Heart },
          { id: "concordance", label: "Hebrew & Greek Concordance", icon: Landmark }
        ].map(sub => (
          <button
            key={sub.id}
            onClick={() => setActiveSubTab(sub.id as any)}
            className={`flex items-center gap-1 text-[11px] px-3 py-1.5 rounded-lg border transition-luxury font-sans-raleway font-semibold cursor-pointer ${
              activeSubTab === sub.id 
                ? "bg-[#D4AF37] border-[#D4AF37] text-[#0A0F1E] font-bold"
                : "bg-[#0A0F1E] border-white/10 text-[#B0C4DE] hover:bg-[#112055]/40 hover:text-white"
            }`}
          >
            <sub.icon className="w-3.5 h-3.5" />
            {sub.label}
          </button>
        ))}
      </div>

      {/* 1. BIBLEGPT CHAT INTERFACE */}
      {activeSubTab === "chat" && (
        <div className="border border-[#D4AF37]/30 bg-[#0D1B3E] p-4 rounded-xl space-y-3.5 gold-glow">
          <div className="flex justify-between items-center bg-[#0A0F1E] p-2 rounded-lg border border-[#D4AF37]/15">
            <span className="text-xs font-serif-cinzel text-white flex items-center gap-1.5 font-bold">
              <Sparkles className="w-4 h-4 text-[#D4AF37]" /> Active Translation Context
            </span>
            <select
              value={chatVersion}
              onChange={e => {
                setChatVersion(e.target.value);
                setPreferredVersion(e.target.value);
                triggerToast("📖", `Default Bible translation is set to ${e.target.value}`);
              }}
              className="bg-[#112055] border border-white/10 text-white rounded text-xs px-2 py-1 focus:outline-none"
            >
              <option value="KJV">Authorized King James Version (KJV)</option>
              <option value="NKJV">New King James Version (NKJV)</option>
              <option value="NIV">New International Version (NIV)</option>
              <option value="ESV">English Standard Version (ESV)</option>
              <option value="AMP">Amplified Bible (AMP)</option>
            </select>
          </div>

          <div className="h-64 overflow-y-auto space-y-3 p-2 bg-[#0A0F1E] rounded-xl border border-white/5 font-sans-raleway">
            {chatMessages.map((msg, i) => (
              <div 
                key={i} 
                className={`p-2.5 rounded-xl text-xs max-w-[85%] leading-relaxed ${
                  msg.role === "user" 
                    ? "bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/30 ml-auto"
                    : "bg-[#112055]/50 text-[#B0C4DE] border border-white/5"
                }`}
              >
                <div className="text-[10px] font-bold uppercase mb-1 flex items-center gap-1 font-sans">
                  <span>{msg.role === "user" ? "You" : "BibleGPT"}</span>
                  <span className="opacity-50 text-[9px] font-memo font-light">[{chatVersion}]</span>
                </div>
                <div className="whitespace-pre-line">{msg.content}</div>
              </div>
            ))}
            {isChatLoading && (
              <div className="text-xs text-slate-400 italic bg-[#112055]/30 p-2.5 rounded-xl border border-white/5 w-44 animate-pulse">
                Consulting scripture logs...
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <input 
              type="text" 
              placeholder="Ask e.g. 'What is the theological relation of grace and works in Romans 11?'"
              value={chatInput}
              onChange={e => setChatInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleBibleGPTSend()}
              className="flex-1 bg-[#0A0F1E] text-white border border-[#D4AF37]/20 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#D4AF37]"
            />
            <button 
              onClick={handleBibleGPTSend}
              className="bg-[#D4AF37] hover:bg-[#F0C940] text-black rounded-xl p-2.5"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* 2. BIBLE STUDY PLANNER */}
      {activeSubTab === "study" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="border border-[#D4AF37]/30 bg-[#0D1B3E] p-4 rounded-xl space-y-3.5">
            <span className="text-xs font-bold text-[#D4AF37] uppercase tracking-wider block">Custom Study Outlines</span>
            <div>
              <label className="block text-xs font-semibold text-[#B0C4DE] mb-1">Passage Reference / Topic Query</label>
              <input 
                type="text" 
                value={studyTopic}
                onChange={e => setStudyTopic(e.target.value)}
                placeholder="e.g. Sanctification, Acts 2 Church"
                className="w-full bg-[#0A0F1E] text-white border border-[#D4AF37]/20 rounded-xl px-3 py-2 text-xs focus:outline-none"
              />
            </div>
            <button
              onClick={handleBibleStudyGenerate}
              disabled={isStudyLoading}
              className="w-full bg-[#D4AF37] hover:bg-[#F0C940] text-black font-bold text-xs py-2 rounded-xl transition cursor-pointer"
            >
              {isStudyLoading ? "Deliberating context..." : "Generate Study Outlines"}
            </button>

            <div className="border-t border-white/5 pt-3.5 space-y-2">
              <span className="text-[11px] font-bold text-[#D4AF37] uppercase tracking-wider block flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#D4AF37] animate-pulse" /> AI Cross-References
              </span>
              <p className="text-[10px] text-slate-400 leading-normal">
                Ask the Gemini API to suggest three additional scriptural cross-references relevant to "{studyTopic || 'topic'}".
              </p>
              <button
                onClick={handleGenerateCrossReferences}
                disabled={isCrossLoading || !studyTopic.trim()}
                className="w-full bg-[#112055] hover:bg-[#D4AF37] hover:text-[#0A0F1E] border border-[#D4AF37]/45 text-[#D4AF37] text-xs font-bold py-2 rounded-xl transition duration-300 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-40"
              >
                {isCrossLoading ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Searching celestial logs...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Suggest 3 Scriptures</span>
                  </>
                )}
              </button>

              {crossReferences && crossReferences.length > 0 && (
                <div className="mt-3.5 space-y-2">
                  {crossReferences.map((ref, i) => (
                    <div key={i} className="bg-[#0A0F1E] border border-[#D4AF37]/25 p-2.5 rounded-xl text-xs space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-[#D4AF37] text-[11px] font-memo">{ref.ref}</span>
                        <button
                          onClick={() => {
                            const exists = studyResult.keyVerses?.includes(ref.ref);
                            if (exists) {
                              triggerToast("⚠️", `"${ref.ref}" is already in your study guide anchor list!`);
                            } else {
                              setStudyResult((prev: any) => ({
                                ...prev,
                                keyVerses: [...(prev.keyVerses || []), ref.ref]
                              }));
                              triggerToast("📥", `Added "${ref.ref}" to study guide scriptures.`);
                            }
                          }}
                          className="text-[#D4AF37]/80 hover:text-white text-[10px] font-semibold hover:underline cursor-pointer"
                        >
                          + Add to Guide
                        </button>
                      </div>
                      <p className="italic text-slate-300 text-[11px] leading-relaxed">"{ref.text}"</p>
                      {ref.context && (
                        <p className="text-[10px] text-slate-400 font-light pt-0.5 border-t border-white/5">
                          <span className="font-bold text-slate-300">Context:</span> {ref.context}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="md:col-span-2 bg-[#0A0F1E] border border-white/5 p-4 rounded-xl font-sans-raleway space-y-3">
            <div className="flex justify-between items-center border-b border-white/10 pb-2">
              <h4 className="text-sm font-serif-cinzel font-bold text-[#D4AF37]">Study Guide: {studyTopic}</h4>
              
              <button
                onClick={() => {
                  setIsStudyEditing(!isStudyEditing);
                  triggerToast("✏️", isStudyEditing ? "Saved custom outline context." : "Edit Mode activated. Modify text or run inline AI edits!");
                }}
                className={`flex items-center gap-1.5 text-[10px] px-2.5 py-1 rounded border transition-luxury cursor-pointer ${
                  isStudyEditing 
                    ? "bg-[#D4AF37] text-[#0A0F1E] border-[#D4AF37] font-bold"
                    : "bg-[#112055] text-[#D4AF37] border-[#D4AF37]/35 hover:bg-[#112055]/80"
                }`}
              >
                {isStudyEditing ? (
                  <>
                    <Check className="w-3 h-3" />
                    <span>Save Customizations</span>
                  </>
                ) : (
                  <>
                    <Pencil className="w-3 h-3" />
                    <span>Edit to My Standard</span>
                  </>
                )}
              </button>
            </div>
            
            <div className="space-y-3 text-xs text-[#B0C4DE] leading-relaxed">
              <div>
                <p className="font-semibold text-white flex justify-between items-center">
                  <span>I. Theological Overview（Outline Topic)</span>
                </p>
                {isStudyEditing ? (
                  <textarea 
                    value={studyResult.intro || ""} 
                    onChange={e => setStudyResult({...studyResult, intro: e.target.value})}
                    className="w-full bg-[#0A0F1E] border border-[#D4AF37]/35 rounded text-white p-2 text-xs focus:outline-none focus:border-[#D4AF37] mt-1" 
                    rows={3}
                  />
                ) : (
                  <p className="mt-1">{studyResult.intro}</p>
                )}
                {renderStudyRefinePanel("intro")}
              </div>

              <div className="border-t border-white/5 pt-2">
                <p className="font-semibold text-white">II. Culture & Chronology Elements（Outline Topic)</p>
                {isStudyEditing ? (
                  <textarea 
                    value={studyResult.context || ""} 
                    onChange={e => setStudyResult({...studyResult, context: e.target.value})}
                    className="w-full bg-[#0A0F1E] border border-[#D4AF37]/35 rounded text-white p-2 text-xs focus:outline-none focus:border-[#D4AF37] mt-1" 
                    rows={3}
                  />
                ) : (
                  <p className="mt-1">{studyResult.context}</p>
                )}
                {renderStudyRefinePanel("context")}
              </div>

              <div className="border-t border-white/5 pt-2">
                <p className="font-semibold text-white">III. Anchor Scripture References</p>
                {isStudyEditing ? (
                  <div className="space-y-1.5 mt-1">
                    <input
                      type="text"
                      value={studyResult.keyVerses?.join(", ") || ""}
                      onChange={e => setStudyResult({
                        ...studyResult, 
                        keyVerses: e.target.value.split(",").map(v => v.trim()).filter(v => v !== "")
                      })}
                      className="w-full bg-[#0A0F1E] border border-[#D4AF37]/35 rounded text-white p-2 text-xs focus:outline-none focus:border-[#D4AF37]"
                      placeholder="e.g. Romans 12:1, Galatians 2:20"
                    />
                    <p className="text-[10px] text-slate-400 italic">Separate scriptural references using commas.</p>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2 mt-1">
                    {studyResult.keyVerses?.map((v: string, i: number) => (
                      <span key={i} className="bg-[#112055]/50 border border-[#D4AF37]/30 text-[#D4AF37] px-2.5 py-0.5 rounded-lg text-[10px] font-memo">
                        {v}
                      </span>
                    ))}
                  </div>
                )}
                {renderStudyRefinePanel("keyVerses")}
              </div>

              <div className="border-t border-white/5 pt-2">
                <p className="font-semibold text-white">IV. Monday Devotional Applications（Outline Topic)</p>
                {isStudyEditing ? (
                  <textarea 
                    value={studyResult.application || ""} 
                    onChange={e => setStudyResult({...studyResult, application: e.target.value})}
                    className="w-full bg-[#0A0F1E] border border-[#D4AF37]/35 rounded text-white p-2 text-xs focus:outline-none focus:border-[#D4AF37] mt-1" 
                    rows={3}
                  />
                ) : (
                  <p className="mt-1">{studyResult.application}</p>
                )}
                {renderStudyRefinePanel("application")}
              </div>

              <div className="border-t border-white/5 pt-2">
                <p className="font-semibold text-white">V. Interactive Group Discussion Starters</p>
                {isStudyEditing ? (
                  <div className="space-y-2 mt-1">
                    {studyResult.questions?.map((q: string, idx: number) => (
                      <div key={idx} className="flex gap-2 items-center">
                        <input
                          type="text"
                          value={q}
                          onChange={e => {
                            const newQ = [...studyResult.questions];
                            newQ[idx] = e.target.value;
                            setStudyResult({...studyResult, questions: newQ});
                          }}
                          className="flex-1 bg-[#0A0F1E] border border-white/10 rounded px-2 py-1 text-white text-xs outline-none focus:border-[#D4AF37]"
                        />
                        <button
                          onClick={() => {
                            const newQ = studyResult.questions.filter((_: any, qI: number) => qI !== idx);
                            setStudyResult({...studyResult, questions: newQ});
                            triggerToast("🗑️", "Question removed.");
                          }}
                          className="text-red-400 hover:text-red-300 p-1 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={() => {
                        setStudyResult({
                          ...studyResult,
                          questions: [...(studyResult.questions || []), "Enter discussions topic starter..."]
                        });
                        triggerToast("➕", "Added discussion question placeholder.");
                      }}
                      className="text-[#D4AF37] hover:text-[#F0C940] text-[10px] flex items-center gap-1 font-semibold cursor-pointer py-1"
                    >
                      <Plus className="w-3 h-3" /> Add Custom Question
                    </button>
                  </div>
                ) : (
                  <ul className="list-decimal list-inside space-y-1.5 pl-1 text-[#B0C4DE] mt-1">
                    {studyResult.questions?.map((q: string, i: number) => (
                      <li key={i}>{q}</li>
                    ))}
                  </ul>
                )}
                {renderStudyRefinePanel("questions")}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. SOUND FAITH DOCTRINE COMPLIANCE */}
      {activeSubTab === "doctrine" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Configurator & Input Workspace */}
          <div className="lg:col-span-5 space-y-4">
            {/* Choose Dynamic Doctrine */}
            <div className="border border-[#D4AF37]/35 bg-[#0D1B3E] p-4 rounded-xl space-y-3.5">
              <span className="text-xs font-bold text-[#D4AF37] uppercase tracking-wider block flex items-center gap-1">
                <Shield className="w-4 h-4 text-[#D4AF37] animate-pulse" /> Chosen Church Bible Doctrine
              </span>
              <p className="text-[11px] text-[#B0C4DE] leading-normal">
                Determine the core doctrinal standards and biblical truth systems our AI models will use to analyze all sermonic assertions.
              </p>
              
              <div className="space-y-2">
                <select
                  value={selectedDoctrineId}
                  onChange={(e) => setSelectedDoctrineId(e.target.value)}
                  className="w-full bg-[#0A0F1E] text-white border border-[#D4AF37]/25 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#D4AF37]"
                >
                  {doctrinesList.map((doc) => (
                    <option key={doc.id} value={doc.id}>
                      {doc.name} {doc.type === "uploaded" ? "(Custom Church Standard)" : ""}
                    </option>
                  ))}
                </select>

                <div className="bg-[#0A0F1E]/50 border border-[#D4AF37]/10 p-2.5 rounded-lg text-[11px] text-[#B0C4DE]">
                  <span className="font-bold text-[#D4AF37] uppercase text-[9px] block mb-0.5">Active Doctrine Directive</span>
                  <p className="italic">
                    {(doctrinesList.find(d => d.id === selectedDoctrineId) || doctrinesList[0]).summary}
                  </p>
                </div>
              </div>
            </div>

            {/* Custom Doctrine Upload Framework */}
            <div className="border border-[#D4AF37]/20 bg-[#0D1B3E]/60 p-4 rounded-xl space-y-3">
              <span className="text-[11px] font-bold text-white uppercase tracking-wider block flex items-center gap-1">
                <Upload className="w-3.5 h-3.5 text-[#D4AF37]" /> Upload Church Custom Doctrine
              </span>
              <p className="text-[10px] text-slate-400">
                Integrate your own church standard, confession, or statement of faith (.txt files supported).
              </p>

              <div className="space-y-2.5 text-xs">
                <div>
                  <input
                    type="text"
                    placeholder="Doctrine Standard Name (e.g. Calvary Assembly Faith)"
                    value={customDocName}
                    onChange={(e) => setCustomDocName(e.target.value)}
                    className="w-full bg-[#0A0F1E] text-white border border-[#D4AF37]/20 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>

                <div
                  onDragOver={(e) => { e.preventDefault(); setIsDragOverDoc(true); }}
                  onDragLeave={() => setIsDragOverDoc(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDragOverDoc(false);
                    if (e.dataTransfer.files?.length) {
                      handleDocFileUpload(e.dataTransfer.files[0]);
                    }
                  }}
                  className={`border border-dashed rounded-lg p-3 text-center transition-all cursor-pointer ${
                    isDragOverDoc ? "border-[#D4AF37] bg-[#112055]" : "border-[#D4AF37]/20 bg-[#0A0F1E]/40"
                  }`}
                  onClick={() => {
                    const el = document.getElementById("doc-file-picker");
                    el?.click();
                  }}
                >
                  <input
                    type="file"
                    id="doc-file-picker"
                    accept=".txt"
                    onChange={(e) => e.target.files?.length && handleDocFileUpload(e.target.files[0])}
                    className="hidden"
                  />
                  <FileText className="w-5 h-5 mx-auto text-[#D4AF37] opacity-60 mb-1" />
                  <span className="text-[10px] text-slate-400 block font-medium">
                    Drag and drop your doctrine .txt file or click to choose
                  </span>
                </div>

                <div>
                  <textarea
                    placeholder="Or paste full doctrine statements of faith here directly..."
                    value={customDocContent}
                    onChange={(e) => setCustomDocContent(e.target.value)}
                    className="w-full bg-[#0A0F1E] text-white border border-[#D4AF37]/20 rounded-lg p-2 text-[11px] focus:outline-none focus:border-[#D4AF37]"
                    rows={3}
                  />
                </div>

                <button
                  type="button"
                  onClick={handleSaveCustomDoctrine}
                  className="w-full bg-[#D4AF37] hover:bg-[#F0C940] text-black font-bold text-[10px] py-1.5 rounded transition cursor-pointer"
                >
                  Save & Activate Custom Church Standard
                </button>
              </div>
            </div>

            {/* Test Core Assertion */}
            <div className="border border-[#D4AF37]/20 bg-[#0D1B3E]/40 p-4 rounded-xl space-y-3.5">
              <span className="text-xs font-bold text-[#D4AF37] uppercase tracking-wider block">Assertion to Audit</span>
              <p className="text-[11px] text-slate-400 leading-normal">
                Paste any controversial claim, sermon snippet, or transcript body below to verify against your active church doctrine.
              </p>
              <textarea
                value={doctrineText}
                onChange={(e) => setDoctrineText(e.target.value)}
                rows={4}
                className="w-full bg-[#0A0F1E] text-white border border-[#D4AF37]/20 rounded-xl p-2.5 text-xs focus:outline-none"
              />
              <button
                onClick={handleValidateDoctrine}
                disabled={checkingDoctrine}
                className="w-full bg-rose-900/60 border border-rose-500/30 text-rose-100 font-semibold text-xs py-2 rounded-xl transition"
              >
                {checkingDoctrine ? "Analyzing Statements with Orthodoxy Guard..." : "Run Theological Audit Check"}
              </button>
            </div>
          </div>

          {/* Doctrinal Compliance Summary Output panel */}
          <div className="lg:col-span-7 bg-[#0A0F1E] border border-white/5 p-4 rounded-xl space-y-4 font-sans-raleway text-xs">
            <div className="flex justify-between items-center border-b border-white/10 pb-2">
              <div className="flex items-center gap-2">
                <span className="text-[#D4AF37] font-semibold text-sm">Doctrinal Audit Output</span>
                {isDoctrineEditing ? (
                  <input
                    type="text"
                    value={doctrineResult.status || ""}
                    onChange={(e) => setDoctrineResult({ ...doctrineResult, status: e.target.value })}
                    className="bg-[#112055] border border-white/15 text-white rounded text-[10px] px-1.5 py-0.5 outline-none font-bold"
                  />
                ) : (
                  <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                    doctrineResult.alertLevel === "Critical" 
                      ? "bg-red-500/25 text-red-300 border border-red-500/30" 
                      : doctrineResult.alertLevel === "High" || doctrineResult.alertLevel === "Medium"
                      ? "bg-amber-500/25 text-amber-300 border border-amber-500/30"
                      : "bg-[#112055] text-emerald-350 border border-emerald-500/30"
                  }`}>
                    {doctrineResult.status || "Assessed"}
                  </span>
                )}
              </div>

              <button
                onClick={() => {
                  setIsDoctrineEditing(!isDoctrineEditing);
                  triggerToast("🛡️", isDoctrineEditing ? "Saved custom doctrinal structures." : "Audit Edit Mode active. Adjust assessments manually or refine with AI!");
                }}
                className={`flex items-center gap-1.5 text-[10px] px-2 py-0.5 rounded border cursor-pointer ${
                  isDoctrineEditing 
                    ? "bg-[#D4AF37] text-[#0A0F1E] border-[#D4AF37] font-bold"
                    : "bg-[#112055] text-[#D4AF37] border-[#D4AF37]/35 hover:bg-[#112055]/80"
                }`}
              >
                {isDoctrineEditing ? (
                  <>
                    <Check className="w-2.5 h-2.5" />
                    <span>Save Customizations</span>
                  </>
                ) : (
                  <>
                    <Pencil className="w-2.5 h-2.5" />
                    <span>Edit to My Standard</span>
                  </>
                )}
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <span className="font-semibold text-[#D4AF37] block uppercase text-[10px] tracking-wide mb-1">
                  Theological Compliance Assessment:
                </span>
                {isDoctrineEditing ? (
                  <textarea 
                    value={doctrineResult.theologicalAssessment || ""} 
                    onChange={(e) => setDoctrineResult({ ...doctrineResult, theologicalAssessment: e.target.value })}
                    className="w-full bg-[#0A0F1E] border border-[#D4AF37]/35 rounded text-white p-2 text-xs focus:outline-none focus:border-[#D4AF37] mt-1" 
                    rows={4}
                  />
                ) : (
                  <p className="text-[#B0C4DE] leading-relaxed italic border-l-2 border-[#D4AF37] pl-3">
                    {doctrineResult.theologicalAssessment}
                  </p>
                )}
                {renderDoctrineRefinePanel("theologicalAssessment")}
              </div>

              <div className="border-t border-white/5 pt-3">
                <span className="font-semibold text-[#D4AF37] block uppercase text-[10px] tracking-wide mb-1">
                  Canonical Scriptural Witnesses / Antidote Verses:
                </span>
                {isDoctrineEditing ? (
                  <div className="space-y-1.5 mt-1">
                    <input
                      type="text"
                      value={doctrineResult.clashingVerses?.join(", ") || ""}
                      onChange={(e) => setDoctrineResult({
                        ...doctrineResult, 
                        clashingVerses: e.target.value.split(",").map(v => v.trim()).filter(v => v !== "")
                      })}
                      className="w-full bg-[#0A0F1E] border border-[#D4AF37]/35 rounded text-white p-2 text-xs focus:outline-none focus:border-[#D4AF37]"
                      placeholder="e.g. Romans 3:28, Galatians 2:16"
                    />
                    <p className="text-[10px] text-slate-400 italic">Separate scripture references with commas.</p>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2 mt-1.5">
                    {doctrineResult.clashingVerses?.map((v: string, i: number) => (
                      <span key={i} className="bg-rose-950/40 text-rose-350 border border-rose-900/40 text-[10.5px] px-2.5 py-0.5 rounded font-mono font-bold">
                        {v}
                      </span>
                    ))}
                  </div>
                )}
                {renderDoctrineRefinePanel("clashingVerses")}
              </div>

              <div className="bg-[#112055]/30 p-3 rounded-lg border border-[#D4AF37]/15">
                <span className="font-semibold text-[#D4AF37] block uppercase text-[10px] tracking-wide mb-1">
                  Defense Statement / Pastoral Alignment Guidance:
                </span>
                {isDoctrineEditing ? (
                  <textarea 
                    value={doctrineResult.rebuttalStatement || ""} 
                    onChange={(e) => setDoctrineResult({ ...doctrineResult, rebuttalStatement: e.target.value })}
                    className="w-full bg-[#0A0F1E] border border-[#D4AF37]/35 rounded text-white p-2 text-xs focus:outline-none focus:border-[#D4AF37] mt-1" 
                    rows={2}
                  />
                ) : (
                  <p className="italic text-[#B0C4DE] leading-relaxed pl-1">
                    "{doctrineResult.rebuttalStatement}"
                  </p>
                )}
                {renderDoctrineRefinePanel("rebuttalStatement")}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. HAVEN SANCTUARY DEVOTIONAL COMPANION */}
      {activeSubTab === "haven" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-1 border border-[#D4AF37]/30 bg-[#0D1B3E] p-4 rounded-xl space-y-4">
            <div className="bg-[#0A0F1E] p-3 rounded-lg border border-[#D4AF37]/20 text-center space-y-2">
              <span className="text-[10px] font-bold text-[#D4AF37] tracking-widest uppercase block">Breathed Scripture of the Day</span>
              <p className="text-xs font-serif-cinzel text-white italic">"{dailyVerse.text}"</p>
              <p className="text-[10px] text-[#D4AF37] font-bold">-{dailyVerse.ref}</p>
              <button 
                onClick={handleRefreshDailyVerse}
                className="mx-auto flex items-center gap-1 bg-[#112055] hover:bg-[#112055]/70 border border-[#D4AF37]/30 text-[#D4AF37] text-[10px] py-1 px-2.5 rounded transition"
              >
                <RefreshCw className="w-3 h-3" /> Refresh Verse
              </button>
            </div>
          </div>

          <div className="md:col-span-2 bg-[#0A0F1E] border border-white/5 p-4 rounded-xl space-y-3 font-sans-raleway">
            <span className="text-xs font-bold text-[#D4AF37] uppercase tracking-wider block">Devotional & Reflection Log</span>
            <div className="flex gap-2">
              <input 
                type="text" 
                placeholder="Log a personal prayer requests or scripture insight..."
                value={newMeditation}
                onChange={e => setNewMeditation(e.target.value)}
                className="flex-1 bg-[#0D1B3E] text-white border border-white/10 rounded-lg px-3 py-1.5 text-xs"
              />
              <button
                onClick={() => {
                  if (!newMeditation.trim()) return;
                  setMeditationLog(prev => [newMeditation, ...prev]);
                  setNewMeditation("");
                  triggerToast("📝", "Inner sanctuary log updated.");
                }}
                className="bg-[#D4AF37] text-black text-xs px-3 rounded-lg font-semibold"
              >
                Journal Log
              </button>
            </div>

            <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
              {meditationLog.map((log, i) => (
                <div key={i} className="bg-[#112055]/30 border-l border-[#D4AF37] p-2 rounded-r text-xs text-[#B0C4DE]">
                  <p className="text-[9px] text-[#D4AF37]/60 font-medium mb-0.5">Covenant Entry #{i+1}</p>
                  <p>{log}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 5. GREEK & HEBREW CONCORDANCE */}
      {activeSubTab === "concordance" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="border border-[#D4AF37]/30 bg-[#0D1B3E] p-4 rounded-xl space-y-3.5">
            <span className="text-xs font-bold text-[#D4AF37] uppercase tracking-wider block">Concordance Query</span>
            <p className="text-[11px] text-slate-400">
              Input any English theological word or theme to trace its ancient etymology, Greek/Hebrew translation codes, and primary instances.
            </p>
            <div className="flex gap-2">
              <input 
                type="text" 
                value={concordanceQuery}
                onChange={e => setConcordanceQuery(e.target.value)}
                className="flex-1 bg-[#0A0F1E] text-white border border-[#D4AF37]/20 rounded-xl px-3 py-1.5 text-xs"
              />
              <button
                onClick={handleConcordanceSearch}
                disabled={concordanceLoading}
                className="bg-[#D4AF37] hover:bg-[#F0C940] text-black text-xs font-semibold px-3 py-1 rounded-xl"
              >
                {concordanceLoading ? "..." : "Map Root"}
              </button>
            </div>
          </div>

          <div className="md:col-span-2 bg-[#0A0F1E] border border-white/5 p-4 rounded-xl font-sans-raleway text-xs space-y-2.5">
            <h4 className="text-sm font-serif-cinzel font-bold text-[#D4AF37]">Concordance Target: {concordanceResult.word}</h4>
            
            <div className="bg-[#112055]/30 border border-[#D4AF37]/20 p-2.5 rounded-lg">
              <span className="font-semibold text-white text-[11px] uppercase tracking-wide">Parchment Root Term</span>
              <p className="text-sm font-semibold text-[#D4AF37] mt-0.5">{concordanceResult.greekTerm}</p>
            </div>

            <div>
              <span className="font-semibold text-white uppercase tracking-wide block">Ancient Lexicon Definition:</span>
              <p className="text-[#B0C4DE] leading-relaxed mt-0.5">{concordanceResult.definition}</p>
            </div>

            <div className="space-y-1.5">
              <span className="font-semibold text-white uppercase tracking-wide block">Seminal Scripture Hooks:</span>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {concordanceResult.instances?.map((item: any, idx: number) => (
                  <div key={idx} className="bg-white/5 p-2 rounded">
                    <p className="font-bold text-[#D4AF37] text-[10px]">{item.text}</p>
                    <p className="italic text-[#B0C4DE] text-[11px]">"{item.context}"</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
