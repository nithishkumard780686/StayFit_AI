import React from "react";

const DynamicBodySvg = ({ selectedMuscles = [] }) => {
  const isSelected = (muscle) => selectedMuscles.includes(muscle) || selectedMuscles.includes("Full Body");

  // Style colors
  const activeFill = "fill-[#a3e635]/40";
  const activeStroke = "stroke-[#a3e635]";
  const inactiveFill = "fill-zinc-900/40";
  const inactiveStroke = "stroke-zinc-800";

  return (
    <div className="flex gap-6 justify-center items-center py-6 bg-zinc-950/40 rounded-2xl border border-zinc-900/60 p-6 select-none">
      {/* Front View */}
      <div className="flex flex-col items-center">
        <span className="text-[11px] uppercase tracking-widest text-zinc-400 mb-3 font-bold">Front</span>
        <svg width="100" height="200" viewBox="0 0 100 200" className="w-32 h-64 transition-transform duration-300">
          {/* Head & Neck */}
          <circle cx="50" cy="20" r="10" className={`${inactiveFill} ${inactiveStroke} stroke-2`} />
          <rect x="47" y="30" width="6" height="8" className={`${inactiveFill} ${inactiveStroke} stroke-2`} />

          {/* Shoulders */}
          <circle 
            cx="32" 
            cy="44" 
            r="7" 
            className={`transition-all duration-300 ${isSelected("Shoulders") ? `${activeFill} ${activeStroke}` : `${inactiveFill} ${inactiveStroke}`} stroke-2 cursor-pointer`} 
          />
          <circle 
            cx="68" 
            cy="44" 
            r="7" 
            className={`transition-all duration-300 ${isSelected("Shoulders") ? `${activeFill} ${activeStroke}` : `${inactiveFill} ${inactiveStroke}`} stroke-2 cursor-pointer`} 
          />

          {/* Chest */}
          <path 
            d="M 38 41 Q 50 43 62 41 L 62 58 Q 50 60 38 58 Z" 
            className={`transition-all duration-300 ${isSelected("Chest") ? `${activeFill} ${activeStroke}` : `${inactiveFill} ${inactiveStroke}`} stroke-2 cursor-pointer`} 
          />

          {/* Core (Abs) */}
          <path 
            d="M 40 61 L 60 61 L 58 90 L 42 90 Z" 
            className={`transition-all duration-300 ${isSelected("Core") ? `${activeFill} ${activeStroke}` : `${inactiveFill} ${inactiveStroke}`} stroke-2 cursor-pointer`} 
          />

          {/* Arms (Left & Right) */}
          <path 
            d="M 28 50 L 22 90 Q 20 95 24 95 L 26 95 L 32 50 Z" 
            className={`transition-all duration-300 ${isSelected("Arms") ? `${activeFill} ${activeStroke}` : `${inactiveFill} ${inactiveStroke}`} stroke-2 cursor-pointer`} 
          />
          <path 
            d="M 72 50 L 78 90 Q 80 95 76 95 L 74 95 L 68 50 Z" 
            className={`transition-all duration-300 ${isSelected("Arms") ? `${activeFill} ${activeStroke}` : `${inactiveFill} ${inactiveStroke}`} stroke-2 cursor-pointer`} 
          />

          {/* Hips */}
          <path d="M 42 90 Q 50 93 58 90 L 60 102 L 40 102 Z" className={`${inactiveFill} stroke-zinc-800 stroke-2`} />

          {/* Legs (Front Thighs/Shins) */}
          <path 
            d="M 41 103 L 48 103 L 46 150 L 37 150 Z" 
            className={`transition-all duration-300 ${isSelected("Legs") ? `${activeFill} ${activeStroke}` : `${inactiveFill} ${inactiveStroke}`} stroke-2 cursor-pointer`} 
          />
          <path 
            d="M 59 103 L 52 103 L 54 150 L 63 150 Z" 
            className={`transition-all duration-300 ${isSelected("Legs") ? `${activeFill} ${activeStroke}` : `${inactiveFill} ${inactiveStroke}`} stroke-2 cursor-pointer`} 
          />

          {/* Shins/Feet */}
          <path 
            d="M 37 151 L 45 151 L 43 190 Q 40 193 36 191 Z" 
            className={`transition-all duration-300 ${isSelected("Legs") ? `${activeFill} ${activeStroke}` : `${inactiveFill} ${inactiveStroke}`} stroke-2 cursor-pointer`} 
          />
          <path 
            d="M 63 151 L 55 151 L 57 190 Q 60 193 64 191 Z" 
            className={`transition-all duration-300 ${isSelected("Legs") ? `${activeFill} ${activeStroke}` : `${inactiveFill} ${inactiveStroke}`} stroke-2 cursor-pointer`} 
          />
        </svg>
      </div>

      {/* Back View */}
      <div className="flex flex-col items-center">
        <span className="text-[11px] uppercase tracking-widest text-zinc-400 mb-3 font-bold">Back</span>
        <svg width="100" height="200" viewBox="0 0 100 200" className="w-32 h-64 transition-transform duration-300">
          {/* Head & Neck */}
          <circle cx="50" cy="20" r="10" className={`${inactiveFill} ${inactiveStroke} stroke-2`} />
          <rect x="47" y="30" width="6" height="8" className={`${inactiveFill} ${inactiveStroke} stroke-2`} />

          {/* Back (Upper & Lower) */}
          <path 
            d="M 32 41 L 68 41 L 60 85 L 40 85 Z" 
            className={`transition-all duration-300 ${isSelected("Back") ? `${activeFill} ${activeStroke}` : `${inactiveFill} ${inactiveStroke}`} stroke-2 cursor-pointer`} 
          />

          {/* Glutes */}
          <path 
            d="M 40 86 Q 50 93 60 86 L 60 102 Q 50 106 40 102 Z" 
            className={`transition-all duration-300 ${isSelected("Glutes") ? `${activeFill} ${activeStroke}` : `${inactiveFill} ${inactiveStroke}`} stroke-2 cursor-pointer`} 
          />

          {/* Shoulders Back */}
          <circle cx="32" cy="44" r="7" className={`${inactiveFill} ${inactiveStroke} stroke-2`} />
          <circle cx="68" cy="44" r="7" className={`${inactiveFill} ${inactiveStroke} stroke-2`} />

          {/* Arms Back */}
          <path 
            d="M 28 50 L 22 95 L 26 95 L 32 50 Z" 
            className={`transition-all duration-300 ${isSelected("Arms") ? `${activeFill} ${activeStroke}` : `${inactiveFill} ${inactiveStroke}`} stroke-2 cursor-pointer`} 
          />
          <path 
            d="M 72 50 L 78 95 L 74 95 L 68 50 Z" 
            className={`transition-all duration-300 ${isSelected("Arms") ? `${activeFill} ${activeStroke}` : `${inactiveFill} ${inactiveStroke}`} stroke-2 cursor-pointer`} 
          />

          {/* Legs Back (Hamstrings/Calves) */}
          <path 
            d="M 41 103 L 48 103 L 46 150 L 37 150 Z" 
            className={`transition-all duration-300 ${isSelected("Legs") ? `${activeFill} ${activeStroke}` : `${inactiveFill} ${inactiveStroke}`} stroke-2 cursor-pointer`} 
          />
          <path 
            d="M 59 103 L 52 103 L 54 150 L 63 150 Z" 
            className={`transition-all duration-300 ${isSelected("Legs") ? `${activeFill} ${activeStroke}` : `${inactiveFill} ${inactiveStroke}`} stroke-2 cursor-pointer`} 
          />
          <path 
            d="M 37 151 L 45 151 L 43 190 Z" 
            className={`transition-all duration-300 ${isSelected("Legs") ? `${activeFill} ${activeStroke}` : `${inactiveFill} ${inactiveStroke}`} stroke-2 cursor-pointer`} 
          />
          <path 
            d="M 63 151 L 55 151 L 57 190 Z" 
            className={`transition-all duration-300 ${isSelected("Legs") ? `${activeFill} ${activeStroke}` : `${inactiveFill} ${inactiveStroke}`} stroke-2 cursor-pointer`} 
          />
        </svg>
      </div>
    </div>
  );
};

export default DynamicBodySvg;
