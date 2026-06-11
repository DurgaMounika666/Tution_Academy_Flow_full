/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useState, useEffect } from "react";
import {
  Users, MapPin, PhoneCall, DollarSign, CheckCircle2, AlertCircle,
  HelpCircle, ChevronRight, BookOpen, GraduationCap, Clock, PlusCircle,
  TrendingUp, CreditCard, Sparkles, X, ArrowRight,
  MessageSquare, Bell, Settings, Award, Calendar, FileText, User, LayoutDashboard, Send, Star,
  Download, Save, Edit2, Shield, Lock, Globe, Inbox, Filter, Check, Eye, EyeOff, PanelLeftClose, PanelLeftOpen
} from "lucide-react";
import { Student, Tutor, FeePayment } from "../types";
import { useCatalog } from "../context/CatalogContext";
import { apiClient } from "../services/apiClient";
import { normalizeFee, normalizeParent } from "../utils/normalizers";
import { useTheme } from "../context/ThemeContext";
import { FeeReceiptModal } from "./FeeReceiptModal";
import { buildFeeReceiptFromPayment, FeeReceiptData } from "../utils/feeReceipt";
import { Footer } from "./Footer";
import { FooterNavigation } from "./FooterNavigation";

interface ParentDashboardProps {
  students: Student[];
  tutors: Tutor[];
  fees: FeePayment[];
  onUpdateFees: (updatedFees: FeePayment[]) => void;
  onUpdateStudents: (updatedStudents: Student[]) => void;
  onRefreshFees: () => Promise<void>;
  onLogout: () => void;
}

