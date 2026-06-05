/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Assignment, Review, Message, TestScore } from "./types";

// Static catalog data only — entity data comes from the API / MongoDB
export const STANDARDS = [
  "6th Class", "7th Class", "8th Class", "9th Class",
  "10th Class", "11th Class", "12th Class", "Graduation",
];

export const LOCATIONS = ["Hyderabad", "Warangal", "Karimnagar"];
export const CLASS_TYPES = ["Online", "Offline"];
export const LANGUAGES = ["English", "Telugu", "Hindi"];

export const SUBJECTS_BY_CLASS: { [key: string]: string[] } = {
  "6th Class": ["Mathematics", "General Science", "English", "Social Studies", "Telugu", "Hindi"],
  "7th Class": ["Mathematics", "General Science", "English", "Social Studies", "Telugu", "Hindi"],
  "8th Class": ["Mathematics", "Physics", "Chemistry", "Biology", "English", "Social Studies"],
  "9th Class": ["Mathematics", "Physics", "Chemistry", "Biology", "English", "Computer Science"],
  "10th Class": ["Mathematics", "Physics", "Chemistry", "Biology", "English", "Computer Science"],
  "11th Class": ["Mathematics", "Physics", "Chemistry", "Biology", "English", "Computer Science"],
  "12th Class": ["Mathematics", "Physics", "Chemistry", "Biology", "English", "Computer Science"],
  "Graduation": ["Mathematics", "Physics", "Chemistry", "Computer Science", "English"],
};

// Empty defaults — dashboards load live data from backend
export const INITIAL_ASSIGNMENTS: Assignment[] = [];
export const INITIAL_REVIEWS: Review[] = [];
export const INITIAL_MESSAGES: Message[] = [];
export const INITIAL_TESTS: TestScore[] = [];
