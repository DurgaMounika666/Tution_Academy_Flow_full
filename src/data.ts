/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Assignment, Review, Message, TestScore } from "./types";
import { apiClient } from "./services/apiClient";

// Fallback defaults (used until API responds)
export let STANDARDS: string[] = [
  "1st Class", "2nd Class", "3rd Class", "4th Class", "5th Class",
  "6th Class", "7th Class", "8th Class", "9th Class", "10th Class",
];

export let LOCATIONS: string[] = ["Hyderabad", "Warangal", "Karimnagar"];
export let CLASS_TYPES: string[] = ["Online", "Offline"];
export let LANGUAGES: string[] = ["English", "Telugu", "Hindi"];

export let SUBJECTS_BY_CLASS: { [key: string]: string[] } = {
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

// Fetch catalog from backend and update the exported values
export async function loadCatalog(): Promise<void> {
  try {
    const data = await apiClient.catalog.getAll();
    if (data.standards?.length) STANDARDS = data.standards;
    if (data.locations?.length) LOCATIONS = data.locations;
    if (data.classTypes?.length) CLASS_TYPES = data.classTypes;
    if (data.languages?.length) LANGUAGES = data.languages;
    if (data.subjectsByClass && Object.keys(data.subjectsByClass).length) {
      SUBJECTS_BY_CLASS = data.subjectsByClass;
    }
  } catch (error) {
    console.warn("Unable to load catalog from backend, using fallback data", error);
  }
}

// Empty defaults — dashboards load live data from backend
export const INITIAL_ASSIGNMENTS: Assignment[] = [];
export const INITIAL_REVIEWS: Review[] = [];
export const INITIAL_MESSAGES: Message[] = [];
export const INITIAL_TESTS: TestScore[] = [];
