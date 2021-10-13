import app from "./server.js"
import mongodb from "mongodb"
import dotenv from "dotenv"
import TricksDAO from "./dao/tricksDAO.js"
import CombosDAO from "./dao/combosDAO.js"

dotenv.config()
const MongoClient = mongodb.MongoClient

const port = process.env.PORT || 8000

MongoClient.connect(
  process.env.HIGHLINEFREESTYLE_DB_URI,
  { 
    maxPoolSize: 50,
    wtimeoutMS: 2500,
    useNewUrlParser: true
  }
)
.catch(err => {
  console.error(err.stack)
  process.exit(1)
})
.then(async client => {
  await TricksDAO.injectDB(client)
  await CombosDAO.injectDB(client)
  app.listen(port, () => {
    console.log(`Listening on port ${port}`)
  })
})
