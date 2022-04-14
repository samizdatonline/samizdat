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
        let tray = document.createElement('div');
        tray.classList.add('link-tray');
        for (let site of sites) {
            let sitelink = document.createElement('a');
            sitelink.classList.add('site-link')
            sitelink.href = site.server+'/go/'+site.id;
            sitelink.innerHTML = site.name
            tray.append(sitelink);
        }
        this.sitesDiv.append(tray);
        document.body.append(this.sitesDiv);

        // add a twitter-like element. ...hmmm
        this.messageDiv = document.createElement('div');
        this.messageDiv.innerHTML = "<h1>Messages</h1>";
        document.body.append(this.messageDiv);
    }
}