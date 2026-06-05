/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Student, Tutor, FeePayment, Assignment, Review, Message, TestScore } from "./types";

// ── 7 Indian Tutors ──────────────────────────────────────────
export const INITIAL_TUTORS: Tutor[] = [
  {
    id: "T-201",
    name: "Dr. Anitha Sharma",
    specialty: "Mathematics Specialist",
    email: "anitha.sharma@academyflow.com",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAtyd2CRb90hNdYfBUMT1G-WThzLZAZF92RO58CqttTvKAeDFYdafu_oYAUYJpgv8OnQXgnlrekQojBmHtmXFFLL-np47rR8OMuEOLo_3RzeFzOve2Rtp1F5j7rEYdgOEmhacGcX4mbh2PLF1mMgDvNlqZpjTE4-jMD8v5Fj4DIWQlm_oPECHD8zCJgwMvBAHsaepCZawoKDTNECjxqnVM2A89IZOQY-G-cF96q40-pAvnLsHMj5qQn7QRRzw8uAuS5dMl2LfSYNcI",
    assignedStudentIds: ["ST-101", "ST-102", "ST-103", "ST-104", "ST-105"],
    pendingTasksCount: 8
  },
  {
    id: "T-202",
    name: "Prof. Narayana Rao",
    specialty: "Physics & Chemistry Instructor",
    email: "narayana.rao@academyflow.com",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBAugtMwAAZ-BC_ggIBikD0GJg9BF89SlmEX_a1WBtclVuGPJOQcJoqW0fdlNO3p9_AUbOK50PVG_vDlX7zdd9EW_X5KDdcfS-TGIEVkIuA2e4hLSFajBXMrBBA5oiuC7XHVdorup5giu00g5VtHqOEG28xs-gMWCHnMmGF_pb69-JXYjfi88iOZwL1bN1dmgAd02rFk7PrPi7XIeBoooP9IBH03n6kSvvfweTUl1CdhxU9BoUMqFUfi8BiXV3GK4a7enHsYjp0jF4",
    assignedStudentIds: ["ST-101", "ST-106", "ST-107", "ST-108"],
    pendingTasksCount: 5
  },
  {
    id: "T-203",
    name: "Mr. Anand Krishna",
    specialty: "Computer Science Expert",
    email: "anand.krishna@academyflow.com",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80",
    assignedStudentIds: ["ST-102", "ST-109", "ST-110"],
    pendingTasksCount: 3
  },
  {
    id: "T-204",
    name: "Mrs. Lakshmi Devi",
    specialty: "English & Communication Skills",
    email: "lakshmi.devi@academyflow.com",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80",
    assignedStudentIds: ["ST-103", "ST-104", "ST-111"],
    pendingTasksCount: 6
  },
  {
    id: "T-205",
    name: "Mr. Venkat Reddy",
    specialty: "Social Studies & Telugu",
    email: "venkat.reddy@academyflow.com",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80",
    assignedStudentIds: ["ST-105", "ST-106", "ST-112"],
    pendingTasksCount: 4
  },
  {
    id: "T-206",
    name: "Ms. Sunita Pandey",
    specialty: "Biology & Life Sciences",
    email: "sunita.pandey@academyflow.com",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=400&q=80",
    assignedStudentIds: ["ST-107", "ST-108", "ST-109"],
    pendingTasksCount: 7
  },
  {
    id: "T-207",
    name: "Mr. Ramesh Gupta",
    specialty: "SSC & Competitive Exam Coach",
    email: "ramesh.gupta@academyflow.com",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&q=80",
    assignedStudentIds: ["ST-110", "ST-111", "ST-112"],
    pendingTasksCount: 9
  },
];

