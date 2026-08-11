export type NormalizedSupabaseUrl = {
  url: string;
  host: string;
  pathname: string;
};

export class SupabaseUrlConfigError extends Error {
  constructor(
    message: string,
    readonly safeDetails: { host: string; pathname: string }
  ) {
    super(message);
    this.name = "SupabaseUrlConfigError";
  }
}

function stripWrappingQuotes(rawValue: string) {
  let value = rawValue.trim();

  while (
    value.length >= 2 &&
    ((value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'")))
  ) {
    value = value.slice(1, -1).trim();
  }

  return value;
}

export function normalizeSupabaseUrl(
  rawValue: string,
  sourceName: string
): NormalizedSupabaseUrl {
  const value = stripWrappingQuotes(rawValue);
  let parsed: URL;

  try {
    parsed = new URL(value);
  } catch {
    throw new SupabaseUrlConfigError(
      `${sourceName}은 https://<project-ref>.supabase.co 형식이어야 합니다.`,
      { host: "invalid", pathname: "invalid" }
    );
  }

  const safeDetails = { host: parsed.hostname, pathname: parsed.pathname };

  if (parsed.protocol !== "https:") {
    throw new SupabaseUrlConfigError(
      `${sourceName}은 https 프로토콜을 사용해야 합니다.`,
      safeDetails
    );
  }

  if (!/^[a-z0-9-]+\.supabase\.co$/i.test(parsed.hostname)) {
    throw new SupabaseUrlConfigError(
      `${sourceName}의 host는 <project-ref>.supabase.co 형식이어야 합니다.`,
      safeDetails
    );
  }

  if (parsed.username || parsed.password || parsed.search || parsed.hash) {
    throw new SupabaseUrlConfigError(
      `${sourceName}에는 인증정보, query string 또는 hash를 포함할 수 없습니다.`,
      safeDetails
    );
  }

  if (parsed.pathname !== "/") {
    throw new SupabaseUrlConfigError(
      `${sourceName}에는 /rest/v1, /auth/v1, /functions/v1 등의 경로를 포함할 수 없습니다.`,
      safeDetails
    );
  }

  return {
    url: parsed.origin,
    host: parsed.hostname,
    pathname: parsed.pathname,
  };
}
