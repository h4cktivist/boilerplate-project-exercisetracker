const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()

const mongoose = require('mongoose')
const URI = 'mongodb+srv://h4cktivist:<PASSWORD>@cluster0.1dxur.mongodb.net/myFirstDatabase?retryWrites=true&w=majority'

app.use(cors())
app.use(express.static('public'))
app.use(express.urlencoded({ extended: true }))

mongoose.connect(URI, { useNewUrlParser: true, useUnifiedTopology: true })


const exerciseSchema = new mongoose.Schema({
  description: { type: String, required: true },
  duration: { type: Number, required: true },
  date: String
})

const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  log: [exerciseSchema]
})

const User = mongoose.model('User', userSchema)
const Exercice = mongoose.model('Exercice', exerciseSchema)


app.post('/api/users', (req, res) => {
  const newUser = new User({ username: req.body.username })

  newUser.save((e, user) => {
    if (!e) {
      res.json({
        username: user.username,
        _id: user.id
      })
    }
  })
})


app.get('/api/users', (req, res) => {
  User.find({}, (e, users) => {
    if (!e) {
      res.json(users)
    }
  })
})


app.post('/api/users/:_id/exercises', (req, res) => {
  const newExercice = new Exercice({
    description: req.body.description,
    duration: req.body.duration,
    date: req.body.date
  })

  if (newExercice.date === '') {
    newExercice.date = new Date().toISOString().substring(0, 10)
  }

  User.findOneAndUpdate(
    { _id: req.params._id },
    { $push: { log: newExercice } },
    { new: true },
    (e, updUser) => {
      if (!e) {
        res.json({
          _id: updUser.id,
          username: updUser.username,
          description: newExercice.description,
          duration: newExercice.duration,
          date: new Date(newExercice.date).toDateString()
        })
      }
    }
  )
})


app.get('/api/users/:_id/logs', (req, res) => {
  User.findById(req.params._id, (error, result) => {
    if (!error) {

      log = result.log

      if (req.query.limit) {
        log = log.slice(0, +req.query.limit)
      }

      if (req.query.from) {
        let = fromDate = new Date(req.query.from)
        log = log.filter(exe => new Date(exe.date) > fromDate)
      }

      if (req.query.to) {
        let = toDate = new Date(req.query.to)
        log = log.filter(exe => new Date(exe.date) < toDate)
      }
    
      res.json({
        _id: result.id,
        username: result.username,
        log: log,
        count: log.length
      })
    }
  })
})


app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});


const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
