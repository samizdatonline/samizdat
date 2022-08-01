import puppeteer from 'puppeteer';

export default class PuppeteerPage {
  constructor(url) {
    this.url = url;
    this.page = null;
    this.browser = null;
  }
  static async mint(url) {
    let pp = new PuppeteerPage(url);
    pp.browser = await puppeteer.launch();
    pp.page = await pp.browser.newPage();
    await pp.page.setBypassCSP(true)
    await pp.page.goto(url);
    return pp;
  }
  async getPdf(options= {format: 'a4'}) {
    const buffer = await this.page.pdf(options);
    await this.close();
    return buffer();
  }
  async getHtml() {
    return await this.page.content();
  }
  async close() {
    await this.browser.close();
  }
}
