export default function LoginLoading() {
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
              stitchTiles="stitch"
            />
          </filter>
          <rect width="100%" height="100%" filter="url(#noiseFilter)" />
        </svg>
      </div>

      {/* Subtle Ambient Background Detail */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-[#F5F5F0] blur-[120px] opacity-60" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-[#F0F0EB] blur-[120px] opacity-40" />
      </div>

      {/* Loading Content */}
      <main className="relative z-20 w-full max-w-3xl flex flex-col items-center scale-110 md:scale-125">
        {/* Placeholder for mascot */}
        <div className="mb-6 md:mb-8 relative w-[28vw] max-w-[160px] min-w-[120px] aspect-square">
          <div className="absolute inset-0 bg-[#E5E5E0] blur-2xl opacity-20 rounded-full animate-pulse" />
        </div>

        {/* Minimalist Label */}
        <div className="mb-6 md:mb-8 flex items-center gap-3 md:gap-4">
          <div className="h-[1px] w-8 md:w-10 bg-[#E5E5E0]" />
          <span className="text-[10px] md:text-[11px] uppercase tracking-[0.4em] text-[#999990] font-medium">
            Personal Ledger
          </span>
          <div className="h-[1px] w-8 md:w-10 bg-[#E5E5E0]" />
        </div>

        {/* Loading indicator */}
        <div className="w-full max-w-md mb-10 md:mb-12 flex justify-center">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#999990] animate-bounce [animation-delay:-0.3s]" />
            <div className="w-2 h-2 rounded-full bg-[#999990] animate-bounce [animation-delay:-0.15s]" />
            <div className="w-2 h-2 rounded-full bg-[#999990] animate-bounce" />
          </div>
        </div>
      </main>
    </div>
  );
}
