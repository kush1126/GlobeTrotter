import { Calendar } from "lucide-react";
import type { TripStop } from "../lib/api";

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
}

export default function RouteLine({
  stops,
  activeStopId,
  onSelect,
}: {
  stops: TripStop[];
  activeStopId: string | null;
  onSelect: (id: string) => void;
}) {
  if (stops.length === 0) {
    return (
      <div className="py-8 text-center border border-dashed border-paper-dim rounded-2xl">
        <p className="font-body text-xs text-ink-muted">
          No stops on the route yet — click "+ Add Stop" to add your first city.
        </p>
      </div>
    );
  }

  return (
    <div className="route-line pl-1">
      <ol className="space-y-4">
        {stops.map((stop) => {
          const active = stop.id === activeStopId;
          const cost = stop.activities.reduce((sum, a) => sum + Number(a.estimatedCost), 0);
          return (
            <li key={stop.id} className="flex items-start gap-3.5 relative">
              <button
                onClick={() => onSelect(stop.id)}
                className={`route-dot mt-3 transition-all ${
                  active ? "bg-route scale-110 shadow-sm" : "hover:bg-route-light/30"
                }`}
                aria-label={`Show ${stop.city}`}
              />
              <button onClick={() => onSelect(stop.id)} className="text-left flex-1 min-w-0">
                <div
                  className={`rounded-2xl border p-4 transition-all duration-200 ${
                    active
                      ? "border-route bg-route-subtle/50 shadow-soft"
                      : "border-paper-dim/60 bg-paper-pure hover:border-paper-dark"
                  }`}
                >
                  <div className="flex items-baseline justify-between gap-3">
                    <h4 className="font-heading font-bold text-base text-ink truncate">
                      {stop.city}
                      <span className="text-ink-muted text-xs font-normal ml-1.5 font-body">
                        {stop.country}
                      </span>
                    </h4>
                    <span className="font-mono text-xs font-bold text-ochre shrink-0">
                      ${cost.toFixed(0)}
                    </span>
                  </div>
                  <p className="font-mono text-[11px] text-ink-muted mt-1 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-ink-muted shrink-0" />
                    <span>{fmtDate(stop.arrivalDate)} → {fmtDate(stop.departureDate)}</span>
                    <span className="mx-1">•</span>
                    <span className="font-semibold text-ink">
                      {stop.activities.length} activit{stop.activities.length === 1 ? "y" : "ies"}
                    </span>
                  </p>
                </div>
              </button>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
