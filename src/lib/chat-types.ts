/**
 * Contrato de datos entre el agente (Prometeo/OpenClaw) y la web app.
 * El agente devuelve texto y, opcionalmente, un gráfico estructurado que el
 * frontend dibuja con Recharts.
 */

export type ChartPoint = {
  label: string;
  value: number;
};

export type ChartPayload = {
  type: "bar";
  title: string;
  /** Unidad/símbolo para los valores, p. ej. "₡". */
  unit?: string;
  data: ChartPoint[];
  /** Líneas de referencia opcionales (promedio, mediana, etc.). */
  average?: number;
  median?: number;
};

export type ChatResponse = {
  role: "assistant";
  content: string;
  chart?: ChartPayload;
};

export type Attachment = {
  name: string;
  size: number;
  type: string;
};

export type ChatMessage = {
  id: number;
  role: "user" | "assistant";
  text: string;
  time: string;
  error?: boolean;
  chart?: ChartPayload;
  files?: Attachment[];
};

export type Conversation = {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: number;
  updatedAt: number;
};
