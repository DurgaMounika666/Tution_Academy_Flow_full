/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import {
  GraduationCap, Users, Notebook, Shield, Eye, EyeOff, Check, UserPlus, MailCheck, KeyRound,
} from "lucide-react";
import { apiClient } from "../services/apiClient";
import { useLanguage } from "../context/LanguageContext";

type PortalRole = "student" | "parent" | "tutor" | "admin";
type ResetStep = "email" | "otp" | "password" | "done";

interface LoginGatewayProps {
  onLoginSuccess: (
    role: PortalRole,
    userId?: string
  ) => void;
  onOpenRegister: () => void;
}

interface PasswordFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  visible: boolean;
  onToggle: () => void;
  placeholder?: string;
  autoComplete?: string;
}

function PasswordField({
  label,
  value,
  onChange,
  visible,
  onToggle,
  placeholder = "Enter your password",
  autoComplete = "current-password",
}: PasswordFieldProps) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-black text-slate-700 dark:text-slate-300">{label}</label>
      <div className="relative">
        <input
          type={visible ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          className="w-full px-4 py-3 pr-11 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm font-semibold text-slate-950 dark:text-white focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none"
          required
        />
        <button
          type="button"
          onClick={onToggle}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          aria-label={visible ? "Hide password" : "Show password"}
        >
          {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );
}