// ── 12 Indian Students ───────────────────────────────────────
export const INITIAL_STUDENTS: Student[] = [
  {
    id: "ST-101",
    name: "Arjun Sharma",
    grade: "10th Class",
    section: "Section A",
    attendanceRate: 92, presentCount: 138, absentCount: 12,
    learningSubjects: [
      { name: "Mathematics", completedPercentage: 78, completedWeeks: 13 },
      { name: "Physics", completedPercentage: 65, completedWeeks: 10 },
      { name: "Chemistry", completedPercentage: 55, completedWeeks: 9 },
    ],
    results: [
      { term: "Jan", gpa: 3.2, score: 74, mathsScore: 80, physicsScore: 70, literatureScore: 75, compSciScore: 72 },
      { term: "Feb", gpa: 3.5, score: 80, mathsScore: 85, physicsScore: 76, literatureScore: 82, compSciScore: 78 },
      { term: "Mar", gpa: 3.4, score: 78, mathsScore: 82, physicsScore: 74, literatureScore: 80, compSciScore: 76 },
      { term: "Apr", gpa: 3.8, score: 88, mathsScore: 92, physicsScore: 85, literatureScore: 88, compSciScore: 84 },
      { term: "May", gpa: 3.7, score: 86, mathsScore: 90, physicsScore: 83, literatureScore: 86, compSciScore: 82 },
      { term: "Jun", gpa: 4.0, score: 94, mathsScore: 96, physicsScore: 92, literatureScore: 94, compSciScore: 90 },
    ] as any,
    classTimings: [
      { subject: "Mathematics", time: "09:00 AM", day: "Monday, Wednesday", mode: "Offline" },
      { subject: "Physics", time: "11:00 AM", day: "Monday", mode: "Offline" },
      { subject: "Chemistry", time: "02:00 PM", day: "Wednesday", mode: "Offline" },
    ],
    upcomingEvents: [
      { title: "Mathematics Unit Test", time: "Tomorrow, 09:00 AM", description: "Chapter 5 — Quadratic Equations & Polynomials", badge: "Unit Test" },
      { title: "Physics Lab Submission", time: "Wed, 10 Jun", description: "Motion & Forces Lab Report upload due.", badge: "Lab Submission" },
    ],
    videoResources: [
      { title: "Quadratic Equations Explained", duration: "18 mins", department: "Maths Dept", url: "https://www.youtube.com" },
      { title: "Physics — Laws of Motion", duration: "22 mins", department: "Physics Dept", url: "https://www.youtube.com" },
    ],
    parentEmail: "priya.sharma@gmail.com",
    assignedTutorIds: ["T-201", "T-202"],
  },
  {
    id: "ST-102",
    name: "Kavya Reddy",
    grade: "10th Class",
    section: "Section A",
    attendanceRate: 96, presentCount: 144, absentCount: 6,
    learningSubjects: [
      { name: "Mathematics", completedPercentage: 85, completedWeeks: 14 },
      { name: "Computer Science", completedPercentage: 72, completedWeeks: 12 },
      { name: "English", completedPercentage: 90, completedWeeks: 15 },
    ],
    results: [
      { term: "Jan", gpa: 3.6, score: 82, mathsScore: 88, physicsScore: 0, literatureScore: 84, compSciScore: 80 },
      { term: "Feb", gpa: 3.8, score: 86, mathsScore: 90, physicsScore: 0, literatureScore: 88, compSciScore: 84 },
      { term: "Mar", gpa: 3.7, score: 84, mathsScore: 88, physicsScore: 0, literatureScore: 86, compSciScore: 82 },
      { term: "Apr", gpa: 4.0, score: 92, mathsScore: 95, physicsScore: 0, literatureScore: 92, compSciScore: 90 },
      { term: "May", gpa: 3.9, score: 90, mathsScore: 93, physicsScore: 0, literatureScore: 90, compSciScore: 88 },
      { term: "Jun", gpa: 4.0, score: 96, mathsScore: 97, physicsScore: 0, literatureScore: 96, compSciScore: 94 },
    ] as any,
    classTimings: [
      { subject: "Mathematics", time: "09:00 AM", day: "Monday, Wednesday", mode: "Offline" },
      { subject: "Computer Science", time: "02:00 PM", day: "Tuesday", mode: "Offline" },
      { subject: "English", time: "11:00 AM", day: "Thursday", mode: "Online" },
    ],
    upcomingEvents: [
      { title: "Computer Science Project Demo", time: "Friday, 02:00 PM", description: "Final project demonstration — Web app development.", badge: "Project" },
    ],
    videoResources: [
      { title: "Python Basics — Functions & Loops", duration: "20 mins", department: "CS Dept", url: "https://www.youtube.com" },
    ],
    parentEmail: "suresh.reddy@gmail.com",
    assignedTutorIds: ["T-201", "T-203"],
  },
  {
    id: "ST-103",
    name: "Rohith Kumar",
    grade: "9th Class",
    section: "Section B",
    attendanceRate: 88, presentCount: 132, absentCount: 18,
    learningSubjects: [
      { name: "Mathematics", completedPercentage: 60, completedWeeks: 10 },
      { name: "English", completedPercentage: 75, completedWeeks: 12 },
      { name: "Social Studies", completedPercentage: 80, completedWeeks: 13 },
    ],
    results: [
      { term: "Jan", gpa: 2.8, score: 68, mathsScore: 65, physicsScore: 0, literatureScore: 72, compSciScore: 0 },
      { term: "Feb", gpa: 3.0, score: 74, mathsScore: 70, physicsScore: 0, literatureScore: 78, compSciScore: 0 },
      { term: "Mar", gpa: 2.9, score: 70, mathsScore: 68, physicsScore: 0, literatureScore: 74, compSciScore: 0 },
      { term: "Apr", gpa: 3.3, score: 80, mathsScore: 78, physicsScore: 0, literatureScore: 84, compSciScore: 0 },
      { term: "May", gpa: 3.4, score: 82, mathsScore: 80, physicsScore: 0, literatureScore: 86, compSciScore: 0 },
      { term: "Jun", gpa: 3.5, score: 84, mathsScore: 82, physicsScore: 0, literatureScore: 88, compSciScore: 0 },
    ] as any,
    classTimings: [
      { subject: "Mathematics", time: "11:00 AM", day: "Tuesday", mode: "Online" },
      { subject: "English", time: "02:00 PM", day: "Monday", mode: "Online" },
    ],
    upcomingEvents: [
      { title: "English Grammar Test", time: "Monday, 02:00 PM", description: "Tenses, Articles and Prepositions.", badge: "Test" },
    ],
    videoResources: [],
    parentEmail: "meena.kumar@gmail.com",
    assignedTutorIds: ["T-201", "T-204"],
  },
  {
    id: "ST-104",
    name: "Divya Nair",
    grade: "9th Class",
    section: "Section A",
    attendanceRate: 94, presentCount: 141, absentCount: 9,
    learningSubjects: [
      { name: "Mathematics", completedPercentage: 82, completedWeeks: 13 },
      { name: "English", completedPercentage: 88, completedWeeks: 14 },
      { name: "Biology", completedPercentage: 70, completedWeeks: 11 },
    ],
    results: [
      { term: "Jan", gpa: 3.4, score: 78, mathsScore: 82, physicsScore: 0, literatureScore: 80, compSciScore: 0 },
      { term: "Feb", gpa: 3.6, score: 82, mathsScore: 86, physicsScore: 0, literatureScore: 84, compSciScore: 0 },
      { term: "Mar", gpa: 3.5, score: 80, mathsScore: 84, physicsScore: 0, literatureScore: 82, compSciScore: 0 },
      { term: "Apr", gpa: 3.8, score: 88, mathsScore: 90, physicsScore: 0, literatureScore: 90, compSciScore: 0 },
      { term: "May", gpa: 3.9, score: 90, mathsScore: 92, physicsScore: 0, literatureScore: 92, compSciScore: 0 },
      { term: "Jun", gpa: 4.0, score: 95, mathsScore: 96, physicsScore: 0, literatureScore: 95, compSciScore: 0 },
    ] as any,
    classTimings: [
      { subject: "Mathematics", time: "11:00 AM", day: "Tuesday", mode: "Online" },
      { subject: "English", time: "02:00 PM", day: "Monday", mode: "Online" },
    ],
    upcomingEvents: [],
    videoResources: [],
    parentEmail: "krishna.nair@gmail.com",
    assignedTutorIds: ["T-201", "T-204"],
  },
  {
    id: "ST-105",
    name: "Sai Krishna",
    grade: "10th Class",
    section: "Section B",
    attendanceRate: 85, presentCount: 127, absentCount: 23,
    learningSubjects: [
      { name: "Mathematics", completedPercentage: 68, completedWeeks: 11 },
      { name: "Telugu / Hindi", completedPercentage: 76, completedWeeks: 12 },
      { name: "Social Studies", completedPercentage: 72, completedWeeks: 12 },
    ],
    results: [
      { term: "Jan", gpa: 2.6, score: 64, mathsScore: 60, physicsScore: 0, literatureScore: 68, compSciScore: 0 },
      { term: "Feb", gpa: 2.8, score: 68, mathsScore: 65, physicsScore: 0, literatureScore: 72, compSciScore: 0 },
      { term: "Mar", gpa: 2.7, score: 66, mathsScore: 62, physicsScore: 0, literatureScore: 70, compSciScore: 0 },
      { term: "Apr", gpa: 3.0, score: 74, mathsScore: 72, physicsScore: 0, literatureScore: 78, compSciScore: 0 },
      { term: "May", gpa: 3.1, score: 76, mathsScore: 74, physicsScore: 0, literatureScore: 80, compSciScore: 0 },
      { term: "Jun", gpa: 3.3, score: 80, mathsScore: 78, physicsScore: 0, literatureScore: 84, compSciScore: 0 },
    ] as any,
    classTimings: [
      { subject: "Mathematics", time: "09:00 AM", day: "Wednesday", mode: "Offline" },
      { subject: "Telugu / Hindi", time: "10:00 AM", day: "Tuesday", mode: "Offline" },
    ],
    upcomingEvents: [
      { title: "Telugu Mid-Term", time: "Tuesday, 10:00 AM", description: "Chapters 1-5 revision for mid-term exam.", badge: "Mid-Term" },
    ],
    videoResources: [],
    parentEmail: "padma.krishna@gmail.com",
    assignedTutorIds: ["T-201", "T-205"],
  },
  {
    id: "ST-106",
    name: "Sneha Patel",
    grade: "9th Class",
    section: "Section C",
    attendanceRate: 91, presentCount: 136, absentCount: 14,
    learningSubjects: [
      { name: "Physics", completedPercentage: 74, completedWeeks: 12 },
      { name: "Chemistry", completedPercentage: 68, completedWeeks: 11 },
      { name: "Social Studies", completedPercentage: 82, completedWeeks: 13 },
    ],
    results: [
      { term: "Jan", gpa: 3.1, score: 74, mathsScore: 0, physicsScore: 76, literatureScore: 72, compSciScore: 0 },
      { term: "Feb", gpa: 3.3, score: 78, mathsScore: 0, physicsScore: 80, literatureScore: 76, compSciScore: 0 },
      { term: "Mar", gpa: 3.2, score: 76, mathsScore: 0, physicsScore: 78, literatureScore: 74, compSciScore: 0 },
      { term: "Apr", gpa: 3.6, score: 84, mathsScore: 0, physicsScore: 86, literatureScore: 82, compSciScore: 0 },
      { term: "May", gpa: 3.7, score: 86, mathsScore: 0, physicsScore: 88, literatureScore: 84, compSciScore: 0 },
      { term: "Jun", gpa: 3.9, score: 90, mathsScore: 0, physicsScore: 92, literatureScore: 88, compSciScore: 0 },
    ] as any,
    classTimings: [
      { subject: "Physics", time: "11:00 AM", day: "Monday", mode: "Offline" },
      { subject: "Chemistry", time: "02:00 PM", day: "Wednesday", mode: "Offline" },
    ],
    upcomingEvents: [],
    videoResources: [],
    parentEmail: "ravi.patel@gmail.com",
    assignedTutorIds: ["T-202", "T-205"],
  },
  {
    id: "ST-107",
    name: "Vikram Singh",
    grade: "8th Class",
    section: "Section A",
    attendanceRate: 89, presentCount: 133, absentCount: 17,
    learningSubjects: [
      { name: "Physics", completedPercentage: 62, completedWeeks: 10 },
      { name: "Biology", completedPercentage: 55, completedWeeks: 9 },
      { name: "General Science", completedPercentage: 78, completedWeeks: 13 },
    ],
    results: [
      { term: "Jan", gpa: 2.9, score: 70, mathsScore: 0, physicsScore: 72, literatureScore: 68, compSciScore: 0 },
      { term: "Feb", gpa: 3.1, score: 74, mathsScore: 0, physicsScore: 76, literatureScore: 72, compSciScore: 0 },
      { term: "Mar", gpa: 3.0, score: 72, mathsScore: 0, physicsScore: 74, literatureScore: 70, compSciScore: 0 },
      { term: "Apr", gpa: 3.4, score: 80, mathsScore: 0, physicsScore: 82, literatureScore: 78, compSciScore: 0 },
      { term: "May", gpa: 3.5, score: 82, mathsScore: 0, physicsScore: 84, literatureScore: 80, compSciScore: 0 },
      { term: "Jun", gpa: 3.6, score: 84, mathsScore: 0, physicsScore: 86, literatureScore: 82, compSciScore: 0 },
    ] as any,
    classTimings: [
      { subject: "General Science", time: "10:00 AM", day: "Friday", mode: "Online" },
      { subject: "Biology", time: "11:00 AM", day: "Wednesday", mode: "Offline" },
    ],
    upcomingEvents: [],
    videoResources: [],
    parentEmail: "ananya.singh@gmail.com",
    assignedTutorIds: ["T-202", "T-206"],
  },
  {
    id: "ST-108",
    name: "Preethi Menon",
    grade: "8th Class",
    section: "Section B",
    attendanceRate: 97, presentCount: 145, absentCount: 5,
    learningSubjects: [
      { name: "Physics", completedPercentage: 88, completedWeeks: 14 },
      { name: "Chemistry", completedPercentage: 82, completedWeeks: 13 },
      { name: "Biology", completedPercentage: 90, completedWeeks: 15 },
    ],
    results: [
      { term: "Jan", gpa: 3.7, score: 84, mathsScore: 0, physicsScore: 86, literatureScore: 82, compSciScore: 0 },
      { term: "Feb", gpa: 3.9, score: 88, mathsScore: 0, physicsScore: 90, literatureScore: 86, compSciScore: 0 },
      { term: "Mar", gpa: 3.8, score: 86, mathsScore: 0, physicsScore: 88, literatureScore: 84, compSciScore: 0 },
      { term: "Apr", gpa: 4.0, score: 93, mathsScore: 0, physicsScore: 94, literatureScore: 92, compSciScore: 0 },
      { term: "May", gpa: 4.0, score: 95, mathsScore: 0, physicsScore: 96, literatureScore: 94, compSciScore: 0 },
      { term: "Jun", gpa: 4.0, score: 97, mathsScore: 0, physicsScore: 98, literatureScore: 96, compSciScore: 0 },
    ] as any,
    classTimings: [
      { subject: "Biology", time: "11:00 AM", day: "Wednesday", mode: "Offline" },
      { subject: "Physics", time: "11:00 AM", day: "Monday", mode: "Offline" },
    ],
    upcomingEvents: [
      { title: "Biology Science Fair", time: "Saturday, 10:00 AM", description: "Annual Science Fair — Project on Photosynthesis.", badge: "Science Fair" },
    ],
    videoResources: [
      { title: "Biology — Cell Structure", duration: "15 mins", department: "Biology Dept", url: "https://www.youtube.com" },
    ],
    parentEmail: "rajesh.menon@gmail.com",
    assignedTutorIds: ["T-202", "T-206"],
  },
  {
    id: "ST-109",
    name: "Aakash Verma",
    grade: "10th Class",
    section: "Section C",
    attendanceRate: 93, presentCount: 139, absentCount: 11,
    learningSubjects: [
      { name: "Computer Science", completedPercentage: 80, completedWeeks: 13 },
      { name: "Mathematics", completedPercentage: 70, completedWeeks: 11 },
      { name: "Biology", completedPercentage: 65, completedWeeks: 10 },
    ],
    results: [
      { term: "Jan", gpa: 3.3, score: 76, mathsScore: 78, physicsScore: 0, literatureScore: 74, compSciScore: 80 },
      { term: "Feb", gpa: 3.5, score: 80, mathsScore: 82, physicsScore: 0, literatureScore: 78, compSciScore: 84 },
      { term: "Mar", gpa: 3.4, score: 78, mathsScore: 80, physicsScore: 0, literatureScore: 76, compSciScore: 82 },
      { term: "Apr", gpa: 3.7, score: 86, mathsScore: 88, physicsScore: 0, literatureScore: 84, compSciScore: 90 },
      { term: "May", gpa: 3.8, score: 88, mathsScore: 90, physicsScore: 0, literatureScore: 86, compSciScore: 92 },
      { term: "Jun", gpa: 3.9, score: 92, mathsScore: 94, physicsScore: 0, literatureScore: 90, compSciScore: 96 },
    ] as any,
    classTimings: [
      { subject: "Computer Science", time: "02:00 PM", day: "Tuesday", mode: "Offline" },
      { subject: "Biology", time: "02:00 PM", day: "Friday", mode: "Offline" },
    ],
    upcomingEvents: [],
    videoResources: [],
    parentEmail: "geeta.verma@gmail.com",
    assignedTutorIds: ["T-203", "T-206"],
  },
  {
    id: "ST-110",
    name: "Meghana Rao",
    grade: "9th Class",
    section: "Section A",
    attendanceRate: 98, presentCount: 147, absentCount: 3,
    learningSubjects: [
      { name: "Computer Science", completedPercentage: 95, completedWeeks: 16 },
      { name: "Aptitude / Logical Reasoning", completedPercentage: 88, completedWeeks: 14 },
      { name: "SSC Exam Preparation", completedPercentage: 82, completedWeeks: 13 },
    ],
    results: [
      { term: "Jan", gpa: 3.8, score: 87, mathsScore: 90, physicsScore: 0, literatureScore: 84, compSciScore: 94 },
      { term: "Feb", gpa: 4.0, score: 91, mathsScore: 93, physicsScore: 0, literatureScore: 88, compSciScore: 96 },
      { term: "Mar", gpa: 3.9, score: 89, mathsScore: 92, physicsScore: 0, literatureScore: 86, compSciScore: 95 },
      { term: "Apr", gpa: 4.0, score: 94, mathsScore: 96, physicsScore: 0, literatureScore: 92, compSciScore: 98 },
      { term: "May", gpa: 4.0, score: 96, mathsScore: 97, physicsScore: 0, literatureScore: 94, compSciScore: 99 },
      { term: "Jun", gpa: 4.0, score: 98, mathsScore: 99, physicsScore: 0, literatureScore: 96, compSciScore: 100 },
    ] as any,
    classTimings: [
      { subject: "Computer Science", time: "02:00 PM", day: "Thursday", mode: "Offline" },
      { subject: "SSC Exam Preparation", time: "09:00 AM", day: "Saturday", mode: "Offline" },
    ],
    upcomingEvents: [
      { title: "Olympiad Mock Test", time: "Saturday, 11:30 AM", description: "National Mathematics Olympiad preparation test.", badge: "Olympiad" },
    ],
    videoResources: [
      { title: "Logical Reasoning — Series & Patterns", duration: "25 mins", department: "Aptitude Dept", url: "https://www.youtube.com" },
    ],
    parentEmail: "srinivas.rao@gmail.com",
    assignedTutorIds: ["T-203", "T-207"],
  },
  {
    id: "ST-111",
    name: "Harshitha Iyer",
    grade: "10th Class",
    section: "Section B",
    attendanceRate: 90, presentCount: 135, absentCount: 15,
    learningSubjects: [
      { name: "English", completedPercentage: 85, completedWeeks: 14 },
      { name: "SSC Exam Preparation", completedPercentage: 78, completedWeeks: 12 },
      { name: "Olympiad Preparation", completedPercentage: 72, completedWeeks: 11 },
    ],
    results: [
      { term: "Jan", gpa: 3.2, score: 76, mathsScore: 72, physicsScore: 0, literatureScore: 80, compSciScore: 0 },
      { term: "Feb", gpa: 3.4, score: 80, mathsScore: 76, physicsScore: 0, literatureScore: 84, compSciScore: 0 },
      { term: "Mar", gpa: 3.3, score: 78, mathsScore: 74, physicsScore: 0, literatureScore: 82, compSciScore: 0 },
      { term: "Apr", gpa: 3.6, score: 84, mathsScore: 80, physicsScore: 0, literatureScore: 88, compSciScore: 0 },
      { term: "May", gpa: 3.7, score: 86, mathsScore: 82, physicsScore: 0, literatureScore: 90, compSciScore: 0 },
      { term: "Jun", gpa: 3.8, score: 90, mathsScore: 86, physicsScore: 0, literatureScore: 94, compSciScore: 0 },
    ] as any,
    classTimings: [
      { subject: "English", time: "10:00 AM", day: "Thursday", mode: "Offline" },
      { subject: "SSC Exam Preparation", time: "09:00 AM", day: "Saturday", mode: "Offline" },
    ],
    upcomingEvents: [
      { title: "SSC Board Mock Exam", time: "Saturday, 09:00 AM", description: "Full-length SSC Board pattern mock examination.", badge: "Mock Exam" },
    ],
    videoResources: [],
    parentEmail: "subramaniam.iyer@gmail.com",
    assignedTutorIds: ["T-204", "T-207"],
  },
  {
    id: "ST-112",
    name: "Rahul Das",
    grade: "8th Class",
    section: "Section C",
    attendanceRate: 87, presentCount: 130, absentCount: 20,
    learningSubjects: [
      { name: "Telugu / Hindi", completedPercentage: 65, completedWeeks: 10 },
      { name: "Competitive Exam Foundation", completedPercentage: 58, completedWeeks: 9 },
      { name: "General Knowledge (GK)", completedPercentage: 72, completedWeeks: 12 },
    ],
    results: [
      { term: "Jan", gpa: 2.7, score: 66, mathsScore: 0, physicsScore: 0, literatureScore: 68, compSciScore: 64 },
      { term: "Feb", gpa: 2.9, score: 70, mathsScore: 0, physicsScore: 0, literatureScore: 72, compSciScore: 68 },
      { term: "Mar", gpa: 2.8, score: 68, mathsScore: 0, physicsScore: 0, literatureScore: 70, compSciScore: 66 },
      { term: "Apr", gpa: 3.1, score: 74, mathsScore: 0, physicsScore: 0, literatureScore: 76, compSciScore: 72 },
      { term: "May", gpa: 3.2, score: 76, mathsScore: 0, physicsScore: 0, literatureScore: 78, compSciScore: 74 },
      { term: "Jun", gpa: 3.3, score: 78, mathsScore: 0, physicsScore: 0, literatureScore: 80, compSciScore: 76 },
    ] as any,
    classTimings: [
      { subject: "Telugu / Hindi", time: "10:00 AM", day: "Tuesday", mode: "Offline" },
      { subject: "Competitive Exam Foundation", time: "09:00 AM", day: "Saturday", mode: "Online" },
    ],
    upcomingEvents: [],
    videoResources: [],
    parentEmail: "monika.das@gmail.com",
    assignedTutorIds: ["T-205", "T-207"],
  },
];

