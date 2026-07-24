import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUser, useAuth } from "../../lib/clerkClient";
import Navbar from "../Navbar";
import { Button } from "../ui/button";
import { jsPDF } from "jspdf";
import { 
  Dumbbell, 
  Download, 
  ChevronRight, 
  Activity, 
  ArrowLeft,
  Calendar,
  Zap,
  Flame,
  Award
} from "lucide-react";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://127.0.0.1:5001";

const YourPlan = () => {
  const navigate = useNavigate();
  const { user: clerkUser, isLoaded: userLoaded } = useUser();
  const { isSignedIn, isLoaded: authLoaded } = useAuth();
  
  const [plans, setPlans] = useState(() => {
    try {
      const cached = localStorage.getItem("stayfit_cached_plans");
      return cached ? JSON.parse(cached) : [];
    } catch (e) {
      return [];
    }
  });
  const [loading, setLoading] = useState(() => {
    try {
      const cached = localStorage.getItem("stayfit_cached_plans");
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed && parsed.length > 0) return false;
      }
    } catch (e) {}
    return true;
  });
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("workout");
  const [expandedDay, setExpandedDay] = useState(null);
  const [expandedDietDay, setExpandedDietDay] = useState(null);

  const latestPlan = plans[0] || null;

  // Fetch plans history for the user
  useEffect(() => {
    if (authLoaded && !isSignedIn) {
      navigate("/");
      return;
    }

    if (clerkUser) {
      const fetchHistory = async () => {
        try {
          const res = await fetch(`${BACKEND_URL}/api/plans?userId=${clerkUser.id}`);
          if (!res.ok) throw new Error("Failed to fetch plan history.");
          const data = await res.json();
          setPlans(data);
          try {
            localStorage.setItem("stayfit_cached_plans", JSON.stringify(data));
          } catch (e) {}
          
          // If no plan history exists, redirect new user to start the assessment
          if (!data || data.length === 0) {
            if (!localStorage.getItem("stayfit_onboarding_data")) {
              navigate("/");
              return;
            }
          }
        } catch (err) {
          console.error("Error fetching history:", err);
          setError(err.message);
        } finally {
          setLoading(false);
        }
      };
      fetchHistory();
    }
  }, [clerkUser, authLoaded, isSignedIn, navigate]);

  function parseMarkdownToHtml(text) {
    text = String(text);
    text = text.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
    text = text.replace(/\n\* (.*?)\n/g, "<ul><li>$1</li></ul>");
    text = text.replace(/\n/g, "<br>");
    return text;
  }

  const parseMarkdownToText = (markdown) => {
    markdown = String(markdown);
    return markdown
      .replace(/\*\*(.*?)\*\*/g, "$1")
      .replace(/\*(.*?)\*/g, "$1")
      .replace(/```([\s\S]*?)```/g, "$1")
      .replace(/<\/?[^>]+(>|$)/g, "")
      .replace(/\n/g, "\n");
  };

  const generateWoPdf = () => {
    if (!latestPlan) return;
    const formattedMarkdown = typeof latestPlan.workoutPlan === "string" ? parseMarkdownToText(latestPlan.workoutPlan) : "";
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });
    const margin = 15;
    const pageHeight = pdf.internal.pageSize.getHeight();
    const pageWidth = pdf.internal.pageSize.getWidth() - margin * 2;
    const lineHeight = 7;
    let y = margin;
    const textLines = pdf.splitTextToSize(formattedMarkdown, pageWidth);
    
    pdf.setFontSize(16);
    pdf.text("STAYFIT AI - YOUR WORKOUT PLAN", margin, y);
    y += 15;
    pdf.setFontSize(10);

    textLines.forEach((line) => {
      if (y + lineHeight > pageHeight - margin) {
        pdf.addPage();
        y = margin;
      }
      pdf.text(line, margin, y);
      y += lineHeight;
    });
    pdf.save(`StayFit_WorkoutPlan.pdf`);
  };

  const generateDietPdf = () => {
    if (!latestPlan) return;
    const formattedMarkdown = typeof latestPlan.dietPlan === "string" ? parseMarkdownToText(latestPlan.dietPlan) : "";
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });
    const margin = 15;
    const pageHeight = pdf.internal.pageSize.getHeight();
    const pageWidth = pdf.internal.pageSize.getWidth() - margin * 2;
    const lineHeight = 7;
    let y = margin;
    const textLines = pdf.splitTextToSize(formattedMarkdown, pageWidth);
    
    pdf.setFontSize(16);
    pdf.text("STAYFIT AI - YOUR WEEKLY DIET PLAN", margin, y);
    y += 15;
    pdf.setFontSize(10);

    textLines.forEach((line) => {
      if (y + lineHeight > pageHeight - margin) {
        pdf.addPage();
        y = margin;
      }
      pdf.text(line, margin, y);
      y += lineHeight;
    });
    pdf.save(`StayFit_DietPlan.pdf`);
  };

  const renderWorkoutPlanReact = (text) => {
    if (!text) return null;
    const lines = text.split("\n");
    
    const days = [];
    let currentDay = null;
    let currentExercise = null;
    
    const cleanStr = (s) => {
      if (!s) return "";
      return s
        .replace(/^\d+[\.\-\)]\s*/, "")
        .replace(/^[\*\-\s\:\;]+/, "")
        .replace(/[\:\;\,\-\s]+$/, "")
        .replace(/\*\*/g, "")
        .trim();
    };

    const flushExercise = () => {
      if (currentDay && currentExercise && currentExercise.name) {
        const exists = currentDay.exercises.some(e => e.name.toLowerCase() === currentExercise.name.toLowerCase());
        if (!exists) {
          currentDay.exercises.push({
            name: currentExercise.name,
            details: Array.isArray(currentExercise.details) 
              ? currentExercise.details.filter(Boolean).join(" • ") 
              : (currentExercise.details || "")
          });
        }
        currentExercise = null;
      }
    };

    const flushDay = () => {
      flushExercise();
      if (currentDay && currentDay.exercises.length > 0) {
        days.push(currentDay);
        currentDay = null;
      }
    };

    const isDayHeader = (txt) => {
      const clean = txt.replace(/#/g, "").replace(/\*\*|\*/g, "").trim().toLowerCase();
      const nonDayKeywords = ["main workout", "warm-up", "warmup", "cool-down", "cooldown", "tips", "notes", "guidelines", "summary", "overview"];
      if (nonDayKeywords.some(kw => clean.includes(kw))) {
        return false;
      }
      if (/day\s*\d+/i.test(clean) || /day\s+[ivxlcdm]+/i.test(clean)) return true;
      if (/^day\s+/i.test(clean)) return true;
      if (/workout\s*\d+/i.test(clean) || /session\s*\d+/i.test(clean)) return true;
      return false;
    };

    for (let rawLine of lines) {
      const trimmed = rawLine.trim();
      if (!trimmed) continue;
      
      const cleanLine = trimmed.replace(/\*\*/g, "").trim();
      const lowerLine = cleanLine.toLowerCase();

      if (
        trimmed.startsWith("#") || 
        lowerLine.startsWith("day ") || 
        trimmed.startsWith("**Day") ||
        trimmed.startsWith("**DAY")
      ) {
        if (isDayHeader(trimmed)) {
          flushDay();
          let headerText = trimmed.replace(/#/g, "").replace(/\*\*/g, "").trim();
          currentDay = {
            header: headerText,
            exercises: []
          };
          continue;
        }
      }

      if (!currentDay) continue;

      if (trimmed.startsWith("####") || trimmed.startsWith("###")) {
        continue;
      }

      if (trimmed.startsWith("|")) {
        const cols = trimmed.split("|").map(c => c.trim()).filter(Boolean);
        if (cols.length >= 2) {
          const nameCol = cols[0].replace(/\*\*/g, "").trim();
          if (nameCol.toLowerCase() !== "exercise" && !nameCol.includes("---")) {
            flushExercise();
            const exName = cleanStr(nameCol);
            const restCols = cols.slice(1).map(c => c.replace(/\*\*/g, "").trim()).filter(c => c && c !== "---");
            if (exName) {
              currentDay.exercises.push({
                name: exName,
                details: restCols.join(" • ")
              });
            }
          }
        }
        continue;
      }

      const numMatch = trimmed.match(/^(\d+)[\.\)]\s+(.*)/);
      if (numMatch) {
        flushExercise();
        const content = numMatch[2].trim();
        const colonIdx = content.indexOf(":");
        if (colonIdx !== -1) {
          const exName = cleanStr(content.substring(0, colonIdx));
          const exDetails = content.substring(colonIdx + 1).trim().replace(/\*\*/g, "");
          currentExercise = { name: exName, details: [exDetails] };
        } else {
          const exName = cleanStr(content);
          currentExercise = { name: exName, details: [] };
        }
        continue;
      }

      if (currentExercise && (trimmed.startsWith("*") || trimmed.startsWith("-"))) {
        const bulletText = trimmed.replace(/^[\*\-\s]+/, "").trim().replace(/\*\*/g, "");
        const lowerBullet = bulletText.toLowerCase();
        if (
          lowerBullet.startsWith("sets:") || 
          lowerBullet.startsWith("reps:") || 
          lowerBullet.startsWith("form cue:") || 
          lowerBullet.startsWith("note:") ||
          lowerBullet.startsWith("tempo:") ||
          lowerBullet.startsWith("rest:")
        ) {
          currentExercise.details.push(bulletText);
          continue;
        }
      }

      if (trimmed.startsWith("*") || trimmed.startsWith("-")) {
        flushExercise();
        const bulletContent = trimmed.replace(/^[\*\-\s]+/, "").trim();
        const colonIdx = bulletContent.indexOf(":");
        if (colonIdx !== -1) {
          const exName = cleanStr(bulletContent.substring(0, colonIdx));
          const exDetails = bulletContent.substring(colonIdx + 1).trim().replace(/\*\*/g, "");
          if (exName) {
            currentDay.exercises.push({
              name: exName,
              details: exDetails
            });
          }
        } else {
          const exName = cleanStr(bulletContent);
          if (exName && exName.length > 2) {
            currentExercise = { name: exName, details: [] };
          }
        }
        continue;
      }

      const colonIdx = trimmed.indexOf(":");
      if (colonIdx !== -1) {
        const potentialName = cleanStr(trimmed.substring(0, colonIdx));
        const potentialDetails = trimmed.substring(colonIdx + 1).trim().replace(/\*\*/g, "");
        if (potentialName && potentialName.length > 2 && !potentialName.toLowerCase().includes("warm-up") && !potentialName.toLowerCase().includes("cool-down")) {
          flushExercise();
          currentDay.exercises.push({
            name: potentialName,
            details: potentialDetails
          });
        }
      }
    }
    flushDay();

    if (days.length === 0) {
      return (
        <div className="prose prose-invert max-w-none text-zinc-200 leading-relaxed bg-[#000000] p-6 rounded-xl border border-zinc-900 overflow-y-auto flex-1 select-text min-h-[400px]">
          <div 
            className="text-sm md:text-base space-y-4 font-sans whitespace-pre-wrap text-zinc-200"
            dangerouslySetInnerHTML={{ 
              __html: parseMarkdownToHtml(text) 
            }} 
          />
        </div>
      );
    }

    return (
      <div className="space-y-3">
        {days.map((day, dayIdx) => {
          const isOpen = expandedDay === dayIdx;
          return (
            <div 
              key={dayIdx} 
              className={`rounded-2xl border transition-all duration-300 overflow-hidden ${
                isOpen 
                  ? "border-[#a3e635] bg-[#a3e635] shadow-lg shadow-[#a3e635]/10" 
                  : "border-zinc-900/80 bg-zinc-950/20 hover:border-zinc-800 hover:bg-zinc-950/40"
              }`}
            >
              <button 
                onClick={() => setExpandedDay(isOpen ? -1 : dayIdx)}
                className="w-full flex items-center justify-between px-6 py-6 cursor-pointer group text-left"
              >
                <div className="flex items-center gap-4.5 min-w-0">
                  <div className={`w-11 h-11 rounded-full flex items-center justify-center border transition-all duration-300 flex-shrink-0 ${
                    isOpen 
                      ? "bg-black border-transparent text-[#a3e635]" 
                      : "bg-zinc-900/60 border-zinc-800 text-zinc-400 group-hover:bg-[#a3e635]/10 group-hover:text-[#a3e635] group-hover:border-[#a3e635]/30"
                  }`}>
                    <ChevronRight className={`w-5 h-5 transition-transform duration-300 ${isOpen ? "rotate-90" : "rotate-0"}`} />
                  </div>
                  <span className={`text-base md:text-lg font-black tracking-tight transition-colors duration-300 truncate ${
                    isOpen ? "text-black" : "text-zinc-200 group-hover:text-white"
                  }`}>
                    {day.header}
                  </span>
                </div>
                
                <div className="flex items-center gap-3 flex-shrink-0 ml-2">
                  {isOpen ? (
                    <span className="text-xs text-zinc-800 hover:text-black transition-colors duration-200 font-extrabold uppercase tracking-wider">
                      Collapse
                    </span>
                  ) : (
                    <span className="text-xs md:text-sm font-bold text-zinc-500 group-hover:text-zinc-400 transition-colors duration-200 uppercase tracking-wider">
                      {day.exercises.length} Exercises
                    </span>
                  )}
                </div>
              </button>
              
              <div className={`transition-all duration-300 ease-in-out overflow-hidden ${
                isOpen ? "max-h-[1200px] opacity-100" : "max-h-0 opacity-0"
              }`}>
                <div className="border-t border-black/10 bg-black/5">
                  {day.exercises.map((ex, idx) => (
                    <div 
                      key={idx} 
                      className={`flex items-center justify-between px-6 py-4.5 hover:bg-black/5 transition-colors duration-150 border-b border-black/5 last:border-b-0`}
                    >
                      <div className="flex items-start gap-4 min-w-0 w-full">
                        <span className="text-xs md:text-sm font-black text-zinc-700 w-6 text-center flex-shrink-0 mt-0.5">{idx + 1}</span>
                        <div className="flex flex-col min-w-0 pr-2">
                          <span className="text-sm md:text-base text-zinc-900 font-extrabold leading-snug">
                            {ex.name}
                          </span>
                          {ex.details && (
                            <span className="text-xs md:text-sm text-zinc-800 font-bold leading-relaxed mt-0.5 opacity-90">
                              {ex.details}
                            </span>
                          )}
                        </div>
                      </div>
                      <button 
                        onClick={() => navigate(`/howtodo?search=${encodeURIComponent(cleanStr(ex.name))}`)}
                        className="ml-4 px-3.5 py-2 bg-black hover:bg-zinc-900 text-white font-extrabold text-[10px] md:text-xs uppercase tracking-wider rounded-xl transition-all duration-200 cursor-pointer flex-shrink-0"
                      >
                        How to do
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderDietPlanReact = (text) => {
    if (!text) return null;
    const lines = text.split("\n");
    
    const days = [];
    let dailyTargets = [];
    let currentSection = ""; // "targets" or "day"
    let currentDayHeader = "";
    let dayMeals = [];
    
    const isDayHeader = (txt) => {
      const clean = txt.replace(/#/g, "").replace(/\*\*|\*/g, "").trim().toLowerCase();
      const weekDays = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
      return weekDays.includes(clean);
    };
    
    const flushDay = () => {
      if (currentDayHeader && dayMeals.length > 0) {
        const title = currentDayHeader.replace(/#/g, "").replace(/\*\*|\*/g, "").trim();
        
        let totalsText = "";
        const filteredMeals = dayMeals.filter(m => {
          const lower = m.toLowerCase();
          if (lower.includes("nutrient totals") || lower.includes("day totals") || lower.includes("day nutrient totals")) {
            totalsText = m.replace(/\*\*|\*/g, "").replace(/Day Nutrient Totals:?/i, "").replace(/Nutrient Totals:?/i, "").trim();
            return false;
          }
          return true;
        });
        
        days.push({ 
          header: title, 
          meals: filteredMeals, 
          totals: totalsText 
        });
        dayMeals = [];
      }
    };
    
    for (let line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;
      
      const cleanLower = trimmed.replace(/#/g, "").replace(/\*\*|\*/g, "").trim().toLowerCase();
      
      if (cleanLower.includes("daily targets") || cleanLower.includes("daily nutrition targets") || cleanLower.includes("nutrient targets") || cleanLower.includes("daily nutrition target")) {
        flushDay();
        currentSection = "targets";
        currentDayHeader = "";
        continue;
      }
      
      if (isDayHeader(trimmed)) {
        flushDay();
        currentSection = "day";
        currentDayHeader = trimmed;
        continue;
      }
      
      if (currentSection === "targets") {
        if (trimmed.startsWith("*") || trimmed.startsWith("-") || trimmed.includes(":")) {
          dailyTargets.push(trimmed.replace(/^[\*\-\s]+/, "").trim());
        }
      } else if (currentSection === "day" && currentDayHeader) {
        if (trimmed.startsWith("*") || trimmed.startsWith("-") || trimmed.toLowerCase().startsWith("meal") || trimmed.toLowerCase().startsWith("**meal")) {
          let mealText = trimmed.replace(/^[\*\-\s]+/, "").trim();
          // Only add meal if it has actual content (not just "Meal 5:" or "Meal 5")
          const cleanText = mealText.replace(/\*\*/g, "").trim();
          const colonIdx = cleanText.indexOf(":");
          if (colonIdx === -1 || cleanText.substring(colonIdx + 1).trim().length > 0) {
            dayMeals.push(mealText);
          }
        }
      }
    }
    flushDay();
    
    if (days.length === 0 && dailyTargets.length === 0) {
      return (
        <div className="prose prose-invert max-w-none text-zinc-200 leading-relaxed bg-[#000000] p-6 rounded-xl border border-zinc-900 overflow-y-auto flex-1 select-text min-h-[400px]">
          <div 
            className="text-sm md:text-base space-y-4 font-sans whitespace-pre-wrap text-zinc-200"
            dangerouslySetInnerHTML={{ 
              __html: parseMarkdownToHtml(text) 
            }} 
          />
        </div>
      );
    }
    
    return (
      <div className="space-y-3">
        {/* Daily Targets Card */}
        {dailyTargets.length > 0 && (
          <div 
            className={`rounded-2xl border transition-all duration-300 overflow-hidden ${
              expandedDietDay === -2 
                ? "border-[#a3e635] bg-[#a3e635] shadow-lg shadow-[#a3e635]/10" 
                : "border-zinc-900/80 bg-zinc-950/20 hover:border-zinc-800 hover:bg-zinc-950/40"
            }`}
          >
            <button 
              onClick={() => setExpandedDietDay(expandedDietDay === -2 ? -1 : -2)}
              className="w-full flex items-center justify-between px-6 py-6 cursor-pointer group text-left"
            >
              <div className="flex items-center gap-4.5 min-w-0">
                <div className={`w-11 h-11 rounded-full flex items-center justify-center border transition-all duration-300 flex-shrink-0 ${
                  expandedDietDay === -2 
                    ? "bg-black border-transparent text-[#a3e635]" 
                    : "bg-zinc-900/60 border-zinc-800 text-zinc-400 group-hover:bg-[#a3e635]/10 group-hover:text-[#a3e635] group-hover:border-[#a3e635]/30"
                }`}>
                  <ChevronRight className={`w-5 h-5 transition-transform duration-300 ${expandedDietDay === -2 ? "rotate-90" : "rotate-0"}`} />
                </div>
                <span className={`text-base md:text-lg font-black tracking-tight transition-colors duration-300 truncate ${
                  expandedDietDay === -2 ? "text-black" : "text-zinc-200 group-hover:text-white"
                }`}>
                  Daily Nutrient Targets
                </span>
              </div>
              
              <div className="flex items-center gap-3 flex-shrink-0 ml-2">
                {expandedDietDay === -2 ? (
                  <span className="text-xs text-zinc-800 hover:text-black transition-colors duration-200 font-extrabold uppercase tracking-wider">
                    Collapse
                  </span>
                ) : (
                  <span className="text-xs md:text-sm font-bold text-zinc-500 group-hover:text-zinc-400 transition-colors duration-200 uppercase tracking-wider">
                    Daily Targets
                  </span>
                )}
              </div>
            </button>
            
            <div className={`transition-all duration-300 ease-in-out overflow-hidden ${
              expandedDietDay === -2 ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
            }`}>
              <div className="border-t border-black/10 bg-black/5 px-6 py-4 space-y-1">
                {(() => {
                  const targetsList = [...dailyTargets];
                  const hasFiber = targetsList.some(t => t.toLowerCase().includes("fiber"));
                  if (!hasFiber && latestPlan) {
                    const w = Number(latestPlan.weight) || 70;
                    const fiberEst = Math.round(w * 0.4) || 28;
                    targetsList.push(`Fiber: ${fiberEst}g`);
                  }
                  
                  // Filter out invalid/empty targets like "Target 5"
                  const validTargets = targetsList.filter(t => {
                    const clean = t.replace(/\*\*|\*/g, "").trim();
                    const colonIdx = clean.indexOf(":");
                    if (colonIdx !== -1) {
                      return clean.substring(colonIdx + 1).trim().length > 0;
                    }
                    return false;
                  });

                  return validTargets.map((target, idx) => {
                    const cleanTarget = target.replace(/\*\*|\*/g, "").trim();
                    const colonIdx = cleanTarget.indexOf(":");
                    let label = `Target ${idx + 1}`;
                    let val = cleanTarget;
                    if (colonIdx !== -1) {
                      label = cleanTarget.substring(0, colonIdx).trim();
                      val = cleanTarget.substring(colonIdx + 1).trim();
                    }
                    return (
                      <div key={idx} className="flex justify-between items-center text-sm md:text-base py-3 border-b border-black/10 last:border-b-0">
                        <span className="text-zinc-700 font-extrabold uppercase tracking-wider">{label}</span>
                        <span className="text-zinc-900 font-black">{val}</span>
                      </div>
                    );
                  });
                })()}
              </div>
            </div>
          </div>
        )}

        {days.map((day, dayIdx) => {
          const isOpen = expandedDietDay === dayIdx;
          return (
            <div 
              key={dayIdx} 
              className={`rounded-2xl border transition-all duration-300 overflow-hidden ${
                isOpen 
                  ? "border-[#a3e635] bg-[#a3e635] shadow-lg shadow-[#a3e635]/10" 
                  : "border-zinc-900/80 bg-zinc-950/20 hover:border-zinc-800 hover:bg-zinc-950/40"
              }`}
            >
              <button 
                onClick={() => setExpandedDietDay(isOpen ? -1 : dayIdx)}
                className="w-full flex items-center justify-between px-6 py-6 cursor-pointer group text-left"
              >
                <div className="flex items-center gap-4.5 min-w-0">
                  <div className={`w-11 h-11 rounded-full flex items-center justify-center border transition-all duration-300 flex-shrink-0 ${
                    isOpen 
                      ? "bg-black border-transparent text-[#a3e635]" 
                      : "bg-zinc-900/60 border-zinc-800 text-zinc-400 group-hover:bg-[#a3e635]/10 group-hover:text-[#a3e635] group-hover:border-[#a3e635]/30"
                  }`}>
                    <ChevronRight className={`w-5 h-5 transition-transform duration-300 ${isOpen ? "rotate-90" : "rotate-0"}`} />
                  </div>
                  <span className={`text-base md:text-lg font-black tracking-tight transition-colors duration-300 truncate ${
                    isOpen ? "text-black" : "text-zinc-200 group-hover:text-white"
                  }`}>
                    {day.header}
                  </span>
                </div>
                
                <div className="flex items-center gap-3 flex-shrink-0 ml-2">
                  {isOpen ? (
                    <span 
                      className="text-xs text-zinc-800 hover:text-black transition-colors duration-200 font-extrabold uppercase tracking-wider text-right cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        setExpandedDietDay(-1);
                      }}
                    >
                      Collapse all
                    </span>
                  ) : (
                    <span className="text-xs md:text-sm font-bold text-zinc-500 group-hover:text-zinc-400 transition-colors duration-200 uppercase tracking-wider">
                      {day.meals.filter(m => {
                        const cleanText = m.replace(/\*\*/g, "").trim();
                        const colonIdx = cleanText.indexOf(":");
                        if (colonIdx === -1) return cleanText.length > 0;
                        return cleanText.substring(colonIdx + 1).trim().length > 0;
                      }).length} Meals
                    </span>
                  )}
                </div>
              </button>
              
              <div className={`transition-all duration-300 ease-in-out overflow-hidden ${
                isOpen ? "max-h-[800px] opacity-100" : "max-h-0 opacity-0"
              }`}>
                <div className="border-t border-black/10 bg-black/5">
                  {/* Day Nutrition Totals Highlights */}
                  {day.totals && (
                    <div className="px-6 py-3.5 bg-black/10 border-b border-black/10 flex items-center gap-3">
                      <Flame className="w-4 h-4 text-zinc-800 shrink-0" />
                      <span className="text-xs md:text-sm text-zinc-900 font-extrabold">
                        Day Nutrition: <span className="font-black text-black">{day.totals}</span>
                      </span>
                    </div>
                  )}

                  {day.meals.filter(mealText => {
                    const cleanText = mealText.replace(/\*\*/g, "").trim();
                    const colonIdx = cleanText.indexOf(":");
                    if (colonIdx === -1) return cleanText.length > 0;
                    return cleanText.substring(colonIdx + 1).trim().length > 0;
                  }).map((mealText, idx) => {
                    const cleanText = mealText.replace(/\*\*/g, "").trim();
                    const colonIdx = cleanText.indexOf(":");
                    let title = `Meal ${idx + 1}`;
                    let description = cleanText;
                    if (colonIdx !== -1) {
                      title = cleanText.substring(0, colonIdx).trim();
                      description = cleanText.substring(colonIdx + 1).trim();
                    }
                    return (
                      <div 
                        key={idx} 
                        className={`flex items-center justify-between px-6 py-4.5 hover:bg-black/5 transition-colors duration-150 border-b border-black/5 last:border-b-0`}
                      >
                        <div className="flex items-start gap-4 min-w-0 w-full">
                          <span className="text-xs md:text-sm font-black text-zinc-700 w-16 text-left flex-shrink-0 uppercase tracking-wider mt-0.5">{title}</span>
                          <span className="text-sm md:text-base text-zinc-900 font-extrabold leading-relaxed">
                            {description}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  if (!authLoaded || !userLoaded || loading) {
    return (
      <div className="bg-[#000000] min-h-screen flex flex-col items-center justify-center text-white">
        <div className="relative w-16 h-16 flex items-center justify-center mb-4">
          <div className="absolute inset-0 rounded-full border-4 border-zinc-800 border-t-[#a3e635] animate-spin" />
          <Dumbbell className="w-6 h-6 text-[#a3e635]" />
        </div>
        <p className="text-zinc-400 animate-pulse text-sm">Loading plan details...</p>
      </div>
    );
  }

  return (
    <div className="bg-[#000000] min-h-screen text-white font-sans overflow-x-hidden">
      <Navbar />

      <main className="max-w-[1600px] w-full mx-auto px-6 md:px-12 pt-28 pb-8 md:pt-32 md:pb-12">
        {/* Page Title */}
        <div className="flex flex-col gap-4 mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-black tracking-tight text-white">
                Active Workout & Diet Program
              </h1>
              <p className="text-zinc-500 text-sm">
                Generated dynamically by StayFit AI for {latestPlan?.name || clerkUser.firstName || "you"}
              </p>
            </div>

            {latestPlan && (
              <div className="flex bg-zinc-900/60 p-1 rounded-lg border border-zinc-850 w-fit">
                <button
                  onClick={() => setActiveTab("workout")}
                  className={`px-5 py-2 rounded-md text-xs font-bold transition-all duration-300 ${
                    activeTab === "workout"
                      ? "bg-[#A3E635] text-black shadow-md shadow-[#A3E635]/10"
                      : "text-zinc-400 hover:text-white"
                  }`}
                >
                  Workout Split
                </button>
                <button
                  onClick={() => setActiveTab("diet")}
                  className={`px-5 py-2 rounded-md text-xs font-bold transition-all duration-300 ${
                    activeTab === "diet"
                      ? "bg-[#A3E635] text-black shadow-md shadow-[#A3E635]/10"
                      : "text-zinc-400 hover:text-white"
                  }`}
                >
                  Nutrition Plan
                </button>
              </div>
            )}
          </div>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-xl p-4 mb-6">
            {error}
          </div>
        )}

        {latestPlan ? (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Left Column: Quick Stats Summary Cards */}
            <div className="lg:col-span-1 space-y-4">
              <div className="bg-zinc-950 border border-zinc-850 p-5 rounded-2xl space-y-4.5">
                <h3 className="text-sm font-black uppercase tracking-wider text-[#A3E635] border-b border-zinc-900 pb-2">
                  Plan Info
                </h3>
                
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] text-zinc-500 uppercase font-black tracking-wider block">Frequency</span>
                    <span className="text-sm font-bold text-zinc-200">{latestPlan.workoutDays || 4} days/week</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400">
                    <Zap className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] text-zinc-500 uppercase font-black tracking-wider block">Duration</span>
                    <span className="text-sm font-bold text-zinc-200">{latestPlan.workoutDuration || 60} mins</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400">
                    <Award className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] text-zinc-500 uppercase font-black tracking-wider block">Goal split</span>
                    <span className="text-sm font-bold text-zinc-200">{latestPlan.goal || "Lose Fat"}</span>
                  </div>
                </div>

                <Button
                  onClick={activeTab === "workout" ? generateWoPdf : generateDietPdf}
                  className="w-full bg-[#A3E635] hover:bg-[#b8e600] text-black font-extrabold text-xs py-3.5 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer mt-3 shadow-lg shadow-[#A3E635]/10 hover:shadow-[#A3E635]/20"
                >
                  <Download className="w-4 h-4 text-black" />
                  <span>Download PDF Plan</span>
                </Button>
              </div>
            </div>

            {/* Right Column: Interactive Details */}
            <div className="lg:col-span-3">
              <div className="bg-zinc-950 border border-zinc-850 rounded-2xl p-6 md:p-8 min-h-[480px] flex flex-col">
                {activeTab === "workout" ? (
                  <div className="overflow-y-auto flex-1 select-text">
                    {renderWorkoutPlanReact(latestPlan.workoutPlan)}
                  </div>
                ) : (
                  <div className="overflow-y-auto flex-1 select-text">
                    {renderDietPlanReact(latestPlan.dietPlan)}
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-zinc-950 border border-zinc-850 rounded-2xl p-12 text-center max-w-md mx-auto mt-12">
            <Dumbbell className="w-12 h-12 text-zinc-800 mx-auto mb-4 animate-pulse" />
            <h3 className="font-bold text-lg mb-1">No plan history found</h3>
            <p className="text-zinc-550 text-sm mb-6">
              You haven't completed any AI fitness profiles yet. Start the assessment on the landing page to begin.
            </p>
            <Button
              onClick={() => navigate("/")}
              className="bg-[#A3E635] text-black font-bold text-sm px-6 py-2.5 rounded-xl hover:brightness-110 active:scale-95 transition-all mx-auto cursor-pointer"
            >
              Start Onboarding
            </Button>
          </div>
        )}
      </main>
    </div>
  );
};

export default YourPlan;
