/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { SUBJECTS_BY_CLASS, STANDARDS } from "../data";

export interface CatalogCourse {
  id: string;
  name: string;
  tutorName: string;
  category: string;
  studentsCount: number;
  duration: string;
  mode: "Online" | "Offline";
  status: "Active" | "Upcoming";
}

const TUTOR_ROTATION = ["Dr. Anitha", "Prof.Narayana", "Mr. Anand Kumar"];

type StudentSubjectRef = {
  learningSubjects?: Array<{ name: string }>;
};

/** Builds every course module from SUBJECTS_BY_CLASS for admin portal. */
export function buildAllCoursesFromCatalog(students: StudentSubjectRef[] = []): CatalogCourse[] {
  const courses: CatalogCourse[] = [];
  let seq = 301;

  STANDARDS.forEach((grade, gradeIdx) => {
    const subjects = SUBJECTS_BY_CLASS[grade] || [];
    subjects.forEach((name, subIdx) => {
      const enrolled = students.filter((s) =>
        s.learningSubjects?.some((ls) => ls.name === name)
      ).length;

      courses.push({
        id: `C-${seq++}`,
        name,
        tutorName: TUTOR_ROTATION[(gradeIdx + subIdx) % TUTOR_ROTATION.length],
        category: grade,
        studentsCount: enrolled > 0 ? enrolled : Math.max(2, ((gradeIdx + subIdx) % 12) + 3),
        duration: grade === "Special Courses" ? "8 weeks" : "12 weeks",
        mode: (gradeIdx + subIdx) % 2 === 0 ? "Online" : "Offline",
        status: "Active",
      });
    });
  });

  return courses;
}
