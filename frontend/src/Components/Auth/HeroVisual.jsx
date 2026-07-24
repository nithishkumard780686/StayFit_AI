import React from "react";
import { Flame, Heart, Dumbbell, Activity, Droplet, Apple } from "lucide-react";

// 1. Full-Screen Background Component (Gradient, Blobs, Particles)
// KEPT EXACTLY THE SAME AS PREVIOUS DESIGN
export const HeroBackground = () => {
  // Generate coordinates for 22 glowing particles scattered across the screen
  const particles = Array.from({ length: 22 }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    top: `${10 + Math.random() * 80}%`,
    size: Math.random() * 3 + 1.5,
    delay: `${Math.random() * 6}s`,
    duration: `${8 + Math.random() * 10}s`,
  }));

  return (
    <div className="absolute inset-0 w-full h-full bg-[#0B0B0B] overflow-hidden pointer-events-none z-0">
      <style>{`
        /* Smooth background gradient slow shifting */
        @keyframes bgShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        /* Large glowing blobs slow drifting */
        @keyframes driftBlob1 {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(50px, -80px) scale(1.1); }
          66% { transform: translate(-40px, 30px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }

        @keyframes driftBlob2 {
          0% { transform: translate(0px, 0px) scale(1); }
          50% { transform: translate(-70px, 50px) scale(0.95); }
          100% { transform: translate(0px, 0px) scale(1); }
        }

        @keyframes driftBlob3 {
          0% { transform: translate(0px, 0px) scale(1); }
          40% { transform: translate(40px, 60px) scale(1.05); }
          80% { transform: translate(-30px, -50px) scale(0.95); }
          100% { transform: translate(0px, 0px) scale(1); }
        }

        /* Particles gentle rising */
        @keyframes floatParticle {
          0% { transform: translateY(120px) scale(0); opacity: 0; }
          20% { opacity: 0.5; }
          80% { opacity: 0.25; }
          100% { transform: translateY(-350px) scale(1); opacity: 0; }
        }

        .animate-bg-shift {
          background-size: 200% 200%;
          animation: bgShift 18s ease infinite;
        }
        .animate-blob-1 { animation: driftBlob1 28s ease-in-out infinite; }
        .animate-blob-2 { animation: driftBlob2 22s ease-in-out infinite; }
        .animate-blob-3 { animation: driftBlob3 25s ease-in-out infinite; }
      `}</style>

      {/* Shifting Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-tr from-[#05060f] via-[#0B0B0B] to-[#0c0514] animate-bg-shift" />

      {/* Drifting Blobs */}
      <div className="absolute inset-0 overflow-hidden opacity-85">
        {/* Cyan Blob (Left-Top) */}
        <div className="absolute -top-[10%] left-[5%] w-[550px] h-[550px] rounded-full bg-cyan-500/12 filter blur-[110px] animate-blob-1" />
        {/* Purple Blob (Right-Bottom) */}
        <div className="absolute -bottom-[10%] right-[10%] w-[600px] h-[600px] rounded-full bg-purple-600/10 filter blur-[130px] animate-blob-2" />
        {/* Neon Green Blob (Center-Right) */}
        <div className="absolute top-[35%] left-[35%] w-[450px] h-[450px] rounded-full bg-[#B6FF2E]/6 filter blur-[120px] animate-blob-3" />
        {/* Violet Blob (Left-Bottom) */}
        <div className="absolute -bottom-[10%] left-[2%] w-[500px] h-[500px] rounded-full bg-violet-600/8 filter blur-[120px] animate-blob-2" />
      </div>

      {/* Left-Side Soft Radial Lighting Glow (centers behind onboarding form) */}
      <div className="absolute top-1/2 left-[27%] -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] pointer-events-none rounded-full bg-[radial-gradient(circle,_rgba(6,182,212,0.04)_0%,_transparent_70%)]" />

      {/* Floating Particles */}
      <div className="absolute inset-0">
        {particles.map((p) => (
          <div
            key={p.id}
            className="absolute rounded-full bg-white"
            style={{
              left: p.left,
              top: p.top,
              width: `${p.size}px`,
              height: `${p.size}px`,
              opacity: 0,
              boxShadow: "0 0 6px rgba(255, 255, 255, 0.6)",
              animation: `floatParticle ${p.duration} linear infinite`,
              animationDelay: p.delay,
            }}
          />
        ))}
      </div>
    </div>
  );
};

