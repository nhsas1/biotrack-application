import { useEffect, useState, type FormEvent } from "react";
import {
  Bell,
  Building2,
  Check,
  LayoutList,
  LogOut,
  Save,
  ShieldCheck,
} from "lucide-react";
import {
  initials,
  type ProfileDraft,
  type ProfilePreferences,
  type ResearcherProfile,
} from "../lib/data";
import { errorMessage } from "../lib/api";
import { PageHeading } from "../components/ui";

export default function Profile({
  profile,
  email,
  preferences,
  onSave,
  onSaveProfile,
  onLogout,
  notify,
}: {
  profile: ResearcherProfile;
  email: string;
  preferences: ProfilePreferences;
  onSave: (preferences: ProfilePreferences) => void;
  onSaveProfile: (profile: ProfileDraft) => Promise<void>;
  onLogout: () => Promise<void>;
  notify: (message: string) => void;
}) {
  const [draft, setDraft] = useState(preferences);
  const [researcher, setResearcher] = useState<ProfileDraft>({
    full_name: profile.full_name,
    role: profile.role,
    laboratory: profile.laboratory,
  });
  const [saving, setSaving] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => setDraft(preferences), [preferences]);
  useEffect(
    () =>
      setResearcher({
        full_name: profile.full_name,
        role: profile.role,
        laboratory: profile.laboratory,
      }),
    [profile.full_name, profile.role, profile.laboratory],
  );
  async function saveProfile(event: FormEvent) {
    event.preventDefault();
    setError("");
    const cleaned = {
      full_name: researcher.full_name.trim(),
      role: researcher.role.trim(),
      laboratory: researcher.laboratory.trim(),
    };
    if (!cleaned.full_name || !cleaned.role || !cleaned.laboratory)
      return setError("Please enter a fictional name, role, and laboratory.");
    setSaving(true);
    try {
      await onSaveProfile(cleaned);
    } catch (cause) {
      setError(errorMessage(cause));
    } finally {
      setSaving(false);
    }
  }
  function savePreferences(event: FormEvent) {
    event.preventDefault();
    onSave({
      notifications: draft.notifications,
      compact: draft.compact,
      dateFormat: draft.dateFormat,
    });
    notify("Your device preferences have been saved");
  }
  async function logout() {
    setError("");
    setLoggingOut(true);
    try {
      await onLogout();
    } catch (cause) {
      setError(errorMessage(cause));
      setLoggingOut(false);
    }
  }
  return (
    <>
      <PageHeading
        eyebrow="YOUR SPACE IN THE LAB"
        title="Profile"
        subtitle="A little about you. A workspace that works your way."
      >
        <button
          className="secondary-button"
          disabled={loggingOut || saving}
          onClick={logout}
        >
          <LogOut size={17} />
          {loggingOut ? "Signing out…" : "Log out"}
        </button>
      </PageHeading>
      <div className="profile-columns">
        <section className="panel researcher-card">
          <div className="profile-cover">
            <div className="cover-circle" />
            <span>{profile.laboratory.toUpperCase()}</span>
          </div>
          <div className="researcher-content">
            <div className="avatar avatar-large">
              {initials(profile.full_name)}
              <span>
                <Check size={12} />
              </span>
            </div>
            <h2>{profile.full_name}</h2>
            <p>{profile.role}</p>
            <span className="researcher-badge">Signed-in researcher</span>
            <p className="profile-email">{email}</p>
            <div className="profile-lab">
              <Building2 size={20} />
              <div>
                <small>LABORATORY</small>
                <strong>{profile.laboratory}</strong>
              </div>
            </div>
            <div className="profile-local">
              <ShieldCheck size={16} />
              Profile synced with your account
            </div>
          </div>
        </section>
        <div className="profile-settings">
          <form className="panel preferences-panel" onSubmit={saveProfile}>
            <h2>Researcher profile</h2>
            <p className="section-subtitle">
              These details sync with your signed-in account
            </p>
            <fieldset
              className="form-fields progress-fields"
              disabled={saving || loggingOut}
            >
              <div className="form-grid">
                <label className="span-two">
                  Display name *
                  <input
                    required
                    maxLength={60}
                    value={researcher.full_name}
                    onChange={(event) =>
                      setResearcher({
                        ...researcher,
                        full_name: event.target.value,
                      })
                    }
                  />
                  <small>Use a fictional researcher identity.</small>
                </label>
                <label>
                  Role *
                  <input
                    required
                    maxLength={120}
                    value={researcher.role}
                    onChange={(event) =>
                      setResearcher({ ...researcher, role: event.target.value })
                    }
                  />
                </label>
                <label>
                  Laboratory *
                  <input
                    required
                    maxLength={120}
                    value={researcher.laboratory}
                    onChange={(event) =>
                      setResearcher({
                        ...researcher,
                        laboratory: event.target.value,
                      })
                    }
                  />
                </label>
              </div>
              <div className="form-actions">
                <button className="primary-button" type="submit">
                  <Save size={17} />
                  {saving ? "Saving…" : "Save profile"}
                </button>
              </div>
            </fieldset>
          </form>
          <form className="panel preferences-panel" onSubmit={savePreferences}>
            <h2>Make yourself at home</h2>
            <p className="section-subtitle">
              Personalize this device's laboratory workspace
            </p>
            <div className="preference-row">
              <span className="round-icon mint">
                <Bell size={19} />
              </span>
              <div>
                <strong>Activity reminders</strong>
                <p>Show in-app fictional lab task reminders</p>
              </div>
              <button
                type="button"
                className={`switch ${draft.notifications ? "on" : ""}`}
                role="switch"
                aria-checked={draft.notifications}
                aria-label="Activity reminders"
                onClick={() =>
                  setDraft({ ...draft, notifications: !draft.notifications })
                }
              >
                <span />
              </button>
            </div>
            <div className="preference-row">
              <span className="round-icon blue">
                <LayoutList size={19} />
              </span>
              <div>
                <strong>Compact workspace</strong>
                <p>A little less space between records</p>
              </div>
              <button
                type="button"
                className={`switch ${draft.compact ? "on" : ""}`}
                role="switch"
                aria-checked={draft.compact}
                aria-label="Compact workspace"
                onClick={() => setDraft({ ...draft, compact: !draft.compact })}
              >
                <span />
              </button>
            </div>
            <label className="date-preference">
              <div>
                <strong>Date format</strong>
                <p>How collection dates are displayed</p>
              </div>
              <select
                value={draft.dateFormat}
                onChange={(event) =>
                  setDraft({
                    ...draft,
                    dateFormat: event.target.value as "short" | "iso",
                  })
                }
              >
                <option value="short">Oct 17, 2026</option>
                <option value="iso">2026-10-17</option>
              </select>
            </label>
            <div className="form-actions">
              <button className="primary-button" type="submit">
                <Save size={17} />
                Save preferences
              </button>
            </div>
          </form>
        </div>
      </div>
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
      <div className="notice">
        <ShieldCheck size={19} />
        <p>
          Use fictional researcher and laboratory details only. Profile,
          samples, and experiments sync with your account. Notifications,
          compact layout, date format, and the four demo tasks stay on this
          device. Log out when using a shared device.
        </p>
      </div>
    </>
  );
}
