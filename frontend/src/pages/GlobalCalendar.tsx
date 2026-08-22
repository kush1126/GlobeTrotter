import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";
import { globalCalendarApi, type CalendarTripSummary } from "../lib/api";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function ymd(d: Date) {
  return d.toISOString().slice(0, 10);
}

export default function GlobalCalendar() {
  const navigate = useNavigate();
  const [cursor, setCursor] = useState(new Date());
  const { data: trips } = useQuery({
    queryKey: ["calendar-mine"],
    queryFn: () => globalCalendarApi.mine().then((r) => r.data),
  });

  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const firstOfMonth = new Date(year, month, 1);
  const startOffset = firstOfMonth.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells: (Date | null)[] = [
    ...Array(startOffset).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => new Date(year, month, i + 1)),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  function tripsOnDay(date: Date): CalendarTripSummary[] {
    if (!trips) return [];
    const key = ymd(date);
    return trips.filter((t) => key >= t.startDate.slice(0, 10) && key <= t.endDate.slice(0, 10));
  }

  const monthLabel = cursor.toLocaleDateString("en-GB", { month: "long", year: "numeric" });

  return (
    <main className="max-w-4xl mx-auto px-6 py-10">
      <div className="mb-6">
        <span className="travel-stamp text-xs mb-2">Schedule Timeline</span>
        <h1 className="font-heading font-extrabold text-3xl sm:text-4xl text-ink tracking-tight">
          Global Calendar
        </h1>
        <p className="text-sm text-ink-muted mt-1">
          Every journey you own or collaborate on, organized across the months.
        </p>
      </div>

      <div className="border border-paper-dim rounded-2xl bg-paper-pure p-6 shadow-soft">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-paper-dim">
          <button
            onClick={() => setCursor(new Date(year, month - 1, 1))}
            className="p-2 border border-paper-dim rounded-xl hover:border-route hover:text-route transition-colors"
            aria-label="Previous month"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <h2 className="font-heading font-bold text-xl text-ink flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-route" />
            <span>{monthLabel}</span>
          </h2>
          <button
            onClick={() => setCursor(new Date(year, month + 1, 1))}
            className="p-2 border border-paper-dim rounded-xl hover:border-route hover:text-route transition-colors"
            aria-label="Next month"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1.5 mb-2">
          {WEEKDAYS.map((w) => (
            <div key={w} className="font-mono text-[10px] uppercase font-bold tracking-widest text-ink-muted text-center py-1">
              {w}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1.5">
          {cells.map((date, i) => {
            if (!date) return <div key={i} className="min-h-[72px] bg-paper-dim/30 rounded-xl" />;
            const dayTrips = tripsOnDay(date);
            return (
              <div key={i} className="min-h-[72px] border border-paper-dim rounded-xl p-2 flex flex-col gap-1 bg-paper-pure hover:border-paper-dark transition-colors">
                <span className="font-mono text-[11px] font-semibold text-ink-muted">{date.getDate()}</span>
                {dayTrips.slice(0, 2).map((t) => (
                  <button
                    key={t.id}
                    onClick={() => navigate(`/trips/${t.id}`)}
                    title={t.title}
                    className="font-mono text-[10px] font-semibold bg-route-subtle text-route border border-route/20 rounded-md px-1.5 py-0.5 truncate text-left hover:bg-route hover:text-paper-pure transition-colors"
                  >
                    {t.title}
                  </button>
                ))}
                {dayTrips.length > 2 && (
                  <span className="font-mono text-[9px] text-ink-muted font-bold">+{dayTrips.length - 2} more</span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}
