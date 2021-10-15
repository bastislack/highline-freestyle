import { ObjectId } from "mongodb"
import TricksDAO from "./tricksDAO.js"

let combos

export default class CombosDAO {
  static async injectDB(conn) {
    if (combos) {
      return
    }
    try {
      combos = await conn.db(process.env.HIGHLINEFREESTYLE_NS).collection("combos")
    } catch (e) {
      console.error(
        `Unable to establish a collection handle in combosDAO: ${e}`
      )
    }
  }

  static async getCombos() {

    const query = {}
    const project = { stickFrequency: 1, name: 1, numberOfTricks: 1}
    const sort = { numberOfTricks: 1}

    let cursor
    try {
      cursor = await combos
        .find(query)
        .project(project)
        .sort(sort)
    } catch (e) {
      console.error(`Unable to issue find command, ${e}`)
      return { comboList: [], totalNumCombos: 0 }
    }

    try {
      const comboList = await cursor.toArray()
      const totalNumCombos = await combos.countDocuments(query)
    
      return { comboList, totalNumCombos }
    } catch (e) {
      console.error(
        `Unable to convert cursor to array or problem counting documents`
      )
      return { comboList: [], totalNumCombos: 0 }
    }
  }

  static async getComboById(id) {
    
    // This aggregation pipeline finds the combo with the given id,
    // converts the ids in the tricks array to ObjectIds and then
    // gets the information about the tricks.
    const pipeline = [
      {
        '$match': {
          '_id': new ObjectId(id)
        }
      }, {
        '$addFields': {
          'tricks': {
            '$map': {
              'input': '$tricks', 
              'as': 'trick', 
              'in': {
                '$toObjectId': '$$trick'
              }
            }
          }
        }
      }, {
        '$lookup': {
          'from': 'tricks', 
          'localField': 'tricks', 
          'foreignField': '_id', 
          'as': 'tricks'
        }
      }
    ]

    let combo
    try {
      combo = await combos
        .aggregate(pipeline).next()
    } catch(e) {
      console.error(`Unable to issue aggregate command, ${e}`)
      return { combo: null }
    }

    return combo
  }

  static async addCombo(combo) {
    try {
      // Get length of combo, as well as starting and ending position of the combo
      const numberOfTricks = combo.tricks.length
      const firstTrick = await TricksDAO.getTrickById(combo.tricks[0])
      const lastTrick = await TricksDAO.getTrickById(combo.tricks[numberOfTricks-1])
      const startPos = firstTrick.startPos
      const endPos = lastTrick.endPos

      // Initialize minDiff and maxDiff for finding the easiest and hardest trick in a combo
      let minDiff = firstTrick.difficultyLevel
      let maxDiff = firstTrick.difficultyLevel

      // Sum of difficulty is used to compute avgDiff of the combo
      let summedDiff = 0

      // Find sum of difficulty of the combo, maxDifficulty, minDifficulty
      for (let i = 0; i < combo.tricks.length; i++){

        const currTrick = await TricksDAO.getTrickById(combo.tricks[i])
        const currDiff = currTrick.difficultyLevel

        summedDiff += currDiff

        if (currDiff < minDiff ) {
          minDiff = currDiff
        }

        if (currDiff > maxDiff) {
          maxDiff = currDiff
        }
      }

      // Compute avgDifficulty from the summed difficulty
      const avgDiff = summedDiff / numberOfTricks

      // Create combo object to save it in the database
      const comboDoc = {
        name: combo.name,
        tricks: combo.tricks,
        establishedBy: combo.establishedBy,
        yearEstablished: combo.yearEstablished,
        linkToVideo: combo.linkToVideo,
        comments: combo.comments,
        stickFrequency: combo.stickFrequency,
        numberOfTricks: numberOfTricks,
        startPos: startPos,
        endPos: endPos,
        avgDifficultyLevel: avgDiff,
        minDifficultyLevel: minDiff,
        maxDifficultyLevel: maxDiff
      }

      console.log(comboDoc)

      return await combos.insertOne(comboDoc)
    } catch(e) {
      console.error(`Unable to create combo, ${e}`)
      return { error: e }
    }
  }

  static async updateCombo( comboId, comboUpdate) {
    try {
      const updateResponse = await combos.updateOne(
        { _id: ObjectId(comboId) },
        { $set: comboUpdate}
      )

      return updateResponse
    } catch(e) {
      console.error(`Unable to update combo, ${e}`)
      return { error: e }
    }
  }

  static async deleteCombo( comboId ) {
    try {
      const deleteResponse = await combos.deleteOne(
        { _id: ObjectId(comboId) }
      )

      return deleteResponse
    } catch(e) {
      console.error(`Unable to delete combo, ${e}`)
      return { error: e }
    }
  }
}
