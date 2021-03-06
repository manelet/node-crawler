const puppeteer = require('puppeteer')
//const HTMLParser = require('../parser/htmlparser')

class PuppeteerCrawler {
    browser
    page
    availableUAs = [
        'Mozilla/5.0 CK={} (Windows NT 6.1; WOW64; Trident/7.0; rv:11.0) like Gecko',
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.129 Safari/537.36',
        'Mozilla/5.0 (iPhone; CPU iPhone OS 12_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/12.1 Mobile/15E148 Safari/604.1',
        'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/44.0.2403.157 Safari/537.36'
    ]

    constructor() {
        this.browser = null
        this.page = null
    }

    async openBrowser(){
        try{
            this.ua = this.availableUAs[Math.floor(Math.random() * this.availableUAs.length)]

            this.browser = await puppeteer.launch({
                headless: false
            })

        } catch (err) {
            console.error(err)
        }
    }

    async closeBrowser(){
        try{
            await this.browser.close()    
        } catch (err) {
            console.error(err)
        }
    }

    async openTab(url = ""){
        try{
            const page = await this.browser.newPage()
            
            await page.setUserAgent(this.ua)

            if(url !== "")
                await page.goto(url, {waitUntil: 'networkidle0'})
            
            //page.waitForNavigation()

            return page
        } catch (err) {
            console.error(err)
        }
    }

    async closeTab(page){
        try{
            await page.close()
        } catch (err) {
            console.error(err)
        } 
    }

    async goTo(page, url){
        try{
            await page.goto(url, {waitUntil: 'networkidle0'})
            //page.waitForNavigation()
        } catch (err) {
            console.error(err)
        }
    }

    async waitForNavigation(page){
        try{
            await page.waitForNavigation()
        } catch (err) {
            console.error(err)
        }
    }

    async getElements(page, selector){
        try{
            await page.waitForSelector(selector)
            let results = await page.evaluate((selector) => {
                const elements = document.querySelectorAll(selector);
                let ret = []
                for(let element of elements){
                    let e = {}
                    for (let att, i = 0, atts = element.attributes, n = atts.length; i < n; i++){
                        att = atts[i]
                        let attName= att.nodeName
                        let value = att.nodeValue
                        if(attName.indexOf("data-") !== -1){
                            attName = attName.replace('data-', '')
                            if(e.data === undefined)
                                e.data = {}
                            
                            e.data[attName] = value
                        } else {
                            e[attName] = value
                        }                       
                    }

                    if(element.textContent)
                        e.textContent = element.textContent

                    if(element.innerHTML)
                        e.innerHTML = element.innerHTML

                    if(element.outerHTML)
                        e.outerHTML = element.outerHTML
                    
                    ret.push(e)
                }
                return ret
            }, selector)
            return results
        } catch (err) {
            console.error(err)
        }
    }

    /*async getElements(page, selector){
        try{
            const html = await page.evaluate(() => document.querySelector('*').outerHTML)
            const dom = new HTMLParser(html)
            const results = await dom.getElements(selector)
            return results
        } catch (err) {
            console.error(err)
        }
    }*/

    async checkElementExists(page, selector){
        try{
            const element = await page.$(selector)
            return element ? true : false
        } catch (err) {
            console.error(err)
        }
    }
    
    async clickElement(page, selector){
        try{
            const element = await page.$(selector)
            if(element)
                await element.click()
        } catch (err) {
            console.error(err)
        }
    }
    
    async writeText(page, selector, value){
        try{
            await page.waitForSelector(selector);
            await page.$eval(selector, el => el.value = value)
        } catch (err) {
            console.error(err)
        }
    }
    
    async pressKey(page, keycode){
        try{
            await page.type(String.fromCharCode(keycode))
        } catch (err) {
            console.error(err)
        }
    }
    
    async extractText(page, selector){
        try{
            await page.waitForSelector(selector);
            const elements = await page.$$(selector)
            const results = []
            for( let element of elements ) {
                const val = await page.evaluate((el) => el.textContent, element);
                results.push(val)
            }
            if(results.length === 1)
                return results[0]
            else
                return results
        } catch (err) {
            console.error(err)
        }
    }

    async extractAttribute(page, selector, attribute){
        try{
            await page.waitForSelector(selector);
            const elements = await page.$$(selector)
            const results = []
            for( let element of elements ) {
                const attr = await page.evaluate((el, att) => el.getAttribute(att), element, attribute);
                results.push(attr)
            }
            return results
        } catch (err) {
            console.error(err)
        }
    }

}


module.exports = PuppeteerCrawler