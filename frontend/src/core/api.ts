// src/core/api.ts
import type { Station } from "./types"

type ApiTask = {
  id: string
  stationId: string
  label: string
}

type ApiStation = {
  id: string
  name: string
  lat: number
  lng: number
  description?: string
  tasks: ApiTask[]
}

export async function fetchStations(): Promise<Station[]> {
  const res = await fetch(`${import.meta.env.VITE_API_URL ?? 'https://stationenlauf.stuv-heidenheim.de'}/api/v1/stations`, { headers: { "accept": "application/json" } })
  if (!res.ok) throw new Error(`Failed to load stations, ${res.status}`)
  const {data}: { data: ApiStation[] } = await res.json()

  console.log('stationen: ', data)
  return data
}

export async function getProgress(uid: string) {
  const res = await fetch(`${import.meta.env.VITE_API_URL ?? 'https://stationenlauf.stuv-heidenheim.de'}/api/v1/tasks/completed/${uid}`, {
  })
  const data: {[key: string]: true} = await res.json()
  return data
}

export async function markTaskAsCompleted(user: string, taskId: string, code: string): Promise<boolean> {
  console.log('Completing: ', JSON.stringify({ user, code }))

  const res = await fetch(
    `${import.meta.env.VITE_API_URL ?? 'https://stationenlauf.stuv-heidenheim.de'}/api/v1/tasks/${taskId}/complete`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ user, code }),
    }
  )

  if (res.status === 409) {
    alert("Station wurde schon gescannt.")
    return true
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    console.error("Error completing task", body)
    return false
  }

  return true
}
