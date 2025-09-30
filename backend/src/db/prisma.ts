import { PrismaClient } from "@prisma/client"

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined
}

export const prisma =
  global.prisma ??
  new PrismaClient({
    log: ["error", "warn"]
  })

if (process.env.NODE_ENV !== "production") {
  global.prisma = prisma
}

// optional, tidy shutdown for local dev
process.on("SIGINT", async () => {
  await prisma.$disconnect()
  process.exit(0)
})
