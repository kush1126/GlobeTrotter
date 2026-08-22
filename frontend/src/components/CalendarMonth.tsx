import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Activity } from "../lib/api";

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function ymd(d: Date) {
  return d.toISOString().slice(0, 10);
}

export default function CalendarMonth({
  activitiesByDate,
}: {
  activitiesByDate: Record<string, Activity[]>;
}) {
  const dates = Object.keys(activitiesByDate).sort();
  const initialMonth = dates.length > 0 ? new Date(dates[0]) : new Date();
  const [cursor, setCursor] = useState(new Date(initialMonth.getFullYear(), initialMonth.getMonth(), 1));
  const [selected, setSelected] = useState<string | null>(dates[0] ?? null);

  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const firstOfMonth = new Date(year, month, 1);
  // Monday-first offset
  const startOffset = (firstOfMonth.getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells: (Date | null)[] = [
    ...Array(startOffset).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => new Date(year, month, i + 1)),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const monthLabel = cursor.toLocaleDateString("en-GB", { month: "long", year: "numeric" });

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => setCursor(new Date(year, month - 1, 1))}
          className="p-1.5 border border-paper-dim rounded-lg hover:border-route hover:text-route transition-colors"
          aria-label="Previous month"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <h3 className="font-heading font-bold text-base text-ink">{monthLabel}</h3>
        <button
          onClick={() => setCursor(new Date(year, month + 1, 1))}
          className="p-1.5 border border-paper-dim rounded-lg hover:border-route hover:text-route transition-colors"
          aria-label="Next month"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-1">
        {WEEKDAYS.map((w) => (
          <div key={w} className="font-mono text-[10px] uppercase tracking-widest text-ink/40 text-center py-1">
            {w}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {cells.map((date, i) => {
          if (!date) return <div key={i} />;
          const key = ymd(date);
          const dayActivities = activitiesByDate[key] ?? [];
          const isSelected = key === selected;
          const dayTotal = dayActivities.reduce((s, a) => s + Number(a.estimatedCost), 0);

          return (
            <button
              key={i}
              onClick={() => dayActivities.length > 0 && setSelected(key)}
              disabled={dayActivities.length === 0}
              className={`aspect-square rounded-sm border p-1.5 flex flex-col items-start text-left transition-colors ${
                isSelected
                  ? "border-route bg-white shadow-sm"
                  : dayActivities.length > 0
                  ? "border-paper-dim bg-white hover:border-route-light"
                  : "border-transparent"
              } ${dayActivities.length === 0 ? "cursor-default" : "cursor-pointer"}`}
            >
              <span className={`font-mono text-[11px] ${dayActivities.length > 0 ? "text-ink" : "text-ink/30"}`}>
                {date.getDate()}
              </span>
              {dayActivities.length > 0 && (
                <>
                  <span className="w-1.5 h-1.5 rounded-full bg-route mt-auto" />
                  <span className="font-mono text-[9px] text-ochre">${dayTotal.toFixed(0)}</span>
                </>
              )}
            </button>
          );
        })}
      </div>

      {selected && activitiesByDate[selected] && (
        <div className="mt-6 border-t border-paper-dim pt-4">
          <p className="font-mono text-[11px] uppercase tracking-widest text-route mb-2">
            {new Date(selected).toLocaleDateString("en-GB", { weekday: "long", day: "2-digit", month: "long" })}
          </p>
          <ul className="space-y-2">
            {activitiesByDate[selected].map((a) => (
              <li key={a.id} className="flex items-center justify-between border-b border-paper-dim pb-2 last:border-0">
                <div>
                  <p className="text-sm text-ink">{a.name}</p>
                  <p className="font-mono text-[11px] text-ink/50 uppercase">
                    {a.startTime ? `${a.startTime} · ` : ""}
                    {a.category}
                  </p>
                </div>
                <span className="font-mono text-sm text-ochre">${Number(a.estimatedCost).toFixed(0)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {dates.length === 0 && (
        <p className="font-mono text-xs text-ink/50 text-center py-8">
          No dated activities yet — add some from a stop.
        </p>
      )}
    </div>
  );
}
