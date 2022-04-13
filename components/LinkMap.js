class LinkMap {
    constructor() {
        this.domains = require('/config/domains.json');
    }
    assign(path) {

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