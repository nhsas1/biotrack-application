import { useEffect, useState, type FormEvent } from "react";
import {
  ArrowRight,
  CalendarDays,
  FlaskConical,
  Pencil,
  Plus,
  Save,
  ShieldCheck,
  Trash2,
  UserRound,
} from "lucide-react";
import {
  experimentStatuses,
  type Experiment,
  type ExperimentDraft,
  type ExperimentStatus,
  type ResearcherProfile,
} from "../lib/data";
import { errorMessage } from "../lib/api";
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
  experiments,
  navigate,
  dateFormat,
  profile,
  onCreate,
}: {
  experiments: Experiment[];
  navigate: (path: string) => void;
  dateFormat: string;
  profile: ResearcherProfile;
  onCreate: (draft: ExperimentDraft) => Promise<void>;
}) {
  const [filter, setFilter] = useState("All Experiments");
  const [creating, setCreating] = useState(false);
  const shown = experiments.filter(
    (experiment) =>
      filter === "All Experiments" || experiment.status === filter,
  );
  if (creating)
    return (
      <>
        <BackButton
          label="Back to experiments"
          onClick={() => setCreating(false)}
        />
        <PageHeading
          eyebrow="START YOUR NEXT DISCOVERY"
          title="Add an experiment"
          subtitle="Organize a fictional experiment in your laboratory workspace."
        />
        <ExperimentForm onSave={onCreate} onCancel={() => setCreating(false)} />
      </>
    );
  return (
    <>
      <PageHeading
        eyebrow="FROM HYPOTHESIS TO DISCOVERY"
        title="Experiments"
        subtitle="Follow the progress of your science, step by step."
      >
        <button className="primary-button" onClick={() => setCreating(true)}>
          <Plus size={18} />
          Add Experiment
        </button>
      </PageHeading>
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
              aria-pressed={filter === status}
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
            <p className="eyebrow">{experiment.experiment_type}</p>
            <h2>{experiment.title}</h2>
            <p className="experiment-description">
              {experiment.description || "No description added yet."}
            </p>
            <div className="progress-caption">
              <span>Overall progress</span>
              <strong>{experiment.progress}%</strong>
            </div>
            <Progress value={experiment.progress} />
            <div className="experiment-card-meta">
              <span>
                <CalendarDays size={15} />
                {formatDate(experiment.created_at.slice(0, 10), dateFormat)}
              </span>
              <span>
                <UserRound size={15} />
                {profile.full_name}
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
          description={
            experiments.length
              ? "Try another status to see your experiments."
              : "Add your first fictional experiment. Your account starts with no example records."
          }
          action={
            experiments.length ? "Show all experiments" : "Add Experiment"
          }
          onAction={
            experiments.length
              ? () => setFilter("All Experiments")
              : () => setCreating(true)
          }
        />
      )}
      <div className="notice subtle-notice">
        <ShieldCheck size={17} />
        <p>
          Fictional experiment summaries only, not instructions for clinical or
          biological research. Records sync with your account.
        </p>
      </div>
    </>
  );
}

