const express = require("express")
const app = express()
const cors = require("cors")

const requestLogger = (request, response, next) => {
  console.log("Method:", request.method)
  console.log("Path:  ", request.path)
  console.log("Body:  ", request.body)
  console.log("---")
  next()
}

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: "unknown endpoint" })
}

app.use(cors())
app.use(express.json())
app.use(requestLogger)
app.use(express.static("build"))

let notes = [
  {
    id: 1,
    content: "HTML is easy",
    important: true,
  },
  {
    id: 2,
    content: "Browser can execute only JavaScript",
    important: false,
  },
  {
    id: 3,
    content: "GET and POST are the most important methods of HTTP protocol",
    important: true,
  },
]

const generateId = () => {
  const maxId = notes.length > 0 ? Math.max(...notes.map((n) => n.id)) : 0
  return maxId + 1
}

app.get("/", (req, res) => {
  res.send("<h1>Hello World!</h1>")
})

app.get("/api/notes", (req, res) => {
  res.json(notes)
})

app.get("/api/notes/:id", (req, res) => {
  const id = Number(req.params.id)
  const foundNote = notes.find((notes) => notes.id === id)
  if (foundNote) {
    res.json(foundNote)
  } else {
    res.status(404).end()
  }
})

app.delete("/api/notes/:id", (req, res) => {
  const id = Number(req.params.id)
  notes = notes.filter((note) => note.id !== id)
  res.status(204).end()
})

app.post("/api/notes", (req, res) => {
  const id = generateId()
  const content = req.body.content
  if (!content) return res.status(400).json({ error: "content missing" })
  if (notes.find((note) => note.content === content))
    return res.status(400).json({ error: "content must be unique" })
  const newNote = {
    id,
    content,
    important: req.body.important || false,
  }
  notes = notes.concat(newNote)
  res.status(201).json(newNote)
})

app.use(unknownEndpoint)

const PORT = process.env.PORT || 3000

app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
