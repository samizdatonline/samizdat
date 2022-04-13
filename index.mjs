import express from 'express';
import http from 'http';
import path from 'path'
import morgan from 'morgan';
import Resource from './components/Resource.mjs'

let main = async function() {
    const app = express();
    // attach logger
    app.use(morgan('dev'));
    // parse body and query string from request object
    app.use(express.urlencoded({extended: true}));
    app.use(express.json())
    app.get('/health',function(req,res){res.status(200).send()});
    app.get('/sites',async (req,res)=>{
        res.json(await Resource.sites());
    });
    app.use('/',express.static(path.resolve('site')));

    const server = http.createServer(app);
    server.listen(process.env.PORT || 3000);
    server.on('error', console.log);
    server.on('listening',()=>console.log("Listening on port "+server.address().port));
}();

process.on('SIGINT', function() {
    console.log("Shutting down");
    process.exit();
});
