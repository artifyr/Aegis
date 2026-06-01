export default function NewsPage() {
  return (
    <main className="flex-1 w-full relative bg-[#0b0c10] h-full overflow-y-auto p-8 custom-scrollbar">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-white font-bold text-2xl font-headline mb-4 uppercase tracking-wider">
          Global News & Intel
        </h1>
        <p className="font-mono text-sm text-white/50 mb-8">
          LIVE_FEED // SYNDICATED_SOURCES: 42
        </p>

        <div className="fui-border bg-black/40 p-6 relative">
          <div className="fui-corner-tl"></div><div className="fui-corner-tr"></div><div className="fui-corner-bl"></div><div className="fui-corner-br"></div>
          <div className="flex flex-col gap-4 font-mono text-xs text-white/70">
            <div className="flex justify-between items-center bg-white/5 p-3 border-l-2 border-white/20 hover:bg-white/10 cursor-pointer transition-colors">
              <span className="text-white">OPERATION_SILENT_DAWN_UPDATE</span>
              <span className="text-[#0ea5e9]">STATUS: ONGOING</span>
              <span>12.OCT.2023</span>
            </div>
            <div className="flex justify-between items-center bg-white/5 p-3 border-l-2 border-white/20 hover:bg-white/10 cursor-pointer transition-colors">
              <span className="text-white">REGION_7_RECON_REPORT</span>
              <span className="text-yellow-400">STATUS: PENDING_REVIEW</span>
              <span>11.OCT.2023</span>
            </div>
            <div className="flex justify-between items-center bg-white/5 p-3 border-l-2 border-[#10b981] hover:bg-white/10 cursor-pointer transition-colors">
              <span className="text-white">SATELLITE_DEPLOYMENT_SUCCESS</span>
              <span className="text-[#10b981]">STATUS: COMPLETED</span>
              <span>10.OCT.2023</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
