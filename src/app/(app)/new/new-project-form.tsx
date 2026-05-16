"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { themeOrder, themes } from "@/lib/themes";
import { createProjectAction, type CreateProjectState } from "./actions";

const initialState: CreateProjectState = { ok: true };

export function NewProjectForm() {
  const [state, formAction, pending] = useActionState(
    createProjectAction,
    initialState,
  );
  const errors = state.fieldErrors ?? {};

  return (
    <form action={formAction} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="name">Project name</Label>
        <Input
          id="name"
          name="name"
          required
          placeholder="SENER Contract Q2 2026"
          aria-invalid={!!errors.name}
        />
        {errors.name ? (
          <p className="text-xs text-rta-red">{errors.name}</p>
        ) : (
          <p className="text-xs text-slate-500">
            Internal label only. You can rename it later.
          </p>
        )}
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="subject">Subject</Label>
          <Select id="subject" name="subject" required defaultValue="contract_management">
            <option value="contract_management">Contract Management</option>
            <option value="tender_evaluation">Tender Evaluation</option>
          </Select>
          {errors.subject && <p className="text-xs text-rta-red">{errors.subject}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="theme">Theme</Label>
          <Select id="theme" name="theme" required defaultValue="rta">
            {themeOrder.map((id) => (
              <option key={id} value={id}>
                {themes[id].name_en}
              </option>
            ))}
          </Select>
          {errors.theme && <p className="text-xs text-rta-red">{errors.theme}</p>}
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="client_authority_en">Client authority</Label>
          <Input
            id="client_authority_en"
            name="client_authority_en"
            placeholder="Roads and Transport Authority"
          />
          <p className="text-xs text-slate-500">
            The UAE government authority who owns the project.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="client_authority_ar">Client authority · Arabic</Label>
          <Input
            id="client_authority_ar"
            name="client_authority_ar"
            dir="rtl"
            lang="ar"
            placeholder="هيئة الطرق والمواصلات"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="counterparty_en">Counterparty</Label>
          <Input
            id="counterparty_en"
            name="counterparty_en"
            placeholder="SENER Engineering"
          />
          <p className="text-xs text-slate-500">
            Consultant, contractor, or bidding organisation.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="counterparty_ar">Counterparty · Arabic</Label>
          <Input
            id="counterparty_ar"
            name="counterparty_ar"
            dir="rtl"
            lang="ar"
            placeholder="سينر للهندسة"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="start_date">Start date</Label>
          <Input id="start_date" name="start_date" type="date" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="end_date">End date</Label>
          <Input id="end_date" name="end_date" type="date" />
        </div>
      </div>

      <div className="flex items-center gap-3 pt-2">
        <Button type="submit" disabled={pending}>
          {pending ? "Creating…" : "Create project"}
        </Button>
        <Link href="/projects">
          <Button variant="secondary" type="button">
            Cancel
          </Button>
        </Link>
      </div>
    </form>
  );
}