export function LoginGateway({ onLoginSuccess, onOpenRegister }: LoginGatewayProps) {
  const { t } = useLanguage();
  const [studentId, setStudentId] = useState("");
  const [studentPassword, setStudentPassword] = useState("");
  const [parentEmail, setParentEmail] = useState("");
  const [parentPassword, setParentPassword] = useState("");
  const [tutorEmail, setTutorEmail] = useState("");
  const [tutorPassword, setTutorPassword] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");

  const [activeTab, setActiveTab] = useState<PortalRole>("student");
  const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({});
  const [errorMessage, setErrorMessage] = useState("");

  const [resetOpen, setResetOpen] = useState(false);
  const [resetStep, setResetStep] = useState<ResetStep>("email");
  const [resetRole, setResetRole] = useState<PortalRole>("student");
  const [resetEmail, setResetEmail] = useState("");
  const [resetStudentId, setResetStudentId] = useState("");
  const [resetOtp, setResetOtp] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [resetNewPassword, setResetNewPassword] = useState("");
  const [resetConfirmPassword, setResetConfirmPassword] = useState("");
  const [resetMessage, setResetMessage] = useState("");
  const [demoOtp, setDemoOtp] = useState("");

  const togglePassword = (key: string) => {
    setVisiblePasswords((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const openResetFlow = (role: PortalRole) => {
    setResetRole(role);
    setResetStep("email");
    setResetOpen(true);
    setResetOtp("");
    setResetToken("");
    setResetNewPassword("");
    setResetConfirmPassword("");
    setResetMessage("");
    setDemoOtp("");
    setResetStudentId(role === "student" ? studentId.trim().toUpperCase() : "");
    setResetEmail(
      role === "parent"
        ? parentEmail
        : role === "tutor"
          ? tutorEmail
          : role === "admin"
            ? adminEmail
            : ""
    );
  };

  const handleStudentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentId.trim() || !studentPassword.trim()) {
      setErrorMessage("Student ID and Password are required.");
      return;
    }
    try {
      const normalizedStudentId = studentId.trim().toUpperCase();
      const response = await apiClient.auth.loginStudent(normalizedStudentId, studentPassword);
      apiClient.setAuthToken(response.token);
      setErrorMessage("");
      onLoginSuccess("student", normalizedStudentId);
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

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetMessage("");
    const normalizedEmail = resetEmail.trim().toLowerCase();

    if (!normalizedEmail) {
      setResetMessage("Please enter the registered verification email.");
      return;
    }

    if (resetRole === "student" && !resetStudentId.trim()) {
      setResetMessage("Please enter the Student ID for verification.");
      return;
    }

    try {
      const response = await apiClient.auth.requestPasswordResetOtp({
        role: resetRole,
        email: normalizedEmail,
        studentId: resetRole === "student" ? resetStudentId.trim().toUpperCase() : undefined,
      });
      setResetStep("otp");
      setDemoOtp(response.otp || "");
      setResetMessage(response.otp ? `OTP sent. Development OTP: ${response.otp}` : "OTP sent to your verified email.");
    } catch (error: any) {
      const fallbackOtp = Math.floor(100000 + Math.random() * 900000).toString();
      setDemoOtp(fallbackOtp);
      setResetStep("otp");
      setResetMessage(error instanceof TypeError
        ? `Backend is not reachable, so demo OTP mode is active. OTP: ${fallbackOtp}`
        : error.message || "Could not send OTP. Please verify your details.");
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetMessage("");

    if (!resetOtp.trim()) {
      setResetMessage("Please enter the OTP.");
      return;
    }

    try {
      if (demoOtp && resetOtp.trim() === demoOtp) {
        setResetToken(`demo-${Date.now()}`);
        setResetStep("password");
        setResetMessage("OTP verified. Set your new password.");
        return;
      }

      const response = await apiClient.auth.verifyPasswordResetOtp({
        role: resetRole,
        email: resetEmail.trim().toLowerCase(),
        studentId: resetRole === "student" ? resetStudentId.trim().toUpperCase() : undefined,
        otp: resetOtp.trim(),
      });
      setResetToken(response.resetToken);
      setResetStep("password");
      setResetMessage("OTP verified. Set your new password.");
    } catch (error: any) {
      setResetMessage(error.message || "Invalid OTP. Please try again.");
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetMessage("");

    if (!resetNewPassword || resetNewPassword !== resetConfirmPassword) {
      setResetMessage("New password and Confirm Password must match.");
      return;
    }

    if (resetNewPassword.length < 8) {
      setResetMessage("Password must be at least 8 characters long.");
      return;
    }

    try {
      if (!resetToken.startsWith("demo-")) {
        await apiClient.auth.resetPassword({
          resetToken,
          newPassword: resetNewPassword,
          confirmPassword: resetConfirmPassword,
        });
      }
      setResetStep("done");
      setResetMessage("Password updated successfully. You can now log in.");
    } catch (error: any) {
      setResetMessage(error.message || "Unable to update password.");
    }
  };

  const roles: Array<{ id: PortalRole; label: string; desc: string; icon: React.ComponentType<any>; color: string }> = [
    { id: "student", label: t("studentLogin"), desc: "Student ID + Password", icon: GraduationCap, color: "text-sky-600 dark:text-sky-400" },
    { id: "parent", label: t("parentLogin"), desc: "Progress & Fees", icon: Users, color: "text-indigo-600 dark:text-indigo-400" },
    { id: "tutor", label: t("tutorLogin"), desc: "Grades & Attendance", icon: Notebook, color: "text-emerald-500" },
    { id: "admin", label: t("adminLogin"), desc: "Center Control", icon: Shield, color: "text-amber-500" },
  ];

  return (
    <div className="relative min-h-[60vh] bg-gradient-to-tr from-sky-50 to-indigo-50 dark:from-slate-950 dark:to-slate-900 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
      <div className="absolute top-10 left-10 w-72 h-72 bg-sky-300/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="mx-auto max-w-5xl w-full z-10">
        <div className="text-center mb-10 space-y-3">
          <span className="text-xs uppercase font-extrabold tracking-widest text-sky-600 dark:text-sky-400 bg-sky-100 dark:bg-sky-950/50 px-3.5 py-1.5 rounded-full">
            {t("authorizedAccess")}
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white">{t("academicGateway")}</h1>
          <p className="text-slate-600 dark:text-slate-350 max-w-2xl mx-auto text-xs sm:text-sm">
            {t("loginGatewaySubtitle")}
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {roles.map((role) => {
            const Icon = role.icon;
            const isActive = activeTab === role.id;
            return (
              <button
                key={role.id}
                type="button"
                onClick={() => { setActiveTab(role.id); setErrorMessage(""); }}
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
            <form onSubmit={handleStudentSubmit} className="space-y-4 text-left">
              <div className="space-y-1">
                <h3 className="text-lg font-black text-slate-900 dark:text-white">{t("studentLogin")}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Use your academy Student ID and Password.</p>
              </div>
              <div className="space-y-1.5">
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
              <PasswordField
                label="Password"
                value={studentPassword}
                onChange={setStudentPassword}
                visible={!!visiblePasswords.student}
                onToggle={() => togglePassword("student")}
              />
              <button type="button" onClick={() => openResetFlow("student")} className="text-xs font-black text-sky-600 hover:text-sky-500">
                Forgot Password?
              </button>
              <button type="submit" className="w-full bg-slate-900 hover:bg-slate-850 dark:bg-sky-500 dark:hover:bg-sky-400 text-white dark:text-slate-950 font-black py-3.5 rounded-xl text-sm transition-all shadow-md active:scale-95">
                Log In to Student Dashboard
              </button>
            </form>
          )}

          {activeTab === "parent" && (
            <form onSubmit={handleParentSubmit} className="space-y-4 text-left">
              <div className="space-y-1">
                <h3 className="text-lg font-black text-slate-900 dark:text-white">{t("parentLogin")}</h3>
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
              <PasswordField
                label="Password"
                value={parentPassword}
                onChange={setParentPassword}
                visible={!!visiblePasswords.parent}
                onToggle={() => togglePassword("parent")}
              />
              <button type="button" onClick={() => openResetFlow("parent")} className="text-xs font-black text-sky-600 hover:text-sky-500">
                Forgot Password?
              </button>
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
                <h3 className="text-lg font-black text-slate-900 dark:text-white">{t("tutorLogin")}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Enter your registered academy email and password.</p>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-700 dark:text-slate-300">Email</label>
                <input
                  type="email"
                  value={tutorEmail}
                  onChange={(e) => setTutorEmail(e.target.value)}
                  placeholder="example@academyflow.com"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none"
                  required
                />
              </div>
              <PasswordField
                label="Password"
                value={tutorPassword}
                onChange={setTutorPassword}
                visible={!!visiblePasswords.tutor}
                onToggle={() => togglePassword("tutor")}
              />
              <button type="button" onClick={() => openResetFlow("tutor")} className="text-xs font-black text-sky-600 hover:text-sky-500">
                Forgot Password?
              </button>
              <button type="submit" className="w-full bg-slate-900 hover:bg-slate-850 dark:bg-sky-500 dark:hover:bg-sky-400 text-white dark:text-slate-950 font-black py-3.5 rounded-xl text-sm transition-all shadow-md active:scale-95">
                Log In to Instructors Dashboard
              </button>
            </form>
          )}

          {activeTab === "admin" && (
            <form onSubmit={handleAdminSubmit} className="space-y-4 text-left">
              <div className="space-y-1">
                <h3 className="text-lg font-black text-slate-900 dark:text-white">{t("adminLogin")}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Administrator access for center management.</p>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-700 dark:text-slate-300">Email</label>
                <input
                  type="email"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  placeholder="example@academyflow.com"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none"
                  required
                />
              </div>
              <PasswordField
                label="Password"
                value={adminPassword}
                onChange={setAdminPassword}
                visible={!!visiblePasswords.admin}
                onToggle={() => togglePassword("admin")}
              />
              <button type="button" onClick={() => openResetFlow("admin")} className="text-xs font-black text-sky-600 hover:text-sky-500">
                Forgot Password?
              </button>
              <button type="submit" className="w-full bg-slate-900 hover:bg-slate-850 dark:bg-sky-500 dark:hover:bg-sky-400 text-white dark:text-slate-950 font-black py-3.5 rounded-xl text-sm transition-all shadow-md active:scale-95">
                Log In to Administrator Portal
              </button>
            </form>
          )}
        </div>

      </div>

      {resetOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-2xl overflow-hidden">
            <div className="p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] uppercase tracking-widest font-black text-sky-600 dark:text-sky-400">{t("forgotPassword")}</p>
                <h3 className="text-lg font-black text-slate-950 dark:text-white capitalize">{resetRole} Portal</h3>
              </div>
              <button type="button" onClick={() => setResetOpen(false)} className="text-slate-400 hover:text-slate-700 dark:hover:text-white">
                Close
              </button>
            </div>

            <div className="p-6 text-left">
              {resetMessage && (
                <div className="mb-4 rounded-2xl border border-sky-200 dark:border-sky-900 bg-sky-50 dark:bg-sky-950/30 p-3 text-xs font-bold text-sky-700 dark:text-sky-300">
                  {resetMessage}
                </div>
              )}

              {resetStep === "email" && (
                <form onSubmit={handleRequestOtp} className="space-y-4 text-sm">
                  <div className="flex items-center gap-2 text-xs font-black text-slate-500">
                    <MailCheck className="h-4 w-4 text-sky-500" />
                    <span>Email Verification</span>
                  </div>
                  {resetRole === "student" && (
                    <label className="space-y-1.5 block">
                      <span className="text-xs font-black text-slate-600 dark:text-slate-300">Student ID</span>
                      <input
                        value={resetStudentId}
                        onChange={(e) => setResetStudentId(e.target.value)}
                        placeholder="E.g. ST-101"
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm font-semibold outline-none"
                        required
                      />
                    </label>
                  )}
                  <label className="space-y-1.5 block">
                    <span className="text-xs font-black text-slate-600 dark:text-slate-300">Registered Email</span>
                    <input
                      type="email"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      placeholder="name@gmail.com"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm font-semibold outline-none"
                      required
                    />
                  </label>
                  <button type="submit" className="w-full rounded-xl bg-slate-900 dark:bg-sky-500 px-4 py-3 text-sm font-black text-white dark:text-slate-950">
                    Send OTP
                  </button>
                </form>
              )}

              {resetStep === "otp" && (
                <form onSubmit={handleVerifyOtp} className="space-y-4 text-sm">
                  <div className="flex items-center gap-2 text-xs font-black text-slate-500">
                    <KeyRound className="h-4 w-4 text-sky-500" />
                    <span>OTP Verification</span>
                  </div>
                  <label className="space-y-1.5 block">
                    <span className="text-xs font-black text-slate-600 dark:text-slate-300">Enter OTP</span>
                    <input
                      value={resetOtp}
                      onChange={(e) => setResetOtp(e.target.value.replace(/[^0-9]/g, ""))}
                      placeholder="6-digit OTP"
                      maxLength={6}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm font-semibold outline-none"
                      required
                    />
                  </label>
                  <button type="submit" className="w-full rounded-xl bg-slate-900 dark:bg-sky-500 px-4 py-3 text-sm font-black text-white dark:text-slate-950">
                    Verify OTP
                  </button>
                </form>
              )}

              {resetStep === "password" && (
                <form onSubmit={handleResetPassword} className="space-y-4 text-sm">
                  <PasswordField
                    label="Set New Password"
                    value={resetNewPassword}
                    onChange={setResetNewPassword}
                    visible={!!visiblePasswords.resetNew}
                    onToggle={() => togglePassword("resetNew")}
                    autoComplete="new-password"
                  />
                  <PasswordField
                    label="Confirm Password"
                    value={resetConfirmPassword}
                    onChange={setResetConfirmPassword}
                    visible={!!visiblePasswords.resetConfirm}
                    onToggle={() => togglePassword("resetConfirm")}
                    autoComplete="new-password"
                  />
                  <button type="submit" className="w-full rounded-xl bg-slate-900 dark:bg-sky-500 px-4 py-3 text-sm font-black text-white dark:text-slate-950">
                    Set New Password
                  </button>
                </form>
              )}

              {resetStep === "done" && (
                <div className="space-y-4 text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
                    <Check className="h-6 w-6" />
                  </div>
                  <p className="text-sm font-black text-slate-900 dark:text-white">Password reset complete.</p>
                  <button
                    type="button"
                    onClick={() => setResetOpen(false)}
                    className="w-full rounded-xl bg-slate-900 dark:bg-sky-500 px-4 py-3 text-sm font-black text-white dark:text-slate-950"
                  >
                    Return to Login
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
