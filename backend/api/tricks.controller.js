import TricksDAO from "../dao/tricksDAO.js"

export default class TricksController {
  static async apiGetTricks(req, res, next) {
    try {
      const { trickList, totalNumTricks } = await TricksDAO.getTricks()

      let response = {
        tricks: trickList,
        totalResults: totalNumTricks
      }
      res.json(response)
    } catch(e) {
      res.status(500).json({ error: e.message })
    }
  }

  static async apiGetTrickById(req, res, next) {
    try {
      const trickId = req.params.id

      const trick = await TricksDAO.getTrickById(trickId)

      let response = { trick: trick }
      res.json(response)
    } catch(e) {
      res.status(500).json({ error: e.message })
    }
  }

  static async apiAddTrick(req, res, next) {
    try {
      const trick = req.body.trick

      const response = await TricksDAO.addTrick(trick)

      res.json({ response: response, status: "Trick was successfully added" })
    } catch(e) {
      res.status(500).json({ error: e.message })
    }
  }

  static async apiUpdateTrick(req, res, next) {
    try {
      const trickId = req.params.id
      const trickUpdate = req.body.trickUpdate

      const response = await TricksDAO.updateTrick(trickId, trickUpdate)

      res.json({ response: response, status: "Trick was successfully updated" })
    } catch(e) {
      res.status(500).json({ error: e.message })
    }
  }

  static async apiDeleteTrick(req, res, next) {
    try {
      const trickId = req.params.id

      const response = await TricksDAO.deleteTrick(trickId)

      res.json({ response: response, status: "Trick was successfully deleted" })
    } catch(e) {
      res.status(500).json({ error: e.message })
    }
  }
}
