/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Student, Tutor, FeePayment, Assignment } from "./types";

export const INITIAL_TUTORS: Tutor[] = [
  {
    id: "T-201",
    name: "Dr. Elena Vance",
    specialty: "Mathematics Specialist",
    email: "elena.vance@academyflow.com",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAtyd2CRb90hNdYfBUMT1G-WThzLZAZF92RO58CqttTvKAeDFYdafu_oYAUYJpgv8OnQXgnlrekQojBmHtmXFFLL-np47rR8OMuEOLo_3RzeFzOve2Rtp1F5j7rEYdgOEmhacGcX4mbh2PLF1mMgDvNlqZpjTE4-jMD8v5Fj4DIWQlm_oPECHD8zCJgwMvBAHsaepCZawoKDTNECjxqnVM2A89IZOQY-G-cF96q40-pAvnLsHMj5qQn7QRRzw8uAuS5dMl2LfSYNcI",
    assignedStudentIds: ["ST-101", "ST-102", "ST-103"],
    pendingTasksCount: 14
  },
  {
    id: "T-202",
    name: "Prof. Julian Thorne",
    specialty: "Physics & Chemistry Instructor",
    email: "julian.thorne@academyflow.com",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBAugtMwAAZ-BC_ggIBikD0GJg9BF89SlmEX_a1WBtclVuGPJOQcJoqW0fdlNO3p9_AUbOK50PVG_vDlX7zdd9EW_X5KDdcfS-TGIEVkIuA2e4hLSFajBXMrBBA5oiuC7XHVdorup5giu00g5VtHqOEG28xs-gMWCHnMmGF_pb69-JXYjfi88iOZwL1bN1dmgAd02rFk7PrPi7XIeBoooP9IBH03n6kSvvfweTUl1CdhxU9BoUMqFUfi8BiXV3GK4a7enHsYjp0jF4",
    assignedStudentIds: ["ST-101", "ST-102", "ST-104", "ST-105"],
    pendingTasksCount: 12
  },
  {
    id: "T-203",
    name: "Mr. Anand Kumar",
    specialty: "Computer Science Expert",
    email: "anand.kumar@academyflow.com",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80",
    assignedStudentIds: ["ST-101", "ST-106"],
    pendingTasksCount: 2
  }
];

