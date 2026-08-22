import { useState, useEffect, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Edit3, Check, AlertTriangle, Trash2, ArrowRight } from "lucide-react";
import { tripsApi, authApi, type Trip } from "../lib/api";
import { useAuth } from "../hooks/useAuth";

function normalizeCurrency(c?: string): string {
  if (!c) return "USD";
  if (c.includes("INR") || c === "INR") return "INR";
  if (c.includes("EUR") || c === "EUR") return "EUR";
  if (c.includes("GBP") || c === "GBP") return "GBP";
  if (c.includes("JPY") || c === "JPY") return "JPY";
  return "USD";
}

function normalizeLanguage(l?: string): string {
  if (!l) return "en";
  if (l.includes("hi") || l.includes("Hin")) return "hi";
  if (l.includes("fr") || l.includes("Fre")) return "fr";
  if (l.includes("es") || l.includes("Spa")) return "es";
  if (l.includes("ja") || l.includes("Jap")) return "ja";
  return "en";
}

export default function Profile() {
  const { user, refreshUser, logout } = useAuth();
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user?.name ?? "");
  const [currency, setCurrency] = useState(() =>
    normalizeCurrency(user?.currency || localStorage.getItem("gt_currency") || "USD")
  );
  const [language, setLanguage] = useState(() =>
    normalizeLanguage(user?.language || localStorage.getItem("gt_language") || "en")
  );
  const [savedSettings, setSavedSettings] = useState(false);
  const [tripToDelete, setTripToDelete] = useState<Trip | null>(null);

  useEffect(() => {
    if (user?.name) setName(user.name);
    if (user?.currency) setCurrency(normalizeCurrency(user.currency));
    if (user?.language) setLanguage(normalizeLanguage(user.language));
  }, [user]);

  const { data: trips } = useQuery({
    queryKey: ["trips"],
    queryFn: () => tripsApi.list().then((r) => r.data),
  });

  const updateProfile = useMutation({
    mutationFn: (vars: { name?: string; currency?: string; language?: string }) =>
      authApi.updateMe(vars),
    onSuccess: async (res) => {
      const savedCurr = normalizeCurrency(res.data.currency);
      const savedLang = normalizeLanguage(res.data.language);
      localStorage.setItem("gt_currency", savedCurr);
      localStorage.setItem("gt_language", savedLang);
      setCurrency(savedCurr);
      setLanguage(savedLang);
      await refreshUser();
      setEditing(false);
      setSavedSettings(true);
      setTimeout(() => setSavedSettings(false), 2500);
    },
  });

  const deleteTripMutation = useMutation({
    mutationFn: (id: string) => tripsApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trips"] });
      setTripToDelete(null);
    },
  });

  function onNameSubmit(e: FormEvent) {
    e.preventDefault();
    updateProfile.mutate({ name: name.trim(), currency, language });
  }

  function handleSavePreferences() {
    localStorage.setItem("gt_currency", currency);
    localStorage.setItem("gt_language", language);
    updateProfile.mutate({ name: (name || user?.name || "").trim(), currency, language });
  }

  const now = new Date();
  const preplanned = (trips ?? []).filter((t) => new Date(t.endDate) >= now);
  const previous = (trips ?? []).filter((t) => new Date(t.endDate) < now);

  return (
    <main className="max-w-4xl mx-auto px-6 py-10 space-y-10">
      {/* Profile Card */}
      <div className="bg-paper-pure border border-paper-dim rounded-3xl p-6 sm:p-8 shadow-soft flex flex-col sm:flex-row items-start sm:items-center gap-6">
        <div className="w-20 h-20 rounded-2xl bg-route text-paper-pure flex items-center justify-center font-heading font-extrabold text-3xl shadow-sm shrink-0">
          {(user?.name || "E").charAt(0).toUpperCase()}
        </div>

        <div className="flex-1 min-w-0">
          {editing ? (
            <form onSubmit={onNameSubmit} className="flex flex-wrap items-center gap-2">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="gt-input max-w-xs text-sm"
                required
              />
              <button
                type="submit"
                disabled={updateProfile.isPending}
                className="px-4 py-2 bg-route text-paper-pure font-heading text-xs font-bold rounded-xl hover:bg-route-dark transition-colors shadow-sm"
              >
                Save
              </button>
              <button
                type="button"
                onClick={() => setEditing(false)}
                className="px-4 py-2 text-ink-muted hover:text-rust font-heading text-xs font-semibold"
              >
                Cancel
              </button>
            </form>
          ) : (
            <>
              <div className="flex items-center gap-2">
                <h1 className="font-heading font-extrabold text-2xl text-ink tracking-tight">
                  {user?.name || "Global Explorer"}
                </h1>
                <span className="travel-stamp text-[9px]">Explorer</span>
              </div>
              <p className="font-mono text-xs text-ink-muted mt-1">{user?.email}</p>
              <button
                onClick={() => setEditing(true)}
                className="font-heading text-xs font-bold text-route hover:text-route-dark mt-3 inline-flex items-center gap-1.5"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit Name &amp; Profile</span>
              </button>
            </>
          )}
        </div>

        <div className="flex items-center gap-4 border-t sm:border-t-0 sm:border-l border-paper-dim pt-4 sm:pt-0 sm:pl-6">
          <div className="text-center">
            <span className="font-heading font-extrabold text-2xl text-ink block leading-none">
              {trips?.length ?? 0}
            </span>
            <span className="font-mono text-[10px] uppercase text-ink-muted tracking-wider">
              Total Trips
            </span>
          </div>
        </div>
      </div>

      {/* Preferences & Settings Card */}
      <div className="bg-paper-pure border border-paper-dim rounded-3xl p-6 sm:p-8 shadow-soft space-y-5">
        <div>
          <span className="travel-stamp text-[9px]">Settings</span>
          <h2 className="font-heading font-bold text-xl text-ink mt-1">App Preferences &amp; Account</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block font-mono text-[10px] uppercase tracking-wider text-ink-muted font-semibold mb-1">
              Preferred Currency
            </label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="gt-input text-xs font-semibold cursor-pointer"
            >
              <option value="USD">USD ($) - US Dollar</option>
              <option value="EUR">EUR (€) - Euro</option>
              <option value="GBP">GBP (£) - British Pound</option>
              <option value="INR">INR (₹) - Indian Rupee</option>
              <option value="JPY">JPY (¥) - Japanese Yen</option>
            </select>
          </div>

          <div>
            <label className="block font-mono text-[10px] uppercase tracking-wider text-ink-muted font-semibold mb-1">
              Language Preference
            </label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="gt-input text-xs font-semibold cursor-pointer"
            >
              <option value="en">English (US)</option>
              <option value="hi">Hindi (हिंदी)</option>
              <option value="fr">French (Français)</option>
              <option value="es">Spanish (Español)</option>
              <option value="ja">Japanese (日本語)</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-paper-dim">
          <button
            type="button"
            disabled={updateProfile.isPending}
            onClick={handleSavePreferences}
            className="px-5 py-2.5 bg-route text-paper-pure font-heading text-xs font-bold rounded-xl hover:bg-route-dark transition-colors shadow-sm disabled:opacity-50 flex items-center gap-2"
          >
            {updateProfile.isPending ? (
              "Saving…"
            ) : savedSettings ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Preferences Saved &amp; Applied</span>
              </>
            ) : (
              "Save Preferences"
            )}
          </button>

          <button
            type="button"
            onClick={logout}
            className="font-heading text-xs font-bold text-rust hover:underline"
          >
            Sign Out of Account
          </button>
        </div>
      </div>

      <TripGrid
        title="Preplanned &amp; Active Journeys"
        trips={preplanned}
        onDelete={(t) => setTripToDelete(t)}
      />
      <TripGrid
        title="Past Memories &amp; Completed Routes"
        trips={previous}
        onDelete={(t) => setTripToDelete(t)}
      />

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
                <p className="text-xs text-ink-muted">Permanent action</p>
              </div>
            </div>

            <p className="text-xs text-ink-muted">
              Are you sure you want to permanently delete <strong className="text-ink">"{tripToDelete.title}"</strong>?
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
                {deleteTripMutation.isPending ? "Deleting…" : "Delete Trip"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

function TripGrid({
  title,
  trips,
  onDelete,
}: {
  title: string;
  trips: any[];
  onDelete: (trip: any) => void;
}) {
  return (
    <section className="space-y-3">
      <h2 className="font-heading font-bold text-base text-ink">{title}</h2>
      {trips.length === 0 ? (
        <div className="bg-paper-pure border border-dashed border-paper-dim rounded-2xl p-6 text-center text-xs text-ink-muted">
          No journeys found in this section.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {trips.map((t) => (
            <div
              key={t.id}
              className="group bg-paper-pure border border-paper-dim hover:border-route rounded-2xl p-5 shadow-soft hover:shadow-card transition-all flex flex-col justify-between"
            >
              <div>
                <span className="font-mono text-[10px] font-bold text-route uppercase tracking-wider block mb-1">
                  {t.stops?.length || 0} Stop{(t.stops?.length ?? 0) === 1 ? "" : "s"}
                </span>
                <h3 className="font-heading font-bold text-base text-ink group-hover:text-route transition-colors line-clamp-1">
                  {t.title}
                </h3>
              </div>
              <div className="mt-4 pt-3 border-t border-paper-dim flex items-center justify-between font-mono text-[11px]">
                <Link
                  to={`/trips/${t.id}`}
                  className="text-ink font-semibold hover:text-route flex items-center gap-1"
                >
                  <span>View Itinerary</span>
                  <ArrowRight className="w-3 h-3 text-route group-hover:translate-x-0.5 transition-transform" />
                </Link>

                <button
                  onClick={() => onDelete(t)}
                  className="text-ink-muted hover:text-rust p-1 transition-colors"
                  title="Delete trip"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
