"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[app:global-error]", {
      name: error.name,
      message: error.message,
      stack: error.stack,
      digest: error.digest,
    });
  }, [error]);

  return (
    <html lang="ko">
      <body>
        <main style={{ padding: "3rem 1rem", textAlign: "center" }}>
          <h1>애플리케이션 오류가 발생했습니다</h1>
          <p>잠시 후 다시 시도해주세요.</p>
          {error.digest && <p>오류 코드: {error.digest}</p>}
          <button type="button" onClick={reset}>
            다시 시도
          </button>
        </main>
      </body>
    </html>
  );
}
