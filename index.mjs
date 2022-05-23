import express from 'express';
import http from 'http';
import path from 'path'
import morgan from 'morgan';
import Resource from './components/Resource.mjs';
import IdForge from './components/IdForge.mjs';
import Admin from './components/Admin.mjs';
import cors from 'cors'

let main = async function() {
    let resource = new Resource();
    let app = express();
    // attach logger
    app.use(morgan('dev'));
    // open cors
    app.use(cors({
        origin: function(origin, callback){
            return callback(null, true);
        },
        credentials:true
    }));
    // parse body and query string from request object
    app.use(express.urlencoded({extended: true}));
    app.use(express.json())
    app.get('/health',function(req,res){res.status(200).send()});
    app.get('/sites',async (req,res)=>{
        res.json(resource.sites);
    });
    app.get('/retry',(req,res)=>{
        res.send('page link cannot be found. Please reload the page and try again.')
    })
    app.get('/go/:token',async (req,res)=>{
        try {
            let target = await resource.parse(req.params.token);
            if (target.type==='text/html') await resource.deliverHtml(target,res);
            else await resource.deliverOther(target,res)
        } catch(e) {
            console.log(e);
            res.status(500).send(e.message);
        }
    })
    app.get(/^\/?(mask|share)\/(.*)/,async (req,res)=>{
        let url = req.params[1];
        let root = url.match(/^[^:/?#]+:\/\/[^/?#]*/);
        if (!root || !root[0]) {
            res.send('<!DOCTYPE html><html><body>malformed url. please provide the full protocol, host and path</body></html>');
        } else {
            let token = resource.tokenize(url,root[0],"text/html");
            let path = `${resource.randomDomain}/go/${token}`;
            let html=`<!DOCTYPE html><html><body><a href='http://${path}'>http://${path}</a></a></body></html>`;
            res.send(html);
        }
    })
    app.get('/id',(req,res)=>{
        res.send(IdForge.randomId(req.query.length||8));
    })
    app.use('/admin',(new Admin()).routes());
    app.use('/',express.static(path.resolve('site')));

    let server = http.createServer(app);
    server.listen(process.env.PORT || 3000);
    server.on('error', console.log);
    server.on('listening',()=>console.log("Listening on port "+server.address().port));

    // populate routing data
    await resource.update();
    setInterval(async ()=>{
        await resource.update();
    },10000);
}();

process.on('SIGINT', function() {
    console.log("Shutting down");
    process.exit();
});
