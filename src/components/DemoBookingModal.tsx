/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { X, CheckCircle2 } from "lucide-react";
import { apiClient } from "../services/apiClient";

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
}

export function DemoBookingModal({ isOpen, onClose }: DemoBookingModalProps) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [course, setCourse] = useState(COURSE_OPTIONS[0]);
  const [preferredDate, setPreferredDate] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetForm = () => {
    setFullName("");
    setEmail("");
    setWhatsappNumber("");
    setCourse(COURSE_OPTIONS[0]);
    setPreferredDate("");
    setErrorMessage("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!fullName.trim() || !email.trim() || !whatsappNumber.trim() || !course.trim()) {
      setErrorMessage("Please complete all required fields before booking your free demo seat.");
      return;
    }

    setIsSubmitting(true);

    try {
      await apiClient.bookings.createDemoBooking({
        fullName: fullName.trim(),
        email: email.trim().toLowerCase(),
        whatsappNumber: whatsappNumber.trim(),
        course: course.trim(),
        preferredDate: preferredDate || undefined,
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
                    onChange={(e) => setFullName(e.target.value)}
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
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-4 py-3 text-sm font-semibold text-slate-900 dark:text-slate-100 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 outline-none"
                    required
                  />
                </label>

                <label className="space-y-2 text-xs font-bold uppercase tracking-[0.15em] text-slate-500 dark:text-slate-400">
                  WhatsApp Number *
                  <input
                    type="tel"
                    value={whatsappNumber}
                    onChange={(e) => setWhatsappNumber(e.target.value)}
                    placeholder="+91 90000 00000"
                    className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-4 py-3 text-sm font-semibold text-slate-900 dark:text-slate-100 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 outline-none"
                    required
                  />
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
                  Preferred Demo Date
                  <input
                    type="date"
                    value={preferredDate}
                    onChange={(e) => setPreferredDate(e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-4 py-3 text-sm font-semibold text-slate-900 dark:text-slate-100 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 outline-none"
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
