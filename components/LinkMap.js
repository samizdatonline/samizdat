/**
 * LimkMap is used to assign identifiers to urls that can be
 * routed by the server rather the browser. This provides a
 * funnel that masks DNS. Wash() will rewrite HTML to use
 * masked links that can be retrieved with go().
 *
 * To allow for random domain selection, link keys are JWT
 * objects that can be decoded with a continuously rotating
 * key (ideally a sequence of keys... a few milliseconds of
 * lost response time is not relevant for the purpose.)
 *
 * This implementation uses memory, that won't hold up at
 * scale, however, we should avoid database configuration
 * to ensure the installation of this server requires
 * minimal effort. One could use a central database, but
 * a distributed model is paramount to operational resilience.
 */
import axios from 'axios'
import * as cheerio from 'cheerio';

class LinkMap {
    constructor() {
        this.domains = require('/config/domains.json');
    }
    async wash(url) {
        let html = await axios.get(url);
        let $ = cheerio.load(html);
        let anchors = $('a');
        console.log(anchors.length);
    }
    /**
     * Request the current list of domains. This should
     * @returns {Promise<void>}
     */
    async updateDomains() {
        // this should fetch the active list from samizdat.io
        this.domains = require('/config/domains.json');
    }
    sync
}
module.exports = LinkMap;