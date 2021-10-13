import { Router } from "express"
import CombosCtrl from "./combos.controller.js"

const router = new Router()

router.route("/combos").get(CombosCtrl.apiGetCombos)
router.route("/combos/create").post(CombosCtrl.apiAddCombo)
router
  .route("/combos/id/:id")
  .get(CombosCtrl.apiGetComboById)
  .put(CombosCtrl.apiUpdateCombo)
  .delete(CombosCtrl.apiDeleteCombo)

export default router
