import { AlertTriangle, FileText } from 'lucide-react'
import { PendingTask } from './dashboard-types'

const pendingTasks: PendingTask[] = [
  {
    id: 1,
    title: 'Validar borrador de compra',
    desc: 'Equipos de monitoreo esteril (Art. 14 LGCP)',
  },
  {
    id: 2,
    title: 'Revisar alerta de stock',
    desc: 'Reactivos de laboratorio por debajo del 10%',
  },
]

export function PendingTasks() {
  return (
    <article className="rounded-2xl border border-[#d8e0f2] bg-white p-5 shadow-sm md:p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-[#071226]">Acciones requeridas</h2>
        <button className="text-sm font-medium text-[#2058ff]">Ver todas</button>
      </div>
      <div className="space-y-3">
        {pendingTasks.map((task) => (
          <div key={task.id} className="group flex items-start rounded-xl border border-[#ebf0fa] bg-[#fbfdff] p-3 transition hover:border-[#d3def3] hover:bg-white">
            <div className="mt-0.5 rounded-lg border border-[#d8e0f2] bg-white p-2">
              {task.id === 1 ? <FileText size={17} className="text-blue-600" /> : <AlertTriangle size={17} className="text-amber-600" />}
            </div>
            <div className="ml-3 flex-1">
              <p className="text-sm font-medium text-[#182845]">{task.title}</p>
              <p className="text-xs text-[#56698b]">{task.desc}</p>
            </div>
            <button className="rounded-full border border-[#d8e0f2] px-3 py-1 text-xs font-medium text-[#3f5375] transition group-hover:border-[#b8c5df]">
              Revisar
            </button>
          </div>
        ))}
      </div>
    </article>
  )
}