// 2. Right-Side Foreground Component (Grid, AI Core, Cards)
const HeroVisual = () => {
  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden flex items-center justify-center select-none font-sans bg-transparent z-10">
      <style>{`
        /* Floating animations for individual glass cards */
        @keyframes cardFloat1 {
          0% { transform: translateY(0px) rotate(0.5deg); }
          50% { transform: translateY(-12px) rotate(-0.5deg); }
          100% { transform: translateY(0px) rotate(0.5deg); }
        }
        @keyframes cardFloat2 {
          0% { transform: translateY(0px) rotate(-0.5deg); }
          50% { transform: translateY(14px) rotate(0.5deg); }
          100% { transform: translateY(0px) rotate(-0.5deg); }
        }
        @keyframes cardFloat3 {
          0% { transform: translateY(0px) rotate(0.3deg); }
          50% { transform: translateY(-16px) rotate(-0.3deg); }
          100% { transform: translateY(0px) rotate(0.3deg); }
        }
        @keyframes cardFloat4 {
          0% { transform: translateY(0px) rotate(-0.4deg); }
          50% { transform: translateY(10px) rotate(0.4deg); }
          100% { transform: translateY(0px) rotate(-0.4deg); }
        }
        @keyframes cardFloat5 {
          0% { transform: translateY(0px) rotate(0.6deg); }
          50% { transform: translateY(-14px) rotate(-0.6deg); }
          100% { transform: translateY(0px) rotate(0.6deg); }
        }

        /* Concentric tracks pulsing */
        @keyframes pulseTrack {
          0% { opacity: 0.15; transform: scale(0.98); }
          50% { opacity: 0.35; transform: scale(1.02); }
          100% { opacity: 0.15; transform: scale(0.98); }
        }

        /* SVG cardiogram line drawing flow */
        @keyframes cardiogramFlow {
          0% { stroke-dashoffset: 280; }
          100% { stroke-dashoffset: 0; }
        }

        /* Heart scale heartbeat pulse */
        @keyframes heartbeat {
          0%, 100% { transform: scale(1); }
          25% { transform: scale(1.2); }
          40% { transform: scale(1.05); }
          55% { transform: scale(1.25); }
        }

        /* Water wave progress indicator flow */
        @keyframes waveMove {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }

        /* Rotating ring logic */
        @keyframes rotateClockwise {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes rotateCounterClockwise {
          0% { transform: rotate(360deg); }
          100% { transform: rotate(0deg); }
        }

        .animate-card-1 { animation: cardFloat1 7s ease-in-out infinite; }
        .animate-card-2 { animation: cardFloat2 8.5s ease-in-out infinite; }
        .animate-card-3 { animation: cardFloat3 9s ease-in-out infinite; }
        .animate-card-4 { animation: cardFloat4 6s ease-in-out infinite; }
        .animate-card-5 { animation: cardFloat5 7.8s ease-in-out infinite; }

        .animate-pulse-track { animation: pulseTrack 4s ease-in-out infinite; }
        .animate-cardiogram {
          stroke-dasharray: 280;
          animation: cardiogramFlow 6s linear infinite;
        }
        .animate-heart { animation: heartbeat 1.4s ease-in-out infinite; }
        .animate-rotate-cw { animation: rotateClockwise 25s linear infinite; }
        .animate-rotate-ccw { animation: rotateCounterClockwise 20s linear infinite; }
        .animate-wave { animation: waveMove 2s linear infinite; }
      `}</style>

      {/* Radial Lighting Center Glow behind AI Core */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] pointer-events-none rounded-full bg-[radial-gradient(circle,_rgba(182,255,46,0.05)_0%,_transparent_70%)]" />

      {/* Fine Isometric Grid Lines */}
      <div 
        className="absolute inset-0 opacity-[0.1] pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255, 255, 255, 0.08) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.08) 1px, transparent 1px)
          `,
          backgroundSize: "48px 48px",
          maskImage: "radial-gradient(circle at center, black 30%, transparent 75%)",
          WebkitMaskImage: "radial-gradient(circle at center, black 30%, transparent 75%)",
          transform: "perspective(1000px) rotateX(60deg) translateY(-80px) translateZ(-100px) scale(1.4)",
        }}
      />

      {/* Central AI Fitness Core centerpiece (SVG Concentric Diagnostic Graphic) */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[390px] h-[390px] flex items-center justify-center pointer-events-none">
        {/* Pulsing Back Glow Rings */}
        <div className="absolute inset-4 rounded-full border border-zinc-850/20 animate-pulse-track" />
        <div className="absolute inset-16 rounded-full border border-zinc-900/10 animate-pulse-track" style={{ animationDelay: "1s" }} />

        {/* Concentric HUD SVGs */}
        <svg className="w-full h-full absolute drop-shadow-[0_0_30px_rgba(182,255,46,0.15)] overflow-visible" viewBox="0 0 200 200">
          <defs>
            <linearGradient id="neonGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#B6FF2E" />
              <stop offset="100%" stopColor="#06b6d4" />
            </linearGradient>
            <linearGradient id="purpleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#a855f7" />
              <stop offset="100%" stopColor="#6366f1" />
            </linearGradient>
          </defs>

          {/* Outer Dashed Track - Clockwise */}
          <circle
            cx="100"
            cy="100"
            r="82"
            fill="none"
            stroke="url(#neonGrad)"
            strokeWidth="0.75"
            strokeDasharray="8 20"
            className="origin-center animate-rotate-cw"
            opacity="0.65"
          />

          {/* Inner Dashed Track - Counter Clockwise */}
          <circle
            cx="100"
            cy="100"
            r="68"
            fill="none"
            stroke="#a855f7"
            strokeWidth="0.5"
            strokeDasharray="3 12 12 3"
            className="origin-center animate-rotate-ccw"
            opacity="0.5"
          />

          {/* Solid Tech Guide Circles */}
          <circle cx="100" cy="100" r="54" fill="none" stroke="rgba(255, 255, 255, 0.04)" strokeWidth="1" />
          <circle cx="100" cy="100" r="42" fill="none" stroke="rgba(182, 255, 46, 0.12)" strokeWidth="1.5" strokeDasharray="90 30" className="origin-center animate-rotate-cw" />

          {/* Futuristic Crosshairs */}
          <line x1="100" y1="12" x2="100" y2="22" stroke="rgba(255, 255, 255, 0.15)" strokeWidth="0.75" />
          <line x1="100" y1="178" x2="100" y2="188" stroke="rgba(255, 255, 255, 0.15)" strokeWidth="0.75" />
          <line x1="12" y1="100" x2="22" y2="100" stroke="rgba(255, 255, 255, 0.15)" strokeWidth="0.75" />
          <line x1="178" y1="100" x2="188" y2="100" stroke="rgba(255, 255, 255, 0.15)" strokeWidth="0.75" />

          {/* Radially positioned diagnostic connector lines & real-time metric texts */}
          
          {/* Top-Right: Heartbeat Callout (Cyan) */}
          <path d="M 130 70 L 146 54 L 164 54" stroke="rgba(6, 182, 212, 0.4)" strokeWidth="0.75" fill="none" />
          <circle cx="130" cy="70" r="1.5" fill="#06b6d4" />
          <text x="167" y="57" fill="#06b6d4" fontSize="4.5" fontFamily="monospace" fontWeight="bold" letterSpacing="0.5">HR // 145 BPM</text>

          {/* Top-Left: Calories Callout (Orange) */}
          <path d="M 70 70 L 54 54 L 36 54" stroke="rgba(251, 146, 60, 0.4)" strokeWidth="0.75" fill="none" />
          <circle cx="70" cy="70" r="1.5" fill="#fb923c" />
          <text x="33" y="57" fill="#fb923c" fontSize="4.5" fontFamily="monospace" fontWeight="bold" letterSpacing="0.5" textAnchor="end">CAL // 742 KCAL</text>

          {/* Bottom-Left: AI Engine Callout (Neon Green) */}
          <path d="M 70 130 L 54 146 L 36 146" stroke="rgba(182, 255, 46, 0.4)" strokeWidth="0.75" fill="none" />
          <circle cx="70" cy="130" r="1.5" fill="#B6FF2E" />
          <text x="33" y="149" fill="#B6FF2E" fontSize="4.5" fontFamily="monospace" fontWeight="bold" letterSpacing="0.5" textAnchor="end">SYS // AI ACTIVE</text>

          {/* Bottom-Right: Recovery Callout (Purple) */}
          <path d="M 130 130 L 146 146 L 164 146" stroke="rgba(168, 85, 247, 0.4)" strokeWidth="0.75" fill="none" />
          <circle cx="130" cy="130" r="1.5" fill="#a855f7" />
          <text x="167" y="149" fill="#a855f7" fontSize="4.5" fontFamily="monospace" fontWeight="bold" letterSpacing="0.5">REC // 92%</text>

          {/* Top-Center Status Text */}
          <text x="100" y="30" fill="rgba(255, 255, 255, 0.3)" fontSize="3.5" fontFamily="monospace" fontWeight="bold" letterSpacing="1.2" textAnchor="middle">ENGINE STATUS // OPTIMIZING</text>

          {/* Center Graphic: Glowing Athletic Human Silhouette */}
          <g transform="translate(87, 85)" fill="none" stroke="#B6FF2E" strokeWidth="1.75" strokeLinecap="round" className="drop-shadow-[0_0_6px_rgba(182, 255, 46, 0.8)]">
            {/* Head */}
            <circle cx="13" cy="4.5" r="2.5" fill="#B6FF2E" stroke="none" />
            {/* Torso & Leg 1 */}
            <path d="M13 7 C12.5 10, 11 12.5, 12.5 16 L18 22 L24 28" />
            {/* Leg 2 */}
            <path d="M12.5 16 L8.5 21 L4.5 26" />
            {/* Arm 1 */}
            <path d="M13 8 L8 10.5 L4 13" />
            {/* Arm 2 */}
            <path d="M13 9 C15.5 10.5, 19.5 9.5, 22.5 12" />
          </g>
        </svg>
      </div>

      {/* 5 Premium Fitness-focused Floating Glassmorphism Cards */}

      {/* Card 1: 💪 Today's Workout (Top-Left) */}
      <div className="absolute top-[10%] left-[5%] xl:left-[8%] animate-card-1">
        <div className="backdrop-blur-xl bg-zinc-950/40 border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.5)] rounded-2xl p-4 w-[230px] transition-all hover:border-[#B6FF2E]/30 group">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Today's Workout</span>
            <div className="p-1.5 rounded-lg bg-[#B6FF2E]/10 text-[#B6FF2E] group-hover:scale-110 transition-transform">
              <Dumbbell className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2.5">
            <h4 className="text-sm font-bold text-white leading-tight">Upper Body Strength</h4>
            <span className="text-[11px] text-zinc-400 mt-0.5 block">Duration: 52 min</span>
          </div>
          <div className="mt-3 flex items-center justify-between">
            <span className="text-xs font-black text-white">78% Complete</span>
            {/* Circular Progress Ring */}
            <div className="w-8 h-8 relative shrink-0">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 24 24">
                <circle
                  cx="12"
                  cy="12"
                  r="9"
                  fill="none"
                  stroke="rgba(255, 255, 255, 0.05)"
                  strokeWidth="2.5"
                />
                <circle
                  cx="12"
                  cy="12"
                  r="9"
                  fill="none"
                  stroke="#B6FF2E"
                  strokeWidth="2.5"
                  strokeDasharray="56.5"
                  strokeDashoffset={56.5 - (56.5 * 78) / 100}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-[7px] font-black text-white">78%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Card 2: 🏃 Cardio Session (Top-Right) */}
      <div className="absolute top-[16%] right-[5%] xl:right-[8%] animate-card-2">
        <div className="backdrop-blur-xl bg-zinc-950/40 border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.5)] rounded-2xl p-4 w-[220px] transition-all hover:border-[#B6FF2E]/30 group">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Cardio Session</span>
            <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 group-hover:scale-110 transition-transform">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2.5">
            <h4 className="text-sm font-bold text-white leading-tight">HIIT Training</h4>
            <span className="block text-[11px] text-[#06b6d4] font-bold mt-1 uppercase tracking-wide">Zone: 145 bpm</span>
          </div>
          {/* Animated pulse cardiogram wave line */}
          <div className="mt-3 h-7 w-full overflow-hidden opacity-80">
            <svg viewBox="0 0 160 30" className="w-full h-full">
              <path
                d="M 0 15 L 30 15 L 40 5 L 48 25 L 56 15 L 75 15 L 85 5 L 93 25 L 101 15 L 120 15 L 130 5 L 138 25 L 146 15 L 160 15"
                fill="none"
                stroke="url(#cyanLimeGrad)"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="animate-cardiogram"
              />
              <defs>
                <linearGradient id="cyanLimeGrad" x1="0" y1="0" x2="160" y2="0" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#06b6d4" />
                  <stop offset="50%" stopColor="#B6FF2E" />
                  <stop offset="100%" stopColor="#06b6d4" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>
      </div>

      {/* Card 3: 🔥 Calories Burned (Center-Left) */}
      <div className="absolute top-[44%] left-[2%] xl:left-[4%] animate-card-3">
        <div className="backdrop-blur-xl bg-zinc-950/40 border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.5)] rounded-2xl p-4 w-[230px] transition-all hover:border-[#B6FF2E]/30 group">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Calories Burned</span>
            <div className="p-1.5 rounded-lg bg-orange-500/10 text-orange-400 group-hover:scale-110 transition-transform">
              <Flame className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2.5">
            <span className="text-2xl font-black text-white tracking-tight">742</span>
            <span className="text-xs text-zinc-400 ml-1 font-semibold">kcal</span>
          </div>
          {/* Progress Goal Indicator */}
          <div className="mt-3">
            <div className="flex justify-between text-[9px] font-bold text-zinc-500 mb-1">
              <span>DAILY GOAL</span>
              <span>74%</span>
            </div>
            <div className="h-1.5 w-full bg-zinc-900 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-orange-500 to-[#B6FF2E] rounded-full w-[74%] shadow-[0_0_8px_rgba(182,255,46,0.3)]" />
            </div>
          </div>
        </div>
      </div>

      {/* Card 4: 🥗 Daily Nutrition (Bottom-Right) */}
      <div className="absolute bottom-[14%] right-[4%] xl:right-[6%] animate-card-4">
        <div className="backdrop-blur-xl bg-zinc-950/40 border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.5)] rounded-2xl p-4 w-[240px] transition-all hover:border-[#B6FF2E]/30 group">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Daily Nutrition</span>
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 group-hover:scale-110 transition-transform">
              <Apple className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2.5 flex items-center justify-between gap-4">
            <div className="space-y-1.5 text-left">
              <div className="flex items-center gap-1.5 text-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-[#06b6d4]" />
                <span className="text-zinc-400 font-medium">Carbs:</span>
                <span className="text-white font-bold">210g</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-[#B6FF2E]" />
                <span className="text-zinc-400 font-medium">Protein:</span>
                <span className="text-white font-bold">148g</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-[#a855f7]" />
                <span className="text-zinc-400 font-medium">Fats:</span>
                <span className="text-white font-bold">58g</span>
              </div>
            </div>

            {/* Concentric Macro Progress Rings */}
            <div className="w-14 h-14 relative shrink-0">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                {/* Carbs Ring (Outer) */}
                <circle cx="18" cy="18" r="14" fill="none" stroke="rgba(6, 182, 212, 0.06)" strokeWidth="2.2" />
                <circle cx="18" cy="18" r="14" fill="none" stroke="#06b6d4" strokeWidth="2.2" strokeDasharray="88" strokeDashoffset={88 - (88 * 0.70)} strokeLinecap="round" />

                {/* Protein Ring (Middle) */}
                <circle cx="18" cy="18" r="10.5" fill="none" stroke="rgba(182, 255, 46, 0.06)" strokeWidth="2.2" />
                <circle cx="18" cy="18" r="10.5" fill="none" stroke="#B6FF2E" strokeWidth="2.2" strokeDasharray="66" strokeDashoffset={66 - (66 * 0.85)} strokeLinecap="round" />

                {/* Fats Ring (Inner) */}
                <circle cx="18" cy="18" r="7" fill="none" stroke="rgba(168, 85, 247, 0.06)" strokeWidth="2.2" />
                <circle cx="18" cy="18" r="7" fill="none" stroke="#a855f7" strokeWidth="2.2" strokeDasharray="44" strokeDashoffset={44 - (44 * 0.60)} strokeLinecap="round" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Card 5: 💧 Hydration (Bottom-Left) */}
      <div className="absolute bottom-[10%] left-[6%] xl:left-[9%] animate-card-5">
        <div className="backdrop-blur-xl bg-zinc-950/40 border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.5)] rounded-2xl p-4 w-[220px] transition-all hover:border-[#B6FF2E]/30 group">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Hydration</span>
            <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 group-hover:scale-110 transition-transform">
              <Droplet className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2.5 flex items-center justify-between">
            <div>
              <h4 className="text-sm font-bold text-white leading-tight">Water Intake</h4>
              <div className="mt-1">
                <span className="text-xl font-black text-white tracking-tight">2.6</span>
                <span className="text-xs text-zinc-400 ml-1 font-semibold">/ 3.5 L</span>
              </div>
            </div>

            {/* Animated Liquid Capsule Indicator */}
            <div className="w-6 h-12 border border-cyan-500/25 rounded-full relative overflow-hidden bg-zinc-950/50 shadow-[0_0_8px_rgba(6,182,212,0.1)]">
              <div 
                className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-cyan-600/80 to-cyan-450/80 transition-all duration-500 overflow-hidden"
                style={{ height: "74%" }}
              >
                {/* Horizontal Wave SVG Loop */}
                <svg 
                  className="absolute -top-1.5 left-0 w-[200%] h-2 text-cyan-400/85 animate-wave pointer-events-none fill-current"
                  viewBox="0 0 120 20"
                  preserveAspectRatio="none"
                >
                  <path d="M0,10 C30,15 30,5 60,10 C90,15 90,5 120,10 L120,20 L0,20 Z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroVisual;
