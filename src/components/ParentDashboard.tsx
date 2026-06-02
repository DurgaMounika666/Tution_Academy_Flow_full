/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { 
  Users, MapPin, PhoneCall, DollarSign, CheckCircle2, AlertCircle, 
  HelpCircle, ChevronRight, BookOpen, GraduationCap, Clock, PlusCircle,
  TrendingUp, CreditCard, Sparkles, X, ToggleLeft, ArrowRight,
  MessageSquare, Bell, Settings, Award, Calendar, FileText, User, LayoutDashboard, Send
} from "lucide-react";
import { apiClient } from "../services/apiClient";
import { Student, Tutor, FeePayment } from "../types";
import { SUBJECTS_BY_CLASS, STANDARDS, LOCATIONS } from "../data";

interface ParentDashboardProps {
  students: Student[];
  tutors: Tutor[];
  fees: FeePayment[];
  onUpdateFees: (updatedFees: FeePayment[]) => void;
  onUpdateStudents: (updatedStudents: Student[]) => void;
  onLogout: () => void;
}

export function ParentDashboard({ 
  students, tutors, fees, onUpdateFees, onUpdateStudents, onLogout 
}: ParentDashboardProps) {
  
  // Choose which child is viewing
  const [selectedStudentId, setSelectedStudentId] = useState("ST-101"); // Default to ST-101 (Alex Johnson) or first available
  const activeStudent = students.find((s) => s.id === selectedStudentId) || students[0];

  const normalizeFee = (apiFee: any): FeePayment => ({
    id: apiFee.feeId || apiFee._id || apiFee.id || "",
    studentId: apiFee.studentId || "",
    studentName: apiFee.studentName || "",
    title: apiFee.title || "Fee Payment",
    amount: apiFee.amount ?? 0,
    status: apiFee.status || "Pending",
    dueDate: apiFee.dueDate || new Date().toISOString().split("T")[0],
    transactionId: apiFee.transactionId
  });

  // Active Tab/Menu state for the Sidebar
  const [activeTab, setActiveTab] = useState<string>("dashboard");

  // Roll out subjects Wizard State
  const [wizardOpen, setWizardOpen] = useState(false);
  const [wizardStep, setWizardStep] = useState(1);
  const [wizardClass, setWizardClass] = useState("9th Class");
  const [wizardSubjects, setWizardSubjects] = useState<string[]>([]);
  const [wizardMode, setWizardMode] = useState<"Online" | "Offline">("Online");
  const [wizardTutorId, setWizardTutorId] = useState("T-201");
  const [wizardLocation, setWizardLocation] = useState("Hyderabad");

  // General Support redirect state
  const [supportChoice, setSupportChoice] = useState<"tutor" | "admin">("admin");

  const [paymentSuccessMsg, setPaymentSuccessMsg] = useState("");

  const handlePayFee = async (feeId: string) => {
    try {
      const transactionId = `AF-TXN-${Math.floor(10000 + Math.random() * 90000)}`;
      const paid = await apiClient.fees.markAsPaid(feeId, transactionId, "Card");
      const updated = fees.map((f) => {
        if (f.id === feeId) {
          return normalizeFee(paid);
        }
        return f;
      });
      onUpdateFees(updated);
      setPaymentSuccessMsg("Invoice payment processed successfully! Checkout complete.");
      setTimeout(() => setPaymentSuccessMsg(""), 4000);
    } catch (error) {
      console.warn("Unable to mark fee as paid", error);
      setPaymentSuccessMsg("Unable to process payment. Try again later.");
      setTimeout(() => setPaymentSuccessMsg(""), 4000);
    }
  };

  // Compute pricing
  const subBaseFee = wizardMode === "Online" ? 200 : 350;
  const computedFee = subBaseFee + (wizardSubjects.length * 150);

  const toggleSubjectSelect = (sub: string) => {
    if (wizardSubjects.includes(sub)) {
      setWizardSubjects(wizardSubjects.filter((s) => s !== sub));
    } else {
      setWizardSubjects([...wizardSubjects, sub]);
    }
  };

  const handleResolveWizard = async () => {
    if (wizardSubjects.length === 0) {
      alert("Please check at least one learning subject.");
      return;
    }

    try {
      await apiClient.students.addSubjects(selectedStudentId, wizardSubjects);
      await apiClient.students.assignTutor(selectedStudentId, wizardTutorId);

      const updatedStudents = students.map((s) => {
        if (s.id === selectedStudentId) {
          const currentSubs = s.learningSubjects.map((sub) => sub.name);
          const nextSubsObj = [...s.learningSubjects];

          wizardSubjects.forEach((sub) => {
            if (!currentSubs.includes(sub)) {
              nextSubsObj.push({
                name: sub,
                completedPercentage: 0,
                completedWeeks: 0
              });
            }
          });

          const nextTimings = [...s.classTimings];
          wizardSubjects.forEach((sub) => {
            if (!nextTimings.find(t => t.subject === sub)) {
              nextTimings.push({
                subject: sub,
                time: "03:30 PM",
                day: "Monday, Thursday",
                mode: wizardMode
              });
            }
          });

          return {
            ...s,
            learningSubjects: nextSubsObj,
            classTimings: nextTimings
          };
        }
        return s;
      });

      onUpdateStudents(updatedStudents);

      const newInvoice: FeePayment = {
        id: `FP-NEW-${Math.floor(1000 + Math.random() * 9000)}`,
        studentId: selectedStudentId,
        studentName: activeStudent.name,
        title: `Rollout: ${wizardSubjects.join(", ")} (${wizardClass})`,
        amount: computedFee,
        status: "Paid",
        dueDate: "2026-06-30",
        transactionId: `AF-AUTO-${Math.floor(50000 + Math.random() * 49999)}`
      };

      onUpdateFees([newInvoice, ...fees]);

      const tutorObj = tutors.find(t => t.id === wizardTutorId) || tutors[0];
      const textMsg = encodeURIComponent(
        `Hello Academy Flow institution! I am parent of ${activeStudent.name}. We bought a new subject module: ${wizardSubjects.join(", ")} for class: ${wizardClass}. Selection mode: ${wizardMode}. Assigned Tutor: ${tutorObj.name}, Location center: ${wizardLocation}. Calculated tuition fee total: $${computedFee}. Confirmed details.`
      );
      const waUrl = `https://wa.me/916300227011?text=${textMsg}`;

      setWizardOpen(false);
      setWizardStep(1);
      setWizardSubjects([]);
      setPaymentSuccessMsg(`Success! Rollout registered and tuition receipt created. Redirecting receipt confirmation to Whatsapp.`);
      setTimeout(() => {
        setPaymentSuccessMsg("");
        window.open(waUrl, "_blank");
      }, 3000);
    } catch (error) {
      console.warn("Unable to resolve wizard subjects", error);
      alert("There was a problem registering the selected subjects. Please try again.");
    }
  };

  const handleWhatsAppTalk = () => {
    let destNum = "916300227011"; // admin default
    let segment = "Admin institution desk";
    if (supportChoice === "tutor") {
      destNum = "91954239546"; // tutors enquiry line
      segment = "Tutor Enquiry counselor";
    }

    const textMsg = encodeURIComponent(
      `Hello Academy Flow! This is the parent of ${activeStudent.name} (Grade: ${activeStudent.grade}). We'd like to perform a conversation with the ${segment} about our child's attendance & grades growth.`
    );
    window.open(`https://wa.me/${destNum}?text=${textMsg}`, "_blank");
  };

  // Get children from user's standard lists
  const currentChildFees = fees.filter((f) => f.studentId === activeStudent.id);
  const pendingFeesAmount = currentChildFees.filter(f => f.status === "Pending").reduce((acc, curr) => acc + curr.amount, 0);
  const paidFeesAmount = currentChildFees.filter(f => f.status === "Paid").reduce((acc, curr) => acc + curr.amount, 0);

  const activeStudentTutors = tutors.filter((t) => activeStudent.assignedTutorIds.includes(t.id));

  // Predefined parent name from greeting mockup
  const parentName = "Robert Johnson";

  // Sidebar Menu Items
  const sidebarItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "my-child", label: "My Child", icon: User },
    { id: "attendance", label: "Attendance", icon: Clock },
    { id: "results", label: "Results", icon: Award },
    { id: "fees", label: "Fee Payments", icon: DollarSign },
    { id: "tutors", label: "Tutor Details", icon: BookOpen },
    { id: "schedule", label: "Schedule", icon: Calendar },
    { id: "messages", label: "Messages", icon: MessageSquare },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "support", label: "Support", icon: HelpCircle },
    { id: "profile", label: "Profile", icon: User },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col md:flex-row transition-colors duration-300">
      
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-[#3f2115] dark:bg-[#20100a] text-amber-50 flex flex-col justify-between p-5 border-r border-[#4e2c1e] shrink-0">
        <div className="space-y-6">
          {/* Logo Brand Header */}
          <div className="flex items-center gap-2.5 pb-4 border-b border-white/10">
            <span className="p-2 bg-[#f27a3d] rounded-xl text-white shadow-lg">
              <Users className="h-5 w-5" />
            </span>
            <span className="font-extrabold text-sm tracking-widest text-white uppercase">
              Institution CRM
            </span>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1 text-left">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    if (item.id === "support") {
                      // Trigger support or alert
                    }
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all ${
                    isActive 
                      ? "bg-[#f27a3d] text-white shadow-md transform scale-[1.02]" 
                      : "text-amber-200/70 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <Icon className="h-4.5 w-4.5 shrink-0" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* User Card Profile Footer */}
        <div className="pt-4 border-t border-white/10 mt-6 flex items-center justify-between gap-3 text-left">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-full bg-[#f27a3d]/20 text-[#f27a3d] flex items-center justify-center font-bold text-sm border border-[#f27a3d]/30">
              RJ
            </div>
            <div>
              <p className="text-xs font-black text-white leading-tight">{parentName}</p>
              <p className="text-[10px] text-amber-200/50">Parent Member</p>
            </div>
          </div>
          <button 
            onClick={onLogout}
            className="text-[10px] uppercase font-black tracking-wider text-amber-200/60 hover:text-[#f27a3d] transition-colors"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Main Panel Content Area */}
      <main className="flex-grow p-4 sm:p-6 lg:p-8 space-y-6 overflow-y-auto">
        
        {/* Portal Greeting Board */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 text-left">
          <div className="space-y-1">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white">
              Welcome back, {parentName.split(" ")[0]} 👋
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Here's your child's progress overview.
            </p>
          </div>

          {/* Child Selection Dropdown */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-tight">Select Child:</label>
              <select
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                className="px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl text-xs font-extrabold text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-[#f27a3d]/20 transition-all cursor-pointer"
              >
                {students.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.grade})
                  </option>
                ))}
              </select>
            </div>

            {/* Premium "Roll Out New Subjects" Action Button */}
            <button
              onClick={() => { setWizardStep(1); setWizardOpen(true); }}
              className="px-4.5 py-2.5 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 hover:from-sky-450 hover:to-indigo-500 font-extrabold text-white text-xs tracking-tight shadow-md hover:shadow-lg transform active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
              title="Roll out custom subjects configuration"
            >
              <Sparkles className="h-4 w-4 text-yellow-300 animate-pulse" />
              <span>Roll Out New Subjects</span>
            </button>
          </div>
        </div>

        {paymentSuccessMsg && (
          <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 p-4 rounded-xl text-xs text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-2 text-left">
            <CheckCircle2 className="h-5 w-5 animate-pulse text-emerald-500 shrink-0" />
            <span>{paymentSuccessMsg}</span>
          </div>
        )}

        {/* 4 Stats Cards Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-left">
          {/* Card 1: Attendance */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col justify-between h-28">
            <span className="text-[10px] uppercase font-extrabold tracking-wider text-slate-400">Attendance</span>
            <div className="flex items-baseline justify-between mt-2">
              <span className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400">
                {activeStudent.attendanceRate}%
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-450 font-bold">
                Good
              </span>
            </div>
          </div>

          {/* Card 2: Latest Result */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col justify-between h-28">
            <span className="text-[10px] uppercase font-extrabold tracking-wider text-slate-400">Latest Result</span>
            <div className="flex items-baseline justify-between mt-2">
              <span className="text-2xl sm:text-3xl font-black text-indigo-600 dark:text-indigo-400">
                A+
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/30 text-indigo-650 dark:text-indigo-400 font-bold">
                Top Rank
              </span>
            </div>
          </div>

          {/* Card 3: Pending Fees */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col justify-between h-28">
            <span className="text-[10px] uppercase font-extrabold tracking-wider text-slate-400">Pending Fees</span>
            <div className="flex items-baseline justify-between mt-2">
              <span className="text-2xl sm:text-3xl font-black text-rose-500">
                ${pendingFeesAmount}
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-455 font-bold">
                Due
              </span>
            </div>
          </div>

          {/* Card 4: Today's Class */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col justify-between h-28">
            <span className="text-[10px] uppercase font-extrabold tracking-wider text-slate-400">Today's Class</span>
            <div className="mt-2 text-left">
              <span className="text-lg sm:text-xl font-black text-slate-900 dark:text-white block leading-tight">
                {activeStudent.classTimings?.[0]?.time || "10:00 AM"}
              </span>
              <span className="text-[10px] text-slate-500 font-bold block truncate">
                {activeStudent.classTimings?.[0]?.subject || "Web Development"}
              </span>
            </div>
          </div>
        </div>

        {/* Dashboard Panels Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-left">
          
          {/* Left Column (Col-7) */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Child Overview Details */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 space-y-5">
              <h3 className="text-xs uppercase font-extrabold tracking-wider text-slate-400">Child Overview</h3>
              
              <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
                <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
                  <div className="h-16 w-16 rounded-full bg-[#f27a3d]/10 text-[#f27a3d] border-2 border-[#f27a3d]/20 flex items-center justify-center font-extrabold text-xl overflow-hidden shadow-sm">
                    {activeStudent.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="text-lg font-black text-slate-900 dark:text-white leading-tight">{activeStudent.name}</h4>
                    <p className="text-xs text-slate-500 mt-1">{activeStudent.grade} — {activeStudent.section || "STEM"}</p>
                    <p className="text-[10px] font-bold text-slate-400 mt-0.5">Parent Ledger Address: {activeStudent.parentEmail}</p>
                  </div>
                </div>

                <div className="flex gap-2 bg-slate-50 dark:bg-slate-950 p-2.5 rounded-2xl border border-slate-100 dark:border-slate-850 shrink-0">
                  <div className="text-center px-3.5 border-r border-slate-200 dark:border-slate-800">
                    <span className="text-[9px] uppercase font-bold text-slate-400 block">Total Tests</span>
                    <span className="text-base font-black text-slate-900 dark:text-white">18</span>
                  </div>
                  <div className="text-center px-3.5">
                    <span className="text-[9px] uppercase font-bold text-slate-400 block">Average Score</span>
                    <span className="text-base font-black text-emerald-600 dark:text-emerald-450">87%</span>
                  </div>
                </div>
              </div>

              {/* Progress Tracker Slider */}
              <div className="space-y-2.5">
                <div className="flex justify-between items-center text-xs font-bold">
                  <span className="text-slate-650 dark:text-slate-350">Active Subject Modules Syllabus Progression</span>
                  <span className="text-indigo-650 dark:text-indigo-400">75% Course Done</span>
                </div>
                <div className="h-2.5 w-full bg-slate-105 dark:bg-slate-800 rounded-full overflow-hidden flex">
                  <div className="h-full bg-gradient-to-r from-sky-400 to-[#f27a3d]" style={{ width: "75%" }} />
                </div>
              </div>

              {/* Learning Subject breakdown list */}
              <div className="space-y-3 pt-3">
                <span className="text-[10px] uppercase font-extrabold tracking-wider text-slate-400 block">Current Registered Subjects</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {activeStudent.learningSubjects.map((subject, idx) => (
                    <div key={idx} className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-2xl flex items-center justify-between">
                      <div className="space-y-0.5">
                        <span className="text-xs font-extrabold text-slate-800 dark:text-white block">{subject.name}</span>
                        <span className="text-[10px] text-slate-500">Completed: {subject.completedWeeks} weeks</span>
                      </div>
                      <span className="text-xs font-black text-[#f27a3d] bg-[#f27a3d]/10 px-2.5 py-1 rounded-lg">
                        {subject.completedPercentage}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Fee Payment Section */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-xs uppercase font-extrabold tracking-wider text-slate-400">Fee Payment</h3>
                <span className="text-[10px] font-bold text-slate-400">Last Payment: ${paidFeesAmount} (Paid)</span>
              </div>

              <div className="space-y-3">
                {currentChildFees.map((fee) => (
                  <div key={fee.id} className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div className="text-left space-y-0.5">
                      <h4 className="text-xs font-extrabold text-slate-800 dark:text-white leading-tight">{fee.title}</h4>
                      <p className="text-[10px] text-slate-500">Due Date: {fee.dueDate}</p>
                    </div>

                    <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                      <span className="text-sm font-black text-slate-900 dark:text-white">${fee.amount}</span>
                      {fee.status === "Pending" ? (
                        <button
                          onClick={() => handlePayFee(fee.id)}
                          className="px-4 py-2 bg-[#f27a3d] hover:bg-[#ff8950] text-white font-black text-xs rounded-xl shadow-sm hover:shadow active:scale-95 transition-all shrink-0 cursor-pointer"
                        >
                          Pay Now
                        </button>
                      ) : (
                        <span className="text-[10px] text-emerald-600 dark:text-emerald-450 font-extrabold bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-lg">
                          Paid
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Tutors & Counselor WhatsApp Enquiry */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 space-y-4">
              <div>
                <h3 className="text-xs uppercase font-extrabold tracking-wider text-slate-400">Institutional WhatsApp Desk</h3>
                <p className="text-xs text-slate-550">Select support desk to enquire with counselor staff about your child's growth</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <button
                  type="button"
                  onClick={() => setSupportChoice("tutor")}
                  className={`p-3.5 rounded-2xl border text-left flex justify-between items-center transition-colors ${
                    supportChoice === "tutor"
                      ? "bg-[#f27a3d]/5 dark:bg-[#f27a3d]/10 border-[#f27a3d] text-[#f27a3d] font-bold"
                      : "border-slate-100 hover:bg-slate-50 dark:border-slate-800 text-slate-700 dark:text-slate-350"
                  }`}
                >
                  <div>
                    <p className="text-xs font-bold leading-tight">Tutors Enquiry Desk</p>
                    <p className="text-[10px] opacity-75 mt-0.5">Enquire Counselor (+91 954239546)</p>
                  </div>
                  <input
                    type="radio"
                    name="support_segment"
                    checked={supportChoice === "tutor"}
                    onChange={() => {}}
                    className="accent-[#f27a3d]"
                  />
                </button>

                <button
                  type="button"
                  onClick={() => setSupportChoice("admin")}
                  className={`p-3.5 rounded-2xl border text-left flex justify-between items-center transition-colors ${
                    supportChoice === "admin"
                      ? "bg-[#f27a3d]/5 dark:bg-[#f27a3d]/10 border-[#f27a3d] text-[#f27a3d] font-bold"
                      : "border-slate-100 hover:bg-slate-50 dark:border-slate-800 text-slate-700 dark:text-slate-350"
                  }`}
                >
                  <div>
                    <p className="text-xs font-bold leading-tight">Admin Support Desk</p>
                    <p className="text-[10px] opacity-75 mt-0.5">Contact Campus Desk (+91 6300227011)</p>
                  </div>
                  <input
                    type="radio"
                    name="support_segment"
                    checked={supportChoice === "admin"}
                    onChange={() => {}}
                    className="accent-[#f27a3d]"
                  />
                </button>
              </div>

              <button
                onClick={handleWhatsAppTalk}
                className="w-full bg-[#f27a3d] hover:bg-[#ff8950] text-white font-extrabold py-3.5 rounded-2xl text-xs flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all cursor-pointer"
              >
                <PhoneCall className="h-4 w-4 shrink-0" />
                <span>Enquire Counseling Staff Now</span>
              </button>
            </div>

          </div>

          {/* Right Column (Col-5) */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Today's Schedule Card */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 space-y-4">
              <h3 className="text-xs uppercase font-extrabold tracking-wider text-slate-400">Today's Schedule</h3>
              
              <div className="space-y-3">
                {activeStudent.classTimings.length > 0 ? (
                  activeStudent.classTimings.map((timing, idx) => (
                    <div key={idx} className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-2xl flex items-center justify-between">
                      <div className="text-left space-y-0.5">
                        <span className="text-xs font-extrabold text-slate-800 dark:text-white block leading-tight">{timing.subject}</span>
                        <span className="text-[10px] text-slate-550 flex items-center gap-1">
                          <Clock className="h-3 w-3 shrink-0 text-slate-400" />
                          <span>{timing.day} ({timing.time})</span>
                        </span>
                      </div>
                      <span className="px-2.5 py-1 text-[9px] font-black uppercase tracking-tight rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-650 dark:text-indigo-400">
                        {timing.mode}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400">No classes mapped for today.</p>
                )}
              </div>
            </div>

            {/* Recent Results */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 space-y-4">
              <h3 className="text-xs uppercase font-extrabold tracking-wider text-slate-400">Recent Results</h3>
              
              <div className="space-y-3">
                <div className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-2xl flex justify-between items-center">
                  <div className="space-y-0.5">
                    <span className="text-xs font-extrabold text-slate-800 dark:text-white block leading-tight">React JS Quiz</span>
                    <span className="text-[10px] text-slate-450">May 19, 2026</span>
                  </div>
                  <span className="text-xs font-black text-emerald-600 dark:text-emerald-450 bg-emerald-55/10 px-2.5 py-1 rounded-lg">85%</span>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-2xl flex justify-between items-center">
                  <div className="space-y-0.5">
                    <span className="text-xs font-extrabold text-slate-800 dark:text-white block leading-tight">UI Principles Assessment</span>
                    <span className="text-[10px] text-slate-455">May 18, 2026</span>
                  </div>
                  <span className="text-xs font-black text-emerald-600 dark:text-emerald-450 bg-emerald-55/10 px-2.5 py-1 rounded-lg">92%</span>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-2xl flex justify-between items-center">
                  <div className="space-y-0.5">
                    <span className="text-xs font-extrabold text-slate-800 dark:text-white block leading-tight">Python Programming basics</span>
                    <span className="text-[10px] text-slate-455">May 16, 2026</span>
                  </div>
                  <span className="text-xs font-black text-emerald-650 dark:text-emerald-450 bg-emerald-55/10 px-2.5 py-1 rounded-lg">78%</span>
                </div>
              </div>
            </div>

            {/* Messages Inbox */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 space-y-4">
              <h3 className="text-xs uppercase font-extrabold tracking-wider text-slate-400">Recent Messages</h3>
              
              <div className="space-y-3">
                {activeStudentTutors.map((t, idx) => (
                  <div key={idx} className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-2xl space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <img src={t.image} alt={t.name} className="h-6 w-6 rounded-full object-cover" />
                        <span className="text-xs font-black text-slate-900 dark:text-white leading-none">{t.name}</span>
                      </div>
                      <span className="text-[9px] text-slate-400">10:30 AM</span>
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-slate-350 italic font-medium">
                      "Please ensure she completes the coursework review exercises scheduled for tomorrow morning."
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Notifications Feed */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 space-y-4">
              <h3 className="text-xs uppercase font-extrabold tracking-wider text-slate-400">Recent Notifications</h3>
              
              <div className="space-y-2.5 text-xs">
                <div className="flex items-start gap-2.5 p-2 border-b border-slate-100 dark:border-slate-850">
                  <span className="h-2 w-2 bg-[#f27a3d] rounded-full shrink-0 mt-1.5" />
                  <div>
                    <p className="font-extrabold text-slate-800 dark:text-white">Calculus Diagnostic test scheduled on May 22</p>
                    <p className="text-[9px] text-slate-400 mt-0.5">10:00 AM</p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 p-2 border-b border-slate-100 dark:border-slate-850">
                  <span className="h-2 w-2 bg-amber-500 rounded-full shrink-0 mt-1.5" />
                  <div>
                    <p className="font-extrabold text-slate-850 dark:text-white">Tuition fees due for the upcoming June term modules</p>
                    <p className="text-[9px] text-slate-400 mt-0.5">Yesterday</p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 p-2">
                  <span className="h-2 w-2 bg-indigo-500 rounded-full shrink-0 mt-1.5" />
                  <div>
                    <p className="font-extrabold text-slate-850 dark:text-white">New advanced thermodynamics laboratory report assigned</p>
                    <p className="text-[9px] text-slate-400 mt-0.5">May 18, 2026</p>
                  </div>
                </div>
              </div>
            </div>

          </div>

        </div>

      </main>

      {/* Subject Rollout Wizard Modal */}
      {wizardOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 text-left">
          <div className="w-full max-w-xl bg-white dark:bg-slate-950 rounded-3xl overflow-hidden shadow-2xl border border-slate-150 dark:border-slate-800 flex flex-col">
            
            {/* Modal Header */}
            <div className="bg-slate-50 dark:bg-slate-900 px-6 py-4 border-b border-slate-150 dark:border-slate-800 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-sky-500 flex items-center justify-center text-slate-950">
                  <Sparkles className="h-4.5 w-4.5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900 dark:text-white">Subject Rollout Setup Wizard</h3>
                  <p className="text-[10px] text-slate-550">Configure customized subjects and check fees</p>
                </div>
              </div>
              <button 
                onClick={() => setWizardOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-150 dark:hover:bg-slate-800 text-slate-400"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Wizard progress rail */}
            <div className="bg-slate-100 dark:bg-slate-900 h-1.5 w-full flex">
              {Array.from({ length: 5 }).map((_, i) => (
                <div 
                  key={i} 
                  className={`flex-1 h-full border-r border-white/20 last:border-none transition-colors duration-300 ${
                    wizardStep >= i + 1 ? "bg-gradient-to-r from-sky-400 to-indigo-500" : "bg-slate-200 dark:bg-slate-800"
                  }`}
                />
              ))}
            </div>

            {/* Modal Content body (State Driven) */}
            <div className="p-6 overflow-y-auto max-h-[70vh] flex-1 space-y-4">
              
              {/* STEP 1: Class & Subject Select */}
              {wizardStep === 1 && (
                <div className="space-y-4 animate-fade-in">
                  <div className="space-y-1">
                    <span className="text-[9px] font-extrabold uppercase text-sky-600 dark:text-sky-450 tracking-widest">Step 1 of 5</span>
                    <h4 className="text-base font-black text-slate-900 dark:text-white">Pick Class Class & Subjects</h4>
                    <p className="text-xs text-slate-500">Select standard grade for rollout. Subjects checklists will adapt dynamically.</p>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-extrabold text-slate-600">Select Grade Standard</label>
                    <select
                      value={wizardClass}
                      onChange={(e) => { setWizardClass(e.target.value); setWizardSubjects([]); }}
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-850 dark:bg-slate-900 text-xs font-bold"
                    >
                      {STANDARDS.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-extrabold text-slate-650 block text-slate-700 dark:text-slate-350">Check Subjects to Roll Out:</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {(SUBJECTS_BY_CLASS[wizardClass] || []).map((sub) => {
                        const isChecked = wizardSubjects.includes(sub);
                        return (
                          <button
                            type="button"
                            key={sub}
                            onClick={() => toggleSubjectSelect(sub)}
                            className={`p-2.5 rounded-xl border text-left text-xs font-bold transition-all flex items-center justify-between ${
                              isChecked 
                                ? "bg-indigo-50 border-indigo-400 text-indigo-700 dark:bg-indigo-955 dark:text-indigo-300" 
                                : "border-slate-100 hover:bg-slate-50 dark:border-slate-850 dark:bg-slate-900 text-slate-700 dark:text-slate-350"
                            }`}
                          >
                            <span>{sub}</span>
                            <span className={`h-4 w-4 rounded-full border flex items-center justify-center text-[10px] ${
                              isChecked ? "bg-indigo-650 border-indigo-600 text-white" : "border-slate-300"
                            }`}>
                              {isChecked && "✓"}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2: Mode Select */}
              {wizardStep === 2 && (
                <div className="space-y-4 animate-fade-in">
                  <div className="space-y-1">
                    <span className="text-[9px] font-extrabold uppercase text-sky-600 tracking-widest">Step 2 of 5</span>
                    <h4 className="text-base font-black text-slate-900 dark:text-white">Choose Learning Mode</h4>
                    <p className="text-xs text-slate-500">Pick comfortable online classrooms or nearby traditional offline centers.</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => setWizardMode("Online")}
                      className={`p-6 rounded-2xl border text-left transition-all ${
                        wizardMode === "Online"
                          ? "bg-sky-50 border-sky-400 dark:bg-sky-950/40"
                          : "border-slate-105 hover:bg-slate-50 dark:border-slate-850 dark:bg-slate-900"
                      }`}
                    >
                      <span className="text-sm font-black block text-slate-950 dark:text-white">Online Digital Classroom</span>
                      <span className="text-[10px] text-slate-500 block mt-1 leading-normal">Lower Cost. Flexible timings. Accessible anywhere via computer dashboards.</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setWizardMode("Offline")}
                      className={`p-6 rounded-2xl border text-left transition-all ${
                        wizardMode === "Offline"
                          ? "bg-sky-50 border-sky-400 dark:bg-sky-950/40"
                          : "border-slate-105 hover:bg-slate-50 dark:border-slate-850 dark:bg-slate-900"
                      }`}
                    >
                      <span className="text-sm font-black block text-slate-950 dark:text-white">Offline Regional Center</span>
                      <span className="text-[10px] text-slate-500 block mt-1 leading-normal">Individual in-person classrooms. Best attention. Small regional batches.</span>
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3: Instructor Select */}
              {wizardStep === 3 && (
                <div className="space-y-4 animate-fade-in">
                  <div className="space-y-1">
                    <span className="text-[9px] font-extrabold uppercase text-sky-600 tracking-widest">Step 3 of 5</span>
                    <h4 className="text-base font-black text-slate-900 dark:text-white">Choose Academic Tutor</h4>
                    <p className="text-xs text-slate-555">Select veteran instructors specialized for the target coursework.</p>
                  </div>

                  <div className="space-y-2">
                    {tutors.map((t) => (
                      <button
                        type="button"
                        key={t.id}
                        onClick={() => setWizardTutorId(t.id)}
                        className={`w-full p-4 rounded-xl border text-left flex items-center justify-between transition-colors ${
                          wizardTutorId === t.id
                            ? "bg-sky-50 border-sky-400 dark:bg-sky-950/40 text-sky-700"
                            : "border-slate-100 hover:bg-slate-50 dark:border-slate-850 dark:bg-slate-900 text-slate-705"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <img src={t.image} alt={t.name} className="h-9 w-9 rounded-full object-cover" />
                          <div>
                            <p className="text-xs font-extrabold text-slate-950 dark:text-white">{t.name}</p>
                            <p className="text-[10px] text-slate-500">{t.specialty}</p>
                          </div>
                        </div>
                        <input
                          type="radio"
                          name="tutor_wizard_sel"
                          checked={wizardTutorId === t.id}
                          onChange={() => {}}
                          className="accent-sky-500"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* STEP 4: Location Selection */}
              {wizardStep === 4 && (
                <div className="space-y-4 animate-fade-in">
                  <div className="space-y-1">
                    <span className="text-[9px] font-extrabold uppercase text-sky-600 tracking-widest">Step 4 of 5</span>
                    <h4 className="text-base font-black text-slate-900 dark:text-white">Pick Regional Location Center</h4>
                    <p className="text-xs text-slate-500">Select offline center logistics or digital class mapping nodes.</p>
                  </div>

                  <div className="grid grid-cols-1 gap-2.5">
                    {LOCATIONS.map((loc) => (
                      <button
                        type="button"
                        key={loc}
                        onClick={() => setWizardLocation(loc)}
                        className={`p-3.5 rounded-xl border text-left text-xs font-bold transition-all flex items-center justify-between ${
                          wizardLocation === loc
                            ? "bg-indigo-50 border-indigo-400 text-indigo-700 dark:bg-indigo-950/30 dark:text-indigo-305"
                            : "border-slate-100 hover:bg-slate-50 dark:border-slate-850 dark:bg-slate-900 text-slate-700"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-rose-500" />
                          <span>Flow Campus — {loc} Center</span>
                        </div>
                        <input
                          type="radio"
                          name="loc_wizard_sel"
                          checked={wizardLocation === loc}
                          onChange={() => {}}
                          className="accent-indigo-600"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* STEP 5: Receipt Confirmation Screen */}
              {wizardStep === 5 && (
                <div className="space-y-4 animate-fade-in">
                  <div className="space-y-1">
                    <span className="text-[9px] font-extrabold uppercase text-emerald-600 tracking-widest">Step 5 of 5</span>
                    <h4 className="text-base font-black text-slate-900 dark:text-white">Confirm Rollout & Tuition Fee Receipt</h4>
                    <p className="text-xs text-slate-500">Preview the calculated price summary details. Clicking Pay automatically activates courses.</p>
                  </div>

                  {/* Pricing receipt card */}
                  <div className="border border-slate-205 bg-slate-50 dark:bg-slate-900 dark:border-slate-800 p-5 rounded-2xl relative">
                    <div className="border-b border-dashed border-slate-300 pb-3 mb-3 space-y-1">
                      <div className="flex justify-between text-xs font-extrabold text-slate-700 dark:text-slate-350">
                        <span>Class Program Selection:</span>
                        <span className="text-indigo-600">{wizardClass}</span>
                      </div>
                      <div className="flex justify-between text-xs font-extrabold text-slate-705 dark:text-slate-350">
                        <span>Coaching Mode:</span>
                        <span className="uppercase text-slate-900 dark:text-white">{wizardMode}</span>
                      </div>
                      <div className="flex justify-between text-xs font-extrabold text-slate-705 dark:text-slate-350">
                        <span>Active Center Location:</span>
                        <span className="text-slate-905">{wizardLocation}</span>
                      </div>
                    </div>

                    <div className="space-y-2 border-b border-dashed border-slate-300 pb-3 mb-3">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Selected Subjects Ledger:</p>
                      {wizardSubjects.map((sub, idx) => (
                        <div key={idx} className="flex justify-between text-xs font-bold text-slate-705 dark:text-slate-200">
                          <span>+ {sub} Tuition module</span>
                          <span>$150.00</span>
                        </div>
                      ))}
                      <div className="flex justify-between text-xs font-medium text-slate-505 dark:text-slate-400">
                        <span>Base Tuition Fee Rate</span>
                        <span>${subBaseFee}.00</span>
                      </div>
                    </div>

                    <div className="flex justify-between items-center text-sm font-black text-slate-950 dark:text-white">
                      <span>Total Calculated Fee:</span>
                      <span className="text-emerald-600 dark:text-emerald-400 text-lg font-black">${computedFee}.00</span>
                    </div>
                  </div>

                  <div className="bg-amber-50 dark:bg-amber-950/30 rounded-xl p-3 border border-amber-205 text-left flex gap-2 items-start">
                    <AlertCircle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                    <p className="text-[10px] text-slate-650 dark:text-slate-350 leading-relaxed font-semibold">
                      Note: Confirming payment registers the student immediately, notifies tutors, and creates a WhatsApp confirmation chat payload ready to send.
                    </p>
                  </div>
                </div>
              )}

            </div>

            {/* Modal foot controls */}
            <div className="bg-slate-50 dark:bg-slate-900 px-6 py-4 border-t border-slate-150 dark:border-slate-800 flex justify-between gap-3">
              {wizardStep > 1 ? (
                <button
                  onClick={() => setWizardStep(wizardStep - 1)}
                  className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold bg-white text-slate-800 hover:bg-slate-100"
                >
                  Previous
                </button>
              ) : (
                <div />
              )}

              {wizardStep < 5 ? (
                <button
                  type="button"
                  onClick={() => {
                    if (wizardStep === 1 && wizardSubjects.length === 0) {
                      alert("Please select at least one learning subject to proceed.");
                      return;
                    }
                    setWizardStep(wizardStep + 1);
                  }}
                  className="rounded-xl bg-slate-900 text-white dark:bg-sky-500 dark:text-slate-950 px-5 py-2.5 text-xs font-extrabold flex items-center gap-1 hover:bg-slate-850"
                >
                  <span>Continue</span>
                  <ChevronRight className="h-4 w-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleResolveWizard}
                  className="rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2.5 text-xs font-black flex items-center gap-1.5 shadow"
                >
                  <span>Pay Tuition & Finalize</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
