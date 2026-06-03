/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { MapPin, GraduationCap, ChevronRight, MessageSquareCode, Sparkles, BookOpen } from "lucide-react";
import { LOCATIONS, STANDARDS, SUBJECTS_BY_CLASS } from "../data";

interface HeroProps {
  onRoleChange: (role: "landing" | "student" | "parent" | "tutor" | "admin" | "login_select") => void;
  onOpenDemo: () => void;
  selectedStandard: string;
  onSelectStandard: (std: string) => void;
}

export function Hero({ onRoleChange, onOpenDemo, selectedStandard, onSelectStandard }: HeroProps) {
  const [selectedLocation, setSelectedLocation] = useState("Hyderabad");

  const activeSubjects = SUBJECTS_BY_CLASS[selectedStandard] || [
    "Comprehensive General Mathematics",
    "Physical & Natural Science",
    "Primary English Literature"
  ];

  const handleBookDemo = () => {
    onOpenDemo();
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-sky-50/50 via-white to-sky-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 px-4 py-8 sm:px-6 lg:px-8 transition-colors duration-300">
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none hero-background" aria-hidden="true">
        <div className="absolute inset-0 hero-background-layer" />
        <div className="absolute inset-0 hero-background-layer-2" />
      </div>

      <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-sky-300/20 dark:bg-sky-900/10 blur-[120px] pointer-events-none hero-orb-drift" />
      <div className="absolute top-1/2 -right-40 w-96 h-96 rounded-full bg-indigo-300/20 dark:bg-indigo-900/10 blur-[120px] pointer-events-none hero-orb-drift-reverse" />

      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        <svg className="floating-book floating-book--visible" style={{ top: '8%', left: '5%', width: 54, height: 66, animationDelay: '0s' }} viewBox="0 0 54 66" fill="none">
          <defs>
            <filter id="glow1"><feDropShadow dx="0" dy="0" stdDeviation="6" floodColor="#38bdf8" floodOpacity="0.5" /></filter>
          </defs>
          <rect x="4" y="3" width="36" height="50" rx="3" fill="#0ea5e9" opacity="0.18" filter="url(#glow1)" />
          <rect x="6" y="5" width="32" height="46" rx="2" fill="#38bdf8" opacity="0.13" />
          <rect x="6" y="5" width="8" height="46" rx="1" fill="#0284c7" opacity="0.18" />
          <line x1="18" y1="16" x2="34" y2="16" stroke="#38bdf8" strokeWidth="1.5" opacity="0.3" />
          <line x1="18" y1="22" x2="30" y2="22" stroke="#38bdf8" strokeWidth="1.5" opacity="0.2" />
          <line x1="18" y1="28" x2="32" y2="28" stroke="#38bdf8" strokeWidth="1.5" opacity="0.15" />
        </svg>

        <svg className="floating-book floating-book--path2" style={{ top: '12%', right: '8%', width: 48, height: 60, animationDelay: '1.2s' }} viewBox="0 0 48 60" fill="none">
          <defs>
            <filter id="glow2"><feDropShadow dx="0" dy="0" stdDeviation="5" floodColor="#818cf8" floodOpacity="0.5" /></filter>
          </defs>
          <rect x="3" y="2" width="34" height="48" rx="3" fill="#6366f1" opacity="0.16" filter="url(#glow2)" />
          <rect x="5" y="4" width="30" height="44" rx="2" fill="#a5b4fc" opacity="0.12" />
          <rect x="5" y="4" width="7" height="44" rx="1" fill="#4f46e5" opacity="0.18" />
          <line x1="16" y1="14" x2="31" y2="14" stroke="#818cf8" strokeWidth="1.5" opacity="0.3" />
          <line x1="16" y1="20" x2="28" y2="20" stroke="#818cf8" strokeWidth="1.5" opacity="0.2" />
        </svg>

        <svg className="floating-book floating-book--path3" style={{ top: '45%', left: '3%', width: 62, height: 44, animationDelay: '2.5s' }} viewBox="0 0 62 44" fill="none">
          <defs>
            <filter id="glow3"><feDropShadow dx="0" dy="0" stdDeviation="5" floodColor="#34d399" floodOpacity="0.45" /></filter>
          </defs>
          <path d="M31 8 C20 6, 6 8, 4 12 L4 38 C6 34, 20 32, 31 34" fill="#10b981" opacity="0.12" filter="url(#glow3)" />
          <path d="M31 8 C42 6, 56 8, 58 12 L58 38 C56 34, 42 32, 31 34" fill="#34d399" opacity="0.10" filter="url(#glow3)" />
          <line x1="31" y1="8" x2="31" y2="34" stroke="#6ee7b7" strokeWidth="1" opacity="0.3" />
          <line x1="10" y1="18" x2="26" y2="17" stroke="#34d399" strokeWidth="1" opacity="0.2" />
          <line x1="10" y1="24" x2="24" y2="23" stroke="#34d399" strokeWidth="1" opacity="0.15" />
          <line x1="36" y1="17" x2="52" y2="18" stroke="#34d399" strokeWidth="1" opacity="0.2" />
          <line x1="36" y1="23" x2="50" y2="24" stroke="#34d399" strokeWidth="1" opacity="0.15" />
        </svg>

        <svg className="hero-sparkle" style={{ top: '15%', left: '20%', width: 12, height: 12, animationDelay: '0s' }} viewBox="0 0 12 12">
          <path d="M6 0 L7 5 L12 6 L7 7 L6 12 L5 7 L0 6 L5 5 Z" fill="#38bdf8" opacity="0.4" />
        </svg>
        <svg className="hero-sparkle" style={{ top: '25%', right: '12%', width: 10, height: 10, animationDelay: '1s' }} viewBox="0 0 12 12">
          <path d="M6 0 L7 5 L12 6 L7 7 L6 12 L5 7 L0 6 L5 5 Z" fill="#a78bfa" opacity="0.35" />
        </svg>
        <svg className="hero-sparkle" style={{ top: '55%', left: '8%', width: 8, height: 8, animationDelay: '1.8s' }} viewBox="0 0 12 12">
          <path d="M6 0 L7 5 L12 6 L7 7 L6 12 L5 7 L0 6 L5 5 Z" fill="#34d399" opacity="0.35" />
        </svg>
        <svg className="hero-sparkle" style={{ top: '70%', right: '18%', width: 10, height: 10, animationDelay: '2.5s' }} viewBox="0 0 12 12">
          <path d="M6 0 L7 5 L12 6 L7 7 L6 12 L5 7 L0 6 L5 5 Z" fill="#fbbf24" opacity="0.3" />
        </svg>
      </div>

      <div className="mx-auto max-w-7xl pt-4 pb-12 lg:pt-10 relative">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-6 text-left relative z-10">
            <div className="inline-flex items-center gap-2 rounded-full bg-sky-100/80 px-4 py-1.5 text-xs font-bold text-sky-800 dark:bg-sky-950/60 dark:text-sky-300">
              <Sparkles className="h-3.5 w-3.5 text-sky-500 animate-pulse" />
              <span>Empowering over 10,000+ students</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.1] hero-animate hero-delay-2">
              Empower Your Future with{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-500 via-indigo-500 to-indigo-600 dark:from-sky-400 dark:to-indigo-300 hero-heading-shimmer">
                Academy Flow
              </span>
            </h1>

            <p className="mt-4 hero-subtag hero-animate hero-delay-2">
              <span>Personalized learning paths</span>
              <span className="hero-sep" aria-hidden>•</span>
              <span>Live &amp; recorded classes</span>
              <span className="hero-sep" aria-hidden>•</span>
              <span>Proven results</span>
            </p>

            <div className="space-y-3">
              <p className="hero-quote hero-animate hero-delay-2">
                Unlock curiosity — every lesson builds a brighter tomorrow.
              </p>

              <p className="text-base sm:text-lg max-w-2x1 leading-relaxed hero-animate hero-delay-3 glossy-text shimmer">
                Premium quality online & offline tuition for Classes 1st to 10th. Tailored learning paths, state-of-the-art mock dashboards, veteran faculty and a proven record of high academic excellence.
              </p>

              <div className="flex flex-wrap gap-4 pt-0 hero-animate hero-delay-4">
                <button
                  onClick={() => {
                    const finder = document.getElementById('hero-finder');
                    if (finder) finder.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="rounded-xl bg-slate-900 hover:bg-slate-850 dark:bg-sky-500 dark:hover:bg-sky-400 text-white dark:text-slate-950 font-extrabold px-6 py-3.5 text-sm transition-all shadow-lg active:scale-95 inline-flex items-center gap-2 hover:shadow-sky-500/10"
                >
                  <span>Get Started Now</span>
                  <ChevronRight className="h-4 w-4" />
                </button>
                <button
                  onClick={() => onRoleChange('login_select')}
                  className="rounded-xl border border-slate-300 dark:border-slate-700 bg-white/50 backdrop-blur dark:bg-slate-900/50 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold px-6 py-3.5 text-sm transition-all active:scale-95 shadow-sm"
                >
                  Explore Portals
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-200/60 dark:border-slate-800/60 max-w-3xl hero-animate hero-delay-5">
              <div>
                <p className="text-2xl sm:text-3xl font-black hero-stat-number">100%</p>
                <p className="text-xs hero-stat-label">Concept-Oriented Syllabus</p>
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-black hero-stat-number">94%</p>
                <p className="text-xs hero-stat-label">Attendance Consistency</p>
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-black hero-stat-number">92%</p>
                <p className="text-xs hero-stat-label">Average Achievement</p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 relative flex justify-center items-center hero-animate-scale hero-delay-3">
             
              
          
          </div>
        </div>

        <div id="hero-finder" className="mt-16 bg-white dark:bg-slate-950 rounded-2xl p-6 sm:p-8 shadow-xl border border-slate-100 dark:border-slate-800/80 max-w-5xl mx-auto hover:shadow-2xl transition-all hero-animate hero-delay-6">
          <div className="text-center mb-6">
            <span className="text-xs font-bold text-sky-600 dark:text-sky-400 uppercase tracking-widest">Find Your Perfect Class</span>
            <h3 className="text-xl font-extrabold text-slate-900 dark:text-white mt-1">Select location and class to unlock course options and book a free session</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
            <div className="space-y-2">
              <label className="text-xs font-extrabold text-slate-600 dark:text-slate-400 flex items-center gap-1.5 uppercase tracking-widest">
                <MapPin className="h-4 w-4 text-sky-500" />
                <span>Select Learning Center</span>
              </label>
              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-4 py-3 text-sm font-semibold text-slate-800 dark:text-slate-100 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
              >
                {LOCATIONS.map((loc) => (
                  <option key={loc} value={loc}>Academy Center — {loc}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-extrabold text-slate-600 dark:text-slate-400 flex items-center gap-1.5 uppercase tracking-widest">
                <GraduationCap className="h-4 w-4 text-sky-500" />
                <span>Select Learning Class</span>
              </label>
              <select
                value={selectedStandard}
                onChange={(e) => onSelectStandard(e.target.value)}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-4 py-3 text-sm font-semibold text-slate-800 dark:text-slate-100 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
              >
                {STANDARDS.map((std) => (
                  <option key={std} value={std}>{std}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <button
                onClick={handleBookDemo}
                className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl px-4 py-3 text-sm transition-all active:scale-95 flex items-center justify-center gap-2 shadow-sm"
              >
                <MessageSquareCode className="h-4.5 w-4.5" />
                <span>Book a Demo</span>
              </button>
            </div>
          </div>

          <div className="mt-6 p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-150 dark:border-slate-800 text-left">
            <p className="text-[10px] font-bold text-sky-600 dark:text-sky-400 uppercase tracking-widest">Active Lessons syllabus in {selectedLocation} for {selectedStandard}:</p>
            <div className="flex flex-wrap gap-2 mt-2">
              {activeSubjects.map((sub, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1 rounded-full bg-indigo-50 border border-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-700 dark:bg-indigo-950/30 dark:border-indigo-900 dark:text-indigo-300"
                >
                  <BookOpen className="h-3 w-3 text-indigo-500" />
                  {sub}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