export function ExperimentDetails({
  experiment,
  navigate,
  dateFormat,
  profile,
  onSave,
  onDelete,
}: {
  experiment?: Experiment;
  navigate: (path: string) => void;
  dateFormat: string;
  profile: ResearcherProfile;
  onSave: (draft: ExperimentDraft) => Promise<void>;
  onDelete: () => Promise<void>;
}) {
  const [editing, setEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  if (!experiment)
    return (
      <>
        <BackButton
          label="Back to experiments"
          onClick={() => navigate("/experiments")}
        />
        <EmptyState
          title="Experiment not found"
          description="This experiment isn't available in your account."
          action="View experiments"
          onAction={() => navigate("/experiments")}
        />
      </>
    );
  async function remove() {
    setBusy(true);
    setError("");
    try {
      await onDelete();
    } catch (cause) {
      setError(errorMessage(cause));
      setBusy(false);
    }
  }
  if (editing)
    return (
      <>
        <BackButton
          label="Back to experiment"
          onClick={() => setEditing(false)}
        />
        <PageHeading
          eyebrow="UPDATE YOUR EXPERIMENT"
          title={`Edit ${experiment.title}`}
          subtitle="Keep the overview, status, and progress up to date."
        />
        <ExperimentForm
          initial={experiment}
          onSave={async (draft) => {
            await onSave(draft);
            setEditing(false);
          }}
          onCancel={() => setEditing(false)}
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
        eyebrow={`EXPERIMENT · ${experiment.experiment_type}`}
        title={experiment.title}
        subtitle={
          experiment.description || "Your fictional laboratory experiment."
        }
      >
        <div className="record-actions">
          <Badge status={experiment.status} />
          <button className="secondary-button" onClick={() => setEditing(true)}>
            <Pencil size={16} />
            Edit Experiment
          </button>
        </div>
      </PageHeading>
      <div className="experiment-detail-columns">
        <section className="panel detail-panel">
          <h2>Experiment overview</h2>
          <div className="detail-grid">
            <DetailItem
              label="Experiment type"
              value={experiment.experiment_type}
            />
            <DetailItem
              label="Created"
              value={formatDate(experiment.created_at.slice(0, 10), dateFormat)}
            />
            <DetailItem label="Researcher" value={profile.full_name} />
            <DetailItem label="Laboratory" value={profile.laboratory} />
            <DetailItem label="Status" value={experiment.status} />
          </div>
          <div className="progress-caption">
            <span>Overall progress</span>
            <strong>{experiment.progress}%</strong>
          </div>
          <Progress value={experiment.progress} />
          <div className="detail-notes">
            <h3>Description</h3>
            <p>{experiment.description || "No description added yet."}</p>
          </div>
        </section>
        <ProgressEditor experiment={experiment} onSave={onSave} />
      </div>
      <div className="notice">
        <ShieldCheck size={19} />
        <p>
          Demonstration record only. Experiment information is fictional and
          does not provide an operational laboratory protocol.
        </p>
      </div>
      <div className="record-actions">
        <button
          className="secondary-button"
          onClick={() => navigate("/experiments")}
        >
          Back to experiments
          <ArrowRight size={17} />
        </button>
        <button
          className="secondary-button danger-button"
          onClick={() => {
            setConfirmDelete(true);
            setError("");
          }}
        >
          <Trash2 size={16} />
          Delete Experiment
        </button>
      </div>
      {confirmDelete && (
        <div className="notice delete-confirm" role="alert">
          <div>
            <strong>Delete {experiment.title}?</strong>
            <p>This permanently removes the experiment from your account.</p>
          </div>
          <button
            className="secondary-button"
            disabled={busy}
            onClick={() => setConfirmDelete(false)}
          >
            Cancel
          </button>
          <button
            className="primary-button danger-button"
            disabled={busy}
            onClick={remove}
          >
            {busy ? "Deleting…" : "Delete permanently"}
          </button>
        </div>
      )}
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
    </>
  );
}

function ProgressEditor({
  experiment,
  onSave,
}: {
  experiment: Experiment;
  onSave: (draft: ExperimentDraft) => Promise<void>;
}) {
  const [status, setStatus] = useState(experiment.status);
  const [progress, setProgress] = useState(experiment.progress);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    setStatus(experiment.status);
    setProgress(experiment.progress);
  }, [experiment.status, experiment.progress]);
  async function submit(event: FormEvent) {
    event.preventDefault();
    setError("");
    if (!Number.isInteger(progress) || progress < 0 || progress > 100)
      return setError("Progress must be a whole number from 0 to 100.");
    setBusy(true);
    try {
      await onSave({
        title: experiment.title,
        experiment_type: experiment.experiment_type,
        description: experiment.description,
        status,
        progress,
      });
    } catch (cause) {
      setError(errorMessage(cause));
    } finally {
      setBusy(false);
    }
  }
  return (
    <form className="panel protocol-panel" onSubmit={submit}>
      <h2>Keep things moving</h2>
      <p className="section-subtitle">
        Update your experiment's status and progress
      </p>
      <fieldset className="form-fields progress-fields" disabled={busy}>
        <div className="form-grid">
          <label className="span-two">
            Status
            <select
              value={status}
              onChange={(event) => {
                const next = event.target.value as ExperimentStatus;
                setStatus(next);
                if (next === "Completed") setProgress(100);
              }}
            >
              {experimentStatuses.map((value) => (
                <option key={value}>{value}</option>
              ))}
            </select>
          </label>
          <label className="span-two">
            Progress: {progress}%
            <input
              type="range"
              min={0}
              max={100}
              step={1}
              value={progress}
              onChange={(event) => setProgress(Number(event.target.value))}
            />
            <input
              aria-label="Experiment progress percentage"
              required
              type="number"
              min={0}
              max={100}
              step={1}
              value={progress}
              onChange={(event) =>
                setProgress(
                  event.target.value === "" ? 0 : Number(event.target.value),
                )
              }
            />
          </label>
        </div>
        <div className="form-actions">
          <button className="primary-button" type="submit">
            <Save size={17} />
            {busy ? "Saving…" : "Save progress"}
          </button>
        </div>
      </fieldset>
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
    </form>
  );
}

