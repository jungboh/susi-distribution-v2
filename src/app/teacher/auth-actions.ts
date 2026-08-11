"use server";

import { redirect } from "next/navigation";
import { isClassCode, type ClassCode } from "@/lib/class-codes";
import { logServerError } from "@/lib/server-debug";
import {
  authenticateTeacherClass,
  clearTeacherClassSession,
  getTeacherClassCredentialStatus,
  registerFirstTeacherClassPassword,
  setTeacherClassSession,
} from "@/lib/teacher-auth";

export type ClassAuthState = { error: string; success: boolean };
export type ClassAuthModeResult = {
  mode: "login" | "setup" | null;
  error: string;
};

const INVALID_PASSWORD_MESSAGE =
  "비밀번호가 올바르지 않습니다. 다시 확인해 주세요.";
const PASSWORD_POLICY_MESSAGE =
  "영문·숫자·특수문자를 포함해 8자 이상 입력해 주세요.";

export async function getTeacherClassAuthModeAction(
  classCode: ClassCode
): Promise<ClassAuthModeResult> {
  if (!isClassCode(classCode)) {
    return { mode: null, error: "학급 인증 상태를 확인하지 못했습니다." };
  }

  try {
    const status = await getTeacherClassCredentialStatus(classCode);
    if (!status) {
      return { mode: null, error: "학급 인증 상태를 확인하지 못했습니다." };
    }
    return {
      mode: status.mustChangePassword ? "setup" : "login",
      error: "",
    };
  } catch (error) {
    logServerError("teacher-auth.class-mode", error);
    return { mode: null, error: "학급 인증 상태를 확인하지 못했습니다." };
  }
}

export async function unlockTeacherClassAction(
  _previousState: ClassAuthState,
  formData: FormData
): Promise<ClassAuthState> {
  const classCode = String(formData.get("class_code") ?? "");
  const password = String(formData.get("password") ?? "");

  if (!isClassCode(classCode) || !password) {
    return { error: INVALID_PASSWORD_MESSAGE, success: false };
  }

  try {
    const authenticated = await authenticateTeacherClass(classCode, password);
    if (!authenticated) {
      return { error: INVALID_PASSWORD_MESSAGE, success: false };
    }

    await setTeacherClassSession(classCode, authenticated.sessionVersion);
    return { error: "", success: true };
  } catch (error) {
    logServerError("teacher-auth.unlock-class", error);
    return {
      error: "인증을 처리하지 못했습니다. 잠시 후 다시 시도해 주세요.",
      success: false,
    };
  }
}

export async function registerTeacherClassPasswordAction(
  _previousState: ClassAuthState,
  formData: FormData
): Promise<ClassAuthState> {
  const classCode = String(formData.get("class_code") ?? "");
  const initialPassword = String(formData.get("initial_password") ?? "");
  const newPassword = String(formData.get("new_password") ?? "");
  const confirmation = String(formData.get("new_password_confirmation") ?? "");

  if (!isClassCode(classCode)) {
    return { error: "비밀번호를 등록하지 못했습니다. 잠시 후 다시 시도해 주세요.", success: false };
  }
  try {
    const result = await registerFirstTeacherClassPassword(
      classCode,
      initialPassword,
      newPassword,
      confirmation
    );

    if (result.status === "invalid_initial") {
      return { error: "초기 비밀번호가 올바르지 않습니다.", success: false };
    }
    if (result.status === "initial_reuse") {
      return { error: "초기 비밀번호와 다른 새 비밀번호를 사용해 주세요.", success: false };
    }
    if (result.status === "password_mismatch") {
      return { error: "새 비밀번호가 일치하지 않습니다.", success: false };
    }
    if (result.status === "password_policy") {
      return { error: PASSWORD_POLICY_MESSAGE, success: false };
    }
    if (result.status === "already_registered") {
      return {
        error: "이미 담임 비밀번호가 등록되었습니다. 새 비밀번호로 다시 로그인해 주세요.",
        success: false,
      };
    }
    if (result.status === "unavailable") {
      return { error: "비밀번호를 등록하지 못했습니다. 잠시 후 다시 시도해 주세요.", success: false };
    }

    await setTeacherClassSession(classCode, result.sessionVersion);
    return { error: "", success: true };
  } catch (error) {
    logServerError("teacher-auth.register-class-password", error);
    return {
      error: "비밀번호를 등록하지 못했습니다. 잠시 후 다시 시도해 주세요.",
      success: false,
    };
  }
}

export async function lockTeacherClassAction() {
  await clearTeacherClassSession();
  redirect("/teacher");
}
