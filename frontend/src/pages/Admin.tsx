import { useState } from "react";
import { TrendingUp, Users, MapPin, Compass, Shield } from "lucide-react";

const TABS = ["User Trends & Analytics", "Popular Cities", "Popular Activities", "Manage Users"] as const;

export default function Admin() {
  const [tab, setTab] = useState<(typeof TABS)[number]>("User Trends & Analytics");

  return (
    <main className="max-w-5xl mx-auto px-6 py-10 space-y-8">
      <div>
        <span className="travel-stamp text-xs">Admin &amp; Analytics</span>
        <h1 className="font-heading font-extrabold text-3xl sm:text-4xl text-ink tracking-tight mt-1">
          Platform Overview
        </h1>
        <p className="text-xs sm:text-sm text-ink-muted mt-1">
          Monitor user adoption, popular destinations, activity distributions, and engagement trends.
        </p>
      </div>

      {/* KPI Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-paper-pure border border-paper-dim rounded-2xl p-5 shadow-soft">
          <span className="font-mono text-[10px] uppercase tracking-wider text-ink-muted font-bold block">
            Total Journeys
          </span>
          <span className="font-heading font-extrabold text-2xl text-ink mt-1 block">1,428</span>
          <span className="font-mono text-[10px] text-emerald-600 font-semibold flex items-center gap-1 mt-1">
            <TrendingUp className="w-3 h-3" />
            +18% this month
          </span>
        </div>

        <div className="bg-paper-pure border border-paper-dim rounded-2xl p-5 shadow-soft">
          <span className="font-mono text-[10px] uppercase tracking-wider text-ink-muted font-bold block">
            Active Explorers
          </span>
          <span className="font-heading font-extrabold text-2xl text-route mt-1 block">854</span>
          <span className="font-mono text-[10px] text-emerald-600 font-semibold flex items-center gap-1 mt-1">
            <Users className="w-3 h-3" />
            +12% active
          </span>
        </div>

        <div className="bg-paper-pure border border-paper-dim rounded-2xl p-5 shadow-soft">
          <span className="font-mono text-[10px] uppercase tracking-wider text-ink-muted font-bold block">
            Catalog Activities
          </span>
          <span className="font-heading font-extrabold text-2xl text-ochre mt-1 block">43+</span>
          <span className="font-mono text-[10px] text-ink-muted block mt-1">Across 11 Countries</span>
        </div>

        <div className="bg-paper-pure border border-paper-dim rounded-2xl p-5 shadow-soft">
          <span className="font-mono text-[10px] uppercase tracking-wider text-ink-muted font-bold block">
            Community Shares
          </span>
          <span className="font-heading font-extrabold text-2xl text-ink mt-1 block">342</span>
          <span className="font-mono text-[10px] text-route font-semibold block mt-1">Public Routes</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-paper-dim pb-2 flex-wrap">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`font-heading text-xs font-bold uppercase tracking-wider px-4 py-2 rounded-xl transition-all ${
              tab === t
                ? "bg-ink text-paper-pure shadow-sm"
                : "text-ink-muted hover:text-ink hover:bg-paper-dim"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 bg-paper-pure border border-paper-dim rounded-3xl p-6 sm:p-8 shadow-soft space-y-6">
          {tab === "User Trends & Analytics" && (
            <div className="space-y-6">
              <div>
                <span className="font-mono text-[10px] uppercase tracking-wider text-ink-muted font-bold block mb-3">
                  Monthly Trip Creations (2026)
                </span>
                <div className="flex items-end gap-3 h-40 pt-6 px-2 bg-paper rounded-2xl border border-paper-dim">
                  {[
                    { m: "Jan", v: 45 },
                    { m: "Feb", v: 62 },
                    { m: "Mar", v: 78 },
                    { m: "Apr", v: 95 },
                    { m: "May", v: 120 },
                    { m: "Jun", v: 140 },
                    { m: "Jul", v: 165 },
                  ].map((item) => (
                    <div key={item.m} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                      <div
                        className="w-full bg-route rounded-t-lg transition-all hover:bg-route-dark"
                        style={{ height: `${(item.v / 165) * 85}%` }}
                      />
                      <span className="font-mono text-[10px] text-ink-muted font-semibold">{item.m}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <span className="font-mono text-[10px] uppercase tracking-wider text-ink-muted font-bold block mb-2">
                  Active User Growth Curve
                </span>
                <div className="h-28 bg-paper rounded-2xl p-4 border border-paper-dim flex items-center">
                  <svg viewBox="0 0 300 70" className="w-full h-full">
                    <polyline
                      points="0,55 40,48 80,42 120,35 160,28 200,22 240,15 280,8"
                      fill="none"
                      stroke="#0F766E"
                      strokeWidth="3"
                      strokeLinecap="round"
                    />
                    <circle cx="280" cy="8" r="4" fill="#0F766E" />
                  </svg>
                </div>
              </div>
            </div>
          )}

          {tab === "Popular Cities" && (
            <ul className="space-y-3">
              {[
                { city: "Jaipur", country: "India", count: "312 itineraries" },
                { city: "Varanasi", country: "India", count: "278 itineraries" },
                { city: "Tokyo", country: "Japan", count: "245 itineraries" },
                { city: "Paris", country: "France", count: "210 itineraries" },
                { city: "Rome", country: "Italy", count: "195 itineraries" },
                { city: "Goa", country: "India", count: "180 itineraries" },
                { city: "Bali", country: "Indonesia", count: "165 itineraries" },
                { city: "Interlaken", country: "Switzerland", count: "140 itineraries" },
              ].map((c, i) => (
                <li
                  key={c.city}
                  className="flex items-center justify-between p-3.5 bg-paper rounded-xl border border-paper-dim"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-paper-dim text-ink font-mono font-bold text-xs flex items-center justify-center">
                      {i + 1}
                    </span>
                    <div>
                      <span className="font-heading font-bold text-sm text-ink">{c.city}</span>
                      <span className="text-xs text-ink-muted ml-1.5 font-normal">
                        ({c.country})
                      </span>
                    </div>
                  </div>
                  <span className="font-mono text-xs text-route font-semibold bg-paper-pure px-2.5 py-1 rounded-lg border border-paper-dim">
                    {c.count}
                  </span>
                </li>
              ))}
            </ul>
          )}

          {tab === "Popular Activities" && (
            <ul className="space-y-3">
              {[
                { cat: "Sightseeing & Monuments", count: "48% of total planned activities" },
                { cat: "Food Tours & Cooking Classes", count: "26% of total planned activities" },
                { cat: "Stays & Heritage Haveli Hotels", count: "14% of total planned activities" },
                { cat: "Local Transport & Boats", count: "8% of total planned activities" },
                { cat: "Outdoor & High-Pass Safaris", count: "4% of total planned activities" },
              ].map((item) => (
                <li
                  key={item.cat}
                  className="flex items-center justify-between p-3.5 bg-paper rounded-xl border border-paper-dim"
                >
                  <span className="font-heading font-bold text-xs text-ink">{item.cat}</span>
                  <span className="font-mono text-xs text-ochre font-semibold bg-paper-pure px-2.5 py-1 rounded-lg border border-paper-dim">
                    {item.count}
                  </span>
                </li>
              ))}
            </ul>
          )}

          {tab === "Manage Users" && (
            <div className="space-y-4">
              <p className="text-xs text-ink-muted leading-relaxed">
                Platform administration console for managing explorer accounts, verified creator badges, and content moderation.
              </p>
              <div className="p-4 bg-paper rounded-xl border border-paper-dim font-mono text-xs text-ink space-y-2">
                <p className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  Database Status: Connected (PostgreSQL)
                </p>
                <p className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  Active JWT Authentication Engine: Online
                </p>
                <p className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  Role-Based Access Boundary: Active
                </p>
              </div>
            </div>
          )}
        </div>

        <aside className="lg:col-span-4 space-y-4">
          <div className="bg-paper-pure border border-paper-dim rounded-3xl p-6 shadow-soft space-y-3">
            <span className="font-mono text-[10px] uppercase font-bold tracking-wider text-route flex items-center gap-1">
              <Shield className="w-3.5 h-3.5" />
              <span>Administrator Guide</span>
            </span>
            <h3 className="font-heading font-bold text-base text-ink">
              System Insights
            </h3>
            <p className="text-xs text-ink-muted leading-relaxed">
              Real-time calculations for trip distribution across multi-city routes, user retention, and budget tracking efficiency.
            </p>
          </div>
        </aside>
      </div>
    </main>
  );
}