export const INITIAL_FEES: FeePayment[] = [
  { id: "FP-501", studentId: "ST-101", studentName: "Arjun Sharma", title: "June Tuition Fee", amount: 1500, status: "Paid", dueDate: "2026-06-30", transactionId: "AF-95401" },
  { id: "FP-502", studentId: "ST-102", studentName: "Kavya Reddy", title: "June Tuition Fee", amount: 1500, status: "Paid", dueDate: "2026-06-30", transactionId: "AF-95402" },
  { id: "FP-503", studentId: "ST-103", studentName: "Rohith Kumar", title: "June Tuition Fee", amount: 1200, status: "Pending", dueDate: "2026-06-15" },
  { id: "FP-504", studentId: "ST-104", studentName: "Divya Nair", title: "June Tuition Fee", amount: 1200, status: "Paid", dueDate: "2026-06-10", transactionId: "AF-95404" },
  { id: "FP-505", studentId: "ST-105", studentName: "Sai Krishna", title: "May Tuition Fee", amount: 1500, status: "Pending", dueDate: "2026-05-31" },
  { id: "FP-506", studentId: "ST-106", studentName: "Sneha Patel", title: "June Tuition Fee", amount: 1200, status: "Paid", dueDate: "2026-06-20", transactionId: "AF-95406" },
  { id: "FP-507", studentId: "ST-107", studentName: "Vikram Singh", title: "June Tuition Fee", amount: 1000, status: "Pending", dueDate: "2026-06-25" },
  { id: "FP-508", studentId: "ST-108", studentName: "Preethi Menon", title: "June Tuition Fee", amount: 1000, status: "Paid", dueDate: "2026-06-05", transactionId: "AF-95408" },
  { id: "FP-509", studentId: "ST-109", studentName: "Aakash Verma", title: "June Tuition Fee", amount: 1500, status: "Pending", dueDate: "2026-06-28" },
  { id: "FP-510", studentId: "ST-110", studentName: "Meghana Rao", title: "Registration + June Fee", amount: 1800, status: "Paid", dueDate: "2026-06-01", transactionId: "AF-95410" },
  { id: "FP-511", studentId: "ST-111", studentName: "Harshitha Iyer", title: "June Tuition Fee", amount: 1500, status: "Pending", dueDate: "2026-06-30" },
  { id: "FP-512", studentId: "ST-112", studentName: "Rahul Das", title: "May Tuition Fee", amount: 1000, status: "Pending", dueDate: "2026-05-31" },
];

