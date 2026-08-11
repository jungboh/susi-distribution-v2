import "server-only";

import { createHmac, randomBytes, scryptSync, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { isClassCode, type ClassCode } from "@/lib/class-codes";
import { getServerEnvStatus, logServerError, logServerEvent } from "@/lib/server-debug";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

const COOKIE_NAME = "susi_class2_teacher_class_session";
const SESSION_MAX_AGE = 60 * 60 * 12;

type TeacherClassCredential = {
  class_code: ClassCode;
  password_hash: string;
  password_salt: string;
  must_change_password: boolean;
  password_updated_at: string | null;
  session_version: number;
};

export type TeacherClassSession = {
  classCode: ClassCode;
  sessionVersion: number;
  exp: number;
};

export type FirstPasswordRegistrationResult =
  | { status: "success"; sessionVersion: number }
  | { status: "invalid_initial" }
  | { status: "initial_reuse" }
  | { status: "password_mismatch" }
  | { status: "password_policy" }
  | { status: "already_registered" }
  | { status: "unavailable" };

function getAuthSecret() {
  logServerEvent("teacher-auth.read-auth-secret", getServerEnvStatus());
  const secret = process.env.TEACHER_AUTH_SECRET;
  if (!secret || secret.length < 32) {
    const error = new Error("TEACHER_AUTH_SECRET must contain at least 32 characters.");
    logServerError("teacher-auth.auth-secret", error);
    throw error;
  }
  return secret;
}

function sign(value: string) {
  return createHmac("sha256", getAuthSecret()).update(value).digest("hex");
}

function encodeSession(classCode: ClassCode, sessionVersion: number) {
  const payload = Buffer.from(
    JSON.stringify({
      classCode,
      sessionVersion,
      exp: Date.now() + SESSION_MAX_AGE * 1000,
    })
  ).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

function decodeSession(token?: string): TeacherClassSession | null {
  if (!token) return null;
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return null;

  const expected = sign(payload);
  if (
    signature.length !== expected.length ||
    !timingSafeEqual(Buffer.from(signature), Buffer.from(expected))
  ) {
    return null;
  }

  try {
    const parsed = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf8")
    ) as { classCode?: unknown; sessionVersion?: unknown; exp?: unknown };
    if (
      typeof parsed.classCode !== "string" ||
      !isClassCode(parsed.classCode) ||
      typeof parsed.sessionVersion !== "number" ||
      !Number.isInteger(parsed.sessionVersion) ||
      parsed.sessionVersion < 1 ||
      typeof parsed.exp !== "number" ||
      parsed.exp < Date.now()
    ) {
      return null;
    }
    return {
      classCode: parsed.classCode,
      sessionVersion: parsed.sessionVersion,
      exp: parsed.exp,
    };
  } catch {
    return null;
  }
}

function hashPassword(password: string, salt: string) {
  return scryptSync(password, salt, 64).toString("hex");
}

function verifyPassword(password: string, salt: string, expectedHash: string) {
  const actual = Buffer.from(hashPassword(password, salt), "hex");
  const expected = Buffer.from(expectedHash, "hex");
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

async function getClassCredential(classCode: ClassCode) {
  logServerEvent("teacher-auth.get-class-credential", { classCode });
  const { data, error } = await getSupabaseAdmin()
    .from("susi_class2_teacher_class_credentials")
    .select(
      "class_code,password_hash,password_salt,must_change_password,password_updated_at,session_version"
    )
    .eq("class_code", classCode)
    .maybeSingle();

  if (error) throw error;
  return data as TeacherClassCredential | null;
}

export async function getTeacherClassCredentialStatus(classCode: ClassCode) {
  const credential = await getClassCredential(classCode);
  if (!credential) return null;
  return { mustChangePassword: credential.must_change_password };
}

export async function authenticateTeacherClass(
  classCode: ClassCode,
  password: string
) {
  const credential = await getClassCredential(classCode);
  if (
    !credential ||
    credential.must_change_password ||
    !verifyPassword(password, credential.password_salt, credential.password_hash)
  ) {
    return null;
  }
  return { sessionVersion: credential.session_version };
}

export async function registerFirstTeacherClassPassword(
  classCode: ClassCode,
  initialPassword: string,
  newPassword: string,
  confirmation: string
): Promise<FirstPasswordRegistrationResult> {
  const credential = await getClassCredential(classCode);
  if (!credential) return { status: "unavailable" };
  if (!credential.must_change_password) return { status: "already_registered" };
  if (
    !verifyPassword(
      initialPassword,
      credential.password_salt,
      credential.password_hash
    )
  ) {
    return { status: "invalid_initial" };
  }
  if (
    newPassword.length < 8 ||
    !/[A-Za-z]/.test(newPassword) ||
    !/[0-9]/.test(newPassword) ||
    !/[^A-Za-z0-9]/.test(newPassword)
  ) {
    return { status: "password_policy" };
  }
  if (newPassword !== confirmation) {
    return { status: "password_mismatch" };
  }
  if (
    verifyPassword(newPassword, credential.password_salt, credential.password_hash)
  ) {
    return { status: "initial_reuse" };
  }

  const passwordSalt = randomBytes(16).toString("hex");
  const passwordHash = hashPassword(newPassword, passwordSalt);
  const nextSessionVersion = credential.session_version + 1;
  const now = new Date().toISOString();
  const { data, error } = await getSupabaseAdmin()
    .from("susi_class2_teacher_class_credentials")
    .update({
      password_hash: passwordHash,
      password_salt: passwordSalt,
      must_change_password: false,
      password_updated_at: now,
      session_version: nextSessionVersion,
      updated_at: now,
    })
    .eq("class_code", classCode)
    .eq("must_change_password", true)
    .eq("session_version", credential.session_version)
    .select("session_version")
    .maybeSingle();

  if (error) throw error;
  if (!data) return { status: "already_registered" };
  return { status: "success", sessionVersion: data.session_version as number };
}

export async function setTeacherClassSession(
  classCode: ClassCode,
  sessionVersion: number
) {
  const store = await cookies();
  store.set(COOKIE_NAME, encodeSession(classCode, sessionVersion), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
}

export async function clearTeacherClassSession() {
  const store = await cookies();
  store.delete(COOKIE_NAME);
  store.delete("susi_class2_teacher_session");
}

export async function readTeacherClassSession() {
  const store = await cookies();
  return decodeSession(store.get(COOKIE_NAME)?.value);
}

export async function readVerifiedTeacherClassSession() {
  const session = await readTeacherClassSession();
  if (!session) return null;

  const credential = await getClassCredential(session.classCode);
  if (
    !credential ||
    credential.must_change_password ||
    credential.session_version !== session.sessionVersion
  ) {
    return null;
  }
  return session;
}

export async function requireTeacherClassSession(expectedClassCode?: ClassCode) {
  const session = await readVerifiedTeacherClassSession();
  if (!session || (expectedClassCode && session.classCode !== expectedClassCode)) {
    redirect("/teacher?auth=required");
  }
  return session;
}