export const INITIAL_STUDENTS: Student[] = [
  {
    id: "ST-101",
    name: "Alex Johnson",
    grade: "Grade 12",
    section: "STEM",
    attendanceRate: 85,
    presentCount: 124,
    absentCount: 12,
    learningSubjects: [
      { name: "Advanced Mathematics", completedPercentage: 72, completedWeeks: 12 },
      { name: "Quantum Physics", completedPercentage: 45, completedWeeks: 8 },
      { name: "World Literature", completedPercentage: 90, completedWeeks: 15 },
      { name: "Comp Sci Principles", completedPercentage: 60, completedWeeks: 10 }
    ],
    results: [
      { term: "Jan", gpa: 3.2, score: 72, mathsScore: 78, physicsScore: 68, literatureScore: 82, compSciScore: 75 },
      { term: "Feb", gpa: 3.4, score: 78, mathsScore: 81, physicsScore: 74, literatureScore: 88, compSciScore: 80 },
      { term: "Mar", gpa: 3.1, score: 74, mathsScore: 76, physicsScore: 70, literatureScore: 85, compSciScore: 72 },
      { term: "Apr", gpa: 3.8, score: 86, mathsScore: 92, physicsScore: 84, literatureScore: 90, compSciScore: 88 },
      { term: "May", gpa: 3.5, score: 92, mathsScore: 88, physicsScore: 86, literatureScore: 94, compSciScore: 84 },
      { term: "Jun", gpa: 3.9, score: 94, mathsScore: 95, physicsScore: 92, literatureScore: 95, compSciScore: 96 }
    ] as any,
    classTimings: [
      { subject: "Advanced Mathematics", time: "09:00 AM", day: "Monday, Wednesday", mode: "Online" },
      { subject: "Quantum Physics", time: "11:00 AM", day: "Tuesday, Thursday", mode: "Online" },
      { subject: "Comp Sci Principles", time: "02:00 PM", day: "Friday", mode: "Offline" }
    ],
    upcomingEvents: [
      { title: "Calculus Quiz: Derivatives", time: "Tomorrow, 09:00 AM", description: "Chapter 4 - Mid-term preparation on differentiation rules.", badge: "Quiz" },
      { title: "Physics Lab Submission", time: "Wed, 14 Oct", description: "Thermodynamics Lab Report upload.", badge: "Lab Submission", attachment: "SYLLABUS_V2.PDF" },
      { title: "Guest Lecture: AI & Ethics", time: "Fri, 16 Oct", description: "Online Seminar - Zoom invitation link in email.", badge: "Special Session" }
    ],
    videoResources: [
      { title: "Video: Intro to Thermodynamics", duration: "15 mins", department: "Physics Dept", url: "https://www.youtube.com" },
      { title: "Semester 2 Syllabus Outline", duration: "PDF", department: "Academic Admin", url: "#" },
      { title: "Study Group: Exam Prep Forum", duration: "12 Active", department: "Student Life", url: "#" }
    ],
    parentEmail: "parent@example.com",
    assignedTutorIds: ["T-201", "T-202", "T-203"]
  },
  {
    id: "ST-102",
    name: "Leo Henderson",
    grade: "Grade 9",
    section: "Section A",
    attendanceRate: 94,
    presentCount: 145,
    absentCount: 8,
    learningSubjects: [
      { name: "Algebra II", completedPercentage: 68, completedWeeks: 10 },
      { name: "Modern Science", completedPercentage: 80, completedWeeks: 12 },
      { name: "Sanskrit Elective", completedPercentage: 50, completedWeeks: 6 }
    ],
    results: [
      { term: "Term 1", gpa: 2.88, score: 72, mathsScore: 72, physicsScore: 70, literatureScore: 74, compSciScore: 0 },
      { term: "Term 2", gpa: 3.12, score: 78, mathsScore: 78, physicsScore: 76, literatureScore: 80, compSciScore: 0 },
      { term: "Term 3", gpa: 2.96, score: 74, mathsScore: 74, physicsScore: 72, literatureScore: 76, compSciScore: 0 },
      { term: "Term 4", gpa: 3.44, score: 86, mathsScore: 86, physicsScore: 84, literatureScore: 88, compSciScore: 0 },
      { term: "Current", gpa: 3.68, score: 92, mathsScore: 92, physicsScore: 90, literatureScore: 94, compSciScore: 0 }
    ] as any,
    classTimings: [
      { subject: "Algebra II", time: "02:00 PM", day: "Monday, Thursday", mode: "Offline" },
      { subject: "Modern Science", time: "10:00 AM", day: "Wednesday, Friday", mode: "Offline" }
    ],
    upcomingEvents: [
      { title: "Linear Equations Unit Mock", time: "Thursday, 02:00 PM", description: "Solving systems of multi-variable equations with matrix algebra.", badge: "Mock Test" }
    ],
    videoResources: [
      { title: "Algebraic Quadratic Equations Tutorial", duration: "12 mins", department: "Maths Dept", url: "#" },
      { title: "Physical States of Matter Experiment", duration: "20 mins", department: "Science Dept", url: "#" }
    ],
    parentEmail: "parent@example.com",
    assignedTutorIds: ["T-201", "T-202"]
  },
  {
    id: "ST-103",
    name: "Eleanor Lance",
    grade: "Grade 10",
    section: "Section B",
    attendanceRate: 95,
    presentCount: 138,
    absentCount: 7,
    learningSubjects: [
      { name: "Geometry Essentials", completedPercentage: 85, completedWeeks: 14 }
    ],
    results: [
      { term: "Current", gpa: 3.54, score: 88, mathsScore: 88.5, physicsScore: 85, literatureScore: 89, compSciScore: 90 }
    ] as any,
    classTimings: [
      { subject: "Geometry Essentials", time: "04:30 PM", day: "Tuesday, Friday", mode: "Offline" }
    ],
    upcomingEvents: [],
    videoResources: [],
    parentEmail: "eleanor.parent@example.com",
    assignedTutorIds: ["T-201"]
  },
  {
    id: "ST-104",
    name: "Alice Liddell",
    grade: "Grade 9",
    section: "Section C",
    attendanceRate: 91,
    presentCount: 122,
    absentCount: 11,
    learningSubjects: [
      { name: "Classical Physics", completedPercentage: 80, completedWeeks: 13 }
    ],
    results: [
      { term: "Current", gpa: 3.2, score: 80, mathsScore: 80, physicsScore: 82, literatureScore: 78, compSciScore: 80 }
    ] as any,
    classTimings: [],
    upcomingEvents: [],
    videoResources: [],
    parentEmail: "alice.parent@example.com",
    assignedTutorIds: ["T-202"]
  },
  {
    id: "ST-105",
    name: "Emma Watson",
    grade: "Grade 10",
    section: "Section A",
    attendanceRate: 88,
    presentCount: 115,
    absentCount: 15,
    learningSubjects: [
      { name: "English Composition", completedPercentage: 70, completedWeeks: 9 }
    ],
    results: [
      { term: "Current", gpa: 3.1, score: 78, mathsScore: 72, physicsScore: 78, literatureScore: 84, compSciScore: 0 }
    ] as any,
    classTimings: [],
    videoResources: [],
    upcomingEvents: [],
    parentEmail: "watson.family@example.com",
    assignedTutorIds: ["T-202"]
  },
  {
    id: "ST-106",
    name: "Sarah Waters",
    grade: "Grade 8",
    section: "Section A",
    attendanceRate: 100,
    presentCount: 150,
    absentCount: 0,
    learningSubjects: [
      { name: "Intro to Logic", completedPercentage: 100, completedWeeks: 16 }
    ],
    results: [
      { term: "Current", gpa: 3.76, score: 94, mathsScore: 94.2, physicsScore: 0, literatureScore: 94, compSciScore: 94 }
    ] as any,
    classTimings: [],
    videoResources: [],
    upcomingEvents: [],
    parentEmail: "sarah.parent@example.com",
    assignedTutorIds: ["T-203"]
  }
];

