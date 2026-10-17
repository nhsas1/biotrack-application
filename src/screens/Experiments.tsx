import { useState } from "react";
import {
  ArrowRight,
  CalendarDays,
  Check,
  Clock3,
  FlaskConical,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { experiments, type Experiment } from "../lib/data";
import {
  BackButton,
  Badge,
  EmptyState,
  formatDate,
  PageHeading,
  Progress,
} from "../components/ui";
import { DetailItem } from "./Samples";

export default function Experiments({
  navigate,
}: {
  navigate: (path: string) => void;
}) {
  const [filter, setFilter] = useState("All Experiments");
  const shown = experiments.filter(
    (experiment) =>
      filter === "All Experiments" || experiment.status === filter,
  );
  return (
    <>
      <PageHeading
        eyebrow="FROM HYPOTHESIS TO DISCOVERY"
        title="Experiments"
        subtitle="Follow the progress of your science, step by step."
      />
      <div
        className="filter-tabs"
        role="group"
        aria-label="Experiment status filters"
      >
        {["All Experiments", "In Progress", "Planned", "Completed"].map(
          (status) => (
            <button
              key={status}
              className={filter === status ? "selected" : ""}
              onClick={() => setFilter(status)}
            >
              {status}
              <span>
                {status === "All Experiments"
                  ? experiments.length
                  : experiments.filter(
                      (experiment) => experiment.status === status,
                    ).length}
              </span>
            </button>
          ),
        )}
      </div>
      <div className="experiment-grid">
        {shown.map((experiment) => (
          <button
            className="panel experiment-card"
            key={experiment.id}
            onClick={() => navigate(`/experiments/${experiment.id}`)}
          >
            <div className="experiment-card-top">
              <span className="round-icon mint">
                <FlaskConical size={23} />
              </span>
              <Badge status={experiment.status} />
            </div>
            <p className="eyebrow">{experiment.id}</p>
            <h2>{experiment.name}</h2>
            <p className="experiment-description">{experiment.description}</p>
            <div className="progress-caption">
              <span>Overall progress</span>
              <strong>{experiment.progress}%</strong>
            </div>
            <Progress value={experiment.progress} />
            <div className="experiment-card-meta">
              <span>
                <CalendarDays size={15} />
                {formatDate(experiment.startDate)}
              </span>
              <span>
                <UserRound size={15} />
                A. Morgan
              </span>
            </div>
            <div className="experiment-card-bottom">
              <span>View experiment</span>
              <ArrowRight size={17} />
            </div>
          </button>
        ))}
      </div>
      {!shown.length && (
        <EmptyState
          title="No experiments here yet"
          description="Try another status to see your fictional experiments."
          action="Show all experiments"
          onAction={() => setFilter("All Experiments")}
        />
      )}
      <div className="notice subtle-notice">
        <ShieldCheck size={17} />
        <p>
          These are fictional experiment summaries, not instructions for
          clinical or biological research.
        </p>
      </div>
    </>
  );
}

export function ExperimentDetails({
  experiment,
  navigate,
  dateFormat,
}: {
  experiment?: Experiment;
  navigate: (path: string) => void;
  dateFormat: string;
}) {
  if (!experiment)
    return (
      <>
        <BackButton
          label="Back to experiments"
          onClick={() => navigate("/experiments")}
        />
        <EmptyState
          title="Experiment not found"
          description="This experiment isn't in the demo workspace."
          action="View experiments"
          onAction={() => navigate("/experiments")}
        />
      </>
    );
  return (
    <>
      <BackButton
        label="Back to experiments"
        onClick={() => navigate("/experiments")}
      />
      <PageHeading
        eyebrow={`EXPERIMENT RECORD · ${experiment.id}`}
        title={experiment.name}
        subtitle={experiment.description}
      >
        <Badge status={experiment.status} />
      </PageHeading>
      <div className="experiment-detail-columns">
        <section className="panel detail-panel">
          <h2>Experiment overview</h2>
          <div className="detail-grid">
            <DetailItem
              label="Start date"
              value={formatDate(experiment.startDate, dateFormat)}
            />
            <DetailItem label="Research lead" value={experiment.lead} />
            <DetailItem
              label="Protocol reference"
              value={experiment.protocol}
            />
            <DetailItem label="Laboratory" value="BioTrack Research Lab" />
          </div>
          <div className="progress-caption">
            <span>Overall progress</span>
            <strong>{experiment.progress}%</strong>
          </div>
          <Progress value={experiment.progress} />
          <div className="detail-notes">
            <h3>Linked samples</h3>
            <div className="linked-samples">
              {experiment.samples.map((id) => (
                <button
                  key={id}
                  className="sample-link"
                  onClick={() => navigate(`/samples/${id}`)}
                >
                  {id}
                  <ArrowRight size={14} />
                </button>
              ))}
            </div>
          </div>
        </section>
        <section className="panel protocol-panel">
          <h2>Experiment timeline</h2>
          <p className="section-subtitle">A fictional workflow overview</p>
          <ol className="protocol-steps">
            {experiment.steps.map((step, index) => (
              <li
                key={step}
                className={
                  index < experiment.currentStep
                    ? "complete"
                    : index === experiment.currentStep &&
                        experiment.status === "In Progress"
                      ? "current"
                      : ""
                }
              >
                <span>
                  {index < experiment.currentStep ? (
                    <Check size={15} />
                  ) : index === experiment.currentStep &&
                    experiment.status === "In Progress" ? (
                    <Clock3 size={15} />
                  ) : (
                    index + 1
                  )}
                </span>
                <div>
                  <strong>{step}</strong>
                  <small>
                    {index < experiment.currentStep
                      ? "Complete"
                      : index === experiment.currentStep &&
                          experiment.status === "In Progress"
                        ? "In progress"
                        : "Upcoming"}
                  </small>
                </div>
              </li>
            ))}
          </ol>
        </section>
      </div>
      <div className="notice">
        <ShieldCheck size={19} />
        <p>
          Demonstration record only. Experiment information is fictional and
          does not provide an operational laboratory protocol.
        </p>
      </div>
      <button
        className="secondary-button"
        onClick={() => navigate("/experiments")}
      >
        Back to experiments
        <ArrowRight size={17} />
      </button>
    </>
  );
}
