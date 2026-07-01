import type { AuditoriumGeometry } from "./types";

/**
 * Ergonomic constants shared by every Auditorium regardless of screen size
 * or whether it's modeled after a real Theater. These describe the seated
 * viewer and seat pitch, not the room's overall scale.
 */
export const baseGeometryErgonomics: Pick<
  AuditoriumGeometry,
  | "seatSpacingMeters"
  | "aisleWidthMeters"
  | "rowElevationMeters"
  | "seatCenterHeightMeters"
  | "eyeHeightMeters"
  | "eyeForwardOffsetMeters"
> = {
  seatSpacingMeters: 0.58,
  aisleWidthMeters: 0.95,
  rowElevationMeters: 0.28,
  seatCenterHeightMeters: 0.45,
  eyeHeightMeters: 1.2,
  eyeForwardOffsetMeters: 0.18,
};

/**
 * THX rates ~36-40 degrees of horizontal field of view as the "ideal" front
 * row angle (26 degrees minimum acceptable); SMPTE recommends a more
 * conservative ~30 degrees. This app's standard multiplex preset already
 * seats the front row noticeably closer than either guideline for an
 * intentionally immersive front row. Rather than snap every screen size to
 * the THX/SMPTE numbers directly (which would change the standard preset's
 * existing, already-tuned viewing angle), every other screen size scales
 * front-of-room clearance and row-to-row spacing proportionally to screen
 * width relative to the standard screen, since distance for a fixed viewing
 * angle scales linearly with screen width. That keeps the same relative
 * viewing experience as screens get bigger instead of leaving every screen
 * size crammed into the standard room depth.
 */
const referenceWidthMeters = 14;
const referenceFrontClearanceMeters = 12;
const referenceRowSpacingMeters = 1.25;

// Real stadium seating pitch rarely goes below ~1 m (legroom) or above ~2 m
// (generous premium recliner spacing), so row spacing is clamped to that
// range regardless of how the proportional scaling works out.
const minRowSpacingMeters = 1;
const maxRowSpacingMeters = 2;

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function roundTo(value: number, decimals: number) {
  const factor = 10 ** decimals;

  return Math.round(value * factor) / factor;
}

export function scaleGeometryToScreenWidth(
  widthMeters: number,
): Pick<AuditoriumGeometry, "frontClearanceMeters" | "rowSpacingMeters"> {
  const scale = widthMeters / referenceWidthMeters;

  return {
    frontClearanceMeters: roundTo(referenceFrontClearanceMeters * scale, 1),
    rowSpacingMeters: roundTo(
      clamp(
        referenceRowSpacingMeters * scale,
        minRowSpacingMeters,
        maxRowSpacingMeters,
      ),
      2,
    ),
  };
}
