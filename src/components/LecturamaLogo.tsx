import React from "react";

interface LecturamaLogoProps {
  className?: string;
  size?: number;
  showText?: boolean;
  withGlow?: boolean;
}

export default function LecturamaLogo({
  className = "",
  size = 48,
  showText = false,
  withGlow = true,
}: LecturamaLogoProps) {
  return (
    <div className={`inline-flex items-center gap-3 ${className}`}>
      <div className="relative flex items-center justify-center">
        {withGlow && (
          <div
            className="absolute -inset-1.5 rounded-2xl bg-amber-500/25 dark:bg-amber-500/20 blur-md pointer-events-none"
            aria-hidden="true"
          />
        )}
        <svg
          width={size}
          height={size}
          viewBox="0 0 64 64"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="relative drop-shadow-sm transition-transform duration-300 hover:scale-105"
          aria-label="Isotipo de Lecturama"
        >
          <defs>
            <linearGradient id="bookCoverGrad" x1="4" y1="12" x2="60" y2="56" gradientUnits="userSpaceOnUse">
              <stop stopColor="#F59E0B" />
              <stop offset="0.5" stopColor="#D97706" />
              <stop offset="1" stopColor="#B45309" />
            </linearGradient>
            <linearGradient id="bookPageLeft" x1="12" y1="18" x2="32" y2="48" gradientUnits="userSpaceOnUse">
              <stop stopColor="#FFFFFF" />
              <stop offset="1" stopColor="#F3F4F6" />
            </linearGradient>
            <linearGradient id="bookPageRight" x1="32" y1="18" x2="52" y2="48" gradientUnits="userSpaceOnUse">
              <stop stopColor="#FFFBEB" />
              <stop offset="1" stopColor="#FEF3C7" />
            </linearGradient>
            <linearGradient id="portalBeacon" x1="32" y1="4" x2="32" y2="28" gradientUnits="userSpaceOnUse">
              <stop stopColor="#FBBF24" />
              <stop offset="1" stopColor="#D97706" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Book Spine Base Shadow */}
          <ellipse cx="32" cy="56" rx="22" ry="4" fill="#000000" fillOpacity="0.12" />

          {/* Hardcover Binding (Open Book) */}
          <path
            d="M6 46C14 42 26 42 32 46C38 42 50 42 58 46L58 20C50 16 38 16 32 20C26 16 14 16 6 20Z"
            fill="url(#bookCoverGrad)"
          />

          {/* Spine Ribbon Line */}
          <path
            d="M32 20V46"
            stroke="#92400E"
            strokeWidth="2"
            strokeLinecap="round"
          />

          {/* Left Page Layer (Base) */}
          <path
            d="M9 43C16 39 25 39 31 43V18C25 14 16 14 9 18Z"
            fill="#E5E7EB"
          />

          {/* Left Page Layer (Top) */}
          <path
            d="M10 41C17 37 25 37 31 41V16C25 12 17 12 10 16Z"
            fill="url(#bookPageLeft)"
          />

          {/* Right Page Layer (Base) */}
          <path
            d="M55 43C48 39 39 39 33 43V18C39 14 48 14 55 18Z"
            fill="#FDE68A"
          />

          {/* Right Page Layer (Top) */}
          <path
            d="M54 41C47 37 39 37 33 41V16C39 12 47 12 54 16Z"
            fill="url(#bookPageRight)"
          />

          {/* Left Page Text Lines */}
          <path
            d="M15 22C19 20 24 20 27 22M15 27C19 25 24 25 27 27M15 32C19 30 24 30 27 32"
            stroke="#9CA3AF"
            strokeWidth="1.5"
            strokeLinecap="round"
          />

          {/* Right Page Text Lines */}
          <path
            d="M37 22C40 20 45 20 49 22M37 27C40 25 45 25 49 27M37 32C40 30 45 30 49 32"
            stroke="#D97706"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeOpacity="0.6"
          />

          {/* Center Knowledge Spark / Portal Beacon */}
          <path
            d="M32 4L34.5 11.5L42 14L34.5 16.5L32 24L29.5 16.5L22 14L29.5 11.5Z"
            fill="#F59E0B"
          />
          <circle cx="32" cy="14" r="2.5" fill="#FFFFFF" />

          {/* Floating Wisdom Dots */}
          <circle cx="20" cy="8" r="1.5" fill="#FBBF24" fillOpacity="0.8" />
          <circle cx="44" cy="8" r="1.5" fill="#FBBF24" fillOpacity="0.8" />
        </svg>
      </div>

      {showText && (
        <span className="font-[family-name:var(--font-outfit)] font-black tracking-tight text-xl text-zinc-900 dark:text-zinc-100">
          LECTURAMA
        </span>
      )}
    </div>
  );
}
