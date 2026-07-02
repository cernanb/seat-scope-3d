import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { SeatMap } from "@/components/seat-scope/SeatMap";
import { defaultAuditorium } from "@/lib/auditorium/default-auditorium";
import { findTheater } from "@/lib/auditorium/theaters";

describe("SeatMap", () => {
  it("separates stadium sections with a visible cross-aisle gap", () => {
    const stadiumTheater = findTheater(
      "regal-edwards-irvine-spectrum-auditorium-12-imax",
    );

    render(
      <SeatMap
        auditorium={stadiumTheater}
        selectedSeatLabel={stadiumTheater.defaultSeatLabel}
        onSelectSeat={vi.fn()}
      />,
    );

    const rowD = screen.getByRole("row", { name: "Row D" });
    const rowB = screen.getByRole("row", { name: "Row B" });

    expect(rowD).toHaveAttribute("data-cross-aisle-before", "true");
    expect(rowB).not.toHaveAttribute("data-cross-aisle-before");
  });

  it("renders no cross-aisle gap for a uniformly raked auditorium", () => {
    render(
      <SeatMap
        auditorium={defaultAuditorium}
        selectedSeatLabel={defaultAuditorium.defaultSeatLabel}
        onSelectSeat={vi.fn()}
      />,
    );

    for (const row of screen.getAllByRole("row")) {
      expect(row).not.toHaveAttribute("data-cross-aisle-before");
    }
  });
});
