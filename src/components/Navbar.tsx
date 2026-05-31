/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { BookOpen, Menu, X, Sun, Moon, LogIn, LogOut, ChevronDown, UserPlus, PhoneIncoming } from "lucide-react";
import { useTheme } from "../context/ThemeContext";

interface NavbarProps {
  onOpenRegister: () => void;
  activeStandard: string;
  onSelectStandard: (std: string) => void;
}

export function Navbar({ onOpenRegister, activeStandard, onSelectStandard }: NavbarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { darkMode, toggleDarkMode } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [standardsDropdownOpen, setStandardsDropdownOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const [classDropdownOpen, setClassDropdownOpen] = useState(false);

  const [selectedLang, setSelectedLang] = useState("English");
  const [selectedClassType, setSelectedClassType] = useState("Online & Offline");

  const standards = Array.from({ length: 10 }, (_, i) => `${i + 1}${i === 0 ? "st" : i === 1 ? "nd" : i === 2 ? "rd" : "th"} Class`);

  // Derive current role from URL path
  const pathSegment = location.pathname.split("/")[1] || "landing";
  const isLanding = pathSegment === "" || pathSegment === "landing";
  const isDashboard = ["student", "parent", "tutor", "admin"].includes(pathSegment);
  const currentRoleLabel = isDashboard ? pathSegment : isLanding ? "landing" : pathSegment;

  const handleStandardClick = (std: string) => {
    onSelectStandard(std);
    setStandardsDropdownOpen(false);
    setMobileMenuOpen(false);
    // Smooth scroll to hero finder
    const heroSection = document.getElementById("hero-finder");
    if (heroSection) {
      heroSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-slate-200/50 bg-white/80 backdrop-blur-md dark:border-slate-800/50 dark:bg-slate-900/80 transition-colors duration-300">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          
          {/* Logo Brand */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate("/")}>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 shadow-md">
              <BookOpen className="h-5 w-5 text-white" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                Academy <span className="text-sky-500">Flow</span>
              </span>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Tuition & CRM Portal</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          {isLanding ? (
            <div className="hidden lg:flex items-center gap-6">
              <button 
                onClick={() => navigate("/")}
                className="text-sm font-semibold text-sky-500 dark:text-sky-400"
              >
                Home
              </button>

              {/* Class type option dropdown */}
              <div className="relative">
                <button 
                  onClick={() => { setClassDropdownOpen(!classDropdownOpen); setLangDropdownOpen(false); setStandardsDropdownOpen(false); }}
                  className="flex items-center gap-1 text-sm font-medium text-slate-700 hover:text-sky-500 dark:text-slate-300 dark:hover:text-white"
                >
                  Classes: {selectedClassType}
                  <ChevronDown className="h-4 w-4 opacity-70" />
                </button>
                {classDropdownOpen && (
                  <div className="absolute left-0 mt-2 w-48 rounded-xl border border-slate-100 bg-white p-2 shadow-xl dark:border-slate-800 dark:bg-slate-950">
                    {["Online Only", "Offline Only", "Online & Offline"].map((type) => (
                      <button
                        key={type}
                        onClick={() => { setSelectedClassType(type); setClassDropdownOpen(false); }}
                        className="w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-700 dark:text-slate-300"
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Languages dropdown */}
              <div className="relative">
                <button 
                  onClick={() => { setLangDropdownOpen(!langDropdownOpen); setClassDropdownOpen(false); setStandardsDropdownOpen(false); }}
                  className="flex items-center gap-1 text-sm font-medium text-slate-700 hover:text-sky-500 dark:text-slate-300 dark:hover:text-white"
                >
                  Language: {selectedLang}
                  <ChevronDown className="h-4 w-4 opacity-70" />
                </button>
                {langDropdownOpen && (
                  <div className="absolute left-0 mt-2 w-40 rounded-xl border border-slate-100 bg-white p-2 shadow-xl dark:border-slate-800 dark:bg-slate-950">
                    {["English", "Telugu", "Hindi"].map((lang) => (
                      <button
                        key={lang}
                        onClick={() => { setSelectedLang(lang); setLangDropdownOpen(false); }}
                        className="w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-700 dark:text-slate-300"
                      >
                        {lang}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Standards dropdown Selection */}
              <div className="relative border-r border-slate-200 dark:border-slate-800 pr-5">
                <button
                  onClick={() => { setStandardsDropdownOpen(!standardsDropdownOpen); setClassDropdownOpen(false); setLangDropdownOpen(false); }}
                  className="flex items-center gap-1 rounded-full bg-slate-100 px-3.5 py-1.5 text-xs font-semibold text-slate-800 hover:bg-sky-50 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  Standard: <span className="text-sky-600 dark:text-sky-400 font-bold">{activeStandard || "Select"}</span>
                  <ChevronDown className="h-3 w-3" />
                </button>
                {standardsDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 max-h-80 overflow-y-auto rounded-xl border border-slate-100 bg-white p-2 shadow-xl dark:border-slate-800 dark:bg-slate-950">
                    <p className="px-3 py-1 text-[10px] uppercase tracking-widest font-bold text-slate-400 dark:text-slate-500">Pick Class Grade</p>
                    {standards.map((std) => (
                      <button
                        key={std}
                        onClick={() => handleStandardClick(std)}
                        className={`w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-slate-50 dark:hover:bg-slate-900 ${
                          activeStandard === std ? "bg-sky-50 text-sky-600 dark:bg-sky-950/40 dark:text-sky-400 font-semibold" : "text-slate-700 dark:text-slate-300"
                        }`}
                      >
                        {std}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <button 
                onClick={() => {
                  const facultyEl = document.getElementById("why-choose-us");
                  if (facultyEl) facultyEl.scrollIntoView({ behavior: "smooth" });
                }}
                className="text-sm font-medium text-slate-700 hover:text-sky-500 dark:text-slate-300 dark:hover:text-white"
              >
                Faculty
              </button>
            </div>
          ) : (
            /* Dashboard status indicator */
            <div className="hidden md:flex items-center gap-3">
              <span className="rounded-full bg-sky-100 dark:bg-sky-950/50 px-3.5 py-1 text-xs font-semibold text-sky-700 dark:text-sky-300">
                Logged in as: <strong className="capitalize">{currentRoleLabel} portal</strong>
              </span>
              <button 
                onClick={() => navigate("/")}
                className="text-xs font-semibold text-slate-500 hover:text-sky-500 dark:text-slate-400 dark:hover:text-white"
              >
                Go to Landing Page
              </button>
            </div>
          )}

          {/* Right menu actions */}
          <div className="flex items-center gap-3">
            
            {/* Dark Mode toggle */}
            <button
              onClick={toggleDarkMode}
              className="rounded-xl p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300 transition-colors"
              title="Toggle theme mode"
            >
              {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>

            {/* Quick Support Call Button */}
            <a 
              href="https://wa.me/6300227011"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-emerald-600 dark:border-slate-850 dark:bg-slate-950 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20"
            >
              <PhoneIncoming className="h-4 w-4" />
              <span>Admin: 6300227011</span>
            </a>

            {/* Auth Actions */}
            {isLanding ? (
              <div className="flex items-center gap-2">
                <button 
                  onClick={onOpenRegister}
                  className="hidden md:flex items-center gap-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 px-4 py-2 text-sm font-semibold text-slate-800 dark:text-slate-200 transition-all active:scale-95 shadow-sm"
                >
                  <UserPlus className="h-4 w-4 opacity-70" />
                  <span>Register</span>
                </button>
                <button
                  onClick={() => navigate("/login")}
                  className="flex items-center gap-1.5 rounded-xl bg-slate-900 hover:bg-slate-850 text-white dark:bg-sky-500 dark:hover:bg-sky-400 dark:text-slate-950 px-4.5 py-2.5 text-sm font-bold transition-all active:scale-95 shadow-md"
                >
                  <LogIn className="h-4 w-4" />
                  <span>Portal Login</span>
                </button>
              </div>
            ) : (
              <button
                onClick={() => navigate("/login")}
                className="flex items-center gap-1.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white px-4 py-2.5 text-sm font-bold transition-all active:scale-95 shadow-sm"
              >
                <LogOut className="h-4 w-4" />
                <span>Switch Portal / Log Out</span>
              </button>
            )}

            {/* Mobile Hamburger toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="rounded-xl p-2 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 lg:hidden"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer Slide */}
      {mobileMenuOpen && (
        <div className="lg:hidden w-full bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 px-4 py-4 space-y-4">
          <div className="flex flex-col gap-3">
            <button
              onClick={() => { navigate("/"); setMobileMenuOpen(false); }}
              className="w-full text-left font-semibold text-slate-900 dark:text-white py-2 text-sm border-b border-slate-100 dark:border-slate-900"
            >
              Home
            </button>

            {/* Dropdown in mobile for Standards */}
            <div className="py-2 border-b border-slate-100 dark:border-slate-900">
              <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">Standards (1st to 10th)</p>
              <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto pr-1">
                {standards.map((std) => (
                  <button
                    key={std}
                    onClick={() => handleStandardClick(std)}
                    className={`rounded-lg px-2.5 py-1.5 text-left text-xs ${
                      activeStandard === std ? "bg-sky-50 dark:bg-sky-950 border border-sky-400 text-sky-600 font-bold" : "bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300"
                    }`}
                  >
                    {std}
                  </button>
                ))}
              </div>
            </div>

            {/* Language Selection list */}
            <div className="py-2 border-b border-slate-100 dark:border-slate-900">
              <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">Pick Language</p>
              <div className="flex gap-2">
                {["English", "Telugu", "Hindi"].map((lang) => (
                  <button
                    key={lang}
                    onClick={() => { setSelectedLang(lang); }}
                    className={`px-3 py-1 text-xs rounded-full font-medium ${
                      selectedLang === lang ? "bg-indigo-600 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                    }`}
                  >
                    {lang}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => {
                setMobileMenuOpen(false);
                const facultyEl = document.getElementById("why-choose-us");
                if (facultyEl) facultyEl.scrollIntoView({ behavior: "smooth" });
              }}
              className="w-full text-left font-medium text-slate-700 dark:text-slate-300 py-2 text-sm border-b border-slate-100 dark:border-slate-900"
            >
              Faculty Details
            </button>

            <button
              onClick={() => {
                setMobileMenuOpen(false);
                const contactEl = document.getElementById("footer");
                if (contactEl) contactEl.scrollIntoView({ behavior: "smooth" });
              }}
              className="w-full text-left font-medium text-slate-700 dark:text-slate-300 py-2 text-sm border-b border-slate-100 dark:border-slate-900"
            >
              Contact Us (954239546)
            </button>

            {/* Quick Register option inside drawer */}
            <button
              onClick={() => { onOpenRegister(); setMobileMenuOpen(false); }}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-sky-500 text-slate-950 font-bold py-3 text-sm shadow-md"
            >
              <UserPlus className="h-4.5 w-4.5" />
              <span>Register New Member</span>
            </button>

            <button
              onClick={() => { navigate("/login"); setMobileMenuOpen(false); }}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-slate-900 text-white dark:bg-slate-800 dark:text-white font-bold py-3 text-sm shadow"
            >
              <LogIn className="h-4.5 w-4.5" />
              <span>Go to CRM Portals (Login)</span>
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
