"use client";

import { useEffect } from "react";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[app:error-boundary]", {
      name: error.name,
      message: error.message,
      stack: error.stack,
      digest: error.digest,
    });
  }, [error]);

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <section className="w-full max-w-md rounded-2xl border border-red-100 bg-white p-6 text-center shadow-sm">
        <h1 className="text-lg font-bold text-slate-800">화면을 불러오지 못했습니다</h1>
        <p className="mt-2 text-sm text-slate-500">
          잠시 후 다시 시도해주세요. 문제가 계속되면 관리자에게 문의해주세요.
        </p>
        {error.digest && (
          <p className="mt-2 text-xs text-slate-400">오류 코드: {error.digest}</p>
        )}
        <button
          type="button"
          onClick={reset}
          className="mt-5 rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white"
        >
          다시 시도
        </button>
      </section>
    </main>
  );
}
