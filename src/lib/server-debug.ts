import "server-only";

type ErrorWithDigest = Error & { digest?: string };

export function logServerEvent(
  context: string,
  details?: Record<string, unknown>
) {
  console.info(`[server:${context}]`, details ?? {});
}

export function logServerError(context: string, error: unknown) {
  const normalized: ErrorWithDigest =
    error instanceof Error
      ? (error as ErrorWithDigest)
      : new Error(typeof error === "string" ? error : "Unknown server error");

  console.error(`[server:${context}]`, {
    name: normalized.name,
    message: normalized.message,
    stack: normalized.stack,
    digest: normalized.digest,
  });
}

export function getServerEnvStatus() {
  return {
    nodeEnv: process.env.NODE_ENV,
    netlifyContext: process.env.CONTEXT,
    supabaseUrlSource: process.env.SUPABASE_URL
      ? "SUPABASE_URL"
      : process.env.NEXT_PUBLIC_SUPABASE_URL
        ? "NEXT_PUBLIC_SUPABASE_URL"
        : "missing",
    hasServiceRoleKey: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
    hasTeacherAuthSecret: Boolean(process.env.TEACHER_AUTH_SECRET),
  };
}
