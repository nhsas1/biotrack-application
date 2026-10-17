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
import { experiments, type Sample, type Task } from "../lib/data";
import {
  Badge,
  PageHeading,
  Progress,
  SampleIcon,
  SectionTitle,
} from "../components/ui";

type Props = {
  samples: Sample[];
  tasks: Task[];
  toggleTask: (id: string) => void;
  navigate: (path: string) => void;
  dateFormat: string;
};

export default function Home({ samples, tasks, toggleTask, navigate }: Props) {
  const pending = tasks.filter((task) => !task.done).length;
  const recent = samples.slice(0, 4);
  return (
    <>
      <PageHeading
        eyebrow="YOUR LAB, AT A GLANCE"
        title="Welcome back, Researcher!"
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
        <span>Saturday, October 17, 2026</span>
        <span className="day-separator">·</span>
        <span>BioTrack Research Lab</span>
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
            {48 + samples.length - 8}
            <span className="stat-trend">
              +{4 + samples.length - 8} this week
            </span>
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
            6<span className="stat-tag">In the lab</span>
          </div>
          <p>Active Experiments</p>
          <div className="stat-bottom">Good science, one step at a time</div>
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
              ? "A few things on your radar"
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
          <p className="section-subtitle">The latest from your laboratory</p>
          <div className="activity-list">
            {recent.map((sample, index) => (
              <button
                className="activity-item"
                key={sample.id}
                onClick={() => navigate(`/samples/${sample.id}`)}
              >
                <SampleIcon type={sample.type} />
                <div className="activity-info">
                  <strong>
                    {index === 1
                      ? "Sample processing updated"
                      : "New sample registered"}
                  </strong>
                  <p>
                    {sample.id}
                    <span>·</span>
                    {sample.name}
                  </p>
                  <small>
                    {index === 0
                      ? "12 minutes ago"
                      : index === 1
                        ? "45 minutes ago"
                        : index === 2
                          ? "2 hours ago"
                          : "3 hours ago"}
                  </small>
                </div>
                <span className="activity-status">
                  <Badge status={sample.status} />
                </span>
                <ArrowRight className="activity-arrow" size={17} />
              </button>
            ))}
          </div>
          <div className="panel-footnote">
            <span className="tiny-dot" />
            Showing fictional demo activity
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
          {experiments
            .filter((experiment) => experiment.status === "In Progress")
            .slice(0, 2)
            .map((experiment) => (
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
                    <strong>{experiment.name}</strong>
                    <small>{experiment.id} · Molecular biology</small>
                  </div>
                  <ArrowUpRight size={16} />
                </div>
                <div className="progress-caption">
                  <span>In Progress</span>
                  <strong>{experiment.progress}%</strong>
                </div>
                <Progress value={experiment.progress} />
              </button>
            ))}
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
          Small steps that keep your research on track
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
        Lab summary uses illustrative totals. The Samples tab contains 8 example
        records, plus any samples you add.
      </p>
    </>
  );
}
