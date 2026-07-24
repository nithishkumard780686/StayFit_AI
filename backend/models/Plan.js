import mongoose from "mongoose";

const planSchema = new mongoose.Schema(
  {
    name: { type: String },
    userId: { type: String }, // Associated Clerk User ID
    age: { type: Number },
    gender: { type: String },
    height: { type: Number },
    weight: { type: Number },
    neck: { type: Number },
    waist: { type: Number },
    hips: { type: Number },
    bodyFatPercentage: { type: Number },
    fitnessGoals: { type: String },
    dietPreference: { type: String },
    workoutPlan: { type: String },
    dietPlan: { type: String },

    // Onboarding Fields
    goal: { type: String },
    fitnessLevel: { type: String },
    activityLevel: { type: String },
    workoutDays: { type: Number },
    workoutDuration: { type: Number },
    equipment: [String],
    bodyFat: { type: Number },
    focusAreas: [String],
    injuries: [String],
    bmi: { type: Number },

    // Food & Lifestyle Preferences
    country: { type: String },
    state: { type: String },
    lifestyle: { type: String },
    dietType: { type: String },
    foodBudget: { type: String },
    cookingAccess: { type: String },
    mealsPerDay: { type: String },
    favoriteFoods: { type: String },
    avoidFoods: { type: String },
    allergies: { type: String }
  },
  { timestamps: true }
);

const Plan = mongoose.model("Plan", planSchema);

export default Plan;
