// Use Leaflet from your node_modules
import * as L from "leaflet"
import {type Html5QrcodeResult, Html5QrcodeScanner} from "html5-qrcode"
import type {Html5QrcodeError} from "html5-qrcode/core";

type Task = {
  id: string
  label: string
  codePlain?: string
  codeHash?: string
}

type Station = {
  id: string
  name: string
  lat: number
  lng: number
  description?: string
  tasks: Task[]
}

// ===================== STATIONEN =====================
const STATIONS: Station[] = [
  {
    id: "s1",
    name: "DHBW Würfel – Marienstraße 20",
    lat: 48.68186956433014,
    lng: 10.154709643897347,
    description: "Finde den DHBW Würfel und löse alle Aufgaben.",
    tasks: [
      { id: "t1", label: "StuV Raum, EG M003", codePlain: "1111" },
      { id: "t2", label: "International Office, 7.OG M718", codePlain: "1111" },
      { id: "t3", label: "Nachhaltigkeit, EG Eingangshalle", codePlain: "1111" },
      { id: "t4", label: "Studierndenwerk Ulm, EG Eingangshalle", codePlain: "1111" },
      { id: "t5", label: "DHBW Hauptbibliothek, 4.OG M406", codePlain: "1111" },
      { id: "t6", label: "DHBW Studienberatung, 7.OG M729", codePlain: "1111" },
      { id: "t7", label: "Ersti Geschenk, 2.OG M203", codePlain: "1111" }
    ]
  },
  {
    id: "s2",
    name: "Felsen Bar",
    lat: 48.68392021671733,
    lng: 10.154129832887437,
    description: "Löse die Aufgabe an der Felsen Bar.",
    tasks: [
      { id: "t1", label: "Refresher", codePlain: "1111" }
    ]
  },
  {
    id: "s3",
    name: "Brenzpark – Eingang über Drehtor beim Badehaus",
    lat: 48.684673587174395,
    lng: 10.155108700381763,
    description: "Am Eingang zum Brenzpark erwarten dich 3 Aufgaben.",
    tasks: [
      { id: "t1", label: "StuV Bier Pong, weißes Badehaus", codePlain: "1111" },
      { id: "t2", label: "StuV Yoga, Cafe Lieblingsplatz", codePlain: "1111" },
      { id: "t3", label: "StuV Sport im Park, Rutschenturm", codePlain: "1111" }
    ]
  },
  {
    id: "s4",
    name: "DHBW Digitalcampus, Hanns Voith Campus 1",
    lat: 48.68396562127026,
    lng: 10.155880680689945,
    description: "Löse alle 5 Aufgaben am Digitalcampus.",
    tasks: [
      { id: "t2", label: "IG Metall, EG Aula", codePlain: "1111" },
      { id: "t3", label: "StuV Wünsch dir was, EG Aula", codePlain: "1111" },
      { id: "t4", label: "Stuv Speeddating, Dachterasse", codePlain: "1111" },
      { id: "t5", label: "Stadt Heidenheim, EG Aula", codePlain: "1111" },
      { id: "t6", label: "Kulturbündnis", codePlain: "1111" }
    ]
  }
]

const MAP_CENTER: [number, number] = [48.6835, 10.1550]
const STORAGE_KEY = "rallye_popup_v1"

// ===================== UTIL, SHA 256 =====================
async function sha256hex(text: string): Promise<string> {
  const data = new TextEncoder().encode(text)
  const digest = await crypto.subtle.digest("SHA-256", data)
  return Array.from(new Uint8Array(digest)).map(b => b.toString(16).padStart(2, "0")).join("")
}

async function ensureHashes(): Promise<void> {
  for (const st of STATIONS) {
    for (const task of st.tasks) {
      if (!task.codeHash && task.codePlain != null) {
        task.codeHash = await sha256hex(String(task.codePlain))
      }
    }
  }
}

// ===================== STORAGE =====================
function readProgress(): Record<string, Record<string, boolean>> {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}")
  } catch {
    return {}
  }
}

function writeProgress(p: Record<string, Record<string, boolean>>): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(p))
}

