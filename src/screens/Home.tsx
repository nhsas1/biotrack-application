import {
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  Check,
  ClipboardList,
  FlaskConical,
  Plus,
  Sparkles,
  TestTubeDiagonal,
} from "lucide-react";
import {
  today,
  type Experiment,
  type ResearcherProfile,
  type Sample,
  type Task,
} from "../lib/data";
import {
  Badge,
  EmptyState,
  formatDate,
  PageHeading,
  Progress,
  SampleIcon,
  SectionTitle,
} from "../components/ui";

type Props = {
  samples: Sample[];
  experiments: Experiment[];
  profile: ResearcherProfile;
  tasks: Task[];
  toggleTask: (id: string) => void;
  navigate: (path: string) => void;
  dateFormat: string;
};
export default function Home({
  samples,
  experiments,
  profile,
  tasks,
  toggleTask,
  navigate,
  dateFormat,
}: Props) {
  const pending = tasks.filter((task) => !task.done).length;
  const recent = samples.slice(0, 4);
  const activeExperiments = experiments.filter(
    (experiment) => experiment.status !== "Completed",
  );
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const thisWeek = samples.filter(
    (sample) => new Date(sample.created_at) >= weekAgo,
  ).length;
  return (
    <>
      <PageHeading
        eyebrow="YOUR LAB, AT A GLANCE"
        title={`Welcome back, ${profile.full_name}!`}
        subtitle="A clear view of your samples, experiments, and what’s next."
      >
        <button
          className="primary-button"
          onClick={() => navigate("/samples/new")}
        >
          <Plus size={18} />
          Add New Sample
        </button>
      </PageHeading>
      <div className="day-line">
        <CalendarDays size={15} />
        <span>
          {new Date(`${today()}T12:00:00`).toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
            year: "numeric",
          })}
        </span>
        <span className="day-separator">·</span>
        <span>{profile.laboratory}</span>
      </div>
      <div className="stats-row">
        <button className="stat-card" onClick={() => navigate("/samples")}>
          <div className="stat-top">
            <span className="round-icon mint">
              <TestTubeDiagonal size={21} />
            </span>
            <ArrowUpRight size={17} />
          </div>
          <div className="stat-value">
            {samples.length}
            <span className="stat-trend">+{thisWeek} this week</span>
          </div>
          <p>Total Samples</p>
          <div className="stat-bottom">Organized and ready for research</div>
        </button>
        <button className="stat-card" onClick={() => navigate("/experiments")}>
          <div className="stat-top">
            <span className="round-icon blue">
              <FlaskConical size={21} />
            </span>
            <ArrowUpRight size={17} />
          </div>
          <div className="stat-value">
            {activeExperiments.length}
            <span className="stat-tag">In the lab</span>
          </div>
          <p>Active Experiments</p>
          <div className="stat-bottom">Planned or in progress</div>
        </button>
        <button
          className="stat-card"
          onClick={() =>
            document
              .getElementById("pending-tasks")
              ?.scrollIntoView({ behavior: "smooth", block: "center" })
          }
        >
          <div className="stat-top">
            <span className="round-icon amber">
              <ClipboardList size={21} />
            </span>
            <ArrowUpRight size={17} />
          </div>
          <div className="stat-value">
            {pending}
            <span className="stat-tag amber-text">Needs attention</span>
          </div>
          <p>Pending Tasks</p>
          <div className="stat-bottom">
            {pending
              ? "A few local demo reminders on your radar"
              : "Everything is taken care of"}
          </div>
        </button>
      </div>
      <div className="research-banner">
        <span className="banner-symbol">
          <Sparkles size={22} />
        </span>
        <div>
          <strong>Less admin. More discovery.</strong>
          <p>Your lab work, thoughtfully organized in one place.</p>
        </div>
        <span className="banner-chip">
          <span />
          Your workspace is ready
        </span>
      </div>
      <div className="dashboard-columns">
        <section className="panel activity-panel">
          <SectionTitle
            title="Recent activities"
            action="View samples"
            onAction={() => navigate("/samples")}
          />
          <p className="section-subtitle">
            Your most recently registered samples
          </p>
          <div className="activity-list">
            {recent.map((sample) => (
              <button
                className="activity-item"
                key={sample.id}
                onClick={() => navigate(`/samples/${sample.id}`)}
              >
                <SampleIcon type={sample.sample_type} />
                <div className="activity-info">
                  <strong>Sample registered</strong>
                  <p>
                    {sample.sample_code}
                    <span>·</span>
                    {sample.sample_type} sample
                  </p>
                  <small>
                    {formatDate(sample.created_at.slice(0, 10), dateFormat)}
                  </small>
                </div>
                <span className="activity-status">
                  <Badge status={sample.status} />
                </span>
                <ArrowRight className="activity-arrow" size={17} />
              </button>
            ))}
            {!recent.length && (
              <EmptyState
                title="No samples yet"
                description="Your live sample total is 0. Add a fictional sample to get started."
                action="Add Sample"
                onAction={() => navigate("/samples/new")}
              />
            )}
          </div>
          <div className="panel-footnote">
            <span className="tiny-dot" />
            Your account's fictional sample records
          </div>
        </section>
        <section className="panel experiment-overview">
          <SectionTitle
            title="In the lab"
            action="View all"
            onAction={() => navigate("/experiments")}
          />
          <p className="section-subtitle">
            Keep your experiments moving forward
          </p>
          {activeExperiments.slice(0, 2).map((experiment) => (
            <button
              className="mini-experiment"
              key={experiment.id}
              onClick={() => navigate(`/experiments/${experiment.id}`)}
            >
              <div className="mini-experiment-top">
                <span className="round-icon mint">
                  <FlaskConical size={18} />
                </span>
                <div>
                  <strong>{experiment.title}</strong>
                  <small>{experiment.experiment_type}</small>
                </div>
                <ArrowUpRight size={16} />
              </div>
              <div className="progress-caption">
                <span>{experiment.status}</span>
                <strong>{experiment.progress}%</strong>
              </div>
              <Progress value={experiment.progress} />
            </button>
          ))}
          {!activeExperiments.length && (
            <EmptyState
              title="No active experiments"
              description="Planned and in-progress experiments appear here."
              action="Manage experiments"
              onAction={() => navigate("/experiments")}
            />
          )}
          <button
            className="all-experiments"
            onClick={() => navigate("/experiments")}
          >
            Explore all experiments
            <ArrowRight size={16} />
          </button>
        </section>
      </div>
      <section className="panel tasks-panel" id="pending-tasks">
        <SectionTitle title="On your radar" />
        <span className="task-count">{pending} pending</span>
        <p className="section-subtitle">
          Four fictional reminders, saved only on this device
        </p>
        <div className="tasks-grid">
          {tasks.map((task) => (
            <button
              key={task.id}
              className={`task-item ${task.done ? "done" : ""}`}
              onClick={() => toggleTask(task.id)}
              aria-pressed={task.done}
            >
              <span className="task-checkbox">
                {task.done && <Check size={13} />}
              </span>
              <span>
                <strong>{task.title}</strong>
                <small>{task.subtitle}</small>
              </span>
            </button>
          ))}
        </div>
      </section>
      <p className="demo-note">
        Sample and experiment totals reflect your account's actual records. The
        four pending-task reminders are local, fictional examples, not database
        tasks.
      </p>
    </>
  );
}
