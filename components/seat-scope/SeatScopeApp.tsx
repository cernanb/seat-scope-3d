"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { defaultAuditorium } from "@/lib/auditorium/default-auditorium";
import {
  calculateSeatMetrics,
  listSeats,
  resolveSelectableSeat,
} from "@/lib/auditorium/geometry";

const seatQueryParam = "seat";

export function SeatScopeApp() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const availableSeats = useMemo(
    () =>
      listSeats(defaultAuditorium).filter(
        (seat) => seat.availability === "available",
      ),
    [],
  );
  const urlSeatLabel = searchParams.get(seatQueryParam);
  const [selectedSeatLabel, setSelectedSeatLabel] = useState(
    () => resolveSelectableSeat(defaultAuditorium, urlSeatLabel).label,
  );

  const metrics = calculateSeatMetrics(defaultAuditorium, selectedSeatLabel);

  useEffect(() => {
    if (urlSeatLabel === metrics.seat.label) {
      return;
    }

    const nextParams = new URLSearchParams(searchParams.toString());
    nextParams.set(seatQueryParam, metrics.seat.label);
    router.replace(`${pathname}?${nextParams.toString()}`, { scroll: false });
  }, [metrics.seat.label, pathname, router, searchParams, urlSeatLabel]);

  return (
    <main className="flex min-h-screen flex-col gap-8 bg-zinc-50 px-6 py-8 text-zinc-950">
      <header className="mx-auto flex w-full max-w-6xl flex-col gap-2">
        <p className="text-sm font-medium uppercase tracking-wide text-zinc-500">
          Medium auditorium
        </p>
        <h1 className="text-4xl font-semibold">Seat Scope 3D</h1>
      </header>

      <section className="mx-auto grid w-full max-w-6xl gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(24rem,0.8fr)]">
        <div className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
          <label
            htmlFor="selected-seat"
            className="text-sm font-medium text-zinc-700"
          >
            Selected seat
          </label>
          <select
            id="selected-seat"
            value={metrics.seat.label}
            onChange={(event) =>
              setSelectedSeatLabel(
                resolveSelectableSeat(defaultAuditorium, event.target.value)
                  .label,
              )
            }
            className="mt-2 h-11 w-full rounded-md border border-zinc-300 bg-white px-3 text-base text-zinc-950"
          >
            {availableSeats.map((seat) => (
              <option key={seat.label} value={seat.label}>
                {seat.label}
              </option>
            ))}
          </select>
        </div>

        <section
          aria-label="Selected seat summary"
          className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm"
        >
          <h2 className="text-sm font-medium text-zinc-500">Selected seat</h2>
          <p className="mt-2 text-3xl font-semibold">{metrics.seat.label}</p>
          <dl className="mt-5 grid gap-4 text-sm text-zinc-600 sm:grid-cols-3">
            <div>
              <dt>Distance</dt>
              <dd className="mt-1 font-medium text-zinc-950">
                {metrics.distanceToScreenMeters.toFixed(1)} m
              </dd>
            </div>
            <div>
              <dt>Horizontal angle</dt>
              <dd className="mt-1 font-medium text-zinc-950">
                {metrics.horizontalViewingAngleDegrees.toFixed(1)} deg
              </dd>
            </div>
            <div>
              <dt>Vertical angle</dt>
              <dd className="mt-1 font-medium text-zinc-950">
                {metrics.verticalViewingAngleDegrees.toFixed(1)} deg
              </dd>
            </div>
          </dl>
        </section>
      </section>
    </main>
  );
}
