const path = require('path')
const fs = require('fs');
const PuppeteerCrawler = require('../crawler/puppeteercrawler')

class Coolmod {

    constructor(){
        this.baseUrl = 'https://www.coolmod.com'
        this.articleSelector = 'div.products div.div-products div.item-product'
        this.noStockIndicatorString = 'Sin Stock'
        this.reconditionedIndicatorString = 'Reacondicionado'
        this.crawler = new PuppeteerCrawler
        
        this.filters = [
            {
                name: "RTX 3080",
                query: "tarjetas-gráficas?f=571::RTX%203080",
                maxPrice: new Number(900)
            }
        ]

    }

    async run(){
        try{
            await this.crawler.openBrowser()
            for(let filter of this.filters){
                let url = [this.baseUrl, filter.query].join("/")
                let page = await this.crawler.openTab(url)
                let results = await this.crawler.getElements(page, this.articleSelector)
                for(let result of results){
                    //console.log(result)
                    if(this.articleHasStock(result)){
                        console.log(result)
                    } else {
                        //console.log(result.data.name + " sin stock")
                    }
                }
                await this.crawler.closeTab(page)
            }
        } catch(err) {
            console.log(err)
        } finally {
            await this.crawler.closeBrowser()
        }
    }

    articleHasStock(article){
        return (article.textContent.indexOf(this.noStockIndicatorString) === -1)
    }

    articleIsReconditioned(article){
        return (article.data.name.indexOf(this.reconditionedIndicatorString) === -1)
    }

}

module.exports = Coolmod