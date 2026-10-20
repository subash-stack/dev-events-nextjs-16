import type { Metadata } from "next";
import { Schibsted_Grotesk, Martian_Mono } from "next/font/google";
import "./globals.css";
import LightRays from "@/components/LightRays";
import Navbar from "@/components/Navbar";

const schibstedGrotesk = Schibsted_Grotesk({
  variable: "--font-schibsted_grotesk",
  subsets: ["latin"],
});

const martianMono = Martian_Mono({
  variable: "--font-martian_mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "DevEvent",
  description: "The Hub for Every Dev Event  You Mustn't Miss",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${schibstedGrotesk.variable} ${martianMono.variable} antialiased`}
    >
      <body className="relative min-h-screen flex flex-col">
        <Navbar />
        <div className="pointer-events-none fixed inset-0 z-0">
          <LightRays
            raysOrigin="top-center-offset"
            raysColor="#5dfeca"
            raysSpeed={0.5}
            lightSpread={0.9}
            rayLength={1.4}
            followMouse
            mouseInfluence={0.02}
            fadeDistance={1}
            saturation={1}
            noiseAmount={0}
            distortion={0.01}
            pulsating={false}
          />
        </div>

        <main className="relative z-10 flex-1">{children}</main>
      </body>
    </html>
  );
}
