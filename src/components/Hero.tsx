/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { MapPin, GraduationCap, ChevronRight, MessageSquareCode, Calendar, Sparkles, BookOpen, CheckCircle } from "lucide-react";
import { LOCATIONS, STANDARDS, SUBJECTS_BY_CLASS } from "../data";

interface HeroProps {
  onRoleChange: (role: "landing" | "student" | "parent" | "tutor" | "admin" | "login_select") => void;
  selectedStandard: string;
  onSelectStandard: (std: string) => void;
}

export function Hero({ onRoleChange, selectedStandard, onSelectStandard }: HeroProps) {
  const [selectedLocation, setSelectedLocation] = useState("Hyderabad");
  const [demoRequested, setDemoRequested] = useState(false);

  const activeSubjects = SUBJECTS_BY_CLASS[selectedStandard] || [
    "Comprehensive General Mathematics",
    "Physical & Natural Science",
    "Primary English Literature"
  ];

  const handleBookDemo = () => {
    const textMsg = encodeURIComponent(
      `Hello Academy Flow! We want to book a free demo session for standard: ${selectedStandard} at location: ${selectedLocation}. Talk to us!`
    );
    // WhatsApp redirect to Admin Support [6300227011]
    const whatsappUrl = `https://wa.me/916300227011?text=${textMsg}`;
    window.open(whatsappUrl, "_blank");
    setDemoRequested(true);
  };

  const handleContinueToParentLogin = () => {
    // Store current selections in session state or localStorage temporary bucket for selection page
    localStorage.setItem("academyflow_demo_standard", selectedStandard);
    localStorage.setItem("academyflow_demo_location", selectedLocation);
    localStorage.setItem("academyflow_demo_subjects", JSON.stringify(activeSubjects));

    // Redirect selection details to Parent Login page
    onRoleChange("parent");
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-sky-50/50 via-white to-sky-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 px-4 py-8 sm:px-6 lg:px-8 transition-colors duration-300">

      {/* Background Orbs */}
      <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-sky-300/20 dark:bg-sky-900/10 blur-[120px] pointer-events-none" />
      <div className="absolute top-1/2 -right-40 w-96 h-96 rounded-full bg-indigo-300/20 dark:bg-indigo-900/10 blur-[120px] pointer-events-none" />

      <div className="mx-auto max-w-7xl pt-4 pb-12 lg:pt-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

          {/* Main Copy (Col 7) */}
          <div className="lg:col-span-7 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 rounded-full bg-sky-100/80 px-4 py-1.5 text-xs font-bold text-sky-800 dark:bg-sky-950/60 dark:text-sky-300">
              <Sparkles className="h-3.5 w-3.5 text-sky-500 animate-pulse" />
              <span>Empowering Over 10,000+ Students</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.1]">
              Empower Your Future with <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-500 via-indigo-500 to-indigo-600 dark:from-sky-400 dark:to-indigo-300">Academy Flow</span>
            </h1>

            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed">
              Premium quality online & offline tuition for Classes 1st to 10th. Tailored learning paths, state-of-the-art mock dashboards, veteran faculty and a proven record of high academic excellence.
            </p>

            <div className="flex flex-wrap gap-4 pt-2">
              <button
                onClick={() => {
                  const finder = document.getElementById("hero-finder");
                  if (finder) finder.scrollIntoView({ behavior: "smooth" });
                }}
                className="rounded-xl bg-slate-900 hover:bg-slate-850 dark:bg-sky-500 dark:hover:bg-sky-400 text-white dark:text-slate-950 font-extrabold px-6 py-3.5 text-sm transition-all shadow-lg active:scale-95 inline-flex items-center gap-2 hover:shadow-sky-500/10"
              >
                <span>Get Started Now</span>
                <ChevronRight className="h-4 w-4" />
              </button>
              <button
                onClick={() => onRoleChange("login_select")}
                className="rounded-xl border border-slate-300 dark:border-slate-700 bg-white/50 backdrop-blur dark:bg-slate-900/50 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold px-6 py-3.5 text-sm transition-all active:scale-95 shadow-sm"
              >
                Explore Portals
              </button>
            </div>

            {/* Quick trust metrics */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-slate-200/60 dark:border-slate-800/60 max-w-lg">
              <div>
                <p className="text-2xl font-black text-slate-900 dark:text-white">100%</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Concept-Oriented Syllabus</p>
              </div>

            </div>
          </div>

          {/* Glowing Illustration image with virtual screen overlay (Col 5) */}
          <div className="lg:col-span-5 relative flex justify-center items-center">

            {/* Visual Frame */}
            <div className="relative w-full max-w-[420px] aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl border border-white/20 hover:scale-[1.02] transition-transform duration-505 dark:border-slate-800">

              <img
                src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=700&q=80"
                alt="Academy Flow Child Learning Process on modern responsive screens"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />

              {/* Futuristic Glassmorphic overlay simulating student portal content in child's hand */}
              <div className="absolute inset-x-4 bottom-4 glass-effect dark:bg-slate-900/85 p-4 rounded-2xl border border-white/20 dark:border-slate-700/50 shadow-lg space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase tracking-widest font-extrabold text-sky-600 dark:text-sky-400">Class 1st to 10th CRM</span>
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
                </div>
                <p className="text-xs font-bold text-slate-800 dark:text-white">Interactive Subject Progress & Growth Dashboard</p>
                <div className="w-full bg-slate-200 dark:bg-slate-800 h-1 rounded-full overflow-hidden">
                  <div className="bg-gradient-to-r from-sky-400 to-indigo-600 h-full w-[85%]" />
                </div>
                <div className="flex justify-between text-[10px] text-slate-500 dark:text-slate-400">
                  <span>Attendance: 94%</span>
                  <span>Results average: 92%</span>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Dynamic Classes Finder Section with Dropdowns */}
        <div id="hero-finder" className="mt-16 bg-white dark:bg-slate-950 rounded-2xl p-6 sm:p-8 shadow-xl border border-slate-100 dark:border-slate-800/80 max-w-5xl mx-auto hover:shadow-2xl transition-all">
          <div className="text-center mb-6">
            <span className="text-xs font-bold text-sky-600 dark:text-sky-450 uppercase tracking-widest">Find Your Perfect Class</span>
            <h3 className="text-xl font-extrabold text-slate-900 dark:text-white mt-1">Select location and class to unlock course options and book a free session</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">

            {/* Field 1: Location */}
            <div className="space-y-2">
              <label className="text-xs font-extrabold text-slate-600 dark:text-slate-400 flex items-center gap-1.5 uppercase tracking-widest">
                <MapPin className="h-4 w-4 text-sky-500" />
                <span>Select Learning Center</span>
              </label>
              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-55 dark:bg-slate-900 px-4 py-3 text-sm font-semibold text-slate-800 dark:text-slate-100 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
              >
                {LOCATIONS.map((loc) => (
                  <option key={loc} value={loc}>Academy Center — {loc}</option>
                ))}
              </select>
            </div>

            {/* Field 2: Class Standards */}
            <div className="space-y-2">
              <label className="text-xs font-extrabold text-slate-600 dark:text-slate-400 flex items-center gap-1.5 uppercase tracking-widest">
                <GraduationCap className="h-4 w-4 text-sky-500" />
                <span>Select Learning Class</span>
              </label>
              <select
                value={selectedStandard}
                onChange={(e) => onSelectStandard(e.target.value)}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-55 dark:bg-slate-900 px-4 py-3 text-sm font-semibold text-slate-800 dark:text-slate-100 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
              >
                {STANDARDS.map((std) => (
                  <option key={std} value={std}>{std}</option>
                ))}
              </select>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row gap-2">
              <button
                onClick={handleBookDemo}
                className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl px-4 py-3 text-sm transition-all active:scale-95 flex items-center justify-center gap-2 shadow-sm"
              >
                <MessageSquareCode className="h-4.5 w-4.5" />
                <span>Book a Demo</span>
              </button>

              <button
                onClick={handleContinueToParentLogin}
                className="flex-1 bg-sky-500 hover:bg-sky-400 text-slate-950 font-extrabold rounded-xl px-4 py-3 text-sm transition-all active:scale-95 flex items-center justify-center gap-1.5 shadow"
              >
                <span>Continue Portal Setup</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

          </div>

          {/* Active class card showing dynamic courses based on choices */}
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
            {demoRequested && (
              <div className="mt-3 flex items-center gap-1.5 text-xs text-emerald-600 font-bold">
                <CheckCircle className="h-4 w-4" />
                <span>WhatsApp request prefilled successfully! Click send in the chat to talk to us.</span>
              </div>
            )}
          </div>
        </div>

      </div>
    </section>
  );
}
