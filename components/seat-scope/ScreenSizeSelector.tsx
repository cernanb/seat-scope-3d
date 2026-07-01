"use client";

import type { ScreenPreset } from "@/lib/auditorium/screen-presets";

type ScreenSizeSelectorProps = {
  presets: ScreenPreset[];
  selectedPresetId: string;
  onSelectPreset: (presetId: string) => void;
};

export function ScreenSizeSelector({
  presets,
  selectedPresetId,
  onSelectPreset,
}: ScreenSizeSelectorProps) {
  const selectedPreset = presets.find(
    (preset) => preset.id === selectedPresetId,
  );

  return (
    <div className="flex flex-col gap-1.5 rounded-lg border border-zinc-200 bg-white p-4 shadow-sm">
      <label
        htmlFor="screen-size-select"
        className="text-sm font-medium text-zinc-500"
      >
        Screen size
      </label>
      <select
        id="screen-size-select"
        value={selectedPresetId}
        onChange={(event) => onSelectPreset(event.target.value)}
        className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm font-medium text-zinc-950 shadow-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:ring-offset-2"
      >
        {presets.map((preset) => (
          <option key={preset.id} value={preset.id}>
            {preset.label}
          </option>
        ))}
      </select>
      {selectedPreset ? (
        <p className="text-xs text-zinc-500">{selectedPreset.description}</p>
      ) : null}
    </div>
  );
}
