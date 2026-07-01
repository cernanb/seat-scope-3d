"use client";

import type { KeyboardEvent } from "react";

import type { Auditorium, Row, Seat } from "@/lib/auditorium/types";
import { listSeats } from "@/lib/auditorium/geometry";

type SeatMapProps = {
  auditorium: Auditorium;
  selectedSeatLabel: string;
  onSelectSeat: (seat: Seat) => void;
};

// Matches the rendered size of a seat button (h-7 w-7), an aisle spacer
// (w-3), and the flex gap between every item in a row (gap-0.5). Rows with
// different seat counts need a shared, explicit width to center against -
// without it, a `justify-center` flex box that's wider than its own row
// (common once a row has more seats than the narrower rows around it)
// overflows asymmetrically toward the end side instead of staying centered.
const SEAT_WIDTH_PX = 28;
const AISLE_WIDTH_PX = 12;
const GAP_PX = 2;

function getRowContentWidthPx(row: Row): number {
  const itemCount = row.seatCount + row.aisleAfterSeatNumbers.length;
  const itemsWidthPx =
    row.seatCount * SEAT_WIDTH_PX +
    row.aisleAfterSeatNumbers.length * AISLE_WIDTH_PX;
  const gapsWidthPx = Math.max(itemCount - 1, 0) * GAP_PX;

  return itemsWidthPx + gapsWidthPx;
}

