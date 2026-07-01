"use client";

import type { Auditorium } from "@/lib/auditorium/types";

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
    <div className="flex flex-col gap-1.5 rounded-lg border border-zinc-200 bg-white p-4 shadow-sm">
      <label
        htmlFor="theater-select"
        className="text-sm font-medium text-zinc-500"
      >
        Theater
      </label>
      <select
        id="theater-select"
        value={selectedTheaterId}
        onChange={(event) => onSelectTheater(event.target.value)}
        className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm font-medium text-zinc-950 shadow-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:ring-offset-2"
      >
        {theaters.map((theater) => (
          <option key={theater.id} value={theater.id}>
            {theater.theater?.name ?? theater.name}
          </option>
        ))}
      </select>
      {theaterInfo ? (
        <div className="space-y-1 text-xs text-zinc-500">
          <p>
            {theaterInfo.city} - {theaterInfo.screenFormatLabel}
          </p>
          <p className="italic">
            {theaterInfo.sourceNote}{" "}
            <a
              href={theaterInfo.sourceUrl}
              target="_blank"
              rel="noreferrer"
              className="not-italic underline"
            >
              Source
            </a>
          </p>
        </div>
      ) : null}
    </div>
  );
}
