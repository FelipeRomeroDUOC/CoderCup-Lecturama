import React from "react";
import Image from "next/image";

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
            className="absolute -inset-2 rounded-2xl bg-amber-500/25 dark:bg-amber-500/20 blur-md pointer-events-none"
            aria-hidden="true"
          />
        )}
        <div
          style={{ width: size, height: size }}
          className="relative drop-shadow-md transition-transform duration-300 hover:scale-105"
        >
          <Image
            src="/app-icon.png"
            alt="Isotipo Oficial de Lecturama"
            width={size}
            height={size}
            className="w-full h-full object-contain"
            priority
          />
        </div>
      </div>

      {showText && (
        <span className="font-[family-name:var(--font-outfit)] font-black tracking-tight text-xl text-zinc-900 dark:text-zinc-100">
          LECTURAMA
        </span>
      )}
    </div>
  );
}
