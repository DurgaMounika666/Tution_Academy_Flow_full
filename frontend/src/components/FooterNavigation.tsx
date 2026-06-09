/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";

interface FooterNavigationProps {
  backTo?: string;
  continueTo?: string;
  onBack?: () => void;
  onContinue?: () => void;
  backDisabled?: boolean;
  continueDisabled?: boolean;
  className?: string;
}

export function FooterNavigation({
  backTo = "/",
  continueTo = "/",
  onBack,
  onContinue,
  backDisabled = false,
  continueDisabled = false,
  className = "",
}: FooterNavigationProps) {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const handleBack = () => {
    if (onBack) {
      onBack();
      return;
    }
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }

    navigate(backTo);
  };

  const handleContinue = () => {
    if (onContinue) {
      onContinue();
      return;
    }
    navigate(continueTo);
  };

  return (
    <div className={`rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm ${className}`}>
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <button
          type="button"
          onClick={handleBack}
          disabled={backDisabled}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-4 py-3 text-xs font-black text-slate-700 dark:text-slate-200 hover:border-sky-300 hover:text-sky-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:border-slate-205 disabled:hover:text-slate-700 dark:disabled:hover:border-slate-700 dark:disabled:hover:text-slate-202"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>{t("back")}</span>
        </button>
        <button
          type="button"
          onClick={handleContinue}
          disabled={continueDisabled}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 dark:bg-sky-500 px-4 py-3 text-xs font-black text-white dark:text-slate-950 hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <span>{t("continue")}</span>
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
