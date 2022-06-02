import cors from 'cors';
import express from 'express';
import http from 'http';
import morgan from 'morgan';
import path from 'path';
import Resource from './components/Resource.mjs';
import IdForge from './components/IdForge.mjs';
import adminRouter from './components/adminRouter.mjs';

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

  app.get('/sites', async (_, res) =>
    res.json(resource.sites));

  app.get('/retry', (_, res) =>
    res.send('page link cannot be found. Please reload the page and try again.'));

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
      const token = resource.tokenize(url, root[0], 'text/html');
      const path = `${resource.randomDomain}/go/${token}`;
      const html = `<!DOCTYPE html><html><body><a href='http://${path}'>http://${path}</a></a></body></html>`;
      res.send(html);
    }
  });

  app.get('/id', (req, res) =>
    res.send(IdForge.randomId(req.query.length || 8)));

  app.use('/admin', adminRouter);
  app.use('/', express.static(path.resolve('site')));

  const server = http.createServer(app);
  server.listen(process.env.PORT || 3000);
  server.on('error', console.error);
  server.on('listening', () => console.info(`Listening on port ${server.address().port}`));

  // populate routing data
  await resource.update();
  setInterval(async () => await resource.update(), 10000);
}();

process.on('SIGINT', () => {
  console.info('Shutting down');
  process.exit();
});
