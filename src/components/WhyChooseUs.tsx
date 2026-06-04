/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { Award, Layers, Users, RefreshCw, ArrowUpRight, CheckSquare } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";

export function WhyChooseUs() {
  const { t } = useLanguage();

  const points = [
    {
      icon: Award,
      title: t("expertTutorsTitle"),
      desc: t("expertTutorsDesc"),
      badge: "Top Rated"
    },
    {
      icon: Layers,
      title: t("customCurriculumTitle"),
      desc: t("customCurriculumDesc"),
      badge: "Dynamic"
    },
    {
      icon: Users,
      title: t("progressTrackingTitle"),
      desc: t("progressTrackingDesc"),
      badge: "1-on-1 Focus"
    },
    {
      icon: RefreshCw,
      title: t("interactiveDashboardsTitle"),
      desc: t("interactiveDashboardsDesc"),
      badge: "Flexible"
    }
  ];

  return (
    <section id="why-choose-us" className="bg-slate-50 dark:bg-slate-900 border-y border-slate-200/50 dark:border-slate-800/50 py-16 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
      <div className="mx-auto max-w-7xl">
        
        {/* Header Title */}
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-12">
          <span className="text-xs font-bold text-sky-600 dark:text-sky-400 uppercase tracking-widest bg-sky-100/60 dark:bg-sky-950/40 px-3.5 py-1.5 rounded-full">
            Our Educational Methodology
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
            {t("whyChooseTitle")}
          </h2>
          <p className="text-slate-600 dark:text-slate-300">
            {t("whyChooseSub")}
          </p>
        </div>

        {/* Bento/Grid style cards with 3D lifts on hover */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {points.map((pt, idx) => {
            const Icon = pt.icon;
            return (
              <div 
                key={idx}
                className="group relative bg-white dark:bg-slate-950 rounded-2xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-lg hover:-translate-y-1.5 transition-all duration-300"
              >
                <div className="flex justify-between items-center mb-4">
                  <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-sky-100 text-sky-700 dark:bg-sky-950/45 dark:text-sky-300 group-hover:scale-110 transition-transform">
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="text-[9px] uppercase font-extrabold tracking-wider bg-slate-100 dark:bg-slate-905 px-2 py-0.5 rounded text-slate-500 dark:text-slate-300">
                    {pt.badge}
                  </span>
                </div>

                <h4 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">
                  {pt.title}
                </h4>

                <p className="text-slate-500 dark:text-slate-400 text-xs mt-2 leading-relaxed">
                  {pt.desc}
                </p>

                {/* Micro hover icon */}
                <span className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity text-sky-500">
                  <ArrowUpRight className="h-4 w-4" />
                </span>
              </div>
            );
          })}
        </div>

        {/* Motivation Board inside why choose us */}
        <div className="mt-12 bg-gradient-to-r from-sky-600 to-indigo-700 dark:from-sky-955 dark:to-indigo-950 rounded-2xl p-8 text-white relative overflow-hidden shadow-xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-[80px]" />
          
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center cursor-default">
            
            {/* Left copy (Col 8) */}
            <div className="md:col-span-8 text-left space-y-4">
              <h3 className="text-xl sm:text-2xl font-extrabold">Have questions about locations or standard syllabus?</h3>
              <p className="text-sky-100 text-xs sm:text-sm leading-relaxed max-w-2xl">
                Our support lines are ready to explain customized lesson plans, parent dashboards, school timings, and fees offline/online. Reach out on WhatsApp or schedule a counselor call.
              </p>
              <div className="flex flex-wrap gap-4 pt-1">
                <a 
                  href="https://wa.me/916300227011"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-xl bg-white text-indigo-700 hover:bg-slate-100 font-extrabold px-5 py-2.5 text-xs tracking-tight shadow-md transition-all active:scale-95 inline-flex items-center gap-1.5"
                >
                  <span>WhatsApp Enquiry Group: 6300227011</span>
                </a>
              </div>
            </div>

            {/* Right bullet points (Col 4) */}
            <div className="md:col-span-4 bg-white/10 backdrop-blur rounded-2xl p-4 sm:p-5 text-left border border-white/10 space-y-3">
              <p className="text-xs uppercase font-extrabold tracking-wider text-sky-100">Guaranteed Highlights</p>
              <div className="space-y-2">
                {[
                  "Personalized Parent Dashboard",
                  "Unique IDs for Student tracking",
                  "Verified Tutors feedback diary",
                  "WhatsApp support built-in for support"
                ].map((item, id) => (
                  <div key={id} className="flex items-center gap-2 text-xs">
                    <CheckSquare className="h-4 w-4 text-sky-300 shrink-0" />
                    <span className="font-medium text-slate-100">{item}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}
