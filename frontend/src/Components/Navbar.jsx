import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useUser, useAuth, UserButton } from "../lib/clerkClient";
import { Dumbbell, Menu, X, Home, LayoutDashboard, Sparkles, BookOpen } from "lucide-react";
import { Button } from "./ui/button";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isLoaded: userLoaded } = useUser();
  const { isSignedIn } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Prioritize onboarding-entered name over Clerk username
  const getDisplayName = () => {
    // 1. Check localStorage onboarding data
    try {
      const stored = localStorage.getItem("stayfit_onboarding_data");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.name && parsed.name.trim()) return parsed.name.trim();
      }
    } catch (e) { /* ignore */ }
    // 2. Check for cached plan name 
    try {
      const cachedPlan = localStorage.getItem("stayfit_latest_plan_name");
      if (cachedPlan && cachedPlan.trim()) return cachedPlan.trim();
    } catch (e) { /* ignore */ }
    // 3. Fallback to Clerk data
    if (user) return user.firstName || user.username || "Athlete";
    return "Athlete";
  };

  const displayName = getDisplayName();

  const isActive = (path) => location.pathname === path;

  const navItems = [
    { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { label: "Your Plan", path: "/plan", icon: Dumbbell },
    { label: "How To Do", path: "/howtodo", icon: BookOpen },
    { label: "Generator", path: "/generate", icon: Sparkles },
  ];

  const handleNavClick = (path) => {
    setMobileMenuOpen(false);
    navigate(path);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#000000]/85 backdrop-blur-xl border-b border-zinc-900 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center">
        {/* Desktop: Flex-row premium layout */}
        <div className="hidden md:flex items-center justify-between w-full">
          {/* Left: Brand Logo */}
          <div 
            className="flex items-center gap-2 cursor-pointer group" 
            onClick={() => handleNavClick("/dashboard")}
          >
            <div className="w-9 h-9 rounded-xl bg-black border border-zinc-800 flex items-center justify-center overflow-hidden shadow-[0_0_15px_rgba(163,230,53,0.3)] group-hover:shadow-[0_0_20px_rgba(163,230,53,0.5)] group-hover:scale-105 transition-all duration-300">
              <img src="/favicon.png" alt="StayFit AI Logo" className="w-full h-full object-contain p-0.5" />
            </div>
            <span className="font-bold text-xl tracking-tight text-white group-hover:text-[#A3E635] transition-colors duration-300">
              StayFit <span className="text-[#A3E635]">Ai</span>
            </span>
          </div>

          {/* Center: Navigation Links */}
          <nav className="flex items-center gap-1 bg-zinc-900/40 p-1.5 rounded-xl border border-zinc-800/50">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              return (
                <button
                  key={item.path}
                  onClick={() => handleNavClick(item.path)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-semibold transition-all duration-300 relative whitespace-nowrap ${
                    active 
                      ? "text-[#A3E635] bg-zinc-900 border border-zinc-800 shadow-[0_0_15px_rgba(163,230,53,0.05)]" 
                      : "text-zinc-400 hover:text-white hover:bg-zinc-900/40"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${active ? "text-[#A3E635]" : "text-zinc-400"}`} />
                  <span>{item.label}</span>
                  {active && (
                    <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-8 h-[2px] bg-[#A3E635] rounded-full shadow-[0_0_8px_#A3E635]" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right: Athlete Profile */}
          <div className="flex items-center gap-4">
            {isSignedIn && userLoaded && user && (
              <div className="flex items-center gap-3 bg-zinc-900/50 pl-3 pr-2 py-1.5 rounded-xl border border-zinc-800/80">
                <span className="text-xs text-zinc-400 font-medium">
                  Athlete: <strong className="text-zinc-200">{displayName}</strong>
                </span>
                <UserButton afterSignOutUrl="/" />
              </div>
            )}
            {!isSignedIn && (
              <Button 
                onClick={() => handleNavClick("/")}
                className="bg-[#A3E635] hover:bg-[#ccff80] text-black font-semibold text-sm px-4 py-2 rounded-lg transition-all duration-300"
              >
                Sign In
              </Button>
            )}
          </div>
        </div>

        {/* Mobile: Logo + Hamburger */}
        <div className="flex items-center justify-between md:hidden w-full">
          <div 
            className="flex items-center gap-2 cursor-pointer group" 
            onClick={() => handleNavClick("/dashboard")}
          >
            <div className="w-9 h-9 rounded-xl bg-black border border-zinc-800 flex items-center justify-center overflow-hidden shadow-[0_0_15px_rgba(163,230,53,0.3)]">
              <img src="/favicon.png" alt="StayFit AI Logo" className="w-full h-full object-contain p-0.5" />
            </div>
            <span className="font-bold text-xl tracking-tight text-white">
              StayFit <span className="text-[#A3E635]">Ai</span>
            </span>
          </div>
          <div className="flex items-center gap-4">
            {isSignedIn && userLoaded && <UserButton afterSignOutUrl="/" />}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="w-10 h-10 flex items-center justify-center rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white active:scale-95 transition-all"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-zinc-900 bg-black/95 backdrop-blur-xl animate-in slide-in-from-top duration-200">
          <div className="px-6 py-6 space-y-3">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              return (
                <button
                  key={item.path}
                  onClick={() => handleNavClick(item.path)}
                  className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl text-left text-sm font-semibold transition-all duration-300 ${
                    active 
                      ? "text-[#A3E635] bg-[#A3E635]/5 border border-[#A3E635]/20 shadow-[0_0_15px_rgba(163,230,53,0.05)]" 
                      : "text-zinc-400 hover:text-white hover:bg-zinc-900/50"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${active ? "text-[#A3E635]" : "text-zinc-400"}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
            
            {!isSignedIn && (
              <Button 
                onClick={() => handleNavClick("/")}
                className="w-full bg-[#A3E635] hover:bg-[#ccff80] text-black font-semibold text-sm py-3 rounded-xl transition-all duration-300 mt-4"
              >
                Sign In
              </Button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
