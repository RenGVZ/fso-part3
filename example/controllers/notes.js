const notesRouter = require('express').Router()
const Note = require('../models/note')

notesRouter.get('/', (req, res) => {
  Note.find({}).then((notes) => {
    res.json(notes)
  })
})

notesRouter.get('/:id', (req, res, next) => {
  Note.findById(req.params.id)
    .then((note) => {
      if (note) {
        res.json(note)
      } else {
        res.status(404).send({ error: 'no id matches that' })
      }
    })
    .catch((error) => next(error))
})

notesRouter.post('/', (req, res, next) => {
  const body = req.body

  if (body.content === undefined)
    return res.status(400).json({ error: 'content missing' })

  const newNote = new Note({
    content: body.content,
    important: body.important || false,
  })

  newNote
    .save()
    .then((savedNote) => {
      res.json(savedNote)
    })
    .catch((error) => next(error))
})

notesRouter.delete('/:id', (req, res, next) => {
  const id = req.params.id
  Note.findByIdAndRemove(id)
    .then((result) => {
      if (result) {
        res.status(204).end()
      } else {
        res.status(404).send({ error: 'no id matches that' })
      }
    })
    .catch((error) => next(error))
})

notesRouter.put('/:id', (req, res, next) => {
  const { content, important } = req.body
  const id = req.params.id

  Note.findByIdAndUpdate(
    id,
    { content, important },
    { new: true, runValidators: true, context: 'query' }
  )
    .then((update) => {
      if (update) {
        res.json(update)
      } else {
        res.status(404).send({ error: 'no id matches that' })
      }
    })
    .catch((error) => next(error))
})

module.exports = notesRouter