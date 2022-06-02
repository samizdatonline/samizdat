import express from 'express';
import fs from 'fs/promises';
import path from 'path';

/**
 * @async
 * @param {e.Request} req
 * @param {e.Response} res
 * @returns {Promise<void>}
 */
async function handler(req, res) {
  try {
    const { url } = req;
    const fileName = url.replace('/', '');
    const filePath = path.resolve(`data/${fileName}.json`);
    const fileBuffer = await fs.readFile(filePath);
    const fileString = fileBuffer.toString();
    const jsonObject = JSON.parse(fileString);
    let result;
    if (url === '/domains') {
      result = jsonObject[Math.floor(Math.random() * jsonObject.length)];
    } else {
      result = jsonObject;
    }
    res.json(result);
  } catch (error) {
    console.error(`Error invoking ${req.method} on data`, error);
    res.status(500).send(`Error invoking ${req.method} on data: ${error.message}`);
  }
}

const router = express.Router();

router.get('/', async (_, res) => res.send('hello admin'));
router.get(['/domains', '/rules', '/sites'], handler);

export default router;
