const express = require('express');
const bodyParser = require('body-parser');
const http = require('http');
let path = require('path');
const app = express();

let main = async function() {
    // attach logger
    app.use(require('morgan')('dev'));
    // parse body and query string from request object
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({extended: false}));
    app.use(require('cookie-parser')());
    // connect images and styles
    app.use('/css',express.static(path.join(__dirname, 'public/css')));
    app.use('/img',express.static(path.join(__dirname, 'public/img')));
    app.use('/fonts',express.static(path.join(__dirname, 'public/fonts')));
    app.use('/js',express.static(path.join(__dirname, 'public/js'),{headers:{"Content-Type":"application/javascript"}}));
    // respond to a health check
    app.get('/health',function(req,res){res.status(200).send()});
    // route content
    let source = require('./config/source.json');
    let newsModule = new (require('./components/news'))(source);
    app.use('/news',newsModule.routes());
    app.get('/sites',async (req,res)=>{
        res.json(this.source.sites);
    });
    app.get('/',home);

    const server = http.createServer(app);
    server.listen(process.env.PORT || 3000);
    server.on('error', console.log);
    server.on('listening',()=>console.log("Listening on port "+server.address().port));
}();

function home(req,res) {
    res.sendFile(path.join(__dirname, 'index.html'));
}

process.on('SIGINT', function() {
    console.log("Shutting down");
    process.exit();
});
