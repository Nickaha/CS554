const express = require('express');
const router = express.Router();
const axios = require('axios');
const redis = require('redis');
const flat = require('flat');
const unflat = flat.unflat;
const client = redis.createClient();
const bluebird = require('bluebird');

bluebird.promisifyAll(redis.RedisClient.prototype);
bluebird.promisifyAll(redis.Multi.prototype);

router.get('/',async (req,res)=>{
    let setexists = await client.existsAsync('searchset');
    if (setexists === 0){
        let errors = "No item has been searched yet";
        res.status(400).render('shows/errors', {
            errors: errors,
            hasErrors: true,
            title:"Errors"
        });
        return;
    } else{
        let popularitems = await client.zrevrangeAsync('searchset',0,10);
        console.log(popularitems);
        try{
            res.render('shows/popular',{title:"Popular items", shows:popularitems});
        } catch(e){
            console.log(e);
            res.status(500).json({ error: e });
        }
    }
});

module.exports = router;