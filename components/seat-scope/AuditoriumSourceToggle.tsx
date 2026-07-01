"use client";

export type AuditoriumSource = "generic" | "theater";

type AuditoriumSourceToggleProps = {
  source: AuditoriumSource;
  onSourceChange: (source: AuditoriumSource) => void;
};

const options: Array<{ label: string; value: AuditoriumSource }> = [
  { label: "Screen size", value: "generic" },
  { label: "Real theater", value: "theater" },
];

export function AuditoriumSourceToggle({
  source,
  onSourceChange,
}: AuditoriumSourceToggleProps) {
  return (
    <div
      role="radiogroup"
      aria-label="Auditorium source"
      className="grid grid-cols-2 rounded-lg border border-zinc-200 bg-white p-1 shadow-sm"
    >
      {options.map((option) => {
        const isSelected = source === option.value;

        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={isSelected}
            onClick={() => onSourceChange(option.value)}
            className={
              isSelected
                ? "rounded-md bg-zinc-950 px-3 py-2 text-sm font-medium text-white"
                : "rounded-md px-3 py-2 text-sm font-medium text-zinc-600"
            }
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
