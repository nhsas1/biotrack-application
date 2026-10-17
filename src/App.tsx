import { useEffect, useRef, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import {
  Bell,
  Check,
  ChevronDown,
  Dna,
  FlaskConical,
  House,
  Info,
  Leaf,
  RefreshCw,
  ShieldCheck,
  TestTubeDiagonal,
  UserRound,
  X,
} from "lucide-react";
import {
  initialPreferences,
  initialTasks,
  initials,
  type Experiment,
  type ExperimentDraft,
  type ProfileDraft,
  type ResearcherProfile,
  type Sample,
  type SampleDraft,
} from "./lib/data";
import * as api from "./lib/api";
import { supabase } from "./lib/supabase";
import { useLocalStorage } from "./lib/storage";
import Home from "./screens/Home";
import Samples, { AddSample, SampleDetails } from "./screens/Samples";
import Experiments, { ExperimentDetails } from "./screens/Experiments";
import Profile from "./screens/Profile";
import Auth from "./screens/Auth";

const tabs = [
  { path: "/", title: "Home", icon: House },
  { path: "/samples", title: "Samples", icon: TestTubeDiagonal },
  { path: "/experiments", title: "Experiments", icon: FlaskConical },
  { path: "/profile", title: "Profile", icon: UserRound },
];
type Workspace = {
  ownerId: string;
  samples: Sample[];
  experiments: Experiment[];
  profile: ResearcherProfile;
};

export default function App() {
  const [path, setPath] = useState(window.location.pathname);
  const [session, setSession] = useState<Session | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [authError, setAuthError] = useState("");
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [loading, setLoading] = useState(false);
  const [dataError, setDataError] = useState("");
  const [refresh, setRefresh] = useState(0);
  const loadVersion = useRef(0);
  const [preferences, setPreferences] = useLocalStorage(
    "biotrack.preferences.v1",
    initialPreferences,
  );
  const [tasks, setTasks] = useLocalStorage("biotrack.tasks.v1", initialTasks);
  const [toast, setToast] = useState("");
  const [panel, setPanel] = useState<"notifications" | "about" | null>(null);
  const userId = session?.user.id;
  const currentUserId = useRef(userId);
  currentUserId.current = userId;
  const ownWorkspace = workspace?.ownerId === userId ? workspace : null;
  const profile = ownWorkspace?.profile;
  const active =
    tabs.find((tab) => tab.path !== "/" && path.startsWith(tab.path))?.path ??
    "/";
  const pending = tasks.filter((task) => !task.done).length;
  const notificationTasks = preferences.notifications
    ? tasks.filter((task) => !task.done)
    : [];
  const notify = (message: string) => setToast(message);

  useEffect(() => {
    if (!supabase) {
      setAuthReady(true);
      return;
    }
    let mounted = true;
    let authEvents = 0;
    // Keep this callback synchronous: database requests run in the separate effect.
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, next) => {
      authEvents += 1;
      if (!mounted) return;
      setSession(next);
      setAuthReady(true);
      setAuthError("");
      if (!next) {
        setWorkspace(null);
        setDataError("");
        setPanel(null);
        setToast("");
      }
    });
    void supabase.auth
      .getSession()
      .then(({ data, error }) => {
        if (!mounted || authEvents > 0) return;
        if (error) throw error;
        setSession(data.session);
        setAuthReady(true);
      })
      .catch((error: unknown) => {
        if (!mounted || authEvents > 0) return;
        setAuthError(
          `Could not restore your session: ${api.errorMessage(error)}`,
        );
        setAuthReady(true);
      });
    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    const version = ++loadVersion.current;
    let mounted = true;
    if (!userId || !session) {
      setWorkspace(null);
      setLoading(false);
      setDataError("");
      return;
    }
    const user = session.user;
    setLoading(true);
    setDataError("");
    void Promise.all([
      api.listSamples(userId),
      api.listExperiments(userId),
      api.ensureProfile(user),
    ])
      .then(([samples, experiments, researcher]) => {
        if (mounted && version === loadVersion.current)
          setWorkspace({
            ownerId: userId,
            samples,
            experiments,
            profile: researcher,
          });
      })
      .catch((error: unknown) => {
        if (mounted && version === loadVersion.current)
          setDataError(api.errorMessage(error));
      })
      .finally(() => {
        if (mounted && version === loadVersion.current) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [userId, refresh]);

  useEffect(() => {
    if (!userId) return;
    const update = () => {
      if (document.visibilityState === "visible")
        setRefresh((value) => value + 1);
    };
    window.addEventListener("focus", update);
    return () => window.removeEventListener("focus", update);
  }, [userId]);
  useEffect(() => {
    const update = () => setPath(window.location.pathname);
    window.addEventListener("popstate", update);
    return () => window.removeEventListener("popstate", update);
  }, []);
  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(""), 3500);
    return () => window.clearTimeout(timer);
  }, [toast]);
  useEffect(() => {
    if (!panel) return;
    const close = (event: KeyboardEvent) => {
      if (event.key === "Escape") setPanel(null);
    };
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, [panel]);

  function navigate(next: string) {
    window.history.pushState({}, "", next);
    setPath(next);
    setPanel(null);
    window.scrollTo({
      top: 0,
      behavior: preferences.compact ? "instant" : "smooth",
    });
  }
  function requireOwner() {
    if (!userId) throw new Error("Please sign in to continue.");
    return userId;
  }
  function acceptMutation(owner: string) {
    if (currentUserId.current !== owner) return false;
    ++loadVersion.current;
    setLoading(false);
    setDataError("");
    return true;
  }
  async function saveSample(draft: SampleDraft, id?: string) {
    const owner = requireOwner();
    const saved = await api.saveSample(owner, draft, id);
    if (!acceptMutation(owner)) return;
    setWorkspace((current) =>
      current?.ownerId === owner
        ? {
            ...current,
            samples: id
              ? current.samples.map((sample) =>
                  sample.id === id ? saved : sample,
                )
              : [saved, ...current.samples],
          }
        : current,
    );
    if (!id) navigate("/samples");
    notify(`${saved.sample_code} ${id ? "updated" : "added to your samples"}`);
  }
  async function deleteSample(id: string) {
    const owner = requireOwner();
    await api.deleteSample(owner, id);
    if (!acceptMutation(owner)) return;
    setWorkspace((current) =>
      current?.ownerId === owner
        ? {
            ...current,
            samples: current.samples.filter((sample) => sample.id !== id),
          }
        : current,
    );
    navigate("/samples");
    notify("Sample deleted");
  }
  async function saveExperiment(draft: ExperimentDraft, id?: string) {
    const owner = requireOwner();
    const saved = await api.saveExperiment(owner, draft, id);
    if (!acceptMutation(owner)) return;
    setWorkspace((current) =>
      current?.ownerId === owner
        ? {
            ...current,
            experiments: id
              ? current.experiments.map((experiment) =>
                  experiment.id === id ? saved : experiment,
                )
              : [saved, ...current.experiments],
          }
        : current,
    );
    if (!id) navigate(`/experiments/${saved.id}`);
    notify(`Experiment ${id ? "updated" : "added"}`);
  }
  async function deleteExperiment(id: string) {
    const owner = requireOwner();
    await api.deleteExperiment(owner, id);
    if (!acceptMutation(owner)) return;
    setWorkspace((current) =>
      current?.ownerId === owner
        ? {
            ...current,
            experiments: current.experiments.filter(
              (experiment) => experiment.id !== id,
            ),
          }
        : current,
    );
    navigate("/experiments");
    notify("Experiment deleted");
  }
  async function saveProfile(draft: ProfileDraft) {
    const owner = requireOwner();
    const saved = await api.saveProfile(owner, draft);
    if (!acceptMutation(owner)) return;
    setWorkspace((current) =>
      current?.ownerId === owner ? { ...current, profile: saved } : current,
    );
    notify("Your researcher profile has been saved");
  }
  async function logout() {
    if (!supabase) return;
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    setWorkspace(null);
    setSession(null);
    setDataError("");
    navigate("/");
  }

  let content;
  if (!authReady) {
    content = (
      <div className="panel loading-state" role="status">
        <Dna size={28} />
        <h2>Restoring your session…</h2>
        <p>Connecting to your laboratory workspace.</p>
      </div>
    );
  } else if (!session) {
    content = <Auth sessionError={authError} />;
  } else if (!ownWorkspace) {
    content = dataError ? (
      <div className="panel loading-state">
        <h2>We couldn't load your workspace</h2>
        <p className="form-error" role="alert">
          {dataError}
        </p>
        <button
          className="primary-button"
          onClick={() => setRefresh((value) => value + 1)}
        >
          <RefreshCw size={17} />
          Try again
        </button>
        <button
          className="secondary-button"
          onClick={() =>
            void logout().catch((error: unknown) =>
              setDataError(api.errorMessage(error)),
            )
          }
        >
          Sign out
        </button>
      </div>
    ) : (
      <div className="panel loading-state" role="status">
        <FlaskConical size={28} />
        <h2>Loading your laboratory…</h2>
        <p>Retrieving your samples, experiments, and researcher profile.</p>
      </div>
    );
  } else {
    const { samples, experiments, profile: researcher } = ownWorkspace;
    if (path === "/samples/new") {
      content = (
        <AddSample
          samples={samples}
          onSave={(draft) => saveSample(draft)}
          navigate={navigate}
        />
      );
    } else if (path.startsWith("/samples/")) {
      const id = path.split("/")[2];
      // UUIDs are canonical routes; sample-code links from the old UI still resolve.
      const sample = samples.find(
        (item) => item.id === id || encodeURIComponent(item.sample_code) === id,
      );
      content = (
        <SampleDetails
          sample={sample}
          samples={samples}
          navigate={navigate}
          dateFormat={preferences.dateFormat}
          onSave={(draft) => {
            if (!sample) return Promise.reject(new Error("Sample not found."));
            return saveSample(draft, sample.id);
          }}
          onDelete={() => {
            if (!sample) return Promise.reject(new Error("Sample not found."));
            return deleteSample(sample.id);
          }}
        />
      );
    } else if (path === "/samples") {
      content = (
        <Samples
          samples={samples}
          navigate={navigate}
          dateFormat={preferences.dateFormat}
        />
      );
    } else if (path.startsWith("/experiments/")) {
      const id = path.split("/")[2];
      content = (
        <ExperimentDetails
          experiment={experiments.find((experiment) => experiment.id === id)}
          navigate={navigate}
          dateFormat={preferences.dateFormat}
          profile={researcher}
          onSave={(draft) => saveExperiment(draft, id)}
          onDelete={() => deleteExperiment(id)}
        />
      );
    } else if (path === "/experiments") {
      content = (
        <Experiments
          experiments={experiments}
          navigate={navigate}
          dateFormat={preferences.dateFormat}
          profile={researcher}
          onCreate={(draft) => saveExperiment(draft)}
        />
      );
    } else if (path === "/profile") {
      content = (
        <Profile
          profile={researcher}
          email={session.user.email ?? ""}
          preferences={preferences}
          onSave={setPreferences}
          onSaveProfile={saveProfile}
          onLogout={logout}
          notify={notify}
        />
      );
    } else {
      content = (
        <Home
          samples={samples}
          experiments={experiments}
          profile={researcher}
          tasks={tasks}
          toggleTask={(id) =>
            setTasks((current) =>
              current.map((task) =>
                task.id === id ? { ...task, done: !task.done } : task,
              ),
            )
          }
          navigate={navigate}
          dateFormat={preferences.dateFormat}
        />
      );
    }
  }

  function renderTabs() {
    return tabs.map(({ path: target, title, icon: Icon }) => (
      <a
        key={target}
        href={target}
        className={`nav-item ${active === target ? "active" : ""}`}
        aria-current={active === target ? "page" : undefined}
        onClick={(event) => {
          event.preventDefault();
          navigate(target);
        }}
      >
        <Icon size={21} strokeWidth={1.8} />
        <span>{title}</span>
        {active === target && <span className="nav-active-mark" />}
      </a>
    ));
  }
  return (
    <div className={`app ${preferences.compact ? "compact" : ""}`}>
      <aside className="sidebar">
        <button
          className="brand"
          onClick={() => navigate("/")}
          aria-label="BioTrack home"
        >
          <span className="brand-mark">
            <Dna size={27} strokeWidth={1.8} />
          </span>
          <span>
            Bio<span className="brand-teal">Track</span>
          </span>
        </button>
        <div className="workspace-label">LABORATORY WORKSPACE</div>
        <nav className="desktop-nav" aria-label="Main navigation">
          {renderTabs()}
        </nav>
        <div className="sidebar-bottom">
          <div className="lab-card">
            <span className="lab-icon">
              <Leaf size={20} />
            </span>
            <strong>{profile?.laboratory || "BioTrack Research Lab"}</strong>
            <p>A space for discovery.</p>
            <div className="lab-status">
              <span />
              {session ? "Account workspace" : "Sign-in required"}
            </div>
          </div>
          <button className="help-link" onClick={() => setPanel("about")}>
            <Info size={17} />
            About BioTrack
            <ChevronDown size={15} />
          </button>
          <div className="sidebar-footer">
            BioTrack <span>v1.0</span>
          </div>
        </div>
      </aside>
      <div className="workspace">
        <header className="topbar">
          <div className="mobile-brand">
            <Dna size={24} />
            <strong>BioTrack</strong>
          </div>
          <div className="topbar-page">
            Research workspace<span className="topbar-divider">/</span>
            <strong>{tabs.find((tab) => tab.path === active)?.title}</strong>
          </div>
          <div className="topbar-actions">
            <span className="demo-pill">
              <span />
              Fictional data only
            </span>
            {session && (
              <button
                className="icon-button"
                aria-label="Refresh workspace"
                title="Refresh workspace"
                disabled={loading}
                onClick={() => setRefresh((value) => value + 1)}
              >
                <RefreshCw size={18} className={loading ? "refreshing" : ""} />
              </button>
            )}
            <button
              className="icon-button notification-button"
              aria-label="View notifications"
              onClick={() => setPanel("notifications")}
            >
              <Bell size={20} />
              {preferences.notifications && pending > 0 && (
                <span className="notification-dot" />
              )}
            </button>
            <button
              className="avatar avatar-small"
              aria-label="Open researcher profile"
              onClick={() => navigate("/profile")}
            >
              {initials(profile?.full_name || "Researcher")}
            </button>
          </div>
        </header>
        <main className="main-content" key={path}>
          {ownWorkspace && loading && (
            <p className="sync-status" role="status">
              Refreshing your laboratory records…
            </p>
          )}
          {ownWorkspace && dataError && (
            <div className="form-error sync-error" role="alert">
              <span>Couldn't refresh: {dataError}</span>
              <button
                className="text-button"
                onClick={() => setRefresh((value) => value + 1)}
              >
                Retry
              </button>
            </div>
          )}
          {content}
        </main>
        <footer className="workspace-footer">
          <span>
            <ShieldCheck size={14} />
            Fictional data. Real possibilities.
          </span>
          <span>Made for your next discovery.</span>
        </footer>
      </div>
      <nav className="bottom-nav" aria-label="Mobile navigation">
        {renderTabs()}
      </nav>
      {toast && (
        <div className="toast" role="status">
          <Check size={18} />
          {toast}
          <button aria-label="Dismiss message" onClick={() => setToast("")}>
            <X size={16} />
          </button>
        </div>
      )}
      {panel && (
        <div className="modal-overlay" onClick={() => setPanel(null)}>
          <section
            className="modal-card"
            role="dialog"
            aria-modal="true"
            aria-label={panel === "about" ? "About BioTrack" : "Notifications"}
            onClick={(event) => event.stopPropagation()}
          >
            <button
              className="icon-button modal-close"
              aria-label="Close dialog"
              onClick={() => setPanel(null)}
              autoFocus
            >
              <X size={20} />
            </button>
            {panel === "about" ? (
              <>
                <span className="brand-mark">
                  <Dna size={27} />
                </span>
                <h2>Your laboratory, connected.</h2>
                <p>
                  BioTrack is a simple workspace for managing fictional
                  biological samples and experiments.
                </p>
                <div className="notice">
                  <ShieldCheck size={20} />
                  <p>
                    Use fictional records and researcher names only. Never enter
                    real patient information. Samples, experiments, and your
                    profile are stored in Supabase and restricted to your
                    signed-in account. Preferences and the four illustrative
                    tasks stay in this browser.
                  </p>
                </div>
                <button
                  className="primary-button full-width"
                  onClick={() => setPanel(null)}
                >
                  Back to the lab
                </button>
              </>
            ) : (
              <>
                <p className="eyebrow">LOCAL LABORATORY REMINDERS</p>
                <h2>You're up to date.</h2>
                {preferences.notifications ? (
                  <>
                    <p>{pending} fictional lab tasks are waiting for you.</p>
                    <div className="notification-list">
                      {notificationTasks.map((task) => (
                        <button
                          key={task.id}
                          onClick={() => {
                            navigate("/");
                            window.setTimeout(
                              () =>
                                document
                                  .getElementById("pending-tasks")
                                  ?.scrollIntoView({ behavior: "smooth" }),
                              100,
                            );
                          }}
                        >
                          <span className="round-icon">
                            <FlaskConical size={18} />
                          </span>
                          <span>
                            <strong>{task.title}</strong>
                            <small>{task.subtitle}</small>
                          </span>
                        </button>
                      ))}
                      {pending === 0 && (
                        <div className="notice">
                          <Check size={20} />
                          All demo tasks are complete.
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <p>
                    In-app activity reminders are turned off in your
                    preferences. Turn them on from Profile to see local lab
                    reminders here.
                  </p>
                )}
                <button
                  className="secondary-button full-width"
                  onClick={() => navigate("/profile")}
                >
                  Manage preferences
                </button>
              </>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
