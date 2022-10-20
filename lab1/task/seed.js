// const dbConnection = require("../config/mongoConnection");
// const data = require("../data/");
// const users = data.users;
// const blogs = data.blogs;
// const comments = data.comments;

// async function main(){
//     const db = await dbConnection();
//     await db.dropDatabase();
//     const user1 = {
//         name:"Nick Guo",
//         username:"weeboy",
//         password:"nick998090"
//     };
//     const user2 = {
//         name:"ZhengJingFei",
//         username:"Yuan",
//         password:"asdfghjkl"
//     };

//     const u1 = await users.createUser(user1.name,user1.username,user1.password);
//     console.log(u1);
//     const u2 = await users.createUser(user2.name,user2.username,user2.password);
//     const userlist = await users.getAll();
//     console.log(userlist);

//     try{
//         var b1 = await blogs.createBlog("Shangchi","Shangchi is a very good marvel movie!",u1);
//         console.log(b1);
//     } catch(e){
//         console.log(e);
//     }
//     try{
//         const c1 = await comments.createComment(u2,"Yes it is!");
//         console.log(c1);
//         b1.comments.push(c1);
//         const b11 = await blogs.updateBlog(b1._id,{comments:b1.comments});
//     } catch(e){
//         console.log(e);
//     }
//     console.log('Done seeding database');
//   // const li = await books.getAll();
//   // console.log(li);
//   // //const a = await books.removeReview("60583a8880854bfd4839c42e");
//     try{
//         await db.serverConfig.close();
//     }
//     catch(e){
//         console.log(e);
//     }
// }

// main();