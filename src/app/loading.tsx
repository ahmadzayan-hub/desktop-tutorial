// Streamed loading state for any route that force-dynamic and awaits data.
// Renders instantly on navigation while the server component is still on the wire.

export default function Loading() {
  return (
    <div
      className="mx-auto max-w-7xl animate-pulse"
      role="status"
      aria-label="Loading"
    >
      {/* Page header skeleton */}
      <div className="mb-5 border-b border-cream/60 pb-4">
        <div className="h-7 w-72 rounded-md bg-gray-200" />
        <div className="mt-2 h-4 w-96 max-w-full rounded bg-gray-100" />
      </div>

      {/* KPI row skeleton */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="card">
            <div className="h-7 w-24 rounded bg-gray-200" />
            <div className="mt-2 h-3 w-20 rounded bg-gray-100" />
          </div>
        ))}
      </div>

      {/* Content skeleton */}
      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <div className="card lg:col-span-2 h-64" />
        <div className="card h-64" />
      </div>

      <span className="sr-only">Loading…</span>
    </div>
  );
}
