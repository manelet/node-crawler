//const server = require('./server')
const jobs = require('./jobs')
const mongo = require('./mongo')

;(async () => {
  //const db = await mongo.connect()

  jobs.run()
})();