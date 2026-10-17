import { createClient } from "@supabase/supabase-js";
import type {
  Experiment,
  ExperimentDraft,
  ProfileDraft,
  ResearcherProfile,
  Sample,
  SampleDraft,
} from "./data";

type Table<Row, Insert, Update> = {
  Row: Row;
  Insert: Insert;
  Update: Update;
  Relationships: [];
};
type Database = {
  public: {
    Tables: {
      profiles: Table<
        ResearcherProfile,
        { id: string } & Partial<ProfileDraft>,
        Partial<ProfileDraft>
      >;
      samples: Table<
        Sample,
        { owner_id: string } & SampleDraft,
        Partial<SampleDraft>
      >;
      experiments: Table<
        Experiment,
        { owner_id: string } & ExperimentDraft,
        Partial<ExperimentDraft>
      >;
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

const url = import.meta.env.VITE_SUPABASE_URL?.trim();
const publishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY?.trim();
function checkConfiguration() {
  if (!url || !publishableKey) {
    return "BioTrack is not connected yet. Set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY, then restart the app.";
  }
  try {
    const parsed = new URL(url);
    if (
      !["https:", "http:"].includes(parsed.protocol) ||
      parsed.username ||
      parsed.password
    )
      throw new Error();
  } catch {
    return "The Supabase URL is invalid. Check the app's runtime configuration.";
  }
  if (publishableKey.startsWith("sb_publishable_")) return "";
  // Legacy anon keys are also public. Never accept secret/service-role keys.
  try {
    const encoded = publishableKey.split(".")[1];
    const payload = JSON.parse(
      atob(encoded.replace(/-/g, "+").replace(/_/g, "/")),
    );
    if (payload.role === "anon") return "";
  } catch {
    // Invalid or non-public key: keep the app in its configuration-error state.
  }
  return "Set the project's public publishable key (or legacy anon key). Never use a secret or service-role key in BioTrack.";
}
export const configurationError = checkConfiguration();

export const supabase = configurationError
  ? null
  : createClient<Database>(url!, publishableKey!, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });

export function getSupabase() {
  if (!supabase) throw new Error(configurationError);
  return supabase;
}
