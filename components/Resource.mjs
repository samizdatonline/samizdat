/**
 * Resource for operating the site. Sites, domains and codes should be
 * fetched from samizdat.io rather than hard-coded. Dynamic data
 * should update at regular intervals.
 */
import jwt from 'jsonwebtoken';
import axios from "axios";
import * as cheerio from "cheerio";

export default class Resource {
    constructor() {
        this.domains = [
            "od3pz6rg.link",
            "jxvj963s.link",
            "6tmk927m.link"
        ];
        if (process.env.PROFILE === "DEV") {
            this.domains = this.domains.map(d=>d+":"+(process.env.PORT||"3000"));
        }
        this.sites = [
            {"name": "New York Times","url": "https://www.nytimes.com","root": "https://www.nytimes.com"},
            {"name": "The Guardian","url": "https://www.theguardian.com","root": "https://www.theguardian.com"},
            {"name": "Associated Press - World News","url": "https://apnews.com/hub/world-news","root": "https://apnews.com"},
            {"name": "Al Jazeera","url": "https://www.aljazeera.com/","root": "https://www.aljazeera.com"},
            {"name": "NY Times (Chinese)","url": "https://cn.nytimes.com","root": "https://cn.nytimes.com"},
            {"name": "Hong Kong Free Press","url": "https://hongkongfp.com/","root": "https://hongkongfp.com"}
        ];
        this.signers = [
            "yr6lptp5xp6d3zv8oumcocbj9sq2n4",
            "y04skj28v0v2b5mwtjdzn6bjltcsvj",
            "p6x9056ssk3cq1z2i61n5vnmvccvdx"
        ];
    }

    /**
     * Mint is an asynchronous "new". It creates and instance an populates
     * the configuration data from the server
     * @returns {Promise<Resource>}
     */
    static async mint() {
        let resource = new Resource();
        await resource.update();
        return resource;
    }

    /**
     * From the server get the latest list of sites, domains and signers.
     * This should be configured to self execute on some interval.
     *
     * @returns {Promise<void>}
     */
    async update() {
        // update sites and domains from server at some interval
        // then tokenize the sites
        for (let site of this.sites) {
            site.id = this.tokenize(site.url,site.root,"text/html");
            site.server = "http://"+this.randomDomain
        }
    }

    /**
     * Choose a random site. This is prepended to the links so routing
     * may pass through different servers on each click
     * @returns {string}
     */
    get randomDomain() {
        let index = Math.floor(Math.random()*this.domains.length);
        return this.domains[index];
    }

    /**
     * Uses a JWT to encode the url into a signed string.
     *
     * @param url
     * @param root
     * @returns {Promise<*>}
     */
    tokenize(url,root,type) {
        if (!url.startsWith('//') && !(/^([+a-zA-Z]+:\/\/)/.test(url))) {
            url = root + url;
        }
        let payload = {url:url,root:root}
        if (type) payload.type = type;
        return jwt.sign(payload, this.signers[0], {expiresIn: '10d'});
    }

    /**
     * Given the tokenized data, try parsing it each signing key
     * in order. Newest signer and will likely work most of the
     * time. New signers are added every few days and older keys
     * expired.
     *
     * @param token
     * @returns {{url: string}|*}
     */
    parse(token) {
        for (let signer of this.signers) {
            try {
                return jwt.verify(token,signer);
            } catch(e) {/* continue trying */}
        }
        // the link cannot be located, ask the user to reload the page and try again
        return {url:"/retry"}; // not implemented
    }

    /**
     * Pull the given url from the root host and replace all
     * embedded links with a local path including the
     * @param url
     * @param root
     * @returns {Promise<string>}
     */
    async deliverHtml(target,res) {
        let response = await axios.get(target.url);
        let $ = cheerio.load(response.data);
        for (let tag of [
            {query:"a",attrib:"href",type:"text/html"},
            {query:"link",attrib:"href",type:"text/plain"},
            {query:"img",attrib:"src"}
        ]) {
            let elements = $(tag.query)
            for (let element of elements) {
                if (element.attribs[tag.attrib]) {
                    let path = '/go/' + this.tokenize(element.attribs[tag.attrib],target.root,tag.type);
                    element.attribs[tag.attrib] = 'http://' + this.randomDomain + path;
                }
            }
        }
        res.send($.root().html());
    }
    async deliverOther(target,res) {
        let response = await axios.get(target.url);
        res.set("Content-Type",response.headers['content-type']);
        res.send(response.data);
    }
}