function isDone(stationId: string, taskId: string): boolean {
  const p = readProgress()
  return !!(p[stationId] && p[stationId][taskId])
}

function setDone(stationId: string, taskId: string): void {
  const p = readProgress()
  if (!p[stationId]) p[stationId] = {}
  p[stationId][taskId] = true
  writeProgress(p)
}

function stationFinished(station: Station): boolean {
  const p = readProgress()
  const s = p[station.id] || {}
  return station.tasks.every(t => s[t.id])
}

// ===================== OpenStreetMap, Leaflet, lazy init =====================
let map: L.Map | null = null
const markers = new Map<string, any>()

function markerStyle(done: boolean) {
  return {
    radius: 10,
    color: done ? "#15803d" : "#2563eb",
    weight: 2,
    fillColor: done ? "#86efac" : "#93c5fd",
    fillOpacity: 0.9
  }
}

function updateProgressBadge(): void {
  let total = 0
  let done = 0
  const p = readProgress()
  for (const st of STATIONS) {
    total += st.tasks.length
    for (const t of st.tasks) {
      // @ts-ignore
      if (p[st.id] && p[st.id][t.id]) done++
    }
  }
  const badge = document.getElementById("progressBadge")
  if (badge) badge.textContent = `${done}/${total} Aufgaben erledigt`
}

function rebuildPopup(station: Station, circle: any): HTMLElement {
  const wrap = document.createElement("div")
  wrap.className = "popup-wrap"

  const head = document.createElement("div")
  head.className = "popup-title"
  const title = document.createElement("strong")
  title.textContent = station.name + (stationFinished(station) ? " ✅" : "")
  const idspan = document.createElement("span")
  idspan.className = "hint"
  idspan.textContent = `ID: ${station.id}`
  head.appendChild(title)
  head.appendChild(idspan)

  const desc = document.createElement("div")
  desc.className = "popup-desc"
  desc.textContent = station.description || ""

  wrap.appendChild(head)
  wrap.appendChild(desc)

  station.tasks.forEach((task, idx) => {
    const taskBox = document.createElement("div")
    taskBox.className = "task"

    const label = document.createElement("div")
    label.textContent = `${task.label || "Aufgabe " + (idx + 1)}`
    taskBox.appendChild(label)

    const msg = document.createElement("div")
    taskBox.appendChild(msg)

    const row = document.createElement("div")
    row.className = "row"

    const input = document.createElement("input")
    input.type = "text"
    input.placeholder = "Zahlencode"
    input.inputMode = "numeric"
    input.pattern = "\\d*"

    const btn = document.createElement("button")
    btn.textContent = "Prüfen"

    const verify = async () => {
      const v = (input.value || "").trim()
      if (!/^\d+$/.test(v)) {
        msg.textContent = "Bitte nur Ziffern eingeben."
        msg.className = "err"
        return
      }
      const hex = await sha256hex(v)
      if (hex === task.codeHash) {
        setDone(station.id, task.id)
        msg.textContent = "Richtig! ✅"
        msg.className = "ok"
        input.disabled = true
        btn.disabled = true
        if (stationFinished(station)) {
          title.textContent = station.name + " ✅"
          circle.setStyle(markerStyle(true))
          const doneLine = document.createElement("div")
          doneLine.className = "done-line"
          doneLine.textContent = "Alle Aufgaben erledigt! ✓"
          wrap.appendChild(doneLine)
          updateProgressBadge()
        } else {
          updateProgressBadge()
        }
      } else {
        msg.textContent = "Leider falsch, nochmal versuchen."
        msg.className = "err"
      }
    }

    btn.addEventListener("click", verify)
    input.addEventListener("keydown", e => { if ((e as KeyboardEvent).key === "Enter") verify() })

    if (isDone(station.id, task.id)) {
      msg.textContent = "Bereits erledigt ✅"
      msg.className = "ok"
      input.disabled = true
      btn.disabled = true
    }

    row.appendChild(input)
    row.appendChild(btn)
    taskBox.appendChild(row)
    wrap.appendChild(taskBox)
  })

  if (stationFinished(station)) {
    const doneLine = document.createElement("div")
    doneLine.className = "done-line"
    doneLine.textContent = "Alle Aufgaben erledigt! ✓"
    wrap.appendChild(doneLine)
  } else {
    const hint = document.createElement("div")
    hint.className = "hint"
    hint.textContent = "Hinweis, Fortschritt ist an dieses Gerät und diesen Browser gebunden."
    wrap.appendChild(hint)
  }

  return wrap
}