export const INITIAL_ASSIGNMENTS: Assignment[] = [
  { id: "A-901", title: "Quadratic Equations Practice Set", subject: "Mathematics", dueDate: "2026-06-08", submissionsPending: 6, status: "Active" },
  { id: "A-902", title: "Laws of Motion — Chapter Summary", subject: "Physics", dueDate: "2026-06-05", submissionsPending: 0, status: "Completed" },
  { id: "A-903", title: "Python Programming — Mini Project", subject: "Computer Science", dueDate: "2026-06-12", submissionsPending: 4, status: "Active" },
  { id: "A-904", title: "Essay Writing — Indian Independence", subject: "English", dueDate: "2026-06-10", submissionsPending: 8, status: "Active" },
  { id: "A-905", title: "SSC Mock Paper — Set 3", subject: "SSC Exam Preparation", dueDate: "2026-06-14", submissionsPending: 3, status: "On Hold" },
];

export const STANDARDS = [
  "1st Class", "2nd Class", "3rd Class", "4th Class", "5th Class",
  "6th Class", "7th Class", "8th Class", "9th Class", "10th Class",
  "Special Courses"
];

export const LOCATIONS = ["Hyderabad", "Warangal", "Karimnagar"];
export const CLASS_TYPES = ["Online", "Offline"];
export const LANGUAGES = ["English", "Telugu", "Hindi"];

