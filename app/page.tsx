import { Suspense } from "react";

import { SeatScopeApp } from "@/components/seat-scope/SeatScopeApp";

export default function Home() {
  return (
    <Suspense fallback={<SeatScopeFallback />}>
      <SeatScopeApp />
    </Suspense>
  );
}

function SeatScopeFallback() {
  return (
    <main
      aria-busy="true"
      className="flex min-h-screen items-center justify-center bg-zinc-50 px-6 text-zinc-950"
    >
      <p className="text-sm font-medium text-zinc-600">Loading seat scope...</p>
    </main>
  );
}
