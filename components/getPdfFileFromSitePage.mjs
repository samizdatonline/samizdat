import puppeteer from "puppeteer";

/**
 * @param {string} url
 * @param {puppeteer.PDFOptions} options
 * @returns {Promise<Buffer>}
 */
export default async function getPdfFileFromSitePage(url, options = {format: 'a4'}) {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(url);
    const buffer = await page.pdf(options);
    await browser.close();
    return buffer;
}