export const SUBJECTS_BY_CLASS: { [key: string]: string[] } = {
  "1st Class": ["English","Mathematics","Telugu / Hindi (Second Language)","Environmental Science (EVS)","General Knowledge (GK)","Computer Basics","Handwriting Practice","Spoken English","Reading & Writing Skills"],
  "2nd Class": ["English","Mathematics","Telugu / Hindi (Second Language)","Environmental Science (EVS)","General Knowledge (GK)","Computer Basics","Handwriting Practice","Spoken English","Reading & Writing Skills"],
  "3rd Class": ["English","Mathematics","Telugu / Hindi (Second Language)","Environmental Science (EVS)","General Knowledge (GK)","Computer Basics","Handwriting Practice","Spoken English","Reading & Writing Skills"],
  "4th Class": ["English","Mathematics","Telugu / Hindi (Second Language)","Environmental Science (EVS)","General Knowledge (GK)","Computer Basics","Handwriting Practice","Spoken English","Reading & Writing Skills"],
  "5th Class": ["English","Mathematics","Telugu / Hindi (Second Language)","Environmental Science (EVS)","General Knowledge (GK)","Computer Basics","Handwriting Practice","Spoken English","Reading & Writing Skills"],
  "6th Class": ["Mathematics","Science","English","Telugu / Hindi","Social Studies","Computer Science","General Knowledge (GK)","Grammar & Communication Skills","Spoken English","Aptitude / Logical Reasoning"],
  "7th Class": ["Mathematics","Science","English","Telugu / Hindi","Social Studies","Computer Science","General Knowledge (GK)","Grammar & Communication Skills","Spoken English","Aptitude / Logical Reasoning"],
  "8th Class": ["Mathematics","Science","English","Telugu / Hindi","Social Studies","Computer Science","General Knowledge (GK)","Grammar & Communication Skills","Spoken English","Aptitude / Logical Reasoning"],
  "9th Class": ["Mathematics","Physics","Chemistry","Biology","General Science","English","Telugu / Hindi","Social Studies","Computer Science","Grammar & Writing Skills","Spoken English","SSC Exam Preparation","Olympiad Preparation","Competitive Exam Foundation"],
  "10th Class": ["Mathematics","Physics","Chemistry","Biology","General Science","English","Telugu / Hindi","Social Studies","Computer Science","Grammar & Writing Skills","Spoken English","SSC Exam Preparation","Olympiad Preparation","Competitive Exam Foundation"],
  "Special Courses": ["Personality Development","Homework Assistance","Doubt Clarification Sessions","Weekly Tests & Assessments","Summer Coaching Programs","Board Exam Preparation","Fast Revision Batches","Study Skills & Time Management"],
};

