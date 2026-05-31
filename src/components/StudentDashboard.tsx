/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { 
  GraduationCap, Calendar, Clock, BookOpen, Film, HelpCircle, 
  CheckCircle, ArrowUpRight, TrendingUp, Sparkles, User, Video, 
  MapPin, AlertCircle, FileText, Download 
} from "lucide-react";
import { Student } from "../types";

interface StudentDashboardProps {
  currentStudent: Student;
  onLogout: () => void;
}

export function StudentDashboard({ currentStudent, onLogout }: StudentDashboardProps) {
  const [activeVideo, setActiveVideo] = useState(
    currentStudent.videoResources?.[0]?.title || "Intro to Thermodynamics Lecture"
  );
  const [syllabusNoticeOpen, setSyllabusNoticeOpen] = useState(false);

  // Growth Chart logic mapping term/GPA list
  const resultsData = currentStudent.results || [];
  const maxGPA = 4.0;

  const handleSupportClick = () => {
    const textMsg = encodeURIComponent(
      `Hello Admin! I am student: ${currentStudent.name} (ID: ${currentStudent.id}, ${currentStudent.grade}). I need help with my class timings & support. Please guide!`
    );
    // WhatsApp redirect [6300227011]
    const whatsappUrl = `https://wa.me/916300227011?text=${textMsg}`;
    window.open(whatsappUrl, "_blank");
  };

  const handleSyllabusDownload = () => {
    setSyllabusNoticeOpen(true);
    setTimeout(() => {
      setSyllabusNoticeOpen(false);
    }, 4000);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 sm:p-6 lg:p-8 transition-colors duration-300">
      <div className="mx-auto max-w-7xl space-y-6">
        
        {/* Top welcome profile bar */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex items-center gap-4 text-left">
            <div className="h-14 w-14 rounded-2xl bg-gradient-to-tr from-sky-400 to-indigo-600 flex items-center justify-center text-white shadow-md">
              <User className="h-7 w-7" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-black text-sky-600 dark:text-sky-400 uppercase tracking-widest bg-sky-50 dark:bg-sky-950/40 px-2.5 py-1 rounded-md">
                  Active Student Portal
                </span>
                <span className="text-xs text-slate-400 dark:text-slate-500 font-bold">
                  ID: {currentStudent.id}
                </span>
              </div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                Welcome back, {currentStudent.name}!
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                {currentStudent.grade} • {currentStudent.section} Tracker
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleSupportClick}
              className="rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold px-5 py-3 text-xs tracking-tight shadow-sm transition-all active:scale-95 inline-flex items-center gap-1.5"
            >
              <HelpCircle className="h-4 w-4" />
              <span>WhatsApp Support (6300227011)</span>
            </button>
            <button
              onClick={onLogout}
              className="rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 dark:border-slate-800 dark:text-slate-350 dark:hover:bg-slate-850 font-bold px-4 py-3 text-xs tracking-tight transition-colors"
            >
              Log Out
            </button>
          </div>
        </div>

        { syllabusNoticeOpen && (
          <div className="bg-sky-50 dark:bg-sky-950/45 border border-sky-200 dark:border-sky-900 rounded-2xl p-4 text-left text-xs text-sky-700 dark:text-sky-300 font-bold flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-sky-500 animate-bounce" />
            <span>Academic syllabus document download initialized safely! PDF (SYLLABUS_V2) exported.</span>
          </div>
        )}

        {/* Primary Dashboard Body layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* LEFT: Subjects, Results, and Video Player (Col 8) */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* 1. Subjects Learning progress layout */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 text-left">
              <h3 className="text-sm font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-4">Subjects Currently Learning</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {currentStudent.learningSubjects.map((sub, idx) => (
                  <div key={idx} className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-100 dark:border-slate-850 space-y-2">
                    <div className="flex justify-between items-start">
                      <h4 className="text-xs font-extrabold text-slate-800 dark:text-slate-200 max-w-[70%]">{sub.name}</h4>
                      <span className="text-[10px] font-bold text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/30 px-2 py-0.5 rounded">
                        Week {sub.completedWeeks} Completed
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-1">
                      <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                        <div 
                          className="bg-sky-500 h-full rounded-full transition-all duration-500" 
                          style={{ width: `${sub.completedPercentage}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-[10px] text-slate-500">
                        <span>Course Completion</span>
                        <span className="font-bold">{sub.completedPercentage}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 2. Results & GPA Growth Chart (Dynamic Render) */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 text-left">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-sm font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">Academic Growth Chart</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Term-by-term GPA growth trends across evaluations</p>
                </div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-sky-600 dark:text-sky-400">
                  <TrendingUp className="h-4 w-4" />
                  <span>Growth Pace: Superb</span>
                </div>
              </div>

              {/* Responsive SVG-driven Bar Graph Chart representing real scores */}
              <div className="relative h-64 w-full flex items-end gap-3 sm:gap-6 pt-6 border-b border-l border-slate-200 dark:border-slate-800 px-4">
                
                {/* Visual grid ticks represent GPA */}
                <div className="absolute left-2 top-0 text-[9px] font-mono text-slate-400">4.0 GPA Max</div>
                <div className="absolute left-2 top-1/2 text-[9px] font-mono text-slate-400">2.0 GPA Average</div>

                {resultsData.map((res, index) => {
                  const percentHeight = Math.max(10, Math.min(100, (res.gpa / maxGPA) * 100));
                  return (
                    <div key={index} className="flex-1 flex flex-col items-center group cursor-pointer relative">
                      
                      {/* Floating tooltip displaying detailed grades on hover */}
                      <div className="absolute bottom-[105%] bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-950 p-2.5 rounded-xl opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all z-20 pointer-events-none text-[10px] space-y-1 shadow-lg w-36">
                        <p className="font-bold border-b border-white/10 dark:border-black/10 pb-0.5">{res.term} Report</p>
                        <p>Maths score: {res.mathsScore || 85}</p>
                        <p>Physics score: {res.physicsScore || 88}</p>
                        <p>Literature score: {res.literatureScore || 90}</p>
                        <p className="text-sky-400 dark:text-sky-600 font-extrabold">Final GPA: {res.gpa}</p>
                      </div>

                      {/* Animated Column Bar */}
                      <div className="w-full max-w-[40px] bg-gradient-to-t from-indigo-600 to-sky-500 rounded-t-lg transition-all group-hover:from-indigo-500 group-hover:to-sky-450 relative flex items-end justify-center"
                        style={{ height: `${percentHeight}%` }}
                      >
                        <span className="text-[10px] font-bold text-white mb-2">{res.gpa}</span>
                      </div>

                      {/* Bottom axis tag */}
                      <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 mt-2 whitespace-nowrap">
                        {res.term}
                      </span>
                    </div>
                  );
                })}
              </div>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 text-center mt-3 italic">Hover over the bars to inspect subjects syllabus scores & test logs</p>
            </div>

            {/* 3. Syllabus & Video interactive lectures player */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 text-left">
              <h3 className="text-sm font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-4">Topic Lectures & Syllabus Video Resources</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                
                {/* List of lectures */}
                <div className="md:col-span-5 space-y-2">
                  {[
                    { title: "Intro to Thermodynamics Lecture", duration: "15 mins", type: "Physics" },
                    { title: "Quadratic Equations Masterclass", duration: "25 mins", type: "Maths" },
                    { title: "Binary Algorithms & Matrix", duration: "18 mins", type: "Comp Sci" }
                  ].map((vid, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveVideo(vid.title)}
                      className={`w-full p-3 rounded-xl border text-left transition-colors flex items-center justify-between ${
                        activeVideo === vid.title 
                          ? "bg-sky-50 dark:bg-sky-950/40 border-sky-400 text-sky-700 dark:text-sky-300 font-bold" 
                          : "border-slate-100 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-850 text-slate-750 dark:text-slate-300"
                      }`}
                    >
                      <div className="space-y-0.5">
                        <p className="text-xs">{vid.title}</p>
                        <p className="text-[10px] opacity-70">{vid.type} • {vid.duration}</p>
                      </div>
                      <Film className={`h-4.5 w-4.5 shrink-0 ${activeVideo === vid.title ? "text-sky-600" : "text-slate-400"}`} />
                    </button>
                  ))}
                </div>

                {/* Video Simulator Area */}
                <div className="md:col-span-7 bg-slate-950 rounded-2xl aspect-[16/10] overflow-hidden relative flex flex-col justify-center items-center p-6 border border-slate-800 text-center">
                  
                  {/* Mock Background */}
                  <div className="absolute inset-0 bg-cover opacity-20 filter blur"
                    style={{ backgroundImage: `url('https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=400&q=80')` }}
                  />

                  <div className="z-10 space-y-3 p-4">
                    <div className="h-12 w-12 rounded-full bg-sky-500 flex items-center justify-center text-slate-950 mx-auto cursor-pointer hover:scale-110 transition-transform">
                      <Video className="h-6 w-6 stroke-[2.5]" />
                    </div>
                    <p className="text-xs font-black text-white">{activeVideo}</p>
                    <p className="text-[10px] text-slate-400">Clicking play establishes secure screen sharing from local center archives. Authorized for ST-101.</p>
                  </div>

                  <div className="absolute bottom-2 right-2 flex gap-1 z-10 text-[9px] font-mono text-slate-500">
                    <span>1080p Stream</span>
                    <span>•</span>
                    <span>VOD Server</span>
                  </div>
                </div>

              </div>
            </div>

          </div>

          {/* RIGHT SIDE: Attendance, class timings, upcoming events (Col 4) */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* 1. Academic attendance progress */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 text-left space-y-4">
              <h3 className="text-sm font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">Present & Attendance Log</h3>
              
              <div className="flex items-center gap-4">
                {/* Circular Percentage visual indicator */}
                <div className="relative h-20 w-20 flex items-center justify-center rounded-full bg-sky-50 dark:bg-slate-900 border-4 border-sky-400">
                  <span className="text-base font-black text-sky-700 dark:text-sky-305">{currentStudent.attendanceRate}%</span>
                </div>
                <div>
                  <p className="text-xs font-extrabold text-slate-800 dark:text-white">Exceptional Consistency</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Your record qualifies for the top academic tier.</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-center text-xs">
                <div className="bg-slate-50 dark:bg-slate-950 p-2.5 rounded-xl border border-slate-100 dark:border-slate-850">
                  <span className="text-slate-500 text-[10px] block font-medium">Days Present</span>
                  <span className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400">{currentStudent.presentCount} days</span>
                </div>
                <div className="bg-slate-50 dark:bg-slate-950 p-2.5 rounded-xl border border-slate-100 dark:border-slate-850">
                  <span className="text-slate-500 text-[10px] block font-medium">Days Absent</span>
                  <span className="text-sm font-extrabold text-rose-500">{currentStudent.absentCount} days</span>
                </div>
              </div>
            </div>

            {/* 2. Upcoming events and assignments */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 text-left space-y-3">
              <h3 className="text-sm font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">Upcoming Assignments</h3>
              
              <div className="space-y-3">
                {currentStudent.upcomingEvents.length > 0 ? (
                  currentStudent.upcomingEvents.map((ev, id) => (
                    <div key={id} className="p-3 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-850 space-y-2">
                      <div className="flex justify-between items-start">
                        <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-400">
                          {ev.badge}
                        </span>
                        <span className="text-[9px] text-slate-400 font-mono italic flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {ev.time}
                        </span>
                      </div>
                      <p className="text-xs font-bold text-slate-800 dark:text-white leading-tight">{ev.title}</p>
                      <p className="text-[11px] text-slate-500 leading-normal">{ev.description}</p>
                      
                      {ev.attachment && (
                        <button
                          onClick={handleSyllabusDownload}
                          className="w-full mt-1.5 flex items-center justify-center gap-1.5 rounded-xl bg-sky-50 dark:bg-sky-950 py-2 border border-sky-100 dark:border-sky-900 font-extrabold text-[10px] text-sky-700 dark:text-sky-305 hover:bg-sky-100/50"
                        >
                          <Download className="h-3 w-3" />
                          <span>View Attachment • {ev.attachment}</span>
                        </button>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="p-6 bg-slate-50 dark:bg-slate-950 rounded-2xl text-center text-slate-400">
                    <CheckCircle className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                    <p className="text-xs">No pending assignments! You are all caught up.</p>
                  </div>
                )}
              </div>
            </div>

            {/* 3. Class timings & syllabus lookup */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 text-left space-y-3">
              <h3 className="text-sm font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">Class Timings & Mode</h3>
              
              <div className="space-y-2.5">
                {currentStudent.classTimings.map((time, idx) => (
                  <div key={idx} className="flex justify-between items-center py-2.5 border-b border-slate-100 dark:border-slate-800 last:border-none">
                    <div className="space-y-0.5">
                      <p className="text-xs font-bold text-slate-800 dark:text-white leading-none">{time.subject}</p>
                      <p className="text-[10px] text-slate-500 font-medium">{time.day}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-black text-slate-900 dark:text-white">{time.time}</p>
                      <span className={`inline-block text-[9px] font-extrabold tracking-wider uppercase px-2 py-0.5 rounded mt-1 ${
                        time.mode === "Online" ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300" : "bg-orange-50 text-orange-700 dark:bg-orange-950/40 dark:text-orange-400"
                      }`}>
                        {time.mode}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
