import { useState, useMemo } from "react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { Star, MapPin, Plus, X, ArrowRight } from "lucide-react";
import { searchApi, tripsApi, stopsApi, formatPrice, type CatalogItem } from "../lib/api";
import { useAuth } from "../hooks/useAuth";

const CATEGORIES = [
  { id: "", label: "All Categories" },
  { id: "sightseeing", label: "Sightseeing" },
  { id: "food", label: "Food & Dining" },
  { id: "transport", label: "Transport" },
  { id: "stay", label: "Stays & Hotels" },
  { id: "other", label: "Experiences" },
];

export default function Discover() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [params, setParams] = useSearchParams();

  // Selected filters
  const [country, setCountry] = useState(params.get("country") ?? "");
  const [city, setCity] = useState(params.get("city") ?? "");
  const [category, setCategory] = useState(params.get("category") ?? "");
  const [searchQuery, setSearchQuery] = useState("");
  const [maxCost, setMaxCost] = useState<number | undefined>(undefined);
  const [sort, setSort] = useState("rating");
  const [addingTo, setAddingTo] = useState<CatalogItem | null>(null);

  // Fetch metadata for dropdowns
  const { data: meta } = useQuery({
    queryKey: ["search-meta"],
    queryFn: () => searchApi.meta().then((r) => r.data),
  });

  // Filter available cities based on selected country
  const availableCities = useMemo(() => {
    if (!meta?.cities) return [];
    if (!country) return meta.cities;
    return meta.cities.filter((c) => c.country.toLowerCase() === country.toLowerCase());
  }, [meta, country]);

  // Fetch activities with all filters
  const { data: results, isFetching } = useQuery({
    queryKey: ["catalog-search", country, city, category, maxCost, searchQuery],
    queryFn: () =>
      searchApi
        .activities({
          country: country || undefined,
          city: city || undefined,
          category: category || undefined,
          maxCost: maxCost || undefined,
          q: searchQuery || undefined,
        })
        .then((r) => r.data),
  });

  // Sort results
  const sorted = useMemo(() => {
    const list = [...(results ?? [])];
    if (sort === "rating") {
      return list.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
    }
    if (sort === "price-low") {
      return list.sort((a, b) => Number(a.avgCost) - Number(b.avgCost));
    }
    if (sort === "price-high") {
      return list.sort((a, b) => Number(b.avgCost) - Number(a.avgCost));
    }
    if (sort === "name") {
      return list.sort((a, b) => a.name.localeCompare(b.name));
    }
    return list;
  }, [results, sort]);

  // User trips for "Add to Trip" modal
  const { data: trips } = useQuery({
    queryKey: ["trips"],
    queryFn: () => tripsApi.list().then((r) => r.data),
  });

  const addToStop = useMutation({
    mutationFn: (vars: { stopId: string; item: CatalogItem }) =>
      stopsApi.addActivity(vars.stopId, {
        name: vars.item.name,
        category: vars.item.category,
        date: new Date().toISOString().slice(0, 10),
        estimatedCost: Number(vars.item.avgCost),
        currency: vars.item.currency || "USD",
        notes: vars.item.description ?? undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trip"] });
      setAddingTo(null);
    },
  });

  function handleCountryChange(newCountry: string) {
    setCountry(newCountry);
    setCity("");
    const newParams = new URLSearchParams(params);
    if (newCountry) newParams.set("country", newCountry);
    else newParams.delete("country");
    newParams.delete("city");
    setParams(newParams);
  }

  function handleCityChange(newCity: string) {
    setCity(newCity);
    const newParams = new URLSearchParams(params);
    if (newCity) newParams.set("city", newCity);
    else newParams.delete("city");
    setParams(newParams);
  }

  return (
    <main className="max-w-6xl mx-auto px-6 py-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="travel-stamp text-xs">Curated Catalog</span>
            <span className="font-mono text-xs text-route font-semibold tracking-wider uppercase">
              • {meta?.countries.length ?? 0} Countries &amp; {meta?.cities.length ?? 0} Cities
            </span>
          </div>
          <h1 className="font-heading font-extrabold text-3xl sm:text-4xl text-ink tracking-tight">
            Discover Global Destinations
          </h1>
          <p className="text-sm text-ink-muted mt-1 max-w-xl">
            Explore authentic attractions, culinary journeys, and cultural wonders across India, Japan, Europe, and beyond.
          </p>
        </div>
        <div className="font-mono text-xs text-ink-muted shrink-0 bg-paper-dim px-3 py-1.5 rounded-full">
          Showing <span className="font-bold text-ink">{sorted.length}</span> experiences
        </div>
      </div>

      {/* Control Panel / Filter Bar */}
      <div className="bg-paper-pure rounded-2xl border border-paper-dim p-5 shadow-soft mb-8 space-y-4">
        {/* Row 1: Country, City Dropdowns & Search Query */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Country Dropdown */}
          <div className="space-y-1">
            <label className="block font-mono text-[10px] uppercase tracking-wider text-ink-muted font-semibold">
              Select Country
            </label>
            <select
              value={country}
              onChange={(e) => handleCountryChange(e.target.value)}
              className="gt-input text-xs font-medium cursor-pointer"
            >
              <option value="">All Countries ({meta?.countries.length ?? 0})</option>
              {(meta?.countries ?? []).map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* City Dropdown Menu */}
          <div className="space-y-1">
            <label className="block font-mono text-[10px] uppercase tracking-wider text-ink-muted font-semibold">
              Search by City
            </label>
            <select
              value={city}
              onChange={(e) => handleCityChange(e.target.value)}
              className="gt-input text-xs font-medium cursor-pointer"
            >
              <option value="">
                {country ? `All Cities in ${country}` : `All Cities (${availableCities.length})`}
              </option>
              {availableCities.map((c) => (
                <option key={`${c.city}-${c.country}`} value={c.city}>
                  {c.city} {!country ? `(${c.country})` : ""}
                </option>
              ))}
            </select>
          </div>

          {/* Keyword Search */}
          <div className="space-y-1">
            <label className="block font-mono text-[10px] uppercase tracking-wider text-ink-muted font-semibold">
              Keywords / Activity
            </label>
            <input
              type="text"
              placeholder="e.g. Fort, Temple, Pasta, Boat…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="gt-input text-xs"
            />
          </div>

          {/* Sort By */}
          <div className="space-y-1">
            <label className="block font-mono text-[10px] uppercase tracking-wider text-ink-muted font-semibold">
              Sort By
            </label>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="gt-input text-xs font-medium cursor-pointer"
            >
              <option value="rating">Top Rated (Highest First)</option>
              <option value="price-low">Budget: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="name">Name (A–Z)</option>
            </select>
          </div>
        </div>

        {/* Row 2: Category Filter Badges & Quick Country Chips */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-paper-dim">
          {/* Category Chips */}
          <div className="flex flex-wrap items-center gap-1.5">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setCategory(cat.id)}
                className={`px-3 py-1 rounded-full font-heading text-xs font-semibold transition-all ${
                  category === cat.id
                    ? "bg-route text-paper-pure shadow-sm"
                    : "bg-paper text-ink-muted hover:text-ink hover:bg-paper-dim"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Quick Clear Button */}
          {(country || city || category || searchQuery || maxCost) && (
            <button
              onClick={() => {
                setCountry("");
                setCity("");
                setCategory("");
                setSearchQuery("");
                setMaxCost(undefined);
                setParams({});
              }}
              className="font-mono text-xs text-rust hover:underline flex items-center gap-1"
            >
              <X className="w-3.5 h-3.5" />
              <span>Reset filters</span>
            </button>
          )}
        </div>
      </div>

      {/* Loading Indicator */}
      {isFetching && (
        <div className="flex items-center justify-center py-10">
          <div className="font-mono text-xs text-route animate-pulse">Loading curated experiences…</div>
        </div>
      )}

      {/* Activities Grid with rich images */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sorted.map((item) => (
          <article
            key={item.id}
            className="group bg-paper-pure rounded-2xl border border-paper-dim overflow-hidden shadow-soft hover:shadow-lift transition-all duration-300 flex flex-col"
          >
            {/* Image Container */}
            <div className="relative aspect-[16/10] overflow-hidden bg-paper-dim">
              {item.imageUrl ? (
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-paper-dim text-ink-muted font-mono text-xs">
                  {item.city}
                </div>
              )}
              {/* Category Badge & Rating */}
              <div className="absolute top-3 left-3 flex items-center gap-1.5">
                <span className="px-2.5 py-1 rounded-full bg-ink/90 text-paper-pure font-mono text-[10px] font-semibold uppercase tracking-wider">
                  {item.category}
                </span>
              </div>
              <div className="absolute top-3 right-3 bg-paper-pure/95 px-2.5 py-1 rounded-full shadow-sm flex items-center gap-1 border border-paper-dim">
                <Star className="w-3.5 h-3.5 text-ochre fill-ochre" />
                <span className="font-mono text-xs font-bold text-ink">
                  {item.rating ? item.rating.toFixed(1) : "New"}
                </span>
              </div>
              {/* Location Tag */}
              <div className="absolute bottom-3 left-3 bg-paper-pure/95 px-2.5 py-1 rounded-full shadow-sm flex items-center gap-1.5 border border-paper-dim">
                <MapPin className="w-3 h-3 text-route" />
                <span className="font-heading font-semibold text-xs text-ink">
                  {item.city}, {item.country}
                </span>
              </div>
            </div>

            {/* Card Content */}
            <div className="p-5 flex-1 flex flex-col justify-between">
              <div>
                <h3 className="font-heading font-bold text-lg text-ink group-hover:text-route transition-colors line-clamp-1 mb-2">
                  {item.name}
                </h3>
                <p className="text-xs text-ink-muted line-clamp-2 leading-relaxed mb-4">
                  {item.description || "An authentic travel highlight recommended for your itinerary."}
                </p>
              </div>

              {/* Card Footer: Price & Action */}
              <div className="pt-4 border-t border-paper-dim flex items-center justify-between gap-3">
                <div className="flex flex-col">
                  <span className="font-mono text-[10px] uppercase text-ink-muted tracking-wider">
                    Est. Cost
                  </span>
                  <span className="font-mono font-bold text-base text-ochre">
                    {formatPrice(item.avgCost, user?.currency)} <span className="text-xs font-normal text-ink-muted">/ person</span>
                  </span>
                </div>

                <button
                  onClick={() => setAddingTo(item)}
                  className="px-3.5 py-2 bg-route-subtle hover:bg-route text-route hover:text-paper-pure rounded-xl font-heading text-xs font-bold transition-all duration-200 shadow-sm flex items-center gap-1.5 border border-route/20"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add to Trip</span>
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>

      {/* Empty State */}
      {sorted.length === 0 && !isFetching && (
        <div className="bg-paper-pure rounded-2xl border border-dashed border-paper-dim p-12 text-center max-w-md mx-auto my-12">
          <div className="w-12 h-12 rounded-full bg-paper-dim text-ink-muted flex items-center justify-center mx-auto mb-4">
            <MapPin className="w-6 h-6 text-ink-muted" />
          </div>
          <h3 className="font-heading font-bold text-lg text-ink mb-1">No experiences found</h3>
          <p className="text-xs text-ink-muted mb-6">
            Try adjusting your city, country, or category filters to explore more of the catalog.
          </p>
          <button
            onClick={() => {
              setCountry("");
              setCity("");
              setCategory("");
              setSearchQuery("");
              setParams({});
            }}
            className="px-4 py-2 bg-ink text-paper-pure rounded-xl font-heading text-xs font-semibold hover:bg-route transition-colors"
          >
            Show All Destinations
          </button>
        </div>
      )}

      {/* Add To Trip Modal */}
      {addingTo && (
        <div className="fixed inset-0 bg-ink/60 backdrop-blur-sm flex items-center justify-center p-6 z-50">
          <div className="bg-paper-pure border border-paper-dim rounded-2xl p-6 max-w-md w-full shadow-lift space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="travel-stamp text-[10px]">Add to Itinerary</span>
                <h3 className="font-heading font-bold text-xl text-ink mt-1">{addingTo.name}</h3>
                <p className="font-mono text-xs text-route font-semibold">
                  {addingTo.city}, {addingTo.country} • ${Number(addingTo.avgCost).toFixed(0)}
                </p>
              </div>
              <button
                onClick={() => setAddingTo(null)}
                className="w-8 h-8 rounded-full bg-paper flex items-center justify-center text-ink-muted hover:text-ink transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-ink-muted">
              Choose which trip and stop section to assign this activity to:
            </p>

            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {trips?.flatMap((t) => t.stops.map((s) => ({ trip: t, stop: s }))).map(({ trip, stop }) => (
                <button
                  key={stop.id}
                  onClick={() => addToStop.mutate({ stopId: stop.id, item: addingTo })}
                  disabled={addToStop.isPending}
                  className="w-full text-left p-3 border border-paper-dim rounded-xl hover:border-route hover:bg-route-subtle transition-all group disabled:opacity-50 flex items-center justify-between"
                >
                  <div>
                    <p className="font-heading font-bold text-xs text-ink group-hover:text-route">
                      {trip.title}
                    </p>
                    <p className="font-mono text-[11px] text-ink-muted">
                      Stop: <span className="font-semibold text-ink">{stop.city}</span> ({stop.country})
                    </p>
                  </div>
                  <span className="font-mono text-xs text-route opacity-0 group-hover:opacity-100 transition-opacity font-bold flex items-center gap-1">
                    <span>Add</span>
                    <ArrowRight className="w-3 h-3" />
                  </span>
                </button>
              ))}

              {(!trips || trips.length === 0 || trips.every((t) => t.stops.length === 0)) && (
                <div className="p-4 bg-paper rounded-xl text-center space-y-2">
                  <p className="text-xs text-ink-muted">
                    You don't have any trip stops created yet.
                  </p>
                  <a
                    href="/trips/new"
                    className="inline-flex items-center gap-1 font-heading text-xs font-bold text-route hover:underline"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Create a new trip first</span>
                  </a>
                </div>
              )}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setAddingTo(null)}
                className="px-4 py-2 font-heading text-xs font-semibold text-ink-muted hover:text-ink"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
