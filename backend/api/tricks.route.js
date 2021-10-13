import { Router } from "express"
import TricksCtrl from "./tricks.controller.js"

const router = new Router()

router.route("/tricks").get(TricksCtrl.apiGetTricks)
router.route("/tricks/create").post(TricksCtrl.apiAddTrick)
router
  .route("/tricks/id/:id")
  .get(TricksCtrl.apiGetTrickById)
  .put(TricksCtrl.apiUpdateTrick)
  .delete(TricksCtrl.apiDeleteTrick)

export default router
