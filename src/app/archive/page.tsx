export default function ArchivePage() {
  return (
    <main className="flex-1 w-full relative bg-surface-container-lowest h-full tactical-grid overflow-y-auto p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-[#66FCF1] font-bold text-2xl font-headline mb-4 uppercase tracking-wider">
          Intelligence Archive
        </h1>
        <p className="font-mono text-sm text-on-surface-variant mb-8">
          HISTORICAL_DATA_RETRIEVAL // INDEXED_DOMAINS: 1.4M
        </p>

        <div className="bg-surface-container-high border border-outline-variant p-6 bezel-glow">
          <div className="flex flex-col gap-4 font-mono text-xs text-on-surface-variant">
            <div className="flex justify-between items-center bg-surface-container p-3 border-l-2 border-outline-variant hover:bg-white/5 cursor-pointer">
              <span>RECORD_23910_ALPHA</span>
              <span className="text-secondary">CLASS: TOP_SECRET</span>
              <span>12.OCT.2023</span>
            </div>
            <div className="flex justify-between items-center bg-surface-container p-3 border-l-2 border-outline-variant hover:bg-white/5 cursor-pointer">
              <span>RECORD_23911_BETA</span>
              <span className="text-secondary">CLASS: RESTRICTED</span>
              <span>11.OCT.2023</span>
            </div>
            <div className="flex justify-between items-center bg-surface-container p-3 border-l-2 border-on-tertiary-container hover:bg-white/5 cursor-pointer">
              <span>RECORD_23912_GAMMA</span>
              <span className="text-on-tertiary-container">CLASS: CLASSIFIED</span>
              <span>10.OCT.2023</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
