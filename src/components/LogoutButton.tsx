/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { LogOut } from "lucide-react";

interface LogoutButtonProps {
  onLogout: () => void;
  className?: string;
  variant?: "header" | "sidebar";
}

export function LogoutButton({ onLogout, className = "", variant = "header" }: LogoutButtonProps) {
  const [showConfirm, setShowConfirm] = useState(false);

  const baseStyles =
    variant === "header"
      ? "px-4 py-2 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/30 dark:hover:bg-rose-950/50 text-rose-600 dark:text-rose-400 font-bold text-xs rounded-xl border border-rose-200 dark:border-rose-800 transition-colors cursor-pointer flex items-center gap-1.5"
      : "text-[10px] uppercase font-black tracking-wider text-rose-400 hover:text-rose-300 transition-colors cursor-pointer";

  const handleConfirm = () => {
    setShowConfirm(false);
    onLogout();
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setShowConfirm(true)}
        title="Logout"
        className={`${baseStyles} ${className}`}
      >
        <LogOut className="h-3.5 w-3.5" />
        <span>Logout</span>
      </button>

      {showConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-sm p-6 shadow-2xl border border-slate-200 dark:border-slate-700 text-center space-y-4">
            <p className="text-sm font-bold text-slate-800 dark:text-slate-100">
              Are you sure you want to log out?
            </p>
            <div className="flex gap-3 justify-center">
              <button
                type="button"
                onClick={handleConfirm}
                className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl cursor-pointer"
              >
                OK
              </button>
              <button
                type="button"
                onClick={() => setShowConfirm(false)}
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs rounded-xl cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
