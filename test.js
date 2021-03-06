const puppeteer = require('puppeteer');
const routeToList = "#toc > ul"

;(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  await page.goto('https://es.wikipedia.org/wiki/Badalona', {
    waitUntil: 'networkidle2',
  });

  const values = await page.evaluate((routeToList) => {
    const values = []
    const list = document.querySelector(routeToList)
    const els = list.getElementsByTagName('li')

    for (var i = 0; i < els.length; ++i) {
      values.push(els[i].innerText)
    }

    return values
  }, routeToList);

  console.log(values);

  await browser.close();
})();
