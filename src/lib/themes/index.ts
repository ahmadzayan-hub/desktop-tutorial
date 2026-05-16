import type { ThemeId, ThemeMeta } from "./types";

const STATUS = {
  green: "#10B981",
  amber: "#F59E0B",
  red: "#EF4444",
} as const;

export const themes: Record<ThemeId, ThemeMeta> = {
  rta: {
    id: "rta",
    name_en: "RTA",
    name_ar: "هيئة الطرق والمواصلات",
    authority_en: "Roads and Transport Authority",
    authority_ar: "هيئة الطرق والمواصلات",
    brand: {
      primary: "#171C8F",
      secondary: "#EE0032",
      accent: "#D4A017",
      ink: "#0F172A",
      paper: "#FFFFFF",
    },
    status: STATUS,
  },
  adnoc: {
    id: "adnoc",
    name_en: "ADNOC",
    name_ar: "أدنوك",
    authority_en: "Abu Dhabi National Oil Company",
    authority_ar: "شركة بترول أبوظبي الوطنية",
    brand: {
      primary: "#003595",
      secondary: "#00A19B",
      accent: "#D4A017",
      ink: "#0F172A",
      paper: "#FFFFFF",
    },
    status: STATUS,
  },
  aldar: {
    id: "aldar",
    name_en: "Aldar",
    name_ar: "الدار",
    authority_en: "Aldar Properties",
    authority_ar: "الدار العقارية",
    brand: {
      primary: "#1B3D5F",
      secondary: "#C8A560",
      accent: "#7A8B99",
      ink: "#0F172A",
      paper: "#FFFFFF",
    },
    status: STATUS,
  },
  "etihad-rail": {
    id: "etihad-rail",
    name_en: "Etihad Rail",
    name_ar: "الاتحاد للقطارات",
    authority_en: "Etihad Rail",
    authority_ar: "الاتحاد للقطارات",
    brand: {
      primary: "#0F4C81",
      secondary: "#E03C31",
      accent: "#A5A5A5",
      ink: "#0F172A",
      paper: "#FFFFFF",
    },
    status: STATUS,
  },
  dewa: {
    id: "dewa",
    name_en: "DEWA",
    name_ar: "هيئة كهرباء ومياه دبي",
    authority_en: "Dubai Electricity and Water Authority",
    authority_ar: "هيئة كهرباء ومياه دبي",
    brand: {
      primary: "#005F9E",
      secondary: "#00A859",
      accent: "#D4A017",
      ink: "#0F172A",
      paper: "#FFFFFF",
    },
    status: STATUS,
  },
  "dubai-police": {
    id: "dubai-police",
    name_en: "Dubai Police",
    name_ar: "شرطة دبي",
    authority_en: "Dubai Police",
    authority_ar: "القيادة العامة لشرطة دبي",
    brand: {
      primary: "#0B5A3B",
      secondary: "#C8102E",
      accent: "#D4A017",
      ink: "#0F172A",
      paper: "#FFFFFF",
    },
    status: STATUS,
  },
  generic: {
    id: "generic",
    name_en: "Generic Authority",
    name_ar: "جهة حكومية",
    authority_en: "UAE Government Authority",
    authority_ar: "جهة حكومية اتحادية",
    brand: {
      primary: "#1F2937",
      secondary: "#475569",
      accent: "#D4A017",
      ink: "#0F172A",
      paper: "#FFFFFF",
    },
    status: STATUS,
  },
  custom: {
    id: "custom",
    name_en: "Custom",
    name_ar: "مخصص",
    authority_en: "Custom Brand Kit",
    authority_ar: "هوية مخصصة",
    brand: {
      primary: "#171C8F",
      secondary: "#EE0032",
      accent: "#D4A017",
      ink: "#0F172A",
      paper: "#FFFFFF",
    },
    status: STATUS,
  },
};

export function getTheme(id: ThemeId | string | null | undefined): ThemeMeta {
  if (id && id in themes) return themes[id as ThemeId];
  return themes.rta;
}

export const themeOrder: ThemeId[] = [
  "rta",
  "adnoc",
  "aldar",
  "etihad-rail",
  "dewa",
  "dubai-police",
  "generic",
  "custom",
];

export type { ThemeId, ThemeMeta } from "./types";
