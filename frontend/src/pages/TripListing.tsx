import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Search, Plus, Calendar, Trash2, AlertTriangle, MapPin } from "lucide-react";
import { tripsApi, type Trip } from "../lib/api";

function bucket(trip: Trip): "Ongoing" | "Upcoming" | "Completed" {
  const now = new Date();
  const start = new Date(trip.startDate);
  const end = new Date(trip.endDate);
  if (now < start) return "Upcoming";
  if (now > end) return "Completed";
  return "Ongoing";
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

export default function TripListing() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [tripToDelete, setTripToDelete] = useState<Trip | null>(null);

  const { data: trips, isLoading } = useQuery({
    queryKey: ["trips"],
    queryFn: () => tripsApi.list().then((r) => r.data),
  });

  const deleteTripMutation = useMutation({
    mutationFn: (id: string) => tripsApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trips"] });
      setTripToDelete(null);
    },
  });

  const filtered = (trips ?? []).filter((t) => t.title.toLowerCase().includes(search.toLowerCase()));
  const groups: Record<string, Trip[]> = { Ongoing: [], Upcoming: [], Completed: [] };
  for (const t of filtered) groups[bucket(t)].push(t);

  return (
    <main className="max-w-4xl mx-auto px-6 py-10 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="travel-stamp text-xs">Journeys Index</span>
          <h1 className="font-heading font-extrabold text-3xl sm:text-4xl text-ink tracking-tight mt-1">
            My Itineraries
          </h1>
        </div>
        <Link
          to="/trips/new"
          className="px-5 py-2.5 bg-route text-paper-pure font-heading text-xs font-bold rounded-xl hover:bg-route-dark transition-all shadow-sm flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Plan a New Trip</span>
        </Link>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 text-ink-muted absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          placeholder="Filter journeys by name…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="gt-input pl-10 text-xs"
        />
      </div>

      {isLoading && <p className="font-mono text-sm text-ink-muted animate-pulse">Loading journeys…</p>}

      {(["Ongoing", "Upcoming", "Completed"] as const).map((label) => (
        <section key={label} className="space-y-3">
          <div className="flex items-center gap-2">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                label === "Ongoing"
                  ? "bg-emerald-500"
                  : label === "Upcoming"
                  ? "bg-route"
                  : "bg-ink-faint"
              }`}
            />
            <h2 className="font-heading font-bold text-sm uppercase tracking-wider text-ink">
              {label} ({groups[label].length})
            </h2>
          </div>

          {groups[label].length === 0 ? (
            <div className="bg-paper-pure border border-dashed border-paper-dim rounded-2xl p-6 text-center text-xs text-ink-muted">
              No {label.toLowerCase()} journeys at this time.
            </div>
          ) : (
            <div className="space-y-3">
              {groups[label].map((t) => (
                <div
                  key={t.id}
                  className="group bg-paper-pure border border-paper-dim hover:border-route rounded-2xl p-5 shadow-soft hover:shadow-card transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <Link to={`/trips/${t.id}`} className="min-w-0 flex-1 block">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-heading font-bold text-lg text-ink group-hover:text-route transition-colors">
                        {t.title}
                      </h3>
                      {t.isPublic && (
                        <span className="font-mono text-[9px] font-bold uppercase text-ochre bg-ochre-subtle px-2 py-0.5 rounded-full">
                          Public
                        </span>
                      )}
                    </div>
                    <p className="font-mono text-xs text-ink-muted flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-ink-muted shrink-0" />
                      <span>
                        {t.stops.length > 0
                          ? `Stops: ${t.stops.map((s) => s.city).join(" → ")}`
                          : "No route sections added yet"}
                      </span>
                    </p>
                  </Link>

                  <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-paper-dim">
                    <span className="font-mono text-xs text-ink font-semibold bg-paper px-3 py-1.5 rounded-lg border border-paper-dim flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-ink-muted" />
                      <span>{formatDate(t.startDate)} → {formatDate(t.endDate)}</span>
                    </span>

                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setTripToDelete(t);
                      }}
                      className="p-2 rounded-xl text-ink-muted hover:text-rust hover:bg-rust-subtle transition-colors shrink-0"
                      title="Delete this trip"
                      aria-label="Delete trip"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      ))}

      {/* Delete Confirmation Modal */}
      {tripToDelete && (
        <div className="fixed inset-0 bg-ink/60 backdrop-blur-sm flex items-center justify-center p-6 z-50">
          <div className="bg-paper-pure border border-paper-dim rounded-2xl p-6 max-w-md w-full shadow-lift space-y-4">
            <div className="flex items-center gap-3 text-rust">
              <div className="w-10 h-10 rounded-full bg-rust-subtle flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-rust" />
              </div>
              <div>
                <h3 className="font-heading font-bold text-lg text-ink">Delete Journey</h3>
                <p className="text-xs text-ink-muted">This action cannot be undone.</p>
              </div>
            </div>

            <p className="text-xs text-ink-muted leading-relaxed">
              Are you sure you want to permanently delete <strong className="text-ink">"{tripToDelete.title}"</strong> and all its stops, activities, and budget plans?
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setTripToDelete(null)}
                className="px-4 py-2 font-heading text-xs font-semibold text-ink-muted hover:text-ink transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleteTripMutation.isPending}
                onClick={() => deleteTripMutation.mutate(tripToDelete.id)}
                className="px-4 py-2 bg-rust hover:bg-rust-dark text-paper-pure font-heading text-xs font-bold rounded-xl transition-colors shadow-sm disabled:opacity-50"
              >
                {deleteTripMutation.isPending ? "Deleting…" : "Yes, Delete Trip"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
