export type ViewMode = "seats" | "perspective";

type ViewModeTabsProps = {
  viewMode: ViewMode;
  onViewModeChange: (viewMode: ViewMode) => void;
};

const viewModes: Array<{ label: string; value: ViewMode }> = [
  { label: "Seats", value: "seats" },
  { label: "Perspective", value: "perspective" },
];

export function ViewModeTabs({
  viewMode,
  onViewModeChange,
}: ViewModeTabsProps) {
  return (
    <div
      role="tablist"
      aria-label="View mode"
      className="mx-auto grid w-full max-w-7xl grid-cols-2 rounded-lg border border-zinc-200 bg-white p-1 shadow-sm lg:hidden"
    >
      {viewModes.map((mode) => {
        const isSelected = viewMode === mode.value;

        return (
          <button
            key={mode.value}
            type="button"
            role="tab"
            aria-selected={isSelected}
            aria-controls={`${mode.value}-panel`}
            id={`${mode.value}-tab`}
            onClick={() => onViewModeChange(mode.value)}
            className={
              isSelected
                ? "rounded-md bg-zinc-950 px-3 py-2 text-sm font-medium text-white"
                : "rounded-md px-3 py-2 text-sm font-medium text-zinc-600"
            }
          >
            {mode.label}
          </button>
        );
      })}
    </div>
  );
}
