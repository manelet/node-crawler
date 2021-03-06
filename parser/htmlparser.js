const jsdom = require("jsdom")
const {JSDOM} = jsdom;

class DOMElement {
    element

    constructor(element){
        this.element = element
    }

    getAttribute(attribute){
        return this.element.getAttribute(attribute)
    }

    getText(){
        return this.element.innerText
    }

    getChildren(selector){
        const $ = (require('jquery'))(this.element);
        let elements = $(selector)
        let result = []
            for(let element of elements){
                let e = new DOMElement(element)
                result.push(e)
            }
        return result
    }

    data(key){
        return this.element.dataset[key]
    }

}

class HTMLParser {
    html
    dom

    constructor(html) {
        this.html = html
        this.dom = new JSDOM(this.html)
    }

    async getElements(selector){
        try{
            const $ = (require('jquery'))(this.dom.window);
            let elements = $(selector)
            let result = []
            for(let element of elements){
                let e = new DOMElement(element)
                result.push(e)
            }
            return result
        } catch (err) {
            console.error(err)
        }
    }

}


module.exports = HTMLParser