import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useAuth } from "../hooks/useAuth";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");
  const [additional, setAdditional] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await register(`${firstName} ${lastName}`.trim(), email, password);
      navigate("/");
    } catch {
      setError("Couldn't create your account — that email may already be registered.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="max-w-lg mx-auto px-6 py-12">
      <div className="bg-paper-pure border border-paper-dim rounded-3xl p-8 shadow-card">
        <div className="flex flex-col items-center mb-8 text-center">
          <div className="w-14 h-14 rounded-2xl bg-route text-paper-pure flex items-center justify-center font-heading font-extrabold text-xl shadow-sm mb-3">
            GT
          </div>
          <span className="travel-stamp text-[9px] mb-1">New Passport</span>
          <h1 className="font-heading font-extrabold text-2xl text-ink tracking-tight">
            Create Your Account
          </h1>
          <p className="text-xs text-ink-muted mt-1">
            Join the multi-city itinerary planning community.
          </p>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-mono text-[10px] uppercase tracking-wider text-ink-muted font-semibold mb-1">
                First Name
              </label>
              <input
                required
                placeholder="Aarav"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="gt-input text-xs"
              />
            </div>
            <div>
              <label className="block font-mono text-[10px] uppercase tracking-wider text-ink-muted font-semibold mb-1">
                Last Name
              </label>
              <input
                required
                placeholder="Sharma"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="gt-input text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-mono text-[10px] uppercase tracking-wider text-ink-muted font-semibold mb-1">
                Email Address
              </label>
              <input
                type="email"
                required
                placeholder="aarav@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="gt-input text-xs"
              />
            </div>
            <div>
              <label className="block font-mono text-[10px] uppercase tracking-wider text-ink-muted font-semibold mb-1">
                Phone
              </label>
              <input
                placeholder="+91 98765 43210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="gt-input text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-mono text-[10px] uppercase tracking-wider text-ink-muted font-semibold mb-1">
                Home City
              </label>
              <input
                placeholder="Jaipur / Mumbai / Paris"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="gt-input text-xs"
              />
            </div>
            <div>
              <label className="block font-mono text-[10px] uppercase tracking-wider text-ink-muted font-semibold mb-1">
                Country
              </label>
              <input
                placeholder="India"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="gt-input text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block font-mono text-[10px] uppercase tracking-wider text-ink-muted font-semibold mb-1">
              Travel Bio / Interests
            </label>
            <textarea
              placeholder="Tell us your travel style — heritage walks, backpacking, luxury stays, food crawls…"
              value={additional}
              onChange={(e) => setAdditional(e.target.value)}
              className="gt-input resize-none h-16 text-xs"
            />
          </div>

          <div>
            <label className="block font-mono text-[10px] uppercase tracking-wider text-ink-muted font-semibold mb-1">
              Password (min 6 characters)
            </label>
            <input
              type="password"
              required
              minLength={6}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="gt-input text-xs"
            />
          </div>

          {error && <p className="font-mono text-xs text-rust bg-rust-subtle p-2.5 rounded-xl">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-route hover:bg-route-dark text-paper-pure font-heading text-xs font-bold py-3 rounded-xl transition-colors shadow-sm disabled:opacity-50 flex items-center justify-center gap-1.5"
          >
            <span>{submitting ? "Creating Passport…" : "Register & Start Planning"}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>

      <p className="text-xs text-ink-muted mt-6 text-center">
        Already have an account?{" "}
        <Link to="/login" className="text-route font-bold hover:underline">
          Sign in
        </Link>
      </p>
    </main>
  );
}