export function ParentDashboard({
  students, tutors, fees, onUpdateFees, onUpdateStudents, onRefreshFees, onLogout
}: ParentDashboardProps) {

  const { subjectsByClass: SUBJECTS_BY_CLASS, standards: STANDARDS, locations: LOCATIONS } = useCatalog();

  const [selectedStudentId, setSelectedStudentId] = useState(students[0]?.id || "");
  useEffect(() => {
    if (students[0]?.id && !students.find(s => s.id === selectedStudentId)) {
      setSelectedStudentId(students[0].id);
    }
  }, [students, selectedStudentId]);
  const activeStudent = students.find((s) => s.id === selectedStudentId) || students[0];

  // Active Tab/Menu state for the Sidebar
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const mainPanelRef = useRef<HTMLElement | null>(null);

  // Roll out subjects Wizard State
  const [wizardOpen, setWizardOpen] = useState(false);
  const [wizardStep, setWizardStep] = useState(1);
  const [wizardClass, setWizardClass] = useState("9th Class");
  const [wizardSubjects, setWizardSubjects] = useState<string[]>([]);
  const [wizardMode, setWizardMode] = useState<"Online" | "Offline">("Online");
  const [wizardTutorId, setWizardTutorId] = useState(tutors[0]?.id || "");
  const [wizardLocation, setWizardLocation] = useState("Hyderabad");

  // General Support redirect state
  const [supportChoice, setSupportChoice] = useState<"tutor" | "admin">("admin");

  const [paymentSuccessMsg, setPaymentSuccessMsg] = useState("");
  const [feeStructures, setFeeStructures] = useState<any[]>([]);
  const [feedbackRating, setFeedbackRating] = useState(5);
  const [feedbackComment, setFeedbackComment] = useState("");
  const [feedbackMsg, setFeedbackMsg] = useState("");
  const [tuitionFeedbacks, setTuitionFeedbacks] = useState<any[]>([]);

  useEffect(() => {
    const loadFeeStructures = async () => {
      try {
        const data = await apiClient.feeStructure.getAll();
        setFeeStructures(Array.isArray(data) ? data : []);
      } catch {
        setFeeStructures([]);
      }
    };
    loadFeeStructures();
  }, []);

  useEffect(() => {
    const loadFeedbacks = async () => {
      if (!activeStudent?.parentEmail) return;
      try {
        const data = await apiClient.reviews.getByParent(activeStudent.parentEmail);
        setTuitionFeedbacks(data);
      } catch {
        setTuitionFeedbacks([]);
      }
    };
    loadFeedbacks();
  }, [activeStudent?.parentEmail]);

  const handleSubmitTuitionFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackComment.trim() || !activeStudent?.parentEmail) return;
    try {
      const response = await apiClient.reviews.create({
        type: "parent_tuition",
        parentEmail: activeStudent.parentEmail,
        studentId: activeStudent.id,
        rating: feedbackRating,
        comment: feedbackComment,
      });
      setTuitionFeedbacks([response.review || response, ...tuitionFeedbacks]);
      setFeedbackComment("");
      setFeedbackMsg("Thank you! Your tuition feedback has been submitted.");
      setTimeout(() => setFeedbackMsg(""), 4000);
    } catch (error: any) {
      setFeedbackMsg(error.message || "Failed to submit feedback.");
    }
  };

  const handlePayFee = async (feeId: string) => {
    try {
      const response = await apiClient.fees.markAsPaid(feeId);
      const updatedFee = normalizeFee(response.fee || response);
      onUpdateFees(fees.map((f) => (f.id === feeId ? updatedFee : f)));
      await onRefreshFees();
      setPaymentSuccessMsg("Invoice payment processed successfully! Checkout complete.");
      setTimeout(() => setPaymentSuccessMsg(""), 4000);
    } catch (error: any) {
      setPaymentSuccessMsg(error.message || "Payment failed. Please try again.");
      setTimeout(() => setPaymentSuccessMsg(""), 4000);
    }
  };

  // Compute pricing dynamically from feeStructures matching className & selected subjects.
  // Fall back to $150 per subject if not configured.
  const computedFee = (() => {
    let total = 0;
    const subBaseFee = wizardMode === "Online" ? 200 : 350;
    
    wizardSubjects.forEach((sub) => {
      const match = feeStructures.find(
        (f) =>
          f.className?.toLowerCase() === wizardClass?.toLowerCase() &&
          f.subject?.toLowerCase() === sub?.toLowerCase()
      );
      if (match) {
        total += match.amount;
      } else {
        total += 150;
      }
    });

    return total > 0 ? total + subBaseFee : subBaseFee;
  })();

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
      const subjectNames = [
        ...activeStudent.learningSubjects.map((sub) => sub.name),
        ...wizardSubjects.filter((sub) => !activeStudent.learningSubjects.some((s) => s.name === sub)),
      ];

      await apiClient.students.addSubjects(selectedStudentId, subjectNames);
      if (wizardTutorId) {
        await apiClient.students.assignTutor(selectedStudentId, wizardTutorId);
      }

      const updatedStudents = students.map((s) => {
        if (s.id === selectedStudentId) {
          const nextSubsObj = [...s.learningSubjects];
          wizardSubjects.forEach((sub) => {
            if (!nextSubsObj.find((item) => item.name === sub)) {
              nextSubsObj.push({ name: sub, completedPercentage: 0, completedWeeks: 0 });
            }
          });
          const nextTimings = [...s.classTimings];
          wizardSubjects.forEach((sub) => {
            if (!nextTimings.find((t) => t.subject === sub)) {
              nextTimings.push({ subject: sub, time: "03:30 PM", day: "Monday, Thursday", mode: wizardMode });
            }
          });
          return {
            ...s,
            learningSubjects: nextSubsObj,
            classTimings: nextTimings,
            assignedTutorIds: wizardTutorId ? [...new Set([...s.assignedTutorIds, wizardTutorId])] : s.assignedTutorIds,
          };
        }
        return s;
      });
      onUpdateStudents(updatedStudents);

      const feeResponse = await apiClient.fees.create({
        studentId: selectedStudentId,
        studentName: activeStudent?.name || "Student",
        title: `Rollout: ${wizardSubjects.join(", ")} (${wizardClass})`,
        amount: computedFee,
        dueDate: new Date().toISOString().split("T")[0],
      });
      const newInvoice = normalizeFee(feeResponse.fee || feeResponse);
      const paidResponse = await apiClient.fees.markAsPaid(newInvoice.id);
      const paidInvoice = normalizeFee(paidResponse.fee || paidResponse);
      onUpdateFees([paidInvoice, ...fees]);
      await onRefreshFees();

      const tutorObj = tutors.find((t) => t.id === wizardTutorId) || tutors[0];
      const textMsg = encodeURIComponent(
        `Hello Academy Flow institution! I am parent of ${activeStudent.name}. We bought a new subject module: ${wizardSubjects.join(", ")} for class: ${wizardClass}. Selection mode: ${wizardMode}. Assigned Tutor: ${tutorObj?.name || "TBD"}, Location center: ${wizardLocation}. Calculated tuition fee total: $${computedFee}. Confirmed details.`
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
    } catch (error: any) {
      alert(error.message || "Failed to complete subject rollout. Please try again.");
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

  // --- LOCAL NAVIGATION STATE DATA ---

  // 1. Parent Profile state
  const [parentProfile, setParentProfile] = useState({
    name: "",
    email: activeStudent?.parentEmail || "",
    phone: "",
    address: "",
    relationship: "Parent",
    registrationDate: new Date().toISOString().split("T")[0],
  });

  useEffect(() => {
    const loadParentProfile = async () => {
      const email = activeStudent?.parentEmail;
      if (!email) return;
      try {
        const data = await apiClient.parents.getByEmail(email);
        const normalized = normalizeParent(data);
        setParentProfile({
          name: normalized.name || email.split("@")[0],
          email: normalized.email,
          phone: normalized.phone || "",
          address: normalized.address || "",
          relationship: "Parent",
          registrationDate: new Date().toISOString().split("T")[0],
        });
        setEditName(normalized.name || "");
        setEditPhone(normalized.phone || "");
        setEditAddress(normalized.address || "");
      } catch (error) {
        console.warn("Unable to load parent profile", error);
        setParentProfile((prev) => ({ ...prev, email }));
      }
    };
    loadParentProfile();
  }, [activeStudent?.parentEmail]);

  // Edit Profile form state
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editName, setEditName] = useState(parentProfile.name);
  const [editPhone, setEditPhone] = useState(parentProfile.phone);
  const [editAddress, setEditAddress] = useState(parentProfile.address);
  const [editSuccessMsg, setEditSuccessMsg] = useState("");

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiClient.parents.update(parentProfile.email, {
        name: editName,
        phone: editPhone,
        address: editAddress,
      });
      setParentProfile((prev) => ({
        ...prev,
        name: editName,
        phone: editPhone,
        address: editAddress,
      }));
      setIsEditingProfile(false);
      setEditSuccessMsg("Parent Profile details updated successfully!");
      setTimeout(() => setEditSuccessMsg(""), 4000);
    } catch (error: any) {
      setEditSuccessMsg(error.message || "Failed to update profile.");
      setTimeout(() => setEditSuccessMsg(""), 4000);
    }
  };

  // 2. Chat / Messages state
  const [messages, setMessages] = useState<any[]>([]);
  const [selectedChatTutorId, setSelectedChatTutorId] = useState(tutors[0]?.id || "");
  const [chatSearch, setChatSearch] = useState("");
  const [newMessageText, setNewMessageText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!selectedChatTutorId || !parentProfile?.email) return;
    const loadConversation = async () => {
      try {
        const data = await apiClient.chat.getConversation(parentProfile.email, selectedChatTutorId);
        setMessages(Array.isArray(data) ? data : []);
      } catch {
        setMessages([]);
      }
    };
    loadConversation();
    const interval = setInterval(loadConversation, 5000);
    return () => clearInterval(interval);
  }, [selectedChatTutorId, parentProfile?.email]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessageText.trim() || !selectedChatTutorId) return;

    const textToSend = newMessageText.trim();
    setNewMessageText("");
    setIsTyping(true);

    const tutorObj = tutors.find(t => t.id === selectedChatTutorId) || tutors[0];

    try {
      const sent = await apiClient.chat.send({
        senderId: parentProfile.email,
        senderName: parentProfile.name,
        senderRole: "parent",
        receiverId: selectedChatTutorId,
        receiverName: tutorObj.name,
        receiverRole: "tutor",
        text: textToSend,
      });
      setMessages(prev => [...prev, sent]);
    } catch {
      // silently fail
    } finally {
      setIsTyping(false);
    }
  };

  // 3. Support Tickets state
  const [tickets, setTickets] = useState<Array<{
    id: string;
    category: string;
    subject: string;
    description: string;
    priority: string;
    status: "Open" | "Resolved";
    date: string;
  }>>([
    { id: "TCK-8812", category: "Billing", subject: "April Tuition receipt not generated", description: "I paid the April tuition fees but the system has not generated the PDF receipt.", priority: "Medium", status: "Resolved", date: "2026-05-15" }
  ]);
  const [ticketCategory, setTicketCategory] = useState("Academic");
  const [ticketPriority, setTicketPriority] = useState("Medium");
  const [ticketSubject, setTicketSubject] = useState("");
  const [ticketDescription, setTicketDescription] = useState("");
  const [ticketSuccessMsg, setTicketSuccessMsg] = useState("");

  const handleRaiseTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketSubject.trim() || !ticketDescription.trim()) {
      alert("Please fill in the subject and description of your issue.");
      return;
    }
    const newTicket = {
      id: `TCK-${Math.floor(1000 + Math.random() * 9000)}`,
      category: ticketCategory,
      subject: ticketSubject,
      description: ticketDescription,
      priority: ticketPriority,
      status: "Open" as const,
      date: new Date().toISOString().split('T')[0]
    };
    setTickets([newTicket, ...tickets]);
    setTicketSubject("");
    setTicketDescription("");
    setTicketSuccessMsg(`Support Ticket ${newTicket.id} raised successfully! Staff will reach out soon.`);
    setTimeout(() => setTicketSuccessMsg(""), 5000);
  };

  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  // 4. Notifications state
  const [notifications, setNotifications] = useState([
    { id: "notif-1", title: "Calculus Diagnostic test scheduled on June 12", description: "Chapter 4 - Induction & limits diagnostic test will begin at 09:00 AM.", time: "10:00 AM", read: false, type: "exam" },
    { id: "notif-2", title: "Tuition fees due for the upcoming June term modules", description: "Please clear the outstanding dues before June 15 to avoid registration holds.", time: "Yesterday", read: false, type: "billing" },
    { id: "notif-3", title: "New advanced thermodynamics laboratory report assigned", description: "Physics lab report due on June 10 has been updated in resources.", time: "May 18, 2026", read: true, type: "assignment" }
  ]);
  const [notifFilter, setNotifFilter] = useState<"all" | "unread">("all");

  const toggleReadNotif = (notifId: string) => {
    setNotifications(notifications.map(n => {
      if (n.id === notifId) {
        return { ...n, read: !n.read };
      }
      return n;
    }));
  };

  const markAllNotifRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  // 5. Settings preferences
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [whatsappNotifs, setWhatsappNotifs] = useState(true);
  const [smsNotifs, setSmsNotifs] = useState(false);
  const [twoFactor, setTwoFactor] = useState(false);
  const [preferredLang, setPreferredLang] = useState("English");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordVisibility, setPasswordVisibility] = useState({
    current: false,
    next: false,
    confirm: false,
    cvv: false,
  });
  const [settingsSuccessMsg, setSettingsSuccessMsg] = useState("");

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) {
      alert("Please fill in all password fields.");
      return;
    }
    if (newPassword !== confirmPassword) {
      alert("New password and confirm password do not match.");
      return;
    }
    setSettingsSuccessMsg("Password updated successfully!");
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setTimeout(() => setSettingsSuccessMsg(""), 4000);
  };

  // 6. Results tab report card downloading state
  const [downloadingReport, setDownloadingReport] = useState(false);
  const [downloadMsg, setDownloadMsg] = useState("");

  const handleDownloadReport = () => {
    setDownloadingReport(true);
    setDownloadMsg("Generating report card transcript PDF...");
    setTimeout(() => {
      setDownloadMsg("Finalizing download signatures...");
      setTimeout(() => {
        setDownloadingReport(false);
        setDownloadMsg("");
        alert(`Report Card for ${activeStudent.name} downloaded successfully! (Simulated PDF)`);
      }, 1000);
    }, 1200);
  };

  // 7. Schedule tab calendar state
  const [selectedCalendarDay, setSelectedCalendarDay] = useState<number | null>(2); // Default to June 2nd

  // 8. Theme control
  const { darkMode, toggleDarkMode } = useTheme();

  // --- PAYMENT METHOD & RECEIPTS STATES ---
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentSelectedInvoiceId, setPaymentSelectedInvoiceId] = useState("");
  const [paymentInvoiceNumber, setPaymentInvoiceNumber] = useState("");
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState<"UPI" | "Credit Card" | "Debit Card" | "Net Banking" | "Wallet">("Credit Card");
  const [isPaymentProcessing, setIsPaymentProcessing] = useState(false);

  // Card Inputs
  const [cardHolderName, setCardHolderName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");

  // UPI Inputs
  const [upiId, setUpiId] = useState("robert@upi");

  // Net Banking & Wallet Inputs
  const [selectedBank, setSelectedBank] = useState("HDFC Bank");
  const [selectedWallet, setSelectedWallet] = useState("Google Pay");

  // Validation Errors
  const [paymentErrors, setPaymentErrors] = useState<Record<string, string>>({});

  // Success Popup States
  const [paymentSuccessPopupOpen, setPaymentSuccessPopupOpen] = useState(false);
  const [latestTxnId, setLatestTxnId] = useState("");

  // Receipt Modal States
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [receiptData, setReceiptData] = useState<FeeReceiptData | null>(null);

  const openFeeReceipt = (fee: FeePayment) => {
    setReceiptData(buildFeeReceiptFromPayment(fee, students, parentProfile.name));
    setIsReceiptModalOpen(true);
  };

  const activeStudentPaymentHistory = currentChildFees
    .filter((f) => f.status === "Paid")
    .map((f) => ({
      transactionId: f.transactionId || "N/A",
      studentName: f.studentName || activeStudent?.name || "Student",
      parentName: parentProfile.name || "Parent",
      invoiceId: f.id,
      invoiceTitle: f.title,
      amount: f.amount,
      paymentMethod: f.paymentMethod || "Online",
      date: f.paidDate || (f.dueDate ? f.dueDate : new Date().toISOString().split("T")[0]),
      status: "Success",
    }));

  const validatePaymentForm = () => {
    const errors: Record<string, string> = {};

    if (!paymentInvoiceNumber.trim()) {
      errors.invoiceNumber = "Invoice number is required.";
    }

    if (paymentAmount <= 0) {
      errors.amount = "Payment amount must be greater than 0.";
    }

    if (paymentMethod === "Credit Card" || paymentMethod === "Debit Card") {
      if (!cardHolderName.trim()) {
        errors.cardHolderName = "Card holder name is required.";
      }
      if (!/^\d{16}$/.test(cardNumber.replace(/\s+/g, ""))) {
        errors.cardNumber = "Card number must be exactly 16 digits.";
      }
      if (!/^(0[1-9]|1[0-2])\/?([0-9]{2})$/.test(cardExpiry)) {
        errors.cardExpiry = "Expiry date must be in MM/YY format.";
      } else {
        const parts = cardExpiry.split("/");
        const expMonth = parseInt(parts[0], 10);
        const expYear = parseInt("20" + parts[1], 10);
        const currentYear = new Date().getFullYear();
        const currentMonth = new Date().getMonth() + 1;
        if (expYear < currentYear || (expYear === currentYear && expMonth < currentMonth)) {
          errors.cardExpiry = "Card has expired.";
        }
      }
      if (!/^\d{3}$/.test(cardCvv)) {
        errors.cardCvv = "CVV must be exactly 3 digits.";
      }
    } else if (paymentMethod === "UPI") {
      if (!upiId.trim() || !upiId.includes("@")) {
        errors.upiId = "Please enter a valid UPI ID (e.g., name@upi).";
      }
    }

    setPaymentErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleProcessPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validatePaymentForm()) return;

    setIsPaymentProcessing(true);
    setPaymentErrors({});

    const txnId = `AF-TXN-${Math.floor(100000 + Math.random() * 900000)}`;
    setLatestTxnId(txnId);

    const targetInvoiceId = paymentSelectedInvoiceId;
    const isCustom = targetInvoiceId === "custom" || !targetInvoiceId;
    const invoiceTitle = isCustom
      ? `Custom Payment (${paymentInvoiceNumber})`
      : (fees.find(f => f.id === targetInvoiceId)?.title || "Tuition Fee");

    try {
      if (!isCustom) {
        const response = await apiClient.fees.markAsPaid(targetInvoiceId, txnId, paymentMethod);
        const updatedFee = normalizeFee(response.fee || response);
        onUpdateFees(fees.map(f => (f.id === targetInvoiceId ? updatedFee : f)));
      } else {
        const feeResponse = await apiClient.fees.create({
          studentId: activeStudent.id,
          studentName: activeStudent.name,
          title: invoiceTitle,
          amount: paymentAmount,
          dueDate: paymentDate,
        });
        const created = normalizeFee(feeResponse.fee || feeResponse);
        const paidResponse = await apiClient.fees.markAsPaid(created.id, txnId, paymentMethod);
        const paidFee = normalizeFee(paidResponse.fee || paidResponse);
        onUpdateFees([paidFee, ...fees]);
      }
      await onRefreshFees();

      setReceiptData({
        studentName: activeStudent.name,
        parentName: parentProfile.name,
        transactionId: txnId,
        amountPaid: paymentAmount,
        paymentMethod: paymentMethod,
        paymentDate: paymentDate,
        paymentStatus: "Success",
        invoiceTitle: invoiceTitle,
        footerEmail: parentProfile.email,
      });
    } catch (error: any) {
      const errMsg = error?.message || "Payment processing failed. Please check your connection and try again.";
      setPaymentErrors({ general: errMsg });
      setIsPaymentProcessing(false);
      return;
    }

    // Clear Modal inputs
    setCardHolderName("");
    setCardNumber("");
    setCardExpiry("");
    setCardCvv("");
    setPaymentSelectedInvoiceId("");
    setPaymentInvoiceNumber("");
    setPaymentAmount(0);
    setIsPaymentProcessing(false);

    setIsPaymentModalOpen(false);
    setPaymentSuccessPopupOpen(true);
  };

  // Dynamic child attendance logs loaded from backend API
  const [attendanceLogs, setAttendanceLogs] = useState<any[]>([]);

  useEffect(() => {
    const fetchAttendance = async () => {
      if (!activeStudent?.id) {
        setAttendanceLogs([]);
        return;
      }
      try {
        const response = await apiClient.attendance.getByStudent(activeStudent.id);
        if (response && Array.isArray(response.records)) {
          const mappedLogs = response.records.map((r: any, idx: number) => {
            const subject = activeStudent.learningSubjects[idx % activeStudent.learningSubjects.length]?.name || "Tuition";
            const type = activeStudent.classTimings.find(t => t.subject === subject)?.mode || "Online";
            return {
              date: new Date(r.date).toLocaleDateString(),
              subject,
              type,
              status: r.status,
              remarks: r.status === "Present" ? "Attended full session" : "Absence logged in system",
            };
          });
          setAttendanceLogs(mappedLogs);
        } else {
          setAttendanceLogs([]);
        }
      } catch (error) {
        console.warn("Failed to load attendance for child", error);
        setAttendanceLogs([]);
      }
    };
    fetchAttendance();
  }, [activeStudent?.id, activeStudent?.learningSubjects, activeStudent?.classTimings]);

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
    { id: "feedback", label: "Tuition Feedback", icon: MessageSquare },
    { id: "support", label: "Support", icon: HelpCircle },
    { id: "profile", label: "Profile", icon: User },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    if (mainPanelRef.current) mainPanelRef.current.scrollTop = 0;
  };

  // --- DYNAMIC TABS RENDER SYSTEM ---
  const renderTabContent = () => {
    switch (activeTab) {
      case "dashboard":
        return (
          <div className="space-y-6">
            {/* 4 Stats Cards Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-left">
              {/* Card 1: Attendance */}
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col justify-between h-28">
                <span className="text-[10px] uppercase font-extrabold tracking-wider text-slate-400">Attendance</span>
                <div className="flex items-baseline justify-between mt-2">
                  <span className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-450">
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
                  <span className="text-2xl sm:text-3xl font-black text-indigo-650 dark:text-indigo-400">
                    A+
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/30 text-indigo-655 dark:text-indigo-400 font-bold">
                    Top Rank
                  </span>
                </div>
              </div>

              {/* Card 3: Pending Fees */}
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col justify-between h-28">
                <span className="text-[10px] uppercase font-extrabold tracking-wider text-slate-400">Pending Fees</span>
                <div className="flex items-baseline justify-between mt-2">
                  <span className="text-2xl sm:text-3xl font-black text-rose-500">
                    ₹{pendingFeesAmount}
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
                      <span className="text-indigo-655 dark:text-indigo-400">75% Course Done</span>
                    </div>
                    <div className="h-2.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex">
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
                            <span className="text-[10px] text-slate-550">Completed: {subject.completedWeeks} weeks</span>
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
                    <span className="text-[10px] font-bold text-slate-400">Last Payment: ₹{paidFeesAmount} (Paid)</span>
                  </div>

                  <div className="space-y-3">
                    {currentChildFees.map((fee) => (
                      <div key={fee.id} className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                        <div className="text-left space-y-0.5">
                          <h4 className="text-xs font-extrabold text-slate-800 dark:text-white leading-tight">{fee.title}</h4>
                          <p className="text-[10px] text-slate-550">Due Date: {fee.dueDate}</p>
                        </div>

                        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                          <span className="text-sm font-black text-slate-900 dark:text-white">₹{fee.amount}</span>
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
                      className={`p-3.5 rounded-2xl border text-left flex justify-between items-center transition-colors ${supportChoice === "tutor"
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
                        onChange={() => { }}
                        className="accent-[#f27a3d]"
                      />
                    </button>

                    <button
                      type="button"
                      onClick={() => setSupportChoice("admin")}
                      className={`p-3.5 rounded-2xl border text-left flex justify-between items-center transition-colors ${supportChoice === "admin"
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
                        onChange={() => { }}
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
                    {(() => {
                      const studentResults = activeStudent.results || [];
                      const studentSubjects = activeStudent.learningSubjects || [];

                      // Build recent results from actual term results data
                      if (studentResults.length > 0) {
                        // Show latest term's subject-wise scores
                        const latest = studentResults[studentResults.length - 1];
                        const subjectScores: { name: string; score: number }[] = [];
                        if (latest.mathsScore) subjectScores.push({ name: "Mathematics", score: latest.mathsScore });
                        if (latest.physicsScore) subjectScores.push({ name: "Physics & Science", score: latest.physicsScore });
                        if (latest.literatureScore) subjectScores.push({ name: "World Literature", score: latest.literatureScore });
                        if (latest.compSciScore) subjectScores.push({ name: "Computer Science", score: latest.compSciScore });
                        // If term has a general score but no subject breakdown
                        if (subjectScores.length === 0 && latest.score) {
                          subjectScores.push({ name: `${latest.term} Assessment`, score: latest.score });
                        }

                        return subjectScores.slice(0, 4).map((item, idx) => (
                          <div key={idx} className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-2xl flex justify-between items-center">
                            <div className="space-y-0.5">
                              <span className="text-xs font-extrabold text-slate-800 dark:text-white block leading-tight">{item.name}</span>
                              <span className="text-[10px] text-slate-500">{latest.term} — GPA: {latest.gpa}</span>
                            </div>
                            <span className={`text-xs font-black px-2.5 py-1 rounded-lg ${item.score >= 85
                              ? "text-emerald-600 dark:text-emerald-450 bg-emerald-50 dark:bg-emerald-950/40"
                              : item.score >= 70
                                ? "text-[#f27a3d] bg-[#f27a3d]/10"
                                : "text-rose-500 bg-rose-50 dark:bg-rose-950/40"
                              }`}>
                              {item.score}%
                            </span>
                          </div>
                        ));
                      }

                      // Fallback: show enrolled subjects with completion progress
                      if (studentSubjects.length > 0) {
                        return studentSubjects.slice(0, 3).map((sub, idx) => (
                          <div key={idx} className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-2xl flex justify-between items-center">
                            <div className="space-y-0.5">
                              <span className="text-xs font-extrabold text-slate-800 dark:text-white block leading-tight">{sub.name}</span>
                              <span className="text-[10px] text-slate-500">{sub.completedWeeks} weeks completed</span>
                            </div>
                            <span className={`text-xs font-black px-2.5 py-1 rounded-lg ${sub.completedPercentage >= 75
                              ? "text-emerald-600 dark:text-emerald-450 bg-emerald-50 dark:bg-emerald-950/40"
                              : sub.completedPercentage >= 40
                                ? "text-[#f27a3d] bg-[#f27a3d]/10"
                                : "text-rose-500 bg-rose-50 dark:bg-rose-950/40"
                              }`}>
                              {sub.completedPercentage}%
                            </span>
                          </div>
                        ));
                      }

                      // No data at all
                      return (
                        <p className="text-xs text-slate-400 py-2">No results available yet.</p>
                      );
                    })()}
                  </div>
                </div>

                {/* Messages Inbox */}
                <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 space-y-4">
                  <h3 className="text-xs uppercase font-extrabold tracking-wider text-slate-400">Recent Messages</h3>

                  <div className="space-y-3">
                    {activeStudentTutors.slice(0, 2).map((t, idx) => {
                      return (
                        <div key={idx} className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-2xl space-y-2 cursor-pointer transition-colors hover:bg-slate-100 dark:hover:bg-slate-800" onClick={() => { setSelectedChatTutorId(t.id); handleTabChange("messages"); }}>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <img src={t.image} alt={t.name} className="h-6 w-6 rounded-full object-cover" />
                              <span className="text-xs font-black text-slate-900 dark:text-white leading-none">{t.name}</span>
                            </div>
                            <span className="text-[9px] text-slate-400">View Chat</span>
                          </div>
                          <p className="text-[11px] text-slate-650 dark:text-slate-350 italic font-medium">
                            Click to open conversation with {t.name.split(" ")[0]}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Notifications Feed */}
                <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 space-y-4">
                  <h3 className="text-xs uppercase font-extrabold tracking-wider text-slate-400">Recent Notifications</h3>

                  <div className="space-y-2.5 text-xs font-medium">
                    {notifications.slice(0, 3).map((n) => (
                      <div key={n.id} className="flex items-start gap-2.5 p-2 border-b border-slate-100 dark:border-slate-850 last:border-none">
                        <span className={`h-2 w-2 rounded-full shrink-0 mt-1.5 ${n.read ? "bg-slate-300" : "bg-[#f27a3d]"}`} />
                        <div className="text-left">
                          <p className="font-extrabold text-slate-800 dark:text-white">{n.title}</p>
                          <p className="text-[9px] text-slate-400 mt-0.5">{n.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>
          </div>
        );

      case "my-child":
        return (
          <div className="space-y-6 text-left">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Profile Card */}
              <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 text-center flex flex-col items-center justify-center space-y-4">
                <div className="h-24 w-24 rounded-full bg-[#f27a3d]/15 text-[#f27a3d] border-4 border-[#f27a3d]/25 flex items-center justify-center font-extrabold text-3xl shadow-md overflow-hidden">
                  {activeStudent.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white">{activeStudent.name}</h3>
                  <p className="text-xs text-slate-500 font-bold mt-1">{activeStudent.grade} Standard</p>
                  <span className="inline-block bg-[#f27a3d]/10 text-[#f27a3d] font-bold text-[9px] uppercase tracking-wider px-3 py-1 rounded-full mt-2">
                    ID: {activeStudent.id}
                  </span>
                </div>
              </div>

              {/* Personal details grid */}
              <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 md:col-span-2 space-y-4">
                <h3 className="text-xs uppercase font-extrabold tracking-wider text-slate-400">Child & Parent Information</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-2xl">
                    <span className="text-slate-400 block font-bold mb-1">Academic Section</span>
                    <span className="font-extrabold text-slate-900 dark:text-white">{activeStudent.section || "STEM Class"}</span>
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-2xl">
                    <span className="text-slate-400 block font-bold mb-1">Enrolled Standard</span>
                    <span className="font-extrabold text-slate-900 dark:text-white">{activeStudent.grade}</span>
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-2xl">
                    <span className="text-slate-400 block font-bold mb-1">Parent Name</span>
                    <span className="font-extrabold text-slate-900 dark:text-white">{parentProfile.name} ({parentProfile.relationship})</span>
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-2xl">
                    <span className="text-slate-400 block font-bold mb-1">Registered Contact Email</span>
                    <span className="font-extrabold text-slate-900 dark:text-white">{activeStudent.parentEmail}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Academic Progression & Enrolled Modules */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Details */}
              <div className="lg:col-span-8 bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 space-y-4">
                <h3 className="text-xs uppercase font-extrabold tracking-wider text-slate-400">Enrolled Course Syllabus Progress</h3>

                <div className="space-y-4">
                  {activeStudent.learningSubjects.map((sub, idx) => (
                    <div key={idx} className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-2xl space-y-2">
                      <div className="flex justify-between items-center">
                        <div>
                          <span className="text-sm font-extrabold text-slate-900 dark:text-white">{sub.name}</span>
                          <span className="text-[10px] text-slate-400 block mt-0.5">{sub.completedWeeks} active teaching weeks completed</span>
                        </div>
                        <span className="text-xs font-black text-[#f27a3d] bg-[#f27a3d]/10 px-2.5 py-1 rounded-lg">
                          {sub.completedPercentage}% Finished
                        </span>
                      </div>
                      <div className="h-2 w-full bg-slate-200 dark:bg-slate-850 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-sky-400 to-[#f27a3d] rounded-full transition-all duration-500"
                          style={{ width: `${sub.completedPercentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Performance Summary Metrics */}
              <div className="lg:col-span-4 bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 space-y-4 flex flex-col justify-between">
                <div>
                  <h3 className="text-xs uppercase font-extrabold tracking-wider text-slate-400 mb-3">Academic Summary</h3>
                  <div className="p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200/50 rounded-2xl text-xs space-y-2 leading-relaxed text-slate-700 dark:text-slate-350">
                    <p className="font-extrabold text-amber-850 dark:text-amber-400 text-sm flex items-center gap-1.5 mb-1.5">
                      <Award className="h-4 w-4" /> Academic Standing
                    </p>
                    <p>
                      <strong>{activeStudent.name}</strong> is currently maintaining an average score of <strong>87%</strong> across all active enrolled standard subjects.
                    </p>
                    <p>
                      Attendance remains stellar at <strong>{activeStudent.attendanceRate}%</strong>. All assignments are fully indexed, showing a positive development trajectory.
                    </p>
                  </div>
                </div>

                <div className="p-4 bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40 rounded-2xl text-center space-y-1 mt-4">
                  <span className="text-[10px] uppercase font-black text-indigo-500 tracking-wider">Average Grade Card</span>
                  <p className="text-3xl font-black text-indigo-755 dark:text-indigo-400">A- / 3.56 GPA</p>
                </div>
              </div>
            </div>
          </div>
        );

      case "attendance":
        const totalClasses = activeStudent.presentCount + activeStudent.absentCount;
        return (
          <div className="space-y-6 text-left">
            {/* Present/Absent stats grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col justify-between h-24">
                <span className="text-[10px] uppercase font-extrabold tracking-wider text-slate-400">Attendance Rate</span>
                <span className="text-2xl font-black text-emerald-600 dark:text-emerald-450">{activeStudent.attendanceRate}%</span>
              </div>
              <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col justify-between h-24">
                <span className="text-[10px] uppercase font-extrabold tracking-wider text-slate-400">Days Present</span>
                <span className="text-2xl font-black text-slate-900 dark:text-white">{activeStudent.presentCount} Days</span>
              </div>
              <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col justify-between h-24">
                <span className="text-[10px] uppercase font-extrabold tracking-wider text-slate-400">Days Absent</span>
                <span className="text-2xl font-black text-rose-500">{activeStudent.absentCount} Days</span>
              </div>
              <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col justify-between h-24">
                <span className="text-[10px] uppercase font-extrabold tracking-wider text-slate-400">Total Classes</span>
                <span className="text-2xl font-black text-indigo-650 dark:text-indigo-400">{totalClasses} Sessions</span>
              </div>
            </div>

            {/* Monthly attendance visual chart */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 space-y-4">
                <h3 className="text-xs uppercase font-extrabold tracking-wider text-slate-400">Monthly Attendance Rate</h3>

                {/* SVG Bar Chart */}
                <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-2xl flex items-center justify-center">
                  <svg viewBox="0 0 450 180" className="w-full h-44 max-w-lg">
                    {/* Y Axis Grid Lines */}
                    <line x1="40" y1="20" x2="420" y2="20" stroke="#e2e8f0" strokeDasharray="3,3" className="dark:stroke-slate-800" />
                    <line x1="40" y1="60" x2="420" y2="60" stroke="#e2e8f0" strokeDasharray="3,3" className="dark:stroke-slate-800" />
                    <line x1="40" y1="100" x2="420" y2="100" stroke="#e2e8f0" strokeDasharray="3,3" className="dark:stroke-slate-800" />
                    <line x1="40" y1="140" x2="420" y2="140" stroke="#cbd5e1" className="dark:stroke-slate-700" />

                    {/* Labels Y */}
                    <text x="15" y="24" fontSize="10" className="fill-slate-400 font-bold">100%</text>
                    <text x="15" y="64" fontSize="10" className="fill-slate-400 font-bold">75%</text>
                    <text x="15" y="104" fontSize="10" className="fill-slate-400 font-bold">50%</text>
                    <text x="15" y="144" fontSize="10" className="fill-slate-400 font-bold">0%</text>

                    {/* Jan Bar */}
                    <rect x="70" y="30" width="30" height="110" rx="4" fill="#f27a3d" opacity="0.6" />
                    <text x="85" y="156" textAnchor="middle" fontSize="10" className="fill-slate-400 font-extrabold">Jan (92%)</text>

                    {/* Feb Bar */}
                    <rect x="140" y="40" width="30" height="100" rx="4" fill="#f27a3d" opacity="0.75" />
                    <text x="155" y="156" textAnchor="middle" fontSize="10" className="fill-slate-400 font-extrabold">Feb (85%)</text>

                    {/* Mar Bar */}
                    <rect x="210" y="32" width="30" height="108" rx="4" fill="#f27a3d" opacity="0.8" />
                    <text x="225" y="156" textAnchor="middle" fontSize="10" className="fill-slate-400 font-extrabold">Mar (90%)</text>

                    {/* Apr Bar */}
                    <rect x="280" y="26" width="30" height="114" rx="4" fill="#f27a3d" opacity="0.9" />
                    <text x="295" y="156" textAnchor="middle" fontSize="10" className="fill-slate-400 font-extrabold">Apr (95%)</text>

                    {/* May Bar (Active Student Attendance) */}
                    <rect x="350" y={140 - (activeStudent.attendanceRate * 1.2)} width="30" height={activeStudent.attendanceRate * 1.2} rx="4" fill="#f27a3d" />
                    <text x="365" y="156" textAnchor="middle" fontSize="10" className="fill-slate-800 dark:fill-slate-200 font-black">May ({activeStudent.attendanceRate}%)</text>
                  </svg>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 space-y-3 flex flex-col justify-center">
                <h4 className="text-xs uppercase font-extrabold tracking-wider text-slate-400">Attendance Status</h4>
                <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-250 rounded-2xl space-y-2">
                  <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-400 font-extrabold text-sm">
                    <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                    <span>Regular Status</span>
                  </div>
                  <p className="text-xs leading-relaxed text-slate-655 dark:text-slate-350">
                    Child matches standard benchmark attendance threshold (85%+ required). No attendance warning labels active.
                  </p>
                </div>
              </div>
            </div>

            {/* Attendance History log */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 space-y-4">
              <h3 className="text-xs uppercase font-extrabold tracking-wider text-slate-400">Recent Attendance Logs</h3>
              <div className="overflow-hidden">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400">
                      <th className="py-3 px-4 font-extrabold">Date</th>
                      <th className="py-3 px-4 font-extrabold">Enrolled Subject</th>
                      <th className="py-3 px-4 font-extrabold">Delivery Mode</th>
                      <th className="py-3 px-4 font-extrabold">Status</th>
                      <th className="py-3 px-4 font-extrabold">Remarks</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100/60 dark:divide-slate-800/40">
                    {attendanceLogs.map((log, index) => (
                      <tr key={index} className="hover:bg-slate-50/50 dark:hover:bg-slate-950/10 font-medium">
                        <td className="py-3.5 px-4 font-bold">{log.date}</td>
                        <td className="py-3.5 px-4 font-extrabold text-slate-900 dark:text-white">{log.subject}</td>
                        <td className="py-3.5 px-4">{log.type}</td>
                        <td className="py-3.5 px-4">
                          <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase ${log.status === "Present"
                            ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-450"
                            : "bg-rose-50 dark:bg-rose-950/40 text-rose-500"
                            }`}>
                            {log.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-slate-500 text-[11px]">{log.remarks}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );

      case "results":
        const activeResults = activeStudent.results || [];
        const latestTerm = activeResults[activeResults.length - 1] || { term: "May", score: 92, gpa: 3.8, mathsScore: 90, physicsScore: 85, literatureScore: 94, compSciScore: 88 };

        return (
          <div className="space-y-6 text-left">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Score analysis metrics */}
              <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 space-y-4">
                <h3 className="text-xs uppercase font-extrabold tracking-wider text-slate-400">Subject-wise Performance</h3>

                <div className="space-y-4 text-xs">
                  {/* Mathematics */}
                  <div className="space-y-1">
                    <div className="flex justify-between font-bold">
                      <span className="text-slate-800 dark:text-slate-200">Mathematics</span>
                      <span className="font-extrabold text-slate-950 dark:text-white">{latestTerm.mathsScore || latestTerm.score}%</span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 dark:bg-slate-850 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-sky-400 to-indigo-500 rounded-full" style={{ width: `${latestTerm.mathsScore || latestTerm.score}%` }} />
                    </div>
                  </div>

                  {/* Physics */}
                  <div className="space-y-1">
                    <div className="flex justify-between font-bold">
                      <span className="text-slate-800 dark:text-slate-200">Physics & Science</span>
                      <span className="font-extrabold text-slate-950 dark:text-white">{latestTerm.physicsScore || latestTerm.score}%</span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 dark:bg-slate-850 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-amber-400 to-[#f27a3d] rounded-full" style={{ width: `${latestTerm.physicsScore || latestTerm.score}%` }} />
                    </div>
                  </div>

                  {/* Literature */}
                  <div className="space-y-1">
                    <div className="flex justify-between font-bold">
                      <span className="text-slate-800 dark:text-slate-200">World Literature</span>
                      <span className="font-extrabold text-slate-950 dark:text-white">{latestTerm.literatureScore || latestTerm.score}%</span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 dark:bg-slate-850 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full" style={{ width: `${latestTerm.literatureScore || latestTerm.score}%` }} />
                    </div>
                  </div>

                  {/* Computer Science */}
                  {latestTerm.compSciScore !== undefined && latestTerm.compSciScore > 0 && (
                    <div className="space-y-1">
                      <div className="flex justify-between font-bold">
                        <span className="text-slate-800 dark:text-slate-200">Computer Science</span>
                        <span className="font-extrabold text-slate-950 dark:text-white">{latestTerm.compSciScore}%</span>
                      </div>
                      <div className="h-2 w-full bg-slate-100 dark:bg-slate-850 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-pink-400 to-rose-500 rounded-full" style={{ width: `${latestTerm.compSciScore}%` }} />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* GPA line graph */}
              <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 space-y-4 lg:col-span-2">
                <h3 className="text-xs uppercase font-extrabold tracking-wider text-slate-400">Academic Grade Growth Analytics</h3>

                {/* Line graph */}
                <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-2xl flex items-center justify-center">
                  <svg viewBox="0 0 450 180" className="w-full h-44 max-w-lg">
                    {/* Y Grid */}
                    <line x1="40" y1="20" x2="420" y2="20" stroke="#e2e8f0" strokeDasharray="3,3" className="dark:stroke-slate-800" />
                    <line x1="40" y1="60" x2="420" y2="60" stroke="#e2e8f0" strokeDasharray="3,3" className="dark:stroke-slate-800" />
                    <line x1="40" y1="100" x2="420" y2="100" stroke="#e2e8f0" strokeDasharray="3,3" className="dark:stroke-slate-800" />
                    <line x1="40" y1="140" x2="420" y2="140" stroke="#cbd5e1" className="dark:stroke-slate-700" />

                    {/* Labels Y */}
                    <text x="15" y="24" fontSize="10" className="fill-slate-400 font-bold">4.0</text>
                    <text x="15" y="64" fontSize="10" className="fill-slate-400 font-bold">3.0</text>
                    <text x="15" y="104" fontSize="10" className="fill-slate-400 font-bold">2.0</text>
                    <text x="15" y="144" fontSize="10" className="fill-slate-400 font-bold">1.0</text>

                    {/* Plot Line */}
                    {activeResults.length > 1 ? (
                      <>
                        <path
                          d={activeResults.map((r, i) => {
                            const x = 70 + (i * (350 / (activeResults.length - 1)));
                            // Map GPA 1.0 -> 140, GPA 4.0 -> 20
                            const y = 140 - ((r.gpa - 1.0) * 40);
                            return `${i === 0 ? "M" : "L"} ${x} ${y}`;
                          }).join(" ")}
                          fill="none"
                          stroke="#f27a3d"
                          strokeWidth="3.5"
                          strokeLinecap="round"
                        />
                        {/* Dots */}
                        {activeResults.map((r, i) => {
                          const x = 70 + (i * (350 / (activeResults.length - 1)));
                          const y = 140 - ((r.gpa - 1.0) * 40);
                          return (
                            <g key={i}>
                              <circle cx={x} cy={y} r="5" fill="#f27a3d" />
                              <circle cx={x} cy={y} r="8" fill="#f27a3d" opacity="0.3" />
                            </g>
                          );
                        })}
                      </>
                    ) : (
                      // Single data point fallback
                      <circle cx="225" cy="50" r="6" fill="#f27a3d" />
                    )}

                    {/* Labels X */}
                    {activeResults.map((r, i) => {
                      const x = 70 + (i * (350 / (activeResults.length - 1)));
                      return (
                        <text key={i} x={x} y="158" textAnchor="middle" fontSize="10" className="fill-slate-400 font-bold">
                          {r.term} ({r.gpa})
                        </text>
                      );
                    })}
                  </svg>
                </div>
              </div>
            </div>

            {/* Exam result card summary list */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 space-y-4">
              <div className="flex justify-between items-center flex-wrap gap-2">
                <h3 className="text-xs uppercase font-extrabold tracking-wider text-slate-400">Official Grade Card</h3>

                {/* Download PDF simulation button */}
                <button
                  onClick={handleDownloadReport}
                  disabled={downloadingReport}
                  className="px-4 py-2 bg-slate-900 dark:bg-[#f27a3d] text-white hover:bg-slate-850 dark:hover:bg-[#ff8950] font-black text-xs rounded-xl shadow-sm hover:shadow flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shrink-0"
                >
                  <Download className="h-4 w-4" />
                  <span>{downloadingReport ? "Downloading..." : "Download Report Card"}</span>
                </button>
              </div>

              {downloadMsg && (
                <div className="p-3 bg-indigo-50 dark:bg-indigo-950/20 text-indigo-650 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/30 rounded-xl text-xs font-bold flex items-center gap-2">
                  <div className="h-4 w-4 border-2 border-indigo-550 border-t-transparent rounded-full animate-spin shrink-0" />
                  <span>{downloadMsg}</span>
                </div>
              )}

              <div className="overflow-hidden">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400">
                      <th className="py-3 px-4 font-extrabold">Term</th>
                      <th className="py-3 px-4 font-extrabold">Mathematics</th>
                      <th className="py-3 px-4 font-extrabold">Physics</th>
                      <th className="py-3 px-4 font-extrabold">Literature</th>
                      <th className="py-3 px-4 font-extrabold">Comp Sci</th>
                      <th className="py-3 px-4 font-extrabold">Term GPA</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100/60 dark:divide-slate-800/40 font-medium">
                    {activeResults.map((r, index) => (
                      <tr key={index} className="hover:bg-slate-50/50 dark:hover:bg-slate-950/10">
                        <td className="py-3.5 px-4 font-black text-slate-900 dark:text-white">{r.term}</td>
                        <td className="py-3.5 px-4 font-bold">{r.mathsScore || r.score}%</td>
                        <td className="py-3.5 px-4 font-bold">{r.physicsScore || r.score}%</td>
                        <td className="py-3.5 px-4 font-bold">{r.literatureScore || r.score}%</td>
                        <td className="py-3.5 px-4 font-bold">{r.compSciScore ? `${r.compSciScore}%` : "—"}</td>
                        <td className="py-3.5 px-4 font-extrabold text-indigo-650 dark:text-indigo-400">{r.gpa}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );

      case "fees":
        return (
          <div className="space-y-6 text-left">
            {/* Header section with Make Payment button */}
            <div className="flex justify-between items-center flex-wrap gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-wider">Fee Payments & Billing</h3>
                <p className="text-xs text-slate-500">Manage billing statements, pay pending fees, and download receipts.</p>
              </div>
              <button
                onClick={() => {
                  const firstPending = currentChildFees.find(f => f.status === "Pending");
                  if (firstPending) {
                    setPaymentSelectedInvoiceId(firstPending.id);
                    setPaymentInvoiceNumber(firstPending.id);
                    setPaymentAmount(firstPending.amount);
                  } else {
                    setPaymentSelectedInvoiceId("custom");
                    setPaymentInvoiceNumber(`INV-CUST-${Math.floor(1000 + Math.random() * 9000)}`);
                    setPaymentAmount(0);
                  }
                  setPaymentErrors({});
                  setIsPaymentModalOpen(true);
                }}
                className="px-5 py-2.5 rounded-xl bg-[#f27a3d] hover:bg-[#ff8950] text-white font-extrabold text-xs shadow-md hover:shadow-lg transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <DollarSign className="h-4 w-4" />
                <span>Make Payment</span>
              </button>
            </div>

            {/* Payment Summary Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col justify-between h-28">
                <span className="text-[10px] uppercase font-extrabold tracking-wider text-slate-400">Total Outstanding Balance</span>
                <span className="text-3xl font-black text-rose-500">₹{pendingFeesAmount}</span>
              </div>
              <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col justify-between h-28">
                <span className="text-[10px] uppercase font-extrabold tracking-wider text-slate-400">Total Paid Fees</span>
                <span className="text-3xl font-black text-emerald-600 dark:text-emerald-450">₹{paidFeesAmount}</span>
              </div>
              <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col justify-between h-28">
                <span className="text-[10px] uppercase font-extrabold tracking-wider text-slate-400">Financial Standing</span>
                <div>
                  <span className={`inline-block text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full ${pendingFeesAmount > 0
                    ? "bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-455"
                    : "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-450"
                    }`}>
                    {pendingFeesAmount > 0 ? "Pending Invoices" : "Fully Cleared"}
                  </span>
                </div>
              </div>
            </div>

            {/* Subject-wise Fee Breakdown */}
            {activeStudent && feeStructures.length > 0 && (
              <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 space-y-4">
                <h3 className="text-xs uppercase font-extrabold tracking-wider text-slate-400">
                  Monthly Fee Breakdown — {activeStudent.grade}
                </h3>
                <div className="space-y-2">
                  {activeStudent.learningSubjects.map((sub) => {
                    const structure = feeStructures.find(
                      (fs: any) => fs.className === activeStudent.grade && fs.subject === sub.name
                    );
                    return (
                      <div key={sub.name} className="flex justify-between items-center py-2 px-3 rounded-xl bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-slate-800">
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{sub.name}</span>
                        <span className="text-xs font-black text-slate-900 dark:text-white">
                          {structure ? `₹${structure.amount}/mo` : <span className="text-slate-400 italic">Not set</span>}
                        </span>
                      </div>
                    );
                  })}
                </div>
                <div className="flex justify-between items-center pt-3 border-t border-slate-200 dark:border-slate-800">
                  <span className="text-xs font-black text-slate-600 dark:text-slate-400 uppercase">Total Monthly Fee</span>
                  <span className="text-sm font-black text-[#f27a3d]">
                    ₹{activeStudent.learningSubjects.reduce((total, sub) => {
                      const structure = feeStructures.find(
                        (fs: any) => fs.className === activeStudent.grade && fs.subject === sub.name
                      );
                      return total + (structure?.amount || 0);
                    }, 0)}/month
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  Advance fee paid during registration: ₹150
                </p>
              </div>
            )}

            {/* Fee lists */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 space-y-4">
              <h3 className="text-xs uppercase font-extrabold tracking-wider text-slate-400">Institutional Ledger Billing Statements</h3>

              <div className="overflow-hidden">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400">
                      <th className="py-3 px-4 font-extrabold">Invoice ID</th>
                      <th className="py-3 px-4 font-extrabold">Description Title</th>
                      <th className="py-3 px-4 font-extrabold">Due Date</th>
                      <th className="py-3 px-4 font-extrabold">Billing Amount</th>
                      <th className="py-3 px-4 font-extrabold">Status</th>
                      <th className="py-3 px-4 font-extrabold">Transaction ID</th>
                      <th className="py-3 px-4 font-extrabold">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100/60 dark:divide-slate-800/40 font-medium">
                    {currentChildFees.map((fee) => (
                      <tr key={fee.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-950/10">
                        <td className="py-4 px-4 font-bold">{fee.id}</td>
                        <td className="py-4 px-4 font-extrabold text-slate-900 dark:text-white">{fee.title}</td>
                        <td className="py-4 px-4">{fee.dueDate}</td>
                        <td className="py-4 px-4 font-black">₹{fee.amount}</td>
                        <td className="py-4 px-4">
                          <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase ${fee.status === "Paid"
                            ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-450"
                            : "bg-rose-50 dark:bg-rose-950/40 text-rose-500"
                            }`}>
                            {fee.status}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-slate-500 italic font-bold">{fee.transactionId || "—"}</td>
                        <td className="py-4 px-4">
                          {fee.status === "Pending" ? (
                            <button
                              onClick={() => {
                                setPaymentSelectedInvoiceId(fee.id);
                                setPaymentInvoiceNumber(fee.id);
                                setPaymentAmount(fee.amount);
                                setPaymentErrors({});
                                setIsPaymentModalOpen(true);
                              }}
                              className="px-3 py-1.5 bg-[#f27a3d] hover:bg-[#ff8950] text-white font-black text-[10px] rounded-lg shadow-sm hover:shadow active:scale-95 transition-all cursor-pointer"
                            >
                              Pay Now
                            </button>
                          ) : (
                            <button
                              onClick={() => openFeeReceipt(fee)}
                              className="px-3 py-1.5 border border-slate-200 dark:border-slate-850 hover:bg-slate-50 dark:hover:bg-slate-950 text-slate-700 dark:text-slate-350 font-black text-[10px] rounded-lg shadow-sm active:scale-95 transition-all cursor-pointer flex items-center gap-1 interactive"
                            >
                              <Download className="h-3 w-3" />
                              <span>Receipt</span>
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Payment History section */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 space-y-4">
              <h3 className="text-xs uppercase font-extrabold tracking-wider text-slate-400">Payment History</h3>
              <div className="overflow-hidden">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400">
                      <th className="py-3 px-4 font-extrabold">Transaction ID</th>
                      <th className="py-3 px-4 font-extrabold">Payment Date</th>
                      <th className="py-3 px-4 font-extrabold">Paid Amount</th>
                      <th className="py-3 px-4 font-extrabold">Payment Method</th>
                      <th className="py-3 px-4 font-extrabold">Status</th>
                      <th className="py-3 px-4 font-extrabold">Receipt</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100/60 dark:divide-slate-800/40 font-medium">
                    {activeStudentPaymentHistory.map((history) => (
                      <tr key={history.transactionId} className="hover:bg-slate-50/50 dark:hover:bg-slate-950/10">
                        <td className="py-4 px-4 font-bold text-indigo-650 dark:text-indigo-400">{history.transactionId}</td>
                        <td className="py-4 px-4">{history.date}</td>
                        <td className="py-4 px-4 font-black">₹{history.amount}</td>
                        <td className="py-4 px-4">
                          <span className="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-[10px] uppercase font-bold text-slate-655 dark:text-slate-350">
                            {history.paymentMethod}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <span className="px-2.5 py-1 rounded-lg text-[9px] font-black uppercase bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-450">
                            {history.status}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <button
                            onClick={() => {
                              setReceiptData({
                                studentName: history.studentName,
                                parentName: history.parentName,
                                transactionId: history.transactionId,
                                amountPaid: history.amount,
                                paymentMethod: history.paymentMethod,
                                paymentDate: history.date,
                                paymentStatus: history.status,
                                invoiceTitle: history.invoiceTitle,
                                footerEmail: parentProfile.email,
                              });
                              setIsReceiptModalOpen(true);
                            }}
                            className="px-3 py-1.5 bg-[#f27a3d]/10 hover:bg-[#f27a3d]/20 text-[#f27a3d] font-black text-[10px] rounded-lg transition-all cursor-pointer flex items-center gap-1 interactive"
                          >
                            <Download className="h-3.5 w-3.5" />
                            <span>Download Receipt</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                    {activeStudentPaymentHistory.length === 0 && (
                      <tr>
                        <td colSpan={6} className="py-6 text-center text-slate-450 font-bold">No payments processed yet.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );

      case "tutors":
        return (
          <div className="space-y-6 text-left">
            <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">Assigned Teaching Instructors</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeStudentTutors.map((t) => (
                <div key={t.id} className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 space-y-4 flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <img src={t.image} alt={t.name} className="h-12 w-12 rounded-full object-cover border-2 border-slate-200" />
                      <div>
                        <h4 className="font-black text-slate-900 dark:text-white leading-tight">{t.name}</h4>
                        <p className="text-[10px] font-bold text-[#f27a3d] mt-0.5">{t.specialty}</p>
                      </div>
                    </div>

                    <div className="border-t border-slate-100 dark:border-slate-800 pt-3 text-xs space-y-2">
                      <div>
                        <span className="text-slate-400 block font-bold">Email Address</span>
                        <span className="font-extrabold text-slate-900 dark:text-white">{t.email}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block font-bold">Enrolled Slot Mapping</span>
                        <span className="font-extrabold text-slate-900 dark:text-white">Mon, Wed, Fri 4:00 PM - 5:30 PM</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3">
                    <button
                      onClick={() => alert(`Meeting scheduling request sent to ${t.name}! Check your parent email for slots details.`)}
                      className="w-full py-2.5 border border-[#f27a3d]/20 hover:bg-[#f27a3d] hover:text-white text-[#f27a3d] font-extrabold text-xs rounded-xl transition-all shadow-sm active:scale-95 cursor-pointer"
                    >
                      Schedule Meeting Slot
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case "schedule":
        // Generate static calendar days for June 2026 (Month starts on Monday)
        const calendarDays = Array.from({ length: 30 }, (_, i) => i + 1);
        const classDays = [1, 2, 4, 8, 9, 11, 15, 16, 18, 22, 23, 25, 29, 30];

        return (
          <div className="space-y-6 text-left">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

              {/* Timetable Grid */}
              <div className="lg:col-span-7 bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 space-y-4">
                <h3 className="text-xs uppercase font-extrabold tracking-wider text-slate-400">Weekly Classes Timetable</h3>

                <div className="space-y-3">
                  {activeStudent.classTimings.map((timeObj, idx) => (
                    <div key={idx} className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-2xl flex justify-between items-center">
                      <div className="space-y-1">
                        <span className="text-sm font-black text-slate-900 dark:text-white block">{timeObj.subject}</span>
                        <span className="text-xs text-slate-550 flex items-center gap-1 font-bold">
                          <Calendar className="h-3.5 w-3.5 text-slate-400" />
                          <span>{timeObj.day}</span>
                        </span>
                      </div>

                      <div className="text-right space-y-1">
                        <span className="text-xs font-black text-indigo-650 dark:text-indigo-400 block">{timeObj.time}</span>
                        <span className="inline-block px-2.5 py-0.5 text-[9px] font-black uppercase rounded bg-indigo-50 dark:bg-indigo-950/40 text-indigo-650 dark:text-indigo-400">
                          {timeObj.mode}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Monthly calendar tracker */}
              <div className="lg:col-span-5 bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-xs uppercase font-extrabold tracking-wider text-slate-400">June 2026</h3>
                  <span className="text-[10px] font-black text-[#f27a3d]">Class Dates Highlighted</span>
                </div>

                <div className="grid grid-cols-7 gap-1.5 text-center text-xs font-extrabold">
                  <div className="text-slate-400 py-1">Mo</div>
                  <div className="text-slate-400 py-1">Tu</div>
                  <div className="text-slate-400 py-1">We</div>
                  <div className="text-slate-400 py-1">Th</div>
                  <div className="text-slate-400 py-1">Fr</div>
                  <div className="text-slate-400 py-1">Sa</div>
                  <div className="text-slate-400 py-1">Su</div>

                  {calendarDays.map((day) => {
                    const hasClass = classDays.includes(day);
                    const isSelected = selectedCalendarDay === day;
                    return (
                      <button
                        key={day}
                        onClick={() => setSelectedCalendarDay(day)}
                        className={`h-9 w-9 rounded-xl flex items-center justify-center transition-all cursor-pointer ${isSelected
                          ? "bg-[#f27a3d] text-white shadow-md font-black"
                          : hasClass
                            ? "bg-[#f27a3d]/15 text-[#f27a3d] border border-[#f27a3d]/30 font-black hover:bg-[#f27a3d]/30"
                            : "text-slate-800 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-850"
                          }`}
                      >
                        {day}
                      </button>
                    );
                  })}
                </div>

                {/* Day Details */}
                {selectedCalendarDay !== null && (
                  <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-850 text-xs">
                    <span className="text-[10px] uppercase font-bold text-slate-450 block">Schedule: June {selectedCalendarDay}, 2026</span>
                    {classDays.includes(selectedCalendarDay) ? (
                      <div className="mt-2 space-y-1">
                        <span className="font-extrabold text-slate-900 dark:text-white block">Active Classes Scheduled</span>
                        <p className="text-slate-600 dark:text-slate-400 font-bold leading-normal">
                          {activeStudent.classTimings?.[0]?.subject || "Mathematics module lesson"} - {activeStudent.classTimings?.[0]?.time || "09:00 AM"} ({activeStudent.classTimings?.[0]?.mode || "Online"})
                        </p>
                      </div>
                    ) : (
                      <p className="text-slate-500 mt-2 font-bold">No classes scheduled on this day.</p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Upcoming assessments */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 space-y-4">
              <h3 className="text-xs uppercase font-extrabold tracking-wider text-slate-400">Upcoming Exams & quizzes</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activeStudent.upcomingEvents.length > 0 ? (
                  activeStudent.upcomingEvents.map((evt, idx) => (
                    <div key={idx} className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-2xl space-y-2">
                      <div className="flex justify-between items-start">
                        <span className="inline-block bg-indigo-50 dark:bg-indigo-950/40 text-indigo-650 dark:text-indigo-400 text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg">
                          {evt.badge}
                        </span>
                        <span className="text-[10px] font-black text-slate-400">{evt.time}</span>
                      </div>
                      <h4 className="text-sm font-black text-slate-900 dark:text-white leading-tight">{evt.title}</h4>
                      <p className="text-xs text-slate-550 leading-relaxed font-bold">{evt.description}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-500 font-bold col-span-2">No upcoming exam logs found.</p>
                )}
              </div>
            </div>
          </div>
        );

      case "messages":
        const filteredTutors = activeStudentTutors.filter(t => t.name.toLowerCase().includes(chatSearch.toLowerCase()));

        return (
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 overflow-hidden h-[600px] flex flex-col md:flex-row text-left">
            {/* Left tutor select panel */}
            <div className="w-full md:w-80 border-r border-slate-100 dark:border-slate-800 flex flex-col h-full shrink-0">
              <div className="p-4 border-b border-slate-100 dark:border-slate-800 space-y-3">
                <h3 className="text-sm font-black uppercase text-slate-900 dark:text-white tracking-wider">Teachers & Tutors</h3>

                {/* Search bar */}
                <input
                  type="text"
                  placeholder="Search Tutors..."
                  value={chatSearch}
                  onChange={(e) => setChatSearch(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl text-xs font-bold outline-none focus:border-[#f27a3d] transition-all"
                />
              </div>

              <div className="flex-1 overflow-hidden divide-y divide-slate-100 dark:divide-slate-800/40">
                {filteredTutors.map((t) => {
                  const isSelected = selectedChatTutorId === t.id;
                  return (
                    <button
                      key={t.id}
                      onClick={() => setSelectedChatTutorId(t.id)}
                      className={`w-full p-4 flex items-start gap-3 transition-colors cursor-pointer text-left ${isSelected
                        ? "bg-[#f27a3d]/5 dark:bg-[#f27a3d]/10 border-l-4 border-[#f27a3d]"
                        : "hover:bg-slate-50 dark:hover:bg-slate-950/20"
                        }`}
                    >
                      <img src={t.image} alt={t.name} className="h-10 w-10 rounded-full object-cover shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-baseline">
                          <h4 className="text-xs font-black text-slate-900 dark:text-white truncate">{t.name}</h4>
                        </div>
                        <p className="text-[10px] text-slate-400 font-bold mt-0.5 truncate">{t.specialty}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Chat conversation area */}
            <div className="flex-grow flex flex-col h-full bg-slate-50/50 dark:bg-slate-950/10">
              {/* Active tutor header */}
              {(() => {
                const activeTutorObj = tutors.find(t => t.id === selectedChatTutorId) || tutors[0];
                return (
                  <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img src={activeTutorObj.image} alt={activeTutorObj.name} className="h-9 w-9 rounded-full object-cover" />
                      <div>
                        <h4 className="text-xs font-black text-slate-900 dark:text-white">{activeTutorObj.name}</h4>
                        <p className="text-[10px] font-bold text-emerald-500 uppercase">Online Office Hours</p>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Chat bubbles list */}
              <div className="flex-1 p-4 overflow-hidden space-y-4 flex flex-col justify-end">
                <div className="space-y-4">
                  {messages.length === 0 && (
                    <p className="text-xs text-slate-400 text-center py-8">No messages yet. Send a message to start the conversation.</p>
                  )}
                  {messages.map((msg: any, idx: number) => {
                    const isParent = msg.senderId === parentProfile.email;
                    return (
                      <div key={msg._id || idx} className={`flex ${isParent ? "justify-end" : "justify-start"}`}>
                        <div className={`max-w-[70%] p-3.5 rounded-2xl text-xs leading-relaxed font-bold ${isParent
                          ? "bg-[#f27a3d] text-white rounded-tr-none shadow-sm"
                          : "bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-tl-none text-slate-800 dark:text-slate-205"
                          }`}>
                          <p>{msg.text}</p>
                          <span className={`block text-[9px] mt-1.5 text-right font-medium opacity-70 ${isParent ? "text-white" : "text-slate-400"}`}>
                            {msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Now"}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={chatEndRef} />

                  {isTyping && (
                    <div className="flex justify-start">
                      <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-3 rounded-2xl rounded-tl-none text-xs flex items-center gap-1 text-slate-400 font-bold">
                        <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" />
                        <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-100" />
                        <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-200" />
                        <span className="ml-1 text-[10px]">Tutor typing...</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Text send box */}
              <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex gap-2">
                <input
                  type="text"
                  placeholder="Type a message to tutor..."
                  value={newMessageText}
                  onChange={(e) => setNewMessageText(e.target.value)}
                  className="flex-grow p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl text-xs font-bold outline-none focus:border-[#f27a3d] transition-all"
                />
                <button
                  type="submit"
                  className="p-3 bg-[#f27a3d] hover:bg-[#ff8950] text-white rounded-xl shadow-sm hover:shadow active:scale-95 transition-all flex items-center justify-center shrink-0 cursor-pointer"
                >
                  <Send className="h-4.5 w-4.5" />
                </button>
              </form>
            </div>
          </div>
        );

      case "notifications":
        const filteredNotifs = notifications.filter(n => notifFilter === "all" || !n.read);

        return (
          <div className="space-y-6 text-left">
            <div className="flex justify-between items-center flex-wrap gap-3">
              <div className="flex gap-2 text-xs">
                <button
                  onClick={() => setNotifFilter("all")}
                  className={`px-4 py-2 rounded-xl font-black transition-all ${notifFilter === "all"
                    ? "bg-slate-900 text-white dark:bg-[#f27a3d]"
                    : "bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-slate-655 dark:text-slate-350"
                    }`}
                >
                  All Notifications
                </button>
                <button
                  onClick={() => setNotifFilter("unread")}
                  className={`px-4 py-2 rounded-xl font-black transition-all ${notifFilter === "unread"
                    ? "bg-slate-900 text-white dark:bg-[#f27a3d]"
                    : "bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-slate-655 dark:text-slate-350"
                    }`}
                >
                  Unread ({notifications.filter(n => !n.read).length})
                </button>
              </div>

              <button
                onClick={markAllNotifRead}
                className="px-3 py-1.5 border border-slate-200 dark:border-slate-850 text-slate-650 dark:text-slate-350 font-black text-xs rounded-xl shadow-sm hover:bg-slate-50 dark:hover:bg-slate-950 flex items-center gap-1 cursor-pointer"
              >
                <Check className="h-4 w-4" />
                <span>Mark all as read</span>
              </button>
            </div>

            {/* Notifications Grid */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 space-y-4">
              <h3 className="text-xs uppercase font-extrabold tracking-wider text-slate-400">Institutional Announcements & Notifications</h3>

              <div className="divide-y divide-slate-100 dark:divide-slate-800/40 space-y-1">
                {filteredNotifs.length > 0 ? (
                  filteredNotifs.map((n) => (
                    <div key={n.id} className={`py-4 flex items-start justify-between gap-3 text-xs ${n.read ? "opacity-70" : ""}`}>
                      <div className="flex gap-3">
                        <span className={`h-2.5 w-2.5 rounded-full shrink-0 mt-1.5 ${n.read ? "bg-slate-300" : "bg-[#f27a3d] animate-pulse"}`} />
                        <div>
                          <p className="font-extrabold text-slate-900 dark:text-white text-sm">{n.title}</p>
                          <p className="text-slate-500 font-bold mt-1 leading-normal">{n.description}</p>
                          <span className="text-[10px] text-slate-400 font-medium block mt-1">{n.time}</span>
                        </div>
                      </div>

                      <button
                        onClick={() => toggleReadNotif(n.id)}
                        className="text-[10px] font-black text-indigo-650 dark:text-indigo-400 hover:underline shrink-0"
                      >
                        {n.read ? "Mark Unread" : "Mark Read"}
                      </button>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-450 font-bold py-6 text-center">No notifications match your selection.</p>
                )}
              </div>
            </div>
          </div>
        );

      case "feedback":
        return (
          <div className="space-y-6 text-left">
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-sm border border-slate-100 dark:border-slate-800 space-y-5">
              <h3 className="text-sm uppercase font-extrabold tracking-wider text-slate-400">Tuition Feedback</h3>
              <p className="text-xs text-slate-500">Share your experience about tuition quality, teaching, and academy services.</p>
              {feedbackMsg && <p className="text-xs font-bold text-emerald-600">{feedbackMsg}</p>}
              <form onSubmit={handleSubmitTuitionFeedback} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500">Rating</label>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <button key={s} type="button" onClick={() => setFeedbackRating(s)} className="cursor-pointer">
                        <Star className={`h-6 w-6 ${s <= feedbackRating ? "fill-amber-500 text-amber-500" : "text-slate-300"}`} />
                      </button>
                    ))}
                  </div>
                </div>
                <textarea
                  value={feedbackComment}
                  onChange={(e) => setFeedbackComment(e.target.value)}
                  placeholder="Write your feedback about tuition and academy services..."
                  rows={4}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-950 text-sm"
                  required
                />
                <button type="submit" className="px-4 py-2 bg-[#f27a3d] hover:bg-[#ff8950] text-white font-bold text-xs rounded-xl cursor-pointer">
                  Submit Feedback
                </button>
              </form>
            </div>
            {tuitionFeedbacks.length > 0 && (
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-sm border border-slate-100 dark:border-slate-800 space-y-4">
                <h3 className="text-sm uppercase font-extrabold tracking-wider text-slate-400">Previous Feedback</h3>
                {tuitionFeedbacks.map((fb: any) => (
                  <div key={fb.reviewId || fb._id} className="p-4 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-800">
                    <div className="flex gap-1 mb-2">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star key={s} className={`h-4 w-4 ${s <= fb.rating ? "fill-amber-500 text-amber-500" : "text-slate-300"}`} />
                      ))}
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400">{fb.comment}</p>
                    <p className="text-[10px] text-slate-400 mt-1">{new Date(fb.createdAt).toLocaleDateString()}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case "support":
        const faqList = [
          { q: "How do I update my child's registered learning mode?", a: "To change learning mode from online to offline batch lessons, click the 'Roll Out New Subjects' button in dashboard and pick appropriate offline options, or contact the counseling support desk." },
          { q: "Where can I view old paid tuition invoice receipts?", a: "Head to the 'Fee Payments' tab in sidebar navigation. Paid invoices have a Download Receipt button that generates simulated receipts." },
          { q: "Can I request additional assigned tutors for Calculus?", a: "Yes, you can register for specialized syllabus modules via the rollout setup wizard. Once payment checkout resolves, new tutors are assigned dynamically." },
          { q: "How are diagnostic test results graded?", a: "Exams and diagnostic tests are graded out of 100% by assigned academic counselors. Updated grades appear instantly in the Results tab." }
        ];

        return (
          <div className="space-y-6 text-left">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

              {/* FAQ Section */}
              <div className="lg:col-span-7 bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 space-y-4">
                <h3 className="text-sm font-black uppercase text-slate-900 dark:text-white tracking-wider">Frequently Asked Questions</h3>

                <div className="space-y-3">
                  {faqList.map((faq, idx) => {
                    const isExpanded = expandedFaq === idx;
                    return (
                      <div key={idx} className="border border-slate-100 dark:border-slate-850 rounded-2xl overflow-hidden">
                        <button
                          onClick={() => setExpandedFaq(isExpanded ? null : idx)}
                          className="w-full p-4 flex justify-between items-center text-xs font-extrabold text-slate-850 dark:text-slate-200 bg-slate-50/50 dark:bg-slate-950/20 text-left outline-none cursor-pointer"
                        >
                          <span>{faq.q}</span>
                          <span className="text-slate-400 font-bold">{isExpanded ? "−" : "+"}</span>
                        </button>
                        {isExpanded && (
                          <div className="p-4 bg-white dark:bg-slate-900 text-xs text-slate-550 leading-relaxed font-bold border-t border-slate-100 dark:border-slate-850">
                            {faq.a}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Support ticket submission */}
              <div className="lg:col-span-5 bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 space-y-4">
                <h3 className="text-sm font-black uppercase text-slate-900 dark:text-white tracking-wider">Raise Support Ticket</h3>

                {ticketSuccessMsg && (
                  <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-450 border border-emerald-250 rounded-xl text-xs font-bold flex items-center gap-1.5">
                    <CheckCircle2 className="h-4.5 w-4.5 text-emerald-500" />
                    <span>{ticketSuccessMsg}</span>
                  </div>
                )}

                <form onSubmit={handleRaiseTicket} className="space-y-3.5 text-xs font-bold">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-slate-655 block">Category</label>
                      <select
                        value={ticketCategory}
                        onChange={(e) => setTicketCategory(e.target.value)}
                        className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-205 dark:border-slate-850 rounded-xl font-bold"
                      >
                        <option>Academic</option>
                        <option>Billing</option>
                        <option>Tutors</option>
                        <option>Technical</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-slate-655 block">Priority</label>
                      <select
                        value={ticketPriority}
                        onChange={(e) => setTicketPriority(e.target.value)}
                        className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-205 dark:border-slate-850 rounded-xl font-bold"
                      >
                        <option>Low</option>
                        <option>Medium</option>
                        <option>High</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-655 block">Subject</label>
                    <input
                      type="text"
                      placeholder="e.g. Attendance marks correction"
                      value={ticketSubject}
                      onChange={(e) => setTicketSubject(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-205 dark:border-slate-850 rounded-xl font-bold outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-655 block">Description of Issue</label>
                    <textarea
                      rows={3}
                      placeholder="Detail your request..."
                      value={ticketDescription}
                      onChange={(e) => setTicketDescription(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-205 dark:border-slate-850 rounded-xl font-bold outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-[#f27a3d] hover:bg-[#ff8950] text-white py-3 rounded-xl font-extrabold shadow-sm active:scale-95 transition-all cursor-pointer"
                  >
                    Submit Support Ticket
                  </button>
                </form>
              </div>
            </div>

            {/* List of raised tickets */}
            {tickets.length > 0 && (
              <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 space-y-3">
                <h3 className="text-xs uppercase font-extrabold tracking-wider text-slate-400">Raised Tickets Registry</h3>
                <div className="space-y-2.5">
                  {tickets.map((t) => (
                    <div key={t.id} className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                      <div className="text-xs space-y-1 font-bold text-left">
                        <div className="flex items-center gap-2">
                          <span className="text-slate-850 dark:text-white font-black">{t.subject}</span>
                          <span className="text-[9px] uppercase bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded">
                            {t.category}
                          </span>
                        </div>
                        <p className="text-slate-500 font-medium text-[11px]">{t.description}</p>
                        <p className="text-[10px] text-slate-400 font-medium">Created: {t.date} | ID: {t.id}</p>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <span className={`text-[9px] px-2.5 py-1 font-black uppercase rounded ${t.priority === "High" ? "bg-rose-50 dark:bg-rose-950/40 text-rose-500" : "bg-amber-50 dark:bg-amber-950/30 text-amber-500"
                          }`}>
                          {t.priority} Priority
                        </span>
                        <span className={`text-[10px] px-2.5 py-1 font-black uppercase rounded-lg ${t.status === "Resolved"
                          ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-450"
                          : "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-650 dark:text-indigo-400"
                          }`}>
                          {t.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );

      case "profile":
        return (
          <div className="space-y-6 text-left">
            {editSuccessMsg && (
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-450 border border-emerald-250 rounded-xl text-xs font-bold flex items-center gap-1.5">
                <CheckCircle2 className="h-4.5 w-4.5 text-emerald-500" />
                <span>{editSuccessMsg}</span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Profile Details Card */}
              <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 space-y-4">
                <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
                  <h3 className="text-sm font-black uppercase text-slate-900 dark:text-white tracking-wider">Parent Profile details</h3>
                  {!isEditingProfile && (
                    <button
                      onClick={() => {
                        setEditName(parentProfile.name);
                        setEditPhone(parentProfile.phone);
                        setEditAddress(parentProfile.address);
                        setIsEditingProfile(true);
                      }}
                      className="text-xs font-black text-[#f27a3d] hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Edit2 className="h-3 w-3" />
                      <span>Edit Details</span>
                    </button>
                  )}
                </div>

                {isEditingProfile ? (
                  <form onSubmit={handleSaveProfile} className="space-y-3.5 text-xs font-bold">
                    <div className="space-y-1">
                      <label className="text-slate-655 block">Full Profile Name</label>
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-205 dark:border-slate-850 rounded-xl font-bold"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-slate-655 block">Contact Phone</label>
                      <input
                        type="text"
                        value={editPhone}
                        onChange={(e) => setEditPhone(e.target.value)}
                        className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-205 dark:border-slate-850 rounded-xl font-bold"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-slate-655 block">Billing Address</label>
                      <input
                        type="text"
                        value={editAddress}
                        onChange={(e) => setEditAddress(e.target.value)}
                        className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-205 dark:border-slate-850 rounded-xl font-bold"
                      />
                    </div>

                    <div className="flex gap-2 pt-2">
                      <button
                        type="submit"
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-black text-xs flex items-center gap-1 cursor-pointer shadow-sm"
                      >
                        <Save className="h-3.5 w-3.5" />
                        <span>Save Changes</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsEditingProfile(false)}
                        className="px-4 py-2 border border-slate-200 dark:border-slate-850 text-slate-700 dark:text-slate-300 rounded-xl font-bold text-xs hover:bg-slate-50"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-3 text-xs leading-normal font-bold">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <span className="text-slate-400 block">Parent Name</span>
                        <span className="font-extrabold text-slate-850 dark:text-white text-sm">{parentProfile.name}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Registered Email</span>
                        <span className="font-extrabold text-slate-850 dark:text-white text-sm">{parentProfile.email}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <span className="text-slate-400 block">Phone Contact</span>
                        <span className="font-extrabold text-slate-850 dark:text-white text-sm">{parentProfile.phone}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Relationship</span>
                        <span className="font-extrabold text-slate-850 dark:text-white text-sm">{parentProfile.relationship}</span>
                      </div>
                    </div>

                    <div>
                      <span className="text-slate-400 block">Address Location</span>
                      <span className="font-extrabold text-slate-850 dark:text-white text-sm">{parentProfile.address}</span>
                    </div>

                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                      <span className="text-slate-400 block">Account Registration Date</span>
                      <span className="text-slate-500 text-[11px]">{parentProfile.registrationDate}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Associated Child Details Card */}
              <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 space-y-4">
                <h3 className="text-sm font-black uppercase text-slate-900 dark:text-white tracking-wider border-b border-slate-100 dark:border-slate-800 pb-3">
                  Enrolled Child roster association
                </h3>

                <div className="flex items-center gap-3">
                  <div className="h-14 w-14 rounded-full bg-[#f27a3d]/10 text-[#f27a3d] border border-[#f27a3d]/30 flex items-center justify-center font-extrabold text-lg">
                    {activeStudent.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-black text-slate-900 dark:text-white leading-tight">{activeStudent.name}</h4>
                    <p className="text-xs text-slate-500 font-bold mt-0.5">{activeStudent.grade} ({activeStudent.section || "STEM Section"})</p>
                  </div>
                </div>

                <div className="text-xs space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800 font-bold">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Child Student ID</span>
                    <span className="text-slate-850 dark:text-slate-200">{activeStudent.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Enrolled Subjects count</span>
                    <span className="text-slate-850 dark:text-slate-200">{activeStudent.learningSubjects.length} Modules</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Average Academic Marks</span>
                    <span className="text-emerald-650 dark:text-emerald-400 font-black">87.0% Score</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Attendance Standard status</span>
                    <span className="text-slate-850 dark:text-slate-200">Active - {activeStudent.attendanceRate}% Rate</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case "settings":
        return (
          <div className="space-y-6 text-left">
            {settingsSuccessMsg && (
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-450 border border-emerald-250 rounded-xl text-xs font-bold flex items-center gap-1.5 animate-pulse">
                <CheckCircle2 className="h-4.5 w-4.5 text-emerald-500" />
                <span>{settingsSuccessMsg}</span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              {/* Account settings preferences */}
              <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 space-y-5">
                <h3 className="text-sm font-black uppercase text-slate-900 dark:text-white tracking-wider border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center gap-1.5">
                  <Settings className="h-4 w-4" /> System Preferences
                </h3>

                {/* Notifications Channels Toggles */}
                <div className="space-y-3.5 text-xs font-bold">
                  <h4 className="text-slate-400 uppercase tracking-widest text-[9px] font-black">Notification Channels</h4>

                  <label className="flex items-center justify-between cursor-pointer p-1">
                    <div>
                      <p className="text-slate-850 dark:text-white font-extrabold">Email Notifications</p>
                      <p className="text-[10px] text-slate-500 font-medium mt-0.5">Receive academic performance updates</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={emailNotifs}
                      onChange={() => setEmailNotifs(!emailNotifs)}
                      className="w-4 h-4 accent-[#f27a3d] cursor-pointer"
                    />
                  </label>

                  <label className="flex items-center justify-between cursor-pointer p-1">
                    <div>
                      <p className="text-slate-850 dark:text-white font-extrabold">WhatsApp Message alerts</p>
                      <p className="text-[10px] text-slate-500 font-medium mt-0.5">Instant WhatsApp invoice rollout alerts</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={whatsappNotifs}
                      onChange={() => setWhatsappNotifs(!whatsappNotifs)}
                      className="w-4 h-4 accent-[#f27a3d] cursor-pointer"
                    />
                  </label>

                  <label className="flex items-center justify-between cursor-pointer p-1">
                    <div>
                      <p className="text-slate-850 dark:text-white font-extrabold">SMS Mobile Alerts</p>
                      <p className="text-[10px] text-slate-500 font-medium mt-0.5">Critical warning details notifications</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={smsNotifs}
                      onChange={() => setSmsNotifs(!smsNotifs)}
                      className="w-4 h-4 accent-[#f27a3d] cursor-pointer"
                    />
                  </label>
                </div>

                {/* System Toggles */}
                <div className="border-t border-slate-100 dark:border-slate-800 pt-4 space-y-3.5 text-xs font-bold">
                  <h4 className="text-slate-400 uppercase tracking-widest text-[9px] font-black">Security Preferences</h4>

                  <label className="flex items-center justify-between cursor-pointer p-1">
                    <div>
                      <p className="text-slate-850 dark:text-white font-extrabold">Two-Factor Authentication (2FA)</p>
                      <p className="text-[10px] text-slate-500 font-medium mt-0.5">Secure dashboard access logins</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={twoFactor}
                      onChange={() => setTwoFactor(!twoFactor)}
                      className="w-4 h-4 accent-[#f27a3d] cursor-pointer"
                    />
                  </label>
                </div>
              </div>

              {/* Password update simulated card */}
              <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 space-y-4">
                <h3 className="text-sm font-black uppercase text-slate-900 dark:text-white tracking-wider border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center gap-1.5">
                  <Lock className="h-4 w-4" /> Change Portal Password
                </h3>

                <form onSubmit={handleUpdatePassword} className="space-y-3.5 text-xs font-bold">
                  <div className="space-y-1">
                    <label className="text-slate-655 block">Current Password</label>
                    <input
                      type={passwordVisibility.current ? "text" : "password"}
                      placeholder="••••••••"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-205 dark:border-slate-850 rounded-xl font-bold"
                    />
                    <button
                      type="button"
                      onClick={() => setPasswordVisibility((prev) => ({ ...prev, current: !prev.current }))}
                      className="mt-1 inline-flex items-center gap-1 text-[10px] font-black text-slate-500 hover:text-sky-600"
                    >
                      {passwordVisibility.current ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                      <span>{passwordVisibility.current ? "Hide" : "Show"}</span>
                    </button>
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-655 block">New Password</label>
                    <input
                      type={passwordVisibility.next ? "text" : "password"}
                      placeholder="••••••••"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-205 dark:border-slate-850 rounded-xl font-bold"
                    />
                    <button
                      type="button"
                      onClick={() => setPasswordVisibility((prev) => ({ ...prev, next: !prev.next }))}
                      className="mt-1 inline-flex items-center gap-1 text-[10px] font-black text-slate-500 hover:text-sky-600"
                    >
                      {passwordVisibility.next ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                      <span>{passwordVisibility.next ? "Hide" : "Show"}</span>
                    </button>
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-655 block">Confirm New Password</label>
                    <input
                      type={passwordVisibility.confirm ? "text" : "password"}
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-205 dark:border-slate-850 rounded-xl font-bold"
                    />
                    <button
                      type="button"
                      onClick={() => setPasswordVisibility((prev) => ({ ...prev, confirm: !prev.confirm }))}
                      className="mt-1 inline-flex items-center gap-1 text-[10px] font-black text-slate-500 hover:text-sky-600"
                    >
                      {passwordVisibility.confirm ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                      <span>{passwordVisibility.confirm ? "Hide" : "Show"}</span>
                    </button>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-[#f27a3d] hover:bg-[#ff8950] text-white py-3 rounded-xl font-extrabold shadow-sm active:scale-95 transition-all cursor-pointer"
                  >
                    Update Password Verification
                  </button>
                </form>
              </div>

            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="h-full overflow-hidden bg-slate-50 dark:bg-slate-950 flex flex-col md:flex-row transition-colors duration-300">

      {/* Sidebar Navigation */}
      <aside className={`${sidebarOpen ? "w-full md:w-64" : "w-0 md:w-0 p-0 overflow-hidden"} bg-[#3f2115] dark:bg-[#20100a] text-amber-50 flex flex-col ${sidebarOpen ? "p-5" : ""} border-r border-[#4e2c1e] shrink-0 md:h-full transition-all duration-300`}>
        {sidebarOpen && (<>
          <div className="flex-1 min-h-0 overflow-y-auto space-y-6 modal-scroll">
            {/* Logo Brand Header */}
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <span className="p-2 bg-[#f27a3d] rounded-xl text-white shadow-lg">
                  <Users className="h-5 w-5" />
                </span>
                <span className="font-extrabold text-sm tracking-widest text-white uppercase">
                  Parent Space
                </span>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                title="Close panel"
              >
                <PanelLeftClose className="h-4 w-4" />
              </button>
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
                      handleTabChange(item.id);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all ${isActive
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
          <div className="pt-4 border-t border-white/10 mt-4 shrink-0 flex items-center justify-between gap-3 text-left">
            <div className="flex items-center gap-2">
              <div className="h-9 w-9 rounded-full bg-[#f27a3d]/20 text-[#f27a3d] flex items-center justify-center font-bold text-sm border border-[#f27a3d]/30">
                RJ
              </div>
              <div>
                <p className="text-xs font-black text-white leading-tight">{parentProfile.name}</p>
                <p className="text-[10px] text-amber-200/50">Parent Member</p>
              </div>
            </div>
          </div>
        </>)}
      </aside>

      {/* Sidebar open button when collapsed */}
      {!sidebarOpen && (
        <button
          onClick={() => setSidebarOpen(true)}
          className="fixed top-20 left-2 z-40 p-2 bg-[#3f2115] border border-[#4e2c1e] rounded-xl text-amber-200 hover:text-white hover:bg-[#4e2c1e] transition-colors shadow-lg"
          title="Open panel"
        >
          <PanelLeftOpen className="h-5 w-5" />
        </button>
      )}

      <main ref={mainPanelRef} data-scroll-container className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden p-4 sm:p-6 lg:p-8 pb-24 space-y-6 relative">

        <FooterNavigation
          onBack={() => {
            const currentIdx = sidebarItems.findIndex((item) => item.id === activeTab);
            if (currentIdx > 0) {
              handleTabChange(sidebarItems[currentIdx - 1].id);
            } else {
              window.history.back();
            }
          }}
          onContinue={() => {
            const currentIdx = sidebarItems.findIndex((item) => item.id === activeTab);
            if (currentIdx < sidebarItems.length - 1) {
              handleTabChange(sidebarItems[currentIdx + 1].id);
            }
          }}
          backDisabled={activeTab === sidebarItems[0].id && window.history.length <= 1}
          continueDisabled={activeTab === sidebarItems[sidebarItems.length - 1].id}
        />

        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 text-left mt-8">
          <div className="space-y-1">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white">
              Welcome back, {parentProfile.name.split(" ")[0]} 👋
            </h2>
            <p className="text-xs text-slate-550 dark:text-slate-400">
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
          <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-250 p-4 rounded-xl text-xs text-emerald-600 dark:text-emerald-450 font-bold flex items-center gap-2 text-left">
            <CheckCircle2 className="h-5 w-5 animate-pulse text-emerald-500 shrink-0" />
            <span>{paymentSuccessMsg}</span>
          </div>
        )}

        {/* Unique Render tab section */}
        <div className="tab-fade-in">
          {renderTabContent()}
        </div>

        <div className="-mx-4 sm:-mx-6 lg:-mx-8 -mb-24 mt-8">
          <Footer />
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
                className="p-1 rounded-lg hover:bg-slate-150 dark:hover:bg-slate-800 text-slate-450"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Wizard progress rail */}
            <div className="bg-slate-100 dark:bg-slate-900 h-1.5 w-full flex">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className={`flex-1 h-full border-r border-white/20 last:border-none transition-colors duration-300 ${wizardStep >= i + 1 ? "bg-gradient-to-r from-sky-400 to-indigo-500" : "bg-slate-200 dark:bg-slate-800"
                    }`}
                />
              ))}
            </div>

            {/* Modal Content body (State Driven) */}
            <div className="p-6 overflow-y-auto max-h-[70vh] flex-1 space-y-4 modal-scroll">

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
                    <label className="text-xs font-extrabold block text-slate-700 dark:text-slate-350">Check Subjects to Roll Out:</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {(SUBJECTS_BY_CLASS[wizardClass] || []).map((sub) => {
                        const isChecked = wizardSubjects.includes(sub);
                        return (
                          <button
                            type="button"
                            key={sub}
                            onClick={() => toggleSubjectSelect(sub)}
                            className={`p-2.5 rounded-xl border text-left text-xs font-bold transition-all flex items-center justify-between ${isChecked
                              ? "bg-indigo-50 border-indigo-400 text-indigo-755 dark:bg-indigo-950 dark:text-indigo-300"
                              : "border-slate-100 hover:bg-slate-50 dark:border-slate-850 dark:bg-slate-900 text-slate-700 dark:text-slate-350"
                              }`}
                          >
                            <span>{sub}</span>
                            <span className={`h-4 w-4 rounded-full border flex items-center justify-center text-[10px] ${isChecked ? "bg-indigo-650 border-indigo-600 text-white" : "border-slate-300"
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
                      className={`p-6 rounded-2xl border text-left transition-all ${wizardMode === "Online"
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
                      className={`p-6 rounded-2xl border text-left transition-all ${wizardMode === "Offline"
                        ? "bg-sky-50 border-sky-400 dark:bg-sky-950/40"
                        : "border-slate-100 hover:bg-slate-50 dark:border-slate-850 dark:bg-slate-900"
                        }`}
                    >
                      <span className="text-sm font-black block text-slate-955 dark:text-white">Offline Regional Center</span>
                      <span className="text-[10px] text-slate-550 block mt-1 leading-normal">Individual in-person classrooms. Best attention. Small regional batches.</span>
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
                    <p className="text-xs text-slate-500 font-bold">Select veteran instructors specialized for the target coursework.</p>
                  </div>

                  <div className="space-y-2">
                    {tutors.map((t) => (
                      <button
                        type="button"
                        key={t.id}
                        onClick={() => setWizardTutorId(t.id)}
                        className={`w-full p-4 rounded-xl border text-left flex items-center justify-between transition-colors ${wizardTutorId === t.id
                          ? "bg-sky-50 border-sky-400 dark:bg-sky-950/40 text-sky-700"
                          : "border-slate-100 hover:bg-slate-50 dark:border-slate-850 dark:bg-slate-900 text-slate-700"
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
                          onChange={() => { }}
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
                        className={`p-3.5 rounded-xl border text-left text-xs font-bold transition-all flex items-center justify-between ${wizardLocation === loc
                          ? "bg-indigo-50 border-indigo-400 text-indigo-755 dark:bg-indigo-950/30 dark:text-indigo-300"
                          : "border-slate-100 hover:bg-slate-50 dark:border-slate-855 dark:bg-slate-900 text-slate-700"
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
                          onChange={() => { }}
                          className="accent-indigo-650"
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
                    <p className="text-xs text-slate-550">Preview the calculated price summary details. Clicking Pay automatically activates courses.</p>
                  </div>

                  {/* Pricing receipt card */}
                  <div className="border border-slate-200 bg-slate-50 dark:bg-slate-900 dark:border-slate-800 p-5 rounded-2xl relative">
                    <div className="border-b border-dashed border-slate-300 pb-3 mb-3 space-y-1">
                      <div className="flex justify-between text-xs font-extrabold text-slate-700 dark:text-slate-350">
                        <span>Class Program Selection:</span>
                        <span className="text-indigo-650">{wizardClass}</span>
                      </div>
                      <div className="flex justify-between text-xs font-extrabold text-slate-700 dark:text-slate-350">
                        <span>Coaching Mode:</span>
                        <span className="uppercase text-slate-900 dark:text-white">{wizardMode}</span>
                      </div>
                      <div className="flex justify-between text-xs font-extrabold text-slate-700 dark:text-slate-350">
                        <span>Active Center Location:</span>
                        <span className="text-slate-900 dark:text-white">{wizardLocation}</span>
                      </div>
                    </div>

                    <div className="space-y-2 border-b border-dashed border-slate-300 pb-3 mb-3">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Selected Subjects Ledger:</p>
                      {wizardSubjects.map((sub, idx) => (
                        <div key={idx} className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-200">
                          <span>+ {sub} Tuition module</span>
                          <span>₹150.00</span>
                        </div>
                      ))}
                      <div className="flex justify-between text-xs font-medium text-slate-500 dark:text-slate-450">
                        <span>Base Tuition Fee Rate</span>
                        <span>₹{wizardMode === "Online" ? 200 : 350}.00</span>
                      </div>
                    </div>

                    <div className="flex justify-between items-center text-sm font-black text-slate-950 dark:text-white">
                      <span>Total Calculated Fee:</span>
                      <span className="text-emerald-600 dark:text-emerald-450 text-lg font-black">₹{computedFee}.00</span>
                    </div>
                  </div>

                  <div className="bg-amber-50 dark:bg-amber-955/30 rounded-xl p-3 border border-amber-200 text-left flex gap-2 items-start">
                    <AlertCircle className="h-5 w-5 text-amber-550 shrink-0 mt-0.5" />
                    <p className="text-[10px] text-slate-655 dark:text-slate-350 leading-relaxed font-semibold">
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
                  className="rounded-xl border border-slate-205 px-4 py-2.5 text-xs font-bold bg-white text-slate-800 hover:bg-slate-100"
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
                  className="rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2.5 text-xs font-black flex items-center gap-1.5 shadow cursor-pointer"
                >
                  <span>Pay Tuition & Finalize</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              )}
            </div>

          </div>
        </div>
      )}

      {/* Make Payment Modal */}
      {isPaymentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 text-left">
          <div className="w-full max-w-lg bg-white dark:bg-slate-950 rounded-3xl overflow-hidden shadow-2xl border border-slate-150 dark:border-slate-800 flex flex-col">

            {/* Modal Header */}
            <div className="bg-slate-50 dark:bg-slate-900 px-6 py-4 border-b border-slate-150 dark:border-slate-800 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-[#f27a3d] flex items-center justify-center text-white">
                  <DollarSign className="h-4.5 w-4.5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900 dark:text-white">Make Tuition Payment</h3>
                  <p className="text-[10px] text-slate-550">Secure online checkouts system</p>
                </div>
              </div>
              <button
                onClick={() => setIsPaymentModalOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-150 dark:hover:bg-slate-800 text-slate-400"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleProcessPayment} className="p-6 overflow-y-auto max-h-[75vh] flex-1 space-y-4 text-xs font-bold modal-scroll">

              {/* Autofilled Fields */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-slate-400 block uppercase tracking-wider text-[9px]">Student Name</label>
                  <input
                    type="text"
                    value={activeStudent.name}
                    readOnly
                    className="w-full p-2.5 bg-slate-105 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl font-extrabold text-slate-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-400 block uppercase tracking-wider text-[9px]">Parent Name</label>
                  <input
                    type="text"
                    value={parentProfile.name}
                    readOnly
                    className="w-full p-2.5 bg-slate-105 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl font-extrabold text-slate-500"
                  />
                </div>
              </div>

              {/* Invoice Selection */}
              <div className="space-y-1">
                <label className="text-slate-655 block">Select Statement Invoice</label>
                <select
                  value={paymentSelectedInvoiceId}
                  onChange={(e) => {
                    const val = e.target.value;
                    setPaymentSelectedInvoiceId(val);
                    if (val === "custom") {
                      setPaymentInvoiceNumber(`INV-CUST-${Math.floor(1000 + Math.random() * 9000)}`);
                      setPaymentAmount(0);
                    } else if (val) {
                      const match = currentChildFees.find(f => f.id === val);
                      if (match) {
                        setPaymentInvoiceNumber(match.id);
                        setPaymentAmount(match.amount);
                      }
                    } else {
                      setPaymentInvoiceNumber("");
                      setPaymentAmount(0);
                    }
                  }}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl font-bold"
                >
                  <option value="">-- Choose Invoice to Pay --</option>
                  {currentChildFees.filter(f => f.status === "Pending").map((fee) => (
                    <option key={fee.id} value={fee.id}>
                      {fee.title} - ₹{fee.amount} (Due: {fee.dueDate})
                    </option>
                  ))}
                  <option value="custom">Custom Miscellaneous Payment</option>
                </select>
              </div>

              {/* Invoice details */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-slate-655 block">Invoice Number</label>
                  <input
                    type="text"
                    value={paymentInvoiceNumber}
                    onChange={(e) => setPaymentInvoiceNumber(e.target.value)}
                    placeholder="e.g. FP-501"
                    disabled={paymentSelectedInvoiceId !== "custom" && paymentSelectedInvoiceId !== ""}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl font-bold disabled:opacity-60"
                  />
                  {paymentErrors.invoiceNumber && <p className="text-rose-500 text-[10px] mt-0.5">{paymentErrors.invoiceNumber}</p>}
                </div>

                <div className="space-y-1">
                  <label className="text-slate-655 block">Fee Amount ($)</label>
                  <input
                    type="number"
                    value={paymentAmount || ""}
                    onChange={(e) => setPaymentAmount(parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                    disabled={paymentSelectedInvoiceId !== "custom" && paymentSelectedInvoiceId !== ""}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl font-bold disabled:opacity-60"
                  />
                  {paymentErrors.amount && <p className="text-rose-500 text-[10px] mt-0.5">{paymentErrors.amount}</p>}
                </div>
              </div>

              {/* Payment Date */}
              <div className="space-y-1">
                <label className="text-slate-655 block">Payment Date</label>
                <input
                  type="date"
                  value={paymentDate}
                  onChange={(e) => setPaymentDate(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl font-bold"
                />
              </div>

              {/* Payment Methods Selection Tabs */}
              <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <label className="text-slate-400 block uppercase tracking-wider text-[9px]">Select Payment Method</label>
                <div className="grid grid-cols-5 gap-1 text-[10px] font-black text-center">
                  {(["UPI", "Credit Card", "Debit Card", "Net Banking", "Wallet"] as const).map((method) => {
                    const isSel = paymentMethod === method;
                    return (
                      <button
                        type="button"
                        key={method}
                        onClick={() => {
                          setPaymentMethod(method);
                          setPaymentErrors({});
                        }}
                        className={`py-2 rounded-lg border transition-all cursor-pointer truncate ${isSel
                          ? "bg-[#f27a3d] text-white border-[#f27a3d] shadow-sm"
                          : "bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100"
                          }`}
                      >
                        {method}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Dynamic Payment Method Fields */}
              <div className="p-4 bg-slate-50 dark:bg-slate-900/60 border border-slate-150 dark:border-slate-850 rounded-2xl space-y-3 mt-3">
                {paymentMethod === "UPI" && (
                  <div className="space-y-3 text-center flex flex-col items-center">
                    {/* SVG QR Code Placeholder */}
                    <div className="h-28 w-28 bg-white p-2 rounded-xl border border-slate-200 flex items-center justify-center shadow-sm">
                      <svg viewBox="0 0 100 100" className="w-full h-full text-slate-800">
                        <path d="M5,5 h30 v30 h-30 z M5,15 h30 M15,5 v30" stroke="currentColor" strokeWidth="2" fill="none" />
                        <path d="M65,5 h30 v30 h-30 z M65,15 h30 M75,5 v30" stroke="currentColor" strokeWidth="2" fill="none" />
                        <path d="M5,65 h30 v30 h-30 z M5,75 h30 M15,65 v30" stroke="currentColor" strokeWidth="2" fill="none" />
                        <rect x="10" y="10" width="10" height="10" fill="currentColor" />
                        <rect x="70" y="10" width="10" height="10" fill="currentColor" />
                        <rect x="10" y="70" width="10" height="10" fill="currentColor" />
                        <rect x="45" y="45" width="10" height="10" fill="currentColor" />
                        <rect x="55" y="60" width="15" height="15" fill="currentColor" />
                        <rect x="70" y="70" width="10" height="20" fill="currentColor" />
                        <rect x="85" y="85" width="10" height="10" fill="currentColor" />
                      </svg>
                    </div>
                    <span className="text-[10px] text-slate-400 font-bold">Scan QR Code or pay using UPI ID</span>

                    <div className="w-full space-y-1 text-left">
                      <label className="text-slate-655 block">Your UPI ID</label>
                      <input
                        type="text"
                        placeholder="username@bank"
                        value={upiId}
                        onChange={(e) => setUpiId(e.target.value)}
                        className="w-full p-2.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-bold"
                      />
                      {paymentErrors.upiId && <p className="text-rose-500 text-[10px] mt-0.5">{paymentErrors.upiId}</p>}
                    </div>
                  </div>
                )}

                {(paymentMethod === "Credit Card" || paymentMethod === "Debit Card") && (
                  <div className="space-y-3 text-left">
                    <div className="space-y-1">
                      <label className="text-slate-655 block">Card Holder Name</label>
                      <input
                        type="text"
                        placeholder="John Doe"
                        value={cardHolderName}
                        onChange={(e) => setCardHolderName(e.target.value)}
                        className="w-full p-2.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-bold"
                      />
                      {paymentErrors.cardHolderName && <p className="text-rose-500 text-[10px] mt-0.5">{paymentErrors.cardHolderName}</p>}
                    </div>

                    <div className="space-y-1">
                      <label className="text-slate-655 block">Card Number</label>
                      <input
                        type="text"
                        maxLength={19}
                        placeholder="1234 5678 1234 5678"
                        value={cardNumber}
                        onChange={(e) => {
                          const v = e.target.value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
                          const matches = v.match(/\d{4,16}/g);
                          const match = (matches && matches[0]) || "";
                          const parts = [];

                          for (let i = 0, len = match.length; i < len; i += 4) {
                            parts.push(match.substring(i, i + 4));
                          }

                          if (parts.length > 0) {
                            setCardNumber(parts.join(" "));
                          } else {
                            setCardNumber(v);
                          }
                        }}
                        className="w-full p-2.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-bold"
                      />
                      {paymentErrors.cardNumber && <p className="text-rose-500 text-[10px] mt-0.5">{paymentErrors.cardNumber}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-slate-655 block">Expiry Date</label>
                        <input
                          type="text"
                          placeholder="MM/YY"
                          maxLength={5}
                          value={cardExpiry}
                          onChange={(e) => {
                            const val = e.target.value.replace(/[^0-9]/g, "");
                            if (val.length >= 2) {
                              setCardExpiry(val.substring(0, 2) + "/" + val.substring(2, 4));
                            } else {
                              setCardExpiry(val);
                            }
                          }}
                          className="w-full p-2.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-bold"
                        />
                        {paymentErrors.cardExpiry && <p className="text-rose-500 text-[10px] mt-0.5">{paymentErrors.cardExpiry}</p>}
                      </div>

                      <div className="space-y-1">
                        <label className="text-slate-655 block">CVV</label>
                        <input
                          type={passwordVisibility.cvv ? "text" : "password"}
                          placeholder="•••"
                          maxLength={3}
                          value={cardCvv}
                          onChange={(e) => setCardCvv(e.target.value.replace(/[^0-9]/g, ""))}
                          className="w-full p-2.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-bold"
                        />
                        <button
                          type="button"
                          onClick={() => setPasswordVisibility((prev) => ({ ...prev, cvv: !prev.cvv }))}
                          className="mt-1 inline-flex items-center gap-1 text-[10px] font-black text-slate-500 hover:text-sky-600"
                        >
                          {passwordVisibility.cvv ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                          <span>{passwordVisibility.cvv ? "Hide" : "Show"}</span>
                        </button>
                        {paymentErrors.cardCvv && <p className="text-rose-500 text-[10px] mt-0.5">{paymentErrors.cardCvv}</p>}
                      </div>
                    </div>
                  </div>
                )}

                {paymentMethod === "Net Banking" && (
                  <div className="space-y-3 text-left">
                    <div className="space-y-1">
                      <label className="text-slate-655 block">Choose Bank</label>
                      <select
                        value={selectedBank}
                        onChange={(e) => setSelectedBank(e.target.value)}
                        className="w-full p-2.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-bold"
                      >
                        <option>SBI Bank</option>
                        <option>HDFC Bank</option>
                        <option>ICICI Bank</option>
                        <option>Axis Bank</option>
                        <option>Kotak Mahindra Bank</option>
                      </select>
                    </div>
                  </div>
                )}

                {paymentMethod === "Wallet" && (
                  <div className="space-y-3 text-left">
                    <div className="space-y-1">
                      <label className="text-slate-655 block">Choose Digital Wallet</label>
                      <select
                        value={selectedWallet}
                        onChange={(e) => setSelectedWallet(e.target.value)}
                        className="w-full p-2.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-bold"
                      >
                        <option>Google Pay</option>
                        <option>PhonePe</option>
                        <option>Paytm</option>
                        <option>Amazon Pay</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>

              {/* General Error Display */}
              {paymentErrors.general && (
                <div className="p-3 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 rounded-xl flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-rose-500 shrink-0 mt-0.5" />
                  <p className="text-xs font-bold text-rose-600 dark:text-rose-400">{paymentErrors.general}</p>
                </div>
              )}

              {/* Submit Buttons */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsPaymentModalOpen(false)}
                  disabled={isPaymentProcessing}
                  className="px-4 py-2.5 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-bold disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPaymentProcessing}
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-70 disabled:cursor-not-allowed text-white font-extrabold shadow-sm active:scale-95 transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  <span>{isPaymentProcessing ? "Processing..." : "Pay Now"}</span>
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* Payment Success Popup */}
      {paymentSuccessPopupOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 text-center">
          <div className="w-full max-w-sm bg-white dark:bg-slate-950 rounded-3xl p-6 shadow-2xl border border-slate-150 dark:border-slate-800 space-y-4">
            <div className="h-14 w-14 bg-emerald-50 dark:bg-emerald-950/40 rounded-full flex items-center justify-center mx-auto text-emerald-600">
              <CheckCircle2 className="h-8 w-8 text-emerald-500 animate-bounce" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white">Payment Successful!</h3>
              <p className="text-xs text-slate-500 mt-1">Your tuition fee invoice has been processed.</p>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-2xl text-[11px] text-slate-655 space-y-1 font-bold">
              <div className="flex justify-between">
                <span>Transaction ID:</span>
                <span className="text-slate-900 dark:text-white font-black">{latestTxnId}</span>
              </div>
              <div className="flex justify-between">
                <span>Amount Charged:</span>
                <span className="text-slate-900 dark:text-white font-black">₹{paymentAmount}</span>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setPaymentSuccessPopupOpen(false);
                  setIsReceiptModalOpen(true);
                }}
                className="flex-1 py-2.5 bg-indigo-650 hover:bg-indigo-500 text-white rounded-xl text-xs font-black shadow cursor-pointer"
              >
                View Receipt
              </button>
              <button
                onClick={() => setPaymentSuccessPopupOpen(false)}
                className="flex-1 py-2.5 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-330 rounded-xl text-xs font-bold hover:bg-slate-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <FeeReceiptModal
        isOpen={isReceiptModalOpen}
        receiptData={receiptData}
        onClose={() => setIsReceiptModalOpen(false)}
      />

    </div>
  );
}
