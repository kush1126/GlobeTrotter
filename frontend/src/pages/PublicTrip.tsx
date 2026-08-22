import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Calendar,
  Copy,
  Check,
  Share2,
  MessageCircle,
  X,
  ArrowLeft,
  Link as LinkIcon,
} from "lucide-react";
import { api, tripsApi, formatPrice, type Trip } from "../lib/api";
import { useAuth } from "../hooks/useAuth";

function formatDate(iso: string) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function PublicTrip() {
  const { shareToken } = useParams<{ shareToken: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [copiedLink, setCopiedLink] = useState(false);

  const { data: trip, isLoading, isError } = useQuery({
    queryKey: ["public-trip", shareToken],
    queryFn: () => api.get<Trip>(`/public/trips/${shareToken}`).then((r) => r.data),
    enabled: !!shareToken,
  });

  const copyTripMutation = useMutation({
    mutationFn: () => tripsApi.copyPublic(shareToken!),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["trips"] });
      navigate(`/trips/${res.data.id}`);
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <p className="font-mono text-sm text-ink-muted animate-pulse">Loading shared journey…</p>
      </div>
    );
  }

  if (isError || !trip) {
    return (
      <main className="max-w-md mx-auto px-6 py-16 text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-rust-subtle text-rust flex items-center justify-center mx-auto text-xl font-bold">
          <X className="w-6 h-6" />
        </div>
        <h2 className="font-heading font-bold text-xl text-ink">Journey Not Available</h2>
        <p className="text-xs text-ink-muted">
          This itinerary is either private, unshared, or no longer exists.
        </p>
        <Link
          to="/community"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-ink text-paper-pure font-heading text-xs font-bold rounded-xl hover:bg-route transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Browse Public Community Trips</span>
        </Link>
      </main>
    );
  }

  const shareUrl = window.location.href;
  const totalCost = trip.stops.reduce(
    (sum, s) => sum + s.activities.reduce((aSum, a) => aSum + Number(a.estimatedCost), 0),
    0
  );

  function handleCopyLink() {
    navigator.clipboard.writeText(shareUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  }

  return (
    <main className="max-w-4xl mx-auto px-6 py-10 space-y-8">
      {/* Hero Shared Card */}
      <div className="bg-paper-pure border border-paper-dim rounded-3xl p-6 sm:p-8 shadow-soft">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-paper-dim">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="travel-stamp text-[10px]">Public Itinerary</span>
              <span className="font-mono text-xs text-route font-semibold bg-route-subtle px-2.5 py-0.5 rounded-full border border-route/20">
                {trip.stops.length} Stop{trip.stops.length === 1 ? "" : "s"} • Read Only
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

          {/* Copy Trip / Clone Action */}
          <div className="flex flex-col sm:items-end gap-2">
            {user ? (
              <button
                onClick={() => copyTripMutation.mutate()}
                disabled={copyTripMutation.isPending}
                className="px-5 py-2.5 bg-route text-paper-pure font-heading text-xs font-bold rounded-xl hover:bg-route-dark transition-all shadow-sm flex items-center gap-2 disabled:opacity-50"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{copyTripMutation.isPending ? "Importing Trip…" : "Copy Trip to My Journeys"}</span>
              </button>
            ) : (
              <Link
                to="/login"
                className="px-5 py-2.5 bg-route text-paper-pure font-heading text-xs font-bold rounded-xl hover:bg-route-dark transition-all shadow-sm flex items-center gap-2"
              >
                <span>Sign in to Copy Trip</span>
              </Link>
            )}

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyLink}
                className="px-3 py-1.5 bg-paper text-ink font-heading text-xs font-semibold rounded-lg border border-paper-dim hover:border-route transition-colors flex items-center gap-1.5"
              >
                {copiedLink ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-route" />
                    <span>Link Copied</span>
                  </>
                ) : (
                  <>
                    <LinkIcon className="w-3.5 h-3.5 text-ink-muted" />
                    <span>Copy Link</span>
                  </>
                )}
              </button>

              {/* Social Share Shortcuts */}
              <a
                href={`https://api.whatsapp.com/send?text=${encodeURIComponent(`Check out this trip plan on GlobalTrotters: ${trip.title} - ${shareUrl}`)}`}
                target="_blank"
                rel="noreferrer"
                className="p-2 rounded-lg border border-paper-dim text-ink-muted hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                title="Share via WhatsApp"
              >
                <MessageCircle className="w-3.5 h-3.5" />
              </a>
              <a
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`Check out my trip itinerary for ${trip.title} on GlobalTrotters:`)}&url=${encodeURIComponent(shareUrl)}`}
                target="_blank"
                rel="noreferrer"
                className="p-2 rounded-lg border border-paper-dim text-ink-muted hover:text-blue-500 hover:bg-blue-50 transition-colors"
                title="Share on X / Twitter"
              >
                <Share2 className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>

        {/* Estimated Total Pill */}
        <div className="mt-6 flex items-center justify-between p-4 bg-paper rounded-2xl border border-paper-dim">
          <div>
            <span className="font-mono text-[10px] uppercase text-ink-muted tracking-wider font-semibold block">
              Estimated Trip Total
            </span>
            <span className="font-heading font-extrabold text-2xl text-ochre">
              {formatPrice(totalCost, user?.currency)}{" "}
              <span className="text-xs font-normal text-ink-muted">est. activities</span>
            </span>
          </div>

          <span className="font-mono text-xs text-route font-semibold">
            {trip.stops.map((s) => s.city).join(" → ")}
          </span>
        </div>
      </div>

      {/* Stop by Stop Itinerary Timeline */}
      <div className="space-y-6">
        <h2 className="font-heading font-bold text-xl text-ink">Journey Timeline &amp; Stops</h2>

        <div className="space-y-4">
          {trip.stops.map((stop, i) => (
            <div
              key={stop.id}
              className="bg-paper-pure border border-paper-dim rounded-2xl p-6 shadow-soft space-y-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-full bg-route text-paper-pure font-mono font-bold text-sm flex items-center justify-center">
                    {i + 1}
                  </span>
                  <div>
                    <h3 className="font-heading font-bold text-xl text-ink">
                      {stop.city}, <span className="text-sm font-normal text-ink-muted">{stop.country}</span>
                    </h3>
                    <p className="font-mono text-xs text-ink-muted flex items-center gap-1.5 mt-0.5">
                      <Calendar className="w-3.5 h-3.5 text-ink-muted" />
                      <span>{formatDate(stop.arrivalDate)} → {formatDate(stop.departureDate)}</span>
                    </p>
                  </div>
                </div>

                {stop.plannedBudget && (
                  <span className="font-mono text-xs font-bold text-ochre bg-ochre-subtle px-2.5 py-1 rounded-full border border-ochre/20">
                    Budget: {formatPrice(Number(stop.plannedBudget), user?.currency)}
                  </span>
                )}
              </div>

              {stop.notes && (
                <p className="text-xs text-ink-muted pl-11">{stop.notes}</p>
              )}

              {/* Stop Activities */}
              <div className="pl-11 space-y-2 pt-2 border-t border-paper-dim">
                <span className="font-mono text-[10px] uppercase font-bold tracking-wider text-ink-muted block">
                  Planned Activities ({stop.activities.length})
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {stop.activities.map((a) => (
                    <div
                      key={a.id}
                      className="bg-paper border border-paper-dim rounded-xl p-3 flex items-center justify-between gap-2"
                    >
                      <div>
                        <p className="font-heading font-bold text-xs text-ink">{a.name}</p>
                        <span className="font-mono text-[10px] text-route uppercase font-semibold">
                          {a.category}
                        </span>
                      </div>
                      <span className="font-mono text-xs font-bold text-ochre bg-paper-pure px-2 py-0.5 rounded-md border border-paper-dim">
                        {formatPrice(a.estimatedCost, user?.currency)}
                      </span>
                    </div>
                  ))}
                  {stop.activities.length === 0 && (
                    <p className="text-xs text-ink-muted/60 italic col-span-2">
                      No specific activities recorded for this stop.
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