export function SeatMap({
  auditorium,
  selectedSeatLabel,
  onSelectSeat,
}: SeatMapProps) {
  const seats = listSeats(auditorium);
  const maxRowWidthPx = Math.max(
    ...auditorium.rows.map(getRowContentWidthPx),
  );

  return (
    <section
      aria-label="Seat selection"
      className="overflow-x-auto rounded-lg border border-zinc-200 bg-white p-5 shadow-sm"
    >
      <div
        role="grid"
        aria-label="Seat map"
        className="min-w-[46rem] space-y-2"
      >
        <div className="grid grid-cols-[2rem_1fr] items-center gap-3 mb-6">
          <div />
          <div
            aria-hidden="true"
            className="mx-auto h-8 rounded-sm border border-zinc-300 bg-zinc-100 text-center text-xs font-medium uppercase leading-8 tracking-wide text-zinc-500"
            style={{ width: maxRowWidthPx }}
          >
            Screen
          </div>
        </div>

        {auditorium.rows.map((row) => {
          const rowSeats = seats.filter((seat) => seat.rowLabel === row.label);

          return (
            <div
              key={row.label}
              role="row"
              aria-label={`Row ${row.label}`}
              className="grid grid-cols-[2rem_1fr] items-center gap-3"
            >
              <div className="text-center text-sm font-medium text-zinc-500">
                {row.label}
              </div>
              <div
                className="mx-auto flex items-center justify-center gap-0.5"
                style={{ width: maxRowWidthPx }}
              >
                {rowSeats.map((seat) => (
                  <SeatSlot
                    key={seat.label}
                    auditorium={auditorium}
                    seat={seat}
                    selectedSeatLabel={selectedSeatLabel}
                    onSelectSeat={onSelectSeat}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

type SeatSlotProps = {
  auditorium: Auditorium;
  seat: Seat;
  selectedSeatLabel: string;
  onSelectSeat: (seat: Seat) => void;
};

function SeatSlot({
  auditorium,
  seat,
  selectedSeatLabel,
  onSelectSeat,
}: SeatSlotProps) {
  const row = auditorium.rows[seat.rowIndex];
  const hasAisleAfter = row.aisleAfterSeatNumbers.includes(seat.seatNumber);

  return (
    <>
      <SeatButton
        auditorium={auditorium}
        seat={seat}
        isSelected={seat.label === selectedSeatLabel}
        onSelectSeat={onSelectSeat}
      />
      {hasAisleAfter ? (
        <span aria-hidden="true" className="block w-3 shrink-0" />
      ) : null}
    </>
  );
}

type SeatButtonProps = {
  auditorium: Auditorium;
  seat: Seat;
  isSelected: boolean;
  onSelectSeat: (seat: Seat) => void;
};

function SeatButton({
  auditorium,
  seat,
  isSelected,
  onSelectSeat,
}: SeatButtonProps) {
  const isAvailable = seat.availability === "available";

  return (
    <button
      type="button"
      aria-label={isAvailable ? seat.label : `${seat.label} unavailable`}
      aria-pressed={isAvailable ? isSelected : undefined}
      disabled={!isAvailable}
      data-seat-label={seat.label}
      onClick={() => onSelectSeat(seat)}
      onKeyDown={(event) => handleSeatKeyDown(event, auditorium, seat)}
      className={getSeatButtonClassName(isAvailable, isSelected)}
    >
      {seat.seatNumber}
    </button>
  );
}

function handleSeatKeyDown(
  event: KeyboardEvent<HTMLButtonElement>,
  auditorium: Auditorium,
  seat: Seat,
) {
  const nextSeat = getNextKeyboardSeat(auditorium, seat, event.key);

  if (!nextSeat) {
    return;
  }

  event.preventDefault();
  const nextButton = document.querySelector<HTMLButtonElement>(
    `[data-seat-label="${nextSeat.label}"]`,
  );
  nextButton?.focus();
}

function getNextKeyboardSeat(
  auditorium: Auditorium,
  seat: Seat,
  key: string,
): Seat | undefined {
  if (key === "ArrowLeft") {
    return findSeatInRow(auditorium, seat.rowIndex, seat.seatNumber, -1);
  }

  if (key === "ArrowRight") {
    return findSeatInRow(auditorium, seat.rowIndex, seat.seatNumber, 1);
  }

  if (key === "ArrowUp") {
    return findSeatInColumn(auditorium, seat.rowIndex, seat.seatNumber, -1);
  }

  if (key === "ArrowDown") {
    return findSeatInColumn(auditorium, seat.rowIndex, seat.seatNumber, 1);
  }

  return undefined;
}

function findSeatInRow(
  auditorium: Auditorium,
  rowIndex: number,
  seatNumber: number,
  direction: -1 | 1,
) {
  const seats = listSeats(auditorium);
  let nextSeatNumber = seatNumber + direction;

  while (nextSeatNumber > 0) {
    const nextSeat = seats.find(
      (seat) =>
        seat.rowIndex === rowIndex && seat.seatNumber === nextSeatNumber,
    );

    if (!nextSeat) {
      return undefined;
    }

    if (nextSeat.availability === "available") {
      return nextSeat;
    }

    nextSeatNumber += direction;
  }

  return undefined;
}

function findSeatInColumn(
  auditorium: Auditorium,
  rowIndex: number,
  seatNumber: number,
  direction: -1 | 1,
) {
  const seats = listSeats(auditorium);
  let nextRowIndex = rowIndex + direction;

  while (nextRowIndex >= 0 && nextRowIndex < auditorium.rows.length) {
    const nextSeat = seats.find(
      (seat) =>
        seat.rowIndex === nextRowIndex && seat.seatNumber === seatNumber,
    );

    if (nextSeat?.availability === "available") {
      return nextSeat;
    }

    nextRowIndex += direction;
  }

  return undefined;
}

function getSeatButtonClassName(isAvailable: boolean, isSelected: boolean) {
  const baseClassName =
    "h-7 w-7 shrink-0 rounded-md border text-[11px] font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:ring-offset-2";

  if (!isAvailable) {
    return `${baseClassName} cursor-not-allowed border-zinc-200 bg-zinc-100 text-zinc-400`;
  }

  if (isSelected) {
    return `${baseClassName} border-zinc-950 bg-zinc-950 text-white`;
  }

  return `${baseClassName} border-zinc-300 bg-white text-zinc-700 hover:border-zinc-600 hover:bg-zinc-100`;
}
