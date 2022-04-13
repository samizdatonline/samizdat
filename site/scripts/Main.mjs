/**
 * MAIN is the root module that populates the home and manages basic navigation.
 * The site is a very simple single page site.
 */
import Fetch from '/scripts/Fetch.mjs'
export default class {
    async render() {
        let sites = await Fetch.get('/sites');
        for (let site of sites) {
            let sitelink = document.createElement('a');
            sitelink.classList.add('site-link')
            sitelink.innerHTML = site.name
            document.body.append(sitelink);
        }
    }
}