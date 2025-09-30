import { prisma } from "../db/prisma.js"
import {Prisma} from "@prisma/client";

export async function verifyCode(code: string, task: string) {
  const data = await prisma.task.findUnique({
    select: { code: true },
    where: { id: task },
  })

  return data?.code === code
}

export async function completeTask(taskId: string, user: string) {
  try {
    return await prisma.completedTask.create({
      data: { taskId, user }
    })
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
      throw new Error('Task already completed for this user')
    }
    throw e
  }
}

export async function getCompletedTasksByUser(
  userId: string
): Promise<Record<string, true>> {
  const rows = await prisma.completedTask.findMany({
    where: { user: userId },
    select: { taskId: true },
  });

  return Object.fromEntries(rows.map((r) => [r.taskId, true] as const));
}
