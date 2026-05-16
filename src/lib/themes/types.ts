export type ThemeId =
  | "rta"
  | "adnoc"
  | "aldar"
  | "etihad-rail"
  | "dewa"
  | "dubai-police"
  | "generic"
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
  authority_en: string;
  authority_ar: string;
  brand: ThemeBrand;
  status: ThemeStatus;
}
