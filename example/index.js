require("dotenv").config()
const express = require("express")
const app = express()
const cors = require("cors")
const Note = require("./models/note")

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
// app.use(requestLogger)
app.use(express.static("build"))

app.get("/api/notes", (req, res) => {
  Note.find({}).then((note) => {
    res.json(note)
  })
})

app.get("/api/notes/:id", (req, res) => {
  Note.findById(req.params.id).then((note) => {
    res.json(note)
  })
})

app.delete("/api/notes/:id", (req, res) => {
  const id = Number(req.params.id)
  notes = notes.filter((note) => note.id !== id)
  res.status(204).end()
})

app.post("/api/notes", (req, res) => {
  const body = req.body

  if (body.content === undefined)
    return res.status(400).json({ error: "content missing" })

  const newNote = new Note({
    content: body.content,
    important: body.important || false,
  })

  newNote.save().then((savedNote) => {
    res.json(savedNote)
  })
})

app.use(unknownEndpoint)

const PORT = process.env.PORT

app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