function ExperimentForm({
  initial,
  onSave,
  onCancel,
}: {
  initial?: Experiment;
  onSave: (draft: ExperimentDraft) => Promise<void>;
  onCancel: () => void;
}) {
  const [form, setForm] = useState<ExperimentDraft>(
    initial
      ? {
          title: initial.title,
          experiment_type: initial.experiment_type,
          status: initial.status,
          progress: initial.progress,
          description: initial.description,
        }
      : {
          title: "",
          experiment_type: "",
          status: "Planned",
          progress: 0,
          description: "",
        },
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function submit(event: FormEvent) {
    event.preventDefault();
    setError("");
    if (form.title.trim().length < 2 || form.experiment_type.trim().length < 2)
      return setError("Title and experiment type need at least 2 characters.");
    if (
      !Number.isInteger(form.progress) ||
      form.progress < 0 ||
      form.progress > 100
    )
      return setError("Progress must be a whole number from 0 to 100.");
    setBusy(true);
    try {
      await onSave({
        ...form,
        title: form.title.trim(),
        experiment_type: form.experiment_type.trim(),
        description: form.description?.trim() || null,
      });
    } catch (cause) {
      setError(errorMessage(cause));
    } finally {
      setBusy(false);
    }
  }
  return (
    <form className="panel sample-form" onSubmit={submit}>
      <div className="form-section-heading">
        <span className="round-icon mint">
          <FlaskConical size={21} />
        </span>
        <div>
          <h2>Experiment information</h2>
          <p>Fields marked with * are required.</p>
        </div>
      </div>
      <fieldset className="form-fields" disabled={busy}>
        <div className="form-grid">
          <label>
            Title *
            <input
              required
              minLength={2}
              maxLength={120}
              placeholder="e.g. Synthetic control comparison"
              value={form.title}
              onChange={(event) =>
                setForm({ ...form, title: event.target.value })
              }
            />
          </label>
          <label>
            Experiment type *
            <input
              required
              minLength={2}
              maxLength={120}
              placeholder="e.g. Simulated analysis"
              value={form.experiment_type}
              onChange={(event) =>
                setForm({ ...form, experiment_type: event.target.value })
              }
            />
          </label>
          <label>
            Status *
            <select
              value={form.status}
              onChange={(event) => {
                const status = event.target.value as ExperimentStatus;
                setForm({
                  ...form,
                  status,
                  progress: status === "Completed" ? 100 : form.progress,
                });
              }}
            >
              {experimentStatuses.map((value) => (
                <option key={value}>{value}</option>
              ))}
            </select>
          </label>
          <label>
            Progress (%) *
            <input
              required
              type="number"
              min={0}
              max={100}
              step={1}
              value={form.progress}
              onChange={(event) =>
                setForm({
                  ...form,
                  progress:
                    event.target.value === "" ? 0 : Number(event.target.value),
                })
              }
            />
          </label>
          <label className="span-two">
            Description
            <textarea
              rows={4}
              maxLength={2000}
              placeholder="A fictional experiment overview. No patient information or operational protocol."
              value={form.description ?? ""}
              onChange={(event) =>
                setForm({ ...form, description: event.target.value })
              }
            />
          </label>
        </div>
        <div className="notice">
          <ShieldCheck size={19} />
          <p>
            Fictional records only. This experiment will be saved to your
            signed-in account.
          </p>
        </div>
        <div className="form-actions">
          <button type="button" className="secondary-button" onClick={onCancel}>
            Cancel
          </button>
          <button className="primary-button" type="submit">
            {initial ? <Save size={18} /> : <Plus size={18} />}
            {busy ? "Saving…" : initial ? "Save changes" : "Add Experiment"}
          </button>
        </div>
      </fieldset>
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
    </form>
  );
}
