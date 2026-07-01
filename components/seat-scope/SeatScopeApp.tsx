"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { defaultAuditorium } from "@/lib/auditorium/default-auditorium";
import {
  calculateSeatMetrics,
  resolveSelectableSeat,
} from "@/lib/auditorium/geometry";
import {
  defaultScreenPresetId,
  findScreenPreset,
  screenPresets,
} from "@/lib/auditorium/screen-presets";
import { AuditoriumPerspective } from "./AuditoriumPerspective";
import { ScreenSizeSelector } from "./ScreenSizeSelector";
import { SeatMetricsPanel } from "./SeatMetricsPanel";
import { SeatMap } from "./SeatMap";
import { ViewModeTabs, type ViewMode } from "./ViewModeTabs";

const seatQueryParam = "seat";

export function SeatScopeApp() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlSeatLabel = searchParams.get(seatQueryParam);
  const [selectedSeatLabel, setSelectedSeatLabel] = useState(
    () => resolveSelectableSeat(defaultAuditorium, urlSeatLabel).label,
  );
  const [screenPresetId, setScreenPresetId] = useState(defaultScreenPresetId);
  const [viewMode, setViewMode] = useState<ViewMode>("seats");

  const auditorium = useMemo(() => {
    const preset = findScreenPreset(screenPresetId);

    return {
      ...defaultAuditorium,
      screen: preset.screen,
      geometry: { ...defaultAuditorium.geometry, ...preset.geometry },
    };
  }, [screenPresetId]);

  const metrics = calculateSeatMetrics(auditorium, selectedSeatLabel);

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
      <header className="mx-auto flex w-full max-w-7xl flex-col gap-2">
        <p className="text-sm font-medium uppercase tracking-wide text-zinc-500">
          Medium auditorium
        </p>
        <h1 className="text-4xl font-semibold">Seat Scope 3D</h1>
      </header>

      <ViewModeTabs viewMode={viewMode} onViewModeChange={setViewMode} />

      <section className="mx-auto grid w-full max-w-7xl gap-6 lg:grid-cols-[minmax(20rem,0.55fr)_minmax(0,1fr)]">
        <div
          id="seats-panel"
          role="tabpanel"
          aria-labelledby="seats-tab"
          className={viewMode === "seats" ? "block" : "hidden lg:block"}
        >
          <SeatMap
            auditorium={auditorium}
            selectedSeatLabel={metrics.seat.label}
            onSelectSeat={(seat) => setSelectedSeatLabel(seat.label)}
          />
        </div>

        <div
          id="perspective-panel"
          role="tabpanel"
          aria-labelledby="perspective-tab"
          className={viewMode === "perspective" ? "block" : "hidden lg:block"}
        >
          <div className="space-y-4">
            <ScreenSizeSelector
              presets={screenPresets}
              selectedPresetId={screenPresetId}
              onSelectPreset={setScreenPresetId}
            />
            <AuditoriumPerspective auditorium={auditorium} metrics={metrics} />
            <SeatMetricsPanel metrics={metrics} />
          </div>
        </div>
      </section>
    </main>
  );
}
