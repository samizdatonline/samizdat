/**
 * Resource for operating the site. Sites, domains and codes should be
 * fetched from samizdat.io rather than hard-coded. Dynamic data
 * should update at regular intervals.
 */
import jwt from 'jsonwebtoken';
import axios from 'axios';
import * as cheerio from 'cheerio';
import Admin from './Admin.mjs';

export default class Resource {
  constructor() {
    this.devMode = (process.env.PROFILE === 'DEV');
    this.userAgent = `samizdat/1.0 (github.com/samizdatonline)${this.devMode ? ';development mode' : ''}`;
  }

  static async mint() {
    let resource = new Resource();
    resource.signers = await Admin.getSigners();
    if (!resource.signers || resource.signers.length === 0) throw new Error('no signers');
    return resource;
  }

  /**
   * Uses a JWT to encode the url into a signed string.
   *
   * @param {string} url
   * @param root
   * @param type
   * @returns {Promise<*>}
   */
  tokenize(url, root, type) {
    if (!url.startsWith('//') && !(/^([+a-zA-Z]+:\/\/)/.test(url))) {
      url = root + url;
    }
    const payload = { url, root };
    if (type) {
      payload.type = type;
    }
    return jwt.sign(payload, this.signers[0], { expiresIn: '10d' });
  }

  /**
   * Given the tokenized data, try parsing it with each signing key
   * in order. The newest signer will likely work most of the
   * time. New signers are added every few days and older keys
   * expired.
   *
   * @param token
   * @returns {{url: string}|*}
   */
  parse(token) {
    for (let signer of this.signers) {
      try {
        return jwt.verify(token, signer);
      } catch (e) {/* continue trying */
      }
    }
    // the link cannot be located, ask the user to reload the page and try again
  }

  /**
   * Pull the given url from the root host and replace all
   * embedded links with a local path including the
   * @param target
   * @param res
   * @returns {Promise<string>}
   */
  async deliverHtml(target, res) {
    let tags = [
      { query: 'a', attrib: 'href', type: 'text/html' },
      { query: 'link', attrib: 'href', type: 'text/plain' },
      { query: 'script', attrib: 'src', type: 'application/javascript' },
      { query: 'img', attrib: 'src' },
      { query: 'source', attrib: 'src' },
      { query: 'source', attrib: 'srcset' },
      { query: 'iframe', attrib: 'src' },
    ];
    let site = await Admin.getSite(target);
    //TODO: we to handle the various cases for site matching to some extent.
    if (site) site = site[0];
    // apply rules
    for (let rule of site ? site.rules || [] : []) {
      if (rule.name === 'SKIPTAG') {
        tags = tags.filter(item => item.query !== rule.value);
      }
    }
    // get a set of random domains
    let domains = await Admin.getDomain(4);
    let domainIdx = 0;
    // get source content and rewrite it
    let response = await axios.get(target.url, { headers: { 'User-Agent': this.userAgent } });
    let $ = cheerio.load(response.data);
    for (let tag of tags) {
      let elements = $(tag.query);
      for (let element of elements) {
        if (element.attribs[tag.attrib]) {
          let domain = domains[domainIdx++];
          if (domainIdx >= domains.length) domainIdx = 0;
          let path = '/go/' + this.tokenize(element.attribs[tag.attrib], target.root, tag.type);
          element.attribs[tag.attrib] = 'http://' + domain + path;
        }
      }
    }
    res.send($.root().html());
  }

  async deliverOther(target, res) {
    const config = {
      'User-Agent': this.userAgent,
      'Origin': target.root,
      'responseType': 'stream',
    };
    if (/^\/\//.test(target.url)) {
      target.url = target.url.replace(/^\/\//, 'http://');
    }
    try {
      const response = await axios.get(target.url, config);
      res.set('Content-Type', response.headers['content-type']);
      response.data.pipe(res);
    } catch (error) {
      res.set('Content-Type', 'text/html');
      res.send(`something went wrong: ${error.message}`);
    }
  }
}
