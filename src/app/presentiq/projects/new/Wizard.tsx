"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardBody, CardHeader } from "@/components/presentiq/ui/Card";
import { Button } from "@/components/presentiq/ui/Button";
import { Input, Label, Select, Textarea } from "@/components/presentiq/ui/Field";
import { Badge } from "@/components/presentiq/ui/Badge";

type Mode = {
  code: string;
  name: string;
  description: string;
};

const MODES: Mode[] = [
  { code: "corporate_boardroom", name: "Corporate Boardroom", description: "Decision-oriented deck for executives." },
  { code: "government_boardroom", name: "Government Boardroom", description: "Government executive committees." },
  { code: "rta_boardroom", name: "RTA Boardroom", description: "Premium UAE government mode (Arabic RTL ready)." },
  { code: "consulting_partner", name: "Consulting Partner", description: "Partner-grade client deliverables." },
  { code: "sales_pitch", name: "Sales Pitch", description: "Persuasion + value framing." },
  { code: "project_steering", name: "Project Steering", description: "Steering committee status & decisions." },
  { code: "technical_to_executive", name: "Technical → Executive", description: "Translate technical detail upward." },
  { code: "strategy_deck", name: "Strategy", description: "Vision, options, roadmap." },
  { code: "kpi_dashboard", name: "KPI Dashboard", description: "Performance & health views." },
  { code: "training", name: "Training", description: "Learning decks with bilingual narration." },
  { code: "investor_business_case", name: "Investor / Business Case", description: "Numbers + recommendation." },
  { code: "tender_proposal", name: "Tender / Proposal", description: "Bid response & methodology." },
];

