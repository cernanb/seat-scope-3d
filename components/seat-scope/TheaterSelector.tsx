"use client";

import type { Auditorium } from "@/lib/auditorium/types";
import { SelectChevron } from "./ScreenSizeSelector";

type TheaterSelectorProps = {
  theaters: Auditorium[];
  selectedTheaterId: string;
  onSelectTheater: (theaterId: string) => void;
};

export function TheaterSelector({
  theaters,
  selectedTheaterId,
  onSelectTheater,
}: TheaterSelectorProps) {
  const selectedTheater = theaters.find(
    (theater) => theater.id === selectedTheaterId,
  );
  const theaterInfo = selectedTheater?.theater;

  return (
    <div className="flex flex-col gap-1.5 rounded-xl border border-line bg-velvet p-4">
      <label
        htmlFor="theater-select"
        className="text-[11px] font-semibold uppercase tracking-[0.2em] text-dust"
      >
        Theater
      </label>
      <div className="relative max-w-xl">
        <select
          id="theater-select"
          value={selectedTheaterId}
          onChange={(event) => onSelectTheater(event.target.value)}
          className="w-full appearance-none rounded-lg border border-line-bright bg-velvet-deep px-3 py-2 pr-9 text-sm font-medium text-projection transition-colors hover:border-amber/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber focus-visible:ring-offset-2 focus-visible:ring-offset-velvet"
        >
          {theaters.map((theater) => (
            <option key={theater.id} value={theater.id}>
              {theater.theater?.name ?? theater.name}
            </option>
          ))}
        </select>
        <SelectChevron />
      </div>
      {theaterInfo ? (
        <div className="space-y-1 text-xs text-dust">
          <p>
            {theaterInfo.city} - {theaterInfo.screenFormatLabel}
          </p>
          <p className="italic">
            {theaterInfo.sourceNote}{" "}
            <a
              href={theaterInfo.sourceUrl}
              target="_blank"
              rel="noreferrer"
              className="not-italic underline decoration-line-bright underline-offset-2 transition-colors hover:text-projection"
            >
              Source
            </a>
          </p>
        </div>
      ) : null}
    </div>
  );
}
