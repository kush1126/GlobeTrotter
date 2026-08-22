import { useState, type FormEvent, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import { MapPin, Calendar, ArrowRight, Compass } from "lucide-react";
import { tripsApi, searchApi } from "../lib/api";

const POPULAR_DESTINATIONS = [
  { city: "Jaipur", country: "India", image: "https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=400&q=80" },
  { city: "Varanasi", country: "India", image: "https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=400&q=80" },
  { city: "Goa", country: "India", image: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=400&q=80" },
  { city: "Tokyo", country: "Japan", image: "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=400&q=80" },
  { city: "Paris", country: "France", image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=400&q=80" },
  { city: "Rome", country: "Italy", image: "https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=400&q=80" },
  { city: "Bali", country: "Indonesia", image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=400&q=80" },
  { city: "Interlaken", country: "Switzerland", image: "https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?auto=format&fit=crop&w=400&q=80" },
];

export default function CreateTrip() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [coverImage] = useState("");
  const [place, setPlace] = useState("Jaipur");
  const [country, setCountry] = useState("India");

  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 14);
    return d.toISOString().slice(0, 10);
  });
  const [endDate, setEndDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 21);
    return d.toISOString().slice(0, 10);
  });
  const [error, setError] = useState<string | null>(null);

  // Fetch search metadata
  const { data: meta } = useQuery({
    queryKey: ["search-meta"],
    queryFn: () => searchApi.meta().then((r) => r.data),
  });

  // Calculate duration in days
  const tripDuration = useMemo(() => {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diff = Math.round((+end - +start) / (1000 * 60 * 60 * 24));
    return diff >= 0 ? diff + 1 : 0;
  }, [startDate, endDate]);

  // Fetch live suggestions for selected place
  const { data: suggestions } = useQuery({
    queryKey: ["trip-suggestions", place, country],
    queryFn: () =>
      searchApi
        .activities({ city: place || undefined, country: country || undefined })
        .then((r) => r.data),
  });

  const createTrip = useMutation({
    mutationFn: () =>
      tripsApi.create({
        title: title || `Journey through ${place || "the World"}`,
        description: description || undefined,
        coverImage: coverImage || undefined,
        startDate,
        endDate,
      }),
    onSuccess: (res) => navigate(`/trips/${res.data.id}/build`),
    onError: () => setError("Couldn't create the trip — please check your dates."),
  });

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!startDate || !endDate) return;
    if (new Date(endDate) < new Date(startDate)) {
      setError("End date must be on or after start date.");
      return;
    }
    setError(null);
    createTrip.mutate();
  }

  return (
    <main className="max-w-4xl mx-auto px-6 py-10">
      <div className="mb-8">
        <span className="travel-stamp text-xs mb-2">Step 1 of 2</span>
        <h1 className="font-heading font-extrabold text-3xl sm:text-4xl text-ink tracking-tight">
          Plan a New Journey
        </h1>
        <p className="text-sm text-ink-muted mt-1">
          Set your journey title and dates. You'll build day-by-day stops and activities next.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
        {/* Form Container */}
        <form
          onSubmit={onSubmit}
          className="lg:col-span-7 bg-paper-pure rounded-2xl border border-paper-dim p-6 shadow-soft space-y-5"
        >
          {/* Trip Title */}
          <div>
            <label className="block font-mono text-[11px] uppercase tracking-wider text-ink-muted font-semibold mb-1.5">
              Trip Title
            </label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={`e.g. Royal Heritage of ${place || "Rajasthan"}`}
              className="gt-input font-medium text-sm"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block font-mono text-[11px] uppercase tracking-wider text-ink-muted font-semibold mb-1.5">
              Trip Description &amp; Theme (Optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Exploring ancient palaces, local heritage markets, and authentic culinary stops with family."
              className="gt-input resize-none h-16 text-xs"
            />
          </div>

          {/* Destination Dropdown */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-mono text-[11px] uppercase tracking-wider text-ink-muted font-semibold mb-1.5">
                Country
              </label>
              <select
                value={country}
                onChange={(e) => {
                  setCountry(e.target.value);
                  const firstInCountry = meta?.cities.find((c) => c.country === e.target.value);
                  if (firstInCountry) setPlace(firstInCountry.city);
                }}
                className="gt-input text-xs font-semibold cursor-pointer"
              >
                {(meta?.countries ?? ["India", "Japan", "France", "Italy", "Indonesia", "Switzerland"]).map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-mono text-[11px] uppercase tracking-wider text-ink-muted font-semibold mb-1.5">
                Primary City / Region
              </label>
              <select
                value={place}
                onChange={(e) => setPlace(e.target.value)}
                className="gt-input text-xs font-semibold cursor-pointer"
              >
                {(meta?.cities ?? [])
                  .filter((c) => !country || c.country.toLowerCase() === country.toLowerCase())
                  .map((c) => (
                    <option key={c.city} value={c.city}>
                      {c.city}
                    </option>
                  ))}
              </select>
            </div>
          </div>

          {/* Quick Destination Chips */}
          <div>
            <span className="block font-mono text-[10px] uppercase tracking-wider text-ink-muted mb-2 font-medium">
              Popular Destinations:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {POPULAR_DESTINATIONS.map((dest) => (
                <button
                  type="button"
                  key={dest.city}
                  onClick={() => {
                    setPlace(dest.city);
                    setCountry(dest.country);
                  }}
                  className={`px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all ${
                    place === dest.city
                      ? "bg-route text-paper-pure shadow-sm"
                      : "bg-paper text-ink-muted hover:text-ink hover:bg-paper-dim"
                  }`}
                >
                  {dest.city}, {dest.country}
                </button>
              ))}
            </div>
          </div>

          {/* Date Range Selection */}
          <div className="pt-3 border-t border-paper-dim space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-mono text-[11px] uppercase tracking-wider text-ink-muted font-semibold mb-1.5">
                  Departure Date (Start)
                </label>
                <input
                  type="date"
                  required
                  value={startDate}
                  onChange={(e) => {
                    setStartDate(e.target.value);
                    if (endDate && e.target.value > endDate) {
                      setEndDate(e.target.value);
                    }
                  }}
                  className="gt-input font-mono text-xs font-semibold"
                />
              </div>

              <div>
                <label className="block font-mono text-[11px] uppercase tracking-wider text-ink-muted font-semibold mb-1.5">
                  Return Date (End)
                </label>
                <input
                  type="date"
                  required
                  min={startDate}
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="gt-input font-mono text-xs font-semibold"
                />
              </div>
            </div>

            {/* Duration Badge */}
            {tripDuration > 0 && (
              <div className="flex items-center justify-between px-3.5 py-2 bg-route-subtle border border-route/20 rounded-xl font-mono text-xs text-route">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  Total Interval:
                </span>
                <span className="font-bold">
                  {tripDuration} Days ({tripDuration - 1} Nights)
                </span>
              </div>
            )}
          </div>

          {error && <p className="font-mono text-xs text-rust bg-rust-subtle p-2 rounded-lg">{error}</p>}

          <button
            type="submit"
            disabled={createTrip.isPending}
            className="w-full font-heading font-bold text-sm py-3 bg-route text-paper-pure rounded-xl hover:bg-route-dark transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <span>{createTrip.isPending ? "Creating Itinerary…" : "Continue to Build Sections & Stops"}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Live Suggestions Preview */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-heading font-bold text-base text-ink flex items-center gap-1.5">
              <Compass className="w-4 h-4 text-route" />
              Highlights in {place || country}
            </h2>
            <span className="font-mono text-[11px] text-route font-semibold">Live Catalog</span>
          </div>

          <div className="space-y-3">
            {(suggestions ?? []).slice(0, 3).map((s) => (
              <div
                key={s.id}
                className="bg-paper-pure border border-paper-dim rounded-xl p-3.5 shadow-soft flex items-center gap-3.5"
              >
                {s.imageUrl ? (
                  <img
                    src={s.imageUrl}
                    alt={s.name}
                    className="w-16 h-16 rounded-lg object-cover shrink-0"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-lg bg-paper-dim shrink-0 flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-ink-muted" />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1">
                    <span className="font-mono text-[10px] uppercase font-bold text-route">
                      {s.category}
                    </span>
                    <span className="font-mono text-xs font-bold text-ochre">
                      ${Number(s.avgCost).toFixed(0)}
                    </span>
                  </div>
                  <h3 className="font-heading font-bold text-xs text-ink truncate mt-0.5">{s.name}</h3>
                  <p className="text-[11px] text-ink-muted line-clamp-1 mt-0.5">{s.description}</p>
                </div>
              </div>
            ))}

            {(!suggestions || suggestions.length === 0) && (
              <div className="bg-paper-pure rounded-xl border border-dashed border-paper-dim p-6 text-center text-xs text-ink-muted">
                Select a place to see curated highlights for your trip.
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
