import { useEffect, useState, type FormEvent } from "react";
import {
  Bell,
  Building2,
  Check,
  ChevronRight,
  LayoutList,
  Save,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { type ProfilePreferences } from "../lib/data";
import { PageHeading } from "../components/ui";

export default function Profile({
  preferences,
  onSave,
  notify,
}: {
  preferences: ProfilePreferences;
  onSave: (preferences: ProfilePreferences) => void;
  notify: (message: string) => void;
}) {
  const [draft, setDraft] = useState(preferences);
  useEffect(() => setDraft(preferences), [preferences]);
  function save(event: FormEvent) {
    event.preventDefault();
    onSave({ ...draft, name: draft.name.trim() || "Dr. Avery Morgan" });
    notify("Your preferences have been saved");
  }
  return (
    <>
      <PageHeading
        eyebrow="YOUR SPACE IN THE LAB"
        title="Profile"
        subtitle="A little about you. A workspace that works your way."
      />
      <div className="profile-columns">
        <section className="panel researcher-card">
          <div className="profile-cover">
            <div className="cover-circle" />
            <span>BIOTRACK RESEARCH LAB</span>
          </div>
          <div className="researcher-content">
            <div className="avatar avatar-large">
              AM
              <span>
                <Check size={12} />
              </span>
            </div>
            <h2>{preferences.name}</h2>
            <p>Biomedical Researcher</p>
            <span className="researcher-badge">Fictional researcher</span>
            <div className="profile-lab">
              <Building2 size={20} />
              <div>
                <small>LABORATORY</small>
                <strong>BioTrack Research Lab</strong>
              </div>
            </div>
            <div className="profile-local">
              <ShieldCheck size={16} />
              Local-only demonstration profile
            </div>
          </div>
        </section>
        <form className="panel preferences-panel" onSubmit={save}>
          <h2>Make yourself at home</h2>
          <p className="section-subtitle">
            Personalize your laboratory workspace
          </p>
          <label className="profile-name-label">
            Display name
            <input
              required
              maxLength={60}
              value={draft.name}
              onChange={(event) =>
                setDraft({ ...draft, name: event.target.value })
              }
            />
            <small>Use a fictional researcher identity.</small>
          </label>
          <div className="preference-row">
            <span className="round-icon mint">
              <Bell size={19} />
            </span>
            <div>
              <strong>Activity reminders</strong>
              <p>Show in-app lab task reminders</p>
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
      <div className="notice">
        <ShieldCheck size={19} />
        <p>
          No sign-in needed. Your fictional samples and preferences stay in this
          browser. This prototype does not sync between devices.
        </p>
      </div>
    </>
  );
}
