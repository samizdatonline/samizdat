# Samizdat

This project is intended to break through the DNS barriers commonly used
to censor information in countries that prefer propaganda over true reporting.
It provides a relay to respected global news outlets, masking the dns and ip
behind a large randomized pool of addresses.

It is not perfect. It could also be construed as illegal content scraping or
ad blocking. We hope to ensure that any site is delivered as close
to the original as possible (without cookies), and will only render content
in locations where that content is unreachable.

This is a not-for-profit effort, licensed to the public with no expectations
or restrictions. Just hope.

Please see https://github.com/mespr/samizdat/issues.

## How to Participate
If you are a developer, please help embellish and troubleshoot. If you are a
publisher, please contact us. If you are a lawyer, help us navigate the guardrails
of internation IP law. If you simply care, register random domains (get name
ideas from http://raul.help/id or http://raul.help/id?length=20). If you have
some idle computer power, install the app and let us know its IP address.

If you happen to be part of the W3C, please make this project unnecessary.
DNS should not be abused for political gain. The open Internet is focused on
ensuring the integrity and validation of domain names, so we can trust the
source, whatever the source is; but that mechanism is being used to hide the
Internet and hide free press. The world wants both integrity and access.


## Usage

Try http://raul.help. Russia, Are You Listening. Try http://rhonda.help/mask/https://www.theguardian.com.

The domains change. That is the point. The more domains assigned to the project
the stronger the project becomes. Try also http://help.me.rhonda.help/ or http://6tmk927m.link/
When html is requested, every link, anchor, img and script is swapped with a masked url.

Please run a server and register more domains. /data/domains.json identifies
all the domains available to use. This is served from /components/Admin.js
which is indended to manage this list.

>NOTE: the mask feature may need to be suppressed or require authentication to avoid
> abuse of this system.

## System Architecture
The project is built on ESM node/express. It uses a relatively minimal set of 
npm plugins and no cookies.

It works by rewriting html links with JWT encoded strings containing the original
resource locators. The server decodes the request, fetches the original content
and then pushes it back to the browser after again rewriting all the links.

### Code Structure
* */components* - server functionality. Resource.mjs hosts the bulk of the site rendering
* */config* - systemd and nginx config files
* */data* - JSON data
* */site* - public files served from /. This includes index.html, css, etc.
* *index.mjs* - the server root 

The Admin module serves up the configuration data in /data. It is meant
to be enabled as a root server that others can regularly pull from. This
should probably be moved to a separate package as it grows.

#### Environment Variables
All optional

| Name    | Default                 | Description                                                    |
|---------|-------------------------|----------------------------------------------------------------|
| MASTER  | http://localhost:{PORT} | Path to the administration server                              |
| PORT    | 3000                    | Port to listen on                                              |
| PROFILE |                         | If set to DEV, instructs the system to run in development mode |

#### Development Mode
In development mode, the active domains are hardcoded rather fetched from the
admin server. These names can be routed to localhost in `/etc/hosts`
```shell
127.0.0.1       9vcboht8.link
127.0.0.1       dfungwjv.link
127.0.0.1       q3qgoe2h.link
```
>NOTE: the dev domain names are hardcoded to use port 3000 currently.
### Considerations

While this project is all about masking DNS from censors,
it should not mask its purpose to the open internet. The user-agent
header is marked with the application name and the address of this
repository. Ideally, this should include a signature granted
by the organization so honest participating servers can be 
distinguished from servers that may have a different reason to
mask dns. This will help us gain the cooperation of news outlets 
that might otherwise view it as theft.

It could even be used to pay back news outlets with donations as ads
delivered to samizdat servers will be useless.

The service must also try to route to the original site if the site
is in fact available to the requester. This needs to be suppressed
when in development mode, but an indicator as such is added to the
user-agent as well.

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
