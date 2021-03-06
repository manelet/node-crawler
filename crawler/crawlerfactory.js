const PuppeteerCrawler = require('./puppeteercrawler')
const puppeteerCrawler = require('./puppeteercrawler')

class CrawlerFactory {

    static async createCrawler(type){
        try{
            let crawler = null
            switch(type){
                case "puppeteer":
                    crawler = await new PuppeteerCrawler
                default:
                    throw new Error("Unsupported type requested @ crawler factory: " + type)
            }
            return crawler
        } catch(err){
            throw err
        }
    }

}

module.exports = { CrawlerFactory }