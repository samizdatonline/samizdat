// const {discoverPostSource,getPostList} = require('post-feed-reader'); // feed reader

class NewsModule {
    constructor(source) {
        this.source = source;
        this.idForge = require('./idforge');
    }
    routes() {
        let router = require('express').Router();
        router.get('/sites',async (req,res)=>{
            res.json(this.source.sites);
        });
        return router;
    }
}
module.exports = NewsModule;