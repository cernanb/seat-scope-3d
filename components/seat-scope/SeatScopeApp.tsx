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

  const eyebrowLabel =
    auditoriumSource === "theater" && auditorium.theater
      ? `${auditorium.theater.name} - ${auditorium.theater.city}`
      : findScreenPreset(screenPresetId).label;

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
    <main className="min-h-screen bg-house text-projection">
      <div className="mx-auto flex min-h-screen w-full max-w-[100rem] flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
        <header className="flex flex-col gap-4 border-b border-line pb-6 md:flex-row md:items-end md:justify-between">
          <div className="space-y-2">
            <h1 className="font-display text-5xl font-bold uppercase leading-none tracking-wide sm:text-6xl">
              Seat Scope 3D
            </h1>
            <p className="max-w-2xl text-sm text-dust">
              Check the view from any seat before the lights go down - real
              screen formats, real theaters, true sightlines.
            </p>
          </div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-dust">
            Now seating - {eyebrowLabel}
          </p>
        </header>

        <div className="flex flex-col gap-3 lg:flex-row lg:items-start">
          <div className="shrink-0 lg:w-80">
            <AuditoriumSourceToggle
              source={auditoriumSource}
              onSourceChange={handleSourceChange}
            />
          </div>
          <div className="min-w-0 flex-1">
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
          </div>
        </div>

        <div className="grid flex-1 items-start gap-6 xl:grid-cols-[minmax(0,24fr)_minmax(0,26fr)]">
          <div className="min-w-0 xl:sticky xl:top-6 xl:order-2">
            <AuditoriumPerspective auditorium={auditorium} metrics={metrics} />
            <SeatMetricsPanel metrics={metrics} houseLine={eyebrowLabel} />
          </div>
          <div className="min-w-0 xl:order-1">
            <SeatMap
              auditorium={auditorium}
              selectedSeatLabel={metrics.seat.label}
              onSelectSeat={(seat) => setSelectedSeatLabel(seat.label)}
            />
          </div>
        </div>

        <footer className="border-t border-line pt-4 text-xs text-dust">
          Brought to you by{" "}
          <a
            href="https://howtowatchfilm.com/"
            target="_blank"
            rel="noreferrer"
            className="underline decoration-line-bright underline-offset-2 transition-colors hover:text-projection"
          >
            How to Watch Film
          </a>
        </footer>
      </div>
    </main>
  );
}
