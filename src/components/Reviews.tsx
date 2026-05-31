/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { Star, Quote, MapPin } from "lucide-react";

export function Reviews() {
  const testimonials = [
    {
      name: "Ananya Reddy",
      city: "Hyderabad",
      standard: "Class 10",
      rating: 5,
      review: "Academy Flow completely changed my approach to Mathematics. The tutors here explain complex concepts with such ease that I started loving the subject I once feared. The metrics page helped my mom stay relaxed!",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80"
    },
    {
      name: "Siddharth Rao",
      city: "Warangal",
      standard: "Class 9",
      rating: 5,
      review: "The weekly assessments and parent-teacher meetings kept me focused. I moved from 75% to 92% in my final exams thanks to the personalized attention and help from Prof. Julian. Highly recommended for logic building!",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80"
    },
    {
      name: "Kavya P.",
      city: "Karimnagar",
      standard: "Class 8",
      rating: 5,
      review: "The quality of teaching is unparalleled. The teachers are very patient and focus on conceptual understanding rather than just rote learning. The parent dashboard made online/offline coordination very simple.",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&q=80"
    }
  ];

  return (
    <section className="bg-white dark:bg-slate-950 py-16 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
      <div className="mx-auto max-w-7xl">
        
        {/* Title */}
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-12">
          <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest bg-indigo-50 dark:bg-indigo-950/40 px-3 py-1 rounded-full">
            Success Stories
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
            Hear from Our High Achievers
          </h2>
          <p className="text-slate-600 dark:text-slate-400">
            Real feedback from pupils and parents who experienced the Academy Flow learning system. All reviews are verified by independent counselor registries.
          </p>
        </div>

        {/* Testimonials with 3D Hover & lifting shadows */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((test, index) => {
            return (
              <div
                key={index}
                className="group relative flex flex-col justify-between rounded-3xl border border-slate-100 bg-slate-50 p-8 shadow-sm hover:shadow-xl hover:bg-white hover:-translate-y-2 hover:border-sky-300 dark:border-slate-800 dark:bg-slate-900/60 dark:hover:bg-slate-900 dark:hover:border-sky-500 transition-all duration-300 transform"
                style={{ contentVisibility: "auto" }}
              >
                
                {/* Quotation icon */}
                <div className="absolute top-6 right-8 text-sky-200/60 dark:text-slate-800 opacity-60 group-hover:scale-110 transition-transform">
                  <Quote className="h-8 w-8" />
                </div>

                <div className="space-y-4">
                  {/* Star Rating */}
                  <div className="flex gap-1">
                    {Array.from({ length: test.rating }).map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>

                  {/* Feedback text */}
                  <p className="text-slate-600 dark:text-slate-300 text-xs sm:text-sm leading-relaxed italic">
                    "{test.review}"
                  </p>
                </div>

                {/* Profile Portrait */}
                <div className="flex items-center gap-3.5 mt-6 pt-5 border-t border-slate-200/50 dark:border-slate-800">
                  <img
                    src={test.avatar}
                    alt={test.name}
                    className="h-10 w-10 rounded-full object-cover border border-slate-200 shadow-sm"
                  />
                  <div>
                    <h5 className="font-extrabold text-sm text-slate-900 dark:text-white">
                      {test.name}
                    </h5>
                    <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 font-medium">
                      <span>{test.standard}</span>
                      <span className="h-1 w-1 rounded-full bg-slate-350" />
                      <span className="flex items-center gap-0.5 text-sky-600 dark:text-sky-400">
                        <MapPin className="h-3 w-3 shrink-0" />
                        {test.city}
                      </span>
                    </div>
                  </div>
                </div>

              </div>
            );
          })}
        </div>

        {/* Picture widget that motivates users to reach out */}
        <div className="mt-16 bg-gradient-to-tr from-slate-900 to-slate-950 dark:from-slate-950 dark:to-slate-900 rounded-3xl p-8 sm:p-12 text-white shadow-2xl border border-slate-850 overflow-hidden relative">
          <div className="absolute bottom-[-100px] left-[-100px] w-96 h-96 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />
          <div className="absolute top-[-100px] right-[-100px] w-96 h-96 rounded-full bg-sky-500/10 blur-3xl pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            <div className="lg:col-span-4 flex justify-center">
              <div className="relative p-1.5 bg-gradient-to-tr from-sky-400 to-indigo-500 rounded-3xl shadow-xl">
                <img
                  src="https://images.unsplash.com/photo-1543269865-cbf427effbad?auto=format&fit=crop&w=400&q=80"
                  alt="Students motivated in Hyderabad class"
                  className="rounded-2xl max-w-full h-44 sm:h-52 object-cover"
                />
                <span className="absolute -bottom-4 -right-4 bg-yellow-400 text-slate-950 font-black rounded-lg px-3 py-1.5 text-xs shadow-md uppercase tracking-wider animate-bounce">
                  Apply Today!
                </span>
              </div>
            </div>

            <div className="lg:col-span-8 text-left space-y-4">
              <span className="text-[10px] font-bold text-sky-400 uppercase tracking-widest bg-white/10 px-3 py-1 rounded-full">
                Interactive Learning Hub
              </span>
              <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Motivated To Unlock Your True Academic Potential?</h3>
              <p className="text-slate-300 text-xs sm:text-sm leading-relaxed max-w-2xl">
                Join thousands of students who have redefined how they learn, build logic, and conquer board examinations. Academy Flow bridges parents, expert tutors, and administrators with cutting-edge analytics and instant WhatsApp support lines.
              </p>
              <div className="flex flex-wrap gap-4 pt-1">
                <a
                  href="https://wa.me/916300227011"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-xl bg-sky-500 text-slate-950 hover:bg-sky-400 font-extrabold px-6 py-3 text-xs tracking-tight transition-all active:scale-95 inline-flex items-center gap-1.5"
                >
                  Book Demo At Admin Desk: 6300227011
                </a>
              </div>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}
