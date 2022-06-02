/**
 * Resource for operating the site. Sites, domains and codes should be
 * fetched from samizdat.io rather than hard-coded. Dynamic data
 * should update at regular intervals.
 */
import jwt from 'jsonwebtoken';
import axios from 'axios';
import * as cheerio from 'cheerio';

export default class Resource {
  constructor() {
    this.devMode = (process.env.PROFILE === 'DEV');
    this.userAgent = `samizdat/1.0 (github.com/mespr/samizdat)${this.devMode ? ';development mode' : ''}`;
    this.domains = [];
    this.sites = [];
    this.rules = [];
    this.signers = [
      'yr6lptp5xp6d3zv8oumcocbj9sq2n4',
      'y04skj28v0v2b5mwtjdzn6bjltcsvj',
      'p6x9056ssk3cq1z2i61n5vnmvccvdx',
    ];
  }

  /**
   * From the server get the latest list of sites, domains and signers.
   * This should be configured to self execute on some interval.
   *
   * @returns {Promise<void>}
   */
  async update() {
    try {
      // update sites and domains from server
      const root = process.env.MASTER || 'http://localhost:' + (process.env.PORT || 3000);
      if (this.devMode) {
        this.domains = [
          '9vcboht8.link:3000',
          'dfungwjv.link:3000',
          'q3qgoe2h.link:3000',
        ];
      } else {
        this.domains = (await axios.get(`${root}/admin/domains`)).data;
      }

      this.rules = (await axios.get(`${root}/admin/rules`)).data;

      const sites = (await axios.get(`${root}/admin/sites`)).data;
      this.sites = sites.map((site) => {
        site.id = this.tokenize(site.url, site.root, 'text/html');
        site.server = `http://${this.randomDomain}`;
        return site;
      });
    } catch (error) {
      console.error(`update is failing: ${error.message}`);
    }
  }

  /**
   * Choose a random site. This is prepended to the links so routing
   * may pass through different servers on each click
   * @returns {string}
   */
  get randomDomain() {
    let index = Math.floor(Math.random() * this.domains.length);
    return this.domains[index];
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
        return jwt.verify(token, signer);
      } catch (e) {/* continue trying */
      }
    }
    // the link cannot be located, ask the user to reload the page and try again
    return { url: '/retry' }; // not implemented
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
    // rules can be used to modify the parsing for specific domains
    let rules = this.rules.html.reduce((r, item) => {
      if (new RegExp(item.match).test(target.url)) r.push(item.rule);
      return r;
    }, []);
    // apply rules
    for (let rule of rules) {
      if (rule.name === 'SKIPTAG') {
        tags = tags.filter(item => item.query !== rule.value);
      }
    }
    // get source content and rewrite it
    let response = await axios.get(target.url, { headers: { 'User-Agent': this.userAgent } });
    let $ = cheerio.load(response.data);
    for (let tag of tags) {
      let elements = $(tag.query);
      for (let element of elements) {
        if (element.attribs[tag.attrib]) {
          let path = '/go/' + this.tokenize(element.attribs[tag.attrib], target.root, tag.type);
          element.attribs[tag.attrib] = 'http://' + this.randomDomain + path;
        }
      }
    }
    res.send($.root().html());
  }

  async deliverOther(target, res) {
    const config = {
      'User-Agent': this.userAgent,
      'responseType': 'stream',
    };
    const response = await axios.get(target.url, config);
    res.set('Content-Type', response.headers['content-type']);
    try {
      response.data.pipe(res);
    } catch (error) {
      res.set('Content-Type', 'text/html');
      res.send(`something went wrong: ${error.message}`);
    }
  }
}
