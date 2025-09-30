import { prisma } from "../db/prisma.js"

export async function verifyCode(code: string, task: string) {
  const data = await prisma.task.findUnique({
    select: { code: true },
    where: { id: task },
  })

  return data?.code === code
}

export async function completeTask(taskId: string, user: string) {
  // unique constraint on [taskId, user] makes this idempotent
  return prisma.completedTask.create({
    data: { taskId, user }
  })
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
