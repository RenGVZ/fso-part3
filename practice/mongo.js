const mongoose = require('mongoose')

if (process.argv.length < 3) {
  console.log('give password as argument')
  process.exit(1)
}

const password = process.argv[2]
const nameEntry = process.argv[3]
const numberEntry = process.argv[4]

const url = `mongodb+srv://gavin_g3131:${password}@cluster0.ka6wa.gcp.mongodb.net/phonebookApp?retryWrites=true&w=majority`
mongoose.set('strictQuery', false)
mongoose.connect(url)

const personSchema = new mongoose.Schema({
  name: String,
  number: String,
})

const Person = mongoose.model('Person', personSchema)

if (!nameEntry || !numberEntry) {
  Person.find({}).then((result) => {
    console.log('phonebook:')
    result.forEach((person) => {
      console.log(`${person.name} ${person.number}`)
    })
    mongoose.connection.close()
  })
}

if(nameEntry && numberEntry) {
  const person = new Person({
    name: nameEntry,
    number: numberEntry,
  })
  person.save().then(() => {
    console.log(`added ${person.name} number ${person.number} to phonebook`)
    mongoose.connection.close()
  })
}
