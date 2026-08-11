"use client";

import {
  useActionState,
  useEffect,
  useRef,
  useState,
  useTransition,
} from "react";
import { useRouter } from "next/navigation";
import {
  getTeacherClassAuthModeAction,
  registerTeacherClassPasswordAction,
  unlockTeacherClassAction,
  type ClassAuthState,
} from "@/app/teacher/auth-actions";
import {
  CLASS_NAME_BY_CODE,
  CLASS_OPTIONS,
  type ClassCode,
} from "@/lib/class-codes";

type SelectedClass = {
  classCode: ClassCode;
  mode: "login" | "setup";
};

const INITIAL_AUTH_STATE: ClassAuthState = { error: "", success: false };

export function ClassSelector({ counts }: { counts: Record<ClassCode, number> }) {
  const [selectedClass, setSelectedClass] = useState<SelectedClass | null>(null);
  const [error, setError] = useState("");
  const [checkingClass, startChecking] = useTransition();

  function selectClass(classCode: ClassCode) {
    if (checkingClass) return;
    setError("");
    startChecking(async () => {
      const result = await getTeacherClassAuthModeAction(classCode);
      if (!result.mode) {
        setError(result.error);
        return;
      }
      setSelectedClass({ classCode, mode: result.mode });
    });
  }

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-3">
        {CLASS_OPTIONS.map((option) => (
          <section
            key={option.code}
            className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <h2 className="text-lg font-bold text-slate-800">{option.name}</h2>
            <p className="mt-1 text-sm text-slate-500">{option.description}</p>
            <p className="mt-4 text-sm font-medium text-slate-700">
              등록 학생 {counts[option.code]}명
            </p>
            <button
              type="button"
              onClick={() => selectClass(option.code)}
              disabled={checkingClass}
              className="mt-5 rounded-lg bg-brand px-4 py-2.5 text-center text-sm font-semibold text-white transition hover:bg-brand-dark disabled:cursor-wait disabled:opacity-60"
            >
              {checkingClass ? "확인 중..." : "학생 목록 보기"}
            </button>
          </section>
        ))}
      </div>

      {error && (
        <p role="alert" className="mt-4 text-center text-sm text-red-500">
          {error}
        </p>
      )}

      {selectedClass?.mode === "login" && (
        <ClassLoginDialog
          key={`login-${selectedClass.classCode}`}
          classCode={selectedClass.classCode}
          onClose={() => setSelectedClass(null)}
        />
      )}
      {selectedClass?.mode === "setup" && (
        <ClassPasswordSetupDialog
          key={`setup-${selectedClass.classCode}`}
          classCode={selectedClass.classCode}
          onClose={() => setSelectedClass(null)}
        />
      )}
    </>
  );
}

function useClassSuccessRedirect(classCode: ClassCode, success: boolean) {
  const router = useRouter();
  useEffect(() => {
    if (success) {
      router.push(`/teacher?class=${classCode}`);
      router.refresh();
    }
  }, [classCode, router, success]);
}

function DialogFrame({
  children,
  pending,
  onClose,
}: {
  children: React.ReactNode;
  pending: boolean;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !pending) onClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 shadow-xl"
      >
        {children}
      </section>
    </div>
  );
}

function ClassLoginDialog({
  classCode,
  onClose,
}: {
  classCode: ClassCode;
  onClose: () => void;
}) {
  const [state, formAction, pending] = useActionState(
    unlockTeacherClassAction,
    INITIAL_AUTH_STATE
  );
  const inputRef = useRef<HTMLInputElement>(null);
  const className = CLASS_NAME_BY_CODE[classCode];
  useClassSuccessRedirect(classCode, state.success);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <DialogFrame pending={pending} onClose={onClose}>
      <h2 className="text-lg font-bold text-slate-800">{className} 담임 비밀번호</h2>
      <p className="mt-2 text-sm text-slate-500">
        {className} 담임 비밀번호를 입력해 주세요.
      </p>
      <form action={formAction} className="mt-5">
        <input type="hidden" name="class_code" value={classCode} />
        <PasswordInput
          inputRef={inputRef}
          id="class-password"
          name="password"
          label="비밀번호"
          autoComplete="current-password"
          disabled={pending}
        />
        <AuthError message={state.error} />
        <DialogButtons pending={pending} onClose={onClose} submitLabel="확인" />
      </form>
    </DialogFrame>
  );
}

function ClassPasswordSetupDialog({
  classCode,
  onClose,
}: {
  classCode: ClassCode;
  onClose: () => void;
}) {
  const [state, formAction, pending] = useActionState(
    registerTeacherClassPasswordAction,
    INITIAL_AUTH_STATE
  );
  const inputRef = useRef<HTMLInputElement>(null);
  const className = CLASS_NAME_BY_CODE[classCode];
  useClassSuccessRedirect(classCode, state.success);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <DialogFrame pending={pending} onClose={onClose}>
      <h2 className="text-lg font-bold text-slate-800">
        {className} 담임 비밀번호 등록
      </h2>
      <p className="mt-2 text-sm leading-6 text-slate-500">
        처음 사용하는 학급입니다. 관리자에게 안내받은 초기 비밀번호를 확인한 후
        새로운 담임 비밀번호를 등록해 주세요.
      </p>
      <form action={formAction} className="mt-5 space-y-3">
        <input type="hidden" name="class_code" value={classCode} />
        <PasswordInput
          inputRef={inputRef}
          id="initial-password"
          name="initial_password"
          label="초기 비밀번호"
          autoComplete="current-password"
          disabled={pending}
        />
        <PasswordInput
          id="new-password"
          name="new_password"
          label="새 비밀번호"
          autoComplete="new-password"
          disabled={pending}
        />
        <PasswordInput
          id="new-password-confirmation"
          name="new_password_confirmation"
          label="새 비밀번호 확인"
          autoComplete="new-password"
          disabled={pending}
        />
        <p className="text-xs text-slate-400">
          영문·숫자·특수문자를 포함해 8자 이상 입력해 주세요.
        </p>
        <AuthError message={state.error} />
        <DialogButtons
          pending={pending}
          onClose={onClose}
          submitLabel="비밀번호 등록"
        />
      </form>
    </DialogFrame>
  );
}

function PasswordInput({
  inputRef,
  id,
  name,
  label,
  autoComplete,
  disabled,
}: {
  inputRef?: React.RefObject<HTMLInputElement | null>;
  id: string;
  name: string;
  label: string;
  autoComplete: "current-password" | "new-password";
  disabled: boolean;
}) {
  return (
    <label htmlFor={id} className="block">
      <span className="mb-1 block text-xs font-medium text-slate-600">{label}</span>
      <input
        ref={inputRef}
        id={id}
        name={name}
        type="password"
        autoComplete={autoComplete}
        required
        disabled={disabled}
        className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-brand"
      />
    </label>
  );
}

function AuthError({ message }: { message: string }) {
  return message ? (
    <p role="alert" className="mt-2 text-xs text-red-500">
      {message}
    </p>
  ) : null;
}

function DialogButtons({
  pending,
  onClose,
  submitLabel,
}: {
  pending: boolean;
  onClose: () => void;
  submitLabel: string;
}) {
  return (
    <div className="mt-5 flex justify-end gap-2">
      <button
        type="button"
        onClick={onClose}
        disabled={pending}
        className="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-600 disabled:opacity-60"
      >
        취소
      </button>
      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark disabled:opacity-60"
      >
        {pending ? "처리 중..." : submitLabel}
      </button>
    </div>
  );
}
