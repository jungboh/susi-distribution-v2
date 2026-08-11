"use client";

import { useState } from "react";

export function CopyLinkButton({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    const url = `${window.location.origin}/apply/${code}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      window.prompt("아래 링크를 복사하세요", url);
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="rounded border border-slate-200 px-2 py-1 text-[11px] font-medium text-slate-600 hover:border-brand hover:text-brand"
    >
      {copied ? "복사됨" : "링크 복사"}
    </button>
  );
}
