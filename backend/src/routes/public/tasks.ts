import { Router } from "express"
import { asyncHandler } from "../../middleware/asyncHandler.js"
import {completeTask, listCompletionsForUser, verifyCode} from "../../services/completion.service.js"

const tasksRouter: Router = Router()

tasksRouter.post(
  "/:taskId/complete",
  asyncHandler(async (req, res) => {
    const {user, code} = req.body
    if (!user || !code) {
      res.status(400).json({ error: "Missing user or code" })
      return
    }
    const valid = await verifyCode(code, req.params.taskId)
    if (!valid) {
      res.status(400).json({ error: "Invalid code" })
      return
    }
    const result = await completeTask(req.params.taskId, user)
    res.status(201).json(result)
  })
)

tasksRouter.get(
  "/completed/:user",
  asyncHandler(async (req, res) => {
    const items = await listCompletionsForUser(req.params.user)
    res.json(items)
  })
)

export default tasksRouter
