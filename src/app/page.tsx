export default function HomePage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-16">
      <h1 className="text-4xl font-bold tracking-tight">
        Turn rough ideas into perfectly engineered prompts.
      </h1>
      <p className="mt-4 text-lg text-slate-600">
        Prompt Orchestrator detects your intent, asks the right clarification questions,
        then rebuilds your prompt for ChatGPT, Claude, or Copilot.
      </p>
      <div className="mt-8 flex gap-3">
        <a href="/workspace" className="btn-primary">Open Workspace</a>
        <a href="/templates" className="btn-ghost border border-slate-300">Browse Templates</a>
      </div>
      <div className="mt-12 grid sm:grid-cols-3 gap-4">
        <div className="card">
          <div className="font-medium">1. Drop your raw prompt</div>
          <p className="text-sm text-slate-600 mt-1">Type whatever you have in mind.</p>
        </div>
        <div className="card">
          <div className="font-medium">2. Answer a few questions</div>
          <p className="text-sm text-slate-600 mt-1">We surface only the gaps that matter.</p>
        </div>
        <div className="card">
          <div className="font-medium">3. Copy a polished prompt</div>
          <p className="text-sm text-slate-600 mt-1">Formatted for your target AI model.</p>
        </div>
      </div>
    </div>
  );
}
