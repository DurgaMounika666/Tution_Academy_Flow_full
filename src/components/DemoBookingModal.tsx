/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from "react";
import { X, CheckCircle2 } from "lucide-react";
import { apiClient } from "../services/apiClient";
import { STANDARDS } from "../data";

const COURSE_OPTIONS = [
  "Mathematics Foundation",
  "Science Accelerator",
  "English & Language Skills",
  "Hybrid Learning Path",
  "Exam Readiness Program",
  "Personalised Coaching Course",
];

interface DemoBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialClass?: string;
}

export function DemoBookingModal({ isOpen, onClose, initialClass = "1st Class" }: DemoBookingModalProps) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [studentClass, setStudentClass] = useState(initialClass);
  const [course, setCourse] = useState(COURSE_OPTIONS[0]);
  const [preferredDate, setPreferredDate] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split("T")[0];

  useEffect(() => {
    if (isOpen && STANDARDS.includes(initialClass)) {
      setStudentClass(initialClass);
    }
  }, [isOpen, initialClass]);

  const isValidName = (value: string) => /^[a-zA-Z\s]+$/.test(value);
  const isValidGmail = (value: string) => /^[^\s@]+@gmail\.com$/i.test(value);
  const isValidPhoneNumber = (value: string) => {
    const normalized = value.replace(/\s+/g, "");
    return /^(\+91)?\d{10}$/.test(normalized);
  };

  const resetForm = () => {
    setFullName("");
    setEmail("");
    setWhatsappNumber("");
    setStudentClass(initialClass);
    setCourse(COURSE_OPTIONS[0]);
    setPreferredDate("");
    setErrorMessage("");
  };

  const handleFullNameChange = (value: string) => {
    setFullName(value);
    setErrorMessage("");
  };

  const handleEmailChange = (value: string) => {
    setEmail(value);
    setErrorMessage("");
  };

  const handlePhoneChange = (value: string) => {
    setWhatsappNumber(value);
    setErrorMessage("");
  };

  const handleDateChange = (value: string) => {
    setPreferredDate(value);
    setErrorMessage("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!fullName.trim()) {
      setErrorMessage("Please enter your full name.");
      return;
    }

    if (!isValidName(fullName.trim())) {
      setErrorMessage("Please enter a valid name (letters and spaces only).");
      return;
    }

    if (!email.trim()) {
      setErrorMessage("Please enter your email address.");
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();
    if (!isValidGmail(normalizedEmail)) {
      setErrorMessage("Please enter a valid Gmail address.");
      return;
    }

    if (!whatsappNumber.trim()) {
      setErrorMessage("Please enter your phone number.");
      return;
    }

    const normalizedWhatsapp = whatsappNumber.trim();
    if (!isValidPhoneNumber(normalizedWhatsapp)) {
      setErrorMessage("Please enter a valid phone number (10 digits) or include country code like +91.");
      return;
    }

    if (!course.trim()) {
      setErrorMessage("Please select a course.");
      return;
    }

    if (!studentClass.trim() || !STANDARDS.includes(studentClass)) {
      setErrorMessage("Please select a valid class from 1st Class to 10th Class.");
      return;
    }

    if (!preferredDate.trim()) {
      setErrorMessage("Please select a preferred demo date.");
      return;
    }

    const selectedDate = new Date(preferredDate);
    const earliestAllowed = new Date(tomorrow);
    if (selectedDate < earliestAllowed) {
      setErrorMessage("Please select a demo date from tomorrow onwards.");
      return;
    }

    setIsSubmitting(true);

    try {
      await apiClient.bookings.createDemoBooking({
        fullName: fullName.trim(),
        email: normalizedEmail,
        whatsappNumber: normalizedWhatsapp,
        studentClass,
        course: course.trim(),
        preferredDate: preferredDate,
      });

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        resetForm();
        onClose();
      }, 4500);
    } catch (error: any) {
      setErrorMessage(error.message || "Unable to reserve your demo seat right now. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-md p-4">
      <div className="w-full max-w-lg bg-white dark:bg-slate-950 rounded-[28px] shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="flex items-start justify-between gap-3 p-5 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
          <div>
            <p className="text-xs uppercase tracking-[0.26em] font-black text-sky-600 dark:text-sky-400">Schedule Demo</p>
            <h2 className="mt-2 text-2xl font-black text-slate-950 dark:text-white">Book a Free Demo Seat</h2>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">Complete the form below and our team will confirm your session quickly.</p>
          </div>
          <button onClick={onClose} className="rounded-full p-2 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6">
          {success ? (
            <div className="rounded-3xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-700 p-6 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-200">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-black text-slate-950 dark:text-white">🎉 Your Free Demo Seat is Reserved!</h3>
              <p className="mt-3 text-sm leading-7 text-slate-700 dark:text-slate-300">
                Thank you for booking a demo with Academy Flow. Our team will contact you shortly via phone or WhatsApp to confirm your session details. We look forward to meeting you.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-sm text-slate-900 dark:text-slate-100">
              {errorMessage && (
                <div className="rounded-2xl bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-700 p-3 text-rose-700 dark:text-rose-300 text-xs font-bold">
                  {errorMessage}
                </div>
              )}

              <div className="grid gap-4">
                <label className="space-y-2 text-xs font-bold uppercase tracking-[0.15em] text-slate-500 dark:text-slate-400">
                  Full Name *
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => handleFullNameChange(e.target.value)}
                    placeholder="Enter your full name"
                    className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-4 py-3 text-sm font-semibold text-slate-900 dark:text-slate-100 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 outline-none"
                    required
                  />
                </label>

                <label className="space-y-2 text-xs font-bold uppercase tracking-[0.15em] text-slate-500 dark:text-slate-400">
                  Email Address *
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => handleEmailChange(e.target.value)}
                    placeholder="name@gmail.com"
                    className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-4 py-3 text-sm font-semibold text-slate-900 dark:text-slate-100 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 outline-none"
                    required
                  />
                </label>

                <label className="space-y-2 text-xs font-bold uppercase tracking-[0.15em] text-slate-500 dark:text-slate-400">
                  Phone Number *
                  <input
                    type="tel"
                    value={whatsappNumber}
                    onChange={(e) => handlePhoneChange(e.target.value)}
                    placeholder="+91 90000 00000"
                    className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-4 py-3 text-sm font-semibold text-slate-900 dark:text-slate-100 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 outline-none"
                    required
                  />
                </label>

                <label className="space-y-2 text-xs font-bold uppercase tracking-[0.15em] text-slate-500 dark:text-slate-400">
                  Class / Grade *
                  <select
                    value={studentClass}
                    onChange={(e) => setStudentClass(e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-4 py-3 text-sm font-semibold text-slate-900 dark:text-slate-100 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 outline-none"
                    required
                  >
                    {STANDARDS.map((standard) => (
                      <option key={standard} value={standard}>{standard}</option>
                    ))}
                  </select>
                </label>

                <label className="space-y-2 text-xs font-bold uppercase tracking-[0.15em] text-slate-500 dark:text-slate-400">
                  Select Course *
                  <select
                    value={course}
                    onChange={(e) => setCourse(e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-4 py-3 text-sm font-semibold text-slate-900 dark:text-slate-100 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 outline-none"
                    required
                  >
                    {COURSE_OPTIONS.map((option) => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </label>

                <label className="space-y-2 text-xs font-bold uppercase tracking-[0.15em] text-slate-500 dark:text-slate-400">
                  Preferred Demo Date *
                  <input
                    type="date"
                    min={tomorrow}
                    value={preferredDate}
                    onChange={(e) => handleDateChange(e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-4 py-3 text-sm font-semibold text-slate-900 dark:text-slate-100 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 outline-none"
                    required
                  />
                </label>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-2xl bg-amber-600 hover:bg-amber-500 text-white font-black px-5 py-3 text-sm transition-all shadow-lg active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSubmitting ? "Reserving Seat..." : "Book My Free Seat"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