async function initMap(): Promise<void> {
  if (map) return

  await ensureHashes()

  map = L.map("map").setView(MAP_CENTER, 17)
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: "&copy; OpenStreetMap-Mitwirkende"
  }).addTo(map)

  for (const st of STATIONS) {
    const circle = L.circleMarker([st.lat, st.lng], markerStyle(stationFinished(st))).addTo(map)
    circle.bindTooltip(st.name, { direction: "top" })
    circle.on("click", () => {
      const content = rebuildPopup(st, circle)
      circle.bindPopup(content).openPopup()
    })
    markers.set(st.id, circle)
  }

  updateProgressBadge()
}

// ============================================================

const resetBtn = document.getElementById("resetBtn")
const qrBtn = document.getElementById("qrScannerBtn")
const mapBtn = document.getElementById("mapBtn")
const listBtn = document.getElementById("listBtn")

const mapView = document.getElementById("map") as HTMLElement
const listView = document.getElementById("list") as HTMLElement
const readerView = document.getElementById("reader") as HTMLElement

if (!resetBtn || !qrBtn || !mapBtn || !listBtn || !mapView || !listView || !readerView) {
  throw new Error("Buttons and views not found")
}

// ============== QR scanner lifecycle and view switching ==============
let qrReader: Html5QrcodeScanner | null = null

function startQrScanner() {
  if (qrReader) return
  qrReader = new Html5QrcodeScanner("reader", { fps: 10, qrbox: { width: 250, height: 250 } })
  qrReader.render(
    (decodedText: string, result: Html5QrcodeResult) => {
      console.log(`Success: ${decodedText}`, result)
      qrReader?.clear()
      qrReader = null
    },
    (errorMessage: string, error: Html5QrcodeError) => {
      console.log(`Error: ${errorMessage}`, error)
    }
  )
}

async function stopQrScanner() {
  if (!qrReader) return
  try {
    await qrReader.clear()
  } catch (e) {
    console.warn("Failed to clear QR reader, ", e)
  } finally {
    qrReader = null
  }
}

async function showView(view: "map" | "list" | "reader" | "none") {
  mapView.style.display = "none"
  listView.style.display = "none"
  readerView.style.display = "none"

  if (view !== "reader") await stopQrScanner()

  if (view === "map") {
    mapView.style.display = "block"
    await initMap()
    requestAnimationFrame(() => map?.invalidateSize())
  } else if (view === "list") {
    listView.style.display = "block"
  } else if (view === "none") {

  } else {
    readerView.style.display = "block"
    startQrScanner()
  }
}

// Reset Button Handler
resetBtn.addEventListener("click", async () => {
  console.log("Clack")
  if (!confirm("Fortschritt auf diesem Gerät wirklich löschen")) return
  localStorage.removeItem(STORAGE_KEY)

  if (map) {
    for (const st of STATIONS) {
      const m = markers.get(st.id)
      if (m) m.setStyle(markerStyle(false))
    }
    map.closePopup()
  }

  await stopQrScanner()
  updateProgressBadge()
  alert("Fortschritt gelöscht.")
})

// Nav buttons
qrBtn.addEventListener("click", () => {
  console.log("Click QR")
  showView("reader")
})

mapBtn.addEventListener("click", () => {
  if (mapView.style.display === "none") {
    showView("map")
  } else {
    showView("none")
  }
})

listBtn.addEventListener("click", () => {
  if (listView.style.display === "none") {
    showView("list")
  } else {
    showView("none")
  }
})

// boot state, start on list
listView.style.display = "block"
mapView.style.display = "none"
readerView.style.display = "none"
updateProgressBadge()
