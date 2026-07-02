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
      className="grid grid-cols-2 gap-1 rounded-xl border border-line bg-velvet p-1"
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
                ? "rounded-lg bg-projection px-3 py-2 text-sm font-semibold text-house transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber focus-visible:ring-offset-2 focus-visible:ring-offset-velvet"
                : "rounded-lg px-3 py-2 text-sm font-medium text-dust transition-colors hover:text-projection focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber focus-visible:ring-offset-2 focus-visible:ring-offset-velvet"
            }
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
