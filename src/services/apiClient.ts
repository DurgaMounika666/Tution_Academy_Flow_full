/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * API Client for Academy Flow Backend
 */

const configuredApiBase = (import.meta as any).env?.VITE_API_URL;
const API_BASE_CANDIDATES = [
  configuredApiBase,
  "http://localhost:5000/api",
  "http://localhost:5001/api",
  "http://localhost:5002/api",
  "http://localhost:5003/api",
].filter((value, index, self): value is string => Boolean(value) && self.indexOf(value) === index);

let activeApiBase = API_BASE_CANDIDATES[0];

let authToken: string | null = null;

if (typeof window !== "undefined") {
  authToken = localStorage.getItem("authToken");
}

const headers = () => ({
  "Content-Type": "application/json",
  ...(authToken && { Authorization: `Bearer ${authToken}` }),
});

const request = async (method: string, endpoint: string, body?: any) => {
  const basesToTry = [
    activeApiBase,
    ...API_BASE_CANDIDATES.filter((base) => base !== activeApiBase),
  ];
  let lastNetworkError: unknown = null;

  for (const base of basesToTry) {
    const url = `${base}${endpoint}`;

    try {
      const response = await fetch(url, {
        method,
        headers: headers(),
        body: body ? JSON.stringify(body) : undefined,
      });

      activeApiBase = base;

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || error.error || `API Error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      if (error instanceof TypeError) {
        lastNetworkError = error;
        continue;
      }

      console.error(`API Request Failed: ${method} ${endpoint}`, error);
      throw error;
    }
  }

  console.error(`API Request Failed on all known backends: ${method} ${endpoint}`, lastNetworkError);
  throw lastNetworkError;
};

export const apiClient = {
  setAuthToken: (token: string) => {
    authToken = token;
    localStorage.setItem("authToken", token);
  },

  clearAuthToken: () => {
    authToken = null;
    localStorage.removeItem("authToken");
  },

  auth: {
    registerParent: (email: string, password: string, name?: string, phone?: string, childName?: string, childGrade?: string, classMode?: string) =>
      request("POST", "/auth/register-parent", { email, password, name, phone, childName, childGrade, classMode }),

    loginStudent: (studentId: string) =>
      request("POST", "/auth/login-student", { studentId }),

    loginParent: (email: string, password: string) =>
      request("POST", "/auth/login-parent", { email, password }),

    loginTutor: (email: string, password: string) =>
      request("POST", "/auth/login-tutor", { email, password }),

    loginAdmin: (email: string, password: string) =>
      request("POST", "/auth/login-admin", { email, password }),

    logout: () => request("POST", "/auth/logout"),
  },

  bookings: {
    createDemoBooking: (booking: {
      fullName: string;
      email: string;
      whatsappNumber: string;
      course: string;
      preferredDate?: string;
      location?: string;
      studentClass?: string;
    }) => request("POST", "/bookings/demo", booking),
  },

  students: {
    getAll: () => request("GET", "/students"),

    getById: (studentId: string) =>
      request("GET", `/students/${studentId}`),

    getByParent: (parentEmail: string) =>
      request("GET", `/students/parent/${encodeURIComponent(parentEmail)}`),

    getByTutor: (tutorId: string) =>
      request("GET", `/students/tutor/${tutorId}`),

    create: (student: {
      name: string;
      grade: string;
      section?: string;
      parentEmail: string;
      assignedTutorIds?: string[];
      learningSubjects?: string[];
      phone?: string;
    }) => request("POST", "/students", student),

    update: (studentId: string, updateData: any) =>
      request("PUT", `/students/${studentId}`, updateData),

    delete: (studentId: string) =>
      request("DELETE", `/students/${studentId}`),

    assignTutor: (studentId: string, tutorId: string) =>
      request("POST", `/students/${studentId}/assign-tutor`, { tutorId }),

    addSubjects: (studentId: string, subjects: string[]) =>
      request("POST", `/students/${studentId}/learning-subjects`, { subjects }),
  },

  fees: {
    create: (fee: { studentId: string; title: string; amount: number; dueDate: string }) =>
      request("POST", "/fees", fee),

    getAll: () => request("GET", "/fees/all"),

    getByStudent: (studentId: string) =>
      request("GET", `/fees/${studentId}`),

    getById: (feeId: string) =>
      request("GET", `/fees/fee/${feeId}`),

    markAsPaid: (feeId: string, transactionId?: string, paymentMethod?: string) =>
      request("PUT", `/fees/${feeId}/payment`, {
        transactionId: transactionId || `AF-TXN-${Math.floor(10000 + Math.random() * 90000)}`,
        paymentMethod: paymentMethod || "Online",
      }),

    getPending: () =>
      request("GET", "/fees/pending/all"),

    getPendingApprovals: () =>
      request("GET", "/fees/pending/approvals"),

    updateApproval: (feeId: string, status: "Approved" | "Rejected") =>
      request("PUT", `/fees/${feeId}/approval`, { status }),

    getReport: (month?: number, year?: number) => {
      const params = new URLSearchParams();
      if (month) params.append("month", month.toString());
      if (year) params.append("year", year.toString());
      return request("GET", `/fees/reports/monthly?${params.toString()}`);
    },
  },

  attendance: {
    mark: (studentId: string, date: string, status: string, batchId?: string) =>
      request("POST", "/attendance/mark", { studentId, date, status, batchId }),

    getByStudent: (studentId: string) =>
      request("GET", `/attendance/${studentId}`),

    createAssignment: (tutorId: string, title: string, subject: string, dueDate: string, description?: string) =>
      request("POST", "/attendance/assignments", { tutorId, title, subject, dueDate, description }),

    getAssignmentsByTutor: (tutorId: string) =>
      request("GET", `/attendance/tutor/${tutorId}/assignments`),
  },

  tutors: {
    getAll: () => request("GET", "/tutors"),
    getById: (tutorId: string) => request("GET", `/tutors/${tutorId}`),
    getByEmail: (email: string) => request("GET", `/tutors/by-email/${encodeURIComponent(email)}`),
    create: (tutor: { name: string; specialty: string; email: string; subjects?: string[]; password?: string }) =>
      request("POST", "/tutors", tutor),
    update: (tutorId: string, data: any) => request("PUT", `/tutors/${tutorId}`, data),
    delete: (tutorId: string) => request("DELETE", `/tutors/${tutorId}`),
  },

  parents: {
    getAll: () => request("GET", "/parents"),
    getByEmail: (email: string) => request("GET", `/parents/by-email/${encodeURIComponent(email)}`),
    create: (parent: { email: string; password: string; name: string; phone?: string }) =>
      request("POST", "/parents", parent),
    update: (email: string, data: any) =>
      request("PUT", `/parents/by-email/${encodeURIComponent(email)}`, data),
    delete: (email: string) =>
      request("DELETE", `/parents/by-email/${encodeURIComponent(email)}`),
  },

  reviews: {
    create: (data: {
      type: "student_tutor" | "parent_tuition";
      studentId?: string;
      parentEmail?: string;
      tutorId?: string;
      tutorName?: string;
      rating: number;
      comment: string;
      subject?: string;
    }) => request("POST", "/reviews", data),

    getByStudent: (studentId: string) =>
      request("GET", `/reviews/student/${studentId}`),

    getByParent: (parentEmail: string) =>
      request("GET", `/reviews/parent/${encodeURIComponent(parentEmail)}`),

    getByTutor: (tutorId: string) =>
      request("GET", `/reviews/tutor/${tutorId}`),
  },

  timetable: {
    getAll: () => request("GET", "/timetable"),
    getSummary: () => request("GET", "/timetable/summary"),
    getByTutor: (tutorId: string) => request("GET", `/timetable/tutor/${tutorId}`),
    create: (data: any) => request("POST", "/timetable", data),
    update: (scheduleId: string, data: any) => request("PUT", `/timetable/${scheduleId}`, data),
    delete: (scheduleId: string) => request("DELETE", `/timetable/${scheduleId}`),
  },
};
