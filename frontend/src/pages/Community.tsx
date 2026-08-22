import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Search, Plus, Globe, Users } from "lucide-react";
import { communityApi } from "../lib/api";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

export default function Community() {
  const [search, setSearch] = useState("");
  const { data: trips, isLoading } = useQuery({
    queryKey: ["community", search],
    queryFn: () => communityApi.list(search || undefined).then((r) => r.data),
  });

  return (
    <main className="max-w-5xl mx-auto px-6 py-10">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-6">
          <div>
            <span className="travel-stamp text-xs">Public Explorer</span>
            <h1 className="font-heading font-extrabold text-3xl sm:text-4xl text-ink tracking-tight mt-1">
              Community Journeys
            </h1>
            <p className="text-xs sm:text-sm text-ink-muted mt-1">
              Discover real itineraries crafted and shared by fellow globetrotters.
            </p>
          </div>

          {/* Search bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-ink-muted absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search community trips, destinations, or creators…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="gt-input pl-10 text-xs"
            />
          </div>

          {isLoading && <p className="font-mono text-xs text-ink-muted animate-pulse">Loading community routes…</p>}

          <div className="space-y-3">
            {trips?.map((t) => (
              <Link
                key={t.id}
                to={`/public/${t.shareToken}`}
                className="group flex items-start gap-4 border border-paper-dim bg-paper-pure rounded-2xl p-5 shadow-soft hover:shadow-card hover:border-route transition-all"
              >
                <div className="w-10 h-10 rounded-full bg-route-subtle border border-route/20 text-route font-bold text-sm flex items-center justify-center shrink-0 font-heading">
                  {t.user.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-heading font-bold text-base text-ink group-hover:text-route transition-colors truncate">
                      {t.title}
                    </h3>
                    <span className="font-mono text-[11px] text-ink-muted shrink-0">
                      {formatDate(t.startDate)}
                    </span>
                  </div>
                  <p className="font-mono text-xs text-ink-muted mt-1">
                    Shared by <span className="font-semibold text-ink">{t.user.name}</span>
                    {t.stops.length > 0 && ` • ${t.stops.map((s) => s.city).join(" → ")}`}
                  </p>
                </div>
              </Link>
            ))}

            {trips?.length === 0 && !isLoading && (
              <div className="bg-paper-pure border border-dashed border-paper-dim rounded-2xl p-12 text-center text-xs text-ink-muted">
                No public trips match that search yet. Be the first to share an itinerary with the community!
              </div>
            )}
          </div>
        </div>

        <aside className="lg:col-span-4 space-y-4">
          <div className="bg-paper-pure border border-paper-dim rounded-2xl p-6 shadow-soft space-y-3">
            <span className="font-mono text-[10px] uppercase font-bold tracking-wider text-route flex items-center gap-1">
              <Users className="w-3.5 h-3.5" />
              <span>About Community</span>
            </span>
            <h3 className="font-heading font-bold text-base text-ink">
              Open Travel Sharing
            </h3>
            <p className="text-xs text-ink-muted leading-relaxed">
              Community showcases publicly shared journeys from explorers worldwide. You can view their full stop-by-stop routes, activity selections, and estimated costs.
            </p>
            <div className="pt-2 border-t border-paper-dim">
              <Link
                to="/trips/new"
                className="flex items-center justify-center gap-1.5 w-full py-2 bg-ink hover:bg-route text-paper-pure font-heading text-xs font-bold rounded-xl transition-colors shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Publish a Journey</span>
              </Link>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}
