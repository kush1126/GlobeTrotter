import { useState, type FormEvent, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Calendar, Plus, ArrowLeft, ArrowRight } from "lucide-react";
import { tripsApi, searchApi } from "../lib/api";

function formatDate(iso: string) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function BuildItinerary() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);

  const { data: trip, isLoading } = useQuery({
    queryKey: ["trip", id],
    queryFn: () => tripsApi.get(id!).then((r) => r.data),
    enabled: !!id,
  });

  const addStop = useMutation({
    mutationFn: (vars: {
      city: string;
      country: string;
      arrivalDate: string;
      departureDate: string;
      plannedBudget?: number;
      notes?: string;
    }) => tripsApi.addStop(id!, { ...vars, orderIndex: trip?.stops.length ?? 0 }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trip", id] });
      setShowForm(false);
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <p className="font-mono text-sm text-ink-muted animate-pulse">Loading journey…</p>
      </div>
    );
  }

  if (!trip) {
    return (
      <main className="max-w-2xl mx-auto px-6 py-12 text-center">
        <p className="font-mono text-sm text-rust">Trip not found.</p>
      </main>
    );
  }

  const tripStartStr = trip.startDate ? trip.startDate.slice(0, 10) : "";
  const tripEndStr = trip.endDate ? trip.endDate.slice(0, 10) : "";

  return (
    <main className="max-w-3xl mx-auto px-6 py-10">
      {/* Header with Travel Ribbon */}
      <div className="bg-paper-pure rounded-2xl border border-paper-dim p-6 shadow-soft mb-8">
        <div className="flex items-center justify-between gap-4 mb-2">
          <span className="travel-stamp text-[10px]">Step 2 of 2: Itinerary Builder</span>
          <span className="font-mono text-xs text-route font-semibold bg-route-subtle px-3 py-1 rounded-full border border-route/20 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" />
            <span>{formatDate(trip.startDate)} → {formatDate(trip.endDate)}</span>
          </span>
        </div>
        <h1 className="font-heading font-extrabold text-3xl text-ink tracking-tight">
          {trip.title}
        </h1>
        <p className="text-xs text-ink-muted mt-1">
          Add sections for each city, hotel stay, or regional stop within your trip interval.
        </p>
      </div>

      {/* Sections List */}
      <div className="space-y-4 mb-6">
        {trip.stops.map((stop, i) => (
          <div
            key={stop.id}
            className="group bg-paper-pure border border-paper-dim hover:border-route/50 rounded-2xl p-5 shadow-soft transition-all"
          >
            <div className="flex items-start justify-between gap-3 mb-2">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-route text-paper-pure font-mono font-bold text-xs flex items-center justify-center">
                  {i + 1}
                </span>
                <h3 className="font-heading font-bold text-lg text-ink">
                  {stop.city}, {stop.country}
                </h3>
              </div>
              <span className="font-mono text-xs font-bold text-ochre bg-ochre-subtle px-2.5 py-1 rounded-full border border-ochre/20">
                Budget: ${stop.plannedBudget ? Number(stop.plannedBudget).toFixed(0) : "—"}
              </span>
            </div>

            <p className="text-xs text-ink-muted mb-3 pl-8">
              {stop.notes || "Section details, accommodation, or transportation notes."}
            </p>

            <div className="pl-8 flex items-center gap-3 font-mono text-xs text-ink-muted">
              <span className="px-2.5 py-1 bg-paper border border-paper-dim rounded-lg text-ink font-medium flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-ink-muted" />
                <span>{formatDate(stop.arrivalDate)} → {formatDate(stop.departureDate)}</span>
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Add Section Form or Action Button */}
      {showForm ? (
        <SectionForm
          tripStart={tripStartStr}
          tripEnd={tripEndStr}
          existingStops={trip.stops}
          onCancel={() => setShowForm(false)}
          onSubmit={(vals) => addStop.mutate(vals)}
          submitting={addStop.isPending}
        />
      ) : (
        <button
          onClick={() => setShowForm(true)}
          className="w-full border-2 border-dashed border-route/30 hover:border-route bg-paper-pure hover:bg-route-subtle rounded-2xl py-4 font-heading text-xs font-bold text-route hover:text-route-dark transition-all duration-200 shadow-soft flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add Another Section / Stop</span>
        </button>
      )}

      {/* Footer Navigation */}
      <div className="mt-8 pt-6 border-t border-paper-dim flex items-center justify-between">
        <button
          onClick={() => navigate("/trips")}
          className="font-heading text-xs font-semibold text-ink-muted hover:text-ink flex items-center gap-1.5"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Save for later</span>
        </button>
        <button
          onClick={() => navigate(`/trips/${trip.id}`)}
          className="px-5 py-2.5 bg-ink hover:bg-route text-paper-pure font-heading text-xs font-bold rounded-xl transition-all shadow-sm flex items-center gap-2"
        >
          <span>Done — View Full Itinerary &amp; Activities</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </main>
  );
}

function SectionForm({
  tripStart,
  tripEnd,
  existingStops,
  onSubmit,
  onCancel,
  submitting,
}: {
  tripStart: string;
  tripEnd: string;
  existingStops: any[];
  onSubmit: (vals: {
    city: string;
    country: string;
    arrivalDate: string;
    departureDate: string;
    plannedBudget?: number;
    notes?: string;
  }) => void;
  onCancel: () => void;
  submitting: boolean;
}) {
  const { data: meta } = useQuery({
    queryKey: ["search-meta"],
    queryFn: () => searchApi.meta().then((r) => r.data),
  });

  const initialArrival = useMemo(() => {
    if (existingStops.length > 0) {
      const lastStop = existingStops[existingStops.length - 1];
      const lastDep = lastStop.departureDate.slice(0, 10);
      if (lastDep >= tripStart && lastDep <= tripEnd) return lastDep;
    }
    return tripStart;
  }, [existingStops, tripStart, tripEnd]);

  const initialDeparture = useMemo(() => {
    return tripEnd || initialArrival;
  }, [tripEnd, initialArrival]);

  const [city, setCity] = useState("Jaipur");
  const [country, setCountry] = useState("India");
  const [arrivalDate, setArrivalDate] = useState(initialArrival);
  const [departureDate, setDepartureDate] = useState(initialDeparture);
  const [budget, setBudget] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (initialArrival) setArrivalDate(initialArrival);
    if (initialDeparture) setDepartureDate(initialDeparture);
  }, [initialArrival, initialDeparture]);

  function submit(e: FormEvent) {
    e.preventDefault();
    onSubmit({
      city,
      country,
      arrivalDate,
      departureDate,
      plannedBudget: budget ? Number(budget) : undefined,
      notes: notes || undefined,
    });
  }

  return (
    <form
      onSubmit={submit}
      className="bg-paper-pure border-2 border-route/40 rounded-2xl p-6 shadow-card space-y-4"
    >
      <div className="flex items-center justify-between pb-3 border-b border-paper-dim">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-route"></span>
          <span className="font-heading font-bold text-sm text-ink">New Itinerary Section</span>
        </div>
        <span className="font-mono text-[11px] text-route font-semibold bg-route-subtle px-2.5 py-0.5 rounded-full border border-route/20">
          Trip Interval: {tripStart} → {tripEnd}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block font-mono text-[10px] uppercase tracking-wider text-ink-muted font-semibold mb-1">
            Country
          </label>
          <select
            value={country}
            onChange={(e) => {
              setCountry(e.target.value);
              const firstInCountry = meta?.cities.find((c) => c.country === e.target.value);
              if (firstInCountry) setCity(firstInCountry.city);
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
          <label className="block font-mono text-[10px] uppercase tracking-wider text-ink-muted font-semibold mb-1">
            City / Stop Name
          </label>
          <select
            value={city}
            onChange={(e) => setCity(e.target.value)}
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

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label className="block font-mono text-[10px] uppercase tracking-wider text-ink-muted font-semibold mb-1">
            Arrival Date (from {tripStart})
          </label>
          <input
            type="date"
            required
            min={tripStart}
            max={tripEnd}
            value={arrivalDate}
            onChange={(e) => {
              setArrivalDate(e.target.value);
              if (departureDate < e.target.value) {
                setDepartureDate(e.target.value);
              }
            }}
            className="gt-input font-mono text-xs font-semibold"
          />
        </div>

        <div>
          <label className="block font-mono text-[10px] uppercase tracking-wider text-ink-muted font-semibold mb-1">
            Departure Date (until {tripEnd})
          </label>
          <input
            type="date"
            required
            min={arrivalDate || tripStart}
            max={tripEnd}
            value={departureDate}
            onChange={(e) => setDepartureDate(e.target.value)}
            className="gt-input font-mono text-xs font-semibold"
          />
        </div>

        <div>
          <label className="block font-mono text-[10px] uppercase tracking-wider text-ink-muted font-semibold mb-1">
            Section Budget ($)
          </label>
          <input
            type="number"
            min="0"
            placeholder="e.g. 500"
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
            className="gt-input font-mono text-xs"
          />
        </div>
      </div>

      <div>
        <label className="block font-mono text-[10px] uppercase tracking-wider text-ink-muted font-semibold mb-1">
          Section Notes &amp; Logistics
        </label>
        <textarea
          placeholder="Hotel booking details, transfer details, train numbers, or general highlights…"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="gt-input resize-none h-20 text-xs"
        />
      </div>

      <div className="flex items-center gap-2 pt-2">
        <button
          type="submit"
          disabled={submitting}
          className="px-4 py-2 bg-route text-paper-pure font-heading text-xs font-bold rounded-xl hover:bg-route-dark transition-colors shadow-sm disabled:opacity-50"
        >
          {submitting ? "Adding Section…" : "Save Section"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-ink-muted hover:text-rust font-heading text-xs font-semibold transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
