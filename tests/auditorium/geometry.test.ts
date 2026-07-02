import { describe, expect, it } from "vitest";

import {
  calculateSeatMetrics,
  findSeatByLabel,
  getDefaultSeat,
  getSeatCenter,
  getViewingPosition,
  listRowPlacements,
  listSeats,
  resolveSelectableSeat,
} from "@/lib/auditorium/geometry";
import { defaultAuditorium } from "@/lib/auditorium/default-auditorium";
import { findScreenPreset } from "@/lib/auditorium/screen-presets";
import type { Auditorium } from "@/lib/auditorium/types";

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

describe("stadium seating sections", () => {
  // The default auditorium has 10 rows (A-J); this profile puts A-C on a
  // flat front floor and D-J on stadium tiers behind a cross-aisle.
  const stadiumAuditorium: Auditorium = {
    ...defaultAuditorium,
    seatingSections: [
      { rowCount: 3, riserHeightMeters: 0 },
      {
        rowCount: 7,
        riserHeightMeters: 0.45,
        stepUpMeters: 0.9,
        crossAisleDepthMeters: 1.8,
      },
    ],
  };
  const { rowSpacingMeters, frontClearanceMeters, eyeHeightMeters } =
    defaultAuditorium.geometry;

  it("reproduces the uniform rake exactly when no sections are defined", () => {
    const placements = listRowPlacements(defaultAuditorium);

    placements.forEach((placement, rowIndex) => {
      expect(placement.floorElevationMeters).toBeCloseTo(
        rowIndex * defaultAuditorium.geometry.rowElevationMeters,
      );
      expect(placement.rowCenterZMeters).toBeCloseTo(
        frontClearanceMeters + rowIndex * rowSpacingMeters,
      );
      expect(placement.crossAisleDepthBeforeMeters).toBe(0);
    });
  });

  it("keeps a flat front section level and normally spaced", () => {
    const placements = listRowPlacements(stadiumAuditorium);

    for (const rowIndex of [0, 1, 2]) {
      expect(placements[rowIndex].floorElevationMeters).toBe(0);
      expect(placements[rowIndex].rowCenterZMeters).toBeCloseTo(
        frontClearanceMeters + rowIndex * rowSpacingMeters,
      );
    }
  });

  it("steps up into the stadium section across the cross-aisle", () => {
    const placements = listRowPlacements(stadiumAuditorium);
    const lastFrontRow = placements[2];
    const firstStadiumRow = placements[3];

    expect(firstStadiumRow.floorElevationMeters).toBeCloseTo(0.9);
    expect(firstStadiumRow.crossAisleDepthBeforeMeters).toBe(1.8);
    expect(
      firstStadiumRow.rowCenterZMeters - lastFrontRow.rowCenterZMeters,
    ).toBeCloseTo(rowSpacingMeters + 1.8);
  });

  it("rises by the stadium riser height for every stadium row", () => {
    const placements = listRowPlacements(stadiumAuditorium);

    for (let rowIndex = 4; rowIndex < placements.length; rowIndex += 1) {
      expect(
        placements[rowIndex].floorElevationMeters -
          placements[rowIndex - 1].floorElevationMeters,
      ).toBeCloseTo(0.45);
      expect(
        placements[rowIndex].rowCenterZMeters -
          placements[rowIndex - 1].rowCenterZMeters,
      ).toBeCloseTo(rowSpacingMeters);
    }
  });

  it("raises the stadium eye position above the uniform-rake equivalent", () => {
    const backSeat = findSeatByLabel(stadiumAuditorium, "J10");

    if (!backSeat) {
      throw new Error("Expected test seat to exist.");
    }

    const stadiumEye = getViewingPosition(stadiumAuditorium, backSeat);
    const uniformEye = getViewingPosition(defaultAuditorium, backSeat);

    // 0.9 step + 6 stadium risers of 0.45 above the flat front section.
    expect(stadiumEye.y).toBeCloseTo(0.9 + 6 * 0.45 + eyeHeightMeters);
    expect(stadiumEye.y).toBeGreaterThan(uniformEye.y);
    expect(stadiumEye.z).toBeGreaterThan(uniformEye.z);
  });

  it("throws when section row counts don't cover every row exactly", () => {
    const mismatched: Auditorium = {
      ...defaultAuditorium,
      seatingSections: [{ rowCount: 4, riserHeightMeters: 0.3 }],
    };

    expect(() => listRowPlacements(mismatched)).toThrow(
      "The seating sections must cover every row exactly.",
    );
  });
});
