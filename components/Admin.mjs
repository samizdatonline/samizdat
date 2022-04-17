import express from 'express';
import fs from 'fs';
import path from 'path';

export default class Admin {
    constructor() {
    }
    routes() {
        let router = express.Router();
        router.get("/domains",async(req,res)=>{
            try {
                let result = fs.readFileSync(path.resolve('data/domains.json')).toString();
                res.json(JSON.parse(result));
            } catch(e) {
                console.error(`Error invoking ${req.method} on data`,e);
                res.status(500).send(`Error invoking ${req.method} on data: ${e.message}`);
            }
        });
        router.get("/sites",async(req,res)=>{
            try {
                let result = fs.readFileSync(path.resolve('data/sites.json')).toString();
                res.json(JSON.parse(result));
            } catch(e) {
                console.error(`Error invoking ${req.method} on data`,e);
                res.status(500).send(`Error invoking ${req.method} on data: ${e.message}`);
            }
        });
        router.get('/',async(req,res)=>{
            res.send("hello admin");
        })
        return router;
    }
}