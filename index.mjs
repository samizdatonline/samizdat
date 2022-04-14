import express from 'express';
import http from 'http';
import path from 'path'
import morgan from 'morgan';
import Resource from './components/Resource.mjs'

let main = async function() {
    let app = express();
    // attach logger
    app.use(morgan('dev'));
    // parse body and query string from request object
    app.use(express.urlencoded({extended: true}));
    app.use(express.json())
    app.get('/health',function(req,res){res.status(200).send()});
    app.get('/sites',async (req,res)=>{
        let sites = await Resource.sites()
        res.json(sites);
    });
    app.get('/retry',(req,res)=>{
        res.send('page link cannot be found. Please reload the page and try again.')
    })
    app.get('/go/:token',async (req,res)=>{
        let target = await Resource.parse(req.params.token);
        let html = await Resource.deliver(target.url);
        res.send(html);
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
