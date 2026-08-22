import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const links = [
  { to: "/", label: "Explore" },
  { to: "/trips", label: "My Journeys" },
  { to: "/discover", label: "Discover Places" },
  { to: "/community", label: "Community" },
  { to: "/calendar", label: "Calendar" },
];

export default function NavBar() {
  const { user, logout } = useAuth();

  return (
    <header className="border-b border-paper-dim/80 bg-paper-pure/90 backdrop-blur-md sticky top-0 z-30 shadow-soft">
      <div className="max-w-6xl mx-auto px-6 py-3.5 flex items-center justify-between gap-6">
        <Link to="/" className="flex items-center gap-2 group shrink-0">
          <div className="w-8 h-8 rounded-lg bg-ink flex items-center justify-center text-paper-pure font-bold text-base shadow-sm group-hover:bg-route transition-colors">
            GT
          </div>
          <div className="flex flex-col">
            <span className="font-heading font-extrabold text-xl tracking-tight text-ink leading-none">
              Global<span className="text-route">Trotter</span>
            </span>
            <span className="font-mono text-[9px] uppercase tracking-[0.25em] text-ink-muted leading-tight mt-0.5">
              Itinerary Engine
            </span>
          </div>
        </Link>

        {user && (
          <nav className="flex items-center gap-1 sm:gap-2">
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.to === "/"}
                className={({ isActive }) =>
                  `px-3 py-1.5 rounded-full font-heading text-xs font-semibold tracking-wide transition-all ${
                    isActive
                      ? "bg-ink text-paper-pure shadow-sm"
                      : "text-ink-muted hover:text-ink hover:bg-paper-dim/50"
                  }`
                }
              >
                {l.label}
              </NavLink>
            ))}
          </nav>
        )}

        {user ? (
          <div className="flex items-center gap-3 shrink-0">
            <Link
              to="/profile"
              className="flex items-center gap-2.5 pl-2 pr-3 py-1 rounded-full border border-paper-dim hover:border-ink/40 transition-colors group bg-paper-pure"
              aria-label="Your profile"
            >
              <div className="w-7 h-7 rounded-full bg-route text-paper-pure flex items-center justify-center font-heading font-bold text-xs shadow-sm">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <span className="font-heading font-medium text-xs text-ink hidden sm:inline">
                {user.name.split(" ")[0]}
              </span>
            </Link>
            <button
              onClick={logout}
              className="font-mono text-[11px] text-ink-muted hover:text-rust transition-colors px-2 py-1"
            >
              Sign out
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Link
              to="/login"
              className="px-4 py-1.5 font-heading text-xs font-semibold text-ink border border-paper-dim rounded-full hover:border-ink transition-colors"
            >
              Sign in
            </Link>
            <Link
              to="/register"
              className="px-4 py-1.5 font-heading text-xs font-semibold bg-route text-paper-pure rounded-full hover:bg-route-dark transition-colors shadow-sm"
            >
              Get Started
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
