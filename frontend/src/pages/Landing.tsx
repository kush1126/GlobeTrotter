import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Search, Plus, ArrowRight, Calendar, MapPin, Compass, Globe } from "lucide-react";
import { tripsApi } from "../lib/api";
import { useAuth } from "../hooks/useAuth";

const FEATURED_DESTINATIONS = [
  {
    city: "Jaipur",
    country: "India",
    tag: "Royal Heritage",
    image: "https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=600&q=80",
  },
  {
    city: "Varanasi",
    country: "India",
    tag: "Spiritual Ghats",
    image: "https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=600&q=80",
  },
  {
    city: "Goa",
    country: "India",
    tag: "Coastal Charm",
    image: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=600&q=80",
  },
  {
    city: "Tokyo",
    country: "Japan",
    tag: "Futuristic & Zen",
    image: "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=600&q=80",
  },
  {
    city: "Paris",
    country: "France",
    tag: "Art & Patisserie",
    image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=600&q=80",
  },
  {
    city: "Rome",
    country: "Italy",
    tag: "Ancient Wonders",
    image: "https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=600&q=80",
  },
];

export default function Landing() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  const { data: trips } = useQuery({
    queryKey: ["trips"],
    queryFn: () => tripsApi.list().then((r) => r.data),
  });

  const previousTrips = [...(trips ?? [])]
    .filter((t) => new Date(t.endDate) < new Date())
    .slice(0, 3);

  const upcomingTrips = [...(trips ?? [])]
    .filter((t) => new Date(t.endDate) >= new Date())
    .slice(0, 3);

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/discover?city=${encodeURIComponent(search.trim())}`);
    } else {
      navigate("/discover");
    }
  }

  return (
    <main className="max-w-6xl mx-auto px-6 py-10 space-y-12">
      {/* Hero Banner */}
      <div className="relative rounded-3xl bg-ink text-paper-pure p-8 sm:p-14 overflow-hidden border border-ink-light">
        <div className="relative z-10 max-w-2xl">
          <div className="flex items-center gap-2 mb-4">
            <span className="px-3 py-1 rounded-full bg-route/20 border border-route/40 text-route-light font-mono text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5" />
              Multi-City Itinerary Engine
            </span>
          </div>

          <h1 className="font-heading font-extrabold text-4xl sm:text-5xl tracking-tight text-paper-pure leading-tight mb-4">
            Where to next, <span className="text-route-light">{user?.name.split(" ")[0] || "Explorer"}</span>?
          </h1>

          <p className="text-sm sm:text-base text-paper-dim/80 mb-8 max-w-xl leading-relaxed">
            Build section-by-section multi-city itineraries, manage budgets, discover authentic experiences across global destinations, and collaborate seamlessly.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/trips/new"
              className="px-6 py-3 bg-route hover:bg-route-dark text-paper-pure font-heading text-sm font-bold rounded-xl transition-all shadow-sm flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Plan a New Trip</span>
            </Link>

            <Link
              to="/discover"
              className="px-6 py-3 bg-paper-pure/10 hover:bg-paper-pure/20 text-paper-pure border border-paper-pure/20 font-heading text-sm font-semibold rounded-xl transition-all flex items-center gap-2"
            >
              <Globe className="w-4 h-4" />
              <span>Browse Catalog</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Fast Search Toolbar */}
      <form
        onSubmit={handleSearchSubmit}
        className="bg-paper-pure border border-paper-dim rounded-2xl p-4 shadow-soft flex flex-col sm:flex-row items-center gap-3"
      >
        <div className="flex-1 w-full relative">
          <Search className="w-4 h-4 text-ink-muted absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search destination, city (e.g. Jaipur, Tokyo, Paris), or activities…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="gt-input pl-10 text-xs sm:text-sm"
          />
        </div>
        <button
          type="submit"
          className="w-full sm:w-auto px-6 py-2.5 bg-ink text-paper-pure font-heading text-xs font-bold rounded-xl hover:bg-route transition-colors shrink-0 flex items-center justify-center gap-2"
        >
          <Search className="w-3.5 h-3.5" />
          <span>Explore Places</span>
        </button>
      </form>

      {/* Top Regional Selections */}
      <section>
        <div className="flex items-center justify-between mb-5">
          <div>
            <span className="travel-stamp text-[10px]">Top Picks</span>
            <h2 className="font-heading font-extrabold text-2xl text-ink tracking-tight mt-1">
              Top Regional Selections
            </h2>
          </div>
          <Link
            to="/discover"
            className="font-heading text-xs font-bold text-route hover:text-route-dark flex items-center gap-1"
          >
            <span>View All Destinations</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {FEATURED_DESTINATIONS.map((d) => (
            <Link
              key={d.city}
              to={`/discover?city=${encodeURIComponent(d.city)}&country=${encodeURIComponent(d.country)}`}
              className="group relative rounded-2xl overflow-hidden aspect-[4/5] bg-paper-dim shadow-soft hover:shadow-card transition-all duration-300 flex flex-col justify-end p-4 border border-paper-dim"
            >
              <img
                src={d.image}
                alt={d.city}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-ink/50 backdrop-blur-[1px]"></div>
              <div className="relative z-10">
                <span className="font-mono text-[9px] font-bold text-ochre-light uppercase tracking-wider block mb-0.5">
                  {d.tag}
                </span>
                <h3 className="font-heading font-bold text-base text-paper-pure leading-tight">
                  {d.city}
                </h3>
                <p className="font-mono text-[10px] text-paper-dim uppercase">
                  {d.country}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Trips Section */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Upcoming / Active Trips */}
        <div className="bg-paper-pure rounded-2xl border border-paper-dim p-6 shadow-soft space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-heading font-bold text-lg text-ink">Upcoming Journeys</h3>
            <Link to="/trips" className="font-mono text-xs text-route font-semibold hover:underline">
              View all
            </Link>
          </div>

          <div className="space-y-3">
            {upcomingTrips.map((t) => (
              <Link
                key={t.id}
                to={`/trips/${t.id}`}
                className="block p-4 rounded-xl border border-paper-dim hover:border-route hover:bg-route-subtle transition-all group"
              >
                <p className="font-heading font-bold text-sm text-ink group-hover:text-route">
                  {t.title}
                </p>
                <p className="font-mono text-xs text-ink-muted mt-1.5 flex items-center gap-1.5 flex-wrap">
                  <Calendar className="w-3.5 h-3.5 text-ink-muted shrink-0" />
                  <span>
                    {new Date(t.startDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short" })} →{" "}
                    {new Date(t.endDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                  </span>
                  <span>•</span>
                  <span className="text-route font-semibold flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {t.stops.length} stops
                  </span>
                </p>
              </Link>
            ))}

            {upcomingTrips.length === 0 && (
              <div className="p-8 text-center border border-dashed border-paper-dim rounded-xl">
                <p className="text-xs text-ink-muted mb-3">No upcoming trips planned yet.</p>
                <Link
                  to="/trips/new"
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-route text-paper-pure rounded-xl font-heading text-xs font-bold hover:bg-route-dark transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Plan Your Next Trip</span>
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Previous Trips */}
        <div className="bg-paper-pure rounded-2xl border border-paper-dim p-6 shadow-soft space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-heading font-bold text-lg text-ink">Travel Memories</h3>
            <span className="font-mono text-xs text-ink-muted">Completed Trips</span>
          </div>

          <div className="space-y-3">
            {previousTrips.map((t) => (
              <Link
                key={t.id}
                to={`/trips/${t.id}`}
                className="block p-4 rounded-xl border border-paper-dim hover:border-ink transition-all group bg-paper"
              >
                <p className="font-heading font-bold text-sm text-ink group-hover:text-route">
                  {t.title}
                </p>
                <p className="font-mono text-xs text-ink-muted mt-1.5 flex items-center gap-1.5 flex-wrap">
                  <Calendar className="w-3.5 h-3.5 text-ink-muted shrink-0" />
                  <span>
                    {new Date(t.startDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                  </span>
                  <span>•</span>
                  <span>{t.stops.map((s) => s.city).join(", ") || "Completed route"}</span>
                </p>
              </Link>
            ))}

            {previousTrips.length === 0 && (
              <div className="p-8 text-center border border-dashed border-paper-dim rounded-xl">
                <p className="text-xs text-ink-muted">
                  Completed trips and past itineraries will be archived here.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
