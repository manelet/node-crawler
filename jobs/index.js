// const Idealista = require('./idealista')
const PCComponentes = require('./pccomponentes')
//const Coolmod = require('./coolmod')
//wipoid
//const JobRunner = require('./jobrunner')

//const run = async ({ db }) => new Promise()
const run = async () => new Promise(resolve => {
    const pccomponentes_crawler = new PCComponentes
    // idealista_crawler.run()
    pccomponentes_crawler.run()

    
    /*const pccomponentes_crawler = new PCComponentes
    pccomponentes_crawler.run()
    
    setInterval(function(){
        pccomponentes_crawler.run()
    }, 300000)*/

    //const coolmod_crawler = new Coolmod
    //coolmod_crawler.run()
})

module.exports = { run }