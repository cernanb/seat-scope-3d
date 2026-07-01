import { describe, expect, it } from "vitest";

import {
  calculateSeatMetrics,
  findSeatByLabel,
  getDefaultSeat,
  getSeatCenter,
  getViewingPosition,
  listSeats,
  resolveSelectableSeat,
} from "@/lib/auditorium/geometry";
import { defaultAuditorium } from "@/lib/auditorium/default-auditorium";
import { findScreenPreset } from "@/lib/auditorium/screen-presets";

describe("auditorium geometry", () => {
  it("numbers seats across aisle gaps without counting the aisles", () => {
    const row = defaultAuditorium.rows[0];
    const seats = listSeats(defaultAuditorium).filter(
      (seat) => seat.rowLabel === row.label,
    );

    expect(seats.map((seat) => seat.label)).toEqual(
      Array.from(
        { length: row.seatCount },
        (_, index) => `${row.label}${index + 1}`,
      ),
    );
  });

  it("finds unavailable seats but does not resolve them as selectable", () => {
    const unavailableSeat = findSeatByLabel(defaultAuditorium, "E9");

    expect(unavailableSeat?.availability).toBe("unavailable");
    expect(resolveSelectableSeat(defaultAuditorium, "E9").label).toBe(
      defaultAuditorium.defaultSeatLabel,
    );
  });

  it("falls back to the default selectable seat for unknown labels", () => {
    expect(resolveSelectableSeat(defaultAuditorium, "Z99").label).toBe(
      defaultAuditorium.defaultSeatLabel,
    );
  });

  it("places later rows farther from the screen and higher on the raked floor", () => {
    const frontSeat = findSeatByLabel(defaultAuditorium, "A10");
    const backSeat = findSeatByLabel(defaultAuditorium, "J10");

    if (!frontSeat || !backSeat) {
      throw new Error("Expected test seats to exist.");
    }

    const frontCenter = getSeatCenter(defaultAuditorium, frontSeat);
    const backCenter = getSeatCenter(defaultAuditorium, backSeat);

    expect(backCenter.z).toBeGreaterThan(frontCenter.z);
    expect(backCenter.y).toBeGreaterThan(frontCenter.y);
  });

  it("derives the viewing position above and forward from the selected seat", () => {
    const seat = getDefaultSeat(defaultAuditorium);
    const seatCenter = getSeatCenter(defaultAuditorium, seat);
    const viewingPosition = getViewingPosition(defaultAuditorium, seat);

    expect(viewingPosition.y).toBeGreaterThan(seatCenter.y);
    expect(viewingPosition.z).toBeLessThan(seatCenter.z);
  });

  it("calculates larger apparent screen size for a closer seat", () => {
    const frontMetrics = calculateSeatMetrics(defaultAuditorium, "B10");
    const backMetrics = calculateSeatMetrics(defaultAuditorium, "J10");

    expect(frontMetrics.horizontalViewingAngleDegrees).toBeGreaterThan(
      backMetrics.horizontalViewingAngleDegrees,
    );
    expect(frontMetrics.verticalViewingAngleDegrees).toBeGreaterThan(
      backMetrics.verticalViewingAngleDegrees,
    );
    expect(frontMetrics.distanceToScreenMeters).toBeLessThan(
      backMetrics.distanceToScreenMeters,
    );
  });

  it("keeps the front row close without exceeding an extreme viewing angle", () => {
    const frontMetrics = calculateSeatMetrics(defaultAuditorium, "A10");

    expect(frontMetrics.distanceToScreenMeters).toBeGreaterThanOrEqual(12);
    expect(frontMetrics.horizontalViewingAngleDegrees).toBeLessThanOrEqual(70);
    expect(frontMetrics.verticalViewingAngleDegrees).toBeLessThanOrEqual(35);
  });

  it("pushes the back row far enough from a giant screen to avoid an extreme angle", () => {
    const preset = findScreenPreset("imax-giant");
    const giantAuditorium = {
      ...defaultAuditorium,
      screen: preset.screen,
      geometry: { ...defaultAuditorium.geometry, ...preset.geometry },
    };

    const backMetrics = calculateSeatMetrics(giantAuditorium, "J9");

    expect(backMetrics.horizontalViewingAngleDegrees).toBeLessThanOrEqual(45);
    expect(backMetrics.verticalViewingAngleDegrees).toBeLessThanOrEqual(35);
  });
});
