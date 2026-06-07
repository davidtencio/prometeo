import { NextRequest, NextResponse } from "next/server";
import type { ChartPayload } from "@/lib/chat-types";

/**
 * Endpoint para conectar la web app con Prometeo.
 *
 * Variables sugeridas:
 * OPENCLAW_API_URL=http://localhost:3001/chat
 * OPENCLAW_API_KEY=clave-local
 *
 * Responde con un stream NDJSON: una línea JSON por evento.
 *   {"type":"text","value":"..."}   fragmento de texto
 *   {"type":"chart","value":{...}}  gráfico estructurado
 *
 * En modo demo (sin OPENCLAW_API_URL) emite texto palabra por palabra para
 * simular el streaming del agente.
 */

const encoder = new TextEncoder();

function ndjson(obj: unknown): Uint8Array {
  return encoder.encode(JSON.stringify(obj) + "\n");
}

function streamResponse(stream: ReadableStream): Response {
  return new Response(stream, {
    headers: {
      "Content-Type": "application/x-ndjson; charset=utf-8",
      "Cache-Control": "no-store"
    }
  });
}

// Gráfico de demostración: comparativo de precios de un estudio de mercado.
const DEMO_CHART: ChartPayload = {
  type: "bar",
  title: "Comparativo de precios - Dapagliflozina 10 mg (SICOP)",
  unit: "₡",
  data: [
    { label: "H. México", value: 1350 },
    { label: "H. San Juan", value: 1320 },
    { label: "H. Calderón", value: 1410 },
    { label: "H. Escalante", value: 1300 },
    { label: "H. Max Peralta", value: 1380 }
  ],
  average: 1352,
  median: 1350
};

function wantsChart(message: string) {
  return /precio|mercado|gr[aá]fic|compar/i.test(message);
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);

  const hasMessage =
    typeof body?.message === "string" && body.message.trim().length > 0;
  const hasFiles = Array.isArray(body?.files) && body.files.length > 0;

  if (!hasMessage && !hasFiles) {
    return NextResponse.json(
      { error: "Debe enviar un mensaje o un archivo." },
      { status: 400 }
    );
  }

  const openClawUrl = process.env.OPENCLAW_API_URL;

  // --- Modo demo: streaming simulado ---
  if (!openClawUrl) {
    const files = Array.isArray(body.files) ? body.files : [];
    const showChart = wantsChart(body.message ?? "");

    let content: string;
    if (files.length) {
      const names = files
        .map((f: { name?: string }) => f?.name)
        .filter(Boolean)
        .join(", ");
      content = `Recibí **${files.length}** archivo(s): ${names}.\n\nEn modo demo no se procesan; cuando conectes Prometeo (OpenClaw) podrá analizarlos.`;
    } else if (showChart) {
      content =
        "Aquí tienes el **comparativo de precios** del estudio de mercado (datos simulados).\n\n- Promedio: ₡1.352\n- Mediana: ₡1.350\n- Coeficiente de variación: 3,05%";
    } else {
      content =
        "Respuesta simulada: configure `OPENCLAW_API_URL` para conectar este endpoint con Prometeo.";
    }

    const tokens = content.split(/(\s+)/);

    const stream = new ReadableStream({
      async start(controller) {
        for (const token of tokens) {
          controller.enqueue(ndjson({ type: "text", value: token }));
          await new Promise((resolve) => setTimeout(resolve, 25));
        }
        if (showChart) {
          controller.enqueue(ndjson({ type: "chart", value: DEMO_CHART }));
        }
        controller.close();
      }
    });

    return streamResponse(stream);
  }

  // --- Modo real: proxy hacia OpenClaw ---
  try {
    const response = await fetch(openClawUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(process.env.OPENCLAW_API_KEY
          ? { Authorization: `Bearer ${process.env.OPENCLAW_API_KEY}` }
          : {})
      },
      body: JSON.stringify({
        message: body.message,
        context: body.context ?? {}
      })
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: "Prometeo no respondió correctamente." },
        { status: 502 }
      );
    }

    const data = await response.json();

    // Adaptamos la respuesta del agente al mismo formato de stream NDJSON.
    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(ndjson({ type: "text", value: data.content ?? "" }));
        if (data.chart) {
          controller.enqueue(ndjson({ type: "chart", value: data.chart }));
        }
        controller.close();
      }
    });

    return streamResponse(stream);
  } catch {
    return NextResponse.json(
      { error: "No fue posible conectar con Prometeo." },
      { status: 502 }
    );
  }
}
