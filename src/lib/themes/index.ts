import type { ThemeId, ThemeMeta } from "./types";

const STATUS = {
  green: "#10B981",
  amber: "#F59E0B",
  red: "#EF4444",
} as const;

// Eight public, generic theme presets.
// Colors are tuned for executive dashboards; names are sector-neutral
// so no customer-specific branding is exposed.
export const themes: Record<ThemeId, ThemeMeta> = {
  civic: {
    id: "civic",
    name_en: "Civic",
    name_ar: "حكومي",
    description_en: "Navy + red + gold. Default for government and public-sector dashboards.",
    description_ar: "كحلي وأحمر وذهبي. الإفتراضي للوحات القطاع الحكومي والعام.",
    brand: {
      primary: "#171C8F",
      secondary: "#EE0032",
      accent: "#D4A017",
      ink: "#0F172A",
      paper: "#FFFFFF",
    },
    status: STATUS,
  },
  petrol: {
    id: "petrol",
    name_en: "Petrol",
    name_ar: "طاقة",
    description_en: "Deep blue + teal. For energy, oil and gas projects.",
    description_ar: "أزرق غامق وأخضر بحري. لمشاريع قطاع الطاقة والنفط والغاز.",
    brand: {
      primary: "#003595",
      secondary: "#00A19B",
      accent: "#D4A017",
      ink: "#0F172A",
      paper: "#FFFFFF",
    },
    status: STATUS,
  },
  sand: {
    id: "sand",
    name_en: "Sand",
    name_ar: "رملي",
    description_en: "Sandstone + champagne. For real estate, developers, hospitality.",
    description_ar: "حجر رملي وشمبانيا. للعقارات والمطورين والضيافة.",
    brand: {
      primary: "#1B3D5F",
      secondary: "#C8A560",
      accent: "#7A8B99",
      ink: "#0F172A",
      paper: "#FFFFFF",
    },
    status: STATUS,
  },
  rail: {
    id: "rail",
    name_en: "Rail",
    name_ar: "نقل",
    description_en: "Cobalt + signal red. For transport, logistics, infrastructure.",
    description_ar: "كوبالت وأحمر إشارة. للنقل واللوجستيات والبنية التحتية.",
    brand: {
      primary: "#0F4C81",
      secondary: "#E03C31",
      accent: "#A5A5A5",
      ink: "#0F172A",
      paper: "#FFFFFF",
    },
    status: STATUS,
  },
  utility: {
    id: "utility",
    name_en: "Utility",
    name_ar: "مرافق",
    description_en: "Service blue + lawn green. For water, power, telecoms.",
    description_ar: "أزرق خدمي وأخضر. للمياه والكهرباء والاتصالات.",
    brand: {
      primary: "#005F9E",
      secondary: "#00A859",
      accent: "#D4A017",
      ink: "#0F172A",
      paper: "#FFFFFF",
    },
    status: STATUS,
  },
  guardian: {
    id: "guardian",
    name_en: "Guardian",
    name_ar: "أمن",
    description_en: "Forest + crimson. For public safety, defence, regulatory.",
    description_ar: "أخضر داكن وقرمزي. للسلامة العامة والدفاع والجهات الرقابية.",
    brand: {
      primary: "#0B5A3B",
      secondary: "#C8102E",
      accent: "#D4A017",
      ink: "#0F172A",
      paper: "#FFFFFF",
    },
    status: STATUS,
  },
  slate: {
    id: "slate",
    name_en: "Slate",
    name_ar: "حيادي",
    description_en: "Charcoal + slate + gold. Neutral palette for any sector.",
    description_ar: "فحمي وحجري وذهبي. هوية حيادية لأي قطاع.",
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
    name_ar: "مخصصة",
    description_en: "Upload your logo and pick three colors. Validated for WCAG AA contrast.",
    description_ar: "ارفع شعارك واختر ثلاثة ألوان. مع التحقق من تباين WCAG AA.",
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
  return themes.civic;
}

export const themeOrder: ThemeId[] = [
  "civic",
  "petrol",
  "sand",
  "rail",
  "utility",
  "guardian",
  "slate",
  "custom",
];

export type { ThemeId, ThemeMeta } from "./types";
