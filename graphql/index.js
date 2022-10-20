const redis = require('redis');
const client = redis.createClient();
const bluebird = require('bluebird');
const axios = require('axios');

bluebird.promisifyAll(redis.RedisClient.prototype);
bluebird.promisifyAll(redis.Multi.prototype);

const {
  ApolloServer,
  gql
} = require('apollo-server');
const lodash = require('lodash');
const uuid = require('uuid');

//Create the type definitions for the query and our data
const typeDefs = gql`
    type Query{
        unsplashImages(pageNum: Int): [ImagePost]
        binnedImages: [ImagePost]
        userPostedImages: [ImagePost]
    }

    type ImagePost {
        id: ID!
        url: String!
        posterName: String!
        description: String
        userPosted: Boolean!
        binned: Boolean!
    }

    type Mutation {
        uploadImage(
            url: String!,
            description: String,
            posterName: String
        ): ImagePost
        updateImage(
            id: ID!,
            url: String, 
            posterName: String, 
            description: String, 
            userPosted: Boolean, 
            binned: Boolean
        ): ImagePost
        deleteImage(id: ID!): ImagePost
    }
`;

const resolvers = {
  Query: {
    unsplashImages: async (_, args) => {
      const accessKey = 'ZFZvt2GMZRRw3QqpJa2c6BRViPEAQq7upSYJpVL-xUc'
      const url = 'https://api.unsplash.com/photos/?client_id=' + accessKey + '&page=' + args.pageNum;
      let myBins = await client.hgetallAsync('myBins');
      let myBinsToJSON = myBins == null ? [] : Object.values(myBins).map(bin => JSON.parse(bin));
      try {
          const { data } = await axios.get(url);
          let singlePosts = [];
          data.map((post) => {
              let imagePost = {
                id: post.id,
                url: post.urls.regular,
                posterName: post.user.name,
                description: post.description,
                userPosted: false,
                binned: false,
              }
              myBinsToJSON.map((bin) => {
                if(bin.id === imagePost.id){
                  imagePost.binned = true;
                }
              })
              singlePosts.push(imagePost);
          })
          return singlePosts;
      } catch (e) {
          console.log(e);
      }
    },
  
    binnedImages: async () => {
      let myBins = await client.hgetallAsync('myBins');
      let myBinsToJSON = Object.values(myBins).map(bin => JSON.parse(bin));
      return myBinsToJSON;
    },
    userPostedImages: async () => {
      let myPosts = await client.hgetallAsync('myPosts');
      let myPostsToJSON = Object.values(myPosts).map(post => JSON.parse(post));
      return myPostsToJSON;
      },
    },
 

  Mutation: {
    uploadImage: (_, args) => {
      const newImagePost = {
        id: uuid.v4(),
        url: args.url,
        description: args.description,
        posterName: args.posterName,
        binned: false,
        userPosted: true
      };
      client.hsetAsync('myPosts', newImagePost.id, JSON.stringify(newImagePost));
      return newImagePost;
    },

    updateImage: async (_, args) => {
      if(args.binned === true){
        client.hsetAsync('myBins', args.id, JSON.stringify(args));
        doesPostExist = await client.existsAsync('myPosts', args.id);
        if(doesPostExist === 1 && args.userPosted === true){
          const newImagePost = {
            id: args.id,
            url: args.url,
            description: args.description,
            posterName: args.posterName,
            binned: true,
            userPosted: true
          };
          client.hsetAsync('myPosts', args.id, JSON.stringify(newImagePost));
        }
      } else {
        client.hdelAsync('myBins', args.id);
        doesPostExist = await client.existsAsync('myPosts', args.id);
        if(doesPostExist === 1 && args.userPosted === true){
          const newImagePost = {
            id: args.id,
            url: args.url,
            description: args.description,
            posterName: args.posterName,
            binned: false,
            userPosted: true
          };
          client.hsetAsync('myPosts', args.id, JSON.stringify(newImagePost));
        }
      }
      return args;
    },
    deleteImage: async (_, args) => {
      doesPostExist = await client.existsAsync('myPosts', args.id);
      if(doesPostExist === 1){
        await client.hdelAsync('myPosts', args.id);
      }
      doesBinExist = await client.existsAsync('myBins', args.id);
      if(doesPostExist === 1){
        let myBin = await client.hgetAsync('myBins', args.id);
        let myBinToJSON = JSON.parse(myBin);
        myBinToJSON.userPosted = false;
        client.hsetAsync('myBins', args.id, JSON.stringify(myBinToJSON));
      }
    },
  },  
};

const server = new ApolloServer({
  typeDefs,
  resolvers
});

server.listen().then(({
  url
}) => {
  console.log(`🚀  Server ready at ${url} 🚀`);
});
