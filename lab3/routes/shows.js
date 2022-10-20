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
//https://www.tutorialspoint.com/how-to-remove-html-tags-from-a-string-in-javascript to get rid of the html tags from the string
function removeTags(str) {
    if ((str===null) || (str==='')){
        return false;
    }
    else{
        str = str.toString();
        return str.replace( /(<([^>]+)>)/ig, '');
    }
 }
router.get('/:id', async (req,res)=>{
    let checkExists = await client.existsAsync(req.params.id);
    if (checkExists === 1){
        let pageFromRedis = await client.getAsync(req.params.id);
        res.send(pageFromRedis);
    } else{
        try{
            const {data}= await axios.get('http://api.tvmaze.com/shows/'+req.params.id);
            //console.log(data);
            // if(data.status=='404'){
            //     errors=`ID not found`;
            // }
            //console.log(errors);
            // if (errors.length > 0) {
            //     res.status(404).render('shows/errors', {
            //         errors: errors,
            //         hasErrors: true,
            //     });
            //     return;
            // }
            const result = data;
            let summary = removeTags(result.summary);
            res.render('shows/single',{showInfo:result, title:result.name,summary:summary}, async function (err, html){
                await client.setAsync(req.params.id,html);
                res.send(html);
            });
        }catch(e){
            let errors = 'ID not found';
            res.status(404).render('shows/errors', {
                errors: errors,
                hasErrors: true,
                title:"Errors"
            });
        }
}});

module.exports = router;