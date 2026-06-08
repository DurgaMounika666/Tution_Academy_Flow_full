/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { BookOpen, Menu, X, ChevronDown, UserPlus, LogIn, ArrowLeft, LogOut } from "lucide-react";
import { useCatalog } from "../context/CatalogContext";
import { useLanguage } from "../context/LanguageContext";

interface NavbarProps {
  onOpenRegister: () => void;
  activeStandard: string;
  onSelectStandard: (std: string) => void;
  loggedInRole?: "student" | "parent" | "tutor" | "admin" | null;
  onLogout?: () => void;
}

export function Navbar({ onOpenRegister, activeStandard, onSelectStandard, loggedInRole = null, onLogout }: NavbarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { language, setLanguage, t } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const [classDropdownOpen, setClassDropdownOpen] = useState(false);

  const [selectedClassType, setSelectedClassType] = useState("Online & Offline");
  const navbarRef = useRef<HTMLDivElement>(null);

  const { standards } = useCatalog();

  // Derive current role from URL path
  const pathSegment = location.pathname.split("/")[1] || "landing";
  const isLanding = pathSegment === "" || pathSegment === "landing";
  const isDashboard = ["student", "parent", "tutor", "admin"].includes(pathSegment);
  const currentRoleLabel = isDashboard ? pathSegment : isLanding ? "landing" : pathSegment;

  const handleStandardClick = (std: string) => {
    onSelectStandard(std);
    setMobileMenuOpen(false);
    const heroSection = document.getElementById("hero-finder");
    if (heroSection) {
      heroSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleClassTypeSelect = (label: string, route: string) => {
    setSelectedClassType(label);
    setClassDropdownOpen(false);
    setLangDropdownOpen(false);
    setMobileMenuOpen(false);
    navigate(route);
  };

  useEffect(() => {
    const handleDocumentClick = (event: MouseEvent) => {
      if (navbarRef.current && !navbarRef.current.contains(event.target as Node)) {
        setClassDropdownOpen(false);
        setLangDropdownOpen(false);
      }
    };

    if (classDropdownOpen || langDropdownOpen) {
      document.addEventListener("mousedown", handleDocumentClick);
    }

    return () => {
      document.removeEventListener("mousedown", handleDocumentClick);
    };
  }, [classDropdownOpen, langDropdownOpen]);

  useEffect(() => {
    setClassDropdownOpen(false);
    setLangDropdownOpen(false);
  }, [location.pathname]);

  const isLoginPage = location.pathname === "/login";

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 w-full border-b border-slate-200/80 bg-white/95 shadow-sm backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-950/90 transition-colors duration-300">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div ref={navbarRef} className="flex h-16 items-center justify-between">

          {/* Logo Brand */}
          <div className="flex items-center gap-3">
            {isLoginPage && (
              <button
                onClick={() => navigate("/")}
                className="flex items-center justify-center h-9 w-9 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:border-sky-300 hover:text-sky-500 text-slate-600 dark:text-slate-300 transition-all active:scale-95 shadow-sm"
                title="Back to Home"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
            )}
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate("/")}>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 shadow-md">
                <BookOpen className="h-5 w-5 text-white" />
              </div>
              <div>
                <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                  Academy <span className="text-sky-500">Flow</span>
                </span>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Tuitions for next generations</p>
              </div>
            </div>
          </div>

          {/* Desktop Navigation */}
          {isLanding ? (
            <div className="hidden lg:flex items-center gap-6">
              <button
                onClick={() => navigate("/")}
                className="text-sm font-semibold text-slate-700 transition hover:text-sky-500 dark:text-slate-200 dark:hover:text-sky-400"
              >
                {t("home")}
              </button>

              {/* Class type option dropdown */}
              <div className="relative">
                <button
                  onClick={() => { setClassDropdownOpen(!classDropdownOpen); setLangDropdownOpen(false); }}
                  className="flex items-center gap-3 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:border-sky-300 hover:text-sky-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300 dark:hover:text-white"
                >
                  <span>{t("modeOfClass")}</span>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-semibold text-slate-800 dark:bg-slate-800 dark:text-slate-200">
                    {selectedClassType === "Online Only" ? t("onlineOnly") : selectedClassType === "Offline Only" ? t("offlineOnly") : t("onlineOffline")}
                  </span>
                  <ChevronDown className="h-4 w-4 opacity-70" />
                </button>
                {classDropdownOpen && (
                  <div className="absolute left-0 z-20 mt-2 w-56 rounded-3xl border border-slate-100 bg-white p-2 shadow-xl dark:border-slate-800 dark:bg-slate-950">
                    {[
                      { label: "Online Only", key: "onlineOnly", route: "/classes/online-only" },
                      { label: "Offline Only", key: "offlineOnly", route: "/classes/offline-only" },
                      { label: "Online & Offline", key: "onlineOffline", route: "/classes/online-offline" },
                    ].map(({ label, key, route }) => (
                      <button
                        key={label}
                        onClick={() => handleClassTypeSelect(label, route)}
                        className="w-full rounded-2xl px-4 py-2 text-left text-slate-700 transition hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-900"
                      >
                        {t(key)}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* Dashboard status indicator */
            <div className="hidden md:flex items-center gap-3">
              <span className="rounded-full bg-sky-100 dark:bg-sky-950/50 px-3.5 py-1 text-xs font-semibold text-sky-700 dark:text-sky-300">
                {t("loggedInAs")} <strong className="capitalize">{currentRoleLabel} portal</strong>
              </span>
              <button
                onClick={() => navigate("/")}
                className="text-xs font-semibold text-slate-500 hover:text-sky-500 dark:text-slate-400 dark:hover:text-white"
              >
                {t("goToLanding")}
              </button>
            </div>
          )}

          {/* Right menu actions */}
          <div className="flex items-center gap-3">

            {/* Auth Actions */}
            {isLanding ? (
              <div className="flex items-center gap-2">
                {/* Translate Dropdown Button (Left of Register) */}
                <div className="relative">
                  <button
                    onClick={() => { setLangDropdownOpen(!langDropdownOpen); setClassDropdownOpen(false); }}
                    className="flex items-center justify-center p-2 rounded-xl border border-slate-250 bg-white hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-slate-705 transition-all active:scale-95 shadow-sm gap-1.5"
                    title={t("pickLanguage")}
                  >
                    <img src="/translate.png" alt="Translate" className="h-5 w-5 object-contain" />
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-200 hidden sm:inline">{language}</span>
                    <ChevronDown className="h-3 w-3 opacity-60" />
                  </button>
                  {langDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-40 rounded-2xl border border-slate-150 bg-white p-2 shadow-xl dark:border-slate-800 dark:bg-slate-900 z-50">
                      {(["English", "Telugu", "Hindi"] as const).map((lang) => (
                        <button
                          key={lang}
                          onClick={() => {
                            setLanguage(lang);
                            setLangDropdownOpen(false);
                          }}
                          className={`w-full rounded-xl px-3 py-2 text-left text-sm font-semibold transition-all duration-150 flex items-center justify-between ${
                            language === lang
                              ? "bg-sky-50 text-sky-600 dark:bg-sky-950/40 dark:text-sky-400"
                              : "hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                          }`}
                        >
                          <span>{lang}</span>
                          {language === lang && <span className="h-1.5 w-1.5 rounded-full bg-sky-500" />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {loggedInRole ? (
                  <button
                    onClick={() => navigate(`/${loggedInRole}`)}
                    className="flex items-center gap-1.5 rounded-xl bg-slate-900 hover:bg-slate-850 text-white dark:bg-sky-500 dark:hover:bg-sky-400 dark:text-slate-950 px-4.5 py-2.5 text-sm font-bold transition-all active:scale-95 shadow-md"
                  >
                    <LogIn className="h-4 w-4" />
                    <span>{t("goToDashboard")}</span>
                  </button>
                ) : (
                  <>
                    <button
                      onClick={onOpenRegister}
                      className="hidden md:flex items-center gap-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 px-4 py-2 text-sm font-semibold text-slate-800 dark:text-slate-200 transition-all active:scale-95 shadow-sm"
                    >
                      <UserPlus className="h-4 w-4 opacity-70" />
                      <span>{t("register")}</span>
                    </button>
                    <button
                      onClick={() => navigate("/login")}
                      className="flex items-center gap-1.5 rounded-xl bg-slate-900 hover:bg-slate-850 text-white dark:bg-sky-500 dark:hover:bg-sky-400 dark:text-slate-950 px-4.5 py-2.5 text-sm font-bold transition-all active:scale-95 shadow-md"
                    >
                      <LogIn className="h-4 w-4" />
                      <span>{t("portalLogin")}</span>
                    </button>
                  </>
                )}
              </div>
            ) : null}

            {!isLanding && (
              <div className="relative">
                <button
                  onClick={() => { setLangDropdownOpen(!langDropdownOpen); setClassDropdownOpen(false); }}
                  className="flex items-center justify-center p-2 rounded-xl border border-slate-250 bg-white hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-slate-705 transition-all active:scale-95 shadow-sm gap-1.5"
                  title={t("pickLanguage")}
                >
                  <img src="/translate.png" alt="Translate" className="h-5 w-5 object-contain" />
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-200 hidden sm:inline">{language}</span>
                  <ChevronDown className="h-3 w-3 opacity-60" />
                </button>
                {langDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-40 rounded-2xl border border-slate-150 bg-white p-2 shadow-xl dark:border-slate-800 dark:bg-slate-900 z-50">
                    {(["English", "Telugu", "Hindi"] as const).map((lang) => (
                      <button
                        key={lang}
                        onClick={() => {
                          setLanguage(lang);
                          setLangDropdownOpen(false);
                        }}
                        className={`w-full rounded-xl px-3 py-2 text-left text-sm font-semibold transition-all duration-150 flex items-center justify-between ${
                          language === lang
                            ? "bg-sky-50 text-sky-600 dark:bg-sky-950/40 dark:text-sky-400"
                            : "hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                        }`}
                      >
                        <span>{lang}</span>
                        {language === lang && <span className="h-1.5 w-1.5 rounded-full bg-sky-500" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Logout button for dashboard pages */}
            {!isLanding && onLogout && (
              <button
                onClick={onLogout}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/30 dark:hover:bg-rose-950/50 text-rose-600 dark:text-rose-400 font-bold text-xs border border-rose-200 dark:border-rose-800 transition-colors"
                title="Logout"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Logout</span>
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
              {t("home")}
            </button>

            <div className="py-3 border-b border-slate-100 dark:border-slate-900">
              <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">{t("modeOfClass")}</p>
              <div className="space-y-2">
                {[
                  { label: "Online Only", key: "onlineOnly", route: "/classes/online-only" },
                  { label: "Offline Only", key: "offlineOnly", route: "/classes/offline-only" },
                  { label: "Online & Offline", key: "onlineOffline", route: "/classes/online-offline" },
                ].map((item) => (
                  <button
                    key={item.label}
                    onClick={() => handleClassTypeSelect(item.label, item.route)}
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2 text-left text-sm font-medium text-slate-700 hover:border-sky-300 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-950"
                  >
                    {t(item.key)}
                  </button>
                ))}
              </div>
            </div>

            {/* Dropdown in mobile for Standards */}
            <div className="py-2 border-b border-slate-100 dark:border-slate-900">
              <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">Standards (1st to 10th)</p>
              <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto pr-1">
                {standards.map((std) => (
                  <button
                    key={std}
                    onClick={() => handleStandardClick(std)}
                    className={`rounded-lg px-2.5 py-1.5 text-left text-xs ${activeStandard === std ? "bg-sky-50 dark:bg-sky-950 border border-sky-400 text-sky-600 font-bold" : "bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300"
                      }`}
                  >
                    {std}
                  </button>
                ))}
              </div>
            </div>

            {/* Language Selection list */}
            <div className="py-2 border-b border-slate-100 dark:border-slate-900">
              <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">{t("pickLanguage")}</p>
              <div className="flex gap-2">
                {["English", "Telugu", "Hindi"].map((lang) => (
                  <button
                    key={lang}
                    onClick={() => { setLanguage(lang as any); }}
                    className={`px-3 py-1 text-xs rounded-full font-medium ${language === lang ? "bg-indigo-600 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
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
                const contactEl = document.getElementById("footer");
                if (contactEl) contactEl.scrollIntoView({ behavior: "smooth" });
              }}
              className="w-full text-left font-medium text-slate-700 dark:text-slate-300 py-2 text-sm border-b border-slate-100 dark:border-slate-900"
            >
              {t("contactUs")} (954239546)
            </button>

            {loggedInRole ? (
              <button
                onClick={() => { navigate(`/${loggedInRole}`); setMobileMenuOpen(false); }}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-slate-900 text-white dark:bg-slate-800 dark:text-white font-bold py-3 text-sm shadow"
              >
                <LogIn className="h-4.5 w-4.5" />
                <span>{t("goToDashboard")}</span>
              </button>
            ) : (
              <>
                {/* Quick Register option inside drawer */}
                <button
                  onClick={() => { onOpenRegister(); setMobileMenuOpen(false); }}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-sky-500 text-slate-950 font-bold py-3 text-sm shadow-md"
                >
                  <UserPlus className="h-4.5 w-4.5" />
                  <span>{t("register")}</span>
                </button>

                <button
                  onClick={() => { navigate("/login"); setMobileMenuOpen(false); }}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-slate-900 text-white dark:bg-slate-800 dark:text-white font-bold py-3 text-sm shadow"
                >
                  <LogIn className="h-4.5 w-4.5" />
                  <span>{t("portalLogin")}</span>
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

