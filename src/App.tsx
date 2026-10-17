import { useEffect, useState } from "react";
import {
  Bell,
  Check,
  ChevronDown,
  Dna,
  FlaskConical,
  House,
  Info,
  Leaf,
  Plus,
  ShieldCheck,
  TestTubeDiagonal,
  UserRound,
  X,
} from "lucide-react";
import {
  experiments,
  initialPreferences,
  initialSamples,
  initialTasks,
  type Sample,
} from "./lib/data";
import { useLocalStorage } from "./lib/storage";
import Home from "./screens/Home";
import Samples, { AddSample, SampleDetails } from "./screens/Samples";
import Experiments, { ExperimentDetails } from "./screens/Experiments";
import Profile from "./screens/Profile";

const tabs = [
  { path: "/", title: "Home", icon: House },
  { path: "/samples", title: "Samples", icon: TestTubeDiagonal },
  { path: "/experiments", title: "Experiments", icon: FlaskConical },
  { path: "/profile", title: "Profile", icon: UserRound },
];

export default function App() {
  const [path, setPath] = useState(window.location.pathname);
  const [samples, setSamples] = useLocalStorage(
    "biotrack.samples.v1",
    initialSamples,
  );
  const [preferences, setPreferences] = useLocalStorage(
    "biotrack.preferences.v1",
    initialPreferences,
  );
  const [tasks, setTasks] = useLocalStorage("biotrack.tasks.v1", initialTasks);
  const [toast, setToast] = useState("");
  const [panel, setPanel] = useState<"notifications" | "about" | null>(null);
  const active =
    tabs.find((tab) => tab.path !== "/" && path.startsWith(tab.path))?.path ??
    "/";
  const pending = tasks.filter((task) => !task.done).length;
  const notificationTasks = preferences.notifications
    ? tasks.filter((task) => !task.done)
    : [];
  const notify = (message: string) => setToast(message);

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

  function addSample(sample: Sample) {
    setSamples((previous) => [sample, ...previous]);
    navigate("/samples");
    notify(`${sample.id} added to your samples`);
  }

  let content;
  if (path === "/samples/new") {
    content = (
      <AddSample samples={samples} onSave={addSample} navigate={navigate} />
    );
  } else if (path.startsWith("/samples/")) {
    const sampleId = decodeURIComponent(path.split("/")[2]);
    content = (
      <SampleDetails
        sample={samples.find((sample) => sample.id === sampleId)}
        navigate={navigate}
        dateFormat={preferences.dateFormat}
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
    const experimentId = path.split("/")[2];
    content = (
      <ExperimentDetails
        experiment={experiments.find(
          (experiment) => experiment.id === experimentId,
        )}
        navigate={navigate}
        dateFormat={preferences.dateFormat}
      />
    );
  } else if (path === "/experiments") {
    content = <Experiments navigate={navigate} />;
  } else if (path === "/profile") {
    content = (
      <Profile
        preferences={preferences}
        onSave={setPreferences}
        notify={notify}
      />
    );
  } else {
    content = (
      <Home
        samples={samples}
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
            <strong>BioTrack Research Lab</strong>
            <p>A space for discovery.</p>
            <div className="lab-status">
              <span />
              Demo workspace
            </div>
          </div>
          <button className="help-link" onClick={() => setPanel("about")}>
            <Info size={17} />
            About this prototype
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
              Demo mode
            </span>
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
              AM
            </button>
          </div>
        </header>
        <main className="main-content" key={path}>
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
                  BioTrack is a simple demonstration workspace for managing
                  fictional biological samples and experiments.
                </p>
                <div className="notice">
                  <ShieldCheck size={20} />
                  <p>
                    All records and researcher identities are fictional. Never
                    enter real patient information. Changes stay in this browser
                    only; no accounts, databases, external APIs, or AI are
                    connected.
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
                <p className="eyebrow">LABORATORY UPDATES</p>
                <h2>You're up to date.</h2>
                {preferences.notifications ? (
                  <>
                    <p>{pending} lab tasks are waiting for you.</p>
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
                    preferences. Turn them on from Profile to see lab updates
                    here.
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
