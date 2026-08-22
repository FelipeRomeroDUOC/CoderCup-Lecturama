import type { Metadata } from "next";
import { Outfit, Patrick_Hand, Geist_Mono } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800", "900"],
});

const patrickHand = Patrick_Hand({
  variable: "--font-patrick-hand",
  subsets: ["latin"],
  weight: ["400"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "LECTURAMA",
  description:
    "La plataforma que convierte la lectura en aprendizaje entretenido, donde cada libro esconde un reto.",
  icons: {
    icon: [
      { url: "/app-icon.png?v=2", type: "image/png" },
      { url: "/favicon.ico?v=2" },
    ],
    shortcut: "/app-icon.png?v=2",
    apple: "/app-icon.png?v=2",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${outfit.variable} ${patrickHand.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}
