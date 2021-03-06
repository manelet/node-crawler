const path = require('path')
const fs = require('fs');
const PuppeteerCrawler = require('../crawler/puppeteercrawler')
const HTMLParser = require('../parser/htmlparser')

class PCComponentes {

    constructor(){
        this.baseUrl = 'https://www.pccomponentes.com'
        this.articleSelector = 'div#articleListContent article'
        this.noStockIndicatorString = 'Sin fecha de entrada'
        this.reconditionedIndicatorString = 'Reacondicionado'
        this.crawler = new PuppeteerCrawler
        
        this.filters = [
            {
                name: "RTX 3080",
                query: "tarjetas-graficas/geforce-rtx-3080-series",
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
                    if(this.articleHasStock(result) && !this.articleIsReconditioned(result)){
                        let articlePrice = new Number(result.data.price)
                        if( articlePrice < filter.maxPrice )
                            console.log(result.data.name + " at " + result.data.price + "!!!")
                        else
                            console.log(result.data.name + " at " + result.data.price)
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
        //return (article.getText().indexOf(this.noStockIndicatorString) === -1)
        return (article.textContent.indexOf(this.noStockIndicatorString) === -1)
    }

    articleIsReconditioned(article){
        //return (article.data('name').indexOf(this.reconditionedIndicatorString) !== -1)
        return (article.data.name.indexOf(this.reconditionedIndicatorString) !== -1)
    }

}

module.exports = PCComponentes