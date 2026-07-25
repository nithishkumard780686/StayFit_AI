import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { useSignIn, useSignUp, useAuth, useUser, useClerk } from "../../lib/clerkClient";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { 
  User, Mail, Lock, Check, ChevronLeft, ChevronRight,
  Sparkles, Flame, Activity, ShieldAlert, Award,
  Dumbbell, Calendar, Clock, Smile, Heart,
  Timer, Hourglass, AlarmClock, Zap, Shield, Target, Accessibility,
  Globe, MapPin, Briefcase, Utensils, DollarSign, LogOut
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import DynamicBodySvg from "./DynamicBodySvg";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://127.0.0.1:5001";

// Custom SVG Muscle Group Icons
const ChestIcon = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M4 6 Q 12 8 20 6 L 19 14 Q 12 16 5 14 Z" />
    <path d="M12 7 V15" />
    <path d="M6 10 H18" />
  </svg>
);

const BackIcon = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M4 4 Q 12 6 20 4 L 16 18 Q 12 20 8 18 Z" />
    <path d="M12 5 V19" />
    <path d="M7 11 Q 12 12 17 11" />
  </svg>
);

const ShoulderIcon = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M3 10 C 3 6, 6 4, 12 4 C 18 4, 21 6, 21 10 C 21 15, 17 18, 12 18 C 7 18, 3 15, 3 10 Z" />
    <circle cx="6" cy="10" r="1.5" />
    <circle cx="18" cy="10" r="1.5" />
    <path d="M9 10 H15" />
  </svg>
);

const ArmsIcon = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M3 13 C 3 13 4 8 7 8 C 10 8 11 11 12 11 C 13 11 14 8 17 8 C 20 8 21 13 21 13" />
    <path d="M6 13 C 6 13 8 10 10 13" />
    <path d="M18 13 C 18 13 16 10 14 13" />
  </svg>
);

const LegsIcon = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M8 4 V20 M16 4 V20" />
    <path d="M5 4 H19" />
    <path d="M8 12 H16" />
  </svg>
);

const GlutesIcon = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M12 4 C 16 4, 20 7, 20 12 C 20 17, 16 20, 12 20 C 8 20, 4 17, 4 12 C 4 7, 8 4, 12 4 Z" />
    <path d="M12 4 V20" />
    <path d="M5 12 C 8 14, 16 14, 19 12" />
  </svg>
);

const CoreIcon = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="6" y="4" width="12" height="16" rx="2" />
    <line x1="12" y1="4" x2="12" y2="20" />
    <line x1="6" y1="9" x2="18" y2="9" />
    <line x1="6" y1="15" x2="18" y2="15" />
  </svg>
);

const FullBodyIcon = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="5" r="2.5" />
    <path d="M12 7.5 V15.5 M8.5 10.5 H15.5 M9 20 L12 15.5 L15 20" />
  </svg>
);

const countryList = [
  "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Antigua and Barbuda", "Argentina", "Armenia", "Australia", "Austria",
  "Azerbaijan", "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin", "Bhutan",
  "Bolivia", "Bosnia and Herzegovina", "Botswana", "Brazil", "Brunei", "Bulgaria", "Burkina Faso", "Burundi", "Cabo Verde", "Cambodia",
  "Cameroon", "Canada", "Central African Republic", "Chad", "Chile", "China", "Colombia", "Comoros", "Congo", "Costa Rica",
  "Croatia", "Cuba", "Cyprus", "Czechia", "Denmark", "Djibouti", "Dominica", "Dominican Republic", "East Timor", "Ecuador",
  "Egypt", "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia", "Eswatini", "Ethiopia", "Fiji", "Finland", "France",
  "Gabon", "Gambia", "Georgia", "Germany", "Ghana", "Greece", "Grenada", "Guatemala", "Guinea", "Guinea-Bissau",
  "Guyana", "Haiti", "Honduras", "Hungary", "Iceland", "India", "Indonesia", "Iran", "Iraq", "Ireland",
  "Israel", "Italy", "Jamaica", "Japan", "Jordan", "Kazakhstan", "Kenya", "Kiribati", "Korea, North", "Korea, South",
  "Kosovo", "Kuwait", "Kyrgyzstan", "Laos", "Latvia", "Lebanon", "Lesotho", "Liberia", "Libya", "Liechtenstein",
  "Lithuania", "Luxembourg", "Madagascar", "Malawi", "Malaysia", "Maldives", "Mali", "Malta", "Marshall Islands", "Mauritania",
  "Mauritius", "Mexico", "Micronesia", "Moldova", "Monaco", "Mongolia", "Montenegro", "Morocco", "Mozambique", "Myanmar",
  "Namibia", "Nauru", "Nepal", "Netherlands", "New Zealand", "Nicaragua", "Niger", "Nigeria", "North Macedonia", "Norway",
  "Oman", "Pakistan", "Palau", "Palestine", "Panama", "Papua New Guinea", "Paraguay", "Peru", "Philippines", "Poland",
  "Portugal", "Qatar", "Romania", "Russia", "Rwanda", "Saint Kitts and Nevis", "Saint Lucia", "Saint Vincent and the Grenadines", "Samoa", "San Marino",
  "Sao Tome and Principe", "Saudi Arabia", "Senegal", "Serbia", "Seychelles", "Sierra Leone", "Singapore", "Slovakia", "Slovenia", "Solomon Islands",
  "Somalia", "South Africa", "South Sudan", "Spain", "Sri Lanka", "Sudan", "Suriname", "Sweden", "Switzerland", "Syria",
  "Taiwan", "Tajikistan", "Tanzania", "Thailand", "Togo", "Tonga", "Trinidad and Tobago", "Tunisia", "Turkey", "Turkmenistan",
  "Tuvalu", "Uganda", "Ukraine", "United Arab Emirates", "United Kingdom", "United States", "Uruguay", "Uzbekistan", "Vanuatu", "Vatican City",
  "Venezuela", "Vietnam", "Yemen", "Zambia", "Zimbabwe", "USA", "UK", "UAE"
];

const indiaStates = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", "Haryana",
  "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya",
  "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura",
  "Uttar Pradesh", "Uttarakhand", "West Bengal", "Andaman and Nicobar Islands", "Chandigarh",
  "Dadra and Nagar Haveli and Daman and Diu", "Lakshadweep", "Delhi", "Puducherry", "Jammu and Kashmir", "Ladakh"
];

const usStates = [
  "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut", "Delaware", "Florida", "Georgia",
  "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa", "Kansas", "Kentucky", "Louisiana", "Maine", "Maryland",
  "Massachusetts", "Michigan", "Minnesota", "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada", "New Hampshire", "New Jersey",
  "New Mexico", "New York", "North Carolina", "North Dakota", "Ohio", "Oklahoma", "Oregon", "Pennsylvania", "Rhode Island", "South Carolina",
  "South Dakota", "Tennessee", "Texas", "Utah", "Vermont", "Virginia", "Washington", "West Virginia", "Wisconsin", "Wyoming"
];

const canadaProvinces = [
  "Alberta", "British Columbia", "Manitoba", "New Brunswick", "Newfoundland and Labrador", "Nova Scotia", "Ontario", "Prince Edward Island", "Quebec", "Saskatchewan",
  "Northwest Territories", "Nunavut", "Yukon"
];

const australiaStates = [
  "New South Wales", "Queensland", "South Australia", "Tasmania", "Victoria", "Western Australia", "Australian Capital Territory", "Northern Territory"
];

