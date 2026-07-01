import type { SeatMetrics } from "@/lib/auditorium/types";

type SeatMetricsPanelProps = {
  metrics: SeatMetrics;
};

export function SeatMetricsPanel({ metrics }: SeatMetricsPanelProps) {
  return (
    <section
      aria-label="Selected seat summary"
      className="min-h-[24rem] rounded-lg border border-zinc-200 bg-white p-5 shadow-sm"
    >
      <h2 className="text-sm font-medium text-zinc-500">Selected seat</h2>
      <p className="mt-2 text-3xl font-semibold">{metrics.seat.label}</p>
      <dl className="mt-5 grid gap-4 text-sm text-zinc-600 sm:grid-cols-3">
        <div>
          <dt>Distance</dt>
          <dd className="mt-1 font-medium text-zinc-950">
            {metrics.distanceToScreenMeters.toFixed(1)} m
          </dd>
        </div>
        <div>
          <dt>Horizontal angle</dt>
          <dd className="mt-1 font-medium text-zinc-950">
            {metrics.horizontalViewingAngleDegrees.toFixed(1)} deg
          </dd>
        </div>
        <div>
          <dt>Vertical angle</dt>
          <dd className="mt-1 font-medium text-zinc-950">
            {metrics.verticalViewingAngleDegrees.toFixed(1)} deg
          </dd>
        </div>
      </dl>
    </section>
  );
}
