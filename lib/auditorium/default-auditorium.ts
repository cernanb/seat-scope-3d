import type { Auditorium } from "./types";
import { baseGeometryErgonomics } from "./geometry-constants";
import { defaultScreenPresetId, findScreenPreset } from "./screen-presets";

const defaultScreenPreset = findScreenPreset(defaultScreenPresetId);

export const defaultAuditorium: Auditorium = {
  id: "medium-auditorium",
  name: "Medium Auditorium",
  unit: "meters",
  screen: defaultScreenPreset.screen,
  geometry: {
    ...baseGeometryErgonomics,
    ...defaultScreenPreset.geometry,
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
