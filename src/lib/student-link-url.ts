/** Existing production deployment documented in CLAUDE.md and NETLIFY_DEPLOY.md. */
export const STUDENT_LINK_ORIGIN = "https://susi-distribution-v2.netlify.app";

export function buildStudentUrl(accessCode: string) {
  return `${STUDENT_LINK_ORIGIN}/apply/${encodeURIComponent(accessCode)}`;
}
