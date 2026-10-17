import { useMemo, useState, type FormEvent } from "react";
import {
  ArrowRight,
  CalendarDays,
  Check,
  MapPin,
  Plus,
  Search,
  ShieldCheck,
  TestTubeDiagonal,
  X,
} from "lucide-react";
import {
  sampleTypes,
  type Sample,
  type SampleType,
  type SampleStatus,
} from "../lib/data";
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
  const filtered = useMemo(
    () =>
      samples.filter(
        (sample) =>
          (category === "All Samples" || sample.type === category) &&
          `${sample.id} ${sample.name} ${sample.type} ${sample.status} ${sample.collected}`
            .toLowerCase()
            .includes(search.trim().toLowerCase()),
      ),
    [samples, search, category],
  );
  const reset = () => {
    setSearch("");
    setCategory("All Samples");
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
            className={category === type ? "selected" : ""}
          >
            {type}
            <span>
              {type === "All Samples"
                ? samples.length
                : samples.filter((sample) => sample.type === type).length}
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
                <SampleIcon type={sample.type} />
                <div>
                  <strong>{sample.name}</strong>
                  <small>{sample.id}</small>
                </div>
              </div>
              <span className="sample-type">{sample.type}</span>
              <span className="sample-date">
                <CalendarDays size={14} />
                {formatDate(sample.collected, dateFormat)}
              </span>
              <Badge status={sample.status} />
              <ArrowRight size={17} />
            </button>
          ))
        ) : (
          <EmptyState
            title="No samples found"
            description="Try a different search or category. Your next discovery might be one filter away."
            action="Clear filters"
            onAction={reset}
          />
        )}
        <div className="sample-list-footer">
          Showing {filtered.length} of {samples.length} fictional samples
          <span>Stored locally in your browser</span>
        </div>
      </section>
      <div className="notice subtle-notice">
        <ShieldCheck size={17} />
        <p>
          This is a demonstration library. Add fictional laboratory records only
          — never patient information.
        </p>
      </div>
    </>
  );
}

export function SampleDetails({
  sample,
  navigate,
  dateFormat,
}: {
  sample?: Sample;
  navigate: (path: string) => void;
  dateFormat: string;
}) {
  if (!sample)
    return (
      <>
        <BackButton
          label="Back to samples"
          onClick={() => navigate("/samples")}
        />
        <EmptyState
          title="Sample not found"
          description="This record isn't available in your local sample library."
          action="View samples"
          onAction={() => navigate("/samples")}
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
        eyebrow={`SAMPLE RECORD · ${sample.id}`}
        title={sample.name}
        subtitle="A complete view of your fictional laboratory sample."
      >
        <Badge status={sample.status} />
      </PageHeading>
      <section className="panel detail-panel">
        <div className="detail-intro">
          <SampleIcon type={sample.type} size={30} />
          <div>
            <h2>{sample.id}</h2>
            <p>{sample.type} sample</p>
          </div>
          <span className="detail-demo-label">DEMO RECORD</span>
        </div>
        <div className="detail-grid">
          <DetailItem label="Sample type" value={sample.type} />
          <DetailItem
            label="Collection date"
            value={formatDate(sample.collected, dateFormat)}
          />
          <DetailItem label="Storage location" value={sample.location} />
          <DetailItem label="Volume / quantity" value={sample.volume} />
          <DetailItem label="Status" value={sample.status} />
          <DetailItem label="Laboratory" value="BioTrack Research Lab" />
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
      <button className="secondary-button" onClick={() => navigate("/samples")}>
        Back to sample library
        <ArrowRight size={17} />
      </button>
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
  onSave: (sample: Sample) => void;
  navigate: (path: string) => void;
}) {
  const nextNumber =
    Math.max(
      8,
      ...samples.map((sample) => Number(sample.id.replace("BT-", "")) || 0),
    ) + 1;
  const [form, setForm] = useState({
    id: `BT-${String(nextNumber).padStart(3, "0")}`,
    name: "",
    type: "Blood" as SampleType,
    collected: "2026-10-17",
    status: "Available" as SampleStatus,
    location: "",
    volume: "",
    notes: "",
  });
  const [error, setError] = useState("");
  function submit(event: FormEvent) {
    event.preventDefault();
    const id = form.id.trim().toUpperCase();
    if (!/^[A-Z0-9][A-Z0-9-]{1,23}$/.test(id))
      return setError(
        "Use a sample ID with 2–24 letters, numbers, or hyphens.",
      );
    if (samples.some((sample) => sample.id.toUpperCase() === id))
      return setError("This sample ID already exists. Please use a unique ID.");
    if (!form.name.trim())
      return setError("Please give your fictional sample a name.");
    const collectedDate = new Date(`${form.collected}T00:00:00.000Z`);
    const validDate =
      /^\d{4}-\d{2}-\d{2}$/.test(form.collected) &&
      !Number.isNaN(collectedDate.getTime()) &&
      collectedDate.toISOString().slice(0, 10) === form.collected;
    if (!validDate) return setError("Please enter a valid collection date.");
    onSave({
      ...form,
      id,
      name: form.name.trim(),
      location: form.location.trim() || "Not assigned",
      volume: form.volume.trim() || "Not specified",
      notes: form.notes.trim(),
    });
  }
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
        <div className="form-grid">
          <label>
            Sample ID *
            <input
              required
              maxLength={24}
              value={form.id}
              onChange={(event) => setForm({ ...form, id: event.target.value })}
            />
            <small>A unique reference for this fictional record</small>
          </label>
          <label>
            Sample name *
            <input
              required
              maxLength={70}
              placeholder="e.g. Synthetic blood control"
              value={form.name}
              onChange={(event) =>
                setForm({ ...form, name: event.target.value })
              }
            />
          </label>
          <label>
            Sample type *
            <select
              value={form.type}
              onChange={(event) =>
                setForm({ ...form, type: event.target.value as SampleType })
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
              value={form.collected}
              onChange={(event) =>
                setForm({ ...form, collected: event.target.value })
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
              {["Available", "Processing", "Archived"].map((status) => (
                <option key={status}>{status}</option>
              ))}
            </select>
          </label>
          <label>
            Storage location
            <input
              maxLength={60}
              placeholder="e.g. Freezer A · Rack 2"
              value={form.location}
              onChange={(event) =>
                setForm({ ...form, location: event.target.value })
              }
            />
          </label>
          <label>
            Volume / quantity
            <input
              maxLength={40}
              placeholder="e.g. 2 mL"
              value={form.volume}
              onChange={(event) =>
                setForm({ ...form, volume: event.target.value })
              }
            />
          </label>
          <label className="span-two">
            Laboratory notes
            <textarea
              maxLength={500}
              rows={3}
              placeholder="Optional notes about this fictional laboratory sample. No patient information."
              value={form.notes}
              onChange={(event) =>
                setForm({ ...form, notes: event.target.value })
              }
            />
          </label>
        </div>
        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}
        <div className="notice">
          <ShieldCheck size={19} />
          <p>
            Fictional samples only. This prototype stores your additions in this
            browser and does not upload any data.
          </p>
        </div>
        <div className="form-actions">
          <button
            type="button"
            className="secondary-button"
            onClick={() => navigate("/samples")}
          >
            Cancel
          </button>
          <button className="primary-button" type="submit">
            <Plus size={18} />
            Add Sample
          </button>
        </div>
      </form>
    </>
  );
}
