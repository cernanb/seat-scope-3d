import { describe, expect, it } from "vitest";

import { calculateSeatMetrics, listSeats } from "@/lib/auditorium/geometry";
import {
  defaultTheaterId,
  findTheater,
  theaters,
} from "@/lib/auditorium/theaters";

describe("theaters", () => {
  it("gives every theater real-world metadata", () => {
    for (const theater of theaters) {
      expect(theater.theater?.name).toBeTruthy();
      expect(theater.theater?.city).toBeTruthy();
      expect(theater.theater?.sourceNote).toBeTruthy();
      expect(theater.theater?.sourceUrl).toMatch(/^https:\/\//);
    }
  });

  it("resolves each theater's default seat to an available seat in its own chart", () => {
    for (const theater of theaters) {
      const seats = listSeats(theater);
      const defaultSeat = seats.find(
        (seat) => seat.label === theater.defaultSeatLabel,
      );

      expect(defaultSeat).toBeDefined();
      expect(defaultSeat?.availability).toBe("available");
    }
  });

  it("keeps every theater's row spacing within the realistic seat-pitch range", () => {
    for (const theater of theaters) {
      expect(theater.geometry.rowSpacingMeters).toBeGreaterThanOrEqual(1);
      expect(theater.geometry.rowSpacingMeters).toBeLessThanOrEqual(2);
    }
  });

  it("computes plausible viewing metrics from each theater's default seat", () => {
    for (const theater of theaters) {
      const metrics = calculateSeatMetrics(theater, theater.defaultSeatLabel);

      expect(metrics.distanceToScreenMeters).toBeGreaterThan(0);
      expect(metrics.horizontalViewingAngleDegrees).toBeGreaterThan(0);
      expect(metrics.horizontalViewingAngleDegrees).toBeLessThan(90);
      expect(metrics.verticalViewingAngleDegrees).toBeGreaterThan(0);
      expect(metrics.verticalViewingAngleDegrees).toBeLessThan(90);
    }
  });

  it("finds a theater by id", () => {
    expect(findTheater("egyptian-theatre-hollywood").id).toBe(
      "egyptian-theatre-hollywood",
    );
  });

  it("falls back to the default theater for an unknown or missing id", () => {
    expect(findTheater("does-not-exist").id).toBe(defaultTheaterId);
    expect(findTheater(null).id).toBe(defaultTheaterId);
    expect(findTheater(undefined).id).toBe(defaultTheaterId);
  });
});
