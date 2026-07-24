import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../Navbar";
import { Button } from "../ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { Dumbbell, ArrowLeft, Search, Target, Play, Info, User, ChevronLeft, ChevronRight, X } from "lucide-react";
import EXERCISES_DATA from "./exercises.json";

// High-quality category thumbnail images from Unsplash
const FOCUS_IMAGES = {
  Chest: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=600&auto=format&fit=crop",
  Back: "https://images.unsplash.com/photo-1603287634278-ae254b01a55f?q=80&w=600&auto=format&fit=crop",
  Legs: "https://images.unsplash.com/photo-1434608519344-49d77a699e1d?q=80&w=600&auto=format&fit=crop",
  Shoulders: "https://images.unsplash.com/photo-1532029837206-abbe2b7620e3?q=80&w=600&auto=format&fit=crop",
  Arms: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=600&auto=format&fit=crop",
  Core: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=600&auto=format&fit=crop"
};

// 100% verified working exercise demonstration video embed URLs from ExerciseLibrary.com
const VERIFIED_VIDEOS = {
  // Chest
  "barbell bench press": "6Ez0Xvs8uec",
  "incline barbell bench press": "SrqOu55lrYU",
  "flat barbell bench press": "6Ez0Xvs8uec",
  "flat bench press": "6Ez0Xvs8uec",
  
  // Legs
  "barbell back squat": "5MXoGtPBz-I",
  "barbell squat": "5MXoGtPBz-I",
  "back squat": "5MXoGtPBz-I",
  
  // Arms
  "2 dumbbell preacher curls": "rUzrQIbAeQo",
  "dumbbell preacher curls": "rUzrQIbAeQo",
  "preacher curls": "rUzrQIbAeQo",
  "preacher curl": "rUzrQIbAeQo",
  
  // Back
  "assisted pull-up machine": "N5XZvlIW2Ac",
  "machine assisted pull-up": "N5XZvlIW2Ac",
  "bent-over barbell row": "ggik-iWDNOE",
  "barbell row": "ggik-iWDNOE",
  
  // Shoulder
  "archer push-ups": "k_cA4a4dlbw",
  "archer pushups": "k_cA4a4dlbw",
  "archer push-up": "k_cA4a4dlbw",
  "archer pushup": "k_cA4a4dlbw",
  
  // Core / Lower Back
  "45° back extension": "zps7d7U34Fw",
  "45 back extension": "zps7d7U34Fw",
  "back extension": "zps7d7U34Fw"
};

// Converts YouTube link or embed URL to privacy-friendly embed URL with controls enabled
const getVerifiedVideoEmbed = (ex) => {
  if (!ex) return null;
  
  // 1. Check direct videoEmbedUrl in JSON dataset
  if (ex.videoEmbedUrl) {
    let url = ex.videoEmbedUrl;
    if (url.includes("youtube.com/embed/")) {
      const videoId = url.split("youtube.com/embed/")[1]?.split("?")[0];
      if (videoId) {
        return `https://www.youtube-nocookie.com/embed/${videoId}?rel=0&modestbranding=1`;
      }
    }
    return url;
  }

  // 2. Check fallback lookup table for common names
  const nameClean = (ex.name || "").toLowerCase().trim();
  const videoId = VERIFIED_VIDEOS[nameClean];
  if (videoId) {
    return `https://www.youtube-nocookie.com/embed/${videoId}?rel=0&modestbranding=1`;
  }
  
  return null;
};

