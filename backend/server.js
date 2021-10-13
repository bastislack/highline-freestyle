import express from "express"
import cors from "cors"
import tricks from "./api/tricks.route.js"
import combos from "./api/combos.route.js"

const app = express()

app.use(cors())
app.use(express.json())

app.use("/api/v1/", tricks)
app.use("/api/v1/", combos)
app.use("*", (req, res) => res.status(404).json({ error: "not found"}))

export default app
