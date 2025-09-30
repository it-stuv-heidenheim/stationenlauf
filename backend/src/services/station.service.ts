import { prisma } from "../db/prisma.js"

export async function listStations() {
  const items = await prisma.station.findMany({
      orderBy: { name: "asc" },
      include: { tasks: true }
    })
  return { data: items }
}

export async function getStationById(id: string) {
  const station = await prisma.station.findUnique({
    where: { id },
    include: { tasks: true }
  })
  if (!station) {
    const e = new Error("Station not found")
    e.name = "NotFoundError"
    throw e
  }
  return station
}
