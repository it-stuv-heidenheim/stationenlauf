import { Router } from "express";
import stationsRouter from "./public/stations.js";
import tasksRouter from "./public/tasks.js";


const router: Router = Router();

const v1 = router.use('/v1', router);

// Mount feature routers
v1
  .use('/stations', stationsRouter)
  .use('/tasks', tasksRouter);

export default router;
