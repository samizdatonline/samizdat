# samizdat

## Systems Config

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