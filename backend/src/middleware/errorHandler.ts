import { Prisma } from "@prisma/client"
import type {ErrorRequestHandler} from "express"

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  // Unique constraint
  if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
    return res.status(409).json({ error: "Conflict, resource already exists" })
  }
  // Not found from service layer
  if ((err as any)?.name === "NotFoundError") {
    return res.status(404).json({ error: err.message })
  }
  console.error(err)
  res.status(500).json({ error: "Internal server error" })
}
