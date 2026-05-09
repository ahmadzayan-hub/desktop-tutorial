import Link from "next/link";

export default function PresentIqHome() {
  return (
    <div className="space-y-12">
      <section className="text-center max-w-3xl mx-auto">
        <span className="inline-flex items-center rounded-full bg-zinc-900 text-white px-3 py-1 text-xs font-medium">
          AI Agent Platform · Editable PPTX · Arabic RTL · Brand Governance
        </span>
        <h1 className="mt-6 text-4xl md:text-5xl font-semibold tracking-tight text-zinc-900">
          From raw content to boardroom-ready presentation in minutes.
        </h1>
        <p className="mt-4 text-lg text-zinc-600">
          PresentIQ is an agentic workflow that combines brand governance, evidence-controlled
          generation, editable PPTX rendering, Arabic RTL, and a 10-dimension quality score —
          enforced automatically.
        </p>
        <div className="mt-8 flex items-center justify-center gap-3">
          <Link href="/presentiq/projects/new" className="rounded-xl bg-zinc-900 text-white px-5 py-3 font-medium hover:bg-zinc-800">
            Start a presentation
          </Link>
          <Link href="/presentiq/dashboard" className="rounded-xl border border-zinc-300 bg-white text-zinc-900 px-5 py-3 font-medium hover:bg-zinc-50">
            Open dashboard
          </Link>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { title: "Brand Governance", body: "Logos, fonts, colors, terminology, density and tone enforced before any visual is rendered." },
          { title: "Evidence-Controlled", body: "Every claim is classified — fact, assessment, estimate, or input required. We don't invent figures." },
          { title: "Editable PPTX", body: "Real text boxes, shapes, charts, tables, masters and speaker notes — not screenshots." },
          { title: "Arabic RTL", body: "Bilingual layouts, mirrored diagrams, formal corporate Arabic. UAE government-ready." },
          { title: "Boardroom Readiness", body: "10-dimension quality score, with recommendations. Know if it's ready for the CEO." },
          { title: "Slide-Level Regen", body: "Edit one slide without regenerating the deck. Lock approved slides. Audit everything." },
        ].map((f) => (
          <div key={f.title} className="rounded-2xl border border-zinc-200 bg-white p-6">
            <h3 className="font-semibold text-zinc-900">{f.title}</h3>
            <p className="text-sm text-zinc-600 mt-2">{f.body}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
