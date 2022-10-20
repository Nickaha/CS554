const express = require('express');
const router = express.Router();
const data = require('../data');
const userData = data.users;
const blogData = data.blogs;
const commentData = data.comments;
const xss = require('xss');
const { blogs, comments } = require('../data');
const bcrypt = require('bcryptjs');

router.get('/', async (req,res)=>{
    try{
        let n = 0;
        let m = 20;
        if(req.query.skip){
            n = parseInt(req.query.skip);
        }
        if(req.query.take){
            m = parseInt(req.query.take);
            console.log(m);
        }
        const blogs = await blogData.getAll(n,m);
        return res.json(blogs);
    } catch(e){
        console.log(e);
        return res.status(500).json({error:"failed loading blogs"});
    }
});
router.get('/logout', async(req,res)=>{
    req.session.destroy();
    return res.json({message:"You are logged out"});
});
router.get('/:id', async (req,res)=>{
    try{
        const blog = await blogData.getBlogById(xss(req.params.id));
        return res.json(blog);
    } catch(e){
        console.log(e);
        return res.status(500).json({error:'Blog not found'});
    }
});

router.post('/', async(req,res,next) =>{
    if(!req.session.user){
        res.status(404).json({error:'User needs to log in to post'});
        return;
    }
    next();
})

router.post('/', async(req,res) =>{
    
    let postblog = req.body;
    let error = "";
    if(!postblog.title || typeof postblog.title!=='string' || postblog.title.trim().length === 0) error += "title/";
    if(!postblog.body || typeof postblog.body !== 'string' || postblog.body.trim().length === 0) error += "body not valid";
    if(error.length>0) return res.status(401).json({error:error});
    try{
        console.log(req.session.user, typeof req.session.user);
        const newblog = await blogData.createBlog(xss(postblog.title),xss(postblog.body),req.session.user);
        return res.json(newblog);
    } catch(e){
        console.log(e);
        return res.status(500).json({error:"Failed to post blog"});
    }
});

router.put('/:id',async(req,res,next)=>{
    if(!req.session.user){
        return res.status(404).json({error:'User needs to log in to post'});
    } 
    next();
}); 
router.put('/:id',async(req,res,next)=>{
    try{const bloginfo = await blogData.getBlogById(xss(req.params.id.toString()));
        if(bloginfo.userThatPosted._id!==req.session.user._id.toString() || bloginfo.userThatPosted.username!==req.session.user.username) return res.status(401).json({error:"Must be the same user to update the blog"});
    } catch(e){
        console.log(e);
        return res.status(500).json({error:e});
    }
    next();
}); 
router.put('/:id',async(req,res)=>{
        let postblog = req.body;
        let error = "";
        if(!postblog.title || typeof postblog.title!=='string' || postblog.title.trim().length === 0) error += "title/";
        if(!postblog.body || typeof postblog.body !== 'string' || postblog.body.trim().length === 0) error += "body not valid";
        if(error.length>0) return res.status(401).json({error:error});
        try{
            let updateinfo = {title:postblog.title, body:postblog.body};
            const updateblog = await blogData.updateBlog(xss(req.params.id),updateinfo);
            return res.status(200).json(updateblog);
        } catch(e){
            console.log(e);
            return res.status(500).json({error:"failed to update"});
        }
});
router.patch('/:id',async(req,res,next)=>{
    if(!req.session.user){
        return res.status(404).json({error:'User needs to log in to post'});
    } 
    next();
}); 
router.patch('/:id',async(req,res,next)=>{
    try{
        const bloginfo = await blogData.getBlogById(xss(req.params.id));
        if(bloginfo.userThatPosted._id!==req.session.user._id.toString() || bloginfo.userThatPosted.username!==req.session.user.username) return res.status(401).json({error:"Must be the same user to update the blog"});
    } catch(e){
        console.log(e);
        return res.status(500).json({error:e});
    }
    next();
}); 
router.patch('/:id', async (req,res) =>{
    let postblog = req.body;
    let error = "";
    if(postblog.title) {
        if(typeof postblog.title!=='string' || postblog.title.trim().length === 0) error += "title not valid ";
    }
    if(postblog.body){ 
        if (typeof postblog.body !== 'string' || postblog.body.trim().length === 0) error += "body not valid";
    }
    if(error.length>0) return res.status(401).json({error:error});
    try{
        let updateinfo = {};
        if(postblog.title) updateinfo.title = postblog.title;
        if(postblog.body) updateinfo.body = postblog.body;
        const updateblog = await blogData.updateBlog(xss(req.params.id),updateinfo);
        return res.status(200).json(updateblog);
    } catch(e){
        console.log(e);
        return res.status(500).json({error:"failed to update"});
    }
});

