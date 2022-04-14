/**
 * Resource for operating the site. Sites, domains and codes should be
 * fetched from samizdat.io rather than hard-coded. Dynamic data
 * should update at regular intervals.
 */
import jwt from 'jsonwebtoken';
import axios from "axios";
import * as cheerio from "cheerio";

export default class Resource {
    static async domains() {
        return [
            "abc123.com","def456.com","ghi789.net"
        ]
    }
    static async sites() {
        let sites = [
            {"name": "New York Times","url": "https://www.nytimes.com"},
            {"name": "The Guardian","url": "https://www.theguardian.com"},
            {"name": "Associated Press - World News","url": "https://apnews.com/hub/world-news"},
            {"name": "Al Jazeera","url": "https://www.aljazeera.com/"},
            {"name": "Hong Kong Free Press","url": "https://hongkongfp.com/"}
        ];
        for (let site of sites) {
            site.id = await Resource.tokenize(site.url);
        }
        return sites;
    }
    static async tokenize(url) {
        let signers = await Resource.signers();
        return jwt.sign({url:url}, signers[0], {expiresIn: '10d'});
    }
    static async parse(token) {
        let signers = await Resource.signers();
        for (let signer of signers) {
            try {
                return jwt.verify(token,signer);
            } catch(e) {/* continue trying */}
        }
        // the link cannot be located, ask the user to reload the page and try again
        return {url:"/retry"};
    }
    static async deliver(url) {
        let html = await axios.get(url);
        let $ = cheerio.load(html.data);
        let anchors = $('a');
        return html.data;
    }
    static async signers() {
        return ["lj2l3k4jldksf","jfdkjf8888d","3k3kjs8dk3"];
    }
}