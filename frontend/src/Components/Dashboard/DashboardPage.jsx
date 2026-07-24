import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUser, useAuth } from "../../lib/clerkClient";
import Navbar from "../Navbar";
import { Button } from "../ui/button";
import { jsPDF } from "jspdf";
import { 
  User, 
  Activity, 
  Dumbbell, 
  Flame, 
  Scale, 
  TrendingUp, 
  Calendar, 
  ArrowRight,
  Sparkles,
  ChevronRight,
  ChevronDown,
  Download,
  Edit2,
  Save,
  X,
  Clock,
  Target,
  Droplet,
  Loader2,
  ShieldAlert
} from "lucide-react";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://127.0.0.1:5001";

const DashboardPage = () => {
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
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState(null);
  const [expandedDay, setExpandedDay] = useState(null); // All days collapsed by default
  const [equipmentDropdownOpen, setEquipmentDropdownOpen] = useState(false);
  const [focusAreasDropdownOpen, setFocusAreasDropdownOpen] = useState(false);
  const [injuriesDropdownOpen, setInjuriesDropdownOpen] = useState(false);
  const [validationError, setValidationError] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  // Prevent background scroll when update modal is open
  useEffect(() => {
    if (isEditing) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isEditing]);

  const latestPlan = plans[0] || null;

  const [localData, setLocalData] = useState(() => {
    try {
      const dataStr = localStorage.getItem("stayfit_onboarding_data");
      if (dataStr) {
        return JSON.parse(dataStr);
      }
    } catch (e) {
      console.error(e);
    }
    return null;
  });

  const getBmiStatus = (bmi) => {
    const val = Number(bmi);
    if (isNaN(val) || val <= 0) return { label: "--", color: "text-zinc-400 bg-zinc-900 border-zinc-800" };
    if (val < 18.5) return { label: "Underweight", color: "text-blue-400 bg-blue-500/10 border-blue-500/20" };
    if (val < 25.0) return { label: "Normal", color: "text-[#A3E635] bg-[#A3E635]/10 border-[#A3E635]/30 font-bold" };
    if (val < 30.0) return { label: "Overweight", color: "text-yellow-400 bg-yellow-500/10 border-yellow-500/20" };
    return { label: "Obese", color: "text-red-400 bg-red-500/10 border-red-500/20" };
  };

  const calculateNavyBFP = (g, h, n, w, hp) => {
    const log10 = Math.log10;
    const waist = Number(w) / 2.54;
    const neck = Number(n) / 2.54;
    const height = Number(h) / 2.54;
    const hips = Number(hp || 0) / 2.54;

    if (waist <= 0 || neck <= 0 || height <= 0 || waist <= neck) return 15;

    let bfpVal = 15;
    if (g === "Female") {
      if (waist + hips - neck <= 0) return 15;
      bfpVal = 163.205 * log10(waist + hips - neck) - 97.684 * log10(height) - 78.387;
    } else {
      bfpVal = 86.01 * log10(waist - neck) - 70.041 * log10(height) + 36.76;
    }
    return Math.max(3, Math.min(50, Math.round(bfpVal)));
  };

  const calculateTargets = (plan) => {
    const weight = Number(plan.weight) || 70;
    const height = Number(plan.height) || 175;
    const gender = plan.gender || "Prefer not to say";
    const goal = plan.goal || "Lose Fat";
    const activity = plan.activityLevel || "Moderate Active";
    const age = Number(plan.age) || 25;

    let bmr = 10 * weight + 6.25 * height - 5 * age;
    if (gender.toLowerCase().includes("female")) {
      bmr -= 161;
    } else {
      bmr += 5;
    }

    let multiplier = 1.375;
    if (activity.toLowerCase().includes("light")) multiplier = 1.375;
    else if (activity.toLowerCase().includes("moderate")) multiplier = 1.55;
    else if (activity.toLowerCase().includes("active") || activity.toLowerCase().includes("very")) multiplier = 1.725;
    else if (activity.toLowerCase().includes("sedentary")) multiplier = 1.2;

    let tdee = bmr * multiplier;

    let calories = Math.round(tdee);
    if (goal.toLowerCase().includes("lose") || goal.toLowerCase().includes("fat")) {
      calories = Math.round(tdee - 450);
    } else if (goal.toLowerCase().includes("build") || goal.toLowerCase().includes("muscle") || goal.toLowerCase().includes("gain")) {
      calories = Math.round(tdee + 300);
    }

    calories = Math.max(1200, calories);

    let protein = Math.round(weight * 2.2);
    if (protein < 120) protein = 120;

    let fat = Math.round((calories * 0.22) / 9);

    let carbs = Math.round((calories - (protein * 4) - (fat * 9)) / 4);
    if (carbs < 100) carbs = 100;

    calories = protein * 4 + carbs * 4 + fat * 9;

    let fiber = Math.round((calories / 1000) * 14);

    return {
      calories,
      protein,
      carbs,
      fat,
      fiber,
      maintenance: Math.round(bmr * multiplier)
    };
  };

  const getDietSummary = (plan) => {
    const calculated = calculateTargets(plan);
    const summary = {
      calories: `${calculated.calories} kcal`,
      protein: `${calculated.protein}g`,
      carbs: `${calculated.carbs}g`,
      fat: `${calculated.fat}g`,
      fiber: `${calculated.fiber}g`,
      maintenance: `${calculated.maintenance} kcal`
    };

    if (!plan || !plan.dietPlan) return summary;
    const dietText = plan.dietPlan;

    const calMatch = dietText.match(/(?:calories|cal|target|daily target|calories:?)[:~-\s]*([\d,]+)\s*(?:kcal|calories)/i);
    if (calMatch) {
      summary.calories = `${calMatch[1]} kcal`;
    }

    const proteinMatch = dietText.match(/(\d+)g\s*protein/i) || dietText.match(/protein[:\s]*(\d+)g/i);
    if (proteinMatch) {
      summary.protein = `${proteinMatch[1]}g`;
    }

    const carbsMatch = dietText.match(/(\d+)g\s*(?:carbohydrates|carbs)/i) || dietText.match(/(?:carbohydrates|carbs)[:\s]*(\d+)g/i);
    if (carbsMatch) {
      summary.carbs = `${carbsMatch[1]}g`;
    }

    const fatMatch = dietText.match(/(\d+)g\s*fat/i) || dietText.match(/fat[:\s]*(\d+)g/i);
    if (fatMatch) {
      summary.fat = `${fatMatch[1]}g`;
    }

    const fiberMatch = dietText.match(/(\d+)g\s*fiber/i) || dietText.match(/fiber[:\s]*(\d+)g/i);
    if (fiberMatch) {
      summary.fiber = `${fiberMatch[1]}g`;
    }

    return summary;
  };

  const getGoalType = (plan) => {
    const goal = (plan?.goal || "Lose Fat").toLowerCase();
    if (goal.includes("lose") || goal.includes("fat") || goal.includes("cut")) {
      return "Deficit";
    }
    if (goal.includes("gain") || goal.includes("build") || goal.includes("muscle") || goal.includes("bulk") || goal.includes("surplus")) {
      return "Surplus";
    }
    return "Maintenance";
  };

  const handleStartEdit = () => {
    const source = latestPlan || localData || {};
    setEditData({
      name: source.name || "",
      weight: source.weight || "",
      height: source.height || "",
      gender: source.gender || "Prefer not to say",
      bodyFatMode: source.neck || source.waist ? "navy" : "manual",
      bodyFat: source.bodyFat || "",
      neck: source.neck || "",
      waist: source.waist || "",
      hips: source.hips || "",
      workoutDays: source.workoutDays || 4,
      goal: source.goal || "General Fitness",
      fitnessLevel: source.fitnessLevel || "Intermediate",
      activityLevel: source.activityLevel || "Moderate Active",
      workoutDuration: source.workoutDuration || 60,
      equipment: Array.isArray(source.equipment) ? source.equipment.join(", ") : (source.equipment || "Full Gym"),
      focusAreas: Array.isArray(source.focusAreas) ? source.focusAreas.join(", ") : (source.focusAreas || "Full Body"),
      injuries: Array.isArray(source.injuries) ? source.injuries.join(", ") : (source.injuries || "None"),
      customInjury: source.customInjury || "",
      country: source.country || "",
      state: source.state || "",
      lifestyle: source.lifestyle || "Working Professional",
      dietType: source.dietType || "Vegetarian",
      foodBudget: source.foodBudget || "₹6,000 – ₹10,000/month",
      cookingAccess: source.cookingAccess || "Full Kitchen",
      mealsPerDay: source.mealsPerDay || "3 Meals",
      favoriteFoods: source.favoriteFoods || "",
      avoidFoods: source.avoidFoods || "",
      allergies: source.allergies || ""
    });
    setEquipmentDropdownOpen(false);
    setFocusAreasDropdownOpen(false);
    setInjuriesDropdownOpen(false);
    setValidationError(null);
    setIsEditing(true);
  };

  const toggleEquipmentOption = (optionLabel) => {
    if (!editData) return;
    const currentEqList = typeof editData.equipment === "string" 
      ? editData.equipment.split(",").map(s => s.trim()).filter(Boolean)
      : (Array.isArray(editData.equipment) ? editData.equipment : []);

    let newList = [...currentEqList];
    if (optionLabel === "Bodyweight Only") {
      if (newList.includes("Bodyweight Only")) {
        newList = [];
      } else {
        newList = ["Bodyweight Only"];
      }
    } else {
      newList = newList.filter(item => item !== "Bodyweight Only");
      if (newList.includes(optionLabel)) {
        newList = newList.filter(item => item !== optionLabel);
      } else {
        newList.push(optionLabel);
      }
    }
    setEditData({
      ...editData,
      equipment: newList.join(", ")
    });
  };

  const toggleFocusAreaOption = (optionLabel) => {
    if (!editData) return;
    const currentFaList = typeof editData.focusAreas === "string"
      ? editData.focusAreas.split(",").map(s => s.trim()).filter(Boolean)
      : (Array.isArray(editData.focusAreas) ? editData.focusAreas : []);

    let newList = [...currentFaList];
    if (optionLabel === "Full Body") {
      if (newList.includes("Full Body")) {
        newList = [];
      } else {
        newList = ["Full Body"];
      }
    } else {
      newList = newList.filter(item => item !== "Full Body");
      if (newList.includes(optionLabel)) {
        newList = newList.filter(item => item !== optionLabel);
      } else {
        newList.push(optionLabel);
      }
      if (newList.length === 0) {
        newList = ["Full Body"];
      }
    }
    setEditData({
      ...editData,
      focusAreas: newList.join(", ")
    });
  };

  const toggleInjuryOption = (optionLabel) => {
    if (!editData) return;
    const currentInjList = typeof editData.injuries === "string"
      ? editData.injuries.split(",").map(s => s.trim()).filter(Boolean)
      : (Array.isArray(editData.injuries) ? editData.injuries : []);

    let newList = [...currentInjList];
    let customInj = editData.customInjury || "";

    if (optionLabel === "None") {
      if (newList.includes("None")) {
        newList = [];
      } else {
        newList = ["None"];
        customInj = "";
      }
    } else {
      newList = newList.filter(item => item !== "None");
      if (newList.includes(optionLabel)) {
        newList = newList.filter(item => item !== optionLabel);
      } else {
        newList.push(optionLabel);
      }
      if (newList.length === 0 && !customInj.trim()) {
        newList = ["None"];
      }
    }
    setEditData({
      ...editData,
      injuries: newList.join(", "),
      customInjury: customInj
    });
  };

  const validateCustomInput = (text) => {
    if (!text || !text.trim()) return true;
    const trimmed = text.trim();
    if (trimmed.length < 2) return false;
    if (!/[a-zA-Z]/.test(trimmed)) return false;
    return true;
  };

  const getCalculatedBmi = () => {
    if (!editData || !editData.weight || !editData.height) return "--";
    const heightM = Number(editData.height) / 100;
    if (heightM <= 0) return "--";
    const bmiVal = Number(editData.weight) / (heightM * heightM);
    return bmiVal.toFixed(1);
  };

  const getCalculatedBodyFat = () => {
    if (!editData) return "--";
    if (editData.bodyFatMode === "manual") {
      return editData.bodyFat || "--";
    }
    return calculateNavyBFP(
      editData.gender,
      editData.height,
      editData.neck,
      editData.waist,
      editData.hips
    );
  };

  const handleSaveEdit = async () => {
    if (!editData) return;
    setError(null);
    setValidationError(null);

    // Validate Weight
    if (!editData.weight || Number(editData.weight) <= 0 || Number(editData.weight) > 300) {
      setValidationError("Please enter a valid weight between 1 kg and 300 kg.");
      return;
    }

    // Validate Height
    if (!editData.height || Number(editData.height) <= 0 || Number(editData.height) > 250) {
      setValidationError("Please enter a valid height between 1 cm and 250 cm.");
      return;
    }

    // Validate Body Fat % if manual mode
    if (editData.bodyFatMode === "manual" && editData.bodyFat) {
      const bfNum = Number(editData.bodyFat);
      if (isNaN(bfNum) || bfNum < 1 || bfNum > 70) {
        setValidationError("Please enter a valid body fat percentage between 1% and 70%.");
        return;
      }
    }

    // Validate Custom Injury input if typed
    if (editData.customInjury && editData.customInjury.trim()) {
      if (!validateCustomInput(editData.customInjury)) {
        setValidationError("Custom injury description must contain valid text (at least 2 letters, e.g. 'Torn meniscus').");
        return;
      }
    }

    // Ensure at least one equipment option is selected
    const eqArray = typeof editData.equipment === "string" 
      ? editData.equipment.split(",").map(s => s.trim()).filter(Boolean)
      : (Array.isArray(editData.equipment) ? editData.equipment : []);
    if (eqArray.length === 0) {
      setValidationError("Please select at least one equipment option.");
      return;
    }

    // Ensure at least one focus area option is selected
    const faArray = typeof editData.focusAreas === "string" 
      ? editData.focusAreas.split(",").map(s => s.trim()).filter(Boolean)
      : (Array.isArray(editData.focusAreas) ? editData.focusAreas : []);
    if (faArray.length === 0) {
      setValidationError("Please select at least one focus area option.");
      return;
    }

    try {
      setIsSaving(true);
      
      const heightM = Number(editData.height) / 100;
      const bmiVal = heightM > 0 ? Number(editData.weight) / (heightM * heightM) : 0;

      let finalBodyFat = editData.bodyFat ? Number(editData.bodyFat) : undefined;
      let finalNeck = undefined;
      let finalWaist = undefined;
      let finalHips = undefined;

      if (editData.bodyFatMode === "navy") {
        finalBodyFat = calculateNavyBFP(
          editData.gender,
          editData.height,
          editData.neck,
          editData.waist,
          editData.hips
        );
        finalNeck = editData.neck ? Number(editData.neck) : undefined;
        finalWaist = editData.waist ? Number(editData.waist) : undefined;
        finalHips = editData.hips ? Number(editData.hips) : undefined;
      }

      // Format combined injuries list including customInjury
      let finalInjuries = typeof editData.injuries === "string" 
        ? editData.injuries.split(",").map(s => s.trim()).filter(Boolean) 
        : (Array.isArray(editData.injuries) ? editData.injuries : []);
      
      if (editData.customInjury && editData.customInjury.trim()) {
        const customClean = editData.customInjury.trim();
        if (!finalInjuries.includes(customClean)) {
          finalInjuries = finalInjuries.filter(i => i !== "None");
          finalInjuries.push(customClean);
        }
      }
      if (finalInjuries.length === 0) finalInjuries = ["None"];

      const payload = {
        name: editData.name,
        weight: editData.weight ? Number(editData.weight) : undefined,
        height: editData.height ? Number(editData.height) : undefined,
        gender: editData.gender,
        bodyFat: finalBodyFat,
        neck: finalNeck,
        waist: finalWaist,
        hips: finalHips,
        workoutDays: editData.workoutDays ? Number(editData.workoutDays) : undefined,
        goal: editData.goal,
        fitnessLevel: editData.fitnessLevel,
        activityLevel: editData.activityLevel,
        workoutDuration: editData.workoutDuration ? Number(editData.workoutDuration) : undefined,
        equipment: eqArray,
        focusAreas: faArray,
        injuries: finalInjuries,
        customInjury: editData.customInjury || "",
        bmi: bmiVal,
        country: editData.country,
        state: editData.state,
        lifestyle: editData.lifestyle,
        dietType: editData.dietType,
        foodBudget: editData.foodBudget,
        cookingAccess: editData.cookingAccess,
        mealsPerDay: editData.mealsPerDay,
        favoriteFoods: editData.favoriteFoods,
        avoidFoods: editData.avoidFoods,
        allergies: editData.allergies
      };

      if (latestPlan && latestPlan._id) {
        const res = await fetch(`${BACKEND_URL}/api/plans/${latestPlan._id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });

        if (!res.ok) {
          const errJson = await res.json().catch(() => ({}));
          throw new Error(errJson.error || "Failed to save metrics changes.");
        }
        const updatedPlan = await res.json();

        setPlans(prevPlans => {
          const updated = [...prevPlans];
          updated[0] = { ...updated[0], ...updatedPlan };
          return updated;
        });
      }

      const storedOnb = localStorage.getItem("stayfit_onboarding_data");
      const currentOnb = storedOnb ? JSON.parse(storedOnb) : {};
      const updatedOnb = {
        ...currentOnb,
        name: editData.name || currentOnb.name,
        gender: editData.gender,
        height: editData.height ? Number(editData.height) : undefined,
        weight: editData.weight ? Number(editData.weight) : undefined,
        bodyFat: finalBodyFat,
        workoutDays: editData.workoutDays ? Number(editData.workoutDays) : undefined,
        goal: editData.goal,
        fitnessLevel: editData.fitnessLevel,
        activityLevel: editData.activityLevel,
        workoutDuration: editData.workoutDuration ? Number(editData.workoutDuration) : undefined,
        equipment: payload.equipment,
        focusAreas: payload.focusAreas,
        injuries: payload.injuries,
        customInjury: editData.customInjury || "",
        country: editData.country,
        state: editData.state,
        lifestyle: editData.lifestyle,
        dietType: editData.dietType,
        foodBudget: editData.foodBudget,
        cookingAccess: editData.cookingAccess,
        mealsPerDay: editData.mealsPerDay,
        favoriteFoods: editData.favoriteFoods,
        avoidFoods: editData.avoidFoods,
        allergies: editData.allergies
      };
      localStorage.setItem("stayfit_onboarding_data", JSON.stringify(updatedOnb));
      setLocalData(updatedOnb);

      setIsEditing(false);
    } catch (err) {
      console.error("Error saving edits:", err);
      setError(err.message);
    } finally {
      setIsSaving(false);
    }
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

  const getSimplifiedWorkoutPlan = (text) => {
    if (!text) return "";
    const lines = text.split("\n");
    const result = [];
    
    for (let line of lines) {
      const trimmed = line.trim();
      
      // Check if it's a Day/Split header (starts with ### or ## or Day)
      if (trimmed.startsWith("###") || trimmed.startsWith("##") || trimmed.toLowerCase().startsWith("day")) {
        result.push(trimmed);
        continue;
      }
      
      // Check if it's a table row containing exercises
      if (trimmed.startsWith("|")) {
        const cols = trimmed.split("|").map(c => c.trim());
        if (cols.length >= 3) {
          const exerciseName = cols[1];
          if (
            exerciseName && 
            exerciseName.toLowerCase() !== "exercise" && 
            !exerciseName.includes("---") &&
            !exerciseName.includes(":")
          ) {
            result.push(`• **${exerciseName}**`);
          }
        }
      }
    }
    
    return result.join("\n\n");
  };

  const renderWorkoutPlanReact = (text) => {
    if (!text) return null;
    const lines = text.split("\n");
    
    // First pass: collect all days into structured data
    const days = [];
    let currentDayHeader = "";
    let dayExercises = [];
    
    const cleanExerciseName = (name) => {
      if (!name) return "";
      return name
        .replace(/^\d+[\.\-\)]\s*/, "")  // remove leading "1. " or "1) "
        .replace(/^[\*\-\s\:\;]+/, "")   // remove leading bullets, colons, etc.
        .replace(/[\:\;\,\-\s]+$/, "")   // remove trailing colons, semicolons, commas, hyphens, whitespace
        .trim();
    };

    const skipKeywords = ["progression", "schedule", "note", "warm-up", "cool-down", "tips", "rest day", "guidelines", "summary"];
    
    const isDayHeader = (txt) => {
      const lower = txt.replace(/###|##/g, "").trim().toLowerCase();
      if (/day\s*\d/i.test(lower)) return true;
      if (/upper body|lower body|push|pull|legs|chest|back|shoulder|arm|core/i.test(lower) && !skipKeywords.some(kw => lower.includes(kw))) return true;
      return false;
    };
    
    const flushDay = () => {
      if (currentDayHeader && dayExercises.length > 0) {
        const dayNumber = days.length + 1;
        let finalHeader = currentDayHeader.replace(/###|##|\*/g, "").trim();
        finalHeader = finalHeader.replace(/Day\s*\d+/i, `Day ${dayNumber}`);
        days.push({ header: finalHeader, exercises: [...dayExercises] });
        dayExercises = [];
      }
    };
    
    for (let line of lines) {
      const trimmed = line.trim();
      if (
        trimmed.startsWith("####") ||
        trimmed.startsWith("###") ||
        trimmed.startsWith("##") ||
        trimmed.toLowerCase().startsWith("day") ||
        trimmed.toLowerCase().startsWith("**day")
      ) {
        if (isDayHeader(trimmed)) {
          flushDay();
          currentDayHeader = trimmed;
        } else {
          flushDay();
          currentDayHeader = "";
        }
        continue;
      }
      if (!currentDayHeader) continue;

      // Parse Table Columns
      if (trimmed.startsWith("|")) {
        const cols = trimmed.split("|").map(c => c.trim());
        if (cols.length >= 3) {
          let exerciseName = cols[1];
          if (exerciseName && exerciseName.toLowerCase() !== "exercise" && !exerciseName.includes("---")) {
            const cleaned = cleanExerciseName(exerciseName.replace(/\*\*/g, "").trim());
            if (cleaned) dayExercises.push(cleaned);
          }
        }
      }
      // Parse Bullet or Numbered List Items
      else if (trimmed.startsWith("*") || trimmed.startsWith("-") || /^\d+\.\s*/.test(trimmed)) {
        const boldMatch = trimmed.match(/\*\*(.*?)\*\*/);
        if (boldMatch) {
          const boldText = boldMatch[1].trim();
          const lowerBold = boldText.toLowerCase();
          if (
            !lowerBold.includes("warm-up") && 
            !lowerBold.includes("warmup") && 
            !lowerBold.includes("cool-down") && 
            !lowerBold.includes("cooldown") && 
            !lowerBold.includes("rest") &&
            !lowerBold.includes("day") &&
            !lowerBold.includes("schedule")
          ) {
            const cleaned = cleanExerciseName(boldText);
            if (cleaned) dayExercises.push(cleaned);
          }
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
    
    // Second pass: render accordion inspired by reference layout
    return (
      <div className="space-y-3">
        {days.map((day, dayIdx) => {
          const isOpen = expandedDay === dayIdx;
          return (
            <div 
              key={dayIdx} 
              className={`rounded-2xl border transition-all duration-300 overflow-hidden ${
                isOpen 
                  ? "border-[#a3e635]/30 bg-zinc-950/60 shadow-lg shadow-[#a3e635]/2" 
                  : "border-zinc-900/80 bg-zinc-950/20 hover:border-zinc-800 hover:bg-zinc-950/40"
              }`}
            >
              {/* Day Header — clickable */}
              <button 
                onClick={() => setExpandedDay(isOpen ? -1 : dayIdx)}
                className="w-full flex items-center justify-between px-6 py-6 cursor-pointer group text-left"
              >
                <div className="flex items-center gap-4.5 min-w-0">
                  {/* Circle Chevron Button */}
                  <div className={`w-11 h-11 rounded-full flex items-center justify-center border transition-all duration-300 flex-shrink-0 ${
                    isOpen 
                      ? "bg-[#a3e635] border-transparent text-black" 
                      : "bg-zinc-900/60 border-zinc-800 text-zinc-400 group-hover:bg-[#a3e635]/10 group-hover:text-[#a3e635] group-hover:border-[#a3e635]/30"
                  }`}>
                    <ChevronRight className={`w-5 h-5 transition-transform duration-300 ${isOpen ? "rotate-90" : "rotate-0"}`} />
                  </div>
                  <span className={`text-base md:text-lg font-extrabold tracking-tight transition-colors duration-300 truncate ${
                    isOpen ? "text-[#a3e635]" : "text-zinc-200 group-hover:text-white"
                  }`}>
                    {day.header}
                  </span>
                </div>
                
                <div className="flex items-center gap-3 flex-shrink-0 ml-2">
                  {isOpen ? (
                    <span 
                      className="text-xs text-zinc-500 hover:text-[#a3e635] transition-colors duration-200 font-bold uppercase tracking-wider text-right cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation(); // Stop collapse event
                        setExpandedDay(-1); // Collapse all by closing current
                      }}
                    >
                      Collapse all
                    </span>
                  ) : (
                    <span className="text-xs md:text-sm font-bold text-zinc-500 group-hover:text-zinc-400 transition-colors duration-200 uppercase tracking-wider">
                      {day.exercises.length} Exercises
                    </span>
                  )}
                </div>
              </button>
              
              {/* Exercises List — collapsible */}
              <div className={`transition-all duration-300 ease-in-out overflow-hidden ${
                isOpen ? "max-h-[600px] opacity-100" : "max-h-0 opacity-0"
              }`}>
                <div className="border-t border-zinc-900/50 bg-black/30">
                  {day.exercises.map((exName, idx) => (
                    <div 
                      key={idx} 
                      className={`flex items-center justify-between px-6 py-4.5 hover:bg-white/[0.02] transition-colors duration-150 ${
                        idx !== day.exercises.length - 1 ? "border-b border-zinc-900/40" : ""
                      }`}
                    >
                      <div className="flex items-center gap-4 min-w-0">
                        <span className="text-xs md:text-sm font-black text-zinc-500 w-6 text-center flex-shrink-0">{idx + 1}</span>
                        <span className="text-sm md:text-base text-zinc-200 font-extrabold truncate">
                          {exName}
                        </span>
                      </div>
                      <button 
                        onClick={() => navigate(`/howtodo?search=${encodeURIComponent(cleanExerciseName(exName))}`)}
                        className="ml-4 px-3.5 py-2 bg-[#a3e635]/10 hover:bg-[#a3e635] text-[#a3e635] hover:text-black border border-[#a3e635]/25 hover:border-transparent font-extrabold text-[10px] md:text-xs uppercase tracking-wider rounded-xl transition-all duration-200 cursor-pointer flex-shrink-0"
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

  const getMotivationalQuote = (goal) => {
    const quotes = {
      "fat": "Track your nutrition carefully, prioritize protein, stay in a deficit, and let daily consistency unlock your results.",
      "muscle": "Focus on progressive overload in your lifts, hit your daily protein targets, and trust the recovery process.",
      "weight": "Ensure a clean caloric surplus, stay dedicated to heavy compound movements, and fuel your muscle recovery.",
      "fitness": "Move with purpose daily, hydrate well, challenge your cardiovascular stamina, and prioritize joint health.",
      "athletic": "Incorporate explosive speed and agility drills, respect your sleep schedule, and fuel your performance."
    };
    
    const key = String(goal || "").toLowerCase();
    for (const [k, v] of Object.entries(quotes)) {
      if (key.includes(k)) return v;
    }
    return "Track your workouts, stay consistent with your routine, and watch your progression week over week.";
  };

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
          
          // If new user with no plan history, redirect to landing to start assessment
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

  if (!authLoaded || !userLoaded || loading) {
    return (
      <div className="bg-[#000000] min-screen h-screen flex flex-col items-center justify-center text-white">
        <div className="relative w-16 h-16 flex items-center justify-center mb-4">
          <div className="absolute inset-0 rounded-full border-4 border-zinc-800 border-t-[#A3E635] animate-spin" />
          <Dumbbell className="w-6 h-6 text-[#A3E635]" />
        </div>
        <p className="text-zinc-400 animate-pulse text-sm">Loading fitness profile...</p>
      </div>
    );
  }


  return (
    <div className="bg-[#000000] min-h-screen text-white font-sans overflow-x-hidden">
      {/* Top Navbar */}
      <Navbar />

      {/* Main Container */}
      <main className="max-w-[1600px] w-full mx-auto px-6 md:px-12 pt-28 pb-8 md:pt-32 md:pb-12">
        {/* User Greeting Hero Card */}
        <section className="bg-gradient-to-r from-zinc-950 to-zinc-900 border border-zinc-800/80 rounded-2xl p-6 md:p-8 mb-8 relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="absolute top-0 right-0 w-80 h-80 bg-[#A3E635]/5 rounded-full blur-3xl pointer-events-none" />
          
          <div className="flex items-center gap-5">
            <img 
              src={clerkUser.imageUrl} 
              alt={clerkUser.fullName} 
              className="w-16 h-16 md:w-20 md:h-20 rounded-full border-2 border-[#A3E635] object-cover"
            />
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white">
                  Welcome back, {latestPlan?.name || localData?.name || clerkUser.firstName || clerkUser.username || "Athlete"}!
                </h1>
              </div>
              <p className="text-zinc-400 text-sm">{clerkUser.primaryEmailAddress?.emailAddress}</p>
            </div>
          </div>

          {/* StayFit AI Tip of the Day */}
          {latestPlan && (
            <div className="flex items-center gap-3 bg-zinc-900/30 border border-zinc-800/80 rounded-2xl p-4 max-w-md relative overflow-hidden backdrop-blur-sm shadow-lg">
              <div className="w-1.5 h-full bg-[#A3E635] absolute left-0 top-0" />
              <div className="pl-2">
                <span className="text-[9px] text-[#A3E635] uppercase font-black tracking-wider block mb-0.5">StayFit AI Coach Tip</span>
                <p className="text-xs text-zinc-300 italic font-medium leading-relaxed">
                  "{getMotivationalQuote(latestPlan.goal)}"
                </p>
              </div>
            </div>
          )}
        </section>

        {/* Two-Column Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Current Profile Metrics */}
          <div className="lg:col-span-2 flex flex-col">
            <div className="bg-zinc-950 border border-zinc-850 rounded-2xl p-6 flex flex-col flex-1 h-full">
              <div className="flex items-center justify-between mb-6 border-b border-zinc-900 pb-4">
                <div className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-[#A3E635]" />
                  <h2 className="text-lg font-bold">Metrics Profile</h2>
                </div>
                <Button 
                  onClick={handleStartEdit}
                  className="bg-[#A3E635]/10 hover:bg-[#A3E635] text-[#A3E635] hover:text-black border border-[#A3E635]/30 hover:border-transparent text-xs font-extrabold px-3.5 py-1.5 rounded-xl transition-all duration-200 cursor-pointer flex items-center gap-1.5 shadow-sm"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Update Metrics</span>
                </Button>
              </div>

               {latestPlan ? (
                <div className="space-y-6">
                  {/* Primary Stats Grid */}
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                        <div className="bg-[#A3E635] border border-[#A3E635] rounded-xl p-3.5 flex flex-col justify-between min-h-[88px] transition-all duration-300 shadow-[0_0_15px_rgba(0,0,0,0.2)]">
                          <span className="text-[11px] text-zinc-950/70 uppercase font-bold tracking-wider">Weight</span>
                          <p className="text-xl md:text-2xl font-extrabold text-zinc-950 mt-1">{latestPlan.weight || localData?.weight || "--"} <span className="text-xs font-semibold text-zinc-950/80">kg</span></p>
                        </div>
                        <div className="bg-[#A3E635] border border-[#A3E635] rounded-xl p-3.5 flex flex-col justify-between min-h-[88px] transition-all duration-300 shadow-[0_0_15px_rgba(0,0,0,0.2)]">
                          <span className="text-[11px] text-zinc-950/70 uppercase font-bold tracking-wider">Height</span>
                          <p className="text-xl md:text-2xl font-extrabold text-zinc-950 mt-1">{latestPlan.height || localData?.height || "--"} <span className="text-xs font-semibold text-zinc-950/80">cm</span></p>
                        </div>
                        <div className="bg-[#A3E635] border border-[#A3E635] rounded-xl p-3.5 flex flex-col justify-between min-h-[88px] transition-all duration-300 shadow-[0_0_15px_rgba(0,0,0,0.2)]">
                          <span className="text-[11px] text-zinc-950/70 uppercase font-bold tracking-wider">Gender</span>
                          <p className="text-xl md:text-2xl font-extrabold text-zinc-950 mt-1 capitalize">{latestPlan.gender || localData?.gender || "--"}</p>
                        </div>
                        <div className="bg-[#A3E635] border border-[#A3E635] rounded-xl p-3.5 flex flex-col justify-between min-h-[88px] transition-all duration-300 shadow-[0_0_15px_rgba(0,0,0,0.2)]">
                          <span className="text-[11px] text-zinc-950/70 uppercase font-bold tracking-wider">BMI</span>
                          {(() => {
                            const rawWeight = latestPlan.weight || localData?.weight;
                            const rawHeight = latestPlan.height || localData?.height;
                            const computedBmi = latestPlan.bmi || (rawWeight && rawHeight ? (Number(rawWeight) / ((Number(rawHeight) / 100) * (Number(rawHeight) / 100))).toFixed(1) : undefined);
                            const bmiVal = computedBmi ? Number(computedBmi).toFixed(1) : "--";
                            return (
                              <div className="flex items-center gap-1.5 mt-1">
                                <p className="text-xl md:text-2xl font-extrabold text-zinc-950">{bmiVal}</p>
                                <span className="bg-zinc-950/90 text-[#A3E635] text-[10px] px-1.5 py-0.5 rounded font-bold">BMI</span>
                              </div>
                            );
                          })()}
                        </div>
                        {(latestPlan.bodyFat || localData?.bodyFat) && (
                          <div className="bg-[#A3E635] border border-[#A3E635] rounded-xl p-3.5 flex flex-col justify-between min-h-[88px] transition-all duration-300 shadow-[0_0_15px_rgba(0,0,0,0.2)]">
                            <span className="text-[11px] text-zinc-950/70 uppercase font-bold tracking-wider">Body Fat</span>
                            <p className="text-xl md:text-2xl font-extrabold text-zinc-950 mt-1">{latestPlan.bodyFat || localData?.bodyFat}%</p>
                          </div>
                        )}
                        <div className="bg-[#A3E635] border border-[#A3E635] rounded-xl p-3.5 flex flex-col justify-between min-h-[88px] transition-all duration-300 shadow-[0_0_15px_rgba(0,0,0,0.2)]">
                          <span className="text-[11px] text-zinc-950/70 uppercase font-bold tracking-wider">Frequency</span>
                          <p className="text-xl md:text-2xl font-extrabold text-zinc-950 mt-1">{latestPlan.workoutDays || localData?.workoutDays || "--"} <span className="text-xs font-semibold text-zinc-950/80">days/wk</span></p>
                        </div>
                      </div>

                      {/* Secondary Details */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 lg:gap-x-16 border-t border-zinc-900 pt-5">
                        {/* Left Column */}
                        <div>
                          {/* 1. Fitness Goal */}
                          <div className="flex items-center justify-between py-3.5 border-b border-zinc-900/40">
                            <span className="text-zinc-500 text-xs uppercase font-bold tracking-wider whitespace-nowrap">Fitness Goal</span>
                            <span className="text-[#A3E635] text-sm font-bold text-right ml-4">{latestPlan.goal || localData?.goal || "--"}</span>
                          </div>

                          {/* 2. Experience Level */}
                          <div className="flex items-center justify-between py-3.5 border-b border-zinc-900/40">
                            <span className="text-zinc-500 text-xs uppercase font-bold tracking-wider whitespace-nowrap">Experience Level</span>
                            <span className="text-white text-sm font-semibold capitalize text-right ml-4">{latestPlan.fitnessLevel || localData?.fitnessLevel || "--"}</span>
                          </div>

                          {/* 3. Activity Level */}
                          <div className="flex items-center justify-between py-3.5 border-b border-zinc-900/40">
                            <span className="text-zinc-500 text-xs uppercase font-bold tracking-wider whitespace-nowrap">Activity Level</span>
                            <span className="text-white text-sm font-semibold capitalize text-right ml-4">{latestPlan.activityLevel || localData?.activityLevel || "--"}</span>
                          </div>

                          {/* 4. Workout Duration */}
                          <div className="flex items-center justify-between py-3.5 border-b border-zinc-900/40">
                            <span className="text-zinc-500 text-xs uppercase font-bold tracking-wider whitespace-nowrap">Workout Duration</span>
                            <span className="text-white text-sm font-semibold text-right ml-4">{latestPlan.workoutDuration || localData?.workoutDuration || "--"} mins</span>
                          </div>

                          {/* 5. Equipment */}
                          <div className="flex items-center justify-between py-3.5 border-b border-zinc-900/40">
                            <span className="text-zinc-500 text-xs uppercase font-bold tracking-wider whitespace-nowrap">Equipment</span>
                            <div className="flex flex-wrap justify-end gap-1.5 ml-4">
                              {Array.isArray(latestPlan.equipment || localData?.equipment) ? (
                                (latestPlan.equipment || localData?.equipment).map((eq, i) => (
                                    <span key={i} className="bg-zinc-900 border border-zinc-800 text-[11px] text-zinc-300 px-2.5 py-0.5 rounded">{eq}</span>
                                  ))
                              ) : (
                                <span className="text-zinc-400 text-sm font-semibold">{latestPlan.equipment || localData?.equipment || "--"}</span>
                              )}
                            </div>
                          </div>

                          {/* 6. Focus Areas */}
                          <div className="flex items-center justify-between py-3.5 border-b border-zinc-900/40">
                            <span className="text-zinc-500 text-xs uppercase font-bold tracking-wider whitespace-nowrap">Focus Areas</span>
                            <div className="flex flex-wrap justify-end gap-1.5 ml-4">
                              {Array.isArray(latestPlan.focusAreas || localData?.focusAreas) ? (
                                (latestPlan.focusAreas || localData?.focusAreas).map((fa, i) => (
                                    <span key={i} className="bg-zinc-900 border border-zinc-800 text-[11px] text-zinc-300 px-2.5 py-0.5 rounded">{fa}</span>
                                  ))
                              ) : (
                                <span className="text-zinc-400 text-sm font-semibold">{latestPlan.focusAreas || localData?.focusAreas || "--"}</span>
                              )}
                            </div>
                          </div>

                          {/* 7. Injuries & Limits */}
                          <div className="flex items-center justify-between py-3.5 border-b border-zinc-900/40">
                            <span className="text-zinc-500 text-xs uppercase font-bold tracking-wider whitespace-nowrap">Injuries & Limits</span>
                            <div className="flex flex-wrap justify-end gap-1.5 ml-4">
                              {Array.isArray(latestPlan.injuries || localData?.injuries) ? (
                                (latestPlan.injuries || localData?.injuries).map((inj, i) => (
                                    <span key={i} className="bg-red-950/20 border border-red-900/30 text-[11px] text-red-300 px-2.5 py-0.5 rounded">{inj}</span>
                                  ))
                              ) : (
                                <span className="text-zinc-400 text-sm font-semibold">{latestPlan.injuries || localData?.injuries || "--"}</span>
                              )}
                            </div>
                          </div>

                          {/* 8. Country */}
                          <div className="flex items-center justify-between py-3.5 border-b border-zinc-900/40">
                            <span className="text-zinc-500 text-xs uppercase font-bold tracking-wider whitespace-nowrap">Country</span>
                            <span className="text-white text-sm font-semibold text-right ml-4">{latestPlan.country || localData?.country || "--"}</span>
                          </div>

                          {/* 9. State / Region */}
                          <div className="flex items-center justify-between py-3.5 border-b md:border-b-0 border-zinc-900/40">
                            <span className="text-zinc-500 text-xs uppercase font-bold tracking-wider whitespace-nowrap">State / Region</span>
                            <span className="text-white text-sm font-semibold text-right ml-4">{latestPlan.state || localData?.state || "--"}</span>
                          </div>
                        </div>

                        {/* Column 2 */}
                        <div>
                          {/* 10. Lifestyle */}
                          <div className="flex items-center justify-between py-3.5 border-b border-zinc-900/40">
                            <span className="text-zinc-500 text-xs uppercase font-bold tracking-wider whitespace-nowrap">Lifestyle</span>
                            <span className="text-white text-sm font-semibold text-right ml-4">{latestPlan.lifestyle || localData?.lifestyle || "--"}</span>
                          </div>

                          {/* 11. Diet Type */}
                          <div className="flex items-center justify-between py-3.5 border-b border-zinc-900/40">
                            <span className="text-zinc-500 text-xs uppercase font-bold tracking-wider whitespace-nowrap">Diet Type</span>
                            <span className="text-white text-sm font-semibold text-right ml-4">{latestPlan.dietType || localData?.dietType || "--"}</span>
                          </div>

                          {/* 12. Food Budget */}
                          <div className="flex items-center justify-between py-3.5 border-b border-zinc-900/40">
                            <span className="text-zinc-500 text-xs uppercase font-bold tracking-wider whitespace-nowrap">Food Budget</span>
                            <span className="text-white text-sm font-semibold text-right ml-4 whitespace-nowrap">{latestPlan.foodBudget || localData?.foodBudget || "--"}</span>
                          </div>

                          {/* 13. Cooking Access */}
                          <div className="flex items-center justify-between py-3.5 border-b border-zinc-900/40">
                            <span className="text-zinc-500 text-xs uppercase font-bold tracking-wider whitespace-nowrap">Cooking Access</span>
                            <span className="text-white text-sm font-semibold text-right ml-4">{latestPlan.cookingAccess || localData?.cookingAccess || "--"}</span>
                          </div>

                          {/* 14. Meals Per Day */}
                          <div className="flex items-center justify-between py-3.5 border-b border-zinc-900/40">
                            <span className="text-zinc-500 text-xs uppercase font-bold tracking-wider whitespace-nowrap">Meals Per Day</span>
                            <span className="text-white text-sm font-semibold text-right ml-4">{latestPlan.mealsPerDay || localData?.mealsPerDay || "--"}</span>
                          </div>

                          {/* 15. Favorite Foods */}
                          <div className="flex items-center justify-between py-3.5 border-b border-zinc-900/40">
                            <span className="text-zinc-500 text-xs uppercase font-bold tracking-wider whitespace-nowrap">Favorite Foods</span>
                            <span className="text-white text-sm font-semibold text-right ml-4">{latestPlan.favoriteFoods || localData?.favoriteFoods || "--"}</span>
                          </div>

                          {/* 16. Avoided Foods */}
                          <div className="flex items-center justify-between py-3.5 border-b border-zinc-900/40">
                            <span className="text-zinc-500 text-xs uppercase font-bold tracking-wider whitespace-nowrap">Avoided Foods</span>
                            <span className="text-white text-sm font-semibold text-right ml-4">{latestPlan.avoidFoods || localData?.avoidFoods || "--"}</span>
                          </div>

                          {/* 17. Allergies */}
                          <div className="flex items-center justify-between py-3.5">
                            <span className="text-zinc-500 text-xs uppercase font-bold tracking-wider whitespace-nowrap">Allergies</span>
                            <span className="text-red-300 text-sm font-semibold text-right ml-4">{latestPlan.allergies || localData?.allergies || "--"}</span>
                          </div>
                        </div>
                      </div>
                </div>
              ) : localData ? (
                <div className="space-y-6">
                  {/* Primary Stats Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                    <div className="bg-[#A3E635] border border-[#A3E635] rounded-xl p-3.5 flex flex-col justify-between min-h-[88px] transition-all duration-300 shadow-[0_0_15px_rgba(0,0,0,0.2)]">
                      <span className="text-[11px] text-zinc-950/70 uppercase font-bold tracking-wider">Weight</span>
                      <p className="text-xl md:text-2xl font-extrabold text-zinc-950 mt-1">{localData.weight || "--"} <span className="text-xs font-semibold text-zinc-950/80">kg</span></p>
                    </div>
                    <div className="bg-[#A3E635] border border-[#A3E635] rounded-xl p-3.5 flex flex-col justify-between min-h-[88px] transition-all duration-300 shadow-[0_0_15px_rgba(0,0,0,0.2)]">
                      <span className="text-[11px] text-zinc-950/70 uppercase font-bold tracking-wider">Height</span>
                      <p className="text-xl md:text-2xl font-extrabold text-zinc-950 mt-1">{localData.height || "--"} <span className="text-xs font-semibold text-zinc-950/80">cm</span></p>
                    </div>
                    <div className="bg-[#A3E635] border border-[#A3E635] rounded-xl p-3.5 flex flex-col justify-between min-h-[88px] transition-all duration-300 shadow-[0_0_15px_rgba(0,0,0,0.2)]">
                      <span className="text-[11px] text-zinc-950/70 uppercase font-bold tracking-wider">Gender</span>
                      <p className="text-xl md:text-2xl font-extrabold text-zinc-950 mt-1 capitalize">{localData.gender || "--"}</p>
                    </div>
                    <div className="bg-[#A3E635] border border-[#A3E635] rounded-xl p-3.5 flex flex-col justify-between min-h-[88px] transition-all duration-300 shadow-[0_0_15px_rgba(0,0,0,0.2)]">
                      <span className="text-[11px] text-zinc-950/70 uppercase font-bold tracking-wider">BMI</span>
                      {(() => {
                        const bmiVal = localData.weight && localData.height ? (Number(localData.weight) / ((Number(localData.height) / 100) * (Number(localData.height) / 100))).toFixed(1) : "--";
                        return (
                          <div className="flex items-center gap-1.5 mt-1">
                            <p className="text-xl md:text-2xl font-extrabold text-zinc-950">{bmiVal}</p>
                            <span className="bg-zinc-950/90 text-[#A3E635] text-[10px] px-1.5 py-0.5 rounded font-bold">BMI</span>
                          </div>
                        );
                      })()}
                    </div>
                    {localData.bodyFat && (
                      <div className="bg-[#A3E635] border border-[#A3E635] rounded-xl p-3.5 flex flex-col justify-between min-h-[88px] transition-all duration-300 shadow-[0_0_15px_rgba(0,0,0,0.2)]">
                        <span className="text-[11px] text-zinc-950/70 uppercase font-bold tracking-wider">Body Fat</span>
                        <p className="text-xl md:text-2xl font-extrabold text-zinc-950 mt-1">{localData.bodyFat}%</p>
                      </div>
                    )}
                    <div className="bg-[#A3E635] border border-[#A3E635] rounded-xl p-3.5 flex flex-col justify-between min-h-[88px] transition-all duration-300 shadow-[0_0_15px_rgba(0,0,0,0.2)]">
                      <span className="text-[11px] text-zinc-950/70 uppercase font-bold tracking-wider">Frequency</span>
                      <p className="text-xl md:text-2xl font-extrabold text-zinc-950 mt-1">{localData.workoutDays || "--"} <span className="text-xs font-semibold text-zinc-950/80">days/wk</span></p>
                    </div>
                  </div>

                  {/* Secondary Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 lg:gap-x-16 border-t border-zinc-900 pt-5">
                    {/* Left Column */}
                    <div>
                      {/* 1. Fitness Goal */}
                      <div className="flex items-center justify-between py-3.5 border-b border-zinc-900/40">
                        <span className="text-zinc-500 text-xs uppercase font-bold tracking-wider whitespace-nowrap">Fitness Goal</span>
                        <span className="text-[#A3E635] text-sm font-bold text-right ml-4">{localData.goal || "--"}</span>
                      </div>

                      {/* 2. Experience Level */}
                      <div className="flex items-center justify-between py-3.5 border-b border-zinc-900/40">
                        <span className="text-zinc-500 text-xs uppercase font-bold tracking-wider whitespace-nowrap">Experience Level</span>
                        <span className="text-white text-sm font-semibold capitalize text-right ml-4">{localData.fitnessLevel || "--"}</span>
                      </div>

                      {/* 3. Activity Level */}
                      <div className="flex items-center justify-between py-3.5 border-b border-zinc-900/40">
                        <span className="text-zinc-500 text-xs uppercase font-bold tracking-wider whitespace-nowrap">Activity Level</span>
                        <span className="text-white text-sm font-semibold capitalize text-right ml-4">{localData.activityLevel || "--"}</span>
                      </div>

                      {/* 4. Workout Duration */}
                      <div className="flex items-center justify-between py-3.5 border-b border-zinc-900/40">
                        <span className="text-zinc-500 text-xs uppercase font-bold tracking-wider whitespace-nowrap">Workout Duration</span>
                        <span className="text-white text-sm font-semibold text-right ml-4">{localData.workoutDuration || "--"} mins</span>
                      </div>

                      {/* 5. Equipment */}
                      <div className="flex items-center justify-between py-3.5 border-b border-zinc-900/40">
                        <span className="text-zinc-500 text-xs uppercase font-bold tracking-wider whitespace-nowrap">Equipment</span>
                        <div className="flex flex-wrap justify-end gap-1.5 ml-4">
                          {Array.isArray(localData.equipment) ? (
                            localData.equipment.map((eq, i) => (
                              <span key={i} className="bg-zinc-900 border border-zinc-800 text-[11px] text-zinc-300 px-2.5 py-0.5 rounded">{eq}</span>
                            ))
                          ) : (
                            <span className="text-zinc-400 text-sm font-semibold">{localData.equipment || "--"}</span>
                          )}
                        </div>
                      </div>

                      {/* 6. Focus Areas */}
                      <div className="flex items-center justify-between py-3.5 border-b border-zinc-900/40">
                        <span className="text-zinc-500 text-xs uppercase font-bold tracking-wider whitespace-nowrap">Focus Areas</span>
                        <div className="flex flex-wrap justify-end gap-1.5 ml-4">
                          {Array.isArray(localData.focusAreas) ? (
                            localData.focusAreas.map((fa, i) => (
                              <span key={i} className="bg-zinc-900 border border-zinc-800 text-[11px] text-zinc-300 px-2.5 py-0.5 rounded">{fa}</span>
                            ))
                          ) : (
                            <span className="text-zinc-400 text-sm font-semibold">{localData.focusAreas || "--"}</span>
                          )}
                        </div>
                      </div>

                      {/* 7. Injuries & Limitations */}
                      <div className="flex items-center justify-between py-3.5 border-b border-zinc-900/40">
                        <span className="text-zinc-500 text-xs uppercase font-bold tracking-wider whitespace-nowrap">Injuries & Limits</span>
                        <div className="flex flex-wrap justify-end gap-1.5 ml-4">
                          {[
                            ...((Array.isArray(localData.injuries) ? localData.injuries : [localData.injuries || "None"]).filter(inj => inj !== "None")),
                            ...(localData.customInjury && localData.customInjury.trim() !== "" ? [localData.customInjury.trim()] : [])
                          ].length > 0 ? (
                            [
                              ...((Array.isArray(localData.injuries) ? localData.injuries : [localData.injuries || "None"]).filter(inj => inj !== "None")),
                              ...(localData.customInjury && localData.customInjury.trim() !== "" ? [localData.customInjury.trim()] : [])
                            ].map((inj, i) => (
                              <span key={i} className="bg-red-950/20 border border-red-900/30 text-[11px] text-red-300 px-2.5 py-0.5 rounded">{inj}</span>
                            ))
                          ) : (
                            <span className="text-zinc-400 text-sm font-semibold">None</span>
                          )}
                        </div>
                      </div>

                      {/* 8. Country */}
                      <div className="flex items-center justify-between py-3.5 border-b border-zinc-900/40">
                        <span className="text-zinc-500 text-xs uppercase font-bold tracking-wider whitespace-nowrap">Country</span>
                        <span className="text-white text-sm font-semibold text-right ml-4">{localData.country || "--"}</span>
                      </div>

                      {/* 9. State / Region */}
                      <div className="flex items-center justify-between py-3.5 border-b md:border-b-0 border-zinc-900/40">
                        <span className="text-zinc-500 text-xs uppercase font-bold tracking-wider whitespace-nowrap">State / Region</span>
                        <span className="text-white text-sm font-semibold text-right ml-4">{localData.state || "--"}</span>
                      </div>
                    </div>

                    {/* Column 2 */}
                    <div>
                      {/* 10. Lifestyle */}
                      <div className="flex items-center justify-between py-3.5 border-b border-zinc-900/40">
                        <span className="text-zinc-500 text-xs uppercase font-bold tracking-wider whitespace-nowrap">Lifestyle</span>
                        <span className="text-white text-sm font-semibold text-right ml-4">{localData.lifestyle || "--"}</span>
                      </div>

                      {/* 11. Diet Type */}
                      <div className="flex items-center justify-between py-3.5 border-b border-zinc-900/40">
                        <span className="text-zinc-500 text-xs uppercase font-bold tracking-wider whitespace-nowrap">Diet Type</span>
                        <span className="text-white text-sm font-semibold text-right ml-4">{localData.dietType || "--"}</span>
                      </div>

                      {/* 12. Food Budget */}
                      <div className="flex items-center justify-between py-3.5 border-b border-zinc-900/40">
                        <span className="text-zinc-500 text-xs uppercase font-bold tracking-wider whitespace-nowrap">Food Budget</span>
                        <span className="text-white text-sm font-semibold text-right ml-4 whitespace-nowrap">{localData.foodBudget || "--"}</span>
                      </div>

                      {/* 13. Cooking Access */}
                      <div className="flex items-center justify-between py-3.5 border-b border-zinc-900/40">
                        <span className="text-zinc-500 text-xs uppercase font-bold tracking-wider whitespace-nowrap">Cooking Access</span>
                        <span className="text-white text-sm font-semibold text-right ml-4">{localData.cookingAccess || "--"}</span>
                      </div>

                      {/* 14. Meals Per Day */}
                      <div className="flex items-center justify-between py-3.5 border-b border-zinc-900/40">
                        <span className="text-zinc-500 text-xs uppercase font-bold tracking-wider whitespace-nowrap">Meals Per Day</span>
                        <span className="text-white text-sm font-semibold text-right ml-4">{localData.mealsPerDay || "--"}</span>
                      </div>

                      {/* 15. Favorite Foods */}
                      <div className="flex items-center justify-between py-3.5 border-b border-zinc-900/40">
                        <span className="text-zinc-500 text-xs uppercase font-bold tracking-wider whitespace-nowrap">Favorite Foods</span>
                        <span className="text-white text-sm font-semibold text-right ml-4">{localData.favoriteFoods || "--"}</span>
                      </div>

                      {/* 16. Avoided Foods */}
                      <div className="flex items-center justify-between py-3.5 border-b border-zinc-900/40">
                        <span className="text-zinc-500 text-xs uppercase font-bold tracking-wider whitespace-nowrap">Avoided Foods</span>
                        <span className="text-white text-sm font-semibold text-right ml-4">{localData.avoidFoods || "--"}</span>
                      </div>

                      {/* 17. Allergies */}
                      <div className="flex items-center justify-between py-3.5">
                        <span className="text-zinc-500 text-xs uppercase font-bold tracking-wider whitespace-nowrap">Allergies</span>
                        <span className="text-red-300 text-sm font-semibold text-right ml-4">{localData.allergies || "--"}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Activity className="w-10 h-10 text-zinc-700 mx-auto mb-3" />
                  <p className="text-zinc-500 text-sm mb-4">No metrics configured yet.</p>
                  <Button 
                    onClick={() => navigate("/")}
                    variant="outline"
                    className="w-full border-zinc-800 text-zinc-300 hover:bg-zinc-900 hover:text-white rounded-xl py-2.5"
                  >
                    Start Assessment
                  </Button>
                </div>
              )}

              {/* Recommendation Note */}
              <div className="bg-zinc-900/40 border border-zinc-850 rounded-xl px-4 py-3 mt-6 flex items-center gap-2.5 text-xs text-zinc-400">
                <Sparkles className="w-4 h-4 text-[#A3E635] shrink-0" />
                <span>
                  We recommend updating your profile and regenerating a plan every <strong className="text-zinc-200">8 weeks</strong> (or whenever your weight or fitness goals change) to keep your recommendations accurate.
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Active Program Sidebar Card */}
          <div className="lg:col-span-1 flex flex-col gap-6">
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-xl p-4">
                {error}
              </div>
            )}

            <div className="bg-zinc-950 border border-zinc-850 rounded-2xl p-6 flex flex-col h-full justify-between min-h-[380px] shadow-[0_0_20px_rgba(0,0,0,0.3)]">
              <div>
                <div className="flex items-center gap-2 mb-4 border-b border-zinc-900 pb-4">
                  <Dumbbell className="w-5 h-5 text-[#A3E635]" />
                  <h2 className="text-lg font-bold">Active Program</h2>
                </div>
                {latestPlan ? (
                  <div className="space-y-4">
                    <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-xl p-4">
                      <span className="text-[10px] text-[#A3E635] uppercase font-black tracking-wider block mb-1">Current Target</span>
                      <h3 className="text-lg font-bold text-white mb-1">{latestPlan.goal || "Build Muscle"}</h3>
                      <p className="text-xs text-zinc-400">Created: {new Date(latestPlan.createdAt).toLocaleDateString()}</p>
                    </div>
                    
                    {(() => {
                      // Parse daily targets from the generated diet plan text (same approach as YourPlan)
                      const dailyTargets = [];
                      const nutrientKeywords = ["calori", "protein", "carb", "fat", "fiber", "water", "sodium"];
                      if (latestPlan.dietPlan) {
                        const lines = latestPlan.dietPlan.split("\n");
                        let inTargets = false;
                        for (let line of lines) {
                          const trimmed = line.trim();
                          if (!trimmed) continue;
                          const cleanLower = trimmed.replace(/#/g, "").replace(/\*\*|\*/g, "").trim().toLowerCase();
                          if (cleanLower.includes("daily targets") || cleanLower.includes("daily nutrition targets") || cleanLower.includes("nutrient targets") || cleanLower.includes("daily nutrition target")) {
                            inTargets = true;
                            continue;
                          }
                          if (!inTargets) continue;
                          // Stop parsing when a new section starts (day header, meal plan, sample, etc.)
                          if (cleanLower.startsWith("day ") || cleanLower.startsWith("## ") || cleanLower.startsWith("### ") || cleanLower.includes("meal 1") || cleanLower.includes("sample") || cleanLower.includes("meal plan")) {
                            break;
                          }
                          // Only capture lines that look like nutrient targets (contain a known keyword + colon)
                          if ((trimmed.startsWith("*") || trimmed.startsWith("-") || trimmed.includes(":")) && trimmed.includes(":")) {
                            const cleaned = trimmed.replace(/^[\*\-\s]+/, "").replace(/\*\*|\*/g, "").trim();
                            const colonIdx = cleaned.indexOf(":");
                            if (colonIdx !== -1) {
                              const label = cleaned.substring(0, colonIdx).trim().toLowerCase();
                              // Only add if the label matches a known nutrient keyword
                              if (nutrientKeywords.some(kw => label.includes(kw))) {
                                dailyTargets.push(cleaned);
                              }
                            }
                          }
                        }
                      }

                      // Map for icons and colors
                      const iconMap = {
                        calories: <Flame className="w-3.5 h-3.5 text-orange-400" />,
                        protein: <Dumbbell className="w-3.5 h-3.5 text-blue-400" />,
                        carbs: <TrendingUp className="w-3.5 h-3.5 text-yellow-400" />,
                        carbohydrates: <TrendingUp className="w-3.5 h-3.5 text-yellow-400" />,
                        fat: <Droplet className="w-3.5 h-3.5 text-pink-400" />,
                        fats: <Droplet className="w-3.5 h-3.5 text-pink-400" />,
                        fiber: <Target className="w-3.5 h-3.5 text-emerald-400" />,
                      };

                      // Estimate workout calorie burn per workout session (~6-8 kcal per min based on weight/duration)
                      const duration = Number(latestPlan.workoutDuration || localData?.workoutDuration || 60);
                      const weight = Number(latestPlan.weight || localData?.weight || 70);
                      const estimatedBurn = Math.round(duration * (weight * 0.08));

                      if (dailyTargets.length > 0) {
                        // Ensure Fiber is present even if AI output missed it
                        const hasFiber = dailyTargets.some(t => t.toLowerCase().includes("fiber"));
                        if (!hasFiber) {
                          const computed = calculateTargets(latestPlan);
                          dailyTargets.push(`Fiber: ${computed.fiber}g`);
                        }

                        return (
                          <div className="space-y-1">
                            <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider block mb-2">Daily Nutrition & Burn Targets</span>
                            <div className="flex justify-between text-sm py-2.5 border-b border-zinc-900/60">
                              <span className="text-zinc-500 font-medium flex items-center gap-1.5"><Activity className="w-3.5 h-3.5 text-red-400" />Calorie Burn (Workout):</span>
                              <span className="text-red-400 font-bold">~{estimatedBurn} kcal/session</span>
                            </div>
                            {dailyTargets.map((target, idx) => {
                              const colonIdx = target.indexOf(":");
                              let label = `Target ${idx + 1}`;
                              let val = target;
                              if (colonIdx !== -1) {
                                label = target.substring(0, colonIdx).trim();
                                val = target.substring(colonIdx + 1).trim();
                              }
                              const icon = iconMap[label.toLowerCase()] || <Target className="w-3.5 h-3.5 text-zinc-500" />;
                              const isCalories = label.toLowerCase().includes("calori");
                              return (
                                <div key={idx} className="flex justify-between text-sm py-2.5 border-b border-zinc-900/60 last:border-b-0">
                                  <span className="text-zinc-500 font-medium flex items-center gap-1.5">{icon}{label}:</span>
                                  <span className={`${isCalories ? "text-[#A3E635]" : "text-white"} font-bold`}>{val}</span>
                                </div>
                              );
                            })}
                          </div>
                        );
                      }

                      // Fallback to getDietSummary if parsing fails
                      const diet = getDietSummary(latestPlan);
                      return (
                        <div className="space-y-1">
                          <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider block mb-2">Daily Nutrition & Burn Targets</span>
                          <div className="flex justify-between text-sm py-2.5 border-b border-zinc-900/60">
                            <span className="text-zinc-500 font-medium flex items-center gap-1.5"><Activity className="w-3.5 h-3.5 text-red-400" />Calorie Burn (Workout):</span>
                            <span className="text-red-400 font-bold">~{estimatedBurn} kcal/session</span>
                          </div>
                          <div className="flex justify-between text-sm py-2.5 border-b border-zinc-900/60">
                            <span className="text-zinc-500 font-medium flex items-center gap-1.5"><Flame className="w-3.5 h-3.5 text-orange-400" />Calories (Intake):</span>
                            <span className="text-[#A3E635] font-bold">{diet.calories}</span>
                          </div>
                          <div className="flex justify-between text-sm py-2.5 border-b border-zinc-900/60">
                            <span className="text-zinc-500 font-medium flex items-center gap-1.5"><Dumbbell className="w-3.5 h-3.5 text-blue-400" />Protein:</span>
                            <span className="text-white font-bold">{diet.protein}</span>
                          </div>
                          <div className="flex justify-between text-sm py-2.5 border-b border-zinc-900/60">
                            <span className="text-zinc-500 font-medium flex items-center gap-1.5"><TrendingUp className="w-3.5 h-3.5 text-yellow-400" />Carbs:</span>
                            <span className="text-white font-bold">{diet.carbs}</span>
                          </div>
                          <div className="flex justify-between text-sm py-2.5 border-b border-zinc-900/60">
                            <span className="text-zinc-500 font-medium flex items-center gap-1.5"><Droplet className="w-3.5 h-3.5 text-pink-400" />Fat:</span>
                            <span className="text-white font-bold">{diet.fat}</span>
                          </div>
                          <div className="flex justify-between text-sm py-2.5">
                            <span className="text-zinc-500 font-medium flex items-center gap-1.5"><Target className="w-3.5 h-3.5 text-emerald-400" />Fiber:</span>
                            <span className="text-white font-bold">{diet.fiber}</span>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <Dumbbell className="w-12 h-12 text-zinc-800 mx-auto mb-4 animate-pulse" />
                    <h3 className="font-bold text-base mb-1">No Program Generated</h3>
                    <p className="text-xs text-zinc-500 max-w-xs mx-auto">
                      You haven't generated any AI fitness plans yet. Start the Generator to create your customized split.
                    </p>
                  </div>
                )}
              </div>

              <div className="space-y-3 mt-6">
                {latestPlan ? (
                  <>
                    <Button 
                      onClick={() => navigate("/plan")}
                      className="w-full bg-[#A3E635] text-black hover:bg-[#b8e600] font-bold text-sm py-3.5 rounded-xl shadow-lg shadow-[#A3E635]/10 hover:shadow-[#A3E635]/15 transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <span>View Workout & Diet Plan</span>
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                    <Button 
                      onClick={() => navigate("/generate")}
                      variant="outline"
                      className="w-full border-zinc-800 text-zinc-300 hover:bg-zinc-900 hover:text-white rounded-xl py-3 cursor-pointer text-xs"
                    >
                      Regenerate Program
                    </Button>
                    <p className="text-[11px] text-zinc-600 text-center mt-1 leading-relaxed">
                      We recommend regenerating your program every <span className="text-zinc-400 font-semibold">8 weeks</span> to keep your progress on track.
                    </p>
                  </>
                ) : (
                  <Button 
                    onClick={() => navigate("/generate")}
                    className="w-full bg-[#A3E635] text-black font-bold text-sm py-3 rounded-xl hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    Go to Generator
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>

        </div>
      </main>

      {/* Update Metrics Modal Overlay */}
      {isEditing && editData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden my-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-900 bg-black/40">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#A3E635]/10 border border-[#A3E635]/20 flex items-center justify-center text-[#A3E635]">
                  <Edit2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-white">Update Metrics Profile</h3>
                  <p className="text-xs text-zinc-400">Modify your physical stats, fitness goals, and lifestyle options</p>
                </div>
              </div>
              <button 
                onClick={() => setIsEditing(false)}
                className="text-zinc-400 hover:text-white p-2 rounded-xl hover:bg-zinc-900 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body - Form Inputs */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
              {validationError && (
                <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-3.5 rounded-xl text-xs flex items-center gap-2.5">
                  <ShieldAlert className="w-4 h-4 shrink-0 text-red-400" />
                  <span className="font-semibold">{validationError}</span>
                </div>
              )}
              
              {/* Section 1: Body & Physical Stats */}
              <div className="space-y-4">
                <h4 className="text-xs uppercase font-extrabold tracking-wider text-[#A3E635] flex items-center gap-2">
                  <Scale className="w-4 h-4" /> Physical Measurements
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-zinc-400 font-semibold mb-1.5">Weight (kg)</label>
                    <input 
                      type="number"
                      step="0.1"
                      value={editData.weight}
                      onChange={(e) => setEditData({ ...editData, weight: e.target.value })}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-white font-bold focus:border-[#A3E635] focus:outline-none"
                      placeholder="e.g. 70"
                    />
                  </div>
                  <div>
                    <label className="block text-zinc-400 font-semibold mb-1.5">Height (cm)</label>
                    <input 
                      type="number"
                      value={editData.height}
                      onChange={(e) => setEditData({ ...editData, height: e.target.value })}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-white font-bold focus:border-[#A3E635] focus:outline-none"
                      placeholder="e.g. 175"
                    />
                  </div>
                  <div>
                    <label className="block text-zinc-400 font-semibold mb-1.5">Gender</label>
                    <select 
                      value={editData.gender}
                      onChange={(e) => setEditData({ ...editData, gender: e.target.value })}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-white font-bold focus:border-[#A3E635] focus:outline-none cursor-pointer"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Prefer not to say">Prefer not to say</option>
                    </select>
                  </div>
                </div>

                {/* Calculated BMI Badge */}
                <div className="bg-zinc-900/60 border border-zinc-850 rounded-xl p-3 flex items-center justify-between">
                  <span className="text-zinc-400 font-semibold">Computed BMI:</span>
                  <div className="flex items-center gap-2">
                    <span className="text-base font-extrabold text-white">{getCalculatedBmi()}</span>
                    {getCalculatedBmi() !== "--" && (
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${getBmiStatus(Number(getCalculatedBmi())).color}`}>
                        {getBmiStatus(Number(getCalculatedBmi())).label}
                      </span>
                    )}
                  </div>
                </div>

                {/* Body Fat Mode Toggle */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <label className="text-zinc-400 font-semibold">Body Fat Percentage</label>
                    <div className="flex items-center gap-1 bg-zinc-900 border border-zinc-800 p-1 rounded-xl">
                      <button
                        type="button"
                        onClick={() => setEditData({ ...editData, bodyFatMode: "manual" })}
                        className={`px-3 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                          editData.bodyFatMode === "manual" ? "bg-[#A3E635] text-black" : "text-zinc-400 hover:text-white"
                        }`}
                      >
                        Manual %
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditData({ ...editData, bodyFatMode: "navy" })}
                        className={`px-3 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                          editData.bodyFatMode === "navy" ? "bg-[#A3E635] text-black" : "text-zinc-400 hover:text-white"
                        }`}
                      >
                        Navy Method
                      </button>
                    </div>
                  </div>

                  {editData.bodyFatMode === "manual" ? (
                    <div>
                      <input 
                        type="number"
                        step="0.1"
                        value={editData.bodyFat}
                        onChange={(e) => setEditData({ ...editData, bodyFat: e.target.value })}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-white font-bold focus:border-[#A3E635] focus:outline-none"
                        placeholder="e.g. 15.5%"
                      />
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-zinc-900/40 p-3.5 border border-zinc-850 rounded-xl">
                      <div>
                        <label className="block text-zinc-400 font-semibold mb-1">Neck (cm)</label>
                        <input 
                          type="number"
                          value={editData.neck}
                          onChange={(e) => setEditData({ ...editData, neck: e.target.value })}
                          className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-white font-bold focus:border-[#A3E635] focus:outline-none"
                          placeholder="e.g. 38"
                        />
                      </div>
                      <div>
                        <label className="block text-zinc-400 font-semibold mb-1">Waist (cm)</label>
                        <input 
                          type="number"
                          value={editData.waist}
                          onChange={(e) => setEditData({ ...editData, waist: e.target.value })}
                          className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-white font-bold focus:border-[#A3E635] focus:outline-none"
                          placeholder="e.g. 82"
                        />
                      </div>
                      {editData.gender?.toLowerCase() === "female" && (
                        <div>
                          <label className="block text-zinc-400 font-semibold mb-1">Hips (cm)</label>
                          <input 
                            type="number"
                            value={editData.hips}
                            onChange={(e) => setEditData({ ...editData, hips: e.target.value })}
                            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-white font-bold focus:border-[#A3E635] focus:outline-none"
                            placeholder="e.g. 95"
                          />
                        </div>
                      )}
                      <div className="sm:col-span-3 flex items-center justify-between text-[11px] pt-1 text-zinc-400">
                        <span>Estimated Body Fat:</span>
                        <span className="text-sm font-extrabold text-[#A3E635]">{getCalculatedBodyFat()}%</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Section 2: Fitness Goals & Training */}
              <div className="border-t border-zinc-900 pt-4 space-y-4">
                <h4 className="text-xs uppercase font-extrabold tracking-wider text-[#A3E635] flex items-center gap-2">
                  <Target className="w-4 h-4" /> Fitness & Training Goals
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-zinc-400 font-semibold mb-1.5">Primary Fitness Goal</label>
                    <select 
                      value={editData.goal}
                      onChange={(e) => setEditData({ ...editData, goal: e.target.value })}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-white font-bold focus:border-[#A3E635] focus:outline-none cursor-pointer"
                    >
                      <option value="Lose Fat / Weight Loss">Lose Fat / Weight Loss</option>
                      <option value="Build Muscle / Gain Mass">Build Muscle / Gain Mass</option>
                      <option value="Increase Strength">Increase Strength</option>
                      <option value="Improve Endurance">Improve Endurance</option>
                      <option value="General Fitness">General Fitness</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-zinc-400 font-semibold mb-1.5">Workout Frequency (days/week)</label>
                    <select 
                      value={editData.workoutDays}
                      onChange={(e) => setEditData({ ...editData, workoutDays: e.target.value })}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-white font-bold focus:border-[#A3E635] focus:outline-none cursor-pointer"
                    >
                      {[2, 3, 4, 5, 6, 7].map(d => (
                        <option key={d} value={d}>{d} Days / Week</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-zinc-400 font-semibold mb-1.5">Experience Level</label>
                    <select 
                      value={editData.fitnessLevel}
                      onChange={(e) => setEditData({ ...editData, fitnessLevel: e.target.value })}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-white font-bold focus:border-[#A3E635] focus:outline-none cursor-pointer"
                    >
                      <option value="Beginner">Beginner</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Advanced">Advanced</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-zinc-400 font-semibold mb-1.5">Activity Level</label>
                    <select 
                      value={editData.activityLevel}
                      onChange={(e) => setEditData({ ...editData, activityLevel: e.target.value })}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-white font-bold focus:border-[#A3E635] focus:outline-none cursor-pointer"
                    >
                      <option value="Sedentary">Sedentary (Desk Job)</option>
                      <option value="Lightly Active">Lightly Active (1-3 days workout)</option>
                      <option value="Moderate Active">Moderate Active (3-5 days workout)</option>
                      <option value="Very Active">Very Active (6-7 days workout)</option>
                      <option value="Extra Active">Extra Active (Physical job)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-zinc-400 font-semibold mb-1.5">Workout Duration (mins)</label>
                    <select 
                      value={editData.workoutDuration}
                      onChange={(e) => setEditData({ ...editData, workoutDuration: e.target.value })}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-white font-bold focus:border-[#A3E635] focus:outline-none cursor-pointer"
                    >
                      {[30, 45, 60, 75, 90, 120].map(m => (
                        <option key={m} value={m}>{m} Minutes</option>
                      ))}
                    </select>
                  </div>
                  <div className="relative">
                    <label className="block text-zinc-400 font-semibold mb-1.5">Equipment Available</label>
                    {(() => {
                      const currentEqList = typeof editData.equipment === "string" 
                        ? editData.equipment.split(",").map(s => s.trim()).filter(Boolean)
                        : (Array.isArray(editData.equipment) ? editData.equipment : []);

                      return (
                        <>
                          <button
                            type="button"
                            onClick={() => setEquipmentDropdownOpen(!equipmentDropdownOpen)}
                            className="w-full bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-xl px-3.5 py-2.5 text-white font-medium text-left flex items-center justify-between transition-all cursor-pointer min-h-[42px]"
                          >
                            <div className="flex flex-wrap gap-1.5 items-center overflow-hidden pr-2">
                              {currentEqList.length > 0 ? (
                                currentEqList.map((eq, i) => (
                                  <span key={i} className="bg-[#A3E635]/15 text-[#A3E635] border border-[#A3E635]/30 text-[11px] font-bold px-2 py-0.5 rounded-lg flex items-center gap-1">
                                    {eq}
                                  </span>
                                ))
                              ) : (
                                <span className="text-zinc-500">Select equipment options...</span>
                              )}
                            </div>
                            <ChevronDown className={`w-4 h-4 text-zinc-400 shrink-0 transition-transform duration-200 ${equipmentDropdownOpen ? "rotate-180 text-[#A3E635]" : ""}`} />
                          </button>

                          {equipmentDropdownOpen && (
                            <div className="absolute left-0 right-0 top-full mt-2 bg-zinc-950 border border-zinc-800 rounded-xl p-3.5 z-40 shadow-2xl space-y-3">
                              <div className="flex items-center justify-between text-[11px] font-bold text-zinc-400 border-b border-zinc-900 pb-2">
                                <span className="uppercase tracking-wider">Assessment Equipment Options</span>
                                <span className="text-zinc-500 font-normal">Click to toggle</span>
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1 custom-scrollbar">
                                {[
                                  { label: "Full Gym", desc: "Access to barbells, dumbbells, cables, machines" },
                                  { label: "Dumbbells", desc: "Standard pair of dumbbells" },
                                  { label: "Barbells", desc: "Olympic or standard barbell set" },
                                  { label: "Machines", desc: "Selectorized cable and plate machines" },
                                  { label: "Resistance Bands", desc: "Elastic loop or tube bands" },
                                  { label: "Kettlebells", desc: "Kettlebells for functional work" },
                                  { label: "Bodyweight Only", desc: "No equipment / Calisthenics" }
                                ].map((item) => {
                                  const isSelected = currentEqList.includes(item.label);
                                  return (
                                    <button
                                      key={item.label}
                                      type="button"
                                      onClick={() => toggleEquipmentOption(item.label)}
                                      className={`p-2.5 rounded-xl text-left border transition-all cursor-pointer flex items-center justify-between gap-2 ${
                                        isSelected 
                                          ? "bg-[#A3E635]/15 border-[#A3E635] text-white shadow-sm" 
                                          : "bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-white"
                                      }`}
                                    >
                                      <div>
                                        <div className={`font-bold text-xs ${isSelected ? "text-[#A3E635]" : "text-zinc-200"}`}>{item.label}</div>
                                        <div className="text-[10px] text-zinc-500 line-clamp-1">{item.desc}</div>
                                      </div>
                                      {isSelected && <span className="w-2.5 h-2.5 rounded-full bg-[#A3E635] shrink-0 shadow-[0_0_8px_#A3E635]" />}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </>
                      );
                    })()}
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Focus Areas Dropdown */}
                  <div className="relative">
                    <label className="block text-zinc-400 font-semibold mb-1.5">Focus Muscle Groups</label>
                    {(() => {
                      const currentFaList = typeof editData.focusAreas === "string" 
                        ? editData.focusAreas.split(",").map(s => s.trim()).filter(Boolean)
                        : (Array.isArray(editData.focusAreas) ? editData.focusAreas : []);

                      return (
                        <>
                          <button
                            type="button"
                            onClick={() => {
                              setFocusAreasDropdownOpen(!focusAreasDropdownOpen);
                              setEquipmentDropdownOpen(false);
                              setInjuriesDropdownOpen(false);
                            }}
                            className="w-full bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-xl px-3.5 py-2.5 text-white font-medium text-left flex items-center justify-between transition-all cursor-pointer min-h-[42px]"
                          >
                            <div className="flex flex-wrap gap-1.5 items-center overflow-hidden pr-2">
                              {currentFaList.length > 0 ? (
                                currentFaList.map((fa, i) => (
                                  <span key={i} className="bg-[#A3E635]/15 text-[#A3E635] border border-[#A3E635]/30 text-[11px] font-bold px-2 py-0.5 rounded-lg flex items-center gap-1">
                                    {fa}
                                  </span>
                                ))
                              ) : (
                                <span className="text-zinc-500">Select focus muscle groups...</span>
                              )}
                            </div>
                            <ChevronDown className={`w-4 h-4 text-zinc-400 shrink-0 transition-transform duration-200 ${focusAreasDropdownOpen ? "rotate-180 text-[#A3E635]" : ""}`} />
                          </button>

                          {focusAreasDropdownOpen && (
                            <div className="absolute left-0 right-0 top-full mt-2 bg-zinc-950 border border-zinc-800 rounded-xl p-3.5 z-40 shadow-2xl space-y-3">
                              <div className="flex items-center justify-between text-[11px] font-bold text-zinc-400 border-b border-zinc-900 pb-2">
                                <span className="uppercase tracking-wider">Assessment Muscle Groups</span>
                                <span className="text-zinc-500 font-normal">Click to toggle</span>
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1 custom-scrollbar">
                                {[
                                  { label: "Chest", desc: "Pectorals" },
                                  { label: "Back", desc: "Lats & Traps" },
                                  { label: "Shoulders", desc: "Deltoids" },
                                  { label: "Arms", desc: "Biceps / Triceps" },
                                  { label: "Legs", desc: "Quads / Hamstrings" },
                                  { label: "Glutes", desc: "Posterior Chain" },
                                  { label: "Core", desc: "Abs / Core" },
                                  { label: "Full Body", desc: "All Muscle Groups" }
                                ].map((item) => {
                                  const isSelected = currentFaList.includes(item.label);
                                  return (
                                    <button
                                      key={item.label}
                                      type="button"
                                      onClick={() => toggleFocusAreaOption(item.label)}
                                      className={`p-2.5 rounded-xl text-left border transition-all cursor-pointer flex items-center justify-between gap-2 ${
                                        isSelected 
                                          ? "bg-[#A3E635]/15 border-[#A3E635] text-white shadow-sm" 
                                          : "bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-white"
                                      }`}
                                    >
                                      <div>
                                        <div className={`font-bold text-xs ${isSelected ? "text-[#A3E635]" : "text-zinc-200"}`}>{item.label}</div>
                                        <div className="text-[10px] text-zinc-500 line-clamp-1">{item.desc}</div>
                                      </div>
                                      {isSelected && <span className="w-2.5 h-2.5 rounded-full bg-[#A3E635] shrink-0 shadow-[0_0_8px_#A3E635]" />}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </>
                      );
                    })()}
                  </div>

                  {/* Injuries & Restrictions Dropdown */}
                  <div className="relative">
                    <label className="block text-zinc-400 font-semibold mb-1.5">Injuries & Restrictions</label>
                    {(() => {
                      const currentInjList = typeof editData.injuries === "string" 
                        ? editData.injuries.split(",").map(s => s.trim()).filter(Boolean)
                        : (Array.isArray(editData.injuries) ? editData.injuries : []);

                      const hasCustom = editData.customInjury && editData.customInjury.trim();

                      return (
                        <>
                          <button
                            type="button"
                            onClick={() => {
                              setInjuriesDropdownOpen(!injuriesDropdownOpen);
                              setEquipmentDropdownOpen(false);
                              setFocusAreasDropdownOpen(false);
                            }}
                            className="w-full bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-xl px-3.5 py-2.5 text-white font-medium text-left flex items-center justify-between transition-all cursor-pointer min-h-[42px]"
                          >
                            <div className="flex flex-wrap gap-1.5 items-center overflow-hidden pr-2">
                              {currentInjList.map((inj, i) => (
                                <span 
                                  key={i} 
                                  className={`border text-[11px] font-bold px-2 py-0.5 rounded-lg flex items-center gap-1 ${
                                    inj === "None" 
                                      ? "bg-[#A3E635]/15 text-[#A3E635] border-[#A3E635]/30" 
                                      : "bg-red-500/15 text-red-400 border-red-500/30"
                                  }`}
                                >
                                  {inj}
                                </span>
                              ))}
                              {hasCustom && (
                                <span className="bg-red-500/15 text-red-400 border border-red-500/30 text-[11px] font-bold px-2 py-0.5 rounded-lg flex items-center gap-1">
                                  {editData.customInjury.trim()}
                                </span>
                              )}
                            </div>
                            <ChevronDown className={`w-4 h-4 text-zinc-400 shrink-0 transition-transform duration-200 ${injuriesDropdownOpen ? "rotate-180 text-[#A3E635]" : ""}`} />
                          </button>

                          {injuriesDropdownOpen && (
                            <div className="absolute left-0 right-0 top-full mt-2 bg-zinc-950 border border-zinc-800 rounded-xl p-3.5 z-40 shadow-2xl space-y-3">
                              <div className="flex items-center justify-between text-[11px] font-bold text-zinc-400 border-b border-zinc-900 pb-2">
                                <span className="uppercase tracking-wider">Assessment Injury Options</span>
                                <span className="text-zinc-500 font-normal">Select preset or type custom</span>
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1 custom-scrollbar">
                                {[
                                  { label: "None", desc: "Pain-free training" },
                                  { label: "Shoulder", desc: "AC joint or rotator cuff" },
                                  { label: "Knee", desc: "Patella or joint discomfort" },
                                  { label: "Lower Back", desc: "Lumbar stiffness or tightness" },
                                  { label: "Elbow", desc: "Tendonitis or joint wear" },
                                  { label: "Wrist", desc: "Sprain or compression soreness" },
                                  { label: "Neck", desc: "Stiffness or cervical strain" }
                                ].map((item) => {
                                  const isSelected = currentInjList.includes(item.label);
                                  const isNone = item.label === "None";
                                  return (
                                    <button
                                      key={item.label}
                                      type="button"
                                      onClick={() => toggleInjuryOption(item.label)}
                                      className={`p-2.5 rounded-xl text-left border transition-all cursor-pointer flex items-center justify-between gap-2 ${
                                        isSelected 
                                          ? isNone 
                                            ? "bg-[#A3E635]/15 border-[#A3E635] text-white shadow-sm" 
                                            : "bg-red-500/15 border-red-500/50 text-white shadow-sm"
                                          : "bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-white"
                                      }`}
                                    >
                                      <div>
                                        <div className={`font-bold text-xs ${isSelected ? (isNone ? "text-[#A3E635]" : "text-red-400") : "text-zinc-200"}`}>{item.label}</div>
                                        <div className="text-[10px] text-zinc-500 line-clamp-1">{item.desc}</div>
                                      </div>
                                      {isSelected && <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${isNone ? "bg-[#A3E635]" : "bg-red-500"}`} />}
                                    </button>
                                  );
                                })}
                              </div>

                              {/* Custom Injury Input Field (Assessment Validation Logic) */}
                              <div className="pt-2 border-t border-zinc-900 space-y-1.5">
                                <label className="block text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Or type custom injuries / joint pain:</label>
                                <div className="flex items-center gap-2.5 bg-zinc-900 border border-zinc-800 focus-within:border-[#A3E635] rounded-xl px-3 py-2 transition-all">
                                  <ShieldAlert className="w-4 h-4 text-zinc-400 shrink-0" />
                                  <input 
                                    type="text"
                                    value={editData.customInjury || ""}
                                    onChange={(e) => {
                                      const val = e.target.value;
                                      let currentInj = currentInjList;
                                      if (val.trim() !== "" && currentInj.includes("None")) {
                                        currentInj = currentInj.filter(i => i !== "None");
                                      }
                                      setEditData({
                                        ...editData,
                                        customInjury: val,
                                        injuries: currentInj.join(", ")
                                      });
                                      if (val.trim() && !validateCustomInput(val)) {
                                        setValidationError("Custom injury must contain valid text (at least 2 letters, e.g. 'Torn meniscus').");
                                      } else {
                                        setValidationError(null);
                                      }
                                    }}
                                    className="w-full bg-transparent text-xs text-white font-medium outline-none placeholder:text-zinc-600"
                                    placeholder="e.g. Torn meniscus, Fractured finger"
                                  />
                                </div>
                              </div>
                            </div>
                          )}
                        </>
                      );
                    })()}
                  </div>
                </div>
              </div>

              {/* Section 3: Lifestyle & Diet */}
              <div className="border-t border-zinc-900 pt-4 space-y-4">
                <h4 className="text-xs uppercase font-extrabold tracking-wider text-[#A3E635] flex items-center gap-2">
                  <Flame className="w-4 h-4" /> Nutrition & Lifestyle Preferences
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-zinc-400 font-semibold mb-1.5">Lifestyle / Routine</label>
                    <select 
                      value={editData.lifestyle}
                      onChange={(e) => setEditData({ ...editData, lifestyle: e.target.value })}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-white font-bold focus:border-[#A3E635] focus:outline-none cursor-pointer"
                    >
                      <option value="Student">Student (Mix of sitting & walking)</option>
                      <option value="Working Professional">Working Professional (Desk / Office bound)</option>
                      <option value="Self-Employed / Business">Self-Employed / Business (Flexible & active)</option>
                      <option value="Homemaker">Homemaker (Active, managing house tasks)</option>
                      <option value="Retired">Retired (Lower demand, active aging)</option>
                      <option value="Other">Other (Custom routine)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-zinc-400 font-semibold mb-1.5">Diet Type</label>
                    <select 
                      value={editData.dietType}
                      onChange={(e) => setEditData({ ...editData, dietType: e.target.value })}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-white font-bold focus:border-[#A3E635] focus:outline-none cursor-pointer"
                    >
                      <option value="Vegetarian">Vegetarian</option>
                      <option value="Non-Vegetarian">Non-Vegetarian</option>
                      <option value="Eggetarian">Eggetarian</option>
                      <option value="Vegan">Vegan</option>
                      <option value="Keto / Low Carb">Keto / Low Carb</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-zinc-400 font-semibold mb-1.5">Meals Per Day</label>
                    <select 
                      value={editData.mealsPerDay}
                      onChange={(e) => setEditData({ ...editData, mealsPerDay: e.target.value })}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-white font-bold focus:border-[#A3E635] focus:outline-none cursor-pointer"
                    >
                      <option value="2 Meals">2 Meals</option>
                      <option value="3 Meals">3 Meals</option>
                      <option value="4 Meals">4 Meals</option>
                      <option value="5+ Small Meals">5+ Small Meals</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-zinc-400 font-semibold mb-1.5">Favorite Foods</label>
                    <input 
                      type="text"
                      value={editData.favoriteFoods}
                      onChange={(e) => setEditData({ ...editData, favoriteFoods: e.target.value })}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-white font-medium focus:border-[#A3E635] focus:outline-none"
                      placeholder="Chicken, Eggs, Rice, Paneer"
                    />
                  </div>
                  <div>
                    <label className="block text-zinc-400 font-semibold mb-1.5">Avoided Foods / Allergies</label>
                    <input 
                      type="text"
                      value={editData.allergies}
                      onChange={(e) => setEditData({ ...editData, allergies: e.target.value })}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-white font-medium focus:border-[#A3E635] focus:outline-none"
                      placeholder="Lactose, Peanut allergy, Fast food"
                    />
                  </div>
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-zinc-900 bg-black/40">
              <Button 
                type="button"
                onClick={() => setIsEditing(false)}
                variant="outline"
                className="border-zinc-800 text-zinc-300 hover:bg-zinc-900 hover:text-white rounded-xl px-5 py-2.5 text-xs cursor-pointer"
              >
                Cancel
              </Button>
              <Button 
                type="button"
                onClick={handleSaveEdit}
                disabled={isSaving}
                className="bg-[#A3E635] text-black hover:bg-[#b8e600] font-extrabold rounded-xl px-6 py-2.5 text-xs shadow-lg shadow-[#A3E635]/10 cursor-pointer flex items-center gap-2"
              >
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin text-black" /> : <Save className="w-4 h-4" />}
                <span>{isSaving ? "Saving..." : "Save Metrics"}</span>
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;

