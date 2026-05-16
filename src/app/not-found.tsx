import Link from "next/link";
import { NotFoundView } from "./not-found-view";

export default function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center bg-slate-50 px-6">
      <NotFoundView />
      <Link href="/" className="sr-only">
        Home
      </Link>
    </main>
  );
}
