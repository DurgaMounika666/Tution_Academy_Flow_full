/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { 
  Users, MapPin, PhoneCall, DollarSign, CheckCircle2, AlertCircle, 
  HelpCircle, ChevronRight, BookOpen, GraduationCap, Clock, PlusCircle,
  TrendingUp, CreditCard, Sparkles, X, ToggleLeft, ArrowRight
} from "lucide-react";
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
  const [selectedStudentId, setSelectedStudentId] = useState("ST-102"); // Leo Henderson by default
  const activeStudent = students.find((s) => s.id === selectedStudentId) || students[0];

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

  const handlePayFee = (feeId: string) => {
    const updated = fees.map((f) => {
      if (f.id === feeId) {
        return { ...f, status: "Paid" as const, transactionId: `AF-TXN-${Math.floor(10000 + Math.random() * 90000)}` };
      }
      return f;
    });
    onUpdateFees(updated);
    setPaymentSuccessMsg("Invoice payment processed successfully! Checkout complete.");
    setTimeout(() => setPaymentSuccessMsg(""), 4000);
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

  const handleResolveWizard = () => {
    if (wizardSubjects.length === 0) {
      alert("Please check at least one learning subject.");
      return;
    }

    // Update student's subjects list
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

        // Add class timings for the subject
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

    // Dynamic fee entry addition to state
    const newInvoice: FeePayment = {
      id: `FP-NEW-${Math.floor(1000 + Math.random() * 9000)}`,
      studentId: selectedStudentId,
      studentName: activeStudent.name,
      title: `Rollout: ${wizardSubjects.join(", ")} (${wizardClass})`,
      amount: computedFee,
      status: "Paid", // automatically paid in simulation
      dueDate: "2026-06-30",
      transactionId: `AF-AUTO-${Math.floor(50000 + Math.random() * 49999)}`
    };

    onUpdateFees([newInvoice, ...fees]);
    
    // Simulate WhatsApp message receipt for registration confirmation:
    const tutorObj = tutors.find(t => t.id === wizardTutorId) || tutors[0];
    const textMsg = encodeURIComponent(
      `Hello Academy Flow institution! I am parent of ${activeStudent.name}. We bought a new subject module: ${wizardSubjects.join(", ")} for class: ${wizardClass}. Selection mode: ${wizardMode}. Assigned Tutor: ${tutorObj.name}, Location center: ${wizardLocation}. Calculated tuition fee total: $${computedFee}. Confirmed details.`
    );
    const waUrl = `https://wa.me/916300227011?text=${textMsg}`;
    
    setWizardOpen(false);
    setWizardStep(1);
    setWizardSubjects([]);
    
    // Toast success and redirect to WA
    setPaymentSuccessMsg(`Success! Rollout registered and tuition receipt created. Redirecting receipt confirmation to Whatsapp.`);
    setTimeout(() => {
      setPaymentSuccessMsg("");
      window.open(waUrl, "_blank");
    }, 3000);
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
  const activeStudentTutors = tutors.filter((t) => activeStudent.assignedTutorIds.includes(t.id));

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 sm:p-6 lg:p-8 transition-colors duration-300">
      <div className="mx-auto max-w-7xl space-y-6 text-left">
        
        {/* Portal Greeting Board */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1 bg-indigo-50 dark:bg-indigo-950/45 text-indigo-700 dark:text-indigo-300 px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider">
              <Users className="h-4.5 w-4.5" />
              <span>Parent Central Dashboard</span>
            </div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white mt-1">Hello, Academy Flow Parent!</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Manage learning pathways, inspect results, and configure customized coaching profiles live.</p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={onLogout}
              className="rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 dark:border-slate-800 dark:text-slate-350 dark:hover:bg-slate-850 font-bold px-4 py-3 text-xs tracking-tight transition-colors"
            >
              Sign Out of Parent Dashboard
            </button>
          </div>
        </div>

        {paymentSuccessMsg && (
          <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 p-4 rounded-xl text-xs text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 animate-pulse text-emerald-500 shrink-0" />
            <span>{paymentSuccessMsg}</span>
          </div>
        )}

        {/* Child selection & Subject Rollout button bar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 gap-4">
          <div className="flex items-center gap-3">
            <span className="text-xs font-black uppercase text-slate-500">Pick Student Child:</span>
            <div className="flex gap-2">
              {students.slice(0, 2).map((s) => (
                <button
                  key={s.id}
                  onClick={() => setSelectedStudentId(s.id)}
                  className={`px-4 py-2 text-xs font-extrabold rounded-xl transition-all ${
                    selectedStudentId === s.id 
                      ? "bg-slate-900 text-white dark:bg-sky-500 dark:text-slate-950 shadow" 
                      : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 hover:bg-slate-200"
                  }`}
                >
                  {s.name} ({s.grade})
                </button>
              ))}
            </div>
          </div>

          {/* CRITICAL FEATURE: "Roll out new subjects" 3D Hover/Shadow Button */}
          <button
            onClick={() => { setWizardStep(1); setWizardOpen(true); }}
            className="group relative cursor-pointer px-6 py-3 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-650 hover:from-sky-450 hover:to-indigo-600 font-extrabold text-white text-xs tracking-tight shadow-[0_5px_15px_rgba(14,165,233,0.3)] hover:shadow-[0_8px_25px_rgba(14,165,233,0.5)] transform hover:-translate-y-0.5 active:scale-95 transition-all flex items-center gap-2"
            title="Wizard to configure custom subject rollout configurations"
          >
            <Sparkles className="h-4.5 w-4.5 text-yellow-300 group-hover:rotate-12 transition-transform" />
            <span>Roll Out New Subjects (3D Control Setup)</span>
          </button>
        </div>

        {/* Inner Dashboard Layout grids */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* LEFT: Child Stats, growth metrics and Assigned Tutors (Col 8) */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Child Specific Academic Logs */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 space-y-5">
              <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
                <div>
                  <h3 className="text-sm font-black uppercase tracking-wider text-slate-400">Class Progress — {activeStudent.name}</h3>
                  <p className="text-xs text-slate-500">Real-time attendance scores & term average grades</p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-black text-indigo-600 dark:text-indigo-400 block">Attendance Rate</span>
                  <span className="text-lg font-black text-slate-900 dark:text-white">{activeStudent.attendanceRate}%</span>
                </div>
              </div>

              {/* Grid with GPA log history */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850">
                  <p className="text-[10px] uppercase font-bold text-slate-450">Current Evaluation GPA</p>
                  <p className="text-xl font-black text-slate-900 dark:text-white mt-1">
                    {activeStudent.results?.[activeStudent.results.length - 1]?.gpa || 3.5} / 4.0
                  </p>
                  <span className="text-[10px] text-emerald-600 font-bold">Excellent Standing</span>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850">
                  <p className="text-[10px] uppercase font-bold text-slate-450">Active Courses</p>
                  <p className="text-xl font-black text-slate-900 dark:text-white mt-1">
                    {activeStudent.learningSubjects.length} Courses
                  </p>
                  <span className="text-[10px] text-indigo-550 font-bold">Concept-Oriented Syllabus</span>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850">
                  <p className="text-[10px] uppercase font-bold text-slate-450">School Location</p>
                  <p className="text-xl font-black text-slate-900 dark:text-white mt-1">
                    #HYD Center
                  </p>
                  <span className="text-[10px] text-slate-500 font-bold">Telangana Regional Hub</span>
                </div>
              </div>

              {/* Visual mini-grades table */}
              <div className="space-y-2">
                <p className="text-xs font-extrabold text-slate-700 dark:text-slate-300">Grade Card results history:</p>
                <div className="overflow-x-auto rounded-xl border border-slate-100 dark:border-slate-800">
                  <table className="w-full text-left text-xs text-slate-500 dark:text-slate-400">
                    <thead className="bg-slate-50 dark:bg-slate-950 text-[10px] font-bold uppercase text-slate-400">
                      <tr>
                        <th className="px-4 py-2 border-r border-slate-100 dark:border-slate-850">Evaluation Term</th>
                        <th className="px-4 py-2 border-r border-slate-100 dark:border-slate-850">Maths Score</th>
                        <th className="px-4 py-2 border-r border-slate-100 dark:border-slate-850">Physics</th>
                        <th className="px-4 py-2 border-r border-slate-100 dark:border-slate-850">Literature</th>
                        <th className="px-4 py-2">Syllabus GPA</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-semibold text-slate-705 dark:text-slate-300">
                      {activeStudent.results.map((res, i) => (
                        <tr key={i}>
                          <td className="px-4 py-2 border-r border-slate-100 dark:border-slate-850 bg-slate-50/40">{res.term}</td>
                          <td className="px-4 py-2 border-r border-slate-100 dark:border-slate-850">{res.mathsScore || 82}%</td>
                          <td className="px-4 py-2 border-r border-slate-100 dark:border-slate-850">{res.physicsScore || 78}%</td>
                          <td className="px-4 py-2 border-r border-slate-100 dark:border-slate-850">{res.literatureScore || 85}%</td>
                          <td className="px-4 py-2 text-sky-600 dark:text-sky-400">{res.gpa}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Assigned Tutors Grid */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 space-y-4">
              <div>
                <h3 className="text-sm font-black uppercase tracking-wider text-slate-400">Assigned Tutors for {activeStudent.name}</h3>
                <p className="text-xs text-slate-500">Authorized instructors coordinating lessons</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activeStudentTutors.map((t) => (
                  <div key={t.id} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <img 
                        src={t.image} 
                        alt={t.name} 
                        className="h-10 w-10 rounded-full object-cover border border-slate-205"
                      />
                      <div className="text-left space-y-0.5">
                        <h4 className="text-xs font-bold text-slate-800 dark:text-white leading-tight">{t.name}</h4>
                        <p className="text-[10px] text-slate-500 font-medium">{t.specialty}</p>
                      </div>
                    </div>

                    <a 
                      href={`https://wa.me/91954239546?text=Hello%20${encodeURIComponent(t.name)}!%20This%20is%20the%20parent%20of%20${encodeURIComponent(activeStudent.name)}.`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 rounded-xl hover:bg-slate-150 dark:hover:bg-slate-800 text-emerald-600 border border-emerald-100 dark:border-emerald-950 hover:shadow"
                      title="Enquire via WhatsApp with tutor"
                    >
                      <PhoneCall className="h-4 w-4" />
                    </a>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* RIGHT: Fees summary, WhatsApp Desk, policies (Col 4) */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Direct Fee pay details */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 space-y-4">
              <h3 className="text-sm font-black uppercase tracking-wider text-slate-400">Tuition Invoices ledger</h3>
              
              <div className="space-y-3">
                {currentChildFees.map((fee) => (
                  <div key={fee.id} className="p-3 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-10) space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-xs font-extrabold text-slate-800 dark:text-white leading-tight">{fee.title}</h4>
                        <p className="text-[10px] text-slate-500 mt-0.5">Due date: {fee.dueDate}</p>
                      </div>
                      <span className={`px-2 py-0.5 text-[9px] font-black rounded-md ${
                        fee.status === "Paid" 
                          ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
                          : "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400"
                      }`}>
                        {fee.status}
                      </span>
                    </div>

                    <div className="flex justify-between items-center pt-2 border-t border-slate-200/50 dark:border-slate-850">
                      <span className="text-sm font-black text-slate-900 dark:text-white">${fee.amount}</span>
                      
                      {fee.status === "Pending" ? (
                        <button
                          onClick={() => handlePayFee(fee.id)}
                          className="px-3.5 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 font-black text-[10px] transition-transform active:scale-95 flex items-center gap-1 shadow-sm"
                        >
                          <CreditCard className="h-3 w-3" />
                          <span>Pay tuition Now</span>
                        </button>
                      ) : (
                        <span className="text-[10px] text-slate-400 font-mono">ID: {fee.transactionId || "AF-0952"}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Custom WhatsApp "Talk with us" selection redirection card */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 space-y-4">
              <div>
                <h3 className="text-sm font-black uppercase tracking-wider text-slate-400">Institutional WhatsApp Desk</h3>
                <p className="text-xs text-slate-500">Pick support target to enquire with counseling staff</p>
              </div>

              <div className="space-y-2 text-xs">
                
                {/* Radio的选择 tab */}
                <button
                  type="button"
                  onClick={() => setSupportChoice("tutor")}
                  className={`w-full p-3 rounded-xl border text-left flex justify-between items-center transition-colors ${
                    supportChoice === "tutor"
                      ? "bg-sky-50 dark:bg-sky-950/40 border-sky-400 text-sky-700 dark:text-sky-305 font-bold"
                      : "border-slate-100 hover:bg-slate-50 dark:border-slate-800 text-slate-700 dark:text-slate-350"
                  }`}
                >
                  <div>
                    <p className="text-xs font-bold">Tutors Enquiry Desk</p>
                    <p className="text-[10px] opacity-70">Redirect to Counselor (+91 954239546)</p>
                  </div>
                  <input
                    type="radio"
                    name="support_tgt"
                    checked={supportChoice === "tutor"}
                    onChange={() => {}}
                    className="accent-sky-500"
                  />
                </button>

                <button
                  type="button"
                  onClick={() => setSupportChoice("admin")}
                  className={`w-full p-3 rounded-xl border text-left flex justify-between items-center transition-colors ${
                    supportChoice === "admin"
                      ? "bg-sky-50 dark:bg-sky-950/40 border-sky-400 text-sky-700 dark:text-sky-305 font-bold"
                      : "border-slate-100 hover:bg-slate-50 dark:border-slate-800 text-slate-700 dark:text-slate-350"
                  }`}
                >
                  <div>
                    <p className="text-xs font-bold">Admin Support Desk</p>
                    <p className="text-[10px] opacity-70">Redirect to Institute (+91 6300227011)</p>
                  </div>
                  <input
                    type="radio"
                    name="support_tgt"
                    checked={supportChoice === "admin"}
                    onChange={() => {}}
                    className="accent-sky-500"
                  />
                </button>

              </div>

              <button
                onClick={handleWhatsAppTalk}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold py-3 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow"
              >
                <PhoneCall className="h-4 w-4" />
                <span>Redirect & Talk With Us</span>
              </button>
            </div>

          </div>

        </div>

      </div>

      {/* CORE FEATURE: Roll out wizard modal structure */}
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
                  <p className="text-[10px] text-slate-500">Configure customized subjects and check fees</p>
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
                    <label className="text-xs font-extrabold text-slate-600 block">Check Subjects to Roll Out:</label>
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
                                ? "bg-indigo-50 border-indigo-400 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300" 
                                : "border-slate-100 hover:bg-slate-50 dark:border-slate-850 dark:bg-slate-900 text-slate-700"
                            }`}
                          >
                            <span>{sub}</span>
                            <span className={`h-4 w-4 rounded-full border flex items-center justify-center text-[10px] ${
                              isChecked ? "bg-indigo-600 border-indigo-600 text-white" : "border-slate-300"
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
                          : "border-slate-100 hover:bg-slate-50 dark:border-slate-850 dark:bg-slate-900"
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
                          : "border-slate-100 hover:bg-slate-50 dark:border-slate-850 dark:bg-slate-900"
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
                    <p className="text-xs text-slate-500">Select veteran instructors specialized for the target coursework.</p>
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
                            <p className="text-[10px] text-slate-550">{t.specialty}</p>
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
                      <div className="flex justify-between text-xs font-extrabold text-slate-770 dark:text-slate-350">
                        <span>Coaching Mode:</span>
                        <span className="uppercase text-slate-900 dark:text-white">{wizardMode}</span>
                      </div>
                      <div className="flex justify-between text-xs font-extrabold text-slate-770 dark:text-slate-350">
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
                      <span className="text-emerald-650 dark:text-emerald-400 text-lg font-black">${computedFee}.00</span>
                    </div>
                  </div>

                  <div className="bg-amber-50 dark:bg-amber-950/30 rounded-xl p-3 border border-amber-205 text-left flex gap-2 items-start">
                    <AlertCircle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                    <p className="text-[10px] text-slate-600 dark:text-slate-350 leading-relaxed font-semibold">
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
