"use client";

import { useEffect, useState, useMemo } from "react";

interface FloatingItem {
  id: number;
  type: "open-book" | "scroll" | "quill" | "tome" | "bookmark" | "sparkle";
  x: number; // percentage (0 - 100)
  y: number; // percentage (0 - 100)
  size: number; // pixels
  duration: number; // seconds
  delay: number; // seconds
  opacity: number;
  rotate: number; // degrees
  driftX: number; // pixels
  driftY: number; // pixels
}

export default function LibraryFloatingBackground() {
  const [mounted, setMounted] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    setMounted(true);

    const handleMouseMove = (e: MouseEvent) => {
      const { innerWidth, innerHeight } = window;
      const x = (e.clientX / innerWidth - 0.5) * 20; // -10px to +10px
      const y = (e.clientY / innerHeight - 0.5) * 20;
      setMousePos({ x, y });
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Pre-generate deterministic floating literary elements
  const items: FloatingItem[] = useMemo(() => {
    return [
      // Open Books
      { id: 1, type: "open-book", x: 8, y: 14, size: 54, duration: 18, delay: 0, opacity: 0.18, rotate: -12, driftX: 25, driftY: -35 },
      { id: 2, type: "open-book", x: 88, y: 22, size: 60, duration: 22, delay: 3, opacity: 0.16, rotate: 15, driftX: -20, driftY: -40 },
      { id: 3, type: "open-book", x: 78, y: 76, size: 48, duration: 19, delay: 1.5, opacity: 0.14, rotate: -8, driftX: 30, driftY: -30 },
      { id: 4, type: "open-book", x: 12, y: 82, size: 52, duration: 24, delay: 4, opacity: 0.15, rotate: 10, driftX: -25, driftY: -35 },

      // Rolled Scrolls
      { id: 5, type: "scroll", x: 22, y: 35, size: 42, duration: 16, delay: 2, opacity: 0.15, rotate: 25, driftX: -18, driftY: -28 },
      { id: 6, type: "scroll", x: 82, y: 48, size: 46, duration: 20, delay: 5, opacity: 0.17, rotate: -18, driftX: 22, driftY: -32 },
      { id: 7, type: "scroll", x: 45, y: 88, size: 38, duration: 17, delay: 0.5, opacity: 0.12, rotate: 12, driftX: -15, driftY: -25 },

      // Feather Quills
      { id: 8, type: "quill", x: 15, y: 58, size: 44, duration: 15, delay: 1, opacity: 0.16, rotate: -35, driftX: 20, driftY: -30 },
      { id: 9, type: "quill", x: 92, y: 64, size: 40, duration: 18, delay: 3.5, opacity: 0.15, rotate: 40, driftX: -22, driftY: -26 },
      { id: 10, type: "quill", x: 70, y: 12, size: 42, duration: 21, delay: 2.5, opacity: 0.14, rotate: -20, driftX: 18, driftY: -34 },

      // Classic Bound Tomes
      { id: 11, type: "tome", x: 28, y: 8, size: 48, duration: 23, delay: 4.5, opacity: 0.14, rotate: 18, driftX: -20, driftY: -35 },
      { id: 12, type: "tome", x: 65, y: 42, size: 44, duration: 19, delay: 6, opacity: 0.13, rotate: -15, driftX: 25, driftY: -28 },
      { id: 13, type: "tome", x: 35, y: 72, size: 46, duration: 25, delay: 2, opacity: 0.15, rotate: 8, driftX: -18, driftY: -38 },

      // Bookmarks
      { id: 14, type: "bookmark", x: 5, y: 42, size: 36, duration: 14, delay: 0.8, opacity: 0.18, rotate: -10, driftX: 15, driftY: -22 },
      { id: 15, type: "bookmark", x: 94, y: 38, size: 34, duration: 16, delay: 3.2, opacity: 0.16, rotate: 15, driftX: -16, driftY: -24 },

      // Ambient Dust Motes / Sparkles
      { id: 16, type: "sparkle", x: 18, y: 24, size: 16, duration: 8, delay: 0, opacity: 0.35, rotate: 0, driftX: 10, driftY: -20 },
      { id: 17, type: "sparkle", x: 84, y: 32, size: 14, duration: 10, delay: 2, opacity: 0.3, rotate: 0, driftX: -12, driftY: -25 },
      { id: 18, type: "sparkle", x: 32, y: 52, size: 18, duration: 9, delay: 1, opacity: 0.4, rotate: 0, driftX: 15, driftY: -18 },
      { id: 19, type: "sparkle", x: 74, y: 68, size: 12, duration: 7, delay: 3, opacity: 0.3, rotate: 0, driftX: -8, driftY: -22 },
      { id: 20, type: "sparkle", x: 50, y: 20, size: 16, duration: 11, delay: 4, opacity: 0.35, rotate: 0, driftX: 12, driftY: -24 },
    ];
  }, []);

  const renderIcon = (type: FloatingItem["type"]) => {
    switch (type) {
      case "open-book":
        return (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full text-amber-500">
            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
            <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
            <path d="M6 8h2" />
            <path d="M6 12h2" />
            <path d="M16 8h2" />
            <path d="M16 12h2" />
          </svg>
        );
      case "scroll":
        return (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full text-amber-500">
            <path d="M8 2h8a2 2 0 0 1 2 2v14a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V6a4 4 0 0 1 4-4h2" />
            <path d="M18 18a2 2 0 0 0 2-2V8" />
            <path d="M6 6h10" />
            <path d="M6 10h10" />
            <path d="M6 14h6" />
          </svg>
        );
      case "quill":
        return (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full text-amber-500">
            <path d="M20.24 3.76a6 6 0 0 0-8.49 0L3 12.5V17h4.5l8.74-8.74a6 6 0 0 0 0-8.5z" />
            <path d="M16 8 2 22" />
            <path d="M17.5 15H9" />
          </svg>
        );
      case "tome":
        return (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full text-amber-500">
            <rect width="16" height="20" x="4" y="2" rx="2" />
            <path d="M8 2v20" />
            <path d="M12 6h4" />
            <path d="M12 10h4" />
          </svg>
        );
      case "bookmark":
        return (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full text-amber-500">
            <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />
            <line x1="12" x2="12" y1="7" y2="13" />
          </svg>
        );
      case "sparkle":
        return (
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full text-amber-400">
            <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" />
          </svg>
        );
    }
  };

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0" aria-hidden="true">
      {/* Warm Ambient Lamp Halos */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] sm:w-[900px] h-[500px] bg-gradient-to-b from-[#D97706]/14 via-[#F59E0B]/8 to-transparent rounded-full blur-3xl opacity-80" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#D97706]/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#D97706]/10 rounded-full blur-3xl" />

      {/* Subtle Ancient Paper / Grid Texture */}
      <div
        className="absolute inset-0 opacity-[0.035] dark:opacity-[0.05]"
        style={{
          backgroundImage: `radial-gradient(#F59E0B 1px, transparent 1px)`,
          backgroundSize: "28px 28px",
        }}
      />

      {/* Zero-Gravity Floating Literary Icons */}
      {mounted &&
        items.map((item) => {
          const parallaxX = (mousePos.x * (item.size / 50));
          const parallaxY = (mousePos.y * (item.size / 50));

          return (
            <div
              key={item.id}
              className="absolute transition-transform duration-1000 ease-out"
              style={{
                left: `${item.x}%`,
                top: `${item.y}%`,
                width: `${item.size}px`,
                height: `${item.size}px`,
                opacity: item.opacity,
                transform: `translate(${parallaxX}px, ${parallaxY}px) rotate(${item.rotate}deg)`,
                animation: `zeroGravityFloat ${item.duration}s ease-in-out infinite alternate`,
                animationDelay: `${item.delay}s`,
                ["--drift-x" as string]: `${item.driftX}px`,
                ["--drift-y" as string]: `${item.driftY}px`,
              }}
            >
              {renderIcon(item.type)}
            </div>
          );
        })}

      {/* Keyframe animation injected inline */}
      <style jsx>{`
        @keyframes zeroGravityFloat {
          0% {
            transform: translate(0px, 0px) rotate(0deg);
          }
          50% {
            transform: translate(var(--drift-x, 20px), var(--drift-y, -30px)) rotate(6deg);
          }
          100% {
            transform: translate(calc(var(--drift-x, 20px) * -0.6), calc(var(--drift-y, -30px) * 0.8)) rotate(-6deg);
          }
        }
      `}</style>
    </div>
  );
}
