# samizdat

This project is intended to break through the DNS barriers commonly used
to censure information in countries that prefer propaganda over true reporting.
It provides a relay to respected global news outlets, masking the dns and ip
behind a large randomized pool of addresses.

It is not perfect. It could also be construed as illegal content scraping or
ad blocking. We hope to ensure that the original site is delivered as close
to the original, and will only render content in locations where that content
is unreachable.

## System Architecture
The project is built on ESM node/express. It uses a relatively minimal set of 
npm plugins and no cookies.

It works by rewriting html links with JWT encoded strings containing the original
resource locators. The server decodes the request, fetches the original content
and then pushes it back to the browser after again rewriting all the links.

### Code Structure
* */components* - server functionality. Resource.mjs hosts the bulk of the site rendering
* */config* - systemd and nginx config files
* */site* - public files served from /. This includes index.html, css, etc.
* *index.mjs* - the server root 

The resource module hard codes data on domains and sites. This should instead
be provided by the root server where tools for administering the network should
be hosted.

> NOTE: The only environment variables are PROFILE and PORT. If PROFILE is set to DEV,
> it causes the site urls to include the port. In /etc/hosts you can then point the
> site urls to localhost to run in a dev environment.

### Considerations

While this project is all about masking DNS from censors,
it should not mask its purpose to the open internet. For example, it should
present a clear user-agent to the sites that routed. This will help us
gain the cooperation of news outlets that might otherwise view it as theft.

## Systems Config
The server listens on port 3000, http requests for all incoming domains are
routed to localhost:3000.

This is the pertinent config history for setting up a vanilla ubuntu AWS instance

```shell
    6  sudo apt update
    7  sudo apt upgrade
    8  curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash -
    9  sudo apt-get install -y nodejs
   10  cd /opt
   12  sudo chown ubuntu:ubuntu .
   14  cd ~/.ssh
   15  ssh-keygen -t ed25519 -C "ubuntu@samizdat"
   16  more id_ed25519.pub 
   17  cd /opt
   18  git clone git@github.com:mespr/samizdat.git
   19  cd samizdat/
   20  npm i
   21  sudo apt install nginx
   22  cd /etc/nginx/sites-enabled/
   25  sudo rm default
   27  sudo ln -s /opt/samizdat/config/samizdat.conf samizdat.conf
   29  cd /etc/systemd/system/
   30  sudo ln -s /opt/samizdat/config/samizdat.service samizdat.service
   31  sudo systemctl start nginx
   32  sudo systemctl status nginx
   33  sudo systemctl enable nginx
   34  sudo systemctl start samizdat
   35  sudo systemctl status samizdat
```