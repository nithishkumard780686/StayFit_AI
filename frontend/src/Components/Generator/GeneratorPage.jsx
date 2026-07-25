import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth, useUser, UserButton } from "../../lib/clerkClient";
import Navbar from "../Navbar";
import { Button } from "../ui/button";
import { jsPDF } from "jspdf";
import InstallIcon from "../../svg/Install";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Calendar, Clock, Dumbbell, Award, Flame, ChevronRight, RefreshCw, Heart, Zap, Target, Activity, Square } from "lucide-react";

// Target backend URL
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://127.0.0.1:5001";

// Orbiting gym equipment icons data
const orbitIcons = [
  { Icon: Dumbbell, color: "#a3e635", delay: 0 },
  { Icon: Flame, color: "#f97316", delay: 1 },
  { Icon: Award, color: "#38bdf8", delay: 2 },
  { Icon: Sparkles, color: "#a3e635", delay: 3 },
  { Icon: Heart, color: "#f43f5e", delay: 4 },
  { Icon: Zap, color: "#facc15", delay: 5 },
];

const loadingTips = [
  "Calibrating your muscle targets...",
  "Balancing volume & intensity...",
  "Optimizing rest periods...",
  "Calculating macronutrient splits...",
  "Personalizing your weekly schedule...",
  "Fine-tuning exercise selection...",
];

// Custom Premium Orbiting Gym Equipment Loading Indicator
const LoadingState = ({ message, progress = 0, onStop }) => {
  const [tipIndex, setTipIndex] = useState(0);
  const [dots, setDots] = useState("");

  useEffect(() => {
    const tipTimer = setInterval(() => {
      setTipIndex((prev) => (prev + 1) % loadingTips.length);
    }, 3000);
    return () => clearInterval(tipTimer);
  }, []);

  useEffect(() => {
    const dotTimer = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? "" : prev + "."));
    }, 500);
    return () => clearInterval(dotTimer);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center py-10 md:py-16 space-y-8 select-none">
      {/* Orbiting Ring Container */}
      <div className="relative w-64 h-64 flex items-center justify-center">
        {/* Outer glowing track ring */}
        <div className="absolute w-48 h-48 rounded-full border border-zinc-800/80 shadow-[0_0_30px_rgba(0,0,0,0.5)]" />
        <div className="absolute w-48 h-48 rounded-full border border-[#a3e635]/20 animate-pulse" />
        
        {/* Spinning gradient ring */}
        <motion.div 
          className="absolute w-48 h-48 rounded-full border-2 border-t-[#a3e635] border-r-transparent border-b-transparent border-l-transparent"
          animate={{ rotate: 360 }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
        />

        {/* Orbiting Icons - Single Rotating Container */}
        <motion.div 
          className="absolute w-48 h-48 flex items-center justify-center pointer-events-none"
          animate={{ rotate: 360 }}
          transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
        >
          {orbitIcons.map(({ Icon, color }, idx) => {
            const total = orbitIcons.length;
            const angleDeg = (idx * 360) / total;
            const angleRad = (angleDeg * Math.PI) / 180;
            const radius = 96; // 96px radius along 192px track
            const x = Math.cos(angleRad) * radius;
            const y = Math.sin(angleRad) * radius;

            return (
              <div
                key={idx}
                className="absolute flex items-center justify-center"
                style={{
                  transform: `translate(${x}px, ${y}px)`,
                }}
              >
                {/* Counter-rotate icon so it stays upright as the ring spins */}
                <motion.div 
                  className="w-9 h-9 rounded-xl flex items-center justify-center shadow-lg border border-white/10"
                  style={{ 
                    backgroundColor: `${color}15`,
                    boxShadow: `0 0 15px ${color}35`,
                  }}
                  animate={{ rotate: -360 }}
                  transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
                >
                  <Icon className="w-4 h-4" style={{ color }} />
                </motion.div>
              </div>
            );
          })}
        </motion.div>

        {/* Center pulsing icon with percentage */}
        <motion.div 
          className="relative z-10 w-28 h-28 rounded-full bg-zinc-950 border-2 border-[#a3e635]/50 flex flex-col items-center justify-center shadow-[0_0_40px_rgba(163,230,53,0.25)] gap-0.5"
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <Dumbbell className="w-6 h-6 text-[#a3e635]" />
          <span className="text-xl font-black text-white font-mono tracking-tight leading-none">{Math.round(progress)}%</span>
          <div className="absolute inset-0 rounded-full bg-[#a3e635]/10 animate-ping" />
        </motion.div>
      </div>

      {/* Status messages */}
      <div className="flex flex-col items-center space-y-4 max-w-md px-6">
        {/* Primary message */}
        <div className="text-zinc-300 text-sm md:text-base font-bold tracking-wider uppercase text-center">
          {message}{dots}
        </div>
        
        {/* Rotating tip */}
        <AnimatePresence mode="wait">
          <motion.div
            key={tipIndex}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.4 }}
            className="text-zinc-500 text-xs md:text-sm font-medium text-center flex items-center gap-2"
          >
            <Activity className="w-3.5 h-3.5 text-[#a3e635] shrink-0" />
            {loadingTips[tipIndex]}
          </motion.div>
        </AnimatePresence>

        {/* Real Percentage Progress Bar */}
        <div className="w-64 space-y-1.5 pt-2">
          <div className="h-2 w-full bg-zinc-900 rounded-full overflow-hidden border border-zinc-800/60 p-0.5">
            <motion.div
              className="h-full bg-gradient-to-r from-[#a3e635]/70 via-[#a3e635] to-[#ccff80] rounded-full shadow-[0_0_12px_rgba(163,230,53,0.5)]"
              initial={{ width: "0%" }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            />
          </div>
        </div>

        {/* Stop Generation Button */}
        {onStop && (
          <button
            onClick={onStop}
            className="mt-6 px-6 py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white border border-red-500/30 hover:border-transparent font-bold text-xs flex items-center gap-2 transition-all duration-200 cursor-pointer shadow-lg active:scale-95"
          >
            <Square className="w-3.5 h-3.5 fill-current" />
            <span>Stop Generation</span>
          </button>
        )}
      </div>
    </div>
  );
};

