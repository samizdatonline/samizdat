/**
 * MAIN is the root module that populates the home and manages basic navigation.
 * The site is a very simple single page site.
 */
import Fetch from '/scripts/Fetch.mjs'
export default class {
    async render() {
        // add links to global news sites that will be washed of domain recognition
        let sites = await Fetch.get('/sites');
        this.sitesDiv = document.createElement('div');
        this.sitesDiv.innerHTML = "<h1>World News</h1>";
        for (let site of sites) {
            let sitelink = document.createElement('a');
            sitelink.classList.add('site-link')
            sitelink.href = '/go/'+site.id;
            sitelink.innerHTML = site.name
            this.sitesDiv.append(sitelink);
        }
        document.body.append(this.sitesDiv);

        // add a twitter-like element. ...hmmm
        this.messageDiv = document.createElement('div');
        this.messageDiv.innerHTML = "<h1>Messages</h1>";
        document.body.append(this.messageDiv);
    }
}