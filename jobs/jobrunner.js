const path = require('path')
const fs = require('fs');
const PuppeteerCrawler = require('../crawler/puppeteercrawler')

class JobRunner {
    outputDir
    fileExtension

    articlesData

    baseUrl 
    queryUrl
    zones

    puppeteerCrawler    
    
    oldIds
    
    finished

    constructor(){
        this.outputDir = "../out/JobRunner"
        this.puppeteerCrawler = new PuppeteerCrawler
    }

    async run(jobs){
        try{
            for(let job of jobs){
                await this.puppeteerCrawler.openBrowser()
                let page, elements
                let scrappedResults = []
                for(let action of job.actions){
                    switch(action.method){
                        case "open_tab":
                            page = await this.puppeteerCrawler.openTab(action.target)
                            break
                        case "go_to":
                            await this.puppeteerCrawler.goTo(page, action.target)
                            break
                        case "get_elements":
                            elements = await this.puppeteerCrawler.getElements(page, action.selector)
                            break
                        /*case "extract_text":
                            extractedResult = await this.puppeteerCrawler.extractText(page, action.selector)
                            break*/
                        case "click_element":
                            await this.puppeteerCrawler.extractText(page, action.selector)
                            break
                    }
                }
            }
        } catch (err) {
            console.log(err)
        }
    }
}

module.exports = JobRunner