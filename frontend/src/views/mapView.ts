import * as L from "leaflet"
import type { Station } from "../core/types"
import { MAP_CENTER } from "../core/data"
import { stationFinished, isDone } from "../core/storage"

type MapViewDeps = {
  onProgressSync: () => void
}

export class MapView {
  private map: L.Map | null = null
  private markers = new Map<string, L.CircleMarker>()
  private containerId: string
  private deps: MapViewDeps
  private stations: Station[]

  constructor(containerId: string, stations: Station[], deps: MapViewDeps) {
    this.containerId = containerId
    this.stations = stations
    this.deps = deps
  }

  refreshMarkerStyles(): void {
    for (const st of this.stations) {
      const m = this.markers.get(st.id)
      if (!m) continue
      const finished = stationFinished(st)
      m.setStyle({ color: finished ? "#16a34a" : "#e11d48", fillColor: finished ? "#16a34a" : "#e11d48" })
    }
  }

  invalidateSize(): void {
    this.map?.invalidateSize()
  }

  async init(): Promise<void> {
    if (this.map) return

    this.map = L.map(this.containerId, { zoomControl: false }).setView(MAP_CENTER, 17)
    L.control.zoom({ position: "bottomright" }).addTo(this.map)

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: "&copy; OpenStreetMap-Mitwirkende"
    }).addTo(this.map)

    for (const st of this.stations) {
      const marker = L.circleMarker([st.lat, st.lng], { radius: 10, color: "#e11d48", fillOpacity: 0.9 })
      marker.addTo(this.map)
      marker.on("click", () => this.openStation(st.id))
      this.markers.set(st.id, marker)
    }

    this.refreshMarkerStyles()
  }

  openStation(stationId: string): void {
    if (!this.map) return
    const st = this.stations.find(s => s.id === stationId)
    if (!st) return
    const marker = this.markers.get(st.id)
    if (!marker) return

    const content = this.buildPopup(st)
    marker.bindPopup(content, { maxWidth: 360, className: "station-popup" }).openPopup()
    this.refreshMarkerStyles()
  }

  private buildPopup(st: Station): HTMLElement {
    const wrap = document.createElement("div")
    wrap.className = "popup-wrap"

    const title = document.createElement("h3")
    title.textContent = st.name

    const prog = document.createElement("div")
    const done = st.tasks.filter(t => isDone(t.id)).length
    prog.textContent = `${done}/${st.tasks.length} erledigt`

    const desc = document.createElement("p")
    if (st.description) desc.textContent = st.description

    wrap.appendChild(title)
    wrap.appendChild(prog)
    if (st.description) wrap.appendChild(desc)

    for (const task of st.tasks) {
      const row = document.createElement("div")
      row.className = "popup-row"

      const label = document.createElement("div")
      label.className = "label"
      label.textContent = task.label

      const isTaskDone = isDone(task.id)
      const status = document.createElement("span")
      status.className = `status-pill ${isTaskDone ? "ok" : "todo"}`
      status.textContent = isTaskDone ? "Erledigt" : "Offen"

      row.appendChild(label)
      row.appendChild(status)
      wrap.appendChild(row)
    }

    const hint = document.createElement("div")
    hint.className = "hint"
    hint.textContent = "Hinweis, Fortschritt ist an dieses Gerät und diesen Browser gebunden."
    wrap.appendChild(hint)

    return wrap
  }
}
