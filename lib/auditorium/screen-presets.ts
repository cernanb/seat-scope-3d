import type { AuditoriumGeometry, Screen } from "./types";

export type ScreenPreset = {
  id: string;
  label: string;
  description: string;
  screen: Screen;
  geometry: Pick<AuditoriumGeometry, "frontClearanceMeters" | "rowSpacingMeters">;
};

/**
 * THX rates ~36-40 degrees of horizontal field of view as the "ideal" front
 * row angle (26 degrees minimum acceptable); SMPTE recommends a more
 * conservative ~30 degrees. This app's standard multiplex preset already
 * seats the front row noticeably closer than either guideline for an
 * intentionally immersive front row. Rather than snap every preset to the
 * THX/SMPTE numbers directly (which would change the standard preset's
 * existing, already-tuned viewing angle), every other preset scales
 * front-of-room clearance and row-to-row spacing proportionally to screen
 * width relative to the standard screen, since distance for a fixed viewing
 * angle scales linearly with screen width. That keeps the same relative
 * viewing experience as screens get bigger instead of leaving every preset
 * crammed into the standard room depth.
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

function scaledGeometry(
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

export const screenPresets: ScreenPreset[] = [
  {
    id: "boutique",
    label: "Boutique",
    description: "9 x 4.9 m - small independent or arthouse screen",
    screen: { widthMeters: 9, heightMeters: 4.9, bottomHeightMeters: 1.2 },
    geometry: scaledGeometry(9),
  },
  {
    id: "standard",
    label: "Standard multiplex",
    description: "14 x 6 m - typical multiplex auditorium",
    screen: { widthMeters: 14, heightMeters: 6, bottomHeightMeters: 1.4 },
    geometry: scaledGeometry(14),
  },
  {
    id: "flagship",
    label: "Flagship large format",
    description: "20 x 8.5 m - large-format flagship auditorium",
    screen: { widthMeters: 20, heightMeters: 8.5, bottomHeightMeters: 1.6 },
    geometry: scaledGeometry(20),
  },
  {
    id: "imax-digital",
    label: "IMAX Digital",
    description: "22 x 12 m - typical multiplex IMAX screen",
    screen: { widthMeters: 22, heightMeters: 12, bottomHeightMeters: 1.8 },
    geometry: scaledGeometry(22),
  },
  {
    id: "imax-giant",
    label: "IMAX Giant Screen",
    description: "30 x 22 m - true 15/70mm IMAX giant screen",
    screen: { widthMeters: 30, heightMeters: 22, bottomHeightMeters: 2.2 },
    geometry: scaledGeometry(30),
  },
];

export const defaultScreenPresetId = "standard";

export function findScreenPreset(id: string | null | undefined): ScreenPreset {
  const preset = screenPresets.find((candidate) => candidate.id === id);

  if (preset) {
    return preset;
  }

  const fallback = screenPresets.find(
    (candidate) => candidate.id === defaultScreenPresetId,
  );

  if (!fallback) {
    throw new Error("The default screen preset must exist.");
  }

  return fallback;
}
