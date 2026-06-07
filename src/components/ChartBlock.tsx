"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import type { ChartPayload } from "@/lib/chat-types";

type ChartBlockProps = {
  chart: ChartPayload;
};

function formatValue(value: number, unit?: string) {
  const formatted = new Intl.NumberFormat("es-CR").format(value);
  return unit ? `${unit}${formatted}` : formatted;
}

export function ChartBlock({ chart }: ChartBlockProps) {
  const hasAverage = typeof chart.average === "number";
  const hasMedian = typeof chart.median === "number";

  return (
    <div className="mt-4 rounded-xl border border-borderSoft bg-surface/50 p-4">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
        <p className="text-sm font-semibold text-white">{chart.title}</p>
        <div className="flex items-center gap-4 text-xs text-mutedText">
          {hasAverage && (
            <span className="flex items-center gap-1.5">
              <span className="inline-block h-0 w-4 border-t-2 border-dashed border-brand" />
              Promedio {formatValue(chart.average as number, chart.unit)}
            </span>
          )}
          {hasMedian && (
            <span className="flex items-center gap-1.5">
              <span className="inline-block h-0 w-4 border-t-2 border-dashed border-mutedText" />
              Mediana {formatValue(chart.median as number, chart.unit)}
            </span>
          )}
        </div>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chart.data} margin={{ top: 8, right: 8, bottom: 4, left: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#263342" vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fill: "#9aa7b4", fontSize: 12 }}
              tickLine={false}
              axisLine={{ stroke: "#263342" }}
            />
            <YAxis
              tick={{ fill: "#9aa7b4", fontSize: 12 }}
              tickLine={false}
              axisLine={{ stroke: "#263342" }}
              tickFormatter={(value) => formatValue(value, chart.unit)}
              width={70}
            />
            <Tooltip
              cursor={{ fill: "rgba(73,209,140,.10)" }}
              contentStyle={{
                background: "#0c1117",
                border: "1px solid #49d18c",
                borderRadius: 10,
                padding: "8px 12px",
                boxShadow: "0 10px 30px rgba(0,0,0,.5)"
              }}
              itemStyle={{ color: "#ffffff", fontSize: 13, fontWeight: 600 }}
              labelStyle={{ color: "#9aa7b4", fontSize: 12, marginBottom: 4 }}
              formatter={(value) => [formatValue(Number(value), chart.unit), "Precio"]}
            />
            {hasAverage && (
              <ReferenceLine
                y={chart.average}
                stroke="#49d18c"
                strokeDasharray="4 4"
                ifOverflow="extendDomain"
              />
            )}
            {hasMedian && (
              <ReferenceLine
                y={chart.median}
                stroke="#9aa7b4"
                strokeDasharray="4 4"
                ifOverflow="extendDomain"
              />
            )}
            <Bar dataKey="value" radius={[6, 6, 0, 0]} maxBarSize={48}>
              {chart.data.map((point) => (
                <Cell key={point.label} fill="#1f9d66" />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
