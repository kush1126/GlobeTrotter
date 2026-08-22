import type { TripStop } from "../lib/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { X } from "lucide-react";
import { activitiesApi, formatPrice } from "../lib/api";
import { useAuth } from "../hooks/useAuth";

function dayIndexOf(dateStr: string, arrivalStr: string) {
  const date = new Date(dateStr);
  const arrival = new Date(arrivalStr);
  const diff = Math.floor((+date - +arrival) / 86400000);
  return Math.max(0, diff);
}

export default function ItineraryDayView({ stop, canEdit = true }: { stop: TripStop; canEdit?: boolean }) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const dayCount =
    Math.max(
      1,
      Math.round((+new Date(stop.departureDate) - +new Date(stop.arrivalDate)) / 86400000)
    ) + 1;

  const deleteActivity = useMutation({
    mutationFn: (activityId: string) => activitiesApi.remove(activityId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trip"] });
    },
  });

  const byDay: Record<number, typeof stop.activities> = {};
  for (let i = 0; i < dayCount; i++) byDay[i] = [];
  for (const activity of stop.activities) {
    const idx = Math.min(dayCount - 1, dayIndexOf(activity.date, stop.arrivalDate));
    byDay[idx].push(activity);
  }

  const total = stop.activities.reduce((sum, a) => sum + Number(a.estimatedCost), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-baseline justify-between pb-3 border-b border-paper-dim/80">
        <div>
          <span className="travel-stamp text-[9px]">Schedule</span>
          <h3 className="font-heading font-extrabold text-xl text-ink mt-0.5">
            Itinerary for {stop.city}
          </h3>
        </div>
        <span className="font-mono text-xs font-bold text-ochre bg-ochre-subtle px-3 py-1 rounded-full border border-ochre/20">
          {formatPrice(total, user?.currency)} Planned
        </span>
      </div>

      {stop.plannedBudget && (
        <div className="flex items-center justify-between p-3 bg-paper rounded-xl border border-paper-dim font-mono text-xs">
          <span className="text-ink-muted">Section Budget:</span>
          <span className="font-bold text-ink">
            {formatPrice(Number(stop.plannedBudget), user?.currency)}
            {total > Number(stop.plannedBudget) && (
              <span className="text-rust ml-2 font-bold">
                (Exceeded by {formatPrice(total - Number(stop.plannedBudget), user?.currency)})
              </span>
            )}
          </span>
        </div>
      )}

      <div className="space-y-6">
        {Array.from({ length: dayCount }).map((_, dayIdx) => (
          <div key={dayIdx} className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-route"></span>
              <p className="font-heading font-bold text-xs uppercase tracking-wider text-route">
                Day {dayIdx + 1}
              </p>
            </div>

            {byDay[dayIdx].length === 0 ? (
              <p className="font-body text-xs text-ink-muted/60 pl-4 py-1 italic">
                No activities scheduled for this day.
              </p>
            ) : (
              <div className="space-y-2 pl-4">
                {byDay[dayIdx].map((a) => (
                  <div
                    key={a.id}
                    className="group/item flex items-center justify-between gap-3 bg-paper border border-paper-dim/80 rounded-xl px-4 py-3 hover:border-route/40 transition-colors"
                  >
                    <div>
                      <p className="font-heading font-bold text-xs text-ink">{a.name}</p>
                      <span className="font-mono text-[10px] uppercase tracking-wider text-route font-semibold">
                        {a.category}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-ochre bg-paper-pure px-2.5 py-1 rounded-lg border border-paper-dim shadow-soft">
                        {formatPrice(a.estimatedCost, user?.currency)}
                      </span>

                      {canEdit && (
                        <button
                          onClick={() => deleteActivity.mutate(a.id)}
                          disabled={deleteActivity.isPending}
                          className="opacity-0 group-hover/item:opacity-100 p-1 rounded-md text-ink-muted hover:text-rust hover:bg-rust-subtle transition-all"
                          title="Remove activity"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
