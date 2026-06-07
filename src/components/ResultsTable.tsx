import { sicopRows } from "@/lib/mock-data";

export function ResultsTable() {
  return (
    <div className="mt-4 overflow-hidden rounded-xl border border-borderSoft">
      <table className="min-w-full border-collapse text-left text-sm">
        <thead className="bg-surface/80 text-xs uppercase tracking-wide text-white/75">
          <tr>
            <th className="px-4 py-3 font-semibold">Número de procedimiento</th>
            <th className="px-4 py-3 font-semibold">Institución</th>
            <th className="px-4 py-3 font-semibold">Fecha</th>
            <th className="px-4 py-3 font-semibold">Precio unitario</th>
            <th className="px-4 py-3 font-semibold">Estado</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-borderSoft/70 bg-panel/55">
          {sicopRows.map((row) => (
            <tr key={row.procedure} className="hover:bg-panelSoft">
              <td className="whitespace-nowrap px-4 py-3 text-white/90">{row.procedure}</td>
              <td className="whitespace-nowrap px-4 py-3 text-white/80">{row.institution}</td>
              <td className="whitespace-nowrap px-4 py-3 text-white/80">{row.date}</td>
              <td className="whitespace-nowrap px-4 py-3 text-white/80">{row.price}</td>
              <td className="whitespace-nowrap px-4 py-3 font-medium text-brand">{row.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
