import { useMemo, useState, type FormEvent } from "react";
import {
  ArrowRight,
  CalendarDays,
  Pencil,
  Plus,
  Save,
  Search,
  ShieldCheck,
  TestTubeDiagonal,
  Trash2,
  X,
} from "lucide-react";
import {
  sampleStatuses,
  sampleTypes,
  today,
  type Sample,
  type SampleDraft,
  type SampleStatus,
  type SampleType,
} from "../lib/data";
import { errorMessage } from "../lib/api";
import {
  BackButton,
  Badge,
  EmptyState,
  formatDate,
  PageHeading,
  SampleIcon,
} from "../components/ui";

type Props = {
  samples: Sample[];
  navigate: (path: string) => void;
  dateFormat: string;
};

export default function Samples({ samples, navigate, dateFormat }: Props) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All Samples");
  const [status, setStatus] = useState("All statuses");
  const filtered = useMemo(
    () =>
      samples.filter(
        (sample) =>
          (category === "All Samples" || sample.sample_type === category) &&
          (status === "All statuses" || sample.status === status) &&
          `${sample.sample_code} ${sample.sample_type} ${sample.status} ${sample.collection_date} ${sample.notes ?? ""}`
            .toLowerCase()
            .includes(search.trim().toLowerCase()),
      ),
    [samples, search, category, status],
  );
  const reset = () => {
    setSearch("");
    setCategory("All Samples");
    setStatus("All statuses");
  };
  return (
    <>
      <PageHeading
        eyebrow="YOUR SAMPLE LIBRARY"
        title="Samples"
        subtitle="Every sample has a story. Keep yours organized."
      >
        <button
          className="primary-button"
          onClick={() => navigate("/samples/new")}
        >
          <Plus size={18} />
          Add Sample
        </button>
      </PageHeading>
      <div className="inventory-toolbar">
        <label className="search-field">
          <Search size={19} />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by sample ID, type, or status…"
            aria-label="Search samples"
          />
          {search && (
            <button
              className="icon-button"
              onClick={() => setSearch("")}
              aria-label="Clear search"
            >
              <X size={16} />
            </button>
          )}
        </label>
        <select
          className="status-filter"
          aria-label="Filter samples by status"
          value={status}
          onChange={(event) => setStatus(event.target.value)}
        >
          {["All statuses", ...sampleStatuses].map((value) => (
            <option key={value}>{value}</option>
          ))}
        </select>
        <div className="inventory-count">
          <TestTubeDiagonal size={17} />
          <strong>{samples.length}</strong> sample records
        </div>
      </div>
      <div
        className="filter-tabs"
        role="group"
        aria-label="Sample category filters"
      >
        {["All Samples", ...sampleTypes].map((type) => (
          <button
            key={type}
            onClick={() => setCategory(type)}
            aria-pressed={category === type}
            className={category === type ? "selected" : ""}
          >
            {type}
            <span>
              {type === "All Samples"
                ? samples.length
                : samples.filter((sample) => sample.sample_type === type)
                    .length}
            </span>
          </button>
        ))}
      </div>
      <section className="panel sample-list">
        <div className="sample-table-heading">
          <span>Sample / ID</span>
          <span>Type</span>
          <span>Collection date</span>
          <span>Status</span>
          <span />
        </div>
        {filtered.length ? (
          filtered.map((sample) => (
            <button
              className="sample-row"
              key={sample.id}
              onClick={() => navigate(`/samples/${sample.id}`)}
            >
              <div className="sample-identity">
                <SampleIcon type={sample.sample_type} />
                <div>
                  <strong>{sample.sample_code}</strong>
                  <small>{sample.sample_type} sample</small>
                </div>
              </div>
              <span className="sample-type">{sample.sample_type}</span>
              <span className="sample-date">
                <CalendarDays size={14} />
                {formatDate(sample.collection_date, dateFormat)}
              </span>
              <Badge status={sample.status} />
              <ArrowRight size={17} />
            </button>
          ))
        ) : (
          <EmptyState
            title={
              samples.length
                ? "No samples found"
                : "Your sample library is empty"
            }
            description={
              samples.length
                ? "Try a different search, type, or status."
                : "Add your first fictional sample to start your library. No example records have been added."
            }
            action={samples.length ? "Clear filters" : "Add Sample"}
            onAction={samples.length ? reset : () => navigate("/samples/new")}
          />
        )}
        <div className="sample-list-footer">
          Showing {filtered.length} of {samples.length} fictional samples
          <span>Synced with your account</span>
        </div>
      </section>
      <div className="notice subtle-notice">
        <ShieldCheck size={17} />
        <p>
          Add fictional laboratory records only — never patient information.
        </p>
      </div>
    </>
  );
}

