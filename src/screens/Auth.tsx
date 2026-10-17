import { useState, type FormEvent } from "react";
import { Dna, LogIn, ShieldCheck, UserRoundPlus } from "lucide-react";
import { PageHeading } from "../components/ui";
import { errorMessage } from "../lib/api";
import { configurationError, getSupabase } from "../lib/supabase";

export default function Auth({ sessionError = "" }: { sessionError?: string }) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const registering = mode === "register";

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setMessage("");
    if (registering && !name.trim())
      return setError("Please enter a fictional researcher name.");
    setBusy(true);
    try {
      const client = getSupabase();
      if (registering) {
        const { data, error: authError } = await client.auth.signUp({
          email: email.trim(),
          password,
          options: { data: { full_name: name.trim() } },
        });
        if (authError) throw authError;
        if (!data.session) {
          setMessage(
            "Check your email for a confirmation link, then sign in. If you already have an account, use Sign in below.",
          );
          setPassword("");
        }
      } else {
        const { error: authError } = await client.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (authError) throw authError;
      }
    } catch (cause) {
      setError(errorMessage(cause));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="auth-content">
      <PageHeading
        eyebrow="YOUR LABORATORY, CONNECTED"
        title={registering ? "Join BioTrack" : "Welcome to BioTrack"}
        subtitle="A secure workspace for your fictional samples and experiments."
      />
      <form className="panel sample-form auth-form" onSubmit={submit}>
        <div className="form-section-heading">
          <span className="round-icon mint">
            <Dna size={23} />
          </span>
          <div>
            <h2>
              {registering
                ? "Create your researcher account"
                : "Sign in to your laboratory"}
            </h2>
            <p>
              Your session stays signed in on this device until you log out.
            </p>
          </div>
        </div>
        <fieldset
          disabled={busy || !!configurationError}
          className="form-fields"
        >
          <div className="form-grid">
            {registering && (
              <label className="span-two">
                Fictional researcher name *
                <input
                  required
                  autoComplete="name"
                  maxLength={60}
                  value={name}
                  placeholder="e.g. Dr. Rowan Bell"
                  onChange={(event) => setName(event.target.value)}
                />
              </label>
            )}
            <label className="span-two">
              Email *
              <input
                required
                type="email"
                autoComplete="email"
                maxLength={254}
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </label>
            <label className="span-two">
              Password *
              <input
                required
                type="password"
                minLength={registering ? 8 : undefined}
                autoComplete={registering ? "new-password" : "current-password"}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
              {registering && <small>Use at least 8 characters.</small>}
            </label>
          </div>
          <div className="form-actions">
            <button className="primary-button full-width" type="submit">
              {registering ? <UserRoundPlus size={18} /> : <LogIn size={18} />}
              {busy
                ? "Please wait…"
                : registering
                  ? "Create account"
                  : "Sign in"}
            </button>
          </div>
        </fieldset>
        {(configurationError || error || sessionError) && (
          <p className="form-error" role="alert">
            {configurationError || error || sessionError}
          </p>
        )}
        {message && (
          <div className="notice" role="status">
            <ShieldCheck size={19} />
            <p>{message}</p>
          </div>
        )}
        <button
          type="button"
          className="text-button auth-mode"
          disabled={busy}
          onClick={() => {
            setMode(registering ? "login" : "register");
            setError("");
            setMessage("");
            setPassword("");
          }}
        >
          {registering
            ? "Already have an account? Sign in"
            : "New to BioTrack? Create an account"}
        </button>
      </form>
      <div className="notice subtle-notice">
        <ShieldCheck size={19} />
        <p>
          Use a fictional researcher identity and fictional laboratory data
          only. Never enter real patient information. Your sample, experiment,
          and profile records sync securely with your account.
        </p>
      </div>
    </div>
  );
}
