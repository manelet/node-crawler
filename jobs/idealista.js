const path = require('path')
const fs = require('fs');
const PuppeteerCrawler = require('../crawler/puppeteercrawler')

class Idealista {
    baseUrl 
    queryUrl
    zones

    outputDir
    fileExtension
    exportHeaders

    maxOldArticles = 20

    oldIds
    articlesData

    crawler    
    
    articleLinkSelector
    nextPageSelector

    articleNameSelector
    articleHoodSelector
    articlePriceSelector
    articleFeaturesSelector
    articleDescriptionSelector

    acceptCookiesButtonSelector

    captchaSelector

    finished
    detected

    constructor(){
        this.baseUrl = "https://www.idealista.com"
        this.queryUrl = "/areas/venta-viviendas/"

        this.outputDir = "../out/Idealista"
        this.fileExtension = '.csv'
        this.exportHeaders = ['"Ref"', '"Nom"', '"Barri"', '"Link"', '"Preu"', '"M2"', '"Nº hab"']

        this.oldIds = new Array()
        this.articlesData = new Array()

        this.articleLinkSelector = 'article.item > div > a.item-link'
        this.nextPageSelector = 'div.pagination > ul > li.next > a'

        this.articleNameSelector = 'span.main-info__title-main'
        this.articleHoodSelector = 'span.main-info__title-minor'
        this.articlePriceSelector = 'span.info-data-price > span.txt-bold'
        this.articleFeaturesSelector = 'div.info-features > span > span'
        this.articleDescriptionSelector = 'div.comment > div'
        this.acceptCookiesButtonSelector = '#didomi-notice-agree-button'
        this.captchaSelector = '.captcha__robot__warning'

        this.crawler = new PuppeteerCrawler
        
        this.zones = [
            {
                name: "Torredembarra - Sitges",
                shape: "/?shape=%28%28isdzFm%7BcGh_%40uoH%7BbAsjDojEeqPmo%40ktJk%7C%40qlN%7B%7CBi%7DLa%60CkgUliBucAn%7DDtmTfiAt%7DNj%7C%40j%60RlcCplNjgEp%7CHxoAnlNkqFlT%29%29&ordenado-por=fecha-publicacion-desc",
                filters: [
                    [
                        "con-precio-hasta_340000",
                        "chalets", "casas-de-pueblo",
                        "dos-banos", "tres-banos-o-mas",
                        "de-tres-dormitorios", "de-cuatro-cinco-habitaciones-o-mas",
                        "garaje", "piscina", "jardin", "terraza",
                        "para-reformar,buen-estado"
                    ]
                ]
            },
            {
                name: "Costa Brava",
                shape: "/?shape=%28%28aje~FeheQcdZco%5CijMePk%7BV~zKse%5B_fBgjZsxJ%7CaJox%60%40%60rW_mE%7CiG~yh%40%60uQouPzsk%40%3FxqV%7Cre%40__I~sH%29%29&ordenado-por=fecha-publicacion-desc",
                filters: [
                    [
                        "con-precio-hasta_340000",
                        "chalets", "casas-de-pueblo",
                        "dos-banos", "tres-banos-o-mas",
                        "de-tres-dormitorios", "de-cuatro-cinco-habitaciones-o-mas",
                        "garaje", "piscina", "jardin", "terraza",
                        "para-reformar,buen-estado"
                    ]
                ]
            },
            {
                name: "Pirineu",
                shape: "/?shape=%28%28mnidGsc%60Cm_J_mEvoO%7D_iAxdMidPgXinc%40thTsfQcnHumTr%60Jspd%40%7CiTia%40puGspd%40bfQ_%7BKwtK_wX%3Fsia%40vtK%7Dd_%40jq%5Bfxv%40wj%5Cn%60_E_sb%40%7CmoAyqOhkSo%60d%40~lE%29%29&ordenado-por=fecha-publicacion-desc",
                filters: [
                    [
                        "con-precio-hasta_340000",
                        "chalets", "casas-de-pueblo",
                        "dos-banos", "tres-banos-o-mas",
                        "de-tres-dormitorios", "de-cuatro-cinco-habitaciones-o-mas",
                        "garaje", "piscina", "jardin", "terraza",
                        "para-reformar,buen-estado"
                    ],
                    [
                        "con-precio-hasta_280000",
                        "pisos", "duplex", "aticos",
                        "dos-banos",
                        "de-tres-dormitorios",
                        "garaje", "terraza",
                        "para-reformar,buen-estado"
                    ]
                ]
            }
        ]

    }

    async readLogFiles(){
        try{
            const folderPath = path.join(__dirname, this.outputDir)
            let files = [];
            fs.readdirSync(folderPath).forEach(fileName => {
                if(fileName.includes(this.fileExtension)){
                    files.push(fileName)
                }
            });
            for(let file of files)
                this.processLogFile(folderPath, file)

            return
        } catch (err) {
            console.log(err)
        }
    }

