/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { GraduationCap, Users, ShieldAlert, Notebook, Shield, Eye, EyeOff, Check, UserPlus } from "lucide-react";
import { apiClient } from "../services/apiClient";

interface LoginGatewayProps {
  onLoginSuccess: (
    role: "student" | "parent" | "tutor" | "admin",
    userId?: string
  ) => void;
  onOpenRegister: () => void;
}

export function LoginGateway({ onLoginSuccess, onOpenRegister }: LoginGatewayProps) {
  const [studentId, setStudentId] = useState("");
  const [parentEmail, setParentEmail] = useState("");
  const [parentPassword, setParentPassword] = useState("");
  const [tutorEmail, setTutorEmail] = useState("");
  const [tutorPassword, setTutorPassword] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");

  const [activeTab, setActiveTab] = useState<"student" | "parent" | "tutor" | "admin">("student");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleStudentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentId.trim()) {
      setErrorMessage("Please specify a valid Student Identifier ID.");
      return;
    }
    try {
      const response = await apiClient.auth.loginStudent(studentId.trim().toUpperCase());
      apiClient.setAuthToken(response.token);
      setErrorMessage("");
      onLoginSuccess("student", studentId.trim().toUpperCase());
    } catch (error: any) {
      setErrorMessage(error.message || "Student login failed.");
    }
  };

  const handleParentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!parentEmail.trim() || !parentPassword.trim()) {
      setErrorMessage("Email and Password are required.");
      return;
    }
    try {
      const response = await apiClient.auth.loginParent(parentEmail.trim().toLowerCase(), parentPassword);
      apiClient.setAuthToken(response.token);
      setErrorMessage("");
      onLoginSuccess("parent", parentEmail.trim().toLowerCase());
    } catch (error: any) {
      setErrorMessage(error.message || "Invalid credentials. Please check your email and password.");
    }
  };

  const handleTutorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tutorEmail.trim() || !tutorPassword.trim()) {
      setErrorMessage("Email and Password are required.");
      return;
    }
    try {
      const response = await apiClient.auth.loginTutor(tutorEmail.trim().toLowerCase(), tutorPassword);
      apiClient.setAuthToken(response.token);
      if (response.tutorId) {
        setErrorMessage("");
        onLoginSuccess("tutor", response.tutorId);
      } else {
        setErrorMessage("Tutor profile not found.");
      }
    } catch (error: any) {
      setErrorMessage(error.message || "Invalid credentials. Please check your email and password.");
    }
  };

  const handleAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminEmail.trim() || !adminPassword.trim()) {
      setErrorMessage("Email and Password are required.");
      return;
    }
    try {
      const response = await apiClient.auth.loginAdmin(adminEmail.trim().toLowerCase(), adminPassword);
      apiClient.setAuthToken(response.token);
      setErrorMessage("");
      onLoginSuccess("admin");
    } catch (error: any) {
      setErrorMessage(error.message || "Invalid administrator credentials.");
    }
  };

  return (
    <div className="relative min-h-[60vh] bg-gradient-to-tr from-sky-50 to-indigo-50 dark:from-slate-950 dark:to-slate-900 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
      <div className="absolute top-10 left-10 w-72 h-72 bg-sky-300/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="mx-auto max-w-5xl w-full z-10">
        <div className="text-center mb-10 space-y-3">
          <span className="text-xs uppercase font-extrabold tracking-widest text-sky-600 dark:text-sky-400 bg-sky-100 dark:bg-sky-950/50 px-3.5 py-1.5 rounded-full">
            Authorized Personnel Access Only
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white">Academic Gateway</h1>
          <p className="text-slate-600 dark:text-slate-350 max-w-2xl mx-auto text-xs sm:text-sm">
            Select your portal role below to manage coursework, schedules, and grades.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { id: "student", label: "Student Login", desc: "Enter Institute ID", icon: GraduationCap, color: "text-sky-600 dark:text-sky-400" },
            { id: "parent", label: "Parent Login", desc: "Progress & Fees", icon: Users, color: "text-indigo-600 dark:text-indigo-400" },
            { id: "tutor", label: "Tutor Login", desc: "Grades & Attendance", icon: Notebook, color: "text-emerald-500" },
            { id: "admin", label: "Admin Login", desc: "Center Control", icon: Shield, color: "text-amber-500" },
          ].map((role) => {
            const Icon = role.icon;
            const isActive = activeTab === role.id;
            return (
              <button
                key={role.id}
                type="button"
                onClick={() => { setActiveTab(role.id as any); setErrorMessage(""); }}
                className={`relative flex flex-col items-center text-center p-5 rounded-2xl border transition-all hover:scale-[1.02] shadow-sm ${isActive
                  ? "bg-white border-sky-400 ring-2 ring-sky-400/20 dark:bg-slate-900 dark:border-sky-500"
                  : "bg-white/60 border-slate-200/60 dark:bg-slate-950/40 dark:border-slate-800"
                  }`}
              >
                {isActive && (
                  <span className="absolute top-2 right-2 flex h-5 w-5 items-center justify-center rounded-full bg-sky-500 text-white">
                    <Check className="h-3 w-3 stroke-[3]" />
                  </span>
                )}
                <span className={`p-2 rounded-xl bg-slate-50 dark:bg-slate-900 mb-2 ${role.color}`}>
                  <Icon className="h-6 w-6" />
                </span>
                <span className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white leading-none">{role.label}</span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">{role.desc}</span>
              </button>
            );
          })}
        </div>

        <div className="max-w-md mx-auto bg-white dark:bg-slate-950 rounded-2xl p-6 sm:p-8 shadow-xl border border-slate-100 dark:border-slate-800">
          {errorMessage && (
            <div className="mb-4 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 rounded-lg p-3 text-xs text-rose-600 dark:text-rose-400 font-bold">
              {errorMessage}
            </div>
          )}

          {activeTab === "student" && (
            <form onSubmit={handleStudentSubmit} className="space-y-4">
              <div className="text-left space-y-1">
                <h3 className="text-lg font-black text-slate-900 dark:text-white">Student Login</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Enter your unique student ID from the academy registrar.</p>
              </div>
              <div className="space-y-1.5 text-left">
                <label className="text-xs font-black text-slate-700 dark:text-slate-300">Student ID</label>
                <input
                  type="text"
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  placeholder="E.g. ST-101"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm font-semibold text-slate-950 dark:text-white focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none"
                  required
                />
              </div>
              <button type="submit" className="w-full bg-slate-900 hover:bg-slate-850 dark:bg-sky-500 dark:hover:bg-sky-400 text-white dark:text-slate-950 font-black py-3.5 rounded-xl text-sm transition-all shadow-md active:scale-95">
                Log In to Student Dashboard
              </button>
            </form>
          )}

          {activeTab === "parent" && (
            <form onSubmit={handleParentSubmit} className="space-y-4 text-left">
              <div className="space-y-1">
                <h3 className="text-lg font-black text-slate-900 dark:text-white">Parent Portal Login</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Use the email and password from your registration.</p>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-700 dark:text-slate-300">Email Address</label>
                <input
                  type="email"
                  value={parentEmail}
                  onChange={(e) => setParentEmail(e.target.value)}
                  placeholder="example@gmail.com"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm font-semibold text-slate-950 dark:text-white focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none"
                  required
                />
              </div>
              <div className="space-y-1.5 relative">
                <label className="text-xs font-black text-slate-700 dark:text-slate-300">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={parentPassword}
                    onChange={(e) => setParentPassword(e.target.value)}
                    placeholder="example"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none"
                    required
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <div className="flex flex-col gap-2 pt-2">
                <button type="submit" className="w-full bg-slate-900 hover:bg-slate-850 dark:bg-sky-500 dark:hover:bg-sky-400 text-white dark:text-slate-950 font-black py-3.5 rounded-xl text-sm transition-all shadow-md active:scale-95">
                  Log In to Parent Centre
                </button>
                <button type="button" onClick={onOpenRegister} className="w-full border-2 border-slate-200 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-900 text-slate-800 dark:text-white font-bold py-3 rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5">
                  <UserPlus className="h-4 w-4" />
                  <span>Register for a New Account</span>
                </button>
              </div>
            </form>
          )}

          {activeTab === "tutor" && (
            <form onSubmit={handleTutorSubmit} className="space-y-4 text-left">
              <div className="space-y-1">
                <h3 className="text-lg font-black text-slate-900 dark:text-white">Tutor Login</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Enter your registered academy email and password.</p>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-700 dark:text-slate-300">Email</label>
                <input
                  type="email"
                  value={tutorEmail}
                  onChange={(e) => setTutorEmail(e.target.value)}
                  placeholder="example@gmail.com"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-700 dark:text-slate-300">Password</label>
                <input
                  type="password"
                  value={tutorPassword}
                  onChange={(e) => setTutorPassword(e.target.value)}
                  placeholder="example"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none"
                  required
                />
              </div>
              <button type="submit" className="w-full bg-slate-900 hover:bg-slate-850 dark:bg-sky-500 dark:hover:bg-sky-400 text-white dark:text-slate-950 font-black py-3.5 rounded-xl text-sm transition-all shadow-md active:scale-95">
                Log In to Instructors Dashboard
              </button>
            </form>
          )}

          {activeTab === "admin" && (
            <form onSubmit={handleAdminSubmit} className="space-y-4 text-left">
              <div className="space-y-1">
                <h3 className="text-lg font-black text-slate-900 dark:text-white">Admin Management</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Administrator access for center management.</p>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-700 dark:text-slate-300">Email</label>
                <input
                  type="email"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  placeholder="example@gmail.com"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-700 dark:text-slate-300">Password</label>
                <input
                  type="password"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  placeholder="example"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none"
                  required
                />
              </div>
              <button type="submit" className="w-full bg-slate-900 hover:bg-slate-850 dark:bg-sky-500 dark:hover:bg-sky-400 text-white dark:text-slate-950 font-black py-3.5 rounded-xl text-sm transition-all shadow-md active:scale-95">
                Log In to Administrator Portal
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
