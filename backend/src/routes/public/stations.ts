import { Router } from "express"
import { asyncHandler } from "../../middleware/asyncHandler.js"
import { listStations } from "../../services/station.service.js"

const stationsRouter: Router = Router()

stationsRouter.get(
  "/",
  asyncHandler(async (req, res) => {
    const data = await listStations()
    res.json(data)
  })
)

export default stationsRouter
