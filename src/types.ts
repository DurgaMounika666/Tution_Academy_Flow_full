/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Student {
  id: string; // e.g. ST-101, ST-102
  name: string;
  grade: string; // e.g. "Grade 10", "Grade 12"
  section: string;
  attendanceRate: number; // e.g. 94
  presentCount: number;
  absentCount: number;
  learningSubjects: Array<{
    name: string;
    completedPercentage: number;
    completedWeeks: number;
  }>;
  results: Array<{
    term: string; // e.g. "Term 1", "Term 2", "Current"
    gpa: number; // Max 4.0 or percentage
    score?: number;
    mathsScore: number;
    physicsScore: number;
    literatureScore: number;
    compSciScore: number;
  }>;
  classTimings: Array<{
    subject: string;
    time: string;
    day: string;
    mode: "Online" | "Offline";
  }>;
  upcomingEvents: Array<{
    title: string;
    time: string;
    description: string;
    badge: string;
    attachment?: string;
  }>;
  videoResources: Array<{
    title: string;
    duration: string;
    department: string;
    url: string;
  }>;
  parentEmail: string;
  assignedTutorIds: string[];
}

export interface Tutor {
  id: string; // e.g. T-201
  name: string;
  specialty: string;
  email: string;
  image: string;
  assignedStudentIds: string[];
  pendingTasksCount: number;
}

export interface FeePayment {
  id: string; // e.g. FP-501
  studentId: string;
  studentName: string;
  title: string; // e.g. "April Tuition", "Registration Fee"
  amount: number;
  status: "Paid" | "Pending";
  dueDate: string;
  transactionId?: string;
}

export interface ParentProfile {
  id: string;
  email: string;
  name: string;
  phone?: string;
  address?: string;
  occupation?: string;
  childrenIds: string[];
}

export interface DemoBooking {
  location: string;
  studentClass: string;
  whatsappMessage: string;
}

export interface Assignment {
  id: string;
  title: string;
  subject: string;
  dueDate: string;
  submissionsPending: number;
  status: "Active" | "Completed" | "On Hold";
}

export interface Review {
  id: string;
  studentId: string;
  studentName: string;
  rating: number; // 1-5
  comment: string;
  date: string;
}

export interface Message {
  id: string;
  fromStudentId: string;
  fromName: string;
  preview: string;
  time: string; // e.g. "10:30 AM"
  unread: boolean;
}

export interface TestScore {
  id: string;
  studentId: string;
  studentName: string;
  title: string; // e.g. "React JS Test"
  subject: string;
  score: number;
  total: number;
  date: string; // e.g. "May 18, 2026"
}