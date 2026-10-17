import {
  ArrowLeft,
  ArrowUpRight,
  Dna,
  Droplet,
  FlaskConical,
  Layers,
  TestTubeDiagonal,
} from "lucide-react";
import type { ReactNode } from "react";
import type { SampleType } from "../lib/data";

export function SampleIcon({
  type,
  size = 20,
}: {
  type: SampleType;
  size?: number;
}) {
  const Icon =
    type === "Blood"
      ? Droplet
      : type === "Tissue"
        ? Layers
        : type === "RNA"
          ? FlaskConical
          : Dna;
  return (
    <span className={`sample-icon ${type.toLowerCase()}`}>
      <Icon size={size} strokeWidth={1.8} />
    </span>
  );
}

export function Badge({ status }: { status: string }) {
  return (
    <span className={`badge ${status.toLowerCase().replaceAll(" ", "-")}`}>
      <span />
      {status}
    </span>
  );
}

export function Progress({ value }: { value: number }) {
  return (
    <div
      className="progress"
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label="Experiment progress"
    >
      <div style={{ width: `${value}%` }} />
    </div>
  );
}

export function formatDate(date: string, format = "short") {
  if (format === "iso") return date;
  return new Date(`${date}T12:00:00`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function SectionTitle({
  title,
  action,
  onAction,
}: {
  title: string;
  action?: string;
  onAction?: () => void;
}) {
  return (
    <div className="section-heading">
      <h2>{title}</h2>
      {action && (
        <button className="text-button" onClick={onAction}>
          {action}
          <ArrowUpRight size={15} />
        </button>
      )}
    </div>
  );
}

export function PageHeading({
  eyebrow,
  title,
  subtitle,
  children,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
  children?: ReactNode;
}) {
  return (
    <div className="page-heading">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        <p className="page-subtitle">{subtitle}</p>
      </div>
      {children}
    </div>
  );
}

export function BackButton({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) {
  return (
    <button className="back-button" onClick={onClick}>
      <ArrowLeft size={17} />
      {label}
    </button>
  );
}

export function EmptyState({
  title,
  description,
  action,
  onAction,
}: {
  title: string;
  description: string;
  action: string;
  onAction: () => void;
}) {
  return (
    <div className="empty-state">
      <span className="empty-icon">
        <TestTubeDiagonal size={30} />
      </span>
      <h2>{title}</h2>
      <p>{description}</p>
      <button className="secondary-button" onClick={onAction}>
        {action}
      </button>
    </div>
  );
}
