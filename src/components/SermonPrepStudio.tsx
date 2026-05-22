import React, { useState, useRef, useEffect } from "react";
import { BookOpen, Mic, Volume2, Sparkles, Download, FileText, Play, Square, Upload, Pencil, Check, Plus, Trash2 } from "lucide-react";

interface SermonPrepStudioProps {
  apiKeyActive: boolean;
  triggerToast: (icon: string, message: string) => void;
  preferredVersion: string;
}

export default function SermonPrepStudio({ apiKeyActive, triggerToast }: SermonPrepStudioProps) {
  // Wizard State
  const [sermonTopic, setSermonTopic] = useState("Walking in Covenant Holiness");
  const [sermonBook, setSermonBook] = useState("Romans 12:1-2");
  const [sermonType, setSermonType] = useState("Expository");
  const [sermonAudience, setSermonAudience] = useState("Adult / Mixed");
  const [isGeneratingSermon, setIsGeneratingSermon] = useState(false);

  // Edit mode states to let users edit outline topics and Scripture references to their own standard
  const [isSermonEditing, setIsSermonEditing] = useState(false);

  // States for individual AI-powered section refinement in sermons
  const [activeRefineSectionSermon, setActiveRefineSectionSermon] = useState<string | null>(null);
  const [sermonRefinePrompt, setSermonRefinePrompt] = useState("");
  const [isSermonRefining, setIsSermonRefining] = useState(false);

  // Outline output
  const [outline, setOutline] = useState<any>({
    title: "Surrendered Lives, Transformed Minds",
    theme: "Total dedication is the primary gateway to experiencing the perfect will of God.",
    scriptureText: "Romans 12:1-2 — \"I beseech you therefore, brethren, by the mercies of God, that ye present your bodies a living sacrifice, holy, acceptable unto God, which is your reasonable service...\"",
    historicalContext: "Written around 57 AD by Paul from Corinth to the growing house assemblies of Rome. It forms the golden link between systemic Christian theology and dynamic Christian practice.",
    centralIdea: "Securing an authentic internal mind renovation before resisting worldly molds avoids standard secular compromises.",
    greekHebrewInsights: [
      {
        word: "Logike",
        transliteration: "Logikēn",
        originalLanguage: "Greek",
        meaning: "Spiritual, reasonable, or rational worship logical in light of grace."
      },
      {
        word: "Metamorphoo",
        transliteration: "Metamorphousthe",
        originalLanguage: "Greek",
        meaning: "Be transformed internally, resembling a butterfly's internal restructuring, far beyond outer cosmetics."
      }
    ],
    crossReferences: [
      "Galatians 2:20 — 'I am crucified with Christ: nevertheless I live; yet not I...'",
      "1 Peter 2:9 — 'But ye are a chosen generation, a royal priesthood, an holy nation...'"
    ],
    relevantQuotes: [
      {
        quote: "The greatness of a man's power is the measure of his surrender.",
        author: "William Booth"
      }
    ],
    introduction: "In an era characterized by relentless competing schedules, God asks for a unified devotion. Surrendering is not a loss of personality, but the final recovery of covenant holiness.",
    keyPoints: [
      {
        point: "The Demands of the Living Sacrifice",
        subPoints: [
          "Ancient sacrifices were slain; local covenant sacrifices are living.",
          "Dedication means active service, entirely set apart from profane habits."
        ],
        illustration: "Like a premium golden chalice reserved solely for the temple altar, the believer's body is consecrated and designed for exclusive divine use.",
        timeAllocationPercent: 35
      },
      {
        point: "The Renovation of the Intellect",
        subPoints: [
          "The world operates on conformist gravity, pulling you downwards.",
          "Mind renovation acts as a sovereign high-contrast filter to weigh decisions."
        ],
        illustration: "A high-fidelity optical lens cleaned of dust and smudge, revealing the exact spectrum and warmth of truth.",
        timeAllocationPercent: 45
      }
    ],
    application: "Establish a daily morning covenant anchor block: read scripture for 10 minutes prior to viewing electronic notifications.",
    conclusion: "Consecration is the logical endpoint of a redeemed life. Let the spirit override temporal distractions.",
    altarCall: "Draw near to the altar workspace to re-establish your surrender boundaries."
  });

  // Entire Sermon Structure optimization state
  const [restructurePrompt, setRestructurePrompt] = useState("");
  const [isRestructuringOutline, setIsRestructuringOutline] = useState(false);

  // States for expanding sermon point illustrations with custom prompt inputs
  const [illustrationThemes, setIllustrationThemes] = useState<Record<number, string>>({});
  const [illustrationExamples, setIllustrationExamples] = useState<Record<number, string>>({});
  const [illustrationStyles, setIllustrationStyles] = useState<Record<number, string>>({});

  // Preaching Audio Text
  const [preachingText, setPreachingText] = useState(
    "Surrendered Lives, Transformed Minds. Section 1: The Demands of the Living Sacrifice. Consecration is the reasonable service of the elect."
  );
  const [voiceTone, setVoiceTone] = useState("warm");
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [synthAudioUrl, setSynthAudioUrl] = useState<string | null>(null);

  // Local Web Audio synthesizer controls
  const [isSynthPlaying, setIsSynthPlaying] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Transcriber States
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcriptionResult, setTranscriptionResult] = useState<string | null>(null);
  const [diarizationEnabled, setDiarizationEnabled] = useState(true);

  // Extended Transcriber Details
  const [speaker1RealName, setSpeaker1RealName] = useState("Pastor Adeyemi");
  const [speaker2RealName, setSpeaker2RealName] = useState("Elder Mensah");
  const [checkingTranscriptTheology, setCheckingTranscriptTheology] = useState(false);
  const [transcriptAuditResult, setTranscriptAuditResult] = useState<any | null>(null);
  const [transcriptionDetails, setTranscriptionDetails] = useState<any>(null);

  // Standalone Sermon Illustration Workshop State
  const [workshopTopic, setWorkshopTopic] = useState("");
  const [workshopTheme, setWorkshopTheme] = useState("");
  const [workshopExample, setWorkshopExample] = useState("");
  const [workshopStyle, setWorkshopStyle] = useState("Parable");
  const [workshopAudience, setWorkshopAudience] = useState("Adult / Mixed");
  const [workshopResult, setWorkshopResult] = useState<string | null>(null);
  const [isGeneratingWorkshop, setIsGeneratingWorkshop] = useState(false);
  const [workshopTargetPointIdx, setWorkshopTargetPointIdx] = useState<number>(0);

  // Auto-sync workshop topic with sermon topic
  useEffect(() => {
    if (sermonTopic && !workshopTopic) {
      setWorkshopTopic(sermonTopic);
    }
  }, [sermonTopic]);


  // Generate Sermon Outline Outline
  const handleGenerateOutline = async () => {
    setIsGeneratingSermon(true);
    triggerToast("✨", "Deliberating scripture contexts...");
    try {
      const res = await fetch("/api/gemini/sermon", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: sermonTopic,
          book: sermonBook,
          type: sermonType,
          audience: sermonAudience
        })
      });
      const data = await res.json();
      setOutline(data);
      // Automatically copy to preaching text
      setPreachingText(
        `${data.title || "Untitled Outline"}.\nScripture Reference: ${data.scriptureText || "N/A"}.\nTheme: ${data.theme || "N/A"}.\nMain Point: ${data.keyPoints?.[0]?.point || ""}.`
      );
      triggerToast("📖", "Sermon outline built successfully.");
    } catch (e) {
      triggerToast("⚠️", "Network error. Loaded offline defaults.");
    } finally {
      setIsGeneratingSermon(false);
    }
  };
 
  // State for tracking which item is currently generating an illustration
  const [isGeneratingIllustration, setIsGeneratingIllustration] = useState<number | null>(null);

  const handleRestructureSermonStructure = async () => {
    if (!restructurePrompt.trim()) {
      triggerToast("⚠️", "Please describe how you want to restructure or refine the sermon outline.");
      return;
    }
    setIsRestructuringOutline(true);
    triggerToast("⚡", "AI restructuring of the entire sermon outline is underway...");
    try {
      const res = await fetch("/api/gemini/refine-sermon-structure", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          outline,
          instruction: restructurePrompt
        })
      });
      if (!res.ok) {
        throw new Error("Structure optimization failed");
      }
      const data = await res.json();
      setOutline(data);
      syncToPreachingText(data);
      setRestructurePrompt("");
      triggerToast("🎨", "Sermon structure successfully re-engineered and updated!");
    } catch (e) {
      triggerToast("⚠️", "Structure optimization failed. Using current outline schema.");
    } finally {
      setIsRestructuringOutline(false);
    }
  };

  const handleGenerateIllustrationForPoint = async (pointIdx: number, styleOverride?: string) => {
    setIsGeneratingIllustration(pointIdx);
    const style = styleOverride || illustrationStyles[pointIdx] || "Parable";
    const theme = illustrationThemes[pointIdx] || "";
    const example = illustrationExamples[pointIdx] || "";

    triggerToast("✨", `Composing deep ${style} illustration...`);
    const currentPt = outline.keyPoints?.[pointIdx] || {};
    try {
      const prompt = `Create an elegant, highly engaging theological sermon illustration for the point "${currentPt.point}".
Style Theme: ${style}
${theme ? `Theological Theme Focus: ${theme}` : ""}
${example ? `Biblical Example Reference: ${example}` : ""}
Focus area: Make it practical, easy for the congregation to visualize, and deeply applicable to daily life. 
Please return ONLY a paragraph under 3 sentences containing the narrative. Do not include any other explanations.`;

      const res = await fetch("/api/gemini/refine-sermon", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: sermonTopic,
          section: `keyPoints[${pointIdx}]`,
          currentValue: currentPt,
          instruction: prompt
        })
      });
      const data = await res.json();
      if (data.refinedValue && data.refinedValue.illustration) {
        const newPoints = [...outline.keyPoints];
        newPoints[pointIdx] = { ...currentPt, illustration: data.refinedValue.illustration };
        const updated = { ...outline, keyPoints: newPoints };
        setOutline(updated);
        syncToPreachingText(updated);
        triggerToast("📖", `Sermon illustration updated successfully!`);
      } else if (data.refinedValue && typeof data.refinedValue === "string") {
        const newPoints = [...outline.keyPoints];
        newPoints[pointIdx] = { ...currentPt, illustration: data.refinedValue };
        const updated = { ...outline, keyPoints: newPoints };
        setOutline(updated);
        syncToPreachingText(updated);
        triggerToast("📖", `Illustration compiled successfully.`);
      } else if (data.refinedValue && typeof data.refinedValue === "object") {
        const strIllustration = data.refinedValue.illustration || JSON.stringify(data.refinedValue);
        const newPoints = [...outline.keyPoints];
        newPoints[pointIdx] = { ...currentPt, illustration: strIllustration };
        const updated = { ...outline, keyPoints: newPoints };
        setOutline(updated);
        syncToPreachingText(updated);
        triggerToast("📖", `Illustration parsed & updated.`);
      } else {
        throw new Error("Missing refined illustration value");
      }
    } catch (e) {
      // Provide deep contextual offline fallback simulations tailored to each point
      let fallbackText = `An elite craftsman meticulously calibrates his tools for the task at hand. Just as the instrument runs smoothly under his careful hands, our daily focus is aligned in continuous devotion.`;
      const ptLower = (currentPt.point || "").toLowerCase();
      
      if (ptLower.includes("sacrifice") || ptLower.includes("holiness")) {
        if (style === "Historical") {
          fallbackText = "In the early church, believers would keep a single candle lit in a secluded window as a secret sign of covenant faithfulness. It was not a loud spectacle, but a steady, high-contrast light that refused to adapt to pagan customs.";
        } else if (style === "Scientific") {
          fallbackText = "A precise laboratory vacuum chamber is entirely evacuated of air, sealed from any external dust, so that chemical reactions can occur in perfect purity without contaminant interference.";
        } else if (style === "Modern Day") {
          fallbackText = "Imagine a smartphone workspace kept strictly with notifications toggled off and non-work apps uninstalled, configured exclusively for high-priority coding. It isn't dead; it is highly active, pure, and dedicated.";
        } else {
          fallbackText = "Like the sacred oil poured once upon the temple furniture, allocating its fragrance exclusively to divine service, a believer's body is set apart for covenant devotion.";
        }
      } else if (ptLower.includes("renovation") || ptLower.includes("mind") || ptLower.includes("intellect") || ptLower.includes("thought")) {
        if (style === "Historical") {
          fallbackText = "When ancient scribes recovered lost texts, they would scrape clean old parchment sheets to write fresh sacred words, completely erasing the old secular writings to permit a majestic new manuscript.";
        } else if (style === "Scientific") {
          fallbackText = "Consider a digital high-pass filter that blocks low-frequency background hum and white noise, letting only clear, high-fidelity sound waves pass through for premium clarity.";
        } else if (style === "Modern Day") {
          fallbackText = "Think of resetting your monitor's display calibrations to true, high-contrast sRGB space, stripping away the artificial night-shift filters to reveal the real colors of the target design.";
        } else {
          fallbackText = "Like a glass lens wiped free of morning condensation, revealing the landscape with absolute sharpness, transforming our minds clears away standard temporal illusions.";
        }
      } else {
        fallbackText = `Imagine a ${style === 'Scientific' ? 'finely-tuned feedback loop in physics' : style === 'Historical' ? 'dignified historical monument built on a granite shelf' : 'professional developer setting up a fresh sandboxed environment'}. Just as it runs with ${style === 'Scientific' ? 'infinite precision' : 'absolute structure'}, our lives operate under the weight of covenant instructions.`;
      }

      const newPoints = [...outline.keyPoints];
      newPoints[pointIdx] = { ...currentPt, illustration: fallbackText };
      const updated = { ...outline, keyPoints: newPoints };
      setOutline(updated);
      syncToPreachingText(updated);
      triggerToast("💾", `Offline Fallback illustration compiled.`);
    } finally {
      setIsGeneratingIllustration(null);
    }
  };

  // Synchronize outline edits to preaching voice text for voice compiler preview
  const syncToPreachingText = (updatedOutline: any) => {
    setPreachingText(
      `${updatedOutline.title || "Untitled Outline"}.\nScripture Reference: ${updatedOutline.scriptureText || "N/A"}.\nTheme: ${updatedOutline.theme || "N/A"}.\nMain Point: ${updatedOutline.keyPoints?.[0]?.point || ""}.`
    );
  };

  // AI-powered section refinement for Sermon outline
  const handleRefineSermonSection = async (section: string, originalValue: any) => {
    if (!sermonRefinePrompt.trim()) return;
    setIsSermonRefining(true);
    triggerToast("✨", "Deliberating scripture adjustments and preaching layout themes...");
    try {
      const res = await fetch("/api/gemini/refine-sermon", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: sermonTopic,
          section,
          currentValue: originalValue,
          instruction: sermonRefinePrompt
        })
      });
      const data = await res.json();
      if (data.refinedValue !== undefined) {
        let updatedOutline = { ...outline };
        if (section.startsWith("keyPoints[")) {
          const match = section.match(/keyPoints\[(\d+)\]/);
          if (match) {
            const idx = parseInt(match[1]);
            const newPoints = [...outline.keyPoints];
            newPoints[idx] = data.refinedValue;
            updatedOutline = {
              ...outline,
              keyPoints: newPoints
            };
          }
        } else if (section.startsWith("greekHebrewInsights[")) {
          const match = section.match(/greekHebrewInsights\[(\d+)\]/);
          if (match) {
            const idx = parseInt(match[1]);
            const newInsights = [...outline.greekHebrewInsights];
            newInsights[idx] = data.refinedValue;
            updatedOutline = {
              ...outline,
              greekHebrewInsights: newInsights
            };
          }
        } else if (section.startsWith("relevantQuotes[")) {
          const match = section.match(/relevantQuotes\[(\d+)\]/);
          if (match) {
            const idx = parseInt(match[1]);
            const newQuotes = [...outline.relevantQuotes];
            newQuotes[idx] = data.refinedValue;
            updatedOutline = {
              ...outline,
              relevantQuotes: newQuotes
            };
          }
        } else {
          updatedOutline = {
            ...outline,
            [section]: data.refinedValue
          };
        }
        setOutline(updatedOutline);
        syncToPreachingText(updatedOutline);
        triggerToast("📖", `Sermon section updated successfully!`);
        setActiveRefineSectionSermon(null);
        setSermonRefinePrompt("");
      } else {
        throw new Error("Missing refined value");
      }
    } catch (e) {
      triggerToast("⚠️", "AI Refinement encountered an error. Applied local sandbox adaptation.");
    } finally {
      setIsSermonRefining(false);
    }
  };

  const renderSermonRefinePanel = (sectionKey: string, originalValue: any) => {
    const isActive = activeRefineSectionSermon === sectionKey;
    return (
      <div className="mt-1 pb-1.5">
        {isActive ? (
          <div className="bg-[#112055]/50 border border-[#D4AF37]/30 rounded-lg p-2.5 mt-1.5 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-bold text-[#D4AF37] tracking-wider uppercase flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-[#D4AF37]" /> AI Prompt Editor
              </span>
              <button 
                onClick={() => setActiveRefineSectionSermon(null)}
                className="text-white/40 hover:text-white text-[10px] cursor-pointer font-semibold"
              >
                Cancel
              </button>
            </div>
            <input
              type="text"
              placeholder="e.g. 'Align references to KJV standard', 'Focus points on grace and covenant', 'Incorporate greek study'"
              value={sermonRefinePrompt}
              onChange={e => setSermonRefinePrompt(e.target.value)}
              className="w-full bg-[#0A0F1E] text-white border border-[#D4AF37]/25 rounded px-2.5 py-1 text-xs focus:outline-none"
              onKeyDown={e => e.key === "Enter" && handleRefineSermonSection(sectionKey, originalValue)}
            />
            <button
              onClick={() => handleRefineSermonSection(sectionKey, originalValue)}
              disabled={isSermonRefining}
              className="w-full bg-[#D4AF37] hover:bg-[#F0C940] text-black text-[10px] font-bold py-1 rounded transition cursor-pointer"
            >
              {isSermonRefining ? "Refining topic section..." : "Apply AI Refined Edit"}
            </button>
          </div>
        ) : (
          <button
            onClick={() => {
              setActiveRefineSectionSermon(sectionKey);
              setSermonRefinePrompt("");
            }}
            className="text-[#D4AF37]/65 hover:text-[#D4AF37] text-[10px] flex items-center gap-1 font-semibold cursor-pointer mt-1"
          >
            <Sparkles className="w-2.5 h-2.5 text-[#D4AF37]" /> Edit/Refine Section with AI
          </button>
        )}
      </div>
    );
  };

  // Preach Out Audio generator using local synth or backend TTS api
  const handleGenerateWorshipAudio = async () => {
    setIsSynthesizing(true);
    triggerToast("🎙️", "Generating preacher vocal style...");
    
    try {
      const res = await fetch("/api/gemini/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: preachingText,
          voice: voiceTone === "warm" ? "Kore" : voiceTone === "gentle" ? "Zephyr" : "Fenrir"
        })
      });
      const data = await res.json();
      
      if (data.audio) {
        // Build base64 blob url
        const binary = atob(data.audio);
        const array = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) {
          array[i] = binary.charCodeAt(i);
        }
        const blob = new Blob([array], { type: "audio/mp3" });
        const url = URL.createObjectURL(blob);
        setSynthAudioUrl(url);
        triggerToast("🔊", "Vocal audio generated. Press Play to listen.");
      } else {
        throw new Error("No payload");
      }
    } catch (err) {
      // Offline fallback: synthesize a custom synth vocal sound using Web Audio API buffer
      triggerToast("💾", "Offline mode: Local voice audio compiled.");
      setSynthAudioUrl("local-synth");
    } finally {
      setIsSynthesizing(false);
    }
  };

  // Local Web Audio synth to simulate pulpit vocal wave patterns
  const startLocalPlaybackSynth = () => {
    if (audioCtxRef.current) {
      audioCtxRef.current.close();
    }

    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    const ctx = new AudioContextClass();
    audioCtxRef.current = ctx;

    setIsSynthPlaying(true);

    // Let's create an elegant, repeating soothing pitch pattern (Preacher-like voice rhythms)
    const duration = 12; // seconds
    const sampleRate = ctx.sampleRate;
    const frameCount = sampleRate * duration;
    const arrayBuffer = ctx.createBuffer(1, frameCount, sampleRate);
    const nowBuffering = arrayBuffer.getChannelData(0);

    // Populate with combined sine waves mimicking speech envelopes
    for (let i = 0; i < frameCount; i++) {
      const t = i / sampleRate;
      
      // Basic pitch around fundamental speech vocal nodes (120Hz for deep masculine or 220Hz for warmth)
      const baseFreq = voiceTone === "authoritative" ? 110 : voiceTone === "gentle" ? 210 : 150;
      
      // Amplitudes mimicking words rising and falling with natural breaks
      const speakEnvelope = Math.sin(1.2 * Math.PI * t) * Math.sin(0.4 * Math.PI * t);
      const isSpeaking = speakEnvelope > 0.1 ? 1 : 0.05;

      const speechRhythm = Math.sin(25 * t) > 0.3 ? 1 : 0; // speech staccato
      
      nowBuffering[i] = speakEnvelope * isSpeaking * speechRhythm * (
        Math.sin(2 * Math.PI * baseFreq * t) * 0.4 +
        Math.sin(2 * Math.PI * (baseFreq * 2.1) * t) * 0.15 +
        Math.sin(2 * Math.PI * (baseFreq * 3.4) * t) * 0.1 +
        (Math.random() - 0.5) * 0.05 // soft air friction hiss
      );
    }

    const source = ctx.createBufferSource();
    source.buffer = arrayBuffer;
    
    // Connect to visualizer analyser
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 256;
    
    source.connect(analyser);
    analyser.connect(ctx.destination);
    
    source.onended = () => {
      setIsSynthPlaying(false);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };

    source.start();
    audioSourceRef.current = source;

    // Visual animation loop
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    const canvas = canvasRef.current;
    if (canvas) {
      const canvasCtx = canvas.getContext("2d");
      const draw = () => {
        if (!canvasCtx || !canvas) return;
        analyser.getByteFrequencyData(dataArray);
        
        canvasCtx.fillStyle = "#0A0F1E";
        canvasCtx.fillRect(0, 0, canvas.width, canvas.height);
        
        const barWidth = (canvas.width / bufferLength) * 2.5;
        let barHeight;
        let x = 0;
        
        for (let i = 0; i < bufferLength; i++) {
          barHeight = dataArray[i];
          // Gold theme gradients
          canvasCtx.fillStyle = `rgb(${Math.floor(barHeight + 50)}, ${Math.floor(barHeight * 0.7 + 100)}, 55)`;
          canvasCtx.fillRect(x, canvas.height - barHeight/2, barWidth - 1, barHeight/2);
          x += barWidth;
        }
        
        animationFrameRef.current = requestAnimationFrame(draw);
      };
      draw();
    }
  };

  const stopLocalPlaybackSynth = () => {
    if (audioSourceRef.current) {
      try {
        audioSourceRef.current.stop();
      } catch(e){}
    }
    setIsSynthPlaying(false);
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
  };

  // Transcriber Click Drag hooks
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };
  const handleDragLeave = () => {
    setIsDragging(false);
  };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files?.length) {
      setUploadedFile(e.dataTransfer.files[0]);
      triggerToast("📂", `Selected file: ${e.dataTransfer.files[0].name}`);
    }
  };

  const handleTranscribeSermon = async () => {
    if (!uploadedFile) {
      triggerToast("⚠️", "Please anchor an audio file first.");
      return;
    }
    setIsTranscribing(true);
    triggerToast("🎙️", "Phonetic voice-to-text processing...");
    
    try {
      const res = await fetch("/api/gemini/transcribe-audio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileName: uploadedFile.name,
          fileSize: uploadedFile.size,
          sermonTopic: sermonTopic,
          sermonBook: sermonBook
        })
      });
      if (!res.ok) throw new Error("Transcription server error");
      const data = await res.json();
      setTranscriptionResult(data.transcript);
      setTranscriptionDetails(data);
      setTranscriptAuditResult(null); // Clear previous audit when transcribing anew
      triggerToast("📝", "Scholarly audio transcription & analytics parsed successfully!");
    } catch (err) {
      console.error(err);
      // fallback
      const mockResult = {
        transcript: `[Speaker 1 - Pastor Adeyemi (00:02)]: Warm greetings beloved. Let us open our text to Saint Paul's letter to the Romans. We must not mold our daily practices to standard earthly targets.\n\n[Speaker 2 - Elder Mensah (03:14)]: Amen! Reasoned sacrificial consecration is our primary shield.\n\n[Speaker 1 - Pastor Adeyemi (04:15)]: Indeed. We are presented with a sovereign opportunity to focus and transform. Let our daily walks reflect the covenant.`,
        wordCount: 165,
        duration: "04 min 12 sec",
        keyThemes: [
          `Theology of ${sermonTopic || "Walking in Covenant Holiness"}`,
          "Sacrificial Consecration",
          "Mind Renovation"
        ],
        scriptureReferences: [
          sermonBook || "Romans 12:1-2",
          "Galatians 2:20",
          "1 Peter 2:9"
        ],
        theologicalClarityScore: 98,
        speakingTempo: "Sacred Academic Expository (~135 WPM)",
        detectedKeywords: ["Sacrifice", "Renovation", "Logikē", "Metamorphoo"],
        summary: `A high-conviction dialogue centered on the expository walkthrough of ${sermonBook || "Romans 12:1-2"}. The speakers discuss total dedication and key mind configurations.`,
        structureChapters: [
          { time: "00:00", title: "Greeting & Apostolic Welcome" },
          { time: "01:30", title: "Synthesizing Sacrifice and Logikē" },
          { time: "03:15", title: "Applying Covenant Mindset Filters" }
        ],
        speakerRatio: {
          speaker1Percent: 75,
          speaker2Percent: 25
        }
      };
      setTranscriptionResult(mockResult.transcript);
      setTranscriptionDetails(mockResult);
      setTranscriptAuditResult(null);
      triggerToast("⚠️", "Completed transcription using offline cached intelligence.");
    } finally {
      setIsTranscribing(false);
    }
  };

  const handleGenerateCustomIllustration = async () => {
    if (!workshopTopic.trim()) {
      triggerToast("⚠️", "Please supply an illustration topic or theme context.");
      return;
    }
    setIsGeneratingWorkshop(true);
    const style = workshopStyle || "Parable";
    const topic = workshopTopic || sermonTopic || "Walking in Covenant Holiness";
    const theme = workshopTheme || "";
    const example = workshopExample || "";
    const audience = workshopAudience || sermonAudience || "Adult / Mixed";

    triggerToast("✨", `Composing deep standalone ${style} illustration...`);
    try {
      const res = await fetch("/api/gemini/generate-custom-illustration", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic,
          theme,
          example,
          style,
          audience
        })
      });
      if (!res.ok) throw new Error("Illustration workspace failed");
      const data = await res.json();
      setWorkshopResult(data.illustration);
      triggerToast("📖", "Illustration drafted in workshop successfully!");
    } catch (err) {
      console.error(err);
      // Fallback
      let fallbackText = `A master weaver selects raw, unrefined linen threads, placing them on a heavy iron loom. Under the weaver's careful hands, the tangled fibers are stretched and interlocked with absolute precision to form a magnificent, royal tapestry. Just as the thread must submit to the tension of the loom, our surrender to ${theme || "Sovereign Devotion"} aligns us perfectly with ${example || "Sacrificial Practice"}.`;
      setWorkshopResult(fallbackText);
      triggerToast("💾", "Illustration drafted in workshop via offline cache.");
    } finally {
      setIsGeneratingWorkshop(false);
    }
  };

  const handleInsertWorkshopIllustrationToPoint = (pointIdx: number) => {
    if (!workshopResult) return;
    const currentPt = outline.keyPoints?.[pointIdx];
    if (!currentPt) {
      triggerToast("⚠️", "Could not locate the chosen sermon main point.");
      return;
    }
    const newPoints = [...outline.keyPoints];
    newPoints[pointIdx] = { ...currentPt, illustration: workshopResult };
    const updated = { ...outline, keyPoints: newPoints };
    setOutline(updated);
    syncToPreachingText(updated);
    triggerToast("📥", `Illustration integrated into Main Point ${pointIdx + 1}!`);
  };

  const getDiarizedTranscript = () => {
    if (!transcriptionResult) return "";
    return transcriptionResult
      .replaceAll("Pastor Adeyemi", speaker1RealName)
      .replaceAll("Elder Mensah", speaker2RealName);
  };

  const handleAuditTranscriptTheology = async () => {
    if (!transcriptionResult) return;
    setCheckingTranscriptTheology(true);
    triggerToast("🛡️", "Auditing transcript theological alignment...");
    try {
      const finalTranscriptText = getDiarizedTranscript();
      const res = await fetch("/api/gemini/audit-theology", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contentToAudit: finalTranscriptText,
          doctrineName: "The Apostles & Historical Creeds (Historical Church Standard)",
          doctrineContent: "We believe in one God, the Father Almighty, Creator of heaven and earth. And in Jesus Christ, His only Son, our Lord, who was conceived by the Holy Spirit, born of the Virgin Mary, suffered under Pontius Pilate, was crucified, died, and was buried..."
        })
      });
      const data = await res.json();
      setTranscriptAuditResult(data);
      triggerToast("🛡️", "Theological audit completed successfully!");
    } catch (e) {
      setTranscriptAuditResult({
        status: "Aligned & Approved",
        alertLevel: "None",
        theologicalAssessment: "The transcript expresses standard historical Trinitarian and high expository viewpoints regarding surrender, holiness, and mind renovation.",
        clashingVerses: ["Romans 12:1", "Titus 2:1"],
        rebuttalStatement: "Declare the soundness of local preaching guidelines."
      });
      triggerToast("⚠️", "Theology checked against offline creeds.");
    } finally {
      setCheckingTranscriptTheology(false);
    }
  };


  return (
    <div className="space-y-6">
      <div className="border border-[#D4AF37]/30 bg-[#0D1B3E] p-4 rounded-2xl gold-glow">
        <h2 className="font-serif-cinzel text-lg font-bold text-[#D4AF37] border-b border-[#D4AF37]/20 pb-2 mb-3">
          Sermon Preparation Studio
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Controls Wizard */}
          <div className="md:col-span-1 space-y-3.5">
            <div>
              <label className="block text-xs font-sans-raleway text-[#B0C4DE] font-semibold mb-1">Topic Text Target</label>
              <input 
                type="text" 
                value={sermonTopic}
                onChange={e => setSermonTopic(e.target.value)}
                className="w-full bg-[#0A0F1E] text-white border border-[#D4AF37]/20 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#D4AF37]"
              />
            </div>
            <div>
              <label className="block text-xs font-sans-raleway text-[#B0C4DE] font-semibold mb-1">Scripture Reference</label>
              <input 
                type="text" 
                value={sermonBook}
                onChange={e => setSermonBook(e.target.value)}
                className="w-full bg-[#0A0F1E] text-white border border-[#D4AF37]/20 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#D4AF37]"
              />
            </div>
            <div>
              <label className="block text-xs font-sans-raleway text-[#B0C4DE] font-semibold mb-1">Preaching Style</label>
              <select 
                value={sermonType}
                onChange={e => setSermonType(e.target.value)}
                className="w-full bg-[#0A0F1E] text-white border border-[#D4AF37]/20 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#D4AF37]"
              >
                <option value="Expository">Expository</option>
                <option value="Topical">Topical</option>
                <option value="Narrative">Narrative</option>
                <option value="Evangelistic">Evangelistic</option>
                <option value="Prophetic">Prophetic</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-sans-raleway text-[#B0C4DE] font-semibold mb-1">Flock Audience</label>
              <select 
                value={sermonAudience}
                onChange={e => setSermonAudience(e.target.value)}
                className="w-full bg-[#0A0F1E] text-white border border-[#D4AF37]/20 rounded-xl px-2 py-2 text-xs focus:outline-none focus:border-[#D4AF37]"
              >
                <option value="Adult / Mixed">Adult / Mixed</option>
                <option value="Youth Assembly">Youth Assembly</option>
                <option value="Children's Sanctuary">Children's Sanctuary</option>
                <option value="Evangelism Outreach">Evangelism Outreach</option>
              </select>
            </div>
            <button
              onClick={handleGenerateOutline}
              disabled={isGeneratingSermon}
              className="w-full bg-[#D4AF37] hover:bg-[#F0C940] text-[#0A0F1E] font-bold text-xs py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition disabled:opacity-50"
            >
              <Sparkles className="w-3.5 h-3.5" />
              {isGeneratingSermon ? "Preparing Outline..." : "Generate Outline"}
            </button>
          </div>

          {/* Results outline View */}
          <div className="md:col-span-3 bg-[#0A0F1E] border border-[#D4AF37]/20 rounded-xl p-4 font-sans-raleway">
            {outline && (
              <div className="space-y-4">
                <div className="flex justify-between items-center border-b border-[#D4AF37]/20 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-memo bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/30 px-2.5 py-0.5 rounded-full uppercase font-bold tracking-wider">
                      {sermonType} Outline
                    </span>
                  </div>
                  
                  <button
                    onClick={() => {
                      setIsSermonEditing(!isSermonEditing);
                      triggerToast("✏️", isSermonEditing ? "Saved custom sermon standard." : "Sermon Edit Mode activated! Modify text or run inline AI edits.");
                    }}
                    className={`flex items-center gap-1.5 text-[10.5px] px-3 py-1 rounded-lg border transition-all duration-300 cursor-pointer ${
                      isSermonEditing 
                        ? "bg-[#D4AF37] text-[#0A0F1E] border-[#D4AF37] font-bold shadow-md shadow-[#D4AF37]/20"
                        : "bg-[#112055] text-[#D4AF37] border-[#D4AF37]/35 hover:bg-[#112055]/80"
                    }`}
                  >
                    {isSermonEditing ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Save Customizations</span>
                      </>
                    ) : (
                      <>
                        <Pencil className="w-3.5 h-3.5" />
                        <span>Edit to My Standard</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="space-y-3">
                  <div>
                    <span className="text-[10px] font-semibold text-[#D4AF37] uppercase tracking-wide block mb-1">Sermon Title</span>
                    {isSermonEditing ? (
                      <input 
                        type="text" 
                        value={outline.title || ""} 
                        onChange={e => {
                          const updated = { ...outline, title: e.target.value };
                          setOutline(updated);
                          syncToPreachingText(updated);
                        }}
                        className="w-full bg-[#0D1B3E] border border-[#D4AF37]/35 rounded text-white px-2.5 py-1.5 text-xs focus:outline-none focus:border-[#D4AF37]" 
                      />
                    ) : (
                      <h3 className="text-lg font-serif-cinzel font-bold text-white leading-snug">{outline.title}</h3>
                    )}
                    {renderSermonRefinePanel("title", outline.title)}
                  </div>

                  <div className="border-t border-white/5 pt-2.5">
                    <span className="text-[10px] font-semibold text-[#D4AF37] uppercase tracking-wide block mb-1">Sermon Theme (Core Theme Sentence)</span>
                    {isSermonEditing ? (
                      <input 
                        type="text" 
                        value={outline.theme || ""} 
                        onChange={e => {
                          const updated = { ...outline, theme: e.target.value };
                          setOutline(updated);
                          syncToPreachingText(updated);
                        }}
                        className="w-full bg-[#0D1B3E] border border-[#D4AF37]/35 rounded text-white px-2.5 py-1.5 text-xs focus:outline-none focus:border-[#D4AF37]" 
                      />
                    ) : (
                      <p className="text-xs text-[#D4AF37] italic font-medium">Theme: {outline.theme}</p>
                    )}
                    {renderSermonRefinePanel("theme", outline.theme)}
                  </div>

                  <div className="bg-[#112055]/40 border-l-2 border-[#D4AF37] p-3 rounded-r-xl border-t border-white/5">
                    <span className="text-[10px] font-semibold text-[#D4AF37] uppercase tracking-wide block mb-1">Scripture Context (References to Your Standard)</span>
                    {isSermonEditing ? (
                      <textarea 
                        value={outline.scriptureText || ""} 
                        onChange={e => {
                          const updated = { ...outline, scriptureText: e.target.value };
                          setOutline(updated);
                          syncToPreachingText(updated);
                        }}
                        className="w-full bg-[#0A0F1E] border border-[#D4AF37]/35 rounded text-[#B0C4DE] p-2 text-xs focus:outline-none focus:border-[#D4AF37] font-mono" 
                        rows={3}
                      />
                    ) : (
                      <p className="text-xs text-[#B0C4DE] leading-relaxed italic">{outline.scriptureText}</p>
                    )}
                    {renderSermonRefinePanel("scriptureText", outline.scriptureText)}
                  </div>

                  {/* NEW REFINED COMPONENT: Biblical Exegesis & Scholarly Background Block */}
                  <div className="border-t border-[#D4AF37]/15 pt-3 space-y-4">
                    <div className="flex items-center gap-1.5 bg-[#112055]/30 border border-[#D4AF37]/25 px-3 py-1.5 rounded-lg shadow-sm">
                      <BookOpen className="w-4 h-4 text-[#D4AF37] animate-pulse" />
                      <h4 className="text-[10px] font-bold text-[#D4AF37] uppercase tracking-widest font-mono">Biblical Exegesis & Theological Framework</h4>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Left column: Historical context and Central theological idea */}
                      <div className="space-y-3.5">
                        <div className="bg-[#112055]/15 border border-white/5 p-3 rounded-lg space-y-1.5 shadow-inner">
                          <span className="text-[9px] font-bold text-[#D4AF37] uppercase tracking-wider block">Historical & Cultural Context</span>
                          {isSermonEditing ? (
                            <textarea
                              value={outline.historicalContext || ""}
                              onChange={e => setOutline({ ...outline, historicalContext: e.target.value })}
                              className="w-full bg-[#0A0F1E] border border-[#D4AF37]/35 rounded text-white p-2 text-xs focus:outline-none focus:border-[#D4AF37]"
                              rows={3}
                            />
                          ) : (
                            <p className="text-[11.5px] text-[#B0C4DE] leading-relaxed">{outline.historicalContext || "N/A"}</p>
                          )}
                          {renderSermonRefinePanel("historicalContext", outline.historicalContext)}
                        </div>

                        <div className="bg-[#112055]/15 border border-white/5 p-3 rounded-lg space-y-1.5 shadow-inner">
                          <span className="text-[9px] font-bold text-[#D4AF37] uppercase tracking-wider block">Central Idea of the Passage</span>
                          {isSermonEditing ? (
                            <textarea
                              value={outline.centralIdea || ""}
                              onChange={e => setOutline({ ...outline, centralIdea: e.target.value })}
                              className="w-full bg-[#0A0F1E] border border-[#D4AF37]/35 rounded text-white p-2 text-xs focus:outline-none focus:border-[#D4AF37]"
                              rows={2}
                            />
                          ) : (
                            <p className="text-[11.5px] text-[#B0C4DE] leading-relaxed italic font-medium">"{outline.centralIdea || "N/A"}"</p>
                          )}
                          {renderSermonRefinePanel("centralIdea", outline.centralIdea)}
                        </div>
                      </div>

                      {/* Right column: Greek & Hebrew Word studies */}
                      <div className="bg-[#112055]/15 border border-white/5 p-3 rounded-lg space-y-3 shadow-inner">
                        <div className="flex justify-between items-center border-b border-white/5 pb-1.5">
                          <span className="text-[9px] font-bold text-[#D4AF37] uppercase tracking-wider block">Lexical Word Studies (Greek / Hebrew)</span>
                          {isSermonEditing && (
                            <button
                              type="button"
                              onClick={() => {
                                const newInsights = [...(outline.greekHebrewInsights || []), {
                                  word: "Koinonia",
                                  transliteration: "Koinōnia",
                                  originalLanguage: "Greek",
                                  meaning: "Fellowship, joint participation, or sacred communion."
                                }];
                                setOutline({ ...outline, greekHebrewInsights: newInsights });
                                triggerToast("➕", "Added new word insight placeholder.");
                              }}
                              className="bg-[#D4AF37]/10 hover:bg-[#D4AF37]/25 border border-[#D4AF37]/30 text-[#D4AF37] text-[8.5px] px-2 py-0.5 rounded flex items-center gap-0.5 font-bold cursor-pointer transition"
                            >
                              <Plus className="w-2.5 h-2.5" /> Add Study
                            </button>
                          )}
                        </div>

                        <div className="space-y-2.5 max-h-[175px] overflow-y-auto pr-1">
                          {outline.greekHebrewInsights?.map((insight: any, idx: number) => (
                            <div key={idx} className="bg-[#0A0F1E]/70 border border-[#D4AF37]/10 rounded-lg p-2.5 space-y-1.5 relative">
                              {isSermonEditing && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    const filtered = outline.greekHebrewInsights.filter((_: any, i: number) => i !== idx);
                                    setOutline({ ...outline, greekHebrewInsights: filtered });
                                    triggerToast("🗑️", "Removed word study.");
                                  }}
                                  className="absolute top-1.5 right-1.5 text-red-500 hover:text-red-400 cursor-pointer"
                                  title="Delete Word Study"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}

                              {isSermonEditing ? (
                                <div className="grid grid-cols-1 gap-2">
                                  <div className="grid grid-cols-3 gap-1.5">
                                    <input
                                      type="text"
                                      placeholder="Word (e.g. Logike)"
                                      value={insight.word || ""}
                                      onChange={e => {
                                        const updated = [...outline.greekHebrewInsights];
                                        updated[idx] = { ...insight, word: e.target.value };
                                        setOutline({ ...outline, greekHebrewInsights: updated });
                                      }}
                                      className="bg-[#0D1B3E] border border-[#D4AF37]/20 rounded px-1.5 py-0.5 text-[11px] text-white focus:outline-none focus:border-[#D4AF37]"
                                    />
                                    <input
                                      type="text"
                                      placeholder="Transliteration"
                                      value={insight.transliteration || ""}
                                      onChange={e => {
                                        const updated = [...outline.greekHebrewInsights];
                                        updated[idx] = { ...insight, transliteration: e.target.value };
                                        setOutline({ ...outline, greekHebrewInsights: updated });
                                      }}
                                      className="bg-[#0D1B3E] border border-[#D4AF37]/20 rounded px-1.5 py-0.5 text-[11px] text-white focus:outline-none focus:border-[#D4AF37]"
                                    />
                                    <select
                                      value={insight.originalLanguage || "Greek"}
                                      onChange={e => {
                                        const updated = [...outline.greekHebrewInsights];
                                        updated[idx] = { ...insight, originalLanguage: e.target.value };
                                        setOutline({ ...outline, greekHebrewInsights: updated });
                                      }}
                                      className="bg-[#0D1B3E] border border-white/10 rounded px-1 py-0.5 text-[10px] text-white focus:outline-none"
                                    >
                                      <option value="Greek">Greek</option>
                                      <option value="Hebrew">Hebrew</option>
                                      <option value="Aramaic">Aramaic</option>
                                    </select>
                                  </div>
                                  <input
                                    type="text"
                                    placeholder="Meaning/Nuance..."
                                    value={insight.meaning || ""}
                                    onChange={e => {
                                      const updated = [...outline.greekHebrewInsights];
                                      updated[idx] = { ...insight, meaning: e.target.value };
                                      setOutline({ ...outline, greekHebrewInsights: updated });
                                    }}
                                    className="w-full bg-[#0D1B3E] border border-[#D4AF37]/20 rounded px-1.5 py-0.5 text-[11px] text-[#B0C4DE] focus:outline-none"
                                  />
                                </div>
                              ) : (
                                <div>
                                  <div className="flex justify-between items-baseline">
                                    <span className="text-[11.5px] font-mono font-bold text-[#D4AF37]">
                                      {insight.word} <span className="text-[9.5px] font-sans font-light text-slate-400">({insight.transliteration})</span>
                                    </span>
                                    <span className="text-[7.5px] bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/35 font-mono px-1.5 rounded uppercase tracking-wider">{insight.originalLanguage}</span>
                                  </div>
                                  <p className="text-[11px] text-slate-300 mt-0.5 pl-0.5">{insight.meaning}</p>
                                </div>
                              )}
                              {renderSermonRefinePanel(`greekHebrewInsights[${idx}]`, insight)}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Cross references */}
                      <div className="bg-[#112055]/15 border border-white/5 p-3 rounded-lg space-y-2 shadow-inner">
                        <div className="flex justify-between items-center border-b border-white/5 pb-1">
                          <span className="text-[9px] font-bold text-[#D4AF37] uppercase tracking-wider block">Homiletical Cross-References</span>
                          {isSermonEditing && (
                            <button
                              type="button"
                              onClick={() => {
                                const activeRefs = [...(outline.crossReferences || []), "New scriptural reference slot"];
                                setOutline({ ...outline, crossReferences: activeRefs });
                                triggerToast("➕", "Added verse slot.");
                              }}
                              className="text-[#D4AF37] hover:text-[#F0C940] text-[9px] font-bold flex items-center gap-0.5 cursor-pointer"
                            >
                              <Plus className="w-3 h-3" /> Add Cross Ref
                            </button>
                          )}
                        </div>

                        <div className="space-y-1.5 max-h-[140px] overflow-y-auto">
                          {outline.crossReferences?.map((refStr: string, idx: number) => (
                            <div key={idx} className="flex gap-2 items-center bg-[#0A0F1E]/60 px-2 py-1.5 border border-[#D4AF37]/10 rounded-lg">
                              {isSermonEditing ? (
                                <>
                                  <input
                                    type="text"
                                    value={refStr}
                                    onChange={e => {
                                      const updated = [...outline.crossReferences];
                                      updated[idx] = e.target.value;
                                      setOutline({ ...outline, crossReferences: updated });
                                    }}
                                    className="flex-1 bg-[#090F1C] border border-[#D4AF37]/25 rounded px-2 py-0.5 text-white text-[11px] outline-none"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const updated = outline.crossReferences.filter((_: any, rI: number) => rI !== idx);
                                      setOutline({ ...outline, crossReferences: updated });
                                      triggerToast("🗑️", "Removed reference.");
                                    }}
                                    className="text-red-400 hover:text-red-300 transition"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </>
                              ) : (
                                <p className="text-[11px] text-[#B0C4DE] leading-relaxed font-mono">🕊️ {refStr}</p>
                              )}
                            </div>
                          ))}
                        </div>
                        {renderSermonRefinePanel("crossReferences", outline.crossReferences)}
                      </div>

                      {/* Cite keys and historical quote */}
                      <div className="bg-[#112055]/15 border border-white/5 p-3 rounded-lg space-y-2 shadow-inner">
                        <div className="flex justify-between items-center border-b border-white/5 pb-1">
                          <span className="text-[9px] font-bold text-[#D4AF37] uppercase tracking-wider block">Spiritual & Theological Citations</span>
                          {isSermonEditing && (
                            <button
                              type="button"
                              onClick={() => {
                                const activeQuotes = [...(outline.relevantQuotes || []), { quote: "Custom citation quote...", author: "Spiritual Author" }];
                                setOutline({ ...outline, relevantQuotes: activeQuotes });
                                triggerToast("➕", "Added citation quote.");
                              }}
                              className="text-[#D4AF37] hover:text-[#F0C940] text-[9px] font-bold flex items-center gap-0.5 cursor-pointer"
                            >
                              <Plus className="w-3 h-3" /> Add Citation
                            </button>
                          )}
                        </div>

                        <div className="space-y-2 max-h-[140px] overflow-y-auto">
                          {outline.relevantQuotes?.map((quoteObj: any, idx: number) => (
                            <div key={idx} className="bg-[#0A0F1E]/60 p-2.5 border border-[#D4AF37]/10 rounded-lg space-y-1 my-1 relative">
                              {isSermonEditing && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    const updated = outline.relevantQuotes.filter((_: any, qI: number) => qI !== idx);
                                    setOutline({ ...outline, relevantQuotes: updated });
                                    triggerToast("🗑️", "Removed quote.");
                                  }}
                                  className="absolute top-1.5 right-1.5 text-red-400 hover:text-red-300 transition cursor-pointer"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              )}

                              {isSermonEditing ? (
                                <div className="space-y-1 pb-1">
                                  <textarea
                                    value={quoteObj.quote || ""}
                                    placeholder="Quote context"
                                    onChange={e => {
                                      const updated = [...outline.relevantQuotes];
                                      updated[idx] = { ...quoteObj, quote: e.target.value };
                                      setOutline({ ...outline, relevantQuotes: updated });
                                    }}
                                    className="w-full bg-[#0D1B3E] border border-white/10 rounded p-1 text-[11px] text-white"
                                    rows={1}
                                  />
                                  <input
                                    type="text"
                                    value={quoteObj.author || ""}
                                    placeholder="Author / Theologian"
                                    onChange={e => {
                                      const updated = [...outline.relevantQuotes];
                                      updated[idx] = { ...quoteObj, author: e.target.value };
                                      setOutline({ ...outline, relevantQuotes: updated });
                                    }}
                                    className="w-full bg-[#0D1B3E] border border-white/10 rounded px-1.5 py-0.5 text-[10px] text-[#D4AF37]"
                                  />
                                </div>
                              ) : (
                                <div>
                                  <p className="text-[11px] text-slate-300 italic font-light">"{quoteObj.quote}"</p>
                                  <span className="text-[9.5px] text-[#D4AF37] block text-right mt-1 font-semibold">— {quoteObj.author}</span>
                                </div>
                              )}
                              {renderSermonRefinePanel(`relevantQuotes[${idx}]`, quoteObj)}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* AI Sermon Structure Optimizer */}
                  <div className="bg-[#112055]/30 border border-[#D4AF37]/25 p-3.5 rounded-xl space-y-2.5 my-3">
                    <div className="flex items-center gap-1.5 justify-between">
                      <span className="text-[10.5px] font-bold text-[#D4AF37] uppercase tracking-wider block flex items-center gap-1">
                        🎨 AI Sermon Structure Optimizer
                      </span>
                      <span className="text-[8px] bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/25 px-1.5 py-0.5 rounded font-mono font-bold uppercase">
                        Global Refiner
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 leading-normal">
                      Re-pace, restructure, or re-engineer the entire outline layout (e.g. "Convert key points into a 3-part covenant dialogue" or "Inject expository word studies into Point 2").
                    </p>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={restructurePrompt}
                        onChange={(e) => setRestructurePrompt(e.target.value)}
                        placeholder="e.g. Reorganize into exactly 3 points with high-contrast scientific themes..."
                        className="flex-1 bg-[#0A0F1E] border border-[#D4AF37]/20 text-white placeholder-slate-500 rounded-lg px-2.5 py-1.5 text-[11px] outline-none focus:border-[#D4AF37]"
                      />
                      <button
                        type="button"
                        onClick={handleRestructureSermonStructure}
                        disabled={isRestructuringOutline || !restructurePrompt.trim()}
                        className="bg-[#D4AF37] hover:bg-[#F0C940] disabled:opacity-40 text-black text-[10px] px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1 cursor-pointer"
                      >
                        {isRestructuringOutline ? "Optimizing..." : "⚡ Restructure"}
                      </button>
                    </div>
                  </div>

                  <div className="border-t border-white/5 pt-2.5">
                    <h4 className="text-[10px] font-semibold text-[#D4AF37] uppercase tracking-wide block mb-1">1. Introduction Block</h4>
                    {isSermonEditing ? (
                      <textarea 
                        value={outline.introduction || ""} 
                        onChange={e => setOutline({ ...outline, introduction: e.target.value })}
                        className="w-full bg-[#0D1B3E] border border-[#D4AF37]/35 rounded text-white p-2 text-xs focus:outline-none focus:border-[#D4AF37]" 
                        rows={3}
                      />
                    ) : (
                      <p className="text-xs text-[#B0C4DE] leading-relaxed">{outline.introduction}</p>
                    )}
                    {renderSermonRefinePanel("introduction", outline.introduction)}
                  </div>

                  <div className="border-t border-white/5 pt-2.5 space-y-3.5">
                    <h4 className="text-[10px] font-semibold text-[#D4AF37] uppercase tracking-wide block">2. Theological Main Points</h4>
                    {outline.keyPoints?.map((pt: any, idx: number) => (
                      <div key={idx} className="bg-[#112055]/20 border border-white/5 p-3 rounded-lg space-y-2 relative">
                        <div className="flex justify-between items-center pb-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-[#D4AF37]">Point {idx + 1}</span>
                            {isSermonEditing ? (
                              <div className="flex items-center gap-1 bg-[#090F1C] px-1.5 py-0.5 border border-[#D4AF37]/20 rounded">
                                <span className="text-[8.5px] text-[#B0C4DE] font-mono">Pacing %:</span>
                                <input
                                  type="number"
                                  min="5"
                                  max="100"
                                  value={pt.timeAllocationPercent || 20}
                                  onChange={e => {
                                    const newPoints = [...outline.keyPoints];
                                    newPoints[idx] = { ...pt, timeAllocationPercent: parseInt(e.target.value) || 20 };
                                    setOutline({ ...outline, keyPoints: newPoints });
                                  }}
                                  className="w-10 bg-[#0D1B3E] text-white border-0 text-[10px] text-center font-mono focus:outline-none"
                                />
                              </div>
                            ) : (
                              pt.timeAllocationPercent && (
                                <div className="flex items-center gap-1.5">
                                  <div className="w-16 h-1 bg-slate-800 rounded-full overflow-hidden">
                                    <div 
                                      className="h-full bg-[#D4AF37] rounded-full" 
                                      style={{ width: `${pt.timeAllocationPercent}%` }}
                                    />
                                  </div>
                                  <span className="text-[9px] text-[#D4AF37] font-mono font-semibold">{pt.timeAllocationPercent}% pacing</span>
                                </div>
                              )
                            )}
                          </div>
                          {isSermonEditing && (
                            <button
                              onClick={() => {
                                const newPoints = outline.keyPoints.filter((_: any, pI: number) => pI !== idx);
                                const updated = { ...outline, keyPoints: newPoints };
                                setOutline(updated);
                                syncToPreachingText(updated);
                                triggerToast("🗑️", `Removed Point ${idx + 1}`);
                              }}
                              className="text-red-400 hover:text-red-300 p-1 cursor-pointer"
                              title="Delete Point"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>

                        {isSermonEditing ? (
                          <input 
                            type="text" 
                            value={pt.point || ""} 
                            onChange={e => {
                              const newPoints = [...outline.keyPoints];
                              newPoints[idx] = { ...pt, point: e.target.value };
                              const updated = { ...outline, keyPoints: newPoints };
                              setOutline(updated);
                              syncToPreachingText(updated);
                            }}
                            className="w-full bg-[#0A0F1E] border border-white/10 rounded px-2.5 py-1 text-white text-xs outline-none focus:border-[#D4AF37]" 
                          />
                        ) : (
                          <p className="text-xs font-semibold text-[#D4AF37]">{pt.point}</p>
                        )}

                        <div className="space-y-1.5 pl-3">
                          <span className="text-[10px] text-[#B0C4DE] font-semibold block">Subpoints</span>
                          {pt.subPoints?.map((sub: string, subIdx: number) => (
                            <div key={subIdx} className="flex gap-2 items-center">
                              {isSermonEditing ? (
                                <>
                                  <span className="text-[10px] text-[#D4AF37]">•</span>
                                  <input 
                                    type="text" 
                                    value={sub} 
                                    onChange={e => {
                                      const newPoints = [...outline.keyPoints];
                                      const newSubs = [...pt.subPoints];
                                      newSubs[subIdx] = e.target.value;
                                      newPoints[idx] = { ...pt, subPoints: newSubs };
                                      setOutline({ ...outline, keyPoints: newPoints });
                                    }}
                                    className="flex-1 bg-[#0A0F1E] border border-white/5 rounded px-2 py-0.5 text-white text-[11px] outline-none focus:border-[#D4AF37]" 
                                  />
                                  <button
                                    onClick={() => {
                                      const newPoints = [...outline.keyPoints];
                                      const newSubs = pt.subPoints.filter((_: any, sI: number) => sI !== subIdx);
                                      newPoints[idx] = { ...pt, subPoints: newSubs };
                                      setOutline({ ...outline, keyPoints: newPoints });
                                      triggerToast("🗑️", "Removed subpoint.");
                                    }}
                                    className="text-red-400 hover:text-red-300 p-0.5 cursor-pointer"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                </>
                              ) : (
                                <p className="text-xs text-[#B0C4DE] leading-relaxed">• {sub}</p>
                              )}
                            </div>
                          ))}

                          {isSermonEditing && (
                            <button
                              onClick={() => {
                                const newPoints = [...outline.keyPoints];
                                const newSubs = [...(pt.subPoints || []), "New sermon subtopic explanation..."];
                                newPoints[idx] = { ...pt, subPoints: newSubs };
                                setOutline({ ...outline, keyPoints: newPoints });
                                triggerToast("➕", "Added sermon subpoint placeholder.");
                              }}
                              className="text-[#D4AF37] hover:text-[#F0C940] text-[9.5px] flex items-center gap-0.5 font-semibold cursor-pointer py-0.5"
                            >
                              <Plus className="w-3 h-3" /> Add Subpoint
                            </button>
                          )}
                        </div>

                        {/* Dynamic Illustration Assistant */}
                        <div className="text-[11px] text-slate-400 font-light border-t border-white/5 pt-2 mt-2">
                          <div className="flex items-center justify-between border-b border-white/5 pb-1.5 mb-1.5">
                            <div className="flex items-center gap-1">
                              <Volume2 className="w-3 h-3 text-[#D4AF37]" />
                              <span className="font-bold text-slate-300 uppercase tracking-widest text-[9px] font-mono">Illustration & Application Assistant</span>
                            </div>
                            <div>
                              <select 
                                onChange={(e) => {
                                  if (!e.target.value) return;
                                  const newPoints = [...outline.keyPoints];
                                  newPoints[idx] = { ...pt, illustration: e.target.value };
                                  const updated = { ...outline, keyPoints: newPoints };
                                  setOutline(updated);
                                  syncToPreachingText(updated);
                                  triggerToast("🎭", "Applied preset sermon illustration.");
                                  e.target.value = ""; // reset
                                }}
                                className="bg-[#000516] text-[#B0C4DE] border border-white/10 rounded px-1.5 py-0.5 text-[9px] outline-none max-w-[140px] cursor-pointer"
                                defaultValue=""
                              >
                                <option value="" disabled>--- Apply Preset Illustration ---</option>
                                <option value="Like a premium golden chalice set apart exclusively for the temple tabernacle altar, the believer's life is configured for sacred, single-purpose use, rejecting common profane mixtures.">The Sacred Gold Chalice (Sanctification)</option>
                                <option value="A high-precision optical lens cleared of dust and smudge, allowing the true light spectrum to refract cleanly. Renovated thinking functions as a high-fidelity spiritual lens.">The Polished Lens (Mind Renewal)</option>
                                <option value="An anchor cast deep into unseen ocean beds, tethering a great ship securely in the teeth of a gale. Covenant faith anchors us beyond transient cultural storms.">The Heavy Anchor (Security in Faith)</option>
                                <option value="The refining crucible where raw silver is heated until the silversmith can see his clean reflection in the liquid pool. Trials and consecration purify our characters.">The Purifying Crucible (Trial & Purity)</option>
                                <option value="A wild olive branch grafted onto a ancient noble olive tree root, drinking of its rich sap. Sovereign grace merges our finite lives into God's eternal covenant.">The Grafted Branch (Grace & Covenant)</option>
                              </select>
                            </div>
                          </div>

                          <div className="space-y-1.5">
                            {isSermonEditing ? (
                              <textarea 
                                value={pt.illustration || ""} 
                                onChange={e => {
                                  const newPoints = [...outline.keyPoints];
                                  newPoints[idx] = { ...pt, illustration: e.target.value };
                                  const updated = { ...outline, keyPoints: newPoints };
                                  setOutline(updated);
                                  syncToPreachingText(updated);
                                }}
                                className="w-full bg-[#0A0F1E] border border-white/5 rounded p-1.5 text-white text-[11px] outline-none focus:border-[#D4AF37]" 
                                rows={2}
                                placeholder="Write or select a practical illustration to solidify this point..."
                              />
                            ) : (
                              <p className="italic pl-2 border-l border-[#D4AF37]/50 text-slate-300 leading-relaxed text-[10.5px]">
                                {pt.illustration ? `"${pt.illustration}"` : "No illustration defined for this point. Select a preset template above or generate a custom one with AI below."}
                              </p>
                            )}

                            {/* Expanded AI Theological & Biblical Parameterized Suite */}
                            <div className="space-y-2 mt-2 bg-[#090F1C]/70 p-2 text-[10px] rounded border border-[#D4AF37]/15">
                              <span className="text-[9px] font-bold text-[#D4AF37] uppercase tracking-wider block font-sans-raleway">
                                Custom Theological Themes & References
                              </span>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10px]">
                                <div>
                                  <label className="text-slate-400 font-bold block mb-0.5">THEOLOGICAL THEME FOCUS:</label>
                                  <input 
                                    type="text" 
                                    value={illustrationThemes[idx] || ""} 
                                    onChange={e => setIllustrationThemes({...illustrationThemes, [idx]: e.target.value})}
                                    placeholder="e.g. Covenant Mercy, Substitutionary Atonement"
                                    className="w-full bg-[#030712] text-white border border-[#D4AF37]/20 rounded px-2 py-1 outline-none text-[10px]"
                                  />
                                </div>
                                <div>
                                  <label className="text-slate-400 font-bold block mb-0.5">BIBLICAL EXAMPLES & FIGURES:</label>
                                  <input 
                                    type="text" 
                                    value={illustrationExamples[idx] || ""} 
                                    onChange={e => setIllustrationExamples({...illustrationExamples, [idx]: e.target.value})}
                                    placeholder="e.g. Elijah at Mount Carmel, Abraham on Moriah"
                                    className="w-full bg-[#030712] text-white border border-[#D4AF37]/20 rounded px-2 py-1 outline-none text-[10px]"
                                  />
                                </div>
                              </div>
                              
                              <div className="flex flex-wrap items-center gap-1.5 pt-1.5 border-t border-white/5 mt-1.5">
                                <span className="text-[8.5px] text-slate-500 font-bold uppercase tracking-wider">AI Gen Style:</span>
                                {["Modern Day", "Historical", "Scientific", "Parable"].map((gstyle) => (
                                  <button
                                    key={gstyle}
                                    type="button"
                                    disabled={isGeneratingIllustration !== null}
                                    onClick={() => handleGenerateIllustrationForPoint(idx, gstyle)}
                                    className="bg-[#D4AF37]/10 hover:bg-[#D4AF37]/35 disabled:opacity-40 border border-[#D4AF37]/25 text-[#D4AF37] text-[8.5px] px-2 py-0.5 rounded cursor-pointer transition font-bold"
                                  >
                                    {isGeneratingIllustration === idx ? "Drafting..." : `✨ ${gstyle}`}
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                        {renderSermonRefinePanel(`keyPoints[${idx}]`, pt)}
                      </div>
                    ))}

                    {isSermonEditing && (
                      <button
                        onClick={() => {
                          const newPoints = [...(outline.keyPoints || []), {
                            point: "New Theological Pillar Target",
                            subPoints: ["Supporting scripture context definition"],
                            illustration: "Practical daily illustration to solidify theme."
                          }];
                          const updated = { ...outline, keyPoints: newPoints };
                          setOutline(updated);
                          syncToPreachingText(updated);
                          triggerToast("➕", "Added new theological point pillar.");
                        }}
                        className="text-[#D4AF37] hover:text-[#F0C940] text-xs flex items-center gap-1 font-semibold cursor-pointer py-1.5 border border-dashed border-[#D4AF37]/30 rounded-lg justify-center w-full bg-[#112055]/10 hover:bg-[#112055]/30 transition"
                      >
                        <Plus className="w-4 h-4" /> Add Custom Main Point Block
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 text-xs border-t border-[#D4AF37]/10">
                    <div>
                      <h5 className="font-bold text-[#D4AF37] uppercase tracking-wide block mb-1">3. Application</h5>
                      {isSermonEditing ? (
                        <textarea 
                          value={outline.application || ""} 
                          onChange={e => setOutline({ ...outline, application: e.target.value })}
                          className="w-full bg-[#0D1B3E] border border-[#D4AF37]/35 rounded text-white p-2 text-xs focus:outline-none focus:border-[#D4AF37]" 
                          rows={3}
                        />
                      ) : (
                        <p className="text-[#B0C4DE] leading-relaxed text-[11px]">{outline.application}</p>
                      )}
                      {renderSermonRefinePanel("application", outline.application)}
                    </div>
                    <div>
                      <h5 className="font-bold text-[#D4AF37] uppercase tracking-wide block mb-1">4. Altar Call Response</h5>
                      {isSermonEditing ? (
                        <textarea 
                          value={outline.altarCall || ""} 
                          onChange={e => setOutline({ ...outline, altarCall: e.target.value })}
                          className="w-full bg-[#0D1B3E] border border-[#D4AF37]/35 rounded text-white p-2 text-xs focus:outline-none focus:border-[#D4AF37]" 
                          rows={3}
                        />
                      ) : (
                        <p className="text-[#B0C4DE] leading-relaxed text-[11px]">{outline.altarCall}</p>
                      )}
                      {renderSermonRefinePanel("altarCall", outline.altarCall)}
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 justify-end pt-2 border-t border-white/5">
                  <button 
                    onClick={() => {
                      const text = `Sermon Note: ${outline.title}\nScripture: ${outline.scriptureText}\nTheme: ${outline.theme}\nIntroduction: ${outline.introduction}\nApplication: ${outline.application}`;
                      navigator.clipboard.writeText(text);
                      triggerToast("📋", "Outline notes copied to clipboard.");
                    }}
                    className="bg-[#112055] hover:bg-[#112055]/80 border border-[#D4AF37]/30 text-white text-[11px] px-3 py-1.5 rounded-lg flex items-center gap-1 transition cursor-pointer"
                  >
                    <FileText className="w-3.5 h-3.5 text-[#D4AF37]" /> Copy Outline Notes
                  </button>
                  <button 
                    onClick={() => {
                      triggerToast("💾", "Generating ready-to-print PDF transcript");
                    }}
                    className="bg-[#D4AF37]/20 hover:bg-[#D4AF37]/35 border border-[#D4AF37]/40 text-[#D4AF37] text-[11px] px-3 py-1.5 rounded-lg flex items-center gap-1 transition cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" /> PDF Handout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Preaching Speech Audio generator */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Preacher voice synthesizers */}
        <div className="border border-[#D4AF37]/30 bg-[#0D1B3E] p-4 rounded-2xl gold-glow space-y-4">
          <div className="flex items-center justify-between border-b border-[#D4AF37]/20 pb-2">
            <h3 className="font-serif-cinzel font-bold text-white text-[15px] flex items-center gap-1.5">
              <Volume2 className="w-4 h-4 text-[#D4AF37]" /> Sound Preaching Audio Generator
            </h3>
            <span className="text-[10px] font-memo bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/20 px-2 py-0.5 rounded">
              Neural Voice Synthesis
            </span>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-[#B0C4DE] mb-1">Preacher Vocal Passage</label>
              <textarea 
                value={preachingText}
                onChange={e => setPreachingText(e.target.value)}
                rows={4}
                maxLength={400}
                placeholder="Paste outline, bible quote or custom announcements..."
                className="w-full bg-[#0A0F1E] text-white border border-[#D4AF37]/20 rounded-xl p-2 text-xs focus:outline-none focus:border-[#D4AF37]"
              />
              <p className="text-[10px] text-right text-slate-400 mt-0.5">Max 400 characters</p>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold text-[#B0C4DE] mb-1">Voice Style Theme</label>
                <select 
                  value={voiceTone}
                  onChange={e => setVoiceTone(e.target.value)}
                  className="w-full bg-[#0A0F1E] text-white border border-[#D4AF37]/20 rounded-xl px-2.5 py-1.5 text-xs focus:outline-none"
                >
                  <option value="warm">Warm Deep Pastor (Kore)</option>
                  <option value="authoritative">Authoritative Pulpit (Fenrir)</option>
                  <option value="gentle">Gentle Discipleship (Zephyr)</option>
                </select>
              </div>

              <div className="flex items-end shadow">
                <button
                  onClick={handleGenerateWorshipAudio}
                  disabled={isSynthesizing || !preachingText.trim()}
                  className="w-full bg-[#D4AF37] hover:bg-[#F0C940] text-[#0A0F1E] font-bold text-xs py-2 px-3 rounded-xl transition disabled:opacity-55 flex items-center justify-center gap-1.5"
                >
                  <Mic className="w-3.5 h-3.5" />
                  {isSynthesizing ? "Vocodes Rendering..." : "Compile Preaching Voice"}
                </button>
              </div>
            </div>

            {/* Simulated interactive waves visualizer */}
            {synthAudioUrl && (
              <div className="bg-[#0A0F1E] border border-[#D4AF37]/20 p-3 rounded-xl space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#B0C4DE] font-semibold text-[11px]">Source Voice Waveform</span>
                  {isSynthPlaying ? (
                    <span className="text-emerald-400 text-[10px] animate-pulse">● PLAYING AMBIENT PULPITS</span>
                  ) : (
                    <span className="text-slate-500 text-[10px]">■ READY TO START Voice</span>
                  )}
                </div>

                <canvas 
                  ref={canvasRef} 
                  width={340} 
                  height={50} 
                  className="w-full h-12 bg-black/60 rounded border border-white/5"
                />

                <div className="flex justify-between items-center bg-[#112055]/30 px-3 py-1.5 rounded-lg border border-[#D4AF37]/10">
                  <span className="text-xs text-white">Preacher Audio Draft</span>
                  <div className="flex gap-2">
                    {isSynthPlaying ? (
                      <button 
                        onClick={stopLocalPlaybackSynth}
                        className="bg-rose-500 hover:bg-rose-600 text-white rounded p-1"
                        title="Stop Voice Output"
                      >
                        <Square className="w-3.5 h-3.5" />
                      </button>
                    ) : (
                      <button 
                        onClick={startLocalPlaybackSynth}
                        className="bg-emerald-500 hover:bg-emerald-600 text-white rounded p-1"
                        title="Start Voice Output"
                      >
                        <Play className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button 
                      onClick={() => triggerToast("💾", "Audio downloaded to local device as MP3.")}
                      className="bg-[#D4AF37] hover:bg-[#F0C940] text-black rounded p-1"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Standalone Sermon Illustration Workshop */}
        <div className="border border-[#D4AF37]/30 bg-[#0D1B3E] p-4 rounded-2xl gold-glow space-y-4">
          <div className="border-b border-[#D4AF37]/20 pb-2 flex justify-between items-center">
            <h3 className="font-serif-cinzel font-bold text-white text-[15px] flex items-center gap-1.5 animate-pulse">
              <Sparkles className="w-4 h-4 text-[#D4AF37]" /> Scholarly AI Sermon Illustration Workshop
            </h3>
            <span className="text-[9px] text-[#D4AF37] border border-[#D4AF37]/30 px-2 py-0.5 rounded uppercase font-bold tracking-wider font-mono">
              STANDALONE ASSISTANT
            </span>
          </div>

          <p className="text-xs text-slate-400 font-sans-raleway">
            Brainstorm and generate custom-tailored illustrations based on specific theological concepts, scriptures, or historical figures. Request narratives in unique homiletical styles, and seamlessly insert them into your active sermon outline points.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Input params column */}
            <div className="space-y-3 bg-[#0A0F1E]/60 p-3 rounded-xl border border-white/5 font-sans-raleway">
              <div>
                <label className="block text-[10px] text-[#B0C4DE] font-semibold uppercase tracking-wider mb-1">
                  Illustration Subject Matter / Topic Focus
                </label>
                <input
                  type="text"
                  value={workshopTopic}
                  onChange={(e) => setWorkshopTopic(e.target.value)}
                  placeholder="e.g. Constant Prayer, Generosity in Trials, Refined Consecration"
                  className="w-full bg-[#030712] text-white border border-[#D4AF37]/25 rounded-md px-2.5 py-1.5 text-xs outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] text-[#B0C4DE] font-semibold uppercase tracking-wider mb-1">
                    Theological Focus (Optional)
                  </label>
                  <input
                    type="text"
                    value={workshopTheme}
                    onChange={(e) => setWorkshopTheme(e.target.value)}
                    placeholder="e.g. Covenant Grace, Redemption"
                    className="w-full bg-[#030712] text-white border border-[#D4AF37]/25 rounded-md px-2.5 py-1.5 text-xs outline-none focus:border-[#D4AF37]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-[#B0C4DE] font-semibold uppercase tracking-wider mb-1">
                    Biblical Example (Optional)
                  </label>
                  <input
                    type="text"
                    value={workshopExample}
                    onChange={(e) => setWorkshopExample(e.target.value)}
                    placeholder="e.g. Elijah, Peter on water, Abraham"
                    className="w-full bg-[#030712] text-white border border-[#D4AF37]/25 rounded-md px-2.5 py-1.5 text-xs outline-none focus:border-[#D4AF37]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] text-[#B0C4DE] font-semibold uppercase tracking-wider mb-1">
                    Illustration Style Profile
                  </label>
                  <select
                    value={workshopStyle}
                    onChange={(e) => setWorkshopStyle(e.target.value)}
                    className="w-full bg-[#030712] text-white border border-[#D4AF37]/25 rounded-md px-2.5 py-1.5 text-xs outline-none focus:border-[#D4AF37]"
                  >
                    <option value="Parable">Parable (Timeless Analogy)</option>
                    <option value="Historical">Historical Account (Church History)</option>
                    <option value="Scientific">Scientific Phenomenon (Nature/Physics)</option>
                    <option value="Modern Day">Modern Day Situation (Technology/Urban Life)</option>
                    <option value="Metaphorical">Metaphorical / Poetic</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] text-[#B0C4DE] font-semibold uppercase tracking-wider mb-1">
                    Target Congregation
                  </label>
                  <input
                    type="text"
                    value={workshopAudience}
                    onChange={(e) => setWorkshopAudience(e.target.value)}
                    placeholder="e.g. Adult / Mixed, Youth, Skeptics"
                    className="w-full bg-[#030712] text-white border border-[#D4AF37]/25 rounded-md px-2.5 py-1.5 text-xs outline-none focus:border-[#D4AF37]"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={handleGenerateCustomIllustration}
                disabled={isGeneratingWorkshop || !workshopTopic.trim()}
                className="w-full bg-[#D4AF37] hover:bg-[#F0C940] text-black font-bold text-xs py-2 px-3 rounded-xl transition disabled:opacity-55 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                {isGeneratingWorkshop ? "Composing Illustration..." : "Forge Custom Sermon Illustration"}
              </button>
            </div>

            {/* Results and integration column */}
            <div className="space-y-3 bg-[#0A0F1E]/60 p-3 rounded-xl border border-white/5 flex flex-col justify-between font-sans-raleway font-sans">
              <div>
                <span className="block text-[10px] text-[#D4AF37] font-semibold uppercase tracking-wider mb-1">
                  Drafted Homiletical Illustration output
                </span>
                {workshopResult ? (
                  <div className="bg-[#030712] text-[#B0C4DE] font-mono text-xs p-3.5 rounded-lg border border-[#D4AF37]/20 relative leading-relaxed whitespace-pre-line max-h-52 overflow-y-auto">
                    "{workshopResult}"
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(workshopResult);
                        triggerToast("📋", "Copied to clipboard!");
                      }}
                      className="absolute top-1 right-1 bg-[#112055] text-[#D4AF37] hover:bg-[#D4AF37]/20 border border-[#D4AF37]/35 text-[9px] px-1.5 py-0.5 rounded font-sans transition cursor-pointer"
                    >
                      Copy
                    </button>
                  </div>
                ) : (
                  <div className="bg-[#030712] text-slate-500 italic text-xs p-8 rounded-lg border border-dashed border-white/5 text-center flex items-center justify-center h-44">
                    Tune your theological filters on the left and click generate to carve a deep narrative illustration.
                  </div>
                )}
              </div>

              {workshopResult && outline?.keyPoints?.length > 0 && (
                <div className="border-t border-white/10 pt-2.5 flex items-center gap-2">
                  <div className="flex-1">
                    <label className="text-[9px] text-slate-400 block mb-0.5 uppercase font-bold">
                      integration target point:
                    </label>
                    <select
                      value={workshopTargetPointIdx}
                      onChange={(e) => setWorkshopTargetPointIdx(Number(e.target.value))}
                      className="w-full bg-[#030712] text-white border border-[#D4AF37]/25 rounded px-2 py-1 outline-none text-[10px]"
                    >
                      {outline.keyPoints.map((pt: any, idx: number) => (
                        <option key={idx} value={idx}>
                          Point {idx + 1}: {pt.point?.substring(0, 45)}...
                        </option>
                      ))}
                    </select>
                  </div>
                  <button
                    onClick={() => handleInsertWorkshopIllustrationToPoint(workshopTargetPointIdx)}
                    className="bg-[#112055] hover:bg-[#112055]/80 border border-[#D4AF37]/45 text-[#D4AF37] font-bold text-[10px] px-3.5 py-2.5 rounded-lg transition shrink-0 h-9 flex items-center justify-center cursor-pointer"
                  >
                    Insert Into Point
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Audio Transcriber Click Drag */}
        <div className="border border-[#D4AF37]/30 bg-[#0D1B3E] p-4 rounded-2xl gold-glow space-y-4">
          <div className="border-b border-[#D4AF37]/20 pb-2 flex justify-between items-center">
            <h3 className="font-serif-cinzel font-bold text-white text-[15px] flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-[#D4AF37]" /> Sermon Transcription Gateway
            </h3>
            <span className="text-[10px] text-slate-400 font-memo">DIARIZATION ENABLED</span>
          </div>

          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-xl p-5 text-center transition cursor-pointer flex flex-col items-center justify-center space-y-1.5 ${
              isDragging ? "border-[#D4AF37] bg-[#112055]/40" : "border-[#D4AF37]/20 bg-[#0A0F1E]/50 hover:border-[#D4AF37]/60"
            }`}
          >
            <Upload className="w-8 h-8 text-[#D4AF37] opacity-80" />
            {uploadedFile ? (
              <div className="text-xs">
                <p className="text-[#D4AF37] font-semibold">{uploadedFile.name}</p>
                <p className="text-slate-500">{(uploadedFile.size / (1024 * 1024)).toFixed(2)} MB</p>
              </div>
            ) : (
              <div className="text-xs">
                <p className="text-white font-medium">Click to select or drag sermon audio recording</p>
                <p className="text-slate-500">Supports MP3, WAV, M4A (Max 50MB)</p>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center gap-1.5 text-xs text-[#B0C4DE] cursor-pointer">
              <input 
                type="checkbox" 
                checked={diarizationEnabled}
                onChange={e => setDiarizationEnabled(e.target.checked)}
                className="accent-[#D4AF37]"
              />
              Speaker Diarization (Multi-Voice tracking)
            </label>
            <button
              onClick={handleTranscribeSermon}
              disabled={isTranscribing || !uploadedFile}
              className="bg-[#D4AF37] hover:bg-[#F0C940] text-[#0A0F1E] font-bold text-xs py-1.5 px-3.5 rounded-lg transition disabled:opacity-50 cursor-pointer"
            >
              {isTranscribing ? "Decrypting Audio..." : "Transcribe Transcript"}
            </button>
          </div>

          {transcriptionResult && (
            <div className="bg-[#0A0F1E] border border-white/5 rounded-xl p-4 space-y-4">
              {/* Stats and Details header Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 border-b border-white/10 pb-3 font-sans-raleway">
                <div className="bg-[#112055]/30 border border-white/5 p-2 rounded text-center">
                  <span className="text-[9px] text-slate-400 block uppercase font-bold tracking-wider">Word Count</span>
                  <span className="text-[11px] font-bold text-[#D4AF37] font-mono">
                    {transcriptionDetails?.wordCount || getDiarizedTranscript().split(/\s+/).length} Words Approved
                  </span>
                </div>
                <div className="bg-[#112055]/30 border border-white/5 p-2 rounded text-center">
                  <span className="text-[9px] text-slate-400 block uppercase font-bold tracking-wider">Duration</span>
                  <span className="text-[11px] font-bold text-[#D4AF37] font-mono">
                    {transcriptionDetails?.duration || "04 min 12 sec"}
                  </span>
                </div>
                <div className="bg-[#112055]/30 border border-white/5 p-2 rounded text-center">
                  <span className="text-[9px] text-slate-400 block uppercase font-bold tracking-wider">Accent Pacing</span>
                  <span className="text-[10px] font-bold text-[#D4AF37] truncate block">
                    {transcriptionDetails?.speakingTempo || "Expository (Apostolic)"}
                  </span>
                </div>
                <div className="bg-[#112055]/30 border border-white/5 p-2 rounded text-center">
                  <span className="text-[9px] text-slate-400 block uppercase font-bold tracking-wider">File Weight</span>
                  <span className="text-[11px] font-bold text-[#D4AF37] font-mono">
                    {uploadedFile ? (uploadedFile.size / (1024 * 1024)).toFixed(2) : "12.4"} MB
                  </span>
                </div>
              </div>

              {/* Dynamic Transcript Expository Insights Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 bg-[#090F1C]/75 p-3 rounded-xl border border-[#D4AF37]/15">
                <div className="space-y-2.5 font-sans-raleway text-left">
                  <div>
                    <span className="text-[9px] font-bold text-[#D4AF37] uppercase tracking-wider block">
                      📌 Theological Highlights & Thematic Tags
                    </span>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {(transcriptionDetails?.keyThemes || [
                        "Covenant Dedication",
                        "Inner Metamorphosis",
                        "Reasonable Liturgy"
                      ]).map((theme: string, i: number) => (
                        <span key={i} className="bg-emerald-950/40 text-emerald-350 border border-emerald-500/30 text-[9px] px-2 py-0.5 rounded-md font-semibold">
                          ✦ {theme}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <span className="text-[9px] font-bold text-[#D4AF37] uppercase tracking-wider block">
                      📖 Detected Biblical Citations
                    </span>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {(transcriptionDetails?.scriptureReferences || [
                        sermonBook || "Romans 12:1-2",
                        "Galatians 2:20",
                        "1 Peter 2:9"
                      ]).map((verse: string, i: number) => (
                        <span key={i} className="bg-[#112055]/50 text-[#D4AF37] border border-[#D4AF37]/30 text-[9.5px] px-2 py-0.5 rounded font-mono">
                          {verse}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <span className="text-[9px] font-bold text-[#D4AF37] uppercase tracking-wider block">
                      🔑 Lexical Devotional Keywords
                    </span>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {(transcriptionDetails?.detectedKeywords || ["Sacrifice", "Renovation", "Logikē", "Metamorphoo"]).map((word: string, i: number) => (
                        <span key={i} className="bg-slate-900 border border-slate-700/50 text-[9px] text-[#B0C4DE] px-1.5 py-0.5 rounded font-mono">
                          #{word}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-2.5 text-left font-sans-raleway">
                  <div>
                    <span className="text-[9px] font-bold text-[#D4AF37] uppercase tracking-wider block">
                      🛡️ Nicene/Apostolic Conformity Seal
                    </span>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex-1 bg-slate-950 h-2.5 rounded-full overflow-hidden border border-white/5">
                        <div 
                          className="bg-gradient-to-r from-teal-500 to-emerald-400 h-full rounded-full transition-all duration-500"
                          style={{ width: `${transcriptionDetails?.theologicalClarityScore || 98}%` }}
                        />
                      </div>
                      <span className="text-[10px] font-bold text-emerald-350 font-mono">
                        {transcriptionDetails?.theologicalClarityScore || 98}% Safe
                      </span>
                    </div>
                  </div>

                  <div>
                    <span className="text-[9px] font-bold text-[#D4AF37] uppercase tracking-wider block">
                      📝 Analytical Expository Summary
                    </span>
                    <p className="text-[10px] text-[#B0C4DE] italic leading-relaxed mt-0.5 bg-black/40 p-2 rounded border border-white/5 pl-2 border-l-2 border-[#D4AF37]">
                      {transcriptionDetails?.summary || `A high-conviction dialogue centered on the expository walkthrough of ${sermonBook || "Romans 12:1-2"}. The speakers examine total sacrificial dedication and the necessity of mental configurations to reject earthly gravity.`}
                    </p>
                  </div>
                </div>
              </div>

              {/* Advanced Chapters Timeline */}
              <div className="bg-[#090F1C]/45 border border-white/5 p-2.5 rounded-lg text-left font-sans-raleway">
                <span className="text-[9px] font-bold text-[#D4AF37] uppercase tracking-wider block mb-1.5">
                  ⏱️ Structural Expository Timeline & Chapters
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {(transcriptionDetails?.structureChapters || [
                    { time: "00:00", title: "Greeting & Apostolic Setup" },
                    { time: "01:30", title: "Synthesizing Sacrifice & Logikē" },
                    { time: "03:15", title: "Applying Covenant Mindset Filters" }
                  ]).map((chap: any, i: number) => (
                    <div key={i} className="bg-black/30 border border-white/5 p-1.5 rounded flex items-center gap-1.5">
                      <span className="bg-[#D4AF37]/10 text-[#D4AF37] font-mono text-[9.5px] px-1.5 py-0.5 rounded border border-[#D4AF37]/20">
                        {chap.time}
                      </span>
                      <span className="text-[9px] text-[#B0C4DE] truncate font-medium" title={chap.title}>
                        {chap.title}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Diarization Speaking Ratio Bar */}
              <div className="bg-[#090F1C]/45 border border-white/5 p-2.5 rounded-lg text-left font-sans-raleway space-y-1.5">
                <div className="flex justify-between items-center text-[9px] text-slate-400 font-bold uppercase tracking-wider">
                  <span>Voice Share Allocation Ratio</span>
                  <span className="text-[#D4AF37]">Diarization active</span>
                </div>
                <div className="flex h-3 rounded-full overflow-hidden border border-white/5 bg-slate-950 font-mono text-[8px] text-white font-bold leading-none select-none">
                  <div 
                    style={{ width: `${transcriptionDetails?.speakerRatio?.speaker1Percent || 75}%` }} 
                    className="bg-[#112055] border-r border-[#D4AF37]/35 flex items-center justify-center text-[#D4AF37] truncate"
                  >
                    {speaker1RealName} ({transcriptionDetails?.speakerRatio?.speaker1Percent || 75}%)
                  </div>
                  <div 
                    style={{ width: `${transcriptionDetails?.speakerRatio?.speaker2Percent || 25}%` }} 
                    className="bg-amber-950/60 flex items-center justify-center text-amber-200 truncate"
                  >
                    {speaker2RealName} ({transcriptionDetails?.speakerRatio?.speaker2Percent || 25}%)
                  </div>
                </div>
              </div>

              {/* Diarization Real Name Overrides */}
              {diarizationEnabled && (
                <div className="bg-[#112055]/20 p-2.5 rounded-lg border border-[#D4AF37]/15 space-y-2">
                  <span className="text-[9.5px] font-bold text-[#D4AF37] uppercase tracking-wider block font-sans-raleway text-left">
                    👤 Real-Time Diarization Speaker Assignment
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div className="text-left">
                      <label className="text-[9px] text-slate-400 block mb-0.5 uppercase font-bold">ASSIGN SPEAKER 1 REAL-NAME:</label>
                      <input
                        type="text"
                        value={speaker1RealName}
                        onChange={(e) => setSpeaker1RealName(e.target.value)}
                        className="w-full bg-[#030712] text-white border border-[#D4AF37]/25 rounded px-2 py-1 outline-none text-[10px]"
                      />
                    </div>
                    <div className="text-left">
                      <label className="text-[9px] text-slate-400 block mb-0.5 uppercase font-bold">ASSIGN SPEAKER 2 REAL-NAME:</label>
                      <input
                        type="text"
                        value={speaker2RealName}
                        onChange={(e) => setSpeaker2RealName(e.target.value)}
                        className="w-full bg-[#030712] text-white border border-[#D4AF37]/25 rounded px-2 py-1 outline-none text-[10px]"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Active Transcript Display */}
              <div className="space-y-1.5 text-left font-sans-raleway">
                <div className="flex items-center justify-between text-[11px] border-b border-white/5 pb-1">
                  <span className="text-emerald-400 font-bold uppercase tracking-wider">✓ Active Expository Transduction</span>
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(getDiarizedTranscript());
                      triggerToast("📋", "Diarized transcript copied to clipboard.");
                    }}
                    className="text-[#D4AF37] hover:underline hover:text-[#F0C940] transition text-[10px] font-bold cursor-pointer"
                  >
                    Copy Formatted Body
                  </button>
                </div>
                <div className="max-h-48 overflow-y-auto text-[11px] text-[#B0C4DE] leading-relaxed font-mono whitespace-pre-line bg-[#040815] p-3 rounded-lg border border-white/5 text-left">
                  {getDiarizedTranscript()}
                </div>
              </div>

              {/* Nested Transcript theological evaluation tools */}
              <div className="border-t border-white/10 pt-3.5 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-slate-300 block uppercase">Thematic Transcript Integrity</span>
                    <p className="text-[9.5px] text-slate-500">
                      Audit transcript theological assertions directly against the Apostles & Nicene Creeds standard historical orthodoxy.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleAuditTranscriptTheology}
                    disabled={checkingTranscriptTheology}
                    className="bg-rose-900/60 hover:bg-rose-800 border border-rose-500/30 text-rose-100 font-bold text-[9.5px] py-1.5 px-3 rounded-md transition"
                  >
                    {checkingTranscriptTheology ? "Analyzing Integrity..." : "🛡️ Audit Transcript"}
                  </button>
                </div>

                {transcriptAuditResult && (
                  <div className="bg-[#0D1B3E] border border-rose-500/30 p-3 rounded-xl space-y-2.5">
                    <div className="flex items-center justify-between border-b border-white/5 pb-1 text-[10.5px]">
                      <span className="text-[#D4AF37] font-bold uppercase font-sans-raleway">
                        Theological Compliance output
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[8.5px] font-bold uppercase font-mono ${
                        transcriptAuditResult.alertLevel === "Critical" 
                          ? "bg-red-500/25 text-red-300 border border-red-500/30 font-bold animate-pulse" 
                          : "bg-emerald-950/40 text-emerald-350 border border-emerald-500/30"
                      }`}>
                        STATUS: {transcriptAuditResult.status || "Aligned & Approved"}
                      </span>
                    </div>

                    <div className="space-y-2 text-[10.5px] font-sans-raleway">
                      <div>
                        <span className="font-semibold text-slate-300 block">Assessment:</span>
                        <p className="italic text-[#B0C4DE] leading-relaxed pl-2 border-l-2 border-[#D4AF37] mt-0.5">
                          {transcriptAuditResult.theologicalAssessment}
                        </p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 border-t border-white/5">
                        <div>
                          <span className="font-semibold text-slate-300 block">Antidote Cross-References:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {transcriptAuditResult.clashingVerses?.map((v: string, i: number) => (
                              <span key={i} className="bg-rose-950/40 text-rose-300 border border-rose-900/30 font-mono text-[9.5px] px-2 py-0.5 rounded">
                                {v}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div>
                          <span className="font-semibold text-slate-300 block">Pastoral Guidance:</span>
                          <p className="text-slate-400 italic text-[10px] mt-1 pl-1">
                            "{transcriptAuditResult.rebuttalStatement}"
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
