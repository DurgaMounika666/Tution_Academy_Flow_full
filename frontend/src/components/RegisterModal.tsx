/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from "react";
import { X, Sparkles, UserPlus, CheckCircle2, ChevronRight, UserCheck, Eye, EyeOff, CreditCard } from "lucide-react";
import { useCatalog } from "../context/CatalogContext";
import { apiClient } from "../services/apiClient";
import { RegistrationNotification } from "../types";
import { loadRazorpayScript } from "../utils/razorpayLoader";

interface RegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRegisterSuccess: (notification: Omit<RegistrationNotification, "status">) => void;
}

export function RegisterModal({ isOpen, onClose, onRegisterSuccess }: RegisterModalProps) {
  const { standards: STANDARDS, locations: LOCATIONS, subjectsByClass: SUBJECTS_BY_CLASS } = useCatalog();

  const [parentName, setParentName] = useState("");
  const [parentEmail, setParentEmail] = useState("");
  const [parentPhone, setParentPhone] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [childName, setChildName] = useState("");
  const [childGrade, setChildGrade] = useState("");
  const [classMode, setClassMode] = useState<"" | "Online" | "Offline" | "Online & Offline">("");
  const [selectedCourses, setSelectedCourses] = useState<string[]>([]);
  const [location, setLocation] = useState("");
  const [paymentStatus, setPaymentStatus] = useState<"Pending" | "Paid" | "Failed">("Pending");
  const [transactionId, setTransactionId] = useState("");
  const [paymentDateTime, setPaymentDateTime] = useState("");
  const [isPaying, setIsPaying] = useState(false);
  const [simulatedCard, setSimulatedCard] = useState({ number: "", holder: "", expiry: "", cvv: "" });
  const [formStep, setFormStep] = useState(1);
  const [success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const handleProcessRazorpayPayment = async () => {
    const scriptLoaded = await loadRazorpayScript();
    if (!scriptLoaded) {
      alert("Failed to load Razorpay payment overlay. Check your internet connection.");
      return;
    }

    setIsPaying(true);
    setErrorMessage("");

    try {
      // Create Razorpay order on backend
      const orderResponse = await apiClient.payments.createOrder("REGISTRATION", 150);
      const { orderId, currency } = orderResponse;

      const options = {
        key: (import.meta as any).env.VITE_RAZORPAY_KEY_ID || "rzp_test_placeholder",
        amount: 150 * 100, // paise
        currency: currency,
        name: "Academy Flow",
        description: "Parent Registration Fee",
        order_id: orderId,
        handler: async function (response: any) {
          try {
            // Verify payment on backend
            const verifyResponse = await apiClient.payments.verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              feeId: "REGISTRATION",
            });

            if (verifyResponse.success) {
              setTransactionId(response.razorpay_payment_id);
              setPaymentDateTime(new Date().toLocaleString());
              setPaymentStatus("Paid");
            } else {
              setErrorMessage("Payment verification failed. Please try again.");
            }
          } catch (err: any) {
            setErrorMessage(err.message || "Server verification error. Contact support.");
          } finally {
            setIsPaying(false);
          }
        },
        prefill: {
          name: parentName,
          email: parentEmail,
          contact: parentPhone,
        },
        theme: {
          color: "#0ea5e9", // Match RegisterModal sky blue accent
        },
        modal: {
          ondismiss: function () {
            setIsPaying(false);
          }
        }
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to initiate transaction.");
      setIsPaying(false);
    }
  };

  const parentNameRef = useRef<HTMLInputElement>(null);
  const parentEmailRef = useRef<HTMLInputElement>(null);
  const parentPhoneRef = useRef<HTMLInputElement>(null);
  const newPasswordRef = useRef<HTMLInputElement>(null);
  const confirmPasswordRef = useRef<HTMLInputElement>(null);
  const childNameRef = useRef<HTMLInputElement>(null);
  const childGradeRef = useRef<HTMLSelectElement>(null);

  const isValidName = (value: string) => /^[A-Za-z\s]+$/.test(value);
  const isValidEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

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
    setClassMode("");
    setSelectedCourses([]);
    setLocation("");
    setPaymentStatus("Pending");
    setTransactionId("");
    setPaymentDateTime("");
    setIsPaying(false);
    setSimulatedCard({ number: "", holder: "", expiry: "", cvv: "" });
    setFormStep(1);
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
        if (!isValidEmail(value.trim().toLowerCase())) return "Please enter a valid email address.";
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
      case "classMode":
        if (!value.trim()) return "Please select a class mode.";
        return "";
      case "location":
        if (!value.trim()) return "Please select a location.";
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

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    const step1Fields = [
      ["parentName", parentName],
      ["parentEmail", parentEmail],
      ["parentPhone", parentPhone],
      ["newPassword", newPassword],
      ["confirmPassword", confirmPassword],
    ] as const;
    let hasErrors = false;
    step1Fields.forEach(([field, value]) => {
      if (validateAndSetFieldError(field, value)) hasErrors = true;
    });
    if (hasErrors) {
      setErrorMessage("Please correct the highlighted fields before continuing.");
      return;
    }
    setFormStep(2);
  };

  const handleStep2Next = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    const validations = [
      ["childName", childName],
      ["childGrade", childGrade],
      ["classMode", classMode],
      ["location", location],
    ] as const;

    let hasErrors = false;
    validations.forEach(([field, value]) => {
      const error = validateAndSetFieldError(field, value);
      if (error) {
        hasErrors = true;
      }
    });

    if (selectedCourses.length === 0) {
      setFieldErrors(prev => ({ ...prev, selectedCourses: "Please select at least one course." }));
      hasErrors = true;
    } else {
      setFieldErrors(prev => ({ ...prev, selectedCourses: "" }));
    }

    if (hasErrors) {
      setErrorMessage("Please correct the highlighted fields before continuing.");
      return;
    }
    setFormStep(3);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    const normalizedEmail = parentEmail.trim().toLowerCase();

    if (paymentStatus !== "Paid") {
      setErrorMessage("Please complete the advance fee payment before submitting your registration.");
      return;
    }

    try {
      const result = await apiClient.auth.registerParent(
        normalizedEmail,
        newPassword,
        parentName,
        parentPhone,
        childName,
        childGrade,
        classMode,
        location,
        150,
        transactionId,
        paymentStatus,
        selectedCourses
      );
      apiClient.clearAuthToken();
      onRegisterSuccess({
        id: result.registrationId,
        name: parentName.trim(),
        role: "Parent",
        email: normalizedEmail,
        mobileNumber: parentPhone.trim(),
        studentClass: childGrade,
        registrationDateTime: new Date().toLocaleString(),
      });
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
            <form onSubmit={formStep === 1 ? handleNextStep : formStep === 2 ? handleStep2Next : handleSubmit} className="space-y-4 text-xs font-semibold">
              {errorMessage && (
                <div className="rounded-2xl bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-700 p-3 text-rose-700 dark:text-rose-300 text-xs font-bold">
                  {errorMessage}
                </div>
              )}

              <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400">
                <span className={`px-2 py-1 rounded-lg ${formStep === 1 ? "bg-sky-100 text-sky-700" : "bg-slate-100"}`}>Step 1: Parent</span>
                <ChevronRight className="h-3 w-3" />
                <span className={`px-2 py-1 rounded-lg ${formStep === 2 ? "bg-sky-100 text-sky-700" : "bg-slate-100"}`}>Step 2: Child & Class</span>
                <ChevronRight className="h-3 w-3" />
                <span className={`px-2 py-1 rounded-lg ${formStep === 3 ? "bg-sky-100 text-sky-700" : "bg-slate-100"}`}>Step 3: Payment</span>
              </div>

              {formStep === 1 && (<>

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
                      const val = e.target.value;
                      const digits = val.replace(/\D/g, "");
                      // Allow max 10 digits, or 12 if starts with +91
                      if (val.startsWith("+91") || digits.startsWith("91")) {
                        if (digits.length > 12) return;
                      } else {
                        if (digits.length > 10) return;
                      }
                      setParentPhone(val);
                      if (fieldErrors.parentPhone) validateAndSetFieldError("parentPhone", val);
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
                      placeholder="password"
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

                <button
                  type="submit"
                  className="w-full mt-4 bg-slate-900 hover:bg-slate-850 dark:bg-sky-500 text-white font-black py-3 rounded-xl text-xs transition-all active:scale-95 flex items-center justify-center gap-1.5"
                >
                  Continue to Child Details <ChevronRight className="h-4 w-4" />
                </button>
              </>)}

              {formStep === 2 && (<>
                <div className="border-t border-slate-100 pt-3 space-y-3">
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
                          setSelectedCourses([]);
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

                  {/* Select Courses - multi-select */}
                  {childGrade && (
                    <div className="space-y-2 pt-2">
                      <label className="text-slate-600">Select Courses</label>
                      <div className="rounded-xl border border-slate-200 dark:border-slate-700 p-2.5 space-y-1.5 max-h-40 overflow-y-auto modal-scroll">
                        {/* All Subjects option */}
                        <label className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-sky-50 dark:hover:bg-sky-950/20 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={selectedCourses.length === (SUBJECTS_BY_CLASS[childGrade] || []).length && selectedCourses.length > 0}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedCourses([...(SUBJECTS_BY_CLASS[childGrade] || [])]);
                              } else {
                                setSelectedCourses([]);
                              }
                            }}
                            className="h-3.5 w-3.5 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                          />
                          <span className="text-xs font-bold text-sky-700 dark:text-sky-300">All Subjects</span>
                        </label>
                        <div className="border-t border-slate-100 dark:border-slate-800 my-1" />
                        {(SUBJECTS_BY_CLASS[childGrade] || []).map((subject) => (
                          <label key={subject} className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={selectedCourses.includes(subject)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedCourses([...selectedCourses, subject]);
                                } else {
                                  setSelectedCourses(selectedCourses.filter(c => c !== subject));
                                }
                              }}
                              className="h-3.5 w-3.5 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                            />
                            <span className="text-xs font-medium text-slate-700 dark:text-slate-300">{subject}</span>
                          </label>
                        ))}
                      </div>
                      {selectedCourses.length > 0 && (
                        <p className="text-[10px] text-sky-600 font-semibold">{selectedCourses.length} course(s) selected</p>
                      )}
                      {fieldErrors.selectedCourses && (
                        <p className="text-rose-600 text-[10px]">{fieldErrors.selectedCourses}</p>
                      )}
                    </div>
                  )}

                  <div className="space-y-1 pt-2">
                    <label className="text-slate-600">Mode of Class</label>
                    <select
                      value={classMode}
                      onChange={(e) => {
                        setClassMode(e.target.value as any);
                        if (fieldErrors.classMode) validateAndSetFieldError("classMode", e.target.value);
                      }}
                      className={`w-full p-2.5 rounded-xl border ${fieldErrors.classMode ? "border-rose-500" : "border-slate-200"} dark:bg-slate-900 text-xs`}
                      required
                    >
                      <option value="" disabled>Select class mode</option>
                      <option value="Online">Online Class</option>
                      <option value="Offline">Offline Class</option>
                      <option value="Online & Offline">Online & Offline Class</option>
                    </select>
                    {fieldErrors.classMode && (
                      <p className="text-rose-600 text-[10px]">{fieldErrors.classMode}</p>
                    )}
                  </div>

                  <div className="space-y-1 pt-2">
                    <label className="text-slate-600">Select Location</label>
                    <select
                      value={location}
                      onChange={(e) => {
                        setLocation(e.target.value);
                        if (fieldErrors.location) validateAndSetFieldError("location", e.target.value);
                      }}
                      onBlur={() => validateAndSetFieldError("location", location)}
                      className={`w-full p-2.5 rounded-xl border ${fieldErrors.location ? "border-rose-500" : "border-slate-200"} dark:bg-slate-900 text-xs`}
                      required
                    >
                      <option value="" disabled>Select your location</option>
                      {LOCATIONS.map((loc) => (
                        <option key={loc} value={loc}>{loc}</option>
                      ))}
                    </select>
                    {fieldErrors.location && (
                      <p className="text-rose-600 text-[10px]">{fieldErrors.location}</p>
                    )}
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setFormStep(1)}
                    className="flex-1 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-bold py-3 rounded-xl text-xs"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    className="flex-[2] bg-slate-900 hover:bg-slate-850 dark:bg-sky-500 text-white font-black py-3 rounded-xl text-xs transition-all active:scale-95 flex items-center justify-center gap-1.5"
                  >
                    Continue to Payment <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </>)}

              {formStep === 3 && (<>
                {/* Advance Fee Payment Panel */}
                <div className={`rounded-2xl border-2 p-4 space-y-3 transition-all ${paymentStatus === "Paid" ? "border-emerald-400 bg-emerald-50 dark:bg-emerald-950/20" : "border-amber-300 bg-amber-50 dark:bg-amber-950/10"}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CreditCard className={`h-4 w-4 ${paymentStatus === "Paid" ? "text-emerald-600" : "text-amber-600"}`} />
                      <span className={`text-xs font-black uppercase tracking-wide ${paymentStatus === "Paid" ? "text-emerald-700 dark:text-emerald-300" : "text-amber-700 dark:text-amber-300"}`}>
                        {paymentStatus === "Paid" ? "✅ Advance Fee Paid" : "⚠️ Pay Advance Fee (Mandatory)"}
                      </span>
                    </div>
                    <span className={`text-sm font-black ${paymentStatus === "Paid" ? "text-emerald-600" : "text-amber-600"}`}>₹150</span>
                  </div>

                  {paymentStatus === "Paid" ? (
                    <div className="space-y-1.5 text-[10px] font-mono bg-white dark:bg-slate-900 rounded-xl p-3 border border-emerald-200">
                      <p className="font-bold text-emerald-700 dark:text-emerald-300">Payment Successful 🎉</p>
                      <p className="text-slate-500">Transaction ID: <span className="text-slate-800 dark:text-white font-bold">{transactionId}</span></p>
                      <p className="text-slate-500">Date & Time: <span className="text-slate-800 dark:text-white">{paymentDateTime}</span></p>
                      <p className="text-slate-500">Amount: <span className="text-emerald-700 font-bold">₹150.00</span></p>
                    </div>
                  ) : (
                    <button
                      type="button"
                      disabled={isPaying}
                      onClick={handleProcessRazorpayPayment}
                      className="w-full py-2.5 bg-sky-500 hover:bg-sky-400 text-white font-black rounded-xl text-xs transition-all active:scale-95 flex items-center justify-center gap-2 disabled:bg-slate-300 disabled:cursor-not-allowed cursor-pointer"
                    >
                      <CreditCard className="h-3.5 w-3.5 animate-pulse" />
                      {isPaying ? "Opening Payment Gateway..." : "Pay Advance Fee via Razorpay — ₹150"}
                    </button>
                  )}
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setFormStep(2)}
                    className="flex-1 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-bold py-3 rounded-xl text-xs"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={paymentStatus !== "Paid"}
                    className={`flex-[2] font-black py-3 rounded-xl text-xs transition-all active:scale-95 flex items-center justify-center gap-1.5 ${paymentStatus === "Paid" ? "bg-slate-900 hover:bg-slate-850 dark:bg-sky-500 text-white" : "bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed"}`}
                  >
                    <UserCheck className="h-4 w-4" />
                    <span>{paymentStatus === "Paid" ? "Submit Registration" : "Pay Fee to Continue"}</span>
                  </button>
                </div>
              </>)}
            </form>
          )}
        </div>

      </div>
    </div>
  );
}