const LoginSignup = () => {
  const navigate = useNavigate();

  // Refs for auto-tabbing Date of Birth inputs
  const dobDayRef = useRef(null);
  const dobMonthRef = useRef(null);
  const dobYearRef = useRef(null);

  // Onboarding Assessment State
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1); // 1 = forward, -1 = backward

  const [onboarding, setOnboarding] = useState({
    name: "",
    goal: "Lose Fat",
    fitnessLevel: "Beginner",
    activityLevel: "Moderate Active",
    workoutDays: 4,
    workoutDuration: 60,
    equipment: ["Full Gym"],
    gender: "Prefer not to say",
    dobDay: "",
    dobMonth: "",
    dobYear: "",
    dob: "",
    age: "",
    height: "",
    weight: "",
    bodyFat: 18,
    neck: "",
    waist: "",
    hips: "",
    focusAreas: ["Full Body"],
    injuries: ["None"],
    customInjury: "",
    country: "",
    state: "",
    lifestyle: "Working Professional",
    dietType: "Vegetarian",
    foodBudget: "₹6,000 – ₹10,000/month",
    cookingAccess: "Full Kitchen",
    mealsPerDay: "3 Meals",
    favoriteFoods: "",
    avoidFoods: "",
    allergies: ""
  });

  const [bodyFatMode, setBodyFatMode] = useState("slider"); // "slider" or "navy"
  const [validationError, setValidationError] = useState(null);

  useEffect(() => {
    setValidationError(null);
  }, [step]);

  const { signIn, setActive: setSignInActive } = useSignIn();
  const { signUp, setActive: setSignUpActive } = useSignUp();
  const { isSignedIn, isLoaded: isAuthLoaded } = useAuth();
  const clerk = useClerk();

  // Auth Timeout Fallback (3.5s timeout if Clerk takes long to connect on slow network or adblocker)
  const [authTimeout, setAuthTimeout] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setAuthTimeout(true), 3500);
    return () => clearTimeout(timer);
  }, []);

  // Auth Form View State ("signup" or "login")
  const [authView, setAuthView] = useState("login");
  const [isCheckingHistory, setIsCheckingHistory] = useState(isSignedIn);
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Auth Forms State
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [authMessage, setAuthMessage] = useState(null);
  const [authError, setAuthError] = useState(null);

  const { user: clerkUser, isLoaded: isUserLoaded, isSignedIn: isUserSignedIn } = useUser();

  console.log("LoginSignup Render -> useAuth: { isSignedIn:", isSignedIn, "isLoaded:", isAuthLoaded, "} useUser: { isLoaded:", isUserLoaded, "isSignedIn:", isUserSignedIn, "}");

  const checkRedirect = async (targetUser = clerkUser) => {
    if (targetUser) {
      setIsCheckingHistory(true);
      try {
        const res = await fetch(`${BACKEND_URL}/api/plans?userId=${targetUser.id}`);
        if (res.ok) {
          const plans = await res.json();
          if (plans && plans.length > 0) {
            const latestPlan = plans[0];
             const onboardingData = {
              name: latestPlan.name || "",
              goal: latestPlan.goal || "Build Muscle",
              fitnessLevel: latestPlan.fitnessLevel || "Intermediate",
              activityLevel: latestPlan.activityLevel || "Moderate Active",
              workoutDays: latestPlan.workoutDays || 4,
              workoutDuration: latestPlan.workoutDuration || 60,
              equipment: latestPlan.equipment || ["Full Gym"],
              gender: latestPlan.gender || "Prefer not to say",
              height: latestPlan.height || 175,
              weight: latestPlan.weight || 70,
              bodyFat: latestPlan.bodyFat || 18,
              focusAreas: latestPlan.focusAreas || ["Full Body"],
              injuries: latestPlan.injuries || ["None"],
              customInjury: latestPlan.customInjury || "",
              
              // 10 new preference fields
              country: latestPlan.country || "",
              state: latestPlan.state || "",
              lifestyle: latestPlan.lifestyle || "Working Professional",
              dietType: latestPlan.dietType || "Vegetarian",
              foodBudget: latestPlan.foodBudget || "₹6,000 – ₹10,000/month",
              cookingAccess: latestPlan.cookingAccess || "Full Kitchen",
              mealsPerDay: latestPlan.mealsPerDay || "3 Meals",
              favoriteFoods: latestPlan.favoriteFoods || "",
              avoidFoods: latestPlan.avoidFoods || "",
              allergies: latestPlan.allergies || ""
            };
            localStorage.setItem("stayfit_onboarding_data", JSON.stringify(onboardingData));
            navigate("/dashboard");
            return;
          }
        }
      } catch (e) {
        console.error("Error checking user history:", e);
      }
    }
    
    if (localStorage.getItem("stayfit_onboarding_data")) {
      navigate("/generate");
    } else {
      setIsCheckingHistory(false);
    }
  };

  // Redirect if already signed in and has history
  useEffect(() => {
    if (isAuthLoaded && isUserLoaded) {
      if (isSignedIn && clerkUser) {
        checkRedirect(clerkUser);
      } else {
        setIsCheckingHistory(false);
      }
    }
  }, [isSignedIn, isAuthLoaded, isUserLoaded, clerkUser, navigate]);

  const handleOpenLogin = () => {
    if (isSignedIn && clerkUser) {
      checkRedirect(clerkUser);
    } else {
      setAuthView("login");
      setShowAuthModal(true);
    }
  };

  // Handle Multi-Select Change
  const handleMultiSelect = (field, value) => {
    setOnboarding(prev => {
      const current = prev[field] || [];
      if (value === "None" || value === "Bodyweight Only" || value === "Full Body") {
        const resetState = { ...prev, [field]: [value] };
        if (field === "injuries" && value === "None") {
          resetState.customInjury = "";
        }
        return resetState;
      }
      
      let updated = current.filter(item => item !== "None" && item !== "Bodyweight Only" && item !== "Full Body");
      
      if (updated.includes(value)) {
        updated = updated.filter(item => item !== value);
        if (updated.length === 0) {
          updated = [field === "injuries" ? "None" : field === "focusAreas" ? "Full Body" : "Bodyweight Only"];
        }
      } else {
        updated.push(value);
      }
      return { ...prev, [field]: updated };
    });
  };

  // Math Calculations
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

  const heightM = Number(onboarding.height) / 100;
  const bmi = heightM > 0 ? (Number(onboarding.weight) / (heightM * heightM)).toFixed(1) : 0;

  const getBodyFatCategory = (bf, gender) => {
    const bodyFat = Number(bf);
    if (gender === "Female") {
      if (bodyFat <= 13) return "Essential";
      if (bodyFat <= 20) return "Athletic";
      if (bodyFat <= 24) return "Fitness";
      if (bodyFat <= 31) return "Average";
      return "Obese";
    } else {
      if (bodyFat <= 5) return "Essential";
      if (bodyFat <= 13) return "Athletic";
      if (bodyFat <= 17) return "Fitness";
      if (bodyFat <= 24) return "Average";
      return "Obese";
    }
  };

  const getRecommendedSplit = (days) => {
    const d = Number(days);
    if (d <= 2) return "Full Body Split";
    if (d === 3) return "Push / Pull / Legs (PPL) Split";
    if (d === 4) return "Upper / Lower Split";
    if (d === 5) return "Upper / Lower + Push/Pull/Legs Split";
    if (d === 6) return "Push / Pull / Legs (6-Day PPL) Split";
    return "7-Day Active Recovery Split";
  };

  const calculateAge = (dobString) => {
    if (!dobString) return "";
    const today = new Date();
    const birthDate = new Date(dobString);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const handleDobChange = (d, m, y) => {
    const cleanD = d.replace(/\D/g, "").slice(0, 2);
    const cleanM = m.replace(/\D/g, "").slice(0, 2);
    const cleanY = y.replace(/\D/g, "").slice(0, 4);

    const formattedDob = (cleanD && cleanM && cleanY) ? `${cleanY}-${cleanM}-${cleanD}` : "";
    const calculatedAge = formattedDob ? calculateAge(formattedDob) : "";

    setOnboarding(prev => ({
      ...prev,
      dobDay: cleanD,
      dobMonth: cleanM,
      dobYear: cleanY,
      dob: formattedDob,
      age: calculatedAge
    }));
  };

  // Press Enter key to advance to next step during onboarding assessment
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Enter") {
        if (step > 1 && step <= 26) {
          e.preventDefault();
          if (step === 26) {
            handleOnboardingComplete();
          } else {
            nextStep();
          }
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [step, onboarding, bodyFatMode]);

  // Onboarding Step Handlers
  const nextStep = () => {
    setValidationError(null);
    
    // Step 2: Name validation
    if (step === 2) {
      if (!onboarding.name || onboarding.name.trim().length < 2) {
        setValidationError("Please enter your name (at least 2 characters).");
        return;
      }
      if (!/^[a-zA-Z\s]+$/.test(onboarding.name)) {
        setValidationError("Please enter a valid name using only letters and spaces.");
        return;
      }
    }

    // Step 8: Equipment Available validation (was 7)
    if (step === 8 && onboarding.equipment.length === 0) {
      setValidationError("Please select at least one equipment option to continue.");
      return;
    }
    
    // Step 10: Date of Birth validation (was 9)
    if (step === 10) {
      const d = onboarding.dobDay;
      const m = onboarding.dobMonth;
      const y = onboarding.dobYear;
      if (!d || !m || !y) {
        setValidationError("Please enter your complete Date of Birth (DD / MM / YYYY).");
        return;
      }
      
      const yearNum = parseInt(y, 10);
      const monthNum = parseInt(m, 10) - 1;
      const dayNum = parseInt(d, 10);
      const dateObj = new Date(yearNum, monthNum, dayNum);
      const isValid = dateObj.getFullYear() === yearNum && dateObj.getMonth() === monthNum && dateObj.getDate() === dayNum;
      
      if (!isValid) {
        setValidationError("Please enter a valid calendar date (e.g. February only has 28 or 29 days).");
        return;
      }

      const ageNum = Number(onboarding.age);
      if (isNaN(ageNum) || ageNum < 10 || ageNum > 100) {
        setValidationError("Please enter a realistic date of birth (must be between 10 and 100 years old).");
        return;
      }
    }
    
    // Step 11: Height validation (was 10)
    if (step === 11 && (!onboarding.height || onboarding.height < 100 || onboarding.height > 250)) {
      setValidationError("Please enter a realistic height between 100 cm and 250 cm.");
      return;
    }

    // Step 12: Weight validation (was 11)
    if (step === 12 && (!onboarding.weight || onboarding.weight < 30 || onboarding.weight > 300)) {
      setValidationError("Please enter a realistic weight between 30 kg and 300 kg.");
      return;
    }
    
    // Step 13: Body Fat Navy inputs validation (was 12)
    if (step === 13 && bodyFatMode === "navy") {
      if (!onboarding.neck || onboarding.neck <= 0) {
        setValidationError("Please enter a valid Neck circumference.");
        return;
      }
      if (!onboarding.waist || onboarding.waist <= 0) {
        setValidationError("Please enter a valid Waist circumference.");
        return;
      }
      if (onboarding.gender === "Female" && (!onboarding.hips || onboarding.hips <= 0)) {
        setValidationError("Please enter a valid Hips circumference.");
        return;
      }
    }
    
    // Step 14: Focus Areas validation (was 13)
    if (step === 14 && onboarding.focusAreas.length === 0) {
      setValidationError("Please select at least one target muscle group.");
      return;
    }
    
    // Step 15: Injuries validation (was 14)
    if (step === 15) {
      const hasOption = onboarding.injuries.length > 0;
      const hasCustom = onboarding.customInjury && onboarding.customInjury.trim() !== "";
      if (!hasOption && !hasCustom) {
        setValidationError("Please select at least one option (choose 'None' if you have no injuries) or type your custom injury.");
        return;
      }
      if (hasCustom) {
        const validateCustomInjury = (text) => {
          const trimmed = text.trim();
          const lettersCount = (trimmed.match(/[a-zA-Z]/g) || []).length;
          if (lettersCount < 3) return false;
          const hasVowel = /[aeiouy]/i.test(trimmed);
          if (!hasVowel) return false;
          if (/(.)\1{3,}/.test(trimmed.toLowerCase())) return false;
          if (/^[0-9!@#$%^&*()_+={}\[\]|\\:;"'<>,.?/~` -]+$/.test(trimmed)) return false;

          const validInjuryKeywords = [
            "finger", "hand", "wrist", "arm", "elbow", "shoulder", "neck", "back", "spine", "lumbar", "hip", "leg", 
            "knee", "ankle", "foot", "toe", "chest", "rib", "head", "skull", "muscle", "joint", "bone", "tendon", 
            "ligament", "rotator", "cuff", "disc", "vertebrae", "collarbone", "clavicle", "pelvis", "thigh", "quad", 
            "hamstring", "calf", "calves", "shin", "bicep", "tricep", "quadricep", "abs", "abdomen", "groin",
            "pain", "injury", "fracture", "break", "broken", "tear", "torn", "strain", "sprain", "sore", "tight", 
            "stiff", "wear", "ache", "discomfort", "tendonitis", "arthritis", "hernia", "dislocation", "dislocated", 
            "pinch", "pinched", "spasm", "rupture", "bursitis", "impingement", "meniscus", "acl", "mcl", "lcl"
          ];
          const hasKeyword = validInjuryKeywords.some(keyword => 
            trimmed.toLowerCase().includes(keyword)
          );
          if (!hasKeyword) return false;

          return true;
        };
        if (!validateCustomInjury(onboarding.customInjury)) {
          setValidationError("Please enter a valid description of your injury (e.g. 'fractured finger', 'wrist strain', 'knee pain').");
          return;
        }
      }
    }

    // Step 16: Country validation
    if (step === 16) {
      const countryVal = (onboarding.country || "").trim();
      if (!countryVal) {
        setValidationError("Please enter which country you live in.");
        return;
      }
      if (countryVal.length < 2 || countryVal.length > 60) {
        setValidationError("Country name must be between 2 and 60 characters.");
        return;
      }
      if (!/^[a-zA-Z\s,'.()&-]+$/.test(countryVal)) {
        setValidationError("Please enter a valid country name (letters and spaces only).");
        return;
      }
      const matchedCountry = countryList.find(c => c.toLowerCase() === countryVal.toLowerCase());
      if (!matchedCountry) {
        setValidationError("Please enter a valid country name.");
        return;
      }
      setOnboarding(prev => ({ ...prev, country: matchedCountry }));
    }

    // Step 17: State / Region validation
    if (step === 17) {
      const stateVal = (onboarding.state || "").trim();
      if (!stateVal) {
        setValidationError("Please enter which state or region you live in.");
        return;
      }
      if (stateVal.length < 2 || stateVal.length > 60) {
        setValidationError("State/region name must be between 2 and 60 characters.");
        return;
      }
      if (!/^[a-zA-Z\s,'.()&-]+$/.test(stateVal)) {
        setValidationError("Please enter a valid state/region name (letters and spaces only).");
        return;
      }
      const countryLower = (onboarding.country || "").trim().toLowerCase();
      if (countryLower === "india" || countryLower === "ind") {
        const matchedState = indiaStates.find(s => s.toLowerCase() === stateVal.toLowerCase());
        if (!matchedState) {
          setValidationError("Please enter a valid Indian state/union territory.");
          return;
        }
      } else if (countryLower === "united states" || countryLower === "us" || countryLower === "usa") {
        const matchedState = usStates.find(s => s.toLowerCase() === stateVal.toLowerCase());
        if (!matchedState) {
          setValidationError("Please enter a valid U.S. state.");
          return;
        }
      } else if (countryLower === "canada" || countryLower === "can") {
        const matchedState = canadaProvinces.find(p => p.toLowerCase() === stateVal.toLowerCase());
        if (!matchedState) {
          setValidationError("Please enter a valid Canadian province/territory.");
          return;
        }
      } else if (countryLower === "australia" || countryLower === "aus") {
        const matchedState = australiaStates.find(s => s.toLowerCase() === stateVal.toLowerCase());
        if (!matchedState) {
          setValidationError("Please enter a valid Australian state/territory.");
          return;
        }
      }
    }

    // Step 23: Favorite Foods validation
    if (step === 23) {
      const favVal = (onboarding.favoriteFoods || "").trim();
      if (!favVal || favVal.toLowerCase() === "none") {
        setOnboarding(prev => ({ ...prev, favoriteFoods: "None" }));
      } else {
        if (favVal.length < 2 || favVal.length > 200) {
          setValidationError("Favorite foods list must be between 2 and 200 characters.");
          return;
        }
        if (!/^[a-zA-Z\s,'.()&-]+$/.test(favVal)) {
          setValidationError("Please enter valid food names (letters, spaces, and commas only).");
          return;
        }
        const items = favVal.split(",").map(i => i.trim()).filter(Boolean);
        const uniqueItems = [...new Set(items)];
        const cleaned = uniqueItems.join(", ");
        setOnboarding(prev => ({ ...prev, favoriteFoods: cleaned }));
      }
    }

    // Step 24: Foods You Don't Eat validation
    if (step === 24) {
      const avoidVal = (onboarding.avoidFoods || "").trim();
      if (!avoidVal || avoidVal.toLowerCase() === "none") {
        setOnboarding(prev => ({ ...prev, avoidFoods: "None" }));
      } else {
        if (avoidVal.length < 2 || avoidVal.length > 200) {
          setValidationError("Foods to avoid list must be between 2 and 200 characters.");
          return;
        }
        if (!/^[a-zA-Z\s,'.()&-]+$/.test(avoidVal)) {
          setValidationError("Please enter valid food names (letters, spaces, and commas only).");
          return;
        }
        const items = avoidVal.split(",").map(i => i.trim()).filter(Boolean);
        const uniqueItems = [...new Set(items)];
        setOnboarding(prev => ({ ...prev, avoidFoods: uniqueItems.join(", ") }));
      }
    }

    // Step 25: Food Allergies validation
    if (step === 25) {
      const allergiesVal = (onboarding.allergies || "").trim();
      if (!allergiesVal || allergiesVal.toLowerCase() === "none") {
        setOnboarding(prev => ({ ...prev, allergies: "None" }));
      } else {
        if (allergiesVal.length < 2 || allergiesVal.length > 200) {
          setValidationError("Food allergies list must be between 2 and 200 characters.");
          return;
        }
        if (!/^[a-zA-Z\s,'.()&-]+$/.test(allergiesVal)) {
          setValidationError("Please enter valid allergy names (letters, spaces, and commas only).");
          return;
        }
        const items = allergiesVal.split(",").map(i => i.trim()).filter(Boolean);
        const uniqueItems = [...new Set(items)];
        setOnboarding(prev => ({ ...prev, allergies: uniqueItems.join(", ") }));
      }
    }

    setDirection(1);
    setStep(prev => prev + 1);
  };

  const prevStep = () => {
    setValidationError(null);
    setDirection(-1);
    setStep(prev => prev - 1);
  };

  // Auth Handlers
  const handleAuthSubmit = async (e, type) => {
    e.preventDefault();
    console.log("handleAuthSubmit clicked! type:", type, "isAuthLoaded:", isAuthLoaded);
    setAuthLoading(true);
    setAuthMessage(null);
    setAuthError(null);

    try {
      if (type === "signup") {
        if (!isAuthLoaded) {
          setAuthError("Clerk SDK is not loaded yet.");
          setAuthLoading(false);
          return;
        }

        const signUpAttempt = await signUp.create({
          emailAddress: email,
          password: password,
          firstName: name || email.split("@")[0],
        });

        if (signUpAttempt.status === "complete") {
          await setSignUpActive({ session: signUpAttempt.createdSessionId });
          setAuthMessage("Account created successfully! Let's build your AI fitness profile...");
        } else {
          setAuthMessage("Account registered. Please complete your registration via email verification.");
        }
      } else {
        if (!isAuthLoaded) {
          setAuthError("Clerk SDK is not loaded yet.");
          setAuthLoading(false);
          return;
        }

        const signInAttempt = await signIn.create({
          identifier: email,
          password: password,
        });

        if (signInAttempt.status === "complete") {
          await setSignInActive({ session: signInAttempt.createdSessionId });
          setAuthMessage("Login successful! Checking your profile...");
        } else {
          setAuthError("Authentication check failed. Please check your credentials.");
        }
      }
    } catch (err) {
      console.error("Auth error:", err);
      setAuthError(err.errors?.[0]?.message || err.message || "Authentication failed.");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    console.log("handleGoogleSignIn clicked! isAuthLoaded:", isAuthLoaded, "signIn:", !!signIn);
    setAuthLoading(true);
    setAuthMessage(null);
    setAuthError(null);
    try {
      if (!clerk || !clerk.client || !clerk.client.signIn) {
        setAuthError("Clerk SDK is not loaded yet.");
        setAuthLoading(false);
        return;
      }
      if (step === 26) {
        localStorage.setItem("stayfit_onboarding_data", JSON.stringify(onboarding));
      } else {
        localStorage.removeItem("stayfit_onboarding_data");
      }
      await clerk.client.signIn.authenticateWithRedirect({
        strategy: "oauth_google",
        redirectUrl: "/sso-callback",
        redirectUrlComplete: "/dashboard",
      });
    } catch (err) {
      console.error("Google login error:", err);
      setAuthError(err.errors?.[0]?.message || err.message || "Google auth failed.");
    } finally {
      setAuthLoading(false);
    }
  };

  // Framer Motion Variants (Optimized for snappiness, zero lag)
  const slideVariants = {
    enter: {
      opacity: 0,
      y: 6
    },
    center: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.12, ease: "easeOut" }
    },
    exit: {
      opacity: 0,
      y: -6,
      transition: { duration: 0.1, ease: "easeIn" }
    }
  };

  if (!isAuthLoaded) {
    return (
      <div className="w-full max-w-sm mx-auto px-4 py-8 select-none flex flex-col justify-center items-center min-h-[640px] h-full relative">
        <div className="text-center space-y-6">
          <h1 className="text-6xl font-black tracking-tight select-none mb-10">
            StayFit <span className="bg-[#CCFF00] text-zinc-950 rounded-2xl px-4 py-0.5 ml-1 text-5xl font-black shadow-[0_0_25px_rgba(204,255,0,0.45)]">Ai</span>
          </h1>
          <div className="w-10 h-10 rounded-full border-4 border-zinc-800 border-t-[#CCFF00] animate-spin mx-auto" />
          <p className="text-zinc-500 text-xs font-bold tracking-wider uppercase animate-pulse">Connecting to Auth...</p>
        </div>
      </div>
    );
  }

  if (isCheckingHistory) {
    return (
      <div className="w-full max-w-sm mx-auto px-4 py-8 select-none flex flex-col justify-center items-center min-h-[640px] h-full relative">
        <div className="text-center space-y-6">
          <h1 className="text-6xl font-black tracking-tight select-none mb-8">
            StayFit <span className="bg-[#CCFF00] text-zinc-950 rounded-2xl px-4 py-0.5 ml-1 text-5xl font-black shadow-[0_0_25px_rgba(204,255,0,0.45)]">Ai</span>
          </h1>
          <div className="w-10 h-10 rounded-full border-4 border-zinc-800 border-t-[#a3e635] animate-spin mx-auto mb-4" />
          <div className="space-y-1">
            <p className="text-white text-sm font-bold tracking-wider">Already registered</p>
            <p className="text-zinc-500 text-xs font-semibold">Redirecting to your dashboard...</p>
          </div>
        </div>
      </div>
    );
  }



  const handleOnboardingComplete = () => {
    if (!isSignedIn) {
      setAuthView("signup");
      setShowAuthModal(true);
    } else {
      localStorage.setItem("stayfit_onboarding_data", JSON.stringify(onboarding));
      navigate("/generate");
    }
  };

  const getStepTitle = (s) => {
    switch (s) {
      case 1: return "Welcome";
      case 2: return "Your Name";
      case 3: return "Primary Goal";
      case 4: return "Experience Level";
      case 5: return "Activity Level";
      case 6: return "Workout Days";
      case 7: return "Workout Duration";
      case 8: return "Equipment Available";
      case 9: return "Biological Gender";
      case 10: return "Date of Birth";
      case 11: return "Total Height";
      case 12: return "Current Weight";
      case 13: return "Body Fat %";
      case 14: return "Target Muscles";
      case 15: return "Injuries & Pain";
      case 16: return "Country";
      case 17: return "State / Region";
      case 18: return "Lifestyle / Profession";
      case 19: return "Diet Preference";
      case 20: return "Daily Food Budget";
      case 21: return "Cooking Access";
      case 22: return "Meals Per Day";
      case 23: return "Favorite Foods";
      case 24: return "Foods You Don't Eat";
      case 25: return "Food Allergies";
      case 26: return "Review Profile";
      default: return "Onboarding";
    }
  };

  if ((!isAuthLoaded && !authTimeout) || isCheckingHistory) {
    return (
      <div className="w-full h-full min-h-[640px] flex flex-col items-center justify-center bg-transparent gap-4">
        <div className="relative w-12 h-12 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full border-3 border-zinc-900 border-t-[#a3e635] animate-spin" />
          <span className="w-1.5 h-1.5 rounded-full bg-[#a3e635] animate-ping" />
        </div>
        <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest animate-pulse">Verifying Session...</p>
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="w-full h-full min-h-[640px] text-[#e2e2e2] font-sans flex flex-col justify-center items-center select-none relative bg-transparent px-4 py-8">
        <div className="w-full max-w-sm mx-auto bg-zinc-950/40 border border-zinc-800/80 rounded-3xl p-6.5 shadow-2xl backdrop-blur-xl relative hover:border-[#a3e635]/15 transition-all duration-300">
          <h3 className="text-xl font-extrabold text-white text-center mb-6 tracking-tight">
            {authView === "signup" ? "Create Free Account" : "Access Your Plan"}
          </h3>

          <form onSubmit={(e) => handleAuthSubmit(e, authView)} className="space-y-4">
            {authView === "signup" && (
              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-400">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-3.5 w-4 h-4 text-zinc-500" />
                  <Input
                    type="text"
                    autoComplete="name"
                    placeholder="Enter your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="bg-zinc-950/80 border-zinc-850 text-white focus:border-[#a3e635] focus:ring-1 focus:ring-[#a3e635] pl-10 w-full h-11 rounded-xl text-sm"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs font-bold text-zinc-400">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-zinc-500" />
                <Input
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-zinc-950/80 border-zinc-850 text-white focus:border-[#a3e635] focus:ring-1 focus:ring-[#a3e635] pl-10 w-full h-11 rounded-xl text-sm"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-zinc-400">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-zinc-500" />
                <Input
                  type="password"
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-zinc-950/80 border-zinc-850 text-white focus:border-[#a3e635] focus:ring-1 focus:ring-[#a3e635] pl-10 w-full h-11 rounded-xl text-sm"
                  required
                />
              </div>
            </div>

            {authError && (
              <div className="text-red-400 text-[11px] font-semibold bg-red-950/20 border border-red-900/30 p-3 rounded-xl text-center">
                {authError}
              </div>
            )}

            {authMessage && (
              <div className="text-[#a3e635] text-[11px] font-semibold bg-[#a3e635]/5 border border-[#a3e635]/20 p-3 rounded-xl text-center animate-pulse">
                {authMessage}
              </div>
            )}

            <Button
              type="submit"
              disabled={authLoading}
              className="w-full bg-[#a3e635] text-zinc-950 hover:bg-[#b8e600] transition py-3 font-bold shadow-md h-11 mt-2 rounded-xl cursor-pointer text-sm"
            >
              {authLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 rounded-full border-2 border-t-zinc-950 border-[#a3e635] animate-spin" />
                  Loading...
                </span>
              ) : (
                authView === "signup" ? "Create Account & Start" : "Log In & Continue"
              )}
            </Button>
          </form>

          {/* Divider */}
          <div className="flex items-center my-4">
            <div className="flex-grow border-t border-zinc-850" />
            <span className="px-2.5 text-[9px] text-zinc-500 font-bold uppercase tracking-wider">or</span>
            <div className="flex-grow border-t border-zinc-850" />
          </div>

          {/* Google Sign In Button */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            className="w-full h-11 border border-zinc-850 bg-zinc-950 text-white hover:bg-zinc-900 transition py-2 font-bold rounded-xl flex items-center justify-center gap-2.5 text-xs cursor-pointer"
          >
            <svg className="w-4 h-4 text-white" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Continue with Google</span>
          </button>

          {/* Toggle View Button */}
          <div className="text-center mt-4">
            <button
              type="button"
              onClick={() => {
                setAuthView(authView === "signup" ? "login" : "signup");
                setAuthError(null);
                setAuthMessage(null);
              }}
              className="text-xs text-zinc-400 hover:text-white transition font-semibold cursor-pointer"
            >
              {authView === "signup"
                ? "Already have an account? Log In"
                : "Don't have an account? Sign Up"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  const progressPercent = step > 1 ? Math.round(((step - 1) / 25) * 100) : 0;

  return (
    <div className="w-full h-full min-h-[640px] text-[#e2e2e2] font-sans flex flex-col justify-between select-none relative bg-transparent px-6 py-8">
      {/* Centered flat container (occupies the full left pane space) */}
      <div className="w-full max-w-3xl mx-auto flex flex-col justify-between h-full flex-grow relative z-10">
        
        {/* Onboarding Header: Progress & Sign Out */}
        <header className="w-full mb-8">
          {isSignedIn && (
            <div className="flex justify-end items-center mb-3">
              <button
                type="button"
                onClick={async () => {
                  localStorage.removeItem("stayfit_onboarding_data");
                  localStorage.removeItem("stayfit_latest_plan_name");
                  await clerk.signOut();
                  navigate("/");
                }}
                className="px-3.5 py-1.5 rounded-xl bg-zinc-900/80 hover:bg-red-500/10 border border-zinc-800 hover:border-red-500/30 text-zinc-400 hover:text-red-400 text-xs font-bold flex items-center gap-1.5 transition-all duration-200 cursor-pointer active:scale-95"
                title="Sign Out"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          )}

          {step > 1 && step <= 26 ? (
            <div className="flex flex-col gap-2.5">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">
                  Step {step - 1} of 25: {getStepTitle(step)}
                </span>
                <span className="text-sm font-extrabold text-[#a3e635]">{progressPercent}%</span>
              </div>
              <div className="h-2 w-full bg-zinc-950 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-[#a3e635] transition-all duration-300 shadow-[0_0_10px_rgba(163,230,53,0.5)]"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          ) : (
            /* Keep spacing consistent on Step 1 if signed out */
            !isSignedIn && <div className="h-6" />
          )}
        </header>

        {/* Main Content Area */}
        <main className="flex-grow flex flex-col justify-center min-h-0 w-full overflow-y-auto max-h-[58vh] md:max-h-[64vh] custom-scrollbar px-1.5 py-2">
          <div className="w-full flex-grow flex flex-col justify-center">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={step}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                className="w-full h-full flex flex-col justify-center flex-grow"
              >
              {/* Step 1: Welcome Screen */}
              {step === 1 && (
                <div className="space-y-10 text-center my-auto w-full py-6">
                  <div className="w-24 h-24 bg-[#a3e635]/10 border border-[#a3e635]/30 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-[#a3e635]/10 animate-pulse">
                    <Sparkles className="text-[#a3e635] w-12 h-12" />
                  </div>
                  <div className="space-y-4">
                    <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
                      Build Your Personalized AI Workout Plan
                    </h1>
                    <p className="text-zinc-400 text-base md:text-lg leading-relaxed max-w-xl mx-auto">
                      Answer a few quick questions and StayFit Ai will calibrate your caloric burn, targets, and intensity zones.
                    </p>
                  </div>
                  <div className="space-y-4 pt-6 max-w-md mx-auto w-full">
                    <Button 
                      onClick={nextStep}
                      className="w-full rounded-2xl bg-[#a3e635] text-black py-4.5 text-lg font-black tracking-wide shadow-lg shadow-[#a3e635]/15 hover:brightness-110 active:scale-95 transition-all cursor-pointer"
                    >
                      Start Assessment
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 2: Name Input */}
              {step === 2 && (
                <div className="space-y-8 w-full text-center">
                  <div className="space-y-3">
                    <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">What should we call you?</h1>
                    <p className="text-zinc-400 text-base md:text-lg">Please enter your name to personalize your plans.</p>
                  </div>
                  <div className="glass-card p-10 rounded-2xl space-y-6 group transition-all duration-300 hover:border-[#a3e635]/30 w-full shadow-xl">
                    <label className="text-xs text-zinc-500 font-bold uppercase tracking-widest block text-center">Full Name</label>
                    <div className="flex flex-col items-center justify-center py-4">
                      <div className="flex items-center justify-center gap-4 border-b-3 border-zinc-800 focus-within:border-[#a3e635] w-96 max-w-full transition-colors pb-3">
                        <User className="w-8 h-8 text-zinc-500 group-hover:text-[#a3e635] transition-colors shrink-0" />
                        <input 
                          type="text"
                          value={onboarding.name || ""}
                          onChange={(e) => setOnboarding({ ...onboarding, name: e.target.value })}
                          className="bg-transparent outline-none font-black text-4xl text-[#a3e635] w-full transition-colors pb-1 placeholder-zinc-700 placeholder:opacity-50 text-left" 
                          placeholder="Your Name" 
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Goal Picker */}
              {step === 3 && (
                <div className="space-y-6 w-full">
                  <div className="space-y-2">
                    <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">What is your primary fitness goal?</h1>
                    <p className="text-zinc-400 text-sm">Choose the main objective you want to target first.</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { label: "Lose Fat", icon: Flame, desc: "Burn calories and optimize fat reduction" },
                      { label: "Build Muscle", icon: Dumbbell, desc: "Promote hypertrophy and increase muscle mass" },
                      { label: "Get Stronger", icon: Award, desc: "Enhance athletic performance and lifting capability" },
                      { label: "Body Recomposition", icon: Activity, desc: "Lose fat while building muscle simultaneously" },
                      { label: "Improve Endurance", icon: Heart, desc: "Boost cardiovascular fitness and stamina" }
                    ].map(item => {
                      const isSelected = onboarding.goal === item.label;
                      const Icon = item.icon;
                      return (
                        <button
                          key={item.label}
                          type="button"
                          onClick={() => setOnboarding({ ...onboarding, goal: item.label })}
                          className={`glass-card p-5 rounded-xl text-left flex items-center justify-between gap-4 transition-all duration-300 ${
                            isSelected 
                              ? "bg-[#a3e635]/15 border-[#a3e635] shadow-[0_0_15px_rgba(163,230,53,0.15)] text-white" 
                              : "hover:border-[#ccff80]/30 text-zinc-400"
                          }`}
                        >
                          <div className="flex items-center gap-4 flex-grow">
                            <div className={`p-2.5 rounded-lg flex items-center justify-center shrink-0 ${isSelected ? "bg-[#a3e635] text-black" : "bg-white/5 text-zinc-400"}`}>
                              <Icon className="w-5 h-5" />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-white">{item.label}</p>
                              <p className="text-[11px] text-zinc-500 mt-0.5">{item.desc}</p>
                            </div>
                          </div>
                          {isSelected && (
                            <div className="bg-[#a3e635] text-black rounded-full p-1.5 flex items-center justify-center shrink-0">
                              <Check className="w-3.5 h-3.5 stroke-[3px]" />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Step 4: Fitness Level */}
              {step === 4 && (
                <div className="space-y-6 w-full">
                  <div className="space-y-2">
                    <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">What is your experience level?</h1>
                    <p className="text-zinc-400 text-sm">This adjusts exercise selection and volume complexity.</p>
                  </div>
                  <div className="grid grid-cols-1 gap-4">
                    {[
                      { label: "Beginner", icon: Sparkles, desc: "Just starting out. Focus on learning proper form and consistency." },
                      { label: "Intermediate", icon: Smile, desc: "Active training history. Familiar with standard barbell/dumbbell moves." },
                      { label: "Advanced", icon: Award, desc: "Consistent heavy lifting background. High volume capacity and intensity." }
                    ].map(item => {
                      const isSelected = onboarding.fitnessLevel === item.label;
                      const Icon = item.icon;
                      return (
                        <button
                          key={item.label}
                          type="button"
                          onClick={() => setOnboarding({ ...onboarding, fitnessLevel: item.label })}
                          className={`glass-card p-5 rounded-xl text-left flex items-center justify-between gap-4 transition-all duration-300 ${
                            isSelected 
                              ? "bg-[#a3e635]/15 border-[#a3e635] shadow-[0_0_15px_rgba(163,230,53,0.15)] text-white" 
                              : "hover:border-[#ccff80]/30 text-zinc-400"
                          }`}
                        >
                          <div className="flex items-center gap-4 flex-grow">
                            <div className={`p-2.5 rounded-lg flex items-center justify-center shrink-0 ${isSelected ? "bg-[#a3e635] text-black" : "bg-white/5 text-zinc-400"}`}>
                              <Icon className="w-5 h-5" />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-white">{item.label}</p>
                              <p className="text-xs text-zinc-500 mt-1">{item.desc}</p>
                            </div>
                          </div>
                          {isSelected && (
                            <div className="bg-[#a3e635] text-black rounded-full p-1.5 flex items-center justify-center shrink-0">
                              <Check className="w-3.5 h-3.5 stroke-[3px]" />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Step 5: Activity Level */}
              {step === 5 && (
                <div className="space-y-6 w-full">
                  <div className="space-y-2">
                    <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">What is your daily activity level?</h1>
                    <p className="text-zinc-400 text-sm">Used to calibrate your baseline metabolic rate (BMR).</p>
                  </div>
                  <div className="grid grid-cols-1 gap-4">
                    {[
                      { label: "Sedentary", icon: Clock, desc: "Desk job, little to no regular exercise." },
                      { label: "Lightly Active", icon: Calendar, desc: "Light exercise or active job (1-3 days/week)." },
                      { label: "Moderately Active", icon: Activity, desc: "Moderate exercise/sports (3-5 days/week)." },
                      { label: "Very Active", icon: Flame, desc: "Heavy physical labor or elite training (6-7 days/week)." }
                    ].map(item => {
                      const isSelected = onboarding.activityLevel === item.label;
                      const Icon = item.icon;
                      return (
                        <button
                          key={item.label}
                          type="button"
                          onClick={() => setOnboarding({ ...onboarding, activityLevel: item.label })}
                          className={`glass-card p-5 rounded-xl text-left flex items-center justify-between gap-4 transition-all duration-300 ${
                            isSelected 
                              ? "bg-[#a3e635]/15 border-[#a3e635] shadow-[0_0_15px_rgba(163,230,53,0.15)] text-white" 
                              : "hover:border-[#ccff80]/30 text-zinc-400"
                          }`}
                        >
                          <div className="flex items-center gap-4 flex-grow">
                            <div className={`p-2.5 rounded-lg flex items-center justify-center shrink-0 ${isSelected ? "bg-[#a3e635] text-black" : "bg-white/5 text-zinc-400"}`}>
                              <Icon className="w-5 h-5" />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-white">{item.label}</p>
                              <p className="text-xs text-zinc-500 mt-1">{item.desc}</p>
                            </div>
                          </div>
                          {isSelected && (
                            <div className="bg-[#a3e635] text-black rounded-full p-1.5 flex items-center justify-center shrink-0">
                              <Check className="w-3.5 h-3.5 stroke-[3px]" />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Step 6: Workout Days */}
              {step === 6 && (
                <div className="space-y-8 w-full text-center">
                  <div className="space-y-2">
                    <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">How many days can you commit?</h1>
                    <p className="text-zinc-400 text-sm">Select target days per week you plan to train.</p>
                  </div>

                  {/* Single card on top showing selected days */}
                  <div className="w-44 h-44 mx-auto bg-[#a3e635]/5 border border-[#a3e635]/25 rounded-3xl flex flex-col justify-center items-center shadow-2xl relative group transition-all duration-300 hover:border-[#a3e635]/40">
                    <span className="text-6xl md:text-7xl font-black text-[#a3e635] tracking-tight">
                      {onboarding.workoutDays}
                    </span>
                    <span className="text-xs uppercase font-bold tracking-widest text-zinc-400 mt-2">
                      Days / Wk
                    </span>
                  </div>

                  {/* Slide bar below card */}
                  <div className="w-full space-y-4 pt-4">
                    <div className="relative w-full h-8 flex items-center">
                      <input 
                        type="range"
                        min="2"
                        max="6"
                        step="1"
                        value={onboarding.workoutDays}
                        onChange={(e) => setOnboarding({ ...onboarding, workoutDays: Number(e.target.value) })}
                        className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-[#a3e635]"
                      />
                      <div className="absolute w-full flex justify-between px-1.5 -bottom-5 pointer-events-none text-[10px] md:text-xs font-bold transition-all duration-300">
                        {[2, 3, 4, 5, 6].map(val => {
                          const isSelected = onboarding.workoutDays === val;
                          return (
                            <span 
                              key={val} 
                              className={`transition-colors duration-300 ${isSelected ? "text-[#a3e635] font-black scale-105" : "text-zinc-500 font-semibold"}`}
                            >
                              {val} Days
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 7: Workout Duration */}
              {step === 7 && (
                <div className="space-y-6 w-full">
                  <div className="space-y-2">
                    <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">Preferred session duration?</h1>
                    <p className="text-zinc-400 text-sm">Select target minutes per workout session.</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { mins: 20, icon: Timer, desc: "Express workout, ideal for rapid high-intensity circuits." },
                      { mins: 30, icon: Timer, desc: "Short & focused, targeting key compound exercises." },
                      { mins: 45, icon: Timer, desc: "Standard frequency, excellent for balanced splits." },
                      { mins: 60, icon: Timer, desc: "Optimal hypertrophic window for strength & growth." },
                      { mins: 75, icon: Timer, desc: "Extended session, allows for thorough accessory lifts." },
                      { mins: 90, icon: Timer, desc: "Elite duration, perfect for high volume capacity training." }
                    ].map(item => {
                      const isSelected = onboarding.workoutDuration === item.mins;
                      const Icon = item.icon;
                      return (
                        <button
                          key={item.mins}
                          type="button"
                          onClick={() => setOnboarding({ ...onboarding, workoutDuration: item.mins })}
                          className={`glass-card p-4 rounded-xl text-left flex items-center justify-between gap-4 transition-all duration-300 ${
                            isSelected 
                              ? "bg-[#a3e635]/15 border-[#a3e635] shadow-[0_0_15px_rgba(163,230,53,0.15)] text-white" 
                              : "hover:border-[#ccff80]/30 text-zinc-400"
                          }`}
                        >
                          <div className="flex items-center gap-4 flex-grow">
                            <div className={`p-2.5 rounded-lg flex items-center justify-center shrink-0 ${isSelected ? "bg-[#a3e635] text-black" : "bg-white/5 text-zinc-400"}`}>
                              <Icon className="w-5 h-5" />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-white">{item.mins} Minutes</p>
                              <p className="text-[11px] text-zinc-500 mt-0.5">{item.desc}</p>
                            </div>
                          </div>
                          {isSelected && (
                            <div className="bg-[#a3e635] text-black rounded-full p-1.5 flex items-center justify-center shrink-0">
                              <Check className="w-3.5 h-3.5 stroke-[3px]" />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Step 8: Equipment */}
              {step === 8 && (
                <div className="space-y-6 w-full">
                  <div className="space-y-2">
                    <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">Available Equipment?</h1>
                    <p className="text-zinc-400 text-sm">Select all that apply to guide exercise choices.</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                    {[
                      { label: "Full Gym", icon: Award, desc: "Access to barbells, dumbbells, cables, and machines." },
                      { label: "Dumbbells", icon: Dumbbell, desc: "Standard pair of dumbbells for isolated or compound work." },
                      { label: "Barbells", icon: Dumbbell, desc: "Olympic or standard barbell set for heavy compound lifts." },
                      { label: "Machines", icon: Activity, desc: "Access to selectorized cables and selector plate machines." },
                      { label: "Resistance Bands", icon: Heart, desc: "Elastic loop or tube bands for constant tension work." },
                      { label: "Kettlebells", icon: Flame, desc: "Access to kettlebells for functional, athletic movements." },
                      { label: "Bodyweight Only", icon: User, desc: "No equipment needed. Focuses on calisthenics and gravity." }
                    ].map(item => {
                      const isSelected = onboarding.equipment.includes(item.label);
                      const Icon = item.icon;
                      return (
                        <button
                          key={item.label}
                          type="button"
                          onClick={() => handleMultiSelect("equipment", item.label)}
                          className={`glass-card p-4 rounded-xl text-left flex items-center justify-between gap-4 transition-all duration-300 ${
                            isSelected 
                              ? "bg-[#a3e635]/15 border-[#a3e635] shadow-[0_0_15px_rgba(163,230,53,0.15)] text-white" 
                              : "hover:border-[#ccff80]/30 text-zinc-400"
                          }`}
                        >
                          <div className="flex items-center gap-4 flex-grow">
                            <div className={`p-2.5 rounded-lg flex items-center justify-center shrink-0 ${isSelected ? "bg-[#a3e635] text-black" : "bg-white/5 text-zinc-400"}`}>
                              <Icon className="w-5 h-5" />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-white">{item.label}</p>
                              <p className="text-[11px] text-zinc-500 mt-0.5">{item.desc}</p>
                            </div>
                          </div>
                          {isSelected && (
                            <div className="bg-[#a3e635] text-black rounded-full p-1.5 flex items-center justify-center shrink-0">
                              <Check className="w-3.5 h-3.5 stroke-[3px]" />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Step 9: Biological Gender */}
              {step === 9 && (
                <div className="space-y-6 w-full">
                  <div className="space-y-2">
                    <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">Biological Gender</h1>
                    <p className="text-zinc-400 text-sm">Required for estimating basic metabolic rates.</p>
                  </div>
                  <div className="grid grid-cols-1 gap-3 w-full">
                    {[
                      { label: "Male", icon: User, desc: "Optimizes metabolic equations for male baseline values." },
                      { label: "Female", icon: User, desc: "Optimizes metabolic equations for female baseline values." },
                      { label: "Prefer not to say", icon: Heart, desc: "Skips gender-specific modifiers for general calculations." }
                    ].map(item => {
                      const isSelected = onboarding.gender === item.label;
                      const Icon = item.icon;
                      return (
                        <button
                          key={item.label}
                          type="button"
                          onClick={() => setOnboarding({ ...onboarding, gender: item.label })}
                          className={`glass-card p-4 rounded-xl text-left flex items-center justify-between gap-4 transition-all duration-300 ${
                            isSelected 
                              ? "bg-[#a3e635]/15 border-[#a3e635] shadow-[0_0_15px_rgba(163,230,53,0.15)] text-white" 
                              : "hover:border-[#ccff80]/30 text-zinc-400"
                          }`}
                        >
                          <div className="flex items-center gap-4 flex-grow">
                            <div className={`p-2.5 rounded-lg flex items-center justify-center shrink-0 ${isSelected ? "bg-[#a3e635] text-black" : "bg-white/5 text-zinc-400"}`}>
                              <Icon className="w-5 h-5" />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-white">{item.label}</p>
                              <p className="text-[11px] text-zinc-500 mt-0.5">{item.desc}</p>
                            </div>
                          </div>
                          {isSelected && (
                            <div className="bg-[#a3e635] text-black rounded-full p-1.5 flex items-center justify-center shrink-0">
                              <Check className="w-3.5 h-3.5 stroke-[3px]" />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Step 10: Date of Birth */}
              {step === 10 && (() => {
                const dobYear = onboarding.dobYear || "";
                const dobMonth = onboarding.dobMonth || "";
                const dobDay = onboarding.dobDay || "";

                const handleDayKeyDown = (e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    if (dobMonthRef.current) dobMonthRef.current.focus();
                  }
                };

                const handleMonthKeyDown = (e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    if (dobYearRef.current) dobYearRef.current.focus();
                  } else if (e.key === "Backspace" && !dobMonth && dobDayRef.current) {
                    e.preventDefault();
                    dobDayRef.current.focus();
                  }
                };

                const handleYearKeyDown = (e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    if (dobDay && dobMonth && dobYear) {
                      nextStep();
                    }
                  } else if (e.key === "Backspace" && !dobYear && dobMonthRef.current) {
                    e.preventDefault();
                    dobMonthRef.current.focus();
                  }
                };

                return (
                  <div className="space-y-6 w-full text-center">
                    <div className="space-y-2">
                      <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">When is your birthday?</h1>
                      <p className="text-zinc-400 text-sm">Used for calibrating target resistance, calorie metrics, and heart rate zones.</p>
                    </div>
                    <div className="glass-card p-8 rounded-xl space-y-6 group transition-all duration-300 hover:border-[#a3e635]/30 w-full">
                      <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest block text-center">Date of Birth</label>
                      
                      <div className="flex items-center justify-center gap-3 w-full max-w-xs mx-auto py-2">
                        {/* Day (DD) */}
                        <div className="flex flex-col items-center">
                          <input
                            ref={dobDayRef}
                            type="text"
                            inputMode="numeric"
                            maxLength="2"
                            placeholder="DD"
                            value={dobDay}
                            onChange={(e) => {
                              const val = e.target.value;
                              handleDobChange(val, dobMonth, dobYear);
                              if (val.replace(/\D/g, "").length === 2 && dobMonthRef.current) {
                                dobMonthRef.current.focus();
                              }
                            }}
                            onKeyDown={handleDayKeyDown}
                            className="bg-transparent border-b-2 border-zinc-800 focus:border-[#a3e635] outline-none font-black text-4xl text-[#a3e635] w-16 text-center pb-1 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none placeholder-zinc-700 placeholder:opacity-50"
                          />
                          <span className="text-[10px] text-zinc-500 font-bold uppercase mt-1">Day</span>
                        </div>
                        
                        <span className="text-zinc-700 font-bold text-2xl pb-4">/</span>

                        {/* Month (MM) */}
                        <div className="flex flex-col items-center">
                          <input
                            ref={dobMonthRef}
                            type="text"
                            inputMode="numeric"
                            maxLength="2"
                            placeholder="MM"
                            value={dobMonth}
                            onChange={(e) => {
                              const val = e.target.value;
                              handleDobChange(dobDay, val, dobYear);
                              if (val.replace(/\D/g, "").length === 2 && dobYearRef.current) {
                                dobYearRef.current.focus();
                              }
                            }}
                            onKeyDown={handleMonthKeyDown}
                            className="bg-transparent border-b-2 border-zinc-800 focus:border-[#a3e635] outline-none font-black text-4xl text-[#a3e635] w-16 text-center pb-1 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none placeholder-zinc-700 placeholder:opacity-50"
                          />
                          <span className="text-[10px] text-zinc-500 font-bold uppercase mt-1">Month</span>
                        </div>

                        <span className="text-zinc-700 font-bold text-2xl pb-4">/</span>

                        {/* Year (YYYY) */}
                        <div className="flex flex-col items-center">
                          <input
                            ref={dobYearRef}
                            type="text"
                            inputMode="numeric"
                            maxLength="4"
                            placeholder="YYYY"
                            value={dobYear}
                            onChange={(e) => {
                              const val = e.target.value;
                              handleDobChange(dobDay, dobMonth, val);
                            }}
                            onKeyDown={handleYearKeyDown}
                            className="bg-transparent border-b-2 border-zinc-800 focus:border-[#a3e635] outline-none font-black text-4xl text-[#a3e635] w-24 text-center pb-1 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none placeholder-zinc-700 placeholder:opacity-50"
                          />
                          <span className="text-[10px] text-zinc-500 font-bold uppercase mt-1">Year</span>
                        </div>
                      </div>

                      <div className="min-h-[70px] flex flex-col justify-center items-center mt-2 transition-all duration-300">
                        {onboarding.age ? (
                          <div className="text-center transition-all duration-300">
                            <span className="text-zinc-500 font-bold text-[10px] uppercase tracking-widest block">Calculated Age</span>
                            <span className="text-3xl font-extrabold text-[#a3e635] mt-1 block">{onboarding.age} Years Old</span>
                          </div>
                        ) : (
                          <div className="text-center text-zinc-500 text-xs font-semibold max-w-xs leading-relaxed">
                            Type your full Day, Month, and Year above to calculate your age.
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Step 11: Total Height */}
              {step === 11 && (
                <div className="space-y-6 w-full text-center">
                  <div className="space-y-2">
                    <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">What is your height?</h1>
                    <p className="text-zinc-400 text-sm">Enter your total height in centimeters.</p>
                  </div>
                  <div className="glass-card p-8 rounded-xl space-y-4 group transition-all duration-300 hover:border-[#a3e635]/30 w-full">
                    <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest block text-center">Total Height</label>
                    <div className="flex flex-col items-center justify-center py-4">
                      <div className="flex items-baseline justify-center gap-2">
                        <input 
                          type="number"
                          value={onboarding.height || ""}
                          onChange={(e) => setOnboarding({ ...onboarding, height: Number(e.target.value) })}
                          className="bg-transparent border-b-2 border-zinc-800 focus:border-[#a3e635] outline-none font-black text-6xl text-[#a3e635] w-48 transition-colors text-center pb-2 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none placeholder-zinc-700 placeholder:opacity-50" 
                          placeholder="180" 
                        />
                        <span className="text-zinc-500 font-extrabold text-xl">cm</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 12: Current Weight */}
              {step === 12 && (
                <div className="space-y-6 w-full text-center">
                  <div className="space-y-2">
                    <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">What is your current weight?</h1>
                    <p className="text-zinc-400 text-sm">Used for calibrating target resistance and workloads.</p>
                  </div>
                  <div className="glass-card p-8 rounded-xl space-y-4 group transition-all duration-300 hover:border-[#a3e635]/30 w-full">
                    <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest block text-center">Current Weight</label>
                    <div className="flex flex-col items-center justify-center py-4">
                      <div className="flex items-baseline justify-center gap-2">
                        <input 
                          type="number"
                          value={onboarding.weight || ""}
                          onChange={(e) => setOnboarding({ ...onboarding, weight: Number(e.target.value) })}
                          className="bg-transparent border-b-2 border-zinc-800 focus:border-[#a3e635] outline-none font-black text-6xl text-[#a3e635] w-48 transition-colors text-center pb-2 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none placeholder-zinc-700 placeholder:opacity-50" 
                          placeholder="70" 
                        />
                        <span className="text-zinc-500 font-extrabold text-xl">kg</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 13: Body Fat % / Navy Method */}
              {step === 13 && (
                <div className="space-y-6 w-full">
                  <div className="space-y-2">
                    <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">Body Fat Percentage</h1>
                    <p className="text-zinc-400 text-sm">Choose how you would like to estimate your body fat %.</p>
                  </div>

                  {/* Mode Selector Tabs */}
                  <div className="flex bg-zinc-950 p-1.5 rounded-2xl border border-zinc-850 select-none w-full">
                    <button
                      type="button"
                      onClick={() => setBodyFatMode("slider")}
                      className={`flex-grow py-2 text-xs font-bold rounded-xl transition-all duration-300 ${
                        bodyFatMode === "slider" ? "bg-[#a3e635] text-black font-extrabold" : "text-zinc-500 hover:text-white"
                      }`}
                    >
                      I Know My %
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setBodyFatMode("navy");
                        const calculated = calculateNavyBFP(
                          onboarding.gender,
                          onboarding.height,
                          onboarding.neck,
                          onboarding.waist,
                          onboarding.hips
                        );
                        setOnboarding(prev => ({ ...prev, bodyFat: calculated }));
                      }}
                      className={`flex-grow py-2 text-xs font-bold rounded-xl transition-all duration-300 ${
                        bodyFatMode === "navy" ? "bg-[#a3e635] text-black font-extrabold" : "text-zinc-500 hover:text-white"
                      }`}
                    >
                      U.S. Navy Formula
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-4 bg-white/5 rounded-xl border border-white/5 p-5">
                    <div>
                      <div className="text-3xl font-black text-[#a3e635]">{onboarding.bodyFat}%</div>
                      <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mt-1">
                        {getBodyFatCategory(onboarding.bodyFat, onboarding.gender)}
                      </div>
                    </div>
                    <div className="border-l border-zinc-800/80 pl-5">
                      <div className="text-3xl font-black text-[#a3e635]">{bmi}</div>
                      <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mt-1">Calculated BMI</div>
                    </div>
                  </div>

                  {bodyFatMode === "slider" ? (
                    <div className="space-y-4">
                      <input
                        type="range"
                        min="3"
                        max="50"
                        value={onboarding.bodyFat}
                        onChange={(e) => setOnboarding({ ...onboarding, bodyFat: Number(e.target.value) })}
                        className="w-full accent-[#a3e635]"
                      />
                      <div className="flex justify-between text-[10px] text-zinc-500 font-bold px-1">
                        <span>3%</span>
                        <span>50%</span>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4 text-left bg-zinc-900/50 border border-zinc-800/80 p-5 rounded-2xl w-full">
                      {/* Neck Circumference (cm) */}
                      <div className="flex items-center gap-3 bg-zinc-950 border border-zinc-800 focus-within:border-[#a3e635] focus-within:ring-1 focus-within:ring-[#a3e635] rounded-xl px-4 py-3 transition-all duration-300">
                        <div className="p-2 bg-[#a3e635]/10 text-[#a3e635] rounded-lg flex items-center justify-center shrink-0">
                          <Activity className="w-4 h-4" />
                        </div>
                        <div className="flex-grow">
                          <label className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider block">Neck Circumference (cm)</label>
                          <input
                            type="number"
                            value={onboarding.neck || ""}
                            onChange={(e) => {
                              const val = e.target.value === "" ? "" : Number(e.target.value);
                              setOnboarding(prev => {
                                const updated = { ...prev, neck: val };
                                updated.bodyFat = calculateNavyBFP(
                                  updated.gender,
                                  updated.height,
                                  val,
                                  updated.waist,
                                  updated.hips
                                );
                                return updated;
                              });
                            }}
                            placeholder="e.g. 38"
                            className="bg-transparent text-white font-extrabold text-sm outline-none w-full mt-0.5 placeholder-zinc-700 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          />
                        </div>
                      </div>

                      {/* Waist Circumference (cm) */}
                      <div className="flex items-center gap-3 bg-zinc-950 border border-zinc-800 focus-within:border-[#a3e635] focus-within:ring-1 focus-within:ring-[#a3e635] rounded-xl px-4 py-3 transition-all duration-300">
                        <div className="p-2 bg-[#a3e635]/10 text-[#a3e635] rounded-lg flex items-center justify-center shrink-0">
                          <Flame className="w-4 h-4" />
                        </div>
                        <div className="flex-grow">
                          <label className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider block">Waist Circumference (cm)</label>
                          <input
                            type="number"
                            value={onboarding.waist || ""}
                            onChange={(e) => {
                              const val = e.target.value === "" ? "" : Number(e.target.value);
                              setOnboarding(prev => {
                                const updated = { ...prev, waist: val };
                                updated.bodyFat = calculateNavyBFP(
                                  updated.gender,
                                  updated.height,
                                  updated.neck,
                                  val,
                                  updated.hips
                                );
                                return updated;
                              });
                            }}
                            placeholder="e.g. 84"
                            className="bg-transparent text-white font-extrabold text-sm outline-none w-full mt-0.5 placeholder-zinc-700 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          />
                        </div>
                      </div>

                      {/* Hips Circumference (cm) (Female only) */}
                      {onboarding.gender === "Female" && (
                        <div className="flex items-center gap-3 bg-zinc-950 border border-zinc-800 focus-within:border-[#a3e635] focus-within:ring-1 focus-within:ring-[#a3e635] rounded-xl px-4 py-3 transition-all duration-300">
                          <div className="p-2 bg-[#a3e635]/10 text-[#a3e635] rounded-lg flex items-center justify-center shrink-0">
                            <Heart className="w-4 h-4" />
                          </div>
                          <div className="flex-grow">
                            <label className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider block">Hips Circumference (cm)</label>
                            <input
                              type="number"
                              value={onboarding.hips || ""}
                              onChange={(e) => {
                                const val = e.target.value === "" ? "" : Number(e.target.value);
                                setOnboarding(prev => {
                                  const updated = { ...prev, hips: val };
                                  updated.bodyFat = calculateNavyBFP(
                                    updated.gender,
                                    updated.height,
                                    updated.neck,
                                    updated.waist,
                                    val
                                  );
                                  return updated;
                                });
                              }}
                              placeholder="e.g. 96"
                              className="bg-transparent text-white font-extrabold text-sm outline-none w-full mt-0.5 placeholder-zinc-700 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Step 14: Target Muscles */}
              {step === 14 && (
                <div className="space-y-6 w-full">
                  <div className="space-y-2">
                    <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">Select Target Muscle Focus</h1>
                    <p className="text-zinc-400 text-sm">Select muscle areas you want StayFit Ai to prioritize.</p>
                  </div>
                  
                  {/* Flex body SVG wrapper and button lists layout */}
                  <div className="flex flex-col lg:flex-row gap-6 items-center justify-between w-full">
                    <div className="shrink-0 w-full lg:w-auto flex justify-center">
                      <DynamicBodySvg selectedMuscles={onboarding.focusAreas} />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 flex-grow w-full">
                      {[
                        { label: "Chest", icon: ChestIcon, desc: "Pectorals" },
                        { label: "Back", icon: BackIcon, desc: "Lats & Traps" },
                        { label: "Shoulders", icon: ShoulderIcon, desc: "Deltoids" },
                        { label: "Arms", icon: ArmsIcon, desc: "Biceps/Triceps" },
                        { label: "Legs", icon: LegsIcon, desc: "Quads/Hams" },
                        { label: "Glutes", icon: GlutesIcon, desc: "Posterior Chain" },
                        { label: "Core", icon: CoreIcon, desc: "Abs/Core" },
                        { label: "Full Body", icon: FullBodyIcon, desc: "All Muscles" }
                      ].map(item => {
                        const isSelected = onboarding.focusAreas.includes(item.label);
                        const Icon = item.icon;
                        return (
                          <button
                            key={item.label}
                            type="button"
                            onClick={() => handleMultiSelect("focusAreas", item.label)}
                            className={`glass-card p-4 px-4.5 h-16 md:h-[72px] rounded-xl text-left flex items-center justify-between gap-3 transition-all duration-300 ${
                              isSelected 
                                ? "bg-[#a3e635]/15 border-[#a3e635] shadow-[0_0_15px_rgba(163,230,53,0.15)] text-white" 
                                : "hover:border-[#ccff80]/30 text-zinc-400"
                            }`}
                          >
                            <div className="flex items-center gap-3 flex-grow min-w-0 pr-1">
                              <div className={`p-2.5 rounded-lg flex items-center justify-center shrink-0 ${isSelected ? "bg-[#a3e635] text-black" : "bg-white/5 text-zinc-400"}`}>
                                <Icon className="w-5 h-5" />
                              </div>
                              <div className="min-w-0">
                                <p className="text-sm font-bold text-white leading-tight truncate">{item.label}</p>
                                <p className="text-xs text-zinc-500 mt-1 leading-none truncate">{item.desc}</p>
                              </div>
                            </div>
                            {isSelected && (
                              <div className="bg-[#a3e635] text-black rounded-full p-1.5 flex items-center justify-center shrink-0">
                                <Check className="w-3.5 h-3.5 stroke-[3px]" />
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* Step 15: Injuries */}
              {step === 15 && (
                <div className="space-y-6 w-full">
                  <div className="space-y-2">
                    <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">Any injuries or joint pain?</h1>
                    <p className="text-zinc-400 text-sm">Optional: AI will modify splits to prioritize safety.</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full">
                    {[
                      { label: "None", icon: Check, desc: "Pain-free training" },
                      { label: "Shoulder", icon: ShieldAlert, desc: "AC joint or rotator cuff" },
                      { label: "Knee", icon: ShieldAlert, desc: "Patella or joint discomfort" },
                      { label: "Lower Back", icon: ShieldAlert, desc: "Lumbar stiffness or tightness" },
                      { label: "Elbow", icon: ShieldAlert, desc: "Tendonitis or joint wear" },
                      { label: "Wrist", icon: ShieldAlert, desc: "Sprain or compression soreness" },
                      { label: "Neck", icon: ShieldAlert, desc: "Stiffness or cervical strain" }
                    ].map(item => {
                      const isSelected = onboarding.injuries.includes(item.label);
                      const Icon = item.icon;
                      const isNone = item.label === "None";
                      return (
                        <button
                          key={item.label}
                          type="button"
                          onClick={() => handleMultiSelect("injuries", item.label)}
                          className={`glass-card p-4 rounded-xl text-left flex items-center justify-between gap-4 transition-all duration-300 ${
                            isSelected 
                              ? isNone 
                                ? "bg-[#a3e635]/15 border-[#a3e635] shadow-[0_0_15px_rgba(163,230,53,0.15)] text-white"
                                : "bg-red-500/10 border-red-500/50 text-white" 
                              : "hover:border-zinc-800 text-zinc-400"
                          }`}
                        >
                          <div className="flex items-center gap-4 flex-grow">
                            <div className={`p-2.5 rounded-lg flex items-center justify-center shrink-0 ${isSelected ? isNone ? "bg-[#a3e635] text-black" : "bg-red-500 text-white" : "bg-white/5 text-zinc-400"}`}>
                              <Icon className="w-5 h-5" />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-white">{item.label}</p>
                              <p className="text-xs text-zinc-500 mt-1">{item.desc}</p>
                            </div>
                          </div>
                          {isSelected && (
                            <div className={`rounded-full p-1.5 flex items-center justify-center shrink-0 ${isNone ? "bg-[#a3e635] text-black" : "bg-red-500 text-white"}`}>
                              <Check className="w-3.5 h-3.5 stroke-[3px]" />
                            </div>
                          )}
                        </button>
                      );
                    })}

                    {/* Custom injury input box */}
                    <div className="col-span-1 md:col-span-2 space-y-2 mt-2">
                      <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">Or type custom injuries / joint pain</label>
                      <div className="flex items-center gap-3 bg-zinc-950 border border-zinc-800 focus-within:border-[#a3e635] focus-within:ring-1 focus-within:ring-[#a3e635] rounded-xl px-4 py-3 transition-all duration-300">
                        <div className="p-2 bg-[#a3e635]/10 text-[#a3e635] rounded-lg flex items-center justify-center shrink-0">
                          <ShieldAlert className="w-4 h-4" />
                        </div>
                        <input
                          type="text"
                          value={onboarding.customInjury || ""}
                          onChange={(e) => {
                            const val = e.target.value;
                            setOnboarding(prev => {
                              const updated = { ...prev, customInjury: val };
                              if (val.trim() !== "" && updated.injuries.includes("None")) {
                                updated.injuries = updated.injuries.filter(i => i !== "None");
                              }
                              return updated;
                            });
                          }}
                          placeholder="e.g. Fractured bone in finger, torn meniscus"
                          className="bg-transparent text-white font-extrabold text-sm outline-none w-full placeholder-zinc-700"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 16: Country */}
              {step === 16 && (
                <div className="space-y-6 w-full text-center">
                  <div className="space-y-2">
                    <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">Which country do you live in?</h1>
                    <p className="text-zinc-400 text-sm">Used for localized food options and regional nutrition database matching.</p>
                  </div>
                  <div className="glass-card p-8 rounded-xl space-y-4 group transition-all duration-300 hover:border-[#a3e635]/30 w-full">
                    <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest block text-center">Country</label>
                    <div className="flex flex-col items-center justify-center py-4">
                      <div className="relative w-96 max-w-full">
                        <select 
                          value={onboarding.country || ""}
                          onChange={(e) => setOnboarding({ ...onboarding, country: e.target.value, state: "" })}
                          className="bg-zinc-950/70 border-2 border-zinc-800 text-[#a3e635] font-bold text-xl rounded-xl px-10 py-4 outline-none focus:border-[#a3e635] w-full transition-all appearance-none cursor-pointer text-left pl-12 pr-10"
                        >
                          <option value="" disabled className="bg-zinc-950 text-zinc-500">Select your country</option>
                          {countryList.filter(c => c !== "USA" && c !== "UK" && c !== "UAE").map((country) => (
                            <option key={country} value={country} className="bg-zinc-950 text-white font-medium">
                              {country}
                            </option>
                          ))}
                        </select>
                        <Globe className="w-5 h-5 text-zinc-500 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none group-hover:text-[#a3e635] transition-colors" />
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-500">
                          <svg className="w-5 h-5 fill-current" viewBox="0 0 20 20">
                            <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 17: State / Region */}
              {step === 17 && (
                <div className="space-y-6 w-full text-center">
                  <div className="space-y-2">
                    <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">Which state or region do you live in?</h1>
                    <p className="text-zinc-400 text-sm">Helps customize local food markets and regional dishes.</p>
                  </div>
                  <div className="glass-card p-8 rounded-xl space-y-4 group transition-all duration-300 hover:border-[#a3e635]/30 w-full">
                    <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest block text-center">State / Region</label>
                    <div className="flex flex-col items-center justify-center py-4">
                      {["india", "united states", "canada", "australia"].includes((onboarding.country || "").trim().toLowerCase()) ? (
                        <div className="relative w-96 max-w-full">
                          <select 
                            value={onboarding.state || ""}
                            onChange={(e) => setOnboarding({ ...onboarding, state: e.target.value })}
                            className="bg-zinc-950/70 border-2 border-zinc-800 text-[#a3e635] font-bold text-xl rounded-xl px-10 py-4 outline-none focus:border-[#a3e635] w-full transition-all appearance-none cursor-pointer text-left pl-12 pr-10"
                          >
                            <option value="" disabled className="bg-zinc-950 text-zinc-500">Select your state/region</option>
                            {((onboarding.country || "").trim().toLowerCase() === "india" ? indiaStates :
                              (onboarding.country || "").trim().toLowerCase() === "united states" ? usStates :
                              (onboarding.country || "").trim().toLowerCase() === "canada" ? canadaProvinces :
                              australiaStates).map((state) => (
                              <option key={state} value={state} className="bg-zinc-950 text-white font-medium">
                                {state}
                              </option>
                            ))}
                          </select>
                          <MapPin className="w-5 h-5 text-zinc-500 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none group-hover:text-[#a3e635] transition-colors" />
                          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-500">
                            <svg className="w-5 h-5 fill-current" viewBox="0 0 20 20">
                              <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                            </svg>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center gap-4 border-b-2 border-zinc-800 focus-within:border-[#a3e635] w-96 max-w-full transition-colors pb-2">
                          <MapPin className="w-6 h-6 text-zinc-500 group-hover:text-[#a3e635] transition-colors shrink-0" />
                          <input 
                            type="text"
                            value={onboarding.state || ""}
                            onChange={(e) => setOnboarding({ ...onboarding, state: e.target.value })}
                            className="bg-transparent outline-none font-bold text-2xl text-[#a3e635] w-full transition-colors placeholder-zinc-700 text-left" 
                            placeholder="e.g. Tamil Nadu, California" 
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Step 18: Lifestyle / Profession */}
              {step === 18 && (
                <div className="space-y-6 w-full">
                  <div className="space-y-2">
                    <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">Which best describes your current lifestyle?</h1>
                    <p className="text-zinc-400 text-sm">Helps adjust daily energy expenditures and schedule matching.</p>
                  </div>
                  <div className="grid grid-cols-1 gap-3 w-full">
                    {[
                      { label: "Student", desc: "Mix of sitting and walking, variable schedule" },
                      { label: "Working Professional", desc: "Primarily desk-bound or office environment work" },
                      { label: "Self-Employed / Business", desc: "Flexible hours, moderately active or high stress" },
                      { label: "Homemaker", desc: "Frequently active, on your feet managing house tasks" },
                      { label: "Retired", desc: "Lower physical job demand, focus on active aging" },
                      { label: "Other", desc: "Custom routine not listed above" }
                    ].map(item => {
                      const isSelected = onboarding.lifestyle === item.label;
                      return (
                        <button
                          key={item.label}
                          type="button"
                          onClick={() => setOnboarding({ ...onboarding, lifestyle: item.label })}
                          className={`glass-card p-4 rounded-xl text-left flex items-center justify-between gap-4 transition-all duration-300 ${
                            isSelected 
                              ? "bg-[#a3e635]/15 border-[#a3e635] shadow-[0_0_15px_rgba(163,230,53,0.15)] text-white" 
                              : "hover:border-[#ccff80]/30 text-zinc-400"
                          }`}
                        >
                          <div className="flex items-center gap-4 flex-grow">
                            <div className={`p-2.5 rounded-lg flex items-center justify-center shrink-0 ${isSelected ? "bg-[#a3e635] text-black" : "bg-white/5 text-zinc-400"}`}>
                              <Briefcase className="w-5 h-5" />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-white">{item.label}</p>
                              <p className="text-xs text-zinc-500 mt-1">{item.desc}</p>
                            </div>
                          </div>
                          {isSelected && (
                            <div className="bg-[#a3e635] text-black rounded-full p-1.5 flex items-center justify-center shrink-0">
                              <Check className="w-3.5 h-3.5 stroke-[3px]" />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Step 19: Diet Preference */}
              {step === 19 && (
                <div className="space-y-6 w-full">
                  <div className="space-y-2">
                    <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">What best describes your diet?</h1>
                    <p className="text-zinc-400 text-sm">Used for selecting suitable meal options in your nutrition plan.</p>
                  </div>
                  <div className="grid grid-cols-1 gap-3 w-full">
                    {[
                      { label: "Vegetarian", desc: "No meat, fish or poultry. Includes dairy and plant foods." },
                      { label: "Non-Vegetarian", desc: "Includes meat, poultry, fish, eggs and dairy." },
                      { label: "Both (Vegetarian & Non-Vegetarian)", desc: "Flexible diet incorporating both veg and non-veg meals." },
                      { label: "Eggetarian", desc: "Vegetarian diet but includes eggs. No poultry or red meat." },
                      { label: "Vegan", desc: "Strictly plant-based. No animal products or by-products." }
                    ].map(item => {
                      const isSelected = onboarding.dietType === item.label;
                      return (
                        <button
                          key={item.label}
                          type="button"
                          onClick={() => setOnboarding({ ...onboarding, dietType: item.label })}
                          className={`glass-card p-4 rounded-xl text-left flex items-center justify-between gap-4 transition-all duration-300 ${
                            isSelected 
                              ? "bg-[#a3e635]/15 border-[#a3e635] shadow-[0_0_15px_rgba(163,230,53,0.15)] text-white" 
                              : "hover:border-[#ccff80]/30 text-zinc-400"
                          }`}
                        >
                          <div className="flex items-center gap-4 flex-grow">
                            <div className={`p-2.5 rounded-lg flex items-center justify-center shrink-0 ${isSelected ? "bg-[#a3e635] text-black" : "bg-white/5 text-zinc-400"}`}>
                              <Activity className="w-5 h-5" />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-white">{item.label}</p>
                              <p className="text-xs text-zinc-500 mt-1">{item.desc}</p>
                            </div>
                          </div>
                          {isSelected && (
                            <div className="bg-[#a3e635] text-black rounded-full p-1.5 flex items-center justify-center shrink-0">
                              <Check className="w-3.5 h-3.5 stroke-[3px]" />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Step 20: Daily Food Budget */}
              {step === 20 && (
                <div className="space-y-6 w-full">
                  <div className="space-y-2">
                    <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">What is your approximate monthly food budget?</h1>
                    <p className="text-zinc-400 text-sm">Helps StayFit AI select affordable ingredient combinations.</p>
                  </div>
                  <div className="grid grid-cols-1 gap-3 w-full">
                    {[
                      { label: "Under ₹3,000/month", desc: "Extremely budget-friendly local staples focus" },
                      { label: "₹3,000 – ₹6,000/month", desc: "Standard budget for wholesome homemade meals" },
                      { label: "₹6,000 – ₹10,000/month", desc: "Moderate budget, allows more protein sources & variety" },
                      { label: "₹10,000 – ₹15,000/month", desc: "Premium options, imports, and organic selections" },
                      { label: "Above ₹15,000/month", desc: "No budget constraints. Max convenience & high protein variety" }
                    ].map(item => {
                      const isSelected = onboarding.foodBudget === item.label;
                      return (
                        <button
                          key={item.label}
                          type="button"
                          onClick={() => setOnboarding({ ...onboarding, foodBudget: item.label })}
                          className={`glass-card p-4 rounded-xl text-left flex items-center justify-between gap-4 transition-all duration-300 ${
                            isSelected 
                              ? "bg-[#a3e635]/15 border-[#a3e635] shadow-[0_0_15px_rgba(163,230,53,0.15)] text-white" 
                              : "hover:border-[#ccff80]/30 text-zinc-400"
                          }`}
                        >
                          <div className="flex items-center gap-4 flex-grow">
                            <div className={`p-2.5 rounded-lg flex items-center justify-center shrink-0 ${isSelected ? "bg-[#a3e635] text-black" : "bg-white/5 text-zinc-400"}`}>
                              <DollarSign className="w-5 h-5" />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-white">{item.label}</p>
                              <p className="text-xs text-zinc-500 mt-1">{item.desc}</p>
                            </div>
                          </div>
                          {isSelected && (
                            <div className="bg-[#a3e635] text-black rounded-full p-1.5 flex items-center justify-center shrink-0">
                              <Check className="w-3.5 h-3.5 stroke-[3px]" />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Step 21: Cooking Access */}
              {step === 21 && (
                <div className="space-y-6 w-full">
                  <div className="space-y-2">
                    <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">What best describes your cooking situation?</h1>
                    <p className="text-zinc-400 text-sm">We adapt recipes to fit your kitchen layout and cooking limits.</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full">
                    {[
                      { label: "Full Kitchen", desc: "Stove, oven, fridge, microwave, multiple appliances" },
                      { label: "Basic Kitchen", desc: "Stove, fridge, basic utensils" },
                      { label: "Hostel Mess", desc: "Fixed catering meals, limited manual choice" },
                      { label: "PG Accommodation", desc: "Shared kitchen or limited appliance setups" },
                      { label: "Restaurant / Outside Food", desc: "Mostly eating out or ordering meals" },
                      { label: "Tiffin Service", desc: "Subscribed home-style delivery meals" },
                      { label: "Cannot Cook", desc: "No cooking knowledge or kitchen setup" }
                    ].map(item => {
                      const isSelected = onboarding.cookingAccess === item.label;
                      return (
                        <button
                          key={item.label}
                          type="button"
                          onClick={() => setOnboarding({ ...onboarding, cookingAccess: item.label })}
                          className={`glass-card p-4 rounded-xl text-left flex items-center justify-between gap-4 transition-all duration-300 ${
                            isSelected 
                              ? "bg-[#a3e635]/15 border-[#a3e635] shadow-[0_0_15px_rgba(163,230,53,0.15)] text-white" 
                              : "hover:border-[#ccff80]/30 text-zinc-400"
                          }`}
                        >
                          <div className="flex items-center gap-4 flex-grow">
                            <div className={`p-2.5 rounded-lg flex items-center justify-center shrink-0 ${isSelected ? "bg-[#a3e635] text-black" : "bg-white/5 text-zinc-400"}`}>
                              <Utensils className="w-5 h-5" />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-white leading-tight">{item.label}</p>
                              <p className="text-[10px] text-zinc-500 mt-1 leading-normal">{item.desc}</p>
                            </div>
                          </div>
                          {isSelected && (
                            <div className="bg-[#a3e635] text-black rounded-full p-1.5 flex items-center justify-center shrink-0">
                              <Check className="w-3.5 h-3.5 stroke-[3px]" />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Step 22: Meals Per Day */}
              {step === 22 && (
                <div className="space-y-6 w-full">
                  <div className="space-y-2">
                    <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">How many meals do you usually eat in a day?</h1>
                    <p className="text-zinc-400 text-sm">We'll partition your macronutrient distribution accordingly.</p>
                  </div>
                  <div className="grid grid-cols-1 gap-3 w-full">
                    {[
                      { label: "2 Meals", desc: "Intermittent fasting style or standard late brunch + dinner" },
                      { label: "3 Meals", desc: "Breakfast, Lunch, and Dinner (Standard split)" },
                      { label: "4 Meals", desc: "3 Main meals + 1 afternoon snack/shake" },
                      { label: "5 Meals", desc: "Higher frequency split for bodybuilding or mass building" },
                      { label: "6 Meals", desc: "Elite metabolism split, frequent small portions" }
                    ].map(item => {
                      const isSelected = onboarding.mealsPerDay === item.label;
                      return (
                        <button
                          key={item.label}
                          type="button"
                          onClick={() => setOnboarding({ ...onboarding, mealsPerDay: item.label })}
                          className={`glass-card p-4 rounded-xl text-left flex items-center justify-between gap-4 transition-all duration-300 ${
                            isSelected 
                              ? "bg-[#a3e635]/15 border-[#a3e635] shadow-[0_0_15px_rgba(163,230,53,0.15)] text-white" 
                              : "hover:border-[#ccff80]/30 text-zinc-400"
                          }`}
                        >
                          <div className="flex items-center gap-4 flex-grow">
                            <div className={`p-2.5 rounded-lg flex items-center justify-center shrink-0 ${isSelected ? "bg-[#a3e635] text-black" : "bg-white/5 text-zinc-400"}`}>
                              <Clock className="w-5 h-5" />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-white">{item.label}</p>
                              <p className="text-xs text-zinc-500 mt-1">{item.desc}</p>
                            </div>
                          </div>
                          {isSelected && (
                            <div className="bg-[#a3e635] text-black rounded-full p-1.5 flex items-center justify-center shrink-0">
                              <Check className="w-3.5 h-3.5 stroke-[3px]" />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Step 23: Favorite Foods */}
              {step === 23 && (
                <div className="space-y-6 w-full text-center">
                  <div className="space-y-2">
                    <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">What are your favorite foods?</h1>
                    <p className="text-zinc-400 text-sm">Optional: Enter comma-separated items. We'll integrate them into meals. (Leave empty or type 'None' if none)</p>
                  </div>
                  <div className="glass-card p-8 rounded-xl space-y-4 group transition-all duration-300 hover:border-[#a3e635]/30 w-full">
                    <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest block text-center">Favorite Foods (Optional)</label>
                    <div className="flex flex-col items-center justify-center py-4">
                      <div className="flex items-center justify-center gap-4 border-b-2 border-zinc-800 focus-within:border-[#a3e635] w-full max-w-xl transition-colors pb-2">
                        <Heart className="w-6 h-6 text-zinc-500 group-hover:text-[#a3e635] transition-colors shrink-0" />
                        <input 
                          type="text"
                          value={onboarding.favoriteFoods || ""}
                          onChange={(e) => setOnboarding({ ...onboarding, favoriteFoods: e.target.value })}
                          className="bg-transparent outline-none font-bold text-lg text-[#a3e635] w-full transition-colors placeholder-zinc-700 text-left" 
                          placeholder="Example: Chicken, Rice, Idli, Dosa, Paneer, Fruits" 
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 24: Foods You Don't Eat */}
              {step === 24 && (
                <div className="space-y-6 w-full text-center">
                  <div className="space-y-2">
                    <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">Which foods do you prefer to avoid?</h1>
                    <p className="text-zinc-400 text-sm">Optional: Enter comma-separated items to exclude from your diet plan.</p>
                  </div>
                  <div className="glass-card p-8 rounded-xl space-y-4 group transition-all duration-300 hover:border-[#a3e635]/30 w-full">
                    <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest block text-center">Foods to Avoid (Optional)</label>
                    <div className="flex flex-col items-center justify-center py-4">
                      <div className="flex items-center justify-center gap-4 border-b-2 border-zinc-800 focus-within:border-[#a3e635] w-full max-w-xl transition-colors pb-2">
                        <ShieldAlert className="w-6 h-6 text-zinc-500 group-hover:text-[#a3e635] transition-colors shrink-0" />
                        <input 
                          type="text"
                          value={onboarding.avoidFoods || ""}
                          onChange={(e) => setOnboarding({ ...onboarding, avoidFoods: e.target.value })}
                          className="bg-transparent outline-none font-bold text-lg text-[#a3e635] w-full transition-colors placeholder-zinc-700 text-left" 
                          placeholder="Example: Mushroom, Beef, Pork, Seafood" 
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 25: Food Allergies */}
              {step === 25 && (
                <div className="space-y-6 w-full text-center">
                  <div className="space-y-2">
                    <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">Do you have any food allergies?</h1>
                    <p className="text-zinc-400 text-sm">Optional: Comma-separated items. StayFit AI will filter these for safety.</p>
                  </div>
                  <div className="glass-card p-8 rounded-xl space-y-4 group transition-all duration-300 hover:border-[#a3e635]/30 w-full">
                    <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest block text-center">Food Allergies (Optional)</label>
                    <div className="flex flex-col items-center justify-center py-4">
                      <div className="flex items-center justify-center gap-4 border-b-2 border-zinc-800 focus-within:border-[#a3e635] w-full max-w-xl transition-colors pb-2">
                        <ShieldAlert className="w-6 h-6 text-zinc-500 group-hover:text-[#a3e635] transition-colors shrink-0" />
                        <input 
                          type="text"
                          value={onboarding.allergies || ""}
                          onChange={(e) => setOnboarding({ ...onboarding, allergies: e.target.value })}
                          className="bg-transparent outline-none font-bold text-lg text-[#a3e635] w-full transition-colors placeholder-zinc-700 text-left" 
                          placeholder="Example: Peanuts, Milk, Gluten" 
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 26: Summary */}
              {step === 26 && (
                <div className="space-y-6 w-full">
                  <div className="space-y-2">
                    <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">Assessment Summary</h1>
                    <p className="text-zinc-400 text-sm">Double check your biometrics before generating.</p>
                  </div>
                  
                  <div className="max-h-[50vh] md:max-h-[58vh] overflow-y-auto pr-1.5 custom-scrollbar">
                    <div className="grid grid-cols-2 gap-3">
                      {/* User Name */}
                      {onboarding.name && (
                        <div className="p-4 bg-white/5 rounded-xl border border-white/5 flex items-center gap-3">
                          <div className="p-2 bg-[#a3e635]/10 text-[#a3e635] rounded-lg flex items-center justify-center shrink-0">
                            <User className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold block">User Name</span>
                            <span className="text-sm font-bold text-white block mt-0.5">{onboarding.name}</span>
                          </div>
                        </div>
                      )}

                      {/* Workout Goal */}
                      <div className="p-4 bg-white/5 rounded-xl border border-white/5 flex items-center gap-3">
                        <div className="p-2 bg-[#a3e635]/10 text-[#a3e635] rounded-lg flex items-center justify-center shrink-0">
                          <Sparkles className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold block">Workout Goal</span>
                          <span className="text-sm font-bold text-white block mt-0.5">{onboarding.goal}</span>
                        </div>
                      </div>

                      {/* Biological Gender */}
                      <div className="p-4 bg-white/5 rounded-xl border border-white/5 flex items-center gap-3">
                        <div className="p-2 bg-[#a3e635]/10 text-[#a3e635] rounded-lg flex items-center justify-center shrink-0">
                          <User className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold block">Biological Gender</span>
                          <span className="text-sm font-bold text-white block mt-0.5">{onboarding.gender}</span>
                        </div>
                      </div>

                      {/* Days Committed */}
                      <div className="p-4 bg-white/5 rounded-xl border border-white/5 flex items-center gap-3">
                        <div className="p-2 bg-[#a3e635]/10 text-[#a3e635] rounded-lg flex items-center justify-center shrink-0">
                          <Calendar className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold block">Days Committed</span>
                          <span className="text-sm font-bold text-white block mt-0.5">{onboarding.workoutDays} Days / Week</span>
                        </div>
                      </div>

                      {/* Recommended Split */}
                      <div className="p-4 bg-white/5 rounded-xl border border-white/5 flex items-center gap-3">
                        <div className="p-2 bg-[#a3e635]/10 text-[#a3e635] rounded-lg flex items-center justify-center shrink-0">
                          <Flame className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold block">Recommended Split</span>
                          <span className="text-sm font-black text-[#a3e635] block mt-0.5">{getRecommendedSplit(onboarding.workoutDays)}</span>
                        </div>
                      </div>

                      {/* Estimated BMI */}
                      <div className="p-4 bg-white/5 rounded-xl border border-white/5 flex items-center gap-3">
                        <div className="p-2 bg-[#a3e635]/10 text-[#a3e635] rounded-lg flex items-center justify-center shrink-0">
                          <Activity className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold block">Estimated BMI</span>
                          <span className="text-sm font-bold text-white block mt-0.5">{bmi}</span>
                        </div>
                      </div>

                      {/* Age / Birthday */}
                      <div className="p-4 bg-white/5 rounded-xl border border-white/5 flex items-center gap-3">
                        <div className="p-2 bg-[#a3e635]/10 text-[#a3e635] rounded-lg flex items-center justify-center shrink-0">
                          <Clock className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold block">Age / Birthday</span>
                          <span className="text-sm font-bold text-white block mt-0.5">{onboarding.age} Years ({onboarding.dob})</span>
                        </div>
                      </div>

                      {/* Focus Areas */}
                      <div className="p-4 bg-white/5 rounded-xl border border-white/5 flex items-center gap-3 col-span-2">
                        <div className="p-2 bg-[#a3e635]/10 text-[#a3e635] rounded-lg flex items-center justify-center shrink-0">
                          <Dumbbell className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold block">Focus Areas</span>
                          <span className="text-sm font-bold text-white block mt-0.5">{onboarding.focusAreas.join(", ")}</span>
                        </div>
                      </div>

                      {/* Equipment Available */}
                      <div className="p-4 bg-white/5 rounded-xl border border-white/5 flex items-center gap-3 col-span-2">
                        <div className="p-2 bg-[#a3e635]/10 text-[#a3e635] rounded-lg flex items-center justify-center shrink-0">
                          <Award className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold block">Equipment Available</span>
                          <span className="text-sm font-bold text-white block mt-0.5">{onboarding.equipment.join(", ")}</span>
                        </div>
                      </div>

                      {/* Injuries / Joint Pain */}
                      <div className="p-4 bg-white/5 rounded-xl border border-white/5 flex items-center gap-3 col-span-2">
                        <div className="p-2 bg-[#a3e635]/10 text-[#a3e635] rounded-lg flex items-center justify-center shrink-0">
                          <ShieldAlert className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold block">Injuries / Joint Pain</span>
                          <span className="text-sm font-bold text-white block mt-0.5">
                            {[
                              ...onboarding.injuries.filter(i => i !== "None"),
                              ...(onboarding.customInjury && onboarding.customInjury.trim() !== "" ? [onboarding.customInjury.trim()] : [])
                            ].join(", ") || "None"}
                          </span>
                        </div>
                      </div>

                      {/* Country */}
                      <div className="p-4 bg-white/5 rounded-xl border border-white/5 flex items-center gap-3">
                        <div className="p-2 bg-[#a3e635]/10 text-[#a3e635] rounded-lg flex items-center justify-center shrink-0">
                          <Globe className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold block">Country</span>
                          <span className="text-sm font-bold text-white block mt-0.5">{onboarding.country || "--"}</span>
                        </div>
                      </div>

                      {/* State */}
                      <div className="p-4 bg-white/5 rounded-xl border border-white/5 flex items-center gap-3">
                        <div className="p-2 bg-[#a3e635]/10 text-[#a3e635] rounded-lg flex items-center justify-center shrink-0">
                          <MapPin className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold block">State / Region</span>
                          <span className="text-sm font-bold text-white block mt-0.5">{onboarding.state || "--"}</span>
                        </div>
                      </div>

                      {/* Lifestyle */}
                      <div className="p-4 bg-white/5 rounded-xl border border-white/5 flex items-center gap-3">
                        <div className="p-2 bg-[#a3e635]/10 text-[#a3e635] rounded-lg flex items-center justify-center shrink-0">
                          <Briefcase className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold block">Lifestyle</span>
                          <span className="text-sm font-bold text-white block mt-0.5">{onboarding.lifestyle}</span>
                        </div>
                      </div>

                      {/* Diet Preference */}
                      <div className="p-4 bg-white/5 rounded-xl border border-white/5 flex items-center gap-3">
                        <div className="p-2 bg-[#a3e635]/10 text-[#a3e635] rounded-lg flex items-center justify-center shrink-0">
                          <Activity className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold block">Diet Preference</span>
                          <span className="text-sm font-bold text-white block mt-0.5">{onboarding.dietType}</span>
                        </div>
                      </div>

                      {/* Food Budget */}
                      <div className="p-4 bg-white/5 rounded-xl border border-white/5 flex items-center gap-3">
                        <div className="p-2 bg-[#a3e635]/10 text-[#a3e635] rounded-lg flex items-center justify-center shrink-0">
                          <DollarSign className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold block">Food Budget</span>
                          <span className="text-sm font-bold text-white block mt-0.5">{onboarding.foodBudget}</span>
                        </div>
                      </div>

                      {/* Cooking Access */}
                      <div className="p-4 bg-white/5 rounded-xl border border-white/5 flex items-center gap-3">
                        <div className="p-2 bg-[#a3e635]/10 text-[#a3e635] rounded-lg flex items-center justify-center shrink-0">
                          <Utensils className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold block">Cooking Situation</span>
                          <span className="text-sm font-bold text-white block mt-0.5">{onboarding.cookingAccess}</span>
                        </div>
                      </div>

                      {/* Meals Per Day */}
                      <div className="p-4 bg-white/5 rounded-xl border border-white/5 flex items-center gap-3 col-span-2">
                        <div className="p-2 bg-[#a3e635]/10 text-[#a3e635] rounded-lg flex items-center justify-center shrink-0">
                          <Clock className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold block">Meals Per Day</span>
                          <span className="text-sm font-bold text-white block mt-0.5">{onboarding.mealsPerDay}</span>
                        </div>
                      </div>

                      {/* Favorite Foods */}
                      <div className="p-4 bg-white/5 rounded-xl border border-white/5 flex items-center gap-3 col-span-2">
                        <div className="p-2 bg-[#a3e635]/10 text-[#a3e635] rounded-lg flex items-center justify-center shrink-0">
                          <Heart className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold block">Favorite Foods</span>
                          <span className="text-sm font-bold text-white block mt-0.5">{onboarding.favoriteFoods}</span>
                        </div>
                      </div>

                      {/* Foods You Don't Eat */}
                      <div className="p-4 bg-white/5 rounded-xl border border-white/5 flex items-center gap-3 col-span-2">
                        <div className="p-2 bg-[#a3e635]/10 text-[#a3e635] rounded-lg flex items-center justify-center shrink-0">
                          <ShieldAlert className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold block">Foods to Avoid</span>
                          <span className="text-sm font-bold text-white block mt-0.5">{onboarding.avoidFoods || "None"}</span>
                        </div>
                      </div>

                      {/* Food Allergies */}
                      <div className="p-4 bg-white/5 rounded-xl border border-white/5 flex items-center gap-3 col-span-2">
                        <div className="p-2 bg-red-500/10 text-red-400 rounded-lg flex items-center justify-center shrink-0">
                          <ShieldAlert className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold block">Food Allergies</span>
                          <span className="text-sm font-bold text-red-300 block mt-0.5">{onboarding.allergies || "None"}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Bottom Navigation Actions (Always visible at bottom) */}
      {step > 1 && (
        <div className="w-full flex flex-col mt-4 shrink-0 sticky bottom-0 z-30 bg-[#0B0B0B]/90 backdrop-blur-md pt-3 pb-2 border-t border-zinc-800/40">
          {validationError && (
            <div className="w-full bg-red-500/10 border border-red-500/25 rounded-2xl px-4 py-3 text-red-400 font-bold text-xs md:text-sm flex items-center gap-2.5 mb-3 animate-shake transition-all duration-300">
              <ShieldAlert className="w-5 h-5 shrink-0 text-red-400" />
              <span>{validationError}</span>
            </div>
          )}
          
          <footer className="w-full flex items-center justify-between gap-4">
            <button 
              type="button"
              onClick={prevStep}
              className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors font-bold text-xs active:scale-95 cursor-pointer py-2 px-3 rounded-lg hover:bg-white/5"
            >
              <ChevronLeft className="w-4 h-4" />
              Back
            </button>
            
            <button 
              type="button"
              onClick={step === 26 ? handleOnboardingComplete : nextStep}
              className="bg-[#a3e635] text-black px-6 py-2.5 rounded-xl font-bold text-xs md:text-sm flex items-center gap-2 shadow-lg shadow-[#a3e635]/15 hover:brightness-110 active:scale-95 transition-all group cursor-pointer shrink-0 z-40"
            >
              {step === 26 ? "Get Started" : "Next Step"}
              <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </footer>
        </div>
      )}
    </div>
  </div>
  );
};

export default LoginSignup;
