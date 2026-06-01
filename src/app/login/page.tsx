'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Image from 'next/image';

// Typewriter effect component
const TypewriterText = ({ text, delay = 0 }: { text: string; delay?: number }) => {
  const [displayedText, setDisplayedText] = useState('');

  useEffect(() => {
    let i = 0;
    const timer = setInterval(() => {
      if (i < text.length) {
        setDisplayedText((prev) => prev + text.charAt(i));
        i++;
      } else {
        clearInterval(timer);
      }
    }, 100); // typing speed

    const timeout = setTimeout(() => {
      // Start typing after delay
    }, delay);

    return () => {
      clearInterval(timer);
      clearTimeout(timeout);
    };
  }, [text, delay]);

  // Framer motion variants for character by character typing
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: (i = 1) => ({
      opacity: 1,
      transition: { staggerChildren: 0.12, delayChildren: delay * 0.001 },
    }),
  };

  const childVariants = {
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring' as const,
        damping: 12,
        stiffness: 100,
      },
    },
    hidden: {
      opacity: 0,
      y: 20,
      transition: {
        type: 'spring' as const,
        damping: 12,
        stiffness: 100,
      },
    },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="flex"
    >
      {text.split('').map((char, index) => (
        <motion.span variants={childVariants} key={index}>
          {char === ' ' ? '\u00A0' : char}
        </motion.span>
      ))}
    </motion.div>
  );
};

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (data.success) {
        // Force a hard reload to clear any cached states and load the fresh app
        window.location.href = '/';
      } else {
        setError(data.message || 'Invalid credentials');
      }
    } catch (err) {
      setError('An error occurred during authentication.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex text-white overflow-hidden relative">

      {/* Left Side - Visual */}
      <div className="hidden md:flex w-1/2 items-center justify-center relative border-r border-white/10">

        {/* Top Left Logo Area */}
        <div className="absolute top-10 left-10 flex items-center gap-2">
          <span className="text-lg font-bold tracking-widest uppercase">AEGIS</span>
        </div>

        {/* The Graphic (red box area) */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="relative w-[400px] h-[400px] flex items-center justify-center"
        >
          <Image
            src="/aegislogo.png"
            alt="Aegis Core"
            fill
            sizes="(max-width: 768px) 100vw, 400px"
            className="object-contain opacity-80 mix-blend-screen filter grayscale contrast-125"
            priority
          />
          {/* Subtle glow behind logo */}
          <div className="absolute inset-0 bg-white/5 blur-3xl rounded-full" />
        </motion.div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-[360px] flex flex-col items-center">

          {/* Circular Loader Icon */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="mb-8 w-12 h-12 relative flex items-center justify-center"
          >
            <div className="absolute w-2 h-2 rounded-full bg-white top-0" />
            <div className="absolute w-2 h-2 rounded-full bg-white bottom-0" />
            <div className="absolute w-2 h-2 rounded-full bg-white left-0" />
            <div className="absolute w-2 h-2 rounded-full bg-white right-0" />

            <div className="absolute w-1.5 h-1.5 rounded-full bg-white/50 top-1.5 left-1.5" />
            <div className="absolute w-1.5 h-1.5 rounded-full bg-white/50 top-1.5 right-1.5" />
            <div className="absolute w-1.5 h-1.5 rounded-full bg-white/50 bottom-1.5 left-1.5" />
            <div className="absolute w-1.5 h-1.5 rounded-full bg-white/50 bottom-1.5 right-1.5" />
          </motion.div>

          {/* Heading */}
          <div className="font-nothing text-3xl mb-1 flex justify-center tracking-wide">
            <TypewriterText text="LOGIN" delay={200} />
          </div>

          <div className="mb-10"></div>

          <form onSubmit={handleLogin} className="w-full flex flex-col gap-3">

            <div className="relative group">
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Username"
                className="w-full bg-[#1c1c1c] border border-transparent rounded-full px-5 pt-5 pb-2 text-sm text-white placeholder-transparent focus:outline-none focus:border-white/20 transition-all peer"
                required
              />
              <label className="absolute left-5 top-2.5 text-[9px] uppercase tracking-wider text-white/40 transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-xs peer-placeholder-shown:normal-case peer-focus:top-2.5 peer-focus:text-[9px] peer-focus:uppercase cursor-text pointer-events-none">
                Username
              </label>
            </div>

            <div className="relative group">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full bg-[#1c1c1c] border border-transparent rounded-full px-5 pt-5 pb-2 text-sm text-white placeholder-transparent focus:outline-none focus:border-white/20 transition-all peer"
                required
              />
              <label className="absolute left-5 top-2.5 text-[9px] uppercase tracking-wider text-white/40 transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-xs peer-placeholder-shown:normal-case peer-focus:top-2.5 peer-focus:text-[9px] peer-focus:uppercase cursor-text pointer-events-none">
                Password
              </label>
              <div className="absolute right-5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/70 cursor-pointer">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                  <line x1="1" y1="1" x2="23" y2="23"></line>
                </svg>
              </div>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-red-400 text-xs text-center mt-2"
              >
                {error}
              </motion.div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-white text-black font-medium text-sm rounded-full py-4 mt-2 hover:bg-white/90 active:scale-[0.98] transition-all flex items-center justify-center"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
              ) : (
                'Enter'
              )}
            </button>

            <div className="hidden text-center mt-4">
              <span className="text-[11px] text-white/40 cursor-pointer hover:text-white transition-colors">Forgot password?</span>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}
