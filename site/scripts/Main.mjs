/**
 * MAIN is the root module that populates the home and manages basic navigation.
 * The site is a very simple single page site.
 */
import Fetch from '/scripts/Fetch.mjs';

export default class {
  async render() {
    // add links to global news sites that will be washed of domain recognition
    const sites = await Fetch.get('/sites');
    this.sitesDiv = document.createElement('div');
    let tray = document.createElement('div');
    tray.classList.add('link-tray');
    for (const site of sites) {
      const link = document.createElement('a');
      link.classList.add('site-link');
      const { server, id, name } = site;
      link.href = `${server}/go/${id}`;
      link.innerHTML = name;
      tray.append(link);
    }
    this.sitesDiv.append(tray);
    let bodyContainer = document.querySelector('#body-container');
    bodyContainer.append(this.sitesDiv);

    // add a twitter-like element. ...hmmm
    this.messageDiv = document.createElement('div');
    document.body.append(this.messageDiv);
  }
}
