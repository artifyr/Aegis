'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function NotFound() {
  const [terminalLogs, setTerminalLogs] = useState<string[]>([
    'AEGIS CORE OS [v2.4.11]',
    'INITIALIZING SYSTEM DIAGNOSTIC...',
    'PINGING AEGIS GATEWAY... FAILED [ERR_TIMEOUT]',
    'ERROR 404: ROUTE_NOT_FOUND',
    'SECTOR_COORDINATES: CLASSIFIED_OR_MISSING',
    'STANDBY FOR OPERATIONAL REDIRECT...'
  ]);
  const [redirectCount, setRedirectCount] = useState(15);
  const [diagnosticRunning, setDiagnosticRunning] = useState(false);
  const [diagnosticProgress, setDiagnosticProgress] = useState(0);

  useEffect(() => {
    // Countdown timer for automatic return
    const timer = setInterval(() => {
      setRedirectCount((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          window.location.href = '/';
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Handle mock diagnostic command
  const runDiagnostic = () => {
    if (diagnosticRunning) return;
    setDiagnosticRunning(true);
    setDiagnosticProgress(0);
    
    const logs = [
      'EXECUTE: force_recon --route-restore',
      'CLEANING CACHED CORRUPTED SECTORS...',
      'ESTABLISHING ENCRYPTED SATLINK...',
      'SATLINK: ONLINE [9.122.84.102:443]',
      'DECRYPTING HOME GRID COORDINATES...',
      'GRID TARGET RESOLVED: SEC_ALPHA_MAP',
      'REDIRECT PROTOCOL INITIALIZED.'
    ];

    let logIndex = 0;
    const logInterval = setInterval(() => {
      if (logIndex < logs.length) {
        setTerminalLogs((prev) => [...prev, `[CMD] ${logs[logIndex]}`]);
        logIndex++;
      } else {
        clearInterval(logInterval);
      }
    }, 450);

    const progressInterval = setInterval(() => {
      setDiagnosticProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          setTimeout(() => {
            window.location.href = '/';
          }, 800);
          return 100;
        }
        return prev + 5;
      });
    }, 100);
  };

  return (
    <main className="flex-1 w-full relative bg-surface-container-lowest h-full flex items-center justify-center p-4 md:p-8 overflow-y-auto custom-scrollbar">
      {/* Background grids and vignette */}
      <div className="absolute inset-0 tactical-cross-grid opacity-20 pointer-events-none"></div>
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/80 pointer-events-none"></div>
      
      {/* CRT Scanline and vignette overlay */}
      <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.03),rgba(0,255,0,0.01),rgba(0,0,255,0.03))] bg-[size:100%_4px,3px_100%]"></div>
      
      {/* 404 Container */}
      <div className="fui-border w-full max-w-[700px] bg-black/75 backdrop-blur-md p-6 md:p-8 flex flex-col gap-6 relative select-none z-10 border-red-500/20 shadow-[0_0_50px_rgba(220,38,38,0.05)]">
        {/* Custom Red Bezel Corners */}
        <div className="absolute -top-[1px] -left-[1px] w-3 h-3 border-t-2 border-l-2 border-red-500"></div>
        <div className="absolute -top-[1px] -right-[1px] w-3 h-3 border-t-2 border-r-2 border-red-500"></div>
        <div className="absolute -bottom-[1px] -left-[1px] w-3 h-3 border-b-2 border-l-2 border-red-500"></div>
        <div className="absolute -bottom-[1px] -right-[1px] w-3 h-3 border-b-2 border-r-2 border-red-500"></div>

        {/* Top Header */}
        <div className="flex justify-between items-center border-b border-red-500/30 pb-4">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-red-500 animate-pulse rounded-none"></span>
            <span className="text-[10px] md:text-[11px] font-mono tracking-widest text-red-500 font-bold uppercase">
              CRITICAL ERROR // ROUTE_COMPROMISED
            </span>
          </div>
          <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest hidden sm:inline">
            STATUS: 404_OFFLINE
          </span>
        </div>

        {/* Big Code Error Section */}
        <div className="flex flex-col md:flex-row items-center gap-6 py-2">
          <div className="flex flex-col justify-center items-center md:items-start text-center md:text-left">
            <h1 className="text-7xl md:text-8xl font-black tracking-widest text-red-500/90 font-headline select-none filter drop-shadow-[0_0_8px_rgba(239,68,68,0.3)]">
              404
            </h1>
            <p className="font-mono text-white/50 text-[10px] mt-1 uppercase tracking-widest">
              [ SEC_NOT_FOUND ]
            </p>
          </div>
          
          <div className="flex-1 border-l-0 md:border-l border-red-500/20 pl-0 md:pl-6 py-2 flex flex-col gap-2 text-center md:text-left">
            <h2 className="text-xl font-bold uppercase text-white font-headline tracking-wide">
              RADAR ACQUISITION FAILURE
            </h2>
            <p className="font-mono text-xs text-white/60 leading-relaxed max-w-sm">
              The requested coordinates do not correspond to any active assets, personnel, or intelligence nodes in the Aegis Command database.
            </p>
          </div>
        </div>

        {/* Terminal output */}
        <div className="bg-[#07080b] border border-white/10 p-4 font-mono text-[11px] leading-relaxed text-secondary h-44 overflow-y-auto flex flex-col gap-1 relative select-text selection:bg-secondary/30 selection:text-white border-l-2 border-l-red-500/50">
          <div className="absolute top-2 right-3 text-[9px] text-white/20 uppercase tracking-widest pointer-events-none">
            CONSOLE_LOG
          </div>
          {terminalLogs.map((log, idx) => {
            const isCmd = log.startsWith('[CMD]');
            const isFailed = log.includes('FAILED') || log.includes('ERROR');
            return (
              <div 
                key={idx} 
                className={
                  isCmd 
                    ? 'text-cyan-400 font-bold' 
                    : isFailed 
                      ? 'text-red-400' 
                      : 'text-secondary/80'
                }
              >
                {log}
              </div>
            );
          })}
          <div className="flex items-center gap-1">
            <span className="text-cyan-400 select-none">&gt;</span>
            <span className="w-1.5 h-3.5 bg-secondary animate-pulse"></span>
          </div>
        </div>

        {/* Diagnostics & Redirect indicators */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-[10px] font-mono text-white/40 uppercase tracking-widest border-t border-white/10 pt-4">
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[12px] text-red-500 animate-spin">sync</span>
            <span>AUTO-REDIRECT IN <span className="text-white font-bold">{redirectCount}S</span></span>
          </div>
          {diagnosticRunning && (
            <div className="flex items-center gap-2 w-full sm:w-auto border border-cyan-500/30 bg-cyan-950/20 px-3 py-1 text-[9px] text-cyan-400">
              <span className="animate-spin material-symbols-outlined text-[12px]">progress_activity</span>
              <span>SYNCHRONIZING: {diagnosticProgress}%</span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
          <button
            onClick={runDiagnostic}
            disabled={diagnosticRunning}
            className={`font-mono text-xs uppercase tracking-widest border py-3.5 px-4 transition-all flex items-center justify-center gap-2 rounded-none ${
              diagnosticRunning 
                ? 'border-cyan-500/20 bg-cyan-950/10 text-cyan-500/40 cursor-not-allowed'
                : 'border-cyan-500/40 hover:bg-cyan-500/10 text-cyan-400 hover:text-cyan-300 active:scale-95'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">terminal</span>
            RUN DIAGNOSTIC
          </button>
          
          <Link
            href="/"
            className="font-mono text-xs uppercase tracking-widest bg-red-950/30 hover:bg-red-950/60 border border-red-500 text-red-400 hover:text-red-300 font-bold py-3.5 px-4 transition-all text-center flex items-center justify-center gap-2 rounded-none shadow-[0_0_15px_rgba(239,68,68,0.1)] active:scale-95"
          >
            <span className="material-symbols-outlined text-[16px]">home</span>
            RETURN TO COMMAND
          </Link>
        </div>
      </div>
    </main>
  );
}
