/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Student, Tutor, FeePayment, Assignment, ParentProfile } from "../types";

export const normalizeStudent = (apiStudent: any): Student => ({
  id: apiStudent.studentId || apiStudent._id || apiStudent.id || "",
  name: apiStudent.name || "Student",
  grade: apiStudent.grade || "9th Class",
  section: apiStudent.section || "Section A",
  attendanceRate: apiStudent.attendanceRate ?? 100,
  presentCount: apiStudent.presentCount ?? 0,
  absentCount: apiStudent.absentCount ?? 0,
  learningSubjects: (apiStudent.learningSubjects || []).map((item: string | { name: string }) => {
    const name = typeof item === "string" ? item : item.name;
    return { name, completedPercentage: 0, completedWeeks: 0 };
  }),
  results: (apiStudent.results || []).map((result: any) => ({
    term: result.term || "Current",
    gpa: result.gpa ?? 4.0,
    score: result.score ?? 100,
    mathsScore: result.mathsScore ?? 95,
    physicsScore: result.physicsScore ?? 92,
    literatureScore: result.literatureScore ?? 93,
    compSciScore: result.compSciScore ?? 91,
  })),
  classTimings: apiStudent.classTimings?.length
    ? apiStudent.classTimings
    : [{ subject: "Student Support", time: "09:00 AM", day: "Mon, Wed", mode: "Hybrid" as const }],
  upcomingEvents: apiStudent.upcomingEvents || [],
  videoResources: apiStudent.videoResources || [],
  parentEmail: apiStudent.parentEmail || "",
  assignedTutorIds: apiStudent.assignedTutorIds || [],
});

export const normalizeTutor = (apiTutor: any): Tutor => ({
  id: apiTutor.tutorId || apiTutor._id || apiTutor.id || "",
  name: apiTutor.name || "Tutor",
  specialty: apiTutor.specialty || "General Educator",
  email: apiTutor.email || "",
  image: apiTutor.image || "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80",
  assignedStudentIds: apiTutor.assignedStudentIds || [],
  pendingTasksCount: apiTutor.pendingTasksCount ?? 0,
  subjects: apiTutor.subjects || [],
});

export const normalizeFee = (apiFee: any): FeePayment => ({
  id: apiFee.feeId || apiFee._id || apiFee.id || "",
  studentId: apiFee.studentId || "",
  studentName: apiFee.studentName || "",
  title: apiFee.title || "Outstanding Fee",
  amount: apiFee.amount ?? 0,
  status: apiFee.status || "Pending",
  dueDate: typeof apiFee.dueDate === "string"
    ? apiFee.dueDate.split("T")[0]
    : new Date(apiFee.dueDate).toISOString().split("T")[0],
  transactionId: apiFee.transactionId,
  paymentMethod: apiFee.paymentMethod,
  paidDate: apiFee.paidDate
    ? (typeof apiFee.paidDate === "string"
      ? apiFee.paidDate.split("T")[0]
      : new Date(apiFee.paidDate).toISOString().split("T")[0])
    : undefined,
});

export const normalizeAssignment = (apiAssignment: any): Assignment => ({
  id: apiAssignment.assignmentId || apiAssignment._id || apiAssignment.id || "",
  title: apiAssignment.title || "New Assignment",
  subject: apiAssignment.subject || "General",
  dueDate: typeof apiAssignment.dueDate === "string"
    ? apiAssignment.dueDate.split("T")[0]
    : new Date(apiAssignment.dueDate || Date.now()).toISOString().split("T")[0],
  submissionsPending: apiAssignment.submissionsPending ?? 0,
  status: apiAssignment.status || "Active",
});

export const normalizeParent = (apiParent: any): ParentProfile => ({
  id: apiParent._id || apiParent.id || "",
  email: apiParent.email || "",
  name: apiParent.name || "",
  phone: apiParent.phone || "",
  address: apiParent.address || "",
  occupation: apiParent.occupation || "",
  childrenIds: apiParent.childrenIds || [],
});
