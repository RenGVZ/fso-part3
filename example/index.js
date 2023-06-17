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

app.use(cors())
app.use(express.static("build"))
app.use(express.json())
app.use(requestLogger)

app.get("/api/notes", (req, res) => {
  Note.find({}).then((note) => {
    res.json(note)
  })
})

app.get("/api/notes/:id", (req, res, next) => {
  Note.findById(req.params.id)
    .then((note) => {
      if (note) {
        res.json(note)
      } else {
        res.status(404).send({ error: "no id matches that" })
      }
    })
    .catch((error) => {
      next(error)
    })
})

app.delete("/api/notes/:id", (req, res, next) => {
  const id = req.params.id
  Note.findByIdAndRemove(id)
    .then((result) => {
      if (result) {
        res.status(204).end()
      } else {
        res.status(404).send({ error: "no id matches that" })
      }
    })
    .catch((error) => next(error))
})

app.put("/api/notes/:id", (req, res, next) => {
  const id = req.params.id
  const body = req.body
  const updatedNote = {
    content: body.content,
    important: body.important,
  }

  Note.findByIdAndUpdate(id, updatedNote, { new: true })
    .then((update) => {
      if (update) {
        res.json(update)
      } else {
        res.status(404).send({ error: "no id matches that" })
      }
    })
    .catch((error) => next(error))
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

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: "unknown endpoint" })
}

app.use(unknownEndpoint)

const errorHandler = (error, req, res, next) => {
  console.log(error.message)

  if (error.name === "CastError") {
    return res.status(400).send({ error: "malformatted id" })
  }

  next(error)
}

app.use(errorHandler)

const PORT = process.env.PORT

app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