export const INITIAL_FEES: FeePayment[] = [
  {
    id: "FP-501",
    studentId: "ST-102",
    studentName: "Leo Henderson",
    title: "April Tuition",
    amount: 1200,
    status: "Paid",
    dueDate: "2026-04-30",
    transactionId: "AF-95420"
  },
  {
    id: "FP-502",
    studentId: "ST-102",
    studentName: "Leo Henderson",
    title: "Registration Fee",
    amount: 250,
    status: "Pending",
    dueDate: "2026-06-15"
  },
  {
    id: "FP-503",
    studentId: "ST-101",
    studentName: "Alex Johnson",
    title: "May Tuition",
    amount: 1500,
    status: "Paid",
    dueDate: "2026-05-31",
    transactionId: "AF-77215"
  },
  {
    id: "FP-504",
    studentId: "ST-103",
    studentName: "Eleanor Lance",
    title: "May Tuition",
    amount: 900,
    status: "Paid",
    dueDate: "2026-05-31",
    transactionId: "AF-11102"
  },
  {
    id: "FP-505",
    studentId: "ST-104",
    studentName: "Juliet Smith",
    title: "June Advanced Prep",
    amount: 1100,
    status: "Pending",
    dueDate: "2026-06-10"
  },
  {
    id: "FP-506",
    studentId: "ST-105",
    studentName: "Marcus Kane",
    title: "April Tuition",
    amount: 800,
    status: "Pending",
    dueDate: "2026-04-30"
  }
];

export const INITIAL_ASSIGNMENTS: Assignment[] = [
  {
    id: "A-901",
    title: "Macroeconomics Essay on Inflation",
    subject: "Business Terminology",
    dueDate: "2026-06-05",
    submissionsPending: 12,
    status: "Active"
  },
  {
    id: "A-902",
    title: "Discrete Mathematics Homework IV",
    subject: "Algebraic Systems",
    dueDate: "2026-05-28",
    submissionsPending: 0,
    status: "Completed"
  },
  {
    id: "A-903",
    title: "Quantum Probability Wave Functions",
    subject: "Applied Electromagnetics",
    dueDate: "2026-06-12",
    submissionsPending: 18,
    status: "On Hold"
  }
];

export const STANDARDS = [
  "1st Class", "2nd Class", "3rd Class", "4th Class", "5th Class",
  "6th Class", "7th Class", "8th Class", "9th Class", "10th Class"
];

export const LOCATIONS = ["Hyderabad", "Warangal", "Karimnagar"];

export const CLASS_TYPES = ["Online", "Offline"];

export const LANGUAGES = ["English", "Telugu", "Hindi"];

export const SUBJECTS_BY_CLASS: { [key: string]: string[] } = {
  "1st Class": ["English Literature", "Basic Mathematics", "Environmental Studies"],
  "2nd Class": ["English Literature", "Primary Mathematics", "Environmental Studies"],
  "3rd Class": ["English Literature", "Arithmetic Logic", "Science Basics", "Hindi Grammar"],
  "4th Class": ["English Grammar", "Fractions & Decimals", "Primary Physics", "Telugu Stories"],
  "5th Class": ["English Writing", "Elementary Geometry", "Creative Sciences", "Social Studies"],
  "6th Class": ["General English", "Algebra Fundamentals", "Earth Sciences", "Language Studies"],
  "7th Class": ["Analytical English", "Practical Geometry", "Biology Basics", "Civics & History"],
  "8th Class": ["Composition Writing", "Algebraic Systems", "Physical Chemistry", "Logic & Reason"],
  "9th Class": ["Calculus Prep", "Organic Chemistry", "Classical Mechanics", "Sanskrit Elective"],
  "10th Class": ["Advanced Calculus", "Nuclear Physics", "Molecular Biology", "Civics & Economics"]
};
