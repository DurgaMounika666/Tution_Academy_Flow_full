/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from "react";
import { X, Sparkles, UserPlus, CheckCircle2, ChevronRight, UserCheck, Eye, EyeOff } from "lucide-react";
import { STANDARDS } from "../data";
import { apiClient } from "../services/apiClient";

interface RegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRegisterSuccess: (email: string, pass: string) => void;
}

export function RegisterModal({ isOpen, onClose, onRegisterSuccess }: RegisterModalProps) {
  const [parentName, setParentName] = useState("");
  const [parentEmail, setParentEmail] = useState("");
  const [parentPhone, setParentPhone] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [childName, setChildName] = useState("");
  const [childGrade, setChildGrade] = useState("");
  const [success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const parentNameRef = useRef<HTMLInputElement>(null);
  const parentEmailRef = useRef<HTMLInputElement>(null);
  const parentPhoneRef = useRef<HTMLInputElement>(null);
  const newPasswordRef = useRef<HTMLInputElement>(null);
  const confirmPasswordRef = useRef<HTMLInputElement>(null);
  const childNameRef = useRef<HTMLInputElement>(null);
  const childGradeRef = useRef<HTMLSelectElement>(null);

  const isValidName = (value: string) => /^[A-Za-z\s]+$/.test(value);
  const isValidGmail = (value: string) => /^[^\s@]+@gmail\.com$/i.test(value);
  
  const isValidPhoneNumber = (value: string) => {
    const normalized = value.replace(/\s+/g, "");
    return /^(\+91)?\d{10}$/.test(normalized);
  };

  const isValidPassword = (value: string) => {
    const hasUppercase = /[A-Z]/.test(value);
    const hasLowercase = /[a-z]/.test(value);
    const hasNumber = /\d/.test(value);
    const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(value);
    const isLongEnough = value.length >= 8;
    return hasUppercase && hasLowercase && hasNumber && hasSpecial && isLongEnough;
  };

  const resetForm = () => {
    setParentName("");
    setParentEmail("");
    setParentPhone("");
    setNewPassword("");
    setConfirmPassword("");
    setChildName("");
    setChildGrade("");
    setErrorMessage("");
    setPasswordVisible(false);
    setConfirmPasswordVisible(false);
    setFieldErrors({});
  };

  const validateField = (field: string, value: string) => {
    switch (field) {
      case "parentName":
        if (!value.trim()) return "Please enter your full name.";
        if (!isValidName(value.trim())) return "Please enter valid details for your name.";
        return "";
      case "parentEmail":
        if (!value.trim()) return "Please enter your email address.";
        if (!isValidGmail(value.trim().toLowerCase())) return "Please enter a valid Gmail address (name@gmail.com).";
        return "";
      case "parentPhone":
        if (!value.trim()) return "Please enter your phone number.";
        if (!isValidPhoneNumber(value.trim())) return "Please enter a valid phone number (10 digits or +91 format).";
        return "";
      case "newPassword":
        if (!value.trim()) return "Please enter a new password.";
        if (!isValidPassword(value)) return "Password should include at least one uppercase letter, one lowercase letter, a number, a symbol, and be at least 8 characters long.";
        return "";
      case "confirmPassword":
        if (!value.trim()) return "Please confirm your password.";
        if (value !== newPassword) return "Passwords do not match.";
        return "";
      case "childName":
        if (!value.trim()) return "Please enter your child's full name.";
        return "";
      case "childGrade":
        if (!value.trim()) return "Please select your child's class.";
        return "";
      default:
        return "";
    }
  };

  const validateAndSetFieldError = (field: string, value: string) => {
    const error = validateField(field, value);
    setFieldErrors((prev) => ({ ...prev, [field]: error }));
    return error;
  };

  const focusNextField = (field: string) => {
    switch (field) {
      case "parentName":
        parentEmailRef.current?.focus();
        break;
      case "parentEmail":
        parentPhoneRef.current?.focus();
        break;
      case "parentPhone":
        newPasswordRef.current?.focus();
        break;
      case "newPassword":
        confirmPasswordRef.current?.focus();
        break;
      case "confirmPassword":
        childNameRef.current?.focus();
        break;
      case "childName":
        childGradeRef.current?.focus();
        break;
      default:
        break;
    }
  };

  const handleEnterKey = (field: string, value: string) => (e: React.KeyboardEvent<HTMLInputElement | HTMLSelectElement>) => {
    if (e.key !== "Enter") return;
    e.preventDefault();
    const error = validateAndSetFieldError(field, value);
    if (!error) {
      focusNextField(field);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    const normalizedEmail = parentEmail.trim().toLowerCase();
    const validations = [
      ["parentName", parentName],
      ["parentEmail", parentEmail],
      ["parentPhone", parentPhone],
      ["newPassword", newPassword],
      ["confirmPassword", confirmPassword],
      ["childName", childName],
      ["childGrade", childGrade],
    ] as const;

    let hasErrors = false;
    validations.forEach(([field, value]) => {
      const error = validateAndSetFieldError(field, value);
      if (error) {
        hasErrors = true;
      }
    });

    if (hasErrors) {
      setErrorMessage("Please correct the highlighted fields before continuing.");
      return;
    }

    try {
      const result = await apiClient.auth.registerParent(
        normalizedEmail,
        newPassword,
        parentName,
        parentPhone,
        childName,
        childGrade
      );
      apiClient.setAuthToken(result.token);
      onRegisterSuccess(normalizedEmail, newPassword);
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        resetForm();
        onClose();
      }, 3000);
    } catch (error: any) {
      setErrorMessage(error.message || "Registration failed. Please try again.");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 text-left">
      <div className="w-full max-w-md bg-white dark:bg-slate-950 rounded-3xl overflow-hidden shadow-2xl border border-slate-150 dark:border-slate-850 transform transition-all">

        {/* Header */}
        <div className="bg-slate-50 dark:bg-slate-900 px-6 py-4 border-b border-slate-150 dark:border-slate-800 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-sky-500 flex items-center justify-center text-slate-950">
              <UserPlus className="h-4.5 w-4.5" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900 dark:text-white">New Registrar Enrollment</h3>
              <p className="text-[10px] text-slate-500">Sign up your child for Academy Flow training logs</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-150 text-slate-400"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {success ? (
            <div className="text-center py-6 space-y-3">
              <div className="h-12 w-12 rounded-full bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="h-6 w-6 stroke-[2.5]" />
              </div>
              <h4 className="text-sm font-black text-slate-900 dark:text-white">Parent Account Registered Safely!</h4>
              <p className="text-xs text-slate-500">
                Created profiles for <strong className="text-slate-800 dark:text-slate-200">{childName} ({childGrade})</strong>. You may now log in to parent portal using your new password.
              </p>
              <div className="bg-slate-50 p-2.5 rounded-xl border text-[10px] text-slate-500 font-mono">
                Log Email: {parentEmail}
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs font-semibold">
              {errorMessage && (
                <div className="rounded-2xl bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-700 p-3 text-rose-700 dark:text-rose-300 text-xs font-bold">
                  {errorMessage}
                </div>
              )}

              <div className="space-y-1">
                <label className="text-slate-600 dark:text-slate-350">Parent Full Name</label>
                <input
                  ref={parentNameRef}
                  type="text"
                  value={parentName}
                  onChange={(e) => {
                    setParentName(e.target.value);
                    if (fieldErrors.parentName) validateAndSetFieldError("parentName", e.target.value);
                  }}
                  onBlur={() => validateAndSetFieldError("parentName", parentName)}
                  onKeyDown={handleEnterKey("parentName", parentName)}
                  placeholder="E.g. John Smith"
                  autoComplete="name"
                  className={`w-full p-2.5 rounded-xl border ${fieldErrors.parentName ? "border-rose-500" : "border-slate-205"} dark:bg-slate-900 font-sans`}
                  required
                />
                {fieldErrors.parentName && (
                  <p className="text-rose-600 text-[10px]">{fieldErrors.parentName}</p>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-slate-600 dark:text-slate-350">Parent Email Address</label>
                <input
                  ref={parentEmailRef}
                  type="email"
                  value={parentEmail}
                  onChange={(e) => {
                    setParentEmail(e.target.value);
                    if (fieldErrors.parentEmail) validateAndSetFieldError("parentEmail", e.target.value);
                  }}
                  onBlur={() => validateAndSetFieldError("parentEmail", parentEmail)}
                  onKeyDown={handleEnterKey("parentEmail", parentEmail)}
                  placeholder="name@gmail.com"
                  autoComplete="email"
                  className={`w-full p-2.5 rounded-xl border ${fieldErrors.parentEmail ? "border-rose-500" : "border-slate-205"} dark:bg-slate-900 font-sans`}
                  required
                />
                {fieldErrors.parentEmail && (
                  <p className="text-rose-600 text-[10px]">{fieldErrors.parentEmail}</p>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-slate-600 dark:text-slate-350">Parent Phone Number</label>
                <input
                  ref={parentPhoneRef}
                  type="tel"
                  value={parentPhone}
                  onChange={(e) => {
                    setParentPhone(e.target.value);
                    if (fieldErrors.parentPhone) validateAndSetFieldError("parentPhone", e.target.value);
                  }}
                  onBlur={() => validateAndSetFieldError("parentPhone", parentPhone)}
                  onKeyDown={handleEnterKey("parentPhone", parentPhone)}
                  placeholder="+91 90000 00000"
                  autoComplete="tel"
                  className={`w-full p-2.5 rounded-xl border ${fieldErrors.parentPhone ? "border-rose-500" : "border-slate-205"} dark:bg-slate-900 font-sans`}
                  required
                />
                {fieldErrors.parentPhone && (
                  <p className="text-rose-600 text-[10px]">{fieldErrors.parentPhone}</p>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-slate-600 dark:text-slate-350">New Password</label>
                <div className="relative">
                  <input
                    ref={newPasswordRef}
                    type={passwordVisible ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => {
                      setNewPassword(e.target.value);
                      if (fieldErrors.newPassword) validateAndSetFieldError("newPassword", e.target.value);
                    }}
                    onBlur={() => validateAndSetFieldError("newPassword", newPassword)}
                    onKeyDown={handleEnterKey("newPassword", newPassword)}
                    placeholder="Enter your password"
                    autoComplete="new-password"
                    className={`w-full p-2.5 rounded-xl border ${fieldErrors.newPassword ? "border-rose-500" : "border-slate-205"} dark:bg-slate-900 pr-10`}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setPasswordVisible(!passwordVisible)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {passwordVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {newPassword ? (
                  <div className="text-[10px] text-slate-500 dark:text-slate-400">
                    <p className="font-semibold">Your Password should include Atleast :</p>
                    <ul className="list-disc pl-4 mt-1 space-y-0.5">
                      <li>one uppercase letter (A-Z)</li>
                      <li>one lowercase letter (a-z)</li>
                      <li>a number (0-9)</li>
                      <li>a symbol (!@#$%^&*)</li>
                      <li>must contain 8 characters</li>
                    </ul>
                  </div>
                ) : null}
                
              </div>

              <div className="space-y-1">
                <label className="text-slate-600 dark:text-slate-350">Confirm Password</label>
                <div className="relative">
                  <input
                    ref={confirmPasswordRef}
                    type={confirmPasswordVisible ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      if (fieldErrors.confirmPassword) validateAndSetFieldError("confirmPassword", e.target.value);
                    }}
                    onBlur={() => validateAndSetFieldError("confirmPassword", confirmPassword)}
                    onKeyDown={handleEnterKey("confirmPassword", confirmPassword)}
                    placeholder="Re-enter your password"
                    autoComplete="new-password"
                    className={`w-full p-2.5 rounded-xl border ${fieldErrors.confirmPassword ? "border-rose-500" : "border-slate-205"} dark:bg-slate-900 pr-10`}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setConfirmPasswordVisible(!confirmPasswordVisible)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {confirmPasswordVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {fieldErrors.confirmPassword && (
                  <p className="text-rose-600 text-[10px]">{fieldErrors.confirmPassword}</p>
                )}
              </div>

              <div className="border-t border-slate-100 my-4 pt-3 space-y-3">
                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Student Child Details:</p>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-slate-600">Child Full Name</label>
                    <input
                      ref={childNameRef}
                      type="text"
                      value={childName}
                      onChange={(e) => {
                        setChildName(e.target.value);
                        if (fieldErrors.childName) validateAndSetFieldError("childName", e.target.value);
                      }}
                      onBlur={() => validateAndSetFieldError("childName", childName)}
                      onKeyDown={handleEnterKey("childName", childName)}
                      placeholder="E.g. David Smith"
                      className={`w-full p-2.5 rounded-xl border ${fieldErrors.childName ? "border-rose-500" : "border-slate-205"} dark:bg-slate-900`}
                      required
                    />
                    {fieldErrors.childName && (
                      <p className="text-rose-600 text-[10px]">{fieldErrors.childName}</p>
                    )}
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-600">Standard Grade</label>
                    <select
                      ref={childGradeRef}
                      value={childGrade}
                      onChange={(e) => {
                        setChildGrade(e.target.value);
                        if (fieldErrors.childGrade) validateAndSetFieldError("childGrade", e.target.value);
                      }}
                      onBlur={() => validateAndSetFieldError("childGrade", childGrade)}
                      className={`w-full p-2.5 rounded-xl border ${fieldErrors.childGrade ? "border-rose-500" : "border-slate-255"} dark:bg-slate-900 text-xs`}
                      required
                    >
                      <option value="" disabled>Select class</option>
                      {STANDARDS.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                    {fieldErrors.childGrade && (
                      <p className="text-rose-600 text-[10px]">{fieldErrors.childGrade}</p>
                    )}
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full mt-4 bg-slate-900 hover:bg-slate-850 dark:bg-sky-500 text-white font-black py-3 rounded-xl text-xs transition-all active:scale-95 flex items-center justify-center gap-1.5 shadow"              >
                <UserCheck className="h-4 w-4" />
                <span>Confirm Registrar Enrollment</span>
              </button>
            </form>
          )}
        </div>

      </div>
    </div>
  );
}
