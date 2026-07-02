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
    <div className="flex flex-col gap-1.5 rounded-xl border border-line bg-velvet p-4">
      <label
        htmlFor="screen-size-select"
        className="text-[11px] font-semibold uppercase tracking-[0.2em] text-dust"
      >
        Screen size
      </label>
      <div className="relative max-w-xl">
        <select
          id="screen-size-select"
          value={selectedPresetId}
          onChange={(event) => onSelectPreset(event.target.value)}
          className="w-full appearance-none rounded-lg border border-line-bright bg-velvet-deep px-3 py-2 pr-9 text-sm font-medium text-projection transition-colors hover:border-amber/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber focus-visible:ring-offset-2 focus-visible:ring-offset-velvet"
        >
          {presets.map((preset) => (
            <option key={preset.id} value={preset.id}>
              {preset.label}
            </option>
          ))}
        </select>
        <SelectChevron />
      </div>
      {selectedPreset ? (
        <p className="text-xs text-dust">{selectedPreset.description}</p>
      ) : null}
    </div>
  );
}

export function SelectChevron() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 16 16"
      fill="none"
      className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-dust"
    >
      <path
        d="M4 6l4 4 4-4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
