import { prisma } from "../db/prisma.js"

export async function listTasksForStation(stationId: string) {
  return prisma.task.findMany({
    where: { stationId },
    orderBy: { label: "asc" }
  })
}
