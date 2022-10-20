const mongoCollection = require("../config/mongoCollection");
const comments = mongoCollection.comments;
const users = require('./users');
let {ObjectId} = require('mongodb');

async function createComment(user, comment){
    if(!comment) throw "comments not providing";
    if(typeof comment !== 'string' || comment.trim().length === 0) throw "Invalid comment";

    const userlist = await users.getAll();
    if(!user || typeof user !== 'object') throw "user information needs to provide correctly";
    if(!user._id || !user.username) throw "user id or username is not provided";
    let parseID = ObjectId(user._id);
    if(typeof user.username !== 'string' || user.username.trim().length === 0) throw "username needs to be valid string";
    let userexist = false;
    userlist.forEach(element => {
        if(element.username === user.username && element._id === user._id) userexist = true;
    });
    if(!userexist) throw "the username or id doesn't match";
    let newComment = {
        userThatPostedComment:user,
        comment
    }

    const commentCollection = await comments();
    const insertInfo = await commentCollection.insertOne(newComment);

    if (insertInfo.insertedCount === 0) throw 'Could not add comment';

    const newId = insertInfo.insertedId;
    //console.log(newId);
    const cm = await this.getCommentById(newId.toString());
    cm._id = cm._id.toString();
    return cm;
}

async function getAll(){
    const commentCollection = await comments();
    const commentlist = await commentCollection.find({}).toArray();
    commentlist.forEach(x=>{
        x._id = x._id.toString();
    });
    return commentlist;
}

async function getCommentById(id){
    if(!id) throw `id is not provided`;
    if(typeof id !== 'string') throw `id is not string`;
    if(id.length===0) throw `emptry string of id`;
    let parseID = ObjectId(id);
    const commentCollection = await comments();
    const thiscomment = await commentCollection.findOne({_id:parseID});
    if(thiscomment === null) throw "No comment with that id";
    thiscomment._id = thiscomment._id.toString();
    return thiscomment;
}

async function deleteComment(id){
    if(!id) throw `id is not provided`;
    if(typeof id !== 'string') throw `id is not string`;
    if(id.length===0) throw `emptry string of id`;
    let parseID = ObjectId(id);
    const commentCollection = await comments();
    const thiscomment = await commentCollection.findOne({_id:parseID});
    if (thiscomment === null) throw 'No such comment';
    const deleteinfo = commentCollection.deleteOne({_id:parseID});
    if (deleteinfo.deletedCount === 0) {
        throw `Could not delete comment with id of ${id}`;
    }
    return true;
}

module.exports = {
    createComment,
    getAll,
    getCommentById,
    deleteComment
}