export type SampleType = "Blood" | "DNA" | "RNA" | "Tissue";

export type SampleStatus = "Available" | "Processing" | "Archived";

export type Sample = {
  id: string;
  name: string;
  type: SampleType;
  collected: string;
  status: SampleStatus;
  location: string;
  volume: string;
  notes: string;
};

export type Experiment = {
  id: string;
  name: string;
  description: string;
  status: "Planned" | "In Progress" | "Completed";
  progress: number;
  startDate: string;
  lead: string;
  samples: string[];
  protocol: string;
  steps: string[];
  currentStep: number;
};

export const sampleTypes: SampleType[] = ["Blood", "DNA", "RNA", "Tissue"];

export const initialSamples: Sample[] = [
  {
    id: "BT-001",
    name: "Aurora Finch Blood",
    type: "Blood",
    collected: "2026-10-10",
    status: "Available",
    location: "Cryostorage A / Rack 01",
    volume: "4 mL",
    notes:
      "Fictional synthetic, nonpatient specimen for interface testing only.",
  },
  {
    id: "BT-002",
    name: "Bramble Vale Blood",
    type: "Blood",
    collected: "2026-10-11",
    status: "Processing",
    location: "Processing Bench 02",
    volume: "3 mL",
    notes:
      "Fictional synthetic, nonpatient specimen reserved for demo workflows.",
  },
  {
    id: "BT-003",
    name: "Cobalt Meadow DNA",
    type: "DNA",
    collected: "2026-10-12",
    status: "Available",
    location: "Freezer B / Box 04",
    volume: "85 µL",
    notes:
      "Fictional synthetic, nonpatient specimen for demonstration and training.",
  },
  {
    id: "BT-004",
    name: "Dusk Harbor DNA",
    type: "DNA",
    collected: "2026-10-13",
    status: "Archived",
    location: "Archive C / Drawer 07",
    volume: "60 µL",
    notes:
      "Fictional synthetic, nonpatient specimen archived for demo reference.",
  },
  {
    id: "BT-005",
    name: "Ember Lark RNA",
    type: "RNA",
    collected: "2026-10-14",
    status: "Processing",
    location: "Cold Room A / Rack 03",
    volume: "45 µL",
    notes:
      "Fictional synthetic, nonpatient specimen for simulated sequencing work.",
  },
  {
    id: "BT-006",
    name: "Fable Ridge RNA",
    type: "RNA",
    collected: "2026-10-15",
    status: "Available",
    location: "Freezer B / Box 09",
    volume: "50 µL",
    notes: "Fictional synthetic, nonpatient specimen for local product demos.",
  },
  {
    id: "BT-007",
    name: "Glimmer Cove Tissue",
    type: "Tissue",
    collected: "2026-10-16",
    status: "Available",
    location: "Cryostorage A / Rack 06",
    volume: "1.2 cm³",
    notes:
      "Fictional synthetic, nonpatient specimen for simulated culture setup.",
  },
  {
    id: "BT-008",
    name: "Hollow Fern Tissue",
    type: "Tissue",
    collected: "2026-10-17",
    status: "Archived",
    location: "Archive C / Drawer 11",
    volume: "0.8 cm³",
    notes:
      "Fictional synthetic, nonpatient specimen retained for demo history.",
  },
];

export const experiments: Experiment[] = [
  {
    id: "EXP-001",
    name: "PCR",
    description: "Amplify a fictional target sequence from the demo DNA panel.",
    status: "In Progress",
    progress: 62,
    startDate: "2026-10-12",
    lead: "Dr. Rowan Bell",
    samples: ["BT-001", "BT-003"],
    protocol: "Synthetic target amplification v2.1",
    steps: [
      "Prepare reaction mix",
      "Load demo samples",
      "Run thermocycler",
      "Review gel image",
    ],
    currentStep: 2,
  },
  {
    id: "EXP-002",
    name: "DNA Extraction",
    description: "Isolate demonstration DNA from two fictional source samples.",
    status: "Completed",
    progress: 100,
    startDate: "2026-10-10",
    lead: "Dr. Sable Quinn",
    samples: ["BT-002", "BT-004"],
    protocol: "Synthetic silica-column extraction v1.4",
    steps: [
      "Lyse demo material",
      "Bind nucleic acid",
      "Wash column",
      "Elute and quantify",
    ],
    currentStep: 4,
  },
  {
    id: "EXP-003",
    name: "RNA Sequencing",
    description:
      "Plan a simulated transcript readout for the fictional RNA set.",
    status: "Planned",
    progress: 0,
    startDate: "2026-10-20",
    lead: "Dr. Maren Sol",
    samples: ["BT-005", "BT-006"],
    protocol: "Synthetic transcriptome library prep v3.0",
    steps: [
      "Confirm sample integrity",
      "Prepare libraries",
      "Sequence demo libraries",
      "Summarize reads",
    ],
    currentStep: 0,
  },
  {
    id: "EXP-004",
    name: "Cell Culture",
    description:
      "Maintain a fictional tissue-derived culture in a simulated run.",
    status: "In Progress",
    progress: 35,
    startDate: "2026-10-16",
    lead: "Dr. Jules Hart",
    samples: ["BT-007", "BT-008"],
    protocol: "Synthetic culture maintenance v1.8",
    steps: [
      "Prepare culture vessel",
      "Seed demo material",
      "Monitor growth",
      "Record endpoint",
    ],
    currentStep: 1,
  },
];

export type ProfilePreferences = {
  name: string;
  notifications: boolean;
  compact: boolean;
  dateFormat: "short" | "iso";
};

export const initialPreferences: ProfilePreferences = {
  name: "Dr. Avery Morgan",
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

export const initialTasks: Task[] = [
  {
    id: "TASK-001",
    title: "Prepare synthetic PCR plate",
    subtitle: "Stage the fictional BT-001 and BT-003 demo samples.",
    done: false,
  },
  {
    id: "TASK-002",
    title: "Review extraction log",
    subtitle: "Check Dr. Sable Quinn’s fictional completed run.",
    done: false,
  },
  {
    id: "TASK-003",
    title: "Confirm sequencing plan",
    subtitle: "Validate the demo library checklist for RNA Sequencing.",
    done: false,
  },
  {
    id: "TASK-004",
    title: "Schedule culture check",
    subtitle: "Add a fictional monitoring checkpoint for Cell Culture.",
    done: false,
  },
];
