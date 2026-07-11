import type { EmirateId } from "@/lib/brand";
import type { ImageAssessment } from "@/lib/imageQuality";
import type { Surface } from "@/components/ProductPreview";

export type Slot = "morning" | "afternoon" | "evening";

export interface OrderDraft {
  imageOriginal: string | null;
  imageProcessed: string | null;
  assessment: ImageAssessment | null;
  moderationBlocked: boolean;
  consent: boolean;
  surfaceView: Surface;

  messageLang: "en" | "ar";
  message: string;
  recipientName: string;

  packageId: string | null;

  emirate: EmirateId;
  area: string;
  date: string;
  slot: Slot;
  deliverName: string;
  deliverPhone: string;
  leaveAtDoor: boolean;

  nonReturnable: boolean;
}

export const INITIAL_DRAFT: OrderDraft = {
  imageOriginal: null,
  imageProcessed: null,
  assessment: null,
  moderationBlocked: false,
  consent: false,
  surfaceView: "cup",
  messageLang: "en",
  message: "",
  recipientName: "",
  packageId: null,
  emirate: "dubai",
  area: "",
  date: "",
  slot: "morning",
  deliverName: "",
  deliverPhone: "",
  leaveAtDoor: false,
  nonReturnable: false,
};

export const STEP_KEYS = [
  "upload",
  "preview",
  "message",
  "package",
  "delivery",
  "review",
  "pay",
] as const;

export type StepKey = (typeof STEP_KEYS)[number];
