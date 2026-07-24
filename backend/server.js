import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import { generateText } from "ai";
import { google } from "@ai-sdk/google";
import Plan from "./models/Plan.js";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from absolute path
dotenv.config({ path: path.join(__dirname, ".env") });

console.log("Loaded GOOGLE_GENERATIVE_AI_API_KEY:", process.env.GOOGLE_GENERATIVE_AI_API_KEY ? "Yes" : "No");

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());

// ==========================================
// MongoDB Atlas Connection Setup
// ==========================================
const mongodbUri = process.env.MONGODB_URI;
if (mongodbUri && !mongodbUri.includes("<username>")) {
  mongoose
    .connect(mongodbUri)
    .then(() => console.log("MongoDB Atlas Connection: Connected successfully!"))
    .catch((err) => console.error("MongoDB Atlas Connection: Connection error -", err.message));
} else {
  console.warn("MongoDB Atlas Connection: Missing or unconfigured MONGODB_URI in backend/.env");
}

// Route 1: LLM Prompt Generation (Gemini 3.5 Flash)
app.post("/api/gemini", async (req, res) => {
  const requestId = Date.now().toString(36);

  try {
    const { prompt } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required" });
    }

    const promptPreview = prompt.substring(0, 80).replace(/\n/g, " ");
    console.log(`[${requestId}] POST /api/gemini -> Request received (${prompt.length} chars): "${promptPreview}..."`);

    const startTime = Date.now();
    const { text } = await generateText({
      model: google("gemini-3.5-flash"),
      prompt,
      maxRetries: 2,
    });
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);

    console.log(`[${requestId}] generateText completed in ${elapsed}s (${text.length} chars)`);
    return res.json({ text });
  } catch (error) {
    console.error(`[${requestId}] Gemini Generation Error:`, error.message || error);
    const errorMessage = error instanceof Error ? error.message : "Internal Server Error";
    return res.status(500).json({ error: errorMessage });
  }
});

// Route 2: Save Fitness & Diet Plan to File-based Local DataBase
app.post("/api/plans", async (req, res) => {
  try {
    const {
      userId,
      name,
      age,
      gender,
      height,
      weight,
      neck,
      waist,
      hips,
      bodyFatPercentage,
      fitnessGoals,
      dietPreference,
      workoutPlan,
      dietPlan,
      
      // Onboarding fields
      goal,
      fitnessLevel,
      activityLevel,
      workoutDays,
      workoutDuration,
      equipment,
      bodyFat,
      focusAreas,
      injuries,
      bmi,

      // Food & Lifestyle Preferences
      country,
      state,
      lifestyle,
      dietType,
      foodBudget,
      cookingAccess,
      mealsPerDay,
      favoriteFoods,
      avoidFoods,
      allergies
    } = req.body;

    const planData = {
      userId,
      name,
      age: age ? Number(age) : undefined,
      gender,
      height: height ? Number(height) : undefined,
      weight: weight ? Number(weight) : undefined,
      neck: neck ? Number(neck) : undefined,
      waist: waist ? Number(waist) : undefined,
      hips: hips ? Number(hips) : undefined,
      bodyFatPercentage: bodyFatPercentage ? Number(bodyFatPercentage) : undefined,
      fitnessGoals,
      dietPreference,
      workoutPlan,
      dietPlan,
      
      // Onboarding fields mapping
      goal,
      fitnessLevel,
      activityLevel,
      workoutDays: workoutDays ? Number(workoutDays) : undefined,
      workoutDuration: workoutDuration ? Number(workoutDuration) : undefined,
      equipment,
      bodyFat: bodyFat ? Number(bodyFat) : undefined,
      focusAreas,
      injuries,
      bmi: bmi ? Number(bmi) : undefined,

      // Food & Lifestyle Preferences mapping
      country,
      state,
      lifestyle,
      dietType,
      foodBudget,
      cookingAccess,
      mealsPerDay,
      favoriteFoods: favoriteFoods || "None",
      avoidFoods: avoidFoods || "None",
      allergies: allergies || "None",
      
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const savedPlan = await Plan.create(planData);

    return res.status(201).json(savedPlan);
  } catch (error) {
    console.error("Save Plan Error:", error);
    const errorMessage = error instanceof Error ? error.message : "Internal Server Error";
    return res.status(500).json({ error: errorMessage });
  }
});

// Route 3: Get All Plans (History)
app.get("/api/plans", async (req, res) => {
  try {
    const { userId } = req.query;
    
    const plans = userId 
      ? await Plan.find({ userId }).sort({ createdAt: -1 })
      : await Plan.find().sort({ createdAt: -1 });
    return res.json(plans);
  } catch (error) {
    console.error("Fetch Plans Error:", error);
    const errorMessage = error instanceof Error ? error.message : "Internal Server Error";
    return res.status(500).json({ error: errorMessage });
  }
});

// Route 4: Update Plan details
app.put("/api/plans/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const updated = await Plan.findByIdAndUpdate(id, updateData, { new: true });
    if (!updated) return res.status(404).json({ error: "Plan not found." });
    return res.json(updated);
  } catch (error) {
    console.error("Update Plan Error:", error);
    const errorMessage = error instanceof Error ? error.message : "Internal Server Error";
    return res.status(500).json({ error: errorMessage });
  }
});

// Health Check Route for Deployment Monitoring
app.get("/", (req, res) => {
  res.json({ status: "ok", message: "StayFit Ai Backend API Server is running" });
});

// Start Server
app.listen(PORT, async () => {
  console.log("==========================================");
  console.log(`Server is running on port ${PORT}`);
  console.log("GOOGLE_GENERATIVE_AI_API_KEY Check: Loaded successfully");
  
  const clerkKey = process.env.CLERK_PUBLISHABLE_KEY || process.env.VITE_CLERK_PUBLISHABLE_KEY;
  if (clerkKey) {
    console.log("Clerk Authentication Connection: Configured successfully!");
  } else {
    console.warn("Clerk Authentication Connection: Missing publishable key");
  }
  console.log("==========================================");
});
