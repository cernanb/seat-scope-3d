import type { Auditorium } from "./types";
import { defaultScreenPresetId, findScreenPreset } from "./screen-presets";

const defaultScreenPreset = findScreenPreset(defaultScreenPresetId);

export const defaultAuditorium: Auditorium = {
  id: "medium-auditorium",
  name: "Medium Auditorium",
  unit: "meters",
  screen: defaultScreenPreset.screen,
  geometry: {
    ...defaultScreenPreset.geometry,
    seatSpacingMeters: 0.58,
    aisleWidthMeters: 0.95,
    rowElevationMeters: 0.28,
    seatCenterHeightMeters: 0.45,
    eyeHeightMeters: 1.2,
    eyeForwardOffsetMeters: 0.18,
  },
  rows: [
    {
      label: "A",
      seatCount: 18,
      aisleAfterSeatNumbers: [6, 12],
      unavailableSeatNumbers: [],
    },
    {
      label: "B",
      seatCount: 20,
      aisleAfterSeatNumbers: [6, 14],
      unavailableSeatNumbers: [3],
    },
    {
      label: "C",
      seatCount: 20,
      aisleAfterSeatNumbers: [6, 14],
      unavailableSeatNumbers: [],
    },
    {
      label: "D",
      seatCount: 20,
      aisleAfterSeatNumbers: [6, 14],
      unavailableSeatNumbers: [15],
    },
    {
      label: "E",
      seatCount: 20,
      aisleAfterSeatNumbers: [6, 14],
      unavailableSeatNumbers: [8, 9],
    },
    {
      label: "F",
      seatCount: 20,
      aisleAfterSeatNumbers: [6, 14],
      unavailableSeatNumbers: [],
    },
    {
      label: "G",
      seatCount: 20,
      aisleAfterSeatNumbers: [6, 14],
      unavailableSeatNumbers: [12],
    },
    {
      label: "H",
      seatCount: 20,
      aisleAfterSeatNumbers: [6, 14],
      unavailableSeatNumbers: [],
    },
    {
      label: "I",
      seatCount: 20,
      aisleAfterSeatNumbers: [6, 14],
      unavailableSeatNumbers: [5],
    },
    {
      label: "J",
      seatCount: 18,
      aisleAfterSeatNumbers: [6, 12],
      unavailableSeatNumbers: [],
    },
  ],
  defaultSeatLabel: "F10",
};
