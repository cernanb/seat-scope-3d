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
import { findTheater, theaters } from "@/lib/auditorium/theaters";
import { AuditoriumPerspective } from "./AuditoriumPerspective";
import {
  AuditoriumSourceToggle,
  type AuditoriumSource,
} from "./AuditoriumSourceToggle";
import { ScreenSizeSelector } from "./ScreenSizeSelector";
import { SeatMetricsPanel } from "./SeatMetricsPanel";
import { SeatMap } from "./SeatMap";
import { TheaterSelector } from "./TheaterSelector";

const seatQueryParam = "seat";
const theaterQueryParam = "theater";

export function SeatScopeApp() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [auditoriumSource, setAuditoriumSource] = useState<AuditoriumSource>(
    () => (searchParams.get(theaterQueryParam) ? "theater" : "generic"),
  );
  const [theaterId, setTheaterId] = useState(
    () => findTheater(searchParams.get(theaterQueryParam)).id,
  );
  const [screenPresetId, setScreenPresetId] = useState(defaultScreenPresetId);
  const [selectedSeatLabel, setSelectedSeatLabel] = useState(() => {
    const initialAuditorium =
      auditoriumSource === "theater"
        ? findTheater(theaterId)
        : defaultAuditorium;

    return resolveSelectableSeat(
      initialAuditorium,
      searchParams.get(seatQueryParam),
    ).label;
  });

  const auditorium = useMemo(() => {
    if (auditoriumSource === "theater") {
      return findTheater(theaterId);
    }

    const preset = findScreenPreset(screenPresetId);

    return {
      ...defaultAuditorium,
      screen: preset.screen,
      geometry: { ...defaultAuditorium.geometry, ...preset.geometry },
    };
  }, [auditoriumSource, screenPresetId, theaterId]);

  const metrics = calculateSeatMetrics(auditorium, selectedSeatLabel);

  const handleSourceChange = (nextSource: AuditoriumSource) => {
    setAuditoriumSource(nextSource);
    setSelectedSeatLabel(
      nextSource === "theater"
        ? findTheater(theaterId).defaultSeatLabel
        : defaultAuditorium.defaultSeatLabel,
    );
  };

  const handleTheaterChange = (nextTheaterId: string) => {
    setTheaterId(nextTheaterId);
    setSelectedSeatLabel(findTheater(nextTheaterId).defaultSeatLabel);
  };

  useEffect(() => {
    const nextParams = new URLSearchParams(searchParams.toString());
    let didChange = false;

    if (nextParams.get(seatQueryParam) !== metrics.seat.label) {
      nextParams.set(seatQueryParam, metrics.seat.label);
      didChange = true;
    }

    if (auditoriumSource === "theater") {
      if (nextParams.get(theaterQueryParam) !== theaterId) {
        nextParams.set(theaterQueryParam, theaterId);
        didChange = true;
      }
    } else if (nextParams.has(theaterQueryParam)) {
      nextParams.delete(theaterQueryParam);
      didChange = true;
    }

    if (!didChange) {
      return;
    }

    router.replace(`${pathname}?${nextParams.toString()}`, { scroll: false });
  }, [auditoriumSource, metrics.seat.label, pathname, router, searchParams, theaterId]);

  return (
    <main className="flex min-h-screen flex-col gap-8 bg-zinc-50 px-6 py-8 text-zinc-950">
      <header className="mx-auto flex w-full max-w-7xl flex-col gap-2">
        <p className="text-sm font-medium uppercase tracking-wide text-zinc-500">
          Medium auditorium
        </p>
        <h1 className="text-4xl font-semibold">Seat Scope 3D</h1>
      </header>

      <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
        <SeatMap
          auditorium={auditorium}
          selectedSeatLabel={metrics.seat.label}
          onSelectSeat={(seat) => setSelectedSeatLabel(seat.label)}
        />

        <div className="space-y-4">
          <AuditoriumSourceToggle
            source={auditoriumSource}
            onSourceChange={handleSourceChange}
          />
          {auditoriumSource === "generic" ? (
            <ScreenSizeSelector
              presets={screenPresets}
              selectedPresetId={screenPresetId}
              onSelectPreset={setScreenPresetId}
            />
          ) : (
            <TheaterSelector
              theaters={theaters}
              selectedTheaterId={theaterId}
              onSelectTheater={handleTheaterChange}
            />
          )}
          <AuditoriumPerspective auditorium={auditorium} metrics={metrics} />
          <SeatMetricsPanel metrics={metrics} />
        </div>
      </div>
    </main>
  );
}
