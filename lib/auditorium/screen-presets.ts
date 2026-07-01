import { scaleGeometryToScreenWidth } from "./geometry-constants";
import type { AuditoriumGeometry, Screen } from "./types";

export type ScreenPreset = {
  id: string;
  label: string;
  description: string;
  screen: Screen;
  geometry: Pick<AuditoriumGeometry, "frontClearanceMeters" | "rowSpacingMeters">;
};

export const screenPresets: ScreenPreset[] = [
  {
    id: "boutique",
    label: "Boutique",
    description: "9 x 4.9 m - small independent or arthouse screen",
    screen: { widthMeters: 9, heightMeters: 4.9, bottomHeightMeters: 1.2 },
    geometry: scaleGeometryToScreenWidth(9),
  },
  {
    id: "standard",
    label: "Standard multiplex",
    description: "14 x 6 m - typical multiplex auditorium",
    screen: { widthMeters: 14, heightMeters: 6, bottomHeightMeters: 1.4 },
    geometry: scaleGeometryToScreenWidth(14),
  },
  {
    id: "flagship",
    label: "Flagship large format",
    description: "20 x 8.5 m - large-format flagship auditorium",
    screen: { widthMeters: 20, heightMeters: 8.5, bottomHeightMeters: 1.6 },
    geometry: scaleGeometryToScreenWidth(20),
  },
  {
    id: "imax-digital",
    label: "IMAX Digital",
    // Digital IMAX's official aspect ratio is 1.90:1.
    description: "22 x 11.6 m - typical multiplex IMAX screen",
    screen: { widthMeters: 22, heightMeters: 11.6, bottomHeightMeters: 1.8 },
    geometry: scaleGeometryToScreenWidth(22),
  },
  {
    id: "imax-giant",
    label: "IMAX Giant Screen",
    // True 15/70mm IMAX's aspect ratio is 1.43:1.
    description: "30 x 21 m - true 15/70mm IMAX giant screen",
    screen: { widthMeters: 30, heightMeters: 21, bottomHeightMeters: 2.2 },
    geometry: scaleGeometryToScreenWidth(30),
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
