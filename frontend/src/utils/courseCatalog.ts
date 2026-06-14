/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { SUBJECTS_BY_CLASS, STANDARDS } from "../data";
import { Tutor } from "../types";

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
export function buildAllCoursesFromCatalog(
  students: StudentSubjectRef[] = [],
  tutors: Tutor[] = []
): CatalogCourse[] {
  const courses: CatalogCourse[] = [];
  let seq = 301;

  STANDARDS.forEach((grade, gradeIdx) => {
    const subjects = SUBJECTS_BY_CLASS[grade] || [];
    subjects.forEach((name, subIdx) => {
      const enrolled = students.filter((s) =>
        s.learningSubjects?.some((ls) => ls.name === name)
      ).length;

      let assignedTutorName = "";
      if (tutors && tutors.length > 0) {
        const matchSubject = (subjectName: string, tutorSubject: string): boolean => {
          const s1 = subjectName.toLowerCase();
          const s2 = tutorSubject.toLowerCase();
          if (s1 === s2) return true;
          if (s1.includes(s2) || s2.includes(s1)) return true;
          
          const words1 = s1.split(/[\s/()]+/).filter(w => w.length > 3);
          const words2 = s2.split(/[\s/()]+/).filter(w => w.length > 3);
          for (const w1 of words1) {
            if (words2.includes(w1)) return true;
          }
          return false;
        };

        const matchedTutors = tutors.filter((t) =>
          t.subjects?.some((sub) => matchSubject(name, sub))
        );

        if (matchedTutors.length > 0) {
          matchedTutors.sort((a, b) => {
            const aSpec = a.specialty.toLowerCase().includes(name.toLowerCase()) ? 1 : 0;
            const bSpec = b.specialty.toLowerCase().includes(name.toLowerCase()) ? 1 : 0;
            return bSpec - aSpec;
          });
          assignedTutorName = matchedTutors[0].name;
        } else {
          // Try loose matching on specialty
          const looseTutor = tutors.find((t) =>
            t.specialty.toLowerCase().includes(name.toLowerCase()) || name.toLowerCase().includes(t.specialty.toLowerCase())
          );
          if (looseTutor) {
            assignedTutorName = looseTutor.name;
          }
        }
      }

      // Fallback
      if (!assignedTutorName) {
        const rotationName = TUTOR_ROTATION[(gradeIdx + subIdx) % TUTOR_ROTATION.length];
        const actualTutor = tutors.find((t) => {
          const nameClean = t.name.toLowerCase().replace(/\s/g, "");
          const rotClean = rotationName.toLowerCase().replace(/\s/g, "");
          return (
            nameClean.includes(rotClean) ||
            rotClean.includes(nameClean) ||
            (rotClean.includes("anand") && nameClean.includes("anand")) ||
            (rotClean.includes("anitha") && nameClean.includes("anitha")) ||
            (rotClean.includes("narayana") && nameClean.includes("narayana"))
          );
        });
        assignedTutorName = actualTutor ? actualTutor.name : rotationName;
      }

      courses.push({
        id: `C-${seq++}`,
        name,
        tutorName: assignedTutorName,
        category: grade,
        studentsCount: enrolled,
        duration: grade === "Special Courses" ? "8 weeks" : "12 weeks",
        mode: (gradeIdx + subIdx) % 2 === 0 ? "Online" : "Offline",
        status: "Active",
      });
    });
  });

  return courses;
}
