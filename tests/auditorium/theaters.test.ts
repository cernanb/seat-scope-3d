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

  it("matches the real seating capacity for the Irvine Spectrum IMAX auditorium", () => {
    const theater = findTheater(
      "regal-edwards-irvine-spectrum-auditorium-12-imax",
    );
    const totalSeats = theater.rows.reduce(
      (sum, row) => sum + row.seatCount,
      0,
    );

    expect(totalSeats).toBe(387);
  });

  it("centers the Irvine Spectrum IMAX default seat exactly in its row", () => {
    const theater = findTheater(
      "regal-edwards-irvine-spectrum-auditorium-12-imax",
    );
    const rowJ = theater.rows.find((row) => row.label === "J");

    expect(rowJ?.seatCount).toBe(39);
    expect(theater.defaultSeatLabel).toBe("J20");
  });

  it("matches the confirmed exact row counts for the Irvine Spectrum IMAX auditorium", () => {
    const theater = findTheater(
      "regal-edwards-irvine-spectrum-auditorium-12-imax",
    );
    const seatCountByLabel = Object.fromEntries(
      theater.rows.map((row) => [row.label, row.seatCount]),
    );

    expect(seatCountByLabel.A).toBe(22);
    expect(seatCountByLabel.B).toBe(20);
    expect(seatCountByLabel.C).toBe(26);
  });

  it("splits the Irvine Spectrum IMAX auditorium's last row around a center gap", () => {
    const theater = findTheater(
      "regal-edwards-irvine-spectrum-auditorium-12-imax",
    );
    const rowM = theater.rows.find((row) => row.label === "M");

    expect(rowM?.seatCount).toBe(13);
    expect(rowM?.aisleAfterSeatNumbers).toEqual([6]);
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
