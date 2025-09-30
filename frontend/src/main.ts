import type { Station } from "./core/types"
// import { ensureStationHashes } from "./core/crypto"
import {readProgress, setDone} from "./core/storage"
import { MapView } from "./views/mapView"
import { renderList } from "./views/listView"
import { createQrScanner } from "./views/qrScanner"
import {fetchStations, markTaskAsCompleted} from "./core/api"
import {v4} from "uuid";

const resetBtn = document.getElementById("resetBtn")
const qrBtn = document.getElementById("qrScannerBtn")
const mapBtn = document.getElementById("mapBtn")
const listBtn = document.getElementById("listBtn")

const homeViewEl = document.getElementById("home") as HTMLElement
const mapViewEl = document.getElementById("map") as HTMLElement
const listViewEl = document.getElementById("list") as HTMLElement
const readerViewEl = document.getElementById("reader") as HTMLElement
const badgeEl = document.getElementById("progressBadge") as HTMLElement

let STATIONS: Station[] = []
let mapController: MapView | null = null

const fetchProgress = () => {

}

const completeTask = async (taskId: string, code: string) => {
  if (localStorage.getItem("user_id") === null) {
    alert("Unknown error. Please reload the page.")
    return
  }
  const success = await markTaskAsCompleted(localStorage.getItem("user_id")!, taskId, code)
  if (!success) {
    alert("Diese Aufgabe konnte nicht erledigt werden. Bitte versuche es erneut.")
    return
  }
  setDone(taskId)
  updateProgressBadge()
}

// TODO This counter appears to be broken
export function updateProgressBadge(): void {
  let total = 0
  let done = 0
  const progress = readProgress()
  for (const station of STATIONS) {
    total += station.tasks.length
    const m = progress[station.id] || {}
    for (const task of station.tasks) if (m[task.id]) done++
  }
  badgeEl.textContent = `${done}/${total} Aufgaben erledigt`
}

const qr = createQrScanner("reader", text => {
  console.log("QR success", text)
  const data: {id?: string, code?: string} = JSON.parse(text)
  console.log('Task Data: ', data)
  if (!data.id || !data.code) {
    window.alert('Ungültiger QR-Code. Bitte versuche es erneut.')
    return
  }
  if (data.code === 'clear' && data.id === 'clear') {
    resetProgress(false)
    return
  }
  completeTask(data.id, data.code)
})

type View = "home" | "map" | "list" | "reader" | "none"

async function stopQrIfNeeded(view: View) {
  if (view !== "reader" && qr.isActive()) await qr.stop()
}

let prevView: View = "none"
async function showView(view: View) {
  homeViewEl.style.display = "none"
  mapViewEl.style.display = "none"
  listViewEl.style.display = "none"
  readerViewEl.style.display = "none"
  await stopQrIfNeeded(view)
  if (view === prevView) {
    console.log("No change")
    homeViewEl.style.display = "block"
    prevView = "home"
    return
  }
  else if (view === "map") {
    mapViewEl.style.display = "block"
    await mapController?.init()
    requestAnimationFrame(() => mapController?.invalidateSize())
  } else if (view === "list") {
    listViewEl.style.display = "block"
    renderList(listViewEl, STATIONS, {
      onOpenMap: async stationId => {
        await showView("map")
        mapController?.openStation(stationId)
      },
      onProgressSync: updateProgressBadge
    })
  } else if (view === "reader") {
    readerViewEl.style.display = "block"
    qr.start()
  }
  prevView = view
}

const resetProgress = async (requireConfirm: boolean) => {
  if (requireConfirm) if (!confirm("Fortschritt auf diesem Gerät wirklich löschen")) return
  localStorage.clear()
  // Generate new uid
  localStorage.setItem("user_id", v4())
  await stopQrIfNeeded("none")
  updateProgressBadge()
  mapController?.refreshMarkerStyles()
  if (listViewEl.style.display !== "none") {
    renderList(listViewEl, STATIONS, {
      onOpenMap: stationId => {
        showView("map").then(() => mapController?.openStation(stationId))
      },
      onProgressSync: updateProgressBadge
    })
  }
  alert("Fortschritt gelöscht.")
}

resetBtn?.addEventListener("click", async () => {
  await resetProgress(true)
})

qrBtn?.addEventListener("click", () => {
  showView("reader")
})
mapBtn?.addEventListener("click", () => {
  showView("map")
})
listBtn?.addEventListener("click", () => {
  showView("list")
})

async function initApp() {
  const userId = localStorage.getItem("user_id")
  if (!userId) localStorage.setItem("user_id", v4())
  try {
    STATIONS = await fetchStations()
    mapController = new MapView("map", STATIONS, { onProgressSync: updateProgressBadge })
    listViewEl.style.display = "none"
    mapViewEl.style.display = "none"
    readerViewEl.style.display = "none"
    updateProgressBadge()
    renderList(listViewEl, STATIONS, {
      onOpenMap: stationId => {
        showView("map").then(() => mapController?.openStation(stationId))
      },
      onProgressSync: updateProgressBadge
    })
  } catch (e) {
    console.error(e)
    alert("Stationen konnten nicht geladen werden.")
  }
}

initApp()