export function Wizard() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Brief state
  const [mode, setMode] = useState<string>("corporate_boardroom");
  const [title, setTitle] = useState("");
  const [audience, setAudience] = useState("");
  const [objective, setObjective] = useState("");
  const [decision, setDecision] = useState("");
  const [language, setLanguage] = useState<"en" | "ar" | "bilingual">("en");
  const [confidentiality, setConfidentiality] = useState("internal");
  const [slideCount, setSlideCount] = useState(14);
  const [duration, setDuration] = useState(25);

  const [createdId, setCreatedId] = useState<string | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [filesUploaded, setFilesUploaded] = useState<string[]>([]);

  const next = () => setStep((s) => Math.min(s + 1, 6));
  const prev = () => setStep((s) => Math.max(s - 1, 0));

  async function createProject() {
    setBusy(true); setError(null);
    try {
      const res = await fetch("/api/presentiq/projects", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          title, audience, objective, decision_required: decision,
          language_mode: language, presentation_mode: mode,
          confidentiality_level: confidentiality,
          target_slide_count: slideCount, target_duration_min: duration,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error?.message ?? "create_failed");
      setCreatedId(data.project.id);
      next();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function uploadFiles() {
    if (!createdId || !files.length) return next();
    setBusy(true); setError(null);
    try {
      const fd = new FormData();
      for (const f of files) fd.append("file", f);
      const res = await fetch(`/api/presentiq/projects/${createdId}/files`, { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error?.message ?? "upload_failed");
      setFilesUploaded(data.items.map((i: any) => i.filename));
      next();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function generateBlueprint() {
    if (!createdId) return;
    setBusy(true); setError(null);
    try {
      const res = await fetch(`/api/presentiq/projects/${createdId}/blueprint`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error?.message ?? "blueprint_failed");
      next();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function generateDeck() {
    if (!createdId) return;
    setBusy(true); setError(null);
    try {
      const res = await fetch(`/api/presentiq/projects/${createdId}/slides`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error?.message ?? "generation_failed");
      router.push(`/presentiq/projects/${createdId}/editor`);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card>
      <CardHeader title={["Mode", "Brief", "Sources", "Brand", "Blueprint", "Generate", "Done"][step]} subtitle={`Step ${step + 1} of 7`} />
      <CardBody className="space-y-5">
        {error && (
          <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800">
            {error}
          </div>
        )}

        {step === 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {MODES.map((m) => (
              <button
                key={m.code}
                onClick={() => setMode(m.code)}
                className={`text-left rounded-xl border p-4 transition ${
                  mode === m.code ? "border-zinc-900 bg-zinc-50" : "border-zinc-200 bg-white hover:bg-zinc-50"
                }`}
              >
                <div className="font-medium text-zinc-900">{m.name}</div>
                <div className="text-xs text-zinc-500 mt-1">{m.description}</div>
                {m.code === "rta_boardroom" && <Badge tone="navy">Premium</Badge>}
              </button>
            ))}
          </div>
        )}

        {step === 1 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2"><Label>Title</Label><Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Q3 Steering Committee" /></div>
            <div><Label>Audience</Label><Input value={audience} onChange={(e) => setAudience(e.target.value)} placeholder="Executive Director" /></div>
            <div><Label>Language</Label>
              <Select value={language} onChange={(e) => setLanguage(e.target.value as any)}>
                <option value="en">English</option>
                <option value="ar">Arabic</option>
                <option value="bilingual">Bilingual</option>
              </Select>
            </div>
            <div className="sm:col-span-2"><Label>Objective</Label><Textarea rows={2} value={objective} onChange={(e) => setObjective(e.target.value)} placeholder="What outcome does this deck drive?" /></div>
            <div className="sm:col-span-2"><Label>Decision Required</Label><Input value={decision} onChange={(e) => setDecision(e.target.value)} placeholder="Approve Option 2 corrective plan" /></div>
            <div><Label>Slide count</Label><Input type="number" min={3} max={60} value={slideCount} onChange={(e) => setSlideCount(Number(e.target.value))} /></div>
            <div><Label>Duration (min)</Label><Input type="number" min={5} max={180} value={duration} onChange={(e) => setDuration(Number(e.target.value))} /></div>
            <div><Label>Confidentiality</Label>
              <Select value={confidentiality} onChange={(e) => setConfidentiality(e.target.value)}>
                <option value="public">Public</option>
                <option value="internal">Internal</option>
                <option value="confidential">Confidential</option>
                <option value="strictly_confidential">Strictly Confidential</option>
              </Select>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-3">
            <Label>Upload sources (PDF, DOCX, PPTX, XLSX, CSV, TXT)</Label>
            <input
              type="file"
              multiple
              onChange={(e) => setFiles(Array.from(e.target.files ?? []))}
              className="block w-full text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-zinc-900 file:px-4 file:py-2 file:text-white file:hover:bg-zinc-800"
            />
            {files.length > 0 && (
              <ul className="text-sm text-zinc-700 space-y-1">
                {files.map((f) => (<li key={f.name}>· {f.name} <span className="text-zinc-400">({Math.round(f.size / 1024)} kB)</span></li>))}
              </ul>
            )}
            {filesUploaded.length > 0 && (
              <div className="rounded-lg bg-emerald-50 border border-emerald-200 px-3 py-2 text-sm text-emerald-800">Uploaded: {filesUploaded.join(", ")}</div>
            )}
          </div>
        )}

        {step === 3 && (
          <div className="space-y-3 text-sm text-zinc-700">
            <p>The organisation's default brand kit will be used. Custom kits and template uploads can be configured under <span className="font-medium">Brand Kits</span>.</p>
            <Badge tone="navy">Mode preset: {mode.replace(/_/g, " ")}</Badge>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-3 text-sm text-zinc-700">
            <p>PresentIQ will run Intake → Evidence → Strategy → Storytelling → Slide Architect to produce a blueprint you can review.</p>
            <Button onClick={generateBlueprint} disabled={busy || !createdId}>{busy ? "Generating…" : "Generate blueprint"}</Button>
          </div>
        )}

        {step === 5 && (
          <div className="space-y-3 text-sm text-zinc-700">
            <p>Now PresentIQ will run Copywriter → Visual Designer → Data Viz → RTL → Translation → QA → Renderer.</p>
            <Button onClick={generateDeck} disabled={busy || !createdId}>{busy ? "Generating…" : "Generate deck"}</Button>
          </div>
        )}

        {step === 6 && <div className="text-sm text-zinc-700">Redirecting to editor…</div>}

        <div className="flex items-center justify-between pt-4 border-t border-zinc-100">
          <Button variant="ghost" onClick={prev} disabled={step === 0 || busy}>Back</Button>
          {step === 0 && <Button onClick={next} disabled={busy}>Continue</Button>}
          {step === 1 && <Button onClick={createProject} disabled={!title || busy}>{busy ? "Creating…" : "Create project"}</Button>}
          {step === 2 && <Button onClick={uploadFiles} disabled={busy}>{busy ? "Uploading…" : files.length ? "Upload & continue" : "Skip"}</Button>}
          {step === 3 && <Button onClick={next} disabled={busy}>Continue</Button>}
        </div>
      </CardBody>
    </Card>
  );
}
