/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Assignment, Review, Message, TestScore } from "./types";

// Static fallback values — components should use the CatalogContext (useCatalog hook)
// to get the live, backend-driven values that update reactively.
export const STANDARDS = [
  "1st Class", "2nd Class", "3rd Class", "4th Class", "5th Class",
  "6th Class", "7th Class", "8th Class", "9th Class", "10th Class",
];

export const LOCATIONS = ["Hyderabad", "Warangal", "Karimnagar"];
export const CLASS_TYPES = ["Online", "Offline"];
export const LANGUAGES = ["English", "Telugu", "Hindi"];

export const SUBJECTS_BY_CLASS: { [key: string]: string[] } = {
  "1st Class": ["Mathematics", "Environmental Studies", "English", "Telugu", "Hindi"],
  "2nd Class": ["Mathematics", "Environmental Studies", "English", "Telugu", "Hindi"],
  "3rd Class": ["Mathematics", "Environmental Studies", "English", "Telugu", "Hindi"],
  "4th Class": ["Mathematics", "Environmental Studies", "English", "Telugu", "Hindi"],
  "5th Class": ["Mathematics", "General Science", "English", "Social Studies", "Telugu", "Hindi"],
  "6th Class": ["Mathematics", "General Science", "English", "Social Studies", "Telugu", "Hindi"],
  "7th Class": ["Mathematics", "General Science", "English", "Social Studies", "Telugu", "Hindi"],
  "8th Class": ["Mathematics", "Physics", "Chemistry", "Biology", "English", "Social Studies"],
  "9th Class": ["Mathematics", "Physics", "Chemistry", "Biology", "English", "Computer Science"],
  "10th Class": ["Mathematics", "Physics", "Chemistry", "Biology", "English", "Computer Science"],
};

// Empty defaults — dashboards load live data from backend
export const INITIAL_ASSIGNMENTS: Assignment[] = [];
export const INITIAL_REVIEWS: Review[] = [];
export const INITIAL_MESSAGES: Message[] = [];
export const INITIAL_TESTS: TestScore[] = [];
