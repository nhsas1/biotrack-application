export type SampleType = "Blood" | "DNA" | "RNA" | "Tissue";
export type SampleStatus = "Stored" | "Processing" | "Completed";
export type ExperimentStatus = "Planned" | "In Progress" | "Completed";

// Database IDs are UUIDs. sample_code is the human-readable sample identity.
export type Sample = {
  id: string;
  owner_id: string;
  sample_code: string;
  sample_type: SampleType;
  collection_date: string;
  status: SampleStatus;
  notes: string | null;
  created_at: string;
};
export type SampleDraft = Pick<
  Sample,
  "sample_code" | "sample_type" | "collection_date" | "status" | "notes"
>;

export type Experiment = {
  id: string;
  owner_id: string;
  title: string;
  experiment_type: string;
  status: ExperimentStatus;
  progress: number;
  description: string | null;
  created_at: string;
};
export type ExperimentDraft = Pick<
  Experiment,
  "title" | "experiment_type" | "status" | "progress" | "description"
>;

export type ResearcherProfile = {
  id: string;
  full_name: string;
  role: string;
  laboratory: string;
  created_at: string;
};
export type ProfileDraft = Pick<
  ResearcherProfile,
  "full_name" | "role" | "laboratory"
>;

export const sampleTypes: SampleType[] = ["Blood", "DNA", "RNA", "Tissue"];
export const sampleStatuses: SampleStatus[] = [
  "Stored",
  "Processing",
  "Completed",
];
export const experimentStatuses: ExperimentStatus[] = [
  "Planned",
  "In Progress",
  "Completed",
];

export type ProfilePreferences = {
  notifications: boolean;
  compact: boolean;
  dateFormat: "short" | "iso";
};
export const initialPreferences: ProfilePreferences = {
  notifications: true,
  compact: false,
  dateFormat: "short",
};

export type Task = {
  id: string;
  title: string;
  subtitle: string;
  done: boolean;
};
// Tasks are illustrative, browser-only reminders; they are not database records.
export const initialTasks: Task[] = [
  {
    id: "TASK-001",
    title: "Prepare synthetic PCR plate",
    subtitle: "Review the fictional demo plate checklist.",
    done: false,
  },
  {
    id: "TASK-002",
    title: "Review extraction log",
    subtitle: "Check a fictional completed run for practice.",
    done: false,
  },
  {
    id: "TASK-003",
    title: "Confirm sequencing plan",
    subtitle: "Validate the illustrative library checklist.",
    done: false,
  },
  {
    id: "TASK-004",
    title: "Schedule culture check",
    subtitle: "Add a fictional monitoring checkpoint.",
    done: false,
  },
];

export function initials(name: string) {
  return (
    name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase() || "R"
  );
}

export function today() {
  const date = new Date();
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 10);
}
