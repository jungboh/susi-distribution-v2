"use client";

import Link from "next/link";
import {
  type ReactNode,
  type RefObject,
  useActionState,
  useEffect,
  useRef,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import {
  getTeacherClassAuthModeAction,
  registerTeacherClassPasswordAction,
  unlockTeacherClassAction,
  type ClassAuthState,
} from "@/app/teacher/auth-actions";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CLASS_UI_NAME_BY_CODE, type ClassCode } from "@/lib/class-codes";

type AuthMode = "checking" | "login" | "setup" | "error";
const INITIAL_AUTH_STATE: ClassAuthState = { error: "", success: false };

export function TeacherAuthPanel({ classCode }: { classCode: ClassCode }) {
  const [mode, setMode] = useState<AuthMode>("checking");
  const [modeError, setModeError] = useState("");

  useEffect(() => {
    let active = true;
    getTeacherClassAuthModeAction(classCode).then((result) => {
      if (!active) return;
      if (result.mode) setMode(result.mode);
      else {
        setModeError(result.error || "학급 인증 상태를 확인하지 못했습니다.");
        setMode("error");
      }
    });
    return () => {
      active = false;
    };
  }, [classCode]);

  if (mode === "checking") {
    return <AuthCard title="담임 인증 확인 중" description="잠시만 기다려 주세요." />;
  }
  if (mode === "error") {
    return (
      <AuthCard title="담임 인증을 확인하지 못했습니다" description={modeError}>
        <BackToClasses />
      </AuthCard>
    );
  }
  return mode === "setup" ? (
    <PasswordSetupForm classCode={classCode} />
  ) : (
    <LoginForm classCode={classCode} />
  );
}

function LoginForm({ classCode }: { classCode: ClassCode }) {
  const [state, formAction, pending] = useActionState(unlockTeacherClassAction, INITIAL_AUTH_STATE);
  const inputRef = useRef<HTMLInputElement>(null);
  const className = CLASS_UI_NAME_BY_CODE[classCode];
  useSuccessRedirect(classCode, state.success);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <AuthCard title={`${className} 담임 로그인`} description="담임 비밀번호를 입력해 주세요.">
      <form action={formAction} className="space-y-4">
        <input type="hidden" name="class_code" value={classCode} />
        <PasswordField
          inputRef={inputRef}
          id="teacher-password"
          name="password"
          label="비밀번호"
          placeholder="비밀번호 입력"
          autoComplete="current-password"
          disabled={pending}
        />
        <AuthError message={state.error} />
        <Button type="submit" loading={pending} loadingLabel="로그인 중" className="w-full">
          로그인
        </Button>
        <BackToClasses />
      </form>
    </AuthCard>
  );
}

function PasswordSetupForm({ classCode }: { classCode: ClassCode }) {
  const [state, formAction, pending] = useActionState(registerTeacherClassPasswordAction, INITIAL_AUTH_STATE);
  const inputRef = useRef<HTMLInputElement>(null);
  const className = CLASS_UI_NAME_BY_CODE[classCode];
  useSuccessRedirect(classCode, state.success);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <AuthCard
      title={`${className} 담임 비밀번호 등록`}
      description="관리자에게 안내받은 초기 비밀번호를 입력한 뒤 새 담임 비밀번호를 등록해 주세요."
    >
      <form action={formAction} className="space-y-3">
        <input type="hidden" name="class_code" value={classCode} />
        <PasswordField inputRef={inputRef} id="initial-password" name="initial_password" label="초기 비밀번호" autoComplete="current-password" disabled={pending} />
        <PasswordField id="new-password" name="new_password" label="새 비밀번호" autoComplete="new-password" disabled={pending} />
        <PasswordField id="new-password-confirmation" name="new_password_confirmation" label="새 비밀번호 확인" autoComplete="new-password" disabled={pending} />
        <p className="text-xs leading-5 text-muted">영문·숫자·특수문자를 포함해 8자 이상 입력해 주세요.</p>
        <AuthError message={state.error} />
        <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row">
          <Link href="/" className="inline-flex min-h-10 flex-1 items-center justify-center rounded-lg border border-line bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-subtle focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2">
            취소
          </Link>
          <Button type="submit" loading={pending} loadingLabel="등록 중" className="flex-1">
            비밀번호 등록
          </Button>
        </div>
      </form>
    </AuthCard>
  );
}

function AuthCard({ title, description, children }: { title: string; description: string; children?: ReactNode }) {
  return (
    <Card className="w-full max-w-md rounded-xl border-white/70 bg-white/95 shadow-[0_20px_50px_rgb(12_45_83/0.18)]">
      <CardHeader className="p-8 pb-5 text-center sm:p-10 sm:pb-6">
        <CardTitle className="text-2xl text-navy sm:text-3xl">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      {children && <CardContent className="p-8 pt-2 sm:p-10 sm:pt-2">{children}</CardContent>}
    </Card>
  );
}

function PasswordField({ inputRef, id, name, label, placeholder, autoComplete, disabled }: { inputRef?: RefObject<HTMLInputElement | null>; id: string; name: string; label: string; placeholder?: string; autoComplete: "current-password" | "new-password"; disabled: boolean }) {
  const [visible, setVisible] = useState(false);
  return (
    <div>
      <label htmlFor={id} className="sr-only">{label}</label>
      <div className="relative">
        <input
          ref={inputRef}
          id={id}
          name={name}
          type={visible ? "text" : "password"}
          autoComplete={autoComplete}
          required
          disabled={disabled}
          placeholder={placeholder ?? label}
          className="min-h-11 w-full rounded-lg border border-line bg-white px-3 py-2 pr-11 text-sm text-slate-900 outline-none transition-colors focus:border-brand focus:ring-2 focus:ring-brand/20 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:opacity-70"
        />
        <button
          type="button"
          onClick={() => setVisible((prev) => !prev)}
          disabled={disabled}
          aria-label={visible ? `${label} 숨기기` : `${label} 표시`}
          aria-pressed={visible}
          className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-slate-400 transition-colors hover:text-slate-600 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
        >
          <EyeIcon open={visible} />
        </button>
      </div>
    </div>
  );
}

function EyeIcon({ open }: { open: boolean }) {
  const common = { className: "size-5", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.8, "aria-hidden": true } as const;
  return open ? (
    <svg {...common}>
      <path d="M2.5 12S6 5 12 5s9.5 7 9.5 7-3.5 7-9.5 7-9.5-7-9.5-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ) : (
    <svg {...common}>
      <path d="M3 3l18 18" />
      <path d="M10.6 5.1A9.9 9.9 0 0 1 12 5c6 0 9.5 7 9.5 7a17.4 17.4 0 0 1-3.2 4.1M6.6 6.6C4 8.3 2.5 12 2.5 12a17.6 17.6 0 0 0 4.1 5.2A10 10 0 0 0 12 19c1 0 2-.15 2.9-.44" />
      <path d="M9.9 10a3 3 0 0 0 4.1 4.1" />
    </svg>
  );
}

function AuthError({ message }: { message: string }) {
  return (
    <div aria-live="polite">
      {message && <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs leading-5 text-red-700">{message}</p>}
    </div>
  );
}

function BackToClasses() {
  return (
    <Link href="/" className="block text-center text-sm font-semibold text-brand hover:text-brand-dark focus-visible:rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2">
      ← 학급 선택으로 돌아가기
    </Link>
  );
}

function useSuccessRedirect(classCode: ClassCode, success: boolean) {
  const router = useRouter();
  useEffect(() => {
    if (success) {
      router.replace(`/teacher?class=${classCode}`);
      router.refresh();
    }
  }, [classCode, router, success]);
}
