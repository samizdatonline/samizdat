import cors from 'cors';
import express from 'express';
import http from 'http';
import morgan from 'morgan';
import Resource from './components/Resource.mjs';
import Admin from './components/Admin.mjs';

const main = async function() {
  const resource = new Resource();
  const app = express();

  // attach logger
  app.use(morgan('dev'));

  // open cors
  const corsConfig = {
    origin: (_, callback) => callback(null, true),
    credentials: true,
  };
  app.use(cors(corsConfig));

  // parse body and query string from request object
  const urlEncodedConfig = { extended: true };
  app.use(express.urlencoded(urlEncodedConfig));

  app.use(express.json());

  app.get('/health', (_, res) =>
    res.status(200).send());

  app.get('/favicon.ico',express.static('/site/assets/favicon-32x32.png'));

  app.get('/go/:token', async (req, res) => {
    try {
      const target = await resource.parse(req.params.token);
      if (target.type === 'text/html') {
        await resource.deliverHtml(target, res);
      } else {
        await resource.deliverOther(target, res);
      }
    } catch (error) {
      console.error(error);
      res.status(500).send(error.message);
    }
  });

  app.get(/^\/?(mask|share)\/(.*)/, async (req, res) => {
    const url = req.params[1];
    const root = url.match(/^[^:/?#]+:\/\/[^/?#]*/);
    if (!root || !root[0]) {
      res.send('<!DOCTYPE html><html><body>malformed url. please provide the full protocol, host and path</body></html>');
    } else {
      let domain = await Admin.getDomain();
      const token = resource.tokenize(url, root[0], 'text/html');
      const path = `${domain}/go/${token}`;
      const html = `<!DOCTYPE html><html><body><a href='http://${path}'>http://${path}</a></a></body></html>`;
      res.send(html);
    }
  });

  app.get('/',(req,res) => {
    res.redirect('https://samizdat.online');
  })

  const server = http.createServer(app);
  server.listen(process.env.PORT || 3000);
  server.on('error', console.error);
  server.on('listening', () => console.info(`Listening on port ${server.address().port}`));
}();

process.on('SIGINT', () => {
  console.info('Shutting down');
  process.exit();
});
