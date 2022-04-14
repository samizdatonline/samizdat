import express from 'express';
import http from 'http';
import path from 'path'
import morgan from 'morgan';
import Resource from './components/Resource.mjs';
import IdForge from './components/IdForge.mjs';

let main = async function() {
    let resource = await Resource.mint();
    let app = express();
    // attach logger
    app.use(morgan('dev'));
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
            if (target.type==='text/html') {
                let html = await resource.deliverHtml(target);
                res.send(html);
            } else {
                let data = await resource.deliverOther(target)
                res.send(data);
            }
        } catch(e) {
            console.log(e);
            res.status(500).send(e.message);
        }
    })
    app.get('/id',(req,res)=>{
        res.send(IdForge.randomId(req.query.length||8));
    })
    app.use('/',express.static(path.resolve('site')));

    let server = http.createServer(app);
    server.listen(process.env.PORT || 3000);
    server.on('error', console.log);
    server.on('listening',()=>console.log("Listening on port "+server.address().port));
}();

process.on('SIGINT', function() {
    console.log("Shutting down");
    process.exit();
});
