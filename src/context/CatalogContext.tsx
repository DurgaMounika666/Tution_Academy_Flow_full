/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { apiClient } from "../services/apiClient";

interface CatalogData {
  standards: string[];
  locations: string[];
  classTypes: string[];
  languages: string[];
  subjectsByClass: Record<string, string[]>;
}

interface CatalogContextType extends CatalogData {
  loading: boolean;
  refreshCatalog: () => Promise<void>;
}

const defaultCatalog: CatalogData = {
  standards: [
    "1st Class", "2nd Class", "3rd Class", "4th Class", "5th Class",
    "6th Class", "7th Class", "8th Class", "9th Class", "10th Class",
  ],
  locations: ["Hyderabad", "Warangal", "Karimnagar"],
  classTypes: ["Online", "Offline"],
  languages: ["English", "Telugu", "Hindi"],
  subjectsByClass: {
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
  },
};

const CatalogContext = createContext<CatalogContextType>({
  ...defaultCatalog,
  loading: true,
  refreshCatalog: async () => {},
});

export const useCatalog = () => useContext(CatalogContext);

export const CatalogProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [catalog, setCatalog] = useState<CatalogData>(defaultCatalog);
  const [loading, setLoading] = useState(true);

  const refreshCatalog = useCallback(async () => {
    try {
      const data = await apiClient.catalog.getAll();
      setCatalog({
        standards: Array.isArray(data?.standards) && data.standards.length ? data.standards : defaultCatalog.standards,
        locations: Array.isArray(data?.locations) && data.locations.length ? data.locations : defaultCatalog.locations,
        classTypes: Array.isArray(data?.classTypes) && data.classTypes.length ? data.classTypes : defaultCatalog.classTypes,
        languages: Array.isArray(data?.languages) && data.languages.length ? data.languages : defaultCatalog.languages,
        subjectsByClass: data?.subjectsByClass && typeof data.subjectsByClass === "object" && Object.keys(data.subjectsByClass).length
          ? data.subjectsByClass
          : defaultCatalog.subjectsByClass,
      });
    } catch (error) {
      console.warn("Unable to load catalog from backend, using fallback data", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshCatalog();
  }, [refreshCatalog]);

  return (
    <CatalogContext.Provider value={{ ...catalog, loading, refreshCatalog }}>
      {children}
    </CatalogContext.Provider>
  );
};
