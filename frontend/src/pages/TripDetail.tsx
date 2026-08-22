import { useState, type FormEvent, useMemo } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Calendar,
  MapPin,
  DollarSign,
  Plus,
  Trash2,
  AlertTriangle,
  Compass,
  X,
  Share2,
  Copy,
  Check,
} from "lucide-react";
import { tripsApi, stopsApi, searchApi, formatPrice, type Activity, type TripStop } from "../lib/api";
import { useAuth } from "../hooks/useAuth";
import RouteLine from "../components/RouteLine";
import CalendarMonth from "../components/CalendarMonth";
import ItineraryDayView from "../components/ItineraryDayView";

function formatDate(iso: string) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function TripDetail() {
  const { user } = useAuth();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const queryClient = useQueryClient();
  const [activeStopId, setActiveStopId] = useState<string | null>(null);
  const [showStopForm, setShowStopForm] = useState(false);
  const [showActivityForm, setShowActivityForm] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [stopToDelete, setStopToDelete] = useState<TripStop | null>(null);
  const [tab, setTab] = useState<"itinerary" | "budget" | "calendar">("itinerary");
  const [copiedLink, setCopiedLink] = useState(false);

  const { data: trip, isLoading } = useQuery({
    queryKey: ["trip", id],
    queryFn: () => tripsApi.get(id!).then((r) => r.data),
    enabled: !!id,
  });

  const { data: budget } = useQuery({
    queryKey: ["trip", id, "budget"],
    queryFn: () => tripsApi.budget(id!).then((r) => r.data),
    enabled: !!id && tab === "budget",
  });

  const { data: calendar } = useQuery({
    queryKey: ["trip", id, "calendar"],
    queryFn: () => tripsApi.calendar(id!).then((r) => r.data),
    enabled: !!id && tab === "calendar",
  });

  const invalidateTrip = () => queryClient.invalidateQueries({ queryKey: ["trip", id] });

  const deleteTripMutation = useMutation({
    mutationFn: () => tripsApi.remove(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trips"] });
      navigate("/trips");
    },
  });

  const addStop = useMutation({
    mutationFn: (vars: { city: string; country: string; arrivalDate: string; departureDate: string }) =>
      tripsApi.addStop(id!, { ...vars, orderIndex: trip?.stops.length ?? 0 }),
    onSuccess: () => {
      invalidateTrip();
      setShowStopForm(false);
    },
  });

  const deleteStopMutation = useMutation({
    mutationFn: (stopId: string) => stopsApi.remove(stopId),
    onSuccess: () => {
      invalidateTrip();
      setStopToDelete(null);
    },
  });

  const addActivity = useMutation({
    mutationFn: (vars: {
      stopId: string;
      name: string;
      category: string;
      date: string;
      estimatedCost: number;
    }) =>
      stopsApi.addActivity(vars.stopId, {
        name: vars.name,
        category: vars.category as Activity["category"],
        date: vars.date,
        estimatedCost: vars.estimatedCost,
        currency: "USD",
      }),
    onSuccess: () => {
      invalidateTrip();
      setShowActivityForm(false);
    },
  });

  const togglePublic = useMutation({
    mutationFn: (makePublic: boolean) => tripsApi.share(id!, { makePublic }),
    onSuccess: invalidateTrip,
  });

  const invite = useMutation({
    mutationFn: (vars: { email: string; permission: "view" | "edit" }) =>
      tripsApi.share(id!, { inviteEmail: vars.email, permission: vars.permission }),
    onSuccess: invalidateTrip,
  });

  const revoke = useMutation({
    mutationFn: (shareId: string) => tripsApi.revokeShare(id!, shareId),
    onSuccess: invalidateTrip,
  });

  const totalDays = useMemo(() => {
    if (!trip?.startDate || !trip?.endDate) return 1;
    const start = new Date(trip.startDate);
    const end = new Date(trip.endDate);
    const diff = Math.round((+end - +start) / (1000 * 60 * 60 * 24));
    return Math.max(1, diff + 1);
  }, [trip?.startDate, trip?.endDate]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <p className="font-mono text-sm text-ink-muted animate-pulse">Loading journey route…</p>
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

  const activeStop = trip.stops.find((s) => s.id === activeStopId) ?? trip.stops[0] ?? null;
  const shareUrl = `${window.location.origin}/public/${trip.shareToken}`;
  const canEdit = trip.viewerCanEdit ?? true;
  const isOwner = trip.viewerIsOwner ?? true;

  const tripStartStr = trip.startDate.slice(0, 10);
  const tripEndStr = trip.endDate.slice(0, 10);

  function handleCopyShareLink() {
    navigator.clipboard.writeText(shareUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  }

  return (
    <main className="max-w-5xl mx-auto px-6 py-10">
      {/* Hero Header */}
      <div className="bg-paper-pure rounded-2xl border border-paper-dim p-6 shadow-soft mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="travel-stamp text-[10px]">Active Journey</span>
            <span className="font-mono text-xs text-route font-semibold bg-route-subtle px-2.5 py-0.5 rounded-full border border-route/20">
              {trip.stops.length} Stop{trip.stops.length === 1 ? "" : "s"} • {totalDays} Days
            </span>
          </div>
          <h1 className="font-heading font-extrabold text-3xl sm:text-4xl text-ink tracking-tight">
            {trip.title}
          </h1>
          <p className="font-mono text-xs text-ink-muted mt-1.5 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-ink-muted" />
            <span>{formatDate(trip.startDate)} → {formatDate(trip.endDate)}</span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/discover"
            className="px-4 py-2 bg-route-subtle hover:bg-route text-route hover:text-paper-pure font-heading text-xs font-bold rounded-xl transition-all shadow-sm flex items-center gap-1.5 border border-route/20"
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Discover Activities</span>
          </Link>

          {isOwner && (
            <button
              onClick={() => setShowDeleteModal(true)}
              className="p-2 text-ink-muted hover:text-rust hover:bg-rust-subtle rounded-xl transition-colors"
              title="Delete this journey"
              aria-label="Delete journey"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-8 border-b border-paper-dim pb-2 flex-wrap">
        <button
          onClick={() => setTab("itinerary")}
          className={`font-heading text-xs font-bold uppercase tracking-wider px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
            tab === "itinerary"
              ? "bg-ink text-paper-pure shadow-sm"
              : "text-ink-muted hover:text-ink hover:bg-paper-dim"
          }`}
        >
          <MapPin className="w-3.5 h-3.5" />
          <span>Itinerary &amp; Stops</span>
        </button>

        <button
          onClick={() => setTab("budget")}
          className={`font-heading text-xs font-bold uppercase tracking-wider px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
            tab === "budget"
              ? "bg-ink text-paper-pure shadow-sm"
              : "text-ink-muted hover:text-ink hover:bg-paper-dim"
          }`}
        >
          <DollarSign className="w-3.5 h-3.5" />
          <span>Budget Analytics</span>
        </button>

        <button
          onClick={() => setTab("calendar")}
          className={`font-heading text-xs font-bold uppercase tracking-wider px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
            tab === "calendar"
              ? "bg-ink text-paper-pure shadow-sm"
              : "text-ink-muted hover:text-ink hover:bg-paper-dim"
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>Calendar View</span>
        </button>
      </div>

      {/* Itinerary Tab */}
      {tab === "itinerary" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Stops & RouteLine */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-heading font-bold text-base text-ink">Journey Stops</h2>
              {canEdit && (
                <button
                  onClick={() => setShowStopForm((s) => !s)}
                  className="font-heading text-xs font-bold text-route hover:text-route-dark flex items-center gap-1"
                >
                  {showStopForm ? (
                    <>
                      <X className="w-3.5 h-3.5" />
                      <span>Cancel</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Stop</span>
                    </>
                  )}
                </button>
              )}
            </div>

            {showStopForm && canEdit && (
              <StopForm
                tripStart={tripStartStr}
                tripEnd={tripEndStr}
                existingStops={trip.stops}
                onSubmit={(vals) => addStop.mutate(vals)}
                submitting={addStop.isPending}
              />
            )}

            <div className="bg-paper-pure border border-paper-dim rounded-2xl p-5 shadow-soft">
              <RouteLine stops={trip.stops} activeStopId={activeStop?.id ?? null} onSelect={setActiveStopId} />
            </div>
          </div>

          {/* Right Column: Activities for active stop */}
          <div className="lg:col-span-7">
            {activeStop ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between bg-paper-pure border border-paper-dim rounded-2xl p-4 shadow-soft">
                  <div>
                    <span className="font-mono text-[10px] uppercase tracking-wider text-route font-bold">
                      Selected Stop
                    </span>
                    <h3 className="font-heading font-bold text-lg text-ink">
                      {activeStop.city}, {activeStop.country}
                    </h3>
                    <p className="font-mono text-xs text-ink-muted flex items-center gap-1.5 mt-0.5">
                      <Calendar className="w-3 h-3 text-ink-muted" />
                      <span>{formatDate(activeStop.arrivalDate)} → {formatDate(activeStop.departureDate)}</span>
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {canEdit && (
                      <>
                        <button
                          onClick={() => setShowActivityForm((s) => !s)}
                          className="px-3 py-1.5 bg-route text-paper-pure rounded-xl font-heading text-xs font-bold hover:bg-route-dark transition-all shadow-sm flex items-center gap-1"
                        >
                          {showActivityForm ? (
                            <>
                              <X className="w-3.5 h-3.5" />
                              <span>Close</span>
                            </>
                          ) : (
                            <>
                              <Plus className="w-3.5 h-3.5" />
                              <span>Add Activity</span>
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => setStopToDelete(activeStop)}
                          className="p-1.5 text-ink-muted hover:text-rust hover:bg-rust-subtle rounded-lg transition-colors"
                          title="Delete this stop"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {showActivityForm && canEdit && (
                  <ActivityForm
                    stop={activeStop}
                    onSubmit={(vals) => addActivity.mutate({ stopId: activeStop.id, ...vals })}
                    submitting={addActivity.isPending}
                  />
                )}

                <div className="bg-paper-pure border border-paper-dim rounded-2xl p-5 shadow-soft">
                  <ItineraryDayView stop={activeStop} canEdit={canEdit} />
                </div>
              </div>
            ) : (
              <div className="bg-paper-pure border border-dashed border-paper-dim rounded-2xl p-12 text-center text-xs text-ink-muted">
                No stops added yet. Click "+ Add Stop" to start planning your route.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Budget Tab */}
      {tab === "budget" && budget && (
        <div className="max-w-xl bg-paper-pure border border-paper-dim rounded-2xl p-6 shadow-soft space-y-6">
          <div className="flex items-baseline justify-between border-b border-paper-dim pb-4">
            <div>
              <span className="font-mono text-[10px] uppercase tracking-wider text-ink-muted font-bold">
                Total Actual Expenses
              </span>
              <p className="font-heading font-extrabold text-3xl text-ink">
                {formatPrice(budget.totalActual, user?.currency)}
              </p>
              <p className="font-mono text-xs text-ink-muted mt-0.5">
                Avg. {formatPrice(budget.totalActual / totalDays, user?.currency)} / day ({totalDays} days)
              </p>
            </div>
            <span className="font-mono text-xs text-ochre font-bold bg-ochre-subtle px-3 py-1 rounded-full border border-ochre/20">
              Estimated Total
            </span>
          </div>

          <ul className="space-y-4">
            {budget.actualByCategory.map((c) => (
              <li key={c.category} className="space-y-1.5">
                <div className="flex items-center justify-between font-mono text-xs">
                  <span className="uppercase text-ink font-semibold">{c.category}</span>
                  <span className="font-bold text-ink">{formatPrice(c.total, user?.currency)}</span>
                </div>
                <div className="h-2.5 bg-paper rounded-full overflow-hidden border border-paper-dim">
                  <div
                    className="h-full bg-route rounded-full transition-all duration-500"
                    style={{
                      width: `${budget.totalActual ? (c.total / budget.totalActual) * 100 : 0}%`,
                    }}
                  />
                </div>
              </li>
            ))}
            {budget.actualByCategory.length === 0 && (
              <p className="text-xs text-ink-muted text-center py-6">
                No activity costs recorded yet. Add activities to see your budget breakdown.
              </p>
            )}
          </ul>
        </div>
      )}

      {/* Calendar Tab */}
      {tab === "calendar" && calendar && (
        <div className="bg-paper-pure border border-paper-dim rounded-2xl p-6 shadow-soft max-w-2xl">
          <CalendarMonth activitiesByDate={calendar} />
        </div>
      )}

      {/* Sharing & Collaborator Section */}
      {isOwner && (
        <div className="mt-12 bg-paper-pure border border-paper-dim rounded-2xl p-6 shadow-soft space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-heading font-bold text-base text-ink flex items-center gap-1.5">
              <Share2 className="w-4 h-4 text-route" />
              <span>Trip Sharing &amp; Access</span>
            </h2>
            <label className="flex items-center gap-2 font-heading text-xs font-semibold cursor-pointer">
              <input
                type="checkbox"
                checked={trip.isPublic}
                onChange={(e) => togglePublic.mutate(e.target.checked)}
                className="rounded text-route focus:ring-route"
              />
              Public Link Active
            </label>
          </div>

          {trip.isPublic && (
            <div className="p-3 bg-route-subtle border border-route/20 rounded-xl font-mono text-xs text-route flex items-center justify-between gap-2">
              <span className="truncate">{shareUrl}</span>
              <button
                onClick={handleCopyShareLink}
                className="px-2.5 py-1 bg-route text-paper-pure rounded-lg text-[10px] font-bold hover:bg-route-dark shrink-0 flex items-center gap-1"
              >
                {copiedLink ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                <span>{copiedLink ? "Copied" : "Copy Link"}</span>
              </button>
            </div>
          )}

          <InviteForm onSubmit={(email, permission) => invite.mutate({ email, permission })} />

          {trip.shares && trip.shares.length > 0 && (
            <ul className="space-y-2 pt-2">
              {trip.shares.map((s) => (
                <li
                  key={s.id}
                  className="flex items-center justify-between font-mono text-xs p-2.5 bg-paper rounded-xl"
                >
                  <span className="text-ink">
                    {s.sharedWithUser?.name ?? "Unknown"} ({s.sharedWithUser?.email}) —{" "}
                    <span className="font-bold text-route uppercase">{s.permission}</span>
                  </span>
                  <button
                    onClick={() => revoke.mutate(s.id)}
                    className="text-rust hover:underline text-[11px]"
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Delete Stop Modal */}
      {stopToDelete && (
        <div className="fixed inset-0 bg-ink/60 backdrop-blur-sm flex items-center justify-center p-6 z-50">
          <div className="bg-paper-pure border border-paper-dim rounded-2xl p-6 max-w-md w-full shadow-lift space-y-4">
            <h3 className="font-heading font-bold text-lg text-ink">Delete Stop</h3>
            <p className="text-xs text-ink-muted">
              Are you sure you want to delete stop <strong className="text-ink">{stopToDelete.city}</strong> and all its activities?
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setStopToDelete(null)}
                className="px-4 py-2 font-heading text-xs font-semibold text-ink-muted hover:text-ink"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleteStopMutation.isPending}
                onClick={() => deleteStopMutation.mutate(stopToDelete.id)}
                className="px-4 py-2 bg-rust text-paper-pure font-heading text-xs font-bold rounded-xl hover:bg-rust-dark transition-colors shadow-sm disabled:opacity-50"
              >
                {deleteStopMutation.isPending ? "Deleting…" : "Delete Stop"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Trip Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-ink/60 backdrop-blur-sm flex items-center justify-center p-6 z-50">
          <div className="bg-paper-pure border border-paper-dim rounded-2xl p-6 max-w-md w-full shadow-lift space-y-4">
            <div className="flex items-center gap-3 text-rust">
              <div className="w-10 h-10 rounded-full bg-rust-subtle flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-rust" />
              </div>
              <div>
                <h3 className="font-heading font-bold text-lg text-ink">Delete Journey</h3>
                <p className="text-xs text-ink-muted">Permanent action</p>
              </div>
            </div>

            <p className="text-xs text-ink-muted">
              Are you sure you want to delete <strong className="text-ink">"{trip.title}"</strong>?
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 font-heading text-xs font-semibold text-ink-muted hover:text-ink"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleteTripMutation.isPending}
                onClick={() => deleteTripMutation.mutate()}
                className="px-4 py-2 bg-rust hover:bg-rust-dark text-paper-pure font-heading text-xs font-bold rounded-xl transition-colors shadow-sm disabled:opacity-50"
              >
                {deleteTripMutation.isPending ? "Deleting…" : "Yes, Delete Journey"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

function InviteForm({ onSubmit }: { onSubmit: (email: string, permission: "view" | "edit") => void }) {
  const [email, setEmail] = useState("");
  const [permission, setPermission] = useState<"view" | "edit">("view");

  function submit(e: FormEvent) {
    e.preventDefault();
    if (!email) return;
    onSubmit(email, permission);
    setEmail("");
  }

  return (
    <form onSubmit={submit} className="flex gap-2">
      <input
        type="email"
        placeholder="Invite collaborator by email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="gt-input flex-1 text-xs"
      />
      <select
        value={permission}
        onChange={(e) => setPermission(e.target.value as "view" | "edit")}
        className="gt-input w-28 text-xs font-semibold cursor-pointer"
      >
        <option value="view">View Only</option>
        <option value="edit">Can Edit</option>
      </select>
      <button
        type="submit"
        className="px-4 py-2 font-heading text-xs font-bold bg-ink text-paper-pure rounded-xl hover:bg-route transition-colors shadow-sm shrink-0"
      >
        Invite
      </button>
    </form>
  );
}

function StopForm({
  tripStart,
  tripEnd,
  existingStops,
  onSubmit,
  submitting,
}: {
  tripStart: string;
  tripEnd: string;
  existingStops: TripStop[];
  onSubmit: (vals: { city: string; country: string; arrivalDate: string; departureDate: string }) => void;
  submitting: boolean;
}) {
  const { data: meta } = useQuery({
    queryKey: ["search-meta"],
    queryFn: () => searchApi.meta().then((r) => r.data),
  });

  const initialArrival = existingStops.length > 0
    ? existingStops[existingStops.length - 1].departureDate.slice(0, 10)
    : tripStart;
  const initialDeparture = tripEnd || initialArrival;

  const [city, setCity] = useState("Jaipur");
  const [country, setCountry] = useState("India");
  const [arrivalDate, setArrivalDate] = useState(initialArrival);
  const [departureDate, setDepartureDate] = useState(initialDeparture);

  function submit(e: FormEvent) {
    e.preventDefault();
    onSubmit({ city, country, arrivalDate, departureDate });
  }

  return (
    <form
      onSubmit={submit}
      className="bg-paper-pure border-2 border-route/40 rounded-2xl p-5 shadow-soft space-y-3"
    >
      <div className="flex items-center justify-between">
        <span className="font-heading font-bold text-xs text-ink">Add Stop</span>
        <span className="font-mono text-[10px] text-route font-semibold bg-route-subtle px-2 py-0.5 rounded-full">
          Interval: {tripStart} → {tripEnd}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block font-mono text-[10px] uppercase tracking-wider text-ink-muted mb-1">
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
          <label className="block font-mono text-[10px] uppercase tracking-wider text-ink-muted mb-1">
            City
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

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block font-mono text-[10px] uppercase tracking-wider text-ink-muted mb-1">
            Arrival (from {tripStart})
          </label>
          <input
            type="date"
            required
            min={tripStart}
            max={tripEnd}
            value={arrivalDate}
            onChange={(e) => {
              setArrivalDate(e.target.value);
              if (departureDate < e.target.value) setDepartureDate(e.target.value);
            }}
            className="gt-input font-mono text-xs font-semibold"
          />
        </div>

        <div>
          <label className="block font-mono text-[10px] uppercase tracking-wider text-ink-muted mb-1">
            Departure (until {tripEnd})
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
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="w-full font-heading font-bold text-xs py-2.5 bg-route text-paper-pure rounded-xl hover:bg-route-dark transition-colors shadow-sm disabled:opacity-50"
      >
        {submitting ? "Adding Stop…" : "Save Stop to Route"}
      </button>
    </form>
  );
}

function ActivityForm({
  stop,
  onSubmit,
  submitting,
}: {
  stop: TripStop;
  onSubmit: (vals: { name: string; category: string; date: string; estimatedCost: number }) => void;
  submitting: boolean;
}) {
  const stopArrival = stop.arrivalDate.slice(0, 10);
  const stopDeparture = stop.departureDate.slice(0, 10);

  const [name, setName] = useState("");
  const [category, setCategory] = useState("sightseeing");
  const [date, setDate] = useState(stopArrival);
  const [cost, setCost] = useState("");

  function submit(e: FormEvent) {
    e.preventDefault();
    onSubmit({ name, category, date, estimatedCost: Number(cost) || 0 });
  }

  return (
    <form
      onSubmit={submit}
      className="bg-paper border-2 border-ochre/40 rounded-2xl p-5 shadow-soft space-y-3"
    >
      <div className="flex items-center justify-between">
        <span className="font-heading font-bold text-xs text-ink">New Activity in {stop.city}</span>
        <span className="font-mono text-[10px] text-ochre font-semibold bg-ochre-subtle px-2 py-0.5 rounded-full">
          Date range: {stopArrival} → {stopDeparture}
        </span>
      </div>

      <input
        required
        placeholder="Activity Name (e.g. Sunrise Temple Tour, Cooking Class…)"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="gt-input text-xs"
      />

      <div className="grid grid-cols-3 gap-3">
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="gt-input text-xs font-semibold cursor-pointer"
        >
          <option value="sightseeing">Sightseeing</option>
          <option value="food">Food &amp; Dining</option>
          <option value="transport">Transport</option>
          <option value="stay">Stay</option>
          <option value="other">Other</option>
        </select>

        <input
          type="date"
          required
          min={stopArrival}
          max={stopDeparture}
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="gt-input font-mono text-xs font-semibold"
        />

        <input
          type="number"
          min="0"
          step="1"
          placeholder="Est. Cost ($)"
          value={cost}
          onChange={(e) => setCost(e.target.value)}
          className="gt-input font-mono text-xs"
        />
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="w-full font-heading font-bold text-xs py-2.5 bg-ochre text-paper-pure rounded-xl hover:bg-ochre-light transition-colors shadow-sm disabled:opacity-50"
      >
        {submitting ? "Adding Activity…" : "Add Activity to Itinerary"}
      </button>
    </form>
  );
}
