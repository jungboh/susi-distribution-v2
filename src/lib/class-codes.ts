export const CLASS_CODES = ["distribution", "startup", "health", "finance"] as const;

export type ClassCode = (typeof CLASS_CODES)[number];

export const DEFAULT_CLASS_CODE: ClassCode = "distribution";

export const CLASS_NAME_BY_CODE: Record<ClassCode, string> = {
  distribution: "유통반",
  startup: "창업반",
  health: "보건반",
  finance: "금융과",
};

export const CLASS_UI_NAME_BY_CODE: Record<ClassCode, string> = {
  finance: "금융반",
  startup: "창업반",
  distribution: "유통반",
  health: "보건반",
};

export const LANDING_CLASS_CODES: readonly ClassCode[] = [
  "finance",
  "startup",
  "distribution",
  "health",
];

const CLASS_DESCRIPTION_BY_CODE: Record<ClassCode, string> = {
  distribution: "유통반 학생 관리",
  startup: "창업반 학생 관리",
  health: "보건반 학생 관리",
  finance: "금융과 학생 관리",
};

export const CLASS_OPTIONS = CLASS_CODES.map((code) => ({
  code,
  name: CLASS_NAME_BY_CODE[code],
  description: CLASS_DESCRIPTION_BY_CODE[code],
}));

export function isClassCode(value: string): value is ClassCode {
  return (CLASS_CODES as readonly string[]).includes(value);
}
