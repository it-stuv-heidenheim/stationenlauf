export type Task = {
  id: string
  label: string
  stationId: string,
}

export type Station = {
  id: string
  name: string
  lat: number
  lng: number
  description?: string
  tasks: Task[]
}
