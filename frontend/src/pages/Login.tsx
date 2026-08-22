import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { X, Check, Lock, Mail, ArrowRight } from "lucide-react";
import { useAuth } from "../hooks/useAuth";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotSent, setForgotSent] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login(email.trim(), password);
      navigate("/trips");
    } catch (err: any) {
      setError(err?.response?.data?.error || "Couldn't sign you in — check your email and password.");
    } finally {
      setSubmitting(false);
    }
  }

  function handleFillDemo() {
    setEmail("explorer@globaltrotter.com");
    setPassword("password123");
    setError(null);
  }

  function handleForgotSubmit(e: FormEvent) {
    e.preventDefault();
    if (!forgotEmail) return;
    setForgotSent(true);
  }

  return (
    <main className="max-w-md mx-auto px-6 py-16">
      <div className="bg-paper-pure border border-paper-dim rounded-3xl p-8 shadow-card">
        <div className="flex flex-col items-center mb-8 text-center">
          <div className="w-14 h-14 rounded-2xl bg-route text-paper-pure flex items-center justify-center font-heading font-extrabold text-xl shadow-sm mb-3">
            GT
          </div>
          <h1 className="font-heading font-extrabold text-2xl text-ink tracking-tight">
            Welcome Back
          </h1>
          <p className="text-xs text-ink-muted mt-1">
            Sign in to continue planning and exploring routes.
          </p>
        </div>

        {/* Demo Account Quick Access Pill */}
        <div className="mb-5 p-3.5 bg-paper rounded-2xl border border-paper-dim flex items-center justify-between gap-2">
          <div>
            <span className="font-mono text-[10px] uppercase font-bold text-route block">Demo Account</span>
            <span className="font-mono text-xs text-ink">explorer@globaltrotter.com</span>
          </div>
          <button
            type="button"
            onClick={handleFillDemo}
            className="px-3 py-1.5 bg-route-subtle hover:bg-route text-route hover:text-paper-pure font-heading text-xs font-bold rounded-xl transition-colors shadow-sm shrink-0 border border-route/20"
          >
            Auto-fill
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block font-mono text-[10px] uppercase tracking-wider text-ink-muted font-semibold mb-1">
              Email Address
            </label>
            <input
              type="email"
              required
              placeholder="explorer@globaltrotter.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="gt-input text-xs"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block font-mono text-[10px] uppercase tracking-wider text-ink-muted font-semibold">
                Password
              </label>
              <button
                type="button"
                onClick={() => {
                  setForgotEmail(email);
                  setForgotSent(false);
                  setShowForgotModal(true);
                }}
                className="font-mono text-[11px] text-route hover:underline"
              >
                Forgot Password?
              </button>
            </div>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="gt-input text-xs"
            />
          </div>

          {error && (
            <p className="font-mono text-xs text-rust bg-rust-subtle p-2.5 rounded-xl">{error}</p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-route hover:bg-route-dark text-paper-pure font-heading text-xs font-bold py-3 rounded-xl transition-colors shadow-sm disabled:opacity-50 flex items-center justify-center gap-1.5"
          >
            <span>{submitting ? "Signing in…" : "Sign In to GlobalTrotter"}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>

      <p className="text-xs text-ink-muted mt-6 text-center">
        Don't have an account yet?{" "}
        <Link to="/register" className="text-route font-bold hover:underline">
          Create an account
        </Link>
      </p>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 bg-ink/60 backdrop-blur-sm flex items-center justify-center p-6 z-50">
          <div className="bg-paper-pure border border-paper-dim rounded-2xl p-6 max-w-md w-full shadow-lift space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-heading font-bold text-lg text-ink">Reset Password</h3>
              <button
                onClick={() => setShowForgotModal(false)}
                className="text-ink-muted hover:text-ink text-sm p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {forgotSent ? (
              <div className="space-y-3">
                <div className="p-4 bg-route-subtle border border-route/20 rounded-xl text-xs text-route leading-relaxed flex items-start gap-2">
                  <Check className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>
                    Password recovery instructions have been sent to <strong>{forgotEmail}</strong>. Please check your inbox or spam folder.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowForgotModal(false)}
                  className="w-full py-2.5 bg-ink text-paper-pure font-heading text-xs font-bold rounded-xl"
                >
                  Return to Login
                </button>
              </div>
            ) : (
              <form onSubmit={handleForgotSubmit} className="space-y-4">
                <p className="text-xs text-ink-muted">
                  Enter your account email address and we'll send you a secure link to reset your password.
                </p>
                <div>
                  <label className="block font-mono text-[10px] uppercase tracking-wider text-ink-muted mb-1">
                    Your Email
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="explorer@globaltrotter.com"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    className="gt-input text-xs"
                  />
                </div>
                <div className="flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(false)}
                    className="px-4 py-2 font-heading text-xs font-semibold text-ink-muted hover:text-ink"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-route text-paper-pure font-heading text-xs font-bold rounded-xl hover:bg-route-dark transition-colors shadow-sm"
                  >
                    Send Recovery Link
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
