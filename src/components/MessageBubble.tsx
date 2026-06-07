"use client";

import { FileSpreadsheet, Download, Eye, FileText } from "lucide-react";
import dynamic from "next/dynamic";
import { Markdown } from "./Markdown";
import { ResultsTable } from "./ResultsTable";
import { formatFileSize } from "@/lib/format";
import type { Attachment, ChartPayload } from "@/lib/chat-types";

// El gráfico (Recharts) es pesado y solo aparece tras una respuesta:
// se carga de forma diferida para aligerar el bundle inicial.
const ChartBlock = dynamic(
  () => import("./ChartBlock").then((m) => m.ChartBlock),
  { ssr: false }
);

type MessageRole = "user" | "assistant";

type MessageBubbleProps = {
  role: MessageRole;
  children: React.ReactNode;
  time: string;
  withTable?: boolean;
  withFile?: boolean;
  error?: boolean;
  chart?: ChartPayload;
  files?: Attachment[];
};

function FileChips({ files }: { files: Attachment[] }) {
  return (
    <div className="mt-3 flex flex-wrap gap-2">
      {files.map((file, index) => (
        <div
          key={`${file.name}-${index}`}
          className="flex items-center gap-2 rounded-lg border border-borderSoft bg-surface/50 px-3 py-2 text-xs"
        >
          <FileText size={14} className="text-brand" />
          <span className="max-w-[180px] truncate text-white">{file.name}</span>
          <span className="text-mutedText">{formatFileSize(file.size)}</span>
        </div>
      ))}
    </div>
  );
}

export function MessageBubble({
  role,
  children,
  time,
  withTable = false,
  withFile = false,
  error = false,
  chart,
  files
}: MessageBubbleProps) {
  const isUser = role === "user";
  const hasFiles = files && files.length > 0;

  if (isUser) {
    return (
      <div className="flex justify-end gap-3">
        <div className="max-w-[720px] rounded-xl bg-panelSoft px-5 py-4 text-white shadow-soft">
          {children ? (
            <div className="leading-relaxed whitespace-pre-wrap">{children}</div>
          ) : null}
          {hasFiles && <FileChips files={files} />}
          <div className="mt-2 text-right text-xs text-mutedText">{time} ✓✓</div>
        </div>
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand text-sm font-bold text-surface">
          DT
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-start gap-4">
      <div className="mt-1 flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand/15 ring-1 ring-brand/30">
        <span className="text-2xl font-black text-brand">C</span>
      </div>
      <div
        className={`max-w-[790px] rounded-xl px-5 py-4 text-white shadow-soft ${
          error
            ? "border border-red-500/40 bg-red-950/40"
            : "bg-panelSoft"
        }`}
      >
        {error ? (
          <div className="leading-relaxed">{children}</div>
        ) : (
          <Markdown>{typeof children === "string" ? children : ""}</Markdown>
        )}
        {chart && <ChartBlock chart={chart} />}
        {withTable && <ResultsTable />}
        {withFile && (
          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            <div className="flex min-w-0 flex-1 items-center gap-3 rounded-xl border border-borderSoft bg-surface/50 px-4 py-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-600">
                <FileSpreadsheet size={18} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">Estudio_Mercado_Dapagliflozina.xlsx</p>
                <p className="text-xs text-mutedText">14.2 KB</p>
              </div>
              <button className="rounded-lg p-2 text-mutedText hover:bg-panel hover:text-white">
                <Download size={18} />
              </button>
            </div>
            <button className="flex items-center justify-center gap-2 rounded-xl border border-borderSoft px-4 py-3 text-sm font-medium hover:bg-panel">
              Ver reporte
              <Eye size={18} />
            </button>
          </div>
        )}
        <div className="mt-2 text-right text-xs text-mutedText">{time}</div>
      </div>
    </div>
  );
}
