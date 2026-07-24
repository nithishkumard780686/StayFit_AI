import React, { useRef, useEffect } from "react";

const MannequinVisualizer = ({ focus = "Chest", name = "" }) => {
  const canvasRef = useRef(null);

  // Normalize focus category to matching biomechanical templates
  const getPattern = () => {
    const nameLower = name.toLowerCase();
    if (nameLower.includes("bench press") || nameLower.includes("chest press") || nameLower.includes("fly") || focus === "Chest") {
      return "press";
    }
    if (nameLower.includes("squat") || nameLower.includes("leg press") || nameLower.includes("lunge") || focus === "Legs") {
      return "squat";
    }
    if (nameLower.includes("curl") || nameLower.includes("bicep") || nameLower.includes("tricep") || nameLower.includes("arm") || focus === "Arms") {
      return "curl";
    }
    if (nameLower.includes("pull-up") || nameLower.includes("pullup") || nameLower.includes("chin-up") || nameLower.includes("pulldown") || nameLower.includes("lat pull")) {
      return "pullup";
    }
    if (nameLower.includes("row") || nameLower.includes("rows") || focus === "Back") {
      return "row";
    }
    if (nameLower.includes("press") || nameLower.includes("raise") || nameLower.includes("shoulder") || focus === "Shoulders") {
      return "shoulderPress";
    }
    return "plank";
  };

  const pattern = getPattern();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animationFrameId;

    const render = () => {
      // Set resolution
      const width = canvas.width = canvas.offsetWidth;
      const height = canvas.height = canvas.offsetHeight;
      const cx = width / 2;
      const cy = height / 2;

      // Clear with dark technical grid background
      ctx.fillStyle = "#0c0d0e";
      ctx.fillRect(0, 0, width, height);

      // Draw grid lines
      ctx.strokeStyle = "rgba(163, 230, 53, 0.03)";
      ctx.lineWidth = 1;
      const gridSize = 20;
      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Time parameter (t goes 0 -> 1 -> 0 smoothly)
      const speed = 0.002;
      const rawTime = Date.now() * speed;
      // Sinusoidal oscillation for smooth eccentric/concentric phase representation
      const t = (Math.sin(rawTime) + 1) / 2;
      const phase = Math.sin(rawTime) > 0 ? "CONCENTRIC" : "ECCENTRIC";

      // Draw Biomechanical HUD overlay
      ctx.fillStyle = "rgba(163, 230, 53, 0.15)";
      ctx.font = "bold 9px monospace";
      ctx.fillText("BIOMECHANICAL MOTION ANALYSIS", 12, 20);
      ctx.fillText(`PHASE: ${phase}`, 12, 35);
      ctx.fillText(`MOTION PROGRESS: ${Math.round(t * 100)}%`, 12, 50);

      // Color Palette configuration
      const activeColor = "#a3e635"; // Lime green
      const boneColor = "rgba(226, 226, 226, 0.6)"; // White/Gray
      const muscleGlow = `rgba(239, 68, 68, ${0.2 + t * 0.4})`; // Pulsing Red-Orange muscle target glow

      ctx.lineWidth = 3;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      // ----------------------------------------------------
      // DRAW PATTERN LAYOUTS
      // ----------------------------------------------------
      if (pattern === "press") {
        // Flat Bench Press side view
        const benchY = cy + 25;
        
        // Draw bench
        ctx.strokeStyle = "#27272a";
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.moveTo(cx - 70, benchY);
        ctx.lineTo(cx + 70, benchY);
        ctx.moveTo(cx - 40, benchY);
        ctx.lineTo(cx - 40, benchY + 45);
        ctx.moveTo(cx + 40, benchY);
        ctx.lineTo(cx + 40, benchY + 45);
        ctx.stroke();

        // Skeleton coordinates
        const hipX = cx - 35;
        const hipY = cy + 18;
        const shoulderX = cx + 25;
        const shoulderY = cy + 18;
        
        const barY = (cy - 40) + t * 50; // Barbell vertical motion
        const wristX = cx + 25;
        const wristY = barY;
        
        // Calculate elbow joints positioning
        const elbowX = cx + 5;
        const elbowY = (cy + 18 + barY) / 2 + 10; 

        // Muscle load highlights (Chest & Triceps)
        ctx.fillStyle = muscleGlow;
        ctx.beginPath();
        ctx.arc(shoulderX, shoulderY, 20, 0, Math.PI * 2);
        ctx.fill();

        // Draw bones
        ctx.strokeStyle = boneColor;
        ctx.lineWidth = 3;
        
        // Leg
        ctx.beginPath();
        ctx.moveTo(hipX, hipY);
        ctx.lineTo(cx - 45, cy + 45);
        ctx.lineTo(cx - 45, cy + 70);
        ctx.stroke();

        // Torso
        ctx.beginPath();
        ctx.moveTo(hipX, hipY);
        ctx.lineTo(shoulderX, shoulderY);
        ctx.stroke();

        // Arm
        ctx.strokeStyle = activeColor;
        ctx.beginPath();
        ctx.moveTo(shoulderX, shoulderY);
        ctx.lineTo(elbowX, elbowY);
        ctx.lineTo(wristX, wristY);
        ctx.stroke();

        // Head
        ctx.fillStyle = boneColor;
        ctx.beginPath();
        ctx.arc(shoulderX + 15, shoulderY, 8, 0, Math.PI * 2);
        ctx.fill();

        // Draw Barbell
        ctx.strokeStyle = "#e4e4e7";
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(wristX - 30, barY);
        ctx.lineTo(wristX + 30, barY);
        ctx.stroke();
        
        // Weights
        ctx.fillStyle = "#71717a";
        ctx.fillRect(wristX - 35, barY - 12, 6, 24);
        ctx.fillRect(wristX + 29, barY - 12, 6, 24);

      } else if (pattern === "squat") {
        // Squat side view
        const ankleX = cx - 10;
        const ankleY = cy + 65;

        // Bending math based on t
        const kneeX = (cx - 10) + t * 22;
        const kneeY = (cy + 25) + t * 15;
        const hipX = (cx - 15) - t * 30;
        const hipY = (cy - 15) + t * 50;
        const shoulderX = (cx - 10) - t * 20;
        const shoulderY = (cy - 60) + t * 50;

        // Muscle load highlights (Quads & Glutes)
        ctx.fillStyle = muscleGlow;
        ctx.beginPath();
        ctx.arc(kneeX, kneeY, 15, 0, Math.PI * 2);
        ctx.arc(hipX, hipY, 20, 0, Math.PI * 2);
        ctx.fill();

        // Draw ground
        ctx.strokeStyle = "#27272a";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(cx - 70, ankleY + 5);
        ctx.lineTo(cx + 70, ankleY + 5);
        ctx.stroke();

        // Draw bones
        ctx.strokeStyle = boneColor;
        ctx.lineWidth = 3;

        // Shin & Thigh
        ctx.beginPath();
        ctx.moveTo(ankleX, ankleY);
        ctx.lineTo(kneeX, kneeY);
        ctx.lineTo(hipX, hipY);
        ctx.stroke();

        // Spine
        ctx.beginPath();
        ctx.moveTo(hipX, hipY);
        ctx.lineTo(shoulderX, shoulderY);
        ctx.stroke();

        // Head
        ctx.fillStyle = boneColor;
        ctx.beginPath();
        ctx.arc(shoulderX + 5, shoulderY - 15, 8, 0, Math.PI * 2);
        ctx.fill();

        // Barbell on shoulders
        const barY = shoulderY;
        ctx.strokeStyle = "#e4e4e7";
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(shoulderX - 30, barY);
        ctx.lineTo(shoulderX + 30, barY);
        ctx.stroke();

        ctx.fillStyle = "#71717a";
        ctx.fillRect(shoulderX - 35, barY - 12, 6, 24);
        ctx.fillRect(shoulderX + 29, barY - 12, 6, 24);

      } else if (pattern === "curl") {
        // Bicep Curl side view
        const shoulderX = cx - 15;
        const shoulderY = cy - 45;
        const elbowX = cx - 15;
        const elbowY = cy - 5;

        // Forearm angle curl math
        const angle = Math.PI / 2 - t * (Math.PI * 0.7);
        const forearmLength = 35;
        const wristX = elbowX + Math.cos(angle) * forearmLength;
        const wristY = elbowY + Math.sin(angle) * forearmLength;

        // Active muscle load glow (Biceps)
        ctx.fillStyle = muscleGlow;
        ctx.beginPath();
        ctx.arc((shoulderX + elbowX) / 2, (shoulderY + elbowY) / 2, 12, 0, Math.PI * 2);
        ctx.fill();

        // Bones
        ctx.strokeStyle = boneColor;
        ctx.lineWidth = 3;

        // Spine & Head
        ctx.beginPath();
        ctx.moveTo(shoulderX, shoulderY);
        ctx.lineTo(cx - 15, cy + 45);
        ctx.stroke();

        ctx.fillStyle = boneColor;
        ctx.beginPath();
        ctx.arc(shoulderX, shoulderY - 15, 8, 0, Math.PI * 2);
        ctx.fill();

        // Arm bones
        ctx.strokeStyle = activeColor;
        ctx.beginPath();
        ctx.moveTo(shoulderX, shoulderY);
        ctx.lineTo(elbowX, elbowY);
        ctx.lineTo(wristX, wristY);
        ctx.stroke();

        // Dumbbell
        ctx.strokeStyle = "#71717a";
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.moveTo(wristX - 10, wristY);
        ctx.lineTo(wristX + 10, wristY);
        ctx.stroke();
        ctx.fillStyle = "#e4e4e7";
        ctx.beginPath();
        ctx.arc(wristX - 10, wristY, 6, 0, Math.PI * 2);
        ctx.arc(wristX + 10, wristY, 6, 0, Math.PI * 2);
        ctx.fill();

      } else if (pattern === "pullup") {
        // Pull-up front view
        const barY = cy - 50;
        const leftHandX = cx - 35;
        const rightHandX = cx + 35;

        // Pulling vertical offset math
        const yOffset = -t * 30;
        
        // Hanger bars
        ctx.strokeStyle = "#27272a";
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.moveTo(leftHandX - 15, barY);
        ctx.lineTo(rightHandX + 15, barY);
        ctx.stroke();

        // Skeleton coordinates
        const neckX = cx;
        const neckY = cy - 10 + yOffset;
        const shoulderLeftX = cx - 20;
        const shoulderRightX = cx + 20;
        const shoulderY = cy - 5 + yOffset;
        
        // Hips
        const hipLeftX = cx - 12;
        const hipRightX = cx + 12;
        const hipY = cy + 40 + yOffset;

        // Elbow joints tucking out
        const elbowLeftX = cx - 30;
        const elbowRightX = cx + 30;
        const elbowY = (shoulderY + barY) / 2 + 12;

        // Muscle load highlights (Lats / Back)
        ctx.fillStyle = muscleGlow;
        ctx.beginPath();
        ctx.arc(cx, cy + yOffset, 20, 0, Math.PI * 2);
        ctx.fill();

        // Draw body bones
        ctx.strokeStyle = boneColor;
        ctx.lineWidth = 3;
        
        // Spine & Hips & Legs
        ctx.beginPath();
        ctx.moveTo(neckX, neckY);
        ctx.lineTo(cx, hipY);
        ctx.moveTo(hipLeftX, hipY);
        ctx.lineTo(hipRightX, hipY);
        ctx.lineTo(cx + 10, cy + 70 + yOffset);
        ctx.moveTo(hipLeftX, hipY);
        ctx.lineTo(cx - 10, cy + 70 + yOffset);
        ctx.stroke();

        // Shoulder line
        ctx.beginPath();
        ctx.moveTo(shoulderLeftX, shoulderY);
        ctx.lineTo(shoulderRightX, shoulderY);
        ctx.stroke();

        // Head
        ctx.fillStyle = boneColor;
        ctx.beginPath();
        ctx.arc(neckX, neckY - 15, 8, 0, Math.PI * 2);
        ctx.fill();

        // Active arms
        ctx.strokeStyle = activeColor;
        ctx.beginPath();
        ctx.moveTo(shoulderLeftX, shoulderY);
        ctx.lineTo(elbowLeftX, elbowY);
        ctx.lineTo(leftHandX, barY);
        ctx.moveTo(shoulderRightX, shoulderY);
        ctx.lineTo(elbowRightX, elbowY);
        ctx.lineTo(rightHandX, barY);
        ctx.stroke();

      } else if (pattern === "row") {
        // Bent Over Row side view
        const ankleX = cx - 25;
        const ankleY = cy + 65;
        const kneeX = cx - 15;
        const kneeY = cy + 25;
        const hipX = cx - 35;
        const hipY = cy - 10;
        const shoulderX = cx + 10;
        const shoulderY = cy - 25;

        // Bar pulling math
        const barPullX = cx - 5;
        const barPullY = (cy + 15) - t * 40;
        
        const elbowX = (shoulderX + barPullX) / 2 - 15 + t * 5;
        const elbowY = (shoulderY + barPullY) / 2 - 15 - t * 10;

        // Active muscles load (Mid Back / Lats)
        ctx.fillStyle = muscleGlow;
        ctx.beginPath();
        ctx.arc((shoulderX + hipX) / 2, (shoulderY + hipY) / 2, 18, 0, Math.PI * 2);
        ctx.fill();

        // Ground
        ctx.strokeStyle = "#27272a";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(cx - 60, ankleY + 5);
        ctx.lineTo(cx + 60, ankleY + 5);
        ctx.stroke();

        // Shin / Thigh bones
        ctx.strokeStyle = boneColor;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(ankleX, ankleY);
        ctx.lineTo(kneeX, kneeY);
        ctx.lineTo(hipX, hipY);
        ctx.lineTo(shoulderX, shoulderY);
        ctx.stroke();

        // Head
        ctx.fillStyle = boneColor;
        ctx.beginPath();
        ctx.arc(shoulderX + 12, shoulderY - 8, 8, 0, Math.PI * 2);
        ctx.fill();

        // Pulling arms
        ctx.strokeStyle = activeColor;
        ctx.beginPath();
        ctx.moveTo(shoulderX, shoulderY);
        ctx.lineTo(elbowX, elbowY);
        ctx.lineTo(barPullX, barPullY);
        ctx.stroke();

        // Barbell
        ctx.strokeStyle = "#e4e4e7";
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(barPullX - 25, barPullY);
        ctx.lineTo(barPullX + 25, barPullY);
        ctx.stroke();

        ctx.fillStyle = "#71717a";
        ctx.fillRect(barPullX - 30, barPullY - 10, 5, 20);
        ctx.fillRect(barPullX + 25, barPullY - 10, 5, 20);

      } else if (pattern === "shoulderPress") {
        // Shoulder Press front view
        const shoulderLeftX = cx - 20;
        const shoulderRightX = cx + 20;
        const shoulderY = cy - 10;
        
        // Dumbbell height press math
        const pressY = (cy - 12) - t * 45;
        const leftHandX = cx - 28;
        const rightHandX = cx + 28;

        const leftElbowX = cx - 35 + t * 10;
        const leftElbowY = (shoulderY + pressY) / 2 + 10 - t * 5;
        
        const rightElbowX = cx + 35 - t * 10;
        const rightElbowY = (shoulderY + pressY) / 2 + 10 - t * 5;

        // Shoulder load glow
        ctx.fillStyle = muscleGlow;
        ctx.beginPath();
        ctx.arc(shoulderLeftX, shoulderY, 12, 0, Math.PI * 2);
        ctx.arc(shoulderRightX, shoulderY, 12, 0, Math.PI * 2);
        ctx.fill();

        // Body skeleton
        ctx.strokeStyle = boneColor;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(cx, shoulderY);
        ctx.lineTo(cx, cy + 45); // Spine
        ctx.moveTo(shoulderLeftX, shoulderY);
        ctx.lineTo(shoulderRightX, shoulderY);
        ctx.stroke();

        // Head
        ctx.fillStyle = boneColor;
        ctx.beginPath();
        ctx.arc(cx, shoulderY - 15, 8, 0, Math.PI * 2);
        ctx.fill();

        // Arms Press
        ctx.strokeStyle = activeColor;
        ctx.beginPath();
        ctx.moveTo(shoulderLeftX, shoulderY);
        ctx.lineTo(leftElbowX, leftElbowY);
        ctx.lineTo(leftHandX, pressY);

        ctx.moveTo(shoulderRightX, shoulderY);
        ctx.lineTo(rightElbowX, rightElbowY);
        ctx.lineTo(rightHandX, pressY);
        ctx.stroke();

        // Dumbbells
        ctx.strokeStyle = "#e4e4e7";
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(leftHandX - 8, pressY);
        ctx.lineTo(leftHandX + 8, pressY);
        ctx.moveTo(rightHandX - 8, pressY);
        ctx.lineTo(rightHandX + 8, pressY);
        ctx.stroke();

        ctx.fillStyle = "#71717a";
        ctx.beginPath();
        ctx.arc(leftHandX - 8, pressY, 4, 0, Math.PI * 2);
        ctx.arc(leftHandX + 8, pressY, 4, 0, Math.PI * 2);
        ctx.arc(rightHandX - 8, pressY, 4, 0, Math.PI * 2);
        ctx.arc(rightHandX + 8, pressY, 4, 0, Math.PI * 2);
        ctx.fill();

      } else {
        // Plank/Abs side view
        const toesX = cx - 55;
        const toesY = cy + 30;
        const elbowX = cx + 35;
        const elbowY = cy + 30;
        const shoulderX = cx + 35;
        const shoulderY = cy + 10;
        const hipX = cx - 10;
        const hipY = cy + 18 + t * 4; // slight hip stabilizing pulse

        // Core contraction glow (Abs)
        ctx.fillStyle = muscleGlow;
        ctx.beginPath();
        ctx.arc(hipX + 15, hipY, 15, 0, Math.PI * 2);
        ctx.fill();

        // Ground
        ctx.strokeStyle = "#27272a";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(cx - 70, toesY + 5);
        ctx.lineTo(cx + 70, toesY + 5);
        ctx.stroke();

        // Skeleton bones
        ctx.strokeStyle = boneColor;
        ctx.lineWidth = 3;
        
        // Leg & Spine Plank Line
        ctx.beginPath();
        ctx.moveTo(toesX, toesY);
        ctx.lineTo(hipX, hipY);
        ctx.lineTo(shoulderX, shoulderY);
        ctx.stroke();

        // Support Arm
        ctx.strokeStyle = activeColor;
        ctx.beginPath();
        ctx.moveTo(shoulderX, shoulderY);
        ctx.lineTo(elbowX, elbowY);
        ctx.stroke();

        // Head
        ctx.fillStyle = boneColor;
        ctx.beginPath();
        ctx.arc(shoulderX + 12, shoulderY - 8, 8, 0, Math.PI * 2);
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [pattern]);

  return (
    <div className="w-full h-full relative">
      <canvas ref={canvasRef} className="w-full h-full block rounded-lg overflow-hidden" />
      {/* Biohud HUD border visual accents */}
      <div className="absolute top-2 right-2 flex gap-1.5 items-center">
        <span className="w-1.5 h-1.5 rounded-full bg-[#a3e635] animate-ping" />
        <span className="text-[8px] font-mono text-zinc-500 tracking-wider">LIVE FEED</span>
      </div>
    </div>
  );
};

export default MannequinVisualizer;
