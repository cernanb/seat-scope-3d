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
      className="flex min-h-screen items-center justify-center bg-house px-6 text-projection"
    >
      <p className="text-sm font-medium text-dust">Dimming the lights...</p>
    </main>
  );
}