export function SampleDetails({
  sample,
  samples,
  navigate,
  dateFormat,
  onSave,
  onDelete,
}: {
  sample?: Sample;
  samples: Sample[];
  navigate: (path: string) => void;
  dateFormat: string;
  onSave: (draft: SampleDraft) => Promise<void>;
  onDelete: () => Promise<void>;
}) {
  const [editing, setEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  if (!sample)
    return (
      <>
        <BackButton
          label="Back to samples"
          onClick={() => navigate("/samples")}
        />
        <EmptyState
          title="Sample not found"
          description="This record is not available in your account's sample library."
          action="View samples"
          onAction={() => navigate("/samples")}
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
        <BackButton label="Back to sample" onClick={() => setEditing(false)} />
        <PageHeading
          eyebrow="UPDATE YOUR SAMPLE"
          title={`Edit ${sample.sample_code}`}
          subtitle="Keep your fictional sample record up to date."
        />
        <SampleForm
          samples={samples}
          initial={sample}
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
        label="Back to samples"
        onClick={() => navigate("/samples")}
      />
      <PageHeading
        eyebrow={`SAMPLE RECORD · ${sample.sample_code}`}
        title={sample.sample_code}
        subtitle="A complete view of your fictional laboratory sample."
      >
        <div className="record-actions">
          <Badge status={sample.status} />
          <button className="secondary-button" onClick={() => setEditing(true)}>
            <Pencil size={16} />
            Edit Sample
          </button>
        </div>
      </PageHeading>
      <section className="panel detail-panel">
        <div className="detail-intro">
          <SampleIcon type={sample.sample_type} size={30} />
          <div>
            <h2>{sample.sample_code}</h2>
            <p>{sample.sample_type} sample</p>
          </div>
          <span className="detail-demo-label">FICTIONAL RECORD</span>
        </div>
        <div className="detail-grid">
          <DetailItem label="Sample ID / code" value={sample.sample_code} />
          <DetailItem label="Sample type" value={sample.sample_type} />
          <DetailItem
            label="Collection date"
            value={formatDate(sample.collection_date, dateFormat)}
          />
          <DetailItem label="Status" value={sample.status} />
          <DetailItem
            label="Registered"
            value={formatDate(sample.created_at.slice(0, 10), dateFormat)}
          />
        </div>
        <div className="detail-notes">
          <h3>Laboratory notes</h3>
          <p>
            {sample.notes || "No additional notes for this fictional sample."}
          </p>
        </div>
      </section>
      <div className="notice">
        <ShieldCheck size={19} />
        <p>
          Synthetic demonstration record. Not a patient sample and not intended
          for clinical use.
        </p>
      </div>
      <div className="record-actions">
        <button
          className="secondary-button"
          onClick={() => navigate("/samples")}
        >
          Back to sample library
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
          Delete Sample
        </button>
      </div>
      {confirmDelete && (
        <div className="notice delete-confirm" role="alert">
          <div>
            <strong>Delete {sample.sample_code}?</strong>
            <p>This permanently removes the sample from your account.</p>
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

export function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="detail-item">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

export function AddSample({
  samples,
  onSave,
  navigate,
}: {
  samples: Sample[];
  onSave: (draft: SampleDraft) => Promise<void>;
  navigate: (path: string) => void;
}) {
  return (
    <>
      <BackButton
        label="Back to samples"
        onClick={() => navigate("/samples")}
      />
      <PageHeading
        eyebrow="GROW YOUR SAMPLE LIBRARY"
        title="Add a new sample"
        subtitle="A few details now. A more organized laboratory later."
      />
      <SampleForm
        samples={samples}
        onSave={onSave}
        onCancel={() => navigate("/samples")}
      />
    </>
  );
}

function SampleForm({
  samples,
  initial,
  onSave,
  onCancel,
}: {
  samples: Sample[];
  initial?: Sample;
  onSave: (draft: SampleDraft) => Promise<void>;
  onCancel: () => void;
}) {
  const nextNumber =
    Math.max(
      0,
      ...samples.map((sample) =>
        /^BT-\d+$/.test(sample.sample_code)
          ? Number(sample.sample_code.slice(3))
          : 0,
      ),
    ) + 1;
  const [form, setForm] = useState<SampleDraft>(
    initial
      ? {
          sample_code: initial.sample_code,
          sample_type: initial.sample_type,
          collection_date: initial.collection_date,
          status: initial.status,
          notes: initial.notes,
        }
      : {
          sample_code: `BT-${String(nextNumber).padStart(3, "0")}`,
          sample_type: "Blood",
          collection_date: today(),
          status: "Stored",
          notes: "",
        },
  );
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(event: FormEvent) {
    event.preventDefault();
    setError("");
    const code = form.sample_code.trim();
    if (code.length < 2 || code.length > 80)
      return setError("Use a sample code with 2–80 characters.");
    if (
      samples.some(
        (sample) => sample.id !== initial?.id && sample.sample_code === code,
      )
    )
      return setError(
        "This sample code already exists. Please use a unique code.",
      );
    const collected = new Date(`${form.collection_date}T00:00:00.000Z`);
    if (
      !/^\d{4}-\d{2}-\d{2}$/.test(form.collection_date) ||
      Number.isNaN(collected.getTime()) ||
      collected.toISOString().slice(0, 10) !== form.collection_date
    )
      return setError("Please enter a valid collection date.");
    setBusy(true);
    try {
      await onSave({
        ...form,
        sample_code: code,
        notes: form.notes?.trim() || null,
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
          <TestTubeDiagonal size={21} />
        </span>
        <div>
          <h2>Sample information</h2>
          <p>Fields marked with * are required.</p>
        </div>
      </div>
      <fieldset className="form-fields" disabled={busy}>
        <div className="form-grid">
          <label className="span-two">
            Sample ID / code *
            <input
              required
              minLength={2}
              maxLength={80}
              value={form.sample_code}
              onChange={(event) =>
                setForm({ ...form, sample_code: event.target.value })
              }
            />
            <small>
              A unique reference for this fictional record; saved as the sample
              code
            </small>
          </label>
          <label>
            Sample type *
            <select
              value={form.sample_type}
              onChange={(event) =>
                setForm({
                  ...form,
                  sample_type: event.target.value as SampleType,
                })
              }
            >
              {sampleTypes.map((type) => (
                <option key={type}>{type}</option>
              ))}
            </select>
          </label>
          <label>
            Collection date *
            <input
              required
              type="date"
              value={form.collection_date}
              onChange={(event) =>
                setForm({ ...form, collection_date: event.target.value })
              }
            />
          </label>
          <label>
            Status *
            <select
              value={form.status}
              onChange={(event) =>
                setForm({ ...form, status: event.target.value as SampleStatus })
              }
            >
              {sampleStatuses.map((status) => (
                <option key={status}>{status}</option>
              ))}
            </select>
          </label>
          <label className="span-two">
            Laboratory notes
            <textarea
              maxLength={2000}
              rows={3}
              placeholder="Optional fictional laboratory notes. No patient information."
              value={form.notes ?? ""}
              onChange={(event) =>
                setForm({ ...form, notes: event.target.value })
              }
            />
          </label>
        </div>
        <div className="notice">
          <ShieldCheck size={19} />
          <p>
            Fictional samples only. This record will be saved securely to your
            signed-in account.
          </p>
        </div>
        <div className="form-actions">
          <button type="button" className="secondary-button" onClick={onCancel}>
            Cancel
          </button>
          <button className="primary-button" type="submit">
            {initial ? <Save size={18} /> : <Plus size={18} />}
            {busy ? "Saving…" : initial ? "Save changes" : "Add Sample"}
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
