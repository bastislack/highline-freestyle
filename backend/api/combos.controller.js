import CombosDAO from "../dao/combosDAO.js"

export default class CombosController {
  static async apiGetCombos(req, res, next) {
    try {
      const { comboList, totalNumCombos } = await CombosDAO.getCombos()

      let response = {
        combos: comboList,
        totalResults: totalNumCombos
      }
      res.json(response);
    } catch(e) {
      res.status(500).json({ error: e.message });
    }
  }

  static async apiGetComboById(req, res, next) {
    try {
      const comboId = req.params.id

      const combo = await CombosDAO.getComboById(comboId)

      let response = { combo: combo }
      res.json(response)
    } catch(e) {
      res.status(500).json({ error: e.message })
    }
  }

  static async apiAddCombo(req, res, next) {
    try {
      const combo = req.body.combo

      const response = await CombosDAO.addCombo(combo)

      res.json({ response: response, status: "Combo was successfully added" })
    } catch(e) {
      res.status(500).json({ error: e.message })
    }
  }

  static async apiUpdateCombo(req, res, next) {
    try {
      const comboId = req.params.id
      const comboUpdate = req.body.comboUpdate

      const response = await CombosDAO.updateCombo(comboId, comboUpdate)

      res.json({ response: response, status: "Combo was successfully updatd" })
    } catch(e) {
      res.status(500).json({ error: e.message })
    }
  }

  static async apiDeleteCombo(req, res, next) {
    try {
      const comboId = req.params.id

      const response = await CombosDAO.deleteCombo(comboId)

      res.json({ response: response, status: "Combo was successfully deleted" })
    } catch(e) {
      res.status(500).json({ error: e.message })
    }
  }
}
