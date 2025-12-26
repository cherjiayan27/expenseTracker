import Link from "next/link";
import Image from "next/image";

export default function HomePage() {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#FDFCFB] text-[#1A1A1A] px-6 py-12 md:p-6 overflow-hidden relative">
      {/* High-End Grain Texture */}
      <div className="absolute inset-0 opacity-[0.25] pointer-events-none contrast-125 brightness-100 z-10">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <filter id="noiseFilter">
            <feTurbulence 
              type="fractalNoise" 
              baseFrequency="0.6" 
              numOctaves="3" 
              stitchTiles="stitch" />
          </filter>
          <rect width="100%" height="100%" filter="url(#noiseFilter)" />
        </svg>
      </div>

      {/* Subtle Ambient Background Detail */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-[#F5F5F0] blur-[120px] opacity-60" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-[#F0F0EB] blur-[120px] opacity-40" />
      </div>

      {/* Main Content - Centered Container */}
      <main className="relative z-20 w-full max-w-3xl flex flex-col items-center my-auto scale-110 md:scale-125">
        {/* Animated Mascot - The Quiet Guardian */}
        <div className="mb-6 md:mb-8 relative group w-[28vw] max-w-[160px] min-w-[120px] aspect-square">
          <div className="absolute inset-0 bg-[#E5E5E0] blur-2xl opacity-20 group-hover:opacity-40 transition-opacity duration-1000 rounded-full" />
          <Image 
            src="/images/dragonWithMoney3.png" 
            alt="Quiet Finance Mascot" 
            fill
            className="relative z-10 opacity-80 group-hover:opacity-100 transition-all duration-1000 ease-in-out hover:scale-105 object-contain"
            priority
          />
        </div>

        {/* Minimalist Label */}
        <div className="mb-6 md:mb-8 flex items-center gap-3 md:gap-4">
          <div className="h-[1px] w-8 md:w-10 bg-[#E5E5E0]" />
          <span className="text-[10px] md:text-[11px] uppercase tracking-[0.4em] text-[#999990] font-medium">
            Personal Ledger
          </span>
          <div className="h-[1px] w-8 md:w-10 bg-[#E5E5E0]" />
        </div>

        {/* Hero Typography */}
        <h1 className="text-6xl md:text-7xl lg:text-9xl font-extralight tracking-tighter text-center leading-[0.9] mb-10 md:mb-12">
          about <br />
          <span className="font-normal italic">TIME</span>
        </h1>

        {/* Sophisticated CTA */}
        <Link
          href="/login"
          className="group relative inline-flex items-center justify-center px-12 md:px-14 py-4 md:py-5 bg-[#1A1A1A] text-white rounded-full transition-all duration-300 hover:bg-black hover:shadow-2xl hover:shadow-black/10 active:scale-[0.98]"
        >
          <span className="relative text-sm md:text-base tracking-widest uppercase font-medium">
            Get Started
          </span>
        </Link>
      </main>
    </div>
  );
}