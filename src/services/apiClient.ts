/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * API Client for Academy Flow Backend
 * This file provides convenient methods for all API calls
 * 
 * Usage in frontend components:
 * import { apiClient } from './services/apiClient';
 * const response = await apiClient.auth.loginParent(email, password);
 */

const configuredApiBase = (import.meta as any).env?.VITE_API_URL;
const API_BASE_CANDIDATES = [
  configuredApiBase,
  "http://localhost:5000/api",
  "http://localhost:5001/api",
].filter((value, index, self): value is string => Boolean(value) && self.indexOf(value) === index);

let activeApiBase = API_BASE_CANDIDATES[0];

let authToken: string | null = null;

// Initialize token from localStorage
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
      // Retry only for network-level errors (wrong/offline backend port).
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
    registerParent: (email: string, password: string, childName?: string, childGrade?: string) =>
      request("POST", "/auth/register-parent", { email, password, childName, childGrade }),

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
    getById: (studentId: string) =>
      request("GET", `/students/${studentId}`),

    getByParent: (parentEmail: string) =>
      request("GET", `/students/parent/${parentEmail}`),

    create: (student: any) =>
      request("POST", "/students", student),

    update: (studentId: string, updateData: any) =>
      request("PUT", `/students/${studentId}`, updateData),

    assignTutor: (studentId: string, tutorId: string) =>
      request("POST", `/students/${studentId}/assign-tutor`, { tutorId }),

    addSubjects: (studentId: string, subjects: string[]) =>
      request("POST", `/students/${studentId}/learning-subjects`, { subjects }),
  },

  fees: {
    create: (fee: any) =>
      request("POST", "/fees", fee),

    getByStudent: (studentId: string) =>
      request("GET", `/fees/${studentId}`),

    getById: (feeId: string) =>
      request("GET", `/fees/fee/${feeId}`),

    markAsPaid: (feeId: string, transactionId: string, paymentMethod: string) =>
      request("PUT", `/fees/${feeId}/payment`, { transactionId, paymentMethod }),

    getPending: () =>
      request("GET", "/fees/pending/all"),

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
};
