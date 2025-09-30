import { Router } from "express"
import { asyncHandler } from "../../middleware/asyncHandler.js"
import {
  completeTask,
  getCompletedTasksByUser,
  verifyCode
} from "../../services/completion.service.js"

const tasksRouter: Router = Router()

tasksRouter.post(
  "/:taskId/complete",
  asyncHandler(async (req, res) => {
    const { user, code } = req.body
    if (!user || !code) {
      res.status(400).json({ error: "Missing user or code" })
      return
    }

    const valid = await verifyCode(code, req.params.taskId)
    if (!valid) {
      res.status(400).json({ error: "Invalid code" })
      return
    }

    try {
      const result = await completeTask(req.params.taskId, user)
      res.status(201).json(result)
    } catch (e) {
      if (e instanceof Error && e.message === "Task already completed for this user") {
        res.status(409).json({ error: e.message })
        return
      }
      throw e
    }
  })
)

tasksRouter.get(
  "/completed/:user",
  asyncHandler(async (req, res) => {
    const items = await getCompletedTasksByUser(req.params.user)
    res.json(items)
  })
)

export default tasksRouter