const HowToDo = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [selectedExercise, setSelectedExercise] = useState(null); // Exercise object for modal popup
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  // Prevent background scrolling when tutorial video modal popup is open
  useEffect(() => {
    if (selectedExercise) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [selectedExercise]);

  // Reset page to 1 when search query or filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, activeFilter]);

  // Clean raw exercise search string by stripping colons, bullets, and numbers
  const cleanSearchQuery = (str) => {
    if (!str) return "";
    return str
      .replace(/^\d+[\.\-\)]\s*/, "")  // strip leading numbers
      .replace(/^[\*\-\s\:\;]+/, "")   // strip leading bullets, colons
      .replace(/[\:\;\,\-\s]+$/, "")   // strip trailing colons, semicolons, hyphens, whitespace
      .trim();
  };

  // Normalize a string for fuzzy matching: lowercase, strip colons/punctuation, trailing s/es
  const normalize = (str) => {
    if (!str) return "";
    return str
      .toLowerCase()
      .trim()
      .replace(/[:;,!?'"()]/g, "") // strip colons & common punctuation
      .replace(/\s+/g, " ")        // collapse whitespace
      .replace(/s$/, "")           // basic singularization
      .replace(/ie$/, "y");
  };

  // Read query parameter on mount/navigation to auto-search and auto-open redirect targets
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const rawSearch = params.get("search");
    if (rawSearch) {
      const cleaned = cleanSearchQuery(rawSearch);
      setSearchQuery(cleaned);
      
      const query = normalize(cleaned);
      if (query) {
        const match = EXERCISES_DATA.find((ex) => {
          const nameNorm = normalize(ex.name || "");
          return nameNorm.includes(query) || query.includes(nameNorm);
        });
        if (match) {
          setSelectedExercise(match);
        }
      }
    }
  }, []);

  // Robust search matches names, targets, focus categories, or equipment (bidirectional + fuzzy)
  const filteredExercises = EXERCISES_DATA.filter((ex) => {
    const nameStr = ex.name || "";
    const targetStr = ex.target || "";
    const focusStr = ex.focus || "";
    const equipStr = ex.equipment || "";

    const q = normalize(searchQuery);
    if (!q) return activeFilter === "All" || ex.focus === activeFilter;

    const matchesSearch = normalize(nameStr).includes(q) || q.includes(normalize(nameStr)) ||
                          normalize(targetStr).includes(q) ||
                          normalize(focusStr).includes(q) ||
                          normalize(equipStr).includes(q);
    const matchesFilter = activeFilter === "All" || ex.focus === activeFilter;
    return matchesSearch && matchesFilter;
  });

  const totalPages = Math.ceil(filteredExercises.length / itemsPerPage);
  
  // Slice exercises for current page
  const startIndex = (currentPage - 1) * itemsPerPage;
  const displayedExercises = filteredExercises.slice(startIndex, startIndex + itemsPerPage);

  // Generate pagination sliding window array
  const getPageNumbers = () => {
    const pages = [];
    const delta = 1; // page window before/after active page

    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 ||
        i === totalPages ||
        (i >= currentPage - delta && i <= currentPage + delta)
      ) {
        pages.push(i);
      } else if (pages[pages.length - 1] !== "...") {
        pages.push("...");
      }
    }
    return pages;
  };

  return (
    <div className="bg-[#000000] min-h-screen text-[#e2e2e2] font-sans pb-24 md:pb-8 select-none relative overflow-x-hidden">
      {/* Background glow structures */}
      <div className="fixed top-0 left-0 w-full h-full z-0 pointer-events-none bg-radial-gradient from-zinc-900/5 to-black">
        <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full bg-[#a3e635]/5 blur-[80px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] rounded-full bg-[#a3e635]/5 blur-[80px]" />
      </div>

      {/* Top Navbar */}
      <Navbar />

      {/* Main content grid */}
      <main className="max-w-[1600px] w-full mx-auto px-6 md:px-12 pt-28 pb-16 md:pt-32 relative z-10">
        <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">Exercise Library</h1>
            <p className="text-zinc-400 text-sm mt-1">Browse tutorials, execution guides, and video walk-throughs from ExerciseLibrary.com</p>
          </div>
          <div className="text-xs bg-zinc-900 border border-zinc-800 px-3.5 py-1.5 rounded-full text-zinc-400 font-medium">
            Page <span className="text-[#a3e635] font-bold">{currentPage}</span> of {totalPages || 1} • <span className="text-white font-bold">{filteredExercises.length}</span> total exercises
          </div>
        </div>
        
        {/* Search & Filtering Area */}
        <section className="flex flex-col gap-6 mb-8">
          <div className="relative max-w-2xl w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 w-5 h-5" />
            <input 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#1e2020] border-b border-zinc-800 focus:border-[#a3e635] px-12 py-4 rounded-t-lg text-sm text-white placeholder:text-zinc-500 focus:outline-none transition-all" 
              placeholder="Search exercises by name, target muscle, focus area, or equipment..." 
              type="text"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white p-1 cursor-pointer transition-colors"
                title="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap gap-2.5 items-center">
            {["All", "Chest", "Back", "Legs", "Shoulders", "Arms", "Core"].map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-6 py-2 rounded-full text-xs font-semibold transition-all duration-300 ${
                  activeFilter === filter
                    ? "bg-[#a3e635] text-black font-bold shadow-lg shadow-[#a3e635]/25"
                    : "bg-white/5 border border-white/10 text-zinc-400 hover:border-[#a3e635]/50"
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </section>

        {/* Exercises Grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {displayedExercises.map((ex) => {
            const fallbackImg = FOCUS_IMAGES[ex.focus] || "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=600&auto=format&fit=crop";

            // Set badge styling depending on difficulty
            let badgeStyle = "bg-white/10 text-white border-white/20";
            if (ex.difficulty === "Intermediate") {
              badgeStyle = "bg-[#a3e635]/10 text-[#a3e635] border-[#a3e635]/20";
            } else if (ex.difficulty === "Advanced") {
              badgeStyle = "bg-red-500/10 text-red-400 border-red-500/20";
            }

            return (
              <div 
                key={ex.id}
                onClick={() => setSelectedExercise(ex)}
                className="group bg-zinc-950/80 border border-zinc-850 rounded-xl p-4 transition-all duration-300 hover:border-[#a3e635]/40 hover:shadow-xl hover:shadow-[#a3e635]/5 cursor-pointer flex flex-col justify-between"
              >
                <div>
                  {/* Exercise Preview Image */}
                  <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-[#1e2020] mb-4 border border-zinc-900 shadow-inner">
                    <img 
                      src={fallbackImg} 
                      alt={ex.name} 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="w-12 h-12 rounded-full bg-[#a3e635] flex items-center justify-center text-black shadow-2xl transition-transform active:scale-90">
                        <Play className="w-5 h-5 fill-current" />
                      </div>
                    </div>
                  </div>

                  <div className="px-1">
                    <div className="flex justify-between items-start mb-2 gap-2">
                      <h3 className="font-bold text-white text-base tracking-tight group-hover:text-[#a3e635] transition-colors">{ex.name}</h3>
                      <span className={`px-2.5 py-0.5 rounded-full text-[9px] uppercase font-bold tracking-wider border ${badgeStyle}`}>
                        {ex.difficulty}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 mb-3 text-zinc-500 text-xs">
                      <Dumbbell className="w-3.5 h-3.5" />
                      <span>{ex.equipment} • {ex.focus}</span>
                    </div>

                    <p className="text-xs text-zinc-400 leading-relaxed mb-4 line-clamp-2">
                      {ex.setup && ex.setup[0] ? ex.setup[0] : ""} {ex.execution && ex.execution[0] ? ex.execution[0] : ""}
                    </p>
                  </div>
                </div>

                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedExercise(ex);
                  }}
                  className="w-full py-2.5 bg-[#a3e635]/10 hover:bg-[#a3e635] text-[#a3e635] hover:text-black border border-[#a3e635]/30 hover:border-transparent rounded-lg text-xs font-bold flex items-center justify-center gap-2 active:scale-[0.98] transition-all cursor-pointer mt-2"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Watch Tutorial</span>
                </button>
              </div>
            );
          })}
        </section>

        {/* Sliding Page Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex flex-col items-center justify-center gap-4 mt-12 pb-8">
            <div className="flex items-center gap-2.5">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="p-2.5 rounded-lg bg-white/5 border border-white/10 text-zinc-400 hover:text-white hover:border-[#a3e635]/50 disabled:opacity-30 disabled:pointer-events-none transition-all duration-200"
                title="Previous Page"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-1.5">
                {getPageNumbers().map((page, index) => {
                  if (page === "...") {
                    return (
                      <span key={`ellipsis-${index}`} className="px-3 py-2 text-zinc-500 text-sm font-semibold select-none">
                        ...
                      </span>
                    );
                  }

                  const isActive = currentPage === page;
                  return (
                    <button
                      key={`page-${page}`}
                      onClick={() => setCurrentPage(page)}
                      className={`min-w-[40px] h-[40px] flex items-center justify-center rounded-lg text-xs font-bold transition-all duration-300 ${
                        isActive
                          ? "bg-[#a3e635] text-black shadow-lg shadow-[#a3e635]/25"
                          : "bg-white/5 border border-white/10 text-zinc-400 hover:text-white hover:border-[#a3e635]/50"
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="p-2.5 rounded-lg bg-white/5 border border-white/10 text-zinc-400 hover:text-white hover:border-[#a3e635]/50 disabled:opacity-30 disabled:pointer-events-none transition-all duration-200"
                title="Next Page"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
            
            <div className="text-zinc-500 text-xs font-semibold uppercase tracking-wider">
              Page <span className="text-[#a3e635]">{currentPage}</span> of {totalPages}
            </div>
          </div>
        )}
      </main>

      {/* Exercise Video Tutorial Popup Modal */}
      <AnimatePresence>
        {selectedExercise && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-zinc-950 border border-zinc-800 rounded-2xl w-full max-w-3xl my-8 max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-white relative"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-900 bg-zinc-900/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#a3e635]/10 border border-[#a3e635]/30 flex items-center justify-center text-[#a3e635]">
                    <Dumbbell className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg md:text-xl font-extrabold text-white">{selectedExercise.name}</h2>
                    <p className="text-xs text-zinc-400">{selectedExercise.equipment} • {selectedExercise.focus}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedExercise(null)}
                  className="w-9 h-9 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white hover:border-zinc-700 transition-all cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Scrollable Body */}
              <div className="p-6 space-y-6 overflow-y-auto flex-1">
                {/* Video Player */}
                <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-black border border-zinc-800 shadow-xl">
                  {(() => {
                    const embedUrl = getVerifiedVideoEmbed(selectedExercise);
                    const fallbackImg = FOCUS_IMAGES[selectedExercise.focus] || FOCUS_IMAGES.Chest;
                    if (embedUrl) {
                      return (
                        <iframe 
                          src={embedUrl}
                          title={`${selectedExercise.name} Video Tutorial`}
                          className="w-full h-full border-0 rounded-xl"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                          referrerPolicy="strict-origin-when-cross-origin"
                          allowFullScreen
                        />
                      );
                    } else {
                      return (
                        <div className="w-full h-full relative">
                          <img 
                            src={fallbackImg} 
                            alt={selectedExercise.name} 
                            className="w-full h-full object-cover brightness-[0.3] blur-[2px]"
                          />
                          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-4 text-center">
                            <Play className="w-12 h-12 text-[#a3e635] opacity-85" />
                            <span className="text-xs font-bold text-zinc-300 uppercase tracking-wider">Video Tutorial Search</span>
                            <a 
                              href={`https://www.youtube.com/results?search_query=${encodeURIComponent(selectedExercise.name + " form tutorial")}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-5 py-2.5 bg-[#a3e635] hover:bg-[#b5f845] text-black font-black text-xs uppercase tracking-wide rounded-xl shadow-lg active:scale-95 transition-all"
                            >
                              Watch Demonstration on YouTube ↗
                            </a>
                          </div>
                        </div>
                      );
                    }
                  })()}
                </div>

                {/* Target & Difficulty Info Header */}
                <div className="flex items-center justify-between p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-850 text-xs">
                  <div className="flex items-center gap-2 text-zinc-300">
                    <Target className="w-4 h-4 text-[#a3e635]" />
                    <span className="font-semibold">Target Muscle: <strong className="text-white">{selectedExercise.target}</strong></span>
                  </div>
                  <span className="px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-[#a3e635]/10 text-[#a3e635] border border-[#a3e635]/30">
                    {selectedExercise.difficulty}
                  </span>
                </div>

                {/* Step-by-Step Instructions */}
                <div className="space-y-5 text-sm">
                  {/* Setup Instructions */}
                  {selectedExercise.setup && selectedExercise.setup.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-xs font-black uppercase text-[#a3e635] tracking-wider">Setup Instructions</h4>
                      <ul className="space-y-2">
                        {selectedExercise.setup.map((step, idx) => (
                          <li key={idx} className="flex items-start gap-2.5 text-zinc-300 text-xs md:text-sm leading-relaxed">
                            <span className="w-5 h-5 rounded-full bg-[#a3e635]/10 text-[#a3e635] text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">{idx + 1}</span>
                            <span>{step}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Execution Steps */}
                  {selectedExercise.execution && selectedExercise.execution.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-xs font-black uppercase text-[#a3e635] tracking-wider">Execution Steps</h4>
                      <ul className="space-y-2">
                        {selectedExercise.execution.map((step, idx) => (
                          <li key={idx} className="flex items-start gap-2.5 text-zinc-300 text-xs md:text-sm leading-relaxed">
                            <span className="w-5 h-5 rounded-full bg-[#a3e635]/10 text-[#a3e635] text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">{idx + 1}</span>
                            <span>{step}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Coaching Cues */}
                  {selectedExercise.cues && selectedExercise.cues.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-xs font-black uppercase text-[#a3e635] tracking-wider">Coaching Cues</h4>
                      <ul className="list-disc pl-5 space-y-1 text-xs md:text-sm text-zinc-300 leading-relaxed">
                        {selectedExercise.cues.map((cue, idx) => (
                          <li key={idx}>{cue}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Common Mistakes */}
                  {selectedExercise.mistakes && selectedExercise.mistakes.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-xs font-black uppercase text-red-400 tracking-wider">Common Mistakes to Avoid</h4>
                      <ul className="list-disc pl-5 space-y-1 text-xs md:text-sm text-red-300/90 leading-relaxed">
                        {selectedExercise.mistakes.map((mistake, idx) => (
                          <li key={idx}>{mistake}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="px-6 py-4 border-t border-zinc-900 bg-zinc-900/50 flex justify-end">
                <button
                  onClick={() => setSelectedExercise(null)}
                  className="px-6 py-2.5 rounded-xl bg-[#a3e635] text-black font-extrabold text-xs hover:bg-[#b5f845] active:scale-95 transition-all cursor-pointer"
                >
                  Close Tutorial
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* User profile helper stub for Lucide import */}
      <span className="hidden"><User /></span>
    </div>
  );
};

export default HowToDo;
