import type { User } from "@supabase/supabase-js";
import type {
  Experiment,
  ExperimentDraft,
  ProfileDraft,
  Sample,
  SampleDraft,
} from "./data";
import { getSupabase } from "./supabase";

const sampleColumns =
  "id, owner_id, sample_code, sample_type, collection_date, status, notes, created_at";
const experimentColumns =
  "id, owner_id, title, experiment_type, status, progress, description, created_at";
const profileColumns = "id, full_name, role, laboratory, created_at";

export function errorMessage(error: unknown): string {
  if (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "23505"
  ) {
    return "This sample code already exists in your library. Please use a unique code.";
  }
  if (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof error.message === "string"
  ) {
    return error.message;
  }
  return "Something went wrong. Please try again.";
}

export async function ensureProfile(user: User) {
  const client = getSupabase();
  // The trigger normally creates the row before signup returns. Retry a missing
  // row, then insert only if still absent; never overwrite an edited profile.
  for (const delay of [0, 150, 400]) {
    if (delay)
      await new Promise((resolve) => window.setTimeout(resolve, delay));
    const { data, error } = await client
      .from("profiles")
      .select(profileColumns)
      .eq("id", user.id)
      .maybeSingle();
    if (error) throw error;
    if (data) return data;
  }
  const name =
    typeof user.user_metadata.full_name === "string"
      ? user.user_metadata.full_name.trim()
      : "";
  const { error: insertError } = await client
    .from("profiles")
    .upsert(
      { id: user.id, full_name: name || "Researcher" },
      { onConflict: "id", ignoreDuplicates: true },
    );
  if (insertError) throw insertError;
  const { data, error } = await client
    .from("profiles")
    .select(profileColumns)
    .eq("id", user.id)
    .single();
  if (error) throw error;
  return data;
}

export async function listSamples(ownerId: string) {
  const samples: Sample[] = [];
  const pageSize = 1000;
  for (let offset = 0; ; offset += pageSize) {
    const { data, error } = await getSupabase()
      .from("samples")
      .select(sampleColumns)
      .eq("owner_id", ownerId)
      .order("created_at", { ascending: false })
      .order("id")
      .range(offset, offset + pageSize - 1);
    if (error) throw error;
    samples.push(...data);
    if (data.length < pageSize) return samples;
  }
}

export async function saveSample(
  ownerId: string,
  draft: SampleDraft,
  id?: string,
) {
  const client = getSupabase();
  const query = id
    ? client.from("samples").update(draft).eq("id", id).eq("owner_id", ownerId)
    : client.from("samples").insert({ ...draft, owner_id: ownerId });
  const { data, error } = await query.select(sampleColumns).single();
  if (error) throw error;
  return data;
}

export async function deleteSample(ownerId: string, id: string) {
  const { data, error } = await getSupabase()
    .from("samples")
    .delete()
    .eq("id", id)
    .eq("owner_id", ownerId)
    .select("id")
    .single();
  if (error) throw error;
  return data;
}

export async function listExperiments(ownerId: string) {
  const experiments: Experiment[] = [];
  const pageSize = 1000;
  for (let offset = 0; ; offset += pageSize) {
    const { data, error } = await getSupabase()
      .from("experiments")
      .select(experimentColumns)
      .eq("owner_id", ownerId)
      .order("created_at", { ascending: false })
      .order("id")
      .range(offset, offset + pageSize - 1);
    if (error) throw error;
    experiments.push(...data);
    if (data.length < pageSize) return experiments;
  }
}

export async function saveExperiment(
  ownerId: string,
  draft: ExperimentDraft,
  id?: string,
) {
  const client = getSupabase();
  const query = id
    ? client
        .from("experiments")
        .update(draft)
        .eq("id", id)
        .eq("owner_id", ownerId)
    : client.from("experiments").insert({ ...draft, owner_id: ownerId });
  const { data, error } = await query.select(experimentColumns).single();
  if (error) throw error;
  return data;
}

export async function deleteExperiment(ownerId: string, id: string) {
  const { data, error } = await getSupabase()
    .from("experiments")
    .delete()
    .eq("id", id)
    .eq("owner_id", ownerId)
    .select("id")
    .single();
  if (error) throw error;
  return data;
}

export async function saveProfile(ownerId: string, draft: ProfileDraft) {
  const { data, error } = await getSupabase()
    .from("profiles")
    .update(draft)
    .eq("id", ownerId)
    .select(profileColumns)
    .single();
  if (error) throw error;
  return data;
}
