const mongo = require('mongodb').MongoClient
const DB_NAME = 'crawler'

const defaultOptions = { useUnifiedTopology: true }

const connect = (options = {}) =>
  new Promise((resolve, reject) => {
    mongo.connect(
      'mongodb://localhost:27017', //TODO: move to .env
      { ...defaultOptions, ...options },
      (err, client) => {
        if (err) {
          return reject(err)
        }

        const db = client.db(DB_NAME)

        console.log('✅ MongoDB');
        return resolve(db)
      })    
  })

module.exports = { connect }