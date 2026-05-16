export default function AppLoading() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      <div className="animate-pulse space-y-6">
        <div className="h-9 w-56 rounded-md bg-slate-200" />
        <div className="h-4 w-72 rounded bg-slate-100" />
        <div className="grid gap-4">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="h-20 rounded-xl border border-slate-200 bg-white"
            >
              <div className="flex h-full items-center gap-4 px-6">
                <span className="h-2.5 w-2.5 rounded-full bg-slate-200" />
                <span className="h-4 w-40 rounded bg-slate-200" />
                <span className="ml-auto h-3 w-24 rounded bg-slate-100" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
