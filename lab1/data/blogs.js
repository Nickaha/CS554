const mongoCollection = require("../config/mongoCollection");
const blogs = mongoCollection.blogs;
const comm = mongoCollection.comments;
const users = require('./users');
const uuid = require("uuid");
const comments = require("./comments");
let { ObjectId } = require('mongodb');

async function createBlog(title,body, user){
    if(!title) throw "title needs to be provided";
    if(typeof title !=='string' || title.trim().length === 0) throw "title needs to be string";
    if(!body) throw "body needs to be provided";
    if(typeof body !=='string' || title.trim().length === 0) throw "body needs to be valid string";
    const userlist = await users.getAll();
    console.log(user.toString(), typeof user);
    if(!user || typeof user !== 'object') throw "user information needs to provide correctly";
    if(!user._id || !user.username) throw "user id or username is not provided";
    let parseID = ObjectId(user._id);
    if(typeof user.username !== 'string' || user.username.trim().length === 0) throw "username needs to be valid string";
    let comments = [];
    let userexist = false;
    userlist.forEach(element => {
        if(element.username === user.username && element._id === user._id) userexist = true;
    });
    if(!userexist) throw "the username or id doesn't match";
    const blogCollection = await blogs();
    let newBlog = {
        title,
        body,
        userThatPosted:user,
        comments
    }
    const insertInfo = await blogCollection.insertOne(newBlog);
    if (insertInfo.insertedCount === 0) throw "could not add blog";
    const newId = insertInfo.insertedId;
    const bk = await this.getBlogById(newId.toString());
    bk._id = bk._id.toString();
    return bk;

}

async function getAll(n, m){
    if(m>100) throw "only 100 max blogs are allowed to see";
    const blogCollection = await blogs();
    const bloglist = await blogCollection.find({}).skip(n).limit(m).toArray();
    bloglist.forEach(x =>{
        x._id = x._id.toString();
    });
    return bloglist;
}


async function getBlogById(id){
    if(!id) throw `id is not provided`;
    if(typeof id !== 'string') throw `id is not string`;
    if(id.length===0) throw `emptry string of id`;
    let parseID = ObjectId(id);
    const blogCollection = await blogs();
    const thisblog = await blogCollection.findOne({_id:parseID});
    if (thisblog === null) throw 'No blog with that id';
    thisblog._id = thisblog._id.toString();
    return thisblog;
}

async function updateBlog(id, updatedBlog){
    if(!id) throw `no id provided`;
    if(typeof id !== 'string') throw `id is not string`;
    if(id.length === 0) throw `id is empty`;
    let parseID = ObjectId(id);

    if(!updatedBlog || typeof updatedBlog !== 'object') throw "improper update information";
    const blogCollection = await blogs();
    const updatedblogdata = {};
    if(updatedBlog.title){
        if(typeof updatedBlog.title !== 'string' || updatedBlog.title.trim().length === 0) throw 'title needs to be valid string';
        updatedblogdata.title = updatedBlog.title;
    }
    if(updatedBlog.body){
        if(typeof updatedBlog.body !== 'string' || updatedBlog.body.trim().length === 0) throw 'title needs to be valid string';
        updatedblogdata.body = updatedBlog.body;
    }
    if(updatedBlog.comments){
        if(!Array.isArray(updatedBlog.comments)) throw 'comments need to be array';
        updatedBlog.comments.forEach( x=> {
            if(typeof x !== 'object') throw 'the comment is not an object';
        });
        updatedblogdata.comments = updatedBlog.comments;
    }
    await blogCollection.updateOne({_id:parseID},{$set:updatedblogdata});
    let result = await this.getBlogById(id);
    result._id = result._id.toString();
    return result;
}

async function deleteBlog(id){
    if(!id) throw `id is not provided`;
    if(typeof id !== 'string') throw `id is not string`;
    if(id.length===0) throw `emptry string of id`;
    let parseID = ObjectId(id);
    const blogCollection = await blogs();
    const thisblog = await blogCollection.findOne({_id:parseID});
    if(thisblog === null) throw 'No blog with that id';
    thisblog._id = thisblog._id.toString();

    thisblog.comments.forEach(x=>{
        comments.deleteComment(x._id.toString());
    });

    const deleteinfo = await blogCollection.deleteOne({_id:parseID});
    if (deleteinfo.deletedCount === 0) {
        throw `Could not delete blog with id of ${id}`;
    }
    return true;
}


module.exports = {
    createBlog,
    getAll,
    getBlogById,
    deleteBlog,
    updateBlog
}