router.post('/:id/comment', async (req,res,next)=>{
    if(!req.session.user){
        return res.status(401).json({message: "Unauthorized."});
    }
    next();
});
router.post('/:id/comment', async (req,res)=>{
    let comment = req.body.comment;
    if(!comment || typeof comment !== 'string' || comment.trim().length === 0) return res.status(401).json({error: "Not valid comment"});
    try{
        const bloginfo = await blogData.getBlogById(xss(req.params.id));
        const newcomment = await commentData.createComment(req.session.user,xss(comment));
        bloginfo.comments.push(newcomment);
        const updateblog = await blogData.updateBlog(xss(req.params.id),{comments:bloginfo.comments});
        return res.json(updateblog);
    } catch(e){
        console.log(e);
        return res.status(500).json({error:"failed to comment"});
    }
});

router.delete('/:blogId/:commentId', async (req,res,next) =>{
    if(!req.session.user){
        return res.status(401).json({message: "Unauthorized."});
    }
    next();
});
router.delete('/:blogId/:commentId', async (req,res,next) =>{
    try{
        const commentinfo = await commentData.getCommentById(xss(req.params.commentId));
        if(commentinfo.userThatPostedComment.username !== req.session.user.username || commentinfo.userThatPostedComment._id.toString()!==req.session.user._id.toString()) return res.status(401).json({error:"Unauthorized"});
    }catch(e){
        console.log(e);
        return res.status(500).json({error:e});
    }
    next();
});
router.delete('/:blogId/:commentId', async (req,res) =>{
    let bloginfo = await blogData.getBlogById(xss(req.params.blogId));
    let nocomment = true;
    let index = 0;
    let removeindex;
    console.log(bloginfo.comments);
    bloginfo.comments.forEach(x => {
        if(x._id.toString()===req.params.commentId.toString()){
            nocomment = false;
            removeindex = index;
        }
        index +=1;
    });
    if(nocomment) return res.status(401).json({error:"No comment with that id in this blog"});
    try{
        await commentData.deleteComment(xss(req.params.commentId));
        bloginfo.comments.splice(removeindex,1);
        let updatenew = {comments: bloginfo.comments};
        const updateblog = await blogData.updateBlog(xss(req.params.blogId),updatenew);
        return res.json(updateblog);
    } catch(e){
        console.log(e);
        return res.status(500).json({error:"failed to delete comment"});
    }
});

router.post('/signup', async(req,res)=>{
    
    const userinfo = req.body;
    let error = "";
    if(!userinfo.name || typeof userinfo.name!=='string'|| userinfo.name.trim().length===0) error+="name";
    if(!userinfo.username || typeof userinfo.username !== "string" || userinfo.username.trim().length === 0) error += " username";
    if(!userinfo.password || typeof userinfo.password !== "string" || userinfo.password.trim().length === 0) error += " password";
    if(error.length > 0) return res.status(401).json({error:`${error} invalid`});
    try{
        const newuser = await userData.createUser(xss(userinfo.name), xss(userinfo.username), xss(userinfo.password));
        return res.json(newuser);
    } catch(e){
        console.log(e);
        return res.status(500).json({error:"failed to create user"});
    }
});

router.post('/login', async(req,res) =>{
    let logindata = req.body;
    let errors = [];
    if(!logindata.username) errors.push('Username needs to provide');
    if(!logindata.password) errors.push('password needs to provide');
    let validuser = false;
    let user = {};
    const userlist = await userData.getAll();
    //console.log(userlist);
    for (x of userlist){
        //console.log(x.password);
        const hashpw = await bcrypt.compare(logindata.password, x.password);
        //console.log(hashpw);
        if(hashpw && x.username===logindata.username){
            validuser= true;
            //Whole user is stored in session currently - Should we remove hashed passwords from the cookie?
            user = x;
        }
    }
    if(!validuser){
        errors.push('Username or password not correct');
    }
    if(errors.length>0){
        res.status(401).json({error:errors});
        return;
    }
    try{
        req.session.user = {username:user.username,_id:user._id};
        //console.log(req.session);
        return res.json(req.session.user);
    } catch(e){
        console.log(e);
        return res.status(500).json({error:e});
    }
});


module.exports = router;