const GeneratorPage = () => {
  const navigate = useNavigate();
  const { isSignedIn, signOut } = useAuth();
  const { user: clerkUser, isLoaded: userLoaded } = useUser();
  const [user, setUser] = useState(null);
  const [sessionLoading, setSessionLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState(""); // Message of what AI is doing
  const [generationProgress, setGenerationProgress] = useState(0); // Real-time percentage 0 - 100%
  const [generationError, setGenerationError] = useState(""); // Error message if generation fails

  const [onboardingData, setOnboardingData] = useState(null);
  const [aiWoResp, setAiWoResp] = useState(null);
  const [aiDietResp, setAiDietResp] = useState(null);
  const [savedToDb, setSavedToDb] = useState(false);
  const [historyPlans, setHistoryPlans] = useState([]);
  const [activeTab, setActiveTab] = useState("workout");
  
  const hasTriggeredRef = useRef(false);

  // Check user session
  useEffect(() => {
    if (!userLoaded) return;

    if (!isSignedIn || !clerkUser) {
      navigate("/");
      return;
    }

    setUser(clerkUser);

    const loadUserData = async () => {
      // Retrieve saved onboarding data from localStorage
      const storedOnboarding = localStorage.getItem("stayfit_onboarding_data");
      if (storedOnboarding) {
        const parsedData = JSON.parse(storedOnboarding);
        setOnboardingData(parsedData);
      } else {
        // If no onboarding data exists, check if user has previous plans saved in Database
        try {
          const res = await fetch(`${BACKEND_URL}/api/plans?userId=${clerkUser.id}`);
          if (res.ok) {
            const plans = await res.json();
            if (plans && plans.length > 0) {
              setHistoryPlans(plans);
              // Load their latest saved plan directly
              setAiWoResp(plans[0].workoutPlan);
              setAiDietResp(plans[0].dietPlan);
              setOnboardingData({
                goal: plans[0].goal || plans[0].fitnessGoals || "General Fitness",
                fitnessLevel: plans[0].fitnessLevel || "Intermediate",
                activityLevel: plans[0].activityLevel || "Moderate Active",
                workoutDays: plans[0].workoutDays || 4,
                workoutDuration: plans[0].workoutDuration || 60,
                equipment: plans[0].equipment || ["Full Gym"],
                gender: plans[0].gender || "Prefer not to say",
                height: plans[0].height || 175,
                weight: plans[0].weight || 70,
                bodyFat: plans[0].bodyFat || 18,
                focusAreas: plans[0].focusAreas || ["Full Body"],
                injuries: plans[0].injuries || ["None"],
                name: plans[0].name || "User",
                country: plans[0].country || "",
                state: plans[0].state || "",
                lifestyle: plans[0].lifestyle || "Working Professional",
                dietType: plans[0].dietType || "Vegetarian",
                foodBudget: plans[0].foodBudget || "₹6,000 – ₹10,000/month",
                cookingAccess: plans[0].cookingAccess || "Full Kitchen",
                mealsPerDay: plans[0].mealsPerDay || "3 Meals",
                favoriteFoods: plans[0].favoriteFoods || "",
                avoidFoods: plans[0].avoidFoods || "",
                allergies: plans[0].allergies || ""
              });
              if (plans[0].name) localStorage.setItem("stayfit_latest_plan_name", plans[0].name);
            } else {
              // Completely fresh user with no onboarding data
              navigate("/");
            }
          } else {
            navigate("/");
          }
        } catch (err) {
          console.error("Error fetching history plans:", err);
          navigate("/");
        }
      }
      setSessionLoading(false);
    };

    loadUserData();
  }, [userLoaded, isSignedIn, clerkUser, navigate]);



  const generateWorkout = async (displayName, injuriesStr, signal) => {
    const data = onboardingData || {};
    const workoutPrompt = `
      Create a clean, highly structured, professional workout program for:
      - Athlete Name: ${displayName}
      - Primary Goal: ${data.goal || "Build Muscle"}
      - Fitness Level: ${data.fitnessLevel || "Intermediate"}
      - Workout Schedule: ${data.workoutDays || 4} days per week
      - Session Duration: ${data.workoutDuration || 60} minutes
      - Available Equipment: ${data.equipment && Array.isArray(data.equipment) ? data.equipment.join(", ") : "Full Gym"}
      - Focus Muscle Areas: ${data.focusAreas && Array.isArray(data.focusAreas) ? data.focusAreas.join(", ") : "Full Body"}
      - Physical Injuries/Restrictions: ${injuriesStr}

      STRICT REQUIREMENTS:
      1. Provide EXACTLY ${data.workoutDays || 4} distinct daily workout splits (labeled ### Day 1: [Focus Area], ### Day 2: [Focus Area], etc.).
      2. Limit EACH daily workout to 4 to 6 core exercises.
      3. Use ONLY standard, popular, common gym exercise names (e.g. Barbell Bench Press, Incline Dumbbell Press, Lat Pulldown, Barbell Squat, Romanian Deadlift, Dumbbell Bicep Curl, Tricep Rope Pushdown, Lateral Raises, Cable Row, Leg Press, Face Pulls). Avoid unusual or rare exercise variations.
      4. For EACH exercise, list ONLY the standard Exercise Name, Sets, and Reps. Do NOT include Form Cues or instructions.
         Format strictly as:
         * **[Standard Exercise Name]**: [N] Sets x [M] Reps
      5. Do NOT include warm-up drills, cool-downs, or introductory/outro text.
    `;

    const workoutText = await promptSend(workoutPrompt, signal);
    if (!workoutText) throw new Error("Failed to generate workout split.");
    setAiWoResp(workoutText);
    return workoutText;
  };

  const generateDiet = async (displayName, injuriesStr, signal) => {
    const data = onboardingData || {};
    const dietPrompt = `
      Create a customized 7-day weekly meal plan for:
      - Name: ${displayName} | Goal: ${data.goal || "Build Muscle"} | Weight: ${data.weight || 70}kg
      - Diet Preference: ${data.dietType || "Vegetarian"} | Meals/Day: ${data.mealsPerDay || "3 Meals"}
      - Budget: ${data.foodBudget || "Moderate"} | Region: ${data.state || "India"}
      - Favorite Foods: ${data.favoriteFoods || "None"} | Avoid: ${data.avoidFoods || "None"} | Allergies: ${data.allergies || "None"}

      Format response strictly as:
      ### Daily Targets
      * **Calories:** [value] kcal
      * **Protein:** [value]g
      * **Carbs:** [value]g
      * **Fats:** [value]g
      * **Fiber:** [value]g

      ---

      ### MONDAY
      * **Meal 1:** [description with quantities]
      * **Meal 2:** [description with quantities]
      * **Day Nutrient Totals:** ~[calories] kcal, ~[protein]g Protein, ~[carbs]g Carbs, ~[fats]g Fats

      ---
      Repeat for all 7 days (MONDAY through SUNDAY). Reply directly with no conversational text.
    `;

    const dietText = await promptSend(dietPrompt, signal);
    if (!dietText) throw new Error("Failed to generate diet plan.");
    setAiDietResp(dietText);
    return dietText;
  };

  const generateFitnessPlan = async () => {
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setGenerating(true);
    setSavedToDb(false);
    setGenerationError("");
    setGenerationProgress(5);
    setGenerationStep("StayFit Ai is compiling your assessment details...");
    
    const displayName = onboardingData?.name || user.firstName || user.username || user.primaryEmailAddress?.emailAddress?.split("@")[0] || "Member";
    const baseInjuries = onboardingData.injuries || ["None"];
    const customInj = onboardingData.customInjury;
    const combinedInjuries = [
      ...baseInjuries.filter(i => i !== "None"),
      ...(customInj && customInj.trim() !== "" ? [customInj.trim()] : [])
    ];
    const injuriesStr = combinedInjuries.length > 0 ? combinedInjuries.join(", ") : "None";

    // Smooth simulated progress interval (caps strictly at 95% until complete)
    const progressTimer = setInterval(() => {
      setGenerationProgress((prev) => {
        if (prev < 95) {
          return Math.min(95, Math.round(prev + Math.random() * 5 + 2));
        }
        return prev;
      });
    }, 250);

    try {
      setGenerationStep("StayFit Ai is generating your custom workout & diet plan...");
      
      // Run Workout & Diet generation concurrently in parallel for ultra-fast generation
      const [workoutText, dietText] = await Promise.all([
        generateWorkout(displayName, injuriesStr, controller.signal),
        generateDiet(displayName, injuriesStr, controller.signal)
      ]);

      // Step 3: Save to DB
      setGenerationStep("Saving your StayFit Ai plan to database...");
      setGenerationProgress(96);
      
      const storedOnb = localStorage.getItem("stayfit_onboarding_data");
      const finalOnboarding = storedOnb ? JSON.parse(storedOnb) : (onboardingData || {});
      
      const heightM = Number(finalOnboarding.height || 175) / 100;
      const bmiVal = heightM > 0 ? Number(finalOnboarding.weight || 70) / (heightM * heightM) : 0;

      await fetch(`${BACKEND_URL}/api/plans`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          name: displayName,
          gender: finalOnboarding.gender || "Prefer not to say",
          height: finalOnboarding.height || 175,
          weight: finalOnboarding.weight || 70,
          bodyFat: finalOnboarding.bodyFat || 18,
          workoutPlan: workoutText,
          dietPlan: dietText,

          // Onboarding fields
          goal: finalOnboarding.goal || "Build Muscle",
          fitnessLevel: finalOnboarding.fitnessLevel || "Intermediate",
          activityLevel: finalOnboarding.activityLevel || "Moderate Active",
          workoutDays: finalOnboarding.workoutDays || 4,
          workoutDuration: finalOnboarding.workoutDuration || 60,
          equipment: finalOnboarding.equipment || ["Full Gym"],
          focusAreas: finalOnboarding.focusAreas || ["Full Body"],
          injuries: combinedInjuries.length > 0 ? combinedInjuries : ["None"],
          customInjury: finalOnboarding.customInjury || "",
          bmi: bmiVal,

          // Food & Lifestyle Preferences
          country: finalOnboarding.country || "",
          state: finalOnboarding.state || "",
          lifestyle: finalOnboarding.lifestyle || "Working Professional",
          dietType: finalOnboarding.dietType || "Vegetarian",
          foodBudget: finalOnboarding.foodBudget || "₹6,000 – ₹10,000/month",
          cookingAccess: finalOnboarding.cookingAccess || "Full Kitchen",
          mealsPerDay: finalOnboarding.mealsPerDay || "3 Meals",
          favoriteFoods: finalOnboarding.favoriteFoods || "",
          avoidFoods: finalOnboarding.avoidFoods || "",
          allergies: finalOnboarding.allergies || ""
        }),
      });

      setGenerationProgress(100);
      setSavedToDb(true);
      localStorage.setItem("stayfit_latest_plan_name", displayName);
      console.log("Successfully saved plan to database!");
      navigate("/dashboard");
    } catch (err) {
      if (err.name !== "AbortError") {
        console.error("Error generating or saving fitness plans:", err);
        setGenerationError(err.message || "Something went wrong while generating your plan. Please try again.");
      }
    } finally {
      clearInterval(progressTimer);
      setGenerating(false);
      setGenerationStep("");
      setGenerationProgress(0);
    }
  };

  const handleLogout = async () => {
    localStorage.removeItem("stayfit_onboarding_data");
    await signOut();
    navigate("/");
  };

  const abortControllerRef = useRef(null);

  const stopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setGenerating(false);
    setGenerationStep("");
  };

  const promptSend = async (promptText, signal) => {
    let attempts = 0;
    const maxAttempts = 3;
    let lastError = null;

    while (attempts < maxAttempts) {
      try {
        attempts++;
        const response = await fetch(`${BACKEND_URL}/api/gemini`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt: promptText }),
          signal: signal,
        });

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          throw new Error(errData.error || `HTTP ${response.status} API prompt error.`);
        }

        const data = await response.json();
        return data?.text || "";
      } catch (err) {
        if (err.name === "AbortError") throw err;
        lastError = err;
        if (attempts < maxAttempts) {
          // Wait 2.5 seconds before retrying to allow Render free tier backend server to finish waking up
          await new Promise((resolve) => setTimeout(resolve, 2500));
        }
      }
    }
    throw lastError || new Error("Generation failed after multiple attempts.");
  };

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
    const formattedMarkdown = typeof aiWoResp === "string" ? parseMarkdownToText(aiWoResp) : "";
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
    
    // Title header
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
    const formattedMarkdown = typeof aiDietResp === "string" ? parseMarkdownToText(aiDietResp) : "";
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
    
    // Title header
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

  const restartAssessment = () => {
    localStorage.removeItem("stayfit_onboarding_data");
    navigate("/");
  };

  if (sessionLoading) {
    return (
      <div className="h-screen w-screen bg-[#121212] flex items-center justify-center">
        <LoadingState message="Verifying session..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#000000] text-[#e2e2e2] font-sans pb-24 md:pb-0 overflow-x-hidden select-none">
      {/* TopNavBar */}
      <Navbar />

      {/* Main Content */}
      <main className="max-w-[1600px] w-full mx-auto px-6 md:px-12 pt-28 pb-16 md:pt-32">
        <div className="w-full flex items-center justify-center min-h-[calc(100vh-200px)]">
          {generating ? (
            <div className="glass-card rounded-2xl p-6 md:p-10 shadow-2xl max-w-6xl mx-auto w-full text-center border border-zinc-800/50">
              <LoadingState message={generationStep} progress={generationProgress} onStop={stopGeneration} />
            </div>
          ) : generationError ? (
            /* Error State */
            <div className="max-w-6xl mx-auto space-y-8 py-6 w-full">
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card rounded-2xl p-10 space-y-8 text-center shadow-xl border border-red-500/30"
              >
                <div className="w-20 h-20 bg-red-500/10 border border-red-500/30 rounded-full flex items-center justify-center mx-auto shadow-md">
                  <Flame className="text-red-400 w-9 h-9" />
                </div>
                <div className="space-y-3">
                  <h2 className="text-3xl md:text-4xl font-black text-white">Generation Failed</h2>
                  <p className="text-zinc-400 text-sm md:text-base max-w-2xl mx-auto leading-relaxed">
                    {generationError}
                  </p>
                </div>
                <div className="pt-2 flex justify-center gap-4">
                  <Button
                    onClick={() => { setGenerationError(""); generateFitnessPlan(); }}
                    className="bg-[#a3e635] text-black font-black text-sm md:text-base py-3.5 px-6 rounded-xl hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-[#a3e635]/15 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>Retry Generation</span>
                  </Button>
                </div>
              </motion.div>
            </div>
          ) : (
            /* Profile Summary + Generate Plan button */
            <div className="max-w-6xl mx-auto space-y-8 py-6 w-full">
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card rounded-2xl p-10 space-y-8 text-center shadow-xl border border-zinc-800/50"
              >
                <div className="w-20 h-20 bg-[#a3e635]/10 border border-[#a3e635]/30 rounded-full flex items-center justify-center mx-auto shadow-md">
                  <Sparkles className="text-[#a3e635] w-9 h-9" />
                </div>
                
                <div className="space-y-3">
                  <h2 className="text-3xl md:text-4xl font-black text-white">Your Profile is Ready!</h2>
                  <p className="text-zinc-400 text-sm md:text-base max-w-2xl mx-auto leading-relaxed">
                    We've successfully compiled your assessment metrics. Click below to let StayFit Ai generate your customized workout and nutrition plans.
                  </p>
                </div>

                <div className="pt-2 flex justify-center">
                  <Button
                    onClick={generateFitnessPlan}
                    className="w-full max-w-md bg-[#a3e635] text-black font-black text-sm md:text-base py-3.5 px-6 rounded-xl hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-[#a3e635]/15 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Generate AI Fitness & Diet Plan</span>
                    <Sparkles className="w-4 h-4" />
                  </Button>
                </div>
              </motion.div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default GeneratorPage;
