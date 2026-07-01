import { describe, expect, it } from "vitest";

import {
  defaultScreenPresetId,
  findScreenPreset,
  screenPresets,
} from "@/lib/auditorium/screen-presets";

describe("screen presets", () => {
  it("finds a preset by id", () => {
    expect(findScreenPreset("imax-giant").screen.widthMeters).toBe(30);
  });

  it("falls back to the default preset for an unknown id", () => {
    expect(findScreenPreset("does-not-exist").id).toBe(defaultScreenPresetId);
  });

  it("falls back to the default preset when no id is given", () => {
    expect(findScreenPreset(null).id).toBe(defaultScreenPresetId);
    expect(findScreenPreset(undefined).id).toBe(defaultScreenPresetId);
  });

  it("orders every preset screen from smallest to largest width", () => {
    const widths = screenPresets.map((preset) => preset.screen.widthMeters);
    const sortedWidths = [...widths].sort((a, b) => a - b);

    expect(widths).toEqual(sortedWidths);
  });

  it("keeps the standard multiplex geometry unchanged", () => {
    const standard = findScreenPreset("standard");

    expect(standard.geometry.frontClearanceMeters).toBe(12);
    expect(standard.geometry.rowSpacingMeters).toBe(1.25);
  });

  it("pushes bigger screens farther back with proportionally larger clearance", () => {
    const widths = screenPresets.map(
      (preset) => preset.screen.widthMeters,
    );
    const frontClearances = screenPresets.map(
      (preset) => preset.geometry.frontClearanceMeters,
    );

    for (let index = 1; index < screenPresets.length; index += 1) {
      expect(widths[index]).toBeGreaterThan(widths[index - 1]);
      expect(frontClearances[index]).toBeGreaterThan(
        frontClearances[index - 1],
      );
    }
  });

  it("clamps row spacing to a realistic seat pitch range", () => {
    for (const preset of screenPresets) {
      expect(preset.geometry.rowSpacingMeters).toBeGreaterThanOrEqual(1);
      expect(preset.geometry.rowSpacingMeters).toBeLessThanOrEqual(2);
    }
  });

  it("matches the real IMAX Digital aspect ratio (1.90:1)", () => {
    const { widthMeters, heightMeters } = findScreenPreset("imax-digital").screen;

    expect(widthMeters / heightMeters).toBeCloseTo(1.9, 1);
  });

  it("matches the real 15/70mm IMAX aspect ratio (1.43:1)", () => {
    const { widthMeters, heightMeters } = findScreenPreset("imax-giant").screen;

    expect(widthMeters / heightMeters).toBeCloseTo(1.43, 1);
  });
});