    async processLogFile(folderPath, fileName){
        try{
            const data = fs.readFileSync(path.join(folderPath, fileName), 'utf8');
            const lines = data.split('\n')
            for(let line of lines){
                let cells = line.split(',')
                let cell = cells[0]
                if(cell !== undefined && cell !== 'Ref' && cell !== this.exportHeaders[0]){
                    let id = parseInt(cell)
                    if(id !== NaN && !this.oldIds.includes(id))
                        this.oldIds.push(id)
                }
            }
        } catch (err) {
            console.log(err)
        }
    }

    async logResultsForZone(zone){
        try{
            let data = ""
            data += this.exportHeaders.join() + "\n"
            for(let row of this.articlesData){
                let line = row.join()
                data += line + "\n"
            }

            let date = new Date(),
            year = date.getFullYear(),
            month = '' + (date.getMonth() + 1),
            day = '' + date.getDate()

            if (month.length < 2) 
                month = '0' + month
            if (day.length < 2) 
                day = '0' + day

            let dateStr = [year, month, day].join('-')

            const fileName = zone.name + " " + dateStr + this.fileExtension

            fs.writeFileSync(path.join(__dirname, this.outputDir, fileName), data);
        } catch (err) {
            console.log(err)
        }
    }

    async run(){
        try{
            await this.readLogFiles()
            await this.crawler.openBrowser()
    
            this.detected = false

            for(let zone of this.zones){
                this.finished = false
                await this.processZone(zone)
                if(this.articlesData.length > 0)
                    await this.logResultsForZone(zone)

                this.articlesData = []
            }
            
        } catch (err) {
            console.log(err)
        }
    }

    async processZone(zone){
        try{
            console.log("Processing zone " + zone.name)
            for(let filters of zone.filters){
                let url = [this.baseUrl, this.queryUrl, filters.join(), zone.shape].join("")
                await this.processResultPage(url)             
            }
        } catch (err) {
            console.log(err)
        }
    }
    
    async processResultPage(url){
        try{
            let page = await this.crawler.openTab(url)

            if(this.botDetection(page)){
                this.detected = true
                await this.crawler.closeTab(page)
                return
            }

            await this.closeCookiesOverlay(page)
            let oldArticles = 0
            this.finished = false
            while(!this.finished && !this.detected){    
                const results = await this.crawler.extractAttribute(page, this.articleLinkSelector, 'href') 
                
                for(let result of results){
                    let articleId = parseInt(result.split("/").filter(el => el !== "").pop())
                    if(!this.oldIds.includes(articleId)){
                        let articleLink = this.baseUrl + result
                        await this.processArticlePage(articleLink, articleId)    
                    } else {
                        oldArticles++
                        if(oldArticles > this.maxOldArticles)
                            this.finished = true
                    }
                }

                const next = await this.crawler.checkElementExists(page, this.nextPageSelector)
    
                if(next && !this.finished){
                    let nextUrl = await this.crawler.extractAttribute(page, this.nextPageSelector, 'href')
                    if(nextUrl.length > 0){
                        nextUrl = this.baseUrl + nextUrl[0]
                        await this.crawler.goTo(page, nextUrl)

                        if(this.botDetection(page)){
                            this.detected = true
                            return
                        }
                    } else {
                        this.finished = true
                    }
                } else {
                    this.finished = true
                }
            }
            await this.crawler.closeTab(page)
        } catch (err) {
            console.log(err)
        }    
    }

    async processArticlePage(url, id){
        try{
            console.log("   Processing article " + id)

            const page = await this.crawler.openTab(url)
            
            //todo: bot detection
            if(this.botDetection(page)){
                this.detected = true
                await this.crawler.closeTab(page)
                return
            }

            let name, hood, price, m2, nHab = "?"
            
            let description = await this.crawler.extractText(page, this.articleDescriptionSelector)
            if((description.indexOf("piscina comunitaria") !== -1) ||
                (description.indexOf("zona comunitaria con piscina") !== -1)
            ){

                await this.crawler.closeTab(page)
                return
            }

            name = await this.crawler.extractText(page, this.articleNameSelector)            
            hood = await this.crawler.extractText(page, this.articleHoodSelector)
            price = await this.crawler.extractText(page, this.articlePriceSelector)

            const features = await this.crawler.extractText(page, this.articleFeaturesSelector)

            m2 = features[0]
            nHab = features[1]

            await this.crawler.closeTab(page)

            let articleData = new Array(
                '"' + id + '"',
                '"' + name.trim() + '"',
                '"' + hood.trim() + '"',
                '"' + url.trim() + '"',
                '"' + price.replace(".", "").trim() + "€" + '"',
                '"' + parseInt(m2) + '"',
                '"' + parseInt(nHab) + '"'
            )

            this.articlesData.push(articleData)

        } catch (err) {
            console.log(err)
        }
    }
    
    async closeCookiesOverlay(page){
        try{
            //todo
            await this.crawler.clickElement(page, this.acceptCookiesButtonSelector)

        } catch (err) {
            console.log(err)
        }
    }

    async botDetection(page){
        try{
            let detected = await this.crawler.checkElementExists(page, this.captchaSelector)
            return detected
        } catch (err) {
            console.log(err)
        }
    }
}

module.exports = Idealista