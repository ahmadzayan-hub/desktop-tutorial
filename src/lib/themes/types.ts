export type ThemeId =
  | "civic"
  | "petrol"
  | "sand"
  | "rail"
  | "utility"
  | "guardian"
  | "slate"
  | "custom";

export interface ThemeBrand {
  primary: string;
  secondary: string;
  accent: string;
  ink: string;
  paper: string;
}

export interface ThemeStatus {
  green: string;
  amber: string;
  red: string;
}

export interface ThemeMeta {
  id: ThemeId;
  name_en: string;
  name_ar: string;
  description_en: string;
  description_ar: string;
  brand: ThemeBrand;
  status: ThemeStatus;
}
