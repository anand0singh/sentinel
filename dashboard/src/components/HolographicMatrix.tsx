"use client";

import React, { useEffect, useRef, useState } from "react";

export const HolographicMatrix: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [coords, setCoords] = useState({ x: 36.1749, y: -86.7676, z: 46.6827 });
  const [progress, setProgress] = useState(87);

  useEffect(() => {
    // Dynamic coordinate jitter to simulate live telemetry
    const interval = setInterval(() => {
      setCoords({
        x: Number((36.1749 + (Math.random() - 0.5) * 0.05).toFixed(4)),
        y: Number((-86.7676 + (Math.random() - 0.5) * 0.05).toFixed(4)),
        z: Number((46.6827 + (Math.random() - 0.5) * 0.08).toFixed(4)),
      });
      setProgress((prev) => (prev >= 99 ? 84 : prev + 1));
    }, 1200);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let angle = 0;

    // Generate wireframe cyber-sphere/head vertices
    const numPoints = 140;
    const points: { x: number; y: number; z: number }[] = [];
    for (let i = 0; i < numPoints; i++) {
      const theta = Math.acos(1 - (2 * (i + 0.5)) / numPoints);
      const phi = Math.PI * (1 + Math.sqrt(5)) * i;
      const r = 90;
      points.push({
        x: r * Math.sin(theta) * Math.cos(phi),
        y: r * Math.sin(theta) * Math.sin(phi),
        z: r * Math.cos(theta),
      });
    }

    const render = () => {
      canvas.width = canvas.parentElement?.clientWidth || 420;
      canvas.height = canvas.parentElement?.clientHeight || 420;
      const width = canvas.width;
      const height = canvas.height;
      const cx = width / 2;
      const cy = height / 2;

      ctx.clearRect(0, 0, width, height);

      // Rotating 3D matrix
      angle += 0.012;
      const cosA = Math.cos(angle);
      const sinA = Math.sin(angle);

      // Draw wireframe connection lines
      ctx.lineWidth = 0.8;
      const projected = points.map((p) => {
        // Rotate around Y and X axis
        const x1 = p.x * cosA - p.z * sinA;
        const z1 = p.x * sinA + p.z * cosA;
        const y1 = p.y * Math.cos(0.2) - z1 * Math.sin(0.2);
        const z2 = p.y * Math.sin(0.2) + z1 * Math.cos(0.2);

        const fov = 260;
        const scale = fov / (fov + z2);
        return {
          x: cx + x1 * scale,
          y: cy + y1 * scale,
          scale,
          z: z2,
        };
      });

      // Connect nearby points with glowing lines
      for (let i = 0; i < projected.length; i++) {
        for (let j = i + 1; j < projected.length; j++) {
          const dx = projected[i].x - projected[j].x;
          const dy = projected[i].y - projected[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 38) {
            const alpha = (1 - dist / 38) * 0.35;
            ctx.strokeStyle = `rgba(212, 255, 0, ${alpha})`;
            ctx.beginPath();
            ctx.moveTo(projected[i].x, projected[i].y);
            ctx.lineTo(projected[j].x, projected[j].y);
            ctx.stroke();
          }
        }
      }

      // Draw point nodes
      projected.forEach((p) => {
        const radius = Math.max(1, p.scale * 1.8);
        ctx.fillStyle = p.z > 0 ? "#d4ff00" : "#556b00";
        ctx.beginPath();
        ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
        ctx.fill();
      });

      // Target reticle / radar circle overlay
      ctx.strokeStyle = "rgba(212, 255, 0, 0.15)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(cx, cy, 110, 0, Math.PI * 2);
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(cx, cy, 140, 0, Math.PI * 2);
      ctx.stroke();

      // Scanline sweep
      const scanY = (Date.now() / 12) % height;
      ctx.strokeStyle = "rgba(212, 255, 0, 0.3)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(0, scanY);
      ctx.lineTo(width, scanY);
      ctx.stroke();

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="relative w-full h-[400px] md:h-[460px] bg-[#050505] border border-cyber-border overflow-hidden flex items-center justify-center bracket-corner">
      {/* Canvas */}
      <canvas ref={canvasRef} className="w-full h-full block" />

      {/* CRT Scanline Overlay */}
      <div className="absolute inset-0 scanline opacity-40 pointer-events-none" />

      {/* Top Left Status Tag */}
      <div className="absolute top-4 left-4 z-10 flex items-center space-x-2 font-mono text-[11px] tracking-widest text-acid-lime">
        <span className="inline-block w-2 h-2 bg-acid-lime animate-ping" />
        <span>&gt; RENDERING... {progress}%</span>
      </div>

      {/* Top Right Globe / Crosshair */}
      <div className="absolute top-4 right-4 z-10 font-mono text-xs text-muted-gray flex items-center space-x-2">
        <span>[+]</span>
        <span className="text-[10px] uppercase text-acid-lime font-bold">GRID_LOCKED</span>
      </div>

      {/* Bottom Right Live Telemetry Coordinates Card */}
      <div className="absolute bottom-4 right-4 z-10 bg-[#050505]/90 border border-acid-lime/40 p-3 font-mono text-[11px] shadow-acid-sm">
        <div className="text-acid-lime font-bold mb-1 flex items-center justify-between">
          <span>COORDINATES</span>
          <span className="text-[9px] bg-acid-lime text-black px-1 font-black">GPS_RT</span>
        </div>
        <div className="text-gray-300 space-y-0.5">
          <div className="flex justify-between gap-3">
            <span className="text-muted-gray">X_POS</span>
            <span className="text-acid-lime font-semibold">{coords.x}</span>
          </div>
          <div className="flex justify-between gap-3">
            <span className="text-muted-gray">Y_POS</span>
            <span className="text-acid-lime font-semibold">{coords.y}</span>
          </div>
          <div className="flex justify-between gap-3">
            <span className="text-muted-gray">Z_POS</span>
            <span className="text-acid-lime font-semibold">{coords.z}</span>
          </div>
        </div>
      </div>

      {/* Bottom Left Barcode & Scene ID */}
      <div className="absolute bottom-4 left-4 z-10 font-mono text-[11px]">
        {/* Mock barcode lines */}
        <div className="flex space-x-[2px] h-5 mb-1.5 opacity-60">
          <span className="w-[3px] bg-acid-lime"></span>
          <span className="w-[1px] bg-acid-lime"></span>
          <span className="w-[2px] bg-acid-lime"></span>
          <span className="w-[4px] bg-acid-lime"></span>
          <span className="w-[1px] bg-acid-lime"></span>
          <span className="w-[3px] bg-acid-lime"></span>
          <span className="w-[1px] bg-acid-lime"></span>
          <span className="w-[2px] bg-acid-lime"></span>
          <span className="w-[4px] bg-acid-lime"></span>
          <span className="w-[2px] bg-acid-lime"></span>
        </div>
        <span className="text-muted-gray text-xs tracking-wider">//SCN_01_PROBE</span>
      </div>
    </div>
  );
};
