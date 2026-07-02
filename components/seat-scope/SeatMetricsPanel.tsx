import type { SeatMetrics } from "@/lib/auditorium/types";

type SeatMetricsPanelProps = {
  metrics: SeatMetrics;
  houseLine: string;
};

const metersToFeet = (meters: number) => meters * 3.28084;

/**
 * The seat summary rendered as an admit-one ticket stub, attached to the
 * bottom edge of the 3D view by a perforated seam. It is the one light
 * surface on the page and re-prints as the visitor picks seats.
 */
export function SeatMetricsPanel({ metrics, houseLine }: SeatMetricsPanelProps) {
  return (
    <section
      aria-label="Selected seat summary"
      className="relative rounded-b-2xl border border-t-0 border-line bg-projection text-ticket-ink"
    >
      <div
        aria-hidden="true"
        className="absolute inset-x-4 top-0 border-t-2 border-dashed border-house/35"
      />
      <div
        aria-hidden="true"
        className="absolute -left-2.5 -top-2.5 h-5 w-5 rounded-full bg-house"
      />
      <div
        aria-hidden="true"
        className="absolute -right-2.5 -top-2.5 h-5 w-5 rounded-full bg-house"
      />

      <div className="flex items-stretch gap-5 p-5 sm:gap-6">
        <div className="min-w-0 flex-1 space-y-4">
          <p className="truncate text-[11px] font-semibold uppercase tracking-[0.2em] text-ticket-ink/55">
            {houseLine}
          </p>

          <div className="flex flex-wrap items-end gap-x-8 gap-y-4">
            <div>
              <h2 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-ticket-ink/55">
                Your seat
              </h2>
              <p className="font-display text-6xl font-bold leading-[0.85]">
                {metrics.seat.label}
              </p>
            </div>

            <dl className="grid min-w-[17rem] flex-1 grid-cols-3 gap-x-4 gap-y-4">
              <div>
                <dt className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ticket-ink/55">
                  Distance
                </dt>
                <dd className="mt-1 font-mono text-lg font-medium leading-tight">
                  {metrics.distanceToScreenMeters.toFixed(1)} m
                  <span className="block font-mono text-xs text-ticket-ink/55">
                    {metersToFeet(metrics.distanceToScreenMeters).toFixed(0)} ft
                  </span>
                </dd>
              </div>
              <div>
                <dt className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ticket-ink/55">
                  Horizontal angle
                </dt>
                <dd className="mt-1 font-mono text-lg font-medium leading-tight">
                  {metrics.horizontalViewingAngleDegrees.toFixed(1)}&deg;
                  <span className="block font-mono text-xs text-ticket-ink/55">
                    of picture width
                  </span>
                </dd>
              </div>
              <div>
                <dt className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ticket-ink/55">
                  Vertical angle
                </dt>
                <dd className="mt-1 font-mono text-lg font-medium leading-tight">
                  {metrics.verticalViewingAngleDegrees.toFixed(1)}&deg;
                  <span className="block font-mono text-xs text-ticket-ink/55">
                    of picture height
                  </span>
                </dd>
              </div>
            </dl>
          </div>
        </div>

        <div
          aria-hidden="true"
          className="hidden shrink-0 border-l-2 border-dashed border-ticket-ink/20 sm:block"
        />
        <div
          aria-hidden="true"
          className="hidden shrink-0 items-center justify-center rounded-lg bg-amber px-1.5 sm:flex"
        >
          <span className="font-display text-base font-bold uppercase tracking-[0.35em] text-[#3a2202] [writing-mode:vertical-rl]">
            Admit one
          </span>
        </div>
      </div>
    </section>
  );
}
