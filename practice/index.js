require("dotenv").config()
const express = require("express")
const app = express()
const morgan = require("morgan")
const cors = require("cors")
const Person = require("./models/person")

const requestLogger = (req, res, next) => {
  console.log("Method: ", req.method)
  console.log("Path: ", req.path)
  console.log("Body: ", req.body)
  console.log("---")
  next()
}

app.use(cors())
app.use(express.static("build"))
app.use(express.json())
app.use(requestLogger)

morgan.token("body", (req, res) => JSON.stringify(req.body))
app.use(morgan(":method :url :status :response-time ms :body"))

app.get("/api/persons", (req, res) => {
  Person.find({}).then((result) => {
    res.json(result)
  })
})

app.get("/api/persons/:id", (req, res) => {
  const id = req.params.id
  console.log(id)
  Person.findById(id).then((result) => {
    res.json(result)
  })
})

app.get("/info", async (req, res) => {
  const date = new Date()
  const entries = await Person.find({}).then((result) => result.length)
  const infoToSend = `<br>Phonebook has info for ${entries} people <br></br> ${date.toString()}</p>`
  res.send(infoToSend)
})

app.post("/api/persons", async (req, res) => {
  const name = req.body.name
  const number = req.body.number
  const nameExists = await Person.find({ name: name }).then((result) => result)
  console.log(nameExists)

  if (!name || !number || nameExists.length > 0)
    return res
      .status(400)
      .json({ error: "name or number missing, and name must be unique" })
  const newEntry = new Person({
    name,
    number,
  })
  newEntry.save().then((result) => {
    res.json(result)
  })
})

app.delete("/api/persons/:id", (req, res, next) => {
  const id = req.params.id
  Person.findByIdAndRemove(id)
    .then((result) => {
      if (result) {
        console.log("deleted", result)
        res.status(204).end()
      } else {
        res.status(404).send({ error: "no id matches that" })
      }
    })
    .catch((error) => next(error))
})

app.put("/api/persons/:id", (req, res, next) => {
  const id = req.params.id
  const name = req.body.name
  const number = req.body.number

  if (number && number.length > 0) {
    const update = {
      name,
      number,
    }
    console.log(name, number)
    Person.findByIdAndUpdate(id, update, { new: true })
      .then((result) => {
        res.json(result)
      }).catch(error => next(error))
  } else {
    res.status(400).send({ error: "new number missing" })
  }
})

const unknownEndpoint = (req, res) => {
  res.status(400).send({ error: "unknown endpoint" })
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
