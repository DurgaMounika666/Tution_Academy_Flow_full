/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { X, Sparkles, UserPlus, CheckCircle2, ChevronRight, UserCheck } from "lucide-react";
import { STANDARDS } from "../data";

interface RegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRegisterSuccess: (email: string, pass: string, childName: string, childGrade: string) => void;
}

export function RegisterModal({ isOpen, onClose, onRegisterSuccess }: RegisterModalProps) {
  const [parentEmail, setParentEmail] = useState("");
  const [parentPassword, setParentPassword] = useState("");
  const [childName, setChildName] = useState("");
  const [childGrade, setChildGrade] = useState("9th Class");
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!parentEmail || !parentPassword || !childName) {
      alert("All fields are strictly required.");
      return;
    }

    onRegisterSuccess(parentEmail, parentPassword, childName, childGrade);
    setSuccess(true);
    setTimeout(() => {
      setSuccess(false);
      setParentEmail("");
      setParentPassword("");
      setChildName("");
      onClose();
    }, 3000);
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
              <div className="space-y-1">
                <label className="text-slate-600 dark:text-slate-350">Parent Email Address</label>
                <input
                  type="email"
                  value={parentEmail}
                  onChange={(e) => setParentEmail(e.target.value)}
                  placeholder="name@parent.com"
                  className="w-full p-2.5 rounded-xl border border-slate-205 dark:bg-slate-900 font-sans"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-600 dark:text-slate-350">Setup Security Password</label>
                <input
                  type="password"
                  value={parentPassword}
                  onChange={(e) => setParentPassword(e.target.value)}
                  placeholder="Min 6 characters"
                  className="w-full p-2.5 rounded-xl border border-slate-205 dark:bg-slate-900"
                  required
                />
              </div>

              <div className="border-t border-slate-100 my-4 pt-3 space-y-3">
                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Student Child Details:</p>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-slate-600">Child Full Name</label>
                    <input
                      type="text"
                      value={childName}
                      onChange={(e) => setChildName(e.target.value)}
                      placeholder="E.g. David Smith"
                      className="w-full p-2.5 rounded-xl border border-slate-205 dark:bg-slate-900"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-600">Standard Grade</label>
                    <select
                      value={childGrade}
                      onChange={(e) => setChildGrade(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-255 dark:bg-slate-900 text-xs"
                    >
                      {STANDARDS.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full mt-4 bg-slate-900 hover:bg-slate-850 dark:bg-sky-500 dark:text-slate-950 font-black py-3 rounded-xl text-xs transition-all active:scale-95 flex items-center justify-center gap-1.5 shadow"
              >
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
