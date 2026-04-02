export default function MissionsPage() {
  return (
    <main className="flex-1 w-full relative bg-surface-container-lowest h-full tactical-grid overflow-y-auto p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-[#66FCF1] font-bold text-2xl font-headline mb-4 uppercase tracking-wider">
          Total Missions Overview
        </h1>
        <p className="font-mono text-sm text-on-surface-variant mb-8">
          ACTIVE_DEPLOYMENTS: 12 // AWAITING_ORDERS: 4
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 tracking-widest uppercase">
          <div className="bg-surface-container border-l-4 border-on-tertiary-container p-6 bezel-glow text-white shadow-lg shadow-on-tertiary-container/10">
            <h2 className="font-headline font-bold mb-2">Operation: DARK_STAR</h2>
            <div className="font-mono text-[10px] text-on-surface-variant flex flex-col gap-1">
              <span>STATUS: INFILTRATION</span>
              <span>RISK: HIGH</span>
              <span className="text-on-tertiary-container mt-2">ALERTS: 2 CRITICAL</span>
            </div>
            <button className="mt-4 px-4 py-1 text-[10px] font-mono border border-on-tertiary-container hover:bg-on-tertiary-container transition-colors">
              VIEW FEED
            </button>
          </div>
          <div className="bg-surface-container border-l-4 border-secondary p-6 bezel-glow text-white shadow-lg shadow-secondary/10">
            <h2 className="font-headline font-bold mb-2">Operation: DEEP_BLUE</h2>
            <div className="font-mono text-[10px] text-on-surface-variant flex flex-col gap-1">
              <span>STATUS: ROUTINE_PATROL</span>
              <span>RISK: LOW</span>
              <span className="text-secondary mt-2">ALERTS: 0</span>
            </div>
            <button className="mt-4 px-4 py-1 text-[10px] font-mono border border-secondary hover:bg-secondary text-black transition-colors">
              VIEW FEED
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
