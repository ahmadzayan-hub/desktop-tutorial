"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import {
  createProject,
  deleteProject,
  seedDemoProjects,
} from "@/lib/store/mock-store";
import { themeOrder } from "@/lib/themes";
import type { Subject } from "@/types/database";
import type { ThemeId } from "@/lib/themes/types";

const Schema = z.object({
  name: z
    .string()
    .min(2, "Project name must be at least 2 characters.")
    .max(200, "Project name is too long."),
  subject: z.enum([
    "contract_management",
    "tender_evaluation",
    "operations_maintenance",
    "construction",
  ]),
  theme: z.enum(themeOrder as [ThemeId, ...ThemeId[]]),
  client_authority_en: z.string().trim().optional().or(z.literal("")),
  client_authority_ar: z.string().trim().optional().or(z.literal("")),
  counterparty_en: z.string().trim().optional().or(z.literal("")),
  counterparty_ar: z.string().trim().optional().or(z.literal("")),
  start_date: z.string().optional().or(z.literal("")),
  end_date: z.string().optional().or(z.literal("")),
});

export type CreateProjectState = {
  ok: boolean;
  fieldErrors?: Record<string, string>;
  error?: string;
};

function emptyToNull(value: string | undefined): string | null {
  return value && value.length > 0 ? value : null;
}

export async function createProjectAction(
  _prev: CreateProjectState,
  formData: FormData,
): Promise<CreateProjectState> {
  const raw = Object.fromEntries(formData.entries());
  const parsed = Schema.safeParse(raw);

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0];
      if (typeof key === "string" && !fieldErrors[key]) {
        fieldErrors[key] = issue.message;
      }
    }
    return { ok: false, fieldErrors };
  }

  const project = await createProject({
    name: parsed.data.name,
    subject: parsed.data.subject as Subject,
    theme: parsed.data.theme as ThemeId,
    client_authority_en: emptyToNull(parsed.data.client_authority_en),
    client_authority_ar: emptyToNull(parsed.data.client_authority_ar),
    counterparty_en: emptyToNull(parsed.data.counterparty_en),
    counterparty_ar: emptyToNull(parsed.data.counterparty_ar),
    start_date: emptyToNull(parsed.data.start_date),
    end_date: emptyToNull(parsed.data.end_date),
  });

  revalidatePath("/projects");
  redirect(`/projects/${project.id}`);
}

export async function deleteProjectAction(formData: FormData): Promise<void> {
  const id = formData.get("id");
  if (typeof id !== "string" || !id) return;
  await deleteProject(id);
  revalidatePath("/projects");
  redirect("/projects");
}

export async function seedDemoAction(): Promise<void> {
  await seedDemoProjects();
  revalidatePath("/projects");
  redirect("/projects");
}