export const INITIAL_REVIEWS: Review[] = [
  { id: "RV-701", studentId: "ST-101", studentName: "Arjun Sharma", rating: 5, comment: "Dr. Anitha explains Maths concepts beautifully. My grades improved a lot!", date: "2026-05-28" },
  { id: "RV-702", studentId: "ST-102", studentName: "Kavya Reddy", rating: 5, comment: "Mr. Anand's Computer Science classes are practical and fun. Highly recommend!", date: "2026-05-26" },
  { id: "RV-703", studentId: "ST-108", studentName: "Preethi Menon", rating: 5, comment: "Ms. Sunita is very patient. My Biology understanding improved greatly.", date: "2026-05-24" },
  { id: "RV-704", studentId: "ST-110", studentName: "Meghana Rao", rating: 5, comment: "Mr. Ramesh's SSC coaching is top-notch. Best competitive exam preparation!", date: "2026-05-22" },
  { id: "RV-705", studentId: "ST-104", studentName: "Divya Nair", rating: 4, comment: "Mrs. Lakshmi's English classes really boosted my confidence in speaking.", date: "2026-05-20" },
  { id: "RV-706", studentId: "ST-106", studentName: "Sneha Patel", rating: 4, comment: "Prof. Narayana's Physics explanations are very clear and systematic.", date: "2026-05-18" },
];

