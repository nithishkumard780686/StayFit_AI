import React from "react";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import LoginSignup from "./Components/Auth/LoginSignup";
import GeneratorPage from "./Components/Generator/GeneratorPage";
import DashboardPage from "./Components/Dashboard/DashboardPage";
import YourPlan from "./Components/Dashboard/YourPlan";
import HowToDo from "./Components/HowToDo/HowToDo";
import HeroVisual, { HeroBackground } from "./Components/Auth/HeroVisual";
import { AuthenticateWithRedirectCallback } from "./lib/clerkClient";

const SSOCallbackHandler = () => {
  const navigate = useNavigate();
  React.useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/dashboard");
    }, 4500);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="bg-[#0B0B0B] h-screen w-screen flex flex-col items-center justify-center text-white relative">
      <HeroBackground />
      <div className="relative z-10 flex flex-col items-center justify-center gap-4">
        <div className="relative w-16 h-16 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full border-4 border-zinc-800 border-t-[#a3e635] animate-spin" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#a3e635] animate-ping" />
        </div>
        <p className="text-zinc-400 text-xs font-bold uppercase tracking-widest animate-pulse">
          Securing connection...
        </p>
      </div>
      <AuthenticateWithRedirectCallback 
        signUpForceRedirectUrl="/dashboard" 
        signInForceRedirectUrl="/dashboard" 
      />
    </div>
  );
};

function App() {
  return (
    <Routes>
      {/* Home/Auth Route: Split layout with unified premium background */}
      <Route
        path="/"
        element={
          <div className="bg-[#0B0B0B] h-screen text-white flex flex-col lg:flex-row overflow-hidden relative">
            {/* Global Animated Gradient Background */}
            <HeroBackground />

            {/* Left Part: Auth Forms (transparent background) */}
            <main className="flex-1 w-full lg:w-[55%] h-full flex flex-col items-center justify-center p-4 md:p-8 lg:p-12 overflow-y-auto bg-transparent relative z-20">
              <LoginSignup />
            </main>

            {/* Right Part: Premium AI Fitness Dashboard Visual */}
            <section className="hidden lg:flex flex-1 w-full lg:w-[45%] h-screen sticky top-0 items-center justify-center overflow-hidden relative z-10">
              <HeroVisual />
            </section>
          </div>
        }
      />

      {/* Generator Route: Full-screen content, no 3D model */}
      <Route path="/generate" element={<GeneratorPage />} />

      {/* Dashboard Route: Show user details and plan history */}
      <Route path="/dashboard" element={<DashboardPage />} />

      {/* Plan Details Route */}
      <Route path="/plan" element={<YourPlan />} />

      {/* Workout Guide Library: Full-screen content, no 3D model */}
      <Route path="/howtodo" element={<HowToDo />} />

      {/* SSO OAuth Callback Handler Route */}
      <Route path="/sso-callback" element={<SSOCallbackHandler />} />
    </Routes>
  );
}

export default App;
