import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import {
  getServerEnvStatus,
  logServerError,
  logServerEvent,
} from "@/lib/server-debug";
import {
  normalizeSupabaseUrl,
  SupabaseUrlConfigError,
} from "@/lib/supabase-url";

let supabaseAdmin: SupabaseClient | undefined;

export function getSupabaseAdmin() {
  if (supabaseAdmin) return supabaseAdmin;

  const envStatus = getServerEnvStatus();
  logServerEvent("supabase.initialize", envStatus);

  const rawSupabaseUrl =
    process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseUrlSource = process.env.SUPABASE_URL
    ? "SUPABASE_URL"
    : "NEXT_PUBLIC_SUPABASE_URL";
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!rawSupabaseUrl || !serviceRoleKey) {
    const error = new Error(
      "Supabase 서버 환경변수가 설정되지 않았습니다. SUPABASE_URL(또는 NEXT_PUBLIC_SUPABASE_URL)과 SUPABASE_SERVICE_ROLE_KEY를 확인하세요."
    );
    logServerError("supabase.environment", error);
    throw error;
  }

  let supabaseUrl: string;
  try {
    const normalized = normalizeSupabaseUrl(rawSupabaseUrl, supabaseUrlSource);
    supabaseUrl = normalized.url;
    logServerEvent("supabase.url-validated", {
      source: supabaseUrlSource,
      host: normalized.host,
      pathname: normalized.pathname,
    });
  } catch (error) {
    if (error instanceof SupabaseUrlConfigError) {
      logServerEvent("supabase.url-invalid", {
        source: supabaseUrlSource,
        host: error.safeDetails.host,
        pathname: error.safeDetails.pathname,
      });
    }
    logServerError("supabase.url-validation", error);
    throw error;
  }

  try {
    supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false },
    });
  } catch (error) {
    logServerError("supabase.createClient", error);
    throw error;
  }

  return supabaseAdmin;
}
