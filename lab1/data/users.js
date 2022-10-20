const mongoCollection = require("../config/mongoCollection");
const users = mongoCollection.users;
const bcrypt = require("bcryptjs");
const uuid = require("uuid");
let { ObjectId } = require("mongodb");

async function createUser(name, username, password){
    if(!name) throw "first name needs to provide";
    if(!username) throw "username needs to provide";
    if(!password) throw `password needs to provide`;

    if(typeof name !== 'string' || name.trim().length===0) throw `first name should be string and not all spaces`;
    if(typeof username !== 'string' || username.trim().length===0) throw `user name should be string and not all spaces`;
    if(typeof password !== 'string' || password.trim().length===0) throw `password should be string and not all spaces`;

    const userlists = await this.getAll();
    userlists.forEach(x => {
        if(username === x.username) throw `username has already been used`;
    });

    const userCollection = await users();
    const hashpw = await bcrypt.hash(password,16);
    let newUser = {
        name: name,
        username:username,
        password: hashpw
    };
    const insertInfo = await userCollection.insertOne(newUser);
    if (insertInfo.insertedCount === 0) throw 'Could not add user';

    const newId = insertInfo.insertedId;
    ////console.log(newId);
    const nu = await this.getUserById(newId.toString());
    nu._id = nu._id.toString();
    return nu;
}

async function getAll(){
    const userCollection = await users();
    const userlist = await userCollection.find({}).toArray();
    userlist.forEach(element => {
        element._id = element._id.toString();
    });
    return userlist;
}

async function getUserById(id){
    if(!id) throw `id is not provided`;
    if(typeof id !== 'string') throw `id is not string`;
    if(id.trim().length===0) throw `emptry string of id`;
    const userCollection = await users();
    let parseID = ObjectId(id);
    const user = await userCollection.findOne({_id:parseID},{projection:{_id:1,username:1}});
    if(!user) throw `user not found`;
    return user;
}

async function removeUser(id){
    if(!id) throw `id is not provided`;
    if(typeof id !== 'string') throw `id is not string`;
    if(id.trim().length===0) throw `emptry string of id`;
    let parseID = ObjectId(id);
    const userCollection = await users();
    const user = userCollection.findOne({_id:parseID});
    if (user === null) throw 'no user with that id';
    const deleteinfo = await userCollection.deleteOne({_id:PARSEid});
    if(deleteinfo.deletedCount===0) throw "could not delete the user";
    return true;
}

async function updateUser(id, updateInfo){
    if(!id) throw `id is not provided`;
    if(typeof id !== 'string') throw `id is not string`;
    if(id.trim().length===0) throw `emptry string of id`;

    if(!updateInfo || typeof updateInfo !== 'object') throw 'update information needs to be object with content inside';
    const userCollection = await users();
    let userUpdate = {};
    if(updateInfo.firstname){
        if(typeof updateInfo.firstname !== 'string' || updateInfo.firstname.trim().length===0) throw `first name should be string and not all spaces`;
        userUpdate.firstname = updateInfo.firstname;
    }
    if(updateInfo.lastname){
        if(typeof updateInfo.lastname !== 'string' || updateInfo.lastname.trim().length===0) throw `last name should be string and not all spaces`;
        userUpdate.lastname = updateInfo.lastname;
    }
    if(updateInfo.username){
        if(typeof updateInfo.username !== 'string' || updateInfo.username.trim().length===0) throw `username should be string and not all spaces`;
        userUpdate.username = updateInfo.username;
    }
    if(updateInfo.password){
        if(typeof updateInfo.password !== 'string' || updateInfo.password.trim().length===0) throw `password should be string and not all spaces`;
        userUpdate.password = await bcrypt.hash(updateInfo.password,16);
    }

    await userCollection.updateOne({_id:id},{$set: userUpdate});
    let result = await this.getUserById(id);
    return result;
}

module.exports = {
    createUser,
    getUserById,
    getAll,
    removeUser,
    updateUser
}