import type { Station, Task } from "../core/types"
import { stationFinished, stationProgress, isDone } from "../core/storage"

type ListDeps = {
  onOpenMap: (stationId: string) => void
  onProgressSync: () => void
}

export function renderList(root: HTMLElement, stations: Station[], deps: ListDeps): void {
  root.innerHTML = ""
  root.appendChild(buildListRoot(stations, deps))
}

function buildListRoot(stations: Station[], deps: ListDeps): HTMLElement {
  const root = document.createElement("div")
  root.className = "list-root"

  for (const st of stations) {
    const wrap = document.createElement("div")
    wrap.className = "list-station"

    const header = document.createElement("div")
    header.className = "list-station-header"

    const title = document.createElement("h3")
    title.textContent = st.name

    const progress = document.createElement("span")
    const pr = stationProgress(st)
    progress.className = "list-progress"
    progress.textContent = `${pr.done}/${pr.total}`

    const openBtn = document.createElement("button")
    openBtn.textContent = "Auf Karte öffnen"
    openBtn.addEventListener("click", () => deps.onOpenMap(st.id))

    header.appendChild(title)
    header.appendChild(progress)
    header.appendChild(openBtn)

    if (st.description) {
      const desc = document.createElement("p")
      desc.textContent = st.description
      wrap.appendChild(desc)
    }

    const taskList = document.createElement("div")
    taskList.className = "task-list"

    for (const t of st.tasks) {
      taskList.appendChild(buildTaskRow(st, t, deps))
    }

    if (stationFinished(st)) {
      wrap.classList.add("done")
    }

    wrap.appendChild(header)
    wrap.appendChild(taskList)
    root.appendChild(wrap)
  }

  return root
}

function buildTaskRow(station: Station, task: Task, deps: ListDeps): HTMLElement {
  const row = document.createElement("div")
  row.className = "task-row"

  const left = document.createElement("div")
  left.className = "task-left"
  left.textContent = task.label

  const right = document.createElement("div")
  right.className = "task-right"

  const done = isDone(task.id)
  const status = document.createElement("span")
  status.className = `status-pill ${done ? "ok" : "todo"}`
  status.textContent = done ? "Erledigt" : "Offen"

  right.appendChild(status)

  row.appendChild(left)
  row.appendChild(right)
  return row
}
