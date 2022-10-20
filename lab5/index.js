const { ApolloServer, gql } = require('apollo-server');
const lodash = require('lodash');
const uuid = require('uuid');
const axios = require('axios');
const redis = require('redis');
const client = redis.createClient();
const bluebird = require('bluebird');
const { forEach } = require('lodash');

bluebird.promisifyAll(redis.RedisClient.prototype);
bluebird.promisifyAll(redis.Multi.prototype);

function isEmpty(obj) {
    return Object.keys(obj).length === 0;
}
const typeDefs = gql`
    type Query {
        unsplashImages(pageNum: Int) : [ImagePost]
        binnedImages : [ImagePost]
        userPostedImages : [ImagePost]
        getTopTenBinnedPosts : [ImagePost]
    }
    type ImagePost {
        id: ID!
        url: String!
        posterName: String!
        description: String
        userPosted: Boolean!
        binned: Boolean!
        numBinned: Int!
    }
    type Mutation {
        uploadImage(url: String!, description: String, posterName: String) : ImagePost
        updateImage(id: ID!, url: String, posterName: String, description: String, userPosted: Boolean, binned: Boolean) : ImagePost
        deleteImage(id: ID!) : ImagePost
      }
`;
let client_id = "PYIAqbCAHJu4erDARP-vcIzPFbURLbad-CFjMRHTR18";
const resolvers = {
    
    Query: {
        unsplashImages: async (_,args) => {
            const url = `https://api.unsplash.com/photos/?page=${args.pageNum}&client_id`;
            const { data } = await axios.get(`${url}=${client_id}`);
            let imagepost = [];
            let imagepostexist = await client.existsAsync("imageposts");
            let imageposts;
            let newpost = []
            if(imagepostexist !== 0){
                imageposts = await client.hvalsAsync("imageposts");
                imageposts.forEach(e=>{
                    newpost.push(JSON.parse(e));
                });
            }
            data.map((image) =>{
                
                let bin = false;
                for (i of newpost){
                    if(image.id === i.id) bin = true;
                }
                let description = "N/A";
                if(image.description !== null){
                    description = image.description;
                } else{
                    description = image.alt_description;
                }
                let newImagePost = {
                    id: image.id,
                    url: image.urls.regular,
                    posterName: image.user.name,
                    description: description,
                    userPosted: false,
                    binned: bin,
                    numBinned: image.likes
                };
                imagepost.push(newImagePost);
            });
            return imagepost;
        },
        binnedImages: async () =>{
            let imagepostexist = await client.existsAsync("imageposts");
            if(imagepostexist === 0) return [];
            let imagepost = await client.hvalsAsync("imageposts");
            let newpost = []
            imagepost.forEach(e=>{
                newpost.push(JSON.parse(e));
            });
            return newpost;
        },
        userPostedImages: async () => {
            let imagepostexist = await client.existsAsync("imageposts");
            let unbinned = await client.existsAsync("unbinned");
            if(imagepostexist === 0 && unbinned === 0) return [];
            let imagepost = await client.hvalsAsync("imageposts");
            let newImagePost = [];
            imagepost.forEach(e=>{
                newImagePost.push(JSON.parse(e));
            });
            let unbinnedimage = await client.hvalsAsync("unbinned");
            let newUnbin = [];
            unbinnedimage.forEach(e=>{
                newUnbin.push(JSON.parse(e));
            });
            let userpost = []
            newImagePost.forEach(element =>{
                if (element.userPosted) userpost.push(element);
            });
            newUnbin.forEach(element =>{
                if (element.userPosted) userpost.push(element);
            })
            return userpost;
        },
        getTopTenBinnedPosts: async () =>{
            let setexists = await client.existsAsync("popular");
            if (setexists === 0) return [];
            let popularitems = await client.zrevrangeAsync('popular',0,9);
            let newPopular = [];
            popularitems.forEach(x=>{
                newPopular.push(JSON.parse(x));
            });
            return newPopular;

        }
    },
    Mutation:{
        uploadImage: async (_,args) =>{
            if(!args.description) args.description="N/A";
            let newImagePost = {
                id:uuid.v4(),
                url:args.url,
                posterName: args.posterName,
                description: args.description,
                userPosted: true,
                binned: false,
                numBinned:0
            };
            await client.hsetAsync("unbinned",newImagePost.id, JSON.stringify(newImagePost));
            return newImagePost;
        },
        updateImage: async (_,args) =>{
            let exists = await client.hexistsAsync("imageposts",args.id);
            let existsunbin = await client.hexistsAsync("unbinned",args.id);
            let fromUnsplash = true;
            let image = {};
            if(existsunbin !== 0){
                let i = await client.hgetAsync("unbinned",args.id);
                image = JSON.parse(i);
                fromUnsplash = false;
            } 
            
            if(exists !== 0){
                let i = await client.hgetAsync("imageposts",args.id);
                image = JSON.parse(i)
                fromUnsplash = false;
            }
            //console.log(image);
            if (isEmpty(image)){
                const url = `https://api.unsplash.com/photos/${args.id}?client_id`;
                const { data } = await axios.get(`${url}=${client_id}`);
                image.id = args.id;
                image.numBinned = data.likes;
            }
            if(args.url){
                image.url = args.url;
            }
            if(args.posterName) image.posterName = args.posterName;
            if(fromUnsplash && args.userPosted !== undefined) image.userPosted = args.userPosted;
            if(args.description) image.description = args.description;
            if(args.binned !== undefined) image.binned = args.binned;
            if(exists === 0 && image.binned === true){
                image.numBinned += 1;
                await client.zaddAsync("popular",image.numBinned,JSON.stringify(image));
            } 
            if(image.binned === false){
                image.binned = true;
                await client.zremAsync("popular",JSON.stringify(image));
                if(image.numBinned>0){    
                    image.numBinned -= 1;
                }
                image.binned = false;
            }
            //console.log(image.binned);

            if (exists !==0 ) await client.hsetAsync("imageposts",args.id,JSON.stringify(image));
            if (existsunbin !==0 ) await client.hsetAsync("unbinned",args.id,JSON.stringify(image));

            if (exists === 0 && image.binned){
                await client.hsetAsync("imageposts",args.id,JSON.stringify(image));
                if(existsunbin!==0){
                    await client.hdelAsync("unbinned",args.id);
                }
            }
            if (image.userPosted === false && !image.binned){
                await client.hdelAsync("imageposts",args.id);
            }
            if(image.userPosted === true && !image.binned){
                await client.hsetAsync("unbinned",args.id,JSON.stringify(image));
                await client.hdelAsync("imageposts",args.id);
            }
            return image;
        },
        deleteImage: async(_,args) =>{
            let post;
            let existinbin = await client.hexistsAsync("imageposts",args.id);
            let existinunbin = await client.hexistsAsync("unbinned", args.id);
            if (existinbin !== 0){
                let p = await client.hgetAsync("imageposts",args.id);
                post = JSON.parse(p);
                await client.zremAsync("popular",p);
                if(post.userPosted){
                    await client.hdelAsync("imageposts",args.id);
                }
            }
            if (existinunbin !== 0){
                let p = await client.hgetAsync("unbinned",args.id);
                post = JSON.parse(p);
                if(post.userPosted){
                    await client.hdelAsync("unbinned",args.id);
                }
            }
            return post;
        }
    }
  };
  
  const server = new ApolloServer({ typeDefs, resolvers });
  
  server.listen().then(({ url }) => {
    console.log(`🚀  Server ready at ${url} 🚀`);
  });
  