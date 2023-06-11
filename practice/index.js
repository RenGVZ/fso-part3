const express = require("express")
const app = express()
const morgan = require("morgan")

const requestLogger = (req, res, next) => {
  console.log("Method: ", req.method)
  console.log("Path: ", req.path)
  console.log("Body: ", req.body)
  console.log("---")
  next()
}

const unknownEndpoint = (req, res) => {
  res.status(400).send({ error: "unknown endpoint" })
}

app.use(express.json())
app.use(requestLogger)

morgan.token('body', (req, res) => JSON.stringify(req.body))
app.use(morgan(':method :url :status :response-time ms :body'))

let data = [
  {
    id: 1,
    name: "Arto Hellas",
    number: "040-123456",
  },
  {
    id: 2,
    name: "Ada Lovelace",
    number: "39-44-5323523",
  },
  {
    id: 3,
    name: "Dan Abramov",
    number: "12-43-234345",
  },
  {
    id: 4,
    name: "Mary Poppendieck",
    number: "39-23-6423122",
  },
]

const generateId = () => {
  const maxId = data.length > 0 ? Math.max(...data.map((d) => d.id)) : 0
  return maxId + 1
}

app.get("/api/persons", (req, res) => {
  res.json(data)
})

app.get("/api/persons/:id", (req, res) => {
  const id = req.params.id
  const foundEntry = data.find((item) => item.id === Number(id))
  if (!foundEntry) return res.status(404).end("no matches")
  res.json(foundEntry)
})

app.get("/info", (req, res) => {
  const date = new Date()
  const entries = data.length
  const infoToSend = `<br>Phonebook has info for ${entries} people <br></br> ${date.toString()}</p>`
  res.send(infoToSend)
})

app.post("/api/persons", (req, res) => {
  const name = req.body.name
  const number = req.body.number
  const isNameExists = data.find((d) => d.name === name)
  if (!name || !number || isNameExists) return res.status(400).send("name or number missing, and name must be unique")
  const id = generateId()
  const newEntry = {
    id,
    name,
    number,
  }
  data = data.concat(newEntry)
  res.status(200).json(data)
})

app.delete("/api/persons/:id", (req, res) => {
  const id = Number(req.params.id)
  const foundId = data.find((d) => Number(d.id) == id)
  if (!foundId) return res.status(400).send("id not found")
  data = data.filter((d) => Number(d.id) !== id)
  res.status(204).end()
})

app.use(unknownEndpoint)

app.listen(3002, () => console.log("Server running on port 3001"))