import { Link } from "react-router-dom";
import { Calendar } from "lucide-react";
import type { Trip } from "../lib/api";

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
}

function fmtYear(d: string) {
  return new Date(d).toLocaleDateString("en-GB", { year: "numeric" });
}

export default function TripCard({ trip }: { trip: Trip }) {
  const cities = trip.stops.map((s) => s.city);
  const nights = Math.max(
    1,
    Math.round((+new Date(trip.endDate) - +new Date(trip.startDate)) / 86400000)
  );

  return (
    <Link to={`/trips/${trip.id}`} className="block group">
      <article className="ticket-stub rounded-2xl flex overflow-hidden shadow-soft group-hover:shadow-lift transition-all duration-300 border border-paper-dim">
        <div className="flex-1 p-6 min-w-0 bg-paper-pure">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-route bg-route-subtle px-2.5 py-0.5 rounded-full border border-route/20">
              {cities.length > 0 ? cities.join(" • ") : "No stops added"}
            </span>
            {trip.isPublic && (
              <span className="font-mono text-[10px] font-bold uppercase text-ochre bg-ochre-subtle px-2 py-0.5 rounded-full">
                Public
              </span>
            )}
          </div>
          <h3 className="font-heading font-bold text-xl text-ink truncate group-hover:text-route transition-colors mb-3">
            {trip.title}
          </h3>
          <div className="flex items-center gap-3 font-mono text-xs text-ink-muted">
            <span className="font-semibold text-ink flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-ink-muted" />
              {fmtDate(trip.startDate)} – {fmtDate(trip.endDate)} {fmtYear(trip.endDate)}
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-paper-dark" />
            <span>{nights} nights</span>
          </div>
        </div>
        <div className="w-[88px] flex flex-col items-center justify-center bg-paper-dim/60 shrink-0 border-l border-dashed border-paper-dark">
          <span className="font-heading font-extrabold text-sm uppercase text-ink rotate-90 whitespace-nowrap tracking-wider">
            {cities.length || 0} Stop{cities.length === 1 ? "" : "s"}
          </span>
        </div>
      </article>
    </Link>
  );
}