export const INITIAL_MESSAGES: Message[] = [
  { id: "MSG-801", fromStudentId: "ST-101", fromName: "Arjun Sharma", preview: "Sir, please share the formula sheet for tomorrow's test.", time: "10:30 AM", unread: true },
  { id: "MSG-802", fromStudentId: "ST-108", fromName: "Preethi Menon", preview: "Ma'am, can I submit the biology project on Monday?", time: "09:45 AM", unread: true },
  { id: "MSG-803", fromStudentId: "ST-110", fromName: "Meghana Rao", preview: "Sir, what chapters are covered in Saturday's mock test?", time: "Yesterday", unread: true },
  { id: "MSG-804", fromStudentId: "ST-102", fromName: "Kavya Reddy", preview: "Please share the Python assignment link.", time: "Yesterday", unread: false },
  { id: "MSG-805", fromStudentId: "ST-104", fromName: "Divya Nair", preview: "Thank you for the extra English session!", time: "2 days ago", unread: false },
];

export const INITIAL_TESTS: TestScore[] = [
  { id: "TS-601", studentId: "ST-101", studentName: "Arjun Sharma", title: "Quadratic Equations Unit Test", subject: "Mathematics", score: 23, total: 25, date: "2026-05-28" },
  { id: "TS-602", studentId: "ST-102", studentName: "Kavya Reddy", title: "Python Basics Assessment", subject: "Computer Science", score: 28, total: 30, date: "2026-05-26" },
  { id: "TS-603", studentId: "ST-108", studentName: "Preethi Menon", title: "Cell Biology Quiz", subject: "Biology", score: 29, total: 30, date: "2026-05-25" },
  { id: "TS-604", studentId: "ST-110", studentName: "Meghana Rao", title: "SSC Mock Paper Set 2", subject: "SSC Exam Preparation", score: 87, total: 100, date: "2026-05-24" },
  { id: "TS-605", studentId: "ST-106", studentName: "Sneha Patel", title: "Laws of Motion Test", subject: "Physics", score: 21, total: 25, date: "2026-05-22" },
  { id: "TS-606", studentId: "ST-104", studentName: "Divya Nair", title: "English Grammar Test — Tenses", subject: "English", score: 19, total: 20, date: "2026-05-20" },
];