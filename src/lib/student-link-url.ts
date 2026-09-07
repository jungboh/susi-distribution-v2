/** Existing production deployment documented in CLAUDE.md and NETLIFY_DEPLOY.md. */
export const STUDENT_LINK_ORIGIN = "https://susi-distribution-v2.netlify.app";

const NETLIFY_PREVIEW_HOSTNAME =
  /^deploy-preview-\d+--susi-distribution-v2\.netlify\.app$/;

function resolveStudentLinkOrigin(candidateOrigin?: string) {
  if (!candidateOrigin) return STUDENT_LINK_ORIGIN;

  try {
    const url = new URL(candidateOrigin);
    const isHttp = url.protocol === "http:" || url.protocol === "https:";
    const isLocal =
      url.hostname === "localhost" || url.hostname === "127.0.0.1";
    const isNetlifyPreview =
      url.protocol === "https:" && NETLIFY_PREVIEW_HOSTNAME.test(url.hostname);

    return isHttp && (isLocal || isNetlifyPreview)
      ? url.origin
      : STUDENT_LINK_ORIGIN;
  } catch {
    return STUDENT_LINK_ORIGIN;
  }
}

export function buildStudentUrl(accessCode: string, candidateOrigin?: string) {
  const origin = resolveStudentLinkOrigin(candidateOrigin);
  return `${origin}/apply/${encodeURIComponent(accessCode)}`;
}
