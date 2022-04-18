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

## Usage

Try http://raul.help. Russia, Are You Listening. Try http://rhonda.help/mask/https://nytimes.com.

The domains change. That is the point. The more domains assigned to the project
the stronger the project becomes. Try also http://help.me.rhonda.help/ or http://6tmk927m.link/

Please run a server and register more domains. The code in /components/Resource.mjs
identifies all available domains. This should be updated to retrieve sites and
ip assignments by a shared and unaffiliated server, but right now it's in the code.

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
```json
[
"9vcboht8.link:3000",
"dfungwjv.link:3000",
"q3qgoe2h.link:3000"
]
```

### Considerations

While this project is all about masking DNS from censors,
it should not mask its purpose to the open internet. For example, it should
present a clear user-agent to the sites that are routed. This will help us